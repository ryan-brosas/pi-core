# Agent and Subagent Utilization Contracts

**Bead:** Not tracked
**Created:** 2026-07-25
**Status:** Approved

## Bead Metadata

```yaml
depends_on: []
parallel: false
conflicts_with:
  - detailed-plan-agent-prompt-research
  - subagent-utilization-glm-5-2-fabric-ship
blocks: []
estimated_hours: 4
```

---

## Problem Statement

### What problem are we solving?

Pi Core has the principal pieces of role-specific subagent routing, but the general routing contract and executable slash-command prompts do not yet express the complete design in one verifiable form. `/plan` conditionally uses the detailed `Plan` specialist and keeps canonical writing with the parent, while `/ship` describes selecting `general` or `build` but lacks a concrete primary implementation-worker `Agent` call. The generic agent policy also describes `general` without clearly defining `build` or explaining when lifecycle prompts intentionally require worker delegation.

Without explicit cross-workflow contracts, future prompt edits can accidentally hand canonical planning files to `general`, bypass `build`, duplicate the detailed Plan persona, or leave routing as prose that never results in a child invocation.

### Why now?

Deep research established the intended architecture and the user selected its recommended defaults: conditional Plan advice, parent-owned canonical plan writing, and continued work in the current workspace. Converting those decisions into a narrow specification prevents the standalone research from becoming unactionable documentation.

### Who is affected?

- **Primary users:** Pi Core operators invoking `/plan` and `/ship`.
- **Secondary users:** Maintainers changing agent definitions, slash-command prompts, and orchestration contract tests.

---

## Scope

### In-Scope

- Define the generic roles of `Plan`, `general`, and `build` consistently with lifecycle-specific routing.
- Keep `Plan` conditional for material ambiguity, architectural trade-offs, or cross-subsystem sequencing.
- Keep canonical `plan.md`, `tasks.json`, and lifecycle state parent-owned; explicitly prohibit handing Plan output to `general` for canonical rendering.
- Add a concrete foreground Pi `Agent` call for the single selected `/ship` implementation task after the parent resolves `workerType` to `general` or `build`.
- Preserve self-contained worker envelopes, parent verification, approval gates, dynamic-frontier ownership, and Pi-subagents-only orchestration.
- Add deterministic TDD contracts for positive routing and negative ownership boundaries.
- Preserve the detailed Plan persona in `.pi/agents/Plan.md` as the sole source of specialist voice.

### Out-of-Scope

- Creating a `plan-writer` agent or allowing any child to write canonical planning artifacts.
- Invoking `Plan` for every `/plan` run.
- Rewriting `.pi/agents/Plan.md`, `.pi/agents/general.md`, or `.pi/agents/build.md`.
- Changing worker models, thinking levels, tools, or extension configuration.
- Replacing `@tintinweb/pi-subagents`, adding another orchestration extension, or using Fabric agents/actors/mesh.
- Changing task-graph scheduling, lifecycle-state semantics, or approval policy.
- Restoring or modifying intentionally deleted extensions or unrelated dirty workspace files.
- Adding dependencies, creating a branch/worktree, committing, or pushing without separate approval.

---

## Proposed Solution

### Overview

Codify one parent-owned orchestration model across the generic Agent guidance and lifecycle prompts. The parent plans inline by default, requests one foreground `Plan` advisory only when complexity warrants it, and remains the sole canonical plan writer. During `/ship`, the parent validates and selects the live frontier, resolves a bounded task to `general` or `build`, and invokes that worker through one concrete foreground `Agent` call carrying the complete ship-worker envelope. Contract tests will require these executable call shapes and reject unsafe Plan-to-general writing handoffs.

### Operator Flow

1. The operator invokes `/plan`; the parent plans directly unless one of the documented complexity triggers warrants a foreground `Plan` advisory.
2. The parent verifies any advisory and writes or validates `tasks.json` and `plan.md` itself; `general` is not used as a plan renderer.
3. The operator invokes `/ship`; the parent validates the graph, selects the live task, resolves `workerType` to `general` or `build`, and invokes exactly one foreground implementation worker.
4. The child returns bounded implementation evidence; the parent inspects changes, reruns verification/review, and alone records lifecycle transitions.

---

## Requirements

### Functional Requirements

#### Conditional specialist planning

`/plan` keeps its detailed `Plan` specialist available without turning delegation into ceremony.

**Scenarios:**

- **WHEN** requirements are mechanical and existing evidence is sufficient **THEN** the parent plans inline and records a rationale only when complex work intentionally skips Plan.
- **WHEN** material ambiguity, an architectural trade-off, or cross-subsystem sequencing remains **THEN** the parent invokes one foreground `Plan` advisory with a resolved, self-contained envelope.
- **WHEN** Plan returns advice **THEN** the parent verifies it and writes canonical artifacts without delegating canonical rendering to `general`.

