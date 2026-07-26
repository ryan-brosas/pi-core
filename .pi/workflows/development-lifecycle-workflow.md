# development-lifecycle-workflow

Optional, bounded, one-shot Fabric-agent helper for a parent-selected, parent-controlled case. It is not the canonical lifecycle and should not be used when approach research is already resolved. It does not loop or cycle, trigger any next phase or command automatically, or mutate `.active` or other active state.

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

- `feature` (required) — The feature or change to implement

## Phases

### Phase 1: Research Approaches

- **Fabric task role:** `external-research`
- **Concurrency:** Dynamic (one `agents.run` call per parent-defined research angle, min 1, max 3)
- **Dispatch:** The parent defines distinct `{angle}` values such as local fit, ecosystem precedent, operational risk, or simplest viable design. Each research child receives one angle only.
- **Prompt:**

Research this angle for implementing {feature}: {angle}. Analyze technical feasibility, trade-offs, complexity, dependencies, and constraints. Return findings in this format:

## Approach 1: [name]
- **Description:** [summary]
- **Pros:** [list]
- **Cons:** [list]
- **Complexity:** [low/medium/high]
- **Risks:** [list]

Keep each approach under 300 words.

### Phase 2: Validate Requirements

- **Depends on:** Phase 1
- **Fabric task role:** `read-only-review`
- **Concurrency:** 1
- **Prompt:**

Review the complete joined research result: {phase_1_output}. Validate the requirements and constraints for each approach. Check for:
1. Technical accuracy
2. Feasibility given project constraints
3. Alignment with existing patterns
4. Missing considerations

Return validated requirements in this format:

## Validated Requirements
- **Approach 1:** [validated requirements]
- **Approach 2:** [validated requirements]
- **Approach 3:** [validated requirements]

## Recommendations
- **Recommended approach:** [which approach and why]
- **Critical constraints:** [list]

Keep each section under 200 words.

### Phase 3: Create Implementation Plan

- **Depends on:** Phase 2
- **Fabric task role:** `planning-advisory`
- **Concurrency:** 1
- **Prompt:**

Based on the validated requirements: {phase_2_output}, create a detailed implementation plan for the recommended approach. Break down into independent tasks that can be implemented in parallel.

Return the plan in this format:

## Implementation Plan

### Overview
[Brief description of the approach]

### Tasks
- **Task 1:** [description]
  - Files: [list]
  - Dependencies: [none or task names]
- **Task 2:** [description]
  - Files: [list]
  - Dependencies: [none or task names]

Keep each task description under 100 words.

### Parent Plan Gate

The planning child result is a candidate, not the final plan. The parent checks it against the original feature request, resolved constraints, project evidence, file ownership, and verification requirements; then the parent edits or accepts the final plan before Phase 4.

### Phase 4: Parallel Implementation

- **Depends on:** Phase 3
- **Workflow:** batch-implement
- **Args:** parent-approved plan from the Parent Plan Gate

Execute the batch-implement workflow with the parent-approved implementation plan. It inherits the same at-most-three concurrent wave ceiling and processes overflow in sequential shards. This will:
1. Review the plan for task independence
2. Implement tasks in parallel
3. Verify each implementation
4. Merge the results

### Phase 5: Verify Different Aspects

- **Depends on:** Phase 4
- **Fabric task role:** `read-only-review`
- **Concurrency:** 3 (one per aspect: correctness, code-quality, performance-security)
- **Dispatch:** Resolve three distinct `{aspect}` values—`correctness`, `code-quality`, and `performance-security`—and issue the three `agents.run` calls together with `Promise.all`. Each call receives one aspect only.
- **Prompt:**

Verify this implementation for the assigned aspect only: aspect={aspect}; implementation={phase_4_output}. Apply only the matching checklist below; do not duplicate the other reviewers.

**Correctness**
- Verify all requirements are met
- Check for logic errors
- Validate edge cases

**Reviewer 2: Code Quality**
- Check for code style and patterns
- Identify code smells
- Verify test coverage

**Reviewer 3: Performance & Security**
- Check for performance bottlenecks
- Identify security vulnerabilities
- Validate error handling

Return findings in this format:

## Aspect: [correctness/code-quality/performance-security]
- **Status:** [pass/fail]
- **Issues:** [list with file:line refs]
- **Recommendations:** [list]

Keep each finding under 150 words.
