# Adopt Viable Bigpowers Skill Patterns Implementation Plan

> **For Pi:** Implement this plan task-by-task. Use the installed pi-subagents `Agent` tool only where a task explicitly requires a behavioral pressure test or isolated work. Prefer direct tools, never exceed three concurrent agents in one wave, and keep parent synthesis and verification authoritative.

**Goal:** pi-core safely gains the two useful new skill behaviors and five selected workflow patterns while retaining its native artifact model, eliminating catalog drift, and limiting every concurrent subagent wave to 1–3 agents.

**Discovery Level:** 3 — The work changes the project-wide skill system and orchestration policy across 20 files. External comparison and fresh review were completed during `/research`; this plan reuses those verified findings and adds bounded local inspection rather than spawning another research swarm.

**Context Budget:** Execute eight waves. Load only each task's exact files plus `.pi/tests/skill-system.test.ts`; target 10–20% context per task and approximately 45–50% per wave. Do not preload the complete skill catalog.

---

## Institutional Context

- `.pi/artifacts/MEMORY.md` prefers minimal delegation, direct tools for surgical work, file-based context, and explicit phase summaries.
- `.pi/skills/writing-skills/SKILL.md` requires a failing behavioral pressure test before either new skill is written.
- `.pi/skills/development-lifecycle/SKILL.md` defines the only canonical active-work files: `spec.md`, `plan.md`, `tasks.json`, and `progress.md`.
- `.pi/skills/subagent-driven-development/SKILL.md` already requires pi-subagents `Agent`, parent distrust, disjoint file ownership, and parent-run verification; this plan tightens rather than replaces that contract.
- `.pi/tests/prompt-leverage.test.ts` establishes the local `node:test` TypeScript convention.
- Local catalog evidence: 65 current skill directories versus 58 manifest entries. Missing manifest entries are `brave-search`, `browser-tools`, `diagnostics`, `grill-with-docs`, `improve-codebase-architecture`, `memory`, `prototype`, `typescript-coding-standards`, and `zoom-out`; stale entries are `behavioral-kernel` and `jira`.
- Fan-out hotspots include limits of 15, 10, and 5 in workflows, five simultaneous ship reviewers, five create-research agents, and unbounded garbage-collection fix workers.
- Git history mining was unavailable because `/home/ryan/repo/pi-core/.git` does not exist. Commit conventions come from `/AGENTS.md`; implementation must pause before commit-dependent work unless executed in the actual Git repository.

## Must-Haves

### Observable Truths

