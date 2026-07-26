# Engineering Discipline Enforcement Audit Implementation Plan

> **For Pi:** Implement this plan task-by-task. The authoritative `.pi/artifacts/engineering-discipline-enforcement-audit/tasks.json` controls readiness and state; this file explains the TDD execution details.

**Goal:** Make version-2 task graphs mechanically reject tasks without non-empty observable acceptance criteria and verification commands while preserving version-1 readability, existing scheduling/evidence behavior, and canonical producer alignment.

**Discovery Level:** 3 — user-selected Deep. The implementation is locally bounded, but planning refreshed exact symbols and history, ran one local-discovery worker and one independent planning advisory, and cross-checked official JSON Schema, NIST, and Node.js sources through Context7, Exa, and Codex Search.

**Context Budget:** Approximately 45–50% across four existing tasks. Each task owns at most three files and uses 2–5 minute RED/GREEN/REFACTOR steps; the graph caps execution at one worker in the shared `main` checkout.

**Canonical inputs:**

- `.pi/artifacts/engineering-discipline-enforcement-audit/spec.md`
- `.pi/artifacts/engineering-discipline-enforcement-audit/tasks.json`
- `.pi/artifacts/engineering-discipline-enforcement-audit/research.md`

**Planning decision:** Preserve `task-1` through `task-4`, their dependencies, file ownership, and `execution.max_concurrent_agents: 1`. No task-graph delta is justified.

---

## Findings

- JSON Schema separates property existence, primitive type, and array cardinality: `required` checks presence, `type` checks primitive type, and `minItems` checks array length. Those structural checks do not express this project's policy that strings containing only whitespace are invalid, so the validator must trim only for the emptiness decision while preserving stored input. [S1]
- NIST IR 8397 recommends automated comparison with expected results and black-box negative cases derived from invalid inputs and boundaries. The TDD matrix therefore covers missing, wrong-type, empty, non-string-member, whitespace-only, combined-invalid, and repeated deterministic inputs rather than testing only a happy path. [S2]
- Node.js v24.16.0 is installed. Official Node documentation confirms that `--test-name-pattern` filters execution by test name and that `spawnSync()` exposes completed process status and captured output, matching the repository's current focused-test and CLI-fixture patterns. Focused runs prove slices; the unfiltered suite remains the regression gate. [S3]
- Local source and history show one stable pure validation core (`decode()` → `validateV2Task()`), API and CLI tests in one file, and semantic producer tests in another. Commits `b554660`, `55885f8`, and `6187563` establish tests-first graph development and later hardening; `c12ba82` establishes `tasks.json` as canonical. [S4]
- All nine retained version-2 graphs already contain non-empty `acceptance_criteria` and `verification` arrays, while three retained version-1 graphs remain compatibility inputs. No migration task or artifact edit belongs in this plan. [S4]

## Sources

- **[S1] Context7 — JSON Schema official specification:** `required`, `type`, `minItems`, and keyword separation in the JSON Schema Validation/Core specifications, retrieved 2026-07-26. https://github.com/json-schema-org/json-schema-spec/blob/main/specs/jsonschema-validation.md · https://github.com/json-schema-org/json-schema-spec/blob/main/specs/jsonschema-core.md
- **[S2] Exa — NIST IR 8397:** Black, Guttman, and Okun, *Guidelines on Minimum Standards for Developer Verification of Software*, October 2021; official CSRC record and publication. https://csrc.nist.gov/pubs/ir/8397/final · https://doi.org/10.6028/NIST.IR.8397
- **[S3] Codex Search — official Node.js documentation:** Node.js v24 test runner name filtering and `child_process.spawnSync()` result behavior, retrieved 2026-07-26. https://nodejs.org/download/release/v24.15.0/docs/api/test.html · https://nodejs.org/api/child_process.html
- **[S4] Local evidence:** `.pi/scripts/task-graph.ts`, `.pi/tests/task-graph.test.ts`, `.pi/tests/skill-system.test.ts`, `.pi/templates/prd.md`, `.pi/prompts/{create,plan,ship}.md`, retained `.pi/artifacts/*/tasks.json`, and Git commits `b554660`, `55885f8`, `6187563`, and `c12ba82`; refreshed by Fabric runs `7183c07fab514362a4fbdf40c754c740` and `29c4804c241b46cabc7a64576002afdb`.

