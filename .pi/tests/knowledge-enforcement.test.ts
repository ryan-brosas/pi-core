import assert from "node:assert/strict";
import test from "node:test";

import {
  applyObservations,
  classifyTurn,
  evaluateCompliance,
  extractFabricObservations,
  matchSkills,
  type GroundingObservation,
  type SkillDescriptor,
} from "../extensions/knowledge-enforcement/policy.ts";

const skills: SkillDescriptor[] = [
  {
    name: "pi-extension-development",
    description: "Use when creating, modifying, debugging, packaging, or reviewing Pi coding-agent extensions.",
    filePath: "/repo/.pi/skills/pi-extension-development/SKILL.md",
  },
  {
    name: "frontend-design",
    description: "Use when building React pages, components, or web applications.",
    filePath: "/repo/.pi/skills/frontend-design/SKILL.md",
  },
  {
    name: "verification-before-completion",
    description: "Use before claiming implementation work is complete.",
    filePath: "/repo/.pi/skills/verification-before-completion/SKILL.md",
  },
];

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

test("knowledge enforcement classifies non-trivial implementation turns", () => {
  assert.deepEqual(classifyTurn("Create a Pi extension that validates tool use"), {
    required: true,
    optedOut: false,
  });
  assert.deepEqual(classifyTurn("Refactor the parser module without changing behavior"), {
    required: true,
    optedOut: false,
  });
});

test("knowledge enforcement skips questions and trivial mechanical edits", () => {
  assert.equal(classifyTurn("How does this extension work?").required, false);
  assert.equal(classifyTurn("Fix the typo in README.md").required, false);
  assert.equal(classifyTurn("Format this JSON").required, false);
});

test("knowledge enforcement honors an explicit grounding waiver", () => {
  assert.deepEqual(classifyTurn("Create the module from scratch; skip reference grounding"), {
    required: false,
    optedOut: true,
  });
});

test("knowledge enforcement matches specific skill language, not generic coding words", () => {
  const matched = matchSkills("Create a Pi coding-agent extension for plugin validation", skills);
  assert.deepEqual(matched.map((skill) => skill.name), ["pi-extension-development"]);
});

test("knowledge enforcement extracts ordered skill, exemplar, and mutation observations", () => {
  const details = fabricTrace([
    op(0, "pi.read", { path: skills[0].filePath }),
    op(1, "pi.read", { path: "/repo/.pi/extensions/research-enforcement/index.ts" }),
    op(2, "pi.write", { path: "/repo/.pi/extensions/new-extension/index.ts", text: "code" }),
  ]);
  assert.deepEqual(extractFabricObservations(details, "/repo", [skills[0]]), [
    { kind: "skill-read", path: skills[0].filePath, sequence: 0 },
    { kind: "exemplar-read", path: "/repo/.pi/extensions/research-enforcement/index.ts", sequence: 1 },
    { kind: "mutation", path: "/repo/.pi/extensions/new-extension/index.ts", sequence: 2 },
  ]);
});

test("knowledge enforcement rejects malformed or failed Fabric traces", () => {
  assert.deepEqual(extractFabricObservations({ trace: {} }, "/repo", skills), []);
  const failed = fabricTrace([{ ...op(0, "pi.read", { path: skills[0].filePath }), outcome: "failed" }]);
  assert.deepEqual(extractFabricObservations(failed, "/repo", skills), []);
});

test("knowledge enforcement does not count docs, tests, or the target itself as an exemplar", () => {
  const matched = [skills[0]];
  const details = fabricTrace([
    op(0, "pi.read", { path: "/repo/README.md" }),
    op(1, "pi.read", { path: "/repo/.pi/tests/example.test.ts" }),
    op(2, "pi.write", { path: "/repo/src/new.ts", text: "code" }),
    op(3, "pi.read", { path: "/repo/src/new.ts" }),
  ]);
  assert.deepEqual(extractFabricObservations(details, "/repo", matched), [
    { kind: "mutation", path: "/repo/src/new.ts", sequence: 2 },
  ]);
});

