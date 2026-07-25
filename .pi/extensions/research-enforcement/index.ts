import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import {
  categorizeDirectTool,
  classifyTurn,
  defaultConfig,
  evaluateCompliance,
  extractFabricCategories,
  isSuccessfulDirectResult,
  parseConfig,
  shapeMetrics,
  shapeSnapshot,
  validateCitation,
  type AggregateMetrics,
  type CitationState,
  type CorrectionStatus,
  type ProviderCategory,
  type ResearchEnforcementConfig,
  type ResearchTier,
  type TurnPhase,
  type TurnSnapshot,
} from "./policy.ts";

const ENTRY_TYPE = "research-enforcement/v1";
const CONFIG_FILE = "research-enforcement.json";

type PendingTool =
  | { kind: "fabric" }
  | { kind: "direct"; category: ProviderCategory; toolName: string };

interface RuntimeTurn {
  turnOrdinal: number;
  tier: ResearchTier;
  optedOut: boolean;
  phase: TurnPhase;
  providerCategories: Set<ProviderCategory>;
  citation: CitationState;
  correction: CorrectionStatus;
  guidanceInjected: boolean;
  finalSeen: boolean;
  firstOutcomeRecorded: boolean;
}

interface InputLike {
  source?: unknown;
}

interface BeforeAgentStartLike {
  prompt?: unknown;
}

interface ToolCallLike {
  toolCallId?: unknown;
  toolName?: unknown;
  input?: unknown;
}

interface ToolResultLike {
  toolCallId?: unknown;
  toolName?: unknown;
  input?: unknown;
  content?: unknown;
  isError?: unknown;
  details?: unknown;
}

interface MessageEndLike {
  message?: { role?: unknown; content?: unknown };
}

interface ContextLike {
  cwd?: string;
  isIdle(): boolean;
  hasPendingMessages(): boolean;
  isProjectTrusted?: () => boolean;
  sessionManager: {
    getEntries(): unknown[];
    getBranch?: () => unknown[];
  };
  ui: {
    notify(message: string, type?: "info" | "warning" | "error"): void;
  };
}

function emptyCitation(): CitationState {
  return {
    standardValid: false,
    highValid: false,
    referencedSourceCount: 0,
    missingCodes: [],
  };
}

function newTurn(turnOrdinal: number): RuntimeTurn {
  return {
    turnOrdinal,
    tier: "none",
    optedOut: false,
    phase: "collecting",
    providerCategories: new Set(),
    citation: emptyCitation(),
    correction: "eligible",
    guidanceInjected: false,
    finalSeen: false,
    firstOutcomeRecorded: false,
  };
}

function createMetrics(): AggregateMetrics {
  return {
    totalTurns: 0,
    researchTurns: 0,
    standardCompliant: 0,
    highCompliant: 0,
    correctionsDispatched: 0,
    correctionsSkipped: 0,
  };
}

function toSnapshot(turn: RuntimeTurn): TurnSnapshot {
  return shapeSnapshot({
    turnOrdinal: turn.turnOrdinal,
    tier: turn.tier,
    optedOut: turn.optedOut,
    phase: turn.phase,
    providerCategories: [...turn.providerCategories],
    citation: turn.citation,
    correction: turn.correction,
    guidanceInjected: turn.guidanceInjected,
    finalSeen: turn.finalSeen,
  });
}

function persistedSnapshot(turn: RuntimeTurn): Record<string, unknown> {
  return { version: 1, ...toSnapshot(turn) };
}

function isCategory(value: unknown): value is ProviderCategory {
  return ["context7", "exa", "codex-search", "xai-web-search"].includes(
    value as ProviderCategory,
  );
}

function isTier(value: unknown): value is ResearchTier {
  return value === "none" || value === "standard" || value === "high";
}

function isCorrection(value: unknown): value is CorrectionStatus {
  return [
    "eligible",
    "attempted",
    "dispatched",
    "skipped-pending-input",
    "skipped-busy",
    "dispatch-failed",
  ].includes(value as CorrectionStatus);
}

function restoreTurn(data: unknown, fallbackOrdinal: number): RuntimeTurn | null {
  if (!data || typeof data !== "object") return null;
  const value = data as Record<string, unknown>;
  if (value.version !== 1 || !isTier(value.tier) || !isCorrection(value.correction)) return null;
  const restored = newTurn(
    typeof value.turnOrdinal === "number" && Number.isInteger(value.turnOrdinal)
      ? value.turnOrdinal
      : fallbackOrdinal,
  );
  restored.tier = value.tier;
  restored.optedOut = value.optedOut === true;
  restored.phase = value.phase === "collecting" || value.phase === "awaiting-settled" ||
    value.phase === "correcting" || value.phase === "settled"
    ? value.phase
    : "settled";
  restored.correction = value.correction;
  restored.guidanceInjected = value.guidanceInjected === true;
  restored.finalSeen = value.finalSeen === true;
  if (Array.isArray(value.providerCategories)) {
    for (const category of value.providerCategories) {
      if (isCategory(category)) restored.providerCategories.add(category);
    }
  }
  if (value.citation && typeof value.citation === "object") {
    const citation = value.citation as Record<string, unknown>;
    restored.citation = {
      standardValid: citation.standardValid === true,
      highValid: citation.highValid === true,
      referencedSourceCount:
        typeof citation.referencedSourceCount === "number" ? citation.referencedSourceCount : 0,
      missingCodes: Array.isArray(citation.missingCodes)
        ? citation.missingCodes.filter((code): code is string => typeof code === "string")
        : [],
    };
  }
  return restored;
}

