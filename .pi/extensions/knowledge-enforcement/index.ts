import { resolve } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import {
  applyActivity,
  classifyObservedScope,
  extractFabricActivity,
  hasGraphEditReceipt,
  isMutatingShellCommand,
  type ActivityEvidence,
  type ActivityObservation,
  type ScopeClassification,
} from "./policy.ts";

const ENTRY_TYPE = "knowledge-enforcement/v2";
const MODEL = "openai-codex/gpt-5.6-sol";

interface RuntimeTask {
  ordinal: number;
  evidence: ActivityEvidence;
  scope: ScopeClassification;
  graphReady: boolean;
  graphUnavailable: boolean;
  graphWaived: boolean;
  fallbackSourceSeen: boolean;
  fallbackVerificationSeen: boolean;
  completionWaived: boolean;
  completionRounds: number;
  completionFollowUpStarted: boolean;
  completionState: "eligible" | "dispatched" | "skipped" | "failed" | "exhausted" | "reported";
  launchState: "eligible" | "dispatched" | "skipped" | "failed";
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

function emptyEvidence(): ActivityEvidence {
  return {
    inspectedPaths: [],
    mutatedPaths: [],
    exemplarPaths: [],
    verificationCount: 0,
    diffInspectionCount: 0,
    graphHealthCount: 0,
    graphImpactCount: 0,
    graphSourceVerificationCount: 0,
    mutationSeen: false,
    verificationAfterMutation: false,
    diffAfterMutation: false,
  };
}

function newTask(ordinal: number): RuntimeTask {
  return {
    ordinal,
    evidence: emptyEvidence(),
    scope: { mode: "none", reasons: [] },
    graphReady: false,
    graphUnavailable: false,
    graphWaived: false,
    fallbackSourceSeen: false,
    fallbackVerificationSeen: false,
    completionWaived: false,
    completionRounds: 0,
    completionFollowUpStarted: false,
    completionState: "eligible",
    launchState: "eligible",
  };
}

function graphStatus(task: RuntimeTask): string {
  if (task.graphWaived) return "waived";
  if (task.graphReady) return "ready";
  if (task.graphUnavailable && task.fallbackSourceSeen && task.fallbackVerificationSeen) {
    return "fallback-ready";
  }
  return task.graphUnavailable ? "fallback-required" : "required";
}

function completionStatus(task: RuntimeTask): string {
  if (task.completionWaived) return "waived";
  if (!task.evidence.mutationSeen) return "not-needed";
  if (task.evidence.verificationAfterMutation && task.evidence.diffAfterMutation) return "ready";
  if (task.completionState === "dispatched") return "correction-sent";
  if (task.completionState === "exhausted" || task.completionState === "reported") return "unresolved";
  return task.completionState === "eligible" ? "required" : task.completionState;
}

function applyTaskActivity(task: RuntimeTask, observations: ActivityObservation[]): void {
  const mutationObserved = observations.some((observation) =>
    observation.kind === "mutate" || observation.kind === "mutation-attempt"
  );
  task.evidence = applyActivity(task.evidence, observations);
  if (mutationObserved && task.completionState === "dispatched") {
    task.completionState = task.completionRounds < 2 ? "eligible" : "exhausted";
  }
}

function applyFallbackActivity(task: RuntimeTask, observations: ActivityObservation[]): void {
  for (const observation of [...observations].sort((a, b) => a.sequence - b.sequence)) {
    if (observation.kind === "graph-unavailable") {
      task.graphUnavailable = true;
      task.fallbackSourceSeen = false;
      task.fallbackVerificationSeen = false;
      continue;
    }
    if (!task.graphUnavailable) continue;
    if (observation.kind === "inspect") task.fallbackSourceSeen = true;
    if (observation.kind === "verify") task.fallbackVerificationSeen = true;
  }
}

function graphGateReason(): string {
  return "Mutation blocked: graph=required. Prefer Project Intelligence: run project_health for an active-project index, " +
    "find_relevant_code with up to 3 exact symbol/keyword searchTerms, then analyze_impact for a task-relevant " +
    "relationship; verify the selected hit in source. Raw CodeGraphContext is the fallback. If the graph is unavailable, " +
    "let the failed probe finish, then inspect source and run fail-fast verification. A user may explicitly waive the " +
    "graph gate. Run /knowledge-status to inspect readiness.";
}

function fabricCode(input: unknown): string {
  if (!input || typeof input !== "object") return "";
  const code = (input as { code?: unknown }).code;
  return typeof code === "string" ? code : "";
}

const PI_MUTATOR_ACCESS = String.raw`pi\s*(?:\.\s*(?:edit|write)|\[\s*["'](?:edit|write)["']\s*\])`;

function requestsFabricMutation(input: unknown): boolean {
  const code = fabricCode(input);
  if (new RegExp(String.raw`\b${PI_MUTATOR_ACCESS}\s*\(`).test(code)) return true;

  const aliases = new Set<string>();
  const assignment = new RegExp(
    String.raw`\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*${PI_MUTATOR_ACCESS}`,
    "g",
  );
  for (const match of code.matchAll(assignment)) aliases.add(match[1]);

  const destructuring = /\b(?:const|let|var)\s*\{([^}]*)\}\s*=\s*pi\b/g;
  for (const match of code.matchAll(destructuring)) {
    for (const field of match[1].split(",")) {
      const parsed = field.trim().match(/^(edit|write)(?:\s*:\s*([A-Za-z_$][\w$]*))?$/);
      if (parsed) aliases.add(parsed[2] ?? parsed[1]);
    }
  }

