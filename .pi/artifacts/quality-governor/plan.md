# Quality Governor MVP for Pi Core Implementation Plan

> **For Pi:** Implement this plan task-by-task. `tasks.json` remains the sole scheduling authority.

**Goal:** Pi users can approve a bounded change contract, constrain Pi-mediated coding actions, and receive a current non-scalar verification receipt without treating the extension as a sandbox.

**Discovery Level:** 3 — this is a cross-cutting control-system feature. Planning reused the artifact's deep external research, mined current Git history, inspected Pi/Fabric documentation and local precedents, ran one bounded local-discovery worker, and obtained one independent planning advisory.

**Context Budget:** Execute one canonical task per attempt, targeting 25–40% context per task and never more than about 50%; compact to the active contract, changed paths, decisions, failures, and verification freshness before continuing.

**Planning Decision:** Keep canonical IDs, acceptance contracts, files, and edges unchanged. The five-node graph and five implementation paths are sufficient; no `tasks.json` delta is required.

---

## Must-Haves

### Observable Truths

1. Before a user confirms a valid contract, the model can inspect status and propose scope but cannot mutate through a mediated Pi or captured-tool path.
2. A user can see the complete proposed scope delta and either confirm or decline it; declining or running headless leaves the governor read-only and `UNKNOWN`.
3. In `PLAN`, `BUILD`, and `VERIFY`, direct and Fabric-replayed Pi/captured calls receive the same mode and path decision, while unmediated providers, agents, and processes are reported as bypasses rather than silently treated as safe.
4. Existing out-of-scope paths, undeclared new files, unapproved destructive changes, dependency files, and protected policy paths produce stable evidence and the configured block/warn/observe behavior.
5. The user can inspect independent scope, protected-path, file, dependency, API, architecture, verification, diff, repair, and gate dimensions; no scalar quality score appears.
6. A successful mutation or relevant repository-fingerprint change makes prior verification stale, and a required failed, unavailable, or mutating check cannot produce `GREEN`.
7. The footer, `/quality`, model-facing status tool, terminal annotation, and persisted session metadata agree on current state, and automatic repair is attempted no more than once.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Pure governor policy | Profiles, contracts, path grammar, admission, vector reduction, gate selection, correction eligibility | `.pi/extensions/quality-governor/policy.ts` |
| Repository and check sensors | Canonical path evidence, bounded Git snapshots, fingerprints, check execution, receipts | `.pi/extensions/quality-governor/sensors.ts` |
| Pi runtime adapter | Lifecycle hooks, tools, confirmation, routing, persistence, status, annotation, bounded repair | `.pi/extensions/quality-governor/index.ts` |
| Trusted project configuration | Observe-mode defaults, protected/dependency paths, tool frontiers, bounded check recipes | `.pi/quality-governor.json` |
| Focused contract suite | Pure tests, temporary-repository sensor tests, and fake-Pi lifecycle tests | `.pi/tests/quality-governor.test.ts` |

### Key Links

| From | To | Via | Risk if broken |
| --- | --- | --- | --- |
| Human request | Contract proposal | `input` then `before_agent_start` classification | Classification accidentally grants mutation authority |
| Contract candidate | Active authorization | `quality_contract` plus `ctx.ui.confirm()` | Headless or declined scope becomes active |
| Active mode | Model tool frontier | complete `setActiveTools()` reconciliation | Hidden mutation tool remains available or Fabric full-code mode is broken |
| Direct/nested action | Admission policy | `tool_call` keyed by `toolCallId` | Direct and Fabric-replayed calls receive different rules |
| Successful mutation | Freshness state | one completion record per admitted call | Revision increments twice or verification remains current |
| Fabric outer result | Bypass evidence | strict Trace V1 operation inspection | Agent/provider effects are silently classified as safe |
| Repository/check state | Receipt | pre/post fingerprint plus contract and mutation revisions | Stale or mutating verification is accepted |
| Current vector | Human/model output | footer, widget, command, tool result, message annotation | UI says green while model evidence is stale |
| Non-green terminal state | Bounded correction | persist-attempted then `sendMessage()` | Repair loops, duplicate dispatch, or race with user input |

### Boundaries and Testability

#### Module Boundaries

| Boundary | Hidden decision | Public behavior |
| --- | --- | --- |
| Pure policy | Classification precedence, strict contract shape, path-rule matching, rollout decisions, vector and gate reduction | Deterministic values and stable violation codes for explicit inputs |
| Sensors | Filesystem canonicalization, Git parsing, process bounds, fingerprint composition, check receipt construction | Structured evidence or an explicit unavailable/unknown result; never an inferred pass |
| Runtime adapter | Pi event ordering, pending-call correlation, active-tool reconciliation, UI/context channel choice, persistence and repair timing | Registered governor tools/command, mediated preflight decisions, current status and terminal annotation |

#### Proposed Seams

No new public interface, abstract class, repository, service layer, or plugin point is introduced. The following are narrow function-injection seams inside the two impure modules.

| Seam | Substitution need | Enabling point | Real alternative implementation |
| --- | --- | --- | --- |
| Process operations | Exercise timeout, output-cap, exit, and cancellation paths without invoking arbitrary commands | Internal sensor constructor accepts an executable/argv runner function | Node `spawn(..., { shell: false })` runner in production; deterministic runner in focused tests |
| Filesystem/Git evidence | Reproduce symlink escape, untracked files, and repository drift | Sensor functions accept a repository root and bounded filesystem/process operations | Real temporary Git repository; fixed fake evidence for isolated receipt tests |
| Pi lifecycle adapter | Verify confirmation, tool routing, persistence, HUD, and repair races without loading an interactive Pi session | Default extension consumes only the documented `ExtensionAPI` surface | Installed Pi runtime; fake extension API in `.pi/tests/quality-governor.test.ts` |

#### Gray-Box Exceptions

| Verification | Internal knowledge used | Why externally observable behavior is insufficient |
| --- | --- | --- |
| Argv-only check execution | Captured executable, argv, cwd, and `shell: false` option | A successful command result cannot prove that shell interpretation was absent |
| Exactly-once mutation revision | Pending/completed tool-call IDs and revision counter | Final gate state alone cannot reveal a double increment hidden by later checks |
| Active-branch restoration | Separate `getBranch()` and `getEntries()` fixtures | A restored status does not prove that abandoned session branches were ignored |
| Persist-before-repair ordering | Recorded `appendEntry` and `sendMessage` operation order | One visible correction cannot prove crash-safe ordering at the dispatch seam |

