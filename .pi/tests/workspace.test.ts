import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, symlinkSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = path.resolve(".");
const extensionPath = path.join(repositoryRoot, ".pi/extensions/workspace/index.ts");
const launcherPath = path.join(homedir(), ".local/bin/pi-work");
const settingsPath = path.join(homedir(), ".pi/agent/settings.json");
const globalPolicyPath = path.join(homedir(), ".pi/agent/AGENTS.md");

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

type Callable = (...args: unknown[]) => unknown;

type WorkspaceModule = {
  default(api: unknown): void;
  resolveProjectIdentity(cwd: string): Promise<{ projectId: string; name: string; root: string; branch?: string }>;
  shapeReceipt(input: {
    projectId: string;
    timestamp: string;
    status: "completed" | "partial" | "blocked";
    summary: string;
    changedPaths: string[];
    checks: Array<{ label: string; passed: boolean }>;
    risks: string[];
  }): Record<string, unknown>;
  restoreProjectReceipts(entries: unknown[], projectId: string): Array<Record<string, unknown>>;
};

type FakeWorkspaceHarness = {
  events: Map<string, Callable[]>;
  commands: Map<string, Callable>;
  tools: Map<string, Callable>;
  appended: Array<{ customType: string; data: unknown }>;
  notifications: string[];
  statuses: string[];
  context: Record<string, unknown>;
};

async function workspaceModule(): Promise<WorkspaceModule> {
  assert.equal(existsSync(extensionPath), true, "workspace receipt extension is missing");
  return await import("../extensions/workspace/index.ts") as WorkspaceModule;
}

function workspaceHarness(
  module: WorkspaceModule,
  cwd: string,
  activeEntries: unknown[] = [],
  allEntries: unknown[] = activeEntries,
): FakeWorkspaceHarness {
  const events = new Map<string, Callable[]>();
  const commands = new Map<string, Callable>();
  const tools = new Map<string, Callable>();
  const appended: Array<{ customType: string; data: unknown }> = [];
  const notifications: string[] = [];
  const statuses: string[] = [];
  const api = {
    on(name: string, handler: Callable) {
      const handlers = events.get(name) ?? [];
      handlers.push(handler);
      events.set(name, handlers);
    },
    registerCommand(name: string, command: unknown) {
      commands.set(name, (command as { handler: Callable }).handler);
    },
    registerTool(tool: unknown) {
      const value = tool as { name: string; execute: Callable };
      tools.set(value.name, value.execute);
    },
    appendEntry(customType: string, data: unknown) {
      appended.push({ customType, data });
      return `entry-${appended.length}`;
    },
  };
  const context = {
    cwd,
    sessionManager: {
      getBranch: () => activeEntries,
      getEntries: () => allEntries,
    },
    ui: {
      notify(message: string) { notifications.push(message); },
      setStatus(_key: string, value: string | undefined) {
        if (value) statuses.push(value);
      },
    },
  };
  module.default(api);
  return { events, commands, tools, appended, notifications, statuses, context };
}

async function emit(
  harness: FakeWorkspaceHarness,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  for (const handler of harness.events.get(event) ?? []) {
    await handler(payload, harness.context);
  }
}

