import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const MODULE_PATH = path.join(ROOT, ".pi/scripts/task-graph.ts");
const NODE_ARGS = ["--experimental-strip-types", MODULE_PATH];

type Task = { id: string; status: string; passes: boolean; depends_on: string[]; conflicts_with: string[]; files: string[]; parallel?: boolean; acceptance_criteria?: string[]; verification?: string[]; attempt?: number; evidence_refs?: Array<{ kind: string; ref: string; attempt: number }> };
function task(id: string, overrides: Partial<Task> = {}): Task { return { id, status: "pending", passes: false, depends_on: [], conflicts_with: [], files: [`src/${id}.ts`], parallel: true, ...overrides }; }
function v2Task(id: string, overrides: Partial<Task> = {}): Task { return task(id, { acceptance_criteria: [`${id} is observable`], verification: [`node --test ${id}`], attempt: 0, evidence_refs: [], ...overrides }); }
function v1(tasks: Task[] = [task("a")]) { return { version: 1, slug: "fixture", status: "ready", tasks }; }
function v2(tasks: Task[] = [v2Task("a")]) { return { version: 2, slug: "fixture", status: "ready", tasks }; }
async function api() { return import(pathToFileURL(MODULE_PATH).href); }
function writeGraph(graph: unknown): string { const dir = mkdtempSync(path.join(tmpdir(), "task-graph-")); const file = path.join(dir, "tasks.json"); writeFileSync(file, JSON.stringify(graph, null, 2)); return file; }
function cli(args: string[]) { return spawnSync(process.execPath, [...NODE_ARGS, ...args], { cwd: ROOT, encoding: "utf8" }); }

