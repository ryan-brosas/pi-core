# Progress: Pi Research-Enforcement Extension

## 2026-07-25 — `/create` initialized

- User approved switching `.pi/artifacts/.active` from the completed prior feature to `research-enforcement-extension`.
- Deep research reused current-session evidence and cross-checked local extension, test, agent-loading, and provider-integration contracts.
- Selected enforcement over existing research tools for phase one; executing provider adapters remain deferred.
- Work remains in `/home/ryan/repo/pi-core` on `main` by explicit user choice; no branch or worktree was created.
- Unrelated runtime state at `.pi/fabric/mesh/state.json` is excluded from feature ownership.
- Baseline retained suite: 61 tests, 59 passed, 2 unrelated failures. The failures concern the intentionally absent `.pi/extensions/prompt-leverage.ts` and a Plan-agent expectation for `extensions: false`.
- Every existing artifact task graph validated before artifact creation.
- No implementation code was written during `/create`.

## 2026-07-25 — `/plan` provider coverage refined

- Added opt-in xAI web search as an authoritative independent provider category across `spec.md`, `plan.md`, and `tasks.json`.
- Locked exact identities: direct `xai_grok_web_search` and Fabric ref `extensions.xai_grok_web_search`.
- Explicitly preserved the paid-tool boundary: enforcement may count a successful call but must never enable or invoke xAI web search automatically.
- No implementation code or task-state transition occurred.

## 2026-07-25 — task-1 attempt 1 started

- Live frontier selected only `task-1`; canonical graph validated before transition.
- Transient neighborhood: `.pi/tests/prompt-leverage.test.ts` for extension-handler fixtures, `.pi/tests/task-graph.test.ts` and `.pi/tests/skill-system.test.ts` for pure-module/config fixtures, Pi `docs/extensions.md` and `docs/session-format.md` for lifecycle/persistence contracts, and Pi Fabric `docs/audit-trace.md` for Trace V1.
- Catalog verification confirmed opt-in `xai_grok_web_search` and exact ref `extensions.xai_grok_web_search`; availability alone must not count and enforcement must never activate it.
- Owned task path: `.pi/tests/research-enforcement.test.ts`. Unrelated `.pi/fabric/mesh/state.json` remains excluded.

## Evidence task-1 attempt 1

- Worker status: turn-limited after writing the owned test; parent inspected the actual 1,051-line file and completed verification.
- Changed path: `.pi/tests/research-enforcement.test.ts` only.
- Contract coverage: 63 named tests across classification, strict config, direct/Fabric/xAI evidence, standard/high citations, privacy, lifecycle correction, status, metrics, and session scope.
- RED: `node --experimental-strip-types --test --test-name-pattern="research enforcement" .pi/tests/research-enforcement.test.ts` exited 1 with `ERR_MODULE_NOT_FOUND` for the intentionally absent `.pi/extensions/research-enforcement/policy.ts`.
- Syntax: `node --experimental-strip-types --check .pi/tests/research-enforcement.test.ts` exited 0.
- Diff hygiene: `git diff --check -- .pi/tests/research-enforcement.test.ts` exited 0.
- Scope: status showed only the new owned test plus the pre-existing unrelated `.pi/fabric/mesh/state.json` modification; no production/config file was created.
- Review evidence: parent inspected imports, strongly typed public-shaped fixtures, exact provider table (including opt-in xAI), dynamic lifecycle import, and append-before-send harness contract.
- Commit: not created; no Git authorization was requested or implied.


## 2026-07-25 — task-2 attempt 1 started

- Live frontier selected only `task-2`; graph validated after task-1 evidence transition.
- Transient neighborhood: the task-1 contract file, Pi Fabric Trace V1 envelope/operation docs, installed research tool catalog identities, and project config/test conventions in `.pi/tests/skill-system.test.ts`.
- Owned paths: `.pi/extensions/research-enforcement/policy.ts`, `.pi/research-enforcement.json`, and the focused test.
- Pre-implementation unrelated mesh diff digest: `26d1cbdcf05c457160d74a6ae2dee631fd758b1c4ac6b505d95322d81bea11d8  -`.


## Evidence task-2 attempt 1

- Worker created `.pi/extensions/research-enforcement/policy.ts` and `.pi/research-enforcement.json`; it preserved the task-1 test initially. The worker reported its sandbox lacked `fabric_exec`, so parent verification and the subsequent focused RED/GREEN edge fixes used the required `fabric_exec` path.
- Parent added three missing edge contracts: local security/health code edits remain `none`, whitespace-only tool output is empty, and malformed successful Fabric operations do not count. All three failed first and then passed after bounded policy edits.
- Focused policy verification: `node --experimental-strip-types --test --test-name-pattern="research enforcement.*(classification|evidence|citation|config|privacy|trace)" .pi/tests/research-enforcement.test.ts` passed 43/43.
- Syntax: policy and test `--check` commands exited 0.
- Config parity: parsed project JSON equals the built-in default with five categories and maximum correction 1.
- Safety: policy has no imports, network/process access, tool registration, activation, or invocation; xAI is exact successful evidence only.
- Diff hygiene: owned-path `git diff --check` exited 0.
- Unrelated runtime-managed mesh digest observed at task-2 evidence time: `8f3925babaf8f5f2c95183fe693bca7a8c409d0d718f769877bf0f8d92375b8e  -`. It drifted independently from the task-start digest; no feature write targeted that path.
- Commit: not created; no Git authorization was requested or implied.


## 2026-07-25 — task-3 attempt 1 started

- Live frontier selected only `task-3`; graph validated after task-2 evidence transition.
- Transient neighborhood: pure policy exports, focused lifecycle harness, Pi public extension event/context types, extension lifecycle/persistence docs, session branch entries, and Fabric Trace V1 details.
- Owned paths: `.pi/extensions/research-enforcement/index.ts` and the focused test.


## Evidence task-3 attempt 1

- The delegated worker completed read-only API discovery but reached its turn limit without edits. Parent resolved plain-Node package resolution, used a public type-only import plus a guarded public runtime constant lookup, and implemented `.pi/extensions/research-enforcement/index.ts` through `fabric_exec`.
- RED: the lifecycle subset failed only with missing `index.ts` before implementation.
- Lifecycle verification: `node --experimental-strip-types --test --test-name-pattern="research enforcement.*(correction|status|scope|direct|Fabric)" .pi/tests/research-enforcement.test.ts` passed 24/24.
- Full focused feature test: `node --experimental-strip-types --test .pi/tests/research-enforcement.test.ts` passed 65/65.
- Syntax: index and policy `--check` commands exited 0.
- Wiring: eight public event hooks plus both commands are registered; correction state is appended synchronously before labelled follow-up dispatch.
- Safety/privacy: no tool activation, provider invocation, network request, prompt/query/result persistence, or xAI auto-enablement exists.
- Diff hygiene: owned-path `git diff --check` exited 0.
- Runtime-managed mesh diff was observed at `cfc8124d8031c16ebd448dd2b3b8db8834e49f2cb195f8106a211804d94302f1`; no feature operation targeted the path.
- Commit: not created; no Git authorization was requested or implied.


## 2026-07-25 — task-4 attempt 1 started

- Live frontier selected only `task-4`; graph validated after lifecycle evidence transition.
- Verification neighborhood: all four implementation paths, active/all artifact graphs, retained test suite baseline, deleted legacy-path safeguard, active-pointer integrity, and current workspace ownership.
- This task owns verification evidence only and must not modify production code unless a failing gate identifies a bounded defect.


## Evidence task-4 attempt 1

- Independent verification worker made no edits and reported the expected integrated results; parent reran all gates directly.
- Focused feature: 65/65 tests passed.
- Syntax: policy and index checks exited 0.
- Graphs: all 8 retained task graphs validated; cross-artifact frontier left `.active` byte-for-byte unchanged.
- Retained suite: 126 tests, 124 passed, exactly 2 documented unrelated baseline failures (absent legacy prompt-leverage extension and Plan frontmatter expectation); no new failure.
- Safeguards: deleted legacy extension remained absent, active slug remained `research-enforcement-extension`, and owned-path `git diff --check` exited 0.
- Checkout: `main` at `2a88b9c51da0578aab39650f7654447308fd61c7`; feature paths are untracked/modified only as planned, while runtime-managed mesh state remains outside ownership.
- Commit: not created; no Git authorization was requested or implied.


## 2026-07-25 — mandatory review round 1

- Assessment: no critical findings; four important bounded defects; two minor findings.
- Important policy defects reopened `task-2` attempt 2: sensitive user-provided transformations could classify high, bare `offline` could override explicit research, and malformed HTTPS-like strings could satisfy citations.
- Important lifecycle defect staled `task-3`: an intermediate assistant tool-call message could set `finalSeen` and trigger correction without a final answer.
- `task-4` became stale because implementation outputs changed.
- [minor] Standard correction copy may surface high-tier-only missing-section codes; defer unless required by a later gate.
- [minor] `/research-status` omits config-enabled/version and citation booleans/count; defer unless required by a later gate.
- No architecture decision or scope expansion is required for the important fixes.


## Evidence task-2 attempt 2

- Review-fix worker added bounded regressions and policy changes; parent inspected and reran all policy gates.
- New classification cases cover sensitive supplied-text transformations, external-sensitive research, bare offline-first research, and explicit no-browse opt-out.
- New citation cases reject `https://]`, `https://...`, `https://?token=secret`, and bare `https://`; URL candidates now use `URL` parsing and require an alphanumeric hostname.
- Targeted classification/citation verification passed 22/22; full policy subset passed 48/48.
- Policy syntax and owned-path diff hygiene passed.
- No config, lifecycle, dependency, or provider-activation behavior changed.


## 2026-07-25 — task-3 attempt 2 started

- Re-execution is limited to the verified intermediate assistant tool-call/final-answer defect.
- Owned paths remain `.pi/extensions/research-enforcement/index.ts` and the focused test; policy attempt 2 is passed.


## Evidence task-3 attempt 2

- The review-fix worker stopped without edits because its sandbox lacked `fabric_exec`; parent applied the bounded TDD fix through the required implementation path.
- RED: tool-call-only and text-plus-tool-call assistant messages incorrectly dispatched a correction; a later final text case already remained eligible.
- GREEN: message-end now accepts only non-empty text-only assistant content as a terminal answer and retains only citation metadata.
- Correction subset passed 11/11; lifecycle subset passed 26/26; full focused feature passed 72/72.
- Index syntax and owned-path diff hygiene passed.
- No policy/config/provider mapping or logged minor finding changed.


## 2026-07-25 — task-4 attempt 2 started

- Re-running the full verification protocol after Important review fixes changed policy, lifecycle, and focused tests.


## Evidence task-4 attempt 2

- Post-review focused feature suite passed 72/72.
- Policy and lifecycle syntax checks passed; all 9 currently retained artifact graphs validated.
- Retained suite: 133 tests, 131 passed, exactly the same two unrelated baseline failures; no new failure.
- Production stub and tool-activation/provider-invocation scans passed.
- Deleted legacy path, active slug, owned diff hygiene, branch, and HEAD safeguards passed.
- Commit: not created; no Git authorization was requested or implied.


## 2026-07-25 — review round 2 and task-2 attempt 3

- Re-review cleared offline opt-out and intermediate tool-call handling, but found two remaining Important counterexamples.
- Supplied sensitive text containing incidental words such as `current medications` or `latest regulation` still classified high despite no research action.
- URL parsing still accepted invalid DNS labels containing underscores, doubled dots, or leading/trailing hyphens.
- This is the final bounded policy fix attempt; dependent task-3 and task-4 evidence is stale until reverified.


## Evidence task-2 attempt 3

- RED reproduced both residual review counterexamples before implementation.
- Supplied-content detection now uses bounded artifact phrases rather than bare `this`; explicit research phrases override the mechanical exemption.
- HTTPS citation hosts now require at least two valid DNS labels with bounded lengths and no empty, underscore, or edge-hyphen labels.
- Residual regression subset passed 3/3; full policy subset passed 48/48; full focused suite passed 72/72.
- Final read-only review reported Critical 0, Important 0 for both residual fixes.
- Policy syntax and owned diff hygiene passed.


## 2026-07-25 — task-3 attempt 3 started

- Re-verifying lifecycle behavior against the final policy classifier/citation output; no lifecycle implementation change is planned.


## Evidence task-3 attempt 3

- Lifecycle subset passed 26/26 against final task-2 attempt-3 policy behavior.
- Full focused feature passed 72/72; index syntax and owned diff hygiene passed.
- No lifecycle production change was needed after the final policy correction.


## 2026-07-25 — task-4 attempt 3 started

- Final full verification after the clean final review of task-2 attempt 3 and lifecycle dependency recheck.


## Evidence task-4 attempt 3

- Final focused feature suite passed 72/72 after clean final policy review.
- Policy and index syntax checks passed; all 9 retained artifact graphs validated.
- Retained suite: 133 tests, 131 passed, exactly the two documented unrelated baseline failures; no new failure.
- Legacy absence, active slug, production stub/activation, diff hygiene, branch, and HEAD safeguards passed.
- Review final state: Critical 0, Important 0; two previously logged Minor items remain deferred.


## Goal-backward verification

- Exists: all 4 required artifacts are present and non-empty.
- Substantive: production files contain no TODO/FIXME/placeholder stubs; policy, adapter, and focused tests contain implemented behavior.
- Wired: all 8 required Pi lifecycle hooks and both commands are registered; policy import, input token, call/result correlation, Fabric trace extraction, terminal-answer gate, append-before-send correction, and session restoration links are present.
- Trusted project JSON parses exactly to the canonical five-provider policy.
- Key links checked: 7/7 passed.
- Final graph frontier is complete.

## 2026-07-26 — `/verify` closeout

- Graph: `task-graph validate` returned `{"ok": true, "version": 2, "issues": []}`; `frontier` returned `state: "complete"` with nothing ready, running, or blocked. All four nodes remain `passed` / `passes: true` on their current attempts.
- All nine artifact task graphs under `.pi/artifacts/` validate.
- Read-only proof: `task-graph frontier --all .pi/artifacts` left `.pi/artifacts/.active` byte-identical.
- Syntax: `node --experimental-strip-types --check` exited 0 for `.pi/extensions/research-enforcement/index.ts` and `policy.ts`.
- Diff hygiene: `git diff --check` exited 0 for `.pi/extensions`, `.pi/tests/research-enforcement.test.ts`, and `.pi/research-enforcement.json`.
- Initial full retained suite: 133 tests, 131 passed, 2 failed. Both failures were pre-existing and outside this feature's ownership, matching the baseline recorded on 2026-07-25.

### Findings addressed (both outside feature ownership)

- **Orphaned test.** `.pi/tests/prompt-leverage.test.ts` failed at import with `ERR_MODULE_NOT_FOUND` for the intentionally deleted `.pi/extensions/prompt-leverage.ts`. The same explanation had been re-recorded across six artifacts. The user gave explicit deletion permission for that exact path. Preflight confirmed the file was tracked, committed at `d8222cc`, 70 lines, with no uncommitted changes, so removal is recoverable via `git checkout HEAD -- .pi/tests/prompt-leverage.test.ts`. Deleted with `rm`; left unstaged because no Git authorization was given.
- **Stale assertion.** `.pi/tests/skill-system.test.ts` asserted `extensions: false` and `skills: false` for `.pi/agents/Plan.md`. Commit `b9a4b73 chore(pi): consolidate agent configuration` deliberately flipped both to `true`, so the assertion had been failing since that commit. `fullCodeMode` has been enabled since baseline `86adeee` and was not a factor; the uncommitted `.pi/fabric.json` switch to the QuickJS executor is unrelated, chosen because subagents are dispatched through the pi-subagents `Agent` tool rather than Fabric. Updated the two expectation lines to `extensions: true` / `skills: true`; `exclude_extensions: pi-fabric` was deliberately left unasserted while it remains uncommitted.

### Post-fix verification

- Full retained suite: `node --experimental-strip-types --test .pi/tests/*.test.ts` — **132 tests, 132 passed, 0 failed**.
- `git diff --check -- .pi/tests/skill-system.test.ts` exited 0.
- Owned test-path status: ` D .pi/tests/prompt-leverage.test.ts`, ` M .pi/tests/skill-system.test.ts`, `?? .pi/tests/research-enforcement.test.ts`.
- Unrelated concurrent work under `.pi/agents/`, `AGENTS.md`, `.pi/fabric.json`, and `.pi/fabric/mesh/state.json` was left untouched and unstaged.
- No commit, merge, push, or `.active` change was made.

**Status:** feature verified complete; retained suite green for the first time across the recorded history of this artifact.