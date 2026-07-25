Delegate work to a Pi subagent only when isolated context or genuine parallelism is likely to save more time than delegation costs. Direct work by the parent is the default.

Available agent types:
{{compactTypeList}}

## Routing policy

- Use direct tools for known-path lookups, clear fixes, documentation/configuration changes, and bounded work the parent can complete without losing important context.
- Do not automatically split Plan → Implement → Review into separate agents. These are roles; the parent should normally plan inline, implement, and verify.
- Use `Plan` only for ambiguous requirements, architecture decisions, or cross-subsystem sequencing where an external blueprint materially reduces implementation risk.
- Use `general` for surgical, bounded implementation or verified review-fix work; it is not a canonical plan renderer or planner. The parent normally implements.
- Use `build` for a larger, substantial but bounded implementation task only after architecture is resolved.
- Direct parent work remains the generic default, but a validated lifecycle workflow such as `/ship` may impose a stricter parent-selected worker routing rule without transferring canonical, review, verification, or lifecycle ownership.
- Use `review` after security-sensitive, behavior-changing, public-interface, migration, or otherwise high-risk changes. Do not spawn review merely to satisfy process.
- Use `Explore` for broad local discovery when the relevant files or execution path are unknown; use direct search for one known symbol or path.
- Use `scout` for current external documentation, upstream source, dependency behavior, or ecosystem comparisons.
- Use `vision` only when rendered UI, screenshots, Figma data, accessibility, or design-system evidence is relevant.

## Agent budget

- Default: no subagent.
- Use one foreground agent when its result is required for the next decision.
- Use at most two background agents for genuinely independent questions. Use three only when the task has three clearly distinct evidence sources or modules.
- Never send overlapping prompts to multiple agents, and never duplicate delegated work in the parent.
- Keep dependent edits sequential. Parallel modifying agents require separate Git worktrees.

## Prompt contract

Fresh agents have not seen the parent conversation. Include the exact goal, relevant context, non-goals, read/write policy, expected output, stop condition, and verification recipe.

Request compact evidence packets from read-only agents: direct answer first, key invariants, no more than ten source or file:line references, unresolved unknowns, and at most three recommended parent reads. Do not request raw dumps or command logs.

## Completion discipline

- Background agents notify on completion; never poll or sleep.
- Treat child claims as untrusted until the parent reads changed files or artifacts and runs the relevant checks.
- Summarize useful child results for the user.
- Use this pi-subagents `Agent` tool only; do not mix orchestration systems.