  return [...aliases].some((alias) => new RegExp(String.raw`\b${alias}\s*\(`).test(code));
}

function shellCommand(input: unknown): string {
  if (!input || typeof input !== "object") return "";
  const value = input as Record<string, unknown>;
  const command = value.command ?? value.cmd;
  return typeof command === "string" ? command : "";
}

function requestsFabricShellMutation(input: unknown): boolean {
  const code = fabricCode(input);
  const callsBash = /\bpi\s*(?:\.\s*bash|\[\s*["']bash["']\s*\])\s*\(/.test(code);
  return callsBash && isMutatingShellCommand(code);
}

function requestsGraphHealth(input: unknown): boolean {
  const code = fabricCode(input);
  return /\b(?:mcp\.)?codegraphcontext\.(?:get_repository_stats|find_code)\s*\(/.test(code) ||
    /\bmcp\.pi_core_intelligence\.(?:project_context|project_health|find_relevant_code)\s*\(/.test(code) ||
    /["']mcp\.codegraphcontext\.(?:get_repository_stats|find_code)["']/.test(code) ||
    /["']mcp\.pi-core-intelligence\.(?:project_context|project_health|find_relevant_code)["']/.test(code);
}

function directMutationPath(input: unknown, cwd: string): string | null {
  if (!input || typeof input !== "object") return null;
  const path = (input as { path?: unknown }).path;
  return typeof path === "string" && path.length > 0 ? resolve(cwd, path) : null;
}

function explicitlyWaivesGraph(prompt: unknown): boolean {
  return typeof prompt === "string" &&
    /\b(?:waive|skip|bypass|do not use)\b[^\n]{0,80}\b(?:code[- ]?graph|mcp graph|graph gate)\b/i.test(prompt);
}

function explicitlyWaivesCompletion(prompt: unknown): boolean {
  return typeof prompt === "string" &&
    /\b(?:waive|skip|bypass|do not require)\b[^\n]{0,80}\b(?:completion gate|post-edit verification|verification gate)\b/i.test(prompt);
}

function completionDirective(task: RuntimeTask): string {
  const missing: string[] = [];
  if (!task.evidence.verificationAfterMutation) missing.push("post-edit verification");
  if (!task.evidence.diffAfterMutation) missing.push("owned diff inspection");
  return `Knowledge completion gate: mutation observed without ${missing.join(" and ")}. ` +
    "Run the narrowest applicable verification, inspect the owned diff, address failures, and then report observed results.";
}

function supervisorDirective(task: RuntimeTask): string {
  const reasonText = task.scope.reasons.join(", ");
  return `Knowledge supervision required for observed ${task.scope.mode} scope (${reasonText}).\n\n` +
    "Main: run one fabric_exec program now to create or reconfigure these three task-scoped Fabric actors: " +
    "a grounding supervisor, verification supervisor, and deslop supervisor. Use stable names " +
    "knowledge-grounding, knowledge-verification, and knowledge-deslop; remove stale actors with those " +
    "names before recreation. Configure every actor with runner=pi, model=" + MODEL +
    ", thinking=high, events=[input,agent_settled,tool_error], responseMode=directive, delivery=steer, " +
    "triggerTurn=true, coalesce=true, extensions=false, and read-only tools=[read,grep,find,ls]. " +
    "Use the standard latest-activation validWhile guard. On a new external input (interactive or RPC) after " +
    "creation, return action=stop immediately so supervision cannot leak into another task.\n\n" +
    "Role contracts:\n" +
    "- Grounding supervisor: check that the result internalizes relevant existing code and project practices " +
    "without surface copying; require target-native seams and names.\n" +
    "- Verification supervisor: check observable behavior, controlled failure, applicable tests, and scope.\n" +
    "- Deslop supervisor: check duplication, bloat, unnecessary wrappers, and reference-shaped architecture.\n\n" +
    "Each supervisor is advisory and read-only. Main makes the final decision and automatically addresses " +
    "material findings within the authorized task scope. Each actor may issue at most two remediation rounds; " +
    "on compliance return {action:\"stop\"} to auto-teardown, and after the second unresolved intervention " +
    "return one final unresolved message with action=stop. Do not recreate a stopped supervisor for this task.";
}

export default function knowledgeEnforcement(pi: ExtensionAPI): void {
  let enabled = true;
  let pendingExternalInputs = 0;
  let task = newTask(0);
  const pendingFabric = new Map<string, {
    ordinal: number;
    graphHealthAttempted: boolean;
    mutationAttempted: boolean;
  }>();
  const pendingDirect = new Map<string, { ordinal: number; path: string | null }>();

  const resetRuntime = (ctx: ContextLike): void => {
    enabled = typeof ctx.isProjectTrusted !== "function" || ctx.isProjectTrusted();
    pendingExternalInputs = 0;
    pendingFabric.clear();
    pendingDirect.clear();
    task = newTask(task.ordinal);
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
    const prompt = (event as BeforeAgentStartLike).prompt;
    if (pendingExternalInputs === 0) {
      if (task.completionState === "dispatched" && typeof prompt === "string" &&
        prompt.startsWith("Knowledge completion gate:")) {
        task.completionFollowUpStarted = true;
      }
      return;
    }
    pendingExternalInputs--;
    pendingFabric.clear();
    pendingDirect.clear();
    task = newTask(task.ordinal + 1);
    task.graphWaived = explicitlyWaivesGraph(prompt);
    task.completionWaived = explicitlyWaivesCompletion(prompt);
    const context = ctx as ContextLike;
    enabled = typeof context.isProjectTrusted !== "function" || context.isProjectTrusted();
  });

  pi.on("tool_call", (event, ctx) => {
    const value = event as ToolCallLike;
    if (!enabled || typeof value.toolName !== "string" || typeof value.toolCallId !== "string") return;
    const directMutation = value.toolName === "edit" || value.toolName === "write" ||
      (value.toolName === "bash" && isMutatingShellCommand(shellCommand(value.input)));
    const fabricMutation = value.toolName === "fabric_exec" &&
      (requestsFabricMutation(value.input) || requestsFabricShellMutation(value.input));
    const fallbackReady = task.graphUnavailable && task.fallbackSourceSeen &&
      task.fallbackVerificationSeen;
    if ((directMutation || fabricMutation) && !task.graphReady && !task.graphWaived && !fallbackReady) {
      return { block: true, reason: graphGateReason() };
    }
    if (directMutation) {
      pendingDirect.set(value.toolCallId, {
        ordinal: task.ordinal,
        path: directMutationPath(value.input, (ctx as ContextLike).cwd ?? process.cwd()),
      });
    }
    if (value.toolName === "fabric_exec") {
      pendingFabric.set(value.toolCallId, {
        ordinal: task.ordinal,
        graphHealthAttempted: requestsGraphHealth(value.input),
        mutationAttempted: fabricMutation,
      });
    }
  });

  pi.on("tool_result", (event, ctx) => {
    const value = event as ToolResultLike;
    if (typeof value.toolCallId !== "string") return;
    const direct = pendingDirect.get(value.toolCallId);
    pendingDirect.delete(value.toolCallId);
    if (direct && direct.ordinal === task.ordinal) {
      const observation: ActivityObservation = direct.path
        ? { kind: "mutate", path: direct.path, sequence: 0 }
        : { kind: "mutation-attempt", sequence: 0 };
      applyTaskActivity(task, [observation]);
      task.scope = classifyObservedScope(task.evidence);
      return;
    }
    const pending = pendingFabric.get(value.toolCallId);
    pendingFabric.delete(value.toolCallId);
    if (pending === undefined || pending.ordinal !== task.ordinal) return;
    if (value.isError === true) {
      if (pending.graphHealthAttempted) {
        task.graphUnavailable = true;
        task.fallbackSourceSeen = false;
        task.fallbackVerificationSeen = false;
      }
      if (pending.mutationAttempted) {
        applyTaskActivity(task, [{ kind: "mutation-attempt", sequence: 0 }]);
      }
      return;
    }
    const observations = extractFabricActivity(
      value.details,
      (ctx as ContextLike).cwd ?? process.cwd(),
    );
    applyTaskActivity(task, observations);
    applyFallbackActivity(task, observations);
    task.graphReady = hasGraphEditReceipt(task.evidence);
    task.scope = classifyObservedScope(task.evidence);
  });

  pi.on("agent_settled", (_event, ctx) => {
    if (!enabled) return;
    const context = ctx as ContextLike;
    const completionMissing = task.evidence.mutationSeen && !task.completionWaived &&
      (!task.evidence.verificationAfterMutation || !task.evidence.diffAfterMutation);
    if (completionMissing) {
      if (task.completionState === "dispatched" && task.completionFollowUpStarted) {
        task.completionFollowUpStarted = false;
        task.completionState = task.completionRounds < 2 ? "eligible" : "exhausted";
      }
      if (task.completionState === "exhausted") {
        context.ui.notify(
          "Knowledge completion gate unresolved after two correction rounds. " +
            "Report the missing verification or diff proof as a blocker.",
          "warning",
        );
        task.completionState = "reported";
        return;
      }
      if (task.completionState === "eligible") {
        if (context.hasPendingMessages() || !context.isIdle()) {
          task.completionState = "skipped";
          return;
        }
        task.completionState = "dispatched";
        try {
          pi.sendMessage(
            {
              customType: ENTRY_TYPE,
              content: completionDirective(task),
              display: true,
              details: { taskOrdinal: task.ordinal, mode: "completion-gate" },
            },
            { deliverAs: "followUp", triggerTurn: true },
          );
          task.completionRounds++;
          task.completionFollowUpStarted = false;
        } catch {
          task.completionState = "failed";
        }
      }
      return;
    }
    if (task.scope.mode === "none" || task.launchState !== "eligible") return;
    if (context.hasPendingMessages() || !context.isIdle()) {
      task.launchState = "skipped";
      return;
    }
    task.launchState = "dispatched";
    try {
      pi.sendMessage(
        {
          customType: ENTRY_TYPE,
          content: supervisorDirective(task),
          display: true,
          details: {
            taskOrdinal: task.ordinal,
            mode: task.scope.mode,
            reasons: task.scope.reasons,
            model: MODEL,
          },
        },
        { deliverAs: "followUp", triggerTurn: true },
      );
    } catch {
      task.launchState = "failed";
    }
  });

  pi.registerCommand("knowledge-status", {
    description: "Show graph, completion, and supervision readiness for the current task",
    handler: (_args, ctx) => {
      if (!enabled) {
        (ctx as ContextLike).ui.notify("knowledge disabled=untrusted-project", "warning");
        return;
      }
      (ctx as ContextLike).ui.notify(
        `knowledge mode=${task.scope.mode} reasons=${task.scope.reasons.join(",") || "none"} ` +
          `inspected=${task.evidence.inspectedPaths.length} mutated=${task.evidence.mutatedPaths.length} ` +
          `verified=${task.evidence.verificationCount} graph=${graphStatus(task)} ` +
          `completion=${completionStatus(task)} launched=${task.launchState === "dispatched"}`,
        "info",
      );
    },
  });
}
