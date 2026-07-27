---
name: planning-and-task-breakdown
description: Use when a clear goal still has material coupling, sequencing, boundary, rollback, or evidence decisions that benefit from a compact executable plan. Skip when the next tested action is obvious.
version: 2.0.0
tags: [planning, boundaries, sequencing]
---

# Planning & Task Breakdown

## When to Use

Use this skill only when one or more remain unresolved:

- material coupling across boundaries;
- dependency or migration order;
- rollback or recovery design;
- ownership conflicts or parallel edit boundaries;
- evidence sequencing where one result changes the next action.

Do not use it for a one-line fix, broad but mechanical work, or to prove that planning happened.

## Default Output

Plan inline in chat. Persist a plan only when the user requests a file or the work genuinely needs cross-session or collaborative handoff.

## Grounding in Full Code Mode

Use one `fabric_exec` program to inspect exact entry points, dependents, public contracts, nearby tests, and repository-supported verification. Keep dependent discovery in that program; parallelize only independent reads.

Use one read-only `agents.run` when an independent blueprint materially improves a consequential decision:

```typescript
const advice = await agents.run({
  name: "planning-advisor",
  task: "Review the named boundary and recommend the smallest dependency-safe execution order. Do not edit files.",
  tools: ["read", "grep", "find", "ls"],
});
return advice.text;
```

The parent verifies evidence and owns the final plan. Do not delegate merely because a plan has multiple steps.

## Compact Planning Method

1. **Goal** — state the observable outcome in one sentence.
2. **Non-goals** — name meaningful exclusions.
3. **Unknowns** — resolve only answers that change behavior or consequence.
4. **Boundaries** — identify public contracts and concrete variance; add a seam only when a real alternative exists.
5. **Slices** — order the smallest vertical, independently verifiable results.
6. **Proof** — name the exact check and controlled failure for each slice.
7. **Rollback** — state how to stop or reverse consequential work.
8. **Conflicts** — identify overlapping paths before parallel modification.

## Inline Plan Shape

```markdown
## Goal
[observable outcome]

## Non-goals
[meaningful exclusions]

## Slices
1. [vertical result] — proof: [command/behavior] — risk: [consequence]
2. ...

## Open decisions
[only decisions that block a slice]

## Stop / rollback
[conflict, failure, or reversal boundary]
```

## Quality Rules

- Prefer vertical behavior over horizontal “setup” layers.
- Lead with the most uncertain consequential decision; mechanical cleanup last.
- File count is not complexity.
- Every slice must create evidence before the next dependent slice starts.
- A plan is advisory and disposable; current source and observed proof remain authoritative.
- If open questions outnumber executable slices, return to one focused clarification rather than expanding the plan.

## Result

Return the compact inline plan, evidence used, unresolved decisions, and why planning was necessary. Do not create coordination files unless explicitly requested.
