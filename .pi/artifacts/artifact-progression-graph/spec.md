# Artifact Progression Graph

- **Created:** 2026-07-25
- **Status:** Prepared for future activation
- **Research:** `.pi/artifacts/artifact-progression-graph/research.md`
- **Upstream artifact:** `research-enforcement-extension`

## Problem Statement

Pi has authoritative task DAGs inside each artifact, but project-wide reporting treats artifacts as unrelated. When the current artifact finishes, neither the graph nor the lifecycle prompts can deterministically explain which prepared artifact is eligible next, which upstream artifacts block it, or whether switching `.active` is safe.

The project needs a minimal whole-artifact dependency layer that preserves one explicitly active artifact, permits future artifacts to be prepared without interrupting current work, and derives progression from verified completion rather than a duplicated root status.

## Goals

1. Represent artifact-to-artifact prerequisites with one forward-only root `depends_on` field in each existing `tasks.json`.
2. Validate missing references, self-dependencies, slug mismatches, and project-wide cycles deterministically.
3. Derive artifact completion, dependency readiness, activation eligibility, and exact blockers.
4. Keep project-wide validation and frontier reporting byte-for-byte read-only.
5. Preserve one active artifact and require explicit user approval before changing `.active`.
6. Allow `/create` and `/plan` to prepare a named future artifact without interrupting an incomplete active artifact.

## Scope

### In Scope

- Optional root `depends_on: string[]` on version-2 task graphs.
- Artifact directory name as the canonical slug, with embedded `slug` required to match.
- Project-wide graph validation and deterministic cycle reporting.
- Derived completion for non-empty version-2 graphs whose tasks all pass with current-attempt evidence and include current verification evidence.
- Read-only project frontier fields for active state, dependency readiness, activation eligibility, blocking artifacts, and migration requirements.
- Lifecycle guidance for preparing inactive artifacts and explicitly activating an eligible artifact only after the current artifact is complete.
- Focused task-graph and lifecycle-policy tests.
- Version-1 graphs remain locally readable and valid but cannot satisfy artifact dependencies until migrated to version 2.

### Out of Scope

- Cross-artifact task edges or task scheduling across artifacts.
- Reverse `blocks` fields, artifact conflicts, a project registry, or a fifth canonical state file.
- Automatic selection, activation, dispatch, or mutation by `frontier --all`.
- Paused, abandoned, waived, or force-continue dependency semantics in the first version.
- Treating empty task lists as complete.
- Making existing root `status` authoritative.
- Fabric mesh or subagent state as a progression source.
- Branches, worktrees, commits, pushes, dependency installation, or deployment.

## Proposed Solution

Extend `.pi/scripts/task-graph.ts` with a project-level decoder and validator over artifact directories. Local task validation remains backward compatible. Project validation reads each `tasks.json`, checks canonical slugs and forward dependencies, detects artifact cycles, and derives state without writing any file.

An artifact is complete only when its graph is version 2, contains at least one task, every task is `passed` with current-attempt evidence, and current evidence includes a verification record. A version-1 or empty graph remains visible with an exact non-completion reason.

`frontier --all` reports each artifact's local state plus:

- `active`: whether its slug equals `.active`;
- `complete`: derived completion only;
- `dependency_ready`: every declared upstream artifact is complete;
- `activatable`: dependency-ready and either already active or the current active artifact is complete;
- `blocking_artifacts`: unresolved upstream slugs;
- `requires_explicit_activation`: true for every non-active artifact.

Lifecycle prompts support a preparation path: create and plan a named inactive artifact without changing `.active`. After the active artifact completes, a user may explicitly select an eligible prepared artifact; no reporting command changes the pointer.

## Functional Requirements

### FR1 — Artifact Schema

- Version-2 graphs may declare a unique root `depends_on` string array.
- Missing `depends_on` is equivalent to an empty array for compatibility.
- Directory slug and embedded graph slug must match for project-level validity.
- Root `status` is ignored for completion and readiness.

### FR2 — Project Validation

