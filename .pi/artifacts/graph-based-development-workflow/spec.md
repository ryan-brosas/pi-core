# Graph-Based Development Workflow Pilot

**Artifact:** `graph-based-development-workflow`
**Created:** 2026-07-25
**Status:** Approved for planning

## Metadata

```yaml
depends_on: []
parallel: false
conflicts_with:
  - conversation-aware-create-handoff
blocks: []
```

## Problem Statement

The project records task dependencies, conflicts, files, and verification commands, but it still executes work through a mostly linear lifecycle and static wave snapshots. `plan.md` and `tasks.json` can describe different graphs, `/ship` does not deterministically validate or recompute a ready frontier, verification evidence is detached from task state, and the single `.active` pointer hides runnable work in other artifact directories.

This leaves agents and operators without a trustworthy answer to four questions: what is runnable now, why it is runnable, what evidence supports completed work, and what becomes stale after a failure or upstream change.

### Why now?

The completed research in `research.md` found evidence for repository code graphs, optimizable agent graphs, bounded feedback loops, and trajectory verifiers, but no evidence supporting a large graph platform or complete lifecycle rewrite. The project already has enough task metadata to run a small, falsifiable pilot without adding an extension, database, or fifth canonical artifact.

### Who is affected?

- **Primary users:** developers and coding agents using `/create`, `/plan`, `/ship`, and `/verify`.
- **Secondary users:** reviewers who need traceable task state, verification evidence, and safe parallel execution.

## Goal

Make `tasks.json` the authoritative persisted work DAG and let `/ship` execute a deterministically validated, dynamically recomputed ready frontier with evidence-linked state, while preserving the existing four artifacts and slash-command workflow during the pilot.

## Scope

### In scope

- A small deterministic TypeScript CLI/module for task-graph validation, ready-frontier calculation, and read-only cross-artifact frontier reporting.
- Backward-compatible reading of existing version-1 `tasks.json` files.
- A version-2 task contract for newly generated graphs with attempts and evidence references.
- Unique-ID, target-existence, self-edge, cycle, state-coherence, and evidence checks.
- Runtime normalization of conflicts as undirected scheduling constraints without requiring duplicate declarations.
- `tasks.json` as the only persisted execution graph; `plan.md` waves become derived human-readable snapshots using identical task IDs.
- Ready-frontier recomputation after pass, failure, invalidation, or integration.
- Conservative failure propagation: failed nodes block/stale descendants; ancestors reopen only with attributed cause or changed output.
- Evidence references from task nodes into `progress.md`.
- Transient code/test neighborhood discovery for only the selected ready task.
- A read-only all-artifacts frontier report that never changes `.active` or dispatches work.
- Deterministic tests and static policy tests for the complete contract.

### Out of scope

- A graph database, persistent repository symbol graph, extension, daemon, or new state service.
- Fabric mesh as task-graph state or orchestration.
- Automatic MCTS/workflow optimization, autonomous cross-feature dispatch, or automatic `.active` switching.
- Replacing the four canonical active-work files: `spec.md`, `plan.md`, `tasks.json`, and `progress.md`.
- Removing `/create`, `/plan`, `/ship`, or `/verify`, or immediately converting every command into a graph operation.
- Claiming productivity improvement before the pilot has comparative measurements.
- Rewriting unrelated audit, garbage-collection, or research workflows.

## Proposed Solution

### Overview

Add one deep module at `.pi/scripts/task-graph.ts`. It exposes deterministic validation and frontier calculations for tests and a CLI used by prompts. Existing version-1 graphs remain readable. Newly generated version-2 graphs add `attempt` and `evidence_refs`; passed version-2 nodes require current evidence. The utility treats `depends_on` as directed edges and `conflicts_with`/file overlap as undirected scheduling constraints.

`/create` emits the canonical graph, `/plan` refines the same task IDs rather than creating an independent graph, `/ship` validates and repeatedly executes the current ready frontier, and `/verify` records evidence or invalidates affected nodes. `progress.md` remains the evidence log. Code dependency neighborhoods are computed on demand and are never a new source of truth.

### User flow

1. `/create` writes a version-2 `tasks.json` with task IDs, dependencies, conflicts, files, attempts, and empty evidence references.
2. `/plan` may split or refine nodes, but updates `tasks.json`; any displayed waves are derived from the current graph.
3. `/ship` validates the graph and stops on structural errors.
4. `/ship` computes the ready frontier, selects a conflict-free shard of at most three tasks, derives each task's local code/test neighborhood, executes, integrates, and records evidence.
5. After every state transition, `/ship` recomputes the frontier rather than trusting old waves.
6. `/verify` links fresh evidence to passed nodes or marks affected descendants stale when upstream evidence/artifacts change.
7. A user can run a read-only all-artifacts frontier report and explicitly choose a slug; the report never mutates `.active` or starts work.

## Requirements

### R1 — Deterministic graph validation

The graph utility must report machine-readable errors and exit non-zero for duplicate IDs, missing dependency/conflict targets, self-dependencies, dependency cycles, incoherent `status`/`passes`, and invalid version-2 evidence state.

