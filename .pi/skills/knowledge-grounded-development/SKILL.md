---
name: knowledge-grounded-development
description: Use when creating, generalizing, or adapting code where existing project implementations, Pi extensions, plugins, skills, or reviewed exemplars can provide the behavioral foundation. Prevents surface copying by extracting invariants and rewriting them target-natively with bounded context.
version: 0.1.0
tags: [knowledge, exemplars, adaptation, context]
dependencies: [complex-pattern-adoption, agent-code-quality-gate]
---

# Knowledge-Grounded Development

## Mandate

Code from scratch is cheap; reviewed code you already hold is valuable. Before mutating a non-trivial implementation, inspect the matching specialist skill and the closest working code. Internalize the behavior and failure boundary, then express them in the target's own names, seams, and constraints.

This skill does not pretend to prove private understanding. It requires observable grounding before mutation and lets behavior tests plus duplication analysis judge the result afterward.

## Bounded Retrieval

Context is finite. Do not load the whole repository or copy the first similar file.

1. Use names, imports, events, or public behavior to locate candidates.
2. Select **one to three** closest exemplars.
3. Read the matching skill completely, then only the exemplar source, nearby contract, and focused tests needed to explain the behavior.
4. Stop retrieving when another file would repeat an already-supported invariant rather than change a decision.

Prefer current target source and tests, then installed official contracts, then reviewed project exemplars. A corpus or graph locates candidates; source remains authority.

## Internalize Before Mutation

Write a compact private behavior map before editing:

- **Invariant:** observable behavior worth preserving.
- **Mechanism:** why the exemplar produces that behavior.
- **Target seam:** where the behavior belongs here.
- **Failure boundary:** controlled case that must remain safe.
- **Exclusions:** incidental naming, architecture, formatting, and dependencies not needed by the target.

The map is reasoning, not a mandatory user-facing ceremony. If you cannot state the mechanism without paraphrasing the source line by line, you have not internalized it yet.

## Rewrite Target-Natively

- Preserve the invariant, not the source's surface shape.
- Reuse an existing local abstraction when it already owns the responsibility.
- Keep target naming, types, lifecycle, errors, and test seams.
- Copy small syntax only when syntax itself is the contract; otherwise rewrite independently.
- Do not import an architecture wholesale because one example works.
- Never mutate first and rationalize the reference afterward.

When unchanged upstream bytes are intentionally copied, switch to the copy/integrity mode in `complex-pattern-adoption` rather than presenting them as an independent rewrite.

## Prove the Adaptation

1. Show the target behavior failing or identify equivalent black-box protection before refactoring.
2. Implement the smallest target-native change.
3. Verify success and controlled failure through the target interface.
4. Run the project's duplication check or inspect overlap explicitly.
5. Re-read the owned diff and remove reference-shaped names, wrappers, or branches that the target does not need.

A matching skill read and exemplar read prove grounding occurred. They do not prove quality by themselves. The completion gate remains `agent-code-quality-gate`.

## Stop Conditions

Stop the affected mutation when no relevant exemplar can be found, the exemplar's mechanism cannot be explained, its assumptions conflict with the target, the authoritative source is generated or stale, or the owned path drifted after inspection. Report the missing evidence instead of filling the gap with generic code.

## Result Contract

```xml
<skill_result>
  <skill>knowledge-grounded-development</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Matching skill and bounded exemplars inspected before mutation; target success, controlled failure, and duplication evidence</evidence>
  <artifacts>Target-native source and tests</artifacts>
  <risks>Missing exemplar, misunderstood mechanism, surface duplication, context overflow, or none</risks>
</skill_result>
```
