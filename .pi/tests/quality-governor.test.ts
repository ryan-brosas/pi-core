/**
 * Quality Governor — focused behavioral contract.
 *
 * This file is intentionally RED until the declared policy module exists.  The
 * static import below must fail with ERR_MODULE_NOT_FOUND for
 * ../extensions/quality-governor/policy.ts; sensor and runtime imports remain
 * dynamic so the implementation can turn the groups green incrementally.
 *
 * Research enforcement: Pi extension lifecycle, tool interception, UI,
 * persistence, and bounded output contracts were cross-checked against the
 * authoritative Pi documentation through Context7, Exa, and Codex Search:
 * https://pi.dev/docs/latest/extensions
 * https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md
 * xAI Web Search was unavailable in the research harness (no active xAI/Grok
 * model), so it supplied no evidence; this limitation is preserved rather
 * than implied away. Local corroboration: installed extensions.md/tui.md and
 * Fabric's architecture.md/audit-trace.md (Trace V1).
 */

import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

// Static by design: task-1's focused execution is RED solely while this file is absent.
import {
  canDispatchRepair,
  classifyRequest,
  confirmContract,
  decideAdmission,
  matchPathRule,
  parseContractCandidate,
  reduceQualityVector,
  revokeContract,
  reviseContract,
  selectGate,
} from "../extensions/quality-governor/policy.ts";

const execFile = promisify(execFileCallback);

import type {
  AdmissionDecision,
  AdmissionRequest,
  ChangeProfile,
  ConfirmedContract,
  ContractCandidate,
  GateState,
  GovernorMode,
  PathRule,
  QualityVector,
  RolloutLevel,
  VerificationState,
} from "../extensions/quality-governor/policy.ts";
import type { CheckReceipt } from "../extensions/quality-governor/sensors.ts";

// ---------------------------------------------------------------------------
// Public-shaped fixtures. These deliberately avoid casts that could conceal a
// contract mistake; unknown values are narrowed at the boundary.
// ---------------------------------------------------------------------------

type TextBlock = { type: "text"; text: string };
type ToolBlock = { type: "toolCall"; id: string; name: string; arguments: Record<string, unknown> };
type Message = { role: "assistant" | "user"; content: Array<TextBlock | ToolBlock> };
type InputSource = "interactive" | "rpc" | "extension";
type EventName =
  | "input" | "before_agent_start" | "tool_call" | "tool_result"
  | "tool_execution_end" | "turn_end" | "message_end" | "session_start"
  | "session_tree" | "agent_settled";

type Entry = { type: "custom"; customType: string; data: unknown };
type Operation =
  | { kind: "appendEntry"; customType: string; data: unknown }
  | { kind: "sendMessage"; content: string; options: Record<string, unknown> };
type RegisteredTool = {
  name: string;
  description: string;
  parameters: unknown;
  execute: (
    toolCallId: string,
    params: Record<string, unknown>,
    signal?: AbortSignal,
    onUpdate?: (update: unknown) => void,
    ctx?: HarnessContext,
  ) => Promise<unknown>;
};

interface HarnessContext {
  hasUI: boolean;
  confirmResult: boolean;
  cwd: string;
  contextUsage: { tokens: number } | undefined;
  idle: boolean;
  pending: boolean;
  branchEntries: Entry[];
  allEntries: Entry[];
  ui: {
    confirm(title: string, body: string): Promise<boolean>;
    notify(message: string, level?: string): void;
    setStatus(key: string, value: string | undefined): void;
    setWidget(key: string, lines: string[] | undefined): void;
  };
  sessionManager: {
    getBranch(): Entry[];
    getEntries(): Entry[];
  };
  isIdle(): boolean;
  hasPendingMessages(): boolean;
  getContextUsage(): { tokens: number } | undefined;
}

interface Harness {
  handlers: Map<EventName, (event: unknown, ctx: HarnessContext) => unknown>;
  commands: Map<string, (args: string, ctx: HarnessContext) => unknown>;
  tools: Map<string, RegisteredTool>;
  allTools: string[];
  activeTools: string[];
  activeToolHistory: string[][];
  operations: Operation[];
  notifications: string[];
  confirmations: Array<{ title: string; body: string }>;
  statuses: Map<string, string | undefined>;
  widgets: Map<string, string[] | undefined>;
  ctx: HarnessContext;
  sendFailure?: Error;
  runtimeInstalled?: boolean;
}

function candidate(overrides: Partial<ContractCandidate> = {}): ContractCandidate {
  return {
    version: 1,
    goal: "Bound the quality governor test contract",
    profile: "feature",
    initialMode: "PLAN",
    ownedPaths: ["src/**"],
    expectedExistingFiles: ["src/main.ts"],
    allowedNewFiles: ["src/new.ts"],
    allowedDeletions: [],
    allowedDependencies: [],
    allowedPublicApiChanges: [],
    publicApiEvidence: "not-required",
    architectureEvidence: "not-required",
    nonGoals: ["deployment"],
    requiredChecks: ["typecheck"],
    maxRepairs: 1,
    ...overrides,
  };
}

function confirmedContract(
  overrides: Partial<ContractCandidate> = {},
  previousRevision = 0,
): ConfirmedContract {
  const parsed = parseContractCandidate(candidate(overrides));
  if (!parsed.ok) {
    assert.fail(`confirmed-contract fixture failed to parse: ${parsed.code} ${parsed.reason}`);
  }
  const confirmed = confirmContract(parsed.value, true, previousRevision);
  if (!confirmed.ok) {
    assert.fail(`confirmed-contract fixture failed to confirm: ${confirmed.code} ${confirmed.reason}`);
  }
  return confirmed.value;
}

function makeVector(overrides: Partial<QualityVector> = {}): QualityVector {
  return {
    scope: "PASS",
    protectedPaths: "PASS",
    newFiles: { count: 0, undeclared: 0 },
    deletedFiles: { count: 0, undeclared: 0 },
    dependencies: "UNCHANGED",
    publicApi: "NOT_REQUIRED",
    architecture: "NOT_REQUIRED",
    verification: "CURRENT",
    diff: { files: 1, additions: 2, deletions: 0, outOfScope: [] },
    repair: { attempted: 0, maximum: 1 },
    bypasses: [],
    mode: "VERIFY",
    contractRevision: 1,
    mutationRevision: 1,
    ...overrides,
  } satisfies QualityVector;
}

function admission(overrides: Partial<AdmissionRequest> = {}): AdmissionRequest {
  return {
    contract: confirmedContract(),
    mode: "BUILD",
    rollout: "enforce",
    effect: "edit",
    toolName: "edit",
    toolCallId: "call-1",
    identity: { kind: "direct", source: "pi", toolName: "edit" },
    target: "src/main.ts",
    targetExists: true,
    repositoryRoot: "/repo",
    pathVerified: true,
    ...overrides,
  } satisfies AdmissionRequest;
}

function trace(operations: Array<{ ref: string; outcome: string }>): unknown {
  return {
    success: true,
    trace: {
      kind: "pi-fabric.execution",
      version: 1,
      outcome: "succeeded",
      phases: [],
      operations: operations.map((operation, index) => ({
        type: "call", sequence: index + 1, args: {}, ...operation,
      })),
      counts: { droppedValues: 0, truncatedValues: 0, redactedValues: 0, droppedOperations: 0 },
    },
  };
}

