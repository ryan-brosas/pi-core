import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { inspectRepository, listedPackagePath, versionAtLeast } from "../scripts/doctor.ts";

const root = process.cwd();

test("doctor parses cross-platform package paths and stable version precedence", () => {
  const windowsList = "User packages:\n  npm:pi-fabric\n    C:\\Users\\dev\\.pi\\npm\\pi-fabric\n";
  assert.equal(listedPackagePath(windowsList, "pi-fabric"), "C:\\Users\\dev\\.pi\\npm\\pi-fabric");
  assert.equal(versionAtLeast("0.82.1", "0.82.1"), true);
  assert.equal(versionAtLeast("0.82.2-beta.1", "0.82.1"), true);
  assert.equal(versionAtLeast("0.82.1-beta.1", "0.82.1"), false);
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
  const output = JSON.parse(result.stdout) as { checks: Array<{ id: string; status: string }> };
  assert.ok(output.checks.some((check) => check.id === "required-paths" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "pi-version" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "pi-packages" && /0\.28\.1[\s\S]*2\.15\.0/.test(check.message)));
  assert.ok(output.checks.some((check) => check.id === "fabric-configuration" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "repository-corpus" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "retired-active-pointer" && check.status === "pass"));
  assert.ok(output.checks.some((check) => check.id === "tracked-runtime-state"));
});

test("doctor strict mode fails when bootstrap warnings remain", () => {
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", ".pi/scripts/doctor.ts", "--strict", "--json"],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 1, result.stderr);
  const output = JSON.parse(result.stdout) as { checks: Array<{ status: string }> };
  assert.ok(output.checks.some((check) => check.status === "warn"));
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
