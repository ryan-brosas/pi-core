---
description: Create detailed implementation plan with TDD steps
---

# Plan

Create a detailed implementation plan with TDD steps. Optional deep-planning between `/create` and `/ship`.

> **Workflow:** `/create` → **`/plan`** (optional) → `/ship`
>
> **When to use:** Complex tasks where spec verification steps aren't enough guidance. Skip for simple tasks.

## Fabric Agent Routing

Use `agents.run({...})` inside `fabric_exec` only when delegation saves more context or time than it costs. Direct parent work is the default; there are no named project agent profiles.

- Encode the task role, exact goal, context, non-goals, output contract, stop conditions, approval constraints, and verification in `task`.
- Supply an explicit `tools` allowlist. Local discovery, planning, and review default to `["read", "grep", "find", "ls"]`. External research adds only the required configured network tools; add mutation tools only for approved implementation work.
- Await one foreground `agents.run` when the next decision depends on its result.
- For genuinely independent questions, issue at most three `agents.run` calls in one `Promise.all`; process overflow in sequential shards.
- For small read-only discovery or research, prefer `model: "openai-codex/gpt-5.6-luna"` with `thinking: "medium"` when an explicit override is useful.
- The parent resolves placeholders, inspects child output and changes, synthesizes results, and runs verification itself.
### Planning Worker Routing

`/plan` remains parent-owned synthesis. The parent plans inline by default.

Invoke one foreground planning-advisory Fabric run only when an independent blueprint materially reduces risk:

- **Material ambiguity:** requirements or acceptance boundaries remain unresolved after institutional and local evidence is loaded.
- **Architectural trade-off:** two or more viable structures have meaningfully different long-term costs.
- **Cross-subsystem sequencing:** ordering spans multiple contracts or ownership boundaries and a second planning pass reduces integration risk.
- For complex planning that skips delegation, record a brief skip rationale instead of silently declining it.

Route missing evidence separately:

- Use a read-only local-discovery task for codebase patterns, file structure, and test discovery.
- Use a read-only external-research task for docs, library comparisons, and ecosystem evidence.
- Stop for a parent decision when the right task shape is unclear; do not hide that decision in worker selection.
- Await one foreground run when the next parent decision depends on it. Route independent evidence fan-out under the general Fabric routing policy outside this advisory call.

After constructing the resolved planning envelope below, use this foreground call:

```typescript
const planningResult = await agents.run({
  name: "planning-advisor",
  model: "openai-codex/gpt-5.6-luna",
  thinking: "medium",
  task: planningEnvelope,
  tools: ["read", "grep", "find", "ls"],
});
return planningResult.text;
```

Do not make delegated planning a mandatory prelude to implementation and review.

### Planning Envelope

Every planning child receives a resolved, self-contained **planning envelope** containing:

- **Task identity and bounded advisory question:** feature slug, planning round/attempt, and the one decision the child must settle
- **Goal:** outcome-shaped goal from the PRD
- **Constraints:** hard constraints, soft preferences, and non-negotiables
- **Canonical graph and input paths:** exact paths to `spec.md`, any existing `plan.md`, `tasks.json`, and relevant files or symbols
- **Dependencies and prior decisions:** already-resolved tasks, evidence, and choices to preserve
- **Non-goals:** explicit exclusions
- **Acceptance criteria:** what must be true for the advisory to be complete
- **Discovery level cap:** 0–3, set by the parent
- **Research state:** resolved research, remaining gaps, and questions that must return to the parent
- **Parent-provided task-relevant Hindsight context:** include only relevant prior decisions. If context is missing, return the context gap to the parent instead of broadening memory access.
- **Privacy and data minimization:** include only task-relevant evidence. Never include credentials, secrets, private conversation, or unrelated user data.
- **Expected chat-only advisory:** one primary recommendation expressed as an advisory plan draft, proposed task-graph delta, validation findings, risks, assumptions, and open decisions
- **Stop conditions:** scope thresholds, ambiguity limits, missing evidence, or approval gates
- **Approval constraints:** read-only inspection only; identify actions requiring parent approval without performing them

Never send unresolved placeholders. Children must not spawn other agents, schedule sibling work, mutate `.active`, `tasks.json`, `progress.md`, or other lifecycle state, implement production code, or write files. The parent verifies worker evidence and resolves conflicts. The parent alone writes or validates canonical `plan.md` and `tasks.json`. Never hand planning advisory output to a child to render or write canonical `plan.md` or `tasks.json`.

