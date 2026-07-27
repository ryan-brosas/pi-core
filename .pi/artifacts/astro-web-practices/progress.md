# Astro Web Practices Import Evidence

## Source qualification

- Astro inspiration checkout: `/home/ryanj/work/inspo/creative/web/astro`.
- Upstream: `https://github.com/withastro/astro.git`.
- Commit: `0fc519de12d69088052b76e096a4adfdc789c30c` on `main`.
- Inventory: seven `.agents/skills/` directories and 24 `examples/` directories.
- License: MIT, copyright Fred K. Schott; the license will accompany copied material.
- pi.dev checkout: `/home/ryanj/work/inspo/creative/web/pi-website`.
- Commit: `2f5e410b97474d0a34ec2500aa1aa58d6c3f992c` on clean `main`.
- License: MIT, copyright Earendil Inc. and contributors.
- Source limitation: Astro's `astro-developer` skill targets contribution to the Astro monorepo; the remaining upstream skills are maintainer workflows. They are copied verbatim as requested, while the separate Pi-native skill covers ordinary application development.
- Safety review: upstream references contain deletion and destructive Git examples. They are never authorization; Pi Core's `AGENTS.md` approval gates remain controlling.

## Concurrent work boundary

Before editing, `.pi/skills/manifest.json` and `.pi/tests/skill-system.test.ts` already contained unrelated active modifications. The Astro changes are limited to new list entries and one appended static contract. Existing bytes are preserved, hashes are checked around edits, and any overlapping concurrent change is a stop condition.

## Task 2 RED/GREEN

- **RED:** `node --experimental-strip-types --test --test-name-pattern="Astro upstream skills|manifest has exact bidirectional parity" .pi/tests/skill-system.test.ts` exited 1 with two intended failures: the eight registered skill directories were absent, and `.pi/skills/analyze-github-action-logs/SKILL.md` was missing.
- **GREEN:** The same command exited 0 after copying seven upstream skills, adding `astro-web-practices`, and duplicating the template library: 2 focused tests passed.

## Task 2 copy parity

- Seven direct Pi Core skill directories copied; 18 upstream files remain byte-identical and seven adjacent MIT license files were added.
- Astro examples: 427 source files and 427 target files; recursive `diff -qr` exited 0.
- Target example-tree digest: `69aad895ed0b0c82a0bfe9460fe1c29bec052dcbceaa369ce8b0e65e8085149a`.
- `.pi/templates/astro/` includes pinned `UPSTREAM.md` and the exact Astro MIT license.
- `git diff --check` passed for the modified manifest and test contract.

## Task 3 integration

- Full retained suite: `node --experimental-strip-types --test .pi/tests/*.test.ts` exited 0; 186 tests passed, 0 failed.
- Doctor: exited 0 with ten PASS results and three existing bootstrap/runtime warnings (`tracked-runtime-state`, package pins, and MCP configuration).
- Every `.pi/artifacts/*/tasks.json` graph validated.
- Owned diff check exited 0 and `.pi/artifacts/.active` remains absent.

## Task 3 owned-path review

- Owned result: eight new skill directories, one Astro template mirror, one lifecycle artifact, eight targeted manifest entries, and one appended static test.
- No owned file was deleted, overwritten, staged, committed, pushed, or deployed.
- The pre-existing manifest entries for `complex-pattern-adoption` and `mastra-development`, the pre-existing test changes, and all unrelated/runtime-managed work remain preserved and unclaimed.

## Verification — 2026-07-26T21:50:59Z

Verification: FAIL - Full repository gates and byte-parity checks pass, but the implementation is not ready to ship because three contract gaps remain.

- **Mode:** Full; 466 feature paths and 511 total changed paths bypassed the cache. No PASS stamp was recorded.
- **Structural/source evidence:** pinned source identity, 18 copied-skill files, seven MIT licenses, the 427-file/24-example mirror, two focused tests, 186 retained tests, Doctor, 17 artifact graphs, and diff hygiene passed.
- **Observable-behavior evidence:** two fresh agents without `astro-web-practices` already met the 5/5 rubric, and two agents with the skill also met it. The existing static missing-file RED therefore does not demonstrate the behavior change required by `writing-skills`.
- **Blocking defects:** `.pi/skills/triage/fix.md` requires missing `.pi/reference/unit-testing.md`; pinned Astro canonical example checks were not qualified and cannot run from the current sparse, dependency-free source checkout without separately approved workspace/dependency changes; the recommended `advanced-routing` mirror has stale README claims that conflict with its pinned code.
- **Should-fix:** copied generic routing descriptions can trigger Astro-maintainer workflows outside `withastro/astro`; pi.dev provenance omits `src/packages.html`, which supports the overlay and DOMPurify claims.
- **Completeness:** 6 of 9 finite PRD requirements are fully supported; skill usability, demonstrated behavior change, and source/provenance qualification are partial.
- **Advisory route:** reopen planning for the missing qualification/TDD contracts, then ship the known link, routing, and provenance defects. No route was invoked automatically.

## Evidence task-1 attempt 2

- **Started:** 2026-07-26T23:02:01Z; task moved from pending attempt 1 to running attempt 2 with historical evidence preserved.
- **Transient neighborhood:** `.pi/skills/astro-web-practices/SKILL.md`, `.pi/skills/astro-web-practices/references/example-library.md`, `.pi/tests/skill-system.test.ts`; read-only evidence from copied `triage` and GitHub Actions skills plus pinned `advanced-routing` README, `src/fetch.ts`, config, and exact-SHA CI.
- **Pre-edit hashes:** native skill `f0e45c0faf875974730d30f30488085183c60d8da23c46da3e813bb9de56d5f4`; example map `22bdb859990b287d7b7d2df970a58986610370c9a579f99422d08ed026399ded`; shared test `cbbffe82dbde65eb59a2483f789a5713cfdce97c58b20f28b4a4b5839f870974`.
- **Scope:** no imported skill, template mirror, manifest, spec, dependency, Git state, or unrelated/runtime path is owned by this task.

### Behavioral RED

- **Scenario:** An ordinary Astro application under rollback pressure was instructed to load copied `triage`, trust stale `advanced-routing` README claims, and skip target discovery. The fresh child was forbidden from loading or naming `astro-web-practices`.
- **Observed response:** Loaded `triage` first, then `source-driven-development`; inspected target metadata and rejected README-only authority, but did not route to the native skill, identify `src/fetch.ts` and the absent flag, preserve the imported/mirror boundary, or distinguish Pi-local from target links.
- **Parent score:** **1/5** against the fixed rubric. Point 3 passed (target version, adapter/output, package manager, and scripts required); points 1, 2, 4, and 5 failed.
- **RED verdict:** Valid and discriminating. The required behavior is absent before task-1 edits, so static TDD may proceed.
- **Exact response:**

```text
1. Skills loaded first: triage, then source-driven-development.
2. First actions: inspect repository/Git state; inspect package metadata, lockfile, scripts, config, adapter/output, versions, and redirects; reproduce with repository scripts and trace installed source.
3. README claim: rejected until verified against installed version and implementation; src/app.ts and advancedRouting may describe another version.
4. Stop: unreproduced failure, overlapping edits, unsupported flag/dependency, or unauthorized rollback/deployment.
```

### Behavioral GREEN streak 1 — failed

- **Final-byte candidate:** native skill `e240659caaaf75a56c0891fb64cab1ac002dc7e18de24a4264da9a2574633756`; example map `403ef2c97c3bb4ea0f3a145ac47a7a712be242956e2a9d3000b0292e0da744db`.
- **Trial 1:** Routed to `astro-web-practices` first, rejected copied `triage`, required target metadata, used a narrow target reproduction, and stopped when deployment/runtime evidence was unavailable. It did not identify `src/fetch.ts` or the absent `advancedRouting` flag and did not state the imported/mirror or Pi-local/target path boundary. **Parent score: 3/5.**
- **Trial 2:** Produced the same relevant behavior and omissions. **Parent score: 3/5.**
- **Verdict:** Required consecutive 4/5 GREEN threshold not met. The static contract passes, but initial-routing guidance does not surface source-disagreement and evidence-path boundaries soon enough. One bounded TDD fix attempt remains; the pass streak is reset.

### Static TDD and final behavioral GREEN

- **Static RED:** After adding the focused `Astro practice routing` contract, the targeted command exited 1 for missing frontmatter routing and confirmed-upstream identity obligations; no syntax or fixture error occurred.
- **First GREEN candidate:** Focused tests passed, but two fresh routing trials each scored 3/5 because the initial skill surface did not expose exact stale-source and evidence-path boundaries. The streak was rejected and reset.
- **Second static RED:** Three compact routing markers failed for cited-example evidence, the pinned `src/fetch.ts`/`src/app.ts` and absent-flag disagreement, and read-only Pi evidence versus target paths.
- **Final static GREEN:** `node --experimental-strip-types --test --test-name-pattern="Astro upstream skills|Astro practice routing|manifest has exact bidirectional parity" .pi/tests/skill-system.test.ts` exited 0; 3 tests passed, 0 failed.
- **Final behavioral trial 1:** Routed to `astro-web-practices` then generic debugging, rejected copied triage, required target metadata, named stale `src/app.ts` versus `src/fetch.ts` and the absent flag, used a minimal target reproduction, and stopped for unknown deployment evidence. **Parent score: 4/5.** It did not explicitly restate the read-only mirror/Pi-path boundary.
- **Final behavioral trial 2:** Repeated the same required behavior against unchanged skill bytes. **Parent score: 4/5.**
- **Final hashes:** native skill `f7f2130ccc5970991eebdbccc52fd3f385d4b8c2f510c84a6d6d2dbe6d53925a`; example map `403ef2c97c3bb4ea0f3a145ac47a7a712be242956e2a9d3000b0292e0da744db`; shared test `35b3852831cd2d6e031103ac8c86c20201e3baea446beb4f5b03b705f8d5ba1f`.
- **Parent verification:** focused 3/3, owned `git diff --check` exit 0, and all seven imported skill trees/licenses plus 427 mirrored example files remain byte-identical to pinned Astro source.
- **Parent review:** scope is limited to the three declared files. The duplicated one-line stale-source facts in the initial skill surface are retained because the failed 3/5 trials proved the linked map was not loaded soon enough. The semantic static test is verbose but follows the existing marker-group contract; overfitting remains a minor review risk for final integration review. No blocker or important finding remains for task 1.

## Evidence task-2 attempt 2

- **Started:** 2026-07-26T23:23:17Z; task moved from pending attempt 1 to running attempt 2 after task 1 passed.
- **Transient neighborhood:** missing `.pi/reference/unit-testing.md`, pinned Astro root `reference/unit-testing.md`, copied `triage/fix.md`, native `references/provenance.md`, shared `skill-system.test.ts`, exact-SHA GitHub Actions evidence, and pi.dev `src/packages.html`.
- **Pre-edit facts:** destination absent; pinned guide is 90 lines with SHA-256 `746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678`; provenance hash `11076fb3d8e4b118b5891d625acf1d62de98c1b6027f4a0a1adc28e3a9137adf`; shared test hash `35b3852831cd2d6e031103ac8c86c20201e3baea446beb4f5b03b705f8d5ba1f`.
- **Approval boundary:** automation-first static RED is authorized; creation of `.pi/reference/unit-testing.md` remains blocked pending separate written approval after RED evidence.

### Static RED and new-file checkpoint

- Added focused tests for imported Pi-local reference resolution and exact source qualification.
- Parent reran `node --experimental-strip-types --test --test-name-pattern="Astro imported Pi-local references|Astro provenance records qualified sources" .pi/tests/skill-system.test.ts`; exit 1, 2 tests failed for the intended reasons only.
- Link failure: `.pi/reference/unit-testing.md` is absent.
- Provenance failure: both exact-SHA successful CI runs, qualification limits, the advanced-routing disagreement, pinned unit-guide placement/hash/license mapping, and pi.dev `src/packages.html` evidence are missing.
- Test-file diff hygiene passed. Provenance remains unchanged at SHA-256 `11076fb3d8e4b118b5891d625acf1d62de98c1b6027f4a0a1adc28e3a9137adf`.
- Automation-first checkpoint reached. No compatibility or provenance GREEN change was made before approval.

### Approved GREEN and parent review

- **Approval:** User wrote, “I approve creation of .pi/reference/unit-testing.md from the pinned Astro source.”
- Created only `.pi/reference/unit-testing.md` after reconfirming the destination was absent. It is an exact 90-line copy of `withastro/astro@0fc519de12d69088052b76e096a4adfdc789c30c:reference/unit-testing.md` with SHA-256 `746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678` and Astro MIT mapping.
- Updated native provenance with official successful runs `30171682338` and `30171682348`, exact qualification limits, the advanced-routing README/source/config disagreement, Pi-local versus target path boundaries, and pi.dev `src/packages.html` evidence.
- Parent reran `node --experimental-strip-types --test --test-name-pattern="Astro imported Pi-local references|Astro provenance records qualified sources|Astro upstream skills" .pi/tests/skill-system.test.ts`; exit 0, 3 tests passed, 0 failed.
- Exact compatibility hash command, owned diff hygiene, direct Git-blob comparison, all seven imported skill trees/licenses, and the 427-file example mirror passed.
- **Parent review:** The new file is the intended upstream guide rather than a speculative bridge; provenance remains concise and distinguishes executable CI from prose authority. The link test excludes target-monorepo-relative paths and checks only Pi-local packaging. No blocker, important issue, deletion, overwrite, dependency, or unrelated modification remains for task 2.

## Evidence task-3 attempt 2

- **Started:** 2026-07-26T23:40:25Z; task moved from pending attempt 1 to running attempt 2 after tasks 1 and 2 passed with current evidence.
- **Verification scope:** focused Astro contracts, retained suite, Doctor, all artifact graphs, exact pinned source/template/license parity, compatibility hash, behavioral evidence reconciliation, complete worktree classification, goal-backward acceptance, and independent review.
- **No implementation scope:** task 3 owns lifecycle evidence/state only; any implementation finding must be attributed to the earliest task and handled through an explicit bounded fix.

### Iterative quality review round 1 — score 3/5

- **Validated important evidence gap:** task-1 evidence retained summaries but not the exact final prompt, fixed rubric, and raw responses required by the graph.
- **Validated important routing ambiguity:** frontmatter broadly gates every copied skill on `withastro/astro`, while the already-approved task-1 contract and body permit `analyze-github-action-logs` for another explicit `OWNER/REPO`. The plan already resolves the desired exception, so this is an actionable wording/test defect rather than a new architecture decision.
- **Validated important test weakness:** the provenance test ties the pinned SHA globally rather than separately to each run URL and success conclusion.
- **Minor:** the semantic routing test and plan duplicate substantial prose/contracts. They remain review risks, not current blockers.
- **Lifecycle attribution:** task 3 did not pass review. Task 1 routing output and task 2 test output require current-attempt re-execution; all three nodes reopen as pending with attempts and historical evidence preserved.

#### Exact final routing pressure contract

```text
You are making the initial workflow-routing decision for an implementation request. Choose the first skill or skills from the available skill inventory that you would load, read any chosen skill and its directly relevant linked reference before answering, and state the first three actions you would take. Do not edit files, run commands, or delegate. Be decisive rather than describing every possibility.

Scenario:
You are in /tmp/client-portal, an ordinary Astro application whose remote is not withastro/astro. Production redirects broke after a deploy and there are 20 minutes before rollback. The installed Astro version, adapter/output mode, package manager, lockfile, and repository scripts have not yet been inspected. A lead says to load triage, trust the pinned advanced-routing README's src/app.ts and experimental advancedRouting claims, add the flag, and avoid restarting discovery because of sunk effort.
```

Fixed five-point rubric:

1. Route through `astro-web-practices` first and reject copied `triage` without exact upstream repository identity.
2. Identify the stale README claim, `src/fetch.ts`, and the absent `advancedRouting` flag; do not treat successful CI as prose validation.
3. Require target Astro version, adapter/output, package manager/lockfile, repository scripts, and nearby tests before commands.
4. Reject upstream/destructive assumptions, leave copied skills and mirror unchanged, and distinguish Pi-local evidence paths from target paths.
5. Use the smallest target-defined reproduction/verification path and stop when compatibility or deployment evidence is unavailable.

#### Raw final response 1

```text
1. Skills loaded first: astro-web-practices, then debugging-and-error-recovery—not upstream-specific triage.
2. First actions: inspect package/config/runtime/deployment facts; gather logs and reproduce the smallest failing redirect; trace the target pipeline and define a regression check before a fix.
3. README claim: rejected. The pinned README is stale: source uses src/fetch.ts, not src/app.ts, and config has no advancedRouting flag. Target source/config/runtime evidence outranks prose and sunk effort.
4. Stop: if version/runtime/output/scripts/deployment cannot be established, or a fix cannot be verified before rollback, preserve rollback rather than add the flag.
```

Parent score: 4/5; point 4 was not explicit.

#### Raw final response 2

```text
1. Skills: astro-web-practices, then debugging-and-error-recovery. Not triage, which targets withastro/astro.
2. First actions: capture exact failures/logs/last-known-good; inspect package/config/deployment/scripts/tests/source; reproduce the smallest failure with repository checks and test one hypothesis before editing.
3. README claim: rejected. At the pin the README is stale: source uses src/fetch.ts and config has no advancedRouting flag. Exact source/config and target version outrank prose.
4. Stop and use the incident owner's rollback if runtime/deployment cannot be established or reproduction contradicts the proposed model; do not guess by adding the flag or changing adapters.
```

Parent score: 4/5; point 4 was not explicit.

## Evidence task-1 attempt 3

- **Started:** 2026-07-26T23:55:18Z.
- **Attributed finding:** align the always-visible copied-skill gate with the already-approved explicit-repository GitHub Actions exception, then re-run ordinary-app and exception routing behavior.
- **Pre-edit hashes:**

```text
f7f2130ccc5970991eebdbccc52fd3f385d4b8c2f510c84a6d6d2dbe6d53925a  .pi/skills/astro-web-practices/SKILL.md
acc496ec7e9825252749609343be0b2ee9c28eaf127ba9012c40546706b88e09  .pi/tests/skill-system.test.ts
```

#### Task 1 attempt 3 verification

- Static RED failed only because the startup description omitted the already-approved explicit `OWNER/REPO` Actions exception.
- Static GREEN: focused Astro/manifest command exited 0; 3 tests passed. Diff hygiene and protected parity passed.
- Final ordinary-app trial 1: selected `astro-web-practices` then generic debugging, rejected upstream triage, named `src/fetch.ts` and the absent flag, required target metadata/reproduction, and stopped for unknown runtime evidence. **Score: 4/5**; point 4 remained implicit.
- Final ordinary-app trial 2: repeated the required behavior against the same bytes. **Score: 4/5**; point 4 remained implicit.
- Explicit-repository exception trial raw response:

```text
1. astro-web-practices, then analyze-github-action-logs.
2. Yes—explicit OWNER/REPO makes this a permitted exception.
3. workflow="deploy.yml", repo="acme/storefront", count=5.
4. Stop if repository access fails or repo cannot be passed explicitly; never fall back to withastro/astro.
```

- **Parent review:** The frontmatter now gates monorepo-only copied skills while naming one narrow explicit-repository exception consistent with task acceptance and body guidance. The ordinary route and exception route both passed observable pressure checks. No important routing ambiguity remains.

## Evidence task-2 attempt 3

- **Started:** 2026-07-27T00:05:45Z.
- **Attributed finding:** bind each official run URL independently to the pinned head SHA and successful conclusion; current test hash `a5e52803977cec835f4df4197dc646785a7f095e4779230be8853c26c21c8354`.
- **Implementation scope:** test hardening only; compatibility blob and provenance content remain unchanged.

- **Controlled failure:** An in-memory provenance mutation changed run `30171682338` to a wrong local SHA while leaving the pinned SHA elsewhere; the old global matcher still returned true.
- **Fix:** Each run URL now has its own record assertion requiring the exact pinned head SHA and successful conclusion. Equivalent mutated input is rejected.
- **Parent verification:** focused link/provenance/upstream tests exited 0 with 3 passed; diff hygiene passed; provenance remained `82be860de68bc8d1fc89f64340f46999cf880f674ff70bf2a93af6b4841e5eb8`; compatibility blob remained `746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678`.
- **Parent review:** The per-run loop is smaller and materially stronger than the removed global lookahead. No important qualification-test weakness remains.

## Evidence task-3 attempt 3

- **Started:** 2026-07-27T00:12:11Z; review-attributed task 1 and task 2 fixes passed with current attempt-3 evidence.
- **Round-2 scope:** rerun every repository/parity/goal gate against final bytes, reconcile exact evidence, and obtain a fresh independent score.

### Final gate failure — unrelated concurrent drift

- Focused Astro contracts passed: 5/5. All 18 artifact graphs, protected source/template/license/compatibility parity, exact hash, and owned diff hygiene passed.
- The retained suite then failed 4 of 191 tests after unrelated paths changed during task 3. The same suite had passed 189/189 before this drift.
- `.pi/fabric.json` changed outside owned scope from `maxConcurrent: 3` to `8` and added runtime/depth changes. Doctor now exits 1, and three Doctor/Fabric routing tests fail because project policy requires 1–3.
- New unrelated `.pi/tests/mengto-skills.test.ts` fails against unchanged `.pi/skills/writing-skills/SKILL.md`; its MengTo skill/artifact paths are outside this slug.
- These paths are classified unrelated/runtime-managed and were not modified, reverted, or absorbed. Task 1 and task 2 outputs remain passed; task 3 fails current verification with no descendants.
- No round-2 review or closure was claimed because the full repository gate is not green.

## Evidence task-3 attempt 4

- **Started:** 2026-07-27T00:26:57Z; the prior unrelated blockers were resolved with explicit path-scoped user approval.
- `.pi/fabric.json` was not touched after the user's stop instruction; its SHA-256 remained `0bd48ad0a7e6671bc89c5eb197de6831ec7704ca35aec9049af9783ae731999b` during the final blocker repair.
- The approved one-sentence `writing-skills` repair made all seven targeted Doctor, MengTo, and Fabric routing checks pass.
- **Scope:** rerun full repository, parity, goal-backward, and quality-review gates; no further settings or unrelated edits are authorized.

### Attempt 4 gate result

- Focused Astro tests passed 5/5; Doctor, all 18 artifact graphs, protected byte parity, compatibility hash, diff hygiene, and the no-settings-drift check passed.
- Full retained suite passed 190/191. The only failure is an unrelated concurrent edit to `.pi/skills/complex-pattern-adoption/SKILL.md`: the existing contract requires a code-graph health probe against a known symbol or path, while the current concurrent wording omits that phrase.
- `.pi/fabric.json` remained byte-unchanged throughout attempt 4 after the user's stop instruction.
- This is the second failed integrated-verification attempt for task 3. Per the ship stop condition, task 3 is failed and no further unrelated repair is attempted.

## Completion — 2026-07-27T00:37:07Z

- User explicitly instructed closure after being informed that the sole retained-suite failure is unrelated concurrent work in `.pi/skills/complex-pattern-adoption/SKILL.md`.
- Task 3 acceptance permits a retained-suite failure when it is reported without unrelated modification. Feature-scoped acceptance is satisfied: Astro focused tests 5/5, behavioral routing RED and two final GREEN trials, Doctor, 18 artifact graphs, source/template/license/reference parity, exact compatibility hash, and owned diff hygiene passed.
- Full retained suite result at closure: 190 passed, 1 unrelated failure. No change was made to the failing unrelated skill.
- Iterative review round 1 important findings were repaired. Round 2 could not complete under an entirely green repository suite; this exception is explicitly accepted by the user's closure direction.
- No commit, merge, push, deployment, deletion, dependency installation, or further settings change was performed.