- **WHEN** a valid current version-1 artifact is checked **THEN** validation succeeds without requiring migration.
- **WHEN** a seeded invalid graph is checked **THEN** the exact invariant violation is reported deterministically.

### R2 — Dynamic ready frontier

The utility must return pending nodes whose dependencies passed and which do not conflict with running nodes through declared conflicts or file overlap.

- **WHEN** a node passes or fails **THEN** readiness is recomputed from current state.
- **WHEN** two tasks conflict in only one declaration direction **THEN** scheduling still treats the conflict as symmetric.

### R3 — Canonical graph production

`/create` must emit version-2 task graphs, and `/plan` must use the same task IDs and update `tasks.json` whenever it splits or changes nodes.

- **WHEN** `plan.md` displays waves **THEN** it labels them derived snapshots rather than authoritative state.
- **WHEN** plan and task IDs diverge **THEN** planning or shipping stops instead of guessing.

### R4 — Frontier-based execution

`/ship` must validate before execution, select only a conflict-free ready shard, cap concurrent work at three, and recompute after every integration or state transition.

- **WHEN** no node is ready but pending nodes remain **THEN** `/ship` reports the blocking dependency or invalid graph rather than falling back to list order.
- **WHEN** a cross-artifact frontier is displayed **THEN** the user must explicitly select a slug before execution.

### R5 — Evidence-linked state and selective invalidation

Version-2 passed nodes must reference fresh verification/review/commit evidence in `progress.md`.

- **WHEN** a task fails **THEN** it becomes failed and descendants become blocked or stale.
- **WHEN** an upstream artifact changes **THEN** dependent evidence becomes stale.
- **WHEN** no evidence attributes the failure to an ancestor **THEN** ancestors remain closed.

### R6 — Transient code/test neighborhoods

Before editing a selected task, `/ship` must derive a bounded neighborhood of affected files, imports/references, tests, contracts, and recent changes using existing tools.

- **WHEN** neighborhood evidence is unavailable or contradictory **THEN** the task stops for bounded discovery rather than expanding to a persistent code graph.

### R7 — Read-only cross-artifact visibility

The graph utility must report runnable nodes across `.pi/artifacts/*/tasks.json` without writing artifacts, changing `.active`, or dispatching work.

### Non-functional requirements

- **Compatibility:** Node.js with `--experimental-strip-types`; version-1 task graphs remain readable.
- **Safety:** no implicit active-slug changes, cross-feature dispatch, or worktree/branch mutation.
- **Determinism:** identical graph input produces identical validation/frontier JSON and exit status.
- **Performance:** current artifact scans complete within one second on this repository under normal local conditions.
- **Maintainability:** one production module; no extension, package dependency, database, or duplicated graph state.
- **Concurrency:** no more than three tasks per shard; dependencies and conflicts always win over parallel preference.

## Success Criteria

- [ ] Valid and invalid graph fixtures prove unique-ID, target, self-edge, cycle, state, and version-2 evidence rules.
  - Verify: `node --experimental-strip-types --test .pi/tests/task-graph.test.ts`
- [ ] The utility validates all current version-1 task artifacts without false positives.
  - Verify: `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- [ ] Frontier tests prove dependency gating and undirected conflict/file-overlap exclusion.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="frontier|conflict" .pi/tests/task-graph.test.ts`
- [ ] `/create` and `/plan` define `tasks.json` as canonical and version-2 producers with derived plan waves.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="graph producers" .pi/tests/skill-system.test.ts`
- [ ] `/ship` validates and recomputes a conflict-free frontier after every transition instead of trusting fixed waves.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="frontier execution" .pi/tests/skill-system.test.ts`
- [ ] `/verify` and `/ship` require evidence references and conservative descendant invalidation without blanket ancestor reopening.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="evidence-linked graph state" .pi/tests/skill-system.test.ts`
- [ ] Cross-artifact reporting is read-only and leaves `.active` byte-for-byte unchanged.
  - Verify: `before=$(sha256sum .pi/artifacts/.active); node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null; test "$before" = "$(sha256sum .pi/artifacts/.active)"`
- [ ] All retained project tests pass and the changed files have no whitespace errors.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts && git diff --check`

## Technical Context

### Existing patterns

- `.pi/artifacts/*/tasks.json` — current dependency/conflict/status contract consumed by `/ship`.
- `.pi/prompts/plan.md:245-320` — textual dependency graph and static wave generation to be made derived-only.
- `.pi/prompts/ship.md:102-165` — current one-time routing, static waves, sequential fallback, retries, and task-state updates.
- `.pi/prompts/verify.md:91-165` — current completeness/evidence workflow and `progress.md` logging.
- `.pi/workflows/batch-implement.md:55-90` — conflict-free shard execution and integration behavior.
- `.pi/skills/development-lifecycle/SKILL.md` — four-artifact contract and active-slug lifecycle.
- `.pi/tests/skill-system.test.ts` — deterministic policy assertions for prompts, workflows, and skills.
- `.pi/artifacts/graph-based-development-workflow/research.md` — source-grounded design constraints and falsification criteria.

### Affected files

