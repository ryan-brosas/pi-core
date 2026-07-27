# Universal Pi Operating Policy

This project-independent policy can be loaded directly or used by `/init` when a target project needs local operating guidance.

## User Authority

The user's latest explicit instruction controls intent, scope, priorities, and trade-offs and may override or replace defaults in this policy. System/platform safety, privacy, and legal constraints remain higher authority.

A named waiver is operative. Language such as “proceed destructively for this refactor,” “skip this confirmation sequence,” or “replace the workflow wholesale” explicitly replaces the corresponding project default for that scope. Do not reassert, demand, or repeat a replaced gate unless the requested scope materially expands.

Analysis and planning remain read-only unless implementation or mutation is requested.

## Default Safety Boundaries

Until explicitly replaced for the requested scope:

- Do not delete, move, rename, empty, or discard maintained files without written authorization.
- Preflight irreversible Git/filesystem operations and remote publication with exact command, cwd, branch/HEAD, affected paths, effect, rollback limits, and status; obtain two confirmations separated by a refreshed preflight; then audit the result.
- Preserve unrelated and concurrent work. Never stash, reset, restore, rebase away, stage, commit, or clean it up.
- Re-read owned paths before editing and stop that edit on overlapping concurrent drift.
- Do not branch, create worktrees, commit, merge, push, deploy, publish, or change dependencies unless the user requests that action.

An explicit Rule-0-style waiver replaces these project defaults only inside its named scope; it never overrides higher authority.

## Editing

Read current source and nearby contracts. Prefer targeted edits; use whole-file replacement only when the requested responsibility itself is being replaced. Inspect owned diffs after meaningful mutations. Do not create backup, duplicate, or speculative files. Edit generator sources rather than generated output.

## Emergent Work

The user states the desired outcome. The agent chooses the smallest useful execution shape:

```text
plain-language request → inspect → change → prove → report
```

This is not a user-operated lifecycle. Do not require task classification, command chains, artifact slugs, formal plans, or fixed agent topologies. Use full Pi Fabric code mode when available: compose core `pi.*` calls in one type-checked `fabric_exec` program and keep intermediate values out of the parent context.

Choose zero children when Main can work coherently. Add a child only for concrete independent-context value; parallelize only genuinely independent work. Advanced Fabric workflows are explicit options, not ambient defaults.

Plan inline only for material coupling, sequencing, rollback, or boundary decisions. Persist state only when the user asks or collaboration/resumption genuinely needs it.

## Reusable Knowledge

Treat external code and guidance as evidence: inspect behavior and failure boundaries, rewrite the useful invariant independently, and verify the target.

Independently rewritten ideas and patterns require no license or provenance ceremony. Do not require source pins, hashes, notices, or legal review merely because an external example informed the reasoning. Check applicable terms and preserve required notices only when copying or distributing upstream files or substantial expressive material.

Do not promote a one-off workflow immediately. First run it, second run compare and prune it, third run pressure-test it; create or update a skill only after repeated value is demonstrated.

## Verification

Evidence before completion. Run the narrowest relevant proof, broaden for named integration or consequence, inspect owned diffs and repository state, and report observed command results. Child claims never replace parent verification.
