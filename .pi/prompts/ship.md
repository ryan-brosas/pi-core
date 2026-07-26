---
description: Ship a plan - implement specs, verify, review, close
---

# Ship

Execute spec tasks, verify each passes, run review, mark complete.

> **Workflow:** `/create` → **`/ship`**

## Fabric Agent Routing

Use `agents.run({...})` inside `fabric_exec` only when delegation saves more context or time than it costs. Direct parent work is the default; there are no named project agent profiles.

- Encode the task role, exact goal, context, non-goals, output contract, stop conditions, approval constraints, and verification in `task`.
- Supply an explicit `tools` allowlist. Local discovery, planning, and review default to `["read", "grep", "find", "ls"]`. External research adds only the required configured network tools; add mutation tools only for approved implementation work.
- Await one foreground `agents.run` when the next decision depends on its result.
- For genuinely independent questions, issue at most three `agents.run` calls in one `Promise.all`; process overflow in sequential shards.
- For small read-only discovery or research, prefer `model: "openai-codex/gpt-5.6-luna"` with `thinking: "medium"` when an explicit override is useful.
- The parent resolves placeholders, inspects child output and changes, synthesizes results, and runs verification itself.
### Implementation Worker Routing

- Use a surgical Fabric task envelope for work that normally declares one to three files and has no unresolved architecture, security, or migration decision.
- Use a larger substantial but still bounded task envelope only after architecture is resolved.
- Stop for a parent decision when architecture, security, migration, scope, or approval is unresolved; do not hide that decision in tool selection.
- One selected task uses one foreground `agents.run` call. Two or three disjoint tasks may use the parent-selected batch workflow after explicit isolation approval; process overflow in sequential shards.

### Primary Worker Dispatch

If any unresolved architecture, security, migration, scope, or approval question remains, stop before worker selection.

Otherwise, the parent resolves the smallest sufficient tool allowlist for the bounded task. For one selected task, invoke one foreground Fabric worker with the complete ship-worker envelope:

```typescript
const workerTools = ["read", "grep", "find", "ls", "bash", "edit", "write"];
const implementation = await agents.run({
  name: `ship-${taskId}`,
  task: shipWorkerEnvelope,
  tools: workerTools,
});
return implementation.text;
```

## Implementation Tooling

During `/ship`, use `fabric_exec` as the orchestration boundary and `agents.run` for bounded child execution.

- Await one foreground child by default.
- Issue at most three approved, disjoint Fabric runs together with `Promise.all`; process overflow in sequential shards.
- Give each child an explicit task-specific tool allowlist and no speculative recursive or worktree capability.
- Parent review, lifecycle state, integration decisions, and verification remain parent-owned.

### Ship-Worker Envelope

Every implementation or fix child receives a resolved **ship-worker envelope** containing the task ID and attempt, goal, dependencies, exact files and transient neighborhood, non-goals, acceptance criteria, explicit tools, verification commands, stop conditions, approval constraints, and expected result fields. Never send unresolved placeholders.

- **Parent-provided task-relevant Hindsight context:** include only relevant prior decisions. If context is missing, the child returns the context gap to the parent instead of broadening memory access.

Children must not spawn or delegate to another agent, schedule siblings, mutate `.active`, `tasks.json`, `progress.md`, or other lifecycle state, or commit, merge, integrate, or publish work. The `/ship` parent owns `tasks.json` and `progress.md` updates—graph transitions and progress recording—as normal operation; these are not child operations and are not gated by the child approval checkpoints. Mutating `.active` is an exceptional operation that requires explicit approval even for the parent.

Explicit approval is required before branch or worktree creation; commit, merge, or integration; dependency installation or new file creation; `.active` or unrelated active-artifact mutation; push or deploy; and destructive operations. When required approval is absent, stop at a checkpoint and preserve the verified work.

## Load Skills

```typescript
read(".pi/skills/verification-before-completion/SKILL.md");
```

## Before You Ship

- **Be certain**: Only ship if all tasks pass verification
- **Don't skip gates**: Build, test, lint, typecheck are non-negotiable
- **Run the review**: Always run an independent read-only Fabric review before closing
- **Verify goals**: Tasks completing ≠ goals achieved (use goal-backward verification)
- **Approval before Git actions**: Per-task commit, merge, and integration occur only after explicit approval; otherwise stop at a checkpoint
- **Ask before closing**: Never close without user confirmation

