---
description: Ship a plan - implement specs, verify, review, close
---

# Ship

Execute spec tasks, verify each passes, run review, mark complete.

> **Workflow:** `/create` → **`/ship`**

## Pi Subagent Routing

When this prompt says to spawn, delegate to, or use an agent, invoke the pi-subagents `Agent` tool; an agent name is not itself a tool. This is not Fabric agent orchestration.

- `Explore`: internal codebase discovery
- `scout`: external documentation and research
- `review`: correctness, security, and regression review
- `general`: small independent implementation
- `Plan`: architecture and executable planning
- Use a foreground call when the next step depends on the result. For independent parallel work, issue all calls together with `run_in_background: true`.
- Omit `model` and `thinking`; agent definitions and scoped-model settings own those choices.

## Implementation Tooling

During `/ship`, use `fabric_exec` for code-mode implementation and batched tool execution. Fabric is the required implementation tool here—not the subagent orchestrator.

- Spawn every child through the pi-subagents `Agent` tool.
- Never use Fabric agents, actors, mesh, or Fabric subagents.
- Use `fabric_exec` for every implementation phase. Native Pi tools may still handle guards, review, and verification outside implementation.
- Review, smart join, and child lifecycle remain owned by `@tintinweb/pi-subagents`.

## Load Skills

```typescript
read(".pi/skills/verification-before-completion/SKILL.md");
```

## Before You Ship

- **Be certain**: Only ship if all tasks pass verification
- **Don't skip gates**: Build, test, lint, typecheck are non-negotiable
- **Run the review**: Always spawn review agent before closing
- **Verify goals**: Tasks completing ≠ goals achieved (use goal-backward verification)
- **Commit before close**: Per-task commits required, don't ship without git history
- **Ask before closing**: Never close without user confirmation

## Available Tools

| Tool                 | Use When                                  |
| -------------------- | ----------------------------------------- |
| `Explore`            | Finding patterns in codebase, prior art   |
| `scout`              | External research, best practices         |
| `lsp`                | Finding symbol definitions, references    |
| `grep`               | Finding code patterns                     |
| `Agent`              | Spawning pi-subagents                     |
| `fabric_exec`         | Required code-mode implementation/batching |

## Phase 1: Guards

### Context Search

Search `.pi/artifacts/MEMORY.md` for: failed approaches to avoid repeating.

```bash
rg -n "topic" .pi/artifacts/MEMORY.md
```

### Plan Validation

Verify:

- `.pi/artifacts/$(cat .pi/artifacts/.active)/spec.md` exists (if not, tell user to run `/create` first)

Check what artifacts exist:

Read `.pi/artifacts/$(cat .pi/artifacts/.active)/` to check what artifacts exist (spec.md, plan.md, etc.).

### Workspace Setup

Set up the workspace: create branch, install deps if needed.

## Phase 2: Route to Execution

### Complexity Detection

Before routing, analyze the plan complexity:

**Direct execution** (use existing logic):
- Plan has <5 tasks
- Tasks have dependencies (not fully independent)
- Tasks require sequential execution
- User explicitly requests sequential execution

**Workflow execution** (invoke `batch-implement`):
- Plan has ≥5 independent tasks
- Tasks have no file conflicts
- Tasks can run in parallel
- User wants maximum parallelism

### Decision Logic

1. **Parse the plan** from `.pi/artifacts/$(cat .pi/artifacts/.active)/plan.md` or `tasks.json`
2. **Count independent tasks** (tasks with no dependencies)
3. **Check for file conflicts** (do any tasks edit the same files?)
4. **Route accordingly:**
   - <5 tasks OR has dependencies OR has file conflicts → Direct execution (see "Direct Execution" below)
   - ≥5 independent tasks AND no file conflicts → Invoke `batch-implement` workflow (see "Workflow Execution" below)

### Workflow Execution (Parallel Implementation)

If complexity is detected as parallel:

1. **Read the workflow:** `.pi/workflows/batch-implement.md`
2. **Execute all phases:**
   - Phase 1: Spawn 1 `review` agent to review plan for task independence
   - Phase 2: Spawn at most three `general` agents for the current disjoint task shard; integrate before later sequential shards
   - Phase 3: Spawn at most three matching `review` agents for the completed shard; process review overflow sequentially
   - Final merge: the parent verifies and integrates results
3. **Replace placeholders:**
   - `{plan}` → the implementation plan
   - `{phase_N_output}` → actual output from completed phases
4. **Aggregate results** between phases
5. **Continue to Phase 4: Verification** (skip Phase 3 below)

**Announce:** "This plan has [N] independent tasks. Invoking batch-implement workflow for parallel execution."

### Direct Execution

If complexity is simple or tasks have dependencies, use the existing execution logic below.

| Artifact exists in `.pi/artifacts/$(cat .pi/artifacts/.active)/` | Action                                                   |
| --------------- | -------------------------------------------------------- |
| `plan.md`       | Parse plan header + dependency graph, execute wave-by-wave |
| `tasks.json`    | Proceed to PRD task loop below                             |
| Only `spec.md`  | Convert spec to `tasks.json`, then proceed                    |

## Phase 3: Wave-Based Execution

If `plan.md` exists with dependency graph:

1. **Parse waves** from dependency graph section
3. **Execute wave-by-wave:**
   - Single-task wave → implement directly with `fabric_exec` (no subagent overhead)
   - Multi-task wave → issue at most three disjoint `Agent({ subagent_type: "general", description: "Implement [task]", prompt: "Implement only [resolved task and exact files]. Use fabric_exec for code-mode implementation. Return branch/commit and verification evidence.", run_in_background: true, isolation: "worktree" })` calls for the current shard; integrate it before processing overflow in later sequential shards
4. **Review after each wave** — inspect each isolated result, run verification directly, review it, integrate passing branches/commits, then run an integration check
5. **Continue** until all waves complete

**Parallel safety:** Only tasks within same wave run in parallel. Tasks must NOT share files. Tasks in Wave N+1 wait for Wave N.

### Phase 3A: PRD Task Loop (Sequential Fallback)

Use `fabric_exec` for every implementation or code-fix step in this loop.

For each task (wave-based or sequential fallback):

1. **Read** the task description, verification steps, and affected files
2. **Read** the affected files before editing
3. **Implement** the changes — stay within the task's `files` list
4. **Handle Deviations:** Apply deviation rules 1-4 as discovered
5. **Checkpoint Protocol:** If task has `checkpoint:*`, stop and request user input
6. **Verify** — run each verification step from the task
7. **If verification fails**, fix and retry (max 2 attempts per task)
8. **Commit** — per-task commit (see below)
9. **Mark** `passes: true` in `.pi/artifacts/$(cat .pi/artifacts/.active)/tasks.json`
10. **Append** progress to `.pi/artifacts/$(cat .pi/artifacts/.active)/progress.md`

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

### Task Commit Protocol

After each task completes (verification passed):

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
- All 4 gates must pass before proceeding to commit/push
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
| High-risk feature, explicit user request for quality gating, or the build agent flagged the feature as requiring iterative quality gating | Iterative Quality Loop |

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

Default to one foreground `review` agent covering security/correctness, performance/architecture, type-safety/tests, conventions/patterns, and simplicity/completeness. For high-risk changes only, split those concerns into at most three non-overlapping bundles: `security-correctness`, `performance-architecture`, and `types-tests-conventions-simplicity`. Dispatch the current bundle wave together with `run_in_background: true`; process any additional review work in sequential shards.

```typescript
Agent({
  subagent_type: "review",
  description: "Review [focus bundle]",
  prompt: `Review only [resolved focus bundle] for {WHAT_WAS_IMPLEMENTED} against {PLAN_OR_REQUIREMENTS}. Diff: {BASE_SHA}...{HEAD_SHA}. Return severity-ranked findings with file:line evidence, or explicitly report none.`,
});
```

