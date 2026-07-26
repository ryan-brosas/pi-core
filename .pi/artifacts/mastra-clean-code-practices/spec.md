# Mastra Clean-Code Pattern Adoption

**Artifact:** `mastra-clean-code-practices`  
**Created:** 2026-07-26  
**Status:** Draft

## Artifact Metadata

```yaml
depends_on: []
parallel: false
conflicts_with: []
blocks: []
estimated_hours: 3
```

---

## Problem Statement

### What problem are we solving?

The pinned Mastra `chat-with-pdf` template is notably readable: it has an obvious composition root, capability-oriented modules, schema-defined workflow handoffs, linear orchestration, centralized vector configuration, and source metadata that remains visible through retrieval. Copying the template indiscriminately would also import demo shortcuts such as unpinned dependencies, missing tests, broad catches, unsafe URL fetching, nondeterminism, and destructive re-ingestion.

Pi Core needs a detailed, source-qualified `mastra-development` skill that teaches the reusable clean-code invariants while making the source limitations and rejected shortcuts equally visible. The current working-tree skill and static contract establish the intended target, but Complex adoption still requires canonical provenance, license, focused-test qualification, and attempt evidence before the work may be called complete.

### Why now?

The user explicitly requested that the clean implementation practices in the Mastra source become a detailed reusable skill rather than a portfolio-specific recipe or an unqualified corpus snapshot. Formalizing the adoption now prevents clean-looking demo code from becoming policy without evidence.

### Who is affected?

- **Primary users:** Pi agents and developers designing or reviewing Mastra agents, tools, workflows, RAG, storage, and registration code.
- **Secondary users:** Maintainers reviewing skill provenance, source limitations, test contracts, and future corpus promotion.

---

## Scope

### In-Scope

- Qualify the standalone template at `https://github.com/mastra-ai/template-chat-with-pdf` and commit `4b954b41350dcd8139d135abb677ab9ddfae4f6c` against canonical upstream provenance.
- Identify and record the applicable canonical license and focused or canonical tests, including observed failures as well as passes.
- Preserve a consumer-neutral, detailed `mastra-development` skill.
- Extract reusable invariants for composition roots, module ownership, agents, tools, workflows, shared infrastructure, RAG metadata, errors, and tests.
- Quarantine source anomalies explicitly rather than presenting them as best practices.
- Keep the skill discoverable through exact manifest-directory parity.
- Verify through a failing-then-passing static public contract, full repository tests, Doctor, and task-graph gates.

### Out-of-Scope

- Copying the template source tree or its architecture into Pi Core.
- Adding Mastra packages, model providers, storage dependencies, or generated scaffolding.
- Building a website, portfolio, PDF assistant, or other Mastra application.
- Creating a Mastra corpus entry before a target application proves a reusable source/test pair.
- Editing the external template checkout or the canonical Mastra monorepo.
- Changing MCP configuration, indexing policy, existing unrelated corpus entries, or runtime-managed state.
- Committing, pushing, deploying, or changing branches.

---

## Proposed Solution

### Overview

Qualify the pinned source through MCP plus direct source verification, record canonical provenance/license/test evidence, then retain one on-demand `mastra-development` skill whose structure distinguishes reusable clean-code strengths from template anomalies. A focused test is the observable policy boundary: it must reject consumer coupling, missing source qualification, missing clean-code sections, and any attempt to omit known anomalies. The full repository suite and Doctor establish integration without adding runtime dependencies or corpus content.

### Agent Flow

1. The agent loads `mastra-development` for a Mastra design or review task.
2. The skill identifies its pinned standalone source and qualification limits.
3. The agent selects a reusable invariant rather than copying the template.
4. The skill requires exact target versions, official version-matched APIs, and current source verification.
5. The agent applies the smallest target-native source/test pair and rejects listed demo shortcuts.
6. If canonical provenance, license, or behavior evidence cannot be established, adoption remains blocked rather than silently promoted.

---

## Requirements

### Source Qualification

The skill and lifecycle evidence must distinguish the inspected standalone template from the full Mastra monorepo and record exact provenance.

**Scenarios:**

