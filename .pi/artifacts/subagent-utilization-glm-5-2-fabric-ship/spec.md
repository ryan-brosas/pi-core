# GLM 5.2 Fabric-backed `/ship` workers

**Artifact:** `subagent-utilization-glm-5-2-fabric-ship`

**Created:** 2026-07-25

**Status:** Approved for shipping

## Metadata

```yaml
depends_on: []
parallel: false
conflicts_with: []
blocks: []
```

## Problem Statement

### What problem are we solving?

Pi Core's `/ship` contract requires Pi `Agent` for child orchestration and `fabric_exec` for implementation, but the configured implementation route does not satisfy that contract. `general` is the worker selected by the batch and review-fix paths, yet its current extension policy prevents Fabric from loading. `build` is pinned to GLM 5.2 and loads extensions, but it is disabled and its body describes a second orchestrator rather than a bounded worker.

As a result, delegated `/ship` work cannot reliably use Fabric or direct most implementation to GLM 5.2. Child prompts also do not automatically inherit `/ship` or project approval rules because the agents use replacement prompts without inherited conversation context.

### Why now?

The user wants implementation work—especially `build` and `general` tasks—to utilize GLM 5.2 while preserving the canonical `/ship` lifecycle and Fabric boundary. The completed research in `research.md` proved the model is registered and scoped, identified the disabled/incompatible worker configuration, and found that `/ship` currently treats approval-gated Git operations as automatic.

### Who is affected?

- **Primary users:** developers invoking `/ship` for graph-backed implementation.
- **Secondary users:** maintainers of Pi agent definitions, workflow prompts, and static orchestration tests.

## Goal

Make `build` and `general` spawnable, GLM 5.2-backed, Fabric-capable implementation workers that execute parent-selected `/ship` tasks without becoming nested orchestrators, while the parent retains graph state, approvals, review, integration, and final verification.

## Scope

### In scope

- Pin both implementation workers to `makora/zai-org/GLM-5.2-NVFP4` through agent frontmatter.
- Enable the extension surface required for `fabric_exec` in both workers using a proven configuration.
- Enable and redefine `build` as a bounded, non-nesting implementation worker.
- Keep `general` as the surgical worker and align its autonomy rules with exact task scope and project approval gates.
- Route substantial bounded tasks to `build` and small tasks/review fixes to `general` from `/ship` and its retained delegation workflow.
- Give every delegated implementation a self-contained ship-worker envelope: task, files, non-goals, acceptance criteria, Fabric requirement, verification, stop conditions, and approval constraints.
- Keep Pi `Agent` as the only child orchestration mechanism and Fabric as the implementation/batching mechanism.
- Reconcile `/ship` branch, worktree, commit, integration, dependency, new-file, and active-artifact behavior with explicit project approval requirements.
- Add deterministic tests for model routing, Fabric availability configuration, bounded worker behavior, self-contained handoffs, and approval-gated shipping.

### Out of scope

- Using Fabric agents, actors, mesh, or Fabric subagents for child orchestration.
- Changing the GLM provider, adding a model, dependency, extension package, or package-manager files.
- Benchmarking NVFP4 against FP8 or selecting models dynamically per invocation.
- Allowing implementation workers to schedule graph nodes, alter `.active`, own integration, or spawn nested agents during `/ship`.
- Automatically creating branches/worktrees, committing, merging, pushing, deploying, or installing dependencies.
- Modifying unrelated active artifacts or discarding pre-existing edits in the worker definition files.

## Proposed Solution

### Overview

Retain `/ship` as the sole coordinator. It validates `tasks.json`, computes the ready frontier, selects a conflict-free shard, and chooses one of two GLM workers: `general` for surgical tasks (normally one to three declared files and no architecture-level decision) and `build` for larger but still bounded implementation tasks. Both workers receive Fabric, operate only inside the resolved task envelope, never delegate, and return changed-file and verification evidence for parent inspection.

