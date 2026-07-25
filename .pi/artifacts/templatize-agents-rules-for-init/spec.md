# Templatize mandatory AGENTS.md rules for `/init`

**Artifact:** `templatize-agents-rules-for-init`

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

The current `/init` prompt detects a project's stack and writes a compact `AGENTS.md`, but it does not have a reusable, auditable source for the safety and workflow rules that every generated project should retain. As a result, generated instructions can omit critical deletion, destructive-action, concurrent-work, Git-approval, and evidence gates, while project-specific examples such as the supplied ACFS contract are too large and too coupled to one repository to copy safely.

The generator also offers an `Auto-commit` preference that conflicts with Pi Core's explicit Git-approval policy, describes deep initialization as an open-ended `~100+ tool calls`, and does not tell users that a newly generated `AGENTS.md` requires `/reload` or a new session before Pi loads it as context.

### Why now?

The user explicitly wants the strongest ACFS rules templatized into `/init`, adjusted to the Pi Core workflow. The completed research in `research.md` resolved the architecture: use a compact inert policy scaffold, explicitly read it from `/init`, synthesize project facts from evidence, and keep optional tools conditional.

### Who is affected?

- **Primary users:** developers invoking `/init` in new or existing projects.
- **Secondary users:** coding agents operating under the generated `AGENTS.md`, and reviewers maintaining Pi Core's workflow contracts.

## Goal

Make `/init` reliably generate or merge a concise, project-specific `AGENTS.md` that always contains Pi Core's mandatory safety/evidence kernel, includes only verified project facts and conditional workflows, preserves user-authored content, and explains when the new context becomes active.

## Scope

### In scope

- A compact canonical policy scaffold at `.pi/templates/agents-policy.md`.
- Explicit scaffold loading and evidence-backed synthesis in `.pi/prompts/init.md`.
- Classification of generated content as mandatory, project-detected, conditional, conflicting, or preserved custom content.
- Preview and merge behavior for an existing `AGENTS.md`; no blind replacement.
- Removal of standing `Auto-commit` authorization from the user-profile flow.
- Bounded deep initialization with an evidence-sufficiency stopping rule and at most three concurrent agents per wave.
- `/reload` or next-session activation guidance after `AGENTS.md` changes.
- Deterministic policy tests in `.pi/tests/skill-system.test.ts`.

### Out of scope

- Copying the full ACFS `AGENTS.md` into every project.
- Adding a Pi extension, package, generator executable, dependency, or runtime state service.
- Changing Pi's native context-file loading behavior.
- Editing `.pi/templates/tech-stack.md` or migrating other legacy OpenCode-era template metadata.
- Automatically committing, pushing, synchronizing a legacy branch, creating a branch/worktree, or installing dependencies.
- Guaranteeing the exact prose produced by every model; this feature specifies and statically tests the generation contract.

## Proposed Solution

### Overview

Add `.pi/templates/agents-policy.md` as a deliberately inert, human-auditable source scaffold. It must contain the compact mandatory kernel and guidance for evidence-derived sections, but no hardcoded project paths, toolchain, package manager, compatibility stance, verification command, or optional tool inventory.

Update `.pi/prompts/init.md` so Mode 1 explicitly reads the scaffold, detects and validates project facts, previews how existing instructions will be preserved or repaired, and synthesizes a root `AGENTS.md` within the existing 150-line hard limit. Optional workflow tools appear only when project configuration and executable validation both support them. The prompt must retain generation-time safeguards because the written context file becomes active only after `/reload` or a new session.

### User flow

1. The user invokes `/init`.
2. `/init` detects the project profile, existing AI rules, generated/runtime-managed paths, compatibility contracts, lifecycle configuration, and available tools.
3. `/init` reads `.pi/templates/agents-policy.md` and classifies candidate output into mandatory, detected, conditional, conflicting, and preserved-custom sections.
4. The preview lists validated facts, preserved sections, repaired conflicts, and omitted unsupported workflows.
5. After confirmation, `/init` creates or merges `AGENTS.md` without deleting unknown user-authored rules.
6. `/init` writes `.pi/tech-stack.md` only when selected by the existing flow.
7. The result reports that `/reload` or a new session is required before the generated context governs later turns.

## Requirements

### R1 — Mandatory policy kernel

The scaffold must require:

- user authority bounded by system/platform safety and explicit action scope;
- written permission naming paths before file or directory deletion;
- a two-confirmation gate for destructive or irreversible operations: preflight, first written confirmation, refreshed preflight, second immediate confirmation, exact execution, and audit;
- preservation of concurrent/unrelated work without stash, reset, restore, rebase, or overwrite;
- explicit approval before branch/worktree/commit/merge/push/deploy actions;
- manual targeted edits, generated-source discipline, and no speculative file proliferation;
- evidence before completion claims and narrow-to-broad verification;
- bounded, parent-verified delegation when subagents are available.