#### Explicit implementation-worker dispatch

`/ship` turns its role-selection prose into an executable, inspectable call contract.

**Scenarios:**

- **WHEN** a selected task is surgical, normally one to three declared files, and architecture is resolved **THEN** the parent resolves `workerType` to `general`.
- **WHEN** a selected task is larger but bounded and architecture is resolved **THEN** the parent resolves `workerType` to `build`.
- **WHEN** one ready task is selected **THEN** the parent issues one foreground Pi `Agent` call using the resolved worker and complete ship-worker envelope.
- **WHEN** architecture, security, migration, scope, or approval remains unresolved **THEN** the parent stops instead of hiding the decision in worker selection.

#### Coherent global routing policy

The generic Agent policy names both implementation roles and explains how its direct-first default relates to lifecycle workflows.

**Scenarios:**

- **WHEN** a general code task does not benefit from isolation or specialization **THEN** direct parent work remains the default.
- **WHEN** `/ship` is executing a validated parent-selected task **THEN** its stricter worker-routing contract may require `general` or `build` without contradicting the generic default.
- **WHEN** a maintainer reads the global policy **THEN** `general`, `build`, and `Plan` have distinct, non-overlapping responsibilities.

#### Regression contracts

Tests prove executable behavior and reject unsafe role drift.

**Scenarios:**

- **WHEN** `/ship` loses its concrete resolved-worker call **THEN** focused tests fail.
- **WHEN** `/plan` delegates canonical writing to `general` or duplicates the Plan persona **THEN** focused tests fail.
- **WHEN** global routing omits `build` or blurs parent ownership **THEN** focused tests fail.

### Non-Functional Requirements

- **Performance:** Add no runtime dependency or persistent orchestration service; prompt overhead remains bounded to the existing worker envelopes.
- **Security:** Child envelopes remain privacy-minimized; children receive no secrets, credentials, unrelated conversation, or lifecycle write authority.
- **Accessibility:** Not applicable; no user-interface surface changes.
- **Compatibility:** Preserve version-2 `tasks.json`, current Pi Agent call semantics, current worker names, and current `@tintinweb/pi-subagents` integration.
- **Maintainability:** Keep the detailed Plan voice solely in `.pi/agents/Plan.md`; other files reference the role and contract rather than copy the persona.

---

## Success Criteria

- [ ] Global Agent guidance distinctly defines conditional `Plan`, surgical `general`, substantial bounded `build`, direct-first defaults, and lifecycle-specific routing.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="agent utilization policy" .pi/tests/skill-system.test.ts`
- [ ] `/plan` explicitly keeps canonical planning with the parent and rejects a Plan-to-`general` writer handoff without changing the existing detailed Plan agent.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="Plan delegation|plan writer boundary" .pi/tests/skill-system.test.ts`
- [ ] `/ship` contains one concrete foreground primary-worker `Agent` call whose resolved type is restricted to `general|build` and whose prompt is the complete ship-worker envelope.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="ship primary worker call|ship routes GLM Fabric workers" .pi/tests/skill-system.test.ts`
- [ ] Focused orchestration contracts demonstrate RED before prompt/policy changes and GREEN afterward.
  - Verify: inspect attempt-scoped RED and GREEN command evidence in `.pi/artifacts/agent-subagent-utilization-research/progress.md`
- [ ] The retained Pi Core suite, graph validation, and owned-path whitespace checks pass without touching unrelated workspace changes.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`
  - Verify: `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/agent-subagent-utilization-research/tasks.json`
  - Verify: `git diff --check -- .pi/agent-tool-description.md .pi/prompts/plan.md .pi/prompts/ship.md .pi/tests/skill-system.test.ts`

---

## Technical Context

### Existing Patterns

- `.pi/prompts/plan.md` — already performs conditional foreground Plan advisory and parent-owned canonical synthesis.
- `.pi/agents/Plan.md` — authoritative detailed Plan persona and chat-only advisory boundary; intentionally unchanged by this feature.
- `.pi/prompts/ship.md` — already defines `general` versus `build` selection and ship-worker envelopes, but lacks a concrete primary-worker call example.
- `.pi/skills/subagent-driven-development/SKILL.md` — already constrains `worker_type` to `build|general` and preserves parent ownership.
- `.pi/tests/skill-system.test.ts` — existing contract-test seam for agent frontmatter, routing language, invocation shapes, and negative safety guarantees.
- `.pi/agent-tool-description.md` — global Agent policy currently defines Plan and general routing but does not explicitly define the build role or lifecycle-specific override.
- `.pi/artifacts/agent-subagent-utilization-research/research.md` — verified design evidence and decisions used by this specification.

### Key Files

- `.pi/agent-tool-description.md` — global routing policy to align.
- `.pi/prompts/plan.md` — canonical-writer boundary to make explicit.
- `.pi/prompts/ship.md` — executable primary worker invocation to add.
- `.pi/tests/skill-system.test.ts` — TDD contracts and integrated regression coverage.

