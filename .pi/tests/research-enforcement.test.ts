/**
 * Research-Enforcement Extension — focused contract tests.
 *
 * task-1 (this file): Lock the approved policy and lifecycle contracts in an
 * intentional RED state. A static import of the absent policy module makes the
 * focused run fail with ERR_MODULE_NOT_FOUND for policy.ts, not a syntax or
 * harness error. Lifecycle tests keep index.ts behind a dynamic import so that
 * task-2 policy work can become GREEN before index.ts exists.
 *
 * Every test name begins with "research enforcement <group>:" so the task-2
 * verification pattern (classification|evidence|citation|config|privacy|trace)
 * selects only policy tests, and the task-3 pattern
 * (correction|status|scope|direct|Fabric) selects only lifecycle tests.
 */

import assert from "node:assert/strict";
import test from "node:test";

// Static policy import — causes the intended RED when policy.ts is absent.
import {
  classifyTurn,
  defaultConfig,
  parseConfig,
  categorizeDirectTool,
  isSuccessfulDirectResult,
  extractFabricCategories,
  evaluateCompliance,
  validateCitation,
  shapeSnapshot,
  shapeMetrics,
} from "../extensions/research-enforcement/policy.ts";

// Type-only imports are erased by strip-types and never trigger module resolution.
import type {
  ResearchTier,
  ProviderCategory,
  CorrectionStatus,
  TurnClassification,
  ResearchEnforcementConfig,
  DirectToolObservation,
  CitationState,
  ComplianceResult,
  TurnSnapshot,
  AggregateMetrics,
} from "../extensions/research-enforcement/policy.ts";

// ============================================================
// Local test types — strong, public-shaped, no blanket escape hatches
// ============================================================

type TextContentItem = { type: "text"; text: string };
type ToolCallContentItem = { type: "toolCall"; id: string; name: string; arguments: Record<string, unknown> };
type AssistantContentItem = TextContentItem | ToolCallContentItem;
type InputSource = "interactive" | "rpc" | "extension";

interface InputEventPayload {
  type: "input";
  text: string;
  source: InputSource;
  streamingBehavior?: "steer" | "followUp";
}

interface BeforeAgentStartPayload {
  type: "before_agent_start";
  prompt: string;
  systemPrompt: string;
  systemPromptOptions: Record<string, unknown>;
}

interface ToolCallPayload {
  type: "tool_call";
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
}

interface ToolResultPayload {
  type: "tool_result";
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
  content: TextContentItem[];
  isError: boolean;
  details: unknown;
}

interface MessageEndPayload {
  type: "message_end";
  message: { role: string; content: AssistantContentItem[] };
}

interface SessionStartPayload {
  type: "session_start";
  reason: "startup" | "reload" | "new" | "resume" | "fork";
  previousSessionFile?: string;
}

interface SessionTreePayload {
  type: "session_tree";
  newLeafId: string | null;
  oldLeafId: string | null;
}

interface FakeSessionEntry {
  type: string;
  customType?: string;
  data?: unknown;
}

interface FakeExtensionContext {
  isIdle(): boolean;
  hasPendingMessages(): boolean;
  sessionManager: { getEntries(): FakeSessionEntry[] };
  ui: {
    notify(message: string, type?: string): void;
    setStatus(key: string, text: string | undefined): void;
  };
  mode: string;
  hasUI: boolean;
  cwd: string;
  getSystemPrompt(): string;
}

interface FakeSendMessage {
  customType: string;
  content: string;
  display: boolean;
  details?: unknown;
}

interface FakeSendOptions {
  triggerTurn?: boolean;
  deliverAs?: string;
}

interface FakeOperation {
  kind: "appendEntry" | "sendMessage";
  customType?: string;
  data?: unknown;
  message?: FakeSendMessage;
  options?: FakeSendOptions;
}

interface FakeCommandOptions {
  description?: string;
  handler: (args: string, ctx: FakeExtensionContext) => Promise<void> | void;
}

type FakeHandler = (event: unknown, ctx: FakeExtensionContext) => unknown;

interface FakeExtensionApi {
  on(event: string, handler: FakeHandler): void;
  registerCommand(name: string, options: FakeCommandOptions): void;
  sendMessage(message: FakeSendMessage, options?: FakeSendOptions): void;
  appendEntry(customType: string, data?: unknown): void;
  getAllTools(): { name: string }[];
  getActiveTools(): string[];
  setActiveTools(names: string[]): void;
}

interface FakeHarness {
  api: FakeExtensionApi;
  handlers: Map<string, FakeHandler>;
  commands: Map<string, FakeCommandOptions>;
  operations: FakeOperation[];
  notifications: { message: string; type?: string }[];
  activeToolsLog: string[][];
  ctx: FakeExtensionContext;
}

interface FakeHarnessOptions {
  idle?: boolean;
  pendingMessages?: boolean;
  entries?: FakeSessionEntry[];
  sendMessageThrows?: boolean;
}

interface ExtensionModule {
  default: (api: FakeExtensionApi) => void | Promise<void>;
}

// ============================================================
// Fixture builders
// ============================================================

function textContent(text = "non-empty result"): TextContentItem[] {
  return [{ type: "text", text }];
}

function directObservation(
  toolName: string,
  opts: { input?: Record<string, unknown>; isError?: boolean; content?: TextContentItem[] } = {},
): DirectToolObservation {
  return {
    toolName,
    input: opts.input ?? {},
    isError: opts.isError ?? false,
    content: opts.content ?? textContent(),
  };
}