function activeEntries(ctx: ContextLike): unknown[] {
  const branch = ctx.sessionManager.getBranch?.();
  return Array.isArray(branch) ? branch : ctx.sessionManager.getEntries();
}

function restoreLatest(ctx: ContextLike, fallbackOrdinal: number): RuntimeTurn | null {
  const entries = activeEntries(ctx);
  for (let index = entries.length - 1; index >= 0; index--) {
    const entry = entries[index];
    if (!entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    if (value.type !== "custom" || value.customType !== ENTRY_TYPE) continue;
    const restored = restoreTurn(value.data, fallbackOrdinal);
    if (restored) return restored;
  }
  return null;
}

async function configDirName(): Promise<string> {
  try {
    const module = await import("@earendil-works/pi-coding-agent");
    if (typeof module.CONFIG_DIR_NAME === "string" && module.CONFIG_DIR_NAME.length > 0) {
      return module.CONFIG_DIR_NAME;
    }
  } catch {
    // Plain-Node contract tests do not resolve Pi's global package. Project scope is .pi.
  }
  return ".pi";
}

async function loadConfig(ctx: ContextLike): Promise<ResearchEnforcementConfig> {
  if (typeof ctx.isProjectTrusted === "function" && !ctx.isProjectTrusted()) {
    return defaultConfig();
  }
  try {
    const directory = await configDirName();
    const raw = await readFile(join(ctx.cwd ?? process.cwd(), directory, CONFIG_FILE), "utf8");
    return parseConfig(JSON.parse(raw));
  } catch {
    return defaultConfig();
  }
}

function terminalAnswer(content: unknown): string | null {
  if (typeof content === "string") {
    return content.trim().length > 0 ? content : null;
  }
  if (!Array.isArray(content) || content.length === 0) return null;
  const parts: string[] = [];
  for (const item of content) {
    if (!item || typeof item !== "object") return null;
    const block = item as { type?: unknown; text?: unknown };
    if (block.type !== "text" || typeof block.text !== "string") return null;
    parts.push(block.text);
  }
  const text = parts.join("\n");
  return text.trim().length > 0 ? text : null;
}

function guidance(tier: ResearchTier, config: ResearchEnforcementConfig): string {
  const routes = config.providers.map((provider) => provider.label).join(", ");
  if (tier === "high") {
    return `Research enforcement: use at least two independent sources via ${routes}. ` +
      "Return ## Findings bullets with [S<n>] markers and matching ## Sources entries.";
  }
  return `Research enforcement: use an authoritative source via ${routes} and cite it.`;
}

function correctionMessage(turn: RuntimeTurn): string {
  const missing = turn.citation.missingCodes.length > 0
    ? turn.citation.missingCodes.join(", ")
    : "research evidence or citation";
  return turn.tier === "high"
    ? `Research-enforcement correction: the prior answer lacks ${missing}. ` +
        "Use two independent provider categories and return Findings with [S<n>] plus Sources."
    : `Research-enforcement correction: the prior answer lacks ${missing}. ` +
        "Use one authoritative research provider and include a citation/source.";
}

export default function researchEnforcement(pi: ExtensionAPI): void {
  let config = defaultConfig();
  let turn = newTurn(0);
  let pendingExternalInputs = 0;
  const pendingTools = new Map<string, PendingTool>();
  const metrics = createMetrics();

  const appendState = (): void => {
    pi.appendEntry(ENTRY_TYPE, persistedSnapshot(turn));
  };

  const restore = async (ctx: ContextLike): Promise<void> => {
    config = await loadConfig(ctx);
    pendingTools.clear();
    pendingExternalInputs = 0;
    const restored = restoreLatest(ctx, turn.turnOrdinal);
    if (restored) turn = restored;
  };

  pi.on("session_start", async (_event, ctx) => {
    await restore(ctx as ContextLike);
  });

  pi.on("session_tree", async (_event, ctx) => {
    await restore(ctx as ContextLike);
  });

  pi.on("input", (event) => {
    const source = (event as InputLike).source;
    if (source === "interactive" || source === "rpc") pendingExternalInputs++;
  });

  pi.on("before_agent_start", (event) => {
    if (pendingExternalInputs > 0) {
      pendingExternalInputs--;
      turn = newTurn(turn.turnOrdinal + 1);
      metrics.totalTurns++;
      const classification = classifyTurn(
        typeof (event as BeforeAgentStartLike).prompt === "string"
          ? (event as BeforeAgentStartLike).prompt as string
          : "",
      );
      turn.tier = classification.tier;
      turn.optedOut = classification.optedOut;
      if (turn.tier !== "none") metrics.researchTurns++;
    } else if (turn.correction === "attempted") {
      turn.phase = "correcting";
      return;
    } else {
      return;
    }
    if (!config.enabled || turn.tier === "none" || turn.optedOut) return;
    turn.guidanceInjected = true;
    return {
      message: {
        customType: ENTRY_TYPE,
        content: guidance(turn.tier, config),
        display: true,
        details: { tier: turn.tier },
      },
    };
  });

  pi.on("tool_call", (event) => {
    const value = event as ToolCallLike;
    if (typeof value.toolCallId !== "string" || typeof value.toolName !== "string") return;
    if (value.toolName === "fabric_exec") {
      pendingTools.set(value.toolCallId, { kind: "fabric" });
      return;
    }
    const category = categorizeDirectTool(config, {
      toolName: value.toolName,
      input: value.input && typeof value.input === "object"
        ? value.input as Record<string, unknown>
        : {},
      isError: false,
      content: [],
    });
    if (category) {
      pendingTools.set(value.toolCallId, { kind: "direct", category, toolName: value.toolName });
    }
  });

  pi.on("tool_result", (event) => {
    const value = event as ToolResultLike;
    if (typeof value.toolCallId !== "string") return;
    const pending = pendingTools.get(value.toolCallId);
    pendingTools.delete(value.toolCallId);
    if (!pending) return;
    if (pending.kind === "fabric") {
      for (const category of extractFabricCategories(config, value.details)) {
        turn.providerCategories.add(category);
      }
      return;
    }
    const content = Array.isArray(value.content)
      ? value.content as Array<{ type: string; text?: string }>
      : [];
    if (isSuccessfulDirectResult({
      toolName: pending.toolName,
      input: {},
      isError: value.isError === true,
      content,
    })) {
      turn.providerCategories.add(pending.category);
    }
  });

  pi.on("message_end", (event) => {
    const message = (event as MessageEndLike).message;
    if (!message || message.role !== "assistant") return;
    const answer = terminalAnswer(message.content);
    if (answer === null) return;
    turn.citation = validateCitation(answer, config);
    turn.finalSeen = true;
    turn.phase = "awaiting-settled";
  });

  pi.on("agent_settled", (_event, ctx) => {
    if (!config.enabled || turn.tier === "none" || turn.optedOut || !turn.finalSeen) return;
    if (turn.correction !== "eligible") return;
    const compliance = evaluateCompliance(
      config,
      turn.tier,
      [...turn.providerCategories],
      turn.citation,
    );
    if (!turn.firstOutcomeRecorded) {
      turn.firstOutcomeRecorded = true;
      if (compliance.compliant) {
        if (turn.tier === "standard") metrics.standardCompliant++;
        if (turn.tier === "high") metrics.highCompliant++;
      }
    }
    if (compliance.compliant) {
      turn.phase = "settled";
      return;
    }
    const context = ctx as ContextLike;
    if (context.hasPendingMessages()) {
      turn.correction = "skipped-pending-input";
      turn.phase = "settled";
      metrics.correctionsSkipped++;
      appendState();
      return;
    }
    if (!context.isIdle()) {
      turn.correction = "skipped-busy";
      turn.phase = "settled";
      metrics.correctionsSkipped++;
      appendState();
      return;
    }
    turn.correction = "attempted";
    turn.phase = "correcting";
    appendState();
    try {
      pi.sendMessage(
        {
          customType: ENTRY_TYPE,
          content: correctionMessage(turn),
          display: true,
          details: { tier: turn.tier },
        },
        { deliverAs: "followUp", triggerTurn: true },
      );
      turn.correction = "dispatched";
      metrics.correctionsDispatched++;
    } catch {
      turn.correction = "dispatch-failed";
      turn.phase = "settled";
      appendState();
    }
  });

  pi.registerCommand("research-status", {
    description: "Show research-enforcement metadata for the current turn",
    handler: (_args, ctx) => {
      const snapshot = toSnapshot(turn);
      const categories = snapshot.providerCategories.length > 0
        ? snapshot.providerCategories.join(",")
        : "none";
      (ctx as ContextLike).ui.notify(
        `research tier=${snapshot.tier} categories=${categories} correction=${snapshot.correction}`,
        "info",
      );
    },
  });

  pi.registerCommand("research-metrics", {
    description: "Show metadata-only research-enforcement counters",
    handler: (_args, ctx) => {
      const value = shapeMetrics(metrics);
      (ctx as ContextLike).ui.notify(
        `research turns=${value.totalTurns} required=${value.researchTurns} ` +
          `standard-ok=${value.standardCompliant} high-ok=${value.highCompliant} ` +
          `corrections=${value.correctionsDispatched} skipped=${value.correctionsSkipped}`,
        "info",
      );
    },
  });
}