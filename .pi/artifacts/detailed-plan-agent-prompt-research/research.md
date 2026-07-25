# Research: Detailed `Plan` Agent and `/plan` Delegation

**Date:** 2026-07-25
**Artifact:** `detailed-plan-agent-prompt-research`
**Status:** Clean rerun; this report supersedes the previous contents of `research.md`.

## Research Question

How should Pi Core's `/plan` command explicitly use the pi-subagents `Plan` agent while preserving the detailed, relatable voice and reasoning ritual of the original `.pi/agents/Plan.md`, without duplicating planning doctrine or allowing the child to own canonical `plan.md`, `tasks.json`, or lifecycle state?

## Execution Mode

**Complex deep-research workflow**

1. Three independent `scout` angles:
   - Installed Pi and pi-subagents runtime mechanics
   - Original `Plan.md` voice and Git history
   - Project workflow ownership, routing, handoff, and tests
2. One dependent foreground `review` cross-checked the joined findings against installed source, official documentation, Git history, current files, and project policy.
3. The parent resolved contradictions and produced this synthesis.

Two scouts reached their turn limit after returning complete evidence packets. The dependent reviewer independently reopened the cited sources and corrected overclaims. All retained conclusions have medium-or-higher confidence.

## Executive Summary

**Yes, `/plan` can and should use the project `Plan` agent for genuine deep-planning work.** Pi prompt templates expand Markdown into a parent prompt; they do not launch a child automatically. `.pi/prompts/plan.md` therefore needs a concrete foreground instruction to call:

```typescript
Agent({
  subagent_type: "Plan",
  description: `Advise on ${featureSlug} planning decision`,
  prompt: planningEnvelope,
});
```

Under current project policy, Plan delegation should remain conditional: invoke it when requirements are materially ambiguous, an architecture trade-off needs resolution, or sequencing crosses subsystems. Continue planning inline for clear mechanical work. Because `/plan` is intended for complex work, most Level 2–3 invocations should qualify; skipping Plan in such a case should require a short rationale.

The parent remains the sole canonical planner. The Plan child returns chat-only advice. It must not write `plan.md`, `tasks.json`, `progress.md`, `.active`, implementation files, Git state, or dependencies. The parent reconciles evidence, writes canonical artifacts, validates the task graph, and owns approval gates.

The original prompt's detailed, relatable energy should be restored additively. Retain its named principles, selected quotations, and Ground → Calibrate → Transform → Release → Reset ritual as the specialist's reasoning layer. Keep the current direct boundaries, task envelope, and output schema. Metaphor must never weaken explicit read-only and ownership rules.

The current implementation is incomplete: `/plan` names Plan in routing prose but never shows a concrete Plan call; both planning envelopes imply child-produced canonical files; the handoff misassigns `.active` mutation to `/ship`; and existing tests verify keywords rather than executable behavior and negative safety invariants.

## Questions and Answers

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| Can `/plan` invoke the custom Plan agent? | Answered | High | Yes, through an explicit `Agent` call using `subagent_type: "Plan"`. |
| Does mentioning Plan in routing prose invoke it? | Answered | High | No. Prompt-template expansion alone does not launch a child. |
| Should every `/plan` invocation use Plan? | Policy-dependent | High technical / Medium policy | Current policy is direct-first. Use Plan for ambiguity, architecture, or cross-subsystem sequencing. Making it universal requires an explicit policy change. |
| Who writes canonical planning artifacts? | Answered | High | The parent only. The child returns advisory text and proposed deltas. |
| Should `Plan.md` remain capitalized? | Answered | High | Yes. Exact casing reliably replaces the built-in same-name agent and avoids override ambiguity. |
| How should the original prompt's energy return? | Answered | High | Restore its voice and ritual inside the specialist prompt, surrounded by direct operational boundaries. |
| Are the current tests sufficient? | Answered | High | No. They do not prove a real Plan call or reject unsafe ownership language. |

## Key Findings

### 1. `/plan` needs a concrete Plan invocation

Pi prompt templates turn `.pi/prompts/plan.md` into the `/plan` prompt but do not execute tools themselves. A routing table that merely says “architecture → Plan” is insufficient. The prompt must instruct the parent to make a real `Agent` call.