## Available Tools

| Tool or Fabric surface | Use When                                      |
| ---------------------- | --------------------------------------------- |
| `agents.run`           | Bounded planning, research, review, or edits |
| `Promise.all`          | At most three independent Fabric runs       |
| `lsp`                  | Finding symbol definitions and references   |
| `grep`                 | Finding code patterns                       |
| `fabric_exec`          | Parent orchestration and batched execution  |

## Phase 1: Guards

### Context Search

Use automatically recalled Hindsight project context first for failed approaches and prior decisions. If a material gap remains, call `hindsight_recall` with a topic-bounded query; use `hindsight_reflect` only when synthesis across memories is required.

### Plan Validation

Verify:

- `.pi/artifacts/$(cat .pi/artifacts/.active)/spec.md` exists (if not, tell user to run `/create` first)

Check what artifacts exist:

Read `.pi/artifacts/$(cat .pi/artifacts/.active)/` to check what artifacts exist (spec.md, plan.md, etc.).

### Workspace Setup

Inspect the current workspace without mutating it. Branch or worktree creation, dependency installation, and new file creation require explicit approval; when needed but unauthorized, stop at a checkpoint.

## Phase 2: Validate the Canonical Graph

Resolve the explicitly active slug and set `GRAPH=.pi/artifacts/$SLUG/tasks.json`. Run `task-graph validate` with `node --experimental-strip-types .pi/scripts/task-graph.ts validate "$GRAPH"` before routing or editing. Malformed or invalid graphs stop with their machine-readable issues.

If `plan.md` exists, compare its task IDs with the authoritative graph. Any task ID divergence is a stop condition; never infer execution state from a derived wave snapshot. `frontier --all` is read-only visibility only, requires an explicit slug selection, never changes `.active`, and never dispatches work.

## Phase 3: Dynamic Frontier Execution

1. Run `task-graph frontier` with `node --experimental-strip-types .pi/scripts/task-graph.ts frontier "$GRAPH"`.
2. Handle no-ready states exactly: `complete` proceeds to verification; `running` reports active work; `blocked` reports unmet dependency reasons; `intervention_required` reports failed, blocked, or stale IDs; `invalid` stops.
3. Execute only the returned conflict-free `selected` shard. One selected task uses one foreground `agents.run` call with a complete task envelope and explicit tools; two or three disjoint tasks may use the parent-selected batch workflow after required isolation approval. Never exceed three.
4. Before editing each selected task, derive a bounded transient code/test neighborhood from declared files, imports and references, nearby tests, public contracts, and relevant git history. Append the discovered paths to `progress.md`. If declared files and neighborhood evidence materially disagree, stop for focused discovery; do not persist a repository graph.
5. After every start, pass, failure, invalidation, or integration transition, revalidate and recompute the frontier. Never fall back to list order or an old plan wave.
6. Continue with the fresh selected shard until the graph is complete or a blocker requires intervention.

The batch workflow receives only the parent-selected ready shard and returns control after integration so the parent can recompute the frontier.

### Per-Task Execution

Use the resolved ship-worker envelope for every implementation or code-fix step. The worker uses only its supplied Fabric tools, stays inside declared files, automates checkpoints first, and verifies with at most two fix attempts. The parent inspects and verifies the result, then commits or integrates only with explicit approval before appending task state and evidence to `progress.md`.

### Attempt-Scoped State Transitions

- **Start:** change `pending` to `running`, increment the attempt, set `passes: false`, and preserve historical evidence. Revalidate and recompute the frontier.
- **Pass:** first append a unique `progress.md#evidence-<task-id>-attempt-<n>` section containing fresh verification and review evidence, plus commit evidence only when separately authorized. Then add matching current-attempt evidence refs; only afterward change `running` to `passed` and `passes: true`. Revalidate and recompute the frontier.
- **Fail:** append failure evidence, change `running` to `failed`, and keep `passes: false`. Run `task-graph descendants`; pending descendants become blocked, passed or running descendants become stale with `passes: false`, and already failed or stale descendants remain unchanged.
- **Recovery:** blocked descendants return to pending only when every dependency passes. Stale nodes require explicit re-execution or verification. Ancestors remain unchanged unless recorded failure attribution names the ancestor or its produced output changed.
- After every mutation, revalidate the graph and recompute the frontier before selecting more work.

### Checkpoint Protocol

