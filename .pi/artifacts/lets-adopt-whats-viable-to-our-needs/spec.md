# lets adopt whats viable to our needs

## Problem Statement

pi-core already has strong lifecycle, planning, verification, review, and domain skills, but it lacks two useful focused behaviors found in Bigpowers: safe workspace organization and explicit domain-language definition. Its skill catalog is also out of sync with the directory tree, while several prompts and workflows can fan out to 5–15 small-model agents, causing avoidable latency and making the system feel less Pi-native.

The goal is to adopt only the proven, locally useful patterns from the pinned Bigpowers research while preserving pi-core's `Agent` routing, `.pi/artifacts/` lifecycle, direct-tool preference, and existing skills.

## Goals

- Add safe, pressure-tested `organize-workspace` and `define-language` skills adapted to local conventions.
- Integrate useful impact assessment, contract validation, bounded delegation, compact handoff, and skill-catalog parity patterns into existing local skills and tests.
- Make direct execution the default and cap every single concurrent subagent wave at 1–3 agents.
- Preserve provenance without copying the Bigpowers YAML cockpit or replacing local lifecycle artifacts.

## Scope

### In Scope

- An `organize-workspace` skill whose default behavior is inventory-only and whose move/delete actions require explicit confirmation.
- A `define-language` skill that extracts and reconciles project vocabulary without creating a new canonical lifecycle artifact.
- RED/GREEN pressure scenarios and deterministic tests for the new skill behavior.
- Exact reconciliation between `.pi/skills/*/SKILL.md` directories and `.pi/skills/manifest.json`.
- Selected patterns from `assess-impact`, `dispatch-agents`, `session-state`, `stocktake-skills`, and `validate-contracts`, translated into existing local skills.
- A repository-wide 1–3 concurrent-agent ceiling for prompts, workflows, and subagent coordination guidance.
- MIT attribution for adapted Bigpowers material.

### Out of Scope

- Copying the upstream 80-skill catalog wholesale.
- Adopting Bigpowers' `specs/state.yaml`, release-plan, epic capsule, execution-status, or dashboard conventions.
- Adding `orchestrate-project`, `build-epic`, `run-planning`, or other cockpit-dependent skills.
- Implementing any of the 24 “consider later” skills without a concrete project need.
- Adding dependencies, changing Pi providers/models, or changing application/runtime code.
- Introducing a fifth canonical active-work artifact beyond `spec.md`, `plan.md`, `tasks.json`, and `progress.md`.

## Proposed Solution

1. Establish failing behavioral pressure scenarios and static policy tests before adding skills, following `.pi/skills/writing-skills/SKILL.md`.
2. Add two compact skills under `.pi/skills/`: `organize-workspace` and `define-language`. Use local frontmatter, configured `Agent` names, direct tools by default, explicit safety gates, and local artifact conventions.
3. Reconcile the manifest and add a deterministic test that fails when a skill directory and manifest entry diverge.
4. Merge impact analysis into planning, boundary verification into API/interface design, bounded typed delegation into subagent-driven development, and compact handoff guidance into the existing lifecycle—without new state files.
5. Update orchestration entrypoints so a wave uses at most three agents, prefers one focused agent or direct tools, shards larger workloads across sequential waves, and retains parent synthesis and verification.
6. Record upstream inspiration and MIT licensing in a local notice file while rewriting guidance for pi-core rather than copying package-specific prose.

## Success Criteria

- `organize-workspace` inventories and classifies before acting, protects source/config/secrets/`.pi/artifacts`, and requires explicit confirmation before any move or delete.
  - Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts`
- `define-language` has a distinct trigger, resolves ambiguous terminology, and returns a glossary/decision set without hard-coding a new artifact path.
  - Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts`
- Every skill directory containing `SKILL.md` has exactly one manifest entry, and every manifest entry resolves to a real skill directory.
  - Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts`
- Existing planning, API/interface, subagent, and lifecycle skills contain the selected patterns without introducing duplicate standalone skills.
  - Verify: `rg -n "blast radius|boundary|task_brief|handoff" .pi/skills/{planning-and-task-breakdown,api-and-interface-design,subagent-driven-development,development-lifecycle}/SKILL.md`
- No prompt, workflow, or coordination skill authorizes more than three concurrently running agents in one wave; larger work is processed in sequential shards.
  - Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts`
