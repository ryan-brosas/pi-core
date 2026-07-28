import type { BuildSystemPromptOptions, ExtensionAPI } from "@earendil-works/pi-coding-agent";

import {
  applyObservations,
  classifyTurn,
  evaluateCompliance,
  extractFabricObservations,
  matchSkills,
  type GroundingEvidence,
  type SkillDescriptor,
} from "./policy.ts";

const ENTRY_TYPE = "knowledge-enforcement/v1";

type CorrectionStatus = "eligible" | "dispatched" | "skipped" | "failed";

interface RuntimeTurn {
  ordinal: number;
  required: boolean;
  optedOut: boolean;
  matchedSkills: SkillDescriptor[];
  evidence: GroundingEvidence;
  correction: CorrectionStatus;
}

interface InputLike {
  source?: unknown;
}

interface BeforeAgentStartLike {
  prompt?: unknown;
  systemPromptOptions?: BuildSystemPromptOptions;
}

interface ToolCallLike {
  toolCallId?: unknown;
  toolName?: unknown;
}

interface ToolResultLike {
  toolCallId?: unknown;
  isError?: unknown;
  details?: unknown;
}

interface ContextLike {
  cwd?: string;
  isIdle(): boolean;
  hasPendingMessages(): boolean;
  isProjectTrusted?: () => boolean;
  sessionManager: { getBranch(): unknown[] };
  ui: { notify(message: string, type?: "info" | "warning" | "error"): void };
}

function emptyEvidence(): GroundingEvidence {
  return {
    skillReads: [],
    exemplarReads: [],
    mutationSeen: false,
    groundingBeforeMutation: false,
  };
}

function newTurn(ordinal: number): RuntimeTurn {
  return {
    ordinal,
    required: false,
    optedOut: false,
    matchedSkills: [],
    evidence: emptyEvidence(),
    correction: "eligible",
  };
}

function toSkillDescriptors(options: BuildSystemPromptOptions | undefined): SkillDescriptor[] {
  if (!Array.isArray(options?.skills)) return [];
  return options.skills
    .filter((skill) => typeof skill.name === "string" && typeof skill.description === "string" &&
      typeof skill.filePath === "string")
    .map((skill) => ({
      name: skill.name,
      description: skill.description,
      filePath: skill.filePath,
    }));
}

function guidance(turn: RuntimeTurn): string {
  const specialist = turn.matchedSkills.length > 0
    ? turn.matchedSkills.map((skill) => `${skill.name} (${skill.filePath})`).join(", ")
    : "no high-confidence specialist match; use the relevant available skill if one applies";
  return "Knowledge enforcement: before editing or writing code, read the matched skill(s) completely " +
    `and inspect one to three closest working exemplars. Matched: ${specialist}. ` +
    "Extract the invariant, mechanism, target seam, failure boundary, and exclusions privately; then " +
    "rewrite target-natively rather than copying surface structure. Use focused reads to protect context.";
}

function correctionMessage(turn: RuntimeTurn, missing: string[]): string {
  const specialist = turn.matchedSkills.map((skill) => skill.name).join(", ") || "none matched";
  return `Knowledge-enforcement correction: mutation occurred without ${missing.join(", ")}. ` +
    `Matched skills: ${specialist}. Pause further mutation, read the matched skill and a relevant ` +
    "working exemplar, extract its invariant and failure boundary, re-read the owned diff, then adapt " +
    "the change target-natively. Do not copy the exemplar's surface structure; rerun behavior and " +
    "duplication checks afterward.";
}

export default function knowledgeEnforcement(pi: ExtensionAPI): void {
  let enabled = true;
  let pendingExternalInputs = 0;
  let turn = newTurn(0);
  const pendingFabric = new Map<string, number>();

  const resetRuntime = (ctx: ContextLike): void => {
    enabled = typeof ctx.isProjectTrusted !== "function" || ctx.isProjectTrusted();
    pendingExternalInputs = 0;
    pendingFabric.clear();
    turn = newTurn(turn.ordinal);
  };

  pi.on("session_start", (_event, ctx) => {
    resetRuntime(ctx as ContextLike);
  });

  pi.on("session_tree", (_event, ctx) => {
    resetRuntime(ctx as ContextLike);
  });

  pi.on("input", (event) => {
    const source = (event as InputLike).source;
    if (source === "interactive" || source === "rpc") pendingExternalInputs++;
  });

  pi.on("before_agent_start", (event, ctx) => {
    if (pendingExternalInputs === 0) return;
    pendingExternalInputs--;
    pendingFabric.clear();
    turn = newTurn(turn.ordinal + 1);
    const value = event as BeforeAgentStartLike;
    const prompt = typeof value.prompt === "string" ? value.prompt : "";
    const classification = classifyTurn(prompt);
    turn.required = classification.required;
    turn.optedOut = classification.optedOut;
    turn.matchedSkills = matchSkills(prompt, toSkillDescriptors(value.systemPromptOptions));
    const context = ctx as ContextLike;
    enabled = typeof context.isProjectTrusted !== "function" || context.isProjectTrusted();
    if (!enabled || !turn.required || turn.optedOut) return;
    return {
      message: {
        customType: ENTRY_TYPE,
        content: guidance(turn),
        display: true,
        details: { matchedSkills: turn.matchedSkills.map((skill) => skill.name) },
      },
    };
  });

  pi.on("tool_call", (event) => {
    const value = event as ToolCallLike;
    if (!enabled || !turn.required || value.toolName !== "fabric_exec" ||
      typeof value.toolCallId !== "string") return;
    pendingFabric.set(value.toolCallId, turn.ordinal);
  });

  pi.on("tool_result", (event, ctx) => {
    const value = event as ToolResultLike;
    if (typeof value.toolCallId !== "string") return;
    const owner = pendingFabric.get(value.toolCallId);
    pendingFabric.delete(value.toolCallId);
    if (owner === undefined || owner !== turn.ordinal || value.isError === true) return;
    const observations = extractFabricObservations(
      value.details,
      (ctx as ContextLike).cwd ?? process.cwd(),
      turn.matchedSkills,
    );
    turn.evidence = applyObservations(turn.evidence, observations, turn.matchedSkills);
  });

  pi.on("agent_settled", (_event, ctx) => {
    if (!enabled || !turn.required || turn.optedOut || turn.correction !== "eligible") return;
    const compliance = evaluateCompliance(turn.required, turn.matchedSkills, turn.evidence);
    if (compliance.compliant) return;
    const context = ctx as ContextLike;
    if (!context.isIdle() || context.hasPendingMessages()) {
      turn.correction = "skipped";
      return;
    }
    turn.correction = "dispatched";
    try {
      pi.sendMessage(
        {
          customType: ENTRY_TYPE,
          content: correctionMessage(turn, compliance.missing),
          display: true,
          details: { missing: compliance.missing },
        },
        { deliverAs: "followUp", triggerTurn: true },
      );
    } catch {
      turn.correction = "failed";
    }
  });

  pi.registerCommand("knowledge-status", {
    description: "Show reference-grounding evidence for the current turn",
    handler: (_args, ctx) => {
      (ctx as ContextLike).ui.notify(
        `knowledge required=${turn.required} matched=${turn.matchedSkills.length} ` +
          `skills-read=${turn.evidence.skillReads.length} exemplars=${turn.evidence.exemplarReads.length} ` +
          `mutation=${turn.evidence.mutationSeen} correction=${turn.correction}`,
        "info",
      );
    },
  });
}