When task has `checkpoint:*` type:

| Type                      | Action                                                     |
| ------------------------- | ---------------------------------------------------------- |
| `checkpoint:human-verify` | Execute automation first, then pause for user verification |
| `checkpoint:decision`     | Present options, wait for selection                        |
| `checkpoint:human-action` | Request specific action with verification command          |

**Automation-first:** If verification CAN be automated, MUST automate it before requesting human check.

**Checkpoint return format:**

```markdown
## CHECKPOINT REACHED

**Type:** [human-verify | decision | human-action]
**Progress:** X/Y tasks complete

### Completed

| Task | Commit | Status |
| ---- | ------ | ------ |
| [N]  | [hash] | [[x]/[ ]]  |

### Current Task

**Task:** [name]
**Blocked by:** [specific blocker]

### Awaiting

[What user needs to do/provide]
```

### TDD Execution Flow

When task specifies TDD:

**RED Phase:**

1. Create test file with failing test
2. Run test → MUST fail
3. Commit: `test: add failing test for [feature]`

**GREEN Phase:**

1. Write minimal code to make test pass
2. Run test → MUST pass
3. Commit: `feat: implement [feature]`

**REFACTOR Phase:** (if needed)

1. Clean up code
2. Run tests → MUST still pass
3. Commit if changes: `refactor: clean up [feature]`

#### Behavioral Delivery Rule

For behavioral tasks, deliver the smallest safe vertical or end-to-end slice. Where practical, put a failing observable boundary test or evidence first, then implement through that boundary. Test doubles or fakes may substitute only at justified seams.

Never use private-method mocks. Never add test-only production APIs. Never create interfaces solely for testing.

### Task Commit Protocol

This protocol is an explicit-approval checkpoint. Do not stage, commit, merge, or integrate without separate approval; verified graph evidence does not imply Git authorization.

After approval and task verification:

1. **Check modified files:** `git status --short`
2. **Stage individually** (NEVER `git add .`):
   ```bash
   git add src/specific/file.ts
   git add tests/file.test.ts
   ```
3. **Commit with type prefix:**

   ```bash
   git commit -m "feat: [task description]

   - [key change 1]
   - [key change 2]"
   ```

4. **Record hash** in progress log

**Commit types:**
| Type | Use For |
|------|---------|
| `feat` | New feature, endpoint, component |
| `fix` | Bug fix, error correction |
| `test` | Test-only changes (TDD RED phase) |
| `refactor` | Code cleanup, no behavior change |
| `chore` | Config, tooling, dependencies |

### Stop Conditions

- Verification fails 2x on same task → stop, report blocker
- Blocked by unfinished dependency → stop, report which one
- Modifying files outside task scope → stop, ask user
- Rule 4 deviation encountered → stop, present options

## Phase 4: Verification

Follow the [Verification Protocol](../skills/verification-before-completion/references/VERIFICATION_PROTOCOL.md):

- Use **full mode** (shipping requires all gates)
- All applicable gates must pass before requesting explicit approval for commit or push
- Also run PRD `Verify:` commands

If the PRD requires local web, browser, OAuth callback, webhook, or multi-service verification, use stable URLs as verification evidence.

## Phase 5: Review

```bash
BASE_SHA=$(git rev-parse origin/main 2>/dev/null || git rev-parse HEAD~1)
HEAD_SHA=$(git rev-parse HEAD)
```

### Mode Selection

| Condition | Mode |
|---|---|
| Routine change, low risk | Standard Review (below) |
| High-risk feature, explicit user request for quality gating, or an implementation result flags iterative quality gating | Iterative Quality Loop |

When using Standard Review mode, apply the UI Quality Gate then the parallel review. When using Iterative Loop mode, apply the UI Quality Gate first (before entering the loop), then run the scored loop flow.

---

### UI Quality Gate (always — both modes)

Detect changed UI files:

```bash
git diff --name-only $BASE_SHA...HEAD -- \
  '*.tsx' '*.jsx' '*.css' '*.scss' '*.sass' '*.less' '*.html' '*.mdx'
```

If any UI files changed:

1. Run `/ui-slop-check auto --since=$BASE_SHA` or manually apply its checklist when slash-command invocation is unavailable.
2. Verify UX gates for changed surfaces:
   - One primary action per view/section
   - Empty/loading/error/success states for async/data flows
   - Retry/undo/confirm paths for errors and destructive actions
   - Form labels, helper text, validation, and error association
   - Semantic HTML, keyboard path, visible focus, reduced motion
   - Component family consistency for related controls