- All subagent instructions continue to use the pi-subagents `Agent` tool, omit `model`/`thinking`, and keep synthesis and verification with the parent.
  - Verify: `rg -n "pi-subagents|parent.*verif|Omit.*model.*thinking" .pi/prompts .pi/workflows .pi/skills/subagent-driven-development/SKILL.md`
- Adapted skills contain no Bigpowers cockpit paths or package-specific runtime assumptions.
  - Verify: `! rg -n "specs/state\.yaml|release-plan\.yaml|execution-status\.yaml|\.bigpowers/" .pi/skills/organize-workspace .pi/skills/define-language`
- Attribution identifies the pinned source and MIT license.
  - Verify: `rg -n "danielvm-git/bigpowers|MIT|d1993d31437bfbdb5bda81e84650628215365754" .pi/skills/THIRD_PARTY_NOTICES.md`

## Technical Context

- Canonical lifecycle: `.pi/skills/development-lifecycle/SKILL.md` uses `.pi/artifacts/.active` plus `spec.md`, `plan.md`, `tasks.json`, and `progress.md`.
- Skill authoring gate: `.pi/skills/writing-skills/SKILL.md` requires RED pressure tests before skill prose.
- Delegation contract: `.pi/skills/subagent-driven-development/SKILL.md` uses the installed pi-subagents `Agent` tool and currently permits one worker/reviewer per task.
- Existing test convention: `.pi/tests/prompt-leverage.test.ts` uses `node:test` in TypeScript.
- Current fan-out hotspots include `.pi/workflows/audit-pattern.md` (max 15), `.pi/workflows/deep-research.md` (max 10), `.pi/workflows/batch-implement.md` (max 10), `.pi/workflows/development-lifecycle-workflow.md` (max 5), and prompt-level deep/review flows.
- Current catalog drift: 65 skill directories were observed while `.pi/skills/manifest.json` contains 58 entries, including stale names and omitting existing directories.
- External basis: Bigpowers snapshot `d1993d31437bfbdb5bda81e84650628215365754`, MIT licensed. Only concepts selected by the prior research are in scope.
- Repository constraint: `/home/ryan/repo/pi-core` is not currently a Git worktree and has no root package manifest. Branch/worktree creation and commit-based shipping cannot be claimed from this workspace.

## Affected Files

### New

- `.pi/skills/organize-workspace/SKILL.md`
- `.pi/skills/define-language/SKILL.md`
- `.pi/skills/THIRD_PARTY_NOTICES.md`
- `.pi/tests/skill-system.test.ts`

### Modified

- `.pi/skills/manifest.json`
- `.pi/skills/planning-and-task-breakdown/SKILL.md`
- `.pi/skills/api-and-interface-design/SKILL.md`
- `.pi/skills/subagent-driven-development/SKILL.md`
- `.pi/skills/development-lifecycle/SKILL.md`
- `.pi/prompts/audit.md`
- `.pi/prompts/create.md`
- `.pi/prompts/gc.md`
- `.pi/prompts/plan.md`
- `.pi/prompts/research.md`
- `.pi/prompts/ship.md`
- `.pi/workflows/audit-pattern.md`
- `.pi/workflows/deep-research.md`
- `.pi/workflows/development-lifecycle-workflow.md`
- `.pi/workflows/batch-implement.md`
- `.pi/workflows/garbage-collection.md`

## Tasks

### [test] Establish RED skill and orchestration policy tests

The end state is a failing `node:test` suite and recorded pressure-test evidence that captures unsafe workspace actions, vague language extraction, manifest drift, and agent fan-out above three before production skill changes begin.

