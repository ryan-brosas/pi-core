# Graph-Based Development Workflow Pilot — Implementation Plan

> **For Pi:** Execute the canonical task IDs in `tasks.json`. This plan explains them; it is not a second execution graph.

**Goal:** Make `tasks.json` the authoritative persisted work DAG and let `/ship` deterministically validate and execute a dynamically recomputed, evidence-linked ready frontier without adding a graph platform.

**Discovery Level:** 3 — architectural workflow and state-contract change. Completed external research was reused from `research.md`; one focused local `Explore` pass mapped contracts, tests, and blast radius. No additional external research is needed.

**Context Budget:** Each task is an isolated execution budget below 40%. Task 1: ~20%; Task 2: ~35%; Task 3: ~25%; Task 4: ~30%; Task 5: ~25%.

**Canonical graph:** `.pi/artifacts/graph-based-development-workflow/tasks.json`
**Derived plan revision:** 1
**Workspace note:** branch `feat/adopt-viable-bigpowers-skills` is dirty. No parallel worktree wave may start until the accepted baseline is committed/clean; otherwise execute the fork sequentially in the shared workspace.

---

## Institutional Findings

- Project memory prefers direct tools and minimal delegation; the implementation therefore uses one dependency-free module, not an extension or service.
- Recent history contains several fixes to orchestration-policy wording and fan-out detection. Every prompt edit must run `.pi/tests/skill-system.test.ts` to catch accidental policy matches.
- Existing task artifacts are version 1 and use one-sided conflict declarations, so compatibility and undirected runtime normalization are required.
- `.pi/tests/prompt-leverage.test.ts` is intentionally deleted in the working tree; this feature must not restore it.
- Current uncommitted edits to `.pi/prompts/research.md`, `.pi/skills/development-lifecycle/SKILL.md`, and `.pi/tests/skill-system.test.ts` are baseline work to preserve, not cleanup targets.
- No package manifest or local TypeScript build pipeline exists. Runtime and tests use Node built-ins with `--experimental-strip-types`.

## Must-Haves

### Observable Truths

1. A user can validate any current `tasks.json` and receive deterministic, machine-readable graph errors or success.
2. A user can see which tasks are ready now and which conflict-free shard may execute, rather than trusting stale waves or list order.
3. `/create`, `/plan`, and `/ship` use the same task IDs and one authoritative graph.
4. Existing version-1 artifacts continue to validate and report frontiers without migration.
5. Every passed version-2 task identifies current-attempt evidence supporting its state.
6. A failed or changed node invalidates affected descendants without reopening unrelated ancestors.
7. A cross-artifact frontier report cannot mutate `.active`, artifacts, branches, or worktrees.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Task-graph module/CLI | Parsing, validation, frontier/shard selection, descendants, report-only scans | `.pi/scripts/task-graph.ts` |
| Behavior tests | Executable graph and CLI contract | `.pi/tests/task-graph.test.ts` |
| Policy tests | Producer, consumer, evidence, and lifecycle contract | `.pi/tests/skill-system.test.ts` |
| Graph producer | Version-2 task emission | `.pi/prompts/create.md` |
| Graph refiner | Same-ID graph refinement and derived views | `.pi/prompts/plan.md` |
| Frontier executor | Validation, scheduling, transitions, evidence recording | `.pi/prompts/ship.md` |
| Evidence verifier | Current evidence and selective invalidation | `.pi/prompts/verify.md` |
| Shard workflow | Execution of a parent-selected ready shard | `.pi/workflows/batch-implement.md` |
| Delegation guidance | Frontier-based bounded dispatch | `.pi/skills/subagent-driven-development/SKILL.md` |
| Lifecycle contract | Four artifacts and canonical graph ownership | `.pi/skills/development-lifecycle/SKILL.md` |

### Key Links

