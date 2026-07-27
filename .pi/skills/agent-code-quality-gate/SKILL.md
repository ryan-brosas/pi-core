---
name: agent-code-quality-gate
description: Use before a coding agent claims implementation work is complete, especially after bugfixes, feature edits, refactors, or subagent changes - converts code quality into an operational gate for scope, duplication, behavior tests, verification evidence, and regressions.
version: 1.0.0
---

# Agent Code Quality Gate

## Iron Laws

<EXTREMELY-IMPORTANT>
- **Code-changed-this-session → review required.** Not optional.
- **Scope = diff scope.** Unrelated cleanup in the diff = wrong diff.
- **Behavior tests = required.** No "trust me, it works."
- **Duplication check = required.** AI agents duplicate by reflex.
- **Verification evidence = required.** Agent ran the check, pastes output, human reviews.
</EXTREMELY-IMPORTANT>

## When to Use

Before declaring "done" after bugfix, feature edit, refactor, or subagent work. This is the automatic completion gate. Use `code-review-and-quality` separately only when the user requests review or an independent consequence-driven review adds value.

## The Gate (5 Checks)

1. **Scope.** Does the diff match the stated problem? Anything outside → split or revert.
2. **Duplication.** Copy-paste instead of reusing? New file with high overlap? Flag for refactor.
3. **Behavior tests.** Exercise success and controlled failure through the public interface or seam. New behavior gets a test; a bug gets a regression test; a refactor preserves or strengthens equivalent black-box coverage.
4. **Verification evidence.** Named repository checks ran, exited 0, and their output was inspected. Child or graph claims do not satisfy this check.
5. **Regressions.** No new failures, unjustified test removal, skipped tests, dead code, or introduced duplication. Use configured deterministic analysis such as `fallow`; otherwise inspect source and diff and report that gate as N/A.

## Workflow

1. **Get the diff.** `git diff` (or staged, or branch vs main).
2. **Scope check.** Is every line traceable to the stated problem?
3. **Deterministic quality check.** Run configured dead-code, duplication, and complexity analysis such as `fallow`; if none is configured or available, inspect the complete diff and mark the missing gate N/A.
4. **Black-box test check.** Verify public-interface success and controlled failure. For a refactor, prove equivalent observable coverage before accepting removed implementation-coupled tests.
5. **Verification check.** Run the repository-discovered commands and inspect their output.
6. **Regression check.** No new failures, unjustified removals, or skipped tests.
7. **Pass / fail.** If any check fails, work is not done.

## Common Findings

| Finding | Action |
|---|---|
| "While I'm here" cleanup | Split or revert |
| Copy-pasted helper | Extract to common module |
| New test that doesn't test | Rewrite or delete |
| Skipped test (`.skip`) | Un-skip or fix |
| Removed test | Add back, or justify |
| No regression test | Add one |
| Output truncated | Show full output |

## Severity Tells

| Tell | Action |
|---|---|
| `[blocker]` | Must fix. Violated invariant. |
| `[should-fix]` | Worth fixing now. Real cost. |
| `[nit]` | Cosmetic. Note, don't block. |
| `[question]` | Need clarification. |

## When to Override

| Override | When |
|---|---|
| "Scope creep is acceptable" | User explicitly approved the extra work |
| "Duplication is acceptable" | One-time use, extraction premature |
| "Skipped test is acceptable" | Flaky, in test-quarantine |
| "Removed test is acceptable" | Replaced by a better test |

Document every override in the task receipt and final evidence. Commit only when the user explicitly requests it.

## Common Mistakes

Skipping the gate; "I checked, it's fine" (no evidence); scope creep unmarked; tests that don't test; "I'll add tests later"; blockers downgraded to nits.

## Red Flags

"Should work" (run); "I tested it" (show run); truncated output; "tests later"; .skip on new; removed unmarked; "while I'm here" unmarked; scope creep unmarked.

## Anti-Patterns

**"I checked"** (no evidence); **"should work"**; **truncated output**; **"tests later"**; **.skip on new**; **removed unmarked**; **"while I'm here" unmarked**; **blockers unmarked**.