- **WHEN** the skill is loaded **THEN** it names the exact repository URL, 40-character commit, commit date, package license declaration, inspected source surface, and qualification limitations.
- **WHEN** MCP resolves a source symbol **THEN** the parent verifies its path and relevant bytes against current source before relying on the graph result.
- **WHEN** canonical license or focused-test evidence is unavailable or incompatible **THEN** task 1 remains blocked and no qualified-completion or corpus claim is made.

### Clean-Code Extraction

The skill must explain the source's reusable implementation shape in target-independent terms.

**Scenarios:**

- **WHEN** a reader needs the architecture **THEN** the skill exposes the composition root, focused module shape, explicit dependencies, schema-first steps/workflow, linear `.then(...)` pipeline, shared vector infrastructure, and RAG metadata contract.
- **WHEN** a seam or abstraction is considered **THEN** the skill requires named variance, a second implementation, or a real alternative rather than test-only indirection.
- **WHEN** the target has an existing convention **THEN** the skill instructs adaptation to target ownership instead of forcing the template tree.

### Anomaly Quarantine

Known template shortcuts must remain visible and non-promotable.

**Scenarios:**

- **WHEN** the source is assessed as clean **THEN** the skill still identifies `latest`, no lockfile, no retained tests, no license file, swallowed errors, `any`, arbitrary URL/SSRF risk, random retrieval, hard-coded models, similarity search as a registry, delete-before-upsert, weak IDs, schema contradictions, and local-storage assumptions.
- **WHEN** an anomaly is intentionally accepted in a target **THEN** its boundary, consequence, and verification must be explicit.

### Discoverability and Regression Protection

The skill must be on-demand and registered exactly once.

**Scenarios:**

- **WHEN** skill-system tests run **THEN** manifest-directory parity passes and the Mastra contract is enforced.
- **WHEN** consumer-specific wording such as `portfolio` reappears **THEN** the focused contract fails.
- **WHEN** the skill directory or manifest entry disappears independently **THEN** parity tests fail.

### Narrow Promotion

The detailed skill is the only target artifact from this adoption.

**Scenarios:**

- **WHEN** the Complex workflow completes **THEN** no Mastra corpus entry, dependency, copied template source, or runtime feature has been introduced.
- **WHEN** a future target application proves a reusable source/test pair **THEN** corpus promotion is considered separately with pinned provenance and current validation.

### Non-Functional Requirements

- **Performance:** The skill adds no runtime code or dependency; it loads only when selected by Pi's skill mechanism.
- **Security:** Unsafe source patterns are identified explicitly, and no credentials, remote execution, arbitrary fetch, or dependency installation is introduced.
- **Accessibility:** Not applicable to this internal Markdown skill; no user interface is changed.
- **Compatibility:** Guidance requires official docs or source for the exact installed target version and does not claim the uninstalled template builds.
- **Maintainability:** One skill owns Mastra clean-code guidance; lifecycle and source-driven authorities are referenced rather than duplicated as new systems.
- **Portability:** The skill contains pinned public provenance but no hard-coded local checkout path.

---

## Success Criteria

- [ ] Canonical source provenance, applicable license, focused/canonical tests, and observed results are recorded with exact refs; missing evidence blocks completion.
  - Verify: `test -s .pi/artifacts/mastra-clean-code-practices/progress.md && rg -ni "canonical|license|test|4b954b41350dcd8139d135abb677ab9ddfae4f6c" .pi/artifacts/mastra-clean-code-practices/progress.md`
- [ ] The focused skill contract proves the detailed skill is source-pinned, consumer-neutral, structurally explicit, and anomaly-aware.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="Mastra skill extracts clean source practices" .pi/tests/skill-system.test.ts`
- [ ] No portfolio coupling or copied Mastra application source appears in the skill.
  - Verify: `! rg -qi "\\bportfolio\\b" .pi/skills/mastra-development/SKILL.md`
- [ ] The skill is registered exactly once and skill directories have exact manifest parity.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="manifest has exact bidirectional parity" .pi/tests/skill-system.test.ts`
- [ ] All retained Pi Core tests pass with the skill present.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`
- [ ] Doctor and every graph-backed artifact remain valid, with no ambient selection pointer.
  - Verify: `node --experimental-strip-types .pi/scripts/doctor.ts && for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f" >/dev/null || exit; done && test ! -e .pi/artifacts/.active`
- [ ] No Mastra corpus entry has been created as part of this adoption.
  - Verify: `test ! -e .pi/corpus/mastra-clean-code-practices && test ! -e .pi/corpus/mastra-development`

