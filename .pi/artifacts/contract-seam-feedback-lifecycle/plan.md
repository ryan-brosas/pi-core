# Contract–Seam–Feedback Lifecycle Kernel Implementation Plan

> **For Pi:** Implement this plan task-by-task. `tasks.json` is authoritative; recompute the live frontier after every graph transition.

**Goal:** Make Pi Core's lifecycle consistently define observable contracts, justify seams, select evidence by consequence, deliver thin safe slices, and route feedback to the earliest phase that must change without adding lifecycle state or automatic cycling.

**Discovery Level:** 3 — User-selected deep planning. Existing source-backed research was reused, two independent read-only local specialists mapped edit neighborhoods and TDD contracts, and one dependent read-only planning advisor resolved cross-surface sequencing. No fresh external retrieval was needed because the canonical research already answers the external questions and no library or API choice remains.

**Context Budget:** Target 45–50% maximum per execution. The graph remains serial: task 1 about 30%, task 2 about 30%, task 3 about 45%, task 4 about 45%, and task 5 about 35%.

**Canonical graph:** `.pi/artifacts/contract-seam-feedback-lifecycle/tasks.json`, version 2. This plan preserves all five task IDs, dependencies, files, and `max_concurrent_agents: 1`; no graph delta is required.

---

## Institutional Evidence

- Current-session Hindsight context preserves the three user decisions: name the kernel only in the lifecycle skill; make MVP guidance conditional to product/release work; use the approved bounded risk set. Hindsight remains the sole durable memory authority.
- Recent affected-surface history is anchored by `53fa293` (Fabric migration), `2118b28` (Hindsight-only memory), `db5f6cf` (planning boundary/testability contract), and `dd7327c` (legacy Agent capture removal).
- `.pi/tests/skill-system.test.ts` is a high-overlap surface changed by all four anchors. Task 1 owns all new tests; later tasks only read them.
- The completed `.pi/artifacts/seam-blackbox-greybox-workflow/` artifact owns the planning-specific seam contract and remains unchanged.
- Existing research at `.pi/artifacts/contract-seam-feedback-lifecycle/research.md` records Feathers, NIST, Agile/Scrum, DORA, Fowler, Pact, and Ries evidence. Planning found no material source gap.

---

## Must-Haves

### Observable Truths

1. Maintainers find one named Contract–Seam–Feedback authority in the lifecycle skill, while phase prompts contain only their local plain-language obligations.
2. Initialization, research, and specification creation produce decision-relevant outcomes, evidence, observable behavior, risk controls, and conditional product/release learning guidance.
3. Shipping and verification favor the smallest safe end-to-end slice, observable evidence first, and deeper evidence only for the approved consequences or a named evidence gap.
4. Verification feedback recommends `research`, `create`, `plan`, or `ship` without invoking another phase, mutating `.active`, or claiming that technical gates validate a product hypothesis.
5. The four-artifact model, Hindsight authority, task-graph authority, completed planning contract, full test suite, and all artifact graphs remain intact.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Lifecycle policy contracts | Four deterministic RED/GREEN semantic checks | `.pi/tests/skill-system.test.ts` |
| Single lifecycle authority | Named kernel, artifact mapping, evidence selection, and feedback routing | `.pi/skills/development-lifecycle/SKILL.md` |
| Initialization hook | Intended outcome, material boundaries, and evidence channels | `.pi/prompts/init.md` |
| Research hook | Decision question, alternatives, contract impact, and unresolved risks | `.pi/prompts/research.md` |
| Specification hook | Essential behavior, controls, and conditional learning signal | `.pi/prompts/create.md` |
| Delivery hook | Thin safe slice and observable boundary evidence | `.pi/prompts/ship.md` |
| Verification hook | Consequence escalation, evidence vantage, MVP distinction, and routing | `.pi/prompts/verify.md` |
| Optional orchestration helper | Explicitly bounded, optional, parent-controlled, and non-cyclic positioning | `.pi/workflows/development-lifecycle-workflow.md` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| `spec.md` | `tasks.json` | Stable task IDs and file ownership | Explanatory plan diverges from scheduling authority |
| Policy tests | Lifecycle surfaces | `readRequired` plus bounded semantic assertions | Tests pass on unrelated words or fail on harmless rewording |
| Lifecycle skill | Phase prompts | Single named authority plus phase-local hooks | Doctrine is duplicated and drifts |
| `init` / `research` / `create` | Observable contract | Existing Detect, Document, and Write PRD sections | Context is collected without changing a decision |
| `ship` | Behavioral evidence | Existing TDD flow plus thin-slice rule | Work is split horizontally or tests internals |
| `verify` | Evidence depth and next phase | Consequence set, evidence gap, and routing table | File count substitutes for risk or routing becomes automatic |
| Existing planning surfaces | New lifecycle kernel | Preservation tests and untouched-file checks | Completed seam/gray-box guidance is reopened or contradicted |

