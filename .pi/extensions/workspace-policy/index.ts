import { accessSync, constants, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

import {
  contextHasSentinel,
  evaluateWorkspace,
  fabricCodeDisablesExtensions,
  fabricCodeRequestsWorktree,
  POLICY_SENTINEL,
  shellCommandRequestsForbiddenGit,
  type WorkspaceSnapshot,
} from "./policy.ts";

const EXTENSION_DIR = path.dirname(fileURLToPath(import.meta.url));
const GLOBAL_POLICY_SOURCE = canonical(path.join(EXTENSION_DIR, "../../templates/agents-policy.md"));
const GUARDED_TOOLS = new Set(["bash", "edit", "write", "fabric_exec"]);

type RuntimeState = {
  cwd: string;
  contextLoaded: boolean;
  workspace: WorkspaceSnapshot;
  shimError?: string;
};

function findExecutable(name: string, excludedDir?: string): string | undefined {
  for (const directory of (process.env.PATH ?? "").split(path.delimiter)) {
    if (!directory || (excludedDir && path.resolve(directory) === path.resolve(excludedDir))) continue;
    const candidate = path.join(directory, name);
    try {
      accessSync(candidate, constants.X_OK);
      return realpathSync(candidate);
    } catch {
      continue;
    }
  }
  return undefined;
}

type GitShim = { git?: string; error?: string };

function installGitShim(): GitShim {
  const binDir = path.join(EXTENSION_DIR, "bin");
  const git = findExecutable("git", binDir);
  const node = findExecutable("node", binDir);
  if (!git || !node) return { error: "workspace policy could not locate git and node" };
  process.env.PI_WORKSPACE_POLICY_REAL_GIT = git;
  process.env.PI_WORKSPACE_POLICY_NODE = node;
  const entries = (process.env.PATH ?? "").split(path.delimiter).filter((entry) => entry && path.resolve(entry) !== path.resolve(binDir));
  process.env.PATH = [binDir, ...entries].join(path.delimiter);
  return { git };
}

function canonical(value: string): string {
  try { return realpathSync(value); } catch { return path.resolve(value); }
}

async function inspectWorkspace(pi: ExtensionAPI, cwd: string, git: string): Promise<WorkspaceSnapshot> {
  const top = await pi.exec(git, ["rev-parse", "--show-toplevel"], { cwd, timeout: 5_000 });
  if (top.code !== 0) return { kind: "non-git" };
  const [gitDir, commonDir, branch] = await Promise.all([
    pi.exec(git, ["rev-parse", "--absolute-git-dir"], { cwd, timeout: 5_000 }),
    pi.exec(git, ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd, timeout: 5_000 }),
    pi.exec(git, ["branch", "--show-current"], { cwd, timeout: 5_000 }),
  ]);
  if ([gitDir, commonDir, branch].some((result) => result.code !== 0)) throw new Error("workspace policy could not inspect Git state");
  return {
    kind: "git",
    root: canonical(top.stdout.trim()),
    branch: branch.stdout.trim(),
    gitDir: canonical(gitDir.stdout.trim()),
    commonDir: canonical(commonDir.stdout.trim()),
  };
}

function requiredContextLoaded(files: Array<{ path: string; content: string }> | undefined): boolean {
  const canonicalFiles = files?.map((file) => ({ ...file, path: canonical(file.path) }));
  return contextHasSentinel(canonicalFiles, GLOBAL_POLICY_SOURCE);
}

function reasonFor(state: RuntimeState, workspace: WorkspaceSnapshot): string | undefined {
  if (state.shimError) return state.shimError;
  if (!state.contextLoaded) return `required AGENTS.md policy marker ${POLICY_SENTINEL} was not loaded`;
  const decision = evaluateWorkspace(workspace);
  return decision.allowed ? undefined : decision.reason;
}

function notifyBlocked(ctx: ExtensionContext, reason: string): void {
  if (ctx.hasUI) ctx.ui.notify(`Workspace policy blocked this action: ${reason}`, "warning");
}

export default function workspacePolicy(pi: ExtensionAPI): void {
  const shim = installGitShim();
  const state: RuntimeState = {
    cwd: process.cwd(),
    contextLoaded: false,
    workspace: { kind: "non-git" },
    shimError: shim.error,
  };

  const refresh = async (cwd: string): Promise<WorkspaceSnapshot> => {
    state.cwd = cwd;
    try {
      state.workspace = await inspectWorkspace(pi, cwd, shim.git ?? "git");
    } catch (error) {
      state.workspace = { kind: "git", root: cwd, branch: "", gitDir: "invalid", commonDir: "unknown" };
      state.shimError = error instanceof Error ? error.message : String(error);
    }
    return state.workspace;
  };

  pi.on("session_start", async () => {
    state.contextLoaded = false;
    await refresh(process.cwd());
  });

  pi.on("before_agent_start", async (event) => {
    state.contextLoaded = requiredContextLoaded(event.systemPromptOptions.contextFiles);
    const workspace = await refresh(event.systemPromptOptions.cwd);
    const reason = reasonFor(state, workspace);
    const status = reason
      ? `Workspace enforcement is blocking tools: ${reason}.`
      : "Workspace enforcement is active: remain in the primary checkout on main; branches and worktrees are disabled.";
    return { systemPrompt: `${event.systemPrompt}\n\n${status}` };
  });

  pi.on("tool_call", async (event, ctx) => {
    if (!GUARDED_TOOLS.has(event.toolName)) return;
    const workspace = await refresh(state.cwd);
    const reason = reasonFor(state, workspace);
    if (reason) {
      notifyBlocked(ctx, reason);
      return { block: true, reason };
    }
    if (event.toolName === "bash") {
      const command = typeof event.input.command === "string" ? event.input.command : "";
      if (shellCommandRequestsForbiddenGit(command)) {
        const blocked = "branch and worktree Git commands are disabled by the global workspace policy";
        notifyBlocked(ctx, blocked);
        return { block: true, reason: blocked };
      }
    }
    if (event.toolName === "fabric_exec") {
      const code = typeof event.input.code === "string" ? event.input.code : "";
      if (fabricCodeRequestsWorktree(code)) {
        const blocked = "Fabric worktree requests are disabled by the global workspace policy";
        notifyBlocked(ctx, blocked);
        return { block: true, reason: blocked };
      }
      if (fabricCodeDisablesExtensions(code)) {
        const blocked = "Fabric child extensions:false is disabled because it bypasses global workspace verification";
        notifyBlocked(ctx, blocked);
        return { block: true, reason: blocked };
      }
    }
  });

  pi.registerCommand("workspace-policy-status", {
    description: "Show global main-only workspace enforcement state",
    handler: (_args, ctx) => {
      const reason = reasonFor(state, state.workspace);
      const workspace = state.workspace.kind === "git"
        ? `${state.workspace.root} branch=${state.workspace.branch || "detached"}`
        : "non-git";
      ctx.ui.notify(
        reason ? `workspace-policy blocked ${workspace}: ${reason}` : `workspace-policy active ${workspace}`,
        reason ? "warning" : "info",
      );
    },
  });
}