test("knowledge enforcement passes only when grounding precedes mutation", () => {
  const observations: GroundingObservation[] = [
    { kind: "skill-read", path: skills[0].filePath, sequence: 0 },
    { kind: "exemplar-read", path: "/repo/src/old.ts", sequence: 1 },
    { kind: "mutation", path: "/repo/src/new.ts", sequence: 2 },
  ];
  const evidence = applyObservations(undefined, observations, [skills[0]]);
  assert.deepEqual(evaluateCompliance(true, [skills[0]], evidence), {
    compliant: true,
    missing: [],
  });
});

test("knowledge enforcement records mutation-before-grounding as noncompliant", () => {
  const observations: GroundingObservation[] = [
    { kind: "mutation", path: "/repo/src/new.ts", sequence: 0 },
    { kind: "skill-read", path: skills[0].filePath, sequence: 1 },
    { kind: "exemplar-read", path: "/repo/src/old.ts", sequence: 2 },
  ];
  const evidence = applyObservations(undefined, observations, [skills[0]]);
  assert.deepEqual(evaluateCompliance(true, [skills[0]], evidence), {
    compliant: false,
    missing: ["grounding-before-mutation"],
  });
});

test("knowledge enforcement reports missing matched skill and exemplar evidence", () => {
  const evidence = applyObservations(undefined, [
    { kind: "mutation", path: "/repo/src/new.ts", sequence: 0 },
  ], [skills[0]]);
  const result = evaluateCompliance(true, [skills[0]], evidence);
  assert.equal(result.compliant, false);
  assert.deepEqual(result.missing, ["matched-skill-read", "exemplar-read", "grounding-before-mutation"]);
});

test("knowledge enforcement requires an exemplar but no skill read when no specialist matches", () => {
  const evidence = applyObservations(undefined, [
    { kind: "exemplar-read", path: "/repo/src/old.ts", sequence: 0 },
    { kind: "mutation", path: "/repo/src/new.ts", sequence: 1 },
  ], []);
  assert.deepEqual(evaluateCompliance(true, [], evidence), { compliant: true, missing: [] });
});

test("knowledge enforcement does not correct a grounded turn that made no mutation", () => {
  const evidence = applyObservations(undefined, [], [skills[0]]);
  assert.deepEqual(evaluateCompliance(true, [skills[0]], evidence), {
    compliant: true,
    missing: [],
  });
});

test("knowledge grounding skill teaches bounded retrieval and target-native adaptation", async () => {
  const text = await import("node:fs/promises").then((fs) =>
    fs.readFile(new URL("../skills/knowledge-grounded-development/SKILL.md", import.meta.url), "utf8")
  );
  assert.match(text, /one to three/i);
  assert.match(text, /invariant/i);
  assert.match(text, /target-native/i);
  assert.match(text, /context/i);
  assert.match(text, /do not copy|copying/i);
});


type InputSource = "interactive" | "rpc" | "extension";
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
}

interface Harness {
  handlers: Map<string, Handler>;
  sent: SentMessage[];
  notifications: string[];
  ctx: FakeContext;
}

async function setupHarness(): Promise<Harness> {
  const handlers = new Map<string, Handler>();
  const sent: SentMessage[] = [];
  const notifications: string[] = [];
  const ctx: FakeContext = {
    cwd: "/repo",
    isIdle: () => true,
    hasPendingMessages: () => false,
    isProjectTrusted: () => true,
    sessionManager: { getBranch: () => [] },
    ui: { notify: (message) => { notifications.push(message); } },
  };
  const api = {
    on: (event: string, handler: Handler) => { handlers.set(event, handler); },
    sendMessage: (message: SentMessage) => { sent.push(message); },
    appendEntry: () => {},
    registerCommand: () => {},
  };
  const extension: { default(value: typeof api): void } = await import(
    "../extensions/knowledge-enforcement/index.ts"
  );
  extension.default(api);
  return { handlers, sent, notifications, ctx };
}