function createHarness(options: Partial<HarnessContext> & {
  confirmCallback?: (title: string, body: string) => Promise<boolean>;
  sendFailure?: Error;
} = {}): Harness {
  const { confirmCallback, sendFailure, ...overrides } = options;
  const notifications: string[] = [];
  const confirmations: Array<{ title: string; body: string }> = [];
  const statuses = new Map<string, string | undefined>();
  const widgets = new Map<string, string[] | undefined>();
  const operations: Operation[] = [];
  const ctx = {
    hasUI: true,
    confirmResult: true,
    cwd: "/repo",
    contextUsage: { tokens: 30 },
    idle: true,
    pending: false,
    branchEntries: [],
    allEntries: [],
    ui: {
      confirm: async (title: string, body: string) => {
        confirmations.push({ title, body });
        return confirmCallback === undefined ? ctx.confirmResult : confirmCallback(title, body);
      },
      notify: (message: string) => notifications.push(message),
      setStatus: (key: string, value: string | undefined) => statuses.set(key, value),
      setWidget: (key: string, lines: string[] | undefined) => widgets.set(key, lines),
    },
    sessionManager: {
      getBranch: () => overrides.branchEntries ?? [],
      getEntries: () => overrides.allEntries ?? [],
    },
    isIdle: () => overrides.idle ?? true,
    hasPendingMessages: () => overrides.pending ?? false,
    getContextUsage: () => overrides.contextUsage,
    ...overrides,
  } satisfies HarnessContext;
  const handlers = new Map<EventName, (event: unknown, ctx: HarnessContext) => unknown>();
  return {
    handlers,
    commands: new Map(),
    tools: new Map(),
    allTools: ["read", "grep", "find", "ls", "edit", "write", "bash", "fabric_exec"],
    activeTools: [],
    activeToolHistory: [],
    operations,
    notifications,
    confirmations,
    statuses,
    widgets,
    ctx,
    sendFailure,
    runtimeInstalled: false,
  };
}

async function initializeRuntime(harness: Harness, runtime: { default: (api: unknown) => Promise<void> | void }): Promise<void> {
  await runtime.default({
    on: (name: EventName, handler: (event: unknown, ctx: HarnessContext) => unknown) => harness.handlers.set(name, handler),
    registerTool: (tool: RegisteredTool) => {
      harness.tools.set(tool.name, tool);
      if (!harness.allTools.includes(tool.name)) harness.allTools.push(tool.name);
    },
    registerCommand: (name: string, command: { handler: (args: string, ctx: HarnessContext) => unknown }) => harness.commands.set(name, command.handler),
    getAllTools: () => {
      assert.equal(harness.runtimeInstalled, true, "getAllTools requires initialized runtime");
      return harness.allTools.map((name) => ({ name }));
    },
    getActiveTools: () => {
      assert.equal(harness.runtimeInstalled, true, "getActiveTools requires initialized runtime");
      return harness.activeTools;
    },
    setActiveTools: (names: string[]) => {
      assert.equal(harness.runtimeInstalled, true, "setActiveTools requires initialized runtime");
      harness.activeTools = [...names];
      harness.activeToolHistory.push([...names]);
    },
    appendEntry: (customType: string, data: unknown) => harness.operations.push({ kind: "appendEntry", customType, data }),
    sendMessage: async (message: { content: string }, options: Record<string, unknown>) => {
      if (harness.sendFailure) throw harness.sendFailure;
      harness.operations.push({ kind: "sendMessage", content: message.content, options });
    },
  });
  harness.runtimeInstalled = true;
}

async function invokeTool(harness: Harness, name: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const tool = harness.tools.get(name);
  assert.ok(tool, `tool ${name} must be registered`);
  return tool.execute(`fake-${name}`, params, undefined, undefined, harness.ctx);
}

async function runCommand(harness: Harness, name: string, args = ""): Promise<unknown> {
  const command = harness.commands.get(name);
  assert.ok(command, `command /${name} must be registered`);
  return command(args, harness.ctx);
}

function input(text: string, source: InputSource = "interactive"): unknown {
  return { type: "input", text, source };
}
function toolCall(toolCallId: string, toolName: string, inputValue: Record<string, unknown> = {}): unknown {
  return { type: "tool_call", toolCallId, toolName, input: inputValue };
}
function toolResult(toolCallId: string, details?: unknown, isError = false): unknown {
  return { type: "tool_result", toolCallId, toolName: "fabric_exec", input: {}, content: [{ type: "text", text: "done" }], details, isError };
}
function terminal(text: string): unknown {
  return { type: "message_end", message: { role: "assistant", content: [{ type: "text", text }] } };
}
function toolMessage(): unknown {
  return { type: "message_end", message: { role: "assistant", content: [{ type: "toolCall", id: "x", name: "read", arguments: {} }] } };
}

async function emit(harness: Harness, name: EventName, event: unknown): Promise<unknown> {
  assert.equal(harness.runtimeInstalled, true, "runtime must be installed before emit");
  const handler = harness.handlers.get(name);
  assert.ok(handler, `handler ${name} must be installed before emit`);
  return handler(event, harness.ctx);
}

function allText(values: unknown[]): string {
  return values.filter((value): value is string => typeof value === "string").join("\n");
}

function isAssistantMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  return Reflect.get(value, "role") === "assistant" && Array.isArray(Reflect.get(value, "content"));
}

// ---------------------------------------------------------------------------
// Policy and contract authority
// ---------------------------------------------------------------------------

test("quality governor policy: every supported profile classifies deterministically", () => {
  const prompts: Array<[ChangeProfile, string]> = [
    ["inspect", "Inspect the existing module and report findings"],
    ["surgical", "Fix the typo in src/main.ts"],
    ["feature", "Add a feature to the application"],
    ["refactor", "Refactor the parser without changing behavior"],
    ["boundary", "Change the public API schema boundary"],
    ["visual", "Redesign the visual layout and styling"],
  ];
  for (const [profile, prompt] of prompts) assert.equal(classifyRequest(prompt).profile, profile);
  assert.notEqual(classifyRequest("Implement a feature").profile, "architecture");
});

test("quality governor policy: strict candidate rejects unknown fields modes and invalid repair bounds", () => {
  const parsed = parseContractCandidate(candidate());
  assert.equal(parsed.ok, true);
  for (const bad of [
    { ...candidate(), version: 2 },
    { ...candidate(), initialMode: "ARCHITECTURE" },
    { ...candidate(), maxRepairs: 2 },
    { ...candidate(), allowedDependencies: ["npm:unknown"] },
    { ...candidate(), unknownField: true },
  ]) {
    const result = parseContractCandidate(bad);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "QG-015");
  }
});

test("quality governor policy: confirmation is the sole authority and revisions are monotonic", () => {
  const proposal = parseContractCandidate(candidate());
  assert.equal(proposal.ok, true);
  if (!proposal.ok) return;
  const declined = confirmContract(proposal.value, false, 0);
  assert.equal(declined.ok, false);
  if (!declined.ok) assert.equal(declined.code, "QG-002");
  const confirmed = confirmContract(proposal.value, true, 0);
  assert.equal(confirmed.ok, true);
  if (!confirmed.ok) return;
  assert.equal(confirmed.value.revision, 1);
  const expanded = reviseContract(confirmed.value, candidate({ allowedNewFiles: ["src/new.ts", "src/extra.ts"] }), true);
  assert.equal(expanded.ok, true);
  if (expanded.ok) {
    assert.equal(expanded.value.revision, 2);
    assert.deepEqual(expanded.value.candidate.allowedNewFiles, ["src/new.ts", "src/extra.ts"]);
    const expandedAdmission = decideAdmission(admission({
      contract: expanded.value, effect: "write", toolName: "write", target: "src/extra.ts", targetExists: false,
    }));
    assert.equal(expandedAdmission.admitted, true);
    assert.equal(revokeContract(expanded.value).revision, 3);
  }
});

