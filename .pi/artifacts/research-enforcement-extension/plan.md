# Pi Research-Enforcement Extension Implementation Plan

> **For Pi:** Implement this plan task-by-task.

**Goal:** Main reliably uses existing research surfaces for external or current questions, demonstrates tier-appropriate evidence and citation structure, and receives at most one transparent corrective retry when it does not.

**Discovery Level:** 2 — The extension crosses lifecycle, persistence, and Fabric trace contracts. Persisted deep research resolved external architecture choices; one bounded Explore pass and one Plan advisory resolved local APIs, test seams, sequencing, and race handling.

**Context Budget:** Approximately 48% per execution. Keep the four serial canonical tasks and stop after each task's verification boundary.

---

## Must-Haves

### Observable Truths

1. External/current prompts receive concise research-route guidance; local, mechanical, and explicitly opted-out prompts do not.
2. A standard answer is compliant only after one successful authoritative provider category and a structural citation.
3. A high-risk answer is compliant only after two independent eligible provider categories and complete `[S<n>]` finding-to-source mapping.
4. Failed, empty, duplicate-category, aborted, timed-out, and malformed-trace activity never satisfies evidence.
5. A noncompliant turn receives no more than one extension-labelled correction, dispatched only after the run is settled and idle.
6. Reload, resume, fork, or tree navigation cannot duplicate a correction and never persists prompts, answers, URLs, queries, retrieved content, or credentials.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Contract test and lifecycle harness | RED/GREEN policy fixtures and fake Pi events | `.pi/tests/research-enforcement.test.ts` |
| Pure policy | Classification, strict configuration, evidence, trace, citations, and metadata shaping | `.pi/extensions/research-enforcement/policy.ts` |
| Lifecycle adapter | Hooks, state transitions, persistence, commands, and correction dispatch | `.pi/extensions/research-enforcement/index.ts` |
| Trusted defaults | Exact provider categories, direct tool names, and Fabric refs | `.pi/research-enforcement.json` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| `input` | `before_agent_start` | Consume one external-input token when expanded prompt processing begins | Resetting immediately at `input` can corrupt an active turn when a follow-up is queued. |
| `before_agent_start` | policy | Classify transient prompt and return static route guidance | Persisting the prompt or reclassifying an extension correction violates privacy or resets retry state. |
| `tool_call` | `tool_result` | `toolCallId`-keyed pending observation | Counting a start or assuming sibling completion admits failed evidence under parallel execution. |
| `tool_result.details.trace` | provider categories | Strict Trace V1 guard and exact successful-ref mapping | Prefix/prose parsing or ambiguous refs create false evidence. |
| `message_end` | `agent_settled` | Convert final assistant text to citation booleans/counts, then evaluate once settled | Earlier assistant tool-call messages are not necessarily the final answer. |
| `agent_settled` | `appendEntry` then `sendMessage` | Idle check followed synchronously by durable attempt marker and labelled correction | Dispatch-before-marker, an intervening await, or stale queued input can duplicate correction. |
| `session_start` / `session_tree` | restored state | Latest matching custom entry on the active branch | Restoring from an abandoned branch can suppress or duplicate correction incorrectly. |

## Policy Boundaries

### Exact Provider Matcher Table

| Category | Direct tool match | Fabric successful ref | Standard | Independent for high |
| --- | --- | --- | --- | --- |
| `context7` | `context7.query-docs` | `mcp.context7.query-docs` | Yes | Yes |
| `exa` | `exa.web_search_exa`, `exa.web_fetch_exa` | `mcp.exa.web_search_exa`, `mcp.exa.web_fetch_exa` | Yes | Yes |
| `codex-search` | `codex_search` | `extensions.codex_search` | Yes | Yes |
| `xai-web-search` | `xai_grok_web_search` | `extensions.xai_grok_web_search` | Yes | Yes |
| `scout` | `Agent` only when `input.subagent_type === "scout"` | None; nested `extensions.Agent` is ambiguous because Fabric omits arguments | Yes | No |

`context7.resolve-library-id` is routing/setup activity, not retrieved evidence. `fabric_exec` is only a trace carrier. Match exact names and refs; do not use prefixes, wildcard patterns, error prose, arguments from nested calls, or result text.

### Strict Configuration V1

`.pi/research-enforcement.json` contains:

- `version: 1` and `enabled: true`;
- unique provider records with bounded labels, exact `directToolNames`, exact `fabricRefs`, `authoritative`, and `independentForHigh`;
- bounded literal `authoritativeSourceIdentifiers` without configurable regular expressions;
- fixed standard count `1`, high count `2`, and maximum corrections `1`.

Reject unknown keys, duplicate categories, ambiguous mappings, wildcard refs, invalid booleans, oversized strings, and unsupported versions. Use the complete built-in default after any parse or validation failure; never partially apply a weakened configuration.

### Structural Citation Contract

- Standard accepts a valid bare or Markdown HTTPS URL or an exact configured authoritative identifier.
- High requires `Findings` and `Sources` sections. Every non-empty finding bullet has at least one `[S<n>]`; every referenced marker has exactly one numbered source entry containing a standard-valid citation.
- Reject duplicate IDs, missing entries, unresolved markers, marker-only sources, or markers used only in `Sources`.
- Report “structural citation compliance,” never truth, verification, or entailment.

### Metadata-Only State

Persist only versioned integer counters, tier, opt-out state, provider-category identifiers, citation booleans/counts, missing-requirement codes, and correction status. Never persist prompts, answers, URLs, source text/markers, queries, tool arguments/results, model/session identity, credentials, timings, or raw error prose.

### Per-Turn State

```text
TurnState
  turnOrdinal
  tier: none | standard | high
  optedOut
  phase: collecting | awaiting-settled | correcting | settled
  providerCategories: Set<Category>
  pendingTools: Map<toolCallId, candidate-kind>   # memory only
  citation: standardValid, highValid, referencedSourceCount, missingCodes
  finalSeen
  guidanceInjected
  firstOutcomeRecorded
  correction: eligible | attempted | dispatched |
              skipped-pending-input | skipped-busy | dispatch-failed
```

Adapter state additionally holds parsed configuration, `pendingExternalInputs`, aggregate counters, and whether an extension correction run is expected.

## Event Transition Order

1. `session_start`: load trusted configuration, clear ephemeral calls, restore the latest versioned custom entry on the active branch, and never dispatch during restoration.
2. `session_tree`: clear ephemeral calls and restore from the newly active branch.
3. `input`: increment `pendingExternalInputs` only for `interactive` and `rpc`; ignore `extension` as a user reset.
4. `before_agent_start`: consume an external token to start/classify a new turn; otherwise retain the original turn when an extension correction is expected. Inject only static tier guidance.
5. `tool_call`: retain only `toolCallId` and exact candidate category/kind. Inspect only `subagent_type` for a direct `Agent` scout call; never retain its prompt.
6. `tool_result`: remove the pending record. Count direct evidence only for `isError === false` and structurally non-empty content. Count Fabric evidence only from a strict successful Trace V1 envelope and exact successful operation refs.
7. `message_end`: for the final assistant message seen so far, compute transient citation structure and retain booleans/counts/codes only.
8. `agent_settled`: record first-pass metrics once; stop for no-research, opt-out, compliance, no final answer, prior attempt, queued external input, or non-idle context. Otherwise set `attempted`, append the durable marker, and synchronously call labelled `sendMessage(..., { deliverAs: "followUp", triggerTurn: true })`.
9. Correction run: retain originating turn/evidence, update final compliance and metrics, and permanently block another correction. The next interactive/RPC input creates a fresh eligible turn.

## Derived Dependency Graph

> Wave labels are a derived snapshot of the current authoritative `tasks.json`. `/ship` recomputes the live frontier.

```text
task-1: needs nothing
        creates .pi/tests/research-enforcement.test.ts

task-2: needs task-1 RED
        creates .pi/extensions/research-enforcement/policy.ts
        creates .pi/research-enforcement.json
        updates .pi/tests/research-enforcement.test.ts

task-3: needs task-2 GREEN
        creates .pi/extensions/research-enforcement/index.ts
        updates .pi/tests/research-enforcement.test.ts

task-4: needs task-3 GREEN
        creates verification evidence only

Derived Wave 1: task-1
Derived Wave 2: task-2
Derived Wave 3: task-3
Derived Wave 4: task-4
```

The canonical graph requires no delta: stable IDs, dependencies, file ownership, pending state, and single-worker execution already match this plan.

## Tasks

### Task Standards

- Use exact paths and one action per step.
- Run the named test before and after each minimal behavior group.
- Confirm RED failures are caused by the intended absent or incomplete behavior, not syntax or harness errors.
- Keep production logic dependency-free and policy logic runtime-independent.
- Inspect owned diffs after each behavior group.
- Do not change lifecycle state until task verification evidence exists.

### task-1 — [test] Lock Research-Enforcement Contracts

**Needs:** Valid version-2 graph and absent implementation files.

**Creates:** `.pi/tests/research-enforcement.test.ts` in an intentional RED state.

**Checkpoint:** None.

#### Step 1.1 — Record workspace boundary

Run:

```bash
git status --short --branch -- .pi/tests/research-enforcement.test.ts .pi/extensions/research-enforcement .pi/research-enforcement.json .pi/fabric/mesh/state.json
git diff -- .pi/fabric/mesh/state.json | sha256sum
```

Expected: no feature implementation paths exist; the unrelated mesh path may already be modified. Record its digest in task evidence without editing it.

#### Step 1.2 — Create the typed test skeleton

Create `.pi/tests/research-enforcement.test.ts` with Node `test`/strict assertions, a static `policy.ts` import, typed fixture builders, and a dynamic `index.ts` import helper for lifecycle-only tests.

Expected: the file parses far enough to report the intentionally missing policy module.

#### Step 1.3 — Add classification contracts

Add named fixtures for local/mechanical `none`, explicit/current/external `standard`, high-consequence `high`, external-library conditional research, and opt-out precedence.

Expected: every test name starts with `research enforcement classification:`.

#### Step 1.4 — Add config and evidence contracts

Add strict-config fixtures, exact provider mappings including opt-in xAI web search, duplicate-category rejection, direct success/error/empty cases, category deduplication, and malformed/failed/aborted/timed-out Trace V1 cases.

Expected: tests explicitly prove `context7.resolve-library-id` and ambiguous nested `extensions.Agent` do not count.

#### Step 1.5 — Add citation and privacy contracts

Add standard HTTPS/Markdown/identifier fixtures; high `Findings`/`Sources` mapping fixtures; duplicate, missing, unresolved, and marker-only failures; and forbidden-content fixtures for snapshots/metrics.

Expected: tests call the result structural compliance and never semantic verification.

#### Step 1.6 — Add lifecycle harness contracts

Add a typed fake API that captures registered handlers/commands and logs `appendEntry`/`sendMessage` order. Cover input token handling, guidance, direct/Fabric observation, final-answer capture, pending-input/busy skips, dispatch failure, correction re-entry, reload/fork/tree restoration, status, and metrics.

Expected: lifecycle tests load `index.ts` dynamically so policy work can become GREEN before `index.ts` exists.

#### Step 1.7 — Prove RED

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement" .pi/tests/research-enforcement.test.ts
```

Expected: nonzero exit caused by missing `.pi/extensions/research-enforcement/policy.ts`, not malformed test syntax.

#### Step 1.8 — Check the test diff

Run:

```bash
git diff --check -- .pi/tests/research-enforcement.test.ts
git diff -- .pi/tests/research-enforcement.test.ts
```

Expected: exit 0 from `diff --check`; only the owned test path appears.

### task-2 — [policy] Implement Pure Research Policy

**Needs:** task-1's reviewed RED evidence.

**Creates:** `.pi/extensions/research-enforcement/policy.ts`, `.pi/research-enforcement.json`; updates the focused test.

**Checkpoint:** None; exactly three owned files.

#### Step 2.1 — GREEN tier classification

Implement policy types, opt-out precedence, and deterministic `none`/`standard`/`high` classification in `policy.ts`.

Run before and after:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*classification" .pi/tests/research-enforcement.test.ts
```

Expected: initial targeted failure, then exit 0 with classification tests passing.

#### Step 2.2 — RED strict configuration

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*config" .pi/tests/research-enforcement.test.ts
```

Expected: nonzero exit for absent config parser/defaults only.

#### Step 2.3 — GREEN strict configuration

Implement all-or-nothing V1 parsing and write `.pi/research-enforcement.json` using the exact matcher table above.

Expected: unknown/ambiguous/wildcard/oversized input falls back to the complete built-in default; the config test exits 0.

#### Step 2.4 — RED direct evidence mapping

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*evidence" .pi/tests/research-enforcement.test.ts
```

Expected: failures identify absent successful-result and category-independence behavior.

#### Step 2.5 — GREEN direct evidence mapping

Implement exact direct matching, successful/non-empty result checks, authoritative filtering, and category deduplication.

Expected: standard requires one category; high requires two distinct `independentForHigh` categories; direct scout can satisfy standard only.

#### Step 2.6 — RED Fabric trace guard

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*trace" .pi/tests/research-enforcement.test.ts
```

Expected: malformed and unsuccessful trace fixtures remain failing until guarded.

#### Step 2.7 — GREEN Fabric trace guard

Implement a local structural Trace V1 guard requiring `details.success === true`, `kind === "pi-fabric.execution"`, `version === 1`, trace outcome `succeeded`, valid operations, and exact successful refs.

Expected: no operation arguments/results or prose are inspected; only Context7 query, Exa search/fetch, Codex Search, and explicitly enabled xAI web-search refs count.

#### Step 2.8 — RED/GREEN standard citations

Run the citation subset, implement URL parsing and exact authoritative identifiers, then rerun:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*citation.*standard" .pi/tests/research-enforcement.test.ts
```

Expected: exit 0; malformed/non-HTTPS links fail.

#### Step 2.9 — RED/GREEN high citations

Implement deterministic section, finding bullet, source ID, and marker matching; rerun:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*citation.*high" .pi/tests/research-enforcement.test.ts
```

Expected: exit 0; every finding marker resolves exactly once.

#### Step 2.10 — GREEN metadata shaping

Implement versioned snapshot and aggregate metric shaping with only approved booleans, counts, enums, and category IDs.

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*privacy" .pi/tests/research-enforcement.test.ts
```

Expected: exit 0; forbidden raw-content fixtures are absent after serialization.

#### Step 2.11 — Refactor and verify policy

Remove duplicated parsing/matching while retaining narrow types and pure functions. Run:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*(classification|evidence|citation|config|privacy|trace)" .pi/tests/research-enforcement.test.ts
node --experimental-strip-types --check .pi/extensions/research-enforcement/policy.ts
git diff --check -- .pi/extensions/research-enforcement/policy.ts .pi/research-enforcement.json .pi/tests/research-enforcement.test.ts
```

Expected: all commands exit 0.

### task-3 — [extension] Wire Corrective Extension Lifecycle

**Needs:** task-2 policy subset GREEN.

**Creates:** `.pi/extensions/research-enforcement/index.ts`; updates lifecycle tests.

**Checkpoint:** None; two owned files.

#### Step 3.1 — Prove lifecycle RED

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*(correction|status|scope|direct|Fabric)" .pi/tests/research-enforcement.test.ts
```

Expected: nonzero exit because `index.ts` is absent; policy subsets remain GREEN.

#### Step 3.2 — Register configuration and restoration hooks

Create `index.ts`; register `session_start` and `session_tree`; read trusted config via `CONFIG_DIR_NAME`; restore only matching versioned custom entries on the active branch; clear ephemeral pending tools.

Expected: startup/resume/fork/reload/tree tests pass and restoration never dispatches.

#### Step 3.3 — Wire user-turn classification and guidance

Register `input` and `before_agent_start`; count only interactive/RPC input; preserve correction runs; inject concise static route and citation guidance for standard/high tiers.

Expected: local/opt-out turns inject nothing, correction turns do not reset state, and no prompt enters persisted state.

#### Step 3.4 — Wire tool candidates

Register `tool_call`; retain only call ID and exact candidate kind/category. Read only `subagent_type` when the direct tool is `Agent`; treat `fabric_exec` as a trace candidate.

Expected: no query, prompt, URL, generic arguments, or content is retained.

#### Step 3.5 — Wire successful results

Register `tool_result`; delete pending entries on every outcome; use policy functions for direct success/non-empty checks and Trace V1 extraction.

Expected: result ordering is call-ID safe; failed and malformed results do not add categories.

#### Step 3.6 — Capture final structural compliance

Register `message_end`; process assistant text transiently and overwrite retained citation booleans/counts/codes with the latest assistant message.

Expected: intermediate tool-call assistant messages cannot become the settled final result.

#### Step 3.7 — Persist-before-dispatch correction

Register `agent_settled`; require final seen, research tier, noncompliance, no prior attempt, no queued external input, and `ctx.isIdle()`.

In one synchronous segment, perform:

```text
set correction = attempted
appendEntry("research-enforcement/v1", metadata snapshot)
sendMessage(extension-labelled requirement, { deliverAs: "followUp", triggerTurn: true })
```

Expected: operation-log test proves append precedes send and no second correction occurs.

#### Step 3.8 — Handle stale/busy/failure paths

Persist metadata-only `skipped-pending-input`, `skipped-busy`, or `dispatch-failed` states. Never retry a failed dispatch for that turn.

Expected: newer user intent wins; correction is skipped rather than deferred into a stale response.

#### Step 3.9 — Register status and metrics commands

Register `/research-status` and `/research-metrics`; present concise policy/category/count state through UI only when available, with text-readable output in non-TUI modes.

Expected: commands do not start a research turn and expose no forbidden content.

#### Step 3.10 — Refactor and verify lifecycle

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="research enforcement.*(correction|status|scope|direct|Fabric)" .pi/tests/research-enforcement.test.ts
node --experimental-strip-types --check .pi/extensions/research-enforcement/index.ts
git diff --check -- .pi/extensions/research-enforcement/index.ts .pi/tests/research-enforcement.test.ts
```

Expected: all commands exit 0.

### task-4 — [verification] Verify Integrated Research Enforcement

**Needs:** task-3 lifecycle subset GREEN.

**Creates:** Verification evidence only.

**Checkpoint:** Stop if new failures, active-slug drift, graph invalidity, or owned-path overlap appears.

#### Step 4.1 — Verify focused behavior

```bash
node --experimental-strip-types --test .pi/tests/research-enforcement.test.ts
```

Expected: exit 0 with all focused tests passing.

#### Step 4.2 — Verify syntax

```bash
node --experimental-strip-types --check .pi/extensions/research-enforcement/policy.ts
node --experimental-strip-types --check .pi/extensions/research-enforcement/index.ts
```

Expected: both exit 0.

#### Step 4.3 — Validate the active graph

```bash
node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/research-enforcement-extension/tasks.json
```

Expected: JSON reports `"ok": true`, version 2, and no issues.

#### Step 4.4 — Validate all retained graphs

```bash
for f in .pi/artifacts/*/tasks.json; do
  node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"
done
```

Expected: every command exits 0.

#### Step 4.5 — Run the retained suite

```bash
node --experimental-strip-types --test .pi/tests/*.test.ts
```

Expected: either exit 0 or exactly the two recorded unrelated baseline failures remain: the intentionally absent `.pi/extensions/prompt-leverage.ts` import and the Plan-agent `extensions: false` expectation. Any additional failure blocks completion.

#### Step 4.6 — Verify owned diffs

```bash
git diff --check -- .pi/extensions/research-enforcement .pi/research-enforcement.json .pi/tests/research-enforcement.test.ts .pi/artifacts/research-enforcement-extension
git diff -- .pi/extensions/research-enforcement .pi/research-enforcement.json .pi/tests/research-enforcement.test.ts
```

Expected: whitespace check exits 0 and the reviewed diff contains only intended feature behavior.

#### Step 4.7 — Verify safeguards

```bash
test ! -e .pi/extensions/prompt-leverage.ts
git diff -- .pi/fabric/mesh/state.json | sha256sum
git status --short -- .pi/extensions/research-enforcement .pi/research-enforcement.json .pi/tests/research-enforcement.test.ts .pi/fabric/mesh/state.json
```

Expected: deleted legacy extension remains absent; mesh digest equals task-1 evidence; runtime state is not included in feature ownership.

#### Step 4.8 — Confirm handoff state

```bash
test "$(cat .pi/artifacts/.active)" = "research-enforcement-extension"
git branch --show-current
git rev-parse HEAD
```

Expected: active slug remains selected; checkout identity is recorded without branch or history mutation.

## Risks and Stop Conditions

- xAI web search is opt-in and may consume xAI credits. The enforcement extension may count a successful `xai_grok_web_search` result but must never enable or invoke it automatically.
- If exact installed tool identities drift, update tests/config together only after catalog evidence; never broaden matching silently.
- Direct `Agent` may count as scout only after checking the single `subagent_type` identity field. Nested Fabric `extensions.Agent` remains route-only because trace metadata cannot prove subtype.
- Invalid config or trace fails closed for evidence but fail-open for normal Pi operation; the extension never blocks tools or performs network requests itself.
- Busy or queued-input correction is skipped intentionally to avoid duplicate or stale remediation.
- If public lifecycle APIs cannot preserve append-before-dispatch or active-branch restoration, stop and report the contract gap.
- If an owned path changes concurrently, preserve both versions and stop that edit.
- No task may add dependencies, modify agent definitions, restore legacy extension files, or touch unrelated runtime state.

## Planning Evidence

- Pi project extensions load from trusted `.pi/extensions/*/index.ts`.
- Public lifecycle APIs support `input`, `before_agent_start`, `tool_call`, `tool_result`, `message_end`, `agent_settled`, `session_start`, and `session_tree`.
- `InputSource` is exactly `interactive | rpc | extension`.
- `appendEntry` persists custom metadata outside model context; `sendMessage` supports labelled custom content and `triggerTurn`.
- Fabric Trace V1 exposes exact refs and typed outcomes while omitting external arguments/results.
- The installed `pi-xai-oauth` catalog exposes opt-in `xai_grok_web_search` directly and as captured ref `extensions.xai_grok_web_search`; successful use can satisfy one provider category without granting Fabric to non-build subagents.
- The existing four-task version-2 graph validates and needs no delta.

## Handoff

The ready frontier is `task-1`. Tasks `task-2`, `task-3`, and `task-4` are dependency-blocked in that order. There are no unresolved implementation questions and no user checkpoint before task-1. `/ship` must recompute the frontier from `tasks.json` before execution.