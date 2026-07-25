# batch-implement

Take a plan with independent tasks and dispatch one subagent per task in parallel. Each task result is reviewed, then merged. Use for multi-file feature implementation where tasks don't share file dependencies.

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
- Concurrency >1 or dynamic: issue all independent calls together with `run_in_background: true`; let smart join return the group. Do not poll.
- Do not start a dependent phase until upstream results are available.
- Omit `model` and `thinking`; scoped agent definitions own those settings.
- The parent resolves placeholders before dispatch, synthesizes results, inspects child changes, and runs verification itself.

## Args

- `plan` (required) — The implementation plan or PRD

## Phases

### Phase 1: plan-review

- **Subagent type:** `review`
- **Concurrency:** 1
- **Prompt:**

Review this implementation plan for task independence: {plan}. Verify that the tasks don't edit the same files. If any tasks have overlapping file dependencies, flag them as conflicts. Return the list of tasks grouped by dependency in this format:

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
- **Subagent type:** `general`
- **Concurrency:** One call per task in the current dependency wave (min 1, max 10)
- **Dispatch:** The parent resolves Phase 1 into disjoint `{task_shard}` values. Never send the full task list to every worker.
- **Isolation:** For a wave with multiple tasks, every call uses `run_in_background: true` and `isolation: "worktree"`. A one-task wave runs foreground without isolation.
- **Prompt:**

Implement only this resolved task: {task_shard}. When invoked from `/ship`, use `fabric_exec` for code-mode implementation. Follow project conventions, add behavior tests, and stay within the listed files. Do not implement sibling or dependent tasks. Return:

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
- **Concurrency:** One call per implementation result in the completed wave
- **Dispatch:** Give each reviewer exactly one `{task_shard}` plus its matching `{implementation_result}` and worktree/commit. Dispatch independent reviews together with `run_in_background: true`.
- **Prompt:**

Review this task and only its matching implementation: task={task_shard}; implementation={implementation_result}. Check correctness, test coverage, edge cases, type safety, and scope. Return:

## Task: [name]
- **Status:** [pass/fail]
- **Issues:** [list with file:line refs]
- **Recommendations:** [list]

Keep each finding under 100 words.

## Final Merge (Main Agent)

After Phase 3 completes, inspect each passing worktree/commit, run its verification directly, and integrate only verified results. Resolve the next dependency wave only after the current wave is merged and integration checks pass.

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
