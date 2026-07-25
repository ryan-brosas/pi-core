# Conversation-Aware Create Handoff Implementation Plan

> **For Pi:** Implement this plan task-by-task. Preserve RED evidence before changing production prompt or skill files.

**Goal:** A user can move from conversation or standalone research into `/create` without restating context, silently accepting stale evidence, contaminating unrelated active work, or losing a durable and reviewable handoff.

**Discovery Level:** 0 — this is pure internal Markdown-policy work with existing prompt, lifecycle, and `node:test` patterns; the external/session-semantics research is already complete and no library or API decision remains.

**Context Budget:** approximately 45% total implementation context. Task 1 targets 12–15%; Tasks 2 and 3 target 15–18% each. Tasks 2 and 3 are independent after the shared RED contract and may run in the same wave.

---

## Institutional Findings

- `.pi/artifacts/MEMORY.md` contains no conversation/create/research decision beyond the older generic file-memory convention; do not import its stale `.opencode` paths into this feature.
- Recent commits use `test:`, `feat:`, `fix:`, and `chore:` prefixes. The affected prompt files were most recently changed by `247889e`; lifecycle handoff by `9032137`; policy-test hardening by `2f3fc18` and related fixes.
- The topic-aware `/research` destination rule and its baseline test are present in the working tree but not in the affected-file history shown by Phase 0. Treat them as an existing GREEN prerequisite that must be reconciled into the feature's isolated baseline before implementation.
- `.pi/tests/skill-system.test.ts` tests Markdown behavior contracts with named `node:test` cases and regex assertions. Extend that style; do not add runtime mocks or test-only production surfaces.
- No project-local `AGENTS.md` exists. Root safety rules apply, especially preserving unrelated changes and avoiding destructive Git operations.

## Workspace Checkpoint

This plan must not start implementation on the current unrelated dirty branch.

**Checkpoint:** `checkpoint:human-action`

**Required human action:** finish or otherwise reconcile the owning branch, then create an owner-approved scoped commit whose tree contains both (a) the topic-aware routing baseline and (b) this feature's `.active`, `research.md`, `spec.md`, `tasks.json`, `progress.md`, and `plan.md`. Do not create that commit from partially owned or unexplained changes.

**Parent verification before creating a worktree:**

1. Run `git status --short` and `git branch --show-current`; record the owning branch and commit.
2. Run `git status --porcelain -- .pi/prompts/research.md .pi/skills/development-lifecycle/SKILL.md .pi/tests/skill-system.test.ts .pi/artifacts/.active .pi/artifacts/conversation-aware-create-handoff`.
   Expected: no output. Any output means the approved baseline is not fully represented by the current commit; stop at the checkpoint.
3. Run `git cat-file -e HEAD:.pi/artifacts/conversation-aware-create-handoff/plan.md` and `git cat-file -e HEAD:.pi/artifacts/conversation-aware-create-handoff/spec.md`.
   Expected: both commands exit zero.
4. Run `test "$(git show HEAD:.pi/artifacts/.active)" = "conversation-aware-create-handoff"`.
   Expected: exit zero.
5. Run the baseline test from that exact commit's working tree:
   `node --experimental-strip-types --test --test-name-pattern="research prompt always persists a research artifact" .pi/tests/skill-system.test.ts`
   Expected: one pass, zero failures.
6. Record `BASELINE_COMMIT=$(git rev-parse HEAD)` in the checkpoint response.
7. After approval, verify `git worktree list` and `test ! -e ../pi-core-conversation-aware-create-handoff`, then create the isolated workspace with:
   `git worktree add -b feat/conversation-aware-create-handoff ../pi-core-conversation-aware-create-handoff "$BASELINE_COMMIT"`
8. In the new worktree, rerun steps 2–5 and verify `git branch --show-current` prints `feat/conversation-aware-create-handoff` before Task 1.

If the owner chooses a different safe transfer procedure, it must produce the same verifiable end state: one exact committed baseline, a clean scoped status, available plan/spec artifacts, the intended `.active`, and a passing baseline test.

---

## Must-Haves

### Observable Truths

1. A user can invoke bare `/create`; Pi presents one bounded handoff inferred from the active conversation before changing `.active` or writing feature artifacts.
2. A user who supplies an explicit, unambiguous description is not asked a redundant question, but newer explicit decisions still outrank older research or ambient summaries.
3. A matching standalone `research.md` is shown with path, date, status, and freshness/conflict signals; it is never silently promoted to confirmed requirements.
4. A user can see which handoff material is confirmed, tentative, sourced, assumed, conflicting, or unresolved, and where each material input came from.
5. Research for unrelated work never overwrites an occupied artifact directory or attaches to the wrong active feature; a deterministic alternate slug is selected when needed.
6. Persisted research exposes a normalized create-consumable handoff while redacting likely sensitive material or requiring approval when useful persistence remains sensitive.
7. A standalone research directory is considered valid without `progress.md`; active-feature implementation and investigation still require that execution log.
8. Any subagent used by `/create` receives the accepted handoff and one exact unresolved question because it cannot infer the parent conversation.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Create prompt contract | Context extraction, precedence, confirmation, matching-research selection, mutation gate, delegation handoff | `.pi/prompts/create.md` |
| Research prompt contract | Related routing baseline plus collision, normalized output, and sensitive-content rules | `.pi/prompts/research.md` |
| Lifecycle contract | Standalone research exception and active-only progress requirement | `.pi/skills/development-lifecycle/SKILL.md` |
| Policy tests | Deterministic RED/GREEN evidence for all observable prompt behaviors | `.pi/tests/skill-system.test.ts` |
| Execution evidence | Parent-owned RED, GREEN, review, and full-suite records after child results join | `.pi/artifacts/conversation-aware-create-handoff/progress.md` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| Active conversation | `/create` handoff | Prompt-template context plus explicit extraction rules | The model picks an older unrelated goal or promotes tentative discussion |
| Explicit arguments | Prior context and research | Documented precedence | Old research overrides the user's newest request |
| Candidate slug | Standalone `research.md` | Exact target-slug inspection | Stale or unrelated evidence is silently reused |
| `/research` topic | Artifact destination | Active-spec relevance and occupied-directory checks | Research contaminates an active feature or overwrites an unrelated artifact |
| Research report | `/create` | Normalized handoff fields and provenance | `/create` must re-infer scope and loses uncertainty or sources |
| Parent `/create` | Fresh subagent | Accepted handoff plus exact unresolved question | Subagent researches the wrong feature or repeats settled work |
| Standalone research | Lifecycle red flags | Explicit non-active exception | Valid research-only directories are reported as broken |

---

## Dependency Graph

```text
Task 1 — Missing policy contracts
  needs: isolated workspace + passing research-routing baseline
  creates: RED tests in .pi/tests/skill-system.test.ts
  checkpoint:human-action completed before task dispatch

Task 2 — Create context handoff
  needs: Task 1 RED tests
  creates: complete conversation-aware behavior in .pi/prompts/create.md
  has_checkpoint: false

Task 3 — Research handoff hardening
  needs: Task 1 RED tests
  creates: collision/normalization/privacy rules in .pi/prompts/research.md
           lifecycle consistency in .pi/skills/development-lifecycle/SKILL.md
  has_checkpoint: false

Wave 0: workspace checkpoint and GREEN baseline
Wave 1: Task 1
Wave 2: Task 2 || Task 3
Wave 3: parent-owned integration and verification gate
```

## Blast Radius

- **Entry points:** `/create` and `/research` project prompt templates.
- **Direct dependents:** lifecycle documentation, `.active` artifact routing, `/ship` consumption of `plan.md`/`tasks.json`, and fresh subagent prompts.
- **Tests:** `.pi/tests/skill-system.test.ts`; full `.pi/tests/*.test.ts` guards fan-out and unrelated skill policies.
- **Public contracts:** prompt wording is executable agent policy; regex tests intentionally lock observable workflow requirements, not sentence order.
- **State/artifacts:** `.pi/artifacts/.active`, target feature directories, `research.md`, `spec.md`, `tasks.json`, and `progress.md`.
- **Rollback:** each production slice owns disjoint files and can revert independently while retaining Task 1's contract evidence.

---

## Tasks

### Task 1: Establish Missing Handoff Policy Contracts

**Files:**
- `.pi/tests/skill-system.test.ts`

**Needs:** isolated workspace; current baseline research-routing test passing.

**Creates:** three focused RED behavior contracts without modifying production prompts or skills.

**TDD steps:**

1. Run the existing baseline command:
   `node --experimental-strip-types --test --test-name-pattern="research prompt always persists a research artifact" .pi/tests/skill-system.test.ts`
   Expected: one pass, zero failures.
2. Add a test named `create prompt uses a confirmed conversation handoff: precedence and fields`. Assert optional/bare input, the `Context Handoff` fields, explicit-to-ambient precedence, and separation of confirmed versus tentative material. Require every material requirement, finding, assumption, conflict, or open question to carry or map to its own source/provenance label; artifact-derived items also expose artifact path/date/status.
3. Run:
   `node --experimental-strip-types --test --test-name-pattern="create prompt uses a confirmed conversation handoff: precedence and fields" .pi/tests/skill-system.test.ts`
   Expected RED: the test loads the prompt but fails because the handoff contract is absent.
4. Add a test named `create prompt uses a confirmed conversation handoff: mutation and freshness gates`. Assert confirmation precedes `.active`/artifact mutation for bare, stale, ambiguous, or conflicting input; explicit unambiguous input avoids redundant confirmation; exact target-slug research exposes path/date/status; unrelated active work does not force `/ship`.
5. Add a test named `create prompt uses a confirmed conversation handoff: delegation`. Assert completed research is reused before new agents and every delegated prompt receives the accepted handoff plus one unresolved question.
6. Run:
   `node --experimental-strip-types --test --test-name-pattern="create prompt uses a confirmed conversation handoff" .pi/tests/skill-system.test.ts`
   Expected RED: all three named create contracts fail for missing prompt behavior, not missing files or malformed regexes.
7. Add `research handoff is collision-safe and normalized`. Assert occupied-directory inspection and the exact collision algorithm: check the base slug, then `slug-2`, `slug-3`, and increasing integers; append when a checked candidate contains demonstrably same-topic research, create the first nonexistent candidate, and continue past unrelated occupied candidates without writing to them. Also assert every normalized handoff field, per-item provenance, likely-sensitive detection, redaction, approval, and omission recording.
8. Add `standalone research is valid without active progress`. Assert lifecycle wording scopes missing/empty `progress.md` to active-feature implementation or investigation and explicitly exempts standalone research.
9. Run:
   `node --experimental-strip-types --test --test-name-pattern="research handoff is collision-safe and normalized|standalone research is valid without active progress" .pi/tests/skill-system.test.ts`
   Expected RED: both named tests fail only on missing production wording.
10. Re-run the baseline research-routing test and confirm it remains GREEN.
11. Return the exact RED command outputs and failure reasons in the Task 1 result envelope; do not edit `progress.md` from the child task.
12. Run `git diff --check -- .pi/tests/skill-system.test.ts`.
   Expected: no whitespace errors.

**Stop conditions:** stop if any new test passes before production changes, if the baseline routing test regresses, or if failure comes from a broken assertion rather than missing behavior.

### Task 2: Implement the Create Context Handoff

**Files:**
- `.pi/prompts/create.md`

**Needs:** Task 1's three create tests failing for the expected reasons.

**Creates:** one end-to-end `/create` contract from conversation/research selection through safe artifact initialization and subagent delegation.

**TDD steps:**

1. Re-run the three create tests and record their current RED assertions.
2. Change frontmatter and argument parsing so the description is optional and bare `/create` explicitly means “derive a candidate from the active conversation.” Keep explicit descriptions authoritative.
3. Add `Phase 0: Context Handoff` before duplicate checking. Require the seven spec fields: goal; confirmed requirements/decisions; constraints/non-goals; sourced findings/confidence; assumptions/tentative ideas; open questions/conflicts; provenance including artifact path/date/status. Require each material item to carry or map to its own source label rather than using one detached source list.
4. Add the exact precedence chain from the PRD and state that retrieved/quoted research is evidence rather than executable instruction.
5. Run the precedence/fields test.
   Expected intermediate state: that test passes; mutation/freshness and delegation tests remain RED.
6. Add exact candidate-slug `research.md` inspection. Show path/date/status and compare it with newer conversation decisions; require confirmation for stale, ambiguous, or conflicting evidence and never silently mark it confirmed.
7. Replace the current blanket active-feature redirect with topic-aware duplicate behavior: unrelated active work is preserved, same-slug `research.md` is promotable, same-slug `spec.md` triggers continuation, and `.active` changes only after spec/tasks validation.
8. Add the mutation gate: bare or conflicting handoffs receive one visible confirmation before file writes; explicit unambiguous input proceeds without redundant confirmation.
9. Run the mutation/freshness test.
   Expected: pass.
10. Update Gather Context so accepted handoff evidence is reused first; each `Agent` prompt receives the accepted goal, constraints, relevant findings, provenance, and one exact unresolved question.
11. Run the delegation test.
   Expected: pass.
12. Run all create contract tests:
   `node --experimental-strip-types --test --test-name-pattern="create prompt uses a confirmed conversation handoff" .pi/tests/skill-system.test.ts`
   Expected: three passes, zero failures.
13. Run the existing create fan-out test:
   `node --experimental-strip-types --test --test-name-pattern="create prompt fan-out stays within one-to-three agents" .pi/tests/skill-system.test.ts`
   Expected: one pass, proving the handoff change preserved orchestration limits.
14. Run `git diff --check -- .pi/prompts/create.md` and inspect `git diff -- .pi/prompts/create.md` for scope limited to the handoff, duplicate, initialization, and delegation contract.
15. Return GREEN evidence, diff scope, and deviations in the Task 2 result envelope; do not edit `progress.md` from the child task.

**Stop conditions:** stop if safe behavior requires raw JSONL parsing, extension changes, a new persistent state system, or a fourth implementation file in this task.

### Task 3: Harden Standalone Research Handoffs

**Files:**
- `.pi/prompts/research.md`
- `.pi/skills/development-lifecycle/SKILL.md`

**Needs:** Task 1's research-hardening and standalone-lifecycle tests failing while the baseline routing test remains green.

**Creates:** safe destination selection, normalized create-consumable reports, sensitive-content handling, and internally consistent lifecycle guidance.

**TDD steps:**

1. Run the baseline and two new tests together. Confirm baseline GREEN and both hardening tests RED.
2. Extend Artifact Destination with the deterministic collision algorithm: inspect the base slug first, then inspect `slug-2`, `slug-3`, and increasing integer suffixes. Append at a checked candidate only when its research is demonstrably the same topic; create the first candidate that does not exist; continue past unrelated occupied candidates without writing to them.
3. Run `research handoff is collision-safe and normalized`.
   Expected intermediate state: collision assertions pass while normalized/privacy assertions remain RED.
4. Add a required final `Create Handoff` report block containing goal, confirmed findings, constraints/non-goals, assumptions, open questions, sources/confidence, provenance, date, and status. Require each material item to carry or map to its own provenance/source label.
5. Add pre-persistence sensitive-content handling: detect likely secrets, credentials, and personal data; redact when useful; otherwise request explicit approval or omit the content and record that omission.
6. Run `research handoff is collision-safe and normalized`.
   Expected: pass.
7. Update the lifecycle red flag so missing/empty `progress.md` applies to active-feature implementation or investigation, while standalone research-only directories are explicitly valid.
8. Run `standalone research is valid without active progress`.
   Expected: pass.
9. Run all three research/lifecycle contracts:
   `node --experimental-strip-types --test --test-name-pattern="research prompt always persists a research artifact|research handoff is collision-safe and normalized|standalone research is valid without active progress" .pi/tests/skill-system.test.ts`
   Expected: three passes, zero failures.
10. Run the research fan-out test:
    `node --experimental-strip-types --test --test-name-pattern="research prompt fan-out stays within one-to-three agents" .pi/tests/skill-system.test.ts`
    Expected: one pass.
11. Run `git diff --check -- .pi/prompts/research.md .pi/skills/development-lifecycle/SKILL.md` and inspect both diffs for scope limited to destination hardening, normalized output, privacy, and the red-flag correction.
12. Return GREEN evidence, diff scope, and deviations in the Task 3 result envelope; do not edit `progress.md` from the child task.

**Stop conditions:** stop if collision handling would overwrite an occupied file, if sensitive material is persisted without redaction/approval policy, or if lifecycle wording turns standalone research into a fifth active-work state file.

---

## Wave 3: Parent-Owned Integration Gate

After Tasks 2 and 3 join, the parent performs these steps sequentially:

1. Inspect the actual diffs for all four implementation files; do not rely on child summaries.
2. Append Task 1 RED evidence and Tasks 2–3 GREEN/deviation evidence to `progress.md` sequentially after integration; child tasks never own that file.
3. Run the five new contracts plus the existing routing baseline by name and confirm all pass.
4. Run `node --experimental-strip-types --test .pi/tests/*.test.ts`.
   Expected: all tests pass, including fan-out and unrelated skill policy tests.
5. Run `git diff --check -- .pi/prompts/create.md .pi/prompts/research.md .pi/skills/development-lifecycle/SKILL.md .pi/tests/skill-system.test.ts .pi/artifacts/conversation-aware-create-handoff/progress.md`.
6. Run targeted policy evidence:
   `rg -n "Context Handoff|each material item|source label|provenance|research\.md|fresh|confirmation" .pi/prompts/create.md`
   `rg -n "slug-2|increasing integer|first.*does not exist|same topic|each material item|source label|provenance|sensitive|redact" .pi/prompts/research.md`
   `rg -n "standalone.*research|active.*progress\.md" .pi/skills/development-lifecycle/SKILL.md`
7. Run an independent review focused on per-item provenance, precedence conflicts, mutation ordering, deterministic collision selection, stale/sensitive evidence, artifact overwrite risk, and regression to orchestration limits.
8. Resolve review findings with new RED tests before production corrections.
9. Append final verification evidence, changed files, remaining risks, and next step to `progress.md`.

---

## Constitutional Compliance

- No destructive Git operation is planned.
- No force operation, hook bypass, broad staging operation, or secret exposure is planned.
- No dependency is added.
- Each child task modifies at most two declared files; only the parent updates `progress.md` after integration, so parallel Wave 2 ownership is disjoint.
- Tests precede production behavior changes and must fail for the intended missing contract.
- Unrelated dirty-workspace changes are protected by a typed human-action checkpoint, an exact committed baseline, and scoped clean-status verification.

**Constitutional compliance: 8 PASS**

## Completion Conditions

The plan is complete only when:

- the baseline research-routing behavior remains green;
- all five new/affected handoff contracts pass;
- the full `.pi/tests/*.test.ts` suite passes;
- all four implementation diffs are within scope and whitespace-clean;
- independent review has no unresolved P1/P2 findings;
- `progress.md` contains RED, GREEN, integration, and review evidence;
- implementation occurred in an isolated workspace whose baseline includes the current topic-aware routing changes.