| From | To | Via | Failure risk |
|---|---|---|---|
| `/create` | `tasks.json` | Version-2 schema emission | New work lacks attempts/evidence fields |
| `/plan` | `tasks.json` | Same task IDs and graph validation | Plan waves become a divergent second graph |
| `task-graph.ts` | `/ship` | Deterministic JSON CLI output | Prompt guesses readiness or ignores graph errors |
| `/ship` | ready tasks | Greedy conflict-free shard selection | Dependencies or file conflicts are violated |
| `/ship` | `progress.md` | Attempt-scoped evidence heading | Passed state has no audit trail |
| `/verify` | task state | Evidence/current-attempt coherence | Stale evidence remains marked passed |
| failed/changed task | descendants | Read-only descendant calculation plus explicit state update | Unrelated ancestors reopen or affected nodes remain valid |
| `frontier --all` | `.active` | Read-only filesystem scan | Reporting silently changes active work |
| selected task | repository context | Bounded file/reference/test/history search | Agent edits with incomplete blast-radius context |

## Contract Decisions

### Version-2 task node

New graphs use top-level `version: 2`. Version-2 tasks retain current fields and add:

```json
{
  "id": "task-1",
  "status": "pending",
  "passes": false,
  "attempt": 0,
  "evidence_refs": []
}
```

Allowed version-2 statuses are `pending`, `running`, `passed`, `failed`, `blocked`, and `stale`.

An evidence reference is:

```json
{
  "kind": "test",
  "ref": "progress.md#evidence-task-1-attempt-1",
  "attempt": 1
}
```

Allowed evidence kinds are `test`, `verification`, `review`, and `commit`. A passed version-2 node must have `passes: true`, `attempt >= 1`, and at least one non-empty evidence reference whose `attempt` equals the task's current attempt. Other statuses require `passes: false`. Historical references may remain after invalidation, but no longer justify a pass.

Version-1 compatibility is read-only/additive: existing fields keep their meaning, missing version-2 fields are not errors, and no existing artifact is rewritten merely by validation/reporting.

### Pure module API

`.pi/scripts/task-graph.ts` exports pure functions over `unknown` input and typed results:

- `validateTaskGraph(input)` → `{ ok, version, issues }`
- `computeFrontier(graph, requestedMax?)` → readiness diagnostics plus deterministic selected IDs
- `computeDescendants(graph, taskId)` → transitive dependent IDs in stable input order
- `scanArtifactFrontiers(artifactsDir)` → sorted report objects; filesystem reads only

Domain failures are returned as data. Each issue contains a stable `code`, JSON-style `path`, and human-readable `message`. No function reads global state, time, randomness, or environment variables.

### CLI contract

```text
node --experimental-strip-types .pi/scripts/task-graph.ts validate <tasks.json>
node --experimental-strip-types .pi/scripts/task-graph.ts frontier <tasks.json> [--max 1|2|3]
node --experimental-strip-types .pi/scripts/task-graph.ts descendants <tasks.json> <task-id>
node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all <artifacts-dir>
```

- Success prints one stable, pretty-printed JSON object and exits 0.
- Structurally invalid graphs print JSON with `ok: false` and exit 1.
- Usage, missing-file, unreadable-file, and JSON-parse failures print a typed JSON error and exit 2.
- `frontier --all` scans immediate child directories in slug order, ignores directories without `tasks.json`, reports invalid graphs without modifying them, and sets `requires_explicit_slug: true`.

### Validation invariants

- Root, task list, and required fields have expected shapes.
- IDs are non-empty and unique.
- Dependency and conflict targets exist.
- Self-dependencies and self-conflicts are rejected.
- Directed dependency edges are acyclic; the issue includes a stable cycle path.
- Version-2 status, pass, attempt, and evidence coherence is enforced.
- One-sided conflicts are accepted but normalized as undirected scheduling constraints.
- Exact normalized file-path overlap is a scheduling conflict; no filesystem resolution or persistent symbol graph is introduced.

### Frontier and shard semantics