test("quality governor policy: headless confirmation and silent expansion remain unconfirmed", () => {
  const parsed = parseContractCandidate(candidate());
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const headless = confirmContract(parsed.value, undefined, 0);
  assert.equal(headless.ok, false);
  if (!headless.ok) assert.equal(headless.code, "QG-002");
  const confirmed = confirmContract(parsed.value, true, 0);
  assert.equal(confirmed.ok, true);
  if (confirmed.ok) {
    const silent = reviseContract(confirmed.value, candidate({ ownedPaths: ["src/**", "tests/**"] }), false);
    assert.equal(silent.ok, false);
    if (!silent.ok) assert.equal(silent.code, "QG-002");
  }
});

test("quality governor policy: plain structural copies cannot grant or revise confirmed authority", () => {
  const confirmed = confirmedContract();
  const deserialized = JSON.parse(JSON.stringify(confirmed)) as ConfirmedContract;
  const spreadCopy = {
    ...confirmed,
    candidate: { ...confirmed.candidate },
  } satisfies ConfirmedContract;

  for (const [label, contract] of [["JSON", deserialized], ["spread", spreadCopy]] as const) {
    const result = decideAdmission(admission({ contract }));
    assert.equal(result.admitted, false, `${label} copy must not authorize mutation`);
    assert.ok(
      result.code === "QG-001" || result.code === "QG-015",
      `${label} copy must fail as unconfirmed or invalid authority`,
    );
  }

  const revision = reviseContract(
    spreadCopy,
    candidate({ allowedNewFiles: ["src/new.ts", "src/extra.ts"] }),
    true,
  );
  assert.equal(revision.ok, false, "a structural copy must not be revision authority");
  if (!revision.ok) assert.ok(revision.code === "QG-001" || revision.code === "QG-015");
});

// ---------------------------------------------------------------------------
// Path and admission contracts
// ---------------------------------------------------------------------------

test("quality governor admission: path grammar accepts exact and terminal descendant rules only", () => {
  const exact: PathRule = "src/main.ts";
  const descendants: PathRule = "src/**";
  assert.equal(matchPathRule(exact, "src/main.ts"), true);
  assert.equal(matchPathRule(exact, "src/main.ts.bak"), false);
  assert.equal(matchPathRule(descendants, "src/main.ts"), true);
  assert.equal(matchPathRule(descendants, "src/nested/file.ts"), true);
  assert.equal(matchPathRule(descendants, "src"), false);
  for (const invalid of ["", "/src/a.ts", "../src/a.ts", "src/../x", "src\\x", "src/*/x.ts", "src/**/x.ts", "src//x.ts", "C:/src/x.ts"]) {
    assert.equal(matchPathRule(invalid, "src/x.ts"), false, invalid);
  }
});

test("quality governor admission: stable violations cover scope new destructive dependency protected and path escape", () => {
  const cases: Array<[string, Partial<AdmissionRequest>]> = [
    ["QG-001", { contract: undefined }],
    ["QG-004", { target: "other.ts" }],
    ["QG-005", { target: "src/undeclared.ts", targetExists: false }],
    ["QG-006", { effect: "delete", target: "src/main.ts" }],
    ["QG-007", { target: "package.json", effect: "edit" }],
    ["QG-008", { target: ".pi/extensions/quality-governor/policy.ts" }],
    ["QG-009", { target: "../outside.ts" }],
    ["QG-010", { effect: "unknown", toolName: "mystery" }],
  ];
  for (const [code, overrides] of cases) {
    const result = decideAdmission(admission(overrides));
    assert.equal(result.code, code);
  }
});

test("quality governor admission: every filesystem mutation requires explicit canonical-path evidence", () => {
  const mutations: Array<Partial<AdmissionRequest>> = [
    { effect: "edit", toolName: "edit", target: "src/main.ts", targetExists: true },
    { effect: "write", toolName: "write", target: "src/main.ts", targetExists: true, contentLength: 4 },
    { effect: "write", toolName: "write", target: "src/new.ts", targetExists: false, contentLength: 4 },
    { effect: "delete", toolName: "write", target: "src/main.ts", targetExists: true },
  ];

  for (const mutation of mutations) {
    const verified = admission(mutation);
    const { pathVerified: _verified, ...omitted } = verified;
    for (const [label, request] of [
      ["omitted", omitted],
      ["false", { ...verified, pathVerified: false }],
    ] as const) {
      const result = decideAdmission(request);
      assert.equal(result.admitted, false, `${mutation.effect}/${label} must fail closed`);
      assert.equal(result.code, "QG-009", `${mutation.effect}/${label} must report unverifiable path`);
    }
  }
});

test("quality governor admission: declared new files and deletions are admitted in BUILD", () => {
  const newFile = decideAdmission(admission({ effect: "write", toolName: "write", target: "src/new.ts", targetExists: false }));
  assert.equal(newFile.admitted, true);
  assert.equal(newFile.greenEligible, true);
  const deletionContract = confirmedContract({ allowedDeletions: ["src/main.ts"] });
  const deletion = decideAdmission(admission({ contract: deletionContract, effect: "delete", toolName: "write", target: "src/main.ts" }));
  assert.equal(deletion.admitted, true);
  assert.equal(deletion.greenEligible, true);
});

test("quality governor admission: modes and rollout levels distinguish action denial from calibration findings", () => {
  const modes: Array<[GovernorMode, string, boolean]> = [
    ["PLAN", "edit", false], ["BUILD", "edit", true], ["VERIFY", "edit", false],
    ["VERIFY", "check", true], ["BUILD", "bash", false],
  ];
  for (const [mode, effect, allowed] of modes) {
    const result = decideAdmission(admission({ mode, effect }));
    assert.equal(result.admitted, allowed, `${mode}/${effect}`);
  }
  for (const rollout of ["observe", "warn", "enforce"] as RolloutLevel[]) {
    const result = decideAdmission(admission({ rollout, target: "docs/outside.ts" }));
    assert.equal(result.code, "QG-004");
    assert.equal(result.rollout, rollout);
    assert.equal(result.admitted, rollout !== "enforce");
    assert.equal(result.greenEligible, false);
  }
});

test("quality governor admission: direct and Fabric-replayed identities share admission while bypasses stay unknown", () => {
  const direct = decideAdmission(admission({ identity: { kind: "direct", source: "pi", toolName: "edit" } }));
  const nested = decideAdmission(admission({ identity: { kind: "replayed", source: "fabric", toolName: "pi.edit" } }));
  assert.deepEqual({ admitted: nested.admitted, code: nested.code }, { admitted: direct.admitted, code: direct.code });
  for (const kind of ["provider", "agent", "unknown"] as const) {
    const result = decideAdmission(admission({ identity: { kind, source: "outer", toolName: "external" } }));
    assert.equal(result.code, "QG-014");
    assert.equal(result.greenEligible, false);
  }
});

// ---------------------------------------------------------------------------
// Vector and gate reduction
// ---------------------------------------------------------------------------

test("quality governor vector: independent dimensions reduce without a scalar score", () => {
  const vector = reduceQualityVector(makeVector());
  const serialized = JSON.stringify(vector);
  assert.equal(selectGate(vector), "GREEN");
  assert.ok(!/score|percent|grade|total/i.test(serialized));
  assert.equal(Object.hasOwn(vector, "score"), false);
});

