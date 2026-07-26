---
description: Ship a plan - implement specs, verify, review, close
argument-hint: "<slug>"
---

# Ship: $ARGUMENTS

Execute spec tasks, verify each passes, run review, mark complete.

> **Workflow:** `/create` → **`/ship`**

## Implementation Worker Routing

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

Children must not spawn or delegate to another agent, schedule siblings, select lifecycle identity, mutate `tasks.json`, `progress.md`, or other lifecycle state, or commit, merge, integrate, or publish work. The `/ship` parent owns updates only inside the explicitly selected artifact’s `tasks.json` and `progress.md`; children never choose that artifact.

Explicit approval is required before branch or worktree creation; commit, merge, or integration; dependency installation or new file creation; lifecycle identity or unrelated artifact mutation; push or deploy; and destructive operations. When required approval is absent, stop at a checkpoint and preserve the verified work.

## Load Skills

```typescript
read(".pi/skills/test-driven-development/SKILL.md");
read(".pi/skills/verification-before-completion/SKILL.md");
```

## Before You Ship

- **Be certain**: Only ship if all tasks pass verification
- **Don't skip applicable gates**: Run every repository-configured build, test, lint, and typecheck gate; do not invent unavailable commands
- **Scale review to risk**: Parent diff review is mandatory; use an independent Fabric review for cross-boundary, security/privacy, migration, or otherwise high-risk work
- **Verify goals**: Tasks completing ≠ goals achieved (use goal-backward verification)
- **Approval before Git actions**: Per-task commit, merge, and integration occur only after explicit approval; otherwise stop at a checkpoint
- **Ask before closing**: Never close without user confirmation

## Available Tools

| Tool or Fabric surface | Use When                                      |
| ---------------------- | --------------------------------------------- |
| `agents.run`           | Bounded planning, research, review, or edits |
| `Promise.all`          | At most three independent Fabric runs       |
| `pi.read`, `pi.grep`, `pi.find` | Source inspection inside `fabric_exec` |
| Configured MCP code graph | Optional target-scoped impact analysis after a known-symbol health probe |
| Project corpus         | Optional bounded retrieval of curated implementation exemplars |
| `fabric_exec`          | Parent orchestration and batched execution  |

## Phase 1: Guards

### Context Search

Use automatically recalled Hindsight project context first for failed approaches and prior decisions. If a material gap remains, call `hindsight_recall` with a topic-bounded query; use `hindsight_reflect` only when synthesis across memories is required.

### Resolve Feature and Validate Plan

Resolve `SLUG` solely from the required explicit argument. A missing slug is a stop condition: request `/ship <slug>`. Reject unsafe or nonexistent selections rather than inferring scope; a completed graph proceeds only to verification/reporting, never new execution.

Set:

```bash
ARTIFACT_DIR=".pi/artifacts/$SLUG"
GRAPH="$ARTIFACT_DIR/tasks.json"
```

Verify `$ARTIFACT_DIR/spec.md` and `$GRAPH` exist, then inspect the artifact directory for an optional `plan.md` and existing evidence.

### Workspace Setup

Inspect the current workspace without mutating it. Branch or worktree creation, dependency installation, and new file creation require explicit approval; when needed but unauthorized, stop at a checkpoint.

## Phase 2: Validate the Canonical Graph

Use the explicitly resolved slug and run `task-graph validate` with `node --experimental-strip-types .pi/scripts/task-graph.ts validate "$GRAPH"` before routing or editing. Malformed or invalid graphs stop with their machine-readable issues.

If `plan.md` exists, compare its task IDs with the authoritative graph. Any task ID divergence is a stop condition; never infer execution state from a derived wave snapshot. `frontier --all` is read-only visibility only: it never selects a slug and never dispatches work.

## Phase 3: Dynamic Frontier Execution

1. Run `task-graph frontier` with `node --experimental-strip-types .pi/scripts/task-graph.ts frontier "$GRAPH"`.
2. Handle no-ready states exactly: `complete` proceeds to verification; `running` reports active work; `blocked` reports unmet dependency reasons; `intervention_required` reports failed, blocked, or stale IDs; `invalid` stops.
3. Execute only the returned conflict-free `selected` shard. One selected task uses one foreground `agents.run` call with a complete task envelope and explicit tools; two or three disjoint tasks may use the parent-selected batch workflow after required isolation approval. Never exceed three.
4. Before editing each selected task, derive a bounded transient code/test neighborhood from declared files, imports and references, nearby tests, public contracts, and relevant git history. A configured code graph may supplement this impact map only after it is scoped to the exact target repository and resolves a known target symbol or path; otherwise fall back to `read`, `grep`, and `find`. If a project corpus exists, search it separately for bounded curated exemplars and read only selected entry files—the corpus is not an impact map. Verify both sources against current code. Append discovered target paths to `progress.md`. If declared files and neighborhood evidence materially disagree, stop for focused discovery; do not persist a repository graph.
5. After every start, pass, failure, invalidation, or integration transition, revalidate and recompute the frontier. Never fall back to list order or an old plan wave.
6. Continue with the fresh selected shard until the graph is complete or a blocker requires intervention.