---

## Resolved Design Decisions

### 1. Dependency Direction and Owned Symbols

Dependencies point inward: `index.ts` imports policy values and sensor operations; `sensors.ts` imports policy types only; `policy.ts` imports no runtime, filesystem, process, Fabric, or TUI module.

| Module | Owned exported symbols |
| --- | --- |
| `policy.ts` | `ChangeProfile`, `GovernorMode`, `RolloutLevel`, `PathRule`, `ContractCandidate`, `ConfirmedContract`, `AdmissionRequest`, `AdmissionDecision`, `ViolationCode`, `QualityVector`, `GateState`, `VerificationState`, `classifyRequest`, `parseContractCandidate`, `confirmContract`, `reviseContract`, `revokeContract`, `matchPathRule`, `decideAdmission`, `reduceQualityVector`, `selectGate`, `canDispatchRepair` |
| `sensors.ts` | `GovernorConfig`, `DiffEvidence`, `RepositoryFingerprint`, `CheckRecipe`, `CheckReceipt`, `canonicalizeTarget`, `loadGovernorConfig`, `collectDiffEvidence`, `fingerprintRepository`, `resolveCheckRecipe`, `runCheckRecipe`, `validateReceiptFreshness` |
| `index.ts` | Default extension registration only; runtime helpers remain private |

Use stable, behavior-oriented exports only. Do not add wrapper classes or one-implementation interfaces.

### 2. Contract and Confirmation State Machine

`ContractCandidate` is strict version 1 data with these fields:

- `version: 1`
- `goal`
- `profile`: `inspect | surgical | feature | refactor | boundary | visual`
- `initialMode`: `PLAN | BUILD | VERIFY`
- `ownedPaths`
- `expectedExistingFiles`
- `allowedNewFiles`
- `allowedDeletions`
- `allowedDependencies`, which must be empty in this MVP because Pi Core has no approved dependency manifest or dependency parser
- `allowedPublicApiChanges`
- `publicApiEvidence`: `not-required` or an approved check ID
- `architectureEvidence`: `not-required` or an approved check ID
- `nonGoals`
- `requiredChecks`
- `maxRepairs`, which must equal `1`

Every array is bounded, deduplicated, and contains non-empty bounded strings. Unknown versions, unknown fields, unsupported enums, unsupported wildcard syntax, duplicates that normalize to the same value, and over-limit values fail closed.

`quality_contract` has exactly four actions:

1. `propose` accepts a complete candidate when no contract is active. It validates, renders the full proposal, invokes `ctx.ui.confirm()`, and activates the next monotonic contract revision only after affirmation.
2. `expand` accepts a complete replacement candidate for an active contract. It renders old/new deltas, requires confirmation, rejects silent removal of existing permissions or required checks, increments the contract revision, and invalidates all receipts before activation.
3. `set_mode` changes only the runtime mode of an already confirmed contract. It cannot add scope. `GREEN` is unavailable outside `VERIFY`.
4. `revoke` removes authority, increments the contract revision, invalidates receipts, returns to `PLAN`, and leaves the gate `UNKNOWN`.

There is no separate approval action and `/quality` cannot approve or broaden scope. `/quality revoke` may only reduce authority. When `ctx.hasUI` is false, `propose` and `expand` return `QG-002 HEADLESS_CONFIRMATION_REQUIRED`, keep mutation disabled, and leave the candidate unconfirmed.

Classification and a uniquely running active version-2 task may populate proposal hints. No running task, multiple running tasks, free-form verification strings, or `.active` alone grants scope or chooses a check recipe.

### 3. Path Grammar and Canonicalization

Pure path rules accept only POSIX repository-relative exact paths or one terminal `/**` suffix. A prefix rule matches descendants beneath its prefix, not the prefix path itself. Reject empty paths, leading `/`, drive prefixes, backslashes, NUL, `.` or `..` segments, empty segments, trailing `/`, and every other wildcard form.

Before an admitted filesystem mutation:

- Resolve and `realpath()` the configured repository root.
- For an existing target, `realpath()` the target and prove it remains beneath the root.
- For a new target, require its direct parent to exist, `realpath()` that parent, and prove it remains beneath the root.
- Compare the normalized repository-relative target against the confirmed rules.
- Treat filesystem uncertainty, missing parents, and symlink escape as a hard block in every rollout level.

`edit` is always an existing-file mutation. `write` is classified from target existence and content shape. Empty replacement of an existing file is destructive and requires an exact `allowedDeletions` entry. Explicit rename/delete tools, unknown mutation tools, and unrestricted Bash are not admitted by this MVP.

### 4. Stable Violation Families and Rollout

Tests assert stable codes, not prose. Reserve these version-1 families:

| Code | Meaning |
| --- | --- |
| `QG-001` | No confirmed contract |
| `QG-002` | Interactive confirmation unavailable or declined |
| `QG-003` | Mode denies the requested effect |
| `QG-004` | Existing target is outside approved ownership |
| `QG-005` | New file is undeclared |
| `QG-006` | Destructive change is undeclared |
| `QG-007` | Dependency-file or dependency change is undeclared |
| `QG-008` | Protected policy/generated/runtime path |
| `QG-009` | Invalid, escaping, or unverifiable path |
| `QG-010` | Unsupported or unknown effect |
| `QG-011` | Required check is missing, unavailable, or failed |
| `QG-012` | Checker changed repository state |
| `QG-013` | Verification receipt is stale |
| `QG-014` | Provider, agent, external process, or other bypass is unknown |
| `QG-015` | Contract or configuration is invalid |
| `QG-016` | Automatic repair is ineligible or exhausted |

Unconfirmed authority, path escape, mode violations, undeclared destructive changes, dependency changes, and protected paths remain hard blocks in all rollout levels because higher project safety rules apply. Ordinary owned-path breadth and undeclared-file findings follow `observe`, `warn`, or `enforce`: observe records, warn records and emits concise feedback, and enforce blocks. Any recorded hard or rollout violation prevents `GREEN` even if execution was allowed for calibration.

