---
name: planning-and-task-breakdown
description: Use when a feature/change has a spec or clear goal and needs an executable implementation plan.
version: 1.0.0
tags: [workflow, planning, agent-coordination]
dependencies: [spec-driven-development]
agent_types: [Plan]
tools: [TaskCreate, TaskUpdate, memory, grep, find, read]
---

# Planning & Task Breakdown

## When to Use

- Have a spec, PRD, ADR, or clear feature goal.
- Implementation spans >1 file, >1 session, or >1 worker.
- Need an executable plan a human or subagent can follow.

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

## Pi Subagent Inputs

Direct parent planning is the default. Workers provide bounded advisory inputs; they do not own final synthesis or lifecycle state.

Route only the evidence or judgment that is genuinely missing:

- Use `Plan` for material ambiguity, architectural trade-offs, or cross-subsystem sequencing when an independent blueprint materially reduces risk.
- Use `Explore` for local evidence such as codebase patterns, file structure, references, and tests.
- Use `scout` for external evidence such as versioned documentation, upstream source, and ecosystem constraints.

```typescript
Agent({ subagent_type: "Plan", description: "Advise on one planning decision", prompt: "[resolved self-contained advisory envelope]" });
Agent({ subagent_type: "Explore", description: "Map local patterns", prompt: "[self-contained local question; require file:line evidence]" });
Agent({ subagent_type: "scout", description: "Research external constraints", prompt: "[self-contained external question; require authoritative citations]" });
```

Use a foreground call when the answer blocks parent synthesis. If local and external questions are genuinely independent, issue both together with `run_in_background: true` and let smart join return them.

The parent verifies worker evidence and resolves conflicts. The parent alone writes canonical `plan.md` and `tasks.json`. The parent owns lifecycle state. Never delegate final synthesis.

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