function inputEvent(text: string, source: InputSource = "interactive"): InputEventPayload {
  return { type: "input", text, source };
}

function beforeAgentStartEvent(prompt: string): BeforeAgentStartPayload {
  return { type: "before_agent_start", prompt, systemPrompt: "", systemPromptOptions: {} };
}

function toolCallEvent(toolCallId: string, toolName: string, input: Record<string, unknown> = {}): ToolCallPayload {
  return { type: "tool_call", toolCallId, toolName, input };
}

function toolResultEvent(
  toolCallId: string,
  toolName: string,
  isError: boolean,
  content: TextContentItem[],
  details?: unknown,
): ToolResultPayload {
  return { type: "tool_result", toolCallId, toolName, input: {}, content, isError, details };
}

function messageEndEvent(text: string): MessageEndPayload {
  return { type: "message_end", message: { role: "assistant", content: [{ type: "text", text }] } };
}

function toolCallingMessageEndEvent(withPrelude: boolean): MessageEndPayload {
  const toolCall: ToolCallContentItem = {
    type: "toolCall",
    id: "call-1",
    name: "context7.query-docs",
    arguments: {},
  };
  return {
    type: "message_end",
    message: {
      role: "assistant",
      content: withPrelude ? [{ type: "text", text: "I will check." }, toolCall] : [toolCall],
    },
  };
}

/** Build a Fabric persisted execution details envelope (Trace V1) for trace tests. */
function fabricTrace(
  operations: Array<{ ref: string; outcome: string }>,
  opts: { success?: boolean; kind?: string; version?: number; traceOutcome?: string } = {},
): unknown {
  return {
    success: opts.success ?? true,
    trace: {
      kind: opts.kind ?? "pi-fabric.execution",
      version: opts.version ?? 1,
      outcome: opts.traceOutcome ?? "succeeded",
      phases: [],
      operations: operations.map((op, i) => ({
        type: "call" as const,
        sequence: i + 1,
        ref: op.ref,
        outcome: op.outcome,
        args: {},
      })),
      counts: { droppedValues: 0, truncatedValues: 0, redactedValues: 0, droppedOperations: 0 },
    },
  };
}

function validStandardCitation(): CitationState {
  return { standardValid: true, highValid: false, referencedSourceCount: 1, missingCodes: [] };
}

function validHighCitation(): CitationState {
  return { standardValid: true, highValid: true, referencedSourceCount: 2, missingCodes: [] };
}

function invalidCitation(): CitationState {
  return { standardValid: false, highValid: false, referencedSourceCount: 0, missingCodes: ["citation"] };
}

const HIGH_CITATION_VALID = [
  "## Findings",
  "- Node 24 is the latest release [S1]",
  "- It ships new features [S2]",
  "",
  "## Sources",
  "[S1] https://nodejs.org",
  "[S2] https://nodejs.org/blog",
].join("\n");

const HIGH_CITATION_UNRESOLVED = [
  "## Findings",
  "- Node 24 is the latest release [S1]",
  "",
  "## Sources",
  "[S2] https://nodejs.org/blog",
].join("\n");

const HIGH_CITATION_NO_MARKER = [
  "## Findings",
  "- Node 24 is the latest release",
  "",
  "## Sources",
  "[S1] https://nodejs.org",
].join("\n");

const HIGH_CITATION_DUPLICATE = [
  "## Findings",
  "- Node 24 [S1]",
  "",
  "## Sources",
  "[S1] https://nodejs.org",
  "[S1] https://nodejs.org/blog",
].join("\n");

const HIGH_CITATION_MARKER_ONLY = [
  "## Findings",
  "- Node 24 [S1]",
  "",
  "## Sources",
  "[S1]",
].join("\n");

/** A config input that matches the built-in default exactly. */
function validConfigInput(): unknown {
  return {
    version: 1,
    enabled: true,
    providers: [
      { category: "context7", label: "Context7", directToolNames: ["context7.query-docs"], fabricRefs: ["mcp.context7.query-docs"], authoritative: true, independentForHigh: true },
      { category: "exa", label: "Exa", directToolNames: ["exa.web_search_exa", "exa.web_fetch_exa"], fabricRefs: ["mcp.exa.web_search_exa", "mcp.exa.web_fetch_exa"], authoritative: true, independentForHigh: true },
      { category: "codex-search", label: "Codex Search", directToolNames: ["codex_search"], fabricRefs: ["extensions.codex_search"], authoritative: true, independentForHigh: true },
      { category: "xai-web-search", label: "xAI Web Search", directToolNames: ["xai_grok_web_search"], fabricRefs: ["extensions.xai_grok_web_search"], authoritative: true, independentForHigh: true },
      { category: "scout", label: "Scout", directToolNames: ["Agent"], fabricRefs: [], authoritative: true, independentForHigh: false },
    ],
    authoritativeSourceIdentifiers: [],
    standardCategoryCount: 1,
    highCategoryCount: 2,
    maxCorrections: 1,
  };
}

function snapshotFixture(opts: Partial<TurnSnapshot> = {}): TurnSnapshot {
  return {
    turnOrdinal: 1,
    tier: "standard",
    optedOut: false,
    phase: "settled",
    providerCategories: ["context7"],
    citation: validStandardCitation(),
    correction: "dispatched",
    guidanceInjected: true,
    finalSeen: true,
    ...opts,
  };
}

function metricsFixture(opts: Partial<AggregateMetrics> = {}): AggregateMetrics {
  return {
    totalTurns: 3,
    researchTurns: 2,
    standardCompliant: 1,
    highCompliant: 0,
    correctionsDispatched: 1,
    correctionsSkipped: 0,
    ...opts,
  };
}