The parent remains responsible for graph transitions, approval checkpoints, lifecycle evidence, review dispatch, integration, and broad verification. Any branch, worktree, commit, merge, dependency, new-file, or active-artifact mutation occurs only after the separate approval required by `AGENTS.md`; lack of approval is a checkpoint, not permission to bypass the gate.

### Shipping flow

1. The parent validates the explicitly active version-2 graph and computes the current frontier.
2. The parent selects at most three disjoint ready tasks and derives each bounded code/test neighborhood.
3. The parent routes each task to `general` or `build` using documented scope/risk criteria and sends a self-contained worker envelope.
4. The worker uses `fabric_exec` for every code implementation or fix, stays within approved files, performs no nested delegation, and reports evidence.
5. The parent inspects actual changes, runs task verification, obtains review, and requests any still-required Git/worktree/integration approval.
6. Only after accepted evidence does the parent update lifecycle state and recompute the frontier.

## Requirements

### R1 — GLM and Fabric worker configuration

Both `build` and `general` must pin the exact registered GLM 5.2 NVFP4 model and load the extension surface that exposes `fabric_exec`.

- **WHEN** either implementation worker is selected **THEN** model and thinking are controlled by frontmatter, not caller overrides.
- **WHEN** a worker receives a `/ship` implementation task **THEN** it can invoke `fabric_exec` rather than receiving an impossible prompt.

### R2 — Bounded worker roles

`general` must remain the surgical implementation/fix worker, while `build` handles larger parent-selected tasks without acting as an orchestrator.

- **WHEN** a task is small, concrete, and normally limited to one to three files **THEN** `/ship` routes it to `general`.
- **WHEN** a task has a larger declared file set or materially higher implementation complexity but no unresolved architecture decision **THEN** `/ship` routes it to `build`.
- **WHEN** either worker discovers scope expansion, architecture change, an undeclared file, or a gated operation **THEN** it stops and reports to the parent.
- **WHEN** either worker is running under `/ship` **THEN** it does not spawn another agent or mutate graph/lifecycle state.

### R3 — Self-contained ship-worker envelope

Every delegated implementation and review fix must receive the complete bounded contract because replacement prompts do not inherit `/ship`.

The envelope must include task ID and attempt, goal, exact files and transient neighborhood, non-goals, dependencies, acceptance criteria, required `fabric_exec` use, verification commands, maximum fix attempts, approval restrictions, and output fields.

### R4 — Parent-owned orchestration and verification

The parent must retain task selection, graph transitions, child lifecycle, review, integration, and verification.

- **WHEN** children run concurrently **THEN** the parent uses Pi `Agent`, limits the wave to three disjoint tasks, and uses approved isolated worktrees only when separately authorized.
- **WHEN** a child reports success **THEN** the parent reads the actual changes and reruns required verification before accepting them.
- **WHEN** a task passes **THEN** the parent records current-attempt evidence and recomputes the frontier.

### R5 — Approval-safe shipping

`/ship` must not treat implementation approval as standing authorization for Git, workspace, dependency, file-creation, or lifecycle mutations.

- **WHEN** branch/worktree creation, commit, merge, integration, push, deploy, dependency installation, new-file creation, or active-artifact mutation is required **THEN** the parent obtains the applicable explicit approval before acting.
- **WHEN** approval is absent **THEN** `/ship` reports a checkpoint and preserves verified work without claiming the gated action occurred.

### R6 — Deterministic contract coverage

Static tests must fail when worker model/extension/enablement, non-nesting behavior, ship routing, Fabric requirements, parent verification, or approval gates regress.

## Non-functional requirements

- **Compatibility:** Pi 0.82.0, `@tintinweb/pi-subagents` 0.14.3, current version-2 task graph, and Node.js `--experimental-strip-types` tests.
- **Safety:** preserve unrelated/concurrent edits; no deletion, dependency addition, branch/worktree action, commit, merge, push, deployment, or implicit `.active` change during implementation.
- **Concurrency:** at most three disjoint agents per wave; dependent work remains sequential.
- **Maintainability:** one shared worker-envelope contract in the existing shipping/delegation surfaces; avoid duplicated long prompts where a clear canonical pointer is available.
- **Observability:** child and parent reports identify selected worker, task ID/attempt, files, commands, observed results, blockers, and approval state.

