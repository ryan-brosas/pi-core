import path from "node:path";

export const POLICY_SENTINEL = "PI_CORE_WORKSPACE_POLICY_V1";
export const REQUIRED_BRANCH = "main";

export type PolicyDecision = { allowed: true } | { allowed: false; reason: string };
export type WorkspaceSnapshot =
  | { kind: "non-git" }
  | { kind: "git"; root: string; branch: string; gitDir: string; commonDir: string };

const deny = (reason: string): PolicyDecision => ({ allowed: false, reason });
const allow = (): PolicyDecision => ({ allowed: true });

export type GitInvocation = { prefix: string[]; command?: string; rest: string[] };

function commandIndex(args: string[]): number {
  const consumesNext = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path", "--config-env"]);
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (consumesNext.has(arg)) { index++; continue; }
    if (arg.startsWith("--git-dir=") || arg.startsWith("--work-tree=") || arg.startsWith("--namespace=") || arg.startsWith("--exec-path=") || arg.startsWith("--config-env=")) continue;
    if (arg.startsWith("-")) continue;
    return index;
  }
  return -1;
}

export function parseGitInvocation(args: string[]): GitInvocation {
  const index = commandIndex(args);
  return index < 0
    ? { prefix: [...args], rest: [] }
    : { prefix: args.slice(0, index), command: args[index], rest: args.slice(index + 1) };
}

function branchMutation(args: string[]): boolean {
  const mutation = new Set(["-d", "-D", "-m", "-M", "-c", "-C", "--delete", "--move", "--copy", "--edit-description", "--set-upstream-to", "--unset-upstream"]);
  if (args.some((arg) => mutation.has(arg) || [...mutation].some((flag) => arg.startsWith(`${flag}=`)))) return true;
  const positional = args.filter((arg) => !arg.startsWith("-"));
  return positional.length > 0 && !args.includes("--list");
}

function hasOption(args: string[], options: string[]): boolean {
  return args.some((arg) => options.some((option) =>
    arg === option || arg.startsWith(`${option}=`) || (option.length === 2 && arg.startsWith(option))
  ));
}

function checkoutTarget(args: string[]): string | undefined {
  if (args.includes("--")) return undefined;
  const consumesNext = new Set(["--conflict", "--pathspec-from-file"]);
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (consumesNext.has(arg)) { index++; continue; }
    if (arg === "-" || !arg.startsWith("-")) return arg;
  }
  return undefined;
}

export function decideGitInvocation(args: string[]): PolicyDecision {
  const { command, rest } = parseGitInvocation(args);
  if (command === undefined) return allow();
  if (command === "worktree") {
    const action = rest.find((arg) => !arg.startsWith("-"));
    return action === undefined || ["list", "remove", "prune", "unlock"].includes(action)
      ? allow()
      : deny(`git worktree ${action} is disabled by the global main-only policy`);
  }
  if (command === "switch") {
    if (hasOption(rest, ["-c", "-C", "--create", "--force-create", "--orphan", "--detach"])) return deny("creating or detaching a branch is disabled by the global main-only policy");
    const target = rest.find((arg) => arg === "-" || !arg.startsWith("-"));
    return target === undefined || target === REQUIRED_BRANCH ? allow() : deny(`switching to ${target} is disabled; remain on ${REQUIRED_BRANCH}`);
  }
  if (command === "checkout") {
    if (hasOption(rest, ["-b", "-B", "--orphan", "--detach"])) return deny("creating or detaching a branch is disabled by the global main-only policy");
    const target = checkoutTarget(rest);
    return target === undefined || target === REQUIRED_BRANCH ? allow() : deny(`checking out ${target} is disabled; remain on ${REQUIRED_BRANCH}`);
  }
  if (command === "branch" && branchMutation(rest)) return deny("branch mutation is disabled by the global main-only policy");
  if (command === "update-ref") return deny("direct ref mutation is disabled by the global main-only policy");
  if (command === "symbolic-ref" && rest.length > 1) return deny("symbolic ref mutation is disabled by the global main-only policy");
  return allow();
}