test("quality governor vector: only current VERIFY evidence is green and precedence is deterministic", () => {
  const cases: Array<[Partial<QualityVector>, GateState]> = [
    [{ mode: "BUILD" }, "YELLOW"],
    [{ scope: "FAIL" }, "RED"],
    [{ protectedPaths: "FAIL" }, "RED"],
    [{ verification: "STALE" }, "STALE"],
    [{ verification: "FAILED" }, "RED"],
    [{ verification: "UNKNOWN" }, "UNKNOWN"],
    [{ bypasses: ["QG-014"] }, "UNKNOWN"],
    [{ publicApi: "CHANGED" }, "RED"],
  ];
  for (const [overrides, expected] of cases) assert.equal(selectGate(reduceQualityVector(makeVector(overrides))), expected);
});

test("quality governor vector: required API and architecture evidence never become heuristic passes", () => {
  const unknown = reduceQualityVector(makeVector({ publicApi: "UNKNOWN", architecture: "UNKNOWN" }));
  assert.equal(selectGate(unknown), "UNKNOWN");
  const optional = reduceQualityVector(makeVector({ publicApi: "NOT_REQUIRED", architecture: "NOT_REQUIRED" }));
  assert.equal(selectGate(optional), "GREEN");
});

// ---------------------------------------------------------------------------
// Sensor and receipt contracts. These imports are deliberately deferred.
// ---------------------------------------------------------------------------

test("quality governor sensors: canonicalization rejects traversal and symlink escape", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  const root = await mkdtemp(join(tmpdir(), "quality-governor-"));
  try {
    const outside = await mkdtemp(join(tmpdir(), "quality-governor-outside-"));
    try {
      await symlink(outside, join(root, "link"));
      await mkdir(join(root, "src"), { recursive: true });
      await writeFile(join(root, "src", "existing.ts"), "existing\n");
      assert.equal((await sensors.canonicalizeTarget(root, "src/existing.ts", true)).ok, true);
      assert.equal((await sensors.canonicalizeTarget(root, "src", true)).ok, false);
      assert.equal((await sensors.canonicalizeTarget(root, "src/new.ts", false)).ok, true);
      assert.equal((await sensors.canonicalizeTarget(root, "../outside.ts", false)).ok, false);
      assert.equal((await sensors.canonicalizeTarget(root, "link/secret.ts", false)).ok, false);
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("quality governor sensors: diff evidence and fingerprints are bounded and deterministic", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  const root = await mkdtemp(join(tmpdir(), "quality-governor-git-"));
  try {
    await execFile("git", ["init", "--quiet", root]);
    await execFile("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
    await execFile("git", ["config", "user.name", "Quality Test"], { cwd: root });
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "main.ts"), "old\n");
    await writeFile(join(root, "package.json"), "dep\n");
    await execFile("git", ["add", "."], { cwd: root });
    await execFile("git", ["commit", "-qm", "base"], { cwd: root });
    await writeFile(join(root, "src", "main.ts"), "new\n");
    await writeFile(join(root, "src", "new.ts"), "created\n");
    await rm(join(root, "package.json"));
    await writeFile(join(root, "docs.txt"), "outside\n");
    const evidence = await sensors.collectDiffEvidence(root, { ownedPaths: ["src/**"], protectedPaths: ["src/protected.ts"], dependencyPaths: ["package.json"] });
    assert.ok(evidence.changedPaths.includes("src/main.ts"));
    assert.ok(evidence.newFiles.includes("src/new.ts"));
    assert.ok(evidence.deletedFiles.includes("package.json"));
    assert.ok(evidence.dependencyPaths.includes("package.json"));
    assert.ok(evidence.outOfScope.includes("docs.txt"));
    const first = await sensors.fingerprintRepository(root, ["src/main.ts", "src/new.ts"]);
    await writeFile(join(root, "src", "new.ts"), "created\nchanged\n");
    const second = await sensors.fingerprintRepository(root, ["src/main.ts", "src/new.ts"]);
    assert.notEqual(first.digest, second.digest);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Verification receipts
// ---------------------------------------------------------------------------

test("quality governor verification: recipe lookup rejects undeclared check IDs", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  const recipe = { id: "typecheck", executable: "node", argv: ["--check", "x.ts"], cwd: ".", acceptedExits: [0], outputCap: 128 };
  const found = sensors.resolveCheckRecipe([recipe], "typecheck");
  assert.equal(found.ok, true);
  const missing = sensors.resolveCheckRecipe([recipe], "missing");
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.code, "QG-011");
});

test("quality governor verification: argv-only recipes bind revisions and preserve bounded output", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  const calls: Array<{ executable: string; argv: string[]; shell: boolean; cwd?: string }> = [];
  const runner = async (request: { executable: string; argv: string[]; shell: boolean; cwd?: string }) => {
    calls.push(request);
    return { exitCode: 0, stdout: "ok", stderr: "", timedOut: false, outputDigest: "digest" };
  };
  const receipt = await sensors.runCheckRecipe({ id: "typecheck", executable: "node", argv: ["--check", "x.ts"], cwd: ".", acceptedExits: [0], outputCap: 128 }, {
    contractRevision: 2,
    mutationRevision: 3,
    checkedPaths: ["src/main.ts"],
    fingerprint: "fp",
    repositoryRoot: process.cwd(),
    runner,
    snapshot: async () => "fp",
  });
  assert.equal(receipt.state, "CURRENT");
  assert.deepEqual({
    contractRevision: receipt.contractRevision,
    mutationRevision: receipt.mutationRevision,
    fingerprint: receipt.fingerprint,
    checkedPaths: receipt.checkedPaths,
    recipeId: receipt.recipeId,
    outputDigest: receipt.outputDigest,
  }, {
    contractRevision: 2,
    mutationRevision: 3,
    fingerprint: "fp",
    checkedPaths: ["src/main.ts"],
    recipeId: "typecheck",
    outputDigest: "digest",
  });
  assert.deepEqual(calls[0], { executable: "node", argv: ["--check", "x.ts"], shell: false });
  assert.equal(calls[0]?.cwd, process.cwd());
  assert.equal(Object.hasOwn(receipt, "stdout"), false);
});

test("quality governor verification: injected runner requires a repository root before execution", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  let runnerInvoked = false;
  const receipt = await sensors.runCheckRecipe(
    { id: "typecheck", executable: "node", argv: ["--check", "x.ts"], cwd: ".", acceptedExits: [0], outputCap: 128 },
    {
      contractRevision: 1,
      mutationRevision: 1,
      checkedPaths: ["src/main.ts"],
      fingerprint: "fp",
      runner: async () => {
        runnerInvoked = true;
        return { exitCode: 0, stdout: "ok", stderr: "", timedOut: false, outputDigest: "digest" };
      },
      snapshot: async () => "fp",
    },
  );
  assert.equal(runnerInvoked, false, "runner must not execute without a canonical repository root");
  assert.notEqual(receipt.state, "CURRENT");
  assert.equal(receipt.code, "QG-011");
});

