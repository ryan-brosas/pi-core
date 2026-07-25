# audit-pattern

Find all occurrences of a code pattern in the codebase, review each match for correctness/security/edge-cases, and produce prioritized remediation recommendations. Use for cross-cutting concerns like auth checks, error handling, or API patterns.

## Fabric Agent Execution

Run one-shot children with `agents.run({...})` inside `fabric_exec`; there are no named project agent profiles:

```typescript
const result = await agents.run({
  name: "bounded-worker",
  task: "[resolved self-contained phase goal, context, non-goals, output, stop conditions, and verification]",
  tools: ["read", "grep", "find", "ls"],
});
return result.text;
```

- Await one foreground run when its result is required by the next phase.
- A concurrent wave contains at most three genuinely independent `agents.run` calls issued together with `Promise.all`; process additional work in sequential shards.
- Do not start a dependent phase until upstream results are available.
- Use an explicit `tools` allowlist per phase. External research adds only the required configured network source tools; add `bash`, `edit`, or `write` only for approved modifying work.
- The parent resolves placeholders, synthesizes results, inspects child changes, and runs verification itself.
## Args

- `pattern` (required) — The code pattern to search for

## Phases

### Phase 1: discover

- **Fabric task role:** `local-discovery`
- **Concurrency:** 1
- **Prompt:**

Search the codebase for the pattern: {pattern}. Use grep or csearch to find every occurrence. List each file with line numbers, grouped by subdirectory. If the pattern has common variations, include those too. Return results in this format:

## Directory: [path]
- `file.ts:42` — [brief context]
- `file.ts:87` — [brief context]

Keep each entry under 50 words.

### Phase 2: audit

- **Depends on:** Phase 1
- **Fabric task role:** `read-only-review`
- **Concurrency:** Dynamic (one disjoint occurrence shard per agent, min 1, max 3)
- **Dispatch:** The parent partitions Phase 1 into non-overlapping `{occurrence_shard}` values and issues at most three calls for the current wave. Never send the complete occurrence list to every reviewer. Join and inspect each wave, then continue remaining occurrences in sequential shards before synthesis.
- **Prompt:**

Review only this occurrence shard for the pattern '{pattern}': {occurrence_shard}. For each occurrence check: correctness, edge cases, security implications, error handling, and adherence to project conventions. Return findings in this format:

## File: [path:line]
- **Severity:** [critical/important/minor]
- **Issue:** [description]
- **Recommendation:** [fix suggestion]

Keep each finding under 100 words.

## Final Synthesis (Main Agent)

After Phase 2 completes, synthesize the audit findings directly from {phase_2_output}.

Produce:
1. **Issues ranked by severity** — Critical, important, minor with file:line references
2. **Affected scope** — Count of files and occurrences
3. **Recommended fixes** — Specific fix suggestions per issue
4. **Correct patterns** — Patterns that are already correct and should be preserved

Group findings by subdirectory. Keep the report under 1500 words.
