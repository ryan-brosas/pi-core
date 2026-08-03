import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { inspectRepository, listedPackagePath, versionAtLeast } from "../scripts/doctor.ts";

const root = process.cwd();

test("doctor parses cross-platform package paths and semantic version precedence", () => {
  const windowsList = "User packages:\n  npm:ultra-fabric@0.31.1-ultra.1\n    C:\\Users\\dev\\.pi\\npm\\ultra-fabric\n";
  assert.equal(listedPackagePath(windowsList, "ultra-fabric"), "C:\\Users\\dev\\.pi\\npm\\ultra-fabric");
  assert.equal(versionAtLeast("0.82.1", "0.82.1"), true);
  assert.equal(versionAtLeast("0.82.2-beta.1", "0.82.1"), true);
  assert.equal(versionAtLeast("0.82.1-beta.1", "0.82.1"), false);
  assert.equal(versionAtLeast("0.31.1-ultra.1", "0.31.1-ultra.1"), true);
  assert.equal(versionAtLeast("0.31.1-ultra.2", "0.31.1-ultra.1"), true);
  assert.equal(versionAtLeast("0.31.1-ultra.0", "0.31.1-ultra.1"), false);
  assert.equal(versionAtLeast("0.31.1", "0.31.1-ultra.1"), true);
});

test("doctor reports no failing repository contract checks", () => {
  const checks = inspectRepository(root);
  assert.ok(checks.length > 0);
  assert.equal(new Set(checks.map((check) => check.id)).size, checks.length, "check IDs must be unique");
  assert.deepEqual(
    checks.filter((check) => check.status === "fail"),
    [],
  );
});

test("doctor CLI emits structured JSON", () => {
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", ".pi/scripts/doctor.ts", "--json"],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout) as {
    checks: Array<{ id: string; status: string; message: string }>;
  };
  assert.ok(output.checks.some((check) => check.id === "required-paths" && check.status === "pass"));
  const piVersion = output.checks.find((check) => check.id === "pi-version");
  assert.ok(piVersion);
  assert.match(piVersion.status, /^(?:pass|warn)$/);
  if (piVersion.status === "warn") assert.match(piVersion.message, /unavailable/i);
  const piPackages = output.checks.find((check) => check.id === "pi-packages");
  assert.ok(piPackages);
  assert.match(piPackages.status, /^(?:pass|warn)$/);
  if (piPackages.status === "pass") {
    assert.match(piPackages.message, /ultra-fabric@0\.31\.1-ultra\.1/);
    assert.match(piPackages.message, /@luxusai\/pi-hindsight@0\.11\.0/);
    assert.doesNotMatch(piPackages.message, /pi-mcp-adapter/);
  } else assert.ok(piPackages.message.length > 0);
  assert.ok(output.checks.some((check) => check.id === "fabric-configuration" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "retired-active-pointer" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "hindsight-configuration" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "mcp-configuration" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "tracked-runtime-state"));
});

test("doctor strict mode fails when bootstrap warnings remain", () => {
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", ".pi/scripts/doctor.ts", "--strict", "--json"],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 1, result.stderr + result.stdout);
  const output = JSON.parse(result.stdout) as { checks: Array<{ status: string }> };
  assert.ok(output.checks.some((check) => check.status === "warn"));
});

test("doctor resolves first-class Fabric MCP config precedence", async () => {
  const module = await import("../scripts/doctor.ts") as Record<string, unknown>;
  const effectiveMcpConfigPath = module.effectiveMcpConfigPath as ((root: string, agentDir: string) => string | undefined) | undefined;
  assert.equal(typeof effectiveMcpConfigPath, "function");
  const sandbox = mkdtempSync(path.join(tmpdir(), "pi-doctor-mcp-"));
  const project = path.join(sandbox, "project");
  const agent = path.join(sandbox, "agent");
  mkdirSync(path.join(project, ".pi"), { recursive: true });
  mkdirSync(agent, { recursive: true });
  const globalMcp = path.join(sandbox, "global-mcp.json");
  const projectMcp = path.join(project, "project-mcp.json");
  writeFileSync(globalMcp, "{}\n");
  writeFileSync(projectMcp, "{}\n");
  writeFileSync(path.join(agent, "fabric.json"), JSON.stringify({ mcp: { configPath: globalMcp } }));
  assert.equal(effectiveMcpConfigPath?.(project, agent), globalMcp);
  writeFileSync(path.join(project, ".pi/fabric.json"), JSON.stringify({ mcp: { configPath: "project-mcp.json" } }));
  assert.equal(effectiveMcpConfigPath?.(project, agent), projectMcp);
});

test("doctor rejects unknown flags instead of silently weakening strict mode", () => {
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", ".pi/scripts/doctor.ts", "--strcit"],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stderr, /unknown argument.*--strcit/i);
});

test("doctor accepts Fabric full code mode", () => {
  const fabric = JSON.parse(readFileSync(".pi/fabric.json", "utf8")) as { fullCodeMode?: boolean };
  assert.equal(fabric.fullCodeMode, true);
  const check = inspectRepository(root).find((entry) => entry.id === "fabric-configuration");
  assert.equal(check?.status, "pass");
  assert.match(check?.message ?? "", /full code mode/i);
});