- Project validation rejects missing, duplicate, and self artifact references.
- Project validation reports a stable path for every issue and a deterministic project-wide dependency cycle.
- Invalid or unreadable local graphs remain visible with typed issues.
- Validation never changes `.active`, task graphs, or lifecycle artifacts.

### FR3 — Completion and Readiness

- A non-empty version-2 graph is complete only when every task is passed with valid current-attempt evidence and current verification evidence exists.
- Version-1 and empty graphs are never dependency-complete.
- Dependency readiness is derived recursively from upstream completion.
- Activation eligibility also requires the current active artifact to be complete.
- Exact blocker slugs and migration reasons are returned.

### FR4 — Single-Active Lifecycle

- Project frontier remains read-only and requires explicit selection.
- `/create` may prepare an inactive artifact when unrelated active work is incomplete, but must not change `.active` in that mode.
- `/plan` may target an explicitly named prepared artifact without activating it.
- `/ship` may switch to a different artifact only after graph validation, activation eligibility, and immediate explicit user approval.
- `/research` may use project-frontier gaps as context but never selects or activates work.

### FR5 — Compatibility

- Existing version-1 local validation and frontier behavior remain readable.
- Existing single-file `validate`, `frontier`, and `descendants` CLI contracts remain stable.
- Existing task statuses and evidence rules are unchanged.

## Non-Functional Requirements

- Project results are deterministic and sorted by slug.
- Reporting is byte-for-byte read-only for `.active` and every discovered `tasks.json`.
- No network access or dependency additions are required.
- Error output remains machine-readable JSON with stable issue codes and paths.
- Project scans remain bounded to immediate artifact directories.

## Technical Context

- `.pi/scripts/task-graph.ts` already validates local DAGs and implements `scanArtifactFrontiers`, but currently computes every artifact independently.
- `.pi/tests/task-graph.test.ts` already proves sorted, byte-for-byte read-only `frontier --all` behavior.
- `.pi/prompts/create.md`, `.pi/prompts/plan.md`, and `.pi/prompts/ship.md` currently assume all feature operations resolve only through `.active`.
- `.pi/prompts/research.md` already treats project research as read-only and preserves unrelated active work.
- `.pi/skills/development-lifecycle/SKILL.md` defines the four canonical active-work files and the explicit active-slug contract.
- `.pi/tests/skill-system.test.ts` provides policy-level lifecycle assertions.

## Affected Files

### Implementation and Tests

- `.pi/scripts/task-graph.ts`
- `.pi/tests/task-graph.test.ts`
- `.pi/tests/skill-system.test.ts`

### Lifecycle Contracts

- `.pi/prompts/create.md`
- `.pi/prompts/plan.md`
- `.pi/prompts/ship.md`
- `.pi/prompts/research.md`
- `.pi/skills/development-lifecycle/SKILL.md`

### Feature Artifacts

- `.pi/artifacts/artifact-progression-graph/spec.md`
- `.pi/artifacts/artifact-progression-graph/plan.md`
- `.pi/artifacts/artifact-progression-graph/tasks.json`
- `.pi/artifacts/artifact-progression-graph/progress.md`

## Tasks

### task-1 — [test] Lock Project Progression Contracts

Focused failing tests define artifact schema, project validation, completion, readiness, activation, compatibility, and read-only lifecycle behavior.

- `depends_on`: none
- `parallel`: false
- `conflicts_with`: none
- `files`: `.pi/tests/task-graph.test.ts`, `.pi/tests/skill-system.test.ts`
- Verify: `node --experimental-strip-types --test --test-name-pattern="artifact progression|project artifact graph|prepared artifact" .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`
- Verify: `git diff --check -- .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`

### task-2 — [graph] Implement Artifact Dependency Semantics

The task-graph module validates whole-artifact dependencies and emits deterministic completion and activation readiness without mutating project files.

- `depends_on`: `task-1`
- `parallel`: false
- `conflicts_with`: none
- `files`: `.pi/scripts/task-graph.ts`, `.pi/tests/task-graph.test.ts`
- Verify: `node --experimental-strip-types --test --test-name-pattern="artifact progression|project artifact graph" .pi/tests/task-graph.test.ts`
- Verify: `node --experimental-strip-types --check .pi/scripts/task-graph.ts`
- Verify: `git diff --check -- .pi/scripts/task-graph.ts .pi/tests/task-graph.test.ts`