1. A user can ask to organize a workspace and receive an inventory and proposed changes before any file is moved or deleted.
2. A user can ask to define project language and receive evidence-backed canonical terms, aliases, conflicts, and unresolved decisions without creating a new mandatory lifecycle artifact.
3. The skill manifest and actual `SKILL.md` directories have exact bidirectional parity.
4. Planning, interface design, delegation, and lifecycle guidance expose blast-radius, boundary-validation, typed handoff, and compact state patterns without duplicate standalone skills.
5. No prompt, workflow, or coordination skill authorizes more than three concurrently running agents; larger workloads continue through sequential non-overlapping shards.
6. Static tests, behavioral pressure tests, attribution checks, and the complete existing `.pi` test suite pass before completion.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Skill policy test | RED/GREEN and catalog/fan-out regression coverage | `.pi/tests/skill-system.test.ts` |
| Workspace skill | Safe inventory → classify → propose → confirm → act behavior | `.pi/skills/organize-workspace/SKILL.md` |
| Language skill | Evidence-backed ubiquitous-language workflow | `.pi/skills/define-language/SKILL.md` |
| Third-party notice | Pinned Bigpowers source and MIT attribution | `.pi/skills/THIRD_PARTY_NOTICES.md` |
| Skill manifest | Exact directory/catalog parity | `.pi/skills/manifest.json` |
| Planning guidance | Pre-plan blast-radius assessment | `.pi/skills/planning-and-task-breakdown/SKILL.md` |
| Interface guidance | Boundary contract validation | `.pi/skills/api-and-interface-design/SKILL.md` |
| Delegation guidance | Direct-first routing, typed envelopes, max-three waves | `.pi/skills/subagent-driven-development/SKILL.md` |
| Lifecycle guidance | Compact handoff within canonical artifacts | `.pi/skills/development-lifecycle/SKILL.md` |
| Audit prompt | Explicit capped audit routing | `.pi/prompts/audit.md` |
| Create prompt | Deep research limited to three agents | `.pi/prompts/create.md` |
| GC prompt | Cleanup fixes executed in max-three shards | `.pi/prompts/gc.md` |
| Plan prompt | Level-3 research limited to three agents | `.pi/prompts/plan.md` |
| Research prompt | Complex research declares bounded fan-out | `.pi/prompts/research.md` |
| Ship prompt | Implementation and review waves capped at three | `.pi/prompts/ship.md` |
| Audit workflow | Max-three sequential review shards | `.pi/workflows/audit-pattern.md` |
| Batch workflow | Max-three implementation and review waves | `.pi/workflows/batch-implement.md` |
| Research workflow | One-to-three research agents plus dependent review | `.pi/workflows/deep-research.md` |
| Lifecycle workflow | Bounded research, implementation, and review phases | `.pi/workflows/development-lifecycle-workflow.md` |
| GC workflow | Max-three cleanup shards | `.pi/workflows/garbage-collection.md` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| `writing-skills` | New skills | RED → GREEN pressure scenarios | Prose is added without proving behavior change |
| Skill directories | Manifest | Bidirectional parity test | Loader/catalog silently omits real skills or lists missing ones |
| New skills | Local lifecycle | No hard-coded fifth artifact | Imported conventions fork project state |
| Planning/API skills | Implementation tasks | Blast-radius and boundary checks | Selected ideas become decorative prose rather than executable gates |
| Prompts | Workflows | Matching max-three policy | A prompt can reintroduce an unbounded workflow fan-out |
| Worker briefs | Parent integration | Typed `task_brief`/`result` fields and parent verification | Vague or untrusted child output is integrated |
| Adapted material | Notice | Pinned source and MIT terms | Provenance is lost during rewriting |
| Policy tests | All orchestration surfaces | Agent-specific parsing, not generic numeric matching | Tests confuse unrelated limits with concurrency limits |

## Scope Clarification from Planning

The PRD's “every prompt and workflow” criterion also requires `.pi/prompts/audit.md`, `.pi/prompts/gc.md`, and `.pi/workflows/garbage-collection.md`. They were added to `spec.md` and `tasks.json` because audit and garbage collection otherwise retain dynamic or unbounded fan-out. This is a completeness correction, not a new product goal.

## Dependency Graph

```text
Task A: needs nothing; creates policy test and RED evidence
Task B: needs A; creates organize-workspace skill and GREEN evidence
Task C: needs B; creates define-language skill and GREEN evidence
Task D: needs B and C; creates attribution and exact manifest parity
Task E: needs D; updates planning and interface contract behavior
Task F: needs D; updates delegation and lifecycle handoff behavior
Task G: needs E and F; caps research/lifecycle workflows
Task H: needs E and F; caps audit/batch workflows and audit prompt
Task I: needs E and F; caps garbage-collection prompt/workflow
Task J: needs G, H, and I; caps create/research prompts
Task K: needs G, H, and I; caps plan/ship prompts

Wave 1: A
Wave 2: B
Wave 3: C
Wave 4: D
Wave 5: E, F
Wave 6: G, H, I
Wave 7: J, K
Wave 8: parent integration verification and one fresh review
```

No wave exceeds three tasks. Tasks sharing files are placed in different waves. `progress.md` is parent-owned execution evidence: the parent may append verified results after every task, but parallel workers never own or edit it.

## PRD Task Mapping

| PRD task | Plan tasks |
|---|---|
| `task-1` RED skill and policy tests | A |
| `task-2` Adapt skills and provenance/catalog | B, C, D |
| `task-3` Merge selected local patterns | E, F |
| `task-4` Enforce 1–3 agent waves | G, H, I, J, K |

## Tasks

### Task A — [test] Establish the failing policy harness

**End state:** One deterministic test file fails for the known missing skills, manifest drift, missing adopted patterns, and fan-out violations; RED behavioral evidence is recorded before production edits.

**Files:**
- `.pi/tests/skill-system.test.ts`
- `.pi/artifacts/lets-adopt-whats-viable-to-our-needs/progress.md`