## Success Criteria

- [ ] Both implementation agent definitions use the exact GLM 5.2 NVFP4 key, load Fabric, and are spawnable for their intended roles.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="GLM ship workers expose Fabric" .pi/tests/skill-system.test.ts`
- [ ] `build` and `general` are bounded workers that cannot nest delegation or own task-graph/lifecycle integration.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="GLM ship workers are bounded executors" .pi/tests/skill-system.test.ts`
- [ ] `/ship`, `batch-implement`, and subagent-driven development route substantial work to `build`, surgical work to `general`, and require `fabric_exec` in every implementation/fix envelope.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="ship routes GLM Fabric workers with self-contained contracts" .pi/tests/skill-system.test.ts`
- [ ] Pi `Agent` remains the child orchestrator, the parent remains the graph/review/verification owner, and concurrency remains capped at three disjoint tasks.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="subagent coordination remains Pi-native and parent-verified|ship executes a validated dynamic frontier|fan-out" .pi/tests/skill-system.test.ts`
- [ ] `/ship` and retained workflows explicitly approval-gate branch/worktree/commit/integration/dependency/new-file and active-artifact mutations.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="ship honors project approval gates" .pi/tests/skill-system.test.ts`
- [ ] The full retained suite and whitespace checks pass after integration.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts && git diff --check -- .pi/agents/build.md .pi/agents/general.md .pi/prompts/ship.md .pi/workflows/batch-implement.md .pi/skills/subagent-driven-development/SKILL.md .pi/tests/skill-system.test.ts`

## Technical Context

### Existing patterns

- `.pi/prompts/ship.md:11-30,88-101` — canonical Pi-Agent/Fabric boundary and dynamic frontier routing.
- `.pi/prompts/ship.md:273-274,318` — current review-fix routing to `general` with a Fabric instruction.
- `.pi/workflows/batch-implement.md:52-77` — current implementation and review phases; implementation is fixed to `general`.
- `.pi/skills/subagent-driven-development/SKILL.md:27-76` — parent-selected shard contract and current `general`-only example.
- `.pi/agents/build.md` — GLM-pinned but disabled orchestrator definition; currently has pre-existing workspace edits that `/ship` must preserve and re-read.
- `.pi/agents/general.md` — surgical worker with pre-existing model/thinking edits; currently lacks Fabric extension loading.
- `.pi/tests/skill-system.test.ts:152-280` — deterministic dynamic-frontier, fan-out, and parent-verification contract tests.
- `.pi/artifacts/subagent-utilization-glm-5-2-fabric-ship/research.md` — completed source-backed research and constraints.

### Affected files

```yaml
files:
  - .pi/agents/build.md
  - .pi/agents/general.md
  - .pi/prompts/ship.md
  - .pi/workflows/batch-implement.md
  - .pi/skills/subagent-driven-development/SKILL.md
  - .pi/tests/skill-system.test.ts
```

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Enabling `build` creates nested orchestration | High | High | Replace its orchestrator contract with a bounded, no-delegation worker contract before enabling it. |
| `general` is told to use Fabric but cannot see the tool | High | High | Enable a proven extension configuration and lock it with static plus parent-observed verification. |
| Child prompts omit project approval constraints | Medium | High | Require a canonical self-contained envelope and approval-stop clauses in every implementation/fix path. |
| Increased delegation adds cost or context loss | Medium | Medium | Route only parent-selected bounded tasks, keep one-task work foreground, cap waves at three, and require parent verification. |
| Current dirty edits are overwritten | Medium | High | Re-read owned paths before editing; preserve pre-existing changes and stop on overlapping concurrent modification. |
| `/ship` and AGENTS.md disagree about commits/worktrees | High | High | Make the prompt explicitly defer to project approval gates and represent missing approval as a checkpoint. |
| Static tests prove prose but not provider health | Medium | Medium | Verify registry/model scope separately and include an optional read-only worker smoke check when the runtime is available. |

