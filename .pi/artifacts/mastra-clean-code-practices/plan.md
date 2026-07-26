# Mastra Clean-Code Pattern Adoption Implementation Plan

> **For Pi:** Execute only through the explicit slug `mastra-clean-code-practices`; `tasks.json` remains authoritative.

**Goal:** Publish one source-qualified, consumer-neutral Mastra clean-code skill that preserves the pinned template's clear structure, quarantines its demo shortcuts, and introduces no copied runtime code, dependency, or corpus entry.

**Discovery Level:** 2 (Standard) — one bounded external qualification question set: canonical source ref, applicable license, and focused/canonical tests.

**Discovery Execution:** Direct parent research against official GitHub source. A planning child was skipped because the architecture and three-task sequence were already resolved, no configured child source provider could improve the official-source lookup, and parent verification remained mandatory.

**Context Budget:** Approximately 40% across three sequential tasks; current-session source and RED/GREEN evidence is reused rather than rediscovered.

---

## Institutional and Local Evidence

- Automatically available current-session context already contains the user's corrected intent: extract clean repository practices, not a portfolio recipe.
- Relevant history establishes executable version-2 task contracts, the contract–seam–feedback kernel, Fabric routing, and exact manifest parity.
- The target skill is a new untracked path; `.pi/skills/manifest.json` and `.pi/tests/skill-system.test.ts` already contain concurrent owned changes for this feature.
- The worktree contains substantial unrelated and runtime-managed changes. They remain read-only and are never absorbed into this artifact's evidence.
- No branch, worktree, dependency, commit, push, or deployment is required.

## External Source Qualification

### Identity Mapping

| Evidence | Exact value | Result |
|---|---|---|
| Standalone repository | `https://github.com/mastra-ai/template-chat-with-pdf` | Candidate source |
| Standalone commit | `4b954b41350dcd8139d135abb677ab9ddfae4f6c` at `2026-05-28T16:47:08Z` | Pinned |
| Canonical monorepo | `https://github.com/mastra-ai/mastra` | Official upstream |
| Canonical commit | `fb88481957c029167092cef2c47eeaffeb411ce7` at `2026-05-28T16:45:07Z` | Byte-matched source |
| Canonical PR | `https://github.com/mastra-ai/mastra/pull/17038` | Merged at `2026-05-28T16:45:08Z` |
| PR head used for checks | `427bf78b882ee13c5d86b9242f35ab5e42abc2c1` | Official CI evidence |
| Sync mechanism | `.github/scripts/sync-templates.js` and `.github/workflows/sync-templates.yml` | Explains the two-minute standalone sync |

The canonical commit was selected as the last commit touching `templates/template-chat-with-pdf` before the standalone sync. Direct SHA-256 comparison proved that every inspected implementation and manifest file is byte-identical.

### Byte Comparison

| File under `templates/template-chat-with-pdf/` | SHA-256 | Standalone vs canonical |
|---|---|---|
| `README.md` | `7f3d473273ceaef4095e4c46032f6a468ac84ffc3b6177784b126f88c724e43a` | MATCH |
| `package.json` | `7cfe6c796eeba2c3f4fc508cb304af0dcaba06c4f96bd618f635afad12317e00` | MATCH |
| `src/mastra/index.ts` | `4d8960191d6fc216ce1f55a1f8174c3ebc15f89780d10158cd91384e6ca0ed7c` | MATCH |
| `src/mastra/agents/pdf-chat-agent.ts` | `c79434b01d2318731d8e182b19d31777ffba4a221ca5b6f87e529978a5f04324` | MATCH |
| `src/mastra/lib/vector-store.ts` | `f9c13f6c6e5b18e78e44952891d49e328560d28dd91df6f94040cc92ef5fea00` | MATCH |
| `src/mastra/tools/list-documents-tool.ts` | `f5340aead809efc4d22e3c79c00acd818b13cce6deed4778bd3656376bd4c160` | MATCH |
| `src/mastra/tools/pdf-query-tool.ts` | `fcdb16d1e1bd677a244477423ef6c8912663a9cf03b7d0ebe485b2b2ca43fc69` | MATCH |
| `src/mastra/workflows/index-pdf.ts` | `c5b183f564ecdb250e7627f83a97d93f0577df8a9820b83d8fcc74875a16f98f` | MATCH |

### License

Canonical `LICENSE.md` at `fb88481957c029167092cef2c47eeaffeb411ce7` has exact raw-byte SHA-256 `2b16edbc165d42dee8248296cb22979a26930fad9efaef4ebe263698a416c19c`, including its final newline. Shell command substitution strips that newline and yields `73f74b5f61182c47db2246056c52bff9fb1adc4c0112dc3aae12a76542110dfc`; that value is not the raw-file digest.

It states that content outside named `ee/` directories is Apache License 2.0. The template is under `templates/`, so the inspected source is covered by Apache-2.0. The standalone package declaration agrees. No source code is copied into Pi Core; the skill records architectural observations and provenance.

Canonical URL:

`https://raw.githubusercontent.com/mastra-ai/mastra/fb88481957c029167092cef2c47eeaffeb411ce7/LICENSE.md`

### Tests and CI

The exact canonical template subtree contains no `test`, `spec`, or `__tests__` file and is not included by `pnpm-workspace.yaml`. Therefore upstream CI does **not** prove the chat-with-PDF template's runtime behavior or build in isolation.

Canonical framework-level type contracts relevant to the extracted invariants exist at:

- `e2e-tests/type-check/template/core/agent.test-d.ts`
- `e2e-tests/type-check/template/core/tool.test-d.ts`
- `e2e-tests/type-check/template/core/workflow.test-d.ts`
- `packages/cli/src/utils/clone-template.test.ts`
- `packages/cli/src/utils/template-utils.test.ts`

These tests exercise stable agent construction, typed `createTool` inputs/outputs, typed `createStep` and `createWorkflow` boundaries, and template cloning/selection. They support the general structural guidance but are not template-specific runtime tests.

Observed official checks on PR head `427bf78b882ee13c5d86b9242f35ab5e42abc2c1`:

| Check | Conclusion | Evidence |
|---|---|---|
| Build | success | `https://github.com/mastra-ai/mastra/actions/runs/26586329182/job/78333342399` |
| Lint | success | `https://github.com/mastra-ai/mastra/actions/runs/26586328909/job/78333362315` |
| E2E Type check | success | `https://github.com/mastra-ai/mastra/actions/runs/26586329182/job/78334327962` |
| E2E create-mastra | success | `https://github.com/mastra-ai/mastra/actions/runs/26586329182/job/78334327982` |
| E2E CommonJS | success | `https://github.com/mastra-ai/mastra/actions/runs/26586329182/job/78334327944` |
| E2E monorepo | success | `https://github.com/mastra-ai/mastra/actions/runs/26586329182/job/78334328003` |
| E2E no-bundling | success | `https://github.com/mastra-ai/mastra/actions/runs/26586329182/job/78334328116` |
| Unit shards 1–4 | success | Run `26586329182` |
| Combined LibSQL store test | success | `https://github.com/mastra-ai/mastra/actions/runs/26586329182/job/78334384972` |
| `changed-tests` | failure | Changed tests passed against the base when the meta-check expected them to fail; check annotation `78333150750` |
| E2E kitchen-sink 1/3 | cancelled | Exceeded its 15-minute maximum; check annotation `78334328279` |

Both non-success results are retained as caveats. Neither is a template-specific behavior test, and neither is hidden by the successful checks.

### Qualification Decision

**Qualified only for structural guidance.** The source is pinned, byte-matched, and license-compatible. Canonical type and framework checks support agent/tool/workflow APIs. The lack of template-specific tests prevents any claim that the example's PDF/RAG runtime behavior is proven. Consequently:

- no template runtime code is copied;
- the skill must state the missing-test limitation;
- known demo shortcuts remain explicit anomalies;
- the target Pi static contract and full suite gate the adopted Markdown skill;
- any future code-level adoption requires target runtime tests.

This plan resolves the three source-qualification questions recorded in `spec.md`. Their create-time rows remain provenance of what planning had to answer; task 1 remains pending only until `/ship` records and verifies this evidence in `progress.md`.

## MCP and Corpus Evidence

- Source health probe: CodeGraph resolved `indexPdfWorkflow` at `src/mastra/workflows/index-pdf.ts:234` and showed the typed `.then(...)` sequence. Direct source inspection confirmed it.
- Target health probe: CodeGraph returned no content match for the untracked Markdown `mastra-development` skill. This is an unhealthy/unsupported target result, so target impact mapping falls back to `read`, `grep`, and `find` as required.
- Corpus validation: 2 entries valid, provenance-pinned, and fresh at a 90-day threshold.
- Bounded corpus search for `mastra`: 0 matches. No corpus entry is used or created.

---

## Must-Haves

### Observable Truths

1. Loading `mastra-development` presents a detailed Mastra clean-code guide without coupling it to a website, portfolio, or other single consumer.
2. A reader can identify the exact standalone and canonical source refs, license scope, source limitations, and test limitations.
3. The skill explains the reusable composition-root, focused-module, schema, workflow, shared-infrastructure, metadata, error, and testing patterns.
4. The skill separately identifies every observed demo shortcut and refuses to promote clean appearance as runtime correctness.
5. The skill is registered exactly once and fails its static contract when required content, source limits, or consumer neutrality regress.
6. No dependency, copied Mastra source, corpus entry, ambient pointer, branch operation, or runtime capability is introduced.
7. Completion evidence reports successful upstream checks and the two observed non-success checks without implying template-specific test coverage.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Full adoption contract | Scope, behavior, non-goals, and qualification gates | `.pi/artifacts/mastra-clean-code-practices/spec.md` |
| Canonical task graph | Execution state and task contracts | `.pi/artifacts/mastra-clean-code-practices/tasks.json` |
| Detailed execution plan | Source qualification and TDD/verification sequence | `.pi/artifacts/mastra-clean-code-practices/plan.md` |
| Attempt evidence | Provenance, RED/GREEN, review, failures, and gate output | `.pi/artifacts/mastra-clean-code-practices/progress.md` |
| Mastra guidance | Consumer-neutral detailed skill | `.pi/skills/mastra-development/SKILL.md` |
| Discoverability | Tier-2 registration | `.pi/skills/manifest.json` |
| Behavioral policy boundary | Source, structure, anomaly, and neutrality assertions | `.pi/tests/skill-system.test.ts` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| Standalone commit | Canonical monorepo commit | Eight matching SHA-256 values | A timestamp-only mapping could select the wrong source |
| Canonical source | Skill claims | Pinned refs plus exact file/line inspection | Clean appearance could be overgeneralized |
| Canonical license | Adoption permission | Root `LICENSE.md` scope outside `ee/` | Package metadata alone would be insufficient |
| Canonical tests/CI | Qualification caveat | Type-contract paths and check conclusions | General CI could be misreported as template runtime proof |
| Skill directory | Manifest | Exact `mastra-development` entry | Missing or duplicate registration breaks discovery |
| Skill content | Static contract | Focused `node:test` assertions | Text could drift back to consumer coupling or omit anomalies |
| Graph task state | Progress evidence | Current-attempt anchors | Retrospective work could falsely imply lifecycle order |

### Boundary Design

No runtime module boundary or dependency seam is introduced. The existing on-demand skill boundary remains the only public artifact. Source retrieval varies between local and canonical evidence, but that variance is handled by the existing source-driven and complex-adoption workflow rather than a new code abstraction.

### Gray-Box Evidence

| Verification | Internal knowledge used | Why observable behavior alone is insufficient |
|---|---|---|
| Source graph health probe | CodeGraph symbol/path for `indexPdfWorkflow` | Confirms graph scope and candidate location before source reading; it does not prove correctness |
| Manifest parity | Skill directory and manifest internals | Pi discovery failure may not be visible until a skill is requested |
| Static semantic assertions | Required headings and anomaly markers | The Markdown skill has no standalone runtime API; stable structural checks close the policy-content gap |

Gray-box checks supplement the observable outcome that a correctly registered skill supplies accurate, bounded guidance. They do not justify mocking Mastra internals.

---

## Task Plan

### Task `task-1` — Qualify the pinned source and lock the RED contract

**Goal:** Record truthful provenance/license/test evidence and the already-observed RED-to-GREEN contract without altering external source.

**Files:**

- `.pi/tests/skill-system.test.ts`
- `.pi/artifacts/mastra-clean-code-practices/progress.md`

**TDD and evidence steps:**

1. Record the previously observed RED result: the corrected test failed because the old skill contained `portfolio`, proving the consumer-neutral contract was capable of failing for the intended reason.
2. Record standalone commit `4b954b…`, canonical commit `fb884819…`, all eight matching hashes, license path/hash/scope, canonical test paths, successful checks, failed `changed-tests` meta-check, and cancelled kitchen-sink check.
3. Record that no template-specific test exists and that the target skill—not template runtime code—is the adoption artifact.
4. Re-run the focused target contract and confirm GREEN.
5. Inspect the current test diff and preserve unrelated test additions read-only.
6. Parent-appended progress evidence must use `#evidence-task-1-attempt-1` and task 1 may pass only after the evidence exists.

**Acceptance consequence:** If canonical evidence changes, hash comparison fails, or the source is no longer license-compatible, stop task 1 and leave descendants blocked.

### Task `task-2` — Publish the qualified Mastra clean-code skill

**Goal:** Reconcile the current skill and registration with task 1 evidence, changing only a verified mismatch.

**Files:**

- `.pi/skills/mastra-development/SKILL.md`
- `.pi/skills/manifest.json`
- `.pi/tests/skill-system.test.ts`

**TDD and implementation steps:**

1. Validate task 1 evidence and recompute the graph frontier.
2. Run the focused Mastra and manifest tests before editing; if already GREEN, inspect rather than rewrite working content.
3. Compare every required section and anomaly against the qualified source evidence in this plan.
4. Apply only a surgical correction if the skill claims more upstream proof than exists, omits the canonical source/license qualification, or violates consumer neutrality.
5. Run the focused contract, no-portfolio/no-local-path check, and diff check.
6. Parent review verifies that no source code, package, or corpus path was added.
7. Parent-appended progress evidence must use `#evidence-task-2-attempt-1` before marking the task passed.

**Expected implementation delta:** The current skill is likely substantively complete. `/ship` must not manufacture code changes merely to satisfy a task; evidence-only completion is valid when the existing target already meets the explicit contract and the retrospective RED history is recorded truthfully.

### Task `task-3` — Verify integration and preserve narrow promotion

**Goal:** Establish current complete-worktree and repository evidence without touching unrelated or runtime-managed paths.

**Files:**

- `.pi/artifacts/mastra-clean-code-practices/tasks.json`
- `.pi/artifacts/mastra-clean-code-practices/progress.md`

**Verification steps:**

1. Validate the graph and recompute the frontier.
2. Run the complete retained test suite.
3. Run Doctor and retain all PASS/WARN output truthfully.
4. Validate every artifact task graph.
5. Confirm `.pi/artifacts/.active` and Mastra corpus paths are absent.
6. Review the complete tracked and untracked worktree; classify only the Mastra skill, manifest line, Mastra test contract, and this artifact as owned.
7. Record unrelated and runtime paths read-only; do not fix or absorb them.
8. Run diff checks on owned paths.
9. Parent-appended progress evidence must use `#evidence-task-3-attempt-1` before marking the task passed.
10. Stop before closure and ask the user whether to mark the graph complete; no Git action is implied.

---

## Derived Dependency Graph

> Wave labels are a derived snapshot of the authoritative `.pi/artifacts/mastra-clean-code-practices/tasks.json`.

```text
task-1: needs nothing; creates qualification and RED/GREEN evidence
task-2: needs task-1; provides qualified skill and registration
task-3: needs task-2; provides integrated verification and review evidence

Derived Wave 1: task-1
Derived Wave 2: task-2
Derived Wave 3: task-3
```

All tasks are serial because tasks 1 and 2 share the static contract, and integrated verification depends on both.

## Context Budget

| Task | Estimated context | Reason |
|---|---:|---|
| `task-1` | 18% | External qualification is resolved; ship records and verifies it |
| `task-2` | 12% | Three known target paths and likely evidence-only reconciliation |
| `task-3` | 10% | Existing canonical gates and parent worktree review |
| **Total** | **40%** | Below the 50% execution target |

## Risks and Stop Conditions

| Risk | Route or stop condition |
|---|---|
| Canonical bytes no longer match | Stop task 1; source qualification changed |
| License scope becomes incompatible or ambiguous | Stop task 1; do not promote |
| Template-specific runtime proof is claimed | Correct the claim before task 1 or 2 may pass |
| Focused target contract cannot fail for intended policy gaps | Return to the contract definition |
| Owned test/manifest/skill path changes concurrently | Stop the affected edit and report overlap |
| A dependency, copied source, corpus entry, branch, commit, push, or deployment becomes necessary | Stop for explicit approval and scope revision |
| Full-suite or Doctor failure is owned | Route to `/ship mastra-clean-code-practices` and fix only owned paths |
| Full-suite finding is unrelated/runtime-managed | Report read-only; do not modify it |

## Constitutional Compliance

- Explicit slug is preserved throughout.
- No ambient artifact selector is read or written.
- No deletion or destructive operation is planned.
- No broad staging, branch operation, dependency action, secret, or deployment is planned.
- New files are limited to canonical lifecycle artifacts authorized by `/create`, `/plan`, and later `/ship`.
- Source and target evidence are parent-verified.
- Concurrent unrelated changes remain read-only.

**Constitutional compliance: PASS**

## Handoff to `/ship`

Before execution:

1. Validate `tasks.json`.
2. Confirm this plan's task IDs exactly equal `task-1`, `task-2`, and `task-3`.
3. Compute the current frontier; only `task-1` should be ready initially.
4. Preserve the explicit slug unchanged.

Next explicit command:

```text
/ship mastra-clean-code-practices
```
