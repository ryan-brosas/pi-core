import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const EXTENSION = path.join(ROOT, ".pi/extensions/workspace-policy/index.ts");
const POLICY = path.join(ROOT, ".pi/extensions/workspace-policy/policy.ts");
const GIT_SHIM = path.join(ROOT, ".pi/extensions/workspace-policy/bin/git");
const SENTINEL = "PI_CORE_WORKSPACE_POLICY_V1";

type PolicyModule = typeof import("../extensions/workspace-policy/policy.ts");
async function policy(): Promise<PolicyModule> {
  return import(pathToFileURL(POLICY).href);
}

test("Git policy blocks worktree and branch creation while preserving inspection and cleanup", async () => {
  const { decideGitInvocation } = await policy();
  for (const args of [
    ["worktree", "add", "/tmp/new"],
    ["-C", ROOT, "worktree", "add", "-b", "feature/x", "/tmp/new"],
    ["switch", "-c", "feature/x"],
    ["switch", "feature/x"],
    ["switch", "-"],
    ["switch", "--create=feature/x"],
    ["switch", "--orphan=feature/x"],
    ["checkout", "-b", "feature/x"],
    ["checkout", "feature/x"],
    ["checkout", "-"],
    ["checkout", "--orphan=feature/x"],
    ["branch", "feature/x"],
    ["branch", "-D", "feature/x"],
    ["update-ref", "refs/heads/feature/x", "HEAD"],
  ]) {
    assert.equal(decideGitInvocation(args).allowed, false, args.join(" "));
  }
  for (const args of [
    ["status", "--short"],
    ["branch", "--show-current"],
    ["worktree", "list"],
    ["worktree", "remove", "/tmp/old"],
    ["worktree", "prune"],
    ["switch", "main"],
    ["checkout", "main"],
    ["checkout", "--", "file.txt"],
  ]) {
    assert.equal(decideGitInvocation(args).allowed, true, args.join(" "));
  }
});

test("workspace policy permits non-Git and primary main checkouts but rejects branches and linked worktrees", async () => {
  const { evaluateWorkspace } = await policy();
  assert.equal(evaluateWorkspace({ kind: "non-git" }).allowed, true);
  assert.equal(evaluateWorkspace({ kind: "git", root: "/repo", branch: "main", gitDir: "/repo/.git", commonDir: "/repo/.git" }).allowed, true);
  assert.match(evaluateWorkspace({ kind: "git", root: "/repo", branch: "feature/x", gitDir: "/repo/.git", commonDir: "/repo/.git" }).reason ?? "", /main/);
  assert.match(evaluateWorkspace({ kind: "git", root: "/repo", branch: "main", gitDir: "/repo/.git/worktrees/x", commonDir: "/repo/.git" }).reason ?? "", /worktree/i);
});

test("policy context and Fabric code checks fail closed", async () => {
  const { contextHasSentinel, fabricCodeDisablesExtensions, fabricCodeRequestsWorktree, shellCommandRequestsForbiddenGit } = await policy();
  assert.equal(contextHasSentinel([{ path: "/global/AGENTS.md", content: SENTINEL }], "/global/AGENTS.md"), true);
  assert.equal(contextHasSentinel([{ path: "/project/AGENTS.md", content: SENTINEL }], "/global/AGENTS.md"), false);
  assert.equal(contextHasSentinel([{ path: "/global/AGENTS.md", content: "no marker" }], "/global/AGENTS.md"), false);
  assert.equal(fabricCodeRequestsWorktree('return agents.run({task:"x", worktree:true});'), true);
  assert.equal(fabricCodeRequestsWorktree('const key="worktree"; return agents.run({task:"x", [key]: true});'), true);
  assert.equal(fabricCodeRequestsWorktree('return agents.run({task:"x", worktree:false});'), false);
  assert.equal(fabricCodeDisablesExtensions('return agents.run({task:"x", extensions:false});'), true);
  assert.equal(fabricCodeDisablesExtensions('return agents.run({task:"x", extensions:true});'), false);
  assert.equal(shellCommandRequestsForbiddenGit("PATH=/usr/bin git worktree add /tmp/x"), true);
  assert.equal(shellCommandRequestsForbiddenGit("env PATH=/usr/bin /usr/bin/git switch feature/x"), true);
  assert.equal(shellCommandRequestsForbiddenGit("echo git worktree add /tmp/x"), false);
});