**TDD steps:**
1. Add `node:test` helpers that enumerate `.pi/skills/*/SKILL.md`, flatten both manifest tiers, and compare sorted unique names.
2. Add focused assertions for `organize-workspace` safety language, `define-language` output fields, prohibited Bigpowers cockpit paths, adopted pattern markers, and attribution.
3. Add agent-specific fan-out assertions that parse concurrency declarations and known dispatch wording while ignoring unrelated numeric limits.
4. Run `node --experimental-strip-types --test .pi/tests/skill-system.test.ts`; expect named failures for the currently absent behavior and preserve the complete output in `progress.md` under `## RED Baseline`.
5. Run two fresh foreground `general` pressure scenarios without loading either proposed skill; record exact prompts, scores, unsafe/vague choices, and rationalizations in `progress.md`.

**Verify:** `test -s .pi/artifacts/lets-adopt-whats-viable-to-our-needs/progress.md`

### Task B — [skill] Implement safe workspace organization

**End state:** `organize-workspace` changes agent behavior from eager cleanup to inventory-first, reversible, explicitly confirmed workspace maintenance.

**Files:**
- `.pi/skills/organize-workspace/SKILL.md`

**TDD steps:**
1. Confirm Task A's workspace RED scenario and score are present before writing prose.
2. Add local frontmatter and a compact recipe: inventory → classify → propose → confirm → act → verify.
3. Define protected classes: source, configuration, credentials, `.git`, `.pi/artifacts`, symlinks, and ambiguous data; default to report-only and prohibit implicit deletion.
4. Run `node --experimental-strip-types --test --test-name-pattern="organize-workspace" .pi/tests/skill-system.test.ts`; expect this skill's static assertions to pass while unrelated RED assertions may remain.
5. Run the same scenario twice with the skill loaded in fresh foreground `general` calls; require two consecutive scores of at least 4/5 and append evidence to `progress.md`.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="organize-workspace" .pi/tests/skill-system.test.ts`

### Task C — [skill] Implement project language definition

**End state:** `define-language` produces an evidence-backed glossary with canonical terms, aliases, conflicts, examples, and unresolved decisions without forcing a storage path.

**Files:**
- `.pi/skills/define-language/SKILL.md`

**TDD steps:**
1. Confirm Task A's language RED scenario and score are present before writing prose.
2. Add local frontmatter and a compact recipe: collect evidence → group concepts → expose collisions → choose canonical terms → map aliases → validate usage.
3. Require each term to include meaning, evidence, accepted aliases, rejected/ambiguous uses, and unresolved questions; persistence occurs only when the caller names a destination.
4. Run `node --experimental-strip-types --test --test-name-pattern="define-language" .pi/tests/skill-system.test.ts`; expect this skill's assertions to pass while later policy assertions may remain RED.
5. Run the same scenario twice with the skill loaded in fresh foreground `general` calls; require two consecutive scores of at least 4/5 and append evidence to `progress.md`.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="define-language" .pi/tests/skill-system.test.ts`

### Task D — [catalog] Reconcile the catalog and provenance

**End state:** The manifest exactly matches 67 real skill directories after the two additions, and adapted material has durable attribution.

**Files:**
- `.pi/skills/manifest.json`
- `.pi/skills/THIRD_PARTY_NOTICES.md`

**TDD steps:**
1. Re-run the manifest parity test and confirm the expected RED diff.
2. Remove stale entries `behavioral-kernel` and `jira`; add the nine observed unlisted local skills plus `organize-workspace` and `define-language` to Tier 2, sorted consistently.
3. Add a notice naming `danielvm-git/bigpowers`, pinned commit `d1993d31437bfbdb5bda81e84650628215365754`, the adapted skill concepts, and the MIT license/notice requirement.
4. Run the catalog and attribution test names; expect exact parity with 67 unique entries and matching attribution.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="manifest|attribution" .pi/tests/skill-system.test.ts`

### Task E — [integration] Add impact and boundary gates

**End state:** Planning performs bounded blast-radius analysis before decomposition, and interface design validates contracts at every boundary before implementation is accepted.

**Files:**
- `.pi/skills/planning-and-task-breakdown/SKILL.md`
- `.pi/skills/api-and-interface-design/SKILL.md`

**TDD steps:**
1. Re-run adopted-pattern assertions and confirm blast-radius and boundary checks are RED.
2. Add a pre-slice impact gate to planning: entry points, dependents, tests, public contracts, state/artifact effects, and rollback scope; stop when evidence is missing.
3. Add a boundary validation recipe to interface design: parse inputs, validate outputs/errors, check compatibility, exercise producer/consumer tests, and record evidence.
4. Run the adopted-pattern test names and inspect both skills for duplicated or tutorial-like prose.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="blast radius|boundary" .pi/tests/skill-system.test.ts`