Use a foreground call because the parent's canonical synthesis depends on the answer. Omit `model` and `thinking`; Plan frontmatter owns configured values. An explicit call instruction establishes the intended workflow, but it remains an LLM-mediated instruction rather than a runtime-level execution guarantee.

### 2. Keep exact `Plan` casing and provide fresh context

Installed `@tintinweb/pi-subagents` is version `0.14.3`. Project agents in `.pi/agents` take precedence over defaults. Invocation lookup is case-insensitive, but overrides are inserted under their exact names, so `.pi/agents/Plan.md` should retain its current capitalization.

`prompt_mode: replace` makes the custom body the child's specialist prompt instead of inheriting project instruction files into that prompt. `inherit_context: false` prevents the parent conversation from being forked into the child. It does not remove the child's configured prompt or project environment. The invocation must therefore include a complete, self-contained task envelope rather than references such as “the current plan” or “what we discussed above.”

### 3. Divide responsibility across three surfaces

#### `.pi/prompts/plan.md` — parent orchestration

- Resolve the active artifact, spec, graph, guards, and approvals.
- Determine discovery level and collect bounded missing evidence.
- Choose among `Plan`, `Explore`, and `scout`.
- Construct and send the resolved Plan envelope.
- Inspect advice, resolve conflicts, and own the final synthesis.
- Write and validate canonical `plan.md` and `tasks.json`.
- Keep `.active`, Git, dependency, destructive-action, and extra-file gates parent-owned.
- Produce the validated `/ship` handoff.

#### `.pi/agents/Plan.md` — advisory specialist

- Hold the specialist identity and relatable planning voice.
- Require a self-contained envelope.
- Perform read-only planning judgment.
- Return a stable advisory schema with one primary recommendation.
- Never write artifacts, mutate lifecycle state, implement code, or schedule nested agents.

#### `.pi/skills/planning-and-task-breakdown/SKILL.md` — reusable doctrine

- Hold blast-radius analysis, vertical slicing, ordering, verification, risks, assumptions, and stop conditions.
- State the parent-synthesis and canonical-ownership invariant.
- Avoid duplicating the complete `/plan` lifecycle or the entire Plan persona.

### 4. Restore the original voice additively

Git commit `86adeee` verifies that the original Plan prompt contained:

- “Planning Guidelines”
- “Architecture as Ritual”
- “Clarity Through Constraint”
- “Simplicity First”
- “A good plan doesn't predict the future; it creates leverage for the builder.”
- “The body is architecture. The breath is wiring. The rhythm is survival.”
- Ground / Calibrate / Transform / Release / Reset
- Reflective “silence pockets”
- “What must be TRUE for the goal to be achieved?”
- “Plans are leverage, not the deliverable.”

Preserve those as identity and reasoning cues. Do not restore wording that permits child writes, nested delegation, ambiguous “leader” ownership, or duplicated lifecycle doctrine. Direct imperative safety rules must outrank metaphor.

### 5. Required Plan advisory envelope

The parent should resolve every field before dispatch:

1. **Task identity:** feature slug, planning round, and one bounded advisory question.
2. **Goal:** outcome-shaped and user-visible.
3. **Inputs:** exact spec, existing-plan, graph, file, and symbol paths.
4. **Constraints:** hard constraints, preferences, dependencies, and prior decisions.
5. **Non-goals:** explicit exclusions.
6. **Acceptance criteria:** questions the advice must settle and required evidence quality.
7. **Discovery state:** level cap, resolved research, and remaining gaps.
8. **Expected output:** one chat-only advisory containing a primary recommendation, observable truths, required artifacts, key links, dependency implications, verification strategy, risks, assumptions, and open decisions.
9. **Stop conditions:** missing evidence, user-authority decisions, missing envelope fields, or scope beyond the named question.
10. **Approval constraints:** read-only inspection; no files, lifecycle, Git, dependency, implementation, destructive, or nested-agent actions.

Use terms such as **advisory plan draft**, **proposed task-graph delta**, or **validation findings**. Do not list `updated plan.md` or `updated tasks.json` as child-produced artifacts.

### 6. Required contract-test improvements