---

## Must-Haves

### Observable Truths

1. A version-2 task with non-empty `acceptance_criteria` and `verification` string arrays validates without a task-contract issue.
2. Missing, non-array, empty, non-string-member, and whitespace-only values fail with stable field-specific codes and exact JSON paths.
3. Revalidating identical malformed input returns the same ordered issue array, and CLI validation retains exit codes 0 for valid input, 1 for invalid graphs, and 2 for usage/read/parse failures.
4. Version-1 graphs remain readable without either field, and dependency, conflict, evidence, frontier, descendant, and concurrency behavior is unchanged.
5. The PRD template and `/create` and `/plan` explicitly require and preserve both fields while stating that structural validation neither executes commands nor proves semantic adequacy.
6. Every retained artifact graph and the complete unfiltered test suite pass after implementation.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Versioned task-contract validator | Preserves raw contract arrays and emits deterministic version-2 issues | `.pi/scripts/task-graph.ts` |
| API and CLI behavior tests | Positive, negative, compatibility, ordering, and exit-code evidence | `.pi/tests/task-graph.test.ts` |
| Producer semantic tests | Cross-surface contract without paragraph snapshots | `.pi/tests/skill-system.test.ts` |
| Canonical PRD task format | Observable acceptance and executable verification requirements | `.pi/templates/prd.md` |
| Create-time producer | New graph generation and pre-save validation obligations | `.pi/prompts/create.md` |
| Plan-time producer | Stable-ID refinement and execution-contract preservation | `.pi/prompts/plan.md` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| Raw version-2 task JSON | `validateV2Task()` | `decode()` preserves raw array members on `TaskNode` | Early normalization can erase non-string member indexes and prevent exact paths. |
| Version-specific fixtures | Pure validator API | Separate `task()` and `v2Task()` helpers | Adding v2 fields to the shared v1 helper can silently weaken the compatibility test. |
| Invalid graph fixture | CLI JSON and exit status | Existing `writeGraph()` and `cli()` helpers | API-only coverage can miss exit-code or serialization regressions. |
| PRD task format | New `tasks.json` nodes | `/create` Phase 7, Phase 8, and Phase 10 | Template and conversion wording can drift from the hard validator. |
| Existing task graph | Refined implementation plan | `/plan` Phase 6 and Task Standards | Refinement can preserve IDs but accidentally drop acceptance or verification arrays. |
| Validated node | `/ship` worker envelope | Existing graph validation before dispatch | Structural presence can be overstated as command safety or successful evidence. |

No Boundaries and Testability section is needed: this feature changes behavior inside an existing pure module and existing producer surfaces; it introduces no module boundary, substitution seam, or justified gray-box exception.

---

## Resolved Design Contract

### Internal representation

- Extend the internal `TaskNode` with optional `acceptance_criteria` and `verification` values represented as raw arrays (`unknown[] | undefined`) until validation completes.
- In `decode()`, preserve an input only when it is an array; retain every raw member and member order. Treat absent and non-array values as unavailable for the field-level check.
- Do not reuse the existing `strings()` normalization for these fields because it collapses an invalid member into a field-level failure and loses the member index.
- Trim strings only to decide whether content is non-empty. Do not rewrite, normalize, deduplicate, sort, or execute stored values.

### Stable diagnostics

| Condition | Code | Path | Message contract |
| --- | --- | --- | --- |
| Missing, non-array, or empty acceptance criteria | `acceptance_criteria_invalid` | `/tasks/<i>/acceptance_criteria` | Field must be a non-empty array of non-whitespace strings. |
| Invalid acceptance member | `acceptance_criteria_invalid` | `/tasks/<i>/acceptance_criteria/<j>` | Entry must be a non-whitespace string. |
| Missing, non-array, or empty verification | `verification_invalid` | `/tasks/<i>/verification` | Field must be a non-empty array of non-whitespace strings. |
| Invalid verification member | `verification_invalid` | `/tasks/<i>/verification/<j>` | Entry must be a non-whitespace string. |