1. Validate first; invalid graphs have no frontier.
2. `ready` contains input-order `pending` tasks whose dependencies are all `passed` and which do not conflict with a currently `running` task.
3. `selected` is a deterministic greedy subset of `ready`, preserving input order, pairwise conflict/file disjointness, and the smallest of requested maximum, graph maximum, and 3.
4. A task with `parallel: false` is selected alone.
5. The result also reports running IDs and blocked reasons for non-ready pending tasks.
6. No-ready output distinguishes complete graph, active running work, failed/stale intervention, and unmet dependencies.

### Transition and invalidation semantics

- Start: `pending → running`, increment `attempt`, clear `passes`.
- Pass: append attempt-scoped evidence to `progress.md`, add matching `evidence_refs`, then set `running → passed` and `passes: true`.
- Fail: set `running → failed`, keep `passes: false`, and record failure evidence.
- Failed or changed upstream node: use `descendants`; pending descendants become `blocked`, passed/running descendants become `stale` with `passes: false`, and already failed/stale descendants retain their state.
- Recovery: after an upstream pass, a blocked descendant returns to `pending` only when all dependencies pass. A stale node requires explicit re-execution or verification.
- Ancestors never reopen automatically. Reopen only when recorded failure attribution names the ancestor or its produced output changed.

## Blast Radius and Rollback

- **Entry points:** `/create`, `/plan`, `/ship`, `/verify`, and direct CLI invocation.
- **Direct dependents:** batch implementation, subagent development guidance, lifecycle skill, policy tests, and all active task artifacts.
- **Transitive effects:** task schema generation, state transitions, worktree shard selection, progress evidence, and plan/task coherence.
- **Public contracts:** version-1 reading, version-2 writing, CLI JSON shapes/exit codes, status semantics, and the four-artifact lifecycle.
- **Rollback:** revert the five task commits in reverse dependency order. Because there is no database, extension, or automatic migration, rollback is file-local; version-2 artifacts remain readable JSON but old prompts will not understand their added fields.
- **Stop planning/implementation if:** an affected prompt or test cannot be inspected, another active feature changes the same files, version-1 fixtures fail before graph code is introduced, or Node cannot import the module under `--experimental-strip-types`.

## Derived Dependency Graph

This graph mirrors `tasks.json`; waves are derived snapshots only.

```text
task-1 Establish graph behavior and policy contracts
  needs: nothing
  creates: .pi/tests/task-graph.test.ts and RED policy assertions

        ↓

task-2 Implement deterministic task-graph utility
  needs: task-1
  creates: .pi/scripts/task-graph.ts

        ↓
        ├─────────────────────────────────────┐
        ↓                                     ↓
task-3 Make task producers graph-canonical   task-4 Execute the dynamic ready frontier
  needs: task-2                                needs: task-2
  creates: producer/lifecycle policy           creates: frontier execution policy
        └──────────────────┬──────────────────┘
                           ↓
task-5 Link evidence and selective invalidation
  needs: task-3, task-4
  creates: evidence/invalidation policy and integrated green suite
```

**Derived Wave 1:** task-1
**Derived Wave 2:** task-2
**Derived Wave 3:** task-3 + task-4, only from a clean common baseline; otherwise sequential fallback
**Derived Wave 4:** task-5

## Task 1 — Establish graph behavior and policy contracts `[test]`

**End state:** Executable tests define the utility and prompt contracts and fail only because the specified graph behavior is absent.

**Files:** `.pi/tests/task-graph.test.ts`, `.pi/tests/skill-system.test.ts`
**Needs:** none
**Creates:** RED behavior and policy evidence
**Context target:** ~20%

### TDD steps

