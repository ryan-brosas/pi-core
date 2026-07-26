# Contract–Seam–Feedback Lifecycle Kernel

- **Created:** 2026-07-25
- **Status:** Approved for implementation
- **Tracking:** Project artifact graph
- **Research:** `.pi/artifacts/contract-seam-feedback-lifecycle/research.md`
- **Resolved decisions:** Name the kernel only in the lifecycle skill; apply MVP guidance only to product/release-level work; escalate verification for the bounded risk set defined below.

## Problem Statement

### What problem are we solving?

Pi Core already requires observable PRD success criteria and records conditional boundary, seam, and gray-box decisions during planning. The rest of the lifecycle does not yet share one coherent contract for deciding what behavior matters, when a seam is justified, what evidence proves the behavior, or where verification feedback should return. As a result, phase prompts can collect facts without a decision impact, treat changed-file count as a proxy for consequence, or finish technical verification without distinguishing implementation completion from product learning.

The missing lifecycle contract affects guidance rather than runtime business logic, but that guidance is executable agent policy. Contradictory or duplicated wording can cause speculative abstractions, implementation-detail tests, unnecessary research loops, or false MVP claims.

### Why now?

The planning-specific boundary and testability work is complete, the lifecycle has recently converged on Fabric orchestration and Hindsight-only durable memory, and the standalone research for this feature reached high confidence. Extending the methodology now can preserve those settled contracts while making `init`, `research`, `create`, `ship`, and `verify` mutually consistent.

### Who is affected?

- **Primary users:** Developers using Pi Core lifecycle prompts to define, implement, and verify work.
- **Secondary users:** Maintainers reviewing lifecycle policy, task evidence, and product/release readiness claims.

## Goals

1. Define one concise Contract–Seam–Feedback lifecycle kernel without creating another framework, phase, or artifact.
2. Give each lifecycle phase a bounded obligation expressed in plain language.
3. Route evidence to the earliest lifecycle phase that must change instead of automatically restarting the workflow.
4. Make verification depth consequence-driven while retaining changed-file heuristics as an execution optimization.
5. Distinguish product/release experiment readiness from internal technical completion.

## Scope

### In Scope

- One normative **Contract–Seam–Feedback (CSF)** definition in `.pi/skills/development-lifecycle/SKILL.md`.
- Plain-language phase hooks in `.pi/prompts/init.md`, `.pi/prompts/research.md`, `.pi/prompts/create.md`, `.pi/prompts/ship.md`, and `.pi/prompts/verify.md`; the name and acronym do not appear in those prompts.
- Preservation of the existing planning contract in `.pi/prompts/plan.md` and `.pi/skills/planning-and-task-breakdown/SKILL.md` without reopening the completed planning artifact.
- A decision-oriented research record: question, evidence, confidence, alternatives, contract impact, and unresolved risks.
- Observable create-time journeys, inputs, outputs, errors, side effects, non-goals, and non-deferrable risk controls.
- Conditional learning-signal guidance for product/release-level specifications only.
- Thin vertical-slice shipping with an observable boundary test first where practical and no private-method mocking.
- Verification that starts from observable behavior and controlled failures, records evidence vantage, and deepens for a bounded consequence-based risk set.
- Feedback routing: unknown fact to `research`, changed desired behavior to `create`, architecture/design gap to `plan`, and known implementation defect to `ship`.
- A clarification in `.pi/workflows/development-lifecycle-workflow.md` that the workflow is an optional bounded helper, not the canonical lifecycle or an automatic cycle.
- Stable semantic contract tests in `.pi/tests/skill-system.test.ts`.

### Out of Scope

- A fifth canonical artifact, a CSF database, or new `tasks.json` fields or scheduler behavior.
- Automatic command invocation, `.active` mutation, phase cycling, release, deployment, or product decisions.
- Reopening or rewriting `.pi/artifacts/seam-blackbox-greybox-workflow/`.
- Changes to `.pi/prompts/plan.md`, `.pi/skills/planning-and-task-breakdown/SKILL.md`, `.pi/templates/prd.md`, or `.pi/scripts/task-graph.ts`.
- Universal interfaces, ports, adapters, dependency injection, or runtime swapping.
- Treating every interface as a seam or gray-box knowledge as permission to mock internals.
- Product telemetry implementation, customer research, or a claim that internal tests validate a product hypothesis.
- New dependencies, package metadata, branches, worktrees, commits, pushes, or deployment.
- Reintroducing file-based durable memory; Hindsight remains the sole durable memory authority.

