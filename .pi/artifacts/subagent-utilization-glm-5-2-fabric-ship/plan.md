# GLM 5.2 Fabric-backed `/ship` workers Implementation Plan

> **For Pi:** Implement this plan task-by-task. `tasks.json` is authoritative; this document explains the current execution details.

**Goal:** `/ship` delegates bounded implementation to GLM 5.2-backed `build` and `general` workers that can actually use `fabric_exec`, while the parent retains orchestration, approvals, review, graph state, and verification.

**Discovery Level:** 0 — this is pure internal prompt/agent-contract work with completed source-backed research, no new dependency or external API, and current repository patterns confirmed through code, tests, memory, and Git history.

**Context Budget:** Approximately 45–50% per implementation worker. Task 2 owns two agent definitions; Task 3 owns three coordinated workflow surfaces; Task 4 is verification-only.

---

## Institutional Context

- `.pi/artifacts/MEMORY.md:59-65` requires delegation only when it provides isolation/parallelism, at most three agents per wave, sequential overflow, parent verification, and agent-specific fan-out tests.
- Recent workflow commits establish the canonical graph and evidence model: `c12ba82`, `5588965`, `e63a90b`, and `6187563`.
- `.pi/tests/skill-system.test.ts` uses deterministic static contract assertions over Markdown orchestration surfaces; this feature should extend that pattern rather than introduce a new test harness.
- `.pi/agents/build.md` and `.pi/agents/general.md` already have uncommitted user/concurrent edits. Preserve the current `thinking: max` and GLM change in `general`; stop Task 2 if either file changes again after its implementation preflight.
- No new research agent is needed. The exact model and Fabric mismatch were already verified in `research.md` and cross-checked against the installed runtime.

## Must-Haves

### Observable Truths

1. A developer running `/ship` can see substantial bounded tasks routed to `build` and surgical tasks or review fixes routed to `general`.
2. Both implementation workers run through the exact GLM 5.2 NVFP4 route and can invoke `fabric_exec` for code changes.
3. Each child receives enough task, file, verification, stop, and approval context to execute correctly without inheriting the parent conversation.
4. Neither implementation worker can schedule siblings, mutate `.active` or graph state, integrate work, or spawn nested agents during `/ship`.
5. The parent still validates the graph, selects the ready shard, inspects actual changes, runs verification, owns review, records evidence, and recomputes the frontier.
6. Branch/worktree, commit, merge/integration, dependency, new-file, push/deploy, and active-artifact actions stop at the applicable approval gate.
7. Deterministic tests and runtime smoke checks detect a worker that is disabled, off-model, missing Fabric, incorrectly routed, or over-authorized.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Build worker definition | Larger bounded GLM/Fabric executor | `.pi/agents/build.md` |
| General worker definition | Surgical GLM/Fabric executor and review fixer | `.pi/agents/general.md` |
| Shipping prompt | Canonical routing, approvals, graph ownership, and worker envelope | `.pi/prompts/ship.md` |
| Batch workflow | Dynamic per-task worker selection for parent-selected shards | `.pi/workflows/batch-implement.md` |
| Delegation skill | Reusable worker-selection and handoff contract | `.pi/skills/subagent-driven-development/SKILL.md` |
| Contract tests | Static regression coverage for all required contracts | `.pi/tests/skill-system.test.ts` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| `/ship` selected task | `build` or `general` | `Agent({ subagent_type })` selected from declared file count and task risk | Disabled or wrong worker silently defeats GLM utilization |
| Worker frontmatter | Fabric runtime | `extensions: true` plus `tools: "*"` | Prompt requests `fabric_exec` but the tool is unavailable |
| Parent task envelope | Replacement child prompt | Self-contained goal/files/non-goals/criteria/verification/stops/approvals | Child lacks `/ship` or project constraints and expands scope |
| Child result | Canonical graph | Parent inspection, verification, review, evidence recording, and frontier recomputation | Untrusted child claim becomes authoritative state |
| Concurrent shard | Isolated execution | Pi `Agent` background calls and separately approved worktrees | Shared checkout edits collide or an unapproved worktree is created |
| Approval checkpoint | Git/workspace/lifecycle action | Explicit parent stop before the gated operation | `/ship` treats implementation permission as standing authorization |
| Static tests | Markdown contracts | Named `node:test` assertions | Regex tests pass on vague prose or fail on harmless rewording |
| Runtime smoke | Configured workers | Foreground `Agent` call requiring read-only `fabric_exec` model lookup | Static frontmatter passes while the actual tool/model route is broken |

