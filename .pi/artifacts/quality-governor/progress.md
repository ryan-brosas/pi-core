# Progress: Quality Governor MVP for Pi Core

## 2026-07-26T02:54:12Z — `/ship` initialized

- Active slug `quality-governor` was explicitly selected by the user before shipping.
- Canonical version-2 graph and plan IDs validated; live frontier selected only `task-1`.
- Checkout remains `/home/ryan/repo/pi-core` on `main`; no branch, worktree, commit, merge, push, dependency installation, or deletion is authorized.
- The user invoked `/ship` for the approved specification, authorizing creation of the five declared implementation paths and this canonical lifecycle progress file.
- Pre-existing unrelated artifact, Fabric runtime, Hindsight, and repository-document changes remain outside feature ownership.

## 2026-07-26T02:54:12Z — task-1 attempt 1 started

- Transient neighborhood: `.pi/tests/research-enforcement.test.ts` for the fake Pi/TDD pattern; `.pi/extensions/research-enforcement/{policy,index}.ts` for pure/runtime contracts; `.pi/research-enforcement.json` for strict config shape; installed Pi `docs/{extensions,tui}.md`; Fabric `docs/{architecture,configuration,audit-trace}.md`; and the active `spec.md`, `plan.md`, and `tasks.json`.
- Relevant history: `06a3dc4` introduced research-enforcement and `53fa293` migrated it to Fabric.
- Owned task path: `.pi/tests/quality-governor.test.ts` only.
- Required RED evidence: syntax and whitespace pass; focused execution fails only because `.pi/extensions/quality-governor/policy.ts` is intentionally absent.

## Evidence task-1 attempt 1

- **Owned output:** `.pi/tests/quality-governor.test.ts` contains 29 named behavior tests covering policy, admission, vector, sensors, verification, routing, status, persistence, and bounded correction.
- **Stable contract:** explicit assertions cover every reserved `QG-001` through `QG-016` family, including confirmation-gated expansion, revision-bound receipts, checker mutation, stale evidence, bypasses, and repair exhaustion.
- **Syntax:** `node --experimental-strip-types --check .pi/tests/quality-governor.test.ts` exited 0.
- **Intentional RED:** `node --experimental-strip-types --test --test-name-pattern="quality governor" .pi/tests/quality-governor.test.ts` exited 1 solely with `ERR_MODULE_NOT_FOUND` for the deliberately absent `.pi/extensions/quality-governor/policy.ts`; no harness or unrelated test failure ran before module resolution.
- **Formatting:** trailing-whitespace scan found zero lines and the file ends with a newline; scoped status attributes only the declared untracked test path to task-1.
- **Independent review:** final foreground read-only acceptance review returned `PASS`, Critical 0, Important 0, and explicitly authorized the task to pass. Earlier concrete review findings were validated against the canonical plan, corrected in the test contract, and re-reviewed.
- **Git:** no staging or commit was performed; branch remains `main` at `493739f45638a6a9bddb90d88483b94c4ad8a975`.

## 2026-07-26 — task-2 attempt 1 started

- Dependency evidence: task-1 passed with the intentional-RED contract at `progress.md#evidence-task-1-attempt-1`; the live frontier selected only `task-2`.
- Transient neighborhood: policy/admission/vector/correction fixtures in `.pi/tests/quality-governor.test.ts`; the approved public symbol table and stable violation semantics in `spec.md`/`plan.md`; and `.pi/extensions/research-enforcement/policy.ts` as the local dependency-free pure-policy precedent.
- Owned task path: `.pi/extensions/quality-governor/policy.ts` only. The shared test, sensors, runtime adapter, config, lifecycle files, and unrelated work are read-only for the implementation worker.
- Required GREEN evidence: the focused policy/admission/vector groups pass; policy syntax and whitespace checks pass; no filesystem, child-process, Pi, Fabric, dependency, or TUI import enters the module.

## task-2 attempt 1 — review checkpoint

- Parent verification passed the focused policy/admission/vector suite (12/12), policy syntax, diff check, and no-import check.
- Independent read-only review returned `NEEDS_FIX` with two Critical findings: mutation admission currently treats omitted canonical-path evidence as acceptable, and the structural test fixtures do not prove that confirmed authority came from the confirmation transition.
- The first bounded repair requires regression changes in `.pi/tests/quality-governor.test.ts`, which is outside task-2's current one-file ownership contract. The second repair remains in the owned `.pi/extensions/quality-governor/policy.ts`.
- Work is preserved with task-2 still running. No out-of-scope edit, lifecycle scope expansion, commit, deletion, dependency, branch, or worktree action was performed pending explicit user approval.

## task-2 attempt 1 — scope expansion approved

- User authorization: `continue!!!! nonstop!` in direct response to the exact scope checkpoint.
- The authoritative task graph was updated first and validated, then `plan.md` was synchronized. Task-2 now owns `.pi/extensions/quality-governor/policy.ts` and `.pi/tests/quality-governor.test.ts` for the two reviewed regression repairs.
- No broader implementation, deletion, dependency, commit, branch/worktree, push, or deployment permission was inferred.

## Evidence task-2 attempt 1

- **Owned outputs:** `.pi/extensions/quality-governor/policy.ts` plus the explicitly approved regression update to `.pi/tests/quality-governor.test.ts`.
- **TDD RED:** after adding confirmation-provenance and canonical-path regressions, the focused command exited 1 with 12 passing and exactly 2 failing tests, matching the two validated review defects.
- **GREEN:** `node --experimental-strip-types --test --test-name-pattern="quality governor policy|quality governor admission|quality governor vector" .pi/tests/quality-governor.test.ts` exited 0 with 14 passed, 0 failed, 0 skipped.
- **Static checks:** both Node syntax checks, the scoped `git diff --check`, trailing-whitespace scan, and no-import scan exited 0. Policy contains no runtime, filesystem, child-process, Pi, Fabric, TUI, or package import.
- **Authority and path safety:** plain JSON/spread copies cannot authorize or revise a contract; every filesystem mutation requires explicit canonical-path evidence and otherwise returns `QG-009`.
- **Independent review:** final read-only review returned `PASS`, Critical 0, Important 0, Minor 0, and explicitly stated task-2 may pass.
- **Fingerprints:** policy `dc2f3a8c725ee38e352f38e518d53ef021ef84af03eea579b00b06d6788b2933`; test `c269880cb2150b05c0328fa2e13e1c400ca6d4a3ea960a4b468a8fd2dae9923f`.
- **Git:** no staging or commit; no deletion, dependency, branch/worktree, push, or deployment.

## task-3 attempt 1 started

- Live frontier selected only `task-3` after task-2 passed.
- Transient neighborhood: sensor/verification/fingerprint tests in `.pi/tests/quality-governor.test.ts`; policy types in `.pi/extensions/quality-governor/policy.ts`; trusted configuration precedent in `.pi/research-enforcement.json` and `.pi/extensions/research-enforcement/policy.ts`; approved receipt/fingerprint/config contracts in `spec.md` and `plan.md`.
- Owned task paths: `.pi/extensions/quality-governor/sensors.ts` and `.pi/quality-governor.json` only. Policy, test, runtime adapter, lifecycle files, and unrelated state are read-only to the worker.
- Required GREEN evidence: sensor and verification groups, sensor syntax, strict JSON parse, scoped diff/format checks, argv-only execution, bounded output, and no external dependency.

## task-3 attempt 1 — review triage and continuous repair

- Independent review returned one Critical and two Important findings. Parent validation accepted the untracked-content revalidation and injected-runner cwd findings.
- The reported descriptor-bound mutation TOCTOU was not treated as an implementation defect: Pi's mediated mutation tools accept paths rather than caller-held descriptors, and the approved same-trust contract promises immediate canonical preflight, not OS-level isolation against a concurrently privileged path swap. This remains an explicit limitation and never becomes a sandbox claim.
- Consistent with the user's `continue!!!! nonstop!` instruction, the authoritative task graph was updated first and validated, then `plan.md` was synchronized so task-3 also owns the shared regression test while repairing the two validated findings.

## task-3 attempt 1 — second review repair

- Final review found two additional Important injected-runner seam defects: supplied roots were not proven to be the canonical Git root, and an injected runner could ignore timeout/cancellation metadata while `runCheckRecipe` awaited indefinitely.
- Parent validation accepted both findings. Task-3 already owns the sensor and shared test paths, so repair continues without further scope expansion.

## Evidence task-3 attempt 1

- **Owned outputs:** `.pi/extensions/quality-governor/sensors.ts`, `.pi/quality-governor.json`, and the continuously approved sensor/verification regression additions in `.pi/tests/quality-governor.test.ts`.
- **Focused GREEN:** `node --experimental-strip-types --test --test-name-pattern="quality governor sensors|quality governor verification" .pi/tests/quality-governor.test.ts` exited 0 with 9 passed, 0 failed, 0 skipped.
- **Static/config gates:** sensor and test syntax, strict JSON contract validation, scoped `git diff --check`, trailing-whitespace, and `shell: true` absence checks all exited 0.
- **Bounded evidence:** canonical path containment, NUL-safe Git evidence, tracked/untracked fingerprints, second untracked-content inspection, argv-only execution, canonical Git-root/cwd enforcement, timeout/cancellation, output bounds, checker-mutation detection, and revision/fingerprint/path/recipe receipt freshness are implemented without dependencies.
- **Review repairs:** two bounded RED→GREEN waves covered untracked drift, injected-root enforcement, and injected-runner timeout/cancellation. The final read-only gate returned `PASS`, Critical 0, Important 0, Minor 0.
- **Threat boundary:** descriptor-bound protection against a concurrently privileged same-trust path swap remains explicitly outside this MVP; no sandbox claim is made and uncertain observed evidence cannot become current.
- **Fingerprints:** sensors `d328e55a176714bf032705ba6fab951194d98700441d4d7f975e1a386e206a39`; config `81821d52740285fdfa0fe4cd9eb267f689b06ddf5335e9063225899c1bb17f30`; test `a9b378aab561c1878a78b7e0c0df05457dfc111e7afb4bfbd3d8db74f3f9bb85`.
- **Git:** no staging/commit, deletion, dependency, branch/worktree, push, or deployment.

## task-4 attempt 1 started

- Live frontier selected only `task-4` after task-3 passed.
- Transient neighborhood: routing/status/persistence/correction harnesses in `.pi/tests/quality-governor.test.ts`; completed policy, sensors, and trusted config; `.pi/extensions/research-enforcement/index.ts` as the local lifecycle precedent; installed Pi `docs/extensions.md` and `docs/tui.md`; Fabric architecture/audit-trace contracts for native nested replay and strict outer traces; active spec/plan/task contracts.
- Owned task path: `.pi/extensions/quality-governor/index.ts` only. Tests and completed modules are read-only unless a validated review defect requires a synchronized nonstop regression expansion.
- Required GREEN evidence: routing/status/persistence/correction groups, runtime syntax/diff/format checks, exact tool schemas/frontiers, direct and nested admission, monotonic mutation freshness, dual-channel output, metadata-only persistence, terminal annotation, and one bounded repair.

## task-4 attempt 1 — canonical fixture correction

- The first runtime worker correctly stopped without creating `index.ts`: mutation-capable fake contexts used nonexistent `/repo`, which cannot satisfy the approved mandatory canonical-path evidence and would force an unsafe lexical fallback.
- Under the user's nonstop instruction, the authoritative graph was updated first and validated, then `plan.md` was synchronized. Task-4 now also owns the shared runtime test fixtures solely to provide real temporary roots, existing targets, and existing new-file parents.
- No unsafe fallback or out-of-scope implementation was accepted.

## task-4 attempt 1 — real Pi load failure

- The independent review worker could not start because Pi auto-loaded the new extension and reported: `Extension runtime not initialized. Action methods cannot be called during extension loading.`
- Parent traced this to the final load-time `reconcileTools()`, which calls runtime action methods before `session_start`. This is a concrete Critical real-Pi integration defect despite the permissive fake harness.
- Task-4 already owns the runtime and test harness, so a regression-first repair proceeds within scope.

## task-4 attempt 1 — lifecycle race review triage

- Post-load independent review reported three Important findings. Parent validation accepted stale confirmation overwrite and obsolete-check status propagation.
- The tool-frontier finding was rejected against the strict configuration contract: every accepted config is atomically equal to the built-in per-mode sets, `quality_contract`/`quality_status` are present in every mode, and `quality_check` is intentionally absent from PLAN. No accepted config can remove required governor access.
- The two validated lifecycle races proceed to the second and final bounded task-4 repair wave.

## Evidence task-4 attempt 1

- **Owned outputs:** `.pi/extensions/quality-governor/index.ts` and synchronized canonical-root/race regressions in `.pi/tests/quality-governor.test.ts`.
- **Focused GREEN:** routing/status/persistence/correction command exited 0 with 13 passed, 0 failed, 0 skipped.
- **Integrated governor GREEN:** `node --experimental-strip-types --test .pi/tests/quality-governor.test.ts` exited 0 with 36 passed, 0 failed, 0 skipped.
- **Real Pi load:** a fresh loader accepts the default export, exactly three tools, and `/quality`; fake action stubs now prove no runtime action method is called during extension loading.
- **Lifecycle safety:** real canonical mutation roots, confirmation generation/revision guards, exactly-once mutation completion, obsolete-check QG-013/STALE persistence, strict Fabric bypass observation, active-branch metadata restore, terminal-only annotation, UI/model channel separation, and one persist-before-send repair are covered.
- **Static gates:** index/test syntax, scoped `git diff --check`, and trailing-whitespace checks exited 0.
- **Independent review:** final blocker gate returned `PASS`, Critical 0, Important 0, Minor 0, and stated task-4 may pass.
- **Fingerprints:** index `c36714081290841a91aa11e00c9437bc9714dc09193259eab7499bb1f2496996`; test `1c48ec04e630c54f3ad70bed3f65715678c174d4b59310347128b92020c55323`.
- **Git:** no staging/commit, deletion, dependency, branch/worktree, push, or deployment.

## task-5 attempt 1 started

- Live frontier selected only `task-5` after tasks 1–4 passed.
- Verification neighborhood is the exact five implementation paths, canonical spec/plan/tasks/progress, every retained `.pi/tests/*.test.ts`, every artifact `tasks.json`, the active-pointer read-only contract, and current branch/HEAD/scoped status.
- Task-5 creates evidence only. No implementation, cleanup, lifecycle scope change, commit, deletion, dependency, branch/worktree, push, or deployment is authorized.

## Evidence task-5 attempt 1

- **Outcome (2026-07-26T06:49:05Z): FAILED only at the complete retained-suite gate.** The feature-specific implementation, regression, static, graph, layout, and review gates pass; the canonical acceptance criterion requiring every retained test to pass does not.
- **Workflow unblock RED→GREEN:** after reload, the stale observe-mode expansion test exposed the obsolete blocking expectation (36/37). The test now requires an advisory `QG-005` finding without a blocked tool call; its focused rerun passed 1/1.
- **Integrated governor GREEN:** `node --experimental-strip-types --test .pi/tests/quality-governor.test.ts` exited 0 with 37 passed, 0 failed. The three targeted observe/checker regressions also passed 3/3.
- **Live non-blocking proof:** after `/reload`, direct `pi.bash` verification and the captured read-only `AskClaude` review both executed successfully while rollout remained `observe`; the governor no longer changes the host tool frontier or blocks unsupported/normal calls in observe mode.
- **Static gates:** syntax checks for policy, sensors, runtime, and test exited 0; scoped `git diff --check` exited 0.
- **Graph/read-only gates:** every artifact graph validated; cross-artifact frontier reporting left `.pi/artifacts/.active` byte-identical.
- **Boundary:** exact layout contains only `.pi/extensions/quality-governor/{index,policy,sensors}.ts`, `.pi/quality-governor.json`, and `.pi/tests/quality-governor.test.ts`. All five are untracked feature outputs; no deletion, manifest, lockfile, dependency, or additional feature path was found.
- **Independent review:** one bounded read-only review returned no Critical or Important findings and verified advisory observe routing, telemetry retention, non-GREEN eligibility, mutation freshness invalidation, and volatile runtime-path exclusion.
- **Retained-suite blocker:** `node --experimental-strip-types --test .pi/tests/*.test.ts` exited 1 with 200 passed and 3 failed, all in `.pi/tests/skill-system.test.ts`: two failures are caused by unrelated untracked `.pi/skills/memory/SKILL.md`; one is caused by unrelated modified `.pi/fabric.json` setting Fabric agents disabled. Those paths were not changed or deleted because they are outside feature ownership and may contain concurrent work.
- **Checkout:** `/home/ryan/repo/pi-core`, branch `main`, HEAD `493739f45638a6a9bddb90d88483b94c4ad8a975`. No staging, commit, branch/worktree, push, deployment, dependency, or deletion occurred.
