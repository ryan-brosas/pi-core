# Progress: Contract–Seam–Feedback Lifecycle Kernel

## Create handoff — 2026-07-25T22:23:15Z

- Created from the explicit `/create contract-seam-feedback-lifecycle` request and the existing standalone research at `.pi/artifacts/contract-seam-feedback-lifecycle/research.md`.
- Research depth: Deep. Three independent read-only Fabric analyses mapped lifecycle surfaces, task-graph/test impact, and scope/architecture risks; the parent checked the cited local contracts before writing the PRD.
- User-resolved decisions:
  - Name **Contract–Seam–Feedback (CSF)** only in `.pi/skills/development-lifecycle/SKILL.md`; phase prompts use plain language.
  - Apply MVP learning-signal guidance only to product/release-level specifications.
  - Escalate verification for security, privacy, authorization/tenant isolation, data integrity, external providers, retries/idempotency, cost controls, and recovery.
- The completed `.pi/artifacts/seam-blackbox-greybox-workflow/` graph remains closed and unchanged; this new lifecycle-wide graph owns the additional work.
- PRD rigor: Full. The specification contains 9 success criteria, 11 `Verify:` commands, 8 affected implementation files, and no unresolved questions or clarification markers.
- Canonical graph: version 2 with 5 pending tasks, attempt `0`, empty evidence refs, and serial execution (`max_concurrent_agents: 1`) so `/ship` does not require unapproved worktree isolation.
- `/plan` was skipped deliberately: research resolved the architecture and `tasks.json` already contains bounded, dependency-ordered, independently verifiable slices. The graph remains authoritative; a later `/plan` may add explanatory detail without changing task IDs.

## Workspace

- Canonical checkout: `/home/ryan/repo/pi-core`
- Branch/HEAD at creation: `main` / `dd7327c63c60f88f4f9973ce6fa8d6a1c2a44592`
- No branch, worktree, dependency, commit, push, or deployment action was performed.
- Owned paths were clean before creation. Unrelated runtime/cache state under `.pi/fabric/mesh/**`, `.pi/hindsight/**`, and `.pi/artifacts/verify.log`, plus unrelated `.pi/openai-server-compaction.json`, was left untouched.
- `.pi/artifacts/.active` changed from `hindsight-only-memory` to `contract-seam-feedback-lifecycle` only after the new graph validated. This active-pointer change was authorized by the explicit `/create` request naming this artifact.

## Creation validation

- `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/contract-seam-feedback-lifecycle/tasks.json` — PASS (`ok: true`, version 2, no issues).
- Spec/graph parity check — PASS (5 matching task IDs and titles; 11 `Verify:` commands; no placeholders).
- Affected-path existence check — PASS (all 8 implementation paths exist).
- `node --experimental-strip-types --test --test-name-pattern="planning boundaries and testability contract is conditional|parent lifecycle memory policy uses Hindsight" .pi/tests/skill-system.test.ts` — PASS (2 tests, 0 failures).
- All artifact graphs — PASS (12 valid graphs).
- `frontier --all` read-only check — PASS; `.active` remained byte-identical.
- Active graph frontier — READY; `task-1` is the sole selected task and tasks 2–5 are dependency-blocked as intended.
- `git diff --check` for the created PRD and graph — PASS.

## Next execution dependency

Run `/ship`. It must validate the graph again, start `task-1`, capture genuine RED evidence for the new policy contracts, and recompute the frontier after every state transition.

## Task 1 transient neighborhood — attempt 1

- **Declared ownership:** `.pi/tests/skill-system.test.ts`.
- **Read-only contract surfaces:** `.pi/skills/development-lifecycle/SKILL.md`, `.pi/prompts/{init,research,create,ship,verify}.md`, and `.pi/workflows/development-lifecycle-workflow.md`.
- **Nearby retained contracts:** test helpers at lines 7–14; lifecycle/graph tests around lines 126–204; planning-boundary tests around lines 514–581; Hindsight tests around lines 620–701.
- **Relevant history:** `dd7327c`, `2118b28`, `53fa293`, `db5f6cf`, and `2cad988` all touched the shared test surface; append new tests without rewriting existing assertions.
- **Pre-edit evidence:** all eight implementation paths were clean; test-file SHA-256 `f11779e1f0378f9df941d1e47e6bba7018398bdcdc65309bda2217864d272ac6`.
- **Stop boundary:** no production prompt, skill, workflow, task graph, or lifecycle evidence file is child-owned for this task.


## Evidence task-1 attempt 1

- **Result:** PASS for the RED-contract task; production remains intentionally unimplemented.
- **Changed file:** `.pi/tests/skill-system.test.ts` only (`+369` lines); parent inspected the complete diff and confirmed existing assertions were not modified.
- **RED command:** `node --experimental-strip-types --test --test-name-pattern="contract-seam-feedback kernel|lifecycle intake phases|delivery phases|lifecycle workflow is optional" .pi/tests/skill-system.test.ts` — expected exit 1; 4 selected, 0 passed, 4 failed.
- **Failure attribution:** missing lifecycle kernel authority; missing init decision obligations; missing ship thin-slice obligations; missing optional/non-cyclic workflow positioning. Every failure was a semantic `AssertionError`, not syntax, import, or missing-file failure.
- **Retained baseline:** `node --experimental-strip-types --test --test-name-pattern="planning boundaries and testability contract is conditional|parent lifecycle memory policy uses Hindsight" .pi/tests/skill-system.test.ts` — exit 0; 2 selected, 2 passed, 0 failed.
- **Diff hygiene:** `git diff --check -- .pi/tests/skill-system.test.ts` — exit 0, no output.
- **Parent review:** assertions use bounded sections and semantic marker groups, cover positive obligations alongside negative single-source checks, modify no production surface, and remain within declared ownership. Their high assertion density is intentional coverage of the approved policy vocabulary and remains subject to final independent simplicity review.
- **Commit evidence:** none; no Git action was authorized.


## Task 2 transient neighborhood — attempt 1

- **Declared ownership:** `.pi/skills/development-lifecycle/SKILL.md` and `.pi/workflows/development-lifecycle-workflow.md`.
- **Read-only test contract:** `.pi/tests/skill-system.test.ts` helpers and the new `contract-seam-feedback kernel` / `lifecycle workflow is optional` tests.
- **Stable anchors:** lifecycle artifact/Hindsight paragraphs before `## Slash Commands (Lifecycle Hooks)`, lifecycle `## Workflow` through `## When to Use Each Phase`, and workflow introduction before `## Fabric Agent Execution`.
- **Nearby invariants:** four canonical artifacts, standalone research exception, Hindsight-only memory, `tasks.json` authority, direct-first Fabric routing, and at-most-three fan-out.
- **Relevant history:** `2118b28`, `53fa293`, `8392cd5`, `6187563`, and `c12ba82`; preserve recent memory, routing, and graph semantics.
- **Pre-edit hashes:** lifecycle `57b159a65d9740ca9e814a509bf6ee771457cde09332fa323824298278601e30`; workflow `f53f9cd96d6844f4bd7b9b7d6868551e282e8bd1b3c1c2a813692f99083d1f59`.
- **Stop boundary:** no prompt, test, artifact, graph, or third implementation file is child-owned.


## Evidence task-2 attempt 1

- **Recorded:** 2026-07-25T23:00:06Z.
- **Result:** PASS. The lifecycle skill is the sole named kernel authority and the workflow is an optional, bounded, one-shot, non-cyclic helper.
- **Changed files:** `.pi/skills/development-lifecycle/SKILL.md`; `.pi/workflows/development-lifecycle-workflow.md`.
- **Focused tests:** `node --experimental-strip-types --test --test-name-pattern="contract-seam-feedback kernel|lifecycle workflow is optional" .pi/tests/skill-system.test.ts` — exit 0; 2 selected, 2 passed, 0 failed.
- **Preservation tests:** `node --experimental-strip-types --test --test-name-pattern="graph producers use one canonical task graph|parent lifecycle memory policy uses Hindsight|Fabric coordination remains direct-first and parent-verified" .pi/tests/skill-system.test.ts` — exit 0; 3 selected, 3 passed, 0 failed.
- **Diff hygiene:** `git diff --check -- .pi/skills/development-lifecycle/SKILL.md .pi/workflows/development-lifecycle-workflow.md` — exit 0, no output.
- **Worker check:** bounded task-2 worker made no edits, confirmed both owned-file hashes stayed unchanged during its run, and reported no acceptance gap.
- **Parent review:** inspected the complete two-file diff; the existing four-artifact, Hindsight, graph-authority, and Fabric-routing language remains intact. No unrelated line was changed.
- **Commit evidence:** none; no Git action was authorized.


## Task 3 transient neighborhood — attempt 1

- **Declared ownership:** `.pi/prompts/init.md`, `.pi/prompts/research.md`, and `.pi/prompts/create.md`.
- **Read-only contract surface:** `.pi/tests/skill-system.test.ts`, especially `lifecycle intake phases expose decision-bearing contracts`.
- **Stable anchors:** init `### Phase 1: Detect Project` before `With --deep`; research `### Phase 4: Document` after the artifact-destination rule; create `## Phase 7: Write PRD` after the required-section table and before Task Format.
- **Nearby invariants:** init evidence validation and omission policy; research remains on demand and preserves artifact routing; create remains specification-only and keeps the canonical graph flow.
- **Relevant history:** `2118b28`, `53fa293`, `a0c2047`, `8392cd5`, and `c12ba82`; preserve Hindsight, Fabric, generated-policy, research-routing, and graph-authority semantics.
- **Pre-edit hashes:** init `16d3064bcd0937f7b3641b14b44b77e67e8c40829a95bbab8a635803fc7e3c64`; research `3ac85a5b42fac49a674092bea7ae748dc361c5507d8edee2ae4a9c71adc467ca`; create `fa8fbcfa1862997f20cb291a303e0d9b4455460c1108fe3d3b800872ae289d48`.
- **RED evidence:** `node --experimental-strip-types --test --test-name-pattern="lifecycle intake phases" .pi/tests/skill-system.test.ts` — expected exit 1; the single selected test failed first at the missing init obligations.
- **Stop boundary:** no lifecycle skill, workflow, test, artifact graph, or fourth implementation file is child-owned.


## Evidence task-3 attempt 1

- **Recorded:** 2026-07-25T23:05:04Z.
- **Result:** PASS. The intake and decision prompts now expose validated outcomes, decision records, observable behavior, bounded controls, and conditional product/release learning guidance without naming the kernel.
- **Changed files:** `.pi/prompts/init.md`, `.pi/prompts/research.md`, and `.pi/prompts/create.md` (13 insertions, no deletions).
- **TDD progression:** baseline focused test exited 1 at seven missing init obligations; after the init slice it advanced to research; after the research slice it advanced only to create; after the create slice it exited 0 with 1 selected, 1 passed.
- **Parent focused test:** `node --experimental-strip-types --test --test-name-pattern="lifecycle intake phases" .pi/tests/skill-system.test.ts` — exit 0; 1 selected, 1 passed, 0 failed.
- **Preservation tests:** `node --experimental-strip-types --test --test-name-pattern="research prompt always persists a research artifact|init policy synthesis preserves evidence and existing content|graph producers use one canonical task graph" .pi/tests/skill-system.test.ts` — exit 0; 3 selected, 3 passed, 0 failed.
- **Single-source scan:** forbidden kernel-name/acronym scan across the three prompts — exit 0, no matches.
- **Diff hygiene:** `git diff --check -- .pi/prompts/init.md .pi/prompts/research.md .pi/prompts/create.md` — exit 0, no output.
- **Parent review:** inspected the complete bounded diff; each edit is in the planned section, no existing behavior was removed, and no fourth file changed.
- **Commit evidence:** none; no Git action was authorized.


## Task 4 transient neighborhood — attempt 1

- **Declared ownership:** `.pi/prompts/ship.md` and `.pi/prompts/verify.md`.
- **Read-only contract surface:** `.pi/tests/skill-system.test.ts`, especially `delivery phases select observable and consequence-based evidence`; full verification protocol at `.pi/skills/verification-before-completion/references/VERIFICATION_PROTOCOL.md`.
- **Stable anchors:** ship `### TDD Execution Flow` before Task Commit Protocol; verify `## Phase 3: Correctness` after the incremental/full mode table and before auto-fix execution order.
- **Nearby invariants:** validated dynamic frontier, attempt-scoped evidence, explicit Git approvals, changed-file execution modes, full ship gates, verification cache, and parent-owned review.
- **Relevant history:** `2118b28`, `53fa293`, `55f792e`, `7821c5a`, and `780414c`; preserve Hindsight, Fabric routing, and unresolved-dispatch safeguards.
- **Pre-edit hashes:** ship `235ca507c321ccb938646aaf2b6dd76365cc95bfa112b3436604f356762455d8`; verify `4e13ac74073aabe3acd1d451dcb29cd9dbbcba6d98d4a8379384a8b9f15b6f0c`.
- **RED evidence:** `node --experimental-strip-types --test --test-name-pattern="delivery phases" .pi/tests/skill-system.test.ts` — expected exit 1; the single selected test failed first at seven missing ship obligations.
- **Stop boundary:** no test, intake prompt, lifecycle skill, workflow, artifact graph, or third implementation file is child-owned.


## Evidence task-4 attempt 1

- **Recorded:** 2026-07-25T23:10:08Z.
- **Result:** PASS. Shipping now requires an observable thin slice at justified seams, while verification preserves changed-file gate breadth and independently selects bounded consequence-driven evidence, vantage, conditional readiness, and advisory routing.
- **Changed files:** `.pi/prompts/ship.md` and `.pi/prompts/verify.md` (29 insertions, no deletions).
- **TDD progression:** baseline focused test exited 1 at seven missing ship obligations; after the ship slice it advanced to verification consequences; after the verify slice it exited 0 with 1 selected, 1 passed.
- **Parent focused test:** `node --experimental-strip-types --test --test-name-pattern="delivery phases" .pi/tests/skill-system.test.ts` — exit 0; 1 selected, 1 passed, 0 failed.
- **Preservation tests:** `node --experimental-strip-types --test --test-name-pattern="ship executes a validated dynamic frontier|graph state is evidence-linked and selectively invalidated|ship honors project approval gates" .pi/tests/skill-system.test.ts` — exit 0; 3 selected, 3 passed, 0 failed.
- **Single-source scan:** forbidden kernel-name/acronym scan across both prompts — exit 0, no matches.
- **Diff hygiene:** `git diff --check -- .pi/prompts/ship.md .pi/prompts/verify.md` — exit 0, no output.
- **Parent review:** inspected the complete bounded diff; the approved eight consequence groups are exact, and existing frontier, approval, cache, mode, and gate-order contracts were not removed.
- **Commit evidence:** none; no Git action was authorized.


## Task 5 transient neighborhood — attempt 1

- **Declared implementation ownership:** none; task 5 verifies the integrated result. Parent-owned lifecycle evidence remains `progress.md` and `tasks.json`.
- **Integrated surfaces:** `.pi/tests/skill-system.test.ts`, `.pi/skills/development-lifecycle/SKILL.md`, `.pi/prompts/{init,research,create,ship,verify}.md`, and `.pi/workflows/development-lifecycle-workflow.md`.
- **Verification neighborhood:** active `spec.md`, `plan.md`, `tasks.json`, `progress.md`; every `.pi/artifacts/*/tasks.json`; excluded planning/graph surfaces; full retained `.pi/tests/*.test.ts` suite.
- **Risk checks:** no UI files; no dependency/build manifest; no runtime code path. Build, standalone lint, and standalone typecheck have no separate project command, so the Node TypeScript test runner plus `git diff --check` are the applicable executable gates.
- **Goal-backward links:** one named kernel authority; five phase-local prompt hooks; optional workflow positioning; semantic policy tests; preserved planning contracts; artifact and Hindsight authority.
- **Review scope:** security/correctness, architecture/performance relevance, type/test quality, conventions, scope, duplication, simplicity, completeness, and secret/local-path scan over the exact feature diff.
- **Current checkout:** `/home/ryan/repo/pi-core`, branch `main`, HEAD `dd7327c63c60f88f4f9973ce6fa8d6a1c2a44592`. Unrelated runtime/config/cache changes remain outside feature ownership.
- **Stop boundary:** no code/prompt edit is authorized under task 5; any critical or important review finding requires a bounded fix envelope and fresh verification.

## Verification task-5 attempt 1

- **Recorded:** 2026-07-25T23:27:51Z.
- **Result:** FAIL. All current policy text, focused tests, retained tests, graph checks, and preservation checks pass, but the required independent review found two important semantic regression-test gaps. Task 5 cannot pass while important findings remain.
- **Mode:** Full pre-ship verification required by the active specification and task 5.
- **Completeness:** 9/9 PRD success criteria are present in the current published surfaces. FR1 and FR5 remain vulnerable to regressions because their negative/exact-boundary test enforcement is incomplete.

### Requirement evidence

- **FR1 complete in current text:** the sole named kernel and compact rule are at `.pi/skills/development-lifecycle/SKILL.md:26-49`; the prompt/workflow name-and-acronym scan passes. Regression coverage is partial because `.pi/tests/skill-system.test.ts:769-777` does not reject anonymous full-doctrine duplication.
- **FR2 complete:** init outcome/boundary/channel guidance is at `.pi/prompts/init.md:79-83`; research decision records at `.pi/prompts/research.md:157`; create observable journeys, controls, and conditional learning at `.pi/prompts/create.md:198-200`.
- **FR3 complete:** the planning prompt, planning skill, PRD template, and task-graph implementation are unchanged from HEAD; retained planning tests pass.
- **FR4 complete:** thin safe slices, outside-first evidence, justified seams, and mock/API prohibitions are at `.pi/prompts/ship.md:195-199`.
- **FR5 complete in current text:** `.pi/prompts/verify.md:123-129` names exactly the approved eight consequence groups, outside-first controlled-failure evidence, a named evidence gap, stable seam, and evidence vantage. Regression coverage is partial because `.pi/tests/skill-system.test.ts:980-1002` proves all eight are present but would not reject a ninth source category.
- **FR6 complete:** advisory routes and non-automatic constraints are at `.pi/skills/development-lifecycle/SKILL.md:40-49` and `.pi/prompts/verify.md:135-145`.
- **FR7 complete:** conditional product/release learning guidance and the readiness-versus-learning distinction are at `.pi/prompts/create.md:200` and `.pi/prompts/verify.md:131-133`.
- **FR8 complete:** existing artifact/Hindsight authority remains at `.pi/skills/development-lifecycle/SKILL.md:14-24,32-38`; all retained graph and memory tests pass and no schema or fifth canonical artifact was added.

### Correctness gates

| Gate | Status | Mode | Time |
|---|---|---|---|
| Typecheck | N/A | — | — |
| Lint | N/A | — | — |
| Test | PASS | full | 1.41s |
| Build | N/A | — | — |

- No `package.json`, typecheck configuration, lint configuration, or build command exists; project policy forbids inventing package-manager commands. `node --experimental-strip-types --check .pi/tests/skill-system.test.ts` passed in 0.10s, and scoped `git diff --check` passed in 0.05s.
- Focused lifecycle contracts: PASS, 4/4, 0 failures, 0 skips (0.31s).
- Complete retained suite: PASS, 152/152, 0 failures, 0 skips (1.41s).
- Artifact graphs: PASS, all 12 validate (1.38s).
- Cross-artifact frontier: PASS; `.active` remained byte-identical and selected `contract-seam-feedback-lifecycle`.
- Excluded planning/graph surfaces: PASS, unchanged from HEAD.
- Current-attempt graph evidence audit: tasks 1-4 had valid attempt-1 evidence anchors; task 5 was running with `passes: false` before this failed verification was recorded.

### Independent review and parent disposition

- Fabric review `2317c0f66b8647468161aee499ca30d7` completed read-only with no blocker and two important findings.
- **Accepted [should-fix]:** `.pi/tests/skill-system.test.ts:980-1002` does not enforce that the source consequence list contains no category beyond the approved eight. Smallest fix: parse the bounded list and compare its normalized members to the exact approved set.
- **Accepted [should-fix]:** `.pi/tests/skill-system.test.ts:769-777` prohibits only the kernel name/acronym outside the authority and does not detect anonymous duplication of the full doctrine. Smallest fix: add a bounded semantic combination guard that still permits each phase's local obligation.
- **Dismissed [nit]:** route wording in the lifecycle skill and verify prompt is required by FR1's single authority plus FR6's phase-local hook; current wording is consistent.
- **Dismissed [simplify]:** route marker groups are already centralized and reused at `.pi/tests/skill-system.test.ts:727-755,847,1040`.

### Coherence and external corroboration

- PRD, plan, graph, and current policy do not contradict each other. The only gap is regression-test strength versus the plan's exact bounded-set and full-doctrine review obligations.
- **[S1]** NIST SSDF 1.1 recommends selecting secure-development practices using a risk-based approach and more rigorous assessment for high-risk areas, corroborating consequence-driven escalation rather than file-count-only verification.
- **[S2]** DORA's working-in-small-batches guidance connects smaller batches to shorter feedback loops, corroborating the thin-slice delivery rule.
- **[S3]** Lean Startup guidance defines MVP around customer learning and feedback, corroborating the policy that technical tests establish readiness but not validated learning.

### Advisory feedback route

- Classification: known implementation defects in the semantic test contract.
- Recommended route: `ship` for a bounded task-1 test fix, then explicit reruns of stale descendants and full verification. This recommendation does not invoke a command or mutate `.active`.
- Selective invalidation: task-5 failed; the attributed owner task-1 became stale; descendants task-2, task-3, and task-4 became stale; no other graph was changed.

Verification: FAIL - 9/9 current PRD outcomes are present and executable gates pass, but two important test-enforcement gaps block shipping.

### Sources

- **[S1]** NIST, *Secure Software Development Framework (SSDF) Version 1.1*, SP 800-218 (2022), retrieved via Exa: https://csrc.nist.gov/pubs/sp/800/218/final
- **[S2]** DORA, *Working in small batches*, retrieved via Codex Search: https://dora.dev/capabilities/working-in-small-batches/
- **[S3]** Lean Startup Co., *What Is an MVP? Eric Ries Explains*, retrieved via Codex Search: https://leanstartup.co/resources/articles/what-is-an-mvp/

## Task 1 recovery neighborhood — attempt 2

- **Started:** 2026-07-25T23:35:00Z (recovery after independent-review findings; exact command evidence will carry fresh timestamps).
- **Declared ownership:** `.pi/tests/skill-system.test.ts` only. No production policy surface requires a change because the current source text already satisfies the PRD.
- **Transient read-only surfaces:** `.pi/skills/development-lifecycle/SKILL.md`, `.pi/prompts/verify.md`, the six unnamed prompt/workflow surfaces, and the existing semantic helpers/tests around lines 709-1077.
- **Attributed defects:** the single-source test rejects only the kernel name/acronym, and the consequence test proves only presence of the eight approved groups.
- **Required fixes:** reject an anonymous full-doctrine combination while permitting phase-local obligations; parse and compare the source consequence list to exactly the approved eight normalized groups, including a negative mutation witness for each guard.
- **Pre-edit test hash:** `c1aba444a9e842460705e215bcb9377e8ad4fdeb53208879dcae7f5ff3df9e37`. Relevant history remains `dd7327c`, `2118b28`, `53fa293`, `db5f6cf`, and `2cad988`.
- **TDD boundary:** obtain semantic RED evidence from mutation probes before finalizing reusable guards; malformed TypeScript or a production-policy edit is not acceptable RED.
- **Stop boundary:** the worker must not edit `.active`, `tasks.json`, `progress.md`, any prompt/skill/workflow, create files, stage, commit, or publish.

## Evidence task-1 attempt 2

- **Recorded:** 2026-07-25T23:46:40Z.
- **Result:** PASS. The two review-attributed regression gaps are closed in the test contract; current production policy was not changed.
- **Changed file:** `.pi/tests/skill-system.test.ts` only; SHA-256 changed from `c1aba444a9e842460705e215bcb9377e8ad4fdeb53208879dcae7f5ff3df9e37` to `b3817a14aeed5f3a2b1d6e226bf47c371454546714889566fe4912b2a90d609d`.
- **Worker:** Fabric run `a70d7030bd824bc889c7bd4af8f95453` stayed within the one-file envelope and reported no lifecycle, production, Git, dependency, or new-file mutation.
- **RED evidence:** focused kernel/delivery command exited 1 after temporary negative probes showed two semantic failures: the old name-only check accepted a complete anonymous doctrine, and the old presence-only check accepted an added `availability` category. Failures were `Missing expected exception`, not syntax/import errors.
- **GREEN design:** each unnamed surface is checked independently for the name/acronym and a conjunction of five doctrine dimensions; a synthetic complete unnamed doctrine must throw. The bold semicolon-delimited source list is normalized, sorted, and deep-compared to the approved eight groups; a synthetic ninth member must throw. Existing positive marker groups remain.
- **Parent syntax check:** `node --experimental-strip-types --check .pi/tests/skill-system.test.ts` — exit 0 (0.12s).
- **Parent focused regression:** kernel plus delivery — 2/2 passed, 0 failed (0.32s).
- **Parent task contract:** all four lifecycle semantic tests — 4/4 passed, 0 failed (0.30s).
- **Parent preservation baseline:** planning-boundary plus Hindsight — 2/2 passed, 0 failed (0.29s).
- **Diff hygiene:** `git diff --check -- .pi/tests/skill-system.test.ts` — exit 0.
- **Parent review:** the guards directly exercise both accepted findings, permit all six current phase-local surfaces, avoid whole-paragraph equality, and introduce no test-only production API or source-policy expansion. Remaining natural-language paraphrase limits are acceptable for a bounded semantic contract test.
- **Commit evidence:** none; no Git action was authorized.

## Task 2 recovery neighborhood — attempt 2

- **Started:** 2026-07-25T23:47:22Z.
- **Declared ownership:** `.pi/skills/development-lifecycle/SKILL.md` and `.pi/workflows/development-lifecycle-workflow.md`; this stale rerun is verification-only unless a focused failure identifies source drift.
- **Transient neighborhood:** strengthened semantic helpers in `.pi/tests/skill-system.test.ts`, the kernel section before lifecycle hooks, advisory route table, workflow introduction, and retained graph/Hindsight/Fabric contracts.
- **Preflight hashes:** lifecycle `648a6f06adb55ada35ee5f49f85f798c30d2322cc416d3692186cbea7c7f4b77`; workflow `f70e79c2fc1f79054d3bcba6d265a45aed702c3f4f369b685b29b25e3bc71db2`; test `b3817a14aeed5f3a2b1d6e226bf47c371454546714889566fe4912b2a90d609d`.
- **Rerun reason:** task-1's test contract changed; re-establish that both owned policy surfaces satisfy the stronger anonymous-doctrine guard and all original task-2 obligations.
- **Stop boundary:** no source edit is planned; any failure requiring another file, weakened artifact/Hindsight authority, or changed routing semantics stops this rerun.

## Evidence task-2 attempt 2

- **Recorded:** 2026-07-25T23:47:48Z.
- **Result:** PASS. Both stale-owned policy surfaces satisfy the strengthened single-source contract without any attempt-2 source edit.
- **Focused tests:** kernel authority plus optional workflow — 2/2 passed, 0 failed (0.26s).
- **Preservation tests:** canonical graph, direct-first parent-verified Fabric coordination, and Hindsight lifecycle policy — 3/3 passed, 0 failed (0.26s).
- **Single-source scan:** only `.pi/skills/development-lifecycle/SKILL.md` contains the kernel name/acronym; all six unnamed surfaces also passed the new anonymous full-doctrine guard.
- **Hashes unchanged during rerun:** lifecycle `648a6f06adb55ada35ee5f49f85f798c30d2322cc416d3692186cbea7c7f4b77`; workflow `f70e79c2fc1f79054d3bcba6d265a45aed702c3f4f369b685b29b25e3bc71db2`.
- **Diff hygiene:** scoped `git diff --check` — exit 0.
- **Parent review:** scoped diff remains limited to one authoritative kernel/mapping/route section and one optional-workflow introduction; no artifact table, Hindsight rule, graph authority, Fabric limit, or automatic-transition guard regressed.
- **Commit evidence:** none; no Git action was authorized.

## Task 3 recovery neighborhood — attempt 2

- **Started:** 2026-07-25T23:48:07Z.
- **Declared ownership:** `.pi/prompts/init.md`, `.pi/prompts/research.md`, and `.pi/prompts/create.md`; this stale rerun is verification-only unless focused evidence finds source drift.
- **Transient neighborhood:** the strengthened unnamed-surface guard and intake semantic test, plus init Detect Project, research Document, and create Write PRD bounded sections.
- **Preflight hashes:** init `ee17534c239f0134c0f6658cb298f92fc4a5d99fb544edfa5b36d443bc019d1b`; research `f7ef7f757c0cc095d56672768517d7e89d99cf8a689802d257e503bf322e15e4`; create `e3151425751db7107d4972d7eb80f742a9b553959358fd9d46778e9ec936599d`; test `b3817a14aeed5f3a2b1d6e226bf47c371454546714889566fe4912b2a90d609d`.
- **Rerun reason:** task-1 changed the single-source enforcement; re-establish all intake obligations and prove none of these three local hooks accidentally duplicates the full doctrine.
- **Stop boundary:** no source edit is planned; universal learning guidance, changed research routing, invented seams, a fourth implementation file, or hash drift stops this rerun.

## Evidence task-3 attempt 2

- **Recorded:** 2026-07-25T23:48:32Z.
- **Result:** PASS. All three stale intake/decision hooks satisfy their task contract and the strengthened single-source guard without attempt-2 source edits.
- **Focused test:** lifecycle intake phases — 1/1 passed, 0 failed (0.27s).
- **Preservation tests:** research artifact routing, init evidence preservation, and canonical graph production — 3/3 passed, 0 failed (0.25s).
- **Single-source scan:** no kernel name/acronym in init, research, or create; the focused test also proves the three surfaces contain local obligations rather than a complete anonymous doctrine.
- **Hashes unchanged during rerun:** init `ee17534c239f0134c0f6658cb298f92fc4a5d99fb544edfa5b36d443bc019d1b`; research `f7ef7f757c0cc095d56672768517d7e89d99cf8a689802d257e503bf322e15e4`; create `e3151425751db7107d4972d7eb80f742a9b553959358fd9d46778e9ec936599d`.
- **Diff hygiene:** scoped `git diff --check` — exit 0.
- **Parent review:** edits remain additive and bounded to the planned sections; validated fact handling, on-demand research/artifact routing, canonical task generation, and product/release-only learning scope remain intact.
- **Commit evidence:** none; no Git action was authorized.

## Task 4 recovery neighborhood — attempt 2

- **Started:** 2026-07-25T23:48:52Z.
- **Declared ownership:** `.pi/prompts/ship.md` and `.pi/prompts/verify.md`; this stale rerun is verification-only unless focused evidence finds source drift.
- **Transient neighborhood:** strengthened anonymous-doctrine and exact-consequence helpers, ship's Behavioral Delivery Rule, verify Correctness through Advisory Feedback Routing, and retained frontier/approval contracts.
- **Preflight hashes:** ship `dd664c01f4117412364ac73a5c3008b690b0a47d2af1559f24d8bcb1e8977366`; verify `41a519d33ff9b09f92ce50d7a4722b8893e2f912ddfa978d68547a6cecd8d354`; test `b3817a14aeed5f3a2b1d6e226bf47c371454546714889566fe4912b2a90d609d`.
- **Rerun reason:** task-1 now enforces exact set equality and anonymous-doctrine resistance; re-establish that delivery and verification remain phase-local and the source list has exactly the approved eight groups.
- **Stop boundary:** no source edit is planned; a ninth category, executable routing, universal MVP guidance, changed gate breadth, speculative interface requirement, third implementation file, or hash drift stops this rerun.

## Evidence task-4 attempt 2

- **Recorded:** 2026-07-25T23:49:16Z.
- **Result:** PASS. Delivery and verification satisfy the stronger exact-set and anonymous-doctrine contracts without attempt-2 source edits.
- **Focused test:** delivery phases — 1/1 passed, 0 failed (0.26s); this includes exact normalized equality to the approved eight source groups and both negative mutation witnesses.
- **Preservation tests:** dynamic frontier, selective evidence invalidation, and project approval gates — 3/3 passed, 0 failed (0.29s).
- **Single-source scan:** no kernel name/acronym in ship or verify; both also pass the full-doctrine conjunction guard as phase-local obligations.
- **Hashes unchanged during rerun:** ship `dd664c01f4117412364ac73a5c3008b690b0a47d2af1559f24d8bcb1e8977366`; verify `41a519d33ff9b09f92ce50d7a4722b8893e2f912ddfa978d68547a6cecd8d354`.
- **Diff hygiene:** scoped `git diff --check` — exit 0.
- **Parent review:** the source list is exactly bounded, observable/controlled-failure evidence remains first, deeper evidence still requires a named gap/stable seam, readiness remains product/release-conditional, and routing remains advisory/non-automatic. Existing mode, frontier, and approval contracts are intact.
- **Commit evidence:** none; no Git action was authorized.

## Task 5 integrated verification neighborhood — attempt 2

- **Started:** 2026-07-25T23:49:53Z.
- **Declared implementation ownership:** none; task 5 owns fresh parent verification/review evidence only.
- **Integrated implementation surfaces:** `.pi/skills/development-lifecycle/SKILL.md`, `.pi/prompts/{init,research,create,ship,verify}.md`, `.pi/workflows/development-lifecycle-workflow.md`, and `.pi/tests/skill-system.test.ts`.
- **Dependency evidence:** tasks 1-4 are passed at attempt 2 with current test and review refs anchored at `progress.md#evidence-task-{1,2,3,4}-attempt-2`.
- **Verification neighborhood:** full `.pi/tests/*.test.ts` suite, all `.pi/artifacts/*/tasks.json` graphs, `.active` hash `6df29100eaff61750076d864a1cfa245e712523b9a9e464a334c8dc2d9d98c7c`, excluded planning/graph files, and the exact eight-file feature diff.
- **Applicable gates:** full retained tests, TypeScript syntax, semantic single-source/exact-set checks, graph validation, pointer immutability, excluded-surface preservation, and diff hygiene. No package manifest, lint config, typecheck config, build command, dependency, runtime path, or UI file exists for this change; unavailable gates will be reported N/A rather than invented.
- **Review scope:** current uncommitted working diff against HEAD `dd7327c63c60f88f4f9973ce6fa8d6a1c2a44592`; security/correctness, architecture/performance relevance, test/type quality, conventions, duplication, simplicity, completeness, automatic routing, bounded risks, artifact/schema, and Hindsight preservation.
- **Stop boundary:** any test/graph/pointer/preservation failure, owned hash drift, undeclared implementation path, or unresolved critical/important independent-review finding fails this attempt.

## Evidence task-5 attempt 2

- **Recorded:** 2026-07-25T23:53:10Z.
- **Result:** PASS. Full fresh ship verification, goal-backward checks, and independent review are green; all 9/9 PRD success criteria are implemented.
- **Mode:** full. The verification cache was not used.

### Applicable gate results

| Gate | Status | Mode | Time |
|---|---|---|---|
| Typecheck | N/A | — | — |
| Lint | N/A | — | — |
| Test | PASS | full | 1.43s |
| Build | N/A | — | — |

- No package manifest, typecheck/lint configuration, or build command exists; project policy forbids inventing one. The changed TypeScript test passed `node --experimental-strip-types --check` (0.09s), and scoped diff hygiene passed (0.06s).
- **Observable/structural contract evidence:** all four focused lifecycle tests passed 4/4 with zero failures/skips (0.27s), including the rejecting anonymous-doctrine and ninth-category mutation witnesses.
- **Integrated evidence:** complete retained suite passed 152/152 with zero failures/skips (1.43s).
- **Graph evidence:** all 12 artifact graphs validated; cross-artifact frontier reporting left `.active` byte-identical at SHA-256 `6df29100eaff61750076d864a1cfa245e712523b9a9e464a334c8dc2d9d98c7c` and active slug `contract-seam-feedback-lifecycle`.
- **Scope preservation:** plan prompt, planning skill, PRD template, and task-graph source remain unchanged from HEAD. Kernel name/acronym appears only in the lifecycle skill. No UI, runtime path, dependency, schema, fifth canonical artifact, or implementation file outside the declared eight was added.
- **Goal-backward verification:** 8/8 implementation artifacts exist, 8/8 are substantive, and 8/8 are wired to semantic policy tests. No TODO/FIXME/placeholder/no-op stub appears in added lines. Key links cover the single kernel authority, three intake hooks, two delivery/verification hooks, optional workflow, exact risk set, advisory routing, and mutation-resistant tests.
- **Evidence audit:** tasks 1-4 were passed at attempt 2 with two current refs each before integrated verification; all owned implementation hashes remained unchanged through review.
- **UI quality gate:** not applicable; no `.tsx`, `.jsx`, stylesheet, HTML, or MDX surface changed.
- **Independent review:** Fabric run `0185d99a4b5b461f9dd01380934991de` returned PASS with 0 critical, 0 important, and 0 minor findings. It independently confirmed both prior important findings closed and found no policy duplication, automatic routing, bounded-risk, artifact/schema, Hindsight, scope, or deletion defect. Parent validated its cited source list, guard functions, mutation witnesses, and current source hashes.
- **Informational residual:** marker-based natural-language tests intentionally cover bounded semantic combinations rather than every arbitrary paraphrase; this matches the PRD's stable-semantic, non-paragraph-equality requirement.
- **Current checkout:** `/home/ryan/repo/pi-core`, branch `main`, HEAD `dd7327c63c60f88f4f9973ce6fa8d6a1c2a44592`.
- **Commit evidence:** none; no Git action was authorized.

## Pre-ship verification confirmation — task-5 attempt 2 — 2026-07-25T23:59:03Z

- **Result:** PASS — READY TO SHIP. Fresh full-mode verification was run; the cache was bypassed because this is pre-ship verification.
- **Completeness:** 8/8 functional requirements and 9/9 success criteria complete.
- **Graph evidence:** all five version-2 nodes remain `passed` with `passes: true` at attempt 2; every current-attempt ref resolves to an existing `progress.md` anchor. All eight implementation hashes still match attempt-2 evidence, so no source task or descendant is stale.

### Requirement evidence

- **FR1:** one named kernel, compact rule, and artifact mapping at `.pi/skills/development-lifecycle/SKILL.md:26-38`; anonymous-doctrine and naming guards at `.pi/tests/skill-system.test.ts:767-910`.
- **FR2:** validated intake, decision record, and observable create contract at `.pi/prompts/init.md:78-83`, `.pi/prompts/research.md:148-157`, and `.pi/prompts/create.md:188-200`.
- **FR3:** excluded planning prompt, planning skill, PRD template, and task-graph source are unchanged from HEAD; retained planning contracts pass.
- **FR4:** thin safe slice, outside-first boundary evidence, justified seams, and mock/API prohibitions at `.pi/prompts/ship.md:195-199`.
- **FR5:** changed-file breadth plus exact bounded consequence escalation, outside-first controlled failures, named evidence gaps, stable seams, and vantage labels at `.pi/prompts/verify.md:116-129`; exact-set and ninth-category mutation guards at `.pi/tests/skill-system.test.ts:789-1096`.
- **FR6:** advisory route table and non-automatic constraints at `.pi/skills/development-lifecycle/SKILL.md:57-68` and `.pi/prompts/verify.md:135-144`.
- **FR7:** product/release-only learning guidance and readiness-versus-learning distinction at `.pi/prompts/create.md:198-200` and `.pi/prompts/verify.md:131-133`.
- **FR8:** four-artifact, `tasks.json`, standalone research, and Hindsight authority at `.pi/skills/development-lifecycle/SKILL.md:11-24,32-38,57`.

### Correctness gates

| Gate | Status | Mode | Time |
|---|---|---|---|
| Typecheck | N/A — no configured command | — | — |
| Lint | N/A — no configured command | — | — |
| Test | PASS — 152/152, zero failures/skips | full | 1.55s |
| Build | N/A — no build command/runtime path | — | — |

- No `package.json`, `tsconfig`, lint configuration, `Makefile`, or build command exists; project policy forbids inventing package-manager gates. Supplemental TypeScript parse check passed in 0.03s and full scoped `git diff --check` passed in 0.00s.
- Focused lifecycle contracts: PASS, 4/4, zero failures/skips (0.24s).
- Every artifact graph: PASS, 12/12 valid. Cross-artifact frontier reporting left `.active` byte-identical at SHA-256 `6df29100eaff61750076d864a1cfa245e712523b9a9e464a334c8dc2d9d98c7c` and active slug `contract-seam-feedback-lifecycle`.
- Independent read-only review: Fabric run `3c901e3b78ad423485d7ee16082d0cf2` returned PASS with 0 critical, 0 important, and 0 minor findings. Parent checked its cited source ranges against current files.

### Coherence and research corroboration

- No contradiction was found among the PRD, plan, authoritative graph, implementation, or current-attempt evidence.
- **[S1]** NIST IR 8397 says test cases should be more comprehensive in areas of greatest consequence, corroborating FR5's consequence-driven escalation rather than file-count-only selection.
- **[S2]** DORA states that small batches shorten feedback loops and reduce the time needed to get feedback on changes, corroborating FR4's smallest-safe-slice guidance.

### Advisory route and residual risk

- No corrective lifecycle route is needed. The next user-controlled action is `/ship contract-seam-feedback-lifecycle`; no command or phase was invoked and `.active` was not mutated.
- Residual risk is limited to the intentional use of bounded semantic markers: they resist the tested anonymous-doctrine and ninth-category mutations but cannot recognize every arbitrary natural-language paraphrase.

Verification: PASS - 8/8 functional requirements and 9/9 success criteria are complete; full applicable gates, graph checks, coherence review, and independent review pass.

### Sources

- **[S1]** NIST, *Guidelines on Minimum Standards for Developer Verification of Software*, NISTIR 8397 (2021), retrieved via Exa: https://nvlpubs.nist.gov/nistpubs/ir/2021/NIST.IR.8397.pdf
- **[S2]** DORA, *Working in small batches*, retrieved via Codex Search: https://dora.dev/capabilities/working-in-small-batches/

## Research: Strict methodology enforcement after audit — 2026-07-26

**Execution mode:** Complex / deep-research workflow. Three independent angles were researched, then one dependent read-only review cross-checked them against the current checkout. Parent verification used Context7, Exa, and Codex Search directly. xAI Web Search was attempted but unavailable because no active xAI/Grok model was selected; no xAI request was sent.

### Questions and confidence

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| Does the completed active feature strictly enforce the methodology? | Answered | High | No. It successfully implements its approved advisory scope, but that scope explicitly excludes the runtime, planning, graph, and validator changes needed for strict enforcement. |
| What is the smallest enforceable unit? | Answered | High | A versioned decision contract covering observable behavior, planning triggers, conditional seam records, independent evidence design, and current evidence bindings. |
| Can schema shape alone enforce it? | Answered | High | No. Conditional schema rules can require branch-specific fields, but cross-file references, evidence existence, freshness, and worker propagation need executable semantic checks. |
| Can a Pi extension make prompt policy mechanical? | Answered | High for command and mutation gates; partial for workers | It can block raw lifecycle commands before template expansion and nested Pi file/shell tools before execution. Current Fabric does not expose a blockable, argument-aware pre-dispatch event for `agents.run`; it exposes agent execution post hoc through result/trace data. |
| Must the method require universal interfaces or black-box-only tests? | Answered | High | No. Seams remain conditional code-design decisions; black-box and gray-box remain complementary verification perspectives. |

## Findings

- **The audit verdict remains correct even though the active graph is now complete.** The feature passed its intended 152-test advisory policy scope, but its specification excludes changes to `/plan`, `task-graph.ts`, graph fields, runtime paths, and automatic command behavior. Completion proves the approved prose/test contract, not strict methodology enforcement. [S1]
- **Use an explicit tri-state planning trigger and fail closed on `unknown`.** `/create` should record whether a module boundary changes, a seam is proposed, or gray-box evidence is planned. Any `yes` or `unknown` makes `/plan` mandatory. JSON Schema conditionals support branch-specific required fields, but each discriminator must itself be required to avoid accidental default branches. [S1] [S5]
- **Keep two independent plan sections.** `Boundaries and Seams` is conditional on boundary/seam design. `Evidence Design` is independently conditional on verification needs, so transactionality, tenant isolation, retries, idempotency, or similar invariants can justify gray-box evidence without a boundary change. [S1] [S8]
- **Store versioned machine records in existing artifacts, not a fifth artifact.** The least disruptive ownership is: observable contract and planning trigger in `spec.md`; seam/composition/conformance and evidence design in `plan.md`; scheduling remains in `tasks.json`; current-attempt evidence plus decision digest belongs in `progress.md`. Dependency-free tagged JSON blocks are preferable to YAML because the runtime already has `JSON.parse` and no package manifest should be introduced. [S1] [S5]
- **Use a separate deterministic artifact validator rather than claiming graph validation covers methodology.** It should perform strict shape checks plus cross-file semantic checks: required plan, complete seam fields, independent gray-box justification, referenced anchors, task/attempt agreement, evidence vantage, and digest freshness. `task-graph.ts` can call this gate before a task becomes `passed`, but graph scheduling and methodology validation should remain distinct modules. [S1] [S5] [S6]
- **Runtime enforcement needs both an entry gate and an effect gate.** Pi extensions can intercept raw input before template expansion, block direct tool calls, and inject or correct context. The repository’s research-enforcement extension already demonstrates turn classification, strict configuration, Fabric-trace observation, and one corrective pass. A lifecycle gate should deny `/ship`, `/fix`, batch implementation, and `/verify` when validation fails, then deny lifecycle mutations when the validated artifact digest is missing or stale. [S2] [S3] [S6]
- **Current Fabric supports blockable nested Pi mutations, but not a proven blockable `agents.run` envelope gate.** Nested `pi.edit`, `pi.write`, and `pi.bash` replay `tool_call` before execution. In contrast, the compiled `AgentsProvider` spawns on `agents.run` without `emitToolCall`; generic non-Pi provider middleware emits only a post-result proxy. The declaration comment is broader than the implementation, so source wins: worker dispatch can be observed after the fact but not reliably denied by a project extension before spawn. [S3] [S4]
- **Do not use Fabric Schema enforce mode as the lifecycle solution.** It provides strong same-invocation, input-bound file transactions, but deliberately blocks all agents, MCP, external providers, and ordinary mutation paths. Its certificate and workspace-binding ideas are useful precedents; its operational mode is incompatible with the lifecycle’s delegated/research paths. [S4] [S7]
- **Bind evidence to the exact decision and attempt.** Record a canonical decision digest, task ID, attempt, vantage, evidence reference, validator version, and relevant declared-file hashes. Resolve the referenced `progress.md` anchor and compare those bindings before completion. This detects stale evidence without pretending a hash proves truth or authorship. [S1] [S7]
- **Keep black-box first, not black-box only.** NIST recommends both black-box and code-based structural cases. Strict policy should reject an undocumented gray-box check, not gray-box testing itself; require the named evidence gap, consequence, inspection point, and whether that point is stable or experimental. [S8]
- **Conformance is conditional on a real seam.** A local alternative or test adapter that claims the same contract should run the shared conformance suite; it need not be a second production implementation. An independently changing external provider needs provider-side contract verification and a compatibility result. Record the composition point, but do not require runtime swapping. [S9] [S10] [S11]
- **Worker propagation is the remaining blocker to an honest end-to-end claim.** An interim Pi-only design can load the project extension in child processes and block child mutations unless the initial prompt contains a valid contract digest. That still needs a mechanical prohibition on Claude/extension-disabled overrides. The stronger solution is an upstream Fabric argument-aware pre-invocation guard for every provider action, especially `agents.run`; until one of these paths is enforced, worker propagation remains partially advisory. [S3] [S4]

### Recommended implementation boundary

Treat strict enforcement as a new follow-up feature rather than extending this completed artifact silently. The minimum coherent scope is: versioned embedded records; a pure artifact validator; mandatory-plan trigger logic; independent Evidence Design; command/mutation gates in a trusted project extension; completion checks bound to task/attempt/digest; propagation to `/ship`, `/fix`, batch implementation, and the optional workflow; adapter/provider conformance rules; and behavioral extension/validator tests. Keep existing prose tests as wording regressions, not enforcement proof.

### Open items

1. Decide whether to close the worker gate initially by restricting modifying workers to Pi with the lifecycle extension loaded, or by first adding an argument-aware Fabric provider preflight hook.
2. Finalize canonical JSON block sentinels and digest canonicalization; unknown versions and duplicate blocks should fail closed.
3. Decide whether task-to-contract references stay in the embedded records or require an additive graph metadata/version change. Do not duplicate design authority in `tasks.json`.
4. Define the exact allowed verification-command path so `bash` cannot bypass lifecycle state enforcement while tests remain runnable.

### Advisory route

This audit changes desired behavior beyond the active specification and also identifies an architecture gap. Recommended route: create a new strict-enforcement specification, then plan it. Do not reopen or silently broaden the now-passed `contract-seam-feedback-lifecycle` graph.

## Sources

[S1] Local Pi Core evidence: `.pi/prompts/{create,plan,ship,fix,verify}.md`, `.pi/workflows/{batch-implement,development-lifecycle-workflow}.md`, `.pi/scripts/task-graph.ts`, `.pi/tests/skill-system.test.ts`, and `.pi/artifacts/contract-seam-feedback-lifecycle/spec.md`; Pi prompt/skill mechanics: https://github.com/earendil-works/pi-mono/tree/main/packages/coding-agent/docs
[S2] Pi extension events, input interception, tool blocking, commands, and persistence: https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/extensions.md
[S3] Local executable precedent: `.pi/extensions/research-enforcement/{index,policy}.ts`, `.pi/tests/research-enforcement.test.ts`; Pi Fabric trace/runtime documentation: https://github.com/monotykamary/pi-fabric
[S4] Pi Fabric 0.28.1 local source and docs: `dist/providers/{pi-tools-provider,agents-provider}.js`, `dist/core/action-registry.d.ts`, `docs/{architecture,schema-enforcement,audit-trace}.md`; upstream: https://github.com/monotykamary/pi-fabric
[S5] JSON Schema, conditional validation and structural-validation vocabulary; retrieved via Context7, Exa, and independently checked with Codex Search: https://json-schema.org/understanding-json-schema/reference/conditionals and https://json-schema.org/draft/2020-12/json-schema-validation
[S6] OWASP Foundation, *Fail Securely*; retrieved via Exa: https://owasp.org/www-community/Fail_securely
[S7] SLSA v1.2, *Build: Verifying artifacts*; retrieved via Exa and independently checked with Codex Search: https://slsa.dev/spec/v1.2/verifying-artifacts
[S8] NIST IR 8397, *Guidelines on Minimum Standards for Developer Verification of Software* (2021); retrieved via Exa and independently checked with Codex Search: https://csrc.nist.gov/pubs/ir/8397/final
[S9] Alistair Cockburn, *Hexagonal (Ports & Adapters) Architecture Explained* (2005-09-04); retrieved via Exa and independently checked with Codex Search: https://alistair.cockburn.us/hexagonal-architecture
[S10] Martin Fowler, *Inversion of Control Containers and the Dependency Injection pattern* (2004-01-14); retrieved via Exa: https://martinfowler.com/articles/injection.html
[S11] Pact Docs, *Verifying Pacts*; retrieved via Exa and independently checked with Codex Search: https://docs.pact.io/getting_started/verifying_pacts

## Research: One-shot lifecycle routing and research-enforcement source semantics — 2026-07-26

**Execution mode:** Complex / bounded deep-research workflow. The parent first audited the current contracts and implementation. One foreground one-shot child was used only for the remaining external-corroboration gap; run `08404f37fe3141f9b19a21e4f637b414` completed with zero tool calls because its runtime did not expose the requested network tools. The parent then directly searched and fetched the primary sources through Exa. The child run itself was not counted as provider evidence.

### Questions and confidence

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| What should `/research`, `/create`, and `/plan` use for delegated help? | Answered | High | Direct parent work by default; one awaited `agents.run` child for a bounded missing input; at most three only for genuinely independent angles. |
| Is a persistent actor warranted for lifecycle intake or planning? | Answered | High | No. These phases need a result before parent synthesis, while an actor is designed around durable identity, mailbox/event delivery, and retained state. |
| Is current research-enforcement compatible with Fabric? | Answered | High | Yes at the configured-route and trace-observation layer. All five exact actions (four categories, with two Exa actions) resolve in the current Fabric registry, successful exact Trace V1 refs are credited, and orchestration refs are excluded. |
| Does current compliance prove that the citation came from an authoritative primary source returned by the provider? | Answered | High | No. Provider success and citation shape are validated independently; authority, provenance, and entailment are not checked. |

### Key findings

1. **Keep lifecycle synthesis parent-owned.** `.pi/prompts/research.md:14-21`, `.pi/prompts/create.md:14-21,61-116`, and `.pi/prompts/plan.md:25-75` already establish direct-first routing, awaited one-shot children, bounded fan-out, and parent verification. The local Fabric API reference likewise defines `agents.run` as run-to-completion, while persistent actors have a fixed runner, serial mailbox, subscriptions, and restored session state. Because Hindsight plus `spec.md`, `plan.md`, `tasks.json`, and `progress.md` already own durable context, an actor would introduce a second hidden context authority without a recurring event-driven responsibility.

2. **The external evidence supports the fit, but local contracts remain decisive.** Anthropic recommends the simplest solution that works and describes parallelization as appropriate for independent subtasks or genuinely useful multiple perspectives [R1]. Its production research write-up says multi-agent systems are strongest for breadth-first questions with multiple independent directions, while coordination complexity grows rapidly and simple queries can be over-served [R2]. Microsoft describes actors as perpetually addressable, asynchronous entities encapsulating identity, state, and behavior [R3]. That actor definition fits long-lived responsibilities, not a one-shot phase input whose caller must immediately synthesize the result.

3. **Basic Fabric evidence compatibility is implemented correctly.** The canonical config maps Context7, Exa, Codex Search, and xAI Web Search to exact direct names and Fabric refs (`policy.ts:125-163`). Trace extraction accepts only a successful Fabric Trace V1 envelope and successful exact matching calls (`policy.ts:505-565`). `index.ts:341-383` observes direct results or Fabric details, and `agents.run`, `agents.spawn`, and removed orchestration variants intentionally have no provider category (`research-enforcement.test.ts:735-748`). The current registry resolves `mcp.context7.query-docs`, both Exa actions, `extensions.codex_search`, and `extensions.xai_grok_web_search`. This confirms registration compatibility, not end-to-end health for every paid or model-dependent provider.

4. **Fresh verification remains green.** `node --experimental-strip-types --test .pi/tests/research-enforcement.test.ts` passed **72/72** with zero failures. Coverage includes exact provider config, failed/empty result rejection, orchestration exclusion, Trace V1 validation, Fabric-mediated Exa observation, citation shape, correction behavior, privacy, and restoration.

5. **The user-facing wording conflates retrieval routes with source authority.** `index.ts:258-275` currently says to use an “authoritative source via” the provider labels and later says “authoritative research provider.” Yet Exa, Codex Search, and xAI Web Search retrieve candidate sources; using one does not make every result authoritative. If implementation is later authorized, the clearest bounded guidance is: **“Directly call at least one configured source provider through `fabric_exec`—Context7, Exa, Codex Search, or xAI Web Search—use an authoritative primary source from its result, and cite it. `agents.run` alone is not provider evidence.”** High-tier wording should preserve the existing two-independent-category and Findings/Sources requirements while making the same route/source distinction.

6. **`/research` documentation is not aligned with enforced routes.** Its Available Tools and Source Priority sections still emphasize generic `context7`, `opensrc`, and `grepsearch` (`.pi/prompts/research.md:99-125`) rather than naming the four configured Fabric source routes. This is a documentation seam, not a Fabric compatibility defect.

7. **Strict provenance would be a separate hardening feature.** `policy.ts:617-776` explicitly performs structural-only citation validation: any syntactically valid HTTPS URL can satisfy standard citation shape. `evaluateCompliance` then combines that independent citation state with a successful configured category (`policy.ts:582-613`). Provider result content is deliberately not inspected or retained, so the extension cannot prove that a cited URL was returned by that provider, that the page is primary/authoritative, or that it supports the claim. Strong binding would require transient extraction of source URLs from nested Fabric `tool_result` proxies, normalization and final-answer matching, provider-matrix mismatch tests, and a privacy decision about URL handling. It is optional hardening, not required for the current basic compatibility claim.

8. **There is one operational delegation gap to investigate.** The bounded child was launched with Exa actions in its explicit allowlist, but reported that only local read/search tools were exposed and made zero tool calls. Direct parent Exa calls worked. This does not change the routing verdict, but child network-tool propagation should be checked before documenting external-research children as reliably source-capable.

### Decision record

| Decision question | Recommendation | Evidence | Confidence | Alternatives | Contract impact | Unresolved risk |
| --- | --- | --- | --- | --- | --- | --- |
| Lifecycle delegation shape | Direct parent first; awaited one-shot child only for bounded missing evidence | Current prompts, Fabric API reference, [R1], [R2] | High | Always delegate; persistent actor | No rewrite needed | Child network-tool propagation needs diagnosis |
| Persistent context owner | Keep Hindsight and the four lifecycle artifacts; do not add an actor | Lifecycle skill/artifacts; actor semantics; [R3] | High | Actor mailbox/session as parallel memory | Avoids competing authority | None for current phase |
| Research-enforcement compatibility | Retain exact refs and Trace V1 logic; tighten guidance and `/research` docs | Policy/index/tests; 72/72 pass | High | Compatibility rewrite | Wording/docs only | Real-provider health was verified only for Exa in this run |
| Citation provenance | Treat URL/source binding as an optional separately specified hardening step | Structural-only validator and content-minimizing trace design | High | Keep structural enforcement only | Would expand policy, privacy, and tests | Authority and entailment remain semantic judgments |

### Recommendation

No persistent actor and no compatibility rewrite are warranted. If implementation follows, make only the bounded guidance/documentation alignment first. Scope strict URL/provider binding separately because it changes evidence semantics and privacy assumptions.

### Open items

1. Diagnose why the one-shot child did not receive its requested Exa tools.
2. Decide whether strict provider-result-to-citation URL binding is desired; if not, document structural enforcement as the intentional boundary.
3. Do not invoke xAI merely for health checking: its action is resolvable, but execution can be paid/model-dependent.

### Sources

- **[R1]** Anthropic, *Building effective agents*, published 2024-12-19. https://www.anthropic.com/engineering/building-effective-agents
- **[R2]** Anthropic, *How we built our multi-agent research system*, published 2025-06-13. https://www.anthropic.com/engineering/multi-agent-research-system
- **[R3]** Microsoft Learn, *Orleans overview*, document date 2026-01-20, updated 2026-06-29. https://learn.microsoft.com/en-us/dotnet/orleans/overview


## Ship closure — 2026-07-26T00:11:01Z

- **Authorization:** user confirmed closure with: “why is this blocked? resolve this and close it out”.
- **Resolution of temporary-file checkpoint:** the stop was caused by an over-broad redirected scan that created the empty out-of-repository file `/tmp/csf-stubs.txt`. Closure proceeds via the non-destructive option: leave that empty file in place. No deletion or further `/tmp` mutation was performed.
- **Graph:** top-level status is `complete`; task-1 through task-5 are all `passed` with `passes: true` at attempt 2 and current evidence refs.
- **Execution:** frontier was already complete, so no implementation worker or new task attempt was needed. The authoritative five-task graph represents three derived dependency waves; capacity-one execution kept tasks 2–4 serial.
- **PRD completeness:** 8/8 functional requirements and 9/9 success criteria satisfied.

### Final ship gates

| Gate | Status | Mode | Evidence |
|---|---|---|---|
| Typecheck | N/A — no configured command | — | TypeScript parse check PASS (0.03s) |
| Lint | N/A — no configured command | — | scoped `git diff --check` PASS (0.00s) |
| Test | PASS | full | 152/152 passed, zero failures/skips (1.32s) |
| Build | N/A — no build/runtime path | — | policy/test-only change; no command exists |

- Every distinct PRD-focused test command passed; excluded planning surfaces remain unchanged.
- All 12 artifact graphs validate; cross-artifact frontier reporting leaves `.active` byte-identical.
- **Goal-backward verification:** 8/8 artifacts exist, 8/8 are substantive, 8/8 are wired to retained tests, and 0 stubs were detected.
- **Scope and safety:** exact eight implementation paths, no file deletions, no UI files, secret scan PASS, absolute local-path scan PASS, and no dependency/schema/runtime path added.
- **Independent review:** Fabric run `062f917c94eb415198262dacaf1dd244` returned PASS with 0 blockers, 0 should-fix findings, 0 nits, and no delete/simplify candidates.
- **Rollback:** no migration, external state, dependency, or runtime behavior exists. After a future authorized commit, rollback is a normal revert of that dedicated commit. The current uncommitted patch remains untouched.
- **Git publication:** no branch, worktree, stage, commit, merge, push, deployment, or PR action was authorized or performed.
- **Deferred follow-up:** the appended strict-enforcement audit changes desired scope and identifies an architecture gap; it remains routed to a new `/create` followed by `/plan`, not to this completed graph.

Closure: COMPLETE - all scoped tasks, applicable gates, goal-backward checks, and independent review pass; lifecycle graph marked complete by explicit user confirmation.
