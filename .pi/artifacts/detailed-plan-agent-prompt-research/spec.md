# Detailed `Plan` Agent and `/plan` Delegation

**Status:** Ready for planning and implementation
**Created:** 2026-07-25
**Active slug:** `detailed-plan-agent-prompt-research`
**Research:** `.pi/artifacts/detailed-plan-agent-prompt-research/research.md`

## Problem Statement

Pi Core's planning surfaces do not yet combine the original `Plan` agent's detailed, relatable voice with an executable and safe delegation contract. The current partial rewrite improves structure but removes much of the original prompt's distinctive reasoning ritual. Meanwhile, `/plan` names `Plan` in routing prose without providing a concrete Agent invocation, its planning envelopes imply that a child may produce canonical `plan.md` and `tasks.json` files, and its handoff language incorrectly treats `.active` mutation as a routine `/ship` responsibility.

The existing contract tests check broad vocabulary rather than behavior. They can pass without proving that `/plan` actually instructs the parent to invoke `Plan`, that the child is advisory-only, or that canonical artifact and lifecycle writes remain parent-owned.

## Goals

1. Restore the original `Plan` specialist's memorable voice and planning ritual without weakening direct safety boundaries.
2. Make `/plan` explicitly invoke one foreground `Plan` child when ambiguous requirements, architecture decisions, or cross-subsystem sequencing justify specialist planning.
3. Keep canonical synthesis, `plan.md`, `tasks.json`, `.active`, and lifecycle state exclusively parent-owned.
4. Place reusable planning doctrine in the planning skill while avoiding unnecessary duplication across the skill, child prompt, and `/plan` orchestrator.
5. Replace vocabulary-only checks with behavior-level positive and negative contract tests.

## Scope

### In Scope

- Refine `.pi/agents/Plan.md` as a detailed, relatable, read-only planning specialist.
- Restore selected original headings, quotations, and the Ground → Calibrate → Transform → Release → Reset ritual.
- Correct the Plan child's envelope and output schema so all deliverables are advisory chat output or proposed deltas.
- Add a concrete conditional foreground `Plan` Agent invocation contract to `.pi/prompts/plan.md`.
- Clarify direct-first routing among `Plan`, `Explore`, and `scout`.
- Correct parent ownership, first-plan creation, overwrite approval, `.active`, and `/ship` handoff language.
- Align `.pi/skills/planning-and-task-breakdown/SKILL.md` with conditional Plan routing and parent-owned synthesis.
- Strengthen `.pi/tests/skill-system.test.ts` with exact positive and negative contract assertions.

### Out of Scope

- Changes to `/ship`, `/create`, `/research`, or other prompt templates.
- Changes to `general`, `build`, `review`, `scout`, or `Explore` agent definitions.
- Runtime changes to Pi or `@tintinweb/pi-subagents`.
- Mandatory Plan delegation for every `/plan` invocation.
- Implementation code, package dependencies, branch operations, commits, pushes, or `.active` changes.
- Cleanup of unrelated test-suite or extension failures.

## Product and Workflow Decisions

1. **Plan delegation is conditional.** The parent plans inline by default and invokes `Plan` for material ambiguity, architectural trade-offs, or cross-subsystem sequencing. A complex `/plan` run that skips Plan records a brief rationale.
2. **Plan is foreground and fresh.** Parent synthesis depends on the result, and the child receives a complete task envelope rather than inherited conversation assumptions.
3. **The child is advisory-only.** It returns a primary recommendation, observable truths, required artifacts, key links, dependency implications, verification strategy, risks, assumptions, and open decisions in chat.
4. **The parent owns canonical state.** Only the parent writes or validates `plan.md` and `tasks.json` and controls `.active` or other lifecycle transitions.
5. **Initial canonical plan creation is expected.** Invoking `/plan` authorizes creation of its first canonical `plan.md`; overwrites and unrelated extra files remain approval-gated.
6. **Voice placement is intentional.** The full ritual voice belongs in `Plan.md`, concise relatable framing belongs in `/plan`, and reusable mechanics belong in the planning skill.

