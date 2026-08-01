import assert from "node:assert/strict";
import test from "node:test";

import {
  applyActivity,
  classifyObservedScope,
  extractFabricActivity,
  type ActivityEvidence,
  type ActivityObservation,
} from "../extensions/knowledge-enforcement/policy.ts";

function fabricTrace(operations: Array<Record<string, unknown>>): unknown {
  return {
    success: true,
    trace: {
      kind: "pi-fabric.execution",
      version: 1,
      outcome: "succeeded",
      operations,
    },
  };
}

function op(sequence: number, ref: string, args: Record<string, unknown>): Record<string, unknown> {
  return { type: "call", sequence, ref, args, outcome: "succeeded" };
}

function evidence(observations: ActivityObservation[]) {
  return applyActivity(undefined, observations);
}

test("knowledge enforcement ignores malformed and failed Fabric traces", () => {
  assert.deepEqual(extractFabricActivity({ trace: {} }, "/repo"), []);
  assert.deepEqual(extractFabricActivity(fabricTrace([
    { ...op(0, "pi.write", { path: "/repo/src/a.ts" }), outcome: "failed" },
  ]), "/repo"), []);
});

test("knowledge enforcement extracts maintained reads mutations verification and diff inspection", () => {
  const result = extractFabricActivity(fabricTrace([
    op(0, "pi.read", { path: "/repo/src/existing.ts" }),
    op(1, "pi.write", { path: "/repo/src/new.ts", text: "code" }),
    op(2, "pi.bash", { cmd: "node --experimental-strip-types --test .pi/tests/x.test.ts" }),
    op(3, "pi.bash", { cmd: "git diff -- src/new.ts" }),
  ]), "/repo");
  assert.deepEqual(result, [
    { kind: "inspect", path: "/repo/src/existing.ts", sequence: 0 },
    { kind: "mutate", path: "/repo/src/new.ts", sequence: 1 },
    { kind: "verify", sequence: 2 },
    { kind: "diff", sequence: 3 },
  ]);
});

test("knowledge enforcement records mutating shell operations", () => {
  const result = extractFabricActivity(fabricTrace([
    op(0, "pi.bash", { cmd: "sed -i 's/a/b/' src/a.ts" }),
  ]), "/repo");
  assert.deepEqual(result, [{ kind: "mutation-attempt", sequence: 0 }]);
});

test("knowledge enforcement does not credit settle-true commands as completion proof", () => {
  const result = extractFabricActivity(fabricTrace([
    op(0, "pi.bash", { cmd: "node --test test/a.test.ts", settle: true }),
    op(1, "pi.bash", { cmd: "git diff -- src/a.ts", settle: true }),
  ]), "/repo");
  assert.deepEqual(result, []);
});

test("knowledge enforcement extracts a complete graph edit receipt from successful trace order", () => {
  const observations = extractFabricActivity(fabricTrace([
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]), "/repo");
  assert.deepEqual(observations, [
    { kind: "graph-health", sequence: 0 },
    { kind: "graph-impact", sequence: 1 },
    { kind: "inspect", path: "/repo/src/feature.ts", sequence: 2 },
    { kind: "graph-source", sequence: 2 },
  ]);
  const state = evidence(observations) as ActivityEvidence & {
    graphHealthCount: number;
    graphImpactCount: number;
    graphSourceVerificationCount: number;
  };
  assert.equal(state.graphHealthCount, 1);
  assert.equal(state.graphImpactCount, 1);
  assert.equal(state.graphSourceVerificationCount, 1);
});

test("knowledge enforcement rejects empty health probes and wrapped graph errors", () => {
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.codegraphcontext.find_code", { repo_path: "/repo", query: "missingSymbol" }),
      result: { success: true, results: { total_matches: 0, ranked_results: [] } },
    },
    {
      ...op(1, "mcp.codegraphcontext.analyze_code_relationships", {
        repo_path: "/repo",
        query_type: "find_all_callers",
        target: "missingSymbol",
      }),
      result: { success: true, results: { error: "Cypher query failed" } },
    },
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]), "/repo");
  assert.deepEqual(observations, [
    { kind: "inspect", path: "/repo/src/feature.ts", sequence: 2 },
  ]);
});

test("knowledge enforcement requires a find-code hit inside the current project", () => {
  const neighboring = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.codegraphcontext.find_code", { repo_path: "/work", query: "KnownSymbol" }),
      result: {
        success: true,
        results: {
          total_matches: 1,
          ranked_results: [{ path: "/work/other/src/feature.ts" }],
        },
      },
    },
  ]), "/work/repo");
  assert.deepEqual(neighboring, []);

  const current = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.codegraphcontext.find_code", { repo_path: "/work", query: "KnownSymbol" }),
      result: {
        success: true,
        results: {
          total_matches: 1,
          ranked_results: [{ path: "/work/repo/src/feature.ts" }],
        },
      },
    },
  ]), "/work/repo");
  assert.deepEqual(current, [{ kind: "graph-health", sequence: 0 }]);
});

test("knowledge enforcement rejects impact hits confined to neighboring projects", () => {
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.codegraphcontext.find_code", { repo_path: "/work", query: "KnownSymbol" }),
      result: {
        success: true,
        results: {
          total_matches: 1,
          ranked_results: [{ path: "/work/repo/src/feature.ts" }],
        },
      },
    },
    {
      ...op(1, "mcp.codegraphcontext.analyze_code_relationships", {
        repo_path: "/work",
        query_type: "find_all_callers",
        target: "KnownSymbol",
      }),
      result: {
        success: true,
        results: { results: [{ path: "/work/other/src/caller.ts" }] },
      },
    },
    op(2, "pi.read", { path: "/work/repo/src/feature.ts" }),
  ]), "/work/repo");
  assert.deepEqual(observations, [
    { kind: "graph-health", sequence: 0 },
    { kind: "inspect", path: "/work/repo/src/feature.ts", sequence: 2 },
  ]);
});

