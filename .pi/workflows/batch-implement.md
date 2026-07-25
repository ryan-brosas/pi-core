# batch-implement

Execute only a parent-selected ready shard from the authoritative task graph. Each task result is reviewed, then merged. The workflow never schedules from a whole static plan and never changes `.active`.

## Pi Subagent Execution

Use the pi-subagents `Agent` tool, not Fabric agents, actors, or mesh:

```typescript
Agent({
  subagent_type: "<configured name>",
  description: "<short task label>",
  prompt: `<self-contained phase prompt with resolved inputs and output contract>`,
  run_in_background: true, // only for independent concurrent calls
});
```

- Concurrency 1: omit `run_in_background`, consume the foreground result, then continue.
- A concurrent wave contains at most three independent calls. Issue those together with `run_in_background: true`; let smart join return the group. Process additional work in sequential shards and do not poll.
- Do not start a dependent phase until upstream results are available.
- Omit `model` and `thinking`; scoped agent definitions own those settings.
- The parent resolves placeholders before dispatch, synthesizes results, inspects child changes, and runs verification itself.

## Args

- `task_shard` (required) — The parent-selected conflict-free ready shard (one to three canonical task IDs)
- `graph_path` (required) — The explicitly active slug's `tasks.json`; never an all-artifacts report

## Phases

### Phase 1: plan-review

- **Subagent type:** `review`
- **Concurrency:** 1
- **Prompt:**

Review this parent-selected ready shard for task independence: {task_shard}. Verify that its tasks don't edit the same files and match the validated canonical graph. If any tasks have overlapping file dependencies, flag them as conflicts. Return the list of tasks grouped by dependency in this format:

## Independent Tasks (can run in parallel)
- **Task 1:** [description]
  - Files: [list]
- **Task 2:** [description]
  - Files: [list]

## Dependent Tasks (must run sequentially)
- **Task 3:** [description]
  - Depends on: [task names]
  - Files: [list]

Keep each task description under 100 words.

### Phase 2: implement

- **Depends on:** Phase 1
- **Worker type:** `{worker_type}` constrained to `build|general`
- **Routing:** Resolve `general` for a surgical task that normally declares one to three files and has no unresolved architecture, security, or migration decision. Resolve `build` for a larger substantial bounded task with resolved architecture. Stop for a parent decision when unresolved.
- **Concurrency:** One call per task in the current dependency wave (min 1, max 3)
- **Dispatch:** The parent resolves Phase 1 into disjoint `{task_shard}` values and one `{worker_type}` per task. Never send the full task list to every worker. If a dependency wave has more than three tasks, run sequential shards of at most three and return control after each shard.
- **Isolation:** A one-task wave runs foreground without isolation. Multiple background calls and branch or worktree isolation require explicit approval; if approval is absent, stop at a checkpoint.
- **Ship-worker envelope:** Every child receives the task ID and attempt, goal, dependencies, exact files and transient neighborhood, non-goals, acceptance criteria, required `fabric_exec` use, verification commands, stop conditions, approval constraints, and expected result fields. Children must not spawn agents, schedule siblings, mutate `.active`, `tasks.json`, `progress.md`, or lifecycle state, or commit, merge, integrate, or publish work. The parent must inspect actual changes and verify every result.
- **Approval checkpoint:** Explicit approval is required before branch or worktree creation; commit, merge, or integration; dependency installation or new file creation; `.active` or active-artifact mutation; push or deploy; and destructive operations.
- **Prompt:**

Implement only this resolved task: {task_shard}. Worker type: {worker_type}. Apply the complete ship-worker envelope, use `fabric_exec` for code-mode implementation, stay within the exact files, and stop on every envelope stop condition. Do not implement sibling or dependent tasks. Return:

## Task: [name]
- **Worktree/branch or commit:** [value]
- **Files modified:** [list]
- **Tests added:** [list]
- **Verification:** [commands and results]
- **Key changes:** [brief summary]

Keep the summary under 200 words.

### Phase 3: verify

- **Depends on:** Phase 2
- **Subagent type:** `review`
- **Concurrency:** One call per implementation result in the completed shard (min 1, max 3)
- **Dispatch:** Give each reviewer exactly one `{task_shard}` plus its matching `{implementation_result}` and worktree/commit. Dispatch at most three independent reviews together with `run_in_background: true`; process overflow in sequential shards.
- **Prompt:**

Review this task and only its matching implementation: task={task_shard}; implementation={implementation_result}. Check correctness, test coverage, edge cases, type safety, and scope. Return:

## Task: [name]
- **Status:** [pass/fail]
- **Issues:** [list with file:line refs]
- **Recommendations:** [list]

Keep each finding under 100 words.

## Final Merge (Main Agent)

After Phase 3 completes, the parent inspects each passing result and runs its verification directly. Commit, merge, and integration require explicit approval; if approval is absent, stop at a checkpoint without claiming integration. After any authorized integration, rerun task-graph validate and frontier; only that fresh frontier may select the next ready shard.

Ensure:
- No duplicate imports
- Consistent naming conventions
- Proper module boundaries
- No broken imports between modules

Report any merge conflicts or integration issues. Return a summary:

## Merge Summary
- **Tasks merged:** [count]
- **Files modified:** [list]
- **Integration issues:** [list or 'none']
- **Next steps:** [list]

Keep the summary under 500 words.
