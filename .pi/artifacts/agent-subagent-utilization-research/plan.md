# Agent and Subagent Utilization Contracts Implementation Plan

> **For Pi:** Implement this plan task-by-task. `tasks.json` remains authoritative; this plan is an explanatory execution view.

**Goal:** Pi Core operators receive coherent role-specific routing: conditional detailed `Plan` advice with parent-owned canonical planning, plus an explicit foreground `/ship` dispatch to a parent-resolved `general` or `build` worker.

**Discovery Level:** 3 — the topic is orchestration architecture, but the completed deep research resolved external questions. Planning reused that research, mined relevant Git history, and ran one bounded local `Explore` pass plus one foreground `Plan` advisory for cross-workflow sequencing.

**Context Budget:** Approximately 40–45% for the complete implementation. Task 1 uses about 12%, Tasks 2 and 3 use about 8% and 15%, and Task 4 uses about 8%. Recompute context and frontier state between tasks.

**Planning Decision:** Preserve canonical task IDs and dependencies. Tasks 2 and 3 remain parallel-eligible in the graph, but execute them sequentially in the current workspace because parallel modifying workers require separately approved worktrees.

---

## Must-Haves

### Observable Truths

1. An operator can distinguish conditional `Plan`, surgical `general`, and substantial bounded `build` responsibilities from the global Agent policy.
2. Running `/plan` cannot hand Plan advisory output to `general` to write or render canonical `plan.md` or `tasks.json`.
3. Running `/ship` for one selected task reaches one inspectable foreground Pi `Agent` call using a parent-resolved worker restricted to `general` or `build`.
4. Every child remains bounded by a self-contained envelope while the parent retains canonical files, graph transitions, review, verification, and approval decisions.
5. The existing detailed Plan, general, and build agent definitions remain unchanged and continue to be the sole role/persona sources.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Role-specific contract tests | Deterministic RED/GREEN checks for the residual orchestration gaps | `.pi/tests/skill-system.test.ts` |
| Global Agent routing policy | Distinct Plan/general/build roles and lifecycle-specific routing clarification | `.pi/agent-tool-description.md` |
| Planning orchestration prompt | Explicit parent-writer and no-general-renderer boundary | `.pi/prompts/plan.md` |
| Shipping orchestration prompt | Concrete primary `general|build` worker dispatch | `.pi/prompts/ship.md` |
| Canonical task graph | Authoritative IDs, dependencies, state, and verification commands | `.pi/artifacts/agent-subagent-utilization-research/tasks.json` |
| Execution evidence | Attempt-scoped RED, GREEN, review, and verification results created by `/ship` | `.pi/artifacts/agent-subagent-utilization-research/progress.md` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| Global policy | `/plan` and `/ship` | Direct-first policy with an explicit lifecycle-specific routing rule | Generic guidance appears to contradict mandatory `/ship` dispatch |
| `/plan` Plan advisory | Parent canonical synthesis | Explicit no-`general` writer sentence and existing parent-only ownership | Advice is silently passed to an implementation worker for canonical rendering |
| `/ship` worker selection | Pi `Agent` invocation | `workerType` resolved to `general|build` before the call | Routing exists only as prose or accepts an arbitrary child type |
| Ship-worker envelope | Selected implementation child | `prompt: shipWorkerEnvelope` | Concrete call duplicates or omits required task constraints |
| RED contract tests | Policy and prompt GREEN changes | Exact named tests and bounded section/call extraction | Missing test names false-green, or broad regex matches unrelated review/fix calls |
| Independent review | Owning implementation task | Parent validation and graph recovery | A review fix is incorrectly made under file-less verification Task 4 |

---

## Derived Dependency Graph

> Wave labels are a derived snapshot of the current authoritative `tasks.json`. `/ship` must recompute the live frontier after every transition.

