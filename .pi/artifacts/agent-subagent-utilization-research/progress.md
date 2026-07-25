# Progress: Agent and Subagent Utilization Contracts

## 2026-07-25 — `/ship` task-1 attempt 1 started

- Active slug: `agent-subagent-utilization-research`.
- Canonical graph validated; live frontier selected only `task-1`.
- Declared file: `.pi/tests/skill-system.test.ts`.
- Transient neighborhood: `.pi/agent-tool-description.md`, `.pi/prompts/plan.md`, `.pi/prompts/ship.md`, `.pi/skills/subagent-driven-development/SKILL.md`, `.pi/agents/Plan.md`, `.pi/agents/general.md`, `.pi/agents/build.md`, active `spec.md`, `plan.md`, `research.md`, and `tasks.json`.
- Pre-edit test hash: `85b2212d40fd29f4dbbfadc1663a82830609f53d81552c955094573d18e41cb1`.
- Existing unrelated deletions, artifact edits, and runtime-managed changes are excluded and remain untouched.
- TDD gate: the exact named-test baseline may exit zero because the tests do not exist; RED requires all three new tests to be discovered and to fail for the intended missing contracts.

## Evidence: task-1 attempt 1

- **Implementation:** Appended three focused contract tests to `.pi/tests/skill-system.test.ts`; no production prompt, policy, agent, or lifecycle file was edited by the worker.
- **Baseline:** the exact named pattern exited `0` with zero matching tests before the edit; recorded as baseline only, not RED.
- **RED:** `node --experimental-strip-types --test --test-name-pattern="agent utilization policy|plan writer boundary|ship primary worker call" .pi/tests/skill-system.test.ts` exited `1`; 3 tests were discovered, 0 passed, and 3 failed for the intended missing contracts: absent global `build` role, absent explicit no-general plan-writer statement, and absent primary worker dispatch section.
- **Syntax/whitespace:** TypeScript syntax check exited `0`; `git diff --check -- .pi/tests/skill-system.test.ts` exited `0` with no output.
- **Parent inspection:** the owned diff is exactly 61 appended test lines and no deletion. Assertions are section/call scoped and preserve existing helpers.
- **Fabric deviation:** the worker verified that Fabric full code mode is disabled in this orchestration-only session, so `pi.*` file mutation is unavailable inside `fabric_exec`; it used the native direct edit path and reported the limitation. No Fabric agent, actor, or mesh orchestration was used.
- **Concurrent unrelated state:** `.pi/agents/Plan.md` and `.pi/agents/build.md` became modified outside this task. They are excluded, preserved, and baselined for later scope proof at hashes `00a60fa9521594a4fa10e2f6d5348d8951fc7a53e9d0ea2ca9d6eb8fbb127cfc` and `b4a926a62fae0639c2442e4531effb3ba46e49ab0e2df5f42682b20b4f27d5c4`.
- **Commit:** `cf4e5944efd6ff2d71fd0d4c050578cde478fe58` (`test(orchestration): add failing role-routing contracts`).

## 2026-07-25 — `/ship` task-2 attempt 1 started

- Fresh graph validation selected `task-2` and `task-3`; they are graph-parallel but will execute sequentially because no worktree is authorized.
- Declared file: `.pi/agent-tool-description.md`.
- Transient neighborhood: task-1 contract tests in `.pi/tests/skill-system.test.ts`, `.pi/prompts/plan.md`, `.pi/prompts/ship.md`, `.pi/skills/subagent-driven-development/SKILL.md`, and the active spec/plan/research/graph.
- Pre-edit policy hash: `7ee71348eb2cad1b55dda2006dbe398a2b98e834170260bba534f548d76bd15b`.
- Expected GREEN: only `agent utilization policy` must pass; task-3 residual tests remain owned by task-3.

## Evidence: task-2 attempt 1

- **Implementation:** Refined `.pi/agent-tool-description.md` with a surgical `general` role, a substantial bounded `build` role after resolved architecture, and a lifecycle-specific `/ship` routing rule that does not transfer parent ownership.
- **Focused GREEN:** `node --experimental-strip-types --test --test-name-pattern="agent utilization policy" .pi/tests/skill-system.test.ts` exited `0`; 1 test passed, 0 failed.
- **Regression:** the combined Pi-native coordination and utilization-policy pattern exited `0`; 2 tests passed, 0 failed.
- **Whitespace:** `git diff --check -- .pi/agent-tool-description.md` exited `0` with no output.
- **Parent inspection:** the committed diff is limited to three inserted routing bullets and one replaced `general` bullet; no envelope, budget, concurrency, or orchestration-system rule was weakened.
- **Fabric execution:** direct `pi.*` bindings were unavailable, but the parent confirmed orchestration-only Fabric can invoke computed `pi.*` refs through `tools.call`; subsequent implementation and verification use that supported Fabric path.
- **Commit:** `63f07064dbedfef26d507f056a5577c10e23fe65` (`docs(orchestration): align global agent routing`).

## 2026-07-25 — `/ship` task-3 attempt 1 started

- Fresh graph validation selected only `task-3`.
- Declared files: `.pi/prompts/plan.md` and `.pi/prompts/ship.md`.
- Transient neighborhood: task-1 tests in `.pi/tests/skill-system.test.ts`, `.pi/agent-tool-description.md`, `.pi/skills/subagent-driven-development/SKILL.md`, protected agent definitions, and active artifact files.
- Pre-edit hashes: plan `b66d464a7018af63201bd7fa3ebffd808ffa96e01066144c37e68231a3f4a3c5`; ship `ad44cf4db878861d63258934fbf005552e57bb06f4d21655f71cb91f8a51d775`.
- Protected concurrent baselines remain unchanged: Plan `00a60fa9521594a4fa10e2f6d5348d8951fc7a53e9d0ea2ca9d6eb8fbb127cfc`; general `4d9dc1ec397d405eeaa55314ea1a665f1f1ad733ad9c9e5f65b7d8c2fc9cd6a5`; build `b4a926a62fae0639c2442e4531effb3ba46e49ab0e2df5f42682b20b4f27d5c4`.

## Evidence: task-3 attempt 1

- **Implementation:** Added one explicit no-`general` canonical-writer sentence to `.pi/prompts/plan.md` and one uniquely scoped `### Primary Worker Dispatch` section with a closed `general|build` foreground call to `.pi/prompts/ship.md`.
- **Planning GREEN:** the Plan delegation and plan-writer boundary pattern exited `0`; 2 tests passed, 0 failed.
- **Shipping GREEN:** the ship routing and primary-worker-call pattern exited `0`; 2 tests passed, 0 failed.
- **Combined regression:** the selected plan/ship routing, ownership, fan-out, and approval pattern exited `0`; 7 tests passed, 0 failed.
- **Whitespace:** `git diff --check -- .pi/prompts/plan.md .pi/prompts/ship.md` exited `0` with no output.
- **Parent inspection:** prompt changes total 15 insertions and 1 replaced line; `/plan` retains one Plan call, `/ship` scopes one primary dynamic call separately from review/fix calls, and no child authority or envelope schema was broadened.
- **Protected scope:** Plan/general/build hashes remained exactly at their task-3 baselines.
- **Commit:** `780414cfbfa78b05a91b041a9e69dfabbb566bce` (`feat(orchestration): make role dispatch explicit`).

## 2026-07-25 — `/ship` task-4 attempt 1 started

- Fresh graph validation selected only file-less verification `task-4`.
- Verification scope: full retained tests, changed-TypeScript syntax, whitespace, active/all graph validation, read-only frontier proof, owned-commit scope, protected hash proof, goal-backward wiring, and one independent review.
- Project-specific gate mapping: Typecheck = Node strip-types syntax check for the changed TypeScript test; Lint = `git diff --check`; Test = full retained Node suite; Build/integration = canonical graph validation because this repository intentionally has no package manifest or build command.
- No implementation fix may be made under task-4; findings return to task-2 or task-3 through parent-owned graph recovery.

## Failure: task-4 attempt 1

- **Typecheck/syntax:** changed TypeScript syntax check exited `0`.
- **Lint/whitespace:** owned-path `git diff --check` exited `0`.
- **Build/integration:** active and all artifact graphs validated; cross-artifact frontier exited `0` and preserved `.active`.
- **Full test:** exited `1`; 59 passed and 2 failed. Both suite failures are outside the owned implementation diff: the retained prompt-leverage test imports the intentionally deleted extension, and a concurrent `.pi/agents/Plan.md` frontmatter modification conflicts with the existing exact runtime test.
- **Scope/wiring:** commits `cf4e5944`, `63f0706`, and `780414c` contain exactly the four declared paths; protected task-3 hashes were unchanged; required policy, ownership, primary dispatch, and envelope links were present.
- **Independent review:** one Important/P1 contract defect at `.pi/tests/skill-system.test.ts:570-573`: the closed worker-set assertion can false-pass on prose even if the executable TypeScript union is removed.
- **Failure attribution:** the actionable defect belongs to task-1's test output. Reopen task-1; stale task-2 and task-3 for current verification; task-4 remains failed until dependencies are revalidated and both unrelated full-suite blockers are resolved or explicitly waived.
- **No task-4 fix:** no implementation file was edited under the file-less verification task.

## 2026-07-25 — `/ship` task-1 attempt 2 started

- Failure attribution: independent review proved the primary-worker closed-set test can false-pass on prose.
- Declared file remains `.pi/tests/skill-system.test.ts`; prompt files are read-only fixtures during this correction.
- Pre-edit test hash: `b5f53a812b9a86958ac5e9dfdbd403e247e6f8ea67886e5816dbe1e2a0a22fc4` at the review boundary.
- RED method: mutation probe removes the executable typed union in memory while leaving prose intact; the attempt-1 assertions incorrectly accept that mutant. GREEN requires the strengthened assertion to reject the same mutant and pass the real prompt.

## Evidence: task-1 attempt 2

- **RED/mutation:** an in-memory mutant removed the executable `"general" | "build"` type while retaining section prose; attempt-1 assertions reported `attempt1_assertions_accept_mutant=true`.
- **Correction:** scoped the closed-set check to code before the `Agent` call inside the fenced TypeScript block and required the exact executable `const workerType: "general" | "build" = resolvedWorkerType;` declaration.
- **Focused GREEN:** all three role-specific contract tests passed; 3 passed, 0 failed.
- **Mutation GREEN:** the same in-memory mutant reported `strengthened_assertion_accepts_mutant=false`.
- **Syntax/whitespace:** Node strip-types syntax and `git diff --check -- .pi/tests/skill-system.test.ts` both exited `0`.
- **Parent inspection:** correction changes only `.pi/tests/skill-system.test.ts` with 7 insertions and 4 deletions; prompt implementations and protected agents were untouched.
- **Commit:** `f502df23c01ee1eafec6b84625894287a4ae041b` (`test(orchestration): bind worker closure to executable call`).

## Recovery after task-1 attempt 2

- Task-1 passed with current-attempt mutation evidence.
- Explicitly return stale task-2 and task-3 to pending for fresh verification against the strengthened contract; no production change is assumed necessary.
- Task-4 remains failed until both dependencies pass current re-verification.

## 2026-07-25 — task-2 attempt 2 re-verification

- Re-execute task-2 without production edits: verify committed global policy against the strengthened task-1 contract.
- Implementation remains commit `63f07064dbedfef26d507f056a5577c10e23fe65`; `.pi/agent-tool-description.md` is clean.

## Evidence: task-2 attempt 2

- **Re-verification:** the utilization-policy and strengthened primary-worker-call tests exited `0`; 2 passed, 0 failed.
- **Whitespace/scope:** policy whitespace check exited `0`; the implementation path is clean, so no new commit was needed.
- **Result:** attempt-1 implementation remains valid under task-1 attempt-2's stronger executable contract.

## 2026-07-25 — task-3 attempt 2 re-verification

- Re-execute task-3 without prompt edits: verify committed `/plan` and `/ship` behavior against the strengthened executable-union assertion.
- Implementation remains commit `780414cfbfa78b05a91b041a9e69dfabbb566bce`; both prompt paths are clean.

## Evidence: task-3 attempt 2

- **Re-verification:** Plan delegation, no-writer boundary, ship routing, and strengthened primary-worker-call tests exited `0`; 4 passed, 0 failed.
- **Whitespace/scope:** both prompt whitespace checks exited `0`; both implementation paths are clean, so no new commit was needed.
- **Result:** the executable `"general" | "build"` union and foreground call satisfy the corrected task-1 contract.

## 2026-07-25 — `/ship` task-4 attempt 2 started

- Tasks 1-3 now pass with current-attempt evidence after the review correction and explicit stale re-verification.
- Re-run every integrated gate and independent review. The two known unrelated full-suite failures remain blockers unless they disappear or the user explicitly waives them.

## Failure: task-4 attempt 2

- **Focused contracts:** 5 passed, 0 failed.
- **Typecheck/syntax:** exited `0`.
- **Lint/whitespace:** exited `0`.
- **Graph/build integration:** active and all graphs validated; cross-artifact frontier preserved `.active`.
- **Full retained suite:** exited `1`; 59 passed and 2 failed on the same unrelated workspace conditions: intentionally deleted prompt-leverage extension with retained importing test, and concurrent Plan frontmatter conflicting with its exact test.
- **Protected/scope proof:** owned commit range contains exactly four declared paths; Plan/general/build hashes remained at recorded concurrent baselines.
- **Independent re-review:** two Important/P1 findings remain: `.pi/tests/skill-system.test.ts:570-575` accepts a commented-out union declaration, and `.pi/prompts/ship.md:27-33` does not stop dispatch for unresolved security or migration decisions as required by the spec.
- **Failure attribution:** the first finding belongs to task-1; the second belongs to task-3. Task-2 becomes stale as a descendant of task-1.
- **Stop condition:** task-4 has failed verification/review twice. Stop before another fix cycle and request fresh user direction; do not close or claim all gates green.

## 2026-07-25 — user-authorized targeted correction cycle

- Fresh direction: verify, close, and commit the active work.
- Intentional extension deletion and `.pi/agents/Plan.md` / `.pi/agents/build.md` edits are accepted workspace state, not concurrency blockers.
- Recover task-1 and task-3 for the two unresolved routing-contract findings; task-4 remains failed until fresh integrated verification and review pass.


## 2026-07-25 — task-1 attempt 3 started

- Correct the contract so a commented-out worker union cannot satisfy executable dispatch.
- Add a contract requiring dispatch to stop on unresolved architecture, security, migration, scope, or approval.
- RED is the focused retained test against the current `/ship` prompt; a mutation probe covers the commented-declaration regression.


## Evidence: task-1 attempt 3

- **RED:** focused `ship primary worker call` test exited `1` solely because `/ship` omitted security and migration from the unresolved-decision stop gate.
- **Mutation:** a commented-out typed union was rejected (`commented_union_rejected=true`).
- **Syntax/whitespace:** Node strip-types syntax and owned-path whitespace checks exited `0`.
- **Commit:** `87e56d91cc53390aa8e9fde17c76107abcd3b9a0` (`test(orchestration): reject inert worker routing`).


## 2026-07-25 — task-3 attempt 3 started

- Add security and migration to the common pre-dispatch stop gate without changing worker ownership or dispatch shape.
- Declared implementation path: `.pi/prompts/ship.md`; `.pi/prompts/plan.md` requires re-verification only.


## Evidence: task-3 attempt 3

- **Implementation:** added security and migration to both the routing rule and the common pre-dispatch stop gate.
- **Focused GREEN:** four Plan/ship routing tests passed; 0 failed.
- **Whitespace:** prompt-path whitespace check exited `0`.
- **Commit:** `7821c5a61462ea653fbdb1ba8e82fffd3cc8af13` (`fix(orchestration): block unresolved worker dispatch`).


## 2026-07-25 — task-2 attempt 3 re-verification

- Reverify the unchanged global routing policy against the corrected task-1 contracts.


## Evidence: task-2 attempt 3

- **Re-verification:** utilization-policy and corrected primary-dispatch tests passed; 2 passed, 0 failed.
- **Whitespace:** policy-path whitespace check exited `0`.
- **Implementation:** unchanged at commit `63f07064dbedfef26d507f056a5577c10e23fe65`; no new task commit required.


## 2026-07-25 — task-4 attempt 3 started

- Run focused contracts, syntax, whitespace, all graph validation, read-only frontier proof, full retained tests, scope inspection, and independent review.
- User-confirmed extension deletions and agent-definition edits are accepted unrelated workspace state; they are not attributed to this feature.


## Failure: task-4 attempt 3

- **Focused/syntax/whitespace/graphs:** passed; focused routing contracts were 5/5.
- **Full retained suite:** 59 passed, 2 failed only on user-accepted unrelated workspace changes: deleted `prompt-leverage.ts` with its retained importing test, and intentional Plan frontmatter capability changes with an outdated exact-runtime assertion.
- **Independent review:** no production prompt defect, but two test robustness findings: canonical-writer detection accepted alternate/variable implementation-worker calls, and the unresolved-decision assertion did not enforce guard-before-dispatch order.
- **Attribution:** both findings belong to task-1 contract output. Reopen task-1; stale dependent tasks for current evidence.


## 2026-07-25 — task-1 attempt 4 started

- Harden canonical-writer detection against single quotes and variable role dispatch.
- Require the unresolved-decision guard to occur before the first dispatch code fence.
- Use mutation probes because the corrected production prompts should remain GREEN.


## Evidence: task-1 attempt 4

- **Mutation RED/GREEN:** previous assertions accepted a variable-role canonical writer and a guard moved below dispatch; corrected assertions reject both mutants.
- **Focused GREEN:** plan-writer and primary-worker tests passed; 2 passed, 0 failed.
- **Syntax/whitespace:** passed.
- **Commit:** `3dd46c8cd108e2a1b4879f23a85e0f1c7f2d53a7` (`test(orchestration): enforce dispatch boundaries`).


## 2026-07-25 — task-2 and task-3 attempt 4 re-verification

- Reverify unchanged global policy and corrected lifecycle prompts against task-1 attempt-4 contracts.


## Evidence: task-2 attempt 4

- Policy and plan-writer contracts passed; 2 passed, 0 failed. Policy implementation remains commit `63f07064dbedfef26d507f056a5577c10e23fe65`.

## Evidence: task-3 attempt 4

- Plan/ship routing contracts passed; 4 passed, 0 failed. Prompt implementation remains through commit `7821c5a61462ea653fbdb1ba8e82fffd3cc8af13`.


## 2026-07-25 — task-1 attempt 5 started

- Final-review hardening: inspect compact Agent calls, strip line/block comments before executable dispatch assertions, and require affirmative stop-before-selection semantics.
- Task-4 has not started its next attempt; dependent tasks are stale until this contract passes.


## Evidence: task-1 attempt 5

- **Mutation evidence:** compact variable call detected; block-commented union rejected after comment stripping; inverted proceed-with-unresolved prose rejected.
- **Focused GREEN:** plan-writer and primary-worker tests passed; 2 passed, 0 failed.
- **Commit:** `9b59068a7014385edb9c8ae280df8130b1d3c1c0` (`test(orchestration): parse executable dispatch examples`).

## 2026-07-25 — task-2 and task-3 attempt 5 re-verification

- Reverify unchanged policy and lifecycle prompts against executable-example parsing contracts.


## Evidence: task-2 attempt 5

- Policy and ownership tests passed; 2 passed, 0 failed.

## Evidence: task-3 attempt 5

- Plan/ship routing tests passed; 4 passed, 0 failed.

## 2026-07-25 — task-4 attempt 4 started

- Final integrated verification after executable-example parser hardening.


## Failure: task-4 attempt 4 review

- Integrated project gates matched attempt 3: focused, syntax, whitespace, graphs, and read-only frontier passed; full suite retained the same two user-accepted unrelated failures.
- Review reproduced two remaining false-greens: whitespace/newline-separated `Agent (` syntax escaped call extraction, and negated prefix prose could satisfy the unanchored stop sentence.
- Attribute call extraction to task-1 and standalone affirmative guard wording to task-3.


## 2026-07-25 — task-1 attempt 6 started

- Accept whitespace/newline-separated `Agent ( { ... } );` syntax in both plan and ship call extraction.
- Anchor the required unresolved-decision stop directive as an affirmative standalone line.


## Evidence: task-1 attempt 6

- **RED:** anchored directive test failed against the previous same-line compound paragraph.
- **Mutations:** whitespace/newline-separated call detected; negated-prefix directive rejected.
- **Commit:** `b9ed495186fa848f10f37b497ebbd114fe77be92` (`test(orchestration): anchor routing directives`).

## 2026-07-25 — task-3 attempt 6 started

- Render the unresolved-decision stop as a standalone affirmative directive before worker resolution.


## Evidence: task-3 attempt 6

- Standalone affirmative stop directive added before worker resolution. Four lifecycle routing tests passed.
- **Commit:** `55f792e96e7267227f4d371b915373450455adbc` (`fix(orchestration): isolate dispatch stop directive`).

## 2026-07-25 — task-2 attempt 6 re-verification

- Reverify unchanged policy against final anchored contracts.


## Evidence: task-2 attempt 6

- Policy and ownership tests passed; 2 passed, 0 failed.

## 2026-07-25 — task-4 attempt 5 started

- Final integrated verification with bounded review confirming all seven reproduced mutations are closed and no Critical/Important findings remain.


## Evidence: task-4 attempt 5

- **Focused behavior:** 5 role-routing tests passed; 0 failed.
- **Typecheck/syntax:** Node strip-types syntax check passed.
- **Lint/whitespace:** owned implementation and artifact paths passed `git diff --check`.
- **Build/integration:** every artifact graph validated and `frontier --all` preserved `.active`.
- **Full retained suite:** 59 passed and 2 failed exclusively from user-accepted unrelated workspace changes: the intentionally deleted prompt-leverage extension still has a retained importer test, and intentional Plan frontmatter capabilities conflict with an older exact-runtime assertion. No role-routing test failed.
- **Independent review:** no Critical or Important findings; all seven previously reproduced mutations now fail their contracts.
- **Scope:** feature implementation commits touch only `.pi/agent-tool-description.md`, `.pi/prompts/plan.md`, `.pi/prompts/ship.md`, and `.pi/tests/skill-system.test.ts`; unrelated deletions, agent edits, runtime state, and other artifacts remain unstaged.
