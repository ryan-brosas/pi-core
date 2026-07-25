# Hindsight-Only Memory

- **Created:** 2026-07-25 (UTC)
- **Status:** Approved for implementation
- **Tracking:** Project artifact graph
- **Research:** `.pi/artifacts/hindsight-only-memory/research.md`
- **Checkout:** `/home/ryan/repo/pi-core`

## Problem Statement

Pi Core currently exposes two competing durable-memory systems: Hindsight, which already performs automatic project-scoped recall and session retention, and a manual file-backed workflow built around `.pi/artifacts/MEMORY.md` plus a local `memory` skill. The file workflow is unused by user intent, contains stale policy and paths, and is still named throughout agents, prompts, lifecycle guidance, templates, garbage-collection rules, and tests.

The dual system creates repeated context, contradictory instructions, and unnecessary operator decisions about where memory belongs. Hindsight also injects both recalled observations and mental-model snapshots automatically; the installed 0.11.0 implementation concatenates those channels without semantic cross-deduplication, which explains the observed repetition and prompt bloat.

### Why now?

The user has explicitly selected Hindsight as the sole memory system and rejected a hybrid or migration path. Leaving the file-memory contract in place would preserve the exact redundancy this change is intended to remove and would make deletion of the old files unsafe because live workflows still reference them.

### Who is affected?

- **Primary users:** The repository owner and parent Pi sessions that need relevant project context without duplicate memory blocks.
- **Secondary users:** Pi subagents receiving bounded context from the parent, and maintainers editing lifecycle prompts, skills, or cleanup policy.

## Goals

1. Make Hindsight the only live durable-memory authority for Pi Core.
2. Remove the unused file-memory artifact and its local skill without importing their content.
3. Eliminate automatic mental-model prompt injection while preserving mental models for explicit reflection.
4. Replace every live file-memory instruction with one consistent Hindsight context and retention policy.
5. Preserve historical artifacts, Hindsight bank contents, and runtime-managed sidecars.
6. Add executable contracts that prevent the file-memory workflow from returning.

## Scope

### In Scope

- Make the effective project Hindsight policy explicit: domain-tagged `pi-coding`, project-only memory, automatic recall enabled, automatic retain enabled, user bank disabled, and `mentalModels.inject: false`.
- Delete `.pi/artifacts/MEMORY.md` without importing, summarizing, or retaining its contents.
- Delete `.pi/skills/memory/SKILL.md` and remove `memory` from `.pi/skills/manifest.json`.
- Replace live file-memory references in parent policy, Fabric delegation envelopes, lifecycle prompts, lifecycle skill, tech-stack template, and garbage-collection guidance.
- Define parent-owned Hindsight context handoff for fresh subagents.
- Add contract tests for Hindsight configuration, legacy-path absence, manifest parity, context handoff, and runtime-state protection.
- Verify behavior in a fresh Pi session after configuration reload.

### Out of Scope

- Importing or migrating any content from `.pi/artifacts/MEMORY.md`.
- Purging, rebuilding, retagging, or otherwise mutating existing Hindsight facts, observations, documents, missions, or mental models.
- Deleting mental models; only their automatic prompt injection is disabled.
- Changing the `pi-coding` bank ID, project scope identity, Hindsight server, recall budget, recall type filter, score floors, or retain queue behavior.
- Enabling the user/global bank or retaining cross-project user memory.
- Rewriting historical `.pi/artifacts/**` records that mention the retired file workflow.
- Editing `.pi/state/session-summary.md` or `.pi/hindsight/**` runtime-managed sidecars.
- Adding dependencies, package metadata, compatibility shims, branches, worktrees, commits, pushes, or deployments.

## Proposed Solution

### Overview

Keep the existing project-scoped Hindsight installation and make its non-redundant policy explicit through the supported Hindsight configuration control plane. Automatic observation recall remains the default context channel, and automatic structured session retain remains the default persistence channel. Automatic mental-model injection is disabled, but server-side models remain available to explicit `hindsight_reflect` calls.

Remove the old memory file and skill only after all live references have been replaced. Parent workflows consume automatically recalled context first, use bounded `hindsight_recall` or `hindsight_reflect` only when a material gap remains, and pass only task-relevant, sanitized context to fresh subagents. Subagents report missing context to the parent rather than searching or mutating a separate memory store. Ordinary session deltas rely on automatic retain; explicit `hindsight_retain` is reserved for raw, high-value durable facts or decisions that require immediate persistence, not duplicate end-of-task summaries.

