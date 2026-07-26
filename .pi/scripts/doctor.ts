import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { scanCorpus } from "./corpus.ts";

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
  ".pi/prompts/create.md",
  ".pi/prompts/plan.md",
  ".pi/prompts/ship.md",
  ".pi/prompts/verify.md",
  ".pi/scripts/task-graph.ts",
  ".pi/scripts/corpus.ts",
  ".pi/corpus",
] as const;

const REQUIRED_PACKAGES = [
  { name: "pi-fabric", version: "0.28.1" },
  { name: "pi-mcp-adapter", version: "2.15.0" },
  { name: "@luxusai/pi-hindsight", version: "0.11.0" },
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

type ParsedVersion = { core: [number, number, number]; prerelease?: string };

function parsedVersion(value: string): ParsedVersion | undefined {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(value.trim());
  return match ? {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    ...(match[4] ? { prerelease: match[4] } : {}),
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
  return left.prerelease === right.prerelease;
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
    ".pi/prompts/ship.md",
    ".pi/workflows/garbage-collection.md",
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
      : "graph-backed commands require explicit slugs; no ambient pointer exists",
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
      !Number.isInteger(agents?.maxConcurrent) || Number(agents?.maxConcurrent) < 1 || Number(agents?.maxConcurrent) > 3
        ? "agents.maxConcurrent must be an integer from 1 through 3"
        : undefined,
      mesh?.enabled !== true ? "mesh.enabled must be true" : undefined,
    ].filter((value): value is string => value !== undefined);
    checks.push({
      id: "fabric-configuration",
      status: issues.length === 0 ? "pass" : "fail",
      message: issues.length === 0 ? "Fabric full-code, mesh, and bounded-agent settings are valid" : issues.join("; "),
    });
  } catch (error) {
    checks.push({ id: "fabric-configuration", status: "fail", message: `invalid .pi/fabric.json: ${String(error)}` });
  }

  try {
    const corpus = scanCorpus(resolve(absoluteRoot, ".pi/corpus"));
    const unvalidated = corpus.entries.filter((entry) => !entry.validated?.trim()).map((entry) => entry.slug);
    const unpinned = corpus.entries.filter((entry) => !/@\s+[0-9a-f]{40}\b/i.test(entry.origin)).map((entry) => entry.slug);
    const details = [
      ...corpus.issues.map((item) => `${item.path}: ${item.code}`),
      ...unvalidated.map((slug) => `${slug}: missing validated evidence`),
      ...unpinned.map((slug) => `${slug}: origin lacks a full commit SHA`),
    ];
    checks.push({
      id: "repository-corpus",
      status: details.length === 0 ? "pass" : "fail",
      message: details.length === 0
        ? `${corpus.entries.length} checked-in corpus entries are valid and provenance-pinned`
        : details.join("; "),
    });
  } catch (error) {
    checks.push({ id: "repository-corpus", status: "fail", message: `could not validate .pi/corpus: ${String(error)}` });
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
        problems.push(`${expected.name}@${expected.version} is not installed`);
        continue;
      }
      try {
        const manifest = readJson(resolve(packagePath, "package.json"));
        const actualName = record(manifest) ? manifest.name : undefined;
        const actualVersion = record(manifest) ? manifest.version : undefined;
        if (actualName !== expected.name || actualVersion !== expected.version) {
          problems.push(`${expected.name}: expected ${expected.version}, found ${String(actualVersion)}`);
        } else {
          installed.push(`${expected.name}@${expected.version}`);
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

  const hasProjectPackages = existsSync(resolve(absoluteRoot, ".pi/settings.json"));
  checks.push({
    id: "project-package-pins",
    status: hasProjectPackages ? "pass" : "warn",
    message: hasProjectPackages
      ? "project package settings exist"
      : "no .pi/settings.json; clean clones do not install the expected Pi packages",
  });

  const mcpPath = [".mcp.json", ".pi/mcp.json"].map((path) => resolve(absoluteRoot, path)).find(existsSync);
  if (mcpPath === undefined) {
    checks.push({
      id: "mcp-configuration",
      status: "warn",
      message: "no active project MCP configuration; .mcp.example.json is documentation only",
    });
  } else {
    try {
      const config = readJson(mcpPath);
      checks.push({
        id: "mcp-configuration",
        status: record(config) ? "pass" : "fail",
        message: record(config) ? `project MCP configuration parses: ${mcpPath}` : `project MCP configuration must be an object: ${mcpPath}`,
      });
    } catch (error) {
      checks.push({ id: "mcp-configuration", status: "fail", message: `invalid project MCP configuration: ${String(error)}` });
    }
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