### task-3 — [lifecycle] Wire Prepared-Artifact Progression

Create, plan, ship, research, and lifecycle guidance consistently support prepared inactive artifacts while preserving explicit activation and single-active execution.

- `depends_on`: `task-2`
- `parallel`: false
- `conflicts_with`: none
- `files`: `.pi/prompts/create.md`, `.pi/prompts/plan.md`, `.pi/prompts/ship.md`, `.pi/prompts/research.md`, `.pi/skills/development-lifecycle/SKILL.md`, `.pi/tests/skill-system.test.ts`
- Verify: `node --experimental-strip-types --test --test-name-pattern="artifact progression|prepared artifact" .pi/tests/skill-system.test.ts`
- Verify: `git diff --check -- .pi/prompts/create.md .pi/prompts/plan.md .pi/prompts/ship.md .pi/prompts/research.md .pi/skills/development-lifecycle/SKILL.md .pi/tests/skill-system.test.ts`

### task-4 — [verification] Verify Integrated Project Progression

The complete feature passes focused and retained checks while proving project reporting is read-only and the current active artifact remains unchanged.

- `depends_on`: `task-3`
- `parallel`: false
- `conflicts_with`: none
- `files`: none
- Verify: `node --experimental-strip-types --test .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`
- Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`
- Verify: `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- Verify: `before=$(sha256sum .pi/artifacts/.active); node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null; test "$before" = "$(sha256sum .pi/artifacts/.active)"`
- Verify: `git diff --check -- .pi/scripts/task-graph.ts .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts .pi/prompts/create.md .pi/prompts/plan.md .pi/prompts/ship.md .pi/prompts/research.md .pi/skills/development-lifecycle/SKILL.md .pi/artifacts/artifact-progression-graph`

## Success Criteria

1. Project validation reports missing artifact references, self-dependencies, slug mismatches, and deterministic cycles. Verify: focused task-graph tests pass.
2. Version-2 completion and dependency readiness are derived from task and current evidence state; version-1 and empty graphs cannot satisfy dependencies. Verify: focused completion fixtures pass.
3. Project frontier reports exact blockers and activation eligibility while remaining byte-for-byte read-only. Verify: read-only fixture and checksum commands pass.
4. One incomplete active artifact prevents activation of another even when its dependencies are complete. Verify: activation-lock fixtures pass.
5. A future artifact can be created and planned without changing `.active`; later activation requires eligibility and explicit approval. Verify: focused lifecycle-policy tests pass.
6. Existing local graph APIs and version-1 readability do not regress. Verify: retained task-graph tests pass.
7. Integrated verification introduces no new failures beyond explicitly recorded unrelated baselines, if those still exist. Verify: full retained suite and all graph validations run with recorded evidence.

## Risks and Mitigations

- **False completion from stale root status:** derive completion exclusively from versioned tasks and evidence.
- **False verification from structural references:** require current verification evidence and retain `/verify` as the semantic evidence gate.
- **Cycle or missing-edge deadlock:** validate the complete artifact set before reporting activation eligibility.
- **Version-1 ambiguity:** preserve readability but require migration before dependency satisfaction.
- **Workflow accidentally changes active work:** test inactive preparation and byte-for-byte pointer preservation.
- **Automatic progression removes user control:** report candidates only; all activation stays explicit and approval-gated.
- **Scope expands into orchestration:** exclude cross-artifact tasks, schedulers, waivers, and Fabric state.

## Resolved Decisions

- The first version uses whole-artifact forward dependencies only.
- The current `research-enforcement-extension` remains active while this artifact is prepared.
- This artifact declares `research-enforcement-extension` as its upstream dependency.
- Version-1 graphs remain readable but cannot complete project dependencies.
- Empty graphs are not complete.
- Paused, abandoned, and waiver semantics are deferred.
- No dedicated mutating activation command is added; lifecycle prompts retain explicit approval and pointer ownership.
- Root `status` remains non-authoritative.

## Open Questions

None blocking implementation.
