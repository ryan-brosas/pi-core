# Quality Governor MVP for Pi Core

- **Created:** 2026-07-26
- **Status:** Approved for implementation
- **Tracking:** Project artifact graph
- **Research depth:** Deep local discovery plus Context7, Exa, and Codex Search cross-checks
- **Implementation boundary:** A bounded, same-trust control loop around Pi-mediated coding actions; not an operating-system sandbox

## Problem Statement

### What problem are we solving?

Pi Core has strong written engineering rules and an existing `research-enforcement` extension that proves classification, evidence observation, persisted state, final-response validation, and one bounded correction can be implemented around a black-box model. Coding-quality rules, however, are still mostly prose. A model can silently broaden scope, create undeclared files, mutate protected policy, add infrastructure, or claim completion after stale verification unless a human notices.

The missing capability is a small runtime governor that turns a task-specific change contract into observable admission decisions, diff evidence, verification freshness, and an explicit quality vector. It must make objective violations hard to hide without pretending that Pi can change model weights, prove semantic correctness, or sandbox every process.

### Why now?

The repository already contains the necessary precedents: version-2 task contracts, a dependency-free research policy module, Pi lifecycle hooks, nested Fabric replay for Pi and captured tools, and prior architecture research recommending a narrow `plan`/`build`/`verify` controller. Implementing that smallest honest slice now converts existing policy into runtime evidence without expanding into the broader strict-lifecycle architecture.

### Who is affected?

- **Primary users:** Developers and coding agents implementing bounded changes through Pi Core.
- **Secondary users:** Maintainers reviewing scope, public-contract, dependency, and verification evidence.

## Goals

1. Classify each human task into a change-risk profile and produce a compact, inspectable contract proposal.
2. Require explicit human approval before a proposed contract authorizes mutation or scope expansion.
3. Route tools by `PLAN`, `BUILD`, and `VERIFY` mode and gate direct or nested Pi/captured mutation calls against approved paths.
4. Compute a non-scalar quality vector from current diff, contract, check, and freshness evidence.
5. Refuse a green receipt when hard evidence fails, is stale, or is unavailable; make that state visible in both the TUI and terminal response.
6. Run only declared, structured check recipes and allow at most one automatic repair follow-up.
7. Keep policy deterministic, dependency-free, unit-testable, and separate from Pi runtime wiring.

## Scope

### In Scope

- A project-local `quality-governor` extension with pure policy, deterministic repository sensors, and thin runtime integration.
- Change profiles: `inspect`, `surgical`, `feature`, `refactor`, `boundary`, and `visual`.
- Runtime modes: `PLAN`, `BUILD`, and `VERIFY`; `ARCHITECTURE` remains reserved and unavailable in this version.
- Enforcement levels: `observe`, `warn`, and `enforce`, defaulting to `observe` for calibration.
- A versioned session contract containing the goal, profile, mode, owned path rules, expected existing files, allowed new files, allowed deletions, dependency permissions, public-contract permissions, non-goals, required check IDs, and one-repair limit.
- Contract proposals derived from the user request and, when present, active version-2 task metadata; task metadata is advisory input rather than proof that the session owns the task.
- Explicit contract confirmation before mutation; a scope expansion creates a new contract revision and invalidates prior verification.
- Exact repository-relative paths plus a dependency-free trailing-`/**` prefix form. Absolute paths, traversal, symlink escapes, and other wildcard syntax fail closed.
- Admission gates for direct tools and Fabric-replayed nested Pi/captured tools.
- Read-only planning, bounded build mutations, and verification-only tool frontiers.
- Protected policy/generated/runtime paths, undeclared file creation, zero-length destructive writes, explicit delete/rename operations, and manifest/lockfile changes.
- Git-backed changed-file, new/deleted-file, line-delta, scope-locality, dependency-file, and protected-path sensors.
- Checker-backed public API and architecture dimensions. If no approved checker can establish a dimension, it is `UNKNOWN`, never silently `PASS`.
- Structured no-shell check recipes selected by ID from trusted project configuration, with bounded cwd, timeout, output, exit codes, and revision binding.
- Verification invalidation after every observed successful mutation and after any gate-time repository fingerprint change.
- Gate states `GREEN`, `YELLOW`, `RED`, `STALE`, and `UNKNOWN`.
- A compact footer status, `/quality` detail command, model-facing `quality_status`, metadata-only session persistence, terminal gate annotation, and one bounded corrective follow-up.
- Tests for pure decisions and a fake Pi runtime harness modeled on `research-enforcement` tests.

### Out of Scope

- Changing model weights, exposing hidden reasoning, or using an LLM judge as the sole gate.
- A scalar anti-slop score, universal LOC/file limits, or automatic rejection from subjective complexity signals.
- A universal TypeScript or cross-language parser, built-in complexity/duplication engine, or speculative abstraction detector.
- Automatic task ownership inference from `.active`, a second task database, or delegated-worker identity/authorization.
- Guaranteed pre-dispatch control over `agents.run`, provider internals, extension-owned `pi.exec`, arbitrary Node filesystem calls, user shell commands, or external processes.
- OS-level containment; untrusted unattended execution still requires a container, VM, or equivalent boundary.
- `ARCHITECTURE` mode, policy exception creation, automatic baseline expansion, or self-modifying governance.
- Screenshot comparison, vision review, browser automation, or accessibility execution; a `visual` profile may require project-declared recipes but has no bespoke visual subsystem.
- Persistent learning, cross-run optimization, model routing, benchmark automation, or telemetry beyond current-session metadata.
- Commit, merge, push, deployment, or modification of lifecycle task state.
- New package manifests, lockfiles, dependencies, skills, agents, or broad changes to `AGENTS.md`.

## Proposed Solution

### Overview

Create a dependency-free policy core, a repository/check sensor module, a thin Pi extension adapter, one trusted configuration file, and one focused test file. The extension classifies a human turn and may use the active task graph to suggest a contract, but no suggestion authorizes mutation. The model submits a structured contract proposal through a governor tool; an interactive or RPC user confirms it. In headless mode, absent approval leaves the governor read-only and `UNKNOWN`.

Once approved, the mode router exposes the smallest useful top-level tool set and the admission policy independently evaluates direct and Fabric-replayed nested calls. `PLAN` permits inspection only. `BUILD` permits only approved `edit`/`write` targets and governor-controlled checks; unrestricted shell mutation is unavailable. `VERIFY` permits inspection, declared checks, and status tools but no mutation.

After an admitted mutation succeeds, the extension increments an observed mutation revision and invalidates every prior receipt. At the end of a mutating turn it reads bounded Git evidence and updates a quality vector. Declared checks run through a no-shell recipe runner and bind their result to the contract revision, mutation revision, checked paths, and repository fingerprint. A gate-time mismatch makes the receipt stale.

A terminal answer never receives a green receipt unless every required hard dimension is current and passing. Non-green terminal answers are visibly annotated. When the failure is actionable and no user input is pending, `agent_settled` may enqueue one concise repair message. No second automatic repair is permitted.

### Contract Authority and Trust Boundary

- User approval, not classification, grants scope.
- The custom `quality_contract` tool is the sole contract activation seam. Its `propose` and `expand` actions validate the candidate, render the contract delta, and call `ctx.ui.confirm()`; only an affirmative result persists and activates the new revision.
- TUI and RPC modes use that confirmation dialog. When `ctx.hasUI` is false, activation returns a stable unconfirmed-contract violation, leaves mutation disabled, and keeps the gate `UNKNOWN`. The `/quality` command may inspect or revoke state but cannot bypass confirmation.
- Active `tasks.json` fields may populate a proposal but do not prove task ownership or caller identity.
- Project configuration is read only for trusted projects and is itself protected during ordinary governed work.
- The hard guarantee covers actions that reach Pi's documented `tool_call` seam, including Fabric-replayed Pi and captured tools.
- Post-execution observations cannot undo a mutation. Unknown provider or child-agent effects force `UNKNOWN` or `STALE` and suppress a green receipt.
- Same-process receipts are freshness evidence for the observed repository state, not cryptographic attestation or protection against privileged tampering.

### Quality Vector

The detailed status reports independent dimensions rather than a score:

| Dimension | Values and evidence |
| --- | --- |
| Scope | `PASS`, `FAIL`, `UNKNOWN`; admitted and changed paths against approved ownership |
| Protected paths | `PASS`, `FAIL`; blocked or observed protected mutations |
| New/deleted files | Counts plus declared/undeclared state |
| Dependencies | `UNCHANGED`, `CHANGED`, `UNKNOWN`; configured manifests and lockfiles |
| Public API | `UNCHANGED`, `CHANGED`, `NOT_REQUIRED`, `UNKNOWN`; approved checker or explicit contract evidence only |
| Architecture | `PASS`, `FAIL`, `NOT_REQUIRED`, `UNKNOWN`; approved checker only |
| Verification | `CURRENT`, `STALE`, `FAILED`, `UNKNOWN`; required recipe receipts bound to current revisions |
| Diff | touched files, additions, deletions, and out-of-scope paths |
| Repair | `0/1` or `1/1` |
| Gate | `GREEN`, `YELLOW`, `RED`, `STALE`, or `UNKNOWN` |

`GREEN` requires all required hard dimensions to pass at the current contract and mutation revisions. `YELLOW` means no hard failure but advisory or explicitly optional review remains. `RED` means a hard contract failed. `STALE` means repository or mutation state changed after verification. `UNKNOWN` means a required sensor/check could not establish its result.

## Requirements

### Functional Requirements

#### FR-1: Deterministic Classification and Explicit Contract Approval

- **WHEN** a new external user or RPC turn begins **THEN** the pure classifier assigns one supported profile and produces a compact proposal without granting mutation rights.
- **WHEN** active version-2 task metadata is available **THEN** its goal, files, acceptance criteria, and verification strings may inform the proposal, but free-form verification strings are never executed automatically.
- **WHEN** the model calls `quality_contract` with `propose` or `expand` **THEN** the extension validates the complete candidate, displays its delta through `ctx.ui.confirm()`, and activates it only after an affirmative TUI or RPC response.
- **WHEN** confirmation is declined, no confirmed contract exists, or `ctx.hasUI` is false **THEN** the tool returns a stable unconfirmed-contract violation, mutation remains blocked, and the gate is `UNKNOWN`.
- **WHEN** `quality_contract` revokes a contract **THEN** the extension returns to read-only unknown state and invalidates every receipt from the revoked revision.

#### FR-2: Mode-Specific Tool and Action Routing

- **WHEN** mode is `PLAN` **THEN** only read/search, contract, and status capabilities are admitted.
- **WHEN** mode is `BUILD` **THEN** read/search plus approved file mutations and declared check tools are admitted; unrestricted Bash and unknown mutation tools are denied.
- **WHEN** mode is `VERIFY` **THEN** mutations are denied and only read/search, declared checks, diff inspection, and status are admitted.
- **WHEN** Pi Fabric replays a nested Pi or captured tool lifecycle **THEN** the same admission decision applies using its unambiguous nested call identity.
- **WHEN** an effect cannot be preflighted through this seam **THEN** the extension records the bypass, marks the affected dimensions `UNKNOWN`, and refuses `GREEN`.

#### FR-3: Scope, File, Dependency, and Policy Gates

- **WHEN** an existing mutation target is outside approved ownership or resolves outside the repository **THEN** enforce mode blocks it with a stable violation code and actionable reason.
- **WHEN** a target does not exist **THEN** it is allowed only when its normalized path appears in `allowedNewFiles`.
- **WHEN** a delete, rename, zero-length destructive write, configured manifest/lockfile mutation, or protected-path mutation lacks explicit contract permission **THEN** it is blocked.
- **WHEN** observe or warn mode detects the same condition **THEN** execution follows the configured rollout behavior, but the violation remains visible and cannot yield `GREEN`.
- **WHEN** policy configuration or governor source is being maintained **THEN** ordinary implementation contracts cannot authorize it implicitly; a separate explicit user authorization is required.

#### FR-4: Diff Sensors and Non-Scalar Quality State

- **WHEN** a meaningful mutation batch completes **THEN** bounded no-shell Git commands calculate changed paths, status, additions/deletions, new/deleted files, scope locality, protected paths, and dependency-file deltas.
- **WHEN** public API or architecture evidence is required **THEN** only a configured checker or explicit `NOT_REQUIRED` contract decision may resolve the dimension; heuristics do not fabricate a pass.
- **WHEN** sensor output exceeds Pi limits **THEN** model-facing output is truncated and the complete runtime output is referenced outside model context.
- **WHEN** status is rendered **THEN** no scalar quality score is produced.

#### FR-5: Structured Verification and Freshness

- **WHEN** a check is requested **THEN** its ID must resolve to a trusted recipe with an executable and argv, repository-bounded cwd, timeout, output cap, accepted exits, and applicability metadata.
- **WHEN** a check completes **THEN** its receipt binds the contract revision, observed mutation revision, checked paths, repository fingerprint, recipe identity, exit state, and bounded output digest.
- **WHEN** any successful observed mutation or gate-time fingerprint change occurs after a receipt **THEN** verification becomes `STALE`.
- **WHEN** a required recipe fails, cannot run, or is missing **THEN** the gate is `RED` or `UNKNOWN`, never `GREEN`.
- **WHEN** a checker changes the governed repository state **THEN** its receipt is rejected and verification remains stale.

#### FR-6: Dual-Channel Status, Persistence, and Bounded Repair

- **WHEN** governor state changes **THEN** a compact footer displays mode, gate, diff counts, file scope, dependency/API deltas, verification freshness, context usage when available, and repair count.
- **WHEN** `/quality` or `quality_status` is requested **THEN** it returns the current quality vector, stable violation codes, bypasses, and next required action without dumping full logs.
- **WHEN** state is persisted **THEN** `appendEntry()` stores versioned metadata only and restoration reads the active session branch on start/tree navigation.
- **WHEN** concise corrective feedback is needed **THEN** `sendMessage()` receives only actionable failures; UI-only history remains outside model context.
- **WHEN** a non-green terminal answer is produced **THEN** the visible response is annotated with gate state and evidence gap.
- **WHEN** the agent is idle, no user message is pending, and the failure is repairable **THEN** at most one follow-up repair turn is dispatched; otherwise the extension stops and reports the remaining state.

### Non-Functional Requirements

- **Dependency discipline:** Use Node.js and installed Pi APIs only; do not add a manifest, lockfile, or dependency.
- **Determinism:** Policy, contract parsing, path decisions, vector reduction, gate selection, and correction eligibility are pure and unit-testable.
- **Safety:** Normalize repository-relative paths, canonicalize existing targets and new-file parents, reject traversal/symlink escape, and use no-shell process execution.
- **Concurrency:** Never assume sibling tool results complete in source order; state transitions are idempotent and keyed by tool-call ID/revision.
- **Performance:** Run diff sensors only after observed mutation batches or explicit status/verification requests; cap process time and output.
- **Privacy:** Persist counters, revisions, statuses, recipe IDs, and bounded path evidence only—never prompts, credentials, full logs, or model reasoning.
- **Compatibility:** Preserve Pi Core's existing `research-enforcement` behavior, version-1 task readability, version-2 graph semantics, and current test suite.
- **Honesty:** Documentation and UI explicitly state mediated-path and same-trust limitations.

## Success Criteria

- [ ] Pure tests prove classification, contract validation, path grammar, scope decisions, quality-vector reduction, gate states, freshness, and one-repair eligibility.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="quality governor policy" .pi/tests/quality-governor.test.ts`
- [ ] Existing files outside approved ownership, undeclared new files, unapproved deletions, dependency files, and protected paths produce stable preflight violations in enforce mode.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="quality governor admission" .pi/tests/quality-governor.test.ts`
- [ ] `PLAN`, `BUILD`, and `VERIFY` admit only their declared action frontier for direct and Fabric-replayed nested Pi/captured calls.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="quality governor routing" .pi/tests/quality-governor.test.ts`
- [ ] Structured check receipts become current only for the matching contract/mutation/fingerprint and become stale after any later observed mutation or repository mismatch.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="quality governor verification" .pi/tests/quality-governor.test.ts`
- [ ] Public API and architecture dimensions remain `UNKNOWN` without approved evidence and block a green receipt when required.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="quality governor vector" .pi/tests/quality-governor.test.ts`
- [ ] Footer/detail/model outputs expose a vector and explicit bypasses without a scalar score or full-log context dump.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="quality governor status" .pi/tests/quality-governor.test.ts`
- [ ] A non-green terminal answer is visibly annotated and dispatches no more than one corrective follow-up, with pending-input/busy/dispatch-failure cases safely terminating.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="quality governor correction" .pi/tests/quality-governor.test.ts`
- [ ] Session start and tree navigation restore only versioned metadata from the active branch.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="quality governor persistence" .pi/tests/quality-governor.test.ts`
- [ ] The extension and configuration add no package manifest, lockfile, dependency, skill, agent, or modification to `research-enforcement`.
  - Verify: `git diff --name-only -- .pi/extensions/quality-governor .pi/quality-governor.json .pi/tests/quality-governor.test.ts`
- [ ] The complete retained suite and every artifact graph pass after implementation.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`
  - Verify: `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`

## Technical Context

### Existing Patterns

- `.pi/extensions/research-enforcement/policy.ts` — dependency-free classification, evidence normalization, compliance reduction, and metadata shaping.
- `.pi/extensions/research-enforcement/index.ts` — thin event integration, active-branch restore, provider/Fabric evidence observation, terminal validation, and one bounded correction.
- `.pi/tests/research-enforcement.test.ts` — fake Pi harness covering direct and Fabric traces, correction races, persistence, status, and privacy.
- `.pi/scripts/task-graph.ts` — version-2 tasks already provide declared files, acceptance criteria, verification, attempts, and evidence, but no session/actor ownership claim.
- `.pi/artifacts/architecture-enforcement-stack/research.md` — recommends the smallest honest release: pure policy/path/receipt logic, `plan`/`build`/`verify`, controlled checks, direct scope/protected-path gates, and explicit bypass reporting.
- `.pi/artifacts/strict-lifecycle-enforcement-architecture/research.md` — broader canonical contracts, evidence binding, and delegated-worker authorization intentionally excluded here.
- `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md` — authoritative event ordering, tool blocking, dynamic tools, state, UI, and truncation contracts.
- `/home/ryan/.pi/agent/npm/node_modules/pi-fabric/docs/architecture.md` — nested Pi/captured calls replay native tool lifecycle; generic providers remain a distinct trust boundary.

### Affected Files

```yaml
files:
  - .pi/extensions/quality-governor/policy.ts # New pure contracts and deterministic decisions
  - .pi/extensions/quality-governor/sensors.ts # New bounded path, Git, check, and receipt sensors
  - .pi/extensions/quality-governor/index.ts # New Pi runtime wiring, tools, commands, persistence, and HUD
  - .pi/quality-governor.json # New trusted project rollout, protected-path, and check-recipe policy
  - .pi/tests/quality-governor.test.ts # New pure and fake-runtime behavior tests
```

No existing implementation file is modified by this feature unless a later, explicitly approved scope change updates this specification and task graph first.

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Users mistake the governor for a sandbox | Medium | High | State mediated-path and same-trust limits in status, docs, and tests; unknown effects suppress green receipts. |
| Classifier silently grants broad scope | Medium | High | Classification only proposes; explicit confirmation grants or expands a contract. |
| Parallel/nested tool calls race freshness state | Medium | High | Key pending calls by ID, use monotonic revisions, analyze once per settled batch, and recheck at receipt gate. |
| Raw shell bypasses path policy | High if exposed | High | Remove unrestricted Bash from governed frontiers; checks run as approved executable/argv recipes. |
| Child/provider actions bypass preflight | Medium | High | Do not claim child propagation; record observed bypasses as `UNKNOWN` and refuse green. |
| Public API or architecture heuristics create false confidence | Medium | High | Require a configured checker or explicit `NOT_REQUIRED`; otherwise report `UNKNOWN`. |
| Check commands mutate files or flood context | Low/Medium | Medium | Snapshot before/after, reject mutating receipts, enforce timeout/output caps, and truncate model-facing output. |
| Governor becomes another large framework | Medium | Medium | Limit implementation to three modules, one config, and one test file; defer skills, parsers, learning, vision, and architecture mode. |
| Observe-mode violations are mistaken for enforcement | Medium | Medium | Always display rollout level and distinguish would-block from blocked evidence. |

## Open Questions

None block implementation. Delegated-worker authorization, architecture mode, cryptographic receipts, visual automation, adaptive routing, and persistent learning are explicitly deferred and require separate specifications.

## Tasks

### Lock the Quality-Governor Behavioral Contract [test]

A focused failing test suite defines pure policy, admission, sensor, freshness, runtime, status, persistence, and bounded-correction behavior before production modules exist.

**ID:** `task-1`

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files: [".pi/tests/quality-governor.test.ts"]
```

**Acceptance Criteria:**

- Tests cover every profile, `PLAN`/`BUILD`/`VERIFY`, observe/warn/enforce, explicit contract approval, exact/trailing-`/**` paths, symlink/traversal rejection, new/deleted/dependency/protected paths, and stable violation codes.
- Tests cover direct and Fabric-nested tool identities, unknown provider bypasses, monotonic mutation/contract revisions, structured receipts, current/stale/failed/unknown verification, and vector-to-gate reduction without a scalar score.
- Fake-runtime tests cover terminal annotation, UI-only versus model-context output, active-branch restore, pending/busy correction suppression, dispatch failure, and the one-repair ceiling.
- The new tests fail only because the declared implementation/configuration is absent; no existing production file changes in this task.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="quality governor" .pi/tests/quality-governor.test.ts`
- `git diff --check -- .pi/tests/quality-governor.test.ts`

### Implement Pure Contract and Gate Policy [feature]

The dependency-free policy module deterministically classifies turns, validates and revises confirmed contracts, decides admission, reduces quality vectors, selects gate states, and bounds correction.

**ID:** `task-2`

**Metadata:**

```yaml
depends_on: ["task-1"]
parallel: false
conflicts_with: []
files: [".pi/extensions/quality-governor/policy.ts"]
```

**Acceptance Criteria:**

- All policy functions are pure, dependency-free, fail closed on unknown versions/fields/path forms, and distinguish proposals from approved contracts.
- Admission decisions cover modes, rollout levels, repository ownership, allowed new/deleted files, dependency files, protected paths, nested identity, and unsupported effects with stable codes.
- Quality reduction produces independent dimensions and `GREEN`/`YELLOW`/`RED`/`STALE`/`UNKNOWN` without a scalar score.
- Correction eligibility permits at most one automatic attempt and never dispatches when state is non-repairable, busy, or has pending input.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="quality governor policy|quality governor admission|quality governor vector" .pi/tests/quality-governor.test.ts`
- `node --experimental-strip-types --check .pi/extensions/quality-governor/policy.ts`
- `git diff --check -- .pi/extensions/quality-governor/policy.ts`

### Implement Bounded Sensors and Check Recipes [feature]

Repository sensors and trusted configuration provide canonical path checks, bounded Git evidence, structured no-shell verification, and revision-bound receipts without adding dependencies.

**ID:** `task-3`

**Metadata:**

```yaml
depends_on: ["task-2"]
parallel: false
conflicts_with: []
files: [".pi/extensions/quality-governor/sensors.ts", ".pi/quality-governor.json"]
```

**Acceptance Criteria:**

- Existing targets and new-file parents are canonicalized inside the repository, while absolute, traversal, unsupported wildcard, and symlink-escape inputs fail closed.
- Bounded executable/argv Git sensors report status, changed paths, additions/deletions, new/deleted files, scope locality, protected paths, dependency files, and a deterministic same-trust fingerprint.
- Check IDs resolve only from trusted versioned configuration and execute with bounded cwd, timeout, output, accepted exits, and no shell interpretation.
- Receipts bind contract/mutation revisions, fingerprint, checked paths, recipe identity, exit state, and output digest; a mutating checker or mismatch cannot become current.
- Configuration defaults to observe, one repair, no dependencies, protected governor/policy/runtime paths, and repository-supported Node/Git recipes only.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="quality governor sensors|quality governor verification" .pi/tests/quality-governor.test.ts`
- `node --experimental-strip-types --check .pi/extensions/quality-governor/sensors.ts`
- `git diff --check -- .pi/extensions/quality-governor/sensors.ts .pi/quality-governor.json`

### Wire the Pi Control Loop and Quality HUD [feature]

The thin runtime adapter integrates classification, explicit contract confirmation, direct/nested admission, mutation invalidation, diff analysis, structured checks, dual-channel status, persistence, terminal annotation, and one repair.

**ID:** `task-4`

**Metadata:**

```yaml
depends_on: ["task-3"]
parallel: false
conflicts_with: []
files: [".pi/extensions/quality-governor/index.ts"]
```

**Acceptance Criteria:**

- Trusted configuration loads on session start, versioned metadata restores from the active branch, and state transitions remain idempotent under parallel completion ordering.
- New human turns receive one compact proposal packet; confirmed contracts select the top-level tool frontier and gate direct/Fabric-replayed nested actions before execution.
- Successful observed mutations invalidate receipts, settled mutation batches refresh bounded diff evidence, and unknown provider/child effects suppress green status.
- Governor tools/commands support contract proposal/confirmation, declared checks, compact model status, and detailed human status without exposing full logs or secrets.
- Footer and terminal annotation display rollout level, mode, vector/gate, freshness, context usage when available, and bypasses.
- `agent_settled` dispatches at most one concise repair only when idle and no message is pending, following the existing research-enforcement race protections.

**Verification:**

- `node --experimental-strip-types --test --test-name-pattern="quality governor routing|quality governor status|quality governor persistence|quality governor correction" .pi/tests/quality-governor.test.ts`
- `node --experimental-strip-types --check .pi/extensions/quality-governor/index.ts`
- `git diff --check -- .pi/extensions/quality-governor/index.ts`

### Verify the Integrated Governor [verify]

The complete governor contract, retained Pi Core suite, artifact graphs, read-only frontier behavior, and minimal file boundary pass together with an independent read-only review.

**ID:** `task-5`

**Metadata:**

```yaml
depends_on: ["task-4"]
parallel: false
conflicts_with: []
files: []
```

**Acceptance Criteria:**

- All quality-governor tests pass with zero failures.
- The complete retained test suite passes with zero failures.
- Every artifact graph validates and cross-artifact frontier reporting leaves `.active` byte-identical.
- The feature-owned implementation layout contains exactly the five declared paths; scoped status evidence and review attribute no additional path to this feature, while pre-existing unrelated work remains untouched.
- No file is deleted, no dependency/manifest/lockfile is added, and no scalar quality score, unlimited repair loop, architecture mode, or hidden bypass claim appears.
- The parent records one independent read-only review at `progress.md#evidence-task-5-attempt-<n>` with no unresolved critical or important correctness, security, regression, or scope findings.

**Review Gate:**

After automated verification, the `/ship` parent runs one foreground `agents.run` review with tools `read`, `grep`, `find`, and `ls`. The reviewer receives this specification, the task-attempt evidence, the feature-owned diff/status, and the five implementation files; it returns severity-ranked findings with path-and-line evidence. The parent validates the findings and records the result at the current-attempt anchor before passing the task. A missing review or any unresolved critical/important finding blocks passage.

**Verification:**

- `node --experimental-strip-types --test .pi/tests/*.test.ts`
- `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- `before=$(sha256sum .pi/artifacts/.active); node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null; test "$before" = "$(sha256sum .pi/artifacts/.active)"`
- `node --experimental-strip-types -e 'const fs=require("node:fs"); const expected=[".pi/extensions/quality-governor/index.ts",".pi/extensions/quality-governor/policy.ts",".pi/extensions/quality-governor/sensors.ts",".pi/quality-governor.json",".pi/tests/quality-governor.test.ts"]; for (const path of expected) if (!fs.statSync(path).isFile()) throw new Error("missing file: "+path); const actual=fs.readdirSync(".pi/extensions/quality-governor").sort(); const wanted=["index.ts","policy.ts","sensors.ts"]; if (JSON.stringify(actual)!==JSON.stringify(wanted)) throw new Error("unexpected extension layout: "+actual.join(",")); console.log(expected.join("\n"));'`
- `git status --short --untracked-files=all -- .pi/extensions/quality-governor .pi/quality-governor.json .pi/tests/quality-governor.test.ts`
- `git diff --check -- .pi/extensions/quality-governor/policy.ts .pi/extensions/quality-governor/sensors.ts .pi/extensions/quality-governor/index.ts .pi/quality-governor.json .pi/tests/quality-governor.test.ts`

## Research Findings

- A custom agent-computer interface can materially change software-agent behavior and benchmark performance without changing model weights, supporting a control-system investment around the model rather than a larger universal prompt. [S2][S3]
- Pi exposes the required mediated seams: prompt injection, `tool_call` blocking, nested Pi/captured lifecycle replay, dynamic tool activation, metadata-only entries, model-context messages, context usage, bounded output, and terminal lifecycle hooks. [S1][S2]
- Long-context models often use information least reliably when it is buried in the middle, supporting a compact per-task contract and progressive tool/context disclosure. [S4]
- Feedback-driven agents can improve through in-context verbal feedback without weight updates, but the proposed governor keeps correction bounded to avoid oscillation and scope drift. [S5]
- Existing Pi Core architecture research already rejects universal Bash parsing, task-ownership inference, scalar scoring, and broad architecture governance for the first release; this specification adopts its smallest honest boundary. [S1]
- xAI Web Search was attempted but unavailable because no active xAI/Grok model was selected; it supplied no evidence. Context7, Exa, and Codex Search all returned usable independent evidence. [S2][S3][S4][S5]

## Sources

- **[S1] Local Pi Core and installed source, inspected 2026-07-26:** `.pi/extensions/research-enforcement/{policy,index}.ts`; `.pi/tests/research-enforcement.test.ts`; `.pi/artifacts/architecture-enforcement-stack/research.md`; `.pi/artifacts/strict-lifecycle-enforcement-architecture/research.md`; `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md`; `/home/ryan/.pi/agent/npm/node_modules/pi-fabric/docs/architecture.md`.
- **[S2] Pi Extensions documentation, retrieved independently through Context7, Exa, and Codex Search on 2026-07-26:** https://pi.dev/docs/latest/extensions and https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md
- **[S3] Yang et al., “SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering,” arXiv:2405.15793, published 2024-05-06; retrieved through Exa and Codex Search:** https://arxiv.org/abs/2405.15793
- **[S4] Liu et al., “Lost in the Middle: How Language Models Use Long Contexts,” arXiv:2307.03172, published 2023-07-06; retrieved through Exa and Codex Search:** https://arxiv.org/abs/2307.03172
- **[S5] Shinn et al., “Reflexion: Language Agents with Verbal Reinforcement Learning,” arXiv:2303.11366, NeurIPS 2023; retrieved through Codex Search:** https://arxiv.org/abs/2303.11366

## Notes

- This artifact intentionally does not modify `.pi/artifacts/.active`; the existing active feature and unrelated dirty work remain undisturbed.
- `/plan` is skipped because this specification already contains a resolved sequential executable graph; `/ship` may run after the user explicitly activates this slug.