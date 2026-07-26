# Engineering Discipline Enforcement Audit

- **Created:** 2026-07-26
- **Status:** Approved for implementation
- **Tracking:** Project artifact graph
- **Research:** `.pi/artifacts/engineering-discipline-enforcement-audit/research.md`
- **Implementation boundary:** First mechanical enforcement increment from the audit: executable version-2 task contracts

## Problem Statement

### What problem are we solving?

Pi Core's version-2 task graph mechanically enforces scheduling, state, attempts, and current-evidence coherence, but it currently ignores the two fields that make a task executable: `acceptance_criteria` and `verification`. A version-2 node can therefore pass graph validation without an observable end state or a command that can prove it, even though `/ship` expects both when constructing a worker envelope.

The standalone engineering-discipline audit classified this mismatch as part of a broader specification-enforcement gap. This feature converts that highest-value, compatibility-safe finding into a hard validation rule. It does not claim to enforce the entire engineering methodology.

### Why now?

The Contract–Seam–Feedback lifecycle work is closed, all retained version-2 graphs already carry non-empty acceptance criteria and verification commands, and the audit recommends making specification outcomes machine-checkable before adding broader governance. Enforcing the existing de facto contract now prevents future graph producers from silently creating under-specified work while preserving current artifacts.

### Who is affected?

- **Primary users:** Developers and coding agents using `/create`, `/plan`, and `/ship` with version-2 task graphs.
- **Secondary users:** Maintainers reviewing artifact compatibility, task-graph diagnostics, and evidence-bearing completion.

## Goals

1. Require every version-2 task to contain non-empty observable `acceptance_criteria` and non-empty `verification` commands.
2. Return deterministic, machine-readable issue codes and JSON paths for missing, malformed, empty, or whitespace-only task-contract entries.
3. Align the PRD template and `/create` and `/plan` producers with the enforced graph contract.
4. Preserve version-1 readability, scheduling behavior, current-attempt evidence semantics, and every retained artifact graph.
5. Keep the enforcement claim honest: structural validation proves contract presence, not semantic correctness or command success.

## Scope

### In Scope

- Additive version-2 task validation for `acceptance_criteria` and `verification` in `.pi/scripts/task-graph.ts`.
- Focused positive and negative tests in `.pi/tests/task-graph.test.ts`.
- Producer-contract tests in `.pi/tests/skill-system.test.ts`.
- Task-format guidance in `.pi/templates/prd.md`, `.pi/prompts/create.md`, and `.pi/prompts/plan.md`.
- Validation against all retained version-1 and version-2 artifact graphs.
- Stable CLI behavior: valid graphs exit 0, contract-invalid graphs exit 1 with structured issues, and usage/read/parse failures retain exit 2.

### Out of Scope

- Embedded lifecycle decision records, contract digests, protected Markdown regions, or a new cross-artifact validator.
- Runtime command-admission, filesystem-mutation, provider-dispatch, or delegated-worker gates.
- Executing verification commands, interpreting shell strings, or proving that a criterion is semantically adequate.
- Typed verification recipes, command sandboxing, signatures, HMACs, or adversarial tamper resistance.
- ADR/C4 inventories, AI evaluation corpora, prompt/model provenance, production SRE controls, or deployment policy.
- New dependencies, package metadata, a fifth lifecycle artifact, task-graph version 3, or changes to `.pi` runtime state.

## Proposed Solution

### Overview

Extend the existing dependency-free task-graph decoder so version-2 nodes preserve `acceptance_criteria` and `verification` arrays. The version-2 validator rejects an absent or non-array field, an empty array, and any non-string or whitespace-only member using deterministic issue codes and paths. Version-1 nodes remain readable without either field.

Update each canonical graph producer to state the same contract: every task has a stable ID, one-sentence end state, exact scheduling/file metadata, at least one observable acceptance criterion, and at least one repository-supported verification command. `/ship` already validates the graph before dispatch and already places acceptance criteria and verification commands into worker envelopes, so no `/ship` behavior change is required.

### Observable Validation Flow

1. A caller passes a graph to `validateTaskGraph()` or `task-graph validate`.
2. Common graph shape, identity, edge, state, and conflict fields are decoded as today.
3. For version 2 only, each task's execution contract is validated.
4. A complete task returns no new issues.
5. An incomplete task returns stable issues at `/tasks/<index>/acceptance_criteria`, `/tasks/<index>/verification`, or the exact invalid member path.
6. Validation reads input and emits results without mutating the graph, artifact files, or `.active`.