### Boundary and Verification-Vantage Determination

This feature changes published lifecycle policy and introduces no runtime module boundary, dependency, adapter, interface, or behavior-substitution point. Therefore the conditional **Boundaries and Testability** template is intentionally omitted. The policy tests are structural checks over stable published surfaces because no deterministic runtime harness executes slash prompts and inspects generated behavior; that named evidence gap does not justify private-method mocking or a production seam.

---

## Derived Dependency Graph

> This is an explanatory snapshot. `/ship` must use the current `tasks.json` frontier rather than these wave labels.

```text
task-1: needs nothing
        creates four genuine RED lifecycle policy contracts

task-2: needs task-1
        creates the single kernel authority and optional workflow positioning

task-3: needs task-1
        creates init/research/create decision-bearing hooks

task-4: needs task-1
        creates ship/verify delivery, evidence, MVP, and routing hooks

task-5: needs task-2, task-3, task-4
        creates integrated test, graph, scope, and independent-review evidence

Derived readiness wave 1: task-1
Derived readiness wave 2: task-2, task-3, task-4
  Graph capacity is one, so fresh frontier selections are expected serially in graph order:
  task-2 → task-3 → task-4
Derived readiness wave 3: task-5
```

**Current frontier:** `task-1` is the sole ready and selected node. Tasks 2–5 are dependency-blocked as intended.

---

## Execution Contract

- The parent owns `.active`, `tasks.json`, `progress.md`, attempts, evidence refs, frontier recomputation, final review, and all completion claims.
- A bounded worker owns only the exact files declared by its selected task. It does not edit lifecycle artifacts, schedule siblings, delegate, stage, commit, integrate, publish, or create workspace isolation.
- Before every edit, the parent records scoped status and the worker reads the current file around the stable anchor. Concurrent overlap on an owned line stops that task.
- Task 1 must produce genuine RED evidence before any production surface changes. Tasks 2–4 must re-run their focused RED subset before editing and GREEN it afterward.
- No Git publication or integration action is part of this plan. Such actions remain separate approval checkpoints.

---

## Tasks

### Task 1 — Lock Lifecycle Kernel Contracts [test]

**End state:** Four focused policy tests fail only because the approved lifecycle behavior is absent, while the existing planning and Hindsight baselines remain green.

**Files:**
- `.pi/tests/skill-system.test.ts`

**Needs:** Valid version-2 graph; current planning and Hindsight baseline tests passing; no overlapping edit on the test file.

**Creates:** Four tests named:
1. `contract-seam-feedback kernel is semantically single-sourced`
2. `lifecycle intake phases expose decision-bearing contracts`
3. `delivery phases select observable and consequence-based evidence`
4. `lifecycle workflow is optional and non-cyclic`

**Context budget:** ~30%.

#### TDD Steps

1. Parent changes `task-1` from pending to running, increments attempt to 1, validates the graph, and confirms the fresh frontier reports running work.
2. Read `.pi/tests/skill-system.test.ts` around `readRequired`, existing lifecycle tests, planning-boundary tests, and Hindsight tests; confirm current content still matches the inspected anchors.
3. Run the existing baseline:
   ```bash
   node --experimental-strip-types --test --test-name-pattern="planning boundaries and testability contract is conditional|parent lifecycle memory policy uses Hindsight" .pi/tests/skill-system.test.ts
   ```
   Expected: 2 tests selected, 2 passed, 0 failed.
