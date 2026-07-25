# Artifact Progression Graph Implementation Plan

> **State:** Prepared but inactive. Do not execute until `research-enforcement-extension` is verified complete and the user explicitly activates this artifact.

## Goal

Connect independent artifact task graphs into a deterministic, read-only project progression view while preserving one explicitly selected active artifact.

## Non-goals

- No cross-artifact task scheduler, automatic activation, pause/abandon/waiver state, registry, reverse edges, or Fabric integration.
- No mutation of `.active` by project validation or frontier reporting.
- No migration of existing version-1 graphs during this feature.

## Planning Basis

- Deep research and cross-check are recorded in `research.md`.
- Local blast-radius inspection confirmed the graph implementation is concentrated in `.pi/scripts/task-graph.ts`, with behavior in `.pi/tests/task-graph.test.ts` and lifecycle contracts in prompts, the lifecycle skill, and `.pi/tests/skill-system.test.ts`.
- A new Plan subagent was skipped because current-session deep research already resolved architecture and sequencing; parent synthesis avoids duplicate delegation.

## Invariants

1. `tasks.json` remains authoritative inside an artifact.
2. Root `depends_on` contains artifact slugs only; task dependencies remain local.
3. Completion and readiness are derived, never copied to root `status`.
4. Project scans are sorted and read-only.
5. Only one artifact is active, and changing it requires immediate user approval.
6. Prepared artifacts may have spec, plan, graph, and progress files without becoming active.

## Derived Model

### Local completion

An artifact is dependency-complete only when its graph is version 2, has at least one task, every task is passed with current-attempt evidence, and at least one current evidence reference has kind `verification`. Invalid, unreadable, version-1, and empty graphs return explicit reasons rather than completion.

### Project readiness

- `dependency_ready`: all root `depends_on` artifacts are complete.
- `activatable`: dependency-ready and the selected active artifact is complete, or this artifact is already active.
- `blocking_artifacts`: sorted unresolved upstream slugs.
- `requires_explicit_activation`: true for non-active artifacts regardless of eligibility.

### Lifecycle progression

`/create` and `/plan` may prepare an explicitly named inactive artifact while preserving `.active`. `/ship` recomputes project readiness and may request activation only after the current artifact is complete. `/research` may inspect gaps but cannot select or dispatch work.

## Ordered Slices

### Slice 1 — Lock contracts in RED

Add focused fixtures covering root dependency decoding, project issue paths, cycles, version compatibility, empty graphs, current verification evidence, exact blockers, occupied active lock, and byte-for-byte read-only behavior. Add lifecycle-policy tests for inactive preparation and explicit activation.

- **Task:** `task-1`
- **Verify:** `node --experimental-strip-types --test --test-name-pattern="artifact progression|project artifact graph|prepared artifact" .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`
- **Risk:** A broad test could pass against current independent frontier behavior; every fixture must assert a missing new field or issue code.
- **Stop:** If current tests reveal another authoritative project state source, stop and reconcile the spec.

### Slice 2 — Implement project graph derivation

Extend decoding without changing local task semantics, add whole-directory validation and cycle detection, derive completion/readiness, and integrate the result into `frontier --all` with stable JSON and exit behavior.

- **Task:** `task-2`
- **Verify:** `node --experimental-strip-types --test --test-name-pattern="artifact progression|project artifact graph" .pi/tests/task-graph.test.ts`
- **Risk:** Reusing local dependency helpers without distinct types could confuse artifact and task IDs.
- **Stop:** If project validation requires writing normalized data, stop; normalization must remain in memory.

### Slice 3 — Align lifecycle progression

Document and test two separate operations: preparing a named inactive artifact and explicitly activating an eligible one. Update create, plan, ship, research, and lifecycle guidance together so no command silently switches the pointer.

- **Task:** `task-3`
- **Verify:** `node --experimental-strip-types --test --test-name-pattern="artifact progression|prepared artifact" .pi/tests/skill-system.test.ts`
- **Risk:** Prompt wording may accidentally allow implementation against a non-active artifact or redirect unrelated creation to the current ship.
- **Stop:** If a workflow can mutate `.active` without an immediate approval checkpoint, do not mark the task passed.

### Slice 4 — Integrated verification

Run focused tests, retained tests, every graph validator, project-frontier read-only proof, syntax checks, and owned-path diff checks. Record any pre-existing unrelated failures exactly.

- **Task:** `task-4`
- **Verify:** commands in canonical `tasks.json`.
- **Risk:** Existing dirty and runtime-managed files can obscure ownership.
- **Stop:** Stop on active-slug drift, new test failures, graph invalidity, or concurrent edits to owned paths.

## Canonical Dependency Graph

`task-1 → task-2 → task-3 → task-4`

All tasks are serial because graph behavior and lifecycle assertions share test contracts. The ready frontier will be `task-1` only after this artifact is explicitly activated.

## File Ownership by Task

| Task | Owned files |
| --- | --- |
| `task-1` | `.pi/tests/task-graph.test.ts`, `.pi/tests/skill-system.test.ts` |
| `task-2` | `.pi/scripts/task-graph.ts`, `.pi/tests/task-graph.test.ts` |
| `task-3` | `.pi/prompts/create.md`, `.pi/prompts/plan.md`, `.pi/prompts/ship.md`, `.pi/prompts/research.md`, `.pi/skills/development-lifecycle/SKILL.md`, `.pi/tests/skill-system.test.ts` |
| `task-4` | Verification evidence only |

## Activation Handoff

1. Finish and verify every task in `research-enforcement-extension`.
2. Run project validation and `frontier --all`; confirm this artifact is dependency-ready and activatable.
3. Show the exact `.active` pointer update and request immediate written approval.
4. Change `.active` only after approval, then validate this graph and recompute its local frontier.
5. Start `task-1`; do not execute this prepared graph while another artifact remains active.

## Open Questions

None.