## Requirements

### Functional Requirements

#### FR1 — Version-2 Acceptance Contract

Every version-2 task must contain an `acceptance_criteria` array with at least one non-whitespace string describing an observable end state.

**Scenarios:**

- **WHEN** a version-2 task contains one or more non-empty acceptance criteria **THEN** this field contributes no validation issue.
- **WHEN** the field is absent, not an array, empty, contains a non-string member, or contains a whitespace-only member **THEN** validation fails with a deterministic acceptance-contract issue and exact JSON path.
- **WHEN** the same field is absent from a version-1 task **THEN** version-1 compatibility is unchanged.

#### FR2 — Version-2 Verification Contract

Every version-2 task must contain a `verification` array with at least one non-whitespace command string.

**Scenarios:**

- **WHEN** a version-2 task contains one or more non-empty verification commands **THEN** this field contributes no validation issue.
- **WHEN** the field is absent, not an array, empty, contains a non-string member, or contains a whitespace-only member **THEN** validation fails with a deterministic verification-contract issue and exact JSON path.
- **WHEN** a verification string is structurally valid **THEN** validation does not execute or claim the command succeeds.

#### FR3 — Deterministic Diagnostics

Repeated validation of identical input must return byte-stable issue ordering, codes, paths, and messages.

**Scenarios:**

- **WHEN** one task violates both contracts **THEN** all applicable issues are reported in field and member order without hiding existing graph issues.
- **WHEN** the CLI validates a contract-invalid graph **THEN** it emits the normal JSON validation envelope and exits 1.
- **WHEN** the CLI receives malformed JSON, an unreadable path, or invalid usage **THEN** existing typed exit-2 behavior remains unchanged.

#### FR4 — Producer Alignment

The PRD template and `/create` and `/plan` guidance must produce the fields the validator requires.

**Scenarios:**

- **WHEN** `/create` defines or converts tasks **THEN** every version-2 node preserves non-empty acceptance criteria and verification commands.
- **WHEN** `/plan` refines an existing graph **THEN** it preserves task IDs and both execution-contract arrays.
- **WHEN** a maintainer reads the PRD task format **THEN** observable criteria and verification commands are explicit requirements rather than inferred conventions.

#### FR5 — Retained-Graph Compatibility

All existing artifact graphs must remain valid without migration or hand edits.

**Scenarios:**

- **WHEN** every retained `.pi/artifacts/*/tasks.json` is validated after the change **THEN** every graph passes.
- **WHEN** version-1 fixtures are validated **THEN** they remain accepted without the new fields.
- **WHEN** frontier and descendant operations run on valid graphs **THEN** their selection and ordering behavior is unchanged.

#### FR6 — Honest Enforcement Boundary

Documentation and tests must distinguish structural contract enforcement from semantic assurance.

**Scenarios:**

- **WHEN** a task has syntactically valid arrays **THEN** the validator may report structural success but does not claim that the criterion is sufficient or that a command is safe or passing.
- **WHEN** `/ship` executes a task **THEN** fresh execution and review evidence remain required before the node can pass.

### Non-Functional Requirements

- **Performance:** Validation remains linear in task, edge, evidence-reference, acceptance-criterion, and verification-command counts; it performs no network or subprocess work.
- **Security:** Free-form verification strings are treated as inert data by this validator and are never executed during validation.
- **Accessibility:** Not applicable; no user interface changes.
- **Compatibility:** Version-1 graph readability, version-2 status/evidence rules, CLI exit codes, deterministic frontier behavior, and the three-agent cap remain unchanged.
- **Maintainability:** Use the existing pure functional core and deterministic `GraphIssue` contract; do not introduce a schema library or duplicate task-graph authority.

## Success Criteria

- [ ] Valid version-2 tasks with non-empty `acceptance_criteria` and `verification` arrays pass, while missing, malformed, empty, non-string, and whitespace-only variants fail at exact paths.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="version 2 task execution contracts" .pi/tests/task-graph.test.ts`
- [ ] Repeated validation and CLI execution return deterministic issue ordering and preserve exit codes 0, 1, and 2.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="version 2 task execution contracts|CLI uses stable JSON and exit codes" .pi/tests/task-graph.test.ts`
- [ ] Version-1 readability and existing scheduling, evidence, frontier, and descendant behavior remain unchanged.
  - Verify: `node --experimental-strip-types --test .pi/tests/task-graph.test.ts`