4. Add the single-source test. It must require one named kernel authority and compact rule in the lifecycle skill, require the artifact/feedback semantics, and reject the full name or `CSF` acronym in the five phase prompts and optional workflow.
5. Run only `contract-seam-feedback kernel`. Expected RED: 1 selected failure caused by the missing positive lifecycle definition; negative prompt/workflow checks already pass.
6. Add the intake test. Scope assertions to the existing Detect Project, Document, and Write PRD sections; require semantic marker groups rather than exact sentences.
7. Run only `lifecycle intake phases`. Expected RED: 1 selected failure caused by missing init/research/create obligations, not parsing or missing-file errors.
8. Add the delivery test. Check the exact approved risk categories through an explicit token set; separately assert thin-slice, evidence-vantage, evidence-gap, routing, conditional readiness, and non-automatic behavior.
9. Run only `delivery phases`. Expected RED: 1 selected failure caused by missing ship/verify obligations.
10. Add the optional-workflow test. Require optional/bounded/helper and non-cyclic semantics while preserving `/research` as sideways and `tasks.json` as authoritative.
11. Run the four-test pattern together. Expected RED: 4 selected, 0 passed, 4 failed for the intended missing contracts.
12. Re-run the 2-test baseline and `git diff --check -- .pi/tests/skill-system.test.ts`. Expected: baseline remains 2/2 green and no whitespace errors. Parent inspects the diff, records unique RED evidence in `progress.md`, adds current-attempt evidence refs, marks task 1 passed, validates, and recomputes the frontier.

**Assertion discipline:** Use bounded sections and semantic marker groups. Do not assert complete paragraph text, sentence order, transient line numbers, or a negative condition without a positive obligation in the same test.

**Stop conditions:** Stop if a new test passes before production changes, a baseline test regresses, a failure is caused by malformed test code, or another process changes the owned test region.

---

### Task 2 — Establish the Lifecycle Kernel and Optional Workflow [docs]

**End state:** The lifecycle skill is the sole named authority and maps artifacts, phase obligations, evidence selection, and feedback routes; the generic workflow is explicitly optional and non-cyclic without repeating the kernel.

**Files:**
- `.pi/skills/development-lifecycle/SKILL.md`
- `.pi/workflows/development-lifecycle-workflow.md`

**Needs:** Current-attempt RED evidence from task 1; no drift in the lifecycle skill or workflow.

**Creates:** One named kernel section, one existing-artifact mapping, one advisory feedback route table, and one optional-workflow clarification.

**Context budget:** ~30%.

#### TDD Steps

1. Parent starts `task-2`, validates the graph, and confirms task 2 is the only selected node under the one-worker capacity.
2. Re-run `contract-seam-feedback kernel|lifecycle workflow is optional`. Expected RED: both selected tests still fail for missing production wording.
3. In `.pi/skills/development-lifecycle/SKILL.md`, insert `## Contract–Seam–Feedback Kernel` after the standalone-research paragraph and before `## Slash Commands (Lifecycle Hooks)`.
4. In that section, define observable behavior first; seams only for named variance, trust boundaries, or failure risks with an enabling point and concrete alternative; outside-first evidence plus deeper evidence for a named gap/consequence; the smallest safe vertical slice; and feedback to the earliest contract that must change.
5. Add the compact four-rule statement once: observable contract, concrete variance, named gray-box evidence gap, and learning signal for MVP claims. Keep the full name and acronym out of all other files.
6. Add an existing-authority mapping without changing the artifact table: observable contract in `spec.md`, boundary/seam and evidence design in `plan.md`, scheduling in `tasks.json`, attempt evidence and route decision in `progress.md`, and durable cross-feature learning in Hindsight.
7. Add a feedback route table near the lifecycle workflow/rules: unknown fact → `research`; changed desired behavior → `create`; architecture/design gap → `plan`; known implementation defect → `ship`. State that route selection never invokes a command, mutates `.active`, or changes lifecycle state automatically.
8. In `.pi/workflows/development-lifecycle-workflow.md`, extend the introduction only: this is an optional one-shot helper for a parent-selected case, not the canonical lifecycle; it should not be used when approach research is already resolved; it does not loop, mutate active state, or trigger another phase automatically.
9. Run the two focused tests. Expected GREEN: 2 selected, 2 passed, 0 failed.
10. Run the preservation subset:
    ```bash
    node --experimental-strip-types --test --test-name-pattern="graph producers use one canonical task graph|parent lifecycle memory policy uses Hindsight|Fabric coordination remains direct-first and parent-verified" .pi/tests/skill-system.test.ts
    ```
    Expected: all selected tests pass.
