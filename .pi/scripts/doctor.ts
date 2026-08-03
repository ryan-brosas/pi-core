import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

export type DoctorStatus = "pass" | "warn" | "fail";

export interface DoctorCheck {
  id: string;
  status: DoctorStatus;
  message: string;
}

const REQUIRED_PATHS = [
  "AGENTS.md",
  "README.md",
  ".github/workflows/test.yml",
  ".pi/fabric.json",
  ".pi/hindsight.json",
] as const;

const REQUIRED_PACKAGES = [
  { name: "ultra-fabric", minimumVersion: "0.31.1-ultra.1" },
  { name: "@luxusai/pi-hindsight", minimumVersion: "0.11.0" },
] as const;

const FORBIDDEN_POLICY_TEXT = [
  ["implicit-npx-fallow", "npx fallow --format json --quiet"],
  ["missing-structural-check", ".pi/extensions/structural-check.sh"],
  ["committed-only-ship-diff", "git diff --name-only $BASE_SHA...HEAD"],
] as const;

function command(command: string, args: string[], cwd: string) {
  return spawnSync(command, args, { cwd, encoding: "utf8" });
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function expandedConfigPath(root: string, value: string): string {
  if (value === "~") return homedir();
  if (value.startsWith("~/")) return resolve(homedir(), value.slice(2));
  return isAbsolute(value) ? value : resolve(root, value);
}

function fabricMcpConfigPath(path: string): string | undefined {
  if (!existsSync(path)) return undefined;
  const config = readJson(path);
  const mcp = record(config) && record(config.mcp) ? config.mcp : undefined;
  return typeof mcp?.configPath === "string" && mcp.configPath.trim()
    ? mcp.configPath.trim()
    : undefined;
}

export function effectiveMcpConfigPath(
  root = process.cwd(),
  agentDir = process.env.PI_CODING_AGENT_DIR || resolve(homedir(), ".pi/agent"),
): string | undefined {
  const absoluteRoot = resolve(root);
  const projectOverride = fabricMcpConfigPath(resolve(absoluteRoot, ".pi/fabric.json"));
  if (projectOverride) return expandedConfigPath(absoluteRoot, projectOverride);
  const globalOverride = fabricMcpConfigPath(resolve(agentDir, "fabric.json"));
  if (globalOverride) return expandedConfigPath(absoluteRoot, globalOverride);

  const xdg = process.env.XDG_CONFIG_HOME && isAbsolute(process.env.XDG_CONFIG_HOME)
    ? process.env.XDG_CONFIG_HOME
    : resolve(homedir(), ".config");
  return [
    resolve(absoluteRoot, "config/mcporter.json"),
    resolve(absoluteRoot, "config/mcporter.jsonc"),
    resolve(xdg, "mcporter/mcporter.json"),
    resolve(xdg, "mcporter/mcporter.jsonc"),
    resolve(homedir(), ".mcporter/mcporter.json"),
    resolve(homedir(), ".mcporter/mcporter.jsonc"),
  ].find(existsSync);
}

type VersionIdentifier = number | string;
type ParsedVersion = { core: [number, number, number]; prerelease?: VersionIdentifier[] };

function parsedVersion(value: string): ParsedVersion | undefined {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(value.trim());
  return match ? {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    ...(match[4] ? {
      prerelease: match[4].split(".").map((identifier) =>
        /^\d+$/.test(identifier) ? Number(identifier) : identifier
      ),
    } : {}),
  } : undefined;
}

export function versionAtLeast(actual: string, minimum: string): boolean {
  const left = parsedVersion(actual);
  const right = parsedVersion(minimum);
  if (!left || !right) return false;
  for (let index = 0; index < left.core.length; index += 1) {
    if (left.core[index] !== right.core[index]) return left.core[index] > right.core[index];
  }
  if (right.prerelease === undefined) return left.prerelease === undefined;
  if (left.prerelease === undefined) return true;
  const identifiers = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < identifiers; index += 1) {
    const leftIdentifier = left.prerelease[index];
    const rightIdentifier = right.prerelease[index];
    if (leftIdentifier === undefined) return false;
    if (rightIdentifier === undefined) return true;
    if (leftIdentifier === rightIdentifier) continue;
    if (typeof leftIdentifier === "number" && typeof rightIdentifier === "number") {
      return leftIdentifier > rightIdentifier;
    }
    if (typeof leftIdentifier === "number") return false;
    if (typeof rightIdentifier === "number") return true;
    return leftIdentifier > rightIdentifier;
  }
  return true;
}