The batch workflow receives only the parent-selected ready shard and returns control after integration so the parent can recompute the frontier.

### Per-Task Execution

Use the resolved ship-worker envelope for every implementation or code-fix step. The worker uses only its supplied Fabric tools, stays inside declared files, automates checkpoints first, and verifies with at most two fix attempts. The parent inspects and verifies the result, then appends task state and evidence independently of any optional commit or integration. Git actions occur only after explicit approval; withholding Git approval does not block truthful graph progress.

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

Every behavior-changing feature or bug fix must begin with a failing observable boundary test before production code changes. Documentation-only and pure configuration work use their exact failing executable check; they do not invent a runtime test. If a behavior cannot be captured at a stable public boundary, stop and resolve the contract instead of silently switching to an implementation-detail assertion.

**RED Phase:**

1. Add the smallest observable test for the missing behavior.
2. Run it and confirm it fails for the expected reason.
3. Record the command, exit status, and failure reason as attempt evidence; this does not authorize a commit.

**GREEN Phase:**

1. Write the minimum production change through the tested boundary.
2. Run the RED test and confirm it passes.
3. Run the containing test file or nearest repository-supported check.

**REFACTOR Phase (if needed):**

1. Improve names or structure without adding behavior.
2. Re-run the focused and affected tests.

#### Behavioral Delivery Rule

Deliver the smallest safe vertical or end-to-end slice through the observable boundary. Test doubles or fakes may substitute only at justified seams.

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

- Discover exact commands from `AGENTS.md`, CI, manifests, and canonical scripts; use **full mode** without inventing unavailable gates.
- All applicable gates must pass before requesting explicit approval for commit or push.
- Run every task and PRD `Verify:` command.
- Finish with **black-box acceptance** for every rigor level: exercise observable success or acceptance behavior and controlled failure or error journeys from the public boundary. Gray-box checks supplement this only for a named evidence gap.

If the PRD requires local web, browser, OAuth callback, webhook, or multi-service verification, use stable URLs as verification evidence.

## Phase 5: Review

Resolve the canonical primary branch from `AGENTS.md` and verify the corresponding local or remote ref exists. Do not guess from commit count:

```bash
PRIMARY_REF="origin/main" # replace only with the primary ref verified from repository policy
if ! git rev-parse --verify "$PRIMARY_REF" >/dev/null 2>&1; then
  echo "Verified primary ref is unavailable: $PRIMARY_REF" >&2
  exit 1
fi
BASE_SHA=$(git merge-base "$PRIMARY_REF" HEAD) || exit 1
TRACKED_CHANGED=$(git diff --name-only "$BASE_SHA" --)
UNTRACKED_CHANGED=$(git ls-files --others --exclude-standard)
```

All review modes use the current worktree relative to `BASE_SHA`, not only `BASE_SHA...HEAD`. Include both tracked and untracked paths. If no safe base can be resolved, stop and ask rather than silently narrowing the review.

Classify each changed path as **owned**, **unrelated concurrent work**, or **runtime-managed state** across the complete tracked and untracked worktree. Review all paths for awareness, but keep unrelated and runtime findings read-only: report them and never fix or modify them. Any proposed change outside owned task scope requires a separate user decision.

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
{
  git diff --name-only "$BASE_SHA" -- \
    '*.tsx' '*.jsx' '*.css' '*.scss' '*.sass' '*.less' '*.html' '*.mdx'
  git ls-files --others --exclude-standard -- \
    '*.tsx' '*.jsx' '*.css' '*.scss' '*.sass' '*.less' '*.html' '*.mdx'
} | sort -u
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
3. Treat Critical findings on owned UI paths like review Critical findings: fix with `fabric_exec`, rerun verification, then continue. Report unrelated/runtime UI findings read-only.

---

### Standard Review Mode

The parent always reviews the complete tracked and untracked worktree. Add one foreground independent Fabric review when consequence or uncertainty warrants it. For high-risk changes only, split concerns into at most three non-overlapping bundles: `security-correctness`, `performance-architecture`, and `types-tests-conventions-simplicity`.

```typescript
const reviewResult = await agents.run({
  name: "ship-review-[focus]",
  tools: ["read", "grep", "find", "ls", "bash"],
  task: `Review only [resolved focus bundle] for {WHAT_WAS_IMPLEMENTED} against {PLAN_OR_REQUIREMENTS}. Inspect the current worktree relative to {BASE_SHA}, including this exact changed-path list: {CHANGED_PATHS}. Use bash only for read-only git diff/status commands. Return severity-ranked findings with file:line evidence, or explicitly report none.`,
});
return reviewResult.text;
```

Resolve placeholders before dispatch. The parent validates every finding and retains synthesis and verification.

**Auto-fix rule:**