11. Run `git diff --check` on the two owned files and inspect their scoped diff. Confirm the existing artifact table, Hindsight wording, Fabric limits, and workflow phase bodies remain otherwise intact.
12. Parent records GREEN evidence, marks task 2 passed, validates, and recomputes the frontier.

**Stop conditions:** Stop if the change requires another file, duplicates the kernel in the workflow, weakens Hindsight or graph authority, changes Fabric concurrency, or implies an automatic transition.

---

### Task 3 — Align Intake and Decision Phases [prompt]

**End state:** `init`, `research`, and `create` produce bounded decision inputs, observable contracts, risk controls, and conditional product/release learning signals without naming the kernel.

**Files:**
- `.pi/prompts/init.md`
- `.pi/prompts/research.md`
- `.pi/prompts/create.md`

**Needs:** Task 1 passed; current prompt sections still match the stable anchors; task 2 changes integrated and verified.

**Creates:** Three phase-local policy blocks in existing sections, with no new lifecycle phase or artifact.

**Context budget:** ~45%.

#### TDD Steps

1. Parent starts `task-3`, validates the graph, and confirms the fresh frontier selects only task 3.
2. Re-run `lifecycle intake phases`. Expected RED: 1 selected failure for missing prompt obligations.
3. In `.pi/prompts/init.md`, extend `### Phase 1: Detect Project` after the validated-fact list and before `With --deep`.
4. Require validated intended outcome or product hypothesis when relevant, major external/trust/volatility boundaries, and available evidence or feedback channels. Unsupported facts remain omissions; initialization must not invent seams or future adapters.
5. Re-run the intake test. Expected: still RED, with init assertions satisfied and the next missing surface reported.
6. In `.pi/prompts/research.md`, extend `### Phase 4: Document` without changing Artifact Destination. Require the decision question, evidence, confidence, alternatives, contract impact, and unresolved risks; retain medium-or-higher stopping and on-demand research.
7. Re-run the intake test. Expected: still RED only for the create obligations.
8. In `.pi/prompts/create.md`, extend `## Phase 7: Write PRD` after the required-section table and before Task Format. Require essential journeys, inputs, outputs, errors, side effects, non-goals, and non-deferrable controls in observable success behavior.
9. In the same block, require a measurable learning signal or real feedback path only for product/release-level specifications; explicitly state that internal tooling must not invent one and that tests prove readiness, not validated learning.
10. Run `lifecycle intake phases`. Expected GREEN: 1 selected, 1 passed, 0 failed.
11. Run the preservation subset:
    ```bash
    node --experimental-strip-types --test --test-name-pattern="research prompt always persists a research artifact|init policy synthesis preserves evidence and existing content|graph producers use one canonical task graph" .pi/tests/skill-system.test.ts
    ```
    Expected: all selected tests pass.
12. Confirm no kernel naming leaked into the prompts:
    ```bash
    if rg -n 'Contract[–-]Seam[–-]Feedback|\bCSF\b' .pi/prompts/init.md .pi/prompts/research.md .pi/prompts/create.md; then exit 1; fi
    ```
    Expected: no output, exit 0.
13. Run `git diff --check` on the three owned files and inspect the diff for changes limited to the named sections. Parent records evidence, marks task 3 passed, validates, and recomputes the frontier.

**Stop conditions:** Stop if observable-behavior policy leaks into technical-context sections, MVP language becomes universal, research routing changes, init approval behavior changes, or a fourth file is needed.

---

