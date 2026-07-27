# Astro Web Practices Remediation Implementation Plan

> **For Pi:** Implement this plan task-by-task against the explicit `astro-web-practices` graph.

**Goal:** Make the installed Astro skills, template mirror, and Pi-native guidance verifiably usable and safe while preserving all seven imported skill sources and all 427 mirrored example files byte-for-byte.

**Discovery Level:** 3 — Deep research was required to reconcile exact upstream CI evidence, a broken imported reference, stale official-example prose, model-mediated routing, and attempt-scoped graph recovery.

**Context Budget:** Approximately 50% total: Task 1 about 20%, Task 2 about 15%, and Task 3 about 15%.

---

## Must-Haves

### Observable Truths

1. An agent working in an ordinary Astro application routes through `astro-web-practices` instead of assuming the copied `withastro/astro` maintainer workflow applies.
2. An agent uses copied maintainer skills only after confirming exact `withastro/astro` repository identity; unknown identity fails closed.
3. The unit-testing reference required by copied `triage/fix.md` resolves to the exact pinned upstream guide after a separately approved compatibility-file creation.
4. The pinned `advanced-routing` example remains byte-identical, but agents reject its stale README claims and use `src/fetch.ts`, current config, and qualified checks as evidence.
5. Provenance states exactly what the pinned CI runs prove, what they do not prove, and which pi.dev source supports the HTML/CSS guidance.
6. A discriminating behavioral RED and two consecutive GREEN trials prove the native skill changes routing behavior, while focused and retained repository gates remain green.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Native Astro skill | Always-visible routing trigger and positive repository-identity recipe | `.pi/skills/astro-web-practices/SKILL.md` |
| Official example map | Source-first warning for the stale `advanced-routing` README | `.pi/skills/astro-web-practices/references/example-library.md` |
| Qualification record | Exact-SHA CI, source limits, license mapping, and pi.dev evidence | `.pi/skills/astro-web-practices/references/provenance.md` |
| Compatibility reference | Exact pinned Astro unit-testing guide required by imported triage | `.pi/reference/unit-testing.md` |
| Focused regression boundary | Routing, stale evidence, Pi-local links, exact hash, and provenance contracts | `.pi/tests/skill-system.test.ts` |
| Scheduling authority | Reopened stable task IDs and attempt history | `.pi/artifacts/astro-web-practices/tasks.json` |
| Attempt evidence | RED/GREEN transcripts, parent scoring, commands, and review evidence | `.pi/artifacts/astro-web-practices/progress.md` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| Pi startup skill inventory | Native routing behavior | `astro-web-practices` frontmatter description | Generic copied descriptions win before repository identity is checked |
| Copied `triage/fix.md` | Unit-test conventions | `../../reference/unit-testing.md` | Missing Pi-local destination makes the installed workflow incomplete |
| Example map | Pinned implementation | `src/fetch.ts`, `astro.config.mjs`, and exact-SHA CI | Stale README prose is mistaken for executable truth |
| Provenance | Official CI | Runs `30171682338` and `30171682348` at the pinned SHA | Successful builds are overclaimed as documentation validation |
| HTML/CSS practices | pi.dev source | `src/packages.html` | Overlay and DOMPurify claims lack declared source coverage |
| Version-2 graph | Attempt evidence | `progress.md#evidence-task-*-attempt-2` | Historical attempt-1 evidence is accidentally reused as current proof |

### Boundary Design

#### Module Boundaries

| Boundary | Hidden decision | Public behavior |
| --- | --- | --- |
| Skill routing | Whether the target is an ordinary Astro app or exact Astro upstream contribution work | The correct native or copied workflow is selected before commands are proposed |
| Reference packaging | Where an unchanged imported relative link resolves in Pi Core | Imported triage can read the intended pinned guide without source-byte edits |
| Example authority | Whether README prose, source/config, or executable CI controls a recommendation | Source and qualified checks win; contradictions are visible and fail closed |
| Provenance | Which external claims are qualified and which remain limited | Users can trace every promoted practice to a pinned source and evidence scope |

#### Proposed Seams

| Seam | Substitution need | Enabling point | Real alternative implementation |
| --- | --- | --- | --- |
| Repository-identity router | Ordinary applications and Astro upstream contributions require different workflows | Always-visible native skill description plus the first workflow identity check | `astro-web-practices` for applications; copied maintainer skills for confirmed `withastro/astro` work |
| Example-evidence selector | A pinned example can contain contradictory prose and executable source | The selected row in `references/example-library.md` | Use reconciled source/config/CI evidence or stop and select another qualified example |

### Gray-Box Evidence

#### Gray-Box Exceptions

| Verification | Internal knowledge used | Why externally observable behavior is insufficient |
| --- | --- | --- |
| Imported-source and mirror parity | Exact file bytes, paths, and licenses | Agent behavior cannot prove that pinned source material remained unchanged |
| Compatibility reference identity | SHA-256 of the pinned 90-line guide | A successful read does not prove the intended upstream blob was packaged |
| Always-visible routing placement | Frontmatter description markers | Pressure trials prove behavior but cannot prove which startup-visible surface enabled it |

## Research Evidence

- Astro source is pinned to `0fc519de12d69088052b76e096a4adfdc789c30c` under the MIT license.
- Official run <https://github.com/withastro/astro/actions/runs/30171682338> completed successfully at that SHA and exercised build plus `test:check-examples`.
- Official run <https://github.com/withastro/astro/actions/runs/30171682348> completed successfully at that SHA and exercised smoke example builds.
- Those runs qualify executable build and Astro-check behavior only; they do not validate README prose, external links, or compatibility with another project.
- The intended upstream `reference/unit-testing.md` is 90 lines with SHA-256 `746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678`.
- At the pinned SHA, `advanced-routing/README.md` names `src/app.ts`, experimental status, and an `advancedRouting` flag; source uses `src/fetch.ts` and config has no such flag.
- `earendil-works/pi-website@2f5e410b97474d0a34ec2500aa1aa58d6c3f992c:src/packages.html` supports the dialog, focus restoration, scroll management, and DOMPurify claims.
- The project corpus has no matching `skill` exemplar, so no corpus pattern is promoted.

## Derived Dependency Graph

> Wave labels are a derived snapshot of the current authoritative `tasks.json`. `/ship` must recompute the live frontier after every transition.

```text
Task task-1: needs the fixed pressure scenario and verified stale-source evidence;
             creates behaviorally proven routing and stale-example handling.
Task task-2: needs task-1 and a file-creation checkpoint;
             creates the exact compatibility reference and qualified provenance.
Task task-3: needs task-2 and current attempt-2 evidence;
             creates integrated verification and truthful final graph evidence.

Wave 1: task-1
Wave 2: task-2
Wave 3: task-3
```

## Tasks

### Task 1 — Prove and harden Astro routing and stale-example handling `[behavior-routing]`

The final native skill demonstrably routes ordinary Astro application work away from copied maintainer workflows and treats contradictory example prose as unqualified evidence.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/skills/astro-web-practices/SKILL.md
  - .pi/skills/astro-web-practices/references/example-library.md
  - .pi/tests/skill-system.test.ts
needs:
  - fixed ordinary-app versus withastro/astro pressure scenario and rubric
  - verified advanced-routing README, source, config, and CI evidence
creates:
  - behaviorally proven always-visible routing contract
  - fail-closed advanced-routing evidence rule
  - focused routing and stale-evidence tests
has_checkpoint: false
```

**Execution Contract:**

```yaml
acceptance_criteria:
  - Before native skill edits, one fresh agent without the skill scores below 4/5 on the fixed ordinary-app, imported-triage, stale-README pressure scenario; a score of 4/5 or higher stops implementation until the scenario is made discriminating.
  - The always-visible frontmatter description requires astro-web-practices first for ordinary Astro application work and confirmed withastro/astro repository identity before copied maintainer skills are used.
  - The body provides a positive routing recipe for exact upstream contribution work, ordinary applications, unknown repository identity, generic bug debugging, and explicit-repository GitHub Actions analysis.
  - The advanced-routing entry identifies src/fetch.ts and the absence of the advancedRouting flag, marks the pinned README prose stale, and leaves the mirror unchanged.
  - The target Astro version, adapter, output mode, package manager, and repository scripts are required before commands or compatibility claims.
  - After the minimum GREEN and any refactor, two consecutive fresh unforced trials against the final skill bytes each score at least 4/5.
  - No imported skill file, mirror file, AGENTS.md, manifest, or spec file changes.
verification:
  - Fresh-agent RED using the fixed five-point rubric, with prompt, response, score, and parent rationale recorded under attempt-2 evidence before native skill edits.
  - node --experimental-strip-types --test --test-name-pattern="Astro upstream skills|Astro practice routing|manifest has exact bidirectional parity" .pi/tests/skill-system.test.ts
  - Fresh-agent GREEN on final skill bytes, with two consecutive unforced trials scoring at least 4/5 and exact responses plus parent scoring recorded.
  - git diff --check -- .pi/skills/astro-web-practices/SKILL.md .pi/skills/astro-web-practices/references/example-library.md .pi/tests/skill-system.test.ts
```

**TDD steps:**

1. Record current hashes and status for the three owned files and all protected imported and mirror roots.
2. Run one fresh baseline agent on the fixed ordinary-app, imported-triage, stale-README scenario without loading or naming the native skill.
3. Score the five-point rubric; stop without editing if the baseline reaches 4/5.
4. Add focused semantic assertions for frontmatter routing, repository identity, source-first disagreement handling, and the unchanged mirror boundary.
5. Run the focused test and retain the expected missing-contract failure as static RED.
6. Make the minimum native description, routing recipe, and `advanced-routing` map edits needed by the failed assertions and behavioral rubric.
7. Run the focused test and confirm GREEN with the expected test count and no unrelated failure.
8. Run one explicit-load GREEN pressure trial and parent-score it against the unchanged rubric.
9. Compress only wording exposed as redundant by the first GREEN; any edit invalidates the final pass streak.
10. Run final unforced GREEN trial one against the final bytes and require at least 4/5.
11. Run final unforced GREEN trial two against the same final bytes and require at least 4/5.
12. Inspect the owned diff, rerun diff hygiene, and confirm protected imported and mirror hashes remain unchanged.

### Task 2 — Repair Pi-local references and qualify pinned source evidence `[qualification]`

The imported triage link resolves to the exact intended upstream guide, and provenance truthfully records executable qualification, stale prose, source limits, and pi.dev evidence.

**Metadata:**

```yaml
depends_on:
  - task-1
parallel: false
conflicts_with: []
files:
  - .pi/reference/unit-testing.md
  - .pi/skills/astro-web-practices/references/provenance.md
  - .pi/tests/skill-system.test.ts
needs:
  - completed task-1 behavior and routing contract
  - explicit approval before creating the new compatibility path
  - pinned upstream guide and verified official CI runs
creates:
  - resolvable exact upstream unit-testing compatibility reference
  - source-qualified provenance with explicit limits
  - focused link, hash, and provenance tests
has_checkpoint: true
```

**Execution Contract:**

```yaml
acceptance_criteria:
  - Focused static and link checks are observed failing before compatibility-file or provenance edits.
  - After static RED, ship presents the exact new directory and file path, source ref, 90-line size, expected SHA-256, MIT license mapping, and no-overwrite behavior and waits for explicit written approval.
  - If approved, .pi/reference/unit-testing.md is an exact copy of pinned Astro reference/unit-testing.md with SHA-256 746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678; no bridge is created.
  - The unchanged ../../reference/unit-testing.md link in triage/fix.md resolves to the compatibility file in Pi Core.
  - Provenance records both official GitHub Actions run URLs, the exact head SHA and successful conclusions, and limits qualification to build, Astro check, test:check-examples, and smoke builds rather than README prose, external links, or target compatibility.
  - Provenance identifies the advanced-routing README and source conflict and adds pi.dev src/packages.html as evidence for dialog, focus, scroll, and DOMPurify claims.
  - Pi-local bundled links are distinguished from target-monorepo-relative links; no target-path compatibility wrappers are created.
  - All imported skill and template mirror bytes remain unchanged.
verification:
  - node --experimental-strip-types --test --test-name-pattern="Astro imported Pi-local references|Astro provenance records qualified sources|Astro upstream skills" .pi/tests/skill-system.test.ts
  - test "$(sha256sum .pi/reference/unit-testing.md | cut -d' ' -f1)" = 746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678
  - git diff --check -- .pi/reference/unit-testing.md .pi/skills/astro-web-practices/references/provenance.md .pi/tests/skill-system.test.ts
```

**TDD steps:**

1. Verify the destination is absent and re-read the pinned source blob, line count, SHA-256, and MIT provenance without creating files.
2. Add focused tests for Pi-local link resolution, exact compatibility hash, exact-SHA CI qualification limits, stale README disclosure, and `src/packages.html` provenance.
3. Run the focused test and retain failures for the missing path and qualification markers as RED.
4. Present the exact `.pi/reference/unit-testing.md` creation scope and wait for explicit written approval; if approval is withheld, mark the task blocked without a fallback file.
5. After approval, create the directory and exact pinned file only if the destination remains absent; stop on path drift or hash mismatch.
6. Update the existing provenance reference with the two CI runs, qualified behaviors, stale-prose limits, compatibility placement, license mapping, and pi.dev source.
7. Run the focused test and exact hash command to GREEN.
8. Inspect the owned diff and prove that imported skill and mirrored example bytes remain unchanged.

### Task 3 — Verify the remediated Astro integration `[verification]`

Current behavioral, structural, parity, repository, and lifecycle evidence supports a truthful final graph state without local Astro dependency installation.

**Metadata:**

```yaml
depends_on:
  - task-2
parallel: false
conflicts_with: []
files:
  - .pi/artifacts/astro-web-practices/tasks.json
  - .pi/artifacts/astro-web-practices/progress.md
needs:
  - completed task-2 compatibility and provenance repair
  - current attempt-2 evidence for task-1 and task-2
creates:
  - integrated attempt-2 verification and review evidence
  - truthful final graph state derived from current gates
has_checkpoint: false
```

**Execution Contract:**

```yaml
acceptance_criteria:
  - The focused Astro and manifest contracts pass, including routing, stale evidence, packaged links, exact hashes, and provenance limits.
  - The exact final behavior-test prompt and rubric, one discriminating RED, and two consecutive final GREEN trials are retained as attempt-2 evidence.
  - All 18 source files in the seven copied skill directories remain byte-identical to pinned upstream and all seven adjacent Astro licenses remain exact.
  - The 427-file, 24-example mirror remains recursively byte-identical to pinned upstream.
  - The full retained suite, Doctor, and every artifact graph pass or any failure is reported without unrelated modification.
  - No package-manager command, local Astro dependency installation, sparse-checkout alteration, deletion, branch operation, or protected-byte edit occurs.
  - Owned-path diff review is clean and concurrent or runtime-managed work remains untouched.
verification:
  - node --experimental-strip-types --test --test-name-pattern="Astro upstream skills|Astro practice routing|Astro imported Pi-local references|Astro provenance records qualified sources|manifest has exact bidirectional parity" .pi/tests/skill-system.test.ts
  - node --experimental-strip-types --test .pi/tests/*.test.ts
  - node --experimental-strip-types .pi/scripts/doctor.ts
  - for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f" >/dev/null || exit; done
  - for name in analyze-github-action-logs astro-developer astro-pr-writer changeset merge triage writing-comments; do diff -qr --exclude=LICENSE "/home/ryanj/work/inspo/creative/web/astro/.agents/skills/$name" ".pi/skills/$name" || exit 1; cmp -s /home/ryanj/work/inspo/creative/web/astro/LICENSE ".pi/skills/$name/LICENSE" || exit 1; done
  - diff -qr /home/ryanj/work/inspo/creative/web/astro/examples .pi/templates/astro/examples
  - cmp -s /home/ryanj/work/inspo/creative/web/astro/LICENSE .pi/templates/astro/LICENSE && cmp -s /home/ryanj/work/inspo/creative/web/astro/LICENSE .pi/skills/astro-web-practices/references/licenses/astro-MIT.txt && cmp -s /home/ryanj/work/inspo/creative/web/pi-website/LICENSE .pi/skills/astro-web-practices/references/licenses/pi-website-MIT.txt
  - test "$(sha256sum .pi/reference/unit-testing.md | cut -d' ' -f1)" = 746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678
  - git diff --check -- .pi/artifacts/astro-web-practices .pi/reference/unit-testing.md .pi/skills/astro-web-practices .pi/tests/skill-system.test.ts
  - git status --short --branch
```

**Verification steps:**

1. Validate `tasks.json`, recompute the explicit frontier, and confirm only dependency-satisfied nodes advanced during attempt 2.
2. Run the focused Astro and manifest tests and inspect the exact pass count.
3. Reconcile the retained behavioral prompt, baseline RED, two final GREEN responses, parent scores, and final skill hash.
4. Compare all 18 copied source files and seven adjacent licenses to the pinned Astro checkout.
5. Compare the 427-file example mirror and all root/reference licenses to their pinned sources.
6. Run the complete retained Pi Core test suite and inspect failures, skips, and test count.
7. Run Doctor and report its exit status plus any existing warnings separately from feature failures.
8. Validate every artifact task graph and recompute the `astro-web-practices` frontier.
9. Run owned-path diff hygiene and final checkout status, then append current attempt evidence before changing any node to passed.

## Approval Checkpoint

Task 2 may create exactly one new implementation file after separate written approval:

- Path: `.pi/reference/unit-testing.md`
- Source: `withastro/astro@0fc519de12d69088052b76e096a4adfdc789c30c:reference/unit-testing.md`
- Expected length: 90 lines
- Expected SHA-256: `746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678`
- License mapping: `.pi/skills/astro-web-practices/references/licenses/astro-MIT.txt`
- Safety behavior: create only when the destination remains absent; never overwrite or substitute a bridge silently.

## Risks and Stop Conditions

- Stop Task 1 before edits if the behavioral baseline scores 4/5 or higher; refine the pressure scenario rather than claiming a RED.
- Stop on concurrent overlap in `SKILL.md`, either native reference, `skill-system.test.ts`, `plan.md`, or `tasks.json`.
- Stop Task 2 if new-file approval is absent, the destination appears, the pinned blob cannot be read, or its hash differs.
- Stop if any imported skill source, template mirror file, manifest entry, spec requirement, or protected license changes.
- Treat successful exact-SHA CI as build/check evidence only; never use it to validate stale README prose.
- Preserve all attempt-1 evidence and the prior failed verification; attempt-2 evidence must use unique anchors.
- Automatic routing remains model-mediated, so two consecutive unforced GREEN trials are mandatory rather than replaced by static markers.

## Constitutional Compliance

The plan uses explicit owned paths, includes a checkpoint for the only new file, introduces no dependency, requests no Git integration, and contains no destructive operation. Implementation must preserve unrelated and runtime-managed work.