- [ ] The PRD template and `/create` and `/plan` explicitly require and preserve both executable task-contract arrays.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="graph producers emit executable task contracts|graph producers use one canonical task graph" .pi/tests/skill-system.test.ts`
- [ ] Every retained artifact graph validates without migration.
  - Verify: `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- [ ] The complete retained suite passes with no dependency, runtime-state, or out-of-scope file changes.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`
  - Verify: `git diff --check -- .pi/scripts/task-graph.ts .pi/tests/task-graph.test.ts .pi/templates/prd.md .pi/prompts/create.md .pi/prompts/plan.md .pi/tests/skill-system.test.ts`

## Technical Context

### Existing Patterns

- `.pi/scripts/task-graph.ts` owns graph decoding, deterministic `GraphIssue` values, version-2 state/evidence validation, frontier computation, and CLI exit behavior.
- `.pi/tests/task-graph.test.ts` uses pure API fixtures plus CLI subprocess fixtures for positive, negative, determinism, compatibility, and exit-code coverage.
- `.pi/templates/prd.md` defines the canonical human-readable task format.
- `.pi/prompts/create.md` converts PRD tasks into new version-2 graphs and validates them.
- `.pi/prompts/plan.md` refines the authoritative graph while preserving stable task IDs.
- `.pi/prompts/ship.md` already validates the graph and consumes acceptance criteria and verification commands in a complete worker envelope; it is an inspected dependency, not an affected file.
- Nine retained version-2 graphs were inspected on 2026-07-26; all already contain non-empty `acceptance_criteria` and `verification` arrays. Three retained version-1 graphs remain compatibility fixtures.

### Affected Files

```yaml
files:
  - .pi/scripts/task-graph.ts # Preserve and enforce version-2 execution-contract arrays
  - .pi/tests/task-graph.test.ts # Positive, negative, deterministic, and compatibility behavior
  - .pi/templates/prd.md # Canonical task-format requirements
  - .pi/prompts/create.md # New-graph producer and pre-save validation guidance
  - .pi/prompts/plan.md # Graph-refinement preservation guidance
  - .pi/tests/skill-system.test.ts # Producer-contract regression tests
```

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| A retained version-2 graph lacks a required field | Low | High | Preflight inspected all nine retained version-2 graphs; final verification validates every artifact graph. |
| Structural success is mistaken for semantic quality | Medium | High | State the limitation in the PRD, producer guidance, issue tests, and final report; `/ship` still requires fresh evidence. |
| Blank strings bypass non-empty checks | Medium | Medium | Test whitespace-only members and trim for validation without rewriting stored input. |
| Producer wording drifts from validator behavior | Medium | Medium | One semantic producer-contract test covers the template, `/create`, and `/plan`. |
| Version-1 compatibility is accidentally tightened | Low | High | Scope new checks inside version-2 validation and retain explicit version-1 fixtures. |
| Task graph absorbs broader methodology semantics | Low | Medium | Limit fields to the execution contract already consumed by `/ship`; defer cross-artifact decisions and runtime gates. |

## Open Questions

None block implementation.

### Resolved Decisions

| Decision | Resolution | Evidence |
| --- | --- | --- |
| What is the first audit-derived enforcement increment? | Require executable version-2 task contracts; defer the broader strict-enforcement architecture. | Existing audit recommendation plus three deep local research runs. |
| Are the fields mandatory for version 2? | Yes; every retained version-2 graph already conforms and `/ship` consumes both. | Retained-graph preflight and `.pi/prompts/ship.md`. |
| Do version-1 graphs migrate? | No; version-1 remains readable as documented compatibility. | `AGENTS.md` and current graph tests. |
| Does validation execute commands? | No; verification strings remain inert structural data. | Security boundary and authoritative schema guidance. |
| Is `/plan` required before `/ship`? | No; the task graph below has exact files, dependencies, observable criteria, verification commands, and no unresolved architecture decision. | User-selected `/create` → `/ship` workflow. |

## Research Basis and Sources

- **[S1] Local audit:** `.pi/artifacts/engineering-discipline-enforcement-audit/research.md` identifies specification completeness as the highest-value next enforcement increment and distinguishes graph validation from frontier enforcement.
- **[S2] Local executable evidence:** `.pi/scripts/task-graph.ts`, `.pi/tests/task-graph.test.ts`, `.pi/prompts/{create,plan,ship}.md`, and the retained artifact graphs inspected on 2026-07-26.
- **[S3] Context7 authoritative source:** JSON Schema official specification, retrieved through Context7 on 2026-07-26. The `required` keyword checks property existence only, conditional schemas require explicit discriminators, and closed-object keywords reject undeclared properties; these support fail-closed structural validation while also demonstrating why separate non-empty and semantic checks are necessary. https://github.com/json-schema-org/json-schema-spec/blob/main/specs/jsonschema-validation.md · https://github.com/json-schema-org/json-schema-spec/blob/main/specs/proposals/propertyDependencies-adr.md · https://github.com/json-schema-org/json-schema-spec/blob/main/specs/jsonschema-core.md
- **[S4] Deep local review:** Fabric runs `27c7253cf1ad45cf9267d3bef77d56bd`, `82d51246723e40a0b636842dd332b809`, and `3ac4189924644276909d52cfea68ad76`; parent inspection resolved their scope disagreement in favor of the smallest compatibility-safe mechanical increment.

## Tasks

### Task 1 — Lock Version-2 Execution Contracts [test]

Focused tests define the required task fields, deterministic rejection behavior, producer obligations, and unchanged compatibility before implementation changes.

**Metadata:**

```yaml
id: task-1
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/tests/task-graph.test.ts
  - .pi/tests/skill-system.test.ts
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="version 2 task execution contracts|graph producers emit executable task contracts" .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts` — expected RED only for the newly specified behavior.
- `node --experimental-strip-types --test --test-name-pattern="validates version 1 and version 2 graphs|graph producers use one canonical task graph" .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts` — retained baseline remains GREEN.
- `git diff --check -- .pi/tests/task-graph.test.ts .pi/tests/skill-system.test.ts`

### Task 2 — Enforce Version-2 Task Contracts [core]

The task-graph validator rejects incomplete acceptance and verification arrays with deterministic issues while preserving version-1 and scheduling behavior.

**Metadata:**

```yaml
id: task-2
depends_on:
  - task-1