3. Treat Critical findings like review Critical findings: fix with `fabric_exec`, rerun verification, then continue.

---

### Standard Review Mode

Default to one foreground read-only Fabric review covering security/correctness, performance/architecture, type-safety/tests, conventions/patterns, and simplicity/completeness. For high-risk changes only, split those concerns into at most three non-overlapping bundles: `security-correctness`, `performance-architecture`, and `types-tests-conventions-simplicity`. Issue the current bundle wave together with `Promise.all`; process any additional review work in sequential shards.

```typescript
const reviewResult = await agents.run({
  name: "ship-review-[focus]",
  tools: ["read", "grep", "find", "ls"],
  task: `Review only [resolved focus bundle] for {WHAT_WAS_IMPLEMENTED} against {PLAN_OR_REQUIREMENTS}. Diff: {BASE_SHA}...{HEAD_SHA}. Return severity-ranked findings with file:line evidence, or explicitly report none.`,
});
return reviewResult.text;
```

Resolve placeholders before dispatch. The parent validates every finding and retains synthesis and verification.

**Auto-fix rule:**

- Critical and Important issues receive a complete modifying **ship-worker envelope**: task ID and attempt, verified finding, dependencies, exact files and transient neighborhood, non-goals, acceptance criteria, required verification, explicit tools, stop conditions, approval constraints, and expected result.

```typescript
const fixResult = await agents.run({
  name: `ship-fix-${findingId}`,
  task: fixEnvelope,
  tools: ["read", "grep", "find", "ls", "bash", "edit", "write"],
});
return fixResult.text;
```

Same-file or dependent fixes stay foreground and sequential. At most three disjoint fixes may run with `Promise.all` and `worktree: true` only after explicit worktree approval; integrate that shard before later sequential shards.

- After **any** code fix → inspect changes and re-run Phase 4 verification before proceeding.
- Minor issues → note them in the active `progress.md`. Hindsight automatic retain captures ordinary session deltas; use `hindsight_retain` only for raw, high-value facts or decisions that require immediate persistence.

If review finds critical issues that require architectural decisions → stop → present options to user.

### Iterative Quality Loop Mode

Score-gated feedback loop for high-risk features. Replaces the standard review with a structured iteration cycle.

#### Setup

Initialize loop state:

```bash
SLUG=$(cat .pi/artifacts/.active)
cat > ".pi/artifacts/$SLUG/review-state.json" << EOF
{
  "slug": "$SLUG",
  "rounds": 0,
  "maxRounds": 5,
  "lastScore": 0,
  "sameScoreCount": 0,
  "findingsResolved": 0,
  "findingsRemaining": 0,
  "status": "active"
}
EOF
```

#### Loop

Repeat steps 2-8 until exit or escalation:

| Step | Action |
|---|---|
| **1. EXECUTE** | Implement per spec/plan (already done in Phase 3) |
| **2. REVIEW** | Run one foreground read-only `agents.run` task with the spec, current diff, and `review-state.json`. Return score, severity-ranked findings, and a suggested next action. |
| **3. GATE** | Score ≥ 5 → mark passed and continue to Goal-Backward Verification. Score 4 → ask the user whether to proceed or loop. Score <4 → continue. |
| **4. STALL?** | If `sameScoreCount ≥ 2`, surface accumulated findings and escalate. |
| **5. MAX?** | If `rounds ≥ maxRounds`, escalate with the full finding log. |
| **6. FILTER** | Actionable findings proceed to fix; informational findings go to `progress.md`; architecture/design findings stop for a user decision. |
| **7. FIX** | Run a foreground modifying `agents.run` with a complete fix envelope and explicit tools. Up to three disjoint approved worktree fixes may run with `Promise.all`; process overflow in sequential shards. |
| **8. VERIFY + RE-REVIEW** | Inspect accepted fixes, re-run Phase 4 verification, update `review-state.json`, then return to step 2. |

#### Loop State Updates

After each round, update `review-state.json`:

- If the new score equals `lastScore`, increment `sameScoreCount`; otherwise reset it to `0`.
- Stall detected → `status: "stalled"`, append accumulated findings to `progress.md`.
- Max rounds reached → `status: "maxed"`, append the full finding log.
- Score ≥ 5 → `status: "passed"`, proceed to Goal-Backward Verification.

