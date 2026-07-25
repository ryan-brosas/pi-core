# Research: Templatize mandatory AGENTS.md rules for `/init`

**Date:** 2026-07-25

**Execution mode:** Deep-research workflow (three independent scouts, then one dependent review)

**Scope:** Research and recommendation only; no implementation changes were made.

## Executive Summary

The supplied ACFS `AGENTS.md` should **not** be copied wholesale into every project. It combines three different kinds of content: durable safety rules, ACFS-specific project facts, and optional tool workflows. Literal reuse would create stale or contradictory instructions and violate the current `/init` contract to produce a concise, evidence-backed `AGENTS.md` (target under 60 lines, maximum 150).

The recommended design is a **hybrid scaffold plus synthesis**:

1. Add a clearly named, inert source scaffold such as `.pi/templates/agents-policy.md` containing only compact mandatory clauses and section guidance.
2. Explicitly wire `.pi/prompts/init.md` to read that scaffold.
3. Have `/init` detect project facts, preview conflicts, and merge a concise project-specific `AGENTS.md` without blindly replacing existing content.
4. Keep optional tools and workflow instructions conditional on verified project configuration and executable availability.
5. Tell the user to run `/reload` or start a new session after generation, because Pi loads `AGENTS.md` context at startup and does not activate newly written context files during the current turn.

No extension is required. `/init` is already a Pi project prompt template; an extension would add unnecessary runtime complexity for a static generation workflow.

## Questions and Answers

### 1. Where should this behavior live?

**Answered — high confidence.**

- `.pi/prompts/init.md` remains the orchestration source of truth.
- A new `.pi/templates/agents-policy.md` may serve as the auditable policy scaffold, but it is **not** a Pi prompt template and is inert unless `/init` explicitly reads it.
- The emitted artifact remains project-root `AGENTS.md`.
- Focused policy tests belong in `.pi/tests/skill-system.test.ts`, which already uses deterministic Markdown contract assertions. There is currently no `/init` entry in its orchestration-surface coverage, so coverage must be added rather than assumed.

Sources: `.pi/prompts/init.md:1-120`; `.pi/tests/skill-system.test.ts:1-46,100-115`; Pi v0.82.0 `docs/prompt-templates.md:5-17,92-96`.

### 2. Which supplied rules are universal?

**Answered — high confidence.**

Generate a compact mandatory kernel covering:

- user authority bounded by system/platform safety and explicit action scope;
- no file or directory deletion without written approval naming the paths;
- a strict confirmation and audit gate for destructive or irreversible operations;
- preservation of concurrent and unrelated work without stash/revert/reset/overwrite;
- no branch, worktree, commit, merge, push, or deployment without explicit approval;
- targeted edits, generated-source discipline, and no speculative file proliferation;
- evidence-backed completion claims and narrow-to-broad verification;
- bounded, parent-verified subagent delegation when delegation is available.

These align with the current Pi Core operating contract rather than importing ACFS-specific assumptions. Source: `AGENTS.md:24-221,225-296`.

### 3. Which rules must be detected or conditional?

**Answered — high confidence.**

Detect and verify before emitting:

- project name, canonical checkout, primary branch, runtime, package manager, and lockfile policy;
- real build, test, lint, type-check, and integration commands;
- compatibility policy, generated/runtime-managed paths, source-of-truth files, and project layout;
- task/lifecycle system and existing AI instruction files;
- optional tools such as Beads, MCP Agent Mail, `bv`, UBS, RCH, DCG, RU, Morph, or external checkers.

An executable alone is insufficient for a workflow rule: `/init` should require both project/configuration evidence and successful availability validation.

### 4. Which supplied rules should be rejected or repaired?

**Answered — high confidence.**

- Do not generate automatic `main:master` synchronization or any automatic push.
- Do not treat `git stash`, reset, restore, rebase, or clean as routine concurrent-work cleanup.
- Do not require commit/push at session end without fresh explicit approval.
- Do not tell agents to pretend other agents' changes are their own; preserve them, do not claim ownership, and continue on owned paths.
- Do not universalize Bun, Bash, Ubuntu, ACFS checker/checksum flows, no-backward-compatibility, or named tool routing.
- Do not retain an open-ended “~100+ tool calls” deep mode; use a finite budget plus an evidence-sufficiency stopping rule.
- Replace `/init`'s user-profile “Auto-commit” option with “Offer to commit; confirm each action,” because a stored preference is not standing authorization.