// ============================================================
// Fake Pi lifecycle harness
// ============================================================

function createHarness(opts: FakeHarnessOptions = {}): FakeHarness {
  const handlers = new Map<string, FakeHandler>();
  const commands = new Map<string, FakeCommandOptions>();
  const operations: FakeOperation[] = [];
  const notifications: { message: string; type?: string }[] = [];
  const activeToolsLog: string[][] = [];

  const ctx: FakeExtensionContext = {
    isIdle: () => opts.idle ?? true,
    hasPendingMessages: () => opts.pendingMessages ?? false,
    sessionManager: { getEntries: () => opts.entries ?? [] },
    ui: {
      notify: (message, type) => { notifications.push({ message, type }); },
      setStatus: () => {},
    },
    mode: "rpc",
    hasUI: false,
    cwd: "/test",
    getSystemPrompt: () => "",
  };

  const api: FakeExtensionApi = {
    on: (event, handler) => { handlers.set(event, handler); },
    registerCommand: (name, options) => { commands.set(name, options); },
    sendMessage: (message, options) => {
      if (opts.sendMessageThrows) throw new Error("dispatch failed");
      operations.push({ kind: "sendMessage", message, options });
    },
    appendEntry: (customType, data) => { operations.push({ kind: "appendEntry", customType, data }); },
    getAllTools: () => [],
    getActiveTools: () => [],
    setActiveTools: (names) => { activeToolsLog.push(names); },
  };

  return { api, handlers, commands, operations, notifications, activeToolsLog, ctx };
}

async function emit(h: FakeHarness, event: string, payload: unknown): Promise<unknown> {
  const handler = h.handlers.get(event);
  if (!handler) return undefined;
  return await handler(payload, h.ctx);
}

async function setup(opts: FakeHarnessOptions = {}): Promise<FakeHarness> {
  const h = createHarness(opts);
  const mod: ExtensionModule = await import("../extensions/research-enforcement/index.ts");
  await mod.default(h.api);
  return h;
}

async function runCommand(h: FakeHarness, name: string, args = ""): Promise<void> {
  const cmd = h.commands.get(name);
  assert.ok(cmd, `command /${name} must be registered`);
  await cmd.handler(args, h.ctx);
}

function countSends(h: FakeHarness): number {
  return h.operations.filter((op) => op.kind === "sendMessage").length;
}

function countAppends(h: FakeHarness): number {
  return h.operations.filter((op) => op.kind === "appendEntry").length;
}

function lastAppendData(h: FakeHarness): unknown {
  const appends = h.operations.filter((op) => op.kind === "appendEntry");
  return appends[appends.length - 1]?.data;
}

function statusText(h: FakeHarness): string {
  return h.notifications.map((n) => n.message).join("\n");
}

/** Simulate a full noncompliant standard turn (no research, no citation). */
async function runNoncompliantTurn(h: FakeHarness, prompt = "What is the current Node version?"): Promise<void> {
  await emit(h, "input", inputEvent(prompt));
  await emit(h, "before_agent_start", beforeAgentStartEvent(prompt));
  await emit(h, "message_end", messageEndEvent("The answer is 24 without any source."));
  await emit(h, "agent_settled", { type: "agent_settled" });
}

// ============================================================
// Classification contracts
// ============================================================

test("research enforcement classification: local code edits classify as none", () => {
  const result: TurnClassification = classifyTurn("Refactor the auth module to use async/await");
  assert.equal(result.tier, "none");
  assert.equal(result.optedOut, false);
});

test("research enforcement classification: mechanical transformations classify as none", () => {
  const result = classifyTurn("Convert this JSON to YAML: {a: 1, b: 2}");
  assert.equal(result.tier, "none");
  assert.equal(result.optedOut, false);
});

test("research enforcement classification: local security and health-check edits remain none", () => {
  assert.equal(classifyTurn("Fix the security test in this module").tier, "none");
  assert.equal(classifyTurn("Refactor the health check function").tier, "none");
});

test("research enforcement classification: explicit research request classifies as standard", () => {
  const result = classifyTurn("Search the web for the latest release notes");
  assert.equal(result.tier, "standard");
});

test("research enforcement classification: current information request classifies as standard", () => {
  const result = classifyTurn("What is the current version of TypeScript?");
  assert.equal(result.tier, "standard");
});

test("research enforcement classification: high-consequence external claims classify as high", () => {
  for (const prompt of [
    "What are the legal requirements for GDPR compliance?",
    "Is this medication safe to take during pregnancy?",
    "What are the tax implications of this investment strategy?",
    "What are the security best practices for mitigating this CVE?",
  ]) {
    assert.equal(classifyTurn(prompt).tier, "high", prompt);
  }
});

test("research enforcement classification: external library claims classify as standard", () => {
  const result = classifyTurn("What does the lodash API look like for the debounce function?");
  assert.equal(result.tier, "standard");
});

test("research enforcement classification: explicit opt-out overrides the research tier", () => {
  const result = classifyTurn("What is the latest React version? Do not search the web.");
  assert.equal(result.optedOut, true);
  assert.equal(result.tier, "none");
});

test("research enforcement classification: sensitive mechanical transformations classify as none", () => {
  assert.equal(classifyTurn("Summarize this medical note for me").tier, "none");
  assert.equal(classifyTurn("Translate this legal paragraph into plain English").tier, "none");
  assert.equal(classifyTurn("Analyze the financial statement I provided").tier, "none");
  assert.equal(classifyTurn("Review this security report I pasted below").tier, "none");
  assert.equal(classifyTurn("Summarize this medical note: current medications listed below").tier, "none");
  assert.equal(classifyTurn("Translate this legal paragraph about the latest regulation").tier, "none");
});