## Derived Dependency Graph

> Wave labels are a derived snapshot of the current authoritative `tasks.json`. `/ship` must validate and recompute the live frontier after every transition.

```text
Task 1: needs current spec/research/tests, creates RED contract tests, has_checkpoint=false
Task 2: needs Task 1 RED evidence, creates bounded GLM/Fabric agent definitions, has_checkpoint=false
Task 3: needs Task 1 RED evidence, creates routed approval-safe shipping contracts, has_checkpoint=false
Task 4: needs Tasks 2 and 3, creates integrated test/runtime verification evidence, has_checkpoint=true if runtime or Git approval is unavailable

Derived Wave 1: Task 1
Derived Wave 2: Task 2 + Task 3 (file-disjoint; parallel only with separately approved isolation)
Derived Wave 3: Task 4
```

## Stop Conditions

- Stop Task 2 if `.pi/agents/build.md` or `.pi/agents/general.md` differs from its recorded implementation preflight; preserve both versions and report the overlap.
- Stop if enabling Fabric requires guessing an extension alias, adding a dependency, or changing package configuration. The proven fallback is `extensions: true`.
- Stop if worker selection cannot be expressed deterministically from canonical task metadata and bounded task facts; do not add a hidden scheduler.
- Stop before any branch/worktree, commit, merge/integration, dependency, new-file, push/deploy, or unrelated active-artifact action that lacks its required approval.
- Stop after two failed fixes for the same test contract and report the observed RED/GREEN evidence.
- Stop if plan task IDs diverge from `tasks.json`; update the graph first, validate it, and only then revise this plan.

## Tasks

### Task Standards

- Exact files only; no repository-wide formatting or mutation.
- Behavior-changing contract work follows RED → GREEN → REFACTOR.
- Each child uses `fabric_exec` for code-mode implementation and returns exact commands plus observed results.
- Parent reads every changed file and reruns verification; child summaries are not proof.
- Expected RED is success only when the named assertion fails for the missing behavior and baseline tests remain green.

### Task 1 — Lock GLM/Fabric ship-worker contracts [test]

**Canonical ID:** `task-1`

**Files:** `.pi/tests/skill-system.test.ts`

**Needs:** Current spec, research findings, agent frontmatter, shipping surfaces, existing `readRequired` and static-regex test conventions.

**Creates:** Four named RED tests that independently identify worker configuration, bounded-worker behavior, routing/envelope behavior, and approval safety.

**Risk:** Over-broad regexes could reward token presence instead of a coherent contract or collide with examples elsewhere in the files.

#### TDD steps

1. **Preflight the test file (2–3 min).** Read `.pi/tests/skill-system.test.ts`, record its status, and identify the insertion point next to existing dynamic-frontier and Pi-native coordination tests. Expected: no owned edit exists in this file.
2. **Add a bounded frontmatter reader (2–4 min).** Add a local helper that returns only the first YAML frontmatter block so agent configuration assertions cannot pass from prose examples later in the file.
3. **Write `GLM ship workers expose Fabric` (3–5 min).** Assert both frontmatter blocks contain the exact model key and an extension-loading configuration; assert `build` is enabled. Keep the assertion specific enough that `general` currently fails on extension loading and `build` currently fails on enablement.
4. **Write `GLM ship workers are bounded executors` (3–5 min).** Assert both bodies prohibit nested agents, lifecycle/graph ownership, undeclared-file expansion, and unapproved gated actions; assert the build body no longer describes itself as an orchestrator or writes legacy TODO state.
5. **Write `ship routes GLM Fabric workers with self-contained contracts` (4–5 min).** Read the ship prompt, batch workflow, and delegation skill together; require deterministic `build`/`general` selection, Pi `Agent`, `fabric_exec`, task ID/attempt, exact files/neighborhood, non-goals, acceptance criteria, verification, stop conditions, and parent inspection.
6. **Write `ship honors project approval gates` (3–5 min).** Require explicit approval language adjacent to branch/worktree, commit/integration, dependency/new-file, active-artifact, and publication operations; reject wording that grants automatic workspace setup or mandatory unapproved commits.
7. **Run RED (2–5 min).** Execute:
   `node --experimental-strip-types --test --test-name-pattern="GLM ship workers expose Fabric|GLM ship workers are bounded executors|ship routes GLM Fabric workers with self-contained contracts|ship honors project approval gates" .pi/tests/skill-system.test.ts`
   Expected: the test file compiles; the four named tests are discovered; failures point to the current missing agent/workflow contracts rather than helper errors.