### 5. Tool Frontiers and Fabric Full-Code Mode

Register `quality_contract`, `quality_status`, and `quality_check` once with strict raw JSON schemas so focused Node tests do not require an additional runtime schema package. Register `/quality` once. Reconcile a complete active set from the trusted configuration and `pi.getAllTools()`; never activate an unknown name.

| Mode | Top-level intent | Nested Pi/captured policy |
| --- | --- | --- |
| `PLAN` | Keep `fabric_exec`, governor contract/status, and any configured direct read/search tools that actually exist | Admit `read`, `grep`, `find`, and `ls`; deny mutations and checks that execute arbitrary recipes |
| `BUILD` | Keep `fabric_exec`, all governor tools, configured read/search tools, and direct `edit`/`write` only when present | Admit reads plus contract-approved `edit`/`write`; admit only configured `quality_check` recipes; deny unrestricted Bash |
| `VERIFY` | Keep `fabric_exec`, contract/status/check, diff inspection, and configured direct read/search tools | Admit reads and declared check execution; deny mutations |

In current Fabric full-code mode, core tools remain hidden at the parent and `fabric_exec` stays active. Replayed `pi.*` and captured extension calls are evaluated through their native lifecycle; the governor does not parse Fabric TypeScript source. A strict outer Fabric Trace V1 result is inspected for `agents.*`, MCP/provider, stateful extension, unknown, or external operations that were not proven through the native admission record. Such operations append bypass evidence, make affected dimensions `UNKNOWN`, and suppress `GREEN`; post-result observation does not pretend to undo an effect.

Capture the initial active-tool set after configuration/restoration and derive each complete frontier from trusted configured names plus governor tools. Never assume exclusive ownership of tool activation. On reload/tree restore, recompute from current inventory rather than replaying stale tool names.

### 6. Mutation Revisions, Diff Batches, and Receipts

Track pending admissions by `toolCallId`. A successful admitted mutation increments `mutationRevision` exactly once at `tool_execution_end` when `isError` is false, records the ID as completed, and invalidates every prior receipt. `tool_result` is used to inspect the outer Fabric Trace V1 and result evidence but never increments the same nested mutation again. Completion order is accepted; source order is never inferred.

At `turn_end`, if `mutationRevision` exceeds `analyzedRevision`, collect one bounded diff snapshot after all tool executions in that turn have settled, then set `analyzedRevision`. Explicit status and check requests may refresh evidence without changing a revision.

The repository fingerprint is a SHA-256 digest over a version tag, canonical root, current HEAD identity, normalized selected path set, NUL-safe Git status/name-status/numstat evidence, tracked diff bytes for governed paths, untracked path identities plus streamed content digests, and the trusted recipe/config digest. If configured bounds are exceeded, return unavailable evidence and `UNKNOWN`; never hash a truncated representation as if complete.

A check receipt binds:

- contract revision and mutation revision
- recipe ID plus recipe/config digest
- checked path set
- pre-check fingerprint
- post-check fingerprint
- executable, argv, repository-bounded cwd, timeout and accepted exit policy
- process exit/signal classification
- full stdout/stderr streaming digest plus bounded model-facing excerpts

Execute with Node child-process argv and `shell: false`; enforce timeout, cancellation, output-byte limits, and repository-bounded cwd. Retain complete output only up to the hard cap in an ephemeral in-memory receipt map, expose an opaque digest-based runtime reference to the human, and persist only the digest and bounded evidence. A non-accepted exit is `FAILED`; spawn/timeout/cap/fingerprint uncertainty is `UNKNOWN`; different pre/post fingerprints are `QG-012` and cannot produce a current receipt. Gate-time validation recomputes the relevant fingerprint and compares both revisions and recipe identity.

### 7. Quality Vector and Gate Reduction

The vector contains independent fields for scope, protected paths, new/deleted files, dependencies, public API, architecture, verification, diff, repair, bypasses, mode, contract revision, and mutation revision. Public API and architecture become `NOT_REQUIRED` only from the confirmed contract; otherwise a configured successful checker is required, and missing evidence is `UNKNOWN`.

Gate precedence is deterministic:

1. `RED` for a current hard failure.
2. `STALE` for a previously valid required receipt whose revisions or fingerprint no longer match.
3. `UNKNOWN` when any required dimension cannot be established or an unmediated bypass affects it.
4. `YELLOW` when hard requirements pass but mode is not `VERIFY`, rollout warnings remain, or optional human review is pending.
5. `GREEN` only in `VERIFY` when every required dimension is current and passing.

No weighted total, percentage, letter grade, or numeric quality score is computed.

### 8. Runtime Event Order and Output Channels

1. `session_start` and `session_tree`: load trusted config, clear transient pending calls, restore the latest matching versioned metadata from `getBranch()` with `getEntries()` only as compatibility fallback, reconcile tools, and render status.
2. External `input`: increment a pending-human-input marker only for interactive/RPC sources.
3. `before_agent_start`: on the next human turn, classify and inject one compact proposal/status packet; correction turns do not reset repair eligibility.
4. `tool_call`: classify direct or replayed effect, canonicalize mutation targets, store the admission record, and return the rollout decision before execution.
5. `tool_result`: clear non-mutation result state as appropriate and inspect strict outer Fabric traces for bypasses.
6. `tool_execution_end`: finalize admitted mutation state exactly once and invalidate receipts.
7. `turn_end`: refresh bounded diff evidence for an unanalyzed mutation batch.
8. `message_end`: only for assistant text with no tool-call blocks, perform gate-time freshness validation and append a concise `QUALITY_GATE` annotation when the state is not green.
9. `agent_settled`: refresh the final vector/HUD, persist metadata, and evaluate one bounded repair after checking pending messages and idle state.

`appendEntry()` stores only versioned enums, counts, revisions, recipe IDs, bounded paths, digests, and violation codes. It never stores prompts, full answers, tool arguments, logs, credentials, or hidden reasoning. `quality_status` returns a concise actionable packet to the model. `/quality` renders human detail with `setWidget()` or notification. `setStatus()` owns the compact footer. Only `sendMessage()` carries the bounded corrective packet into model context.

Persist the repair-attempted state before dispatch. Then call `sendMessage(..., { deliverAs: "followUp", triggerTurn: true })`. Pending input, non-idle state, ineligible failures, exhausted count, and dispatch failure all terminate automatic repair without a retry.

### 9. Trusted Configuration Version 1

`.pi/quality-governor.json` contains only:

- `version: 1`
- `enabled: true`
- `rollout: "observe"`
- `maxRepairs: 1`
- bounded path/string/output/timeout limits
- exact protected path rules for governor policy/config, project constitutional policy, generated output, and runtime-managed state
- exact dependency manifest/lockfile paths relevant to Pi Core
- per-mode top-level tool-name allowlists
- recipe objects with ID, version, executable, argv, cwd, timeout, output cap, accepted exits, checked paths, applicability, and resolved vector dimension

Initial recipes use only repository-supported Node and Git executables with explicit argv. Free-form task verification strings are never promoted to recipes. Strict parsing is all-or-nothing: unreadable JSON, unknown keys, unsupported version, duplicate IDs, escaping cwd/paths, unsupported executable policy, invalid bounds, or weakened invariant defaults fall back atomically to the built-in observe configuration and record `QG-015`.

---

## Derived Dependency Graph

> Wave labels are a derived snapshot of the current authoritative `tasks.json`. `/ship` must recompute the live frontier after each state transition.

```text
Task task-1: needs nothing; creates .pi/tests/quality-governor.test.ts; has_checkpoint=false
Task task-2: needs task-1 intentional-RED evidence; creates .pi/extensions/quality-governor/policy.ts; has_checkpoint=false
Task task-3: needs task-2 policy GREEN; creates .pi/extensions/quality-governor/sensors.ts and .pi/quality-governor.json; has_checkpoint=false
Task task-4: needs task-3 sensor/receipt GREEN; creates .pi/extensions/quality-governor/index.ts; has_checkpoint=false
Task task-5: needs task-4 focused runtime GREEN; creates verification and independent-review evidence only; has_checkpoint=false

Derived Wave 1: task-1
Derived Wave 2: task-2
Derived Wave 3: task-3
Derived Wave 4: task-4
Derived Wave 5: task-5
```

Parallel implementation is intentionally disabled. The shared test file and sequential policy → sensor → runtime contract make concurrent edits unsafe, and the checkout contains unrelated work that must remain untouched.

---

## Tasks

### Task 1 — Lock the Quality-Governor Behavioral Contract [test]

**End state:** One syntactically valid focused test file specifies the complete approved behavior and fails for the single expected reason that `policy.ts` does not yet exist.

**Metadata:**

```yaml
id: task-1
depends_on: []
parallel: false
conflicts_with: []
files: [".pi/tests/quality-governor.test.ts"]
needs: []
creates: [".pi/tests/quality-governor.test.ts"]
has_checkpoint: false
```

**Acceptance Criteria:**

```yaml
acceptance_criteria:
  - "Tests cover every profile, PLAN/BUILD/VERIFY, observe/warn/enforce, explicit contract confirmation, exact and trailing-/** paths, symlink/traversal rejection, new/deleted/dependency/protected paths, and stable violation codes."
  - "Tests cover direct and Fabric-replayed tool identities, unknown provider/agent bypasses, monotonic mutation and contract revisions, structured receipts, current/stale/failed/unknown verification, and vector-to-gate reduction without a scalar score."
  - "Fake-runtime tests cover terminal annotation, UI-only versus model-context output, active-branch restore, reverse completion order, pending/busy correction suppression, dispatch failure, and the one-repair ceiling."
  - "The focused run is intentionally RED only because policy.ts is absent; the test source and harness are otherwise valid."
verification:
  - "node --experimental-strip-types --check .pi/tests/quality-governor.test.ts"
  - "node --experimental-strip-types --test --test-name-pattern=\"quality governor\" .pi/tests/quality-governor.test.ts"
  - "git diff --check -- .pi/tests/quality-governor.test.ts"
```

**TDD Steps:**

1. Create `.pi/tests/quality-governor.test.ts` with `node:test`, strict assertions, a static value import from absent `policy.ts`, type-only policy imports, and a header documenting the intentional-RED contract. Expected: syntax checking succeeds even though execution cannot resolve the module.
2. Define strongly typed fixtures for contract candidates, confirmed revisions, admission requests, vectors, receipts, check recipes, text/tool-call messages, and strict Fabric Trace V1 envelopes. Expected: fixtures contain no raw secret/log persistence fields.
3. Build a fake extension API that records multiple lifecycle handlers, registered tools, registered commands, active-tool changes, UI notifications/status/widgets, appended entries, and sent messages. Expected: tool and command lookup failures produce clear assertions.
4. Add configurable fake context behavior for `hasUI`, confirmation result, idle state, pending messages, context usage, current cwd, all entries, and active-branch entries. Expected: branch and all-entry fixtures can intentionally disagree.
5. Add event helpers for `input`, `before_agent_start`, `tool_call`, `tool_result`, `tool_execution_end`, `turn_end`, `message_end`, `session_start`, `session_tree`, and `agent_settled`. Expected: two calls can complete in reverse order without changing issue order fixtures.
6. Add `quality governor policy` tests for all six profile classifications, mode validation, strict candidate fields, proposal-versus-confirmed authority, monotonic revisions, expand/revoke behavior, and headless/declined confirmation decisions. Expected: unsupported `ARCHITECTURE`, unknown fields, and invalid bounds fail closed.
7. Add pure path-rule tests for exact matches, descendant-only terminal `/**`, lexical traversal, absolute/drive/backslash forms, unsupported wildcards, duplicate normalization, and empty segments. Expected: every rejection maps to a stable code.
8. Add `quality governor admission` table tests for modes, rollout levels, existing/new/deleted/dependency/protected targets, zero-length writes, unrestricted Bash, unknown effects, and direct versus replayed tool identities. Expected: always-block and rollout-controlled decisions are distinct.
9. Add `quality governor vector` tests for gate precedence, required API/architecture unknowns, mode-dependent yellow state, stale receipts, bypasses, and absence of scalar-score fields or output text. Expected: only fully current VERIFY evidence reaches green.
10. Add `quality governor sensors` tests using temporary Git repositories and symlinks for canonical roots, existing targets, new-file parents, status parsing, changed-path and numstat evidence, untracked content changes, output bounds, and deterministic fingerprints. Import `sensors.ts` dynamically inside these tests.
11. Add `quality governor verification` tests with an injected process runner for accepted/non-accepted exits, timeout, cancellation, unknown recipe, escaping cwd, bounded excerpts/full digest, pre/post mismatch, checker mutation, and revision/fingerprint freshness. Expected: no failing or mutating check yields current evidence.
12. Add `quality governor routing` runtime tests for tool registration, complete PLAN/BUILD/VERIFY frontiers, direct calls, nested Pi/captured calls, outer Fabric bypass traces, confirmation, and exactly-once reverse-order mutation completion. Import `index.ts` dynamically inside runtime tests.
13. Add `quality governor status` and `quality governor persistence` tests for footer/vector fields, `/quality`, compact model status, full-log exclusion, metadata-only entries, session restore, and active-branch preference.
14. Add `quality governor correction` tests for terminal candidate detection, non-green annotation, current-fingerprint recheck, persist-before-send ordering, pending/busy suppression, dispatch failure, extension-originated input, and one repair per human turn.
15. Run the syntax and diff checks, then run the focused test. Expected: syntax and whitespace pass; execution fails with `ERR_MODULE_NOT_FOUND` naming `.pi/extensions/quality-governor/policy.ts`, with no harness syntax failure or unrelated test failure.

**Stop Conditions:** Stop if the test requires a sixth production/test helper file, a runtime dependency, an existing test modification, or behavior outside the approved spec. Preserve the intentional-RED evidence rather than weakening assertions.

---

### Task 2 — Implement Pure Contract and Gate Policy [feature]

**End state:** The dependency-free policy module makes all policy, admission, and vector tests green while sensor/runtime groups remain independently deferred.

**Metadata:**

```yaml
id: task-2
depends_on: ["task-1"]
parallel: false
conflicts_with: []
files: [".pi/extensions/quality-governor/policy.ts", ".pi/tests/quality-governor.test.ts"]
needs: ["task-1 intentional-RED evidence"]
creates: [".pi/extensions/quality-governor/policy.ts"]
has_checkpoint: false
```

**Acceptance Criteria:**

```yaml
acceptance_criteria:
  - "All policy functions are pure, dependency-free, fail closed on unknown versions, fields, and path forms, and distinguish suggestions from confirmed authority."
  - "Regression tests prove mutation requires canonical path-verification evidence and confirmed authority produced by the confirmation transition."
  - "Admission covers modes, rollout, ownership, declared new/deleted files, dependencies, protected paths, replayed identity, and unsupported effects with stable codes."
  - "Quality reduction emits independent dimensions and GREEN/YELLOW/RED/STALE/UNKNOWN without a scalar score."
  - "Repair eligibility allows at most one attempt and rejects non-repairable, busy, pending-input, and exhausted states."
verification:
  - "node --experimental-strip-types --test --test-name-pattern=\"quality governor policy|quality governor admission|quality governor vector\" .pi/tests/quality-governor.test.ts"
  - "node --experimental-strip-types --check .pi/extensions/quality-governor/policy.ts"
  - "git diff --check -- .pi/extensions/quality-governor/policy.ts .pi/tests/quality-governor.test.ts"
```

**TDD Steps:**

1. Add focused regressions for forged structural contracts and omitted canonical-path evidence. Expected: both fail against the reviewed attempt-1 policy before implementation changes.
2. Add public string-union types, strict version constants, bounded limits, vector types, and the `QG-001` through `QG-016` code table. Expected: no runtime imports and no catch-all public data shape.
3. Implement small record/string/array guards and strict key-set validation used by contract parsing. Expected: unknown or missing keys reject the whole candidate.
4. Implement `classifyRequest()` with explicit precedence: read-only inspection, visual work, boundary/API/schema work, refactor, narrow fix, then feature fallback. Expected: classification returns proposal metadata only.
5. Implement path-rule parsing and `matchPathRule()` with the resolved exact/descendant grammar. Expected: lexical invalidity fails before filesystem policy is consulted.
6. Implement `parseContractCandidate()` with bounded deduplication, cross-field checks, check-ID validation, `maxRepairs === 1`, and rejection of `ARCHITECTURE`. Expected: parser returns either a complete normalized candidate or one stable invalid-contract result.
7. Implement `confirmContract()`, `reviseContract()`, and `revokeContract()` as immutable monotonic transitions with non-structural in-process authority evidence. Expected: no function can infer or forge confirmation from classification, task metadata, or a plain deserialized object.
8. Implement tool/effect normalization for read, search, edit, write-existing, write-new, destructive-write, check, Bash, and unknown effects. Expected: replay source is evidence metadata, not a different policy path.
9. Implement `decideAdmission()` with mandatory canonical-path evidence, always-block safety, rollout-controlled findings, declared paths/dependencies, and actionable code/details. Expected: every mutation with missing or false path evidence returns `QG-009`; every branch returns a typed decision rather than throwing.
10. Implement `reduceQualityVector()` and `selectGate()` with the documented precedence and explicit `NOT_REQUIRED` handling. Expected: serialized output has no score-like aggregate.
11. Implement `canDispatchRepair()` from repairability, count, pending input, idle state, terminal candidate, and dispatch status. Expected: only one exact eligible combination returns true.
12. Run the focused policy/admission/vector command. Expected: selected groups pass with zero failures; sensor/runtime tests are skipped by name pattern rather than weakened.
13. Run syntax and diff checks, inspect the two-file scoped diff, and confirm no filesystem, child-process, Pi, or Fabric import entered `policy.ts`.

**Stop Conditions:** Stop on any need for runtime state, filesystem access, heuristic public-API passing, a scalar score, or a second policy module.

---

### Task 3 — Implement Bounded Sensors and Check Recipes [feature]

**End state:** Canonical repository evidence, strict trusted configuration, argv-only checks, and revision-bound receipts pass focused sensor and verification tests.

**Metadata:**

```yaml
id: task-3
depends_on: ["task-2"]
parallel: false
conflicts_with: []
files: [".pi/extensions/quality-governor/sensors.ts", ".pi/quality-governor.json", ".pi/tests/quality-governor.test.ts"]
needs: ["task-2 policy GREEN"]
creates: [".pi/extensions/quality-governor/sensors.ts", ".pi/quality-governor.json"]
has_checkpoint: false
```

**Acceptance Criteria:**

```yaml
acceptance_criteria:
  - "Existing targets and new-file parents are canonicalized beneath the repository root; absolute, traversal, unsupported wildcard, missing-parent, and symlink-escape inputs fail closed."
  - "Bounded argv-only Git evidence reports status, paths, line deltas, new/deleted files, scope locality, protected/dependency paths, and a deterministic relevant-state fingerprint."
  - "Check IDs resolve only from strict trusted configuration and execute with repository-bounded cwd, timeout, cancellation, output caps, accepted exits, and no shell interpretation."
  - "Injected runners cannot bypass canonical cwd resolution, and untracked content is revalidated before a fingerprint becomes current."
  - "Receipts bind contract/mutation revisions, fingerprints, paths, recipe identity, exit state, and full-output digest; mutation or mismatch cannot become current."
  - "Configuration defaults atomically to observe, one repair, protected governor/policy/runtime paths, no dependency permission, and repository-supported Node/Git recipes."
verification:
  - "node --experimental-strip-types --test --test-name-pattern=\"quality governor sensors|quality governor verification\" .pi/tests/quality-governor.test.ts"
  - "node --experimental-strip-types --check .pi/extensions/quality-governor/sensors.ts"
  - "git diff --check -- .pi/extensions/quality-governor/sensors.ts .pi/quality-governor.json .pi/tests/quality-governor.test.ts"
```

**TDD Steps:**

1. Define private filesystem/process operation types and production defaults using Node built-ins only. Expected: test injection does not become a new public framework.
2. Implement canonical root discovery and `canonicalizeTarget()` for existing targets and existing direct parents of new targets. Expected: containment uses `relative()` boundary checks after `realpath()`, not string-prefix comparison.
3. Implement an argv-only child runner using `spawn(executable, argv, { cwd, shell: false })`, streaming SHA-256 over stdout/stderr while retaining only bounded head/tail excerpts. Expected: timeout, abort, spawn error, signal, exit code, and output overflow are distinct typed outcomes.
4. Add strict built-in configuration defaults and `loadGovernorConfig()` using the trusted-project check and dynamic `CONFIG_DIR_NAME` fallback pattern from research-enforcement. Expected: an untrusted or malformed project file cannot weaken invariants.
5. Parse version-1 configuration with exact keys, unique tool/check IDs, bounded values, repository-contained cwd/paths, accepted exits, and approved executable names. Expected: one invalid field causes atomic fallback plus invalid-config evidence.
6. Implement NUL-safe Git command helpers and parsers for HEAD, status, name-status, numstat, tracked diffs, and untracked paths. Expected: rename/delete/new statuses and unusual safe filenames are not split on whitespace.
7. Implement `collectDiffEvidence()` to normalize touched/new/deleted paths, additions/deletions, out-of-scope paths, protected/dependency hits, and unavailable dimensions. Expected: untracked line counts are bounded or explicitly unknown.
8. Implement `fingerprintRepository()` over the versioned components defined above, streaming and revalidating untracked content digests before returning, and refusing completeness when limits are exceeded. Expected: editing an already-modified or untracked file changes the fingerprint even when porcelain status letters do not; a change during capture returns `UNKNOWN`.
9. Implement exact recipe lookup and applicability checks. Expected: free-form verification strings, unknown IDs, escaping paths, and disallowed executable/cwd combinations never execute.
10. Implement `runCheckRecipe()` with canonical repository-bounded cwd for production and injected runners, pre-snapshot, argv execution, accepted-exit evaluation, post-snapshot, mutation detection, bounded excerpts, and full-output digest. Expected: a missing runner root cannot execute, and a checker that writes a file returns `QG-012` with no current receipt.
11. Implement receipt construction and `validateReceiptFreshness()` against current contract revision, mutation revision, recipe/config digest, checked paths, and fingerprint. Expected: every mismatch chooses stale or unknown deterministically.
12. Write `.pi/quality-governor.json` with observe defaults, one repair, exact protected/dependency paths, per-mode tool allowlists, and only explicit Node/Git recipes supported by this repository. Expected: no shell syntax, wildcard argv expansion, manifest, or external dependency.
13. Run sensor/verification tests. Expected: selected groups pass with zero failures, including real temporary-repository symlink and drift cases.
14. Run syntax/diff checks and inspect both owned paths for full-log persistence, unbounded reads, shell command strings, or guessed API/architecture passes.

**Stop Conditions:** Stop if safe execution needs arbitrary shell parsing, an external package, a missing parent-directory creation feature, or a fingerprint that silently treats truncated evidence as complete.

---

### Task 4 — Wire the Pi Control Loop and Quality HUD [feature]

**End state:** The project-local extension integrates all confirmed policy and sensor behavior through documented Pi lifecycle, tool, persistence, and UI APIs, and every focused governor test is green.

**Metadata:**

```yaml
id: task-4
depends_on: ["task-3"]
parallel: false
conflicts_with: []
files: [".pi/extensions/quality-governor/index.ts", ".pi/tests/quality-governor.test.ts"]
needs: ["task-3 sensor and receipt GREEN"]
creates: [".pi/extensions/quality-governor/index.ts"]
has_checkpoint: false
```

**Acceptance Criteria:**

```yaml
acceptance_criteria:
  - "Trusted configuration loads on session start, versioned metadata restores from the active branch, and transitions are idempotent under reverse parallel completion order."
  - "Human turns receive one compact proposal packet; only confirmed contracts select mutation frontiers and gate direct or Fabric-replayed actions before execution."
  - "Runtime mutation fixtures use real canonical roots and existing parents so fail-closed path evidence is exercised without a lexical fallback."
  - "Successful observed mutations invalidate receipts, settled mutation batches refresh bounded diff evidence, and unknown provider/agent effects suppress green."
  - "Governor tools and /quality provide confirmation, declared checks, compact model status, and detailed human status without full logs or secrets."
  - "Footer and terminal annotation expose rollout, mode, vector/gate, freshness, context usage when available, repair count, and bypasses."
  - "agent_settled dispatches at most one concise repair only when idle with no pending message, preserving persist-before-send ordering."
verification:
  - "node --experimental-strip-types --test --test-name-pattern=\"quality governor routing|quality governor status|quality governor persistence|quality governor correction\" .pi/tests/quality-governor.test.ts"
  - "node --experimental-strip-types --check .pi/extensions/quality-governor/index.ts"
  - "git diff --check -- .pi/extensions/quality-governor/index.ts .pi/tests/quality-governor.test.ts"
```

**TDD Steps:**

1. Update mutation-capable fake-runtime fixtures to use temporary canonical roots with existing targets/parents. Expected: path verification remains fail-closed and no lexical test fallback is needed.
2. Define the private runtime state with config, pending human inputs, proposal, confirmed contract, mode, monotonic revisions, pending/completed calls, diff evidence, receipts, bypasses, terminal-candidate state, and repair status. Expected: persisted and transient fields are visibly separated.
3. Implement metadata shaping/restoration with a versioned custom entry type, active-branch preference, strict enums/bounds, and no raw prompts/logs. Expected: restoration cannot dispatch or restore pending tool calls.
4. Register `quality_contract`, `quality_status`, and `quality_check` with strict plain JSON schemas and register `/quality`. Expected: no runtime schema/TUI package import is added.
5. Wire `session_start` and `session_tree` to reload trusted config, clear transient correlation state, restore metadata, reconcile the current tool inventory, and render the HUD. Expected: stale tool names from a previous branch are not activated.
6. Wire external `input` and `before_agent_start` to distinguish human from extension turns, classify only human requests, read only a uniquely running task as advisory metadata, and inject one compact proposal/status message. Expected: no contract is confirmed by this path.
7. Implement `quality_contract propose` with complete candidate parsing, human-readable full scope, `hasUI` guard, confirmation, monotonic activation, persistence, frontier reconciliation, and receipt invalidation. Expected: decline/headless paths remain PLAN/UNKNOWN.
8. Implement `expand`, `set_mode`, and `revoke` exactly as resolved. Expected: expansion requires confirmation, mode changes cannot alter scope, revoke cannot be used to approve a replacement.
9. Implement complete per-mode active-tool reconciliation from configured names intersected with current inventory, preserving `fabric_exec` in full-code mode and keeping governor access available directly or as a captured tool. Expected: unrestricted Bash is never added.
10. Wire `tool_call` to normalize direct/replayed identity, classify effect, canonicalize mutation targets, call pure admission, record pending state, and return block/reason in enforce or always-block cases. Expected: one call ID has one immutable admission record.
11. Wire `tool_result` to clear completed read/check correlations and strictly inspect outer Fabric Trace V1 operations for unproven agents/providers/extensions/external calls. Expected: malformed traces add unknown evidence rather than being reinterpreted.
12. Wire `tool_execution_end` to increment the mutation revision exactly once for each successful admitted mutation regardless of completion order, invalidate receipts, and mark diff evidence unanalyzed. Expected: duplicate end/result events are idempotent.
13. Wire `turn_end` and explicit refresh paths to run bounded diff sensors only when needed and apply results only if the captured contract/mutation revision is still current. Expected: a slower old sensor result cannot overwrite newer state.
14. Implement `quality_check` to authorize a declared recipe, run it through sensors, validate pre/post state, bind or reject the receipt, update vector/HUD, and return a concise bounded result with a runtime reference for omitted output. Expected: no arbitrary command parameters enter the tool schema.
15. Implement `quality_status` as a model-facing compact vector/next-action response and `/quality` as a human detail/revoke command using widget or notification. Expected: `/quality` has no approve/expand path.
16. Implement one `renderStatus()` path shared by footer, detail view, persisted metadata, and compact packets; include context tokens only when `getContextUsage()` returns them. Expected: outputs agree on gate/mode/revisions and omit scalar scores.
17. Wire assistant `message_end` terminal-candidate handling to reject tool-call messages, revalidate freshness, preserve original text blocks, and append a concise non-green `QUALITY_GATE` annotation. Expected: successful tool-call preludes are not misidentified as terminal answers.
18. Wire `agent_settled` to refresh final evidence/HUD, persist state, and evaluate repair only after pending-message and idle checks. Persist attempted status before sending one follow-up; record dispatch failure without retry.
19. Run routing/status/persistence/correction groups. Expected: all selected runtime tests pass, including direct/captured paths, full-code frontier behavior, reverse completion, branch restore, annotation, and one-repair races.
20. Run syntax/diff checks, inspect the scoped runtime/test diff, and confirm `research-enforcement`, Fabric config, lifecycle tasks, and unrelated runtime state were not modified.

**Stop Conditions:** Stop if full-code Fabric behavior cannot be verified through native lifecycle, another extension changes the owned active-tool frontier concurrently, terminal annotation would rewrite non-text content, or a sixth helper file becomes necessary. Record the limitation rather than claiming containment.

---

### Task 5 — Verify the Integrated Governor [verify]

**End state:** Focused and retained tests, every task graph, active-pointer read-only proof, exact file boundary, scoped diff quality, and independent review all pass with current evidence.

**Metadata:**

```yaml
id: task-5
depends_on: ["task-4"]
parallel: false
conflicts_with: []
files: []
needs: ["task-4 focused governor GREEN"]
creates: ["current verification and review evidence in progress.md"]
has_checkpoint: false
```

**Acceptance Criteria:**

```yaml
acceptance_criteria:
  - "All focused quality-governor tests and the complete retained suite pass with zero failures."
  - "Every artifact graph validates and cross-artifact frontier reporting leaves .active byte-identical."
  - "The feature-owned implementation layout contains exactly the five declared paths, and scoped status attributes no extra path to this feature."
  - "No file is deleted; no dependency, manifest, lockfile, scalar score, unlimited repair, architecture mode, or hidden sandbox claim is added."
  - "One parent-run independent read-only review records severity-ranked path-and-line evidence for the current attempt and leaves no unresolved critical or important finding."
verification:
  - "node --experimental-strip-types --test .pi/tests/*.test.ts"
  - "for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate \"$f\"; done"
  - "before=$(sha256sum .pi/artifacts/.active); node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null; test \"$before\" = \"$(sha256sum .pi/artifacts/.active)\""
  - "node --experimental-strip-types -e 'const fs=require(\"node:fs\"); const expected=[\".pi/extensions/quality-governor/index.ts\",\".pi/extensions/quality-governor/policy.ts\",\".pi/extensions/quality-governor/sensors.ts\",\".pi/quality-governor.json\",\".pi/tests/quality-governor.test.ts\"]; for (const path of expected) if (!fs.statSync(path).isFile()) throw new Error(\"missing file: \"+path); const actual=fs.readdirSync(\".pi/extensions/quality-governor\").sort(); const wanted=[\"index.ts\",\"policy.ts\",\"sensors.ts\"]; if (JSON.stringify(actual)!==JSON.stringify(wanted)) throw new Error(\"unexpected extension layout: \"+actual.join(\",\")); console.log(expected.join(\"\\n\"));'"
  - "git status --short --untracked-files=all -- .pi/extensions/quality-governor .pi/quality-governor.json .pi/tests/quality-governor.test.ts"
  - "git diff --check -- .pi/extensions/quality-governor/policy.ts .pi/extensions/quality-governor/sensors.ts .pi/extensions/quality-governor/index.ts .pi/quality-governor.json .pi/tests/quality-governor.test.ts"
```

**Verification Steps:**

1. Run every focused group and all three syntax checks first. Expected: zero failures and no skipped required group.
2. Run the complete retained suite. Expected: all tests pass; record command, exit status, pass/fail counts, and duration for the current attempt.
3. Validate every artifact graph. Expected: every command exits zero with no machine-readable issues.
4. Hash `.pi/artifacts/.active`, run cross-artifact frontier reporting, and compare the hash. Expected: byte-identical active pointer.
5. Run the exact-layout command and scoped status command. Expected: exactly three files under the extension directory plus the one config and one test; no additional feature-owned path.
6. Inspect scoped status and diffs for deletions, manifests/lockfiles, generated/runtime paths, unrelated formatting, public-surface expansion beyond the registered tools/command, and stale verification. Expected: none attributable to this feature.
7. Run the constitutional fixed-string scan over `plan.md` and implementation-owned files, then inspect any match in context. Expected: no critical Git/destructive bypass instruction and no unapproved dependency command.
8. Dispatch one foreground read-only reviewer with `read`, `grep`, `find`, and `ls`, supplying the spec, plan, canonical task, current-attempt evidence, scoped diff/status, and five implementation files. Expected: severity-ranked findings with exact paths/lines and no mutation.
9. Validate reviewer findings directly, resolve any critical/important issue through a new attributed attempt, rerun affected checks, and record the final review at `progress.md#evidence-task-5-attempt-<n>`. Expected: no unresolved critical or important correctness, security, regression, or scope finding.
10. Recheck owned-path hashes/status after review and report branch, HEAD, active slug, unrelated dirty paths, verification evidence, mediated-path limitations, and remaining risks. Expected: no unapproved commit, push, merge, deletion, or task-graph drift.

**Stop Conditions:** Stop on active-slug drift, overlapping concurrent edits to an owned path, missing review evidence, contradictory verification, unexpected extra files, any deletion, or a required checker that cannot run. Do not broaden scope to make verification pass.

---

## Test Group Progression

| Canonical task | Test import strategy | Required state |
| --- | --- | --- |
| `task-1` | Static policy import; dynamic sensor/runtime imports inside their tests | Intentional RED: only absent `policy.ts` |
| `task-2` | Static policy import resolves; unmatched dynamic groups do not execute | Policy/admission/vector GREEN |
| `task-3` | Dynamic sensor import resolves for selected groups | Policy + sensors + verification GREEN |
| `task-4` | Dynamic runtime import resolves for selected groups | Every focused quality-governor group GREEN |
| `task-5` | All imports and full suite | Integrated GREEN plus current review |

An intentional RED is passing evidence for `task-1` only when syntax and diff checks pass and the sole runtime failure is the expected absent module. Later tasks never accept a red verification state.

## Risks and Mitigations by Slice

| Task | Primary risk | Required mitigation |
| --- | --- | --- |
| `task-1` | One giant test file becomes an unmaintainable mock framework | Keep fixture builders local, behavior-oriented, grouped by canonical verification names, and avoid production-only test APIs |
| `task-2` | Classifier or task hints become authority | Keep confirmation state explicit and every policy function pure |
| `task-3` | Fingerprint/output bounds create false freshness | Return `UNKNOWN` on incomplete evidence and digest full streams before truncating excerpts |
| `task-4` | Parallel events, Fabric capture, or tool-frontier ownership cause gaps | Correlate by ID/revision, preserve Fabric full-code access, report unknown bypasses, and stop on overlapping frontier mutation |
| `task-5` | Passing tests mask scope drift or stale evidence | Prove exact layout, active-pointer immutability, current receipts, and independent review |

## Open Questions

None block implementation. The MVP deliberately leaves delegated-worker authorization, generic provider containment, OS isolation, architecture mode, public-API parsing, complexity/duplication scoring, visual automation, adaptive routing, and persistent learning for separate specifications.

## Planning Evidence

- Git history precedent: `06a3dc4` added research-enforcement, `53fa293` migrated orchestration to Fabric, and `6c91751` enforced executable task contracts.
- Local implementation precedent: `.pi/extensions/research-enforcement/{policy,index}.ts` and `.pi/tests/research-enforcement.test.ts`.
- Installed Pi contracts: `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/{extensions,tui}.md`.
- Fabric mediation contracts: `/home/ryan/.pi/agent/npm/node_modules/pi-fabric/docs/{architecture,configuration,audit-trace}.md`.
- Deep external evidence and citations remain in `spec.md`; planning introduced no new external claim or dependency.
- One bounded local-discovery worker and one bounded planning-advisory worker independently found the five-file/five-task structure sufficient. The parent resolved the advisor's proposed separate approval action in favor of the specification's authoritative `propose`/`expand` confirmation semantics.

## Handoff

The live frontier must be recomputed from `.pi/artifacts/quality-governor/tasks.json`. At plan creation, the expected ready node is `task-1`; `task-2` through `task-5` remain dependency-blocked. `/ship` must keep `.pi/artifacts/.active` set to `quality-governor`, execute one task at a time, and preserve unrelated work.
