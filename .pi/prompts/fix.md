---
description: Reproduce and fix a bug or failing test
argument-hint: "<bug, error, or failing command>"
---

# Fix: $ARGUMENTS

Resolve the reported failure end to end. Do not turn the repair into a lifecycle or planning exercise.

## Load reusable guidance

Inside the first `fabric_exec` program, load only the relevant skills:

```typescript
const [tracing, tdd, verification] = await Promise.all([
  pi.read("/home/ryanj/work/projects/pi-core/.pi/skills/root-cause-tracing/SKILL.md"),
  pi.read("/home/ryanj/work/projects/pi-core/.pi/skills/test-driven-development/SKILL.md"),
  pi.read("/home/ryanj/work/projects/pi-core/.pi/skills/verification-before-completion/SKILL.md"),
]);
```

## Execute

Use one Fabric program where practical:

1. reproduce the exact symptom;
2. trace it to the earliest incorrect state;
3. add the smallest observable failing regression check;
4. apply the minimal root-cause fix;
5. rerun the reproduction, focused check, and affected repository gate;
6. inspect the owned diff.

Use zero children by default. Add one read-only `agents.run` only when cross-subsystem ambiguity or independent regression review has concrete value.

## Report

Return the root cause with file:line evidence, changed paths, exact verification results, and remaining risk. Do not commit or publish unless requested.