test("exports the pure task graph API", async () => { const module = await api(); assert.equal(typeof module.validateTaskGraph, "function"); assert.equal(typeof module.computeFrontier, "function"); assert.equal(typeof module.computeDescendants, "function"); assert.equal(typeof module.scanArtifactFrontiers, "function"); });
test("validates version 1 and version 2 graphs", async () => { const { validateTaskGraph } = await api(); assert.deepEqual(validateTaskGraph(v1()), { ok: true, version: 1, issues: [] }); assert.deepEqual(validateTaskGraph(v2()), { ok: true, version: 2, issues: [] }); });
test("reports deterministic ID and target invariant issues", async () => {
  const { validateTaskGraph } = await api();
  const fixtures = [[v1([task("a"), task("a")]), "duplicate_id", "/tasks/1/id"], [v1([task("a", { depends_on: ["missing"] })]), "missing_dependency", "/tasks/0/depends_on/0"], [v1([task("a", { conflicts_with: ["missing"] })]), "missing_conflict", "/tasks/0/conflicts_with/0"], [v1([task("a", { depends_on: ["a"] })]), "self_dependency", "/tasks/0/depends_on/0"], [v1([task("a", { conflicts_with: ["a"] })]), "self_conflict", "/tasks/0/conflicts_with/0"]] as const;
  for (const [graph, code, issuePath] of fixtures) { const result = validateTaskGraph(graph); assert.equal(result.ok, false); assert.ok(result.issues.some((issue: { code: string; path: string }) => issue.code === code && issue.path === issuePath)); }
});
test("reports a stable dependency cycle path", async () => { const { validateTaskGraph } = await api(); const graph = v1([task("a", { depends_on: ["c"] }), task("b", { depends_on: ["a"] }), task("c", { depends_on: ["b"] })]); const first = validateTaskGraph(graph); assert.deepEqual(first, validateTaskGraph(graph)); assert.ok(first.issues.some((issue: { code: string; message: string }) => issue.code === "dependency_cycle" && issue.message.includes("a -> c -> b -> a"))); });
test("enforces version 2 state, attempt, and current evidence coherence", async () => {
  const { validateTaskGraph } = await api(); const passed = v2Task("a", { status: "passed", passes: true, attempt: 1, evidence_refs: [{ kind: "test", ref: "progress.md#evidence-a-attempt-1", attempt: 1 }] }); assert.equal(validateTaskGraph(v2([passed])).ok, true);
  const invalid = [v2Task("a", { status: "pending", passes: true }), v2Task("a", { status: "passed", passes: true }), v2Task("a", { status: "passed", passes: true, attempt: 2, evidence_refs: [{ kind: "test", ref: "progress.md#old", attempt: 1 }] }), v2Task("a", { status: "unknown" })];
  const codes = invalid.map((node) => validateTaskGraph(v2([node])).issues.map((issue: { code: string }) => issue.code)); assert.ok(codes[0].includes("state_pass_mismatch")); assert.ok(codes[1].includes("passed_attempt_invalid") && codes[1].includes("passed_evidence_missing")); assert.ok(codes[2].includes("passed_evidence_stale")); assert.ok(codes[3].includes("status_invalid"));
});
test("version 2 task execution contracts", async () => {
  const { validateTaskGraph } = await api();
  type ContractIssue = { code: string; path: string; message: string };
  const fieldMessage = "Field must be a non-empty array of non-whitespace strings.";
  const entryMessage = "Entry must be a non-whitespace string.";
  const issue = (code: string, issuePath: string, message: string): ContractIssue => ({ code, path: issuePath, message });
  const invalid = (issues: ContractIssue[]) => ({ ok: false, version: 2, issues });
  const validateNode = (node: object) => validateTaskGraph({ ...v2(), tasks: [node] });
  const contracts = [
    { field: "acceptance_criteria", code: "acceptance_criteria_invalid" },
    { field: "verification", code: "verification_invalid" },
  ] as const;

  assert.deepEqual(validateTaskGraph(v2([v2Task("valid", {
    acceptance_criteria: ["The result is visible"],
    verification: ["node --experimental-strip-types --test .pi/tests/task-graph.test.ts"],
  })])), { ok: true, version: 2, issues: [] });
  assert.deepEqual(validateTaskGraph(v2([v2Task("outer-whitespace", {
    acceptance_criteria: ["  The result remains visible  "],
    verification: ["  node --experimental-strip-types --test .pi/tests/task-graph.test.ts  "],
  })])), { ok: true, version: 2, issues: [] });
  assert.deepEqual(validateTaskGraph(v2([v2Task("inert-command", {
    verification: ["command-that-does-not-exist-anywhere --still-inert"],
  })])), { ok: true, version: 2, issues: [] });

  for (const contract of contracts) {
    const { [contract.field]: omitted, ...absent } = v2Task(`${contract.field}-absent`);
    void omitted;
    const expectedFieldIssue = invalid([issue(contract.code, `/tasks/0/${contract.field}`, fieldMessage)]);
    assert.deepEqual(validateNode(absent), expectedFieldIssue, `${contract.field}: absent`);
    const fieldShapes = [
      ["scalar", "value"],
      ["object", { value: "value" }],
      ["empty array", []],
      ["null", null],
    ] as const;
    for (const [label, value] of fieldShapes) {
      const node = { ...v2Task(`${contract.field}-${label}`), [contract.field]: value };
      assert.deepEqual(validateNode(node), expectedFieldIssue, `${contract.field}: ${label}`);
    }

    const memberCases = [
      ["non-string", [7], [0]],
      ["whitespace-only", [" \t\n"], [0]],
      ["mixed invalid members", ["valid", 7, " \t", "  also valid  ", null], [1, 2, 4]],
    ] as const;
    for (const [label, members, invalidIndexes] of memberCases) {
      const node = { ...v2Task(`${contract.field}-${label}`), [contract.field]: members };
      const expected = invalid(invalidIndexes.map((index) => issue(contract.code, `/tasks/0/${contract.field}/${index}`, entryMessage)));
      assert.deepEqual(validateNode(node), expected, `${contract.field}: ${label}`);
    }
  }

  const combinedNode = {
    ...v2Task("combined-invalid"),
    acceptance_criteria: [" ", "valid criterion", 7],
    verification: [null, "\t", "valid-command"],
  };
  const combinedFirst = validateNode(combinedNode);
  const combinedSecond = validateNode(combinedNode);
  assert.deepEqual(combinedFirst, combinedSecond);
  assert.deepEqual(combinedFirst, invalid([
    issue("acceptance_criteria_invalid", "/tasks/0/acceptance_criteria/0", entryMessage),
    issue("acceptance_criteria_invalid", "/tasks/0/acceptance_criteria/2", entryMessage),
    issue("verification_invalid", "/tasks/0/verification/0", entryMessage),
    issue("verification_invalid", "/tasks/0/verification/1", entryMessage),
  ]));
  assert.deepEqual(validateTaskGraph(v1([task("equivalent-v1")])), { ok: true, version: 1, issues: [] });

  const invalidFile = writeGraph({ ...v2(), tasks: [{ ...v2Task("cli-invalid"), acceptance_criteria: [] }] });
  const firstCli = cli(["validate", invalidFile]);
  const secondCli = cli(["validate", invalidFile]);
  assert.equal(firstCli.status, 1, firstCli.stderr);
  assert.equal(secondCli.status, 1, secondCli.stderr);
  assert.deepEqual(JSON.parse(firstCli.stdout), invalid([
    issue("acceptance_criteria_invalid", "/tasks/0/acceptance_criteria", fieldMessage),
  ]));
  assert.equal(firstCli.stdout, secondCli.stdout);
});
test("frontier gates dependencies and excludes conflicts with running work", async () => {
  const { computeFrontier } = await api(); const graph = v1([task("done", { status: "passed", passes: true }), task("running", { status: "running", files: ["src/shared.ts"] }), task("ready", { depends_on: ["done"] }), task("waiting", { depends_on: ["ready"] }), task("declared", { conflicts_with: ["running"] }), task("overlap", { files: ["src/shared.ts"] })]); const result = computeFrontier(graph, 3); assert.deepEqual(result.ready, ["ready"]); assert.deepEqual(result.selected, ["ready"]); assert.deepEqual(result.running, ["running"]); assert.ok(result.blocked.some((entry: { id: string; reasons: string[] }) => entry.id === "waiting" && entry.reasons.some((reason) => reason.includes("ready"))));
});
test("frontier normalizes one-sided conflicts and exact file overlap", async () => { const { computeFrontier } = await api(); const graph = v1([task("a", { conflicts_with: ["b"] }), task("b"), task("c", { files: ["src/same.ts"] }), task("d", { files: ["src/same.ts"] }), task("e")]); const result = computeFrontier(graph, 3); assert.deepEqual(result.ready, ["a", "b", "c", "d", "e"]); assert.deepEqual(result.selected, ["a", "c", "e"]); });
test("frontier is deterministic, capped at three, and selects non-parallel work alone", async () => { const { computeFrontier } = await api(); const many = v1([task("a"), task("b"), task("c"), task("d")]); assert.deepEqual(computeFrontier(many, 99).selected, ["a", "b", "c"]); assert.deepEqual(computeFrontier(v1([task("serial", { parallel: false }), task("other")]), 3).selected, ["serial"]); assert.deepEqual(computeFrontier(many, 2), computeFrontier(many, 2)); });
test("descendants are transitive, stable, and exclude ancestors", async () => { const { computeDescendants } = await api(); const graph = v1([task("root"), task("child", { depends_on: ["root"] }), task("peer"), task("grandchild", { depends_on: ["child"] })]); assert.deepEqual(computeDescendants(graph, "root"), ["child", "grandchild"]); assert.deepEqual(computeDescendants(graph, "child"), ["grandchild"]); assert.deepEqual(computeDescendants(graph, "missing"), []); });
test("CLI uses stable JSON and exit codes 0, 1, and 2", () => {
  const valid = writeGraph(v1()); const ok = cli(["validate", valid]); assert.equal(ok.status, 0, ok.stderr); assert.deepEqual(JSON.parse(ok.stdout), { ok: true, version: 1, issues: [] }); assert.equal(ok.stdout, cli(["validate", valid]).stdout);
  const invalid = writeGraph(v1([task("a", { depends_on: ["missing"] })])); const bad = cli(["validate", invalid]); assert.equal(bad.status, 1); assert.equal(JSON.parse(bad.stdout).ok, false);
  const missing = cli(["validate", `${valid}.missing`]); assert.equal(missing.status, 2); assert.equal(JSON.parse(missing.stdout).error.code, "file_read_error");
  const malformed = writeGraph(v1()); writeFileSync(malformed, "{"); const parse = cli(["validate", malformed]); assert.equal(parse.status, 2); assert.equal(JSON.parse(parse.stdout).error.code, "json_parse_error"); const usage = cli([]); assert.equal(usage.status, 2); assert.equal(JSON.parse(usage.stdout).error.code, "usage_error");
});
test("CLI frontier honors --max and descendants", () => { const file = writeGraph(v1([task("a"), task("b", { depends_on: ["a"] }), task("c")])); const frontier = cli(["frontier", file, "--max", "1"]); assert.equal(frontier.status, 0, frontier.stderr); assert.deepEqual(JSON.parse(frontier.stdout).selected, ["a"]); const descendants = cli(["descendants", file, "a"]); assert.equal(descendants.status, 0, descendants.stderr); assert.deepEqual(JSON.parse(descendants.stdout).descendants, ["b"]); });
test("frontier --all is sorted and byte-for-byte read-only", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "artifact-frontiers-")); writeFileSync(path.join(root, ".active"), "zeta\n"); for (const slug of ["zeta", "alpha"]) { const dir = path.join(root, slug); mkdirSync(dir); writeFileSync(path.join(dir, "tasks.json"), JSON.stringify(v1([task(slug)]), null, 2)); }
  const activeBefore = readFileSync(path.join(root, ".active")); const alphaBefore = readFileSync(path.join(root, "alpha/tasks.json")); const result = cli(["frontier", "--all", root]); assert.equal(result.status, 0, result.stderr); const output = JSON.parse(result.stdout); assert.equal(output.requires_explicit_slug, true); assert.deepEqual(output.artifacts.map((entry: { slug: string }) => entry.slug), ["alpha", "zeta"]); assert.deepEqual(readFileSync(path.join(root, ".active")), activeBefore); assert.deepEqual(readFileSync(path.join(root, "alpha/tasks.json")), alphaBefore); const { scanArtifactFrontiers } = await api(); assert.deepEqual(await scanArtifactFrontiers(root), output.artifacts);
});