1. Inspect the current diff of `.pi/tests/skill-system.test.ts`; preserve existing fan-out and research tests.
2. Create `.pi/tests/task-graph.test.ts` using only `node:test`, `node:assert/strict`, `node:fs`, `node:os`, `node:path`, and `node:child_process`.
3. Add a dynamic-import contract test for the four exported functions so the test file itself loads and the missing module fails at runtime.
4. Add inline graph factories for valid v1, valid v2, and one-invalid-invariant-at-a-time fixtures.
5. Add named tests for duplicate IDs, dangling targets, self-edges, stable cycle paths, status/pass coherence, attempt validation, and current-attempt evidence.
6. Add frontier tests for dependency gating, running conflicts, one-sided conflicts, exact file overlap, `parallel: false`, deterministic order, and the maximum-three cap.
7. Add descendants tests for transitive closure, stable order, unknown task IDs, and no ancestor leakage.
8. Add CLI tests for exit codes 0/1/2, deterministic JSON, malformed JSON, missing files, `--max`, and usage errors.
9. Add an isolated temporary artifact-tree test for sorted `frontier --all` output; compare `.active` and every fixture file byte-for-byte before and after.
10. Add three named assertions to `.pi/tests/skill-system.test.ts`: `graph producers use one canonical task graph`, `ship executes a validated dynamic frontier`, and `graph state is evidence-linked and selectively invalidated`.
11. Run behavior tests and confirm RED from missing utility behavior, not syntax or test-loader errors.
12. Run policy tests and confirm RED from missing prompt/skill wording only.
13. Append commands and failure summaries to active `progress.md`; do not modify production surfaces.

**RED verification:**

```bash
node --experimental-strip-types --test .pi/tests/task-graph.test.ts
node --experimental-strip-types --test --test-name-pattern="graph producers use one canonical task graph|ship executes a validated dynamic frontier|graph state is evidence-linked and selectively invalidated" .pi/tests/skill-system.test.ts
```

**Suggested commit:** `test(workflow): specify task graph contract`

## Task 2 — Implement deterministic task-graph utility `[core]`

**End state:** One dependency-free module makes all graph behavior tests green and validates current version-1 artifacts.

**Files:** `.pi/scripts/task-graph.ts`
**Needs:** task-1
**Creates:** importable pure core plus read-only CLI
**Context target:** ~35%

### TDD steps

1. Re-run the smallest dynamic-import test and confirm RED.
2. Create `.pi/scripts/task-graph.ts` with domain types, stable issue codes, result unions, and stubbed exported functions; keep CLI effects at the bottom.
3. Decode `unknown` root/task input into the internal graph model without unchecked broad casts; return shape issues as data.
4. Run only shape/version tests; implement the minimum needed for green.
5. Add ID and edge-target validation, including self-edges; run the matching tests.
6. Implement deterministic dependency-cycle detection using input-order DFS and return the stable cycle path; run cycle tests.
7. Implement version-gated state, attempt, and evidence validation; run v1/v2 compatibility tests.
8. Implement ready diagnostics and current-running conflict checks; run dependency/running tests.
9. Implement deterministic greedy shard selection with input order, one-sided conflict normalization, exact file overlap, `parallel: false`, and maximum-three enforcement; run frontier tests.
10. Implement transitive descendant calculation without mutation; run impact tests.
11. Add filesystem adapters for file loading and sorted immediate-child artifact scans; keep pure graph logic separate.
12. Add CLI parsing and stable JSON/exit behavior for `validate`, `frontier`, `descendants`, and `frontier --all`.
13. Run read-only scan tests twice to prove deterministic output and unchanged bytes.
14. Validate every current artifact and inspect output; do not rewrite version-1 files.
15. Run the complete behavior suite and `git diff --check`.

**GREEN verification:**

```bash
node --experimental-strip-types --test .pi/tests/task-graph.test.ts
for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done
node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts
git diff --check -- .pi/scripts/task-graph.ts .pi/tests/task-graph.test.ts
```

**Suggested commit:** `feat(workflow): add task graph frontier utility`

## Task 3 — Make task producers graph-canonical `[workflow]`

**End state:** New work is emitted as version 2, planning refines the same IDs, and lifecycle guidance names `tasks.json` as the only persisted work graph.