Resolve placeholders before dispatch. The parent validates every finding and retains synthesis and verification.

**Auto-fix rule:**

- Critical and Important issues → dispatch `Agent({ subagent_type: "general", description: "Fix [finding]", prompt: "Use fabric_exec to fix only [exact finding, file scope]. Run [verification]." })`. Use `run_in_background: true` plus `isolation: "worktree"` only for a disjoint shard of at most three files/findings; integrate it before later sequential shards. Otherwise use foreground sequential calls.
- After **any** code fix → inspect changes and re-run Phase 4 verification before proceeding.
- Minor issues → note them in the active `progress.md`; append only durable cross-feature learnings to `.pi/artifacts/MEMORY.md`

If review finds critical issues that require architectural decisions → stop → present options to user.

### Iterative Quality Loop Mode

Score-gated feedback loop for high-risk features. Replaces the standard parallel review with a structured iteration cycle.

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
| **2. REVIEW** | Spawn **one review subagent** (`subagent_type: "review"`) with spec + current diff + `review-state.json`. Returns: score (X/5), findings array (severity + file:line + suggestion), suggested next action |
| **3. GATE** | Score ≥ 5 → mark done (`status: "passed"`), exit loop, proceed to Goal-Backward Verification. Score 4 → ask user if they want to proceed or loop. Score <4 → continue |
| **4. STALL?** | If `sameScoreCount ≥ 2` → escalate: surface accumulated findings, present to user with a recommendation |
| **5. MAX?** | If `rounds ≥ maxRounds` → escalate with full finding log |
| **6. FILTER** | Split findings into categories and handle each: |
| | • **Actionable** (code-level, clear fix) → proceed to fix |
| | • **Informational** (note, no code change) → log to progress.md with `[info]` |
| | • **Architecture/Design** → stop loop, present to user for decision |
| **7. FIX** | Dispatch `Agent({ subagent_type: "general", description: "Fix [finding]", prompt: "Use fabric_exec to fix only [exact finding, file:line, scope]. Run [verification]." })`. Same-file/dependent fixes stay foreground and sequential; at most three disjoint fixes may run in the current shard with `run_in_background: true` and `isolation: "worktree"`, followed by later sequential shards |
| **8. VERIFY + RE-REVIEW** | Integrate accepted fixes, inspect files, re-run Phase 4 verification, update `review-state.json`, then go to step 2 |

#### Loop State Updates

After each round, update `review-state.json`:

**`sameScoreCount` rule:**
- If new score === `lastScore` → increment `sameScoreCount`
- If new score !== `lastScore` → reset `sameScoreCount` to 0

**Example after round 1 (score: 3):**

```json
{
  "rounds": 1,
  "lastScore": 3,
  "sameScoreCount": 0,
  "findingsResolved": 2,
  "findingsRemaining": 1,
  "status": "active"
}
```

**Status transitions:**

- Stall detected (`sameScoreCount ≥ 2`) → `status: "stalled"`, append accumulated findings to progress.md
- Max rounds reached → `status: "maxed"`, append full finding log to progress.md
- Pass (score ≥ 5) → `status: "passed"`, proceed to Goal-Backward Verification

#### Review Subagent Prompt

Spawn with a foreground pi-subagents call:

```typescript
Agent({
  subagent_type: "review",
  description: "Score implementation quality",
  prompt: `Review the original spec/slug, the complete current diff since Phase 3, and review-state.json. Return { score: number, findings: Array<{severity:"critical"|"important"|"minor", file:string, line:number, suggestion:string, type:"actionable"|"informational"|"architecture"}>, nextAction: string }.`,
});
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

After closing, append significant cross-feature learnings to `.pi/artifacts/MEMORY.md` after checking for duplicates.

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