## Proposed Solution

### Overview

Define the lifecycle kernel once in `.pi/skills/development-lifecycle/SKILL.md`:

> Define observable behavior before implementation. Add a seam only for named variance, a trust boundary, or a failure risk, with a reachable enabling point and a concrete alternative. Verify behavior from the outside first, add deeper evidence only for a named evidence gap or consequence, deliver the smallest safe vertical slice, and route what is learned to the earliest phase whose contract must change.

The compact enforcement rule is:

> No requirement without an observable contract. No seam without concrete variance. No gray-box check without an evidence gap. No MVP claim without a learning signal.

Only the lifecycle skill names the kernel. Phase prompts carry their applicable obligation in existing terminology and remain independently usable.

### Lifecycle Flow

1. `init` runs once per project or major pivot and identifies validated product/system intent, major external/trust/volatility boundaries, and available evidence channels when relevant.
2. `research` answers a decision question and records evidence, confidence, alternatives, contract impact, and unresolved risks; it remains an on-demand sideways capability.
3. `create` expresses essential journeys and observable success behavior, including errors, side effects, non-goals, and non-deferrable controls. Product/release specs also state a learning signal or real feedback path.
4. `plan` retains the existing conditional boundary, seam-justification, and gray-box-exception contract.
5. `ship` implements one thin end-to-end slice and begins with a failing observable boundary test where practical.
6. `verify` exercises essential behavior and controlled failures first, then selects deeper evidence according to consequence, trust, volatility, and failure cost.
7. The parent records the evidence vantage and routing decision in `progress.md`; it never invokes the next lifecycle command automatically.

## Requirements

### Functional Requirements

#### FR1 — Single Kernel Authority

The lifecycle skill must contain the only normative CSF definition. Phase prompts and the optional workflow must use plain-language obligations without repeating the name, acronym, or full doctrine.

**Scenarios:**

- **WHEN** a maintainer reads the lifecycle skill **THEN** one concise kernel and compact enforcement rule are present.
- **WHEN** a maintainer reads a phase prompt **THEN** only that phase's applicable obligation is present and no competing CSF definition appears.

#### FR2 — Intake and Decision Contracts

`init`, `research`, and `create` must produce decision-relevant lifecycle inputs rather than undirected context.

**Scenarios:**

- **WHEN** project initialization has product or release context **THEN** it identifies the hypothesis or intended outcome, material boundaries, and evidence channels without inventing speculative seams.
- **WHEN** research is completed **THEN** its output states the decision question, evidence, confidence, alternatives, contract impact, and unresolved risks.
- **WHEN** a specification is created **THEN** success behavior covers essential journeys, inputs, outputs, errors, side effects, non-goals, and non-deferrable risk controls.

#### FR3 — Existing Planning Contract Preservation

The existing conditional Boundaries and Testability contract remains authoritative for plan-time seams and gray-box exceptions. This feature must not duplicate or rewrite it.

**Scenarios:**

- **WHEN** a feature changes a module boundary **THEN** the existing plan guidance continues to require substitution need, enabling point, and a real alternative.
- **WHEN** this feature is implemented **THEN** the existing plan prompt, planning skill, and PRD template remain unchanged.

#### FR4 — Thin-Slice Delivery Contract

Shipping guidance must favor one minimal end-to-end slice, with a failing observable boundary behavior test first where practical. Test doubles may substitute only at justified seams; private methods and test-only production APIs are not valid evidence.

**Scenarios:**

- **WHEN** an executable task changes behavior **THEN** the worker is directed toward the smallest safe vertical slice and observable boundary evidence.
- **WHEN** a seam is unavailable or unjustified **THEN** the guidance does not require an interface merely for testing.

#### FR5 — Consequence-Based Verification

Changed-file count remains an incremental/full execution heuristic, but it is not the sole risk selector. Verification must deepen when the change implicates security, privacy, authorization or tenant isolation, data integrity, external providers, retries or idempotency, cost controls, or recovery.

**Scenarios:**

- **WHEN** a one-file change affects authorization **THEN** verification escalates despite the small diff.
- **WHEN** a broad low-consequence documentation change occurs **THEN** file count may select full execution without manufacturing gray-box checks.
- **WHEN** public behavior cannot prove a high-risk invariant **THEN** a deeper check names the evidence gap and stable inspection seam.

#### FR6 — Feedback Routing Without Automatic Cycling

After verification or review, the parent must classify feedback and recommend the earliest phase whose contract must change: unknown fact to `research`, changed desired behavior to `create`, architecture/design gap to `plan`, and known implementation defect to `ship`.

**Scenarios:**

- **WHEN** verification finds a known implementation defect **THEN** the next recommended phase is `ship`, not a mandatory restart at research.
- **WHEN** evidence changes desired behavior **THEN** the specification is reopened through `create`.
- **WHEN** a route is selected **THEN** no command, active-pointer change, or lifecycle-state mutation occurs without the normal user and approval gates.

#### FR7 — Conditional MVP and Learning Contract

MVP guidance applies only to product/release-level specifications. Readiness requires essential journeys, explicit deferred scope, non-deferrable controls, observable failure behavior, current technical evidence, and a measurable learning signal or real feedback path. Internal tests can establish experiment readiness but cannot claim validated learning.

**Scenarios:**

- **WHEN** an internal tooling feature is specified **THEN** it is not forced to invent a product learning signal.
- **WHEN** a product/release spec claims MVP readiness **THEN** it names the learning signal or feedback path.
- **WHEN** all technical gates pass **THEN** the lifecycle may claim experiment readiness but not customer validation.

#### FR8 — Artifact, Graph, and Memory Preservation

The four canonical active-work artifacts, `tasks.json` authority, standalone research routing, and Hindsight-only durable memory semantics must remain unchanged.

**Scenarios:**

- **WHEN** lifecycle guidance records CSF outputs **THEN** it maps them to `spec.md`, `plan.md`, `tasks.json`, and `progress.md` rather than creating a fifth artifact.
- **WHEN** durable cross-feature learning is needed **THEN** it remains in Hindsight, not a recreated `MEMORY.md`.

### Non-Functional Requirements

- **Performance:** No runtime path or dependency is added; verification remains bounded by existing commands and concurrency limits.
- **Security:** Existing approval gates remain authoritative. The risk-trigger list must not weaken security, privacy, authorization, tenant-isolation, integrity, provider, cost, or recovery checks.
- **Accessibility:** Not applicable; no user interface is changed.
- **Compatibility:** Existing version-2 task graphs, version-1 readability, phase invocation names, Fabric routing, and Hindsight behavior remain compatible.
- **Maintainability:** Tests assert stable semantic obligations rather than exact paragraphs or sentence order.
- **Terminology:** Use `gray-box` consistently with current repository guidance; treat black-box and gray-box as evidence perspectives, not module categories.

## Success Criteria