export function listedPackagePath(output: string, packageName: string): string | undefined {
  const lines = output.split("\n");
  const prefix = `npm:${packageName}`;
  const index = lines.findIndex((line) => {
    const value = line.trim();
    return value === prefix || value.startsWith(`${prefix}@`);
  });
  const candidate = index === -1 ? undefined : lines[index + 1]?.trim();
  const portableAbsolute = candidate !== undefined && (
    isAbsolute(candidate)
    || /^[A-Za-z]:[\\/]/.test(candidate)
    || /^\\\\[^\\]+\\[^\\]+/.test(candidate)
  );
  return portableAbsolute ? candidate : undefined;
}

function policyText(root: string): string {
  const paths = [
    ".pi/prompts/fix.md",
    ".pi/prompts/gc.md",
  ];
  return paths
    .filter((path) => existsSync(resolve(root, path)))
    .map((path) => readFileSync(resolve(root, path), "utf8"))
    .join("\n");
}

export function inspectRepository(root = process.cwd()): DoctorCheck[] {
  const checks: DoctorCheck[] = [];
  const absoluteRoot = resolve(root);

  const missing = REQUIRED_PATHS.filter((path) => !existsSync(resolve(absoluteRoot, path)));
  checks.push({
    id: "required-paths",
    status: missing.length === 0 ? "pass" : "fail",
    message: missing.length === 0 ? "required project files exist" : `missing: ${missing.join(", ")}`,
  });

  const retiredActivePointer = resolve(absoluteRoot, ".pi/artifacts/.active");
  checks.push({
    id: "retired-active-pointer",
    status: existsSync(retiredActivePointer) ? "fail" : "pass",
    message: existsSync(retiredActivePointer)
      ? "retired ambient artifact-selection pointer exists"
      : "legacy ambient artifact-selection pointer is absent",
  });

  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
  checks.push({
    id: "node-version",
    status: nodeMajor >= 24 ? "pass" : "fail",
    message: `Node ${process.versions.node}; version 24 or newer is required`,
  });

  try {
    const fabric = readJson(resolve(absoluteRoot, ".pi/fabric.json"));
    const agents = record(fabric) && record(fabric.agents) ? fabric.agents : undefined;
    const mesh = record(fabric) && record(fabric.mesh) ? fabric.mesh : undefined;
    const issues = [
      !record(fabric) || fabric.configVersion !== 1 ? "configVersion must be 1" : undefined,
      !record(fabric) || fabric.fullCodeMode !== true ? "fullCodeMode must be true" : undefined,
      agents?.enabled !== true ? "agents.enabled must be true" : undefined,
      mesh?.enabled !== true ? "mesh.enabled must be true" : undefined,
    ].filter((value): value is string => value !== undefined);
    checks.push({
      id: "fabric-configuration",
      status: issues.length === 0 ? "pass" : "fail",
      message: issues.length === 0 ? "Fabric full code mode, agents, and mesh are enabled" : issues.join("; "),
    });
  } catch (error) {
    checks.push({ id: "fabric-configuration", status: "fail", message: `invalid .pi/fabric.json: ${String(error)}` });
  }

  try {
    const hindsight = readJson(resolve(absoluteRoot, ".pi/hindsight.json"));
    const scope = record(hindsight) && record(hindsight.scope) ? hindsight.scope : undefined;
    const banks = record(hindsight) && record(hindsight.banks) ? hindsight.banks : undefined;
    const projectBank = record(banks?.project) ? banks.project : undefined;
    const recall = record(hindsight) && record(hindsight.recall) ? hindsight.recall : undefined;
    const retain = record(hindsight) && record(hindsight.retain) ? hindsight.retain : undefined;
    const issues = [
      !record(hindsight) || hindsight.setupComplete !== true ? "setupComplete must be true" : undefined,
      scope?.mode !== "domain-tagged" ? "scope.mode must be domain-tagged" : undefined,
      projectBank?.enabled !== true || typeof projectBank.bankId !== "string"
        ? "a project bankId must be enabled"
        : undefined,
      recall?.enabled !== true ? "recall.enabled must be true" : undefined,
      retain?.enabled !== true ? "retain.enabled must be true" : undefined,
    ].filter((value): value is string => value !== undefined);
    checks.push({
      id: "hindsight-configuration",
      status: issues.length === 0 ? "pass" : "fail",
      message: issues.length === 0
        ? `Hindsight project memory is configured for ${String(projectBank?.bankId)}`
        : issues.join("; "),
    });
  } catch (error) {
    checks.push({ id: "hindsight-configuration", status: "fail", message: `invalid .pi/hindsight.json: ${String(error)}` });
  }

  const piVersion = command("pi", ["--version"], absoluteRoot);
  if (piVersion.status === 0) {
    const actual = piVersion.stdout.trim();
    checks.push({
      id: "pi-version",
      status: versionAtLeast(actual, "0.82.1") ? "pass" : "fail",
      message: `Pi ${actual}; version 0.82.1 or newer is required`,
    });
  } else {
    checks.push({ id: "pi-version", status: "warn", message: "Pi is unavailable; CLI version was not checked" });
  }

  const policies = policyText(absoluteRoot);
  for (const [id, text] of FORBIDDEN_POLICY_TEXT) {
    checks.push({
      id,
      status: policies.includes(text) ? "fail" : "pass",
      message: policies.includes(text) ? `obsolete policy text remains: ${text}` : `obsolete policy text absent: ${text}`,
    });
  }

  const tracked = command(
    "git",
    ["ls-files", "--", ".pi/fabric/mesh", ".pi/state"],
    absoluteRoot,
  );
  if (tracked.status === 0) {
    const paths = tracked.stdout.split("\n").filter(Boolean);
    checks.push({
      id: "tracked-runtime-state",
      status: paths.length === 0 ? "pass" : "warn",
      message: paths.length === 0
        ? "runtime state is untracked"
        : `${paths.length} runtime paths are still tracked; path-scoped approval is required to untrack them`,
    });
  } else {
    checks.push({ id: "tracked-runtime-state", status: "warn", message: "could not inspect tracked runtime state" });
  }

  const pi = command("pi", ["list"], absoluteRoot);
  if (pi.status === 0) {
    const installed: string[] = [];
    const problems: string[] = [];
    for (const expected of REQUIRED_PACKAGES) {
      const packagePath = listedPackagePath(pi.stdout, expected.name);
      if (!packagePath) {
        problems.push(`${expected.name}>=${expected.minimumVersion} is not installed`);
        continue;
      }
      try {
        const manifest = readJson(resolve(packagePath, "package.json"));
        const actualName = record(manifest) ? manifest.name : undefined;
        const actualVersion = record(manifest) ? manifest.version : undefined;
        if (actualName !== expected.name || typeof actualVersion !== "string" ||
          !versionAtLeast(actualVersion, expected.minimumVersion)) {
          problems.push(`${expected.name}: expected >=${expected.minimumVersion}, found ${String(actualVersion)}`);
        } else {
          installed.push(`${expected.name}@${actualVersion}`);
        }
      } catch (error) {
        problems.push(`${expected.name}: unreadable package metadata (${String(error)})`);
      }
    }
    checks.push({
      id: "pi-packages",
      status: problems.length === 0 ? "pass" : "warn",
      message: [...installed, ...problems].join("; "),
    });
  } else {
    checks.push({ id: "pi-packages", status: "warn", message: "Pi is unavailable; package installation was not checked" });
  }

  try {
    const mcpPath = effectiveMcpConfigPath(absoluteRoot);
    if (mcpPath === undefined) {
      checks.push({
        id: "mcp-configuration",
        status: "warn",
        message: "no effective first-class Fabric MCP configuration was found",
      });
    } else if (!existsSync(mcpPath)) {
      checks.push({
        id: "mcp-configuration",
        status: "fail",
        message: `configured Fabric MCP path does not exist: ${mcpPath}`,
      });
    } else {
      const config = readJson(mcpPath);
      const servers = record(config) && record(config.mcpServers) ? config.mcpServers : undefined;
      if (!servers) {
        checks.push({
          id: "mcp-configuration",
          status: "fail",
          message: `Fabric MCP configuration has no mcpServers object: ${mcpPath}`,
        });
      } else {
        const names = new Set(Object.keys(servers));
        const requiredGroups = [
          ["codegraphcontext"],
          ["context7"],
          ["exa"],
          ["deepwiki"],
        ];
        const missing = requiredGroups.filter((group) => !group.some((name) => names.has(name)))
          .map((group) => group.join("|"));
        checks.push({
          id: "mcp-configuration",
          status: missing.length === 0 ? "pass" : "warn",
          message: missing.length === 0
            ? `first-class Fabric MCP configuration parses: ${mcpPath}`
            : `missing Fabric MCP servers (${missing.join(", ")}): ${mcpPath}`,
        });
      }
    }
  } catch (error) {
    checks.push({ id: "mcp-configuration", status: "fail", message: `invalid Fabric MCP configuration: ${String(error)}` });
  }

  return checks;
}

function main(args: string[]): number {
  const allowed = new Set(["--json", "--strict"]);
  const unknown = args.filter((arg) => !allowed.has(arg));
  if (unknown.length > 0) {
    process.stderr.write(`unknown argument${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}\nusage: doctor [--json] [--strict]\n`);
    return 2;
  }
  const json = args.includes("--json");
  const strict = args.includes("--strict");
  const checks = inspectRepository();

  if (json) {
    process.stdout.write(`${JSON.stringify({ checks }, null, 2)}\n`);
  } else {
    for (const check of checks) {
      process.stdout.write(`${check.status.toUpperCase().padEnd(4)} ${check.id}: ${check.message}\n`);
    }
  }

  return checks.some((check) => check.status === "fail" || (strict && check.status === "warn")) ? 1 : 0;
}

const isCli = process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isCli) process.exitCode = main(process.argv.slice(2));
