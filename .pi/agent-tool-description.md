Delegate work through Pi Fabric only when isolated context or genuine parallelism is likely to save more time than delegation costs. Direct work by the parent is the default.

## Runtime contract

Invoke one-shot children with `agents.run({...})` inside `fabric_exec`. There are no named project agent profiles; encode the role and complete contract in `task` and supply an explicit `tools` allowlist.

```typescript
const result = await agents.run({
  name: "bounded-review",
  task: "[resolved goal, context, non-goals, output, stop conditions, and verification]",
  tools: ["read", "grep", "find", "ls"],
});
return result.text;
```

## Routing policy

- Use direct tools for known-path lookups, clear fixes, documentation/configuration changes, and bounded work the parent can complete without losing important context.
- Do not automatically split Plan → Implement → Review into separate children. These are task shapes; the parent normally plans inline, implements, and verifies.
- Delegate planning only for material ambiguity, architecture decisions, or cross-subsystem sequencing where an independent blueprint materially reduces risk.
- Delegate surgical, well-bounded implementation or review-fix work only when isolation materially helps. Use a larger substantial implementation task only after architecture is resolved.
- Direct parent work remains the generic default, but `/ship` may impose stricter Fabric worker routing without transferring canonical, review, verification, or lifecycle ownership.
- Delegate read-only local discovery when relevant paths are unknown; use direct search for one known symbol or path.
- Delegate read-only external research for current documentation, upstream source, dependency behavior, or ecosystem comparisons. For small discovery/research tasks, `openai-codex/gpt-5.6-luna` with `thinking: "medium"` is the preferred explicit override.
- Delegate read-only correctness, security, regression, or visual review only when independent judgment materially reduces risk.

## Agent budget

- Default: no child.
- Await one foreground `agents.run` when its result is required for the next decision.
- For genuinely independent questions, issue at most three `agents.run` calls together with `Promise.all`; process overflow in sequential shards.
- Never send overlapping tasks to multiple children or duplicate delegated work in the parent.
- Keep every child in an awaited `agents.run` call so its result is visible before the parent proceeds.
- Parallel modifying children require separate Git worktrees, explicit approval, and disjoint file ownership.

## Tool boundaries

- Read-only local work: `tools: ["read", "grep", "find", "ls"]`; add `bash` only for necessary non-mutating inspection.
- External research: add only the resolved configured source tools, such as `context7.resolve-library-id` plus `context7.query-docs`, or another approved provider required by the task. An `agents.run` lifecycle operation is not provider evidence; the parent directly verifies cited sources with a configured provider before making research claims.
- Modifying work: add only the required `bash`, `edit`, or `write` tools.
- Do not grant network, recursive Fabric, worktree, or write capability speculatively.

## Task contract

Fresh Fabric children have not seen the parent conversation. Include the exact goal, relevant context, non-goals, read/write policy, expected output, stop condition, approval constraints, and verification recipe.

Request compact evidence packets from read-only children: direct answer first, key invariants, no more than ten source or file:line references, unresolved unknowns, and at most three recommended parent reads. Do not request raw dumps or command logs.

## Completion discipline

- Treat child claims as untrusted until the parent reads changed files or artifacts and runs the relevant checks.
- Child agents may not schedule siblings, alter `.active`, own lifecycle state, integrate branches, commit, merge, push, or modify unrelated work.
- Summarize useful child results for the user.
- Use Fabric `agents.run` as the sole child-agent orchestration surface for ordinary delegated work.