## Load Skills

```typescript
read(".pi/skills/planning-and-task-breakdown/SKILL.md");
```

## Parse Arguments

| Argument | Default  | Description                       |
| -------- | -------- | --------------------------------- |
| none     | —        | Plan based on current spec        |

## Before You Plan

- **Be certain**: Only create tasks you're confident about
- **Don't over-plan**: If the spec is clear, trust it
- **Budget context**: Target ~50% context per execution
- **Vertical slices**: Each task should cover one feature end-to-end

## Phase 0: Institutional Research (Mandatory)

Before touching the PRD or planning anything, load what the codebase already knows.

**This step is not optional.** Skipping it means planning in the dark.

### Step 1: Search project context

Use automatically recalled Hindsight project context first for bugfixes, existing plans, and prior decisions. If a material gap remains, call `hindsight_recall` with a topic-bounded query; use `hindsight_reflect` only when synthesis across memories is required. Incorporate relevant context directly and do not re-solve settled problems.

### Step 2: Mine git history

```bash
# What has changed recently in affected areas?
git log --oneline -20

# Who wrote the relevant code and when?
git log --oneline --follow -- <relevant-file-path>

# What patterns appear in recent commits?
git log --oneline --all | head -30
```

Look for:

- Commit conventions (how this team names things)
- Recent changes to files you'll touch (merge conflict risk)
- How similar features were implemented before
- Any "fix:", "revert:", "hotfix:" commits near your scope (footgun zones)

### Step 3: Run local-discovery task (if Level 2-3 work)

```typescript
const localEvidence = await agents.run({
  name: "planning-local-evidence",
  model: "openai-codex/gpt-5.6-luna",
  thinking: "medium",
  tools: ["read", "grep", "find", "ls"],
  task: `Search the codebase for patterns, conventions, and existing implementations related to: [FEATURE].

  Run these searches:
  - grep for relevant function names and patterns
  - Find similar existing features
  - Check test patterns for this domain
  - Look for any TODO/FIXME comments in relevant files

  Return: existing patterns to follow, files to be aware of, and any gotchas.`,
});
return localEvidence.text;
```

**Only after completing Phase 0** do you proceed to planning. The research phases must use this context.

## Phase 1: Guards

Verify:

- `.pi/artifacts/$(cat .pi/artifacts/.active)/spec.md` exists (if not, tell user to run `/create` first)
- The authoritative `tasks.json` exists and passes `node --experimental-strip-types .pi/scripts/task-graph.ts validate <tasks.json>` before planning.
- If `.pi/artifacts/$(cat .pi/artifacts/.active)/plan.md` already exists, stop for explicit approval: overwrite or skip?

### Approval Checkpoints

Invoking `/plan` authorizes creation of the first canonical `plan.md`. It does not authorize broader workspace or lifecycle changes.

- Overwriting an existing `plan.md` requires explicit approval.
- Creating unrelated extra files requires explicit approval.
- Changing `.active` or mutating an unrelated active artifact requires explicit approval.
- Committing, merging, integrating, pushing, or deploying requires explicit approval.
- Adding dependencies or running a destructive operation requires explicit approval.

When required approval is absent, stop at a checkpoint and preserve the verified work.

## Phase 2: Discovery Assessment

Before research, determine discovery level based on PRD:

| Level | Scope                | When to Use                                                       | Action                                      |
| ----- | -------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| **0** | Skip                 | Pure internal work, existing patterns only (grep confirms)        | Skip research, proceed to decomposition     |
| **1** | Quick (2-5 min)      | Single known library, confirming syntax/version                   | `context7 resolve-library-id + query-docs`  |
| **2** | Standard (15-30 min) | Choosing between 2-3 options, new external integration            | One foreground Fabric external-research run |
| **3** | Deep (1+ hour)       | Architectural decision, novel problem, multiple external services | Parallel distinct Fabric research runs      |

**Depth indicators:**

- Level 2+: New library not in package.json, external API, "choose/select/evaluate"
- Level 3: "architecture/design/system", data modeling, auth design

**Decision:** Ask user to confirm or adjust:

```typescript
question({
  questions: [
    {
      header: "Discovery Level",
      question: "Suggested discovery level based on PRD complexity. Proceed?",
      options: [
        {
          label: "Deep (Recommended for complex work)",
          description: "Level 2-3: run external-research and local-discovery tasks",
        },
        { label: "Standard", description: "Level 1: quick doc lookup" },
        { label: "Skip research", description: "Level 0: I know the codebase" },
      ],
    },
  ],
});
```

Determine level from PRD content: Level 2+ if new library, external API, or "choose/evaluate" language. Level 3 if "architecture/design/system".

## Phase 3: Research (if Level 1-3)

Read the PRD and extract tasks, success criteria, affected files, scope.

Gather only the implementation context required by the selected level:

| Fabric task role  | Purpose                                                              |
| ----------------- | -------------------------------------------------------------------- |
| Local discovery   | Codebase patterns, affected file structure, test patterns, conflicts |
| External research | Best practices, common patterns, pitfalls                            |

- **Level 2:** Use one foreground external-research `agents.run` call with the exact question because planning depends on its answer.
- **Level 3:** The parent first defines distinct `{angle}` values (for example: ecosystem precedent, security constraints, operational risk, migration path). Issue at most three resolved Fabric runs in the current wave with `Promise.all`, then inspect the results. Process additional questions in later sequential shards before synthesis. Never repeat the same broad task across children.
- Local discovery uses a separate read-only Fabric run with a bounded file/symbol question. The parent joins research, resolves conflicts, and writes the plan.

## Phase 4: Goal-Backward Analysis

**Forward planning:** "What should we build?" → produces tasks
**Goal-backward:** "What must be TRUE for the goal to be achieved?" → produces requirements

### Step 1: Extract Goal from PRD

Take success criteria from PRD. Must be outcome-shaped, not task-shaped.

- Good: "Working chat interface" (outcome)
- Bad: "Build chat components" (task)

### Step 2: Derive Observable Truths

"What must be TRUE for this goal to be achieved?" List 3-7 truths from USER's perspective.

Example for "working chat interface":

- User can see existing messages
- User can type a new message
- User can send the message
- Sent message appears in the list
- Messages persist across page refresh

**Test:** Each truth verifiable by a human using the application.

**For UI PRDs:** Include truths for state and recovery coverage, not just happy paths:

- User can understand where they are and what scope the screen/action affects
- User can identify the single primary action and the result of triggering it
- Empty, loading, error, and success states are visible where data/async work exists
- User can recover from failure with retry, undo, fallback, or support path
- Dangerous actions communicate consequences before execution
- Forms expose labels, helper text, validation, and accessible errors

### Step 3: Derive Required Artifacts

For each truth: "What must EXIST for this to be true?"

| Truth                          | Required Artifacts                                              |
| ------------------------------ | --------------------------------------------------------------- |
| User can see existing messages | Message list component, Messages state, API route, Message type |
| User can send a message        | Input component, Send handler, POST API                         |

**Test:** Each artifact = a specific file or database object.

### Step 4: Identify Key Links

"Where is this most likely to break?" Critical connections where breakage causes cascading failures.

| From      | To        | Via                 | Risk                                |
| --------- | --------- | ------------------- | ----------------------------------- |
| Input     | API       | `fetch` in onSubmit | Handler not wired                   |
| API       | Database  | `prisma.query`      | Query returns static, not DB result |
| Component | Real data | `useEffect` fetch   | Shows placeholder, not messages     |

**For UI PRDs:** Add UX failure links where relevant:

| From               | To                 | Via                          | Risk                                     |
| ------------------ | ------------------ | ---------------------------- | ---------------------------------------- |
| Destructive action | Confirmation/undo  | Dialog, toast, or action log | User deletes wrong entity or cannot undo |
| Form field         | Validation message | `aria-describedby` / focus   | User cannot find or understand the error |
| Async action       | Loading/recovery   | Button state, toast, banner  | User double-submits or hits a dead end   |
| Filtered data      | Empty/no-results   | Query state + empty copy     | User thinks data is missing or corrupted |

## Phase 5: Decompose with Context Budget

**Quality Degradation Rule:** Target ~50% context per execution. More plans, smaller scope = consistent quality.

| Task Complexity | Max Tasks | Context/Task | Total   |
| --------------- | --------- | ------------ | ------- |
| Simple (CRUD)   | 3         | ~10-15%      | ~30-45% |
| Complex (auth)  | 2         | ~20-30%      | ~40-50% |
| Very complex    | 1-2       | ~30-40%      | ~30-50% |

**Split signals (create child plans):**

- More than 3 tasks
- Multiple subsystems (DB + API + UI)
- Any task with >5 file modifications
- Checkpoint + implementation in same plan
- Discovery + implementation in same plan

Assess size to determine plan structure:

| Size          | Files     | Approach                                 |
| ------------- | --------- | ---------------------------------------- |
| S (1-3 files) | 2-4 tasks | Single plan, no phases                   |
| M (3-8 files) | 5-8 tasks | 2-3 phases                               |
| L (8+ files)  | 9+ tasks  | Split into separate plans for each subsystem |

## Phase 6: Refine the Authoritative Task Graph

`tasks.json` is the only authoritative persisted work graph. Preserve its task IDs. When planning splits, merges, or changes a node, update `tasks.json` first, re-run task-graph validation, and only then regenerate the explanatory dependency section below. If plan task IDs and canonical task IDs diverge, stop rather than guessing.

**For each task, record:**

- `needs`: What must exist before this runs
- `creates`: What this produces
- `has_checkpoint`: Requires user interaction?

**Example:**

```
Task A (User model): needs nothing, creates src/models/user.ts
Task B (User API): needs Task A, creates src/api/users.ts
Task C (User UI): needs Task B, creates src/components/UserList.tsx

Wave 1: A (independent)
Wave 2: B (depends on A)
Wave 3: C (depends on B)
```

**Derived wave snapshots explain likely parallel execution, but `/ship` recomputes the live frontier from `tasks.json`.** Label every displayed wave as derived, not authoritative.

**Vertical slices preferred:** Each plan covers one feature end-to-end (model + API + UI)
**Avoid horizontal layers:** Don't create "all models" then "all APIs" then "all UI"

## Phase 7: Write Plan

Write `.pi/artifacts/$(cat .pi/artifacts/.active)/plan.md`:

### Required Plan Header

````markdown
# [Feature] Implementation Plan

> **For Pi:** Implement this plan task-by-task.

**Goal:** [Outcome-shaped goal from PRD]

**Discovery Level:** [0-3] - [Rationale]

**Context Budget:** [Estimated context usage, target ~50%]

---

## Must-Haves

### Observable Truths

(What must be TRUE for the goal to be achieved?)

1. [Truth 1]
2. [Truth 2]
3. [Truth 3]

### Required Artifacts

| Artifact         | Provides       | Path                  |
| ---------------- | -------------- | --------------------- |
| [File/component] | [What it does] | `src/path/to/file.ts` |

### Key Links

| From        | To    | Via     | Risk           |
| ----------- | ----- | ------- | -------------- |
| [Component] | [API] | `fetch` | [Failure mode] |

### Boundaries and Testability (conditional)

Include this section only when the feature introduces or changes a module boundary; omit it otherwise. Black-box and gray-box are verification perspectives, not module-design categories.

#### Module Boundaries

| Boundary | Hidden decision | Public behavior |
| -------- | --------------- | --------------- |
| [Boundary] | [Decision hidden behind it] | [Externally visible contract] |

#### Proposed Seams

| Seam | Substitution need | Enabling point | Real alternative implementation |
| ---- | ----------------- | -------------- | ------------------------------- |
| [Seam] | [Volatile dependency or decision] | [Where selection occurs] | [Alternative that will exist] |

A proposed seam must name all three fields. If any of them is missing, do not add the seam.

#### Gray-Box Exceptions

| Verification | Internal knowledge used | Why externally observable behavior is insufficient |
| ------------ | ----------------------- | -------------------------------------------------- |
| [Check] | [Implementation knowledge] | [Evidence gap at the public boundary] |

Gray-box knowledge does not justify mocking internals.

## Derived Dependency Graph

> Wave labels are a derived snapshot of the current authoritative `tasks.json`.

```

Task A: needs nothing, creates src/models/X.ts
Task B: needs Task A, creates src/api/X.ts
Task C: needs Task B, has_checkpoint, creates src/components/X.tsx

Wave 1: A
Wave 2: B
Wave 3: C

```

## Tasks

### Task Standards:

- **Exact file paths** — never "add to the relevant file"
- **Complete code** — never "add validation logic here"
- **Exact commands with expected output**
- **TDD order** — test first, then implementation
- **Each step is 2-5 minutes** — one action per step
- **Tasks map to PRD tasks**
- **UI state coverage** — UI tasks list empty/loading/error/success states when applicable
- **UX recovery path** — async/destructive/form tasks include retry/undo/confirm/error handling
- **Accessibility wiring** — form and interactive tasks include labels, focus behavior, keyboard path, and semantic HTML
````

## Phase 8: Constitutional Compliance Gate

Before executing, scan the plan against AGENTS.md hard constraints. This catches violations before they become implementation bugs.

### Automated Checks

Scan `plan.md` content for these patterns:

| Violation Pattern                                 | AGENTS.md Rule                              | Severity     |
| ------------------------------------------------- | ------------------------------------------- | ------------ |
| `git add .` or `git add -A`                       | Multi-Agent Safety: stage specific files    | **CRITICAL** |
| `--force` push or `force push`                    | Git Safety: never force push main           | **CRITICAL** |
| `--no-verify`                                     | Git Safety: never bypass hooks              | **CRITICAL** |
| `as any` or `@ts-ignore` without justification    | Quality Bar: strong typing                  | **WARNING**  |
| New package/dependency without approval step      | Guardrails: no new deps without approval    | **WARNING**  |
| Task modifying >3 files without plan confirmation | Guardrails: no surprise edits               | **WARNING**  |
| `reset --hard` or `checkout .` or `clean -fd`     | Git Restore: never without explicit request | **CRITICAL** |
| Secret/credential patterns                        | Security: never expose credentials          | **CRITICAL** |

### Check Process

```bash
ACTIVE_SLUG=$(cat .pi/artifacts/.active 2>/dev/null)
if [ -z "$ACTIVE_SLUG" ]; then echo "No active feature."; exit 1; fi
ARTIFACT_DIR=".pi/artifacts/$ACTIVE_SLUG"
# Scan plan for violation patterns (fixed-string mode to avoid regex false positives)
grep -inF "git add ." "$ARTIFACT_DIR/plan.md"
grep -inF "git add -A" "$ARTIFACT_DIR/plan.md"
grep -inF -- "--no-verify" "$ARTIFACT_DIR/plan.md"
grep -inF "force push" "$ARTIFACT_DIR/plan.md"
grep -inF -- "--force" "$ARTIFACT_DIR/plan.md"
grep -inF "reset --hard" "$ARTIFACT_DIR/plan.md"
grep -inF "checkout ." "$ARTIFACT_DIR/plan.md"
grep -inF "clean -fd" "$ARTIFACT_DIR/plan.md"
```

Also check:

- Count files per task: if any task lists >3 files in its `files:` metadata, flag as WARNING
- Check for `as any` or `@ts-ignore` usage that lacks a documented reason
- Check if any task adds new dependencies (look for `npm install`, `pnpm add`, `yarn add`, `pip install`, `cargo add`)

### Violation Response

| Severity     | Action                                                             |
| ------------ | ------------------------------------------------------------------ |
| **CRITICAL** | Stop. Remove violation from plan. Report to user.                  |
| **WARNING**  | Flag in plan output. Add confirmation checkpoint to affected task. |

If no violations found, report: `Constitutional compliance: [x] PASS`

If violations found:

```markdown
## [!]️ Constitutional Compliance Check

| #   | Pattern Found        | Location       | Severity | Action                              |
| --- | -------------------- | -------------- | -------- | ----------------------------------- |
| 1   | `git add .`          | Task 3, step 2 | CRITICAL | Removed — use specific file staging |
| 2   | New dependency `zod` | Task 1         | WARNING  | Added approval checkpoint           |

Violations resolved. Plan is compliant.
```

## Phase 9: Handoff to `/ship`

When planning is complete:

1. Validate the authoritative task graph:
   ```bash
   node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/$(cat .pi/artifacts/.active)/tasks.json
   ```
2. Confirm `spec.md`, `plan.md`, and `tasks.json` are consistent. If they diverge, update `tasks.json` first; it owns scheduling.
3. Summarize the ready frontier, any blocked tasks, and open questions.
4. Transition to `/ship` with the explicitly selected active slug and validated graph.

`.active` remains unchanged during handoff. Any later active-artifact switch is exceptional, parent-owned, and requires explicit approval. Do not implement or commit during the planning handoff.

## Phase 10: Report

Output:

1. **Discovery Level:** [0-3] with rationale
2. **Must-Haves:** [N] observable truths, [M] required artifacts, [K] key links
3. **Context Budget:** [Estimated usage]
4. **Dependency Waves:** [N] waves for parallel execution
5. **Task count:** [N] tasks, [M] TDD steps
6. **Files affected:** [List]
7. **Plan location:** `.pi/artifacts/$(cat .pi/artifacts/.active)/plan.md`
8. **Next step:** `/ship`

---

## Related Commands

| Need           | Command      |
| -------------- | ------------ |
| Create spec    | `/create`    |
| Execute plan   | `/ship`      |
| Research first | `/research`  |
