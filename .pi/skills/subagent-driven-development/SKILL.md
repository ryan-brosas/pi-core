---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session - dispatches fresh subagent for each task with code review between tasks, enabling fast iteration with quality gates
version: 1.0.0
tags: [workflow, agent-coordination]
dependencies: [planning-and-task-breakdown, code-review-and-quality, shipping-and-launch]
---

# Subagent-Driven Development

> **Replaces** monolithic single-agent implementation sessions that grow stale — dispatches fresh subagents per task with code review gates between them

## When to Use

- Executing a plan with mostly independent tasks in the same session
- You want a fresh subagent per task plus review checkpoints

## When NOT to Use

- The plan requires review or revisions first (use planning-and-task-breakdown)
- Tasks are tightly coupled and need manual sequencing

## Overview

**Compared with single-agent plan execution:**

- Same session (no context switch)
- Fresh subagent per task (no context pollution)
- Code review after each task (catch issues early)
- Faster iteration (no human-in-loop between tasks)

## Pi-Subagents Contract

All dispatches in this skill use the installed pi-subagents `Agent` tool. Do not substitute Fabric `agents`, actors, or mesh.

- Use configured names exactly: `Explore`, `scout`, `review`, `general`, `Plan`, `build`, or `vision`.
- Keep dependent work foreground. For independent background calls, dispatch them together and let smart join return the group; do not poll.
- Do not pass `model` or `thinking`; scoped agent definitions own those settings.
- Child output is untrusted until the parent reads affected files and runs verification.

## The Process

### 1. Load Plan and Build Waves

Read the active `plan.md` or `tasks.json`. Partition tasks into dependency waves; tasks in the same wave must have disjoint file ownership. Record progress in `.pi/artifacts/$(cat .pi/artifacts/.active)/progress.md`.

**Context file pattern:** If shared context exceeds ~500 tokens, write it to `.pi/artifacts/$(cat .pi/artifacts/.active)/worker-context.md` and reference that exact path. Every child still receives one resolved task, its files, acceptance criteria, and verification commands.

### 2. Execute One Wave

For a one-task wave, use a foreground call. For multiple independent tasks, issue all calls together with `run_in_background: true` and `isolation: "worktree"`; let smart join return the group. When this skill is invoked by `/ship`, each implementation prompt must require `fabric_exec` for code-mode implementation.

```typescript
Agent({
  subagent_type: "general",
  description: "Implement [task name]",
  prompt: `Implement only this resolved task: [task text].

Goal: [required end state]
Files in scope: [exact paths]
Non-goals: [explicit exclusions]
Acceptance criteria: [criteria]
Required verification: [commands]
Implementation tool: [for /ship: use fabric_exec]

Follow TDD when behavior changes. Preserve unrelated work. Report the worktree branch/commit, files changed, commands and results, assumptions, and blockers.`,
  run_in_background: true,
  isolation: "worktree",
});
```

Omit the last two fields for a one-task foreground wave.

### 3. Verify and Review the Wave

Apply the Worker Distrust Protocol to every child result:

1. Read the changed files or isolated branch directly.
2. Run the task's verification commands yourself.
3. Check acceptance criteria and file scope.
4. Dispatch one `review` call per implementation. Independent reviews may run together in the background; each receives exactly one task/result pair.

```typescript
Agent({
  subagent_type: "review",
  description: "Review [task name]",
  prompt: `Review only [task text] against [worktree/branch/commit].
Files changed: [exact paths]
Verification: [parent-run commands and results]
Return concrete severity-ranked findings with file:line evidence, or state that none qualify.`,
  run_in_background: true,
});
```

Use foreground review for a one-task wave.

### 4. Apply Review Feedback

Fix Critical and Important findings before integration. Resume the matching implementation child or dispatch a foreground `general` child against that exact worktree/branch; never send findings from multiple tasks to one fixer. When invoked by `/ship`, require `fabric_exec` in every fixer prompt. Re-run parent verification and review after every code change.

