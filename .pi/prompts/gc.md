---
description: Inventory repository drift and propose bounded cleanup
argument-hint: "[scope] [--apply]"
---

# Garbage Collection: $ARGUMENTS

Inventory structural drift, distinguish source from runtime/history, and propose the smallest safe cleanup. The default is read-only.

## Load Skills

```typescript
read(".pi/skills/fallow/SKILL.md");
read(".pi/skills/verification-before-completion/SKILL.md");
read(".pi/workflows/garbage-collection.md");
```

## Modes

| Mode | Behavior |
|---|---|
| default | Read-only inventory and recommendation |
| `--apply` | Apply only explicitly approved, bounded non-destructive fixes |

`--apply` is not deletion, branch, worktree, commit, push, PR, dependency-installation, or deployment approval. Those actions retain their separate gates.

## Execution

1. Record branch, HEAD, and worktree status.
2. Run the repository's existing verification commands.
3. Run Fallow only when it is already installed or repository-configured and executable. Never use `npx` to download it implicitly.
4. Inspect:
   - tracked runtime/session state;
   - `.pi/hindsight.json` as configuration while treating `.pi/hindsight/` as runtime-managed state that is never cleaned automatically;
   - stale active pointers and lifecycle evidence;
   - broken internal references and unavailable commands;
   - skill catalog overlap and startup routing cost;
   - duplicated prompt/workflow policy;
   - missing README, CI, license, and reproducible package configuration.
5. Classify every finding as `keep`, `simplify`, `archive`, `ignore/untrack`, or `delete-candidate`.
6. For deletion candidates, provide the exact path list, dependency/reference checks, lost behavior/history, and a non-destructive alternative. Wait for written path-scoped permission.
7. If `--apply` was supplied, edit only already-approved paths and rerun relevant verification.

Use direct parent inspection by default. At most three genuinely independent read-only questions may be delegated through `agents.run` inside `fabric_exec` in one Fabric wave; process overflow in sequential shards. The parent verifies and synthesizes all findings.

## Output

1. Baseline and verification status
2. Findings by severity and classification
3. Exact proposed path actions
4. Expected context/repository reduction
5. Risks and rollback
6. Approvals required for the next step

Do not create `.pi/QUALITY.md`, GC artifacts, branches, commits, or PRs merely to record the inventory.

## Related Commands

| Need | Command |
|---|---|
| Full verification | `/verify all --full` |
| Cross-cutting audit | `/audit <pattern>` |
