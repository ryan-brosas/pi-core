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

## Phase 2: Validate the Canonical Graph

Resolve the explicitly active slug and set `GRAPH=.pi/artifacts/$SLUG/tasks.json`. Run `task-graph validate` with `node --experimental-strip-types .pi/scripts/task-graph.ts validate "$GRAPH"` before routing or editing. Malformed or invalid graphs stop with their machine-readable issues.

If `plan.md` exists, compare its task IDs with the authoritative graph. Any task ID divergence is a stop condition; never infer execution state from a derived wave snapshot. `frontier --all` is read-only visibility only, requires an explicit slug selection, never changes `.active`, and never dispatches work.

## Phase 3: Dynamic Frontier Execution

1. Run `task-graph frontier` with `node --experimental-strip-types .pi/scripts/task-graph.ts frontier "$GRAPH"`.
2. Handle no-ready states exactly: `complete` proceeds to verification; `running` reports active work; `blocked` reports unmet dependency reasons; `intervention_required` reports failed, blocked, or stale IDs; `invalid` stops.
3. Execute only the returned conflict-free `selected` shard. One selected task runs directly with `fabric_exec`; two or three disjoint tasks may use the parent-selected batch workflow. Never exceed three.
4. Before editing each selected task, derive a bounded transient code/test neighborhood from declared files, imports and references, nearby tests, public contracts, and relevant git history. Append the discovered paths to `progress.md`. If declared files and neighborhood evidence materially disagree, stop for focused discovery; do not persist a repository graph.
5. After every start, pass, failure, invalidation, or integration transition, revalidate and recompute the frontier. Never fall back to list order or an old plan wave.
6. Continue with the fresh selected shard until the graph is complete or a blocker requires intervention.

The batch workflow receives only the parent-selected ready shard and returns control after integration so the parent can recompute the frontier.

### Per-Task Execution

Use `fabric_exec` for every implementation or code-fix step. Read the canonical task, its verification commands, and its transient neighborhood; stay inside declared files; automate checkpoints first; verify with at most two fix attempts; commit the task; and append task state plus evidence to `progress.md`.

### Attempt-Scoped State Transitions

- **Start:** change `pending` to `running`, increment the attempt, set `passes: false`, and preserve historical evidence. Revalidate and recompute the frontier.
- **Pass:** first append a unique `progress.md#evidence-<task-id>-attempt-<n>` section containing fresh verification, review, and commit evidence. Then add matching current-attempt evidence refs; only afterward change `running` to `passed` and `passes: true`. Revalidate and recompute the frontier.
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