test("research enforcement classification: sensitive mechanical with external research stays high", () => {
  assert.equal(
    classifyTurn("Analyze the latest security vulnerabilities reported this week").tier,
    "high",
  );
  assert.equal(
    classifyTurn("Summarize this medical note and research current drug interactions").tier,
    "high",
  );
});

test("research enforcement classification: bare offline does not override explicit research", () => {
  const result = classifyTurn("Research offline-first libraries");
  assert.equal(result.tier, "standard");
  assert.equal(result.optedOut, false);
});

test("research enforcement classification: explicit do not browse remains opted out", () => {
  const result = classifyTurn("Research offline-first libraries but do not browse the web");
  assert.equal(result.optedOut, true);
  assert.equal(result.tier, "none");
});

// ============================================================
// Strict configuration contracts
// ============================================================

test("research enforcement config: default config defines exact provider categories and refs", () => {
  const config = defaultConfig();
  assert.equal(config.version, 1);
  assert.equal(config.enabled, true);
  assert.equal(config.standardCategoryCount, 1);
  assert.equal(config.highCategoryCount, 2);
  assert.equal(config.maxCorrections, 1);

  const byCategory = new Map(config.providers.map((p) => [p.category, p]));

  const context7 = byCategory.get("context7");
  assert.ok(context7);
  assert.deepEqual([...context7.directToolNames], ["context7.query-docs"]);
  assert.deepEqual([...context7.fabricRefs], ["mcp.context7.query-docs"]);
  assert.equal(context7.authoritative, true);
  assert.equal(context7.independentForHigh, true);

  const exa = byCategory.get("exa");
  assert.ok(exa);
  assert.deepEqual([...exa.directToolNames], ["exa.web_search_exa", "exa.web_fetch_exa"]);
  assert.deepEqual([...exa.fabricRefs], ["mcp.exa.web_search_exa", "mcp.exa.web_fetch_exa"]);

  const codex = byCategory.get("codex-search");
  assert.ok(codex);
  assert.deepEqual([...codex.directToolNames], ["codex_search"]);
  assert.deepEqual([...codex.fabricRefs], ["extensions.codex_search"]);

  const xai = byCategory.get("xai-web-search");
  assert.ok(xai);
  assert.deepEqual([...xai.directToolNames], ["xai_grok_web_search"]);
  assert.deepEqual([...xai.fabricRefs], ["extensions.xai_grok_web_search"]);

  const scout = byCategory.get("scout");
  assert.ok(scout);
  assert.deepEqual([...scout.directToolNames], ["Agent"]);
  assert.deepEqual([...scout.fabricRefs], []);
  assert.equal(scout.independentForHigh, false);
});

test("research enforcement config: valid version one config parses with exact providers", () => {
  const config = parseConfig(validConfigInput());
  assert.equal(config.version, 1);
  assert.equal(config.enabled, true);
  assert.equal(config.providers.length, 5);
  assert.deepEqual(
    config.providers.map((p) => p.category),
    ["context7", "exa", "codex-search", "xai-web-search", "scout"],
  );
});

test("research enforcement config: unknown keys fall back to the complete default", () => {
  const input = validConfigInput() as Record<string, unknown>;
  input.unknownKey = true;
  assert.deepEqual(parseConfig(input), defaultConfig());
});

test("research enforcement config: duplicate categories fall back to the complete default", () => {
  const input = validConfigInput() as { providers: unknown[] };
  input.providers = [...input.providers, input.providers[0]];
  assert.deepEqual(parseConfig(input), defaultConfig());
});

test("research enforcement config: wildcard refs fall back to the complete default", () => {
  const input = validConfigInput() as { providers: Array<{ fabricRefs: string[] }> };
  input.providers[0].fabricRefs = ["mcp.context7.*"];
  assert.deepEqual(parseConfig(input), defaultConfig());
});

test("research enforcement config: unsupported version falls back to the complete default", () => {
  const input = validConfigInput() as { version: number };
  input.version = 2;
  assert.deepEqual(parseConfig(input), defaultConfig());
});

// ============================================================
// Evidence contracts
// ============================================================

test("research enforcement evidence: standard requires one successful authoritative category", () => {
  const config = defaultConfig();
  const ok = evaluateCompliance(config, "standard", ["context7"], validStandardCitation());
  assert.equal(ok.compliant, true);
  const missing = evaluateCompliance(config, "standard", [], validStandardCitation());
  assert.equal(missing.compliant, false);
});

test("research enforcement evidence: none tier requires no provider categories", () => {
  const config = defaultConfig();
  const result = evaluateCompliance(config, "none", [], invalidCitation());
  assert.equal(result.compliant, true);
});

test("research enforcement evidence: failed results do not satisfy evidence", () => {
  assert.equal(isSuccessfulDirectResult(directObservation("context7.query-docs", { isError: true })), false);
});

test("research enforcement evidence: empty results do not satisfy evidence", () => {
  assert.equal(isSuccessfulDirectResult(directObservation("context7.query-docs", { content: [] })), false);
  assert.equal(
    isSuccessfulDirectResult(directObservation("context7.query-docs", { content: textContent("   ") })),
    false,
  );
});