### Task 4 — Align Delivery, Verification, and Feedback [prompt]

**End state:** `ship` and `verify` favor observable thin slices, deepen evidence for the exact approved consequence set, separate experiment readiness from learning, and route feedback without automatic transitions.

**Files:**
- `.pi/prompts/ship.md`
- `.pi/prompts/verify.md`

**Needs:** Task 1 passed; task 2's single authority exists; current delivery/verification anchors have no concurrent overlap.

**Creates:** One delivery rule in the existing TDD area and bounded verification-depth, readiness, evidence-vantage, and feedback-routing guidance in Correctness.

**Context budget:** ~45%.

#### TDD Steps

1. Parent starts `task-4`, validates the graph, and confirms the fresh frontier selects only task 4.
2. Re-run `delivery phases`. Expected RED: 1 selected failure for missing ship/verify obligations.
3. In `.pi/prompts/ship.md`, add a thin-slice rule immediately after `### TDD Execution Flow` and before the commit protocol.
4. Require the smallest safe end-to-end behavior slice and a failing observable boundary test first where practical. Allow fakes only at justified seams; prohibit private-method mocks, test-only production APIs, and interfaces created solely for testing.
5. Re-run `delivery phases`. Expected: still RED, with ship assertions satisfied and verification assertions missing.
6. In `.pi/prompts/verify.md`, extend `## Phase 3: Correctness` after the incremental/full mode table. State that file count selects execution breadth but never substitutes for consequence.
7. Add the exact escalation set: security, privacy, authorization or tenant isolation, data integrity, external providers, retries or idempotency, cost controls, and recovery. Require essential journeys and controlled failures first, then deeper checks only for a named evidence gap and stable inspection seam.
8. Require each recorded result to name its vantage: observable behavior, adapter/provider contract, real integration, justified structural/gray-box evidence, or another explicit category.
9. Add conditional product/release readiness: essential journeys, deferred scope, non-deferrable controls, observable failures, current evidence, and a learning signal or real feedback path. State that tests or reviewer score cannot establish validated learning.
10. Add the advisory route table: unknown fact → `research`; changed desired behavior → `create`; architecture/design gap → `plan`; known implementation defect → `ship`. State that the parent records the route in `progress.md` but does not invoke it or mutate `.active` automatically.
11. Run `delivery phases`. Expected GREEN: 1 selected, 1 passed, 0 failed.
12. Run the preservation subset:
    ```bash
    node --experimental-strip-types --test --test-name-pattern="ship executes a validated dynamic frontier|graph state is evidence-linked and selectively invalidated|ship honors project approval gates" .pi/tests/skill-system.test.ts
    ```
    Expected: all selected tests pass.
13. Confirm neither prompt names the kernel, run `git diff --check` on both files, and inspect the risk vocabulary against the approved bounded list. Parent records evidence, marks task 4 passed, validates, and recomputes the frontier.

**Stop conditions:** Stop if changed-file modes are removed, risk categories expand beyond the approved set, routing becomes executable, MVP guidance applies to all work, or existing approval/graph behavior changes.

---

### Task 5 — Verify Integrated Lifecycle Behavior [verify]

**End state:** Focused contracts, the retained suite, every graph, active-pointer safety, untouched planning surfaces, goal-backward checks, and independent review all pass with current-attempt evidence.

**Files:** None. The parent owns lifecycle evidence only.

**Needs:** Tasks 2, 3, and 4 passed with fresh evidence; no active-slug drift or overlapping implementation edits.

**Creates:** Integrated verification and independent-review evidence in `progress.md`; no production file.

**Context budget:** ~35%.

#### Verification Steps

1. Parent starts `task-5`, validates the graph, and confirms no earlier task is stale, failed, or missing current-attempt evidence.
2. Run all four focused contracts:
   ```bash
   node --experimental-strip-types --test --test-name-pattern="contract-seam-feedback kernel|lifecycle intake phases|delivery phases|lifecycle workflow is optional" .pi/tests/skill-system.test.ts
   ```
   Expected: 4 selected, 4 passed, 0 failed.