parallel: true
conflicts_with: []
files:
  - .pi/scripts/task-graph.ts
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="version 2 task execution contracts|validates version 1 and version 2 graphs|validation rejects malformed scheduling and evidence field types" .pi/tests/task-graph.test.ts`
- `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- `git diff --check -- .pi/scripts/task-graph.ts .pi/tests/task-graph.test.ts`

### Task 3 — Align Canonical Graph Producers [workflow]

The PRD template and `/create` and `/plan` guidance consistently emit and preserve the version-2 execution contract enforced by the validator.

**Metadata:**

```yaml
id: task-3
depends_on:
  - task-1
parallel: true
conflicts_with: []
files:
  - .pi/templates/prd.md
  - .pi/prompts/create.md
  - .pi/prompts/plan.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="graph producers emit executable task contracts|graph producers use one canonical task graph|PRD success criteria describe externally observable behavior" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/templates/prd.md .pi/prompts/create.md .pi/prompts/plan.md .pi/tests/skill-system.test.ts`

### Task 4 — Verify Integrated Enforcement [verify]

The validator, producer contracts, retained graphs, and full test suite pass together without broadening the enforcement claim or modifying out-of-scope state.

**Metadata:**

```yaml
id: task-4
depends_on:
  - task-2
  - task-3
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- `before=$(sha256sum .pi/artifacts/.active); node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null; test "$before" = "$(sha256sum .pi/artifacts/.active)"`
- `git diff --check -- .pi/scripts/task-graph.ts .pi/tests/task-graph.test.ts .pi/templates/prd.md .pi/prompts/create.md .pi/prompts/plan.md .pi/tests/skill-system.test.ts`

## Dependency Legend

| Field | Purpose |
| --- | --- |
| `depends_on` | A task must pass before this task becomes ready. |
| `parallel` | Tasks 2 and 3 are structurally independent, but this graph caps execution at one worker in the shared main checkout. |
| `conflicts_with` | Explicit semantic conflicts beyond automatic exact-file overlap. |
| `files` | Exact implementation paths owned by the task; lifecycle evidence remains parent-owned. |

## Notes

- This internal tooling feature needs technical readiness evidence, not a product learning signal.
- No `plan.md` is required: the full PRD and authoritative graph resolve the implementation boundary, exact files, task order, compatibility contract, and verification commands.
- Commit, push, deployment, dependency installation, and creation of implementation files remain separate approval checkpoints during `/ship`.