Deterministic order is existing decode/common issues first; then each task's existing dependency/state and version-2 status/attempt/evidence issues; then `acceptance_criteria`; then `verification`; then existing passed-evidence issues; dependency-cycle reporting remains last. Within an array, emit member issues in ascending index order. Do not emit member issues when the field is absent, non-array, or empty.

### Test fixture contract

- Keep `task()` as the version-1/common fixture without mandatory execution-contract fields.
- Add a `v2Task()` fixture with valid default `acceptance_criteria`, `verification`, `attempt`, and `evidence_refs`.
- Make `v2()` default to `v2Task()` and update existing version-2-only fixtures to use it.
- Build malformed raw objects outside the typed helper when testing scalar fields or non-string array members; do not weaken production or fixture typing to accommodate invalid data.
- A verification value such as a nonexistent command name is valid structural data. Its successful validation proves that validation did not attempt command execution.

### Compatibility boundary

- Apply the new checks only from the existing `graph.version === 2` branch.
- Do not change top-level graph schema, task IDs, status transitions, evidence-reference semantics, frontier selection, file-overlap normalization, descendant computation, or CLI command names.
- Do not add a dependency, implementation file, migration, runtime gate, or new lifecycle artifact.

---

## Derived Dependency Graph

> These layers are an explanatory snapshot. `tasks.json` remains authoritative, and `/ship` recomputes the live frontier after every state transition.

```text
Task 1 (task-1): needs validated spec and graph; creates RED API/CLI and producer contracts; has_checkpoint=false
Task 2 (task-2): needs task-1 RED evidence; creates version-2 core validation; has_checkpoint=false
Task 3 (task-3): needs task-1 RED evidence; creates aligned PRD/create/plan producer guidance; has_checkpoint=false
Task 4 (task-4): needs task-2 and task-3 GREEN evidence; creates integrated verification/review evidence only; has_checkpoint=false

Derived dependency layer 1: task-1
Derived dependency layer 2: task-2 + task-3
Derived dependency layer 3: task-4

Expected capacity-one execution shards: task-1 → task-2 → task-3 → task-4
```

Tasks 2 and 3 are dependency-independent and file-disjoint, but `execution.max_concurrent_agents: 1` intentionally serializes them in the shared `main` checkout. No worktree or concurrency approval is needed.

---

## Tasks

### Task 1 (`task-1`) — Lock Version-2 Execution Contracts [test]

**End state:** Focused tests compile and fail only because the validator and canonical producers do not yet enforce the approved contract, while retained baseline behavior remains green.

**Needs:** Valid `spec.md` and `tasks.json`; unchanged implementation/test source hashes; existing Node v24 test runner.

**Creates:** RED contract tests in `.pi/tests/task-graph.test.ts` and `.pi/tests/skill-system.test.ts`.

**Has checkpoint:** No.

**Files:**

- `.pi/tests/task-graph.test.ts`
- `.pi/tests/skill-system.test.ts`

**TDD steps:**