test("Git alias policy evaluates aliases before delegation", async () => {
  const { decideGitAlias } = await policy();
  assert.equal(decideGitAlias("worktree", ["add", "/tmp/x"]).allowed, false);
  assert.equal(decideGitAlias("checkout", ["feature/x"]).allowed, false);
  assert.equal(decideGitAlias("status", ["--short"]).allowed, true);
  assert.equal(decideGitAlias("!git worktree add /tmp/x", []).allowed, false);
});

test("extension blocks tools without policy context, off main, and explicit Fabric worktrees", async () => {
  const handlers = new Map<string, (event: Record<string, unknown>, ctx: Record<string, unknown>) => unknown>();
  let branch = "main";
  const git = async (_command: string, args: string[]) => {
    const joined = args.join(" ");
    if (joined === "rev-parse --show-toplevel") return { stdout: `${ROOT}\n`, stderr: "", code: 0, killed: false };
    if (joined === "rev-parse --absolute-git-dir") return { stdout: `${ROOT}/.git\n`, stderr: "", code: 0, killed: false };
    if (joined === "rev-parse --path-format=absolute --git-common-dir") return { stdout: `${ROOT}/.git\n`, stderr: "", code: 0, killed: false };
    if (joined === "branch --show-current") return { stdout: `${branch}\n`, stderr: "", code: 0, killed: false };
    throw new Error(`unexpected git args: ${joined}`);
  };
  const commands = new Map<string, unknown>();
  const api = {
    on: (name: string, handler: (event: Record<string, unknown>, ctx: Record<string, unknown>) => unknown) => handlers.set(name, handler),
    exec: git,
    registerCommand: (name: string, value: unknown) => commands.set(name, value),
  };
  const originalPath = process.env.PATH;
  const originalGit = process.env.PI_WORKSPACE_POLICY_REAL_GIT;
  const originalNode = process.env.PI_WORKSPACE_POLICY_NODE;
  try {
    const extension = (await import(pathToFileURL(EXTENSION).href)).default;
    extension(api as never);
    const deniedTarget = path.join(mkdtempSync(path.join(tmpdir(), "workspace-policy-path-")), "worktree");
    const deniedByPath = spawnSync("git", ["worktree", "add", deniedTarget], { cwd: ROOT, env: process.env, encoding: "utf8" });
    assert.equal(deniedByPath.status, 77, deniedByPath.stderr);
    assert.equal(existsSync(deniedTarget), false);
    const sessionStart = handlers.get("session_start");
    const before = handlers.get("before_agent_start");
    const toolCall = handlers.get("tool_call");
    assert.ok(sessionStart && before && toolCall);
    const ctx = { ui: { notify: () => undefined } };
    await assert.doesNotReject(async () => sessionStart({ type: "session_start", reason: "startup" }, ctx));
    const event = (content: string) => ({
      type: "before_agent_start",
      prompt: "work",
      systemPrompt: "base",
      systemPromptOptions: { cwd: ROOT, contextFiles: [{ path: path.join(ROOT, ".pi/templates/agents-policy.md"), content }] },
    });

    await before(event("missing"), ctx);
    let blocked = await toolCall({ type: "tool_call", toolCallId: "1", toolName: "fabric_exec", input: { code: "return 1" } }, ctx) as { block?: boolean; reason?: string };
    assert.equal(blocked.block, true);
    assert.match(blocked.reason ?? "", /AGENTS\.md/);

    await before(event(SENTINEL), ctx);
    assert.equal(await toolCall({ type: "tool_call", toolCallId: "2", toolName: "fabric_exec", input: { code: "return agents.run({task:'x',worktree:false,extensions:true})" } }, ctx), undefined);
    blocked = await toolCall({ type: "tool_call", toolCallId: "3", toolName: "fabric_exec", input: { code: "return agents.run({task:'x',worktree:true})" } }, ctx) as { block?: boolean; reason?: string };
    assert.equal(blocked.block, true);
    assert.match(blocked.reason ?? "", /worktree/i);
    blocked = await toolCall({ type: "tool_call", toolCallId: "3b", toolName: "fabric_exec", input: { code: "return agents.run({task:'x',extensions:false})" } }, ctx) as { block?: boolean; reason?: string };
    assert.equal(blocked.block, true);
    assert.match(blocked.reason ?? "", /extensions/i);

    branch = "feature/x";
    await before(event(SENTINEL), ctx);
    blocked = await toolCall({ type: "tool_call", toolCallId: "4", toolName: "write", input: { path: "x", content: "x" } }, ctx) as { block?: boolean; reason?: string };
    assert.equal(blocked.block, true);
    assert.match(blocked.reason ?? "", /main/);
    assert.ok(commands.has("workspace-policy-status"));
  } finally {
    if (originalPath === undefined) delete process.env.PATH; else process.env.PATH = originalPath;
    if (originalGit === undefined) delete process.env.PI_WORKSPACE_POLICY_REAL_GIT; else process.env.PI_WORKSPACE_POLICY_REAL_GIT = originalGit;
    if (originalNode === undefined) delete process.env.PI_WORKSPACE_POLICY_NODE; else process.env.PI_WORKSPACE_POLICY_NODE = originalNode;
  }
});