test("quality governor verification: injected runner rejects a supplied non-Git repository root before execution", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  const root = await mkdtemp(join(tmpdir(), "quality-governor-non-git-"));
  let runnerInvoked = false;
  try {
    const receipt = await sensors.runCheckRecipe(
      { id: "typecheck", executable: "node", argv: ["--check", "x.ts"], cwd: ".", acceptedExits: [0], outputCap: 128 },
      {
        contractRevision: 1,
        mutationRevision: 1,
        checkedPaths: ["src/main.ts"],
        fingerprint: "fp",
        repositoryRoot: root,
        runner: async () => {
          runnerInvoked = true;
          return { exitCode: 0, stdout: "ok", stderr: "", timedOut: false, outputDigest: "digest" };
        },
        snapshot: async () => "fp",
      },
    );
    assert.equal(runnerInvoked, false, "runner must not execute outside a proven Git root");
    assert.notEqual(receipt.state, "CURRENT");
    assert.equal(receipt.code, "QG-011");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("quality governor verification: never-resolving injected runner is bounded and aborted", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  let suppliedSignal: AbortSignal | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const startedAt = Date.now();
  const receipt = await Promise.race([
    sensors.runCheckRecipe(
      { id: "typecheck", executable: "node", argv: ["--check", "x.ts"], cwd: ".", timeoutMs: 20, acceptedExits: [0], outputCap: 128 },
      {
        contractRevision: 1,
        mutationRevision: 1,
        checkedPaths: ["src/main.ts"],
        fingerprint: "fp",
        repositoryRoot: process.cwd(),
        runner: (request) => {
          suppliedSignal = request.signal;
          return new Promise<never>(() => {});
        },
        snapshot: async () => "fp",
      },
    ),
    new Promise<never>((_resolve, reject) => {
      watchdog = setTimeout(() => reject(new Error("injected runner exceeded the test watchdog")), 1_000);
    }),
  ]).finally(() => {
    if (watchdog !== undefined) clearTimeout(watchdog);
  });

  assert.equal(receipt.state, "UNKNOWN");
  assert.equal(receipt.code, "QG-011");
  assert.ok(Date.now() - startedAt < 500, "declared timeout must bound injected runner latency");
  assert.ok(suppliedSignal, "runner must receive an internal AbortSignal");
  assert.equal(suppliedSignal.aborted, true);
});

test("quality governor verification: failed timed-out unknown stale and checker-mutated outcomes cannot be current or green", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  const snapshot = async () => "fp";
  const outcomes = [
    [{ exitCode: 1, stdout: "failed", stderr: "", timedOut: false, outputDigest: "failed" }, "QG-011"],
    [{ exitCode: null, stdout: "", stderr: "timeout", timedOut: true, outputDigest: "timeout" }, "QG-011"],
    [{ exitCode: null, stdout: "", stderr: "unknown", timedOut: false, outputDigest: "unknown", unknown: true }, "QG-011"],
    [{ exitCode: 0, stdout: "mutated", stderr: "", timedOut: false, outputDigest: "mutated", repositoryChanged: true }, "QG-012"],
  ] as const;
  for (const [outcome, expectedCode] of outcomes) {
    const receipt = await sensors.runCheckRecipe(
      { id: "typecheck", executable: "node", argv: ["--check", "x.ts"], cwd: ".", acceptedExits: [0], outputCap: 128 },
      {
        contractRevision: 1,
        mutationRevision: 1,
        checkedPaths: ["src/main.ts"],
        fingerprint: "fp",
        repositoryRoot: process.cwd(),
        runner: async () => outcome,
        snapshot,
      },
    );
    assert.notEqual(receipt.state, "CURRENT", `${JSON.stringify(outcome)} must not be current`);
    assert.equal(receipt.code, expectedCode);
    const vector = reduceQualityVector(makeVector({ verification: receipt.state }));
    assert.notEqual(selectGate(vector), "GREEN", `${JSON.stringify(outcome)} must not be green`);
  }
  const broadDigests = ["broad-pre", "broad-post"];
  let broadCall = 0;
  const broadSnapshot = async () => broadDigests[broadCall++] ?? broadDigests[broadDigests.length - 1];
  const mutatedReceipt = await sensors.runCheckRecipe(
    { id: "typecheck", executable: "node", argv: ["--check", "x.ts"], cwd: ".", acceptedExits: [0], outputCap: 128 },
    {
      contractRevision: 1,
      mutationRevision: 1,
      checkedPaths: ["src/main.ts"],
      fingerprint: "fp",
      repositoryRoot: process.cwd(),
      runner: async () => ({ exitCode: 0, stdout: "ok", stderr: "", timedOut: false, outputDigest: "ok" }),
      snapshot,
      broadSnapshot,
    },
  );
  assert.notEqual(mutatedReceipt.state, "CURRENT", "broad mutation snapshot change must not be current");
  assert.equal(mutatedReceipt.code, "QG-012");
  assert.deepEqual(mutatedReceipt.checkedPaths, ["src/main.ts"]);
  const mutatedVector = reduceQualityVector(makeVector({ verification: mutatedReceipt.state }));
  assert.notEqual(selectGate(mutatedVector), "GREEN", "broad mutation snapshot change must not be green");

  let runnerFlipped = false;
  const unavailableBroadReceipt = await sensors.runCheckRecipe(
    { id: "typecheck", executable: "node", argv: ["--check", "x.ts"], cwd: ".", acceptedExits: [0], outputCap: 128 },
    {
      contractRevision: 1,
      mutationRevision: 1,
      checkedPaths: ["src/main.ts"],
      fingerprint: "fp",
      repositoryRoot: process.cwd(),
      runner: async () => {
        runnerFlipped = true;
        return { exitCode: 0, stdout: "ok", stderr: "", timedOut: false, outputDigest: "ok" };
      },
      snapshot,
      broadSnapshot: async () => {
        throw new Error("broad snapshot unavailable");
      },
    },
  );
  assert.equal(runnerFlipped, false, "runner must not execute when the broad pre-fingerprint is unavailable");
  assert.notEqual(unavailableBroadReceipt.state, "CURRENT");
  assert.equal(unavailableBroadReceipt.state, "UNKNOWN");
  assert.equal(unavailableBroadReceipt.code, "QG-011");

  const stale = { state: "CURRENT", contractRevision: 1, mutationRevision: 1, fingerprint: "fp", checkedPaths: ["src/main.ts"], recipeId: "typecheck" } satisfies CheckReceipt;
  const refreshed = sensors.validateReceiptFreshness(stale, { contractRevision: 1, mutationRevision: 2, fingerprint: "fp", checkedPaths: ["src/main.ts"], recipeId: "typecheck" });
  assert.notEqual(refreshed.state, "CURRENT");
  assert.equal(refreshed.code, "QG-013");
});

test("quality governor verification: receipt freshness requires matching contract mutation fingerprint and paths", async () => {
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  const receipt = { state: "CURRENT", contractRevision: 2, mutationRevision: 4, fingerprint: "fp", checkedPaths: ["src/main.ts"], recipeId: "typecheck" } satisfies CheckReceipt;
  const base = { contractRevision: 2, mutationRevision: 4, fingerprint: "fp", checkedPaths: ["src/main.ts"], recipeId: "typecheck" };
  assert.equal(sensors.validateReceiptFreshness(receipt, base).state, "CURRENT");
  for (const mismatch of [
    { ...base, contractRevision: 3 }, { ...base, mutationRevision: 5 },
    { ...base, fingerprint: "changed" }, { ...base, checkedPaths: ["src/other.ts"] },
    { ...base, recipeId: "lint" },
  ]) {
    const result = sensors.validateReceiptFreshness(receipt, mismatch);
    assert.notEqual(result.state, "CURRENT");
    assert.equal(result.code, "QG-013");
  }
});