- Only validated Critical or Important findings on owned paths may enter an auto-fix or other modifying **ship-worker envelope**. The envelope includes task ID and attempt, verified finding, dependencies, exact owned files and transient neighborhood, non-goals, acceptance criteria, required verification, explicit tools, stop conditions, approval constraints, and expected result.
- Unrelated concurrent or runtime-managed findings remain read-only reports; do not fix them as part of the current task.

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
- Minor issues → note them in `$ARTIFACT_DIR/progress.md`. Hindsight automatic retain captures ordinary session deltas; use `hindsight_retain` only for raw, high-value facts or decisions that require immediate persistence.

If review finds critical issues that require architectural decisions → stop → present options to user.

### Iterative Quality Loop Mode

Score-gated feedback loop for high-risk features. Replaces the standard review with a structured iteration cycle.

#### Setup

Initialize bounded loop state in parent memory: resolved slug, rounds `0`, max rounds `5`, last score `0`, same-score count `0`, findings resolved/remaining, and status `active`. Pass the current immutable snapshot explicitly to each reviewer. Do not create a state file unless the user separately approves that exact new path.

#### Loop

Repeat steps 2-8 until exit or escalation:

| Step | Action |
|---|---|
| **1. EXECUTE** | Implement per spec/plan (already done in Phase 3) |
| **2. REVIEW** | Run one foreground read-only `agents.run` task with the spec, current diff, and parent-supplied loop-state snapshot. Return score, severity-ranked findings, and a suggested next action. |
| **3. GATE** | Score ≥ 5 → mark passed and continue to Goal-Backward Verification. Score 4 → ask the user whether to proceed or loop. Score <4 → continue. |
| **4. STALL?** | If `sameScoreCount ≥ 2`, surface accumulated findings and escalate. |
| **5. MAX?** | If `rounds ≥ maxRounds`, escalate with the full finding log. |
| **6. FILTER** | Actionable findings on owned paths proceed to fix; unrelated/runtime findings stay read-only; informational owned findings go to `progress.md`; architecture/design findings stop for a user decision. |
| **7. FIX** | Run a foreground modifying `agents.run` with a complete fix envelope and explicit tools. Up to three disjoint approved worktree fixes may run with `Promise.all`; process overflow in sequential shards. |
| **8. VERIFY + RE-REVIEW** | Inspect accepted fixes, re-run Phase 4 verification, update the parent-owned in-memory loop state, then return to step 2. |

#### Loop State Updates

After each round, update the parent-owned in-memory loop state:

- If the new score equals `lastScore`, increment `sameScoreCount`; otherwise reset it to `0`.
- Stall detected → `status: "stalled"`, append accumulated findings to `progress.md`.
- Max rounds reached → `status: "maxed"`, append the full finding log.
- Score ≥ 5 → `status: "passed"`, proceed to Goal-Backward Verification.

#### Fabric Review Task

```typescript
const scoredReview = await agents.run({
  name: "ship-quality-score",
  tools: ["read", "grep", "find", "ls", "bash"],
  task: `Review the original spec/slug, the complete current worktree relative to the resolved base (including untracked paths), and this parent-supplied loop-state snapshot: {LOOP_STATE}. Use bash only for read-only git diff/status commands. Return { score: number, findings: Array<{severity:"critical"|"important"|"minor", file:string, line:number, suggestion:string, type:"actionable"|"informational"|"architecture"}>, nextAction: string }.`,
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

### Goal-Backward Verification

Run this for every spec, whether or not `plan.md` exists. Derive the goal and observable success criteria from `spec.md`; when a plan exists, also use its required artifacts and key links. Tasks completed do not prove goals achieved.

**Four-Level Verification:**

| Level | Check | Command/Action |
| --- | --- | --- |
| **0: Black-box accepted** | Observable success and controlled failures work | Execute the spec’s public-boundary acceptance commands |
| **1: Exists** | Declared artifact is present | Use the repository-appropriate file or object check |
| **2: Substantive** | Not a stub or placeholder | Inspect the exact artifact and run its focused behavior check |
| **3: Wired** | Connected and used | Trace references/callers and verify the real integration path |

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

If black-box acceptance or any applicable structural level fails, attribute the earliest contract or task that must change, fix only owned paths with `fabric_exec`, and re-run full verification.

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

Update `$GRAPH` when present, and append the completion summary to `$ARTIFACT_DIR/progress.md`.

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
   - Observable acceptance: [pass/fail]
   - Build: [pass/fail/N/A]
   - Test: [pass/fail/N/A]
   - Lint: [pass/fail/N/A]
   - Typecheck: [pass/fail/N/A]

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
   - Note deferred work in `$ARTIFACT_DIR/progress.md`

## Related Commands

| Need              | Command       |
| ----------------- | ------------- |
| Create feature    | `/create`     |
| Plan execution    | `/plan`       |
| Research a topic  | `/research`   |
| Fix a bug         | `/fix`        |
| Verify gate       | `/verify`     |
