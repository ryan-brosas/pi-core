import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type GraphIssue = { code: string; path: string; message: string };
type EvidenceRef = { kind: string; ref: string; attempt: number };
type TaskNode = {
  id: string;
  status: string;
  passes: boolean;
  depends_on: string[];
  conflicts_with: string[];
  files: string[];
  parallel: boolean;
  attempt?: number;
  evidence_refs?: EvidenceRef[];
};
type TaskGraph = { version: 1 | 2; tasks: TaskNode[]; execution?: { max_concurrent_agents?: number } };

const V2_STATUSES = new Set(["pending", "running", "passed", "failed", "blocked", "stale"]);
const EVIDENCE_KINDS = new Set(["test", "verification", "review", "commit"]);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function issue(code: string, issuePath: string, message: string): GraphIssue {
  return { code, path: issuePath, message };
}

function decode(input: unknown): { graph?: TaskGraph; version: 1 | 2; issues: GraphIssue[] } {
  const issues: GraphIssue[] = [];
  if (!record(input)) return { version: 1, issues: [issue("root_invalid", "", "task graph must be an object")] };
  const version = input.version === 2 ? 2 : 1;
  if (input.version !== 1 && input.version !== 2) issues.push(issue("version_invalid", "/version", "version must be 1 or 2"));
  if (!Array.isArray(input.tasks)) return { version, issues: [...issues, issue("tasks_invalid", "/tasks", "tasks must be an array")] };

  const tasks: TaskNode[] = [];
  input.tasks.forEach((raw, index) => {
    const base = `/tasks/${index}`;
    if (!record(raw)) { issues.push(issue("task_invalid", base, "task must be an object")); return; }
    const id = typeof raw.id === "string" ? raw.id : "";
    const status = typeof raw.status === "string" ? raw.status : "";
    const passes = typeof raw.passes === "boolean" ? raw.passes : false;
    const depends = strings(raw.depends_on) ? raw.depends_on : [];
    const conflicts = strings(raw.conflicts_with) ? raw.conflicts_with : [];
    const files = strings(raw.files) ? raw.files : [];
    if (!id.trim()) issues.push(issue("id_invalid", `${base}/id`, "id must be a non-empty string"));
    if (typeof raw.status !== "string") issues.push(issue("status_invalid", `${base}/status`, "status must be a string"));
    if (typeof raw.passes !== "boolean") issues.push(issue("passes_invalid", `${base}/passes`, "passes must be a boolean"));
    if (!strings(raw.depends_on)) issues.push(issue("dependencies_invalid", `${base}/depends_on`, "depends_on must be a string array"));
    if (!strings(raw.conflicts_with)) issues.push(issue("conflicts_invalid", `${base}/conflicts_with`, "conflicts_with must be a string array"));
    if (!strings(raw.files)) issues.push(issue("files_invalid", `${base}/files`, "files must be a string array"));
    tasks.push({ id, status, passes, depends_on: depends, conflicts_with: conflicts, files, parallel: raw.parallel !== false,
      attempt: typeof raw.attempt === "number" ? raw.attempt : undefined,
      evidence_refs: Array.isArray(raw.evidence_refs) ? raw.evidence_refs.filter(record).map((ref) => ({ kind: String(ref.kind ?? ""), ref: String(ref.ref ?? ""), attempt: Number(ref.attempt) })) : undefined });
  });
  const execution = record(input.execution) ? { max_concurrent_agents: typeof input.execution.max_concurrent_agents === "number" ? input.execution.max_concurrent_agents : undefined } : undefined;
  return { graph: { version, tasks, execution }, version, issues };
}