1. **Baseline, 2–5 min:** Run `node --experimental-strip-types --test .pi/tests/task-graph.test.ts` and record that all existing task-graph tests pass before test edits.
2. **Fixture separation, 2–5 min:** Extend the `Task` fixture type with optional string arrays, leave `task()` as the version-1/common fixture, add `v2Task()` with valid defaults, make `v2()` default to `v2Task()`, and update existing version-2 fixtures at the state/evidence tests to use `v2Task()`.
3. **Fixture safety, 2–5 min:** Rerun `node --experimental-strip-types --test --test-name-pattern="validates version 1 and version 2 graphs|enforces version 2 state" .pi/tests/task-graph.test.ts`; expect exit 0, proving fixture setup did not manufacture RED through syntax or baseline breakage.
4. **Positive and field-shape matrix, 2–5 min:** Add `test("version 2 task execution contracts", ...)` with a valid node plus missing, scalar, object, empty-array, and null cases for each field; assert the preferred code and field path.
5. **Member matrix, 2–5 min:** Add non-string, whitespace-only, and mixed valid/invalid arrays; assert only invalid member paths in ascending index order and confirm outer whitespace around non-empty text remains structurally valid.
6. **Determinism and version boundary, 2–5 min:** Deep-compare two validation results for one combined-invalid v2 graph, assert acceptance issues precede verification issues, and validate an equivalent v1 graph without either field.
7. **Inert-data witness, 2–5 min:** Use a syntactically valid but nonexistent command string in `verification`; assert validation succeeds so any accidental execution would make the test fail for the right reason.
8. **CLI witness, 2–5 min:** Add a serialized invalid-v2 CLI case using `writeGraph()`/`cli()`; assert exit 1, parseable JSON, the exact field code/path, and byte-identical output on repetition. Retain existing exit-2 read/parse/usage cases.
9. **Producer RED, 2–5 min:** Add `test("graph producers emit executable task contracts", ...)` in `.pi/tests/skill-system.test.ts`. Assert semantic requirements across the template, `/create`, and `/plan`: both field names, non-empty observable criteria, repository-supported commands, preservation during conversion/refinement, and the structural-versus-semantic boundary.
10. **Observe RED, 2–5 min:** Run `node --experimental-strip-types --test --test-name-pattern="version 2 task execution contracts|graph producers emit executable task contracts" .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`; expect exit 1 with only the two new contracts failing, not a syntax/import/fixture failure.
11. **Retained baseline, 2–5 min:** Run `node --experimental-strip-types --test --test-name-pattern="validates version 1 and version 2 graphs|graph producers use one canonical task graph" .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`; expect exit 0.
12. **Hygiene, 2–5 min:** Run `git diff --check -- .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`; expect no output and exit 0.

**Stop conditions:** The new focused test passes before production changes; RED is caused by a syntax/type-fixture defect; an existing compatibility test fails; or the tests require implementation-only access, mocks, new files, or dependencies.

**Risk:** A shared fixture could accidentally add v2 requirements to v1 and create a false compatibility signal. The separate `v2Task()` helper is mandatory.

---

### Task 2 (`task-2`) — Enforce Version-2 Task Contracts [core]

**End state:** The pure validator emits deterministic field/member issues for incomplete version-2 execution contracts and leaves every established graph operation unchanged.

**Needs:** `task-1` passed with recorded RED evidence and unchanged producer files.

**Creates:** Green core behavior in `.pi/scripts/task-graph.ts`.

**Has checkpoint:** No.

**Files:**

- `.pi/scripts/task-graph.ts`

**TDD steps:**

1. **Representation, 2–5 min:** Add optional raw-array fields to `TaskNode`; keep them internal and unavailable as trusted strings until validation.
2. **Decode, 2–5 min:** In `decode()`, preserve raw array members and order for each contract field while mapping absent or non-array values to the field-level invalid state. Do not add common decode issues because the requirement is version-2-only.
3. **Small helper, 2–5 min:** Add one private helper that receives the raw value, stable code, base path, and messages; emit one field issue for missing/non-array/empty values or one issue per invalid member.
4. **Ordering, 2–5 min:** Call the helper from `validateV2Task()` after existing status/attempt/evidence-reference checks, first for `acceptance_criteria`, then for `verification`, and before passed-task current-evidence checks.
5. **GREEN, 2–5 min:** Run `node --experimental-strip-types --test --test-name-pattern="version 2 task execution contracts|validates version 1 and version 2 graphs|validation rejects malformed scheduling and evidence field types" .pi/tests/task-graph.test.ts`; expect exit 0.
6. **CLI and regression file, 2–5 min:** Run `node --experimental-strip-types --test .pi/tests/task-graph.test.ts`; expect all tests in the file to pass with no failures.
7. **Retained corpus, 2–5 min:** Run `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`; expect every JSON result to contain `"ok": true` and the loop to exit 0 without modifying any artifact.
8. **Parse and hygiene, 2–5 min:** Run `node --experimental-strip-types --check .pi/scripts/task-graph.ts` and `git diff --check -- .pi/scripts/task-graph.ts .pi/tests/task-graph.test.ts`; expect exit 0.
9. **REFACTOR, 2–5 min:** Review the two field calls for duplicated control flow, keep one bounded helper, and rerun steps 5–8 unchanged.