Positive assertions should require:

- A concrete `Agent` example containing `subagent_type: "Plan"`.
- Direct-first routing and all three Plan qualification triggers.
- Foreground use with a resolved advisory envelope.
- Explicit parent-only canonical writes and graph validation.
- Exact Plan frontmatter values where contractually relevant.
- Selected original headings or ritual markers.
- Initial canonical-plan creation distinguished from overwrite and extra-file approvals.

Negative assertions should reject:

- Child-produced `updated plan.md` or `updated tasks.json`.
- Child writes to `plan.md`, `tasks.json`, `progress.md`, `.active`, implementation, Git, or dependencies.
- Nested agents and automatic Plan → Implement → Review choreography.
- Language assigning `.active` switching to `/ship`.

Tests should parse frontmatter and inspect a concrete call shape where practical. Broad alternation regexes that pass when only one vocabulary word appears are inadequate.

## Contradictions and Corrections

1. **Previous research allowed updated canonical files as child artifacts.** This was wrong. It conflicts with parent ownership and is superseded by advisory drafts/proposed deltas.
2. **A Phase 1 claim said an explicit call “guarantees” Plan execution.** Too strong. It is the required prompt instruction, but execution remains LLM-mediated.
3. **Case-insensitive override behavior was overgeneralized.** Invocation lookup is case-insensitive; exact names still matter during override insertion. Keep `Plan.md`.
4. **“Only explicit context” overstated `inherit_context: false`.** It prevents inherited conversation history; the child still has its specialist configuration and project environment.
5. **Current `/plan` assigns `.active` mutation to `/ship`.** Project policy instead makes active-artifact changes exceptional, parent-owned, and approval-gated everywhere.
6. **Current files duplicate planning doctrine.** The three-surface responsibility split is the target architecture, not a description of the current state.

## Recommendation

Adopt an **explicit, foreground, bounded Plan advisory** in `/plan` after guards and evidence gathering. Under current policy, call it for Level 2–3 ambiguity, architecture, or cross-subsystem sequencing and record a short rationale when a complex `/plan` run skips it.

Keep the parent as sole canonical artifact and lifecycle owner. Restore the original voice within `.pi/agents/Plan.md`, consolidate reusable mechanics in the planning skill, and keep `/plan` focused on orchestration. Correct the expected-output and `.active` wording, then replace vocabulary-only tests with behavior and safety-contract assertions.

The active graph currently records Tasks 1–3 as passed and Task 4 as running, but this research identifies material gaps across all three changed surfaces. Before resuming `/ship`, reconcile the graph and attempt evidence through its stale/recovery rules rather than treating Task 4 as verification-only.

## Open Policy Decisions

1. **Mandatory versus conditional Plan use:** Recommended: conditional under current routing policy. Making Plan mandatory for every `/plan` invocation requires an explicit project-policy change.
2. **Initial plan creation authorization:** Recommended: invoking `/plan` authorizes its expected first canonical `plan.md`; overwrite and unrelated extra files remain separately gated.
3. **Voice placement:** Recommended: full ritual voice in `Plan.md`, concise relatable framing in `/plan`, reusable mechanics in the planning skill.

## Sources

1. Pi prompt-template documentation, installed Pi `0.79.4`: `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/prompt-templates.md:5-17,31-33,57-63`; upstream: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/prompt-templates.md
2. pi-subagents `0.14.3`: `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/README.md:152-176,215-231,274-290`; upstream: https://github.com/tintinweb/pi-subagents
3. Agent resolution source: `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/src/agent-types.ts:45-75`
4. Original Plan prompt: Git commit `86adeee`, `.pi/agents/Plan.md:15-78,411-412`, dated 2026-07-25
5. Current Plan agent: `.pi/agents/Plan.md:15-100,285-320`
6. Current `/plan`: `.pi/prompts/plan.md:15-52,109-147,457-469`
7. Planning doctrine: `.pi/skills/planning-and-task-breakdown/SKILL.md:25-99`
8. Parent routing policy: `.pi/agent-tool-description.md:1-29`
9. Project lifecycle policy: `AGENTS.md:178-221`
10. Current contract tests: `.pi/tests/skill-system.test.ts:349-385`