test("quality governor verification: checker evidence is dimension-bound", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const h = createHarness({ cwd: process.cwd() });
  await initializeRuntime(h, runtime);
  await invokeTool(h, "quality_contract", {
    action: "propose",
    candidate: candidate({
      initialMode: "VERIFY",
      requiredChecks: ["typecheck"],
      publicApiEvidence: "typecheck",
    }),
  });
  const checkResult = JSON.stringify(await invokeTool(h, "quality_check", { checkId: "typecheck" }));
  assert.match(checkResult, /CURRENT/);
  const status = JSON.stringify(await invokeTool(h, "quality_status"));
  assert.match(status, /"publicApi":"UNKNOWN"/);
  assert.doesNotMatch(status, /"publicApi":"UNCHANGED"/);
});

// ---------------------------------------------------------------------------
// Runtime harness and routing. Dynamic import keeps these deferred.
// ---------------------------------------------------------------------------

test("quality governor routing: runtime registers tools and complete mode frontiers", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const root = await mkdtemp(join(tmpdir(), "quality-governor-frontier-"));
  try {
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "main.ts"), "export const main = true;\n");
    const h = createHarness({ cwd: root });
    await initializeRuntime(h, runtime);
    assert.deepEqual([...h.tools.keys()].sort(), ["quality_check", "quality_contract", "quality_status"]);
    const contractSchema = h.tools.get("quality_contract")?.parameters;
    const statusSchema = h.tools.get("quality_status")?.parameters;
    const checkSchema = h.tools.get("quality_check")?.parameters;
    for (const schema of [contractSchema, statusSchema, checkSchema]) {
      assert.equal(typeof schema, "object");
      assert.equal(Reflect.get(schema as object, "type"), "object");
      assert.equal(Reflect.get(schema as object, "additionalProperties"), false);
    }
    assert.deepEqual(Reflect.get(contractSchema as object, "required"), ["action"]);
    assert.deepEqual(Reflect.get(checkSchema as object, "required"), ["checkId"]);
    assert.deepEqual(Reflect.get(statusSchema as object, "required") ?? [], []);
    const contractProperties = Reflect.get(contractSchema as object, "properties") as object;
    const actionSchema = Reflect.get(contractProperties, "action");
    const candidateSchema = Reflect.get(contractProperties, "candidate");
    assert.deepEqual(Reflect.get(actionSchema as object, "enum"), ["propose", "expand", "set_mode", "revoke"]);
    assert.equal(Reflect.get(candidateSchema as object, "type"), "object");
    assert.equal(Reflect.get(candidateSchema as object, "additionalProperties"), false);
    assert.deepEqual(Reflect.get(candidateSchema as object, "required"), [
      "version", "goal", "profile", "initialMode", "ownedPaths", "expectedExistingFiles",
      "allowedNewFiles", "allowedDeletions", "allowedDependencies", "allowedPublicApiChanges",
      "publicApiEvidence", "architectureEvidence", "nonGoals", "requiredChecks", "maxRepairs",
    ]);
    assert.equal((await invokeTool(h, "quality_status")) !== undefined, true);
    assert.equal(h.commands.has("quality"), true);
    await invokeTool(h, "quality_contract", { action: "propose", candidate: candidate() });
    assert.equal(h.confirmations.length, 1);
    await invokeTool(h, "quality_contract", { action: "expand", candidate: candidate({ allowedNewFiles: ["src/new.ts", "src/extra.ts"] }) });
    assert.equal(h.confirmations.length, 2);
    assert.match(h.confirmations[1].body, /src\/extra\.ts/);
    const hostActiveTools = [...h.activeTools];
    assert.deepEqual(h.activeTools, hostActiveTools, "observe rollout must preserve host/user active tools");
    const planEdit = await emit(h, "tool_call", toolCall("plan-edit", "edit", { path: "src/main.ts" }));
    assert.notEqual(Reflect.get((planEdit ?? {}) as object, "block"), true, "observe rollout must not block PLAN edit");
    await invokeTool(h, "quality_contract", { action: "set_mode", mode: "BUILD" });
    assert.deepEqual(h.activeTools, hostActiveTools, "observe rollout must not reconcile tools on mode change");
    const buildBash = await emit(h, "tool_call", toolCall("build-bash", "bash", { command: "echo denied" }));
    assert.notEqual(Reflect.get((buildBash ?? {}) as object, "block"), true, "observe rollout must not block BUILD bash");
    await invokeTool(h, "quality_contract", { action: "set_mode", mode: "VERIFY" });
    assert.deepEqual(h.activeTools, hostActiveTools);
    assert.equal(h.activeToolHistory.length, 0, "observe rollout must never call setActiveTools");
    await invokeTool(h, "quality_contract", { action: "revoke" });
    assert.equal(h.activeToolHistory.length, 0, "observe rollout must never call setActiveTools, including on revoke");
    const revoked = await invokeTool(h, "quality_status");
    assert.match(JSON.stringify(revoked), /UNKNOWN|revoked/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("quality governor routing: stale proposal confirmation cannot overwrite a newer revocation", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  let resolveConfirmation: (confirmed: boolean) => void = () => assert.fail("confirmation was not deferred");
  const confirmation = new Promise<boolean>((resolve) => { resolveConfirmation = resolve; });
  const h = createHarness({ confirmCallback: async () => confirmation });
  await initializeRuntime(h, runtime);

  const pendingProposal = invokeTool(h, "quality_contract", {
    action: "propose",
    candidate: candidate({ initialMode: "BUILD" }),
  });
  assert.equal(h.confirmations.length, 1, "proposal must be awaiting the deferred confirmation");
  const revoked = await invokeTool(h, "quality_contract", { action: "revoke" });
  assert.match(JSON.stringify(revoked), /contractRevision[^0-9]*1\b/);

  resolveConfirmation(true);
  const staleProposal = await pendingProposal;
  assert.match(JSON.stringify(staleProposal), /QG-013/);
  assert.match(JSON.stringify(staleProposal), /STALE/i);
  assert.ok(!h.activeTools.includes("edit"));
  assert.ok(!h.activeTools.includes("write"));

  const status = JSON.stringify(await invokeTool(h, "quality_status"));
  assert.match(status, /"mode":"PLAN"/);
  assert.match(status, /"gate":"UNKNOWN"/);
  assert.match(status, /contractRevision[^0-9]*1\b/);
  assert.match(status, /Confirm a bounded contract/);
});

