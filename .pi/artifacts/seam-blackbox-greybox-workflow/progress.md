# Progress: Boundaries and Testability in the Planning Workflow

- **Active slug:** `seam-blackbox-greybox-workflow`
- **Started:** 2026-07-25T19:48:18Z
- **Checkout:** `/home/ryan/repo/pi-core`
- **Branch / HEAD:** `main` / `4c8920f0d6a204ce4877e1c0de0c8789763d2f25`
- **Git authorization:** No commit, merge, push, branch, or worktree action authorized; execution remains uncommitted in the current checkout.
- **Concurrent work:** Pre-existing unrelated dirty paths are preserved and excluded from task ownership.

## Execution Log

### task-1 attempt 1 — running

**Transient neighborhood**

- Declared edit: `.pi/tests/skill-system.test.ts`
- Public contracts read by the tests: `.pi/prompts/plan.md`, `.pi/skills/planning-and-task-breakdown/SKILL.md`, `.pi/templates/prd.md`, `.pi/skills/deep-module-design/SKILL.md`
- Existing test helpers: `read()` and `readRequired()` at `.pi/tests/skill-system.test.ts:6-14`
- Append location: after the current final test at `.pi/tests/skill-system.test.ts:587`
- Relevant history: latest changes to the test file are contract-test commits, most recently `2cad988`; no declared source file is currently modified.

**Expected evidence**

- Each new named test independently reaches RED for the intended missing policy.
- The complete test file has only the three new failures.
- `git diff --check` reports no whitespace errors.


## Evidence: task-1 attempt 1

<a id="evidence-task-1-attempt-1"></a>

- **Outcome:** failed before implementation (2026-07-25T19:50:11Z)
- **Worker:** `general` foreground Pi subagent
- **Declared scope:** `.pi/tests/skill-system.test.ts`
- **Observed blocker:** the worker's tool registry does not expose `fabric_exec`; tool discovery found no matching tool.
- **Edits:** none
- **Verification:** not run because the required implementation tool was unavailable before the file was read or changed.
- **Attribution:** execution-environment mismatch, not a source/test failure. Project agent definitions intentionally exclude `pi-fabric`, while this ship workflow requires the child to use it.
- **Recovery required:** parent decision to authorize a bounded parent-side `fabric_exec` implementation, or separate authorization to change agent-tool exposure.

### task-1 attempt 2 — running

- **Started:** 2026-07-25T19:53:00Z
- **Recovery authorization:** User said “just implement or do /ship directly”; parent-side `fabric_exec` execution is authorized as the bounded recovery path.
- **Scope and neighborhood:** unchanged from attempt 1; only `.pi/tests/skill-system.test.ts` may be edited, with the four contract surfaces read-only.
- **Workflow deviation:** implementation worker delegation is bypassed because the configured worker cannot access the required tool; independent review remains delegated.


## Evidence: task-1 attempt 2

<a id="evidence-task-1-attempt-2"></a>

- **Outcome:** passed in expected RED state (2026-07-25T19:54:08Z)
- **Changed file:** `.pi/tests/skill-system.test.ts`
- **RED — boundaries:** exit 1; failed because the plan prompt does not yet name **Boundaries and Testability**.
- **RED — observable:** exit 1; failed because PRD Success Criteria lack `externally observable behavior`.
- **RED — seam:** exit 1; failed because the deep-module skill still says `The interface IS the test seam`.
- **Complete test file:** exit 1 with exactly the three newly appended failures; all pre-existing tests passed.
- **Whitespace:** `git diff --check -- .pi/tests/skill-system.test.ts` exited 0.
- **Inspection:** content tracked at HEAD remains an exact prefix; exactly three tests were appended and none is skipped.
- **Commit:** not created; Git authorization remains absent.

- **Inspection correction:** the first append-only helper had an invalid regular expression and produced no valid inspection result; it did not edit files. A direct HEAD-prefix comparison was rerun successfully: the original file is unchanged, the appended region contains exactly the three named tests (53 lines), and no test is skipped.


### task-2 attempt 1 — running

- **Started:** 2026-07-25T19:54:44Z
- **Declared edits:** `.pi/prompts/plan.md`, `.pi/skills/planning-and-task-breakdown/SKILL.md`
- **Transient neighborhood:** Phase 7 Required Plan Header around `.pi/prompts/plan.md:350-403`; fenced Plan Template around `.pi/skills/planning-and-task-breakdown/SKILL.md:70-88`; task-1 `boundaries` contract is read-only verification.
- **Insertion contract:** prompt block stays inside the existing four-backtick fence after Key Links; skill block stays inside its Plan Template fence after Non-goals.
- **Concurrent status:** both declared files were clean at start; unrelated dirty paths remain excluded.


## Evidence: task-2 attempt 1

<a id="evidence-task-2-attempt-1"></a>

- **Outcome:** passed (2026-07-25T19:56:01Z)
- **Changed files:** `.pi/prompts/plan.md`, `.pi/skills/planning-and-task-breakdown/SKILL.md`
- **TDD transition:** after the prompt-only edit, the `boundaries` test remained RED solely because the planning skill lacked the section; after the matching skill edit, it passed 1/1 with exit 0.
- **Structure:** each surface contains exactly one conditional section; both blocks are inside their required template fences.
- **Diff:** 26 insertions per file, zero deletions; `git diff --check` exited 0.
- **Scope review:** routing, lifecycle ownership, and prose outside the two template regions are unchanged.
- **Commit:** not created; Git authorization remains absent.


### task-3 attempt 1 — running

- **Started:** 2026-07-25T19:56:16Z
- **Declared edit:** `.pi/templates/prd.md`
- **Transient neighborhood:** `## Success Criteria` at lines 94-100; `## Proposed Solution` and `## Technical Context` are read-only comparison sections; task-1 `observable` test is read-only verification.
- **Concurrent status:** the declared file was clean at start.


## Evidence: task-3 attempt 1

<a id="evidence-task-3-attempt-1"></a>

- **Outcome:** passed (2026-07-25T19:56:59Z)
- **Changed file:** `.pi/templates/prd.md`
- **Focused test:** `observable` passed 1/1 with exit 0.
- **Scope proof:** direct comparison to HEAD confirms one instruction insertion (plus its separating blank line) immediately under Success Criteria; Proposed Solution and Technical Context are byte-identical to HEAD.
- **Whitespace:** `git diff --check -- .pi/templates/prd.md` exited 0.
- **Inspection correction:** the first comparison helper had a shell-quoting syntax error after the test had passed; it edited nothing. The direct comparison and focused test were rerun successfully.
- **Commit:** not created; Git authorization remains absent.


### task-4 attempt 1 — running

- **Started:** 2026-07-25T19:57:13Z
- **Declared edit:** `.pi/skills/deep-module-design/SKILL.md`
- **Transient neighborhood:** `## Test Seams via Interface` paragraph at lines 71-74; its TypeScript example and all surrounding depth guidance are read-only; task-1 `seam` test is read-only verification.
- **Concurrent status:** the declared file was clean at start.


## Evidence: task-4 attempt 1

<a id="evidence-task-4-attempt-1"></a>

- **Outcome:** passed (2026-07-25T19:57:42Z)
- **Changed file:** `.pi/skills/deep-module-design/SKILL.md`
- **Focused test:** `seam` passed 1/1 with exit 0.
- **Scope proof:** direct HEAD comparison confirms exactly one sentence replacement; the section heading, constructor-injection example, and all other guidance are unchanged.
- **Diff:** one line replaced; `git diff --check` exited 0.
- **Commit:** not created; Git authorization remains absent.


### task-5 attempt 1 — running

- **Started:** 2026-07-25T19:57:59Z
- **Declared edits:** none; this is an evidence-only node.
- **Verification neighborhood:** five implementation files, all `.pi/tests/*.test.ts`, every `.pi/artifacts/*/tasks.json`, and the explicitly untouched `design.md`, `adr.md`, and `tasks.md` templates.
- **Applicable gate model:** Node test runner and task-graph validator are canonical. This repository has no package manifest, lockfile, TypeScript project, linter configuration, or build command, so package-manager typecheck/lint/build commands must not be invented.


## Review Round 1 — findings (2026-07-25T20:05:38Z)

- **Reviewer:** foreground `review` Pi subagent, Standard Review.
- **[should-fix] Heading hierarchy:** `.pi/skills/planning-and-task-breakdown/SKILL.md` used a level-3 boundary heading beneath level-2 Non-goals; promote the boundary heading to level 2 and its children to level 3.
- **[should-fix] Fence wiring test:** `.pi/tests/skill-system.test.ts` searched entire documents; extract and assert against the Required Plan Header and Plan Template fences instead.
- **Validated by parent:** both findings reproduce from current structure and affect the stated wiring contract.
- **Fix route:** user-authorized parent-side `fabric_exec`; no extra files or scope expansion.


## Evidence: review fix round 1

<a id="evidence-review-fix-round-1"></a>

- **Test-first fix:** strengthened the boundary contract to extract both template fences and require host-specific heading levels; focused test reached RED only on the planning-skill hierarchy.
- **Minimal implementation:** promoted the skill boundary heading from level 3 to level 2 and its three children from level 4 to level 3; prompt hierarchy was unchanged.
- **Focused GREEN:** `boundaries` passed 1/1.
- **Full re-verification:** skill-system 47/47; retained suite 135/135; all 10 artifact graphs; untouched templates; diff checks all passed.
- **Scope:** only `.pi/tests/skill-system.test.ts` and `.pi/skills/planning-and-task-breakdown/SKILL.md` changed for the review fix.

## Evidence: review round 2

<a id="evidence-review-round-2"></a>

- **Reviewer:** foreground `review` Pi subagent.
- **Result:** PASS; both prior Important findings are resolved.
- **Findings remaining:** 0 Critical, 0 Important, 0 Minor.
- **Evidence:** skill boundary is a level-2 sibling with level-3 children; tests extract each named fence, require exactly one section, and enforce host-specific heading levels before semantic assertions.
- **Residual risk:** static contracts cannot prove model compliance at runtime; a generated-plan harness remains explicitly out of scope.

## Evidence: task-5 attempt 1

<a id="evidence-task-5-attempt-1"></a>

- **Outcome:** passed (2026-07-25T20:10:48Z)
- **Focused test file:** 47/47 passed, 0 failed, 0 skipped.
- **Retained suite:** 135/135 passed, 0 failed, 0 skipped.
- **Artifact graphs:** 10/10 validated with no issues.
- **Untouched scope:** `.pi/templates/design.md`, `.pi/templates/adr.md`, and `.pi/templates/tasks.md` remain byte-identical to HEAD.
- **Read-only reporting:** `frontier --all` left `.pi/artifacts/.active` hash unchanged.
- **Diff quality:** tracked diff checks and active-artifact trailing-whitespace scan passed.
- **Applicable gates:** test PASS; typecheck N/A, lint N/A, build N/A because the repository intentionally has no package manifest, lockfile, TypeScript project, linter configuration, or build command.
- **UI gate:** N/A; no UI extensions changed.
- **Goal-backward verification:** 5/5 artifacts exist, 5/5 are substantive, 5/5 key links are wired, and 0 stubs were detected; template fill-in rows are intentional.
- **Review:** round 1 found two Important issues; both were fixed test-first, fully reverified, and review round 2 passed with no remaining findings.
- **Commit:** not created; Git authorization remains absent.


## Completion Summary

- **Closed:** 2026-07-25T20:18:50Z
- **Close authority:** the user's repeated `/ship` request explicitly instructed “mark complete.”
- **Result:** 5/5 graph tasks passed; frontier state complete.
- **Execution:** three derived waves; task-1 required a second attempt after the configured child lacked `fabric_exec`, then continued through the explicitly authorized parent-side path.
- **Verification:** skill-system 47/47; retained suite 135/135; all 10 artifact graphs valid; out-of-scope templates unchanged; diff, whitespace, secret, and active-pointer checks passed.
- **Goal verification:** 5 artifacts exist, 5 are substantive, 5 key links are wired, 0 stubs.
- **Review:** two Important findings fixed test-first; follow-up review PASS with no remaining findings.
- **Commits / publication:** none; no branch, commit, merge, push, deployment, or PR action was authorized.
- **Rollback:** revert the five scoped implementation-file edits and this feature's lifecycle artifacts; no external state or dependency changes exist.
- **Deferred:** an inert design-template pointer and automated single-implementation seam detection remain out of scope.
- **Audit note:** one final read-only helper initially referenced an unset shell variable; the corrected audit reran successfully and changed no files.