```yaml
files:
  - .pi/scripts/task-graph.ts
  - .pi/tests/task-graph.test.ts
  - .pi/tests/skill-system.test.ts
  - .pi/prompts/create.md
  - .pi/prompts/plan.md
  - .pi/prompts/ship.md
  - .pi/prompts/verify.md
  - .pi/workflows/batch-implement.md
  - .pi/skills/subagent-driven-development/SKILL.md
  - .pi/skills/development-lifecycle/SKILL.md
```

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Graph metadata becomes another stale truth | Medium | High | Keep only `tasks.json` authoritative; derive plan waves and transient code neighborhoods. |
| Version-2 validation breaks existing artifacts | Medium | High | Explicit version-1 compatibility tests and version-gated evidence requirements. |
| False invalidation causes unnecessary rework | Medium | Medium | Invalidate descendants only; reopen ancestors only with attributed evidence. |
| Parallel tasks still overlap indirectly | Medium | High | Treat declared conflicts and file overlap as undirected constraints; cap shards at three. |
| Cross-artifact reporting triggers unrelated work | Low | High | Report-only command plus explicit slug selection; never mutate `.active`. |
| Prompt policy drifts from utility behavior | Medium | Medium | Behavior tests for the utility and static contract tests for every orchestration surface. |
| The graph adds overhead without improving outcomes | Medium | Medium | Keep this a pilot; measure later changes and abandon broader adoption if operator burden rises. |

## Resolved Questions

| Question | Decision | Status |
|---|---|---|
| What is canonical state? | `tasks.json` is the only persisted work graph. | Resolved |
| Is a graph database required? | No; use one local TypeScript module and transient searches. | Resolved |
| How are old task files handled? | Read version 1; generate version 2 for new work. | Resolved |
| Are conflicts directed? | Declarations may be one-sided; scheduling normalizes them as undirected. | Resolved |
| Should failures reopen all ancestors? | No; block/stale descendants and reopen only an attributed upstream cause. | Resolved |
| Should all slash commands be replaced now? | No; preserve command semantics during the pilot. | Resolved |

## Tasks

### Establish graph behavior and policy contracts [test]

Tests capture graph invariants, frontier behavior, version compatibility, producer/consumer policy, evidence links, and read-only reporting before production changes.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/tests/task-graph.test.ts
  - .pi/tests/skill-system.test.ts
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/task-graph.test.ts` exits non-zero only for missing utility behavior.
- `node --experimental-strip-types --test --test-name-pattern="graph producers|frontier execution|evidence-linked graph state" .pi/tests/skill-system.test.ts` exits non-zero only for missing policy behavior.

### Implement deterministic task-graph utility [core]

A single dependency-free module validates versioned task graphs, computes conflict-free ready frontiers, and reports all artifact frontiers without mutation.

**Metadata:**

```yaml
depends_on:
  - Establish graph behavior and policy contracts
parallel: false
conflicts_with: []
files:
  - .pi/scripts/task-graph.ts
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/task-graph.test.ts`
- `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`

### Make task producers graph-canonical [workflow]

`/create`, `/plan`, and lifecycle guidance emit or refine one version-2 `tasks.json` graph while treating displayed waves as derived views.

**Metadata:**

```yaml
depends_on:
  - Implement deterministic task-graph utility
parallel: true
conflicts_with: []
files:
  - .pi/prompts/create.md
  - .pi/prompts/plan.md
  - .pi/skills/development-lifecycle/SKILL.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="graph producers" .pi/tests/skill-system.test.ts`
- `rg -n "version 2|authoritative|derived.*wave|task-graph" .pi/prompts/create.md .pi/prompts/plan.md .pi/skills/development-lifecycle/SKILL.md`

### Execute the dynamic ready frontier [workflow]

`/ship`, batch execution, and subagent guidance validate and repeatedly consume conflict-free ready frontiers with bounded transient code neighborhoods.

**Metadata:**

```yaml
depends_on:
  - Implement deterministic task-graph utility
parallel: true
conflicts_with: []
files:
  - .pi/prompts/ship.md
  - .pi/workflows/batch-implement.md
  - .pi/skills/subagent-driven-development/SKILL.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="frontier execution" .pi/tests/skill-system.test.ts`
- `node --experimental-strip-types --test .pi/tests/task-graph.test.ts`
- `git diff --check`

### Link evidence and selective invalidation [workflow]

`/ship` and `/verify` record attempt-scoped evidence, stale affected descendants, and preserve unrelated ancestors before final integration gates.

**Metadata:**

```yaml
depends_on:
  - Make task producers graph-canonical
  - Execute the dynamic ready frontier
parallel: false
conflicts_with: []
files:
  - .pi/prompts/ship.md
  - .pi/prompts/verify.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="evidence-linked graph state" .pi/tests/skill-system.test.ts`
- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `git diff --check`

## Notes

- This specification defines pilot infrastructure, not proof that graph-aware development is superior.
- The current dirty branch is preserved. `/create` claims no new branch or worktree and performs artifact-only setup.
- After implementation, compare at least three similarly sized changes against the current baseline before expanding graph scope.