Sources: `.pi/prompts/init.md:39-57,98-120,238-285`; `AGENTS.md:89-116,225-296`.

### 5. When do generated rules become active?

**Answered — high confidence.**

Pi loads `AGENTS.md` context files at startup. After `/init` creates or updates the file, the new rules do not automatically govern the rest of that same turn. `/init` must retain its own generation-time safety rules and report: **run `/reload` to activate the generated `AGENTS.md` in this session, or start a new session**.

Source: Pi v0.82.0 `docs/quickstart.md:86-103`; `README.md` Context Files and `/reload` command documentation.

## Recommended Design

### Policy scaffold: `.pi/templates/agents-policy.md`

Use a deliberately non-reserved name to avoid confusing it with either an auto-discovered Pi prompt (`.pi/prompts/*.md`) or an active context file (`AGENTS.md`). Keep only:

- required section headings and compact mandatory clauses;
- placeholders describing evidence `/init` must resolve;
- merge rules for preserving custom existing sections;
- no project-specific paths, commands, versions, or optional tool names in the universal body.

### Generator: `.pi/prompts/init.md`

Revise Mode 1 to:

1. Detect existing instructions and project facts.
2. Classify candidate content as universal, detected, conditional, conflicting, or preserved-custom.
3. Validate commands and optional tools before advertising them.
4. Preview additions, preserved sections, conflict repairs, and omissions.
5. Read the scaffold explicitly and synthesize/merge `AGENTS.md` within the 150-line hard limit.
6. Preserve unknown user-authored sections unless they weaken a mandatory safety gate; surface those conflicts in the preview.
7. Report activation via `/reload` or a new session.

### Tests: `.pi/tests/skill-system.test.ts`

Add named tests proving that:

- the scaffold exists and `/init` explicitly reads it;
- the universal gates are present and the scaffold stays within 150 lines;
- existing content is preserved and conflicts are previewed;
- optional tools require detection and are not unconditional;
- auto-commit/push, legacy-branch synchronization, and stash/reset cleanup are not offered;
- `/reload` or a new session is required after generation;
- deep research has a finite bound and stopping condition.

Static Markdown tests verify the orchestration contract, not every model-generated output. If exact generated shape or line count must be guaranteed, add a deterministic fixture/renderer seam rather than relying only on prompt wording.

## Contradictions and Uncertainties

- **Template-file disagreement resolved:** direct synthesis is necessary, but a small explicitly read scaffold improves auditability and avoids duplicating mandatory prose inside `/init`. The scaffold must not be described as a Pi prompt template.
- **Current template metadata is stale:** `.pi/templates/tech-stack.md` still claims OpenCode `instructions[]` injection and should not be copied as a wiring model. It is only a directory/layout precedent.
- **Unresolved:** the canonical version/provenance of the ACFS policy and which clauses the user considers mandatory versus advisory.
- **Unresolved:** whether ordinary commit/push should use one explicit confirmation or the full two-confirmation destructive gate in generated projects.
- **Unresolved:** whether the target-under-60-lines goal can retain a real code example plus every mandatory gate; retain 150 as the hard ceiling and prefer pointers over copied procedures.

## Sources

### Repository evidence

- `AGENTS.md` — current Pi Core operating contract.
- `.pi/prompts/init.md` — current `/init` generator contract.
- `.pi/prompts/research.md` and `.pi/workflows/deep-research.md` — research workflow and persistence contract.
- `.pi/tests/skill-system.test.ts` — existing static prompt/workflow test pattern.
- `.pi/templates/tech-stack.md` and `.pi/templates/project.md` — existing context-template patterns and stale metadata warning.

### Official Pi documentation

Installed version: **Pi 0.82.0**; accessed 2026-07-25; publication dates not stated in the installed files.

- Prompt templates: https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/prompt-templates.md
- Quickstart / context reload: https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/quickstart.md
- Extensions: https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/extensions.md
- Settings: https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/settings.md
- Packages: https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/packages.md

## Next Step

Create a specification or implementation plan for the three owned surfaces—`.pi/templates/agents-policy.md`, `.pi/prompts/init.md`, and `.pi/tests/skill-system.test.ts`—then implement test-first. Do not alter the unrelated active artifact implicitly.