#### Fabric Review Task

```typescript
const scoredReview = await agents.run({
  name: "ship-quality-score",
  tools: ["read", "grep", "find", "ls"],
  task: `Review the original spec/slug, the complete current diff since Phase 3, and review-state.json. Return { score: number, findings: Array<{severity:"critical"|"important"|"minor", file:string, line:number, suggestion:string, type:"actionable"|"informational"|"architecture"}>, nextAction: string }.`,
});
return scoredReview.text;
```

The parent validates findings and owns loop state.

#### Exit Conditions

| Condition | Action |
|---|---|
| Score ≥ 5 | Proceed to Goal-Backward Verification |
| User approves score 4 | Proceed to Goal-Backward Verification |
| Architecture finding | Stop, present options to user |
| Stalled (same score 2x) | Escalate with accumulated findings |
| Max rounds | Escalate with full finding log |

### Goal-Backward Verification (if plan.md exists)

Verify that tasks completed ≠ goals achieved:

**Three-Level Verification:**

| Level              | Check                  | Command/Action                                                    |
| ------------------ | ---------------------- | ----------------------------------------------------------------- |
| **1: Exists**      | File is present        | `ls path/to/file.ts`                                              |
| **2: Substantive** | Not a stub/placeholder | `grep -v "TODO\|FIXME\|return null\|placeholder" path/to/file.ts` |
| **3: Wired**       | Connected and used     | `grep -r "import.*ComponentName" src/`                            |

**Key Link Verification:**

- Component → API: `grep -E "fetch.*api/|axios" Component.tsx`
- API → Database: `grep -E "prisma\.|db\." route.ts`
- Form → Handler: `grep "onSubmit" Component.tsx`
- State → Render: `grep "{stateVar}" Component.tsx`

**Stub Detection:**
Red flags indicating incomplete implementation:

```javascript
return <div>Component</div>      // Placeholder
return <div>{/* TODO */}</div>    // Empty
return null                       // Empty
onClick={() => {}}                // No-op handler
fetch('/api/...')                 // No await, ignored
return Response.json({ok: true})  // Static, not query result
```

If any artifact fails Level 2 or 3 → fix with `fabric_exec` → re-verify.

## Phase 6: Close

Ask user before closing:

```typescript
question({
  questions: [
    {
      header: "Close",
      question: "All tasks pass, gates green, review clean. Mark plan as complete?",
      options: [
        { label: "Yes, mark complete (Recommended)", description: "All checks passed" },
        { label: "No, keep working", description: "Need more work" },
      ],
    },
  ],
});
```

If confirmed:

Update `.pi/artifacts/$(cat .pi/artifacts/.active)/tasks.json` when present, and append the completion summary to the active `progress.md`.

After closing, rely on Hindsight automatic retain for ordinary session deltas. Use `hindsight_retain` only for raw, high-value facts or decisions that require immediate persistence, and never retain a duplicate completion summary.

## Output

Report:

1. **Execution Summary:**
   - Tasks completed/total
   - Waves executed (if plan.md with waves)
   - Deviations applied (Rules 1-3)
   - Checkpoints encountered (human-verify/decision/human-action)
   - Commits made

2. **PRD Task Results:**
   - Each task status ([x] pass, [ ] fail, [PAUSE] checkpoint)
   - Files modified per task
   - Commit hashes

3. **Verification Gate Results:**
   - Build: [pass/fail]
   - Test: [pass/fail]
   - Lint: [pass/fail]
   - Typecheck: [pass/fail]

4. **Goal-Backward Verification:**
   - Artifacts verified: [N] exists, [M] substantive, [K] wired
   - Key links checked: [pass/fail per link]
   - Stubs detected: [N] (if any)

5. **Review Summary:**
   - Critical issues: [N]
   - Important issues: [N]
   - Minor issues: [N]
   - Overall assessment: [pass/needs work]

6. **Next Steps:**
   - **Ask user** if they want a PR created from the current branch — always ask, never push without confirmation
   - Manual commits if not already done
   - Note deferred work in the active `progress.md`

## Related Commands

| Need              | Command       |
| ----------------- | ------------- |
| Create feature    | `/create`     |
| Plan execution    | `/plan`       |
| Research a topic  | `/research`   |
| Fix a bug         | `/fix`        |
| Verify gate       | `/verify`     |