export function validateTaskGraph(input: unknown): { ok: boolean; version: 1 | 2; issues: GraphIssue[] } {
  const decoded = decode(input);
  const issues = [...decoded.issues];
  const graph = decoded.graph;
  if (!graph) return { ok: false, version: decoded.version, issues };

  const firstIndex = new Map<string, number>();
  graph.tasks.forEach((task, index) => {
    if (firstIndex.has(task.id)) issues.push(issue("duplicate_id", `/tasks/${index}/id`, `duplicate task id: ${task.id}`));
    else firstIndex.set(task.id, index);
  });
  graph.tasks.forEach((task, index) => {
    task.depends_on.forEach((target, edge) => {
      if (target === task.id) issues.push(issue("self_dependency", `/tasks/${index}/depends_on/${edge}`, `task ${task.id} depends on itself`));
      else if (!firstIndex.has(target)) issues.push(issue("missing_dependency", `/tasks/${index}/depends_on/${edge}`, `missing dependency target: ${target}`));
    });
    task.conflicts_with.forEach((target, edge) => {
      if (target === task.id) issues.push(issue("self_conflict", `/tasks/${index}/conflicts_with/${edge}`, `task ${task.id} conflicts with itself`));
      else if (!firstIndex.has(target)) issues.push(issue("missing_conflict", `/tasks/${index}/conflicts_with/${edge}`, `missing conflict target: ${target}`));
    });
    if (task.passes !== (task.status === "passed")) issues.push(issue("state_pass_mismatch", `/tasks/${index}/passes`, "passes must be true exactly when status is passed"));
    if (graph.version === 2) validateV2Task(task, index, issues);
  });
  const cycle = dependencyCycle(graph.tasks, firstIndex);
  if (cycle) issues.push(issue("dependency_cycle", "/tasks", `dependency cycle: ${cycle.join(" -> ")}`));
  return { ok: issues.length === 0, version: graph.version, issues };
}

function validateV2Task(task: TaskNode, index: number, issues: GraphIssue[]): void {
  const base = `/tasks/${index}`;
  if (!V2_STATUSES.has(task.status)) issues.push(issue("status_invalid", `${base}/status`, `invalid version 2 status: ${task.status}`));
  if (!Number.isInteger(task.attempt) || (task.attempt ?? -1) < 0) issues.push(issue("attempt_invalid", `${base}/attempt`, "attempt must be a non-negative integer"));
  if (!Array.isArray(task.evidence_refs)) issues.push(issue("evidence_invalid", `${base}/evidence_refs`, "evidence_refs must be an array"));
  else task.evidence_refs.forEach((ref, refIndex) => {
    const refPath = `${base}/evidence_refs/${refIndex}`;
    if (!EVIDENCE_KINDS.has(ref.kind) || !ref.ref.trim() || !Number.isInteger(ref.attempt) || ref.attempt < 1) issues.push(issue("evidence_invalid", refPath, "evidence must have an allowed kind, non-empty ref, and positive attempt"));
  });
  if (task.status === "passed") {
    if ((task.attempt ?? 0) < 1) issues.push(issue("passed_attempt_invalid", `${base}/attempt`, "passed task must have attempt >= 1"));
    if (!task.evidence_refs?.length) issues.push(issue("passed_evidence_missing", `${base}/evidence_refs`, "passed task must reference evidence"));
    else if (!task.evidence_refs.some((ref) => ref.attempt === task.attempt)) issues.push(issue("passed_evidence_stale", `${base}/evidence_refs`, "passed task needs current-attempt evidence"));
  }
}

function dependencyCycle(tasks: TaskNode[], indices: Map<string, number>): string[] | undefined {
  const state = new Map<string, number>();
  const stack: string[] = [];
  let found: string[] | undefined;
  const visit = (id: string): void => {
    if (found) return;
    state.set(id, 1); stack.push(id);
    const node = tasks[indices.get(id)!];
    for (const dependency of node.depends_on) {
      if (!indices.has(dependency) || dependency === id) continue;
      if (state.get(dependency) === 1) { const start = stack.indexOf(dependency); found = [...stack.slice(start), dependency]; return; }
      if (!state.has(dependency)) visit(dependency);
    }
    stack.pop(); state.set(id, 2);
  };
  for (const task of tasks) if (!state.has(task.id)) visit(task.id);
  return found;
}

function validGraph(input: unknown): TaskGraph | undefined {
  const validation = validateTaskGraph(input);
  if (!validation.ok) return undefined;
  return decode(input).graph;
}
function overlap(left: TaskNode, right: TaskNode): boolean {
  const rightFiles = new Set(right.files);
  return left.files.some((file) => rightFiles.has(file));
}
function conflicts(left: TaskNode, right: TaskNode): boolean {
  return left.conflicts_with.includes(right.id) || right.conflicts_with.includes(left.id) || overlap(left, right);
}