## Resolved Decisions

| Question | Decision | Status |
|---|---|---|
| Which model should implementation workers use? | `makora/zai-org/GLM-5.2-NVFP4`, controlled by frontmatter. | Resolved |
| Who orchestrates children? | Pi `Agent`; never Fabric agents/actors/mesh. | Resolved |
| Who owns graph state and integration? | The parent `/ship` session. | Resolved |
| How are workers split? | `general` for surgical tasks/fixes; `build` for larger bounded tasks. | Resolved |
| May workers delegate? | No, not while executing `/ship` work. | Resolved |
| How is Fabric loaded? | Use a currently proven extension-loading configuration; do not guess a narrow alias. | Resolved |
| Are Git/worktree actions automatic? | No; each remains separately approval-gated by project policy. | Resolved |

## Tasks

### Task 1 — Lock GLM/Fabric ship-worker contracts [test]

Deterministic RED tests capture worker model/extension/enablement, bounded roles, routing, self-contained handoffs, and project approval gates without modifying production prompts or agent definitions.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/tests/skill-system.test.ts
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="GLM ship workers expose Fabric|GLM ship workers are bounded executors|ship routes GLM Fabric workers with self-contained contracts|ship honors project approval gates" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/tests/skill-system.test.ts`

### Task 2 — Configure bounded GLM Fabric workers [agent]

`build` and `general` are spawnable GLM 5.2 implementation workers with Fabric access, explicit no-nesting behavior, strict task scope, and approval-aware stop conditions.

**Metadata:**

```yaml
depends_on:
  - task-1
parallel: true
conflicts_with: []
files:
  - .pi/agents/build.md
  - .pi/agents/general.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="GLM ship workers expose Fabric|GLM ship workers are bounded executors" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/agents/build.md .pi/agents/general.md`

### Task 3 — Route `/ship` through bounded GLM workers [workflow]

The canonical shipping and delegation surfaces select `build` or `general` by bounded task criteria, provide complete Fabric worker envelopes, retain parent ownership, and stop at unapproved operations.

**Metadata:**

```yaml
depends_on:
  - task-1
parallel: true
conflicts_with: []
files:
  - .pi/prompts/ship.md
  - .pi/workflows/batch-implement.md
  - .pi/skills/subagent-driven-development/SKILL.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="ship routes GLM Fabric workers with self-contained contracts|ship honors project approval gates|ship executes a validated dynamic frontier|subagent coordination remains Pi-native and parent-verified" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/prompts/ship.md .pi/workflows/batch-implement.md .pi/skills/subagent-driven-development/SKILL.md`

### Task 4 — Run integrated ship-worker verification [verification]

The combined worker and routing changes pass the retained Pi Core suite and preserve the version-2 graph, fan-out, Fabric boundary, and approval contracts.

**Metadata:**

```yaml
depends_on:
  - task-2
  - task-3
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/subagent-utilization-glm-5-2-fabric-ship/tasks.json`
- `git diff --check -- .pi/agents/build.md .pi/agents/general.md .pi/prompts/ship.md .pi/workflows/batch-implement.md .pi/skills/subagent-driven-development/SKILL.md .pi/tests/skill-system.test.ts`

## Notes

- Current-session deep research was reused; no additional research agents were spawned.
- The user explicitly selected this slug after disambiguation.
- `.pi/agents/build.md` and `.pi/agents/general.md` already contain unrelated or concurrent workspace edits. `/ship` must inspect and preserve them rather than assuming the research snapshot is current.
- No branch, worktree, dependency installation, commit, merge, push, deployment, or implementation was performed during `/create`.