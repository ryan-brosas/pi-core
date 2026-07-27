import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { realpath } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { promisify } from "node:util";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const execFile = promisify(execFileCallback);
const ENTRY_TYPE = "workspace-receipt/v1";
const SUMMARY_MAX = 240;
const ITEM_MAX = 240;
const PATH_MAX = 64;
const CHECK_MAX = 32;
const RISK_MAX = 32;

export type ReceiptStatus = "completed" | "partial" | "blocked";

export interface ProjectIdentity {
  projectId: string;
  name: string;
  root: string;
  branch: string;
}

export interface ReceiptInput {
  projectId: string;
  timestamp: string;
  status: ReceiptStatus;
  summary: string;
  changedPaths: string[];
  checks: Array<{ label: string; passed: boolean }>;
  risks: string[];
}

export interface WorkspaceReceipt extends ReceiptInput {
  version: 1;
}

interface WorkspaceContext {
  cwd: string;
  sessionManager: {
    getBranch(): unknown[];
  };
  ui: {
    notify(message: string, type?: "info" | "warning" | "error"): void;
    setStatus?(key: string, value: string | undefined): void;
  };
}

const RECEIPT_PARAMETERS = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: {
      type: "string",
      enum: ["completed", "partial", "blocked"],
      description: "Outcome of the bounded work",
    },
    summary: {
      type: "string",
      maxLength: SUMMARY_MAX,
      description: "Short outcome summary without prompts, reasoning, credentials, or logs",
    },
    changedPaths: {
      type: "array",
      maxItems: PATH_MAX,
      items: { type: "string", maxLength: ITEM_MAX },
      description: "Owned paths changed by the work",
    },
    checks: {
      type: "array",
      maxItems: CHECK_MAX,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string", maxLength: ITEM_MAX },
          passed: { type: "boolean" },
        },
        required: ["label", "passed"],
      },
      description: "Bounded verification outcomes, never full command output",
    },
    risks: {
      type: "array",
      maxItems: RISK_MAX,
      items: { type: "string", maxLength: ITEM_MAX },
      description: "Remaining bounded risks",
    },
  },
  required: ["status", "summary", "changedPaths", "checks", "risks"],
} as const;

function normalizeText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const compact = value.trim().replace(/\s+/g, " ");
  if (/\b(prompt|tool\s*output|tooloutput|full\s*log|hidden\s*reasoning|reasoning)\b\s*[:=]/i.test(compact)) {
    return "[redacted raw content]";
  }
  const redacted = compact
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----.*$/gi, "[redacted credential]")
    .replace(/\bauthorization\b\s*[:=]\s*.*$/gi, "authorization=[redacted]")
    .replace(/\b(password|passwd|token|api[_-]?key|secret)\b\s*[:=]\s*.*$/gi, "$1=[redacted]")
    .replace(/\bbearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/\b(?:sk|pk|ghp|github_pat|xox[baprs])[-_][A-Za-z0-9_-]{6,}\b/g, "[redacted]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted]");
  return redacted.slice(0, max).trimEnd();
}

function boundedStrings(value: unknown, maxItems: number): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const item of value) {
    const normalized = normalizeText(item, ITEM_MAX);
    if (normalized) seen.add(normalized);
    if (seen.size >= maxItems) break;
  }
  return [...seen].sort((left, right) => left.localeCompare(right));
}

function validStatus(value: unknown): value is ReceiptStatus {
  return value === "completed" || value === "partial" || value === "blocked";
}

function canonicalTimestamp(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function git(cwd: string, args: string[]): Promise<string> {
  const result = await execFile("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    timeout: 5_000,
  });
  return result.stdout.trim();
}

