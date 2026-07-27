---
name: development-lifecycle
description: Use only when evaluating whether a repeatedly successful execution pattern should be pruned, stabilized, and promoted into a reusable skill or Fabric workflow. Do not load for ordinary coding tasks.
version: 3.0.0
tags: [workflow-learning, skill-promotion, fabric]
---

# Emergent Workflow Promotion

## Invocation Boundary

Do not load this skill for ordinary implementation, debugging, research, planning, or review. Plain-language work should execute directly through `fabric_exec` using the smallest useful topology.

Load this skill only when:

- the user asks to improve or formalize a repeated workflow;
- two or more comparable runs reveal a recurring decision pattern;
- a repeated failure suggests a reusable guard or recipe may be valuable.

## Core Principle

**Execution comes before choreography.** Let the task reveal its workflow. Promote only the repeated invariant, not the complete history of one successful run.

## Three-Run Learning Loop

### First run — brute force

Get the real outcome safely. Do not invent a reusable pipeline in advance.

Record only useful measurements:

- elapsed time and model/tool turns;
- failed calls and recovery work;
- quality defects or human corrections;
- verification that actually caught something;
- delegation that saved time versus delegation that added handoff cost.

### Second run — selective and tempered

Compare against the first run.

- Remove accidental ordering, duplicated checks, and task-specific prose.
- Keep repeated decision rules, failure boundaries, and proof requirements.
- Test whether a simpler direct `fabric_exec` program performs as well.
- Identify whether zero agents, one specialist, or bounded parallel work was actually useful.

Do not promote yet when the two runs disagree materially.

### Third run — pressure-test and promote

Run the reduced recipe against a representative variation. If it remains useful, codify the smallest durable asset:

| Repeated value | Destination |
|---|---|
| Target-specific behavior | Target code and tests |
| One stable decision or preference | Project memory or local policy |
| General best-practice recipe | Focused skill |
| Finite user-requested fan-out | User-invoked Fabric workflow skill |
| Recurring event-driven responsibility | Fabric actor/template |
| Reviewed implementation exemplar | Pinned project corpus entry |

## Skill Promotion Contract

A promoted skill must state:

1. the scenario that triggers it;
2. the observable outcome;
3. the reusable decision rules;
4. the failure and stop boundaries;
5. the minimum evidence proving it improves behavior;
6. source and applicable-terms records only when copied material is retained; independently rewritten ideas require no provenance ceremony.

Use `writing-skills` for authoring or adapting skill behavior. Use `complex-pattern-adoption` when upstream code or guidance contributes.

## Fabric Topology Rule

Topology is selected at runtime, not embedded by habit:

- zero children for coherent Main execution;
- one child for a valuable independent context or specialist judgment;
- `Promise.all` only for genuinely independent calls;
- user-invoked advanced Fabric skills for councils, RLM, Schema, supervisors, and swarms.

A fixed Plan → Implement → Review chain is not promotable merely because it feels organized.

## Reject Promotion When

- only one run exists;
- value depends on one repository’s names or layout;
- the skill would restate tool documentation;
- the proposed steps did not prevent a measured failure or improve throughput/quality;
- a smaller existing skill already owns the rule;
- the workflow primarily records ceremony rather than changing behavior.

## Result

Return the observed repeated invariant, evidence from comparable runs, what was removed, the chosen destination, and remaining uncertainty. If promotion is premature, say so and keep the learning in the current task receipt.