```yaml
depends_on: []
parallel: false
conflicts_with: [task-2, task-3, task-4]
files:
  - .pi/tests/skill-system.test.ts
  - .pi/artifacts/lets-adopt-whats-viable-to-our-needs/progress.md
```

Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` exits non-zero for the expected missing-policy assertions, and RED pressure-test outputs are recorded in `progress.md`.

### [skills] Add the two adapted skills and reconcile provenance/catalog

The end state is two compact Pi-native skills that pass their GREEN pressure scenarios, are indexed exactly once, and carry clear upstream MIT attribution.

```yaml
depends_on: [task-1]
parallel: false
conflicts_with: [task-3, task-4]
files:
  - .pi/skills/organize-workspace/SKILL.md
  - .pi/skills/define-language/SKILL.md
  - .pi/skills/THIRD_PARTY_NOTICES.md
  - .pi/skills/manifest.json
  - .pi/tests/skill-system.test.ts
```

Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` and two consecutive GREEN pressure scenarios per new skill score at least 4/5.

### [integration] Merge selected patterns into existing local skills

The end state is one local implementation of blast-radius planning, contract validation, typed bounded task handoffs, compact lifecycle handoff, and deterministic catalog parity, with no duplicate Bigpowers-style state system.

```yaml
depends_on: [task-2]
parallel: false
conflicts_with: [task-4]
files:
  - .pi/skills/planning-and-task-breakdown/SKILL.md
  - .pi/skills/api-and-interface-design/SKILL.md
  - .pi/skills/subagent-driven-development/SKILL.md
  - .pi/skills/development-lifecycle/SKILL.md
  - .pi/skills/manifest.json
  - .pi/tests/skill-system.test.ts
```

Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` and `rg -n "blast radius|boundary|task_brief|handoff" .pi/skills/{planning-and-task-breakdown,api-and-interface-design,subagent-driven-development,development-lifecycle}/SKILL.md`.

### [workflow] Enforce Pi-native 1–3 agent waves everywhere

The end state is a consistent direct-first orchestration policy across active prompts and workflows, with no wave above three concurrent agents and sequential sharding for larger workloads.

```yaml
depends_on: [task-3]
parallel: false
conflicts_with: []
files:
  - .pi/prompts/audit.md
  - .pi/prompts/create.md
  - .pi/prompts/gc.md
  - .pi/prompts/plan.md
  - .pi/prompts/research.md
  - .pi/prompts/ship.md
  - .pi/workflows/audit-pattern.md
  - .pi/workflows/deep-research.md
  - .pi/workflows/development-lifecycle-workflow.md
  - .pi/workflows/batch-implement.md
  - .pi/workflows/garbage-collection.md
  - .pi/skills/subagent-driven-development/SKILL.md
  - .pi/tests/skill-system.test.ts
```

Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts` and `node --experimental-strip-types --test --test-name-pattern="fan-out" .pi/tests/skill-system.test.ts`.

## Risks and Mitigations

- **Behavioral skill tests are model-sensitive.** Use fixed pressure scenarios, explicit rubrics, fresh foreground agents, and two consecutive GREEN passes.
- **Manifest repair may expose unrelated historical drift.** Make the parity test authoritative and reconcile the entire catalog atomically rather than adding only the two new names.
- **A global fan-out cap may reduce throughput on genuinely large audits.** Preserve completeness through sequential shards of at most three agents rather than truncating the workload.
- **Overlapping instructions may create duplicated guidance.** Enhance existing planning, API, lifecycle, and subagent skills; do not add standalone copies for the five extracted patterns.
- **Upstream prose may carry licensing/provenance concerns.** Rewrite for local semantics, preserve the MIT notice, and cite the pinned source.
- **No Git worktree is available.** Artifact creation can complete, but `/ship` commit/branch gates remain blocked until this directory is backed by a Git repository or the artifact is moved into the actual repository.

## Assumptions

- “Viable to our needs” means the seven items recommended by the completed research: two adapted skills plus five extracted patterns.
- The user's 1–3 swarm limit applies to concurrent agents per wave, not the total number of sequential agents used over a long workflow.
- Direct tools and parent synthesis are preferred whenever a separate agent adds no distinct expertise or isolation.
- Existing local lifecycle files remain the source of truth.

## Open Questions

None required before implementation. The missing Git worktree is an operational blocker for branch/commit completion, not a product-scope ambiguity.