8. **Protect the baseline (2–5 min).** Execute:
   `node --experimental-strip-types --test --test-name-pattern="ship executes a validated dynamic frontier|subagent coordination remains Pi-native and parent-verified|fan-out" .pi/tests/skill-system.test.ts`
   Expected: retained tests pass.
9. **Inspect the diff (2 min).** Run `git diff --check -- .pi/tests/skill-system.test.ts` and review only the new helper/assertions. Do not weaken existing tests to obtain RED.

### Task 2 — Configure bounded GLM Fabric workers [agent]

**Canonical ID:** `task-2`

**Files:** `.pi/agents/build.md`, `.pi/agents/general.md`

**Needs:** Task 1 RED evidence and a fresh content/status preflight for both dirty files.

**Creates:** Two spawnable, no-nesting workers with exact GLM routing, Fabric access, bounded roles, and approval-aware stop rules.

**Risk:** Replacing the current bodies too broadly could discard user-owned `thinking: max` changes or turn `general` autonomy into scope creep.

#### TDD steps

1. **Capture concurrent-work preflight (2–4 min).** Read both files, record `git status --short` and content hashes, and compare with the diff documented during planning. Expected pre-existing changes: `thinking: max` in both and the GLM model pin in `general`. Stop on any additional drift.
2. **Run the worker RED tests alone (2–3 min).** Execute:
   `node --experimental-strip-types --test --test-name-pattern="GLM ship workers expose Fabric|GLM ship workers are bounded executors" .pi/tests/skill-system.test.ts`
   Expected: failures correspond to `build` disabled, `general` Fabric disabled, and orchestration/scope language.
3. **Make build frontmatter minimally GREEN (2–4 min).** Preserve the exact GLM model and current `thinking: max`, retain Fabric-capable extension loading, and enable the project agent. Do not introduce caller-selected model logic.
4. **Replace build's orchestrator role with a bounded executor role (4–5 min).** Its body must accept one parent-resolved task, use `fabric_exec`, stay in declared files/neighborhood, run required verification, return evidence, and stop on architecture/scope/approval issues. Explicitly prohibit child spawning, sibling scheduling, `.active`/graph/progress ownership, integration, and legacy TODO writes.
5. **Make general frontmatter minimally GREEN (2–3 min).** Preserve the current exact GLM pin and `thinking: max`; change only the extension policy needed to load Fabric. Keep its turn bound unless a failing acceptance test proves it insufficient.
6. **Tighten general's executor autonomy (4–5 min).** Preserve its one-to-three-file surgical role, but replace automatic out-of-task fixes with report/stop behavior when a finding requires undeclared files, dependencies, architecture, lifecycle mutation, or gated action. Keep no-nesting explicit.
7. **Run GREEN (2–5 min).** Re-run the two named worker tests. Expected: both pass with no skipped tests.
8. **Refactor for parallel vocabulary (3–5 min).** Align both bodies on the same envelope/output terms—task ID/attempt, goal, files, non-goals, acceptance criteria, verification, blockers, observed evidence—while keeping role-specific size guidance. Re-run GREEN after any prose simplification.
9. **Verify scope and concurrent preservation (2–4 min).** Run `git diff --check` on the two files, inspect the complete diff, and confirm the pre-existing `thinking: max` and `general` GLM changes remain present rather than being attributed as new implementation work.

### Task 3 — Route `/ship` through bounded GLM workers [workflow]

