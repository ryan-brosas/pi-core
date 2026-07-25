---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session - dispatches fresh Fabric children for bounded tasks with parent-owned review and verification gates
version: 1.0.0
tags: [workflow, agent-coordination]
dependencies: [planning-and-task-breakdown, code-review-and-quality, shipping-and-launch]
---

# Fabric-Agent-Driven Development

> **Replaces** monolithic implementation sessions that grow stale by dispatching fresh, bounded Fabric children while the parent owns review and verification gates

## When to Use

- Executing a plan with mostly independent tasks in the same session
- You want a fresh Fabric child per task plus review checkpoints

## When NOT to Use

- The plan requires review or revisions first (use planning-and-task-breakdown)
- Tasks are tightly coupled and need manual sequencing

## Direct-First Routing

- **Zero agents:** surgical work the parent can implement and verify without losing context.
- **One agent:** a bounded specialist question, behavioral trial, or isolated task with clear value.
- **Two or three agents:** genuinely independent scopes with disjoint files or evidence angles.
- **More work:** process additional scopes in sequential shards; every concurrent wave has at most three agents.

Delegation is a cost, not a default. The parent retains synthesis, file inspection, integration, and verification.

## Pi Fabric Contract

All delegated work in this skill uses `agents.run` inside `fabric_exec` with a self-contained task and explicit `tools` allowlist.

- Route by task shape, not a persistent profile: read-only discovery, read-only review, surgical implementation, or substantial bounded implementation.
- Keep dependent work foreground and sequential.
- For genuinely independent work, run at most three calls in one `Promise.all` wave; process overflow in sequential shards.
- Parallel modifying calls require disjoint ownership, `worktree: true`, and explicit worktree approval.
- Child output is untrusted until the parent inspects affected files and runs verification.

## The Process

### 1. Load the Validated Ready Shard

Read the explicitly active `tasks.json`, validate it, and consume only the parent-selected validated ready shard. `tasks.json` owns scheduling; plan waves are explanatory snapshots. Children must not schedule graph nodes, recompute sibling work, or change `.active`. Record progress in the active `progress.md`.

Every implementation child receives a complete **ship-worker envelope**, the canonical `task_brief`, with: task ID and attempt, goal, dependencies, exact files and transient neighborhood, non-goals, acceptance criteria, required `fabric_exec` use, verification commands, stop conditions, approval constraints, and expected result fields. The child returns assumptions, blockers, changed files, commands, observed evidence, and unresolved risks. Reject incomplete envelopes instead of inferring fields. Children must not spawn agents, schedule siblings, mutate `.active`, `tasks.json`, `progress.md`, or lifecycle state, or commit, merge, integrate, or publish work. The parent must inspect actual changes and verify every result.

If shared context exceeds ~500 tokens, put bounded supporting context in the active `worker-context.md` and reference it; this optional handoff is not canonical state.

### 2. Execute One Ready Shard

Choose the task shape from the resolved scope: surgical implementation for a small, well-bounded edit; substantial bounded implementation for a larger task whose architecture is already resolved. Stop for a parent decision when architecture, security, migration, or scope remains unresolved.

For a one-task validated ready shard, use one foreground call. Multiple modifying calls and branch or worktree isolation require explicit approval; if approval is absent, stop at a checkpoint. Explicit approval is also required before adding a dependency or new file, changing `.active` or an active artifact, or committing, merging, integrating, pushing, deploying, or running destructive actions. Every `/ship` implementation or fix receives the complete ship-worker envelope and explicit tools.

```typescript
const implementation = await agents.run({
  name: `ship-${taskId}`,
  task: shipWorkerEnvelope,
  tools: ["read", "grep", "find", "ls", "bash", "edit", "write"],
});
return implementation.text;
```

Only after explicit worktree approval, run at most three disjoint calls in one `Promise.all` wave with `worktree: true`; integrate that wave before processing overflow in sequential shards.

### 3. Verify and Review the Wave

Apply the Worker Distrust Protocol to every child result:

1. Read the changed files or isolated branch directly.
2. Run the task's verification commands yourself.
3. Check acceptance criteria and file scope.
4. Run one read-only Fabric review per implementation. Each receives exactly one task/result pair.

```typescript
const reviewResult = await agents.run({
  name: `review-${taskId}`,
  tools: ["read", "grep", "find", "ls"],
  task: `Review only [task text] against [worktree/branch/commit].
Files changed: [exact paths]
Verification: [parent-run commands and results]
Return concrete severity-ranked findings with file:line evidence, or state that none qualify.`,
});
return reviewResult.text;
```

Use one foreground review for a one-task wave. At most three independent reviews may run in one `Promise.all` wave; process overflow in sequential shards.

### 4. Apply Review Feedback

Fix Critical and Important findings before integration. Run one foreground modifying Fabric child against the matching worktree or files; never send findings from multiple tasks to one fixer. The fix task must use `fabric_exec`, include a complete ship-worker envelope, and declare explicit tools. Re-run parent verification and review after every code change.

```typescript
const fixResult = await agents.run({
  name: `fix-${taskId}-${findingId}`,
  task: fixEnvelope,
  tools: ["read", "grep", "find", "ls", "bash", "edit", "write"],
});
return fixResult.text;
```

At most three disjoint fixes may run in one `Promise.all` wave with `worktree: true` after explicit approval; process all other fixes in sequential shards.

### 5. Integrate, Then Advance

- Commit, merge, and integration require explicit approval; if approval is absent, stop at a checkpoint without claiming the action.
- Integrate only reviewed, parent-verified work after approval.
- Run an integration check after the complete wave is merged.
- Append task status and evidence to the active `progress.md`.
- Return control to the parent after the shard passes; the parent reruns validation and frontier selection before any next shard.

### 6. Final Review

After all waves complete, run one final foreground read-only Fabric review covering the integrated diff and all plan requirements. The parent inspects its findings and runs the full verification suite after the review returns; any resulting code fix requires another full verification run.

### 7. Complete Development

After final review passes:

- Load `.pi/skills/shipping-and-launch/SKILL.md`.
- Follow it to verify, review, and prepare the work for delivery.



## Red Flags

**Never:**

- Skip code review between tasks
- Proceed with unfixed Critical issues
- Dispatch parallel implementation without disjoint file ownership, explicit approval, and `worktree: true`
- Implement without reading plan task

**If a Fabric child fails a task:**

- Validate the failure, then run a bounded foreground fixer with exact findings and explicit tools
- Keep lifecycle state and verification parent-owned

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
| --- | --- | --- |
| Dispatching Fabric children for tasks with shared state/files | Creates edit conflicts, race conditions, and unclear ownership | Put them in separate dependency waves and keep each wave's file ownership disjoint |
| Skipping code review between delegated tasks | Lets defects accumulate and compounds later fixes | Run a review gate after each task before moving on |
| Giving children vague tasks without file paths or acceptance criteria | Produces off-target changes and repeated back-and-forth | Provide exact file paths, task scope, and acceptance criteria |
| Not verifying child output before moving to the next task | Carries regressions forward into later tasks | Validate output immediately before starting the next task |

## Verification

- After each Fabric child completes: inspect its changes, then run typecheck and lint on modified files
- After all tasks: run the full test suite to catch integration issues
- Check that no Fabric child outputs contain conflicting edits

## Integration

**Required workflow skills:**

- **planning-and-task-breakdown** — creates the executable plan
- **code-review-and-quality** — defines review standards
- **shipping-and-launch** — completes development after all tasks

**Fabric children must use:**

- **test-driven-development** — implementation children follow TDD for each behavior-changing task

**Alternative workflow:**

- **incremental-implementation** — use when direct sequential execution is simpler than delegation

Use `.pi/skills/code-review-and-quality/SKILL.md` as the review standard.

## See Also

- **planning-and-task-breakdown** — create executable tasks
- **incremental-implementation** — execute tightly coupled work directly
- **code-review-and-quality** — review between delegated tasks
