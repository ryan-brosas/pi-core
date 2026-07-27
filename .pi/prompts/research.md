---
description: Answer a source-backed implementation question
argument-hint: "<question>"
---

# Research: $ARGUMENTS

Answer the smallest decision-bearing question and stop when it has medium-or-higher-confidence support.

## Load guidance

```typescript
const sourceDriven = await pi.read(
  "/home/ryanj/work/projects/pi-core/.pi/skills/source-driven-development/SKILL.md",
);
```

## Execute

Use one `fabric_exec` program to combine relevant local source, official documentation, maintained upstream source/tests, and exact version evidence. Use known provider proxies directly; do not count `agents.run` as source evidence.

Choose the topology from the question:

- direct provider and `pi.*` calls for one bounded question;
- one read-only child when isolated source analysis adds clear value;
- `Promise.all` only for genuinely independent evidence angles.

Prefer current local code and tests, then official versioned sources. Report contradictions instead of silently choosing. Stop when more retrieval would not change the implementation decision.

Research returns in chat by default. Persist only when the user explicitly requests a destination.

## Report

Return the decision, confidence, implementation-relevant evidence with citations, alternatives rejected, unresolved risk, and recommended next action.