async function emit(harness: Harness, event: string, payload: unknown): Promise<unknown> {
  const handler = harness.handlers.get(event);
  return handler ? await handler(payload, harness.ctx) : undefined;
}

function input(text: string, source: InputSource = "interactive"): unknown {
  return { type: "input", text, source };
}

function start(prompt: string): unknown {
  return {
    type: "before_agent_start",
    prompt,
    systemPrompt: "",
    systemPromptOptions: { skills },
  };
}

function toolCall(id: string): unknown {
  return { type: "tool_call", toolCallId: id, toolName: "fabric_exec", input: {} };
}

function toolResult(id: string, details: unknown): unknown {
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

test("knowledge enforcement extension injects matched skill guidance", async () => {
  const harness = await setupHarness();
  const result = await begin(harness, "Create a Pi coding-agent extension for plugin validation") as {
    message?: { content?: string };
  };
  assert.match(result.message?.content ?? "", /pi-extension-development/);
  assert.match(result.message?.content ?? "", /exemplar/i);
  assert.match(result.message?.content ?? "", /before (?:editing|mutation)/i);
});

test("knowledge enforcement extension accepts grounded Fabric mutation", async () => {
  const harness = await setupHarness();
  await begin(harness, "Create a Pi coding-agent extension for plugin validation");
  await emit(harness, "tool_call", toolCall("grounded"));
  await emit(harness, "tool_result", toolResult("grounded", fabricTrace([
    op(0, "pi.read", { path: skills[0].filePath }),
    op(1, "pi.read", { path: "/repo/.pi/extensions/research-enforcement/index.ts" }),
    op(2, "pi.write", { path: "/repo/.pi/extensions/new/index.ts", text: "code" }),
  ])));
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 0);
});

test("knowledge enforcement extension corrects mutation without prior grounding once", async () => {
  const harness = await setupHarness();
  await begin(harness, "Create a Pi coding-agent extension for plugin validation");
  await emit(harness, "tool_call", toolCall("ungrounded"));
  await emit(harness, "tool_result", toolResult("ungrounded", fabricTrace([
    op(0, "pi.write", { path: "/repo/.pi/extensions/new/index.ts", text: "code" }),
  ])));
  await emit(harness, "agent_settled", { type: "agent_settled" });
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
  assert.match(harness.sent[0].content, /matched-skill-read/);
  assert.match(harness.sent[0].content, /exemplar-read/);
  assert.match(harness.sent[0].content, /target-native/i);
});

test("knowledge enforcement extension does not correct inspection-only turns", async () => {
  const harness = await setupHarness();
  await begin(harness, "Refactor the parser module without changing behavior");
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 0);
});

test("knowledge enforcement extension ignores delayed evidence from an older turn", async () => {
  const harness = await setupHarness();
  await begin(harness, "Create a Pi coding-agent extension for plugin validation");
  await emit(harness, "tool_call", toolCall("old"));
  await begin(harness, "Create a Pi coding-agent extension for plugin validation");
  await emit(harness, "tool_result", toolResult("old", fabricTrace([
    op(0, "pi.read", { path: skills[0].filePath }),
    op(1, "pi.read", { path: "/repo/.pi/extensions/research-enforcement/index.ts" }),
  ])));
  await emit(harness, "tool_call", toolCall("current"));
  await emit(harness, "tool_result", toolResult("current", fabricTrace([
    op(0, "pi.write", { path: "/repo/.pi/extensions/new/index.ts", text: "code" }),
  ])));
  await emit(harness, "agent_settled", { type: "agent_settled" });
  assert.equal(harness.sent.length, 1);
});

test("knowledge enforcement extension honors a turn waiver", async () => {
  const harness = await setupHarness();
  const result = await begin(
    harness,
    "Create the plugin from scratch and skip reference grounding",
  );
  assert.equal(result, undefined);
});
