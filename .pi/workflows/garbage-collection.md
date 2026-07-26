# Garbage Collection Workflow

A bounded, read-only-first workflow for separating useful project policy from generated state, stale history, duplicate guidance, and dead capability references.

## Invariants

- Inventory before mutation.
- Existing repository commands are evidence; PATH presence alone is not project adoption.
- Never download a scanner implicitly.
- Runtime state is not source history.
- No deletion, rename, untracking, branch/worktree, commit, push, PR, or dependency change without its explicit approval.
- Parent inspection and verification remain authoritative.

## Phase 1: Baseline

Capture:

```bash
git status --short --branch
git rev-parse HEAD
```

Run the narrowest repository-supported retained tests. Record failures before attributing them to cleanup candidates.

## Phase 2: Optional Structural Scanner

Use Fallow only when repository evidence and an executable check both succeed—for example, a checked-in configuration/package script plus an already available binary.

```bash
if command -v fallow >/dev/null 2>&1; then
  fallow --format json --quiet
else
  echo "Fallow unavailable; continuing with native inventory" >&2
fi
```

Do not run `npx fallow`: it can download code and constitutes an unapproved dependency action.

## Phase 3: Native Inventory

Inspect these classes independently:

| Class | Evidence |
|---|---|
| Runtime leakage | Tracked mesh, session, cache, OAuth, trace, active-pointer, or memory-bank files; `.pi/hindsight.json` is configuration while `.pi/hindsight/` is runtime-managed and never cleaned automatically |
| Broken workflow | References to absent paths, commands, tools, or package scripts |
| Policy duplication | Repeated instructions with multiple authorities |
| Skill noise | Overlapping skills, unused packs, oversized startup catalog |
| Artifact growth | Attempt logs or completed task state with no durable decision value |
| Distribution gaps | README, license, CI, bootstrap, package pins, doctor checks |

For genuinely independent classes, the parent may issue at most three read-only `agents.run` calls inside `fabric_exec`, together with `Promise.all`. Process additional classes in sequential shards. Children receive exact scopes and `tools: ["read", "grep", "find", "ls"]`; they do not edit or schedule siblings, and the parent verifies and synthesizes their findings.

## Phase 4: Classify

| Classification | Meaning |
|---|---|
| Keep | Current source of truth with demonstrated use |
| Simplify | Valuable responsibility, excessive implementation or duplication |
| Archive | Durable historical value but not active runtime input |
| Ignore/untrack | Generated local state that should remain on disk only |
| Delete-candidate | No remaining behavior, reference, or historical value |

A delete-candidate report must list exact paths, references checked, behavior/history lost, and the non-destructive alternative.

## Phase 5: Optional Application

Only after the user selects findings and grants each required approval:

1. Apply bounded changes to owned paths.
2. Inspect the complete tracked and untracked worktree diff.
3. Run focused verification, then the retained suite when shared behavior changed.
4. Report remaining candidates separately.

Do not automatically open PRs. Branch, commit, push, and PR creation are distinct user decisions.

## Report

```text
## GC Report — <UTC date>

Baseline: <branch/head/status/tests>

| Finding | Classification | Paths | Evidence | Proposed action | Approval |
|---|---|---|---|---|---|

Estimated reduction: <files/lines/startup context>
Remaining risks: <list>
```