test("Git shim blocks creation before Git runs and permits read-only Git", () => {
  const env = { ...process.env, PI_WORKSPACE_POLICY_REAL_GIT: "/usr/bin/git" };
  const version = spawnSync(GIT_SHIM, ["--version"], { cwd: ROOT, env, encoding: "utf8" });
  assert.equal(version.status, 0, version.stderr);
  const list = spawnSync(GIT_SHIM, ["worktree", "list"], { cwd: ROOT, env, encoding: "utf8" });
  assert.equal(list.status, 0, list.stderr);
  const blocked = spawnSync(GIT_SHIM, ["worktree", "add", "/tmp/must-not-exist"], { cwd: ROOT, env, encoding: "utf8" });
  assert.equal(blocked.status, 77, blocked.stderr);
  assert.match(blocked.stderr, /blocked/i);
  const aliasTarget = path.join(mkdtempSync(path.join(tmpdir(), "workspace-policy-alias-")), "worktree");
  const alias = spawnSync(GIT_SHIM, ["-c", "alias.wt=worktree", "wt", "add", aliasTarget], { cwd: ROOT, env, encoding: "utf8" });
  assert.equal(alias.status, 77, alias.stderr);
  assert.equal(existsSync(aliasTarget), false);
});

test("global package, AGENTS symlink, and policy source carry the enforcement sentinel", () => {
  const template = readFileSync(path.join(ROOT, ".pi/templates/agents-policy.md"), "utf8");
  const project = readFileSync(path.join(ROOT, "AGENTS.md"), "utf8");
  assert.match(template, new RegExp(SENTINEL));
  assert.match(template, /main[^]*worktree/i);
  assert.match(project, /runtime[^]*main[^]*worktree/i);
  assert.equal(readlinkSync(path.join(homedir(), ".pi/agent/AGENTS.md")), path.join(ROOT, ".pi/templates/agents-policy.md"));
  const settings = JSON.parse(readFileSync(path.join(homedir(), ".pi/agent/settings.json"), "utf8")) as { packages: unknown[] };
  assert.ok(settings.packages.includes(path.join(ROOT, ".pi")));
});