test("research enforcement evidence: duplicate categories deduplicate to one", () => {
  const config = defaultConfig();
  const result = evaluateCompliance(config, "standard", ["context7", "context7"], validStandardCitation());
  assert.equal(result.categoryCount, 1);
  assert.equal(result.compliant, true);
});

test("research enforcement evidence: high requires two independent categories", () => {
  const config = defaultConfig();
  const ok = evaluateCompliance(config, "high", ["context7", "exa"], validHighCitation());
  assert.equal(ok.compliant, true);
  assert.equal(ok.independentCategoryCount, 2);
  const dup = evaluateCompliance(config, "high", ["context7", "context7"], validHighCitation());
  assert.equal(dup.independentCategoryCount, 1);
  assert.equal(dup.compliant, false);
});

test("research enforcement evidence: scout is not independent for high", () => {
  const config = defaultConfig();
  const result = evaluateCompliance(config, "high", ["scout", "context7"], validHighCitation());
  assert.equal(result.independentCategoryCount, 1);
  assert.equal(result.compliant, false);
});

test("research enforcement evidence: context7 resolve-library-id does not count as evidence", () => {
  const config = defaultConfig();
  assert.equal(categorizeDirectTool(config, directObservation("context7.resolve-library-id")), null);
});

test("research enforcement evidence: xai_grok_web_search counts as one category", () => {
  const config = defaultConfig();
  assert.equal(categorizeDirectTool(config, directObservation("xai_grok_web_search")), "xai-web-search");
});

test("research enforcement evidence: Agent counts as scout only with scout subagent type", () => {
  const config = defaultConfig();
  assert.equal(categorizeDirectTool(config, directObservation("Agent", { input: { subagent_type: "scout" } })), "scout");
  assert.equal(categorizeDirectTool(config, directObservation("Agent", { input: { subagent_type: "build" } })), null);
  assert.equal(categorizeDirectTool(config, directObservation("Agent", { input: {} })), null);
});

// ============================================================
// Fabric trace contracts
// ============================================================

test("research enforcement trace: valid Fabric trace V1 maps exact successful refs", () => {
  const config = defaultConfig();
  const details = fabricTrace([{ ref: "mcp.context7.query-docs", outcome: "succeeded" }]);
  assert.deepEqual(extractFabricCategories(config, details), ["context7"]);
});

test("research enforcement trace: envelope missing success field is rejected", () => {
  const config = defaultConfig();
  const noSuccess = {
    trace: {
      kind: "pi-fabric.execution",
      version: 1,
      outcome: "succeeded",
      phases: [],
      operations: [{ type: "call", sequence: 1, ref: "mcp.context7.query-docs", outcome: "succeeded", args: {} }],
      counts: { droppedValues: 0, truncatedValues: 0, redactedValues: 0, droppedOperations: 0 },
    },
  };
  assert.deepEqual(extractFabricCategories(config, noSuccess), []);
});

test("research enforcement trace: wrong kind or version is rejected", () => {
  const config = defaultConfig();
  assert.deepEqual(extractFabricCategories(config, fabricTrace([], { kind: "other" })), []);
  assert.deepEqual(extractFabricCategories(config, fabricTrace([], { version: 2 })), []);
});

test("research enforcement trace: failed aborted or timed-out trace outcome is rejected", () => {
  const config = defaultConfig();
  assert.deepEqual(extractFabricCategories(config, fabricTrace([], { traceOutcome: "failed" })), []);
  assert.deepEqual(extractFabricCategories(config, fabricTrace([], { traceOutcome: "aborted" })), []);
  assert.deepEqual(extractFabricCategories(config, fabricTrace([], { traceOutcome: "timed_out" })), []);
});

test("research enforcement trace: failed operations do not contribute categories", () => {
  const config = defaultConfig();
  const details = fabricTrace([{ ref: "mcp.context7.query-docs", outcome: "failed" }]);
  assert.deepEqual(extractFabricCategories(config, details), []);
});

test("research enforcement trace: malformed successful operations do not contribute categories", () => {
  const config = defaultConfig();
  const details = fabricTrace([{ ref: "mcp.context7.query-docs", outcome: "succeeded" }]) as {
    trace: { operations: Array<Record<string, unknown>> };
  };
  delete details.trace.operations[0].type;
  assert.deepEqual(extractFabricCategories(config, details), []);
});

test("research enforcement trace: ambiguous nested extensions Agent does not count", () => {
  const config = defaultConfig();
  const details = fabricTrace([{ ref: "extensions.Agent", outcome: "succeeded" }]);
  assert.deepEqual(extractFabricCategories(config, details), []);
});

test("research enforcement trace: xai_grok_web_search Fabric ref counts after success", () => {
  const config = defaultConfig();
  const details = fabricTrace([{ ref: "extensions.xai_grok_web_search", outcome: "succeeded" }]);
  assert.deepEqual(extractFabricCategories(config, details), ["xai-web-search"]);
});

// ============================================================
// Citation contracts — standard
// ============================================================

test("research enforcement citation: standard accepts a bare HTTPS URL", () => {
  const config = defaultConfig();
  assert.equal(validateCitation("See https://example.com/docs for details", config).standardValid, true);
});

test("research enforcement citation: standard accepts a Markdown HTTPS link", () => {
  const config = defaultConfig();
  assert.equal(validateCitation("[docs](https://example.com/docs)", config).standardValid, true);
});

test("research enforcement citation: standard accepts a configured authoritative identifier", () => {
  const input = validConfigInput() as { authoritativeSourceIdentifiers: string[] };
  input.authoritativeSourceIdentifiers = ["man-pages:open(2)"];
  const config = parseConfig(input);
  assert.equal(validateCitation("Per man-pages:open(2) the call opens a file", config).standardValid, true);
});