test("workspace receipt resolves isolated Git project identity", async () => {
  const module = await workspaceModule();
  const first = mkdtempSync(path.join(tmpdir(), "pi-workspace-first-"));
  const second = mkdtempSync(path.join(tmpdir(), "pi-workspace-second-"));
  for (const root of [first, second]) {
    const result = spawnSync("git", ["init", "-q", root], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    mkdirSync(path.join(root, "nested"));
  }

  const firstIdentity = await module.resolveProjectIdentity(path.join(first, "nested"));
  const secondIdentity = await module.resolveProjectIdentity(path.join(second, "nested"));
  assert.equal(firstIdentity.root, first);
  assert.equal(firstIdentity.name, path.basename(first));
  assert.notEqual(firstIdentity.projectId, secondIdentity.projectId);
});

test("workspace receipt persists bounded metadata without raw session content", async () => {
  const module = await workspaceModule();
  const receipt = module.shapeReceipt({
    projectId: "project-a",
    timestamp: "2026-07-27T00:00:00.000Z",
    status: "completed",
    summary: "Updated the adaptive workflow",
    changedPaths: ["b.ts", "a.ts", "a.ts"],
    checks: [{ label: "targeted test", passed: true }],
    risks: [],
  });

  assert.deepEqual(receipt.changedPaths, ["a.ts", "b.ts"]);
  assert.equal(receipt.projectId, "project-a");
  assert.equal("prompt" in receipt, false);
  assert.equal("toolArguments" in receipt, false);
  assert.equal("toolOutput" in receipt, false);
});

test("workspace receipt restores one project chronologically", async () => {
  const module = await workspaceModule();
  const receipt = (projectId: string, timestamp: string) => ({
    version: 1,
    projectId,
    timestamp,
    status: "completed",
    summary: "bounded",
    changedPaths: [],
    checks: [],
    risks: [],
  });
  const entries = [
    { type: "custom", customType: "workspace-receipt/v1", data: receipt("other", "2026-07-27T00:00:00.000Z") },
    { type: "custom", customType: "workspace-receipt/v1", data: receipt("project-a", "2026-07-27T02:00:00.000Z") },
    { type: "custom", customType: "workspace-receipt/v1", data: receipt("project-a", "2026-07-27T01:00:00.000Z") },
    { type: "custom", customType: "workspace-receipt/v1", data: { version: 1, projectId: "project-a", timestamp: "2026-07-27T00:30:00.000Z" } },
    { type: "custom", customType: "unrelated", data: receipt("project-a", "2026-07-27T03:00:00.000Z") },
  ];

  const restored = module.restoreProjectReceipts(entries, "project-a");
  assert.deepEqual(restored.map((receipt) => receipt.timestamp), [
    "2026-07-27T01:00:00.000Z",
    "2026-07-27T02:00:00.000Z",
  ]);
});


test("workspace extension renders compact project context and chronological receipts", async () => {
  const module = await workspaceModule();
  const root = mkdtempSync(path.join(tmpdir(), "pi-workspace-runtime-"));
  assert.equal(spawnSync("git", ["init", "-q", root], { encoding: "utf8" }).status, 0);
  const identity = await module.resolveProjectIdentity(root);
  const activeEntries = [
    { type: "custom", customType: "workspace-receipt/v1", data: { version: 1, projectId: identity.projectId, timestamp: "2026-07-27T02:00:00.000Z", status: "completed", summary: "second", changedPaths: [], checks: [], risks: [] } },
    { type: "custom", customType: "workspace-receipt/v1", data: { version: 1, projectId: identity.projectId, timestamp: "2026-07-27T01:00:00.000Z", status: "partial", summary: "first", changedPaths: [], checks: [], risks: [] } },
  ];
  const allEntries = [
    ...activeEntries,
    { type: "custom", customType: "workspace-receipt/v1", data: { version: 1, projectId: identity.projectId, timestamp: "2026-07-27T03:00:00.000Z", status: "blocked", summary: "off-branch", changedPaths: [], checks: [], risks: [] } },
  ];
  const harness = workspaceHarness(module, root, activeEntries, allEntries);
  const callerCwd = process.cwd();
  await emit(harness, "session_start", { type: "session_start", reason: "startup" });
  assert.equal(process.cwd(), callerCwd, "workspace extension must not change cwd");
  assert.equal(harness.commands.has("workspace"), true);
  assert.equal(harness.commands.has("receipts"), true);
  assert.equal(harness.tools.has("workspace_receipt"), true);
  assert.match(harness.statuses.at(-1) ?? "", new RegExp(identity.name));

  await harness.commands.get("workspace")?.("", harness.context);
  assert.match(harness.notifications.at(-1) ?? "", /branch=.*receipts=2/i);
  await harness.commands.get("receipts")?.("", harness.context);
  const view = harness.notifications.at(-1) ?? "";
  assert.ok(view.indexOf("first") < view.indexOf("second"), view);
  assert.equal(view.includes("off-branch"), false, view);
});

test("workspace receipt tool derives project identity and persists only bounded metadata", async () => {
  const module = await workspaceModule();
  const root = mkdtempSync(path.join(tmpdir(), "pi-workspace-tool-"));
  assert.equal(spawnSync("git", ["init", "-q", root], { encoding: "utf8" }).status, 0);
  const harness = workspaceHarness(module, root);
  await emit(harness, "session_start", { type: "session_start", reason: "startup" });
  const execute = harness.tools.get("workspace_receipt");
  assert.ok(execute);
  const result = await execute(
    "call-1",
    {
      status: "completed",
      summary: "x".repeat(500),
      changedPaths: ["b.ts", "a.ts", "a.ts"],
      checks: [{ label: "targeted", passed: true }],
      risks: ["none"],
      prompt: "secret prompt",
      toolOutput: "full log",
    },
    undefined,
    undefined,
    harness.context,
  );
  assert.equal(harness.appended.length, 1);
  assert.equal(harness.appended[0].customType, "workspace-receipt/v1");
  const receipt = harness.appended[0].data as Record<string, unknown>;
  assert.equal(receipt.version, 1);
  assert.equal((receipt.summary as string).length <= 240, true);
  assert.deepEqual(receipt.changedPaths, ["a.ts", "b.ts"]);
  assert.equal("prompt" in receipt, false);
  assert.equal("toolOutput" in receipt, false);
  assert.equal("slug" in receipt, false);
  assert.equal("details" in (result as Record<string, unknown>), false);
});

test("workspace receipts redact credentials and raw-content fields", async () => {
  const module = await workspaceModule();
  const receipt = module.shapeReceipt({
    projectId: "project-a",
    timestamp: "2026-07-27T00:00:00.000Z",
    status: "blocked",
    summary: "Authorization: Bearer sk-example-secret",
    changedPaths: ["src/auth.ts"],
    checks: [{ label: "toolOutput: full private log", passed: false }],
    risks: ["password=hunter2", "api_key: abc123"],
  });
  const serialized = JSON.stringify(receipt);
  for (const forbidden of ["sk-example-secret", "full private log", "hunter2", "abc123"]) {
    assert.equal(serialized.includes(forbidden), false, serialized);
  }
});

test("workspace receipt requires a summary and round-trips canonical metadata", async () => {
  const module = await workspaceModule();
  const input = {
    projectId: "project-a",
    timestamp: "2026-07-27T00:00:00.000Z",
    status: "completed" as const,
    summary: "  durable result  ",
    changedPaths: ["a.ts"],
    checks: [{ label: "test", passed: true }],
    risks: [],
  };
  assert.throws(() => module.shapeReceipt({ ...input, summary: "   " }), /summary/i);
  const shaped = module.shapeReceipt(input);
  const restored = module.restoreProjectReceipts([
    { type: "custom", customType: "workspace-receipt/v1", data: shaped },
  ], "project-a");
  assert.equal(restored.length, 1);
  assert.equal(restored[0].summary, "durable result");

  const boundary = module.shapeReceipt({
    ...input,
    summary: `Bearer x ${"a".repeat(221)} ${"b".repeat(9)}`,
  });
  const boundaryRestored = module.restoreProjectReceipts([
    { type: "custom", customType: "workspace-receipt/v1", data: boundary },
  ], "project-a");
  assert.equal(boundaryRestored.length, 1);
  assert.deepEqual(boundaryRestored[0], boundary);
});

test("workspace restore rejects malformed receipts", async () => {
  const module = await workspaceModule();
  const valid = {
    version: 1,
    projectId: "project-a",
    timestamp: "2026-07-27T00:00:00.000Z",
    status: "completed",
    summary: "bounded",
    changedPaths: [],
    checks: [],
    risks: [],
  };
  const restored = module.restoreProjectReceipts([
    { type: "custom", customType: "workspace-receipt/v1", data: { version: 1, projectId: "project-a", timestamp: valid.timestamp } },
    { type: "custom", customType: "workspace-receipt/v1", data: { ...valid, summary: "x".repeat(241) } },
    { type: "custom", customType: "workspace-receipt/v1", data: { ...valid, prompt: "raw" } },
    { type: "custom", customType: "workspace-receipt/v1", data: { ...valid, checks: [{ label: "ok", passed: true, output: "raw" }] } },
  ], "project-a");
  assert.deepEqual(restored, []);
});

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
