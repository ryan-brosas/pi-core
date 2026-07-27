---
description: Inventory repository drift and propose bounded cleanup
argument-hint: "[scope] [--apply]"
---

# Garbage Collection: $ARGUMENTS

Inventory structural drift, distinguish maintained source from runtime/history, and propose the smallest useful cleanup. Default behavior is read-only.

## Load guidance

```typescript
const [workspace, verification] = await Promise.all([
  pi.read("/home/ryanj/work/projects/pi-core/.pi/skills/organize-workspace/SKILL.md"),
  pi.read("/home/ryanj/work/projects/pi-core/.pi/skills/verification-before-completion/SKILL.md"),
]);
```

Load `fallow` only when it is already installed or repository-configured.

## Execute

In one `fabric_exec` program, inspect branch/HEAD/status, repository verification, tracked runtime state, broken references, duplicate policy, dead skill/prompt surfaces, and missing reproducibility or publication metadata.

Classify findings as `keep`, `simplify`, `archive`, `ignore/untrack`, or `delete-candidate`. `--apply` authorizes bounded fixes inside the requested scope but does not imply commit, push, deployment, or dependency installation.

Use a child only when one independent inventory angle is large enough to justify isolated context. Main reconciles and verifies all findings.

## Report

Return baseline state, findings by severity/classification, exact affected paths, expected reduction, rollback, and any action that still needs user intent.
