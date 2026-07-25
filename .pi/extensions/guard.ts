/**
 * Guard Extension — Agent Safety & Convention Enforcement
 *
 * Ported from an OpenCode plugin to a pi extension.
 *
 * 1. Pipe-to-shell blocker: rejects curl|bash and wget|bash patterns.
 * 2. Conventional Commits: rejects git commit with non-compliant messages.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const CONVENTIONAL_RE =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?!?: .+/;

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, _ctx) => {
    if (event.toolName !== "bash") return;

    const cmd: string = (event.input as { command?: string } | undefined)?.command ?? "";

    if (/(?:^|[;&|])\s*(?:curl|wget)\s.*\|\s*(?:ba)?sh/i.test(cmd)) {
      return {
        block: true,
        reason:
          "Blocked: detected pipe-to-shell pattern (curl/wget | bash). Download first, inspect, then run.",
      };
    }

    const commitMatch = cmd.match(/git\s+commit\s/);
    if (!commitMatch) return;

    const msgMatch =
      cmd.match(/(?:-m|--message=?)\s*"([^"]*)"/) ??
      cmd.match(/(?:-m|--message=?)\s*'([^']*)'/) ??
      cmd.match(/(?:-m|--message=?)\s+(\S+)/);

    const msg = msgMatch?.[1];

    if (!msg) {
      return {
        block: true,
        reason:
          'Blocked: git commit missing -m message. Use: git commit -m "type(scope): subject"',
      };
    }

    if (!CONVENTIONAL_RE.test(msg)) {
      return {
        block: true,
        reason: [
          "Blocked: commit message is not Conventional Commits compliant.",
          `Got: ${msg}`,
          "Expected: <type>(scope): <subject>",
          "Types: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert",
        ].join("\n"),
      };
    }
  });
}