test("frontier accounts for occupied capacity and excludes serial work while running", async () => {
  const { computeFrontier } = await api();
  const occupied = { ...v1([task("running", { status: "running" }), task("a"), task("b"), task("c")]), execution: { max_concurrent_agents: 3 } };
  assert.deepEqual(computeFrontier(occupied).selected, ["a", "b"]);
  const serial = { ...v1([task("running", { status: "running" }), task("serial", { parallel: false })]), execution: { max_concurrent_agents: 3 } };
  assert.deepEqual(computeFrontier(serial).selected, []);
});

test("frontier normalizes repository-relative file aliases", async () => {
  const { computeFrontier } = await api();
  const graph = v1([task("a", { files: ["src/shared.ts"] }), task("b", { files: ["./src/shared.ts"] }), task("c", { files: ["src/dir/../shared.ts"] })]);
  assert.deepEqual(computeFrontier(graph, 3).selected, ["a"]);
});

test("validation rejects malformed scheduling and evidence field types", async () => {
  const { validateTaskGraph } = await api();
  const malformedParallel = { ...v1(), tasks: [{ ...task("a"), parallel: "false" }] };
  assert.ok(validateTaskGraph(malformedParallel).issues.some((entry: { code: string; path: string }) => entry.code === "parallel_invalid" && entry.path === "/tasks/0/parallel"));
  const malformedEvidence = { ...v2(), tasks: [{ ...v2Task("a", { status: "passed", passes: true, attempt: 1 }), evidence_refs: [{ kind: "test", ref: 7, attempt: "1" }] }] };
  assert.ok(validateTaskGraph(malformedEvidence).issues.some((entry: { code: string; path: string }) => entry.code === "evidence_invalid" && entry.path === "/tasks/0/evidence_refs/0"));
});

test("frontier --all returns typed CLI errors for unreadable roots", () => {
  const root = path.join(tmpdir(), "missing-artifact-root");
  const result = cli(["frontier", "--all", root]);
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).error.code, "artifacts_read_error");
});