**Files:** `.pi/prompts/create.md`, `.pi/prompts/plan.md`, `.pi/skills/development-lifecycle/SKILL.md`
**Needs:** task-2
**Creates:** canonical producer/refiner contract
**Context target:** ~25%
**Parallel:** may run with task-4 from a clean task-2 baseline

### TDD steps

1. Run only the graph-producer policy test and confirm RED.
2. Inspect existing uncommitted changes in the lifecycle skill and preserve standalone research behavior.
3. Update `/create` task conversion to emit top-level version 2 and initialize each node with `attempt: 0` and `evidence_refs: []`; retain existing IDs, dependencies, conflicts, files, status, and verification fields.
4. Require `/create` to run the task-graph validator after writing and stop without changing execution state when validation fails.
5. Update `/plan` guards to validate the canonical graph before planning.
6. Replace authoritative `needs`/wave language with same-ID refinement: node splits/merges update `tasks.json` first, then regenerate the human-readable dependency section.
7. Label every displayed wave as a derived snapshot and add plan/task ID divergence as a stop condition.
8. Update lifecycle guidance so `tasks.json` is authoritative, `plan.md` is explanatory, `progress.md` is evidence, and the four canonical files remain unchanged.
9. Run the producer policy test, full skill-system suite, and focused wording search.
10. Review the diff for duplicated lifecycle rules or a fifth state mechanism.

**Verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="graph producers use one canonical task graph" .pi/tests/skill-system.test.ts
node --experimental-strip-types --test .pi/tests/skill-system.test.ts
rg -n "version 2|authoritative|derived.*wave|task-graph" .pi/prompts/create.md .pi/prompts/plan.md .pi/skills/development-lifecycle/SKILL.md
git diff --check -- .pi/prompts/create.md .pi/prompts/plan.md .pi/skills/development-lifecycle/SKILL.md
```

**Suggested commit:** `feat(workflow): make task graph canonical`

## Task 4 — Execute the dynamic ready frontier `[workflow]`

**End state:** Shipping validates the graph, selects only a current conflict-free shard, derives bounded task context, and recomputes after each transition/integration.

**Files:** `.pi/prompts/ship.md`, `.pi/workflows/batch-implement.md`, `.pi/skills/subagent-driven-development/SKILL.md`
**Needs:** task-2
**Creates:** frontier-based execution contract
**Context target:** ~30%
**Parallel:** may run with task-3 from a clean task-2 baseline

### TDD steps

1. Run only the frontier-execution policy test and confirm RED.
2. Update `/ship` guards to run `validate` on the active `tasks.json`; malformed/invalid graphs stop before routing or file edits.
3. If `plan.md` exists, require its task IDs to match the canonical graph; never parse its old wave snapshot as execution state.
4. Replace one-time independent-task counting and static-wave routing with `frontier` output.
5. Define no-ready handling: complete → verification; running → report active work; unmet dependencies → report reasons; failed/stale → require recovery; invalid → stop.
6. Dispatch only `selected` IDs, preserving the at-most-three policy and direct execution for one selected task.
7. Before each selected task, derive a transient neighborhood from declared files, references/imports, nearby tests, public contracts, and relevant git history; record the bounded result in `progress.md`.
8. Stop a task for focused discovery if declared files and neighborhood evidence materially disagree; do not persist a repository graph.
9. Update `batch-implement` to accept only the parent-selected current shard, not a whole static plan; after integration the parent reruns validation/frontier.
10. Update subagent development guidance to consume a validated ready shard and forbid child-side graph scheduling or `.active` changes.
11. Keep `frontier --all` report-only and keep `/ship` scoped to the explicitly active slug; never dispatch from the all-artifact report.
12. Run the policy test, utility behavior suite, full skill-system suite, and diff review.

**Verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="ship executes a validated dynamic frontier" .pi/tests/skill-system.test.ts
node --experimental-strip-types --test .pi/tests/task-graph.test.ts
node --experimental-strip-types --test .pi/tests/skill-system.test.ts
git diff --check -- .pi/prompts/ship.md .pi/workflows/batch-implement.md .pi/skills/subagent-driven-development/SKILL.md
```