test("research enforcement citation: standard rejects non-HTTPS and plain text", () => {
  const config = defaultConfig();
  assert.equal(validateCitation("I think this is correct without a source", config).standardValid, false);
  assert.equal(validateCitation("ftp://example.com/file", config).standardValid, false);
});

test("research enforcement citation: standard rejects malformed HTTPS-like strings", () => {
  const config = defaultConfig();
  assert.equal(validateCitation("See https://] for details", config).standardValid, false);
  assert.equal(validateCitation("See https://... for details", config).standardValid, false);
  assert.equal(validateCitation("See https://?token=secret for details", config).standardValid, false);
  assert.equal(validateCitation("See https:// for details", config).standardValid, false);
  assert.equal(validateCitation("See https://exa_mple.com", config).standardValid, false);
  assert.equal(validateCitation("See https://example..com", config).standardValid, false);
  assert.equal(validateCitation("See https://-example.com", config).standardValid, false);
  assert.equal(validateCitation("See https://example-.com", config).standardValid, false);
});

// ============================================================
// Citation contracts — high
// ============================================================

test("research enforcement citation: high accepts Findings and Sources with S markers", () => {
  const config = defaultConfig();
  const result = validateCitation(HIGH_CITATION_VALID, config);
  assert.equal(result.highValid, true);
  assert.deepEqual(result.missingCodes, []);
});

test("research enforcement citation: high rejects unresolved source markers", () => {
  const config = defaultConfig();
  const result = validateCitation(HIGH_CITATION_UNRESOLVED, config);
  assert.equal(result.highValid, false);
  assert.ok(result.missingCodes.includes("unresolved-marker"));
});

test("research enforcement citation: high rejects findings without markers", () => {
  const config = defaultConfig();
  const result = validateCitation(HIGH_CITATION_NO_MARKER, config);
  assert.equal(result.highValid, false);
  assert.ok(result.missingCodes.includes("finding-without-marker"));
});

test("research enforcement citation: high rejects duplicate source IDs", () => {
  const config = defaultConfig();
  const result = validateCitation(HIGH_CITATION_DUPLICATE, config);
  assert.equal(result.highValid, false);
  assert.ok(result.missingCodes.includes("duplicate-source-id"));
});

test("research enforcement citation: high rejects marker-only sources", () => {
  const config = defaultConfig();
  const result = validateCitation(HIGH_CITATION_MARKER_ONLY, config);
  assert.equal(result.highValid, false);
  assert.ok(result.missingCodes.includes("marker-only-source"));
});

// ============================================================
// Privacy contracts
// ============================================================

test("research enforcement privacy: snapshot excludes prompts answers URLs queries and credentials", () => {
  const snapshot = shapeSnapshot(snapshotFixture());
  const serialized = JSON.stringify(snapshot);
  assert.ok(!serialized.includes("https://"), "snapshot must not contain URLs");
  assert.ok(!serialized.includes("password"), "snapshot must not contain credentials");
  assert.ok(!serialized.includes("query:"), "snapshot must not contain queries");
  assert.ok(!serialized.includes("prompt"), "snapshot must not contain raw prompts");
  assert.equal((snapshot as { tier?: string }).tier, "standard");
  assert.equal((snapshot as { correction?: string }).correction, "dispatched");
});

test("research enforcement privacy: metrics exclude raw content and credentials", () => {
  const metrics = shapeMetrics(metricsFixture());
  const serialized = JSON.stringify(metrics);
  assert.ok(!serialized.includes("https://"), "metrics must not contain URLs");
  assert.ok(!serialized.includes("password"), "metrics must not contain credentials");
  assert.ok(!serialized.includes("prompt"), "metrics must not contain raw prompts");
  assert.equal((metrics as { totalTurns?: number }).totalTurns, 3);
  assert.equal((metrics as { correctionsDispatched?: number }).correctionsDispatched, 1);
});

// ============================================================
// Lifecycle contracts — direct observation and guidance
// ============================================================

test("research enforcement direct: extension injects route guidance for standard and high turns", async () => {
  let h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  let result = await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  assert.ok((result as { message?: unknown })?.message, "standard turn injects guidance");

  h = await setup();
  await emit(h, "input", inputEvent("What are the legal requirements for GDPR compliance?"));
  result = await emit(h, "before_agent_start", beforeAgentStartEvent("What are the legal requirements for GDPR compliance?"));
  assert.ok((result as { message?: unknown })?.message, "high turn injects guidance");
});

test("research enforcement direct: extension injects no guidance for none or opted-out turns", async () => {
  let h = await setup();
  await emit(h, "input", inputEvent("Refactor the auth module to use async/await"));
  let result = await emit(h, "before_agent_start", beforeAgentStartEvent("Refactor the auth module to use async/await"));
  assert.equal((result as { message?: unknown })?.message, undefined, "local turn injects no guidance");

  h = await setup();
  await emit(h, "input", inputEvent("What is the latest React version? Do not search the web."));
  result = await emit(h, "before_agent_start", beforeAgentStartEvent("What is the latest React version? Do not search the web."));
  assert.equal((result as { message?: unknown })?.message, undefined, "opted-out turn injects no guidance");
});

test("research enforcement direct: extension observes a successful context7 query", async () => {
  const h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  await emit(h, "tool_call", toolCallEvent("c1", "context7.query-docs"));
  await emit(h, "tool_result", toolResultEvent("c1", "context7.query-docs", false, textContent("Node 24 docs")));
  await runCommand(h, "research-status");
  assert.match(statusText(h), /context7/i);
});

