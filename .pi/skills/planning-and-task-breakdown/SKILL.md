---
name: planning-and-task-breakdown
description: Use when a feature/change has a spec or clear goal and needs an executable implementation plan.
version: 1.0.0
tags: [workflow, planning, agent-coordination]
dependencies: [spec-driven-development]
tools: [TaskCreate, TaskUpdate, memory, grep, find, read]
---

# Planning & Task Breakdown

## When to Use

- Have a spec, PRD, ADR, or clear feature goal.
- Implementation spans >1 file, >1 session, or >1 worker.
- Need an executable plan a human or bounded Fabric child can follow.

## When NOT to Use

- Single-function fixes; mechanical refactors with obvious verification.
- No spec exists yet — use `brainstorming` first.
- Trivial one-liner with no acceptance criteria.

## Core Principle

**Lead with what is most-likely to change** (data model, type interfaces, UX). Mechanical refactor last. Stable parts of the plan go at the bottom; volatile parts at the top. If a section of the plan survives contact with implementation, it should be at the bottom.

## Blast-Radius Gate

Before slicing, map the change evidence: entry points, direct and transitive dependents, existing tests, public contracts, state or artifact effects, and rollback scope. Record exact files/symbols and uncertainty. If a material dependency or contract cannot be inspected, stop planning that slice rather than guessing its blast radius.

## Workflow

1. **Spec interview** — ask the questions the spec leaves open (data model, edge cases, non-goals, success criteria). One question at a time for non-obvious decisions.
2. **Slice** — break work into vertical (tracer-bullet) slices via `incremental-implementation`. Each slice is independently verifiable.
3. **Order** — most-likely-to-change first, mechanical refactor last. Risk-first when integration is unknown.
4. **Risks + verification** — for each slice, name the verification command and the risk of getting it wrong.
5. **Stop conditions** — for parallel work, define who stops whom on conflict.

## Fabric Planning Inputs

Direct parent planning is the default. Fabric workers provide bounded advisory input; they do not own final synthesis or lifecycle state.

Route only the evidence or judgment that is genuinely missing:

- Use a planning advisory task for material ambiguity, architectural trade-offs, or cross-subsystem sequencing when an independent blueprint materially reduces risk.
- Use direct exact-source inspection first. A configured code graph may supplement it for target-code relationships only after a target-scoped known-symbol health probe; fall back to `read`, `grep`, and `find` when the probe fails.
- When a project corpus exists, use its bounded search for curated implementation exemplars. Corpus examples are pattern evidence, not a current-code impact map, and never replace exact source or tests.
- Use a local-discovery task only for a remaining local evidence gap such as codebase patterns, file structure, references, and tests.
- Use an external-research task for external evidence such as versioned documentation, upstream source, and ecosystem constraints.

When the next planning decision depends on the answer, run one foreground call through `agents.run` inside `fabric_exec`:

```typescript
const planningAdvice = await agents.run({
  name: "planning-advisor",
  tools: ["read", "grep", "find", "ls"],
  task: "[resolved self-contained advisory envelope]",
});
return planningAdvice.text;
```

If local and external evidence questions are genuinely independent, run at most three calls in one `Promise.all` wave and process overflow in sequential shards. Each worker returns advisory output only. The parent verifies worker evidence, inspects cited sources, and resolves conflicts. The parent alone writes canonical `plan.md` and `tasks.json`. The parent owns lifecycle state. Never delegate final synthesis.

## Slice Quality

| Good slice | Bad slice |
|---|---|
| One complete path through all layers | One layer in isolation |
| Independently verifiable (test/build/check passes) | Untestable until all layers done |
| Adds user-visible behavior or fixes a bug | Pure prep with no signal |
| Reverts cleanly | Tangles with unrelated code |

## Plan Template

```
## Goal
[1 sentence]

## Non-goals
[explicit exclusions]

## Boundary Design (conditional)

Include this section only when the feature introduces or changes a module boundary; omit it otherwise.

### Module Boundaries

| Boundary | Hidden decision | Public behavior |
| -------- | --------------- | --------------- |
| [Boundary] | [Decision hidden behind it] | [Externally visible contract] |

### Proposed Seams

| Seam | Substitution need | Enabling point | Real alternative implementation |
| ---- | ----------------- | -------------- | ------------------------------- |
| [Seam] | [Volatile dependency or decision] | [Where selection occurs] | [Alternative that will exist] |

A proposed seam must name all three fields. If any of them is missing, do not add the seam.

## Gray-Box Evidence (conditional)

Black-box and gray-box are verification perspectives, not module-design categories. Include this section only for a named evidence gap at the public boundary, independent of whether the feature changes a module boundary; otherwise omit it.

### Gray-Box Exceptions

| Verification | Internal knowledge used | Why externally observable behavior is insufficient |
| ------------ | ----------------------- | -------------------------------------------------- |
| [Check] | [Implementation knowledge] | [Named evidence gap at the public boundary] |

Gray-box knowledge does not justify mocking internals.

## Slices (ordered)
1. <slice> — verify: <cmd> — risk: <what>
2. ...

## Open questions
[must-resolve before slice N]

## Stop conditions
[who blocks whom, on what]
```

## Red Flags

- Plan starts with "setup" / "scaffold" / "infrastructure" — that's horizontal, not vertical.
- Slice acceptance is "looks right" instead of a concrete command.
- No explicit non-goals — scope will creep.
- Mechanical refactor (rename, reformat) appears in slice 1 — moves the goalposts.
- Risks only listed at the end, not per slice.
- Open questions outnumber slices — spec is incomplete, go back to brainstorming.

## Skill Result Contract

```xml
<skill_result>
  <skill>planning-and-task-breakdown</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Spec gaps filled, slices defined and ordered, verification commands named</evidence>
  <artifacts>Advisory planning input or parent-written plan section</artifacts>
  <risks>Unresolved open questions, unverified slices, or none</risks>
</skill_result>
```