test("knowledge enforcement accepts successful MCP text result wrappers", () => {
  const wrapped = (payload: unknown) => ({
    text: JSON.stringify(payload),
    content: [{ type: "text", text: JSON.stringify(payload) }],
    structuredContent: null,
  });
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.codegraphcontext.find_code", { repo_path: "/repo", query: "runFeature" }),
      result: wrapped({
        success: true,
        results: { total_matches: 1, ranked_results: [{ path: "/repo/src/feature.ts" }] },
      }),
    },
    {
      ...op(1, "mcp.codegraphcontext.analyze_code_relationships", {
        repo_path: "/repo",
        query_type: "find_all_callers",
        target: "runFeature",
      }),
      result: wrapped({ success: true, results: { results: [] } }),
    },
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]), "/repo");
  assert.deepEqual(observations.map((observation) => observation.kind), [
    "graph-health",
    "graph-impact",
    "inspect",
    "graph-source",
  ]);
});

test("knowledge enforcement does not treat broad-ancestor statistics as project health", () => {
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/work" }),
      result: { success: true, statistics: { files: 1000 } },
    },
  ]), "/work/repo");
  assert.deepEqual(observations, []);
});

test("knowledge enforcement accepts a broad indexed ancestor containing cwd", () => {
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.codegraphcontext.find_code", { repo_path: "/work", query: "runFeature" }),
      result: {
        success: true,
        results: {
          total_matches: 1,
          ranked_results: [{ path: "/work/repo/src/feature.ts" }],
        },
      },
    },
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/work",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/work/repo/src/feature.ts" }),
  ]), "/work/repo");
  assert.deepEqual(observations.map((observation) => observation.kind), [
    "graph-health",
    "graph-impact",
    "inspect",
    "graph-source",
  ]);
});

test("knowledge enforcement rejects graph evidence scoped to another repository", () => {
  const observations = extractFabricActivity(fabricTrace([
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/other" }),
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/other",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]), "/repo");
  assert.deepEqual(observations, [
    { kind: "inspect", path: "/repo/src/feature.ts", sequence: 2 },
  ]);
});

test("knowledge enforcement resolves cwd-relative Fabric paths before scope filtering", () => {
  assert.deepEqual(extractFabricActivity(fabricTrace([
    op(0, "pi.read", { path: "src/a.ts" }),
    op(1, "pi.write", { path: "src/b.ts", text: "code" }),
  ]), "/repo"), [
    { kind: "inspect", path: "/repo/src/a.ts", sequence: 0 },
    { kind: "mutate", path: "/repo/src/b.ts", sequence: 1 },
  ]);
});

test("knowledge enforcement excludes docs generated state and failed commands from scope", () => {
  const result = extractFabricActivity(fabricTrace([
    op(0, "pi.read", { path: "/repo/README.md" }),
    op(1, "pi.write", { path: "/repo/.pi/state/runtime.json", text: "{}" }),
    { ...op(2, "pi.bash", { cmd: "npm test" }), outcome: "failed" },
  ]), "/repo");
  assert.deepEqual(result, []);
});

test("knowledge enforcement does not count the mutation target as an exemplar", () => {
  const state = evidence(extractFabricActivity(fabricTrace([
    op(0, "pi.read", { path: "/repo/src/local.ts" }),
    op(1, "pi.edit", { path: "/repo/src/local.ts", old: "a", new: "b" }),
  ]), "/repo"));
  assert.deepEqual(state.mutatedPaths, ["/repo/src/local.ts"]);
  assert.deepEqual(state.exemplarPaths, []);
});

test("knowledge enforcement tracks proof after the latest mutation", () => {
  const beforeMutation = evidence([
    { kind: "verify", sequence: 0 },
    { kind: "diff", sequence: 1 },
    { kind: "mutate", path: "/repo/src/a.ts", sequence: 2 },
  ]) as ActivityEvidence & {
    verificationAfterMutation: boolean;
    diffAfterMutation: boolean;
  };
  assert.equal(beforeMutation.verificationAfterMutation, false);
  assert.equal(beforeMutation.diffAfterMutation, false);

  const proved = applyActivity(beforeMutation, [
    { kind: "verify", sequence: 0 },
    { kind: "diff", sequence: 1 },
  ]);
  assert.equal(proved.verificationAfterMutation, true);
  assert.equal(proved.diffAfterMutation, true);

  const invalidated = applyActivity(proved, [
    { kind: "mutate", path: "/repo/src/b.ts", sequence: 0 },
  ]);
  assert.equal(invalidated.verificationAfterMutation, false);
  assert.equal(invalidated.diffAfterMutation, false);
});

test("knowledge enforcement bypasses a simple one-file fix even after focused verification", () => {
  const state = evidence(extractFabricActivity(fabricTrace([
    op(0, "pi.read", { path: "/repo/src/local.ts" }),
    op(1, "pi.edit", { path: "/repo/src/local.ts", old: "a", new: "b" }),
    op(2, "pi.bash", { cmd: "node --test test/local.test.ts" }),
  ]), "/repo"));
  assert.deepEqual(classifyObservedScope(state), { mode: "none", reasons: [] });
});

test("knowledge enforcement triggers implementation supervision for multiple maintained mutations", () => {
  const state = evidence([
    { kind: "mutate", path: "/repo/src/a.ts", sequence: 0 },
    { kind: "mutate", path: "/repo/src/b.ts", sequence: 1 },
  ]);
  assert.deepEqual(classifyObservedScope(state), {
    mode: "implementation",
    reasons: ["multiple-maintained-files"],
  });
});

test("knowledge enforcement triggers implementation supervision for target-native adaptation", () => {
  const state = evidence([
    { kind: "inspect", path: "/repo/src/exemplar.ts", sequence: 0 },
    { kind: "mutate", path: "/repo/src/new.ts", sequence: 1 },
  ]);
  assert.deepEqual(classifyObservedScope(state), {
    mode: "implementation",
    reasons: ["exemplar-adaptation"],
  });
});

test("knowledge enforcement triggers implementation supervision for a high-consequence path", () => {
  const state = evidence([
    { kind: "mutate", path: "/repo/src/auth/session.ts", sequence: 0 },
  ]);
  assert.deepEqual(classifyObservedScope(state), {
    mode: "implementation",
    reasons: ["high-consequence-path"],
  });
});

test("knowledge enforcement triggers review supervision from observed diff inspection", () => {
  const state = evidence([
    { kind: "inspect", path: "/repo/src/a.ts", sequence: 0 },
    { kind: "diff", sequence: 1 },
  ]);
  assert.deepEqual(classifyObservedScope(state), {
    mode: "review-verification",
    reasons: ["observed-review"],
  });
});

test("knowledge enforcement triggers verification supervision from source inspection and tests", () => {
  const state = evidence([
    { kind: "inspect", path: "/repo/src/a.ts", sequence: 0 },
    { kind: "verify", sequence: 1 },
  ]);
  assert.deepEqual(classifyObservedScope(state), {
    mode: "review-verification",
    reasons: ["observed-verification"],
  });
});

test("knowledge enforcement ignores planning-style inspection without diff or verification evidence", () => {
  const state = evidence([
    { kind: "inspect", path: "/repo/src/a.ts", sequence: 0 },
    { kind: "inspect", path: "/repo/src/b.ts", sequence: 1 },
  ]);
  assert.deepEqual(classifyObservedScope(state), { mode: "none", reasons: [] });
});

type Handler = (event: unknown, ctx: FakeContext) => unknown;

interface FakeContext {
  cwd: string;
  isIdle(): boolean;
  hasPendingMessages(): boolean;
  isProjectTrusted(): boolean;
  sessionManager: { getBranch(): unknown[] };
  ui: { notify(message: string, type?: string): void };
}

interface SentMessage {
  content: string;
  customType: string;
  display: boolean;
  details?: unknown;
}

interface Harness {
  handlers: Map<string, Handler>;
  commands: Map<string, { handler(args: string, ctx: FakeContext): unknown }>;
  sent: SentMessage[];
  notifications: string[];
  ctx: FakeContext;
}

function setupOptions(overrides: Partial<Pick<FakeContext, "isIdle" | "hasPendingMessages" | "isProjectTrusted">> = {}) {
  return overrides;
}

async function setupHarness(overrides = setupOptions()): Promise<Harness> {
  const handlers = new Map<string, Handler>();
  const commands = new Map<string, { handler(args: string, ctx: FakeContext): unknown }>();
  const sent: SentMessage[] = [];
  const notifications: string[] = [];
  const ctx: FakeContext = {
    cwd: "/repo",
    isIdle: overrides.isIdle ?? (() => true),
    hasPendingMessages: overrides.hasPendingMessages ?? (() => false),
    isProjectTrusted: overrides.isProjectTrusted ?? (() => true),
    sessionManager: { getBranch: () => [] },
    ui: { notify: (message) => { notifications.push(message); } },
  };
  const api = {
    on: (event: string, handler: Handler) => { handlers.set(event, handler); },
    sendMessage: (message: SentMessage) => { sent.push(message); },
    appendEntry: () => {},
    registerCommand: (name: string, options: { handler(args: string, ctx: FakeContext): unknown }) => {
      commands.set(name, options);
    },
  };
  const extension: { default(value: typeof api): void } = await import(
    "../extensions/knowledge-enforcement/index.ts"
  );
  extension.default(api);
  return { handlers, commands, sent, notifications, ctx };
}

async function emit(harness: Harness, event: string, payload: unknown): Promise<unknown> {
  const handler = harness.handlers.get(event);
  return handler ? await handler(payload, harness.ctx) : undefined;
}

function input(text: string, source: "interactive" | "rpc" | "extension" = "interactive") {
  return { type: "input", text, source };
}

function start(prompt: string) {
  return { type: "before_agent_start", prompt, systemPrompt: "", systemPromptOptions: {} };
}

function toolCall(id: string, input: Record<string, unknown> = {}) {
  return { type: "tool_call", toolCallId: id, toolName: "fabric_exec", input };
}

function toolResult(id: string, details: unknown) {
  return {
    type: "tool_result",
    toolCallId: id,
    toolName: "fabric_exec",
    input: {},
    content: [{ type: "text", text: "done" }],
    isError: false,
    details,
  };
}

async function begin(harness: Harness, prompt: string): Promise<unknown> {
  await emit(harness, "input", input(prompt));
  return await emit(harness, "before_agent_start", start(prompt));
}

async function observe(harness: Harness, id: string, operations: Array<Record<string, unknown>>) {
  await emit(harness, "tool_call", toolCall(id));
  await emit(harness, "tool_result", toolResult(id, fabricTrace(operations)));
}

test("knowledge enforcement edit gate honors an explicit graph-gate waiver", async () => {
  const harness = await setupHarness();
  await begin(harness, "For this change, explicitly waive the code graph gate.");
  const result = await emit(harness, "tool_call", toolCall("waived-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal(result, undefined);
});

test("knowledge enforcement graph waiver does not waive completion proof", async () => {
  const harness = await setupHarness();
  await begin(harness, "For this change, explicitly waive the code graph gate.");
  await observe(harness, "graph-waived-mutation", [
    op(0, "pi.edit", { path: "/repo/src/a.ts", old: "a", new: "b" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /completion gate/i);
});

test("knowledge enforcement completion waiver does not waive the graph gate", async () => {
  const harness = await setupHarness();
  await begin(harness, "For this change, explicitly waive the completion gate.");
  const result = await emit(harness, "tool_call", toolCall("completion-only-waiver", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal((result as { block?: boolean })?.block, true);
});

test("knowledge enforcement does not infer a waiver from ordinary graph language", async () => {
  const harness = await setupHarness();
  await begin(harness, "Use the code graph when it is healthy.");
  const result = await emit(harness, "tool_call", toolCall("ordinary-graph-language", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal((result as { block?: boolean })?.block, true);
});

test("knowledge enforcement graph waiver expires on the next external task", async () => {
  const harness = await setupHarness();
  await begin(harness, "Explicitly waive the graph gate for this task.");
  const waived = await emit(harness, "tool_call", toolCall("waived-first-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal(waived, undefined);
  await begin(harness, "implement the next feature");
  const next = await emit(harness, "tool_call", toolCall("next-edit", {
    code: "await pi.edit({ path: 'src/b.ts', old: 'a', new: 'b' });",
  }));
  assert.equal((next as { block?: boolean })?.block, true);
});

test("knowledge enforcement edit gate blocks a Fabric mutation without graph evidence", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  const result = await emit(harness, "tool_call", toolCall("edit-without-graph", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal((result as { block?: boolean })?.block, true);
  const reason = (result as { reason?: string }).reason ?? "";
  assert.match(reason, /mutation blocked/i);
  assert.match(reason, /project_health/i);
  assert.match(reason, /find_relevant_code/i);
  assert.match(reason, /searchTerms/);
  assert.match(reason, /analyze_impact/i);
  assert.match(reason, /relationship/i);
  assert.match(reason, /source/i);
  assert.match(reason, /unavailable|fallback/i);
  assert.match(reason, /waive/i);
  assert.match(reason, /knowledge-status/i);
});

test("knowledge enforcement edit gate requires graph health before impact and source", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "out-of-order-graph", [
    op(0, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(1, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  const blocked = await emit(harness, "tool_call", toolCall("blocked-out-of-order-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal((blocked as { block?: boolean })?.block, true);

  await observe(harness, "ordered-impact-and-source", [
    op(0, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(1, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  const allowed = await emit(harness, "tool_call", toolCall("allowed-ordered-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal(allowed, undefined);
});

test("knowledge enforcement edit gate blocks bracket-notation Fabric mutations", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  const result = await emit(harness, "tool_call", toolCall("bracket-edit", {
    code: "await pi['write']({ path: 'src/a.ts', text: 'a' });",
  }));
  assert.equal((result as { block?: boolean })?.block, true);
});

test("knowledge enforcement edit gate blocks aliased Fabric mutations", async () => {
  for (const code of [
    "const save = pi.write; await save({ path: 'src/a.ts', text: 'a' });",
    "const { edit: patch } = pi; await patch({ path: 'src/a.ts', old: 'a', new: 'b' });",
  ]) {
    const harness = await setupHarness();
    await begin(harness, "implement the feature");
    const result = await emit(harness, "tool_call", toolCall("aliased-edit", { code }));
    assert.equal((result as { block?: boolean })?.block, true, code);
  }
});

test("knowledge enforcement edit gate blocks clearly mutating shell commands", async () => {
  const directHarness = await setupHarness();
  await begin(directHarness, "implement the feature");
  const direct = await emit(directHarness, "tool_call", {
    type: "tool_call",
    toolCallId: "direct-shell-mutation",
    toolName: "bash",
    input: { command: "sed -i 's/a/b/' src/a.ts" },
  });
  assert.equal((direct as { block?: boolean })?.block, true);

  const fabricHarness = await setupHarness();
  await begin(fabricHarness, "implement the feature");
  const fabric = await emit(fabricHarness, "tool_call", toolCall("fabric-shell-mutation", {
    code: "await pi.bash({ cmd: 'printf b > src/a.ts' });",
  }));
  assert.equal((fabric as { block?: boolean })?.block, true);
});

test("knowledge enforcement edit gate allows read-only shell commands", async () => {
  const harness = await setupHarness();
  await begin(harness, "inspect the feature");
  const result = await emit(harness, "tool_call", {
    type: "tool_call",
    toolCallId: "read-only-shell",
    toolName: "bash",
    input: { command: "git diff -- src/a.ts" },
  });
  assert.equal(result, undefined);
});

test("knowledge enforcement edit gate blocks direct edit tools without graph evidence", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  const result = await emit(harness, "tool_call", {
    type: "tool_call",
    toolCallId: "direct-edit",
    toolName: "edit",
    input: { path: "src/a.ts", old: "a", new: "b" },
  });
  assert.equal((result as { block?: boolean })?.block, true);
  assert.match((result as { reason?: string }).reason ?? "", /mutation blocked/i);
});

test("knowledge enforcement completion gate observes allowed direct edits", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "graph-receipt", [
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  await emit(harness, "tool_call", {
    type: "tool_call",
    toolCallId: "allowed-direct-edit",
    toolName: "edit",
    input: { path: "src/a.ts", old: "a", new: "b" },
  });
  await emit(harness, "tool_result", {
    type: "tool_result",
    toolCallId: "allowed-direct-edit",
    toolName: "edit",
    input: { path: "src/a.ts", old: "a", new: "b" },
    content: [{ type: "text", text: "done" }],
    isError: false,
    details: {},
  });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /completion gate/i);
});

test("knowledge enforcement completion gate observes approved Fabric shell writes", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "graph-receipt", [
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  await observe(harness, "approved-shell-write", [
    op(0, "pi.bash", { cmd: "sed -i 's/a/b/' src/a.ts" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /completion gate/i);
});

test("knowledge enforcement edit gate keeps health-only evidence locked", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "health-only", [
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
  ]);
  const result = await emit(harness, "tool_call", toolCall("edit-after-health", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal((result as { block?: boolean })?.block, true);
});

test("knowledge enforcement edit gate allows a later mutation after a complete graph receipt", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "graph-receipt", [
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  const result = await emit(harness, "tool_call", toolCall("edit-after-graph", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal(result, undefined);
});

test("knowledge enforcement edit gate rejects fallback evidence from before graph failure", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement while graph is unavailable");
  await observe(harness, "premature-fallback-proof", [
    op(0, "pi.read", { path: "/repo/src/feature.ts" }),
    op(1, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
  ]);
  await emit(harness, "tool_call", toolCall("failed-health", {
    code: "await mcp.codegraphcontext.get_repository_stats({ repo_path: '/repo' });",
  }));
  await emit(harness, "tool_result", {
    ...toolResult("failed-health", { error: "graph unavailable" }),
    isError: true,
  });
  const result = await emit(harness, "tool_call", toolCall("premature-fallback-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal((result as { block?: boolean })?.block, true);
});

test("knowledge enforcement edit gate allows evidenced fallback after a failed graph probe", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement while graph is unavailable");
  await emit(harness, "tool_call", toolCall("failed-health", {
    code: "await mcp.codegraphcontext.get_repository_stats({ repo_path: '/repo' });",
  }));
  await emit(harness, "tool_result", {
    ...toolResult("failed-health", { error: "graph unavailable" }),
    isError: true,
  });
  await observe(harness, "fallback-proof", [
    op(0, "pi.read", { path: "/repo/src/feature.ts" }),
    op(1, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
  ]);
  const result = await emit(harness, "tool_call", toolCall("fallback-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal(result, undefined);
});

test("knowledge enforcement edit gate expires the receipt on a new external task", async () => {
  const harness = await setupHarness();
  await begin(harness, "first feature");
  await observe(harness, "graph-receipt", [
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  await begin(harness, "second feature");
  const result = await emit(harness, "tool_call", toolCall("second-edit", {
    code: "await pi.write({ path: 'src/b.ts', text: 'b' });",
  }));
  assert.equal((result as { block?: boolean })?.block, true);
});

test("knowledge enforcement never injects prompt-level guidance", async () => {
  const harness = await setupHarness();
  const result = await begin(harness, "Create and implement code across many modules");
  assert.equal(result, undefined);
  assert.equal(harness.sent.length, 0);
});

test("knowledge enforcement completion gate honors an explicit completion waiver", async () => {
  const harness = await setupHarness();
  await begin(harness, "For this change, explicitly waive the completion gate.");
  await observe(harness, "waived-completion-edit", [
    op(0, "pi.edit", { path: "/repo/src/a.ts", old: "a", new: "b" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 0);
});

test("knowledge enforcement completion gate survives a failed Fabric call after mutation", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "graph-receipt", [
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  await emit(harness, "tool_call", toolCall("failed-after-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' }); await pi.bash({ cmd: 'node --test test/a.test.ts' });",
  }));
  await emit(harness, "tool_result", {
    ...toolResult("failed-after-edit", { error: "test failed" }),
    isError: true,
  });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /completion gate/i);
});

test("knowledge enforcement completion gate allows two bounded correction rounds", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "first-edit", [
    op(0, "pi.edit", { path: "/repo/src/a.ts", old: "a", new: "b" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);

  await emit(harness, "before_agent_start", { type: "before_agent_start", prompt: "unrelated internal follow-up" });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);

  await emit(harness, "before_agent_start", { type: "before_agent_start", prompt: "Knowledge completion gate: prove the edit" });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 2);

  await emit(harness, "before_agent_start", { type: "before_agent_start", prompt: "Knowledge completion gate: prove the edit" });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 2);
  assert.equal(harness.notifications.filter((message) => /unresolved after two correction rounds/i.test(message)).length, 1);
  await harness.commands.get("knowledge-status")?.handler("", harness.ctx);
  assert.match(harness.notifications.at(-1) ?? "", /completion=unresolved/);
});

test("knowledge enforcement completion correction stops after proof succeeds", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "edit", [
    op(0, "pi.edit", { path: "/repo/src/a.ts", old: "a", new: "b" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);

  await emit(harness, "before_agent_start", {
    type: "before_agent_start",
    prompt: "Knowledge completion gate: prove the edit",
  });
  await observe(harness, "proof", [
    op(0, "pi.bash", { cmd: "node --test" }),
    op(1, "pi.bash", { cmd: "git diff -- src/a.ts" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.doesNotMatch(harness.notifications.join("\n"), /unresolved after two correction rounds/i);
  await harness.commands.get("knowledge-status")?.handler("", harness.ctx);
  assert.match(harness.notifications.at(-1) ?? "", /completion=ready/);
});

test("knowledge enforcement completion gate requests proof for an unverified simple mutation", async () => {
  const harness = await setupHarness();
  await begin(harness, "fix this");
  await observe(harness, "unverified-simple", [
    op(0, "pi.read", { path: "/repo/src/local.ts" }),
    op(1, "pi.edit", { path: "/repo/src/local.ts", old: "a", new: "b" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /completion gate/i);
  assert.match(harness.sent[0].content, /verification/i);
  assert.match(harness.sent[0].content, /diff/i);
});

test("knowledge enforcement does not trigger for a simple one-file fix", async () => {
  const harness = await setupHarness();
  await begin(harness, "fix this");
  await observe(harness, "simple", [
    op(0, "pi.read", { path: "/repo/src/local.ts" }),
    op(1, "pi.edit", { path: "/repo/src/local.ts", old: "a", new: "b" }),
    op(2, "pi.bash", { cmd: "node --test test/local.test.ts" }),
    op(3, "pi.bash", { cmd: "git diff -- src/local.ts" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 0);
});

test("knowledge enforcement completion gate precedes supervisors for unverified complex work", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "unverified-complex", [
    op(0, "pi.write", { path: "/repo/src/a.ts", text: "a" }),
    op(1, "pi.write", { path: "/repo/src/b.ts", text: "b" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /completion gate/i);
  assert.doesNotMatch(harness.sent[0].content, /grounding supervisor/i);
});

test("knowledge enforcement sends one supervisor launch directive for complex implementation", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "complex", [
    op(0, "pi.write", { path: "/repo/src/a.ts", text: "a" }),
    op(1, "pi.write", { path: "/repo/src/b.ts", text: "b" }),
    op(2, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
    op(3, "pi.bash", { cmd: "git diff -- src/a.ts src/b.ts" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  const message = harness.sent[0].content;
  assert.match(message, /openai-codex\/gpt-5\.6-sol/);
  assert.match(message, /thinking.?high/i);
  assert.match(message, /grounding supervisor/i);
  assert.match(message, /verification supervisor/i);
  assert.match(message, /deslop supervisor/i);
  assert.match(message, /Main.*final decision/is);
  assert.match(message, /two remediation rounds/i);
  assert.match(message, /action.?stop/i);
  assert.match(message, /events=\[input,agent_settled,tool_error\]/i);
  assert.match(message, /new external input.*stop/is);
  assert.match(message, /extensions=false/i);
});

test("knowledge enforcement launches supervision for cwd-relative mutations", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement the feature");
  await observe(harness, "relative-complex", [
    op(0, "pi.write", { path: "src/a.ts", text: "a" }),
    op(1, "pi.write", { path: "src/b.ts", text: "b" }),
    op(2, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
    op(3, "pi.bash", { cmd: "git diff -- src/a.ts src/b.ts" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /multiple-maintained-files/);
});

test("knowledge enforcement launches review supervision from observed verification", async () => {
  const harness = await setupHarness();
  await begin(harness, "check this");
  await observe(harness, "review", [
    op(0, "pi.read", { path: "/repo/src/a.ts" }),
    op(1, "pi.bash", { cmd: "node --test test/a.test.ts" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /review-verification/);
});

test("knowledge enforcement ignores delayed Fabric results from an older task", async () => {
  const harness = await setupHarness();
  await begin(harness, "old task");
  await emit(harness, "tool_call", toolCall("old"));
  await begin(harness, "new task");
  await emit(harness, "tool_result", toolResult("old", fabricTrace([
    op(0, "pi.write", { path: "/repo/src/a.ts", text: "a" }),
    op(1, "pi.write", { path: "/repo/src/b.ts", text: "b" }),
  ])));
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 0);
});

test("knowledge enforcement skips launch when user input is pending", async () => {
  const harness = await setupHarness(setupOptions({ hasPendingMessages: () => true }));
  await begin(harness, "implement");
  await observe(harness, "complex", [
    op(0, "pi.write", { path: "/repo/src/a.ts", text: "a" }),
    op(1, "pi.write", { path: "/repo/src/b.ts", text: "b" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 0);
});

test("knowledge enforcement remains disabled for an untrusted project", async () => {
  const harness = await setupHarness(setupOptions({ isProjectTrusted: () => false }));
  await begin(harness, "implement");
  await observe(harness, "complex", [
    op(0, "pi.write", { path: "/repo/src/a.ts", text: "a" }),
    op(1, "pi.write", { path: "/repo/src/b.ts", text: "b" }),
  ]);
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 0);
  await harness.commands.get("knowledge-status")?.handler("", harness.ctx);
  assert.match(harness.notifications.join("\n"), /disabled=untrusted-project/);
  assert.doesNotMatch(harness.notifications.join("\n"), /graph=required/);
});

test("knowledge status uses task-oriented readiness labels", async () => {
  const waived = await setupHarness();
  await begin(waived, "Explicitly waive the graph gate for this task.");
  await waived.commands.get("knowledge-status")?.handler("", waived.ctx);
  assert.match(waived.notifications.join("\n"), /graph=waived/);
  assert.match(waived.notifications.join("\n"), /completion=not-needed/);

  const ready = await setupHarness();
  await begin(ready, "implement the feature");
  await observe(ready, "graph-receipt", [
    op(0, "mcp.codegraphcontext.get_repository_stats", { repo_path: "/repo" }),
    op(1, "mcp.codegraphcontext.analyze_code_relationships", {
      repo_path: "/repo",
      query_type: "find_all_callers",
      target: "runFeature",
    }),
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  await ready.commands.get("knowledge-status")?.handler("", ready.ctx);
  assert.match(ready.notifications.join("\n"), /graph=ready/);

  const fallback = await setupHarness();
  await begin(fallback, "implement while graph is unavailable");
  await emit(fallback, "tool_call", toolCall("failed-health", {
    code: "await mcp.codegraphcontext.get_repository_stats({ repo_path: '/repo' });",
  }));
  await emit(fallback, "tool_result", {
    ...toolResult("failed-health", { error: "graph unavailable" }),
    isError: true,
  });
  await observe(fallback, "fallback-proof", [
    op(0, "pi.read", { path: "/repo/src/feature.ts" }),
    op(1, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
  ]);
  await fallback.commands.get("knowledge-status")?.handler("", fallback.ctx);
  assert.match(fallback.notifications.join("\n"), /graph=fallback-ready/);
});

test("knowledge status reports observed mode and launch state", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement");
  await observe(harness, "complex", [
    op(0, "pi.write", { path: "/repo/src/a.ts", text: "a" }),
    op(1, "pi.write", { path: "/repo/src/b.ts", text: "b" }),
  ]);
  const command = harness.commands.get("knowledge-status");
  assert.ok(command);
  await command.handler("", harness.ctx);
  assert.match(harness.notifications.join("\n"), /mode=implementation/);
  assert.match(harness.notifications.join("\n"), /graph=required/);
  assert.match(harness.notifications.join("\n"), /completion=required/);
  assert.match(harness.notifications.join("\n"), /launched=false/);
});

test("knowledge enforcement accepts a scoped Project Intelligence edit receipt", () => {
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.pi-core-intelligence.project_health", { projectRoot: "/repo", indexRoot: "/work" }),
      result: { structuredContent: {
        status: "ready",
        reason: "project-source-hit",
        evidence: [{ path: "/repo/src/feature.ts", symbol: "runFeature" }],
        total: 1,
        truncated: false,
      } },
    },
    {
      ...op(1, "mcp.pi-core-intelligence.analyze_impact", {
        projectRoot: "/repo",
        indexRoot: "/work",
        target: "runFeature",
        relationship: "callers",
      }),
      result: { structuredContent: {
        status: "empty",
        reason: "no-project-relationships",
        evidence: [],
      } },
    },
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]), "/repo");
  assert.deepEqual(observations.map((observation) => observation.kind), [
    "graph-health",
    "graph-impact",
    "inspect",
    "graph-source",
  ]);
});

test("knowledge enforcement accepts current Project Intelligence code evidence as health", () => {
  const observations = extractFabricActivity(fabricTrace([{
    ...op(0, "mcp.pi-core-intelligence.find_relevant_code", {
      projectRoot: "/repo",
      indexRoot: "/work",
      query: "How is the feature run?",
      searchTerms: ["runFeature"],
    }),
    result: { structuredContent: {
      status: "found",
      reason: "project-source-hit",
      evidence: [{ path: "/repo/src/feature.ts", symbol: "runFeature" }],
      total: 1,
      truncated: false,
    } },
  }]), "/repo");
  assert.deepEqual(observations, [{ kind: "graph-health", sequence: 0 }]);
});

test("knowledge enforcement rejects stale and unavailable Project Intelligence results", () => {
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.pi-core-intelligence.project_health", { projectRoot: "/repo", indexRoot: "/work" }),
      result: { structuredContent: { status: "unproven", reason: "stale-graph-evidence", evidence: [] } },
    },
    {
      ...op(1, "mcp.pi-core-intelligence.find_relevant_code", { projectRoot: "/repo", query: "runFeature" }),
      result: { structuredContent: {
        status: "empty", reason: "stale-graph-evidence", evidence: [], stale: 1,
      } },
    },
    {
      ...op(2, "mcp.pi-core-intelligence.analyze_impact", {
        projectRoot: "/repo", target: "runFeature", relationship: "callers",
      }),
      result: { structuredContent: { status: "unavailable", reason: "graph-unavailable", evidence: [] } },
    },
    op(3, "pi.read", { path: "/repo/src/feature.ts" }),
  ]), "/repo");
  assert.deepEqual(observations, [
    { kind: "graph-unavailable", sequence: 0 },
    { kind: "graph-unavailable", sequence: 1 },
    { kind: "graph-unavailable", sequence: 2 },
    { kind: "inspect", path: "/repo/src/feature.ts", sequence: 3 },
  ]);
});

test("knowledge enforcement recognizes a failed Project Intelligence health probe for fallback", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement while project intelligence is unavailable");
  await emit(harness, "tool_call", toolCall("failed-project-health", {
    code: "await mcp.pi_core_intelligence.project_health({ projectRoot: '/repo' });",
  }));
  await emit(harness, "tool_result", {
    ...toolResult("failed-project-health", { error: "project intelligence unavailable" }),
    isError: true,
  });
  await observe(harness, "project-fallback-proof", [
    op(0, "pi.read", { path: "/repo/src/feature.ts" }),
    op(1, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
  ]);
  const result = await emit(harness, "tool_call", toolCall("project-fallback-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal(result, undefined);
});

test("knowledge enforcement recognizes failed computed graph health refs", async () => {
  for (const [id, ref] of [
    ["project", "mcp.pi-core-intelligence.project_health"],
    ["context", "mcp.pi-core-intelligence.project_context"],
    ["codegraph", "mcp.codegraphcontext.find_code"],
  ]) {
    const harness = await setupHarness();
    await begin(harness, "implement while graph intelligence is unavailable");
    const callId = `failed-computed-${id}-health`;
    await emit(harness, "tool_call", toolCall(callId, {
      code: `await tools.call({ ref: '${ref}', args: {} });`,
    }));
    await emit(harness, "tool_result", {
      ...toolResult(callId, { error: "graph intelligence unavailable" }),
      isError: true,
    });
    await observe(harness, `computed-${id}-fallback-proof`, [
      op(0, "pi.read", { path: "/repo/src/feature.ts" }),
      op(1, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
    ]);
    const result = await emit(harness, "tool_call", toolCall(`computed-${id}-fallback-edit`, {
      code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
    }));
    assert.equal(result, undefined, ref);
  }
});

test("knowledge enforcement rejects neighboring Project Intelligence evidence", () => {
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.pi-core-intelligence.find_relevant_code", {
        projectRoot: "/repo", indexRoot: "/work", query: "runFeature",
      }),
      result: { structuredContent: {
        status: "found",
        reason: "project-source-hit",
        evidence: [{ path: "/work/other/src/feature.ts", symbol: "runFeature" }],
        total: 1,
        truncated: false,
      } },
    },
    {
      ...op(1, "mcp.pi-core-intelligence.analyze_impact", {
        projectRoot: "/repo", indexRoot: "/work", target: "runFeature", relationship: "callers",
      }),
      result: { structuredContent: {
        status: "found",
        reason: "project-relationship-hit",
        evidence: [{ path: "/work/other/src/caller.ts", symbol: "caller" }],
        total: 1,
        truncated: false,
      } },
    },
  ]), "/repo");
  assert.deepEqual(observations, []);
});

test("knowledge enforcement unlocks mutation after a complete Project Intelligence receipt", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement with project intelligence evidence");
  await observe(harness, "project-intelligence-receipt", [
    {
      ...op(0, "mcp.pi-core-intelligence.project_health", { projectRoot: "/repo", indexRoot: "/work" }),
      result: { structuredContent: {
        status: "ready",
        reason: "project-source-hit",
        evidence: [{ path: "/repo/src/feature.ts", symbol: "runFeature" }],
        total: 1,
        truncated: false,
      } },
    },
    {
      ...op(1, "mcp.pi-core-intelligence.analyze_impact", {
        projectRoot: "/repo", indexRoot: "/work", target: "runFeature", relationship: "callers",
      }),
      result: { structuredContent: {
        status: "empty", reason: "no-project-relationships", evidence: [],
      } },
    },
    op(2, "pi.read", { path: "/repo/src/feature.ts" }),
  ]);
  const result = await emit(harness, "tool_call", toolCall("edit-after-project-intelligence", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal(result, undefined);
});

test("knowledge enforcement requires Project Intelligence result status", () => {
  const observations = extractFabricActivity(fabricTrace([
    op(0, "mcp.pi-core-intelligence.project_health", { projectRoot: "/repo", indexRoot: "/work" }),
    op(1, "mcp.pi-core-intelligence.find_relevant_code", {
      projectRoot: "/repo", indexRoot: "/work", query: "runFeature",
    }),
    op(2, "mcp.pi-core-intelligence.analyze_impact", {
      projectRoot: "/repo", indexRoot: "/work", target: "runFeature", relationship: "callers",
    }),
  ]), "/repo");
  assert.deepEqual(observations, []);
});

test("knowledge enforcement treats only scoped unresolved Project Intelligence context as unavailable", () => {
  const observations = extractFabricActivity(fabricTrace([
    {
      ...op(0, "mcp.pi-core-intelligence.project_context", { projectRoot: "/repo" }),
      result: { structuredContent: {
        status: "resolved", projectRoot: "/repo", indexRoot: "/work",
      } },
    },
    {
      ...op(1, "mcp.pi-core-intelligence.project_context", { projectRoot: "/repo" }),
      result: { structuredContent: {
        status: "unresolved", reason: "no-covering-index", projectRoot: "/repo",
      } },
    },
    {
      ...op(2, "mcp.pi-core-intelligence.project_context", { projectRoot: "/other" }),
      result: { structuredContent: {
        status: "unresolved", reason: "no-covering-index", projectRoot: "/other",
      } },
    },
  ]), "/repo");
  assert.deepEqual(observations, [{ kind: "graph-unavailable", sequence: 1 }]);
});

test("knowledge enforcement keeps an empty Project Intelligence semantic miss distinct from unavailability", () => {
  const observations = extractFabricActivity(fabricTrace([{
    ...op(0, "mcp.pi-core-intelligence.find_relevant_code", {
      projectRoot: "/repo", indexRoot: "/work", query: "unmatched prose",
    }),
    result: { structuredContent: {
      status: "empty", reason: "no-project-evidence", evidence: [],
    } },
  }]), "/repo");
  assert.deepEqual(observations, []);
});

test("knowledge enforcement allows fallback after controlled Project Intelligence unavailability", async () => {
  const harness = await setupHarness();
  await begin(harness, "implement while project intelligence is unavailable");
  await observe(harness, "controlled-project-unavailable", [{
    ...op(0, "mcp.pi-core-intelligence.project_health", { projectRoot: "/repo", indexRoot: "/work" }),
    result: { structuredContent: {
      status: "unavailable", reason: "graph-unavailable", evidence: [],
    } },
  }]);
  await observe(harness, "controlled-project-fallback-proof", [
    op(0, "pi.read", { path: "/repo/src/feature.ts" }),
    op(1, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
  ]);
  const result = await emit(harness, "tool_call", toolCall("controlled-project-fallback-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal(result, undefined);
});

test("knowledge enforcement ignores fallback proof before controlled unavailability", async () => {
  const harness = await setupHarness();

  await begin(harness, "implement while project intelligence is unavailable");
  await observe(harness, "premature-controlled-fallback", [
    op(0, "pi.read", { path: "/repo/src/feature.ts" }),
    op(1, "pi.bash", { cmd: "node --test test/feature.test.ts" }),
    {
      ...op(2, "mcp.pi-core-intelligence.project_health", { projectRoot: "/repo", indexRoot: "/work" }),
      result: { structuredContent: {
        status: "unavailable", reason: "graph-unavailable", evidence: [],
      } },
    },
  ]);
  const result = await emit(harness, "tool_call", toolCall("premature-controlled-fallback-edit", {
    code: "await pi.edit({ path: 'src/a.ts', old: 'a', new: 'b' });",
  }));
  assert.equal((result as { block?: boolean })?.block, true);
});