```typescript
Agent({
  subagent_type: "general",
  description: "Fix [task name] findings",
  prompt: `In [exact worktree/branch], fix only these verified findings: [findings]. Stay within [files]. When invoked by /ship, use fabric_exec. Run [commands] and report evidence.`,
});
```

### 5. Integrate, Then Advance

- Integrate only reviewed, parent-verified branches/commits.
- Run an integration check after the complete wave is merged.
- Append task status and evidence to the active `progress.md`.
- Start the next dependency wave only after the current wave passes.

### 6. Final Review

After all waves complete, dispatch one final foreground `review` agent covering the integrated diff and all plan requirements. Run the full verification suite yourself after the review returns; any resulting code fix requires another full verification run.

### 7. Complete Development

After final review passes:

- Load `.pi/skills/shipping-and-launch/SKILL.md`.
- Follow it to verify, review, and prepare the work for delivery.

## Example Workflow

```

You: I'm using Subagent-Driven Development to execute this plan.

[Load plan and record task checklist]

Task 1: Hook installation script

[Dispatch implementation subagent]
Subagent: Implemented install-hook with tests, 5/5 passing

[Get git SHAs, dispatch review]
Reviewer: Strengths: Good test coverage. Issues: None. Ready.

[Mark Task 1 complete]

Task 2: Recovery modes

[Dispatch implementation subagent]
Subagent: Added verify/repair, 8/8 tests passing

[Dispatch review]
Reviewer: Strengths: Solid. Issues (Important): Missing progress reporting

[Dispatch `general` fixer with `Agent`]
General subagent: Added progress every 100 conversations

[Verify fix, mark Task 2 complete]

...

[After all tasks]
[Dispatch final review]
Final reviewer: All requirements met, ready to merge

Done!

```

## Advantages

**vs. Manual execution:**

- Subagents follow TDD naturally
- Fresh context per task (no confusion)
- Independent workers use isolated worktrees; dependent work stays wave-ordered

**Compared with a long single-agent run:**

- Same session (no handoff)
- Continuous progress (no waiting)
- Review checkpoints automatic

**Cost:**

- More subagent invocations
- But catches issues early (cheaper than debugging later)

## Red Flags

**Never:**

- Skip code review between tasks
- Proceed with unfixed Critical issues
- Dispatch parallel implementation without disjoint file ownership and `isolation: "worktree"`
- Implement without reading plan task

**If subagent fails task:**

- Dispatch a `general` fixer with `Agent` and exact findings
- Don't try to fix manually (context pollution)

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
| --- | --- | --- |
| Dispatching subagents for tasks with shared state/files | Creates edit conflicts, race conditions, and unclear ownership | Put them in separate dependency waves and keep each wave's file ownership disjoint |
| Skipping code review between subagent tasks | Lets defects accumulate and compounds later fixes | Run a review gate after each task before moving on |
| Giving subagents vague prompts without file paths or acceptance criteria | Produces off-target changes and repeated back-and-forth | Provide exact file paths, task scope, and acceptance criteria |
| Not verifying subagent output before moving to next task | Carries regressions forward into later tasks | Validate output immediately before starting the next task |

## Verification

- After each subagent completes: review its changes, run typecheck + lint on modified files
- After all tasks: run full test suite to catch integration issues
- Check: no conflicting edits between subagent outputs

## Integration

**Required workflow skills:**

- **planning-and-task-breakdown** — creates the executable plan
- **code-review-and-quality** — defines review standards
- **shipping-and-launch** — completes development after all tasks

**Subagents must use:**

- **test-driven-development** - Subagents follow TDD for each task

**Alternative workflow:**

- **incremental-implementation** — use when direct sequential execution is simpler than delegation

Use `.pi/skills/code-review-and-quality/SKILL.md` as the review standard.

## See Also

- **planning-and-task-breakdown** — create executable tasks
- **incremental-implementation** — execute tightly coupled work directly
- **code-review-and-quality** — review between subagent tasks