**Suggested commit:** `feat(workflow): execute dynamic task frontier`

## Task 5 — Link evidence and selective invalidation `[workflow]`

**End state:** Passed nodes cite current-attempt evidence, failures/changes stale only affected descendants, and the integrated graph workflow passes all gates.

**Files:** `.pi/prompts/ship.md`, `.pi/prompts/verify.md`
**Needs:** task-3, task-4
**Creates:** evidence-linked transition and recovery contract
**Context target:** ~25%

### TDD steps

1. Join task-3 and task-4 only after inspecting both diffs and rerunning their focused tests.
2. Run the evidence/invalidation policy test and confirm RED.
3. In `/ship`, define start transition: increment attempt, set running, and preserve historical evidence.
4. Define pass ordering: append a uniquely anchored evidence section to `progress.md`, add matching current-attempt references, then mark passed.
5. Define failure ordering: append failure evidence, mark failed, run `descendants`, block pending descendants, and stale passed/running descendants.
6. Define recovery: release blocked nodes to pending only when all dependencies pass; stale nodes require explicit rerun/verification; ancestors remain unchanged without recorded attribution.
7. Update `/verify` completeness/coherence checks to compare status, current attempt, evidence refs, referenced progress evidence, and changed upstream artifacts.
8. When `/verify` finds stale evidence, apply the same descendant rules and report exact affected IDs; do not blanket-reset the graph.
9. Revalidate and recompute the frontier after every state mutation.
10. Run all retained tests; confirm the deleted prompt-leverage test remains deleted and unrelated user changes remain untouched.
11. Run the CLI against all current artifacts and inspect deterministic output.
12. Run full coherence review: spec vs tasks vs plan IDs, utility contract vs prompt commands, and evidence state vs lifecycle rules.
13. Append final verification and pilot-baseline instructions to `progress.md`.

**Verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="graph state is evidence-linked and selectively invalidated" .pi/tests/skill-system.test.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done
before=$(sha256sum .pi/artifacts/.active)
node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null
test "$before" = "$(sha256sum .pi/artifacts/.active)"
git diff --check
```

**Suggested commit:** `feat(workflow): link task evidence and invalidation`

## Integration and Pilot Gate

After task-5 passes:

1. Run the full suite and all graph CLI probes from the success criteria.
2. Review the complete diff for duplicate state, unnecessary files, unsafe cross-artifact behavior, and prompt/utility contract drift.
3. Record a baseline for the next three comparable 3–6-task changes: wall time, model/tool usage, reruns, review defects, manual state repairs, and relevant-file recall.
4. Do not claim the graph workflow improves outcomes until the pilot threshold in `research.md` is met.
5. If operator overrides or state repairs increase, retain validation/reporting but roll back dynamic scheduling expansion.

## Stop Conditions

- The active slug changes during implementation.
- Another feature edits any file owned by the current task.
- A version-1 artifact fails the new validator without a demonstrated pre-existing structural defect.
- RED tests fail from syntax, loader, or fixture errors rather than missing behavior.
- Prompt policy and CLI output cannot be reconciled without a second state source.
- Cross-artifact reporting changes `.active` or any artifact bytes.
- A parallel wave lacks a clean common commit; use sequential fallback instead of unsafe shared-workspace concurrency.

## Constitutional Compliance

- No destructive Git operations, verification bypasses, broad staging commands, secrets, or new package dependencies are planned.
- Every implementation task owns at most three production/test files after splitting evidence work into task-5.
- New code is one dependency-free module with pure core and effects at the CLI boundary.
- Existing unrelated deletions and dirty changes are explicitly preserved.

**Result:** PASS. No critical violations; the original four-file consumer task was split into task-4 and task-5 to resolve the file-count warning and preserve TDD-sized execution.