---

## Technical Context

### Existing Patterns

- `.pi/skills/development-lifecycle/SKILL.md` - Defines Complex pattern adoption, explicit slugs, evidence roles, and narrow promotion.
- `.pi/skills/complex-pattern-adoption/SKILL.md` - Requires exact source, license, focused tests, MCP health probing, outside-in evidence, and no automatic copying.
- `.pi/skills/source-driven-development/SKILL.md` - Defines source hierarchy and exact-version verification.
- `.pi/skills/verification-before-completion/SKILL.md` - Defines completion evidence and current gate requirements.
- `.pi/tests/skill-system.test.ts` - Existing static public boundary for skill registration and semantic contracts.
- `.pi/skills/manifest.json` - Canonical tier registration with exact directory parity.
- `/home/ryanj/work/inspo/mastra/mastra-template-chat-with-pdf/src/mastra/index.ts` - Local evidence for the thin composition root.
- `/home/ryanj/work/inspo/mastra/mastra-template-chat-with-pdf/src/mastra/workflows/index-pdf.ts` - Local evidence for typed linear workflow steps and RAG metadata.

### Key Files

- `.pi/skills/mastra-development/SKILL.md` - Detailed target skill.
- `.pi/tests/skill-system.test.ts` - RED/GREEN semantic contract.
- `.pi/skills/manifest.json` - On-demand skill registration.
- `.pi/artifacts/mastra-clean-code-practices/spec.md` - Observable adoption contract.
- `.pi/artifacts/mastra-clean-code-practices/tasks.json` - Authoritative task graph.
- `.pi/artifacts/mastra-clean-code-practices/plan.md` - Required Complex source/adaptation plan, created only by explicit `/plan`.
- `.pi/artifacts/mastra-clean-code-practices/progress.md` - Attempt-scoped provenance, RED/GREEN, review, and verification evidence, created during `/ship`.

### Affected Files

```yaml
files:
  - .pi/skills/mastra-development/SKILL.md
  - .pi/skills/manifest.json
  - .pi/tests/skill-system.test.ts
  - .pi/artifacts/mastra-clean-code-practices/spec.md
  - .pi/artifacts/mastra-clean-code-practices/tasks.json
  - .pi/artifacts/mastra-clean-code-practices/plan.md
  - .pi/artifacts/mastra-clean-code-practices/progress.md
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Standalone checkout lacks canonical license and behavior tests | High | High | Resolve canonical monorepo ref/license/tests before task 1 can pass; block promotion if unresolved |
| Retrospective lifecycle could falsely imply TDD order | Medium | High | Record the observed RED command/failure and later GREEN evidence truthfully; do not rewrite history |
| Clean appearance is mistaken for production correctness | High | High | Keep source strengths and anomalies in separate mandatory sections and tests |
| Current Mastra APIs differ from template-era imports | Medium | Medium | Require exact target versions and official version-matched source before application |
| Detailed skill duplicates lifecycle policy | Medium | Medium | Keep content Mastra-specific and reference existing lifecycle/source/verification authorities |
| Dirty concurrent worktree causes accidental edits | High | High | Restrict `/ship` to the three owned implementation paths plus explicit lifecycle files; treat all others read-only |
| Skill becomes corpus without target proof | Low | High | Assert no Mastra corpus path and require a separately proven target source/test pair |

---

## Open Questions

| Question | Owner | Due Date | Status |
|---|---|---|---|
| Which canonical Mastra monorepo commit corresponds to the standalone template commit? | Parent during `/plan` research | Before task 1 | Open - blocks qualification |
| Which canonical license file applies to this template at that exact ref? | Parent during `/plan` research | Before task 1 | Open - blocks qualification |
| Which canonical or focused tests exercise the extracted registration/tool/workflow patterns, and what are their observed results? | Parent during `/plan` research | Before task 1 | Open - blocks qualification |

---

## Tasks

### Qualify the pinned source and lock the RED contract [research-test]

Canonical provenance, license, focused-test evidence, and the failing-then-passing consumer-neutral static contract are recorded without modifying external source.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/tests/skill-system.test.ts
  - .pi/artifacts/mastra-clean-code-practices/progress.md
```

**Acceptance Criteria:**