```text
Task task-1: needs validated graph and an unchanged test-file preflight
             creates focused failing contracts in .pi/tests/skill-system.test.ts
             has_checkpoint: no

Task task-2: needs task-1 expected-RED evidence
             creates aligned global routing in .pi/agent-tool-description.md
             has_checkpoint: no

Task task-3: needs task-1 expected-RED evidence
             creates explicit /plan ownership and concrete /ship dispatch
             has_checkpoint: no

Task task-4: needs task-2 and task-3 GREEN evidence
             creates integrated verification and independent review evidence
             has_checkpoint: close confirmation occurs after verification, outside implementation

Derived Wave 1: task-1
Derived Wave 2: task-2, task-3 (parallel-eligible; execute sequentially without approved worktrees)
Derived Wave 3: task-4
```

**Graph refinement:** None. Preserve `task-1` through `task-4`, their dependencies, file lists, and version-2 state schema.

---

## Tasks

### Task Standards

- Use the exact paths declared by the canonical task.
- Re-read each owned path and its Git status immediately before editing; stop on overlapping concurrent changes.
- Use `fabric_exec` for every implementation or test-edit phase during `/ship`.
- Record RED before GREEN. A missing test name or zero matching tests is not RED.
- Keep assertions bounded to the relevant section or extracted call block; do not rely on whole-file prose matches for executable behavior.
- Run the narrowest focused command after each increment, then broader regression checks.
- Do not modify agent personas, dependencies, lifecycle semantics, deleted extensions, runtime-managed files, or unrelated artifacts.
- Git writes, branch/worktree operations, integration, and publishing remain separate approval checkpoints.

### Task task-1: Lock role-specific orchestration contracts [test]

**End state:** Three focused tests exist and fail only because the specified global-policy, `/plan` writer-boundary, and `/ship` primary-call behavior is not yet implemented.

**Files:**

- `.pi/tests/skill-system.test.ts`

**Needs:**

- Validated active `tasks.json`.
- Current contents and status of `.pi/tests/skill-system.test.ts`.
- Existing helpers `readRequired`, `agentFrontmatter`, and `agentBody` preserved.

**Creates:**

- Named test containing `agent utilization policy`.
- Named test containing `plan writer boundary`.
- Named test containing `ship primary worker call`.
- Attempt-scoped evidence proving all three tests were discovered and failed for intended missing behavior.

**TDD steps:**

1. **Preflight — 2 minutes.** Read `.pi/tests/skill-system.test.ts` around the existing orchestration and Plan tests; record its hash and path status in `progress.md`. Stop if another process changed the path after this plan was written.
2. **Baseline — 2 minutes.** Run the focused pattern before adding tests. Expected: exit `0` is permitted only as baseline evidence showing the exact new names do not yet exist; do not call it RED.
3. **RED/global policy — 4 minutes.** Add a test that reads `.pi/agent-tool-description.md` and requires, on bounded lines, conditional Plan triggers, surgical `general`, substantial bounded `build` after resolved architecture, and an explicit direct-first/lifecycle-specific routing relationship.
4. **RED/plan boundary — 4 minutes.** Add a test that requires one positive statement saying Plan advisory output is not handed to `general` for canonical `plan.md` or `tasks.json` rendering. Also require that `/plan` contains no concrete `subagent_type: "general"` call. Do not use a broad negative expression that would reject the required safe prohibition.
5. **RED/ship call — 5 minutes.** Add a test that scopes itself to a uniquely headed primary-dispatch section, extracts its fenced TypeScript call block, and requires exactly one `Agent` call with `subagent_type: workerType`, a concrete description, and `prompt: shipWorkerEnvelope`. Reject invocation-level `model`, `thinking`, and `run_in_background` fields. Require the same section to close `workerType` to `general|build` before invocation.
6. **Prove RED — 3 minutes.** Run:

   ```bash
   node --experimental-strip-types --test --test-name-pattern="agent utilization policy|plan writer boundary|ship primary worker call" .pi/tests/skill-system.test.ts
   ```

   Expected: nonzero exit; all three named tests are discovered; each failure points to its intended absent policy/prompt contract rather than syntax, fixture, or unrelated failures.
7. **Quality check — 2 minutes.** Run:

   ```bash
   git diff --check -- .pi/tests/skill-system.test.ts
   ```

   Expected: exit `0` and no output.