Garbage-collection guidance treats `.pi/hindsight.json` as configuration and `.pi/hindsight/` as runtime-managed retry/receipt state. Neither Hindsight server data nor local sidecars are cleanup targets for this feature.

### User Flow

1. A new Pi session loads one bounded Hindsight recall block for the active project; mental-model snapshots are not automatically appended.
2. The parent uses recalled context directly and requests explicit recall or reflection only when the current task has a material memory gap.
3. When delegating, the parent supplies a sanitized, task-bounded Hindsight excerpt in the agent envelope.
4. The session records task evidence in the active `progress.md`; Hindsight automatically retains durable session deltas at session end.
5. No workflow reads from or writes to a repository memory Markdown file.

## Requirements

### Functional Requirements

#### FR1 — Sole Runtime Memory Policy

The effective project configuration must remain setup-complete, domain-tagged, project-only, and pinned to the manual `pi-coding` bank. Project recall and retain remain enabled, the user bank remains disabled with explicit-only user retain, and automatic mental-model injection is disabled.

**Scenarios:**

- **WHEN** a fresh Pi session starts in this repository **THEN** automatic project recall is enabled and automatic mental-model injection is disabled.
- **WHEN** explicit reflection is requested **THEN** existing server-side mental models remain available unless that call explicitly excludes them.

#### FR2 — Retire File-Backed Memory

The repository memory file and local memory skill must be absent, and the skill manifest must retain exact bidirectional parity with skill directories.

**Scenarios:**

- **WHEN** implementation completes **THEN** `.pi/artifacts/MEMORY.md` and `.pi/skills/memory/SKILL.md` do not exist.
- **WHEN** the old memory file is removed **THEN** none of its content is imported into Hindsight.

#### FR3 — Parent Context Acquisition

Parent workflows must treat automatic Hindsight recall as already-available context and use explicit recall or reflection only for a bounded unresolved question. They must not search for a repository memory file.

**Scenarios:**

- **WHEN** recalled context answers the task question **THEN** no additional memory query is issued.
- **WHEN** a material prior decision is missing **THEN** the parent performs a topic-bounded Hindsight recall or reflection and records any remaining uncertainty.

#### FR4 — Subagent Context Boundary

Fresh subagents must receive task-relevant Hindsight context from the parent. They must not assume direct Hindsight access, search a retired file store, or persist memory themselves.

**Scenarios:**

- **WHEN** a Fabric child is delegated work **THEN** the parent envelope includes only relevant prior decisions or findings.
- **WHEN** required context is missing **THEN** the child reports the gap to the parent instead of broadening its memory access.

#### FR5 — Retention Semantics

Active execution evidence remains in `progress.md`; ordinary durable session deltas are captured by automatic Hindsight retain. Explicit retain is used only for raw, high-value facts or decisions that require immediate persistence, never as a duplicate closing ritual.

**Scenarios:**

- **WHEN** a task or verification attempt completes **THEN** attempt evidence is written to active `progress.md` and is not duplicated into a memory Markdown file.
- **WHEN** an important durable decision must be persisted immediately **THEN** the parent may explicitly retain the raw source and provenance in the project bank.

#### FR6 — Configuration and Runtime-State Ownership

`.pi/hindsight.json` is the Hindsight configuration surface. `.pi/hindsight/` contains runtime-managed queue, cursor, receipt, import, or diagnostic sidecars and is not a garbage-collection target.

**Scenarios:**

- **WHEN** cleanup policy inventories memory-related paths **THEN** it distinguishes configuration from runtime-managed state.
- **WHEN** this feature is implemented **THEN** existing `.pi/hindsight/**` sidecars remain untouched.

#### FR7 — Historical Compatibility

Historical artifact records remain readable and unchanged even if they mention the retired workflow. Live policy and executable surfaces must not rely on those historical references.

**Scenarios:**

- **WHEN** the repository is searched for live file-memory instructions **THEN** historical `.pi/artifacts/**` and runtime `.pi/state/**` are excluded from the live-policy gate.
- **WHEN** all artifact graphs are validated **THEN** version-1 and version-2 graph compatibility remains intact.

#### FR8 — Regression Contracts

The retained test suite must assert the effective Hindsight policy, retired-path absence, manifest parity, parent-owned subagent handoff, live-reference absence, and runtime-state protection.

### Non-Functional Requirements