- The exact standalone commit, corresponding canonical source ref, applicable license, and focused/canonical test paths are recorded with observed pass/failure results.
- An MCP health probe resolves a known Mastra source symbol and the parent verifies the result against current source bytes.
- The static test rejects portfolio coupling, missing clean-code sections, missing source limits, and omission of known anomalies.
- Existing RED evidence is recorded truthfully; missing canonical license or tests blocks the task rather than being guessed.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="Mastra skill extracts clean source practices" .pi/tests/skill-system.test.ts`
- `test -s .pi/artifacts/mastra-clean-code-practices/progress.md && rg -ni "canonical|license|test|MCP|4b954b41350dcd8139d135abb677ab9ddfae4f6c" .pi/artifacts/mastra-clean-code-practices/progress.md`
- `git diff --check -- .pi/tests/skill-system.test.ts .pi/artifacts/mastra-clean-code-practices/progress.md`

### Publish the qualified Mastra clean-code skill [skills]

The registered on-demand skill teaches reusable Mastra structure in consumer-neutral terms while explicitly rejecting the template's unqualified shortcuts.

**Metadata:**

```yaml
depends_on:
  - Qualify the pinned source and lock the RED contract
parallel: false
conflicts_with: []
files:
  - .pi/skills/mastra-development/SKILL.md
  - .pi/skills/manifest.json
  - .pi/tests/skill-system.test.ts
```

**Acceptance Criteria:**

- The skill is pinned to the standalone source and explicitly distinguishes it from the full Mastra monorepo.
- Composition root, module shape, agents, tools, workflows, shared infrastructure, RAG data contracts, errors, testing, source strengths, anomalies, and adoption checks are detailed.
- The skill contains no portfolio coupling, copied application source, hard-coded local path, or claim that the uninstalled template passed.
- The manifest contains `mastra-development` exactly once and retains exact bidirectional parity.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="Mastra skill extracts clean source practices|manifest has exact bidirectional parity" .pi/tests/skill-system.test.ts`
- `! rg -qi "\\bportfolio\\b|/home/ryanj/work/inspo" .pi/skills/mastra-development/SKILL.md`
- `git diff --check -- .pi/skills/mastra-development/SKILL.md .pi/skills/manifest.json .pi/tests/skill-system.test.ts`

### Verify integration and preserve narrow promotion [verification]

All repository gates pass with only the detailed skill, its contract, registration, and explicit lifecycle evidence in scope; no corpus or runtime capability is promoted.

**Metadata:**

```yaml
depends_on:
  - Publish the qualified Mastra clean-code skill
parallel: false
conflicts_with: []
files:
  - .pi/artifacts/mastra-clean-code-practices/tasks.json
  - .pi/artifacts/mastra-clean-code-practices/progress.md
```

**Acceptance Criteria:**

- All retained tests pass, Doctor reports no failing contract checks, and every artifact graph validates.
- The retired `.pi/artifacts/.active` pointer remains absent.
- No Mastra dependency, copied source tree, or corpus entry is introduced.
- Parent review reconciles the complete tracked and untracked worktree while modifying only owned paths.

**Verification:**

- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `node --experimental-strip-types .pi/scripts/doctor.ts`
- `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f" >/dev/null || exit; done`
- `test ! -e .pi/artifacts/.active && test ! -e .pi/corpus/mastra-clean-code-practices && test ! -e .pi/corpus/mastra-development`

---

## Dependency Legend

| Field | Purpose | Applied here |
|---|---|---|
| `depends_on` | Must complete before a task starts | Qualification -> skill -> integrated verification |
| `parallel` | Whether a task may run concurrently | `false`; source/test and verification surfaces are shared |
| `conflicts_with` | Explicit same-wave exclusions | Empty because strict dependencies already serialize work |
| `files` | Owned files for task execution | Exact skill, test, manifest, and lifecycle evidence paths |

---

## Notes

- This is a Full PRD because `complex-pattern-adoption` mandates Complex delivery even though the implementation surface is small.
- `/create` reused current-session source, MCP, RED/GREEN, and full-suite evidence and dispatched no new agents.
- The existing implementation remains unclosed and tasks begin pending; `/ship` must record evidence without pretending the lifecycle preceded the already observed edits.
- No `plan.md`, `progress.md`, implementation file, dependency, corpus entry, Git action, or external-source mutation is created during this `/create` phase.
