---
description: Audit a cross-cutting code pattern
argument-hint: "<pattern or concern>"
---

# Audit: $ARGUMENTS

Find the bounded occurrence set, assess it consistently, and return prioritized evidence. The audit is read-only unless the user also asks for fixes.

## Load guidance

```typescript
const review = await pi.read(
  "/home/ryanj/work/projects/pi-core/.pi/skills/code-review-and-quality/SKILL.md",
);
```

Load `fallow` only when deterministic static analysis is useful and already available.

## Execute

Use one `fabric_exec` program to run exact `pi.grep`/`pi.find` variants, normalize occurrences, inspect representative and high-risk paths, and reconcile the final file/count set.

Use zero children for a bounded repository. For a large disjoint occurrence set, run independent read-only reviewers through `agents.run` in `Promise.all`, then have Main rerun the search and reconcile every discrepancy. Do not claim exhaustive coverage when search scope remains uncertain.

## Report

Return:

1. search boundary and occurrence count;
2. severity-ranked findings with file:line evidence;
3. correct examples worth preserving;
4. recommended fixes and their likely blast radius;
5. uncertainty or excluded scope.

Persist only when the user explicitly requests a destination.