3. Run the complete retained suite:
   ```bash
   node --experimental-strip-types --test .pi/tests/*.test.ts
   ```
   Expected: zero failures and no unexpected skips.
4. Validate every graph:
   ```bash
   for f in .pi/artifacts/*/tasks.json; do
     node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"
   done
   ```
   Expected: every graph reports `ok: true` with no issues.
5. Prove cross-artifact reporting is read-only:
   ```bash
   before=$(sha256sum .pi/artifacts/.active)
   node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null
   test "$before" = "$(sha256sum .pi/artifacts/.active)"
   ```
   Expected: exit 0 and the active slug remains `contract-seam-feedback-lifecycle`.
6. Prove excluded planning and graph surfaces are untouched:
   ```bash
   git diff --quiet HEAD -- .pi/prompts/plan.md .pi/skills/planning-and-task-breakdown/SKILL.md .pi/templates/prd.md .pi/scripts/task-graph.ts
   ```
   Expected: exit 0.
7. Run `git diff --check` over the eight implementation files, then inspect `git status --short --branch` and each scoped diff. Expected: no whitespace errors, deletions, dependency files, runtime-state ownership, or undeclared implementation paths.
8. Perform goal-backward verification: map each of the five observable truths to current file-and-line evidence; confirm the kernel is single-sourced, all phase hooks are substantive, all routes are advisory, and the bounded consequence list is exact.
9. Run one foreground independent read-only Fabric review with tools `read`, `grep`, `find`, and `ls`. Give it the spec, plan, tasks, exact eight changed files, and gate outputs; ask for severity-ranked correctness, regression, simplicity, policy-duplication, risk-broadening, automatic-routing, artifact/schema, and Hindsight findings with file:line evidence.
10. Parent validates every review finding. Any critical or important actionable issue reopens the owning task, begins with a failing focused test, and repeats integrated verification; architectural findings stop for user direction. Informational findings are recorded without scope expansion.
11. Append a unique current-attempt evidence section to `progress.md`, add matching verification and review refs, mark task 5 passed, validate, and recompute the frontier. Expected: graph state `complete`.
12. Ask the user before marking the overall plan closed. Do not commit, integrate, publish, or deploy without separate approval.

**Stop conditions:** Stop on any failed retained test, graph issue, `.active` drift, excluded-surface diff, undeclared path, unresolved critical/important review finding, or contradiction between spec, plan, and graph.

---

## Global Stop Conditions

- `.pi/artifacts/.active` no longer names `contract-seam-feedback-lifecycle`.
- `spec.md`, `plan.md`, and `tasks.json` task IDs or acceptance boundaries diverge.
- An owned line changes concurrently after preflight.
- A worker needs an undeclared file, new dependency, new artifact type, branch, worktree, deletion, or broader lifecycle mutation.
- The same task's verification fails twice after bounded fixes.
- Existing planning, Hindsight, Fabric-routing, approval, or graph contracts regress.
- A review finding requires an unresolved architecture, security, migration, or scope decision.

---

## Constitutional Compliance

1. Every implementation task owns at most three exact files — PASS.
2. No dependency installation or package metadata change is planned — PASS.
3. No broad staging, hook bypass, history rewrite, or destructive restore operation is planned — PASS.
4. No branch, worktree, commit, merge, publication, or deployment action is authorized by this plan — PASS.
5. No file deletion or generated/runtime-state ownership is planned — PASS.
6. No secret or private-data handling is introduced — PASS.
7. Tests precede production policy changes and use bounded behavioral contracts — PASS.
8. Parent ownership of lifecycle state, evidence, review, and completion remains explicit — PASS.

**Constitutional compliance: 8 PASS**

---

## Handoff to `/ship`

- Validate `.pi/artifacts/contract-seam-feedback-lifecycle/tasks.json` again immediately before execution.
- Confirm `.active` still selects `contract-seam-feedback-lifecycle` and `plan.md` task IDs exactly match the graph.
- Begin only with the fresh selected frontier, currently `task-1`.
- Treat this plan's waves as explanatory; the graph decides readiness after every transition.
- Preserve unrelated runtime/cache state and stop on owned-path overlap.