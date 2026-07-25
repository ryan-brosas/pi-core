/**
 * Session Summary Extension — structured persistent context.
 *
 * Tracks file artifacts and session intent, injects a compact summary into the
 * system prompt, and persists it across compaction and session shutdown.
 * Persistence: <project>/.pi/state/session-summary.md
 */
import fs from "node:fs";
import path from "node:path";
import {
  CONFIG_DIR_NAME,
  type ExtensionAPI,
} from "@earendil-works/pi-coding-agent";
import {
  normalizePath,
  extractEditDetail,
  formatSummary,
} from "./session-summary/serialize.js";
import {
  enforceLimits,
  addRead,
  addModified,
  addCreated,
} from "./session-summary/tracking.js";
import { loadSummary, saveSummary } from "./session-summary/persist.js";
import type { SessionSummaryData } from "./session-summary/types.js";

function editDetail(args: Record<string, unknown>): string {
  const edits = Array.isArray(args.edits) ? args.edits : [];
  const first =
    edits[0] && typeof edits[0] === "object"
      ? (edits[0] as Record<string, unknown>)
      : {};

  return extractEditDetail({
    oldString: args.oldString ?? args.oldText ?? first.oldText,
    newString: args.newString ?? args.newText ?? first.newText,
  });
}

export default function (pi: ExtensionAPI) {
  let cwd = process.cwd();
  let summaryPath = "";
  let summary: SessionSummaryData = loadSummary("");
  let intentGuessed = false;

  const persist = () => {
    if (!summaryPath) return;
    enforceLimits(summary);
    saveSummary(summaryPath, summary);
  };

  pi.on("session_start", async (_event, ctx) => {
    cwd = ctx.cwd;
    summaryPath = path.join(
      cwd,
      CONFIG_DIR_NAME,
      "state",
      "session-summary.md",
    );
    summary = loadSummary(summaryPath);
    intentGuessed = summary.intent.length > 0;
  });

  pi.on("input", async (event) => {
    if (event.source === "extension" || intentGuessed) {
      return { action: "continue" };
    }

    const marker = "- Complete this task: ";
    const markerIndex = event.text.indexOf(marker);
    const candidate =
      markerIndex >= 0
        ? event.text.slice(markerIndex + marker.length).split("\n")[0]
        : event.text;
    const intent = candidate.trim();

    if (intent.length > 10 && intent.length < 500) {
      summary.intent = intent.slice(0, 200);
      intentGuessed = true;
    }

    return { action: "continue" };
  });

  pi.on("tool_call", async (event) => {
    const tool = event.toolName.toLowerCase();
    const args = (event.input as Record<string, unknown> | undefined) ?? {};
    const filePath = String(args.path ?? args.filePath ?? "").trim();
    if (!filePath) return;

    const normalized = normalizePath(filePath, cwd);

    switch (tool) {
      case "read":
        addRead(summary, normalized);
        break;
      case "edit":
        addModified(summary, normalized, editDetail(args));
        break;
      case "write": {
        const absolutePath = path.isAbsolute(normalized)
          ? normalized
          : path.join(cwd, normalized);
        const existed = fs.existsSync(absolutePath);
        addModified(summary, normalized, "Written/created");
        if (!existed) addCreated(summary, normalized);
        break;
      }
      case "grep":
      case "find":
      case "ls":
        break;
    }
  });

  pi.on("before_agent_start", async (event) => {
    const hasContent =
      summary.intent.length > 0 ||
      summary.files.modified.size > 0 ||
      summary.files.created.size > 0 ||
      summary.decisions.length > 0;
    if (!hasContent) return;

    const formatted = formatSummary(summary);
    return {
      systemPrompt: `${event.systemPrompt}

<session_summary>
${formatted}
</session_summary>`,
    };
  });

  pi.on("session_before_compact", async () => {
    persist();
  });

  pi.on("session_shutdown", async () => {
    persist();
  });
}