function splitWords(input: string): string[] {
  const words: string[] = [];
  let word = "";
  let quote = "";
  let escaped = false;
  for (const char of input) {
    if (escaped) { word += char; escaped = false; continue; }
    if (char === "\\" && quote !== "'") { escaped = true; continue; }
    if (quote) {
      if (char === quote) quote = "";
      else word += char;
      continue;
    }
    if (char === "'" || char === '"') { quote = char; continue; }
    if (/\s/.test(char)) {
      if (word) { words.push(word); word = ""; }
      continue;
    }
    word += char;
  }
  if (word) words.push(word);
  return words;
}

export function decideGitAlias(expansion: string, args: string[]): PolicyDecision {
  if (expansion.trimStart().startsWith("!")) return deny("shell-based Git aliases are disabled by the global main-only policy");
  const expanded = splitWords(expansion);
  return expanded.length === 0 ? deny("empty Git alias is disabled") : decideGitInvocation([...expanded, ...args]);
}

export function evaluateWorkspace(snapshot: WorkspaceSnapshot): PolicyDecision {
  if (snapshot.kind === "non-git") return allow();
  if (snapshot.branch !== REQUIRED_BRANCH) return deny(`workspace policy requires branch ${REQUIRED_BRANCH}; current branch is ${snapshot.branch || "detached"}`);
  if (path.resolve(snapshot.gitDir) !== path.resolve(snapshot.commonDir)) return deny("linked Git worktrees are disabled; use the primary checkout on main");
  return allow();
}

export function contextHasSentinel(
  files: Array<{ path: string; content: string }> | undefined,
  requiredPath?: string,
): boolean {
  return files?.some((file) =>
    file.content.includes(POLICY_SENTINEL) &&
    (requiredPath === undefined || path.resolve(file.path) === path.resolve(requiredPath))
  ) === true;
}

function codeSetsBoolean(code: string, property: string, value: boolean): boolean {
  const literal = String(value);
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`(?:\\b${escaped}|["'\`]${escaped}["'\`])\\s*:\\s*${literal}\\b`).test(code)) return true;
  const aliases = [...code.matchAll(new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*["'\`]${escaped}["'\`]`, "g"))].map((match) => match[1]);
  return aliases.some((name) => new RegExp(`\\[\\s*${name.replace(/[$]/g, "\\$")}\\s*\\]\\s*:\\s*${literal}\\b`).test(code));
}

export function fabricCodeRequestsWorktree(code: string): boolean {
  return codeSetsBoolean(code, "worktree", true);
}

export function fabricCodeDisablesExtensions(code: string): boolean {
  return codeSetsBoolean(code, "extensions", false);
}

function gitArgsFromShellSegment(segment: string): string[] | undefined {
  const words = splitWords(segment.trim());
  let index = 0;
  while (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index] ?? "")) index++;
  if (words[index] === "env") {
    index++;
    while (index < words.length) {
      const word = words[index];
      if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word) || word === "-i" || word === "--ignore-environment") { index++; continue; }
      if (["-u", "--unset", "-C", "--chdir"].includes(word)) { index += 2; continue; }
      if (word.startsWith("--unset=") || word.startsWith("--chdir=")) { index++; continue; }
      break;
    }
  }
  if (["command", "exec"].includes(words[index])) index++;
  const executable = words[index];
  if (!executable || path.basename(executable) !== "git") return undefined;
  return words.slice(index + 1);
}

export function shellCommandRequestsForbiddenGit(command: string): boolean {
  return command.split(/&&|\|\||[;\n|]/).some((segment) => {
    const args = gitArgsFromShellSegment(segment);
    return args !== undefined && !decideGitInvocation(args).allowed;
  });
}