/** Resolve a stable identity from the real Git root containing the supplied cwd. */
export async function resolveProjectIdentity(cwd: string): Promise<ProjectIdentity> {
  const actualCwd = await realpath(resolve(cwd));
  let root = actualCwd;
  let branch = "no-git";
  try {
    root = await realpath(await git(actualCwd, ["rev-parse", "--show-toplevel"]));
    branch = await git(root, ["branch", "--show-current"]);
    if (!branch) {
      const head = await git(root, ["rev-parse", "--short", "HEAD"]).catch(() => "unknown");
      branch = `detached@${head}`;
    }
  } catch {
    // Non-Git directories still receive a stable path identity without changing cwd.
  }
  return {
    projectId: createHash("sha256").update(root).digest("hex").slice(0, 24),
    name: basename(root) || root,
    root,
    branch,
  };
}

/** Keep only the bounded, versioned metadata allowed in a workspace receipt. */
export function shapeReceipt(input: ReceiptInput): WorkspaceReceipt {
  const projectId = normalizeText(input?.projectId, 64);
  const timestamp = canonicalTimestamp(input?.timestamp);
  const summary = normalizeText(input?.summary, SUMMARY_MAX);
  if (!projectId || !timestamp || !validStatus(input?.status) || !summary) {
    throw new TypeError("workspace receipt requires project identity, timestamp, status, and summary");
  }
  const checks = Array.isArray(input.checks)
    ? input.checks.slice(0, CHECK_MAX).flatMap((check) => {
        const label = normalizeText(check?.label, ITEM_MAX);
        return label ? [{ label, passed: check?.passed === true }] : [];
      })
    : [];
  return {
    version: 1,
    projectId,
    timestamp,
    status: input.status,
    summary,
    changedPaths: boundedStrings(input.changedPaths, PATH_MAX),
    checks,
    risks: boundedStrings(input.risks, RISK_MAX),
  };
}

const RECEIPT_KEYS = new Set([
  "version",
  "projectId",
  "timestamp",
  "status",
  "summary",
  "changedPaths",
  "checks",
  "risks",
]);

function isCanonicalStringArray(
  value: unknown,
  maxItems: number,
): value is string[] {
  if (!Array.isArray(value) || value.length > maxItems) return false;
  if (!value.every((item) => typeof item === "string" && item.length > 0 &&
      item.length <= ITEM_MAX && normalizeText(item, ITEM_MAX) === item)) return false;
  return JSON.stringify(value) === JSON.stringify(boundedStrings(value, maxItems));
}

function isCanonicalCheckArray(
  value: unknown,
): value is Array<{ label: string; passed: boolean }> {
  if (!Array.isArray(value) || value.length > CHECK_MAX) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const check = item as Record<string, unknown>;
    const keys = Object.keys(check);
    return keys.length === 2 && keys.every((key) => key === "label" || key === "passed") &&
      typeof check.label === "string" && check.label.length > 0 &&
      check.label.length <= ITEM_MAX && normalizeText(check.label, ITEM_MAX) === check.label &&
      typeof check.passed === "boolean";
  });
}

function parseReceipt(data: unknown, projectId: string): WorkspaceReceipt | null {
  if (!data || typeof data !== "object") return null;
  const value = data as Record<string, unknown>;
  const keys = Object.keys(value);
  if (keys.length !== RECEIPT_KEYS.size || keys.some((key) => !RECEIPT_KEYS.has(key))) return null;
  if (value.version !== 1 || value.projectId !== projectId ||
      typeof value.projectId !== "string" || value.projectId.length === 0 ||
      value.projectId.length > 64 || normalizeText(value.projectId, 64) !== value.projectId ||
      !validStatus(value.status)) return null;
  if (typeof value.timestamp !== "string" || canonicalTimestamp(value.timestamp) !== value.timestamp ||
      typeof value.summary !== "string" || value.summary.length === 0 ||
      value.summary.length > SUMMARY_MAX || normalizeText(value.summary, SUMMARY_MAX) !== value.summary ||
      !isCanonicalStringArray(value.changedPaths, PATH_MAX) ||
      !isCanonicalCheckArray(value.checks) ||
      !isCanonicalStringArray(value.risks, RISK_MAX)) return null;
  return {
    version: 1,
    projectId: value.projectId,
    timestamp: value.timestamp,
    status: value.status,
    summary: value.summary,
    changedPaths: value.changedPaths,
    checks: value.checks,
    risks: value.risks,
  };
}

