# Code as a Resource — Progress

## task-1 attempt 1 — started

- **State:** running
- **Ready frontier at start:** task-1
- **Declared files:** `.pi/scripts/corpus.ts`, `.pi/tests/corpus.test.ts`
- **Transient neighborhood:** exact match to declared files. `searchCorpus` is referenced only by the CLI branch, the corpus test file, and lifecycle prose. No other production caller exists.
- **Relevant history:** `8822492 feat(corpus): add code-as-a-resource corpus store and search`
- **TDD baseline:** `node --experimental-strip-types --test .pi/tests/corpus.test.ts` — 12 tests, 12 pass, 0 fail, exit 0.
- **Research correction:** slug tie-breaking must use UTF-16 code-unit comparison, not locale-sensitive `localeCompare`. Plan updated before implementation.
- **Approval constraints:** no commits, pushes, dependencies, new files, or edits outside the two declared files.

## Evidence task-1 attempt 1

- **Implementation:** bounded `SearchResult` contract, default limit 3, four relevance tiers preserving the v1 match set, locale-independent slug tie-break, canonical positive-integer CLI limit, and visible pre-truncation total.
- **Files changed:** `.pi/scripts/corpus.ts`, `.pi/tests/corpus.test.ts`.
- **Reconstructed RED:** imported committed baseline `2675691:.pi/scripts/corpus.ts` from an in-memory data URL and asserted the new SearchResult contract; failed with `AssertionError`, exit 1 as expected. This proves the tests reject old behavior but is not an auditable transcript of the worker's chronological RED phase; the worker returned no narrative output.
- **GREEN:** `node --experimental-strip-types --test .pi/tests/corpus.test.ts` — 18 tests, 18 pass, 0 fail, exit 0.
- **CLI:** `node --experimental-strip-types .pi/scripts/corpus.ts search .pi/corpus ts` — emitted `limit: 3`, `total: 1`, one entry, exit 0.
- **Diff:** `git diff --check -- .pi/scripts/corpus.ts .pi/tests/corpus.test.ts` — exit 0.
- **Determinism guard:** no `localeCompare` in production; permutation test asserts byte-identical full SearchResult serialization.
- **Independent review:** no implementation findings. Review identified two coverage gaps: byte-identical full-result comparison (upgraded to Important) and invalid-corpus list exit coverage. Both tests were strengthened.
- **Post-fix verification:** corpus suite remained 18/18 green; invalid-corpus `list` exit 1 now asserted.
- **Git:** no commit or integration performed; approval not requested yet.

## task-2 attempt 1 — started

- **State:** running
- **Dependency:** task-1 passed with current-attempt evidence.
- **Declared files / transient neighborhood:** `.pi/scripts/corpus.ts`, `.pi/tests/corpus.test.ts`; exact match. New API stays in the existing pure module and new CLI branch stays in `main()`.
- **Test seam:** caller-supplied `now: Date`; no wall-clock mock and no test-only production API.
- **Constraints:** no schema change, no dependencies, no commits, no lifecycle edits by worker.

## Evidence task-2 attempt 1

- **RED (worker transcript):** corpus suite ran 24 tests with 18 pass / 6 fail. Failures were the missing `reportStaleness` export/function and missing `stale` CLI branch; all 18 pre-existing tests remained green.
- **Implementation:** exported deterministic `reportStaleness(entries, maxAgeDays, now)`, inclusive age threshold, canonical nonnegative safe-integer parser, and fail-closed `stale` CLI output under `entries`.
- **GREEN (parent):** `node --experimental-strip-types --test .pi/tests/corpus.test.ts` — 24 tests, 24 pass, 0 fail, exit 0.
- **CLI (parent):** `stale .pi/corpus 3650` — `ok: true`, `ageDays: 0`, exit 0; `validate .pi/corpus` — exit 0.
- **Diff:** `git diff --check -- .pi/scripts/corpus.ts .pi/tests/corpus.test.ts` — exit 0.
- **Independent review:** raised unreadable-root exit semantics, calendar-date normalization, pure-API runtime preconditions, and `reports`/`entries` prose mismatch. Parent disposition: unreadable root remains the established `corpus_read_error` exit-2 condition; invalid scanned corpus exits 1 and is now explicitly tested. Calendar validity is a pre-existing validator limitation and schema tightening is out of scope. Pure function receives validated entries and CLI-validated threshold. CLI uses `entries` for consistency; plan prose synced.
- **Deferred risk:** `DATE_PATTERN` validates shape, not calendar validity; `Date.UTC` can normalize malformed calendar dates. This is not expanded inside task-2.
- **Git:** no commit or integration performed.

## task-3 attempt 1 — started

- **State:** running; dependencies task-1 and task-2 passed.
- **Declared files / neighborhood:** `.pi/scripts/corpus.ts`, `.pi/tests/corpus.test.ts`; exact match.
- **Compatibility boundary:** absent `validated` must not appear as an `undefined` output property; current repository entry remains readable.
- **Constraints:** additive optional string only; no structured provenance, corpus-entry edit, dependency, commit, or lifecycle mutation by worker.

## Evidence task-3 attempt 1

- **RED (worker transcript):** 29 tests, 26 pass / 3 fail for the right missing-behavior reasons: non-empty value dropped, invalid values accepted, and scan output omitted the field. Two backward-compatibility characterization tests were already green; all 24 pre-existing tests stayed green.
- **Implementation:** optional `validated?: string`, own-property presence detection, exact `validated_invalid` issue, and conditional normalized output.
- **GREEN (parent):** `node --experimental-strip-types --test .pi/tests/corpus.test.ts` — 29 tests, 29 pass, 0 fail, exit 0.
- **CLI (parent):** `validate .pi/corpus` and `list .pi/corpus` — exit 0; entries without the field omit it, entries with the field retain it.
- **Diff:** `git diff --check -- .pi/scripts/corpus.ts .pi/tests/corpus.test.ts` — exit 0.
- **Independent review:** no findings; all task-3 criteria covered; tests are not coupled to specific corpus slugs.
- **Concurrent work observed:** two untracked corpus entry directories appeared at 16:22 during task execution. They are outside owned files, were not modified, and remain owner-managed.
- **Git:** no commit or integration performed.

## task-4 attempt 1 — started

- **State:** running; task-1 through task-3 passed with current-attempt evidence.
- **Files:** none; verification only.
- **Full-mode applicability:** repository has no package manifest, dependency manager, lint command, typecheck command, or build command. Syntax, focused tests, full retained suite, CLI behavior, graph validation, diff check, and status attribution are applicable.
- **Expected baseline:** two unrelated `skill-system.test.ts` failures caused by untracked retired `.pi/skills/memory/`; report unchanged, do not repair.

## Evidence task-4 attempt 1 — failed review gate

- **Automated verification:** syntax, focused 29/29 tests, CLI matrix, diff check, and graph validation passed. Full suite remained at the expected 181/183 with only the two unrelated memory-skill failures.
- **Final independent review:** Important finding — shape-only date validation allows impossible calendar dates and `Date.UTC` silently normalizes them, so staleness can report a false age.
- **Failure attribution:** task-2 produced staleness output; its output must change. Task-2 is reopened, task-3 is stale pending re-verification, and task-4 will rerun after both are current.
- **Deferred pre-existing risk:** lexical file containment does not prevent symlink escape; unrelated to this feature's changed behavior.

## task-2 attempt 2 — review fix started

- **Cause:** final review found impossible calendar dates can be normalized into false staleness ages.
- **Scope:** same two files; strengthen existing deposited semantics without adding a field or dependency.
- **Required behavior:** reject impossible YYYY-MM-DD dates and avoid the JavaScript year-0-to-99 `Date.UTC` remapping in direct staleness computation.

