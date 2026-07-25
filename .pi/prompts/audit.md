---
description: Audit codebase for a specific pattern
argument-hint: "<pattern>"
---

# Audit: $ARGUMENTS

Find all occurrences of a code pattern in the codebase, review each for issues, and produce prioritized remediation recommendations.

> Use for cross-cutting concerns like auth checks, error handling, API patterns, or security vulnerabilities.

## Fabric Agent Routing

Use `agents.run({...})` inside `fabric_exec` only when delegation saves more context or time than it costs. Direct parent work is the default; there are no named project agent profiles.

- Encode the task role, exact goal, context, non-goals, output contract, stop conditions, approval constraints, and verification in `task`.
- Supply an explicit `tools` allowlist. Local discovery, planning, and review default to `["read", "grep", "find", "ls"]`. External research adds only the required configured network tools; add mutation tools only for approved implementation work.
- Await one foreground `agents.run` when the next decision depends on its result.
- For genuinely independent questions, issue at most three `agents.run` calls in one `Promise.all`; process overflow in sequential shards.
- For small read-only discovery or research, prefer `model: "openai-codex/gpt-5.6-luna"` with `thinking: "medium"` when an explicit override is useful.
- The parent resolves placeholders, inspects child output and changes, synthesizes results, and runs verification itself.
## Parse Arguments

| Argument | Default  | Description                          |
| -------- | -------- | ------------------------------------ |
| Pattern  | required | Code pattern to search for           |

**Examples:**
- `/audit console.log` — Find all console.log statements
- `/audit app.use(` — Find all middleware registrations
- `/audit fetch(` — Find all fetch calls
- `/audit try {` — Find all try-catch blocks

## Execution

This command invokes the `audit-pattern` workflow for multi-agent parallel execution.

### Workflow Execution

1. **Read the workflow:** `.pi/workflows/audit-pattern.md`
2. **Execute all phases:**
   - Phase 1: Run one foreground read-only local-discovery task to find all occurrences
   - Phase 2: Run at most three read-only review tasks in `Promise.all` for the current disjoint occurrence wave; process remaining occurrences in sequential shards before parent synthesis
   - Final synthesis: the parent combines verified findings
3. **Replace placeholders:**
   - `{pattern}` → the pattern from $ARGUMENTS
   - `{phase_N_output}` → actual output from completed phases
4. **Aggregate results** between phases
5. **Persist conditionally:** if `.pi/artifacts/.active` resolves to an existing slug, append under a dated `## Audit: [pattern]` section in its `progress.md`; otherwise return the report directly without writing an artifact

**Announce:** "Auditing codebase for pattern: [pattern]. Invoking audit-pattern workflow."

## Output

Report:

1. **Pattern:** [pattern searched]
2. **Occurrences found:** [count]
3. **Files affected:** [count]
4. **Issues by severity:**
   - Critical: [N]
   - Important: [N]
   - Minor: [N]
5. **Recommended fixes:** [list with file:line refs]
6. **Correct patterns:** [list of occurrences that are already correct]

## Related Commands

| Need              | Command       |
| ----------------- | ------------- |
| Research a topic  | `/research`   |
| Create feature    | `/create`     |
| Ship feature      | `/ship`       |
| Verify gates      | `/verify`     |