- **Performance:** Preserve the current observation-only `mid` recall budget and 800-token cap; remove the separate automatic mental-model block rather than tuning recall speculatively.
- **Privacy:** Parent-to-child memory excerpts must exclude credentials, secrets, private conversation, and unrelated user data.
- **Reliability:** Keep automatic retain, retry queue, cursors, and receipts intact; no file-memory fallback is introduced.
- **Security:** Never place raw API keys in `.pi/hindsight.json`; the existing local base URL remains unchanged.
- **Compatibility:** Preserve historical artifacts and version-1 `tasks.json` readability.
- **Maintainability:** One live memory authority, one configuration surface, and executable checks against reintroducing the retired file contract.

## Success Criteria

- [ ] The effective Hindsight configuration is project-only/domain-tagged on `pi-coding`, with recall and retain enabled, the user bank disabled, and automatic mental-model injection disabled.
  - Verify: `node -e 'const a=require("node:assert/strict"),c=require("./.pi/hindsight.json");a.equal(c.setupComplete,true);a.equal(c.scope.mode,"domain-tagged");a.deepEqual(c.banks.project,{enabled:true,derive:"manual",bankId:"pi-coding"});a.equal(c.banks.user.enabled,false);a.equal(c.userRetain.mode,"explicit-only");a.equal(c.recall.enabled,true);a.equal(c.retain.enabled,true);a.equal(c.mentalModels.inject,false)'`
- [ ] The repository memory file and local memory skill are absent, and the skill manifest has exact parity with remaining skill directories.
  - Verify: `test ! -e .pi/artifacts/MEMORY.md && test ! -e .pi/skills/memory/SKILL.md && node --experimental-strip-types --test --test-name-pattern="manifest has exact|legacy file memory is absent" .pi/tests/skill-system.test.ts`
- [ ] No live policy, agent, prompt, skill, template, workflow, or test relies on `MEMORY.md` or its stale `.opencode` path.
  - Verify: `! rg -n --hidden --glob '!**/.git/**' --glob '!.pi/artifacts/**' --glob '!.pi/state/**' 'MEMORY(\\?\\.md)|\\.opencode/artifacts/MEMORY' AGENTS.md .pi/prompts .pi/skills .pi/templates .pi/workflows .pi/tests`
- [ ] Parent workflows use automatic Hindsight context first, bounded recall/reflect for gaps, and parent-provided sanitized context for fresh subagents.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="Hindsight|subagent.*context" .pi/tests/skill-system.test.ts`
- [ ] Active evidence remains in `progress.md`, automatic retain remains enabled, and cleanup guidance protects Hindsight configuration and runtime sidecars.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="runtime state|retention" .pi/tests/skill-system.test.ts`
- [ ] No Hindsight bank content, mission, mental model, or runtime sidecar is migrated, purged, or rewritten by this feature.
  - Verify: `git status --short -- .pi/hindsight .pi/state/session-summary.md` matches the pre-implementation baseline recorded in this feature's `progress.md`.
- [ ] A fresh Pi session reports recall on, retain on, project bank `pi-coding`, user bank off, and mental-model injection off; explicit reflection remains available.
  - Verify: run read-only `hindsight_status` and `hindsight_config` with `action: "get"` in a fresh session and record the results in `progress.md`.
- [ ] The focused and retained test suites pass without weakening existing assertions.
  - Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts && node --experimental-strip-types --test .pi/tests/*.test.ts`
- [ ] Every artifact graph validates, cross-artifact reporting leaves `.active` unchanged, and all owned diffs pass whitespace checks.
  - Verify: `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`

## Technical Context

### Existing Patterns

- `.pi/hindsight.json:1-32` already encodes the desired project bank, user-bank, recall, and retain policy; only automatic mental-model injection is still implicit and enabled by default.
- Installed `@luxusai/pi-hindsight` 0.11.0 maps the supported `memoryProfile: project-only` control to project enabled, user disabled, recall enabled, retain enabled, and explicit-only user retain in `extensions/config/config-writer.ts:191-219`.
- Installed recall lifecycle code independently renders mental models and recall, then concatenates both in `extensions/lifecycle/recall.ts:238-248`.
- `.pi/tests/skill-system.test.ts` enforces exact manifest/directory parity and the intentional absence of project-specific Pi-agent configuration; new Hindsight contracts must preserve the concurrent Fabric-routing assertions.
- `.pi/hindsight/retain-cursors.json`, `retain-queue.jsonl`, and `retain-receipts.json` are extension-managed sidecars.
- The canonical verification command is `node --experimental-strip-types --test .pi/tests/*.test.ts`; the pre-change baseline is 135/135 passing.

### Concurrency and Safety

Two implementation paths already contain unrelated work: `AGENTS.md` and `.pi/tests/skill-system.test.ts`. Each task must re-read its exact neighborhood immediately before editing, preserve all existing hunks, and stop on overlap. The staged deletion of project-specific agent definitions and `.pi/subagents.json` is intentional user-owned work and must remain untouched.

Deletion of `.pi/artifacts/MEMORY.md` and `.pi/skills/memory/SKILL.md` is intentionally deferred until all live references are replaced. `/ship` must complete the repository's exact-path, refreshed two-confirmation deletion gate before executing that task.

### Affected Files

Sixteen implementation paths are in scope; lifecycle artifacts under `.pi/artifacts/hindsight-only-memory/` are not counted here.

| Path | Change |
| --- | --- |
| `.pi/hindsight.json` | Make non-redundant Hindsight policy explicit |
| `.pi/artifacts/MEMORY.md` | Delete without migration |
| `.pi/skills/memory/SKILL.md` | Delete obsolete file-memory skill |
| `.pi/skills/manifest.json` | Remove `memory` from the skill inventory |
| `AGENTS.md` | Replace durable-memory and evidence-order policy |
| `.pi/prompts/create.md` | Use automatic Hindsight context and bounded explicit lookup |
| `.pi/prompts/gc.md` | Classify Hindsight config/runtime ownership instead of the retired file |
| `.pi/prompts/init.md` | Persist project setup through Hindsight semantics, not a file append |
| `.pi/prompts/plan.md` | Use automatic Hindsight context and bounded explicit lookup |
| `.pi/prompts/research.md` | Use Hindsight to avoid repeated research and contradictory decisions |
| `.pi/prompts/ship.md` | Replace lookup and closing-write instructions with Hindsight semantics |
| `.pi/prompts/verify.md` | Keep evidence in `progress.md` and avoid duplicate memory summaries |
| `.pi/skills/development-lifecycle/SKILL.md` | Make Hindsight the durable cross-feature memory authority |
| `.pi/templates/tech-stack.md` | Replace stale `.opencode` memory promise |
| `.pi/workflows/garbage-collection.md` | Protect Hindsight configuration and runtime state |
| `.pi/tests/skill-system.test.ts` | Add and update executable memory-policy contracts |

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| A live workflow still points at a deleted file | Medium | High | Test the complete live surface and delete only after references are green |
| Disabling injection is mistaken for deleting mental models | Low | High | Assert only `mentalModels.inject: false`; use read-only runtime status and preserve server objects |
| Removing the file fallback exposes Hindsight downtime | Medium | Medium | Keep automatic retain queue/receipts intact; no fallback is added because Hindsight-only is explicit product intent |
| Parent and subagent instructions drift | Medium | Medium | Contract-test parent-owned bounded context handoff across agent definitions and prompts |
| Concurrent dirty work is overwritten | Medium | High | Use exact hunk edits, max concurrency one, and stop on owned-line drift |
| Same-session testing observes stale loaded config | High | Medium | Require a fresh-session status/config check before completion |
| Garbage collection treats sidecars as disposable | Low | High | Explicitly classify `.pi/hindsight/` as runtime-managed and test the policy text |

## Open Questions

No product or architecture questions remain. The only pending item is the mandatory execution-time deletion authorization for the two exact paths; it is a safety gate, not a scope decision.

## Tasks

### Task 1 — Lock Hindsight-Only Contracts [test]

Focused tests express the runtime policy, live-reference ban, parent/subagent context boundary, lifecycle retention semantics, and protected runtime state, reaching RED only on the intended missing behavior.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .pi/tests/skill-system.test.ts
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` — expected RED only for the newly added contracts.
- `git diff --check -- .pi/tests/skill-system.test.ts`

### Task 2 — Make the Hindsight Runtime Policy Explicit [config]

The project configuration resolves to project-only `pi-coding` recall and retain with the user bank off and automatic mental-model injection off.

**Metadata:**

```yaml
depends_on: [task-1]
parallel: true
conflicts_with: []
files:
  - .pi/hindsight.json
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="Hindsight runtime policy" .pi/tests/skill-system.test.ts`
- `node -e 'const a=require("node:assert/strict"),c=require("./.pi/hindsight.json");a.equal(c.mentalModels.inject,false);a.equal(c.recall.enabled,true);a.equal(c.retain.enabled,true);a.equal(c.banks.user.enabled,false)'`

### Task 3 — Replace Parent Lifecycle Memory Policy [policy]

Repository authority and lifecycle guidance consistently use Hindsight for durable cross-feature context while retaining active attempt evidence in `progress.md`.

**Metadata:**

```yaml
depends_on: [task-1]
parallel: true
conflicts_with: []
files:
  - AGENTS.md
  - .pi/skills/development-lifecycle/SKILL.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="parent lifecycle memory policy" .pi/tests/skill-system.test.ts`
- `git diff --check -- AGENTS.md .pi/skills/development-lifecycle/SKILL.md`

### Task 4 — Honor the Removed Project-Agent Surface [integration]

The intentionally removed project-specific agent definitions remain untouched while parent Fabric delegation surfaces carry sanitized Hindsight context and gap-reporting rules.

**Metadata:**

```yaml
depends_on: [task-1, task-3, task-5]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="legacy Pi-subagent project configuration is absent|Fabric child Hindsight context is parent-owned" .pi/tests/skill-system.test.ts`
- `git diff --cached --name-status -- .pi/agents .pi/subagents.json`

### Task 5 — Replace Command Memory Workflows [prompts]

Create, init, plan, research, ship, and verify use automatic Hindsight context and retention with bounded explicit operations only when needed.

**Metadata:**

```yaml
depends_on: [task-1]
parallel: true
conflicts_with: []
files:
  - .pi/prompts/create.md
  - .pi/prompts/init.md
  - .pi/prompts/plan.md
  - .pi/prompts/research.md
  - .pi/prompts/ship.md
  - .pi/prompts/verify.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="orchestration surfaces use Hindsight" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/prompts/create.md .pi/prompts/init.md .pi/prompts/plan.md .pi/prompts/research.md .pi/prompts/ship.md .pi/prompts/verify.md`

### Task 6 — Replace Memory Ownership Documentation [docs]

Cleanup and tech-stack guidance classify Hindsight configuration and runtime state correctly and no longer promise a file-memory write.

**Metadata:**

```yaml
depends_on: [task-1]
parallel: true
conflicts_with: []
files:
  - .pi/prompts/gc.md
  - .pi/templates/tech-stack.md
  - .pi/workflows/garbage-collection.md
```

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="Hindsight configuration and runtime state are protected" .pi/tests/skill-system.test.ts`
- `git diff --check -- .pi/prompts/gc.md .pi/templates/tech-stack.md .pi/workflows/garbage-collection.md`

### Task 7 — Remove the File-Memory Store and Skill [cleanup]

After live references are gone and the deletion gate is satisfied, the old memory artifact and skill are absent and the manifest matches remaining skill directories.

**Metadata:**

```yaml
depends_on: [task-2, task-3, task-4, task-5, task-6]
parallel: false
conflicts_with: []
files:
  - .pi/artifacts/MEMORY.md
  - .pi/skills/memory/SKILL.md
  - .pi/skills/manifest.json
```

**Verification:**

- `test ! -e .pi/artifacts/MEMORY.md && test ! -e .pi/skills/memory/SKILL.md`
- `node --experimental-strip-types --test --test-name-pattern="manifest has exact|legacy file memory is absent" .pi/tests/skill-system.test.ts`

### Task 8 — Verify Hindsight-Only Integration [verify]

The complete suite, artifact graphs, live-reference scan, fresh-session runtime checks, and scoped diff review all pass without mutating Hindsight data or unrelated work.

**Metadata:**

```yaml
depends_on: [task-7]
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `node --experimental-strip-types --test .pi/tests/skill-system.test.ts`
- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- `! rg -n --hidden --glob '!**/.git/**' --glob '!.pi/artifacts/**' --glob '!.pi/state/**' 'MEMORY(\\?\\.md)|\\.opencode/artifacts/MEMORY' AGENTS.md .pi/prompts .pi/skills .pi/templates .pi/workflows .pi/tests`
- Run read-only `hindsight_status` and project `hindsight_config` get in a fresh Pi session; record evidence in `progress.md`.

## Notes

- Research initially counted nineteen paths after correcting an escaped test reference. The user then confirmed that three project-agent files were intentionally removed by a separate migration, so the authoritative Hindsight-only implementation scope is sixteen paths.
- The packaged `hindsight-memory-doctor` diagnostic skill is unrelated to the deleted local file-memory skill and remains installed.
- `/ship` must preserve all pre-existing dirty hunks and may not create a branch, worktree, commit, or push without separate authorization.