8. **Evidence — 2 minutes.** Record the command, exit status, discovered test names, intended failure messages, changed path, and no-commit status in `progress.md` before the parent advances task state.

**Stop conditions:**

- Any test fails to parse or compile.
- A named test is skipped, undiscovered, or passes before its production contract exists.
- RED depends on an undeclared file change.
- Existing unrelated tests fail during the focused command.
- The test path changes concurrently.

**Verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="agent utilization policy|plan writer boundary|ship primary worker call" .pi/tests/skill-system.test.ts
git diff --check -- .pi/tests/skill-system.test.ts
```

### Task task-2: Align the global Agent routing policy [policy]

**End state:** The global Agent guidance defines Plan, general, and build without contradicting direct-parent defaults or lifecycle-specific `/ship` dispatch.

**Files:**

- `.pi/agent-tool-description.md`

**Needs:**

- Current-attempt expected-RED evidence from `task-1`.
- Current contents and status of `.pi/agent-tool-description.md`.
- Existing Pi-only orchestration, parent verification, agent budget, and no-automatic-choreography rules.

**Creates:**

- An explicit surgical implementation/review-fix role for `general` that excludes canonical planning.
- An explicit substantial bounded implementation role for `build` after architecture is resolved.
- A concise statement that generic direct-first guidance coexists with stricter lifecycle prompt routing while parent ownership remains unchanged.

**GREEN steps:**

1. **Preflight — 2 minutes.** Read `.pi/agent-tool-description.md`, inspect its path status, and compare with the task-1 policy failure. Stop on overlap.
2. **Minimal policy edit — 5 minutes.** Refine only the routing bullets: preserve conditional Plan triggers; define `general` as surgical implementation/review-fix work rather than canonical plan rendering; add `build` for substantial bounded work with resolved architecture.
3. **Lifecycle relationship — 3 minutes.** Add one compact rule explaining that direct parent work is the generic default, while a validated lifecycle workflow such as `/ship` may require a parent-selected implementation worker without transferring canonical, review, verification, or lifecycle ownership.
4. **Focused GREEN — 3 minutes.** Run:

   ```bash
   node --experimental-strip-types --test --test-name-pattern="agent utilization policy" .pi/tests/skill-system.test.ts
   ```

   Expected: the policy test passes. Tests owned by task-3 need not run yet.
5. **Regression and whitespace — 4 minutes.** Run:

   ```bash
   node --experimental-strip-types --test --test-name-pattern="subagent coordination remains Pi-native and parent-verified|agent utilization policy" .pi/tests/skill-system.test.ts
   git diff --check -- .pi/agent-tool-description.md
   ```

   Expected: all selected tests pass; whitespace check exits `0` with no output.
6. **Inspect — 2 minutes.** Review the exact diff and confirm no agent type, envelope, model, tool, lifecycle, or approval contract was broadened.
7. **Evidence — 2 minutes.** Record GREEN commands/results and the one changed path in `progress.md`.

**Stop conditions:**

- The policy requires modifying an agent persona or lifecycle prompt.
- `build` is allowed to resolve architecture instead of receiving resolved architecture.
- `general` is described as a plan writer.
- The direct-first rule, Pi-subagents-only rule, parent verification, or concurrency limit is weakened.
- The owned path changes concurrently.

**Verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="agent utilization policy" .pi/tests/skill-system.test.ts
git diff --check -- .pi/agent-tool-description.md
```

### Task task-3: Make planning ownership and shipping dispatch executable [prompt]

**End state:** `/plan` explicitly rejects a `general` canonical-writer handoff, and `/ship` contains one concrete foreground primary-worker call using a parent-resolved `general|build` type and the existing complete envelope.

**Files:**

- `.pi/prompts/plan.md`
- `.pi/prompts/ship.md`

**Needs:**

- Current-attempt expected-RED evidence from `task-1`.
- Current contents and status of both prompt files.
- Existing conditional Plan call, parent ownership, implementation-worker routing, and ship-worker envelope.

**Creates:**