test("quality governor routing: obsolete checks persist QG-013 and STALE status", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const root = await mkdtemp(join(tmpdir(), "quality-governor-check-race-"));
  try {
    await execFile("git", ["init", "--quiet", root]);
    await execFile("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
    await execFile("git", ["config", "user.name", "Quality Test"], { cwd: root });
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "main.ts"), "export const main = 'before';\n");
    await execFile("git", ["add", "src/main.ts"], { cwd: root });
    await execFile("git", ["commit", "-qm", "base"], { cwd: root });

    const h = createHarness({ cwd: root });
    await initializeRuntime(h, runtime);
    await invokeTool(h, "quality_contract", {
      action: "propose",
      candidate: candidate({ initialMode: "BUILD", expectedExistingFiles: ["src/main.ts"] }),
    });
    const admitted = await emit(h, "tool_call", toolCall("check-race-edit", "edit", { path: "src/main.ts" }));
    assert.notEqual(Reflect.get((admitted ?? {}) as object, "block"), true);

    const pendingCheck = invokeTool(h, "quality_check", { checkId: "typecheck" });
    writeFileSync(join(root, "src", "main.ts"), "export const main = 'after';\n");
    await emit(h, "tool_execution_end", {
      type: "tool_execution_end", toolCallId: "check-race-edit", isError: false,
    });
    const staleCheck = await pendingCheck;
    assert.match(JSON.stringify(staleCheck), /QG-013/);
    assert.match(JSON.stringify(staleCheck), /STALE/i);

    const status = JSON.stringify(await invokeTool(h, "quality_status"));
    assert.match(status, /QG-013/);
    assert.match(status, /"gate":"STALE"/);
    assert.match(status, /"freshness":"STALE"/);
    assert.doesNotMatch(status, /"gate":"GREEN"/);

    const persisted = [...h.operations].reverse().find((operation) => operation.kind === "appendEntry");
    assert.ok(persisted, "the stale check state must be persisted");
    const metadata = JSON.stringify(persisted.data);
    assert.match(metadata, /QG-013/);
    assert.match(metadata, /"verification":"STALE"/);
    assert.match(metadata, /"recipeIds":\[\]/, "the obsolete receipt must not be stored");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("quality governor routing: declined and headless proposals never activate mutation authority", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  for (const context of [{ confirmResult: false }, { hasUI: false }]) {
    const h = createHarness(context);
    await initializeRuntime(h, runtime);
    await invokeTool(h, "quality_contract", { action: "propose", candidate: candidate({ initialMode: "BUILD" }) });
    const status = JSON.stringify(await invokeTool(h, "quality_status"));
    assert.match(status, /QG-002|UNKNOWN|unconfirmed/i);
    assert.ok(!h.activeTools.includes("edit"));
    assert.ok(!h.activeTools.includes("write"));
    if (context.hasUI === false) assert.equal(h.confirmations.length, 0);
  }
});

