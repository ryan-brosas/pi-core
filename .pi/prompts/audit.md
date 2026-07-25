---
description: Audit codebase for a specific pattern
argument-hint: "<pattern>"
---

# Audit: $ARGUMENTS

Find all occurrences of a code pattern in the codebase, review each for issues, and produce prioritized remediation recommendations.

> Use for cross-cutting concerns like auth checks, error handling, API patterns, or security vulnerabilities.

## Pi Subagent Routing

When this prompt says to spawn, delegate to, or use an agent, invoke the pi-subagents `Agent` tool; an agent name is not itself a tool. This is not Fabric agent orchestration.

- `Explore`: internal codebase discovery
- `scout`: external documentation and research
- `review`: correctness, security, and regression review
- `general`: small independent implementation
- `Plan`: architecture and executable planning
- Use a foreground call when the next step depends on the result. For independent parallel work, issue all calls together with `run_in_background: true`.
- Omit `model` and `thinking`; agent definitions and scoped-model settings own those choices.
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
   - Phase 1: Spawn 1 `Explore` agent to discover all occurrences
   - Phase 2: Spawn at most three `review` agents for the current disjoint occurrence wave; process remaining occurrences in sequential shards before parent synthesis
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