**Canonical ID:** `task-3`

**Files:** `.pi/prompts/ship.md`, `.pi/workflows/batch-implement.md`, `.pi/skills/subagent-driven-development/SKILL.md`

**Needs:** Task 1 RED evidence and current canonical graph/frontier terminology.

**Creates:** One coherent routing/envelope/approval contract across all implementation dispatch surfaces.

**Risk:** Updating only one surface would leave contradictory examples; vague worker criteria could create hidden scheduling behavior; unconditional isolation or commit language would violate project policy.

#### TDD steps

1. **Preflight all three surfaces (2–4 min).** Re-read current content and status. Confirm there are no pre-existing edits in these files and identify every `general` implementation/fix dispatch, direct parent implementation sentence, automatic workspace setup instruction, and commit/worktree requirement.
2. **Run workflow RED tests (2–3 min).** Execute:
   `node --experimental-strip-types --test --test-name-pattern="ship routes GLM Fabric workers with self-contained contracts|ship honors project approval gates" .pi/tests/skill-system.test.ts`
   Expected: failures identify current `general`-only routing, incomplete child envelope, and automatic gated operations.
3. **Define routing once in `/ship` (3–5 min).** Add deterministic criteria: normally one-to-three declared files with no architecture/security/migration decision routes to `general`; larger bounded implementation routes to `build`; unresolved architecture stops for the parent. Model/thinking remain omitted from every call.
4. **Make worker delegation the implementation path (4–5 min).** For one ready task, use one foreground Pi `Agent` call to the selected worker. For two or three disjoint ready tasks, use the batch workflow only after any required isolation approval. Keep Fabric out of child orchestration and require `fabric_exec` inside every worker implementation/fix.
5. **Specify the canonical worker envelope (4–5 min).** In `/ship`, list task ID/attempt, goal, exact declared files plus transient neighborhood, non-goals, dependencies, acceptance criteria, verification commands, two-fix-attempt limit, no-nesting/lifecycle rules, approval restrictions, and exact output evidence. State that all batch and fixer prompts must include the resolved values, not placeholders.
6. **Make parent ownership explicit (3–5 min).** Retain graph validation/frontier selection, child lifecycle, actual-file inspection, parent-run verification, review, evidence recording, and frontier recomputation in the parent. Child updates to `.active`, graph, progress, integration, or sibling scheduling must be forbidden.
7. **Repair approval semantics in `/ship` (4–5 min).** Replace automatic workspace setup and unconditional per-task commit/integration language with explicit checkpoints. Verification/review evidence may pass a graph node; commit evidence is recorded only when separately authorized. Missing approval must not be represented as an executed action.
8. **Parameterize `batch-implement` (4–5 min).** Replace the fixed Phase 2 `general` route with parent-resolved `{worker_type}` constrained to `build|general`; carry the full worker envelope; require no nested agents or lifecycle mutation. Preserve the one-to-three wave cap and parent-selected ready shard.
9. **Gate batch isolation and integration (3–5 min).** State that background worktree isolation and later integration occur only with separate approval. If approval is absent, stop at a checkpoint rather than silently changing workspace strategy or claiming integration.
10. **Align `subagent-driven-development` (4–5 min).** Replace its `general`-only implementation example with the same deterministic worker selection and envelope; keep review fixes on `general`, require Fabric for fixes, and make all Git/worktree/integration fields approval-conditional.
11. **Run GREEN and retained routing tests (3–5 min).** Execute:
    `node --experimental-strip-types --test --test-name-pattern="ship routes GLM Fabric workers with self-contained contracts|ship honors project approval gates|ship executes a validated dynamic frontier|subagent coordination remains Pi-native and parent-verified" .pi/tests/skill-system.test.ts`
    Expected: all named tests pass.
12. **Run fan-out regression coverage (2–5 min).** Execute:
    `node --experimental-strip-types --test --test-name-pattern="fan-out" .pi/tests/skill-system.test.ts`
    Expected: synthetic detector tests and every orchestration-surface cap test pass.
