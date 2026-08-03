import { spawnSync } from "node:child_process";

import { decideGitAlias, decideGitInvocation, parseGitInvocation } from "./policy.ts";

const args = process.argv.slice(2);
let decision = decideGitInvocation(args);
if (!decision.allowed) {
  process.stderr.write(`workspace-policy: blocked: ${decision.reason}\n`);
  process.exit(77);
}

const git = process.env.PI_WORKSPACE_POLICY_REAL_GIT;
if (!git) {
  process.stderr.write("workspace-policy: blocked: real Git executable is not configured\n");
  process.exit(77);
}
const parsed = parseGitInvocation(args);
if (parsed.command) {
  const alias = spawnSync(git, [...parsed.prefix, "config", "--get", `alias.${parsed.command}`], {
    encoding: "utf8",
    env: process.env,
  });
  if (alias.status === 0) decision = decideGitAlias(alias.stdout.trim(), parsed.rest);
  else if (alias.status !== 1) decision = { allowed: false, reason: "Git alias inspection failed closed" };
  if (!decision.allowed) {
    process.stderr.write(`workspace-policy: blocked: ${decision.reason}\n`);
    process.exit(77);
  }
}

const result = spawnSync(git, args, { stdio: "inherit", env: process.env });
if (result.error) {
  process.stderr.write(`workspace-policy: Git execution failed: ${result.error.message}\n`);
  process.exit(126);
}
if (result.signal) process.kill(process.pid, result.signal);
process.exit(result.status ?? 1);
