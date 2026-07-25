# Hindsight-Only Memory — Implementation Plan

> **For Pi:** Execute the validated `tasks.json` frontier task-by-task. This file explains sequencing and safety; `tasks.json` remains authoritative.

**Goal:** Replace the unused file-backed memory contract with one non-redundant Hindsight policy while preserving existing Hindsight data, historical artifacts, and concurrent work.

**Research depth:** Reused completed deep research from `.pi/artifacts/hindsight-only-memory/research.md`; no additional agents were spawned because local scope, installed 0.11.0 behavior, upstream guidance, and review findings were already resolved.

**Authoritative graph:** `.pi/artifacts/hindsight-only-memory/tasks.json` — version 2, validated, initial frontier `task-1`.

## Workspace

- **Checkout:** `/home/ryan/repo/pi-core`
- **Branch / HEAD at replan:** `main` / `c486a7ddac49811b1691b1b5e9e54d4f1503c842`
- **Isolation:** No branch or worktree created. The checkout is dirty with unrelated work, and no separate Git operation was authorized.
- **Execution cap:** One task at a time even where the graph marks tasks file-disjoint.
- **Existing overlap:** `AGENTS.md` and `.pi/tests/skill-system.test.ts` contain unrelated changes that must be preserved hunk-for-hunk. The staged project-agent deletions are intentional user-owned work and remain outside this feature.
- **Configuration state:** `.pi/hindsight.json` already exists as an untracked project config and is an owned implementation path only for `task-2`.

## Must-Haves

### Observable Truths

1. Fresh sessions receive project Hindsight recall without an automatically appended mental-model snapshot block.
2. Recall and automatic retain stay enabled on the manual `pi-coding` project bank; the user bank stays disabled.
3. Existing mental models remain server-side and usable through explicit reflection.
4. No live agent, prompt, skill, template, workflow, policy, or test reads or writes a repository memory Markdown file.
5. Parent sessions own memory access and pass only sanitized, task-relevant context to fresh subagents.
6. Active execution evidence stays in `progress.md`; ordinary durable session deltas use automatic Hindsight retain.
7. Hindsight bank contents, historical artifacts, and `.pi/hindsight/**` runtime sidecars are untouched.
8. The two old files are deleted only after all references are removed and the refreshed two-confirmation gate is complete.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Runtime policy | Project-only recall/retain and mental-model injection setting | `.pi/hindsight.json` |
| Executable contracts | Regression proof for config, references, handoff, and ownership | `.pi/tests/skill-system.test.ts` |
| Parent policy | Canonical evidence and durable-context rules | `AGENTS.md` |
| Lifecycle policy | Separation of task evidence and durable Hindsight memory | `.pi/skills/development-lifecycle/SKILL.md` |
| Fabric delegation contract | Parent-provided Hindsight context and gap reporting | `AGENTS.md` and lifecycle prompts |
| Command contracts | Hindsight-first context and retention semantics | Six lifecycle prompts |
| Ownership guidance | Config/runtime classification and tech-stack promise | GC prompt/workflow and tech-stack template |
| Retired artifacts | Proven absence of the old file store and skill | `.pi/artifacts/MEMORY.md`, `.pi/skills/memory/SKILL.md` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| `.pi/hindsight.json` | Hindsight lifecycle hooks | Installed 0.11.0 config resolver | Same-session checks can observe stale loaded config |
| Parent prompt/policy | Fresh subagent | Sanitized task envelope | Child assumes memory access or receives unrelated private context |
| Automatic recall | Explicit recall/reflect | Gap-only escalation rule | Both channels are invoked routinely and recreate duplication |
| `progress.md` | Hindsight retain | Evidence/durable-context separation | Attempt logs are duplicated as memory summaries |
| GC guidance | `.pi/hindsight.json` and `.pi/hindsight/` | Config/runtime ownership classification | Runtime queue or receipts are treated as disposable |
| Live-reference contract | Removed files | Repository surface scan with artifact/state exclusions | Historical evidence is rewritten merely to make grep clean |

## Boundaries and Testability

Black-box and gray-box are verification perspectives, not module-design categories.

### Module Boundaries