13. **Refactor duplicated wording (3–5 min).** Keep `/ship` canonical and make workflow/skill references concise without removing resolved envelope fields. Re-run both GREEN commands after simplification.
14. **Inspect exact scope (2–4 min).** Run whitespace checks for the three files and inspect their full diffs for stale direct-implementation, unconditional worktree, or unconditional commit language.

### Task 4 — Run integrated ship-worker verification [verification]

**Canonical ID:** `task-4`

**Files:** none; this task records evidence only.

**Needs:** Tasks 2 and 3 integrated in the current checkout and no overlapping concurrent edits.

**Creates:** Static, graph, runtime model, child-Fabric, and full-suite evidence for the current attempt.

**Risk:** Static Markdown tests can pass while the configured runtime does not expose the model/tool; smoke workers could mutate files if the prompt is not explicitly read-only.

#### Verification steps

1. **Validate graph and ownership (2–3 min).** Validate `tasks.json`, read the complete owned diff, and confirm only the six declared implementation files plus lifecycle evidence are involved. Expected graph result: `ok: true`, version 2, no issues.
2. **Verify Fabric model registry read-only (2–3 min).** Use parent `fabric_exec` with `tools.models()` and assert the result contains `makora/zai-org/GLM-5.2-NVFP4`. Expected: exact key present; no files changed.
3. **Smoke `general` through Fabric (3–5 min).** Spawn one foreground `general` with a self-contained read-only task requiring it to invoke `fabric_exec`, query the model registry, return its effective model/tool evidence, prohibit writes and nested agents, and stop after the result. Parent confirms no file-status delta.
4. **Smoke `build` through Fabric (3–5 min).** Repeat the same foreground read-only smoke for `build`. Parent confirms exact GLM routing, successful Fabric invocation, no nested agent, and no file-status delta.
5. **Run focused contracts (2–5 min).** Execute the four new named tests together. Expected: four pass, zero fail, none skipped.
6. **Run the retained suite (3–8 min).** Execute:
   `node --experimental-strip-types --test .pi/tests/*.test.ts`
   Expected: all discovered tests pass; zero fail.
7. **Run graph validation again (2 min).** Execute:
   `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/subagent-utilization-glm-5-2-fabric-ship/tasks.json`
   Expected: `ok: true`, version 2, empty issues.
8. **Run whitespace verification (2 min).** Execute the task graph's exact `git diff --check` command for the six implementation files. Expected: exit zero and no output.
9. **Final review gate (3–5 min).** Spawn one foreground `review` agent with the spec, plan, complete current diff, runtime smoke evidence, and test output. Parent validates every finding; any accepted code/prose fix returns to the relevant worker and repeats Steps 5–8.
10. **Record attempt evidence (2–4 min).** Append current-attempt test, verification, review, and any separately authorized commit references to `progress.md`; only then may the parent mark Task 4 passed and recompute the frontier.

## Constitutional Compliance

- No destructive filesystem or history operation is planned.
- No broad staging, hook bypass, history rewrite, package installation, or dependency addition is planned.
- No task owns more than three implementation files.
- Branch/worktree, commit, integration, publication, new-file, dependency, and active-artifact mutations are explicit stop/checkpoint conditions when not already authorized.
- Concurrent dirty worker definitions are called out with a fresh preflight and overlap stop condition.

**Constitutional compliance: PASS**

## Verification Matrix

| Requirement | RED evidence | GREEN evidence | Runtime evidence |
|---|---|---|---|
| Exact GLM + Fabric + enabled workers | Task 1 worker config test | Task 2 focused test | Parent registry + two worker smokes |
| Bounded no-nesting workers | Task 1 bounded executor test | Task 2 focused test | Smoke prompts terminate without child spawn or writes |
| Build/general routing + full envelope | Task 1 routing test | Task 3 workflow test | Review of resolved dispatch prompts |
| Parent-owned graph/review/verification | Existing + new routing tests | Task 3 retained tests | Parent-run suite and evidence recording |
| Approval-safe operations | Task 1 approval test | Task 3 approval test | Final review checks actual diff and progress evidence |
| No regression | Baseline retained tests before implementation | Focused tests after each task | Full suite and graph validation |

## Next Action

Run `/ship`. It should start with canonical `task-1`, record expected RED evidence, then recompute the frontier before selecting Task 2 and Task 3.