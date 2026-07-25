/**
 * Diagnostics Extension
 *
 * Registers a diagnostics tool for TypeScript, Rust, Go, and Python checks.
 * Auto-appends file-scoped diagnostics after write/edit tool calls.
 */
import { StringEnum } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolveParams } from "./diagnostics/params.js";
import { runFullDiagnostics } from "./diagnostics/run.js";
import {
  shouldSkipAuto,
  touchDebounce,
  activeRunnersForFile,
  runAutoInject,
} from "./diagnostics/auto-inject.js";

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "diagnostics",
    label: "Diagnostics",
    description:
      "Run project diagnostics. Auto-detects TypeScript (tsc), Rust (cargo check), Go (go vet), and Python (ruff/mypy); optionally scopes by language or file.",
    promptSnippet: "Run language diagnostics and code-quality checks",
    promptGuidelines: [
      "Use diagnostics after non-trivial code changes and before claiming implementation work is complete.",
    ],
    parameters: Type.Object({
      scope: Type.Optional(
        StringEnum(["full", "changed"] as const, {
          description: "Use changed to scope diagnostics to git diff (default: full)",
        }),
      ),
      languages: Type.Optional(
        Type.Array(Type.String(), {
          description: "Languages: typescript, rust, go, python",
        }),
      ),
      includeFallow: Type.Optional(
        Type.Boolean({
          description: "Run Fallow for TS/JS projects",
        }),
      ),
      includeAislop: Type.Optional(
        Type.Boolean({
          description: "Run aislop AI-slop detection",
        }),
      ),
      file: Type.Optional(
        Type.String({ description: "Run diagnostics for this file's language" }),
      ),
    }),
    async execute(_toolCallId, args, signal, _onUpdate, ctx) {
      const resolved = resolveParams(args as Record<string, unknown>, ctx.cwd);
      const { text, details } = await runFullDiagnostics(ctx.cwd, resolved, signal);
      return {
        content: [{ type: "text", text }],
        details,
      };
    },
  });

  pi.on("tool_result", async (event, ctx) => {
    if (event.toolName !== "write" && event.toolName !== "edit") return;

    const input = (event.input as { path?: string; filePath?: string } | undefined) ?? {};
    const filePath = input.path ?? input.filePath;
    if (!filePath || shouldSkipAuto(filePath)) return;

    touchDebounce();

    try {
      const runners = activeRunnersForFile(ctx.cwd, filePath);
      if (runners.size === 0) return;

      const blocks = await runAutoInject(ctx.cwd, filePath, ctx.signal);
      const text = blocks
        .map((block) => block.text)
        .filter(Boolean)
        .join("\n\n");
      if (!text) return;

      const label = Array.from(runners).join(", ");
      const appended = `--- Diagnostics (${label}) ---
${text}`;

      return {
        content: [
          ...(event.content ?? []),
          { type: "text" as const, text: appended },
        ],
      };
    } catch {
      // Auto-diagnostics is best-effort and must never block the original tool.
    }
  });
}