test("research enforcement direct: extension observes a successful xai_grok_web_search call", async () => {
  const h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  await emit(h, "tool_call", toolCallEvent("c1", "xai_grok_web_search", { query: "node version" }));
  await emit(h, "tool_result", toolResultEvent("c1", "xai_grok_web_search", false, textContent("Node 24")));
  await runCommand(h, "research-status");
  assert.match(statusText(h), /xai/i);
});

test("research enforcement direct: failed result does not add a provider category", async () => {
  const h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  await emit(h, "tool_call", toolCallEvent("c1", "context7.query-docs"));
  await emit(h, "tool_result", toolResultEvent("c1", "context7.query-docs", true, textContent("error")));
  await runCommand(h, "research-status");
  assert.doesNotMatch(statusText(h), /context7/i);
});

// ============================================================
// Lifecycle contracts — Fabric-mediated observation
// ============================================================

test("research enforcement Fabric: extension reads valid Fabric record categories", async () => {
  const h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  await emit(h, "tool_call", toolCallEvent("f1", "fabric_exec"));
  await emit(h, "tool_result", toolResultEvent("f1", "fabric_exec", false, textContent("done"), fabricTrace([{ ref: "mcp.exa.web_search_exa", outcome: "succeeded" }])));
  await runCommand(h, "research-status");
  assert.match(statusText(h), /exa/i);
});

test("research enforcement Fabric: extension rejects a malformed Fabric record", async () => {
  const h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  await emit(h, "tool_call", toolCallEvent("f1", "fabric_exec"));
  await emit(h, "tool_result", toolResultEvent("f1", "fabric_exec", false, textContent("done"), fabricTrace([], { kind: "other" })));
  await runCommand(h, "research-status");
  assert.doesNotMatch(statusText(h), /exa/i);
});

test("research enforcement Fabric: extension never auto-enables xAI web search", async () => {
  const h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  await emit(h, "agent_settled", { type: "agent_settled" });
  for (const tools of h.activeToolsLog) {
    assert.ok(!tools.includes("xai_grok_web_search"), "extension must never auto-enable xAI web search");
  }
});

// ============================================================
// Lifecycle contracts — corrective pass
// ============================================================

test("research enforcement correction: intermediate tool-call messages do not trigger follow-up", async () => {
  for (const withPrelude of [false, true]) {
    const h = await setup();
    const prompt = "What is the current Node version?";
    await emit(h, "input", inputEvent(prompt));
    await emit(h, "before_agent_start", beforeAgentStartEvent(prompt));
    await emit(h, "message_end", toolCallingMessageEndEvent(withPrelude));
    await emit(h, "agent_settled", { type: "agent_settled" });
    assert.equal(countSends(h), 0, "an intermediate tool call is not a final answer");
  }
});

test("research enforcement correction: final text after a tool call remains eligible", async () => {
  const h = await setup();
  const prompt = "What is the current Node version?";
  await emit(h, "input", inputEvent(prompt));
  await emit(h, "before_agent_start", beforeAgentStartEvent(prompt));
  await emit(h, "message_end", toolCallingMessageEndEvent(true));
  await emit(h, "message_end", messageEndEvent("The answer is 24 without any source."));
  await emit(h, "agent_settled", { type: "agent_settled" });
  assert.equal(countSends(h), 1, "a later final answer is still evaluated");
});

test("research enforcement correction: compliant turn does not dispatch a follow-up", async () => {
  const h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  await emit(h, "tool_call", toolCallEvent("c1", "context7.query-docs"));
  await emit(h, "tool_result", toolResultEvent("c1", "context7.query-docs", false, textContent("Node 24 release notes")));
  await emit(h, "message_end", messageEndEvent("Node 24 is current. See https://nodejs.org"));
  await emit(h, "agent_settled", { type: "agent_settled" });
  assert.equal(countSends(h), 0);
});

test("research enforcement correction: noncompliant turn dispatches one labelled follow-up", async () => {
  const h = await setup();
  await runNoncompliantTurn(h);
  const sends = h.operations.filter((op) => op.kind === "sendMessage");
  assert.equal(sends.length, 1, "exactly one correction follow-up");
  const message = sends[0].message;
  assert.ok(message, "correction carries a message");
  assert.match(message!.customType, /research-enforcement/i);
  assert.match(message!.content, /research|evidence|citation|source|require/i);
  assert.equal((sends[0].options as { deliverAs?: string })?.deliverAs, "followUp");
  assert.equal((sends[0].options as { triggerTurn?: boolean })?.triggerTurn, true);
});

test("research enforcement correction: marker persists before dispatch", async () => {
  const h = await setup();
  await runNoncompliantTurn(h);
  const order = h.operations.map((op) => op.kind);
  const firstAppend = order.indexOf("appendEntry");
  const firstSend = order.indexOf("sendMessage");
  assert.notEqual(firstAppend, -1, "marker appended");
  assert.notEqual(firstSend, -1, "dispatch sent");
  assert.ok(firstAppend < firstSend, "marker must persist before dispatch");
  const marker = lastAppendData(h) as { correction?: string };
  assert.ok(marker?.correction === "attempted" || marker?.correction === "dispatched");
});

test("research enforcement correction: no second follow-up for the same turn", async () => {
  const h = await setup();
  await runNoncompliantTurn(h);
  assert.equal(countSends(h), 1);
  await emit(h, "agent_settled", { type: "agent_settled" });
  assert.equal(countSends(h), 1, "no second correction for the same turn");
});