test("quality governor routing: declined and headless expansions stay advisory in observe rollout", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const root = await mkdtemp(join(tmpdir(), "quality-governor-expansion-"));
  try {
    await mkdir(join(root, "src"), { recursive: true });
    for (const blockedBy of ["declined", "headless"] as const) {
      const h = createHarness({ cwd: root });
      await initializeRuntime(h, runtime);
      await invokeTool(h, "quality_contract", { action: "propose", candidate: candidate({ initialMode: "BUILD" }) });
      assert.equal(h.confirmations.length, 1);
      h.ctx.confirmResult = blockedBy !== "declined";
      h.ctx.hasUI = blockedBy !== "headless";
      await invokeTool(h, "quality_contract", {
        action: "expand",
        candidate: candidate({ initialMode: "BUILD", allowedNewFiles: ["src/new.ts", "src/extra.ts"] }),
      });
      assert.equal(h.confirmations.length, blockedBy === "declined" ? 2 : 1);
      const observed = await emit(h, "tool_call", toolCall(`expand-${blockedBy}`, "write", { path: "src/extra.ts" }));
      assert.notEqual(Reflect.get((observed ?? {}) as object, "block"), true);
      const status = JSON.stringify(await invokeTool(h, "quality_status"));
      assert.match(status, /QG-005/, "declined expansion must remain visible as an advisory finding");
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("quality governor routing: reverse completion order increments mutation revision once and outer traces record bypasses", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  assert.equal(typeof runtime.default, "function");
  const root = await mkdtemp(join(tmpdir(), "quality-governor-runtime-"));
  try {
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "main.ts"), "export const main = true;\n");
    const h = createHarness({ cwd: root });
    await initializeRuntime(h, runtime);
    await invokeTool(h, "quality_contract", {
      action: "propose",
      candidate: candidate({ initialMode: "BUILD", expectedExistingFiles: ["src/main.ts"] }),
    });
    assert.ok(h.confirmations.length > 0, "contract registration must use the fake confirmation path");
    const admittedA = await emit(h, "tool_call", toolCall("a", "edit", { path: "src/main.ts" }));
    const admittedB = await emit(h, "tool_call", toolCall("b", "edit", { path: "src/main.ts" }));
    assert.notEqual(Reflect.get((admittedA ?? {}) as object, "block"), true);
    assert.notEqual(Reflect.get((admittedB ?? {}) as object, "block"), true);
    await emit(h, "tool_execution_end", { type: "tool_execution_end", toolCallId: "b", isError: false });
    await emit(h, "tool_execution_end", { type: "tool_execution_end", toolCallId: "a", isError: false });
    await emit(h, "tool_execution_end", { type: "tool_execution_end", toolCallId: "a", isError: false });
    const outer = trace([
      { ref: "pi.edit", outcome: "succeeded" },
      { ref: "agents.run", outcome: "succeeded" },
      { ref: "provider.external", outcome: "succeeded" },
      { ref: "unknown.effect", outcome: "succeeded" },
    ]);
    await emit(h, "tool_call", toolCall("outer", "fabric_exec", { task: "nested" }));
    await emit(h, "tool_result", toolResult("outer", outer));
    const status = await invokeTool(h, "quality_status");
    const rendered = JSON.stringify(status);
    assert.match(rendered, /mutationRevision[^0-9]*2\b/);
    assert.match(rendered, /bypass|UNKNOWN/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Status, persistence, and correction behavior
// ---------------------------------------------------------------------------

test("quality governor status: footer and model status expose vector fields without full logs", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  assert.equal(typeof runtime.default, "function");
  const h = createHarness();
  await initializeRuntime(h, runtime);
  await emit(h, "session_start", { type: "session_start", reason: "startup" });
  const status = await invokeTool(h, "quality_status");
  assert.equal(typeof status, "object");
  assert.notEqual(status, null);
  const modelStatus = JSON.stringify(status);
  for (const field of ["mode", "gate", "vector", "freshness", "context", "repair"]) assert.match(modelStatus, new RegExp(field));
  assert.ok(!/score|password|token=|full log/i.test(modelStatus));
  const hud = JSON.stringify([...h.statuses.values(), ...h.widgets.values()]);
  assert.notEqual(hud, "[]");
  for (const shared of ["PLAN", "UNKNOWN"]) {
    assert.match(modelStatus, new RegExp(shared));
    assert.match(hud, new RegExp(shared));
  }
  const sendsBeforeCommand = h.operations.filter((operation) => operation.kind === "sendMessage").length;
  await runCommand(h, "quality");
  const commandOutput = JSON.stringify([h.notifications, ...h.widgets.values()]);
  assert.match(commandOutput, /PLAN/);
  assert.match(commandOutput, /UNKNOWN/);
  assert.equal(h.operations.filter((operation) => operation.kind === "sendMessage").length, sendsBeforeCommand);
  assert.ok(h.operations.every((operation) => operation.kind !== "appendEntry" || !/prompt|full log|password|token=/i.test(JSON.stringify(operation.data))));
  assert.ok(!/password|token=|full log/i.test(hud + commandOutput));
});

test("quality governor persistence: restoration prefers active branch and stores metadata only", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const branch: Entry[] = [
    { type: "custom", customType: "quality-governor/v1", data: { version: 1, gate: "UNKNOWN", contractRevision: 2 } },
    { type: "custom", customType: "quality-governor/v1", data: { version: 1, gate: "BOGUS", contractRevision: 5 } },
  ];
  const all: Entry[] = [{ type: "custom", customType: "quality-governor/v1", data: { version: 1, gate: "GREEN", contractRevision: 99 } }];
  const h = createHarness({ branchEntries: branch, allEntries: all });
  await initializeRuntime(h, runtime);
  await emit(h, "session_tree", { type: "session_tree", newLeafId: "new", oldLeafId: "old" });
  const status = await invokeTool(h, "quality_status");
  assert.match(JSON.stringify(status), /UNKNOWN/);
  assert.match(JSON.stringify(status), /contractRevision[^0-9]*2/);
  assert.doesNotMatch(JSON.stringify(status), /99/);
  const serialized = JSON.stringify(h.operations);
  assert.ok(!serialized.includes("GREEN"));
  assert.ok(!serialized.includes("prompt"));
  assert.ok(h.operations.every((operation) => operation.kind !== "appendEntry" || typeof operation.data === "object"));
});

test("quality governor correction: terminal non-green answers preserve text and require a gate annotation", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const h = createHarness();
  await initializeRuntime(h, runtime);
  await emit(h, "input", input("Implement the bounded feature"));
  await emit(h, "before_agent_start", { type: "before_agent_start", prompt: "Implement the bounded feature" });
  const intermediate = await emit(h, "message_end", toolMessage());
  assert.doesNotMatch(JSON.stringify(intermediate ?? toolMessage()), /QUALITY_GATE/);
  const annotation = await emit(h, "message_end", terminal("Done"));
  assert.ok(isAssistantMessage(annotation), "terminal output must be the same-role assistant message");
  const rendered = JSON.stringify(annotation);
  assert.match(rendered, /QUALITY_GATE/);
  assert.match(rendered, /RED|STALE|UNKNOWN|YELLOW/);
  assert.match(allText(annotation.content.map((block) => block.type === "text" ? block.text : "")), /Done/);
});

test("quality governor correction: terminal annotation distinguishes current from changed fingerprints", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const sensors = await import("../extensions/quality-governor/sensors.ts");
  const root = await mkdtemp(join(tmpdir(), "quality-governor-freshness-"));
  try {
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "main.ts"), "before\n");
    await execFile("git", ["init", "--quiet", root]);
    await execFile("git", ["config", "user.email", "test@example.invalid"], { cwd: root });
    await execFile("git", ["config", "user.name", "Quality Test"], { cwd: root });
    await execFile("git", ["add", "src/main.ts"], { cwd: root });
    await execFile("git", ["commit", "-qm", "base"], { cwd: root });
    const fingerprint = await sensors.fingerprintRepository(root, ["src/main.ts"]);
    assert.equal(fingerprint.complete, true);
    const branch: Entry[] = [{
      type: "custom", customType: "quality-governor/v1",
      data: {
        version: 1, gate: "GREEN", mode: "VERIFY", vector: makeVector({ mutationRevision: 0 }),
        contractRevision: 1, mutationRevision: 0, verification: "CURRENT",
        fingerprint: fingerprint.digest, checkedPaths: ["src/main.ts"],
      },
    }];
    const h = createHarness({ cwd: root, branchEntries: branch });
    await initializeRuntime(h, runtime);
    await emit(h, "session_tree", { type: "session_tree", newLeafId: "fresh", oldLeafId: "old" });
    assert.match(h.statuses.get("quality-governor") ?? "", /UNKNOWN/);
    assert.doesNotMatch(h.statuses.get("quality-governor") ?? "", /GREEN/);
    const unchanged = await emit(h, "message_end", terminal("Still current"));
    assert.ok(isAssistantMessage(unchanged));
    assert.match(JSON.stringify(unchanged), /UNKNOWN/);
    await writeFile(join(root, "src", "main.ts"), "after\n");
    const changed = await emit(h, "message_end", terminal("Verified earlier"));
    assert.ok(isAssistantMessage(changed));
    assert.match(JSON.stringify(changed), /STALE|UNKNOWN/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("quality governor correction: successful repair persists attempted state before one dispatch", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const h = createHarness();
  await initializeRuntime(h, runtime);
  await emit(h, "input", input("Implement the bounded feature"));
  await emit(h, "before_agent_start", { type: "before_agent_start", prompt: "Implement the bounded feature" });
  await emit(h, "message_end", terminal("Done"));
  await emit(h, "agent_settled", { type: "agent_settled" });
  const kinds = h.operations.map((operation) => operation.kind);
  assert.equal(kinds.filter((kind) => kind === "sendMessage").length, 1);
  assert.ok(kinds.indexOf("appendEntry") >= 0);
  assert.ok(kinds.indexOf("appendEntry") < kinds.indexOf("sendMessage"));
  await emit(h, "agent_settled", { type: "agent_settled" });
  assert.equal(h.operations.filter((operation) => operation.kind === "sendMessage").length, 1);
  await emit(h, "input", input("extension follow-up", "extension"));
  await emit(h, "before_agent_start", { type: "before_agent_start", prompt: "extension follow-up" });
  await emit(h, "message_end", terminal("Still not green"));
  await emit(h, "agent_settled", { type: "agent_settled" });
  assert.equal(h.operations.filter((operation) => operation.kind === "sendMessage").length, 1);
});

test("quality governor correction: settled repair persists dispatch-failed state and never retries", async () => {
  const runtime = await import("../extensions/quality-governor/index.ts");
  const h = createHarness({ sendFailure: new Error("send failed") });
  await initializeRuntime(h, runtime);
  await emit(h, "input", input("Implement the bounded feature"));
  await emit(h, "before_agent_start", { type: "before_agent_start", prompt: "Implement the bounded feature" });
  await emit(h, "message_end", terminal("Done"));
  await emit(h, "agent_settled", { type: "agent_settled" });
  const firstStatus = await invokeTool(h, "quality_status");
  await emit(h, "agent_settled", { type: "agent_settled" });
  const secondStatus = await invokeTool(h, "quality_status");
  assert.match(JSON.stringify(firstStatus), /dispatch-failed|failed/i);
  assert.match(JSON.stringify(secondStatus), /dispatch-failed|failed/i);
  assert.equal(h.operations.filter((operation) => operation.kind === "sendMessage").length, 0);
  assert.ok(h.operations.some((operation) => operation.kind === "appendEntry"));
});

test("quality governor correction: pending and busy contexts report skipped repair without dispatch", async () => {
  assert.equal(canDispatchRepair({ repairable: true, attempted: 0, maximum: 1, idle: false, pendingInput: false, terminal: true }), false);
  assert.equal(canDispatchRepair({ repairable: true, attempted: 0, maximum: 1, idle: true, pendingInput: true, terminal: true }), false);
  assert.equal(canDispatchRepair({ repairable: true, attempted: 1, maximum: 1, idle: true, pendingInput: false, terminal: true }), false);
  assert.equal(canDispatchRepair({ repairable: false, attempted: 0, maximum: 1, idle: true, pendingInput: false, terminal: true }), false);
  for (const context of [{ idle: false }, { pending: true }]) {
    const runtime = await import("../extensions/quality-governor/index.ts");
    const h = createHarness(context);
    await initializeRuntime(h, runtime);
    await emit(h, "input", input("Repair this bounded feature"));
    await emit(h, "before_agent_start", { type: "before_agent_start", prompt: "Repair this bounded feature" });
    await emit(h, "message_end", terminal("Not green"));
    await emit(h, "agent_settled", { type: "agent_settled" });
    await emit(h, "agent_settled", { type: "agent_settled" });
    const status = await invokeTool(h, "quality_status");
    assert.equal(h.operations.filter((operation) => operation.kind === "sendMessage").length, 0);
    assert.match(JSON.stringify(status), /QG-016/);
    if (context.idle === false) assert.match(JSON.stringify(status), /busy|skipped/i);
    if (context.pending === true) assert.match(JSON.stringify(status), /pending|skipped/i);
  }
});

// Keep the event/message fixture contracts exercised by the harness compiler.
void input("contract", "rpc");
void toolCall("call", "read");
void toolResult("call", trace([]));
void terminal("answer");
void toolMessage();