**Stop conditions:** Retained version-2 graphs fail; version-1 behavior changes; exact invalid member paths require normalizing away raw data; validation starts a subprocess; or implementation needs another module, dependency, or schema version.

**Risk:** Reusing `strings()` would collapse member failures into one field failure. Preserve raw array members until `validateV2Task()` emits indexed issues.

---

### Task 3 (`task-3`) — Align Canonical Graph Producers [workflow]

**End state:** Every canonical producer tells the parent to emit and preserve the same non-empty execution-contract arrays that the hard validator requires, without overstating structural validation.

**Needs:** `task-1` passed with producer RED evidence; stable task-graph field names and issue boundary from `task-2`.

**Creates:** Aligned guidance in the three declared producer files.

**Has checkpoint:** No.

**Files:**

- `.pi/templates/prd.md`
- `.pi/prompts/create.md`
- `.pi/prompts/plan.md`

**TDD steps:**

1. **Template rules, 2–5 min:** In `.pi/templates/prd.md` task rules, require at least one observable acceptance criterion and at least one repository-supported verification command per task.
2. **Template examples, 2–5 min:** Add an `Acceptance Criteria` bullet block before `Verification` in both task examples so the machine-convertible shape demonstrates, rather than merely states, the contract.
3. **Create task format, 2–5 min:** In `.pi/prompts/create.md` Phase 7, add observable acceptance criteria alongside the current verification requirement.
4. **Create pre-save gate, 2–5 min:** In Phase 8, require every task to have both non-empty fields. In Phase 10, require version-2 conversion to preserve `acceptance_criteria` and `verification` arrays with stable IDs and existing state initialization.
5. **Create honesty boundary, 2–5 min:** State near conversion that structural task-graph validation treats verification strings as inert data and does not prove criterion adequacy or command success.
6. **Plan preservation, 2–5 min:** In `.pi/prompts/plan.md` Phase 6, add both arrays to the fields that graph refinement must preserve while keeping `tasks.json` authoritative and task IDs stable.
7. **Plan task standard, 2–5 min:** Add observable acceptance criteria and repository-supported verification commands to Task Standards, plus the same structural-versus-semantic boundary without duplicating task-graph implementation details.
8. **GREEN, 2–5 min:** Run `node --experimental-strip-types --test --test-name-pattern="graph producers emit executable task contracts|graph producers use one canonical task graph|PRD success criteria describe externally observable behavior" .pi/tests/skill-system.test.ts`; expect exit 0.
9. **Scope review, 2–5 min:** Confirm `.pi/prompts/ship.md`, `.pi/skills/development-lifecycle/SKILL.md`, implementation tests, and artifact files are unchanged by this task.
10. **Hygiene, 2–5 min:** Run `git diff --check -- .pi/templates/prd.md .pi/prompts/create.md .pi/prompts/plan.md .pi/tests/skill-system.test.ts`; expect no output and exit 0.

**Stop conditions:** The producer test requires exact paragraph snapshots; wording introduces another graph authority; a task example lacks one of the arrays; or alignment expands into `/ship`, lifecycle skill, new artifacts, or broader strict enforcement.

**Risk:** Static prose tests can become brittle. Assert bounded semantic obligations and exact field names, not sentence order or complete paragraphs.

---

### Task 4 (`task-4`) — Verify Integrated Enforcement [verify]

**End state:** Focused behavior, every retained graph, the complete suite, scope, and independent review all confirm the approved enforcement boundary with fresh evidence.

**Needs:** `task-2` and `task-3` passed with current-attempt evidence; no owned-file hash drift after their verification.

**Creates:** Parent-owned `progress.md` verification and review evidence only; no implementation file.

**Has checkpoint:** No implementation checkpoint. Any later Git publication remains separately approval-gated by `/ship`.

**Files:** None.

**Verification steps:**