| Boundary | Hidden decision | Public behavior |
| --- | --- | --- |
| Hindsight extension configuration | Bank routing and injection channels | Fresh-session status and effective project configuration |
| Parent-to-subagent context handoff | How memory is retrieved and filtered | Child receives bounded prior decisions and can report gaps |
| Lifecycle evidence versus durable memory | What is task evidence versus cross-session context | Attempts remain in `progress.md`; no duplicate file-memory write occurs |
| Configuration versus runtime state | Which local Hindsight paths are editable policy | `.pi/hindsight.json` may change; `.pi/hindsight/**` remains runtime-managed |
| Live policy versus historical evidence | Which references govern current behavior | Live surfaces contain no file-memory contract; old artifacts remain intact |

### Proposed Seams

None. This feature intentionally removes an alternate memory implementation. There is no real second implementation to select, so an abstraction or compatibility adapter would be speculative and would contradict Hindsight-only scope.

### Gray-Box Exceptions

| Verification | Internal knowledge used | Why externally observable behavior is insufficient |
| --- | --- | --- |
| Config contract test | Stable `.pi/hindsight.json` field structure | A same-session black-box check may retain startup-loaded values |
| Live-reference scan | Repository path classes and explicit exclusions | User-visible behavior cannot prove every workflow stopped naming the retired store |
| Manifest parity test | Skill directory and manifest layout | Runtime skill discovery alone does not prove stale inventory is gone |
| Runtime-state preservation | Pre-implementation Git/status baseline | Hindsight server status cannot prove local queue and receipt files were untouched |

These checks inspect published configuration and repository contracts; they do not mock Hindsight internals.

## Non-Goals

- No memory-file import or migration.
- No Hindsight bank, document, fact, observation, mission, tag, or mental-model mutation.
- No recall-budget tuning or user/global bank enablement.
- No historical artifact cleanup and no runtime sidecar cleanup.
- No fallback memory implementation, compatibility shim, or new dependency.
- No branch, worktree, commit, merge, push, or deployment.

## Research Basis

- The installed 0.11.0 lifecycle concatenates rendered mental models and recall as independent blocks.
- Exact-duplicate recall filtering does not semantically deduplicate those blocks.
- The current four mental models total roughly 10.7K characters, while recall has a separate 800-token cap.
- The supported config control plane accepts project-only memory and `mentalModelsInject: false` in dry-run mode.
- Disabling injection does not delete models or prevent explicit reflection from using them.
- `.pi/artifacts/MEMORY.md` contains stale and contradictory policy, so importing it would degrade memory quality.

Full evidence and sources remain in `.pi/artifacts/hindsight-only-memory/research.md`.

## Derived Dependency Graph

> Snapshot of the validated graph. `/ship` must recompute the frontier after every state transition.

```text
task-1  Lock Hindsight-Only Contracts (expected RED)
   ├── task-2  Make Runtime Policy Explicit
   ├── task-3  Replace Parent Lifecycle Policy ──┐
   ├── task-5  Replace Command Workflows ───────┼── task-4  Verify Removed Agent Surface
   └── task-6  Replace Ownership Documentation  │
                                                   └── task-7  Remove Store and Skill (deletion gate)
                                                            |
                                                        task-8  Integrated Verification

Derived Wave 1: task-1
Derived Wave 2: tasks 2, 3, 5, and 6 (graph-disjoint; execution cap serializes them)
Derived Wave 3: task-4
Derived Wave 4: task-7
Derived Wave 5: task-8
```

## Execution Rules

1. Re-read the exact task files and record their status in `progress.md` immediately before every edit.
2. If another process changed an owned line after inspection, stop that task and preserve both versions; never choose silently.
3. Add focused contracts first. RED must come only from missing Hindsight-only behavior, not syntax, invalid regex, or an unrelated test.
4. Use the supported Hindsight config control plane: inspect status, dry-run the exact project patch, apply only the reviewed patch, then inspect the resulting file.
5. Do not use broad replacement scripts or repository-wide mutation. Change only each reference neighborhood and inspect the scoped diff immediately.
6. Do not weaken an assertion merely to accommodate a partially updated surface.
7. Keep `tasks.json` status and evidence parent-owned; append attempt evidence to this feature's `progress.md`.
8. Do not execute `task-7` until tasks 2-6 pass and the exact deletion gate below is complete.
9. Run fresh-session runtime verification only after static and retained tests are green.

## Task Execution Details

### Task 1 — Lock Hindsight-Only Contracts `[test]`

**End state:** Focused tests encode all new contracts and the full test file is RED only for those missing contracts.

**Target:** `.pi/tests/skill-system.test.ts`.

**Approach:** Preserve the current unrelated appended tests. Add narrowly named tests for effective runtime config, live-reference absence, parent lifecycle policy, subagent handoff, command surfaces, ownership docs, and retired-path absence. Build the retired filename dynamically inside the test so the test source itself does not violate the live-reference scan. Exclude `.pi/artifacts/**` and `.pi/state/**` deliberately rather than rewriting history.

**Verify:** Run each new name pattern, then the complete test file, then `git diff --check`.

**Stop:** Any pre-existing test failure, invalid test syntax, broad recursive scan outside the intended repository surfaces, or concurrent overlap blocks the task.

### Task 2 — Make the Hindsight Runtime Policy Explicit `[config]`

**End state:** Effective project config is domain-tagged/project-only on `pi-coding`, recall and retain are on, user memory is off, and mental-model injection is off.

**Target:** `.pi/hindsight.json` only.

**Approach:** Read-only status first; dry-run an allowlisted project config patch covering the resolved profile and injection setting; apply the exact reviewed patch; inspect that unrelated base URL and display settings survived. Do not edit bank missions or mental-model objects.

**Verify:** Focused config test, direct JSON assertion, config diff check, and read-only effective-config inspection.

**Stop:** Any proposed write outside `.pi/hindsight.json`, any bank-data mutation, any raw API key, or a dry-run that changes more than the resolved policy blocks the task.

### Task 3 — Replace Parent Lifecycle Memory Policy `[policy]`

**End state:** Parent authority and lifecycle guidance use Hindsight while keeping active evidence in canonical artifacts.

**Targets:** `AGENTS.md` and `.pi/skills/development-lifecycle/SKILL.md`.

**Approach:** Replace only the two memory-policy neighborhoods in each file. Define automatic recall as the first context source, bounded explicit recall/reflect for material gaps, automatic retain for ordinary session deltas, and explicit retain only for raw high-value content. Preserve task-graph and progress authority.

**Verify:** Focused policy test, no retired-path match in the two files, scoped diff inspection, and whitespace check.

**Stop:** Any change to unrelated authority, deletion rules, Git policy, task-graph semantics, or existing concurrent hunks blocks the task.

### Task 4 — Honor the Removed Project-Agent Surface `[integration]`

**End state:** The intentionally removed project-agent layer remains untouched while parent Fabric delegation surfaces carry bounded Hindsight context and gap-reporting rules.

**Targets:** None; this is an integration verification node.

**Approach:** Verify the staged agent deletions remain owner-attributed, confirm no Hindsight task recreates those files, and check that tasks 3 and 5 provide sanitized parent-owned context to Fabric children.

**Verify:** Run the existing project-agent absence contract plus the new Fabric child Hindsight-context contract; inspect the staged deletion list read-only.

**Stop:** Any missing deletion, attempted restoration, new project-agent file, or context rule that grants children broad memory access blocks the task.

### Task 5 — Replace Command Memory Workflows `[prompts]`

**End state:** Create, init, plan, research, ship, and verify consistently use non-duplicative Hindsight semantics.

**Targets:** `.pi/prompts/create.md`, `.pi/prompts/init.md`, `.pi/prompts/plan.md`, `.pi/prompts/research.md`, `.pi/prompts/ship.md`, `.pi/prompts/verify.md`.

**Approach:** Replace context-search blocks with automatic-recall-first guidance and bounded explicit lookup for unresolved questions. Replace closing file appends with active progress evidence plus automatic retain; permit explicit retain only for raw, high-value durable facts. Keep research artifact routing, planning ownership, review, and shipping gates unchanged.

**Verify:** Focused orchestration test, per-file retired-path scan, scoped diff inspection, and whitespace check.

**Stop:** Any change to `.active` behavior, task scheduling, worker routing, review gates, or existing unrelated prompt hunks blocks the task.

### Task 6 — Replace Memory Ownership Documentation `[docs]`

**End state:** Cleanup and template documentation identifies Hindsight configuration and protects runtime sidecars.