/** Restore receipts from an already selected active session branch. */
export function restoreProjectReceipts(
  entries: unknown[],
  projectId: string,
): WorkspaceReceipt[] {
  const receipts: WorkspaceReceipt[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    if (value.type !== "custom" || value.customType !== ENTRY_TYPE) continue;
    const receipt = parseReceipt(value.data, projectId);
    if (receipt) receipts.push(receipt);
  }
  return receipts.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}

function formatReceipts(identity: ProjectIdentity, receipts: WorkspaceReceipt[]): string {
  if (receipts.length === 0) return `${identity.name}: no receipts`;
  const lines = receipts.map((receipt) =>
    `${receipt.timestamp} ${receipt.status} ${receipt.summary || "(no summary)"}`,
  );
  return [`${identity.name} receipts (${receipts.length})`, ...lines].join("\n");
}

export default function workspaceExtension(pi: ExtensionAPI): void {
  let receipts: WorkspaceReceipt[] = [];

  const refresh = async (ctx: WorkspaceContext): Promise<ProjectIdentity> => {
    const identity = await resolveProjectIdentity(ctx.cwd);
    receipts = restoreProjectReceipts(ctx.sessionManager.getBranch(), identity.projectId);
    ctx.ui.setStatus?.(
      "workspace",
      `${identity.name}:${identity.branch} receipts=${receipts.length}`,
    );
    return identity;
  };

  pi.on("session_start", async (_event, ctx) => {
    await refresh(ctx as WorkspaceContext).catch(() => {
      (ctx as WorkspaceContext).ui.setStatus?.("workspace", "workspace unavailable");
    });
  });

  pi.on("session_tree", async (_event, ctx) => {
    await refresh(ctx as WorkspaceContext).catch(() => {
      (ctx as WorkspaceContext).ui.setStatus?.("workspace", "workspace unavailable");
    });
  });

  pi.registerTool({
    name: "workspace_receipt",
    label: "Workspace Receipt",
    description: "Persist one metadata-only receipt after meaningful work. Never include prompts, hidden reasoning, credentials, tool arguments/results, or full logs.",
    parameters: RECEIPT_PARAMETERS,
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const current = await refresh(ctx as WorkspaceContext);
      const input = params as Omit<ReceiptInput, "projectId" | "timestamp">;
      const receipt = shapeReceipt({
        projectId: current.projectId,
        timestamp: new Date().toISOString(),
        status: input.status,
        summary: input.summary,
        changedPaths: input.changedPaths,
        checks: input.checks,
        risks: input.risks,
      });
      pi.appendEntry(ENTRY_TYPE, receipt);
      receipts.push(receipt);
      receipts.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
      (ctx as WorkspaceContext).ui.setStatus?.(
        "workspace",
        `${current.name}:${current.branch} receipts=${receipts.length}`,
      );
      return {
        content: [{ type: "text", text: `Recorded workspace receipt for ${current.name}` }],
      };
    },
  });

  pi.registerCommand("workspace", {
    description: "Show compact current-project workspace context",
    handler: async (_args, ctx) => {
      const current = await refresh(ctx as WorkspaceContext);
      (ctx as WorkspaceContext).ui.notify(
        `${current.name} branch=${current.branch} receipts=${receipts.length}`,
        "info",
      );
    },
  });

  pi.registerCommand("receipts", {
    description: "Show active-branch workspace receipts chronologically",
    handler: async (_args, ctx) => {
      const current = await refresh(ctx as WorkspaceContext);
      (ctx as WorkspaceContext).ui.notify(formatReceipts(current, receipts), "info");
    },
  });
}
