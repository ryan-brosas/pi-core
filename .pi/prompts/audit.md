---
description: Audit codebase for a specific pattern
argument-hint: "<pattern>"
---

# Audit: $ARGUMENTS

Find all occurrences of a code pattern in the codebase, review each for issues, and produce prioritized remediation recommendations.

> Use for cross-cutting concerns like auth checks, error handling, API patterns, or security vulnerabilities.

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
   - Parent completeness gate: the parent must rerun the exact local grep/search variants, reconcile the occurrence count and file set with Phase 1, and inspect every discrepancy
   - Final synthesis: the parent combines verified findings. It must not claim all, exhaustive, or complete coverage when the reconciled search scope or variants remain uncertain
3. **Replace placeholders:**
   - `{pattern}` → the pattern from $ARGUMENTS
   - `{phase_N_output}` → actual output from completed phases
4. **Aggregate results** between phases
5. **Persist conditionally:** return the report in chat by default. Append a dated `## Audit: [pattern]` section only when an explicitly selected or local active slug names incomplete, demonstrably related work; otherwise do not create an artifact.

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