1. **Graph coherence, 2–5 min:** Run `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/engineering-discipline-enforcement-audit/tasks.json`; expect `ok: true`, version 2, and no issues.
2. **Focused contracts, 2–5 min:** Run `node --experimental-strip-types --test --test-name-pattern="version 2 task execution contracts|graph producers emit executable task contracts" .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`; expect exit 0.
3. **Task-graph regression, 2–5 min:** Run `node --experimental-strip-types --test .pi/tests/task-graph.test.ts`; expect zero failures.
4. **Retained artifacts, 2–5 min:** Run `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`; expect every graph valid and no artifact mutation.
5. **Full suite, 2–5 min:** Run `node --experimental-strip-types --test .pi/tests/*.test.ts`; expect zero failures and zero skipped tests in the unfiltered run.
6. **Read-only frontier, 2–5 min:** Run `before=$(sha256sum .pi/artifacts/.active); node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null; test "$before" = "$(sha256sum .pi/artifacts/.active)"`; expect exit 0.
7. **Scope and whitespace, 2–5 min:** Run `git diff --check -- .pi/scripts/task-graph.ts .pi/tests/task-graph.test.ts .pi/templates/prd.md .pi/prompts/create.md .pi/prompts/plan.md .pi/tests/skill-system.test.ts`; expect no output and exit 0.
8. **Owned-path review, 2–5 min:** Inspect `git status --short` and the scoped diff; confirm exactly the six declared implementation paths changed for this feature, no file was deleted, and unrelated/runtime paths remain untouched.
9. **Goal-backward review, 2–5 min:** Map each observable truth to a passing focused or integrated check; explicitly state that presence validation does not prove semantic quality or command success.
10. **Independent review, 2–5 min:** Run the `/ship` read-only Fabric review over the six-file diff, validate each finding against current source, and resolve Critical/Important findings before closure.

**Stop conditions:** Any full-suite or retained-graph failure; `.active` hash drift; plan/task ID divergence; undeclared file mutation; stale task evidence; or unresolved Critical/Important review finding.

**Risk:** Focused name-filtered tests can hide unrelated regressions. They are slice evidence only; the unfiltered suite and all-graph loop are mandatory completion gates.

---

## Failure Attribution and Recovery

| Failure | Attribution | Required response |
| --- | --- | --- |
| New tests fail to parse or import | `task-1` test defect | Keep task 1 running/failed; repair the test before production code. |
| New tests pass before implementation | `task-1` contract defect or behavior already exists | Stop and revise the test/spec rather than implementing redundant code. |
| Core test fails after task 2 | `task-2` implementation defect | Keep task 2 failed; task 4 remains blocked. |
| Producer test fails after task 3 | `task-3` wording/coverage defect | Keep task 3 failed; task 4 remains blocked. |
| Existing graph fails only under the new rule | Compatibility assumption invalid | Stop; do not edit retained artifacts or weaken validation silently. Route changed scope back to `/create`. |
| Full suite fails outside focused tests | Integrated regression or unrelated baseline drift | Attribute with current diff and hashes; do not mark task 4 passed until resolved or explicitly reported. |
| Owned file changes concurrently | Ownership overlap | Preserve both versions and stop the affected task; do not choose a winner silently. |

---

## Constitutional Compliance

**Constitutional compliance: PASS**

- The plan creates only the authorized canonical `plan.md`; implementation remains limited to six declared existing files.
- No task owns more than three implementation files.
- No dependency, package metadata, branch, worktree, commit, push, deployment, destructive operation, or unrelated lifecycle mutation is included.
- File staging/publication remains outside task execution and requires the normal separate approval.
- Tests precede production changes; no private-method test, test-only production API, speculative interface, or mock is proposed.
- Generated/runtime-managed `.pi/fabric/**`, `.pi/hindsight/**`, caches, and unrelated artifact changes remain outside ownership.

## Open Questions

None block `/ship`.

## Handoff

- Authoritative graph: `.pi/artifacts/engineering-discipline-enforcement-audit/tasks.json`
- Plan task IDs: `task-1`, `task-2`, `task-3`, `task-4`
- Graph delta: none
- Ready initial task: `task-1`
- Logical dependency layers: 3
- Effective capacity-one execution shards: 4
- Expected implementation paths: 6
- Next command: `/ship`