- [ ] The lifecycle skill contains one normative Contract–Seam–Feedback definition and compact rule; phase prompts and the optional workflow do not repeat the name or acronym.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="contract-seam-feedback kernel" .pi/tests/skill-system.test.ts`
- [ ] `init`, `research`, and `create` expose the intended outcome, decision record, observable contract, risk controls, and conditional product/release learning signal.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="lifecycle intake phases" .pi/tests/skill-system.test.ts`
- [ ] Existing planning boundary, seam, gray-box, and observable-success contracts remain green and their source surfaces are unchanged.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="planning boundaries and testability contract is conditional|PRD success criteria describe externally observable behavior" .pi/tests/skill-system.test.ts`
  - Verify: `git diff --quiet HEAD -- .pi/prompts/plan.md .pi/skills/planning-and-task-breakdown/SKILL.md .pi/templates/prd.md`
- [ ] Shipping guidance requires the smallest safe vertical slice and observable boundary evidence first where practical, without requiring speculative interfaces or private-method mocks.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="delivery phases" .pi/tests/skill-system.test.ts`
- [ ] Verification retains changed-file heuristics but independently escalates for the approved bounded risk set and requires named evidence gaps for deeper checks.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="delivery phases" .pi/tests/skill-system.test.ts`
- [ ] Feedback is classified into `research`, `create`, `plan`, or `ship` without automatic command execution, active-pointer changes, or phase cycling.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="contract-seam-feedback kernel|lifecycle workflow is optional|delivery phases" .pi/tests/skill-system.test.ts`
- [ ] MVP guidance is conditional to product/release work and explicitly separates experiment readiness from validated learning.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="lifecycle intake phases|delivery phases" .pi/tests/skill-system.test.ts`
- [ ] The canonical four-artifact model, task-graph authority, and Hindsight-only memory policy remain intact.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="graph producers use one canonical task graph|parent lifecycle memory policy uses Hindsight" .pi/tests/skill-system.test.ts`
- [ ] The complete retained suite passes and every artifact graph validates.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`
  - Verify: `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`

## Technical Context

### Existing Patterns

- `.pi/skills/development-lifecycle/SKILL.md` defines the four canonical artifacts, phase relationships, Hindsight authority, and parent-owned Fabric routing; it is the natural single authority for the kernel.
- `.pi/prompts/plan.md` and `.pi/skills/planning-and-task-breakdown/SKILL.md` already implement conditional boundary records, the three-part seam gate, and justified gray-box exceptions.
- `.pi/templates/prd.md` already scopes externally observable behavior to Success Criteria while retaining design-bearing technical sections.
- `.pi/prompts/verify.md` already distinguishes incremental and full execution by changed-file count; the new policy adds consequence-based escalation without replacing that mechanism.
- `.pi/tests/skill-system.test.ts` uses `node:test` and semantic assertions over published prompt, skill, template, and workflow surfaces.
- `.pi/scripts/task-graph.ts` already models dependencies, conflicts, files, attempts, evidence, and conflict-free frontiers; no schema change is justified.

### Key Files

- `.pi/artifacts/contract-seam-feedback-lifecycle/research.md` — high-confidence research and source record.
- `.pi/artifacts/seam-blackbox-greybox-workflow/spec.md` — completed planning-only scope that this feature preserves.
- `.pi/skills/development-lifecycle/SKILL.md` — single normative lifecycle authority.
- `.pi/prompts/{init,research,create,ship,verify}.md` — phase-specific behavior contracts.
- `.pi/workflows/development-lifecycle-workflow.md` — optional orchestration helper requiring non-canonical, non-cyclic positioning.
- `.pi/tests/skill-system.test.ts` — retained policy-contract test surface.

### Affected Files

```yaml
files:
  - .pi/skills/development-lifecycle/SKILL.md # Define the kernel, phase obligations, artifact mapping, and feedback routes
  - .pi/prompts/init.md # Add intended-outcome, boundary, and evidence-channel discovery
  - .pi/prompts/research.md # Require decision impact, alternatives, and unresolved risks
  - .pi/prompts/create.md # Require observable journeys, risk controls, and conditional learning signals
  - .pi/prompts/ship.md # Require thin vertical slices and observable boundary evidence
  - .pi/prompts/verify.md # Add consequence-based depth, evidence vantage, MVP readiness, and routing
  - .pi/workflows/development-lifecycle-workflow.md # Mark the workflow optional and non-cyclic
  - .pi/tests/skill-system.test.ts # Add stable semantic lifecycle contract tests