export function computeFrontier(input: unknown, requestedMax?: number) {
  const validation = validateTaskGraph(input);
  const graph = validGraph(input);
  if (!graph) return { ok: false, issues: validation.issues, ready: [], selected: [], running: [], blocked: [], state: "invalid" };
  const byId = new Map(graph.tasks.map((task) => [task.id, task]));
  const runningTasks = graph.tasks.filter((task) => task.status === "running");
  const readyTasks: TaskNode[] = [];
  const blocked: Array<{ id: string; reasons: string[] }> = [];
  for (const task of graph.tasks) {
    if (task.status !== "pending") continue;
    const reasons: string[] = [];
    for (const dependency of task.depends_on) if (byId.get(dependency)?.status !== "passed") reasons.push(`dependency ${dependency} is ${byId.get(dependency)?.status ?? "missing"}`);
    for (const running of runningTasks) if (conflicts(task, running)) reasons.push(`conflicts with running task ${running.id}`);
    if (reasons.length) blocked.push({ id: task.id, reasons }); else readyTasks.push(task);
  }
  const graphMax = graph.execution?.max_concurrent_agents;
  const limit = Math.max(1, Math.min(3, Number.isInteger(requestedMax) ? requestedMax! : 3, Number.isInteger(graphMax) ? graphMax! : 3));
  const selected: TaskNode[] = [];
  for (const candidate of readyTasks) {
    if (selected.length >= limit) break;
    if (candidate.parallel === false) { if (selected.length === 0) selected.push(candidate); break; }
    if (selected.every((chosen) => chosen.parallel !== false && !conflicts(candidate, chosen))) selected.push(candidate);
  }
  const pending = graph.tasks.some((task) => task.status === "pending");
  const intervention = graph.tasks.some((task) => task.status === "failed" || task.status === "stale" || task.status === "blocked");
  const state = readyTasks.length ? "ready" : runningTasks.length ? "running" : pending ? (intervention ? "intervention_required" : "blocked") : intervention ? "intervention_required" : "complete";
  return { ok: true, ready: readyTasks.map((task) => task.id), selected: selected.map((task) => task.id), running: runningTasks.map((task) => task.id), blocked, state };
}

export function computeDescendants(input: unknown, taskId: string): string[] {
  const graph = validGraph(input);
  if (!graph || !graph.tasks.some((task) => task.id === taskId)) return [];
  const seen = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const task of graph.tasks) if (!seen.has(task.id) && task.depends_on.some((id) => id === taskId || seen.has(id))) { seen.add(task.id); changed = true; }
  }
  return graph.tasks.filter((task) => seen.has(task.id)).map((task) => task.id);
}

function readJson(file: string): unknown { return JSON.parse(readFileSync(file, "utf8")); }
export function scanArtifactFrontiers(artifactsDir: string) {
  return readdirSync(artifactsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort().flatMap((slug) => {
    const file = path.join(artifactsDir, slug, "tasks.json");
    try { const graph = readJson(file); return [{ slug, ...computeFrontier(graph) }]; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; return [{ slug, ok: false, issues: [], ready: [], selected: [], running: [], blocked: [], state: "unreadable", error: String(error) }]; }
  });
}

function output(value: unknown, exitCode: number): never { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); process.exit(exitCode); }
function usage(message = "usage: task-graph <validate|frontier|descendants> ..."): never { return output({ ok: false, error: { code: "usage_error", message } }, 2); }
function load(file: string): unknown {
  let text: string;
  try { text = readFileSync(file, "utf8"); } catch (error) { return output({ ok: false, error: { code: "file_read_error", message: String(error) } }, 2); }
  try { return JSON.parse(text); } catch (error) { return output({ ok: false, error: { code: "json_parse_error", message: String(error) } }, 2); }
}
function main(args: string[]): never {
  const [command, target, ...rest] = args;
  if (command === "validate" && target && rest.length === 0) { const result = validateTaskGraph(load(target)); return output(result, result.ok ? 0 : 1); }
  if (command === "frontier" && target === "--all" && rest.length === 1) return output({ ok: true, requires_explicit_slug: true, artifacts: scanArtifactFrontiers(rest[0]) }, 0);
  if (command === "frontier" && target) {
    let max: number | undefined;
    if (rest.length) { if (rest.length !== 2 || rest[0] !== "--max" || !/^[1-3]$/.test(rest[1])) return usage("--max must be 1, 2, or 3"); max = Number(rest[1]); }
    const result = computeFrontier(load(target), max); return output(result, result.ok ? 0 : 1);
  }
  if (command === "descendants" && target && rest.length === 1) {
    const graph = load(target); const validation = validateTaskGraph(graph);
    if (!validation.ok) return output(validation, 1);
    return output({ ok: true, task_id: rest[0], descendants: computeDescendants(graph, rest[0]) }, 0);
  }
  return usage();
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) main(process.argv.slice(2));