**Scenarios:**

- **WHEN** `/init` creates instructions for any project **THEN** every mandatory gate is represented in the generated contract.
- **WHEN** project-specific evidence is absent **THEN** `/init` still emits the mandatory kernel without inventing project facts.

### R2 — Evidence-derived project profile

`/init` must detect and validate the primary branch, runtime, package manager, lockfile policy, commands, layout, compatibility contract, generated/runtime paths, task lifecycle, and existing AI instructions before including them.

- **WHEN** a command or tool cannot be validated **THEN** it is omitted or clearly reported as unresolved, not advertised as available.
- **WHEN** an optional workflow tool is detected only on `PATH` but lacks project/configuration evidence **THEN** `/init` does not generate a mandatory workflow for it.

### R3 — Safe merge and conflict preview

Existing `AGENTS.md` content must be improved in place. The preview must identify preserved custom sections, additions, conflicts with mandatory gates, repairs, omissions, and any line-budget exception.

- **WHEN** an existing custom rule does not weaken a mandatory gate **THEN** it is preserved.
- **WHEN** an existing rule authorizes automatic deletion, destructive cleanup, or unapproved Git publication **THEN** the conflict is surfaced before writing and the mandatory gate wins in the proposed output.
- **WHEN** the existing file already exceeds 150 lines, or preservation plus the mandatory kernel cannot fit within 150 lines, **THEN** `/init` preserves the existing content, minimizes only its own additions through pointers, and reports the resulting line-budget exception; it never truncates or drops user-authored content to satisfy the budget.
- **WHEN** the user cancels at preview **THEN** no target file is changed.

### R4 — Concise, non-monolithic output

The scaffold and generation contract must favor pointers over copied procedures. A newly created `AGENTS.md` must be at most 150 lines. For an existing file, `/init` must keep its managed additions concise and follow the preservation/exception rule in R3 rather than deleting content to force compliance.

- **WHEN** optional tool instructions would exceed the budget **THEN** `/init` points to project documentation instead of copying full manuals.
- **WHEN** the supplied ACFS policy contains project-specific commands **THEN** they are not copied unless validated for the target project.
- **WHEN** `/init` creates a new file **THEN** the preview and generation contract explicitly enforce the 150-line maximum.

### R5 — Git and research workflow alignment

The user-profile flow must not offer standing auto-commit authorization. Deep initialization must use finite, distinct discovery inputs, cap concurrent agent waves at three, process overflow sequentially, and stop when required decisions have medium-or-higher-confidence evidence.

- **WHEN** a user chooses Git preferences **THEN** the available choice may offer to commit but still requires confirmation for each commit/push action.
- **WHEN** deep discovery has answered the generation questions **THEN** it stops rather than targeting an arbitrary large tool-call count.

### R6 — Activation disclosure

After writing or modifying `AGENTS.md`, `/init` must state that the user must run `/reload` or start a new session before Pi loads the new context file.

- **WHEN** the current invocation continues after writing **THEN** `/init` does not claim that the generated policy is already active.

### Non-functional requirements

- **Compatibility:** Pi 0.82.0 prompt-template and context-file behavior; Node.js `--experimental-strip-types` test runtime.
- **Safety:** no deletion, branch/worktree mutation, commit, push, package install, or active-artifact mutation beyond this explicitly selected slug.
- **Maintainability:** one scaffold, one existing generator prompt, and one existing static contract test file; no duplicated monolithic policy.
- **Determinism:** static tests check scaffold existence, line budget, wiring, mandatory clauses, forbidden standing authorizations, bounded discovery, and activation guidance.

## Success Criteria

- [ ] The canonical scaffold exists, remains at or below 150 lines, contains every mandatory policy category, and contains no hardcoded target-project toolchain or optional workflow inventory.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="init policy scaffold" .pi/tests/skill-system.test.ts`
- [ ] `/init` explicitly reads the scaffold, validates detected content, previews preservation/conflicts/omissions, and merges existing `AGENTS.md` without blind replacement; new files are limited to 150 lines while oversized existing files follow the preservation/exception rule.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="init policy synthesis" .pi/tests/skill-system.test.ts`
- [ ] `/init` no longer offers standing auto-commit authorization or automatic publication/legacy-branch synchronization and requires optional-tool evidence.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="init policy safety" .pi/tests/skill-system.test.ts`
- [ ] Deep initialization has a max-three concurrent wave, sequential overflow, and an evidence-sufficiency stop condition.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="init.*fan-out|fan-out.*init" .pi/tests/skill-system.test.ts`
- [ ] `/init` reports `/reload` or a new session as the activation step after changing `AGENTS.md`.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="init policy activation" .pi/tests/skill-system.test.ts`
- [ ] The retained Pi Core suite and whitespace checks pass.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts && git diff --check -- .pi/templates/agents-policy.md .pi/prompts/init.md .pi/tests/skill-system.test.ts`