test("research enforcement correction: pending user input skips the follow-up", async () => {
  const h = await setup({ pendingMessages: true });
  await runNoncompliantTurn(h);
  assert.equal(countSends(h), 0, "pending input skips correction");
  const marker = lastAppendData(h) as { correction?: string };
  assert.equal(marker?.correction, "skipped-pending-input");
});

test("research enforcement correction: busy session skips the follow-up", async () => {
  const h = await setup({ idle: false });
  await runNoncompliantTurn(h);
  assert.equal(countSends(h), 0, "busy session skips correction");
  const marker = lastAppendData(h) as { correction?: string };
  assert.equal(marker?.correction, "skipped-busy");
});

test("research enforcement correction: dispatch failure is recorded without retry", async () => {
  const h = await setup({ sendMessageThrows: true });
  await runNoncompliantTurn(h);
  const marker = lastAppendData(h) as { correction?: string };
  assert.equal(marker?.correction, "dispatch-failed");
  await emit(h, "agent_settled", { type: "agent_settled" });
  assert.equal(countSends(h), 0, "failed dispatch is never retried");
});

test("research enforcement correction: new user turn resets eligibility", async () => {
  const h = await setup();
  await runNoncompliantTurn(h);
  assert.equal(countSends(h), 1);
  await runNoncompliantTurn(h, "What is the current TypeScript version?");
  assert.equal(countSends(h), 2, "new user turn is eligible for correction");
});

test("research enforcement correction: only interactive and rpc input starts a new eligible turn", async () => {
  const h = await setup();
  await runNoncompliantTurn(h);
  assert.equal(countSends(h), 1);
  await emit(h, "input", inputEvent("follow-up", "extension"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("follow-up"));
  await emit(h, "message_end", messageEndEvent("still no source."));
  await emit(h, "agent_settled", { type: "agent_settled" });
  assert.equal(countSends(h), 1, "extension-sourced input does not reset correction eligibility");
});

// ============================================================
// Lifecycle contracts — status and metrics commands
// ============================================================

test("research enforcement status: research-status reports tier provider and correction state", async () => {
  const h = await setup();
  await emit(h, "input", inputEvent("What is the current Node version?"));
  await emit(h, "before_agent_start", beforeAgentStartEvent("What is the current Node version?"));
  await emit(h, "tool_call", toolCallEvent("c1", "context7.query-docs"));
  await emit(h, "tool_result", toolResultEvent("c1", "context7.query-docs", false, textContent("Node 24 docs")));
  await emit(h, "message_end", messageEndEvent("Node 24 is current. See https://nodejs.org"));
  await emit(h, "agent_settled", { type: "agent_settled" });
  await runCommand(h, "research-status");
  const status = statusText(h);
  assert.match(status, /standard/i);
  assert.match(status, /context7/i);
});

test("research enforcement status: research-metrics reports aggregate counts without raw content", async () => {
  const h = await setup();
  await runNoncompliantTurn(h);
  await runCommand(h, "research-metrics");
  const metrics = statusText(h);
  assert.match(metrics, /\d/);
  assert.ok(!metrics.includes("https://"), "metrics must not contain URLs");
  assert.ok(!metrics.includes("password"), "metrics must not contain credentials");
});

// ============================================================
// Lifecycle contracts — scope, reload, fork, and tree restoration
// ============================================================

test("research enforcement scope: session_start restores latest matching custom entry without dispatch", async () => {
  const entries: FakeSessionEntry[] = [
    {
      type: "custom",
      customType: "research-enforcement/v1",
      data: {
        version: 1,
        turnOrdinal: 1,
        tier: "standard",
        correction: "dispatched",
        providerCategories: ["context7"],
      },
    },
  ];
  const h = await setup({ entries });
  await emit(h, "session_start", { type: "session_start", reason: "resume" });
  assert.equal(countSends(h), 0, "restoration never dispatches");
  await runCommand(h, "research-status");
  const status = statusText(h);
  assert.match(status, /standard/i);
  assert.match(status, /dispatched/i);
});

test("research enforcement scope: session_tree restores from the active branch without dispatch", async () => {
  const entries: FakeSessionEntry[] = [
    {
      type: "custom",
      customType: "research-enforcement/v1",
      data: { version: 1, turnOrdinal: 2, tier: "high", correction: "attempted", providerCategories: [] },
    },
  ];
  const h = await setup({ entries });
  await emit(h, "session_tree", { type: "session_tree", newLeafId: "leaf-2", oldLeafId: "leaf-1" });
  assert.equal(countSends(h), 0, "tree restoration never dispatches");
  await runCommand(h, "research-status");
  const status = statusText(h);
  assert.match(status, /high/i);
});

test("research enforcement scope: restored correction state blocks a duplicate follow-up", async () => {
  const entries: FakeSessionEntry[] = [
    {
      type: "custom",
      customType: "research-enforcement/v1",
      data: {
        version: 1,
        turnOrdinal: 1,
        tier: "standard",
        correction: "dispatched",
        finalSeen: true,
        providerCategories: [],
        citation: { standardValid: false, highValid: false, referencedSourceCount: 0, missingCodes: ["citation"] },
      },
    },
  ];
  const h = await setup({ entries });
  await emit(h, "session_start", { type: "session_start", reason: "resume" });
  await emit(h, "agent_settled", { type: "agent_settled" });
  assert.equal(countSends(h), 0, "restored dispatched state blocks a duplicate follow-up");
});