```

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Doctrine is copied into every prompt and drifts | Medium | High | Define and name the kernel once; phase prompts carry only local obligations; tests reject duplicate naming. |
| Risk escalation becomes an unbounded checklist | Medium | Medium | Use the user-approved bounded set and require a named consequence or evidence gap. |
| MVP wording burdens internal tooling or claims validation from tests | Medium | High | Make the gate conditional to product/release work and distinguish readiness from observed learning. |
| New guidance conflicts with completed planning work | Low | High | Leave plan, planning skill, and PRD template untouched; retain their existing tests. |
| Static policy tests become brittle | Medium | Medium | Assert headings, route categories, and semantic markers rather than exact paragraphs. |
| Optional workflow is mistaken for canonical automatic cycling | Medium | Medium | Label it a bounded helper and add a direct non-cycling contract test. |
| Concurrent runtime state contaminates artifact work | Medium | Medium | Own only declared paths; leave `.pi/fabric/mesh/**`, `.pi/hindsight/**`, caches, and unrelated configuration untouched. |

## Open Questions

None block implementation.

### Resolved Decisions

| Decision | Resolution | Source |
| --- | --- | --- |
| Where is CSF named? | Only in `.pi/skills/development-lifecycle/SKILL.md`; prompts use plain language. | User selection, 2026-07-25 |
| Where does MVP guidance apply? | Product/release-level specs only; internal work is conditional. | User selection, 2026-07-25 |
| Which consequences escalate verification? | Security, privacy, authorization/tenant isolation, data integrity, external providers, retries/idempotency, cost controls, and recovery. | User selection, 2026-07-25 |
| Does the graph schema change? | No; use existing artifacts and version-2 task fields. | Local task-graph inspection |
| Is the completed planning graph reopened? | No; this lifecycle-wide artifact owns the new work. | Research and scope review |

## Tasks

### Task 1 — Lock Lifecycle Kernel Contracts [test]

Four focused policy tests encode the single kernel authority, intake obligations, delivery/verification obligations, and optional non-cyclic workflow, and fail against the current unmodified surfaces for the intended missing behavior.

**Metadata:**

```yaml
id: task-1
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/tests/skill-system.test.ts
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="contract-seam-feedback kernel|lifecycle intake phases|delivery phases|lifecycle workflow is optional" .pi/tests/skill-system.test.ts` — expected RED only for the newly added contracts.
- `node --experimental-strip-types --test --test-name-pattern="planning boundaries and testability contract is conditional|parent lifecycle memory policy uses Hindsight" .pi/tests/skill-system.test.ts` — existing baseline remains GREEN.
- `git diff --check -- .pi/tests/skill-system.test.ts`

### Task 2 — Establish the Lifecycle Kernel and Optional Workflow [docs]

The lifecycle skill becomes the single named authority for contract, justified seams, evidence depth, artifact mapping, and feedback routes, while the generic workflow is explicitly optional and non-cyclic.

**Metadata:**

```yaml
id: task-2
depends_on:
  - task-1
parallel: true
conflicts_with: []
files:
  - .pi/skills/development-lifecycle/SKILL.md
  - .pi/workflows/development-lifecycle-workflow.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="contract-seam-feedback kernel|lifecycle workflow is optional" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/skills/development-lifecycle/SKILL.md .pi/workflows/development-lifecycle-workflow.md`

### Task 3 — Align Intake and Decision Phases [prompt]

Initialization, research, and specification creation each emit their bounded decision input, observable contract, risk controls, and conditional product/release learning signal without duplicating the named kernel.

**Metadata:**

```yaml
id: task-3
depends_on:
  - task-1
parallel: true
conflicts_with: []
files:
  - .pi/prompts/init.md
  - .pi/prompts/research.md
  - .pi/prompts/create.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="lifecycle intake phases" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/prompts/init.md .pi/prompts/research.md .pi/prompts/create.md`

### Task 4 — Align Delivery, Verification, and Feedback [prompt]

Shipping and verification favor observable thin slices, deepen evidence for the approved consequence set, distinguish product learning from technical readiness, and route findings without automatic phase transitions.

**Metadata:**

```yaml
id: task-4
depends_on:
  - task-1
parallel: true
conflicts_with: []
files:
  - .pi/prompts/ship.md
  - .pi/prompts/verify.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="delivery phases" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/prompts/ship.md .pi/prompts/verify.md`

### Task 5 — Verify Integrated Lifecycle Behavior [verify]

All lifecycle contracts, retained tests, graph validation, artifact authority, Hindsight policy, and untouched planning surfaces pass together with no out-of-scope changes.

**Metadata:**

```yaml
id: task-5
depends_on:
  - task-2
  - task-3
  - task-4
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- `before=$(sha256sum .pi/artifacts/.active); node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null; test "$before" = "$(sha256sum .pi/artifacts/.active)"`
- `git diff --quiet HEAD -- .pi/prompts/plan.md .pi/skills/planning-and-task-breakdown/SKILL.md .pi/templates/prd.md .pi/scripts/task-graph.ts`
- `git diff --check -- .pi/skills/development-lifecycle/SKILL.md .pi/prompts/init.md .pi/prompts/research.md .pi/prompts/create.md .pi/prompts/ship.md .pi/prompts/verify.md .pi/workflows/development-lifecycle-workflow.md .pi/tests/skill-system.test.ts`

## Dependency Legend

| Field | Purpose |
| --- | --- |
| `depends_on` | A task must pass before this task becomes ready. |
| `parallel` | A task may share a ready frontier when files and policy allow; this graph executes one worker at a time. |
| `conflicts_with` | Explicit semantic conflicts in addition to automatic file-overlap detection. |
| `files` | Exact implementation paths owned by the task; lifecycle evidence remains parent-owned. |

## Notes

- The current feature is internal lifecycle policy, so it does not itself require a product learning signal. Its outcome is verified through published-surface contract tests.
- No `plan.md` is required before execution because research resolved the architecture and this specification contains bounded, dependency-ordered slices; `tasks.json` remains authoritative.
- Commit, branch, worktree, push, and deployment actions remain separate approval checkpoints during `/ship`.