## Technical Context

### Existing patterns

- `.pi/prompts/init.md:24-31,98-120` — improve-in-place rule, detection flow, and current concise-output contract.
- `.pi/prompts/init.md:45-57` — open-ended `--deep` description to replace with bounded evidence gathering.
- `.pi/prompts/init.md:238-285` — user-profile Git preference containing the conflicting `Auto-commit` option.
- `.pi/tests/skill-system.test.ts:1-46,100-115,194-214` — deterministic `readRequired` and regex policy-test patterns; `/init` is not currently covered.
- `.pi/templates/` — existing inert context scaffolds; there is no current agent-policy scaffold.
- `.pi/artifacts/templatize-agents-rules-for-init/research.md` — completed source-backed design and policy reconciliation.
- Pi 0.82.0 `docs/prompt-templates.md` — `.pi/prompts/*.md` discovery; `.pi/templates/` files are not slash commands.
- Pi 0.82.0 `docs/quickstart.md:86-103` — context files load at startup and require `/reload` or restart after changes.

### Affected files

```yaml
files:
  - .pi/templates/agents-policy.md
  - .pi/prompts/init.md
  - .pi/tests/skill-system.test.ts
```

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Mandatory rules become another stale monolith | Medium | High | Keep the scaffold compact and universal; derive project facts and point to detailed workflow docs. |
| Prompt wording does not guarantee exact model output | Medium | Medium | Test the orchestration contract; keep exact generation guarantees out of scope unless a deterministic renderer is later justified. |
| Merge behavior silently drops custom rules or truncates an oversized file | Medium | High | Preserve existing content, minimize only generated additions, and report a line-budget exception instead of forcing truncation. |
| Optional tools are advertised from stale availability | Medium | Medium | Require both project/config evidence and successful executable validation. |
| Safety kernel exceeds the old under-60-line target | Medium | Low | Treat 150 as the hard limit and prefer concise clauses/pointers over omitting gates. |
| New rules do not affect the current turn | High | Medium | Preserve safeguards inside `/init` and disclose `/reload`/new-session activation. |
| Static regex tests become brittle | Medium | Medium | Test semantic categories with focused assertions rather than exact full-document snapshots. |

## Resolved Questions

| Question | Decision | Status |
|---|---|---|
| Should the full ACFS file be copied? | No; synthesize from a compact universal scaffold plus validated project evidence. | Resolved |
| Is the scaffold a Pi prompt template? | No; use `.pi/templates/agents-policy.md` and explicitly read it from `/init`. | Resolved |
| Is an extension needed? | No; the existing `/init` prompt is sufficient. | Resolved |
| How should optional tools be handled? | Include only with project/configuration evidence and executable validation. | Resolved |
| What happens to existing custom rules? | Preserve them unless they weaken a mandatory gate; preview conflicts before writing. | Resolved |
| Can Git preferences authorize future commits? | No; each commit/push still needs explicit approval. | Resolved |
| How does the policy become active? | Run `/reload` or start a new session after generation. | Resolved |
| What if preservation exceeds 150 lines? | Preserve existing content, minimize generated additions, and report the exception; enforce 150 only for newly created files. | Resolved |

## Tasks

### task-1 — Lock the reusable policy contract [test]

The canonical scaffold and focused static tests define the mandatory kernel, evidence-derived boundaries, line budget, and forbidden project-specific assumptions.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/templates/agents-policy.md
  - .pi/tests/skill-system.test.ts
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="init policy scaffold" .pi/tests/skill-system.test.ts`
- `test "$(wc -l < .pi/templates/agents-policy.md)" -le 150`
- `git diff --check -- .pi/templates/agents-policy.md .pi/tests/skill-system.test.ts`

### task-2 — Integrate evidence-backed policy synthesis into `/init` [workflow]

The `/init` prompt explicitly consumes the scaffold, safely previews and merges existing instructions, bounds discovery, removes standing Git authorization, and reports context activation accurately.

**Metadata:**

```yaml
depends_on:
  - task-1
parallel: false
conflicts_with: []
files:
  - .pi/prompts/init.md
  - .pi/tests/skill-system.test.ts
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="init policy synthesis|init policy safety|init policy activation|init.*fan-out|fan-out.*init" .pi/tests/skill-system.test.ts`
- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `git diff --check -- .pi/templates/agents-policy.md .pi/prompts/init.md .pi/tests/skill-system.test.ts`

## Notes

- `research.md` is retained as the source-backed design record; it is not authoritative execution state.
- `tasks.json` is the authoritative work graph. A separate `plan.md` is unnecessary because the two sequential tasks are already executable and each owns at most two files.
- No branch, worktree, commit, push, dependency installation, or implementation was performed during `/create`.