## Proposed Solution

### Plan Specialist Contract

Retain the current operational shell—identity, task, success criteria, boundaries, tool guidance, envelope, workflow, and output schema—while restoring the original planning character:

- “Planning Guidelines”
- “Architecture as Ritual”
- “Clarity Through Constraint”
- “Simplicity First”
- The leverage and architecture/body quotations
- Ground, Calibrate, Transform, Release, and Reset
- Goal-backward reasoning and “Plans are leverage, not the deliverable”

The envelope must describe parent-owned canonical artifacts as inputs or targets informed by the advisory, never as files the child updates. The child must not write files, mutate lifecycle state, implement code, change Git or dependencies, or spawn nested agents.

### `/plan` Orchestration Contract

Add a concrete foreground Plan invocation example and surrounding routing rule. The parent resolves the complete advisory envelope before dispatch, including task identity, bounded advisory question, outcome goal, exact paths, constraints, prior decisions, dependencies, non-goals, acceptance criteria, discovery cap, resolved research, gaps, expected chat-only output, stop conditions, and approval constraints.

After receiving the advice, the parent verifies citations and local evidence, resolves conflicts, writes canonical planning artifacts, validates the graph, and prepares `/ship`. The handoff must state that `.active` remains exceptional and approval-gated rather than assigning active-artifact switching to `/ship`.

### Shared Planning Doctrine

Keep reusable decomposition guidance in `planning-and-task-breakdown`: blast-radius analysis, vertical slicing, ordering, verification, risks, assumptions, stop conditions, parent synthesis, and conditional routing. The skill should not duplicate the full `/plan` lifecycle or the Plan persona.

### Contract Testing

Tests must verify executable structure rather than isolated words. Positive checks cover the concrete Plan call, routing triggers, advisory envelope, parent ownership, frontmatter, and selected voice markers. Negative checks reject child-produced canonical files, lifecycle writes, nested agents, automatic Plan → Implement → Review choreography, and routine `.active` delegation to `/ship`.

## Technical Context

- Pi prompt templates expand Markdown into parent prompts; they do not launch child agents automatically.
- Installed `@tintinweb/pi-subagents` version `0.14.3` gives project `.pi/agents/Plan.md` precedence over the built-in same-name agent.
- Plan invocation lookup is case-insensitive, but exact `Plan` casing is retained for reliable and legible override behavior.
- `prompt_mode: replace` makes the custom body the specialist prompt.
- `inherit_context: false` prevents inherited conversation history, so the invocation envelope must be self-contained.
- `.pi/agent-tool-description.md` establishes direct parent work as the default and limits Plan delegation to cases where an independent blueprint materially reduces risk.
- The active checkout contains partial edits in the affected prompt and test files. TDD must target the verified missing contracts so focused tests still demonstrate RED before each minimal correction.

## Affected Files

- `.pi/agents/Plan.md`
- `.pi/prompts/plan.md`
- `.pi/skills/planning-and-task-breakdown/SKILL.md`
- `.pi/tests/skill-system.test.ts`

## Success Criteria

- The Plan specialist preserves its exact frontmatter and exposes direct advisory/read-only boundaries alongside the selected original voice and five-phase ritual.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="plan agent" .pi/tests/skill-system.test.ts`
- Plan child outputs are chat-only advice or proposed deltas; tests reject language requiring child-produced `updated plan.md` or `updated tasks.json`.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="plan agent" .pi/tests/skill-system.test.ts`
- `/plan` contains a concrete foreground Plan Agent call contract, direct-first routing, all three qualification triggers, and no invocation-level model or thinking override.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="plan prompt|Plan delegation" .pi/tests/skill-system.test.ts`
- `/plan` states that the parent alone writes canonical artifacts, distinguishes first plan creation from overwrite, and keeps `.active` exceptional and approval-gated.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="plan prompt|Plan delegation" .pi/tests/skill-system.test.ts`
- The planning skill documents parent synthesis and conditional Plan, Explore, and scout routing without owning lifecycle execution.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="planning skill|planning ownership" .pi/tests/skill-system.test.ts`
- Focused planning and task-graph tests pass together.
  - Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts .pi/tests/task-graph.test.ts`