## Evidence task-2 attempt 2

- **RED (worker transcript):** 32 tests, 29 pass / 3 fail: impossible date accepted, direct invalid date did not throw, and year-0001 age was `-693870` instead of `90`.
- **Fix:** exact ISO UTC parse plus calendar round-trip; validator retains `deposited_invalid`; direct invalid `reportStaleness` input throws `RangeError`; no `Date.UTC` year-0-to-99 remap.
- **GREEN (parent):** focused suite 32/32, validate exit 0, stale exit 0, diff-check exit 0.
- **Focused review:** implementation passed. Reviewer questioned year-remap test, but parent rejected the finding: test `now` uses `Date.parse`, while old production used `Date.UTC` only for deposited; RED evidence showed the exact large mismatch, so the test has discriminatory power.
- **Scope:** no field/schema version/dependency added; documented date invariant is now actually enforced.

## task-3 attempt 2 — stale re-verification started

- **Cause:** shared `validateEntry` date validation changed in task-2 attempt 2.
- **Expected work:** verification and review only; optional `validated` semantics should remain unchanged.

## Evidence task-3 attempt 2

- **Reason:** stale re-verification after shared date validation changed.
- **Verification:** focused suite 32/32; validate/list exit 0; diff-check exit 0.
- **Contract checks:** non-empty `validated` round-trips, absent field omitted, invalid values emit exact typed issue, scan/list propagation preserved.
- **Read-only review:** no findings; date parsing and validated handling are independent issue paths.
- **Code changes in this attempt:** none.

## task-4 recovery

- Attempt-1 failure cause resolved by task-2 attempt 2; task-3 re-verified at attempt 2.
- Task-4 returned to pending for full re-execution.

## task-4 attempt 2 — started

- Full rerun after calendar-date correctness fix.
- No code edits authorized unless a new verified review finding appears.

## Evidence task-4 attempt 2

- **Syntax:** `node --experimental-strip-types --check .pi/scripts/corpus.ts` — exit 0.
- **Focused tests:** 32 tests, 32 pass, 0 fail, exit 0.
- **CLI matrix:** validate 0; list 0; search default 0; search limit 0 -> 2; stale 3650 -> 0; stale 0 -> 1; bare -> 2. All matched expected codes.
- **Diff / graph / compliance:** diff-check exit 0; graph valid version 2; constitutional plan scan clean.
- **Full retained suite:** 186 tests, 184 pass, 2 fail, exit 1. Exactly the two acknowledged unrelated failures remain: manifest parity and legacy memory absent, both caused by untracked `.pi/skills/memory/`. No new regression.
- **Typecheck / lint / build:** N/A — repository has no package manifest or configured commands; none invented.
- **Final independent review:** 0 Critical, 0 Important, 1 Minor. Minor: direct `reportStaleness` callers can supply invalid `now` or threshold; CLI enforces valid inputs. Deferred outside current CLI acceptance.
- **UI gate:** N/A; no UI files changed.
- **Git:** no commit, merge, push, or integration performed.

## Completion summary

- **User confirmation:** `yes commit and push`
- **Closed:** 2026-07-26 (UTC execution timestamp captured at commit/push audit).
- **Tasks:** 4/4 passed; task-2 and task-3 were re-executed after the final review exposed calendar-date normalization.
- **Focused verification:** 32/32 tests pass.
- **Full retained suite:** 184/186; only the two acknowledged unrelated failures caused by untracked `.pi/skills/memory/` remain.
- **Review:** 0 Critical, 0 Important, 1 deferred Minor (direct pure-API invalid clock/threshold; CLI validates).
- **Goal verification:** required artifacts exist, are substantive, wired, and behavior-tested.
- **Deferred:** semantic retrieval, structured provenance, syntactic drift detection, symlink-aware corpus containment, and direct-API hardening beyond the CLI contract.