### Affected Files

```yaml
files:
  - .pi/agent-tool-description.md # Define general, build, Plan, and lifecycle-specific routing coherently.
  - .pi/prompts/plan.md # Explicitly reject using general as canonical plan writer.
  - .pi/prompts/ship.md # Add the concrete resolved general/build worker call.
  - .pi/tests/skill-system.test.ts # Lock executable routing and negative ownership contracts.
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Generic direct-first policy conflicts with `/ship` worker requirements | Medium | High | State that lifecycle prompts may impose a stricter validated-task contract while retaining parent ownership. |
| A dynamic worker call permits arbitrary agent types | Medium | High | Tests require parent resolution to the closed set `general|build` before invocation. |
| Canonical plan writing leaks to `general` | Low | High | Add explicit negative prompt language and a regression assertion. |
| Detailed Plan voice becomes duplicated and drifts | Low | Medium | Keep `.pi/agents/Plan.md` unchanged and assert other surfaces reference rather than reproduce the persona. |
| Existing completed artifacts are reimplemented | Medium | Medium | Limit changes to the verified residual gaps: global policy coherence, explicit no-writer handoff, and concrete `/ship` dispatch. |
| Concurrent dirty files are overwritten | Medium | High | Re-read owned paths before edits; stop on overlap; never restore or stage unrelated paths. |

---

## Open Questions

| Question | Owner | Due Date | Status |
| --- | --- | --- | --- |
| Research depth | User | 2026-07-25 | Resolved: reuse completed deep research |
| Plan invocation frequency | User | 2026-07-25 | Resolved: conditional |
| Canonical plan writer | User | 2026-07-25 | Resolved: parent |
| Workspace isolation | User | 2026-07-25 | Resolved: continue current workspace and preserve unrelated changes |

---

## Tasks

### Lock role-specific orchestration contracts [test]

Focused tests fail against the current residual gaps and define the global policy, no-plan-writer boundary, and executable `/ship` worker-call contract.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/tests/skill-system.test.ts
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="agent utilization policy|plan writer boundary|ship primary worker call" .pi/tests/skill-system.test.ts` exits nonzero only for the newly specified missing behavior before implementation.
- `git diff --check -- .pi/tests/skill-system.test.ts`

### Align the global Agent routing policy [policy]

The generic Agent guidance distinguishes Plan, general, and build while explaining direct-first defaults and stricter lifecycle-specific worker routing.

**Metadata:**

```yaml
depends_on:
  - Lock role-specific orchestration contracts
parallel: true
conflicts_with: []
files:
  - .pi/agent-tool-description.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="agent utilization policy" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/agent-tool-description.md`

### Make planning ownership and shipping dispatch executable [prompt]

`/plan` explicitly rejects a general-writer handoff and `/ship` invokes one parent-resolved foreground `general|build` worker with the complete envelope.

**Metadata:**

```yaml
depends_on:
  - Lock role-specific orchestration contracts
parallel: true
conflicts_with: []
files:
  - .pi/prompts/plan.md
  - .pi/prompts/ship.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="Plan delegation|plan writer boundary|ship primary worker call|ship routes GLM Fabric workers" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/prompts/plan.md .pi/prompts/ship.md`

### Verify integrated orchestration behavior [verification]

The complete role-specific routing contract passes focused and retained tests, validates the canonical graph, and leaves unrelated workspace state untouched.

**Metadata:**

```yaml
depends_on:
  - Align the global Agent routing policy
  - Make planning ownership and shipping dispatch executable
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/agent-subagent-utilization-research/tasks.json`
- `git diff --check -- .pi/agent-tool-description.md .pi/prompts/plan.md .pi/prompts/ship.md .pi/tests/skill-system.test.ts`
- Confirm `.pi/agents/Plan.md`, `.pi/agents/general.md`, `.pi/agents/build.md`, deleted extensions, runtime-managed files, and unrelated artifact paths were not modified by this feature.

---

## Dependency Legend

| Field | Purpose | Example |
| --- | --- | --- |
| `depends_on` | Tasks that must pass first | `['Lock role-specific orchestration contracts']` |
| `parallel` | Whether a dependency-satisfied task may run alongside disjoint work | `true` |
| `conflicts_with` | Tasks that cannot overlap because they own the same files | `[]` |
| `files` | Exact implementation paths owned by the task | `['.pi/prompts/ship.md']` |

---

## Notes

- Deep research is retained at `.pi/artifacts/agent-subagent-utilization-research/research.md`.
- This artifact addresses only residual contract gaps and does not reopen the completed detailed-Plan or GLM ship-worker artifacts.
- `/plan` is optional but recommended because the feature spans global routing, two lifecycle prompts, and shared contract tests.
- No branch, worktree, dependency installation, commit, push, or unrelated cleanup is authorized by this specification.