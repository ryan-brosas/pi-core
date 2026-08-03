import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, symlinkSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = path.resolve(".");
const launcherPath = path.join(homedir(), ".local/bin/pi-work");
const settingsPath = path.join(homedir(), ".pi/agent/settings.json");
const globalPolicyPath = path.join(homedir(), ".pi/agent/AGENTS.md");
const globalFabricPath = path.join(homedir(), ".pi/agent/fabric.json");
const globalDevelopmentPath = path.join(repositoryRoot, "docs/global-development.md");

function matchesInstalledCheckout(): boolean {
  if (![launcherPath, settingsPath, globalPolicyPath].every(existsSync)) return false;
  try {
    const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as { packages?: unknown[] };
    const source = path.join(repositoryRoot, ".pi");
    return settings.packages?.includes(source) === true
      && readlinkSync(globalPolicyPath) === path.join(source, "templates/agents-policy.md");
  } catch {
    return false;
  }
}

function parseRpcRecords(output: string): Array<Record<string, unknown>> {
  return output.split("\n").flatMap((line) => {
    if (!line) return [];
    try {
      return [JSON.parse(line) as Record<string, unknown>];
    } catch {
      return [];
    }
  });
}

test("project launcher rejects canonical symlink escapes", { skip: !existsSync(launcherPath) }, () => {
  const projects = mkdtempSync(path.join(tmpdir(), "pi-work-projects-"));
  const inside = path.join(projects, "inside");
  const outside = mkdtempSync(path.join(tmpdir(), "pi-work-outside-"));
  mkdirSync(inside);
  symlinkSync(outside, path.join(projects, "escape"), "dir");
  const env = { ...process.env, PI_WORK_PROJECTS_ROOT: projects };
  const valid = spawnSync(launcherPath, ["--check", "inside"], { encoding: "utf8", env });
  assert.equal(valid.status, 0, valid.stderr);
  assert.equal(valid.stdout.trim(), inside);
  const escaped = spawnSync(launcherPath, ["--check", "escape"], { encoding: "utf8", env });
  assert.notEqual(escaped.status, 0);
});

test("global development contract documents direct project launch and shared Fabric", () => {
  const guide = readFileSync(globalDevelopmentPath, "utf8");
  assert.match(guide, /Pi Core[^]*(?:canonical|source of truth)/i);
  assert.match(guide, /cd[^\n]*<project>[^\n]*[\r\n]+pi/i);
  assert.match(guide, /global[^]*(?:package|settings)[^]*Fabric/i);
  assert.match(guide, /target project[^]*(?:source|plans|requirements)/i);
  assert.match(guide, /first[- ]class MCP/i);
  assert.match(guide, /Hindsight[^]*(?:durable|project memory)/i);
  assert.doesNotMatch(guide, /workspace extension|bounded session receipts/i);

  const fabric = JSON.parse(readFileSync(globalFabricPath, "utf8")) as {
    fullCodeMode?: boolean;
    agents?: { enabled?: boolean };
  };
  assert.equal(fabric.fullCodeMode, true);
  assert.equal(fabric.agents?.enabled, true);
});

test(
  "global Pi Core retires ambient knowledge supervision",
  { skip: !matchesInstalledCheckout() },
  () => {
    assert.equal(
      existsSync(path.join(repositoryRoot, ".pi/extensions/knowledge-enforcement/index.ts")),
      false,
      "automatic knowledge supervisor extension must remain retired",
    );
    const rpc = spawnSync(
      "pi",
      ["--mode", "rpc", "--no-session", "--offline", "--no-approve"],
      {
        cwd: tmpdir(),
        encoding: "utf8",
        env: { ...process.env, PI_OFFLINE: "1" },
        input: JSON.stringify({ id: "commands", type: "get_commands" }) + "\n",
        maxBuffer: 2 * 1024 * 1024,
        timeout: 15_000,
      },
    );
    assert.equal(rpc.status, 0, rpc.stderr);
    const commandResponse = parseRpcRecords(rpc.stdout).find((record) =>
      record.type === "response" && record.command === "get_commands"
    );
    assert.equal(commandResponse?.success, true);
    const commands = (commandResponse?.data as { commands?: Array<Record<string, unknown>> })?.commands ?? [];
    assert.equal(commands.some((command) => command.name === "knowledge-status"), false);
  },
);

test(
  "global Pi Core package, universal policy link, and project launcher are installed once",
  { skip: !matchesInstalledCheckout() },
  () => {
    const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as { packages: unknown[] };
    const source = path.join(repositoryRoot, ".pi");
    assert.equal(settings.packages.filter((entry) => entry === source).length, 1);
    assert.equal(readlinkSync(globalPolicyPath), path.join(source, "templates/agents-policy.md"));

    const projectName = path.basename(repositoryRoot);
    const check = spawnSync(launcherPath, ["--check", projectName], { encoding: "utf8", cwd: tmpdir() });
    assert.equal(check.status, 0, check.stderr);
    assert.equal(check.stdout.trim(), repositoryRoot);
    const missing = spawnSync(launcherPath, ["--check", "definitely-missing-project"], {
      encoding: "utf8",
      cwd: tmpdir(),
    });
    assert.notEqual(missing.status, 0);
  },
);