- The active version-2 graph validates and affected files pass whitespace checks.
  - Verify: `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/detailed-plan-agent-prompt-research/tasks.json`
  - Verify: `git diff --check -- .pi/agents/Plan.md .pi/prompts/plan.md .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts`

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Restored metaphor obscures ownership rules | Medium | High | Keep direct imperative boundaries before methodology and make them testable. |
| Planning doctrine is duplicated across three files | Medium | Medium | Assign orchestration, persona, and reusable doctrine to distinct surfaces. |
| Existing partial edits prevent meaningful RED tests | Medium | Medium | Add exact negative assertions for the verified remaining gaps before each correction. |
| Regex tests pass on unrelated vocabulary | High | Medium | Assert concrete call structure, exact fields, frontmatter, and forbidden-language absence. |
| Prompt length grows without improving decisions | Medium | Medium | Preserve only decision-relevant ritual language and one primary advisory schema. |
| Full project suite contains an unrelated baseline failure | Medium | Medium | Run focused retained suites first, then run the full core suite and report any independently verified pre-existing blocker without expanding scope. |

## Open Questions

No unresolved product questions block implementation. Mandatory Plan use, initial plan creation authorization, and voice placement are resolved by the decisions above.

## Tasks

### [agent] Restore the detailed Plan specialist and advisory boundary

The Plan child has its original planning character, a self-contained envelope, and an enforceable chat-only advisory contract without canonical or lifecycle writes.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/agents/Plan.md
  - .pi/tests/skill-system.test.ts
```

**TDD requirement:** Add or strengthen focused contract assertions for the missing voice and ownership guarantees, observe RED against the current partial implementation, then make the minimum Plan prompt changes required for GREEN.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="plan agent" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/agents/Plan.md .pi/tests/skill-system.test.ts`

### [prompt] Wire conditional Plan delegation into `/plan`

The parent `/plan` workflow contains a concrete foreground Plan invocation, a resolved advisory envelope, correct canonical ownership, precise approval gates, and a safe `/ship` handoff.

**Metadata:**

```yaml
depends_on:
  - task-1
parallel: false
conflicts_with: []
files:
  - .pi/prompts/plan.md
  - .pi/tests/skill-system.test.ts
```

**TDD requirement:** Add exact positive and negative `/plan` contract assertions, observe RED for the missing invocation and unsafe wording, then make the minimum prompt changes required for GREEN.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="plan prompt|Plan delegation" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/prompts/plan.md .pi/tests/skill-system.test.ts`

### [skill] Align reusable planning doctrine and routing

The planning skill owns reusable decomposition doctrine and consistently describes bounded Plan, Explore, and scout inputs while preserving parent synthesis and lifecycle ownership.

**Metadata:**

```yaml
depends_on:
  - task-2
parallel: false
conflicts_with: []
files:
  - .pi/skills/planning-and-task-breakdown/SKILL.md
  - .pi/tests/skill-system.test.ts
```

**TDD requirement:** Add a focused skill-contract assertion for conditional Plan routing and parent ownership, observe RED, then make the minimum doctrine change required for GREEN.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="planning skill|planning ownership" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts`

### [verification] Run integrated verification and independent review

All focused and retained checks pass, the canonical graph validates, affected files are clean, and an independent review finds no unresolved critical or important contract issue.

**Metadata:**

```yaml
depends_on:
  - task-3
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/skill-system.test.ts .pi/tests/task-graph.test.ts`
- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/detailed-plan-agent-prompt-research/tasks.json`
- `git diff --check -- .pi/agents/Plan.md .pi/prompts/plan.md .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts`