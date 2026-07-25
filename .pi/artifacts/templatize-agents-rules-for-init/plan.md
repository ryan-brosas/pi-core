# Templatize mandatory AGENTS.md rules for `/init` — Implementation Plan

> **For Pi:** Execute the canonical task IDs in `tasks.json`. This plan explains TDD steps and derived ordering; it is not a second execution graph.

**Goal:** Make `/init` safely create or merge a concise, project-specific `AGENTS.md` that always retains the mandatory safety/evidence kernel, includes only verified project facts and conditional workflows, preserves user-authored content, and accurately explains context activation.

**Discovery Level:** 0 — this is a three-file, dependency-free change to existing Markdown prompt/template contracts and their established static test harness. Completed research and review already resolved the Pi 0.82.0 behavior; repository grep and history confirmed the local patterns, so further external research would duplicate evidence.

**Context Budget:** ~45% total across two sequential executions. `task-1`: ~20%; `task-2`: ~25%. Each task owns two files and should complete without compaction.

**Canonical graph:** `.pi/artifacts/templatize-agents-rules-for-init/tasks.json`

**Derived plan revision:** 1

---

## Institutional Findings

- Project memory assigns durable operating instructions to `AGENTS.md` and skills, while slash-command behavior belongs in `.pi/prompts/`; the policy source must remain an inert scaffold explicitly consumed by `/init`.
- Project memory warns that fan-out tests must distinguish actual agent concurrency from unrelated line/tool-call budgets. Reuse the existing `explicitDispatchCountErrors` harness instead of adding a broad numeric grep.
- `.pi/prompts/init.md` has only the baseline commit in its history, so there is no prior merge-policy implementation to preserve; make targeted edits to its existing phases rather than restructuring the entire command.
- `.pi/tests/skill-system.test.ts` has recent policy-hardening commits and already uses `readRequired`, semantic regular expressions, synthetic positive/negative fan-out fixtures, and generated per-surface tests. Follow those patterns.
- The completed `research.md` and PRD review establish five critical constraints: the scaffold is not a Pi prompt template, existing content cannot be truncated to meet a line budget, destructive actions retain the complete two-confirmation sequence, optional tools require project/configuration evidence plus executable validation, and generated context activates only after `/reload` or a new session.
- Current baseline evidence: the focused `skill-system.test.ts` suite passes 26/26 and all artifact graphs validate. The broad suite currently has one unrelated failure because `.pi/tests/prompt-leverage.test.ts` imports a concurrently deleted `.pi/extensions/prompt-leverage.ts`; implementation must not restore or modify that unrelated surface, but task completion still requires a green retained suite or an explicit blocker rather than a false pass.

## Must-Haves

### Observable Truths

1. A user initializing a fresh project receives every mandatory authority, deletion, destructive-action, concurrent-work, Git-approval, editing/generated-source, evidence, and bounded-delegation gate.
2. A user initializing an existing project sees what will be preserved, added, repaired, or omitted before any `AGENTS.md` write occurs.
3. Existing user-authored content is never silently truncated or dropped to force the 150-line budget; oversized merges preserve content and report the exception.
4. Generated project-profile facts and optional tool workflows appear only when the target repository provides sufficient evidence and validation succeeds.
5. Git preferences never become standing authorization for commits, publication, legacy-branch synchronization, or other integration actions.
6. Deep initialization uses distinct bounded inputs, never exceeds three concurrent agents in a wave, processes overflow sequentially, and stops when evidence is sufficient.
7. After `AGENTS.md` changes, the user is told to run `/reload` or start a new session and is not told that the new contract already governs the current turn.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Policy scaffold | Compact universal kernel, project-derived section guidance, merge constraints | `.pi/templates/agents-policy.md` |
| Init generator contract | Detection, classification, preview, merge, bounded discovery, activation report | `.pi/prompts/init.md` |
| Policy tests | Deterministic semantic assertions and orchestration fan-out coverage | `.pi/tests/skill-system.test.ts` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| Policy scaffold | `/init` | Explicit `read(".pi/templates/agents-policy.md")` instruction | Scaffold exists but is never consumed |
| `/init` detection | Generated project profile | Validated repository facts and commands | Stale or invented toolchain instructions |
| Project/config evidence | Optional workflow section | Configuration evidence plus executable validation | A tool on `PATH` becomes an unsupported mandatory workflow |
| Existing `AGENTS.md` | Proposed merged output | Preservation/conflict/omission preview | User-authored rules are silently lost |
| Mandatory kernel | Conflicting existing rule | Mandatory gate wins after conflict disclosure | Existing rules weaken deletion or publication safety |
| New-file line budget | Generated `AGENTS.md` | Explicit maximum-150 contract | Monolithic output obscures the useful rules |
| Oversized existing file | Merge result | Preserve content, minimize generated additions, report exception | The line budget causes unauthorized truncation |
| Generated `AGENTS.md` | Pi model context | `/reload` or next session | User assumes new safeguards are already active |
| Policy tests | Scaffold and init prompt | `readRequired` plus semantic assertions | Wording drifts without deterministic detection |

## Contract Decisions

### Scaffold identity and structure

`.pi/templates/agents-policy.md` is an inert source document, not an auto-discovered slash command and not an active context file. Its opening note must state that `/init` reads it explicitly and that generated projects receive a synthesized contract rather than a verbatim copy.

Use these compact sections:

1. Authority and action scope.
2. No deletion without written permission naming paths.
3. Destructive/irreversible action protocol: preflight, first written confirmation, refreshed preflight, second immediate confirmation, exact execution, and audit.
4. Concurrent and unrelated work preservation.
5. Git, branch, integration, publication, and deployment approval.
6. Manual targeted edits, no speculative file proliferation, and generated-source discipline.
7. Evidence-before-claims and narrow-to-broad verification.
8. Bounded delegation with parent inspection when subagents exist.
9. Project-derived sections and merge rules for `/init` to resolve from evidence.

The universal body may name generic concepts such as package manager or primary branch, but it must not hardcode a concrete runtime, package manager, branch name, verification command, target checkout, or optional workflow tool.

### Merge and line-budget behavior

- New `AGENTS.md` files must be at most 150 lines.
- Existing custom content is preserved unless it directly weakens a mandatory gate.
- Conflicts are shown in the preview; mandatory safety language wins in the proposed output.
- If the existing file is already oversized or preservation plus the kernel cannot fit, `/init` minimizes only its own additions with pointers and reports the exception. It does not truncate user-authored content.
- Cancellation at preview leaves the target unchanged.

### Optional-tool evidence

A conditional workflow requires both:

1. repository or configuration evidence that the workflow belongs to the project; and
2. successful validation that the referenced command/tool is available.

Executable presence alone is insufficient. Unsupported tools are listed as omitted in the preview rather than included as mandatory instructions.

### Static-test boundary

Tests verify the policy-generation contract, not exact model-generated prose. Assertions should check semantic categories, ordering for the destructive-action protocol, explicit scaffold wiring, merge/line-budget rules, forbidden standing authorizations, bounded fan-out, and activation disclosure. Do not introduce snapshots, mocks, a renderer, or test-only production behavior.

## Derived Dependency Graph

> Wave labels are a derived snapshot of the current authoritative `tasks.json`. `/ship` must recompute the live frontier after every task transition.

```text
task-1 — Lock the reusable policy contract
  needs: nothing
  creates: .pi/templates/agents-policy.md and focused scaffold policy tests
  has_checkpoint: false

        ↓

task-2 — Integrate evidence-backed policy synthesis into /init
  needs: task-1
  creates: wired /init synthesis contract and complete init policy coverage
  has_checkpoint: false

Derived Wave 1: task-1
Derived Wave 2: task-2
```

No parallel execution is valid because both tasks modify `.pi/tests/skill-system.test.ts`, and `task-2` consumes the scaffold established by `task-1`.

## Tasks

### Task standards

- Use exact paths and preserve unrelated/concurrent changes.
- Add the smallest failing semantic assertion before changing the scaffold or prompt.
- Confirm RED is caused by missing required behavior, not syntax, a broken regex, or an unrelated workspace failure.
- Make the minimum documentation/prompt change needed for GREEN, then refactor wording without changing behavior.
- Run the focused test after each RED/GREEN cycle and the full affected test file before advancing task state.
- Do not add an extension, dependency, executable generator, package metadata, or runtime state.

## task-1 — Lock the reusable policy contract `[test]`

**End state:** The inert policy scaffold exists, stays within 150 lines, and focused tests prove its universal gates and absence of target-project assumptions.

**Files:** `.pi/tests/skill-system.test.ts`, `.pi/templates/agents-policy.md`

**Needs:** none

**Creates:** reusable policy source plus deterministic scaffold contract

**Has checkpoint:** false

**Context target:** ~20%

### TDD steps

1. Read the current end of `.pi/tests/skill-system.test.ts` and place the new test near other prompt/policy contract tests without reordering unrelated tests.
2. Add `test("init policy scaffold carries universal gates without project assumptions", ...)` using `readRequired(".pi/templates/agents-policy.md")`.
3. Assert the scaffold is at most 150 lines and semantically covers authority, named-path deletion approval, concurrent-work preservation, Git/integration approval, targeted edits/generated sources, evidence-before-claims, and parent-verified bounded delegation.
4. Assert the destructive-action terms occur in required order: preflight → first confirmation → refreshed preflight → second confirmation → exact execution → audit.
5. Assert the scaffold identifies itself as an inert `/init` source and does not hardcode concrete package managers, runtimes, legacy-branch synchronization, target checkout paths, project verification commands, or named optional workflow tools.
6. Run the focused test and confirm RED because `.pi/templates/agents-policy.md` is missing; a syntax or assertion-construction failure is not acceptable RED.
7. Create `.pi/templates/agents-policy.md` with the nine contract sections above and concise generation directives for project-derived and merge content.
8. Run the focused test; make only the minimum wording corrections until GREEN.
9. Run the direct 150-line check and inspect the scaffold for copied ACFS manuals or unresolved fill-in placeholders.
10. Run the full `skill-system.test.ts` suite and whitespace checks for the two owned files.

**RED verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="init policy scaffold" .pi/tests/skill-system.test.ts
```

Expected RED: one named failure reporting the missing required scaffold; unrelated tests remain green or skipped by the name filter.

**GREEN verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="init policy scaffold" .pi/tests/skill-system.test.ts
test "$(wc -l < .pi/templates/agents-policy.md)" -le 150
node --experimental-strip-types --test .pi/tests/skill-system.test.ts
git diff --check -- .pi/templates/agents-policy.md .pi/tests/skill-system.test.ts
```

Expected GREEN: focused test exits 0, line check exits 0, and the full affected suite reports all tests passed.

## task-2 — Integrate evidence-backed policy synthesis into `/init` `[workflow]`

**End state:** `/init` explicitly consumes the scaffold, safely classifies/previews/merges instructions, bounds discovery, removes standing Git authorization, and reports activation accurately.

**Files:** `.pi/tests/skill-system.test.ts`, `.pi/prompts/init.md`

**Needs:** task-1

**Creates:** complete `/init` synthesis and safety contract

**Has checkpoint:** false

**Context target:** ~25%

### TDD steps

1. Re-run the task-1 focused and full affected tests to confirm a green dependency baseline.
2. Add `.pi/prompts/init.md` to `orchestrationSurfaces` so the existing generated fan-out test enforces max-three waves, sequential overflow, Pi-native routing, omitted model/thinking overrides, and parent inspection/verification.
3. Add `test("init policy synthesis preserves evidence and existing content", ...)` asserting explicit scaffold reading; mandatory/project-detected/conditional/conflicting/preserved-custom classification; command validation; dual evidence for optional tools; preview of additions, preservation, repairs, omissions, and line-budget exceptions; no blind replacement; and cancellation without writes.
4. In the synthesis test, assert new files have a 150-line maximum and oversized existing files preserve user content, minimize only generated additions, and report the exception.
5. Add `test("init policy safety requires fresh Git approval", ...)` asserting the `Auto-commit` option is absent, each commit/publication action still requires explicit confirmation, and no automatic push or legacy-branch synchronization is authorized.
6. Add `test("init policy activation requires reload or a new session", ...)` asserting the output names both activation paths and does not claim immediate activation.
7. Run the four focused names (`synthesis`, `safety`, `activation`, and generated init fan-out) and confirm RED only from missing `/init` contract language.
8. Update the `/init` routing/deep-discovery contract: at most three distinct agents per wave, sequential shards for overflow, parent inspection, finite discovery, and a medium-or-higher-confidence stopping rule; remove the arbitrary large tool-call target.
9. Expand Mode 1 detection to gather existing instructions, generated/runtime-managed paths, compatibility/lifecycle contracts, project/config evidence for optional tools, and executable validation without inventing unsupported facts.
10. Replace the current generic preview with a classification preview listing mandatory, project-detected, conditional, conflicting, preserved-custom, omitted, and line-budget-exception content.
11. In the AGENTS creation phase, explicitly read `.pi/templates/agents-policy.md`; synthesize rather than copy; preserve existing custom content; let mandatory gates win only after conflict disclosure; enforce 150 lines for new files; and apply the oversized-existing-file exception without truncation.
12. Replace the standing `Auto-commit` preference with wording that may offer a commit but requires fresh confirmation for each commit and publication action.
13. Extend `/init` output to distinguish created versus merged `AGENTS.md` and instruct the user to run `/reload` or start a new session; state that the new policy is not active earlier in the current turn.
14. Run the focused tests and make the minimum prompt wording changes until GREEN.
15. Run the full `skill-system.test.ts` suite, then validate every artifact graph and run the complete retained test suite.
16. If the broad suite still fails only because of the unrelated missing prompt-leverage extension, preserve that work, record the exact blocker in `progress.md`, and do not mark `task-2` passed. Do not broaden this feature to repair or restore unrelated files.
17. Inspect the final three-file implementation diff for duplicated policy prose, stale OpenCode wording, unsupported tool assumptions, and accidental implementation beyond the PRD.

**RED verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="init policy synthesis|init policy safety|init policy activation|init.*fan-out|fan-out.*init" .pi/tests/skill-system.test.ts
```

Expected RED: synthesis, safety, activation, and/or init fan-out fail because the current prompt lacks the specified behavior; the test file itself loads successfully.

**GREEN verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="init policy synthesis|init policy safety|init policy activation|init.*fan-out|fan-out.*init" .pi/tests/skill-system.test.ts
node --experimental-strip-types --test .pi/tests/skill-system.test.ts
for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done
node --experimental-strip-types --test .pi/tests/*.test.ts
git diff --check -- .pi/templates/agents-policy.md .pi/prompts/init.md .pi/tests/skill-system.test.ts
```

Expected GREEN: all focused and affected tests pass, all graphs validate, the retained suite passes, and whitespace checks are clean.

## Blast Radius and Rollback

- **Entry point:** `/init` expansion from `.pi/prompts/init.md`.
- **Direct dependents:** generated project-root `AGENTS.md`, `.pi/tech-stack.md` selection flow, user-profile Git preference, and `skill-system.test.ts` policy coverage.
- **Context effect:** generated instructions are loaded only after `/reload` or a new session.
- **Public contract:** existing `AGENTS.md` content is preservation-first; mandatory gates cannot be silently weakened; unsupported optional tools are omitted.
- **Rollback boundary:** the implementation is file-local to the scaffold, init prompt, and static tests. No dependency, migration, package, extension, or runtime state must be undone.
- **Concurrent-work rule:** if another process changes an owned implementation file after a task begins, stop that task, preserve both versions, and report the overlap rather than choosing a winner.

## Stop Conditions

- `.pi/artifacts/.active` no longer points to `templatize-agents-rules-for-init`.
- `tasks.json` fails validation or plan task IDs diverge from `task-1` and `task-2`.
- RED fails because of broken test construction rather than missing policy behavior.
- The scaffold cannot express the mandatory kernel within 150 lines without weakening a gate.
- Safe merge behavior would require deterministic file transformation code, a new extension, or a dependency outside the approved prompt-contract scope.
- An owned implementation file receives overlapping concurrent edits.
- The retained suite cannot pass; record the exact external blocker and leave the affected task unpassed.

## Constitutional Compliance

- No destructive filesystem or Git operations, verification bypasses, broad staging, secrets, dependencies, commits, pushes, branches, worktrees, or deployments are planned.
- Each canonical task owns exactly two files and all work remains within the three approved implementation surfaces.
- The new file has a distinct required responsibility as the canonical policy scaffold and is explicitly wired from `/init`.
- Existing content is preservation-first; no line-budget rule authorizes truncation or deletion.
- TDD ordering is explicit for both tasks, and the authoritative graph remains version 2 with stable IDs.

**Result:** PASS — no critical violations or confirmation checkpoints are required for the planned implementation itself.