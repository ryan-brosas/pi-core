# Research: Project-Wide Artifact Progression Graph

- **Date:** 2026-07-25
- **Execution mode:** Complex workflow
- **Topic:** Connect per-artifact task graphs into a maintainable project progression graph based on the preceding design discussion.
- **Active-artifact relevance:** The active `research-enforcement-extension` concerns research enforcement, not project progression. This report is therefore standalone and `.active` was not changed.

## Executive Summary

The proposed concept is feasible and should remain deliberately small. Pi already has authoritative per-artifact task DAGs, deterministic task-frontier computation, current-attempt evidence rules, and read-only `frontier --all` reporting. What it lacks is validated artifact-to-artifact dependency semantics.

The best-supported model is a whole-artifact DAG stored in existing `tasks.json` files. Each artifact may declare upstream artifact slugs through one forward-only `depends_on` field. Project readiness is derived from upstream completion; it is never copied into another status field. Only one artifact remains active, and project-frontier reporting never changes `.active` or dispatches work.

An artifact is complete only when every task has passed with acceptable current evidence and verification. A dependent artifact may become dependency-ready only after all upstream artifacts are complete. Activation remains a separate, explicit, user-approved operation. `paused` and `abandoned` may release the single-active lock but must not satisfy dependencies; proceeding past either requires an explicit dependency change or waiver.

This follows established DAG practices from GitHub Actions, Airflow, DVC, and Dagster: explicit forward dependencies, derived readiness, validation before execution, and visible exceptional transitions rather than hidden overrides.

## Questions and Confidence

1. **Does the local project already have the necessary graph foundation? — Answered, high confidence.**
   - `.pi/scripts/task-graph.ts` validates task IDs, local dependencies, cycles, version-2 attempts/evidence shape, and computes deterministic frontiers.
   - `.pi/tests/task-graph.test.ts` proves cross-artifact scanning is sorted and byte-for-byte read-only.
   - `AGENTS.md` already requires `tasks.json` authority, frontier recomputation, explicit active selection, and no mutation by cross-artifact reporting.

2. **Does the current system already connect artifacts? — Answered, high confidence.**
   - No. `scanArtifactFrontiers` independently computes each artifact’s local frontier. It does not decode artifact edges, validate missing artifact references, detect project-wide cycles, or compute activation eligibility.
   - Some prior specifications contain prose `depends_on`, `blocks`, and `conflicts_with` metadata, but the graph decoder ignores it. This is precedent, not canonical behavior.

3. **What is the smallest maintainable dependency model? — Answered, high confidence.**
   - One optional root `depends_on: string[]` in each artifact’s `tasks.json`.
   - Artifact directory names are canonical IDs; embedded slugs must match their directory.
   - Store only forward dependencies. Do not persist reverse `blocks`, artifact conflicts, cross-artifact task edges, or duplicated readiness.

4. **How should completion and readiness work? — Answered, high confidence.**
   - Completion is derived from every task being passed plus the applicable evidence/verification gate.
   - `dependency_ready` means all referenced artifacts are complete.
   - `activatable` additionally means the current active artifact is complete or has an explicitly recorded paused/abandoned disposition.
   - `.active` remains the sole active-selection pointer.

5. **How should exceptions work? — Partially answered, medium-high confidence.**
   - Paused is reversible; abandoned is terminal non-success. Both release the activation lock but do not satisfy dependents.
   - A dependent can proceed only after an explicit, user-approved edge removal or waiver recorded in durable progress evidence.
   - Exact pause/checkpoint handling for running tasks remains a design decision.

## Verified Findings

### Local contracts

- The task graph already provides deterministic local validation, cycles, descendants, conflict-aware readiness, and version-2 current-attempt evidence structure. Sources: `.pi/scripts/task-graph.ts`; `.pi/tests/task-graph.test.ts`.
- Cross-artifact reporting is intentionally read-only and requires explicit slug selection. Sources: `AGENTS.md`; `.pi/tests/task-graph.test.ts`.
- `tasks.json` is the sole persisted execution DAG; `plan.md` is explanatory and `progress.md` stores attempts and evidence. Source: `AGENTS.md`.
- Full completion cannot rely only on `validateTaskGraph`: structural evidence references are checked there, while `/verify` checks that referenced anchors exist and support the claim. Source: `.pi/prompts/verify.md`.
- Existing root `status` values are not decoded by `task-graph.ts` and can drift from task state. A new authoritative root status would duplicate derived state.

### External precedents

- GitHub Actions uses `needs` to gate downstream jobs on upstream success; exceptional continuation uses explicit status expressions such as `always()` or `failure()`. This supports derived readiness and visible override semantics. Sources: [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [Expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions). Confidence: high.
- Airflow models explicit task states and defaults downstream execution to upstream success. Its documentation warns that permissive leaf trigger rules can make a run appear successful despite internal failure, supporting strict completion derivation. Sources: [DAGs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html), [Tasks](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html), [DAG Runs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html). Confidence: high.
- DVC builds pipelines from explicit dependency edges and reproduces stages in dependency order. Exceptional behavior uses named flags such as `--force` and `--allow-missing`, supporting deliberate rather than hidden bypasses. Sources: [`dvc.yaml`](https://dvc.org/doc/user-guide/project-structure/dvcyaml-files), [`dvc dag`](https://dvc.org/doc/command-reference/dag), [`dvc repro`](https://dvc.org/doc/command-reference/repro). Confidence: high.
- Dagster declares direct asset dependencies, supporting explicit edge-driven structure, though its overview is weaker evidence for lifecycle and override semantics. Source: [Dagster documentation](https://docs.dagster.io/). Confidence: medium.

## Recommended Semantics

```json
{
  "version": 2,
  "slug": "dependent-artifact",
  "depends_on": ["upstream-artifact"],
  "tasks": []
}
```

Project validation should reject:

- missing, duplicate, or self artifact references;
- directory/embedded-slug mismatch;
- project-wide dependency cycles;
- invalid referenced task graphs.

Project-frontier output should distinguish:

- **state:** local task state such as ready, running, blocked, intervention-required, or complete;
- **dependency_ready:** every upstream artifact is complete;
- **activatable:** dependency-ready and the active lock can be released;
- **blocking_artifacts:** exact unresolved upstream slugs;
- **requires_explicit_activation:** always true for a non-active artifact.

A minimal optional disposition may be needed:

```json
{
  "disposition": {
    "state": "open | paused | abandoned",
    "decision_ref": "progress.md#decision-anchor"
  }
}
```

Disposition is orthogonal to completion. `paused` and `abandoned` never count as successful dependency completion.

## Contradictions and Risks

- **Completion versus escape:** Pausing or abandoning cannot simultaneously count as completion. Separate lock release from dependency success.
- **New prerequisite discovered mid-artifact:** Keeping every gap in the current artifact is safe only when the work belongs to its acceptance criteria. Independently managed prerequisite work requires an approved pause, a new upstream artifact/edge, and explicit activation; otherwise the strict completion-first rule deadlocks.
- **Version-1 compatibility:** Existing version-1 task graphs lack current-attempt evidence. They need an explicit compatibility rule, migration, or grandfather decision before satisfying strict dependencies.
- **Running-task pause:** Pausing with `running` nodes risks orphaned work. Require a checkpoint/stop rule before lock release.
- **Mutable edges:** Adding or removing dependencies after execution starts may stale prior conclusions. Edge mutation needs impact reporting and explicit approval.
- **Root status duplication:** Do not make existing top-level `status` authoritative; derive project state from tasks, evidence, dependencies, and disposition.

## Open Decisions

1. Must version-1 artifacts migrate before satisfying dependencies, or may a documented grandfather decision suffice?
2. Is an empty task list invalid, incomplete, or vacuously complete?
3. Must every running task be checkpointed to a non-running state before pausing?
4. Are artifact edges immutable after the first task attempt, or can approved changes stale affected work?
5. Should dependency waivers remove the edge or retain it with a separately validated waiver record?
6. Should explicit activation be a dedicated command or a documented validation-and-pointer-update procedure?

## Recommendation

Proceed with the whole-artifact design, but keep the first implementation bounded to:

1. optional root `depends_on` edges in existing `tasks.json` files;
2. project-wide missing-reference and cycle validation;
3. derived completion, `dependency_ready`, and `activatable` reporting;
4. read-only project frontier with exact blockers;
5. explicit approval-gated activation;
6. optional paused/abandoned disposition that releases activation without satisfying dependencies.

Do not introduce a project registry, Fabric mesh mirror, fifth canonical active-work file, cross-artifact task references, reverse edges, automatic scheduler, or general expression language.

## Sources

### Local

- `.pi/scripts/task-graph.ts`
- `.pi/tests/task-graph.test.ts`
- `AGENTS.md`
- `.pi/skills/development-lifecycle/SKILL.md`
- `.pi/prompts/verify.md`
- `.pi/artifacts/graph-based-development-workflow/spec.md`

### External

- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- https://docs.github.com/en/actions/reference/workflows-and-actions/expressions
- https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html
- https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html
- https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html
- https://doc.dvc.org/user-guide/project-structure/dvcyaml-files
- https://dvc.org/doc/command-reference/dag
- https://dvc.org/doc/command-reference/repro
- https://docs.dagster.io/