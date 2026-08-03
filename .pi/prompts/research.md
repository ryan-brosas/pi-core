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

Use one `fabric_exec` program and no child agents.

- Local code: use `pi.*`; use CodeGraphContext only as a locator and verify hits in source.
- Library docs: use Context7.
- Web sources: use OmniRoute or Codex Search.
- Repository documentation: use DeepWiki.

Choose one authoritative route. Add a second only for a material contradiction or high-consequence claim. Cite source URLs, stop when more retrieval cannot change the decision, and return in chat unless the user requests a file.

## Report

Return the decision, confidence, implementation-relevant evidence with citations, alternatives rejected, unresolved risk, and recommended next action.