- One explicit no-general-writer sentence in the planning routing/ownership section.
- One uniquely headed primary implementation dispatch section in `/ship`.
- One concrete foreground `Agent` call whose `subagent_type` is the already resolved `workerType` and whose prompt is `shipWorkerEnvelope`.

**GREEN steps:**

1. **Preflight — 2 minutes.** Read the planning envelope/foreground advisory sections and the ship routing/envelope/frontier sections. Inspect both path statuses and stop on overlap.
2. **GREEN/plan boundary — 3 minutes.** Add one direct sentence near parent canonical ownership: Plan advice is never handed to `general` to render or write canonical `plan.md` or `tasks.json`. Do not duplicate the Plan persona or add another Agent call.
3. **Verify planning boundary — 3 minutes.** Run:

   ```bash
   node --experimental-strip-types --test --test-name-pattern="Plan delegation|plan writer boundary" .pi/tests/skill-system.test.ts
   ```

   Expected: existing Plan delegation checks and the new boundary test pass.
4. **GREEN/ship resolution — 4 minutes.** Add a uniquely headed primary-dispatch section adjacent to implementation routing. State that the parent resolves `workerType` to the closed union `general|build` only after architecture, scope, and approval questions are settled; unresolved cases stop before invocation.
5. **GREEN/ship call — 4 minutes.** Add exactly one fenced TypeScript example in that section using the resolved `workerType`, a concrete task-specific description, and `shipWorkerEnvelope`. Keep it foreground by omitting background execution and invocation-level model/thinking configuration. Reference the existing envelope instead of duplicating its fields.
6. **Verify ship dispatch — 3 minutes.** Run:

   ```bash
   node --experimental-strip-types --test --test-name-pattern="ship primary worker call|ship routes GLM Fabric workers" .pi/tests/skill-system.test.ts
   ```

   Expected: the new structural call test and retained ship-routing tests pass.
7. **Prompt regression — 4 minutes.** Run:

   ```bash
   node --experimental-strip-types --test --test-name-pattern="Plan delegation|plan prompt|plan writer boundary|ship primary worker call|ship routes GLM Fabric workers|ship honors project approval gates" .pi/tests/skill-system.test.ts
   git diff --check -- .pi/prompts/plan.md .pi/prompts/ship.md
   ```

   Expected: all selected tests pass; whitespace check exits `0` with no output.
8. **Inspect — 3 minutes.** Confirm `/plan` still has exactly one concrete Plan call; the new primary ship section has exactly one dynamic implementation call; existing review/fix calls remain outside that section; no child gains graph, lifecycle, commit, integration, or publishing authority.
9. **Evidence — 2 minutes.** Record both GREEN increments, final regression result, changed paths, and no-commit status in `progress.md`.

**Stop conditions:**

- `workerType` is not explicitly closed to `general|build` before invocation.
- The call requires invocation-level model/thinking/background overrides.
- Required envelope fields are copied into another competing schema.
- A change to `.pi/agents/Plan.md`, `.pi/agents/general.md`, `.pi/agents/build.md`, a workflow, or a skill becomes necessary.
- Either prompt changes concurrently.

**Verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="Plan delegation|plan writer boundary|ship primary worker call|ship routes GLM Fabric workers" .pi/tests/skill-system.test.ts
git diff --check -- .pi/prompts/plan.md .pi/prompts/ship.md
```

### Task task-4: Verify integrated orchestration behavior [verification]

**End state:** All routing contracts are integrated, reviewed, graph-valid, whitespace-clean, and isolated from unrelated workspace changes.

**Files:** None for implementation. `progress.md` and current-attempt graph evidence remain parent-owned lifecycle records.

**Needs:**

- Current-attempt GREEN evidence from `task-2` and `task-3`.
- Fresh hashes/status for the four owned implementation/test paths.
- Baseline evidence for protected agent definitions and unrelated dirty paths.

**Creates:**

- Full retained-suite evidence.
- Active graph validation evidence.
- Owned-path whitespace and scope evidence.
- Independent review evidence.
- A close checkpoint only after all required gates are resolved.

**Verification steps:**

1. **Revalidate graph — 2 minutes.** Run:

   ```bash
   node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/agent-subagent-utilization-research/tasks.json
   ```

   Expected: JSON reports `"ok": true`, version `2`, and no issues.
2. **Focused integration — 3 minutes.** Run all role-specific named tests together. Expected: every selected test passes with zero failures.
3. **Full retained suite — 8 minutes.** Run:

   ```bash
   node --experimental-strip-types --test .pi/tests/*.test.ts
   ```

   Expected: exit `0`. If a known unrelated failure recurs, isolate it with fresh evidence and stop rather than declaring completion.
4. **Whitespace — 2 minutes.** Run:

   ```bash
   git diff --check -- .pi/agent-tool-description.md .pi/prompts/plan.md .pi/prompts/ship.md .pi/tests/skill-system.test.ts
   ```

   Expected: exit `0` and no output.
5. **Scope proof — 3 minutes.** Inspect status and diffs only for the four owned implementation/test paths. Confirm `.pi/agents/Plan.md`, `.pi/agents/general.md`, `.pi/agents/build.md`, deleted extensions, runtime-managed files, and unrelated artifacts were not changed by this feature.
6. **Goal-backward wiring — 3 minutes.** Verify each required artifact exists and is substantive; confirm the global policy names all three roles, `/plan` retains its single foreground Plan advisory and explicit no-writer boundary, and `/ship` contains its uniquely scoped resolved-worker call.
7. **Independent review — 5 minutes.** Spawn one foreground `review` agent against the complete owned diff and spec. Parent validates every finding. Any Critical or Important fix returns through parent-owned recovery to `task-2` or `task-3`; do not edit implementation under file-less `task-4`.
8. **Final evidence — 3 minutes.** Append command outputs, review disposition, protected-path proof, and remaining risks to `progress.md`; only then update current-attempt evidence and task state.
9. **Close checkpoint — 1 minute.** Ask the user whether to mark the plan complete. Do not commit, push, or create a PR without separate approval.

**Stop conditions:**

- Full tests fail and the failure cannot be proven unrelated and explicitly accepted.
- Graph validation, focused integration, or whitespace checks fail.
- Any protected or unrelated path was modified by this feature.
- Review reports an unresolved Critical or Important issue.
- A review fix would require editing under task-4 instead of returning to the owning task.

**Verification:**

```bash
node --experimental-strip-types --test .pi/tests/*.test.ts
node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/agent-subagent-utilization-research/tasks.json
git diff --check -- .pi/agent-tool-description.md .pi/prompts/plan.md .pi/prompts/ship.md .pi/tests/skill-system.test.ts
```

---

## Execution Notes

### Current Workspace

- Branch: `main`.
- The workspace contains unrelated deletions, artifact edits, and runtime-managed changes. They are not blockers by themselves and must remain untouched.
- No branch or worktree creation is authorized. Therefore, even though the derived Wave 2 tasks are graph-parallel, execute them sequentially in this checkout.
- No commit, merge, integration, push, deploy, dependency, or unrelated new-file action is authorized by this plan.

### TDD Evidence Standard

- **RED evidence:** named tests exist, are discovered, and fail for the intended absent contract.
- **GREEN evidence:** the narrowest owning test passes after the minimum production change.
- **REFACTOR:** only if the changed prompt/policy becomes repetitive or ambiguous; rerun the same owning tests afterward.
- **Regression:** run related retained tests after each GREEN and the full suite only after integration.

### Review Ownership

The parent owns final synthesis, graph state, progress evidence, verification, and review disposition. Implementation workers operate only on the currently selected task and may not schedule siblings, mutate lifecycle state, or expand file scope.

---

## Constitutional Compliance

- No destructive filesystem or Git operation is planned.
- No broad staging, hook bypass, history rewrite, force publication, or workspace cleanup is planned.
- No task modifies more than two implementation/test files.
- No type-safety suppression is planned.
- No dependency addition or installation is planned.
- No secret or credential material is included.
- Existing unrelated and runtime-managed changes remain excluded.

**Constitutional compliance: [x] PASS**