### Task F — [integration] Add bounded delegation and compact handoff

**End state:** Delegation is direct-first, task/result handoffs are typed and bounded, concurrent waves never exceed three, and lifecycle handoff reuses canonical artifacts.

**Files:**
- `.pi/skills/subagent-driven-development/SKILL.md`
- `.pi/skills/development-lifecycle/SKILL.md`

**TDD steps:**
1. Re-run delegation/handoff policy assertions and confirm RED.
2. Replace duplicated delegation prose with a direct-first decision: zero agents for surgical direct work, one for bounded specialist work, two or three only for genuinely independent scopes.
3. Define compact `task_brief` and `result` field sets including goal, exact files, non-goals, dependencies, acceptance criteria, verification, assumptions, blockers, changed files, and evidence.
4. Add sequential sharding for work beyond three and retain parent inspection/verification; keep the subagent skill at or below its current line count by compressing repetition.
5. Define lifecycle handoff as a compact section in `progress.md` or bounded `worker-context.md`, never a new state database or mandatory fifth artifact.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="delegation|handoff" .pi/tests/skill-system.test.ts`

### Task G — [workflow] Cap research and lifecycle orchestration

**End state:** Research and end-to-end lifecycle workflows use one-to-three concurrent agents, dependent review remains sequential, and extra angles are processed in later shards.

**Files:**
- `.pi/workflows/deep-research.md`
- `.pi/workflows/development-lifecycle-workflow.md`

**TDD steps:**
1. Re-run fan-out tests and confirm both workflow violations are RED.
2. Change deep research to one focused scout for bounded work and two or three distinct scouts only for multi-angle work; process additional angles sequentially before one dependent cross-check.
3. Cap lifecycle research and review waves at three and state that batch implementation inherits the same ceiling.
4. Run fan-out tests filtered to these two paths and inspect that completeness is preserved through sequential shards.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="deep-research|development-lifecycle-workflow" .pi/tests/skill-system.test.ts`

### Task H — [workflow] Cap audit and batch execution

**End state:** Audits and batch implementation process at most three disjoint shards per wave, including matching review shards, while the audit prompt communicates the same contract.

**Files:**
- `.pi/prompts/audit.md`
- `.pi/workflows/audit-pattern.md`
- `.pi/workflows/batch-implement.md`

**TDD steps:**
1. Re-run fan-out tests and confirm audit and batch violations are RED.
2. Cap audit reviewers at three per wave and require later occurrence shards to wait for the current joined result.
3. Cap implementation and matching review calls at three per dependency wave; preserve worktree isolation and parent integration.
4. Update the audit prompt to describe max-three sequential shards rather than an unspecified dynamic count.
5. Run fan-out tests filtered to audit and batch paths.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="audit-pattern|batch-implement|audit prompt" .pi/tests/skill-system.test.ts`

### Task I — [workflow] Cap garbage-collection fixes

**End state:** Garbage collection preserves all P0/P1 findings but executes independent fixes in sequential waves of at most three.

**Files:**
- `.pi/prompts/gc.md`
- `.pi/workflows/garbage-collection.md`

**TDD steps:**
1. Re-run fan-out tests and confirm both unbounded cleanup instructions are RED.
2. Replace “all independent findings together” behavior with ordered non-overlapping waves of one to three findings.
3. Keep same-file/dependent findings foreground and preserve isolated worktrees, parent inspection, and parent-run verification.
4. Run fan-out tests filtered to garbage-collection paths.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="garbage collection" .pi/tests/skill-system.test.ts`

### Task J — [prompt] Cap create and research discovery

**End state:** `/create` and `/research` prefer prior evidence and direct inspection, with Standard using at most two agents and Deep using at most three distinct agents in a wave.

**Files:**
- `.pi/prompts/create.md`
- `.pi/prompts/research.md`

**TDD steps:**
1. Re-run prompt fan-out assertions and confirm create/research wording is RED.
2. Replace create's five-agent Deep recipe with one local Explore plus up to two genuinely distinct specialist inputs; Standard uses one or two and Minimal uses zero or one.
3. Require reuse of current-session research before spawning and make dependent review a later foreground call rather than part of the initial swarm.
4. Align research prompt wording with the capped deep-research workflow and run filtered tests.

**Verify:** `node --experimental-strip-types --test --test-name-pattern="create prompt|research prompt" .pi/tests/skill-system.test.ts`

### Task K — [prompt] Cap planning, shipping, and review

**End state:** `/plan` and `/ship` enforce max-three waves, direct-first execution, and one default review with up to three bundled independent focuses only when risk warrants it.

**Files:**
- `.pi/prompts/plan.md`
- `.pi/prompts/ship.md`

**TDD steps:**
1. Re-run prompt fan-out assertions and confirm planning/ship wording is RED.
2. Cap Level-3 planning research at three distinct inputs and require sequential shards for additional questions.
3. Cap ship implementation workers and matching reviewers at three per wave.
4. Replace five simultaneous standard-review calls with one default reviewer; for high-risk changes permit up to three non-overlapping bundles: security/correctness, architecture/performance, and types/tests/conventions/simplicity.
5. Run prompt-specific tests, then the complete `.pi` test suite.

**Verify:** `node --experimental-strip-types --test .pi/tests/*.test.ts`

## Integration Verification

Run after Wave 7 and after every review-driven change:

1. `node --experimental-strip-types --test .pi/tests/*.test.ts`
2. `python3 -m json.tool .pi/skills/manifest.json >/dev/null`
3. `python3 -m json.tool .pi/artifacts/lets-adopt-whats-viable-to-our-needs/tasks.json >/dev/null`
4. `rg -n "blast radius|boundary|task_brief|handoff" .pi/skills/{planning-and-task-breakdown,api-and-interface-design,subagent-driven-development,development-lifecycle}/SKILL.md`
5. `! rg -n "specs/state\.yaml|release-plan\.yaml|execution-status\.yaml|\.bigpowers/" .pi/skills/organize-workspace .pi/skills/define-language`
6. `rg -n "danielvm-git/bigpowers|MIT|d1993d31437bfbdb5bda81e84650628215365754" .pi/skills/THIRD_PARTY_NOTICES.md`
7. Run one fresh foreground `review` call over the complete changed file set, then validate each finding directly and rerun commands 1–6 after any edit.

## Constitutional Compliance

- **Critical violations:** none in this plan.
- **Task file limits:** every implementation task owns at most three files.
- **Dependencies:** no package installation or new runtime dependency.
- **Typing:** no suppression escape is planned.
- **Destructive operations:** none planned.
- **Secrets:** no credential content is read or written; the workspace skill treats credential-bearing files as protected.
- **Git limitation:** branch, history, per-task commits, and worktrees are unavailable in the current directory. `/ship` must pause before implementation unless the user supplies the actual Git repository or explicitly accepts non-committed execution in this configuration workspace.

## Stop Conditions

- A RED pressure scenario was not recorded before its skill is written.
- Any task needs a fourth file not listed here; revise the plan first.
- A concurrent wave would exceed three agents; split it into another sequential shard.
- Manifest parity still differs after Task D.
- A new canonical state file or Bigpowers cockpit path appears.
- A verification command fails twice for the same task.
- Git-backed delivery is required but the workspace still has no repository metadata.

## Remaining Risks

- Behavioral pressure scores vary by model; fixed prompts, fixed rubrics, and two consecutive GREEN runs reduce but do not eliminate variance.
- A lower concurrency ceiling can increase elapsed time for very large audits; sequential shards preserve completeness at the cost of throughput.
- Static policy tests can become brittle if they match generic numbers. They must inspect agent-specific declarations and dispatch wording only.
- Reconciliation exposes historical manifest drift beyond the new skills. The exact additions/removals above keep that correction deterministic.