**Targets:** `.pi/prompts/gc.md`, `.pi/workflows/garbage-collection.md`, `.pi/templates/tech-stack.md`.

**Approach:** Replace the old documentation inventory entry with separate configuration/runtime ownership. State that runtime queue, cursor, receipt, import, and diagnostic sidecars are runtime-managed. Replace the stale `.opencode` promise with Hindsight-backed durable context.

**Verify:** Focused ownership test, scoped retired-path scan, scoped diff inspection, and whitespace check.

**Stop:** Any instruction to delete, regenerate, normalize, or commit runtime sidecars blocks the task.

### Task 7 — Remove the File-Memory Store and Skill `[cleanup]`

**End state:** Both old files are absent and the skill manifest exactly matches remaining skill directories.

**Targets:** `.pi/artifacts/MEMORY.md`, `.pi/skills/memory/SKILL.md`, `.pi/skills/manifest.json`.

**Precondition:** Tasks 2-6 pass and no live reference remains.

**Mandatory deletion gate:**

1. Show the exact deletion command, cwd, branch/HEAD, current status, exact two paths, expected effect, and rollback limits.
2. Receive written first confirmation for that exact command and scope.
3. Refresh the complete read-only preflight; any drift restarts the gate.
4. Repeat the exact command and paths and receive immediate written second confirmation.
5. Execute exactly the approved command, then record UTC time, authorizing text, exit code, and post-status in `progress.md`.

No deletion command is pre-authorized by this plan.

**Approach:** Remove only the two approved files and the single manifest entry. Never import or explicitly retain the old file contents.

**Verify:** Exact absence checks, manifest parity test, retired-path contract, scoped diff check, and deletion audit.

**Stop:** Missing confirmation, changed path list, changed command, active-slug drift, or any request to delete Hindsight data blocks the task.

### Task 8 — Verify Hindsight-Only Integration `[verify]`

**End state:** Static, retained, graph, runtime, scope, and preservation gates all pass with current-attempt evidence.

**Approach:** Run focused and full tests, validate every artifact graph, prove cross-artifact frontier reporting leaves `.active` unchanged, scan live surfaces, compare runtime-state status to the recorded baseline, and start a fresh Pi session for read-only Hindsight status/effective-config checks. Confirm explicit reflection remains available without modifying a mental model.

**Verify:** All commands in `tasks.json`, fresh-session `hindsight_status`, project `hindsight_config` get, full scoped diff review, and a correctness/regression review because this changes a core cross-session behavior contract.

**Stop:** Any failure, stale-session ambiguity, unexpected Hindsight data mutation, unrelated owned diff, or missing deletion audit blocks completion.

## Risks and Rollback Scope

| Task | Main risk | Bounded rollback scope |
| --- | --- | --- |
| task-1 | Brittle prose assertions or accidental self-match | Newly added memory-policy tests only |
| task-2 | Config rewrite changes unrelated fields | Reviewed `.pi/hindsight.json` patch only |
| task-3 | Parent authority changes beyond memory policy | Four known policy neighborhoods only |
| task-4 | Removed agent files are recreated or claimed by this feature | Read-only absence and parent-envelope verification only |
| task-5 | Lifecycle behavior changes while replacing context instructions | Known memory blocks in six prompts |
| task-6 | Runtime state becomes a cleanup target | Three documentation rows/sentences only |
| task-7 | Irreversible file deletion without exact authorization | No execution until two-confirmation audit is complete |
| task-8 | Narrow tests pass while runtime remains stale | No source edits; stop and report |

## Open Questions

None block implementation. Deletion authorization remains deliberately pending until `task-7` preflight.

## Constitutional Compliance

- [x] Spec and task graph precede implementation.
- [x] No implementation file was edited by `/create`.
- [x] No branch, worktree, commit, push, dependency, migration, or Hindsight bank mutation is planned.
- [x] Historical and runtime-managed files are explicitly protected.
- [x] Concurrent dirty paths have per-task preservation and stop conditions.
- [x] Tests precede behavior-changing edits.
- [x] The destructive task is isolated behind the repository's two-confirmation gate.
- [x] Canonical IDs are `task-1` through `task-8`, matching `tasks.json`.

**Constitutional compliance: PASS**