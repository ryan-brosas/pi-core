# Pi Research-Enforcement Extension

- **Created:** 2026-07-25
- **Status:** Approved for planning and implementation
- **Tracking:** Project artifact graph

## Problem Statement

Pi has capable research surfaces—including Context7, Exa, Codex Search, opt-in xAI web search, scout subagents, and Fabric-mediated tools—but the Main session can answer current or external questions without using them. The project needs a trusted, project-local extension that detects research-requiring turns, provides the correct routes, observes whether qualifying retrieval occurred, validates citation structure, and performs one transparent corrective retry when evidence is missing.

Pi extensions cannot invoke peer extension tools by name, and Fabric exposes nested tool activity through typed trace metadata rather than retrieved content. Phase one therefore enforces use of existing direct research surfaces; a unified executing provider adapter is deferred.

## Goals

1. Make research use reliable in Main without blocking ordinary local or mechanical work.
2. Apply deterministic standard and high-risk evidence requirements.
3. Correct one noncompliant response transparently without retry loops.
4. Preserve privacy by recording metadata only.
5. Support trusted project defaults and explicit child-agent loading or exclusion.

## Scope

### In Scope

- A new trusted extension under `.pi/extensions/research-enforcement/`.
- Automatic Main loading through Pi project extension discovery.
- Child-agent participation through existing `extensions` and `exclude_extensions` frontmatter behavior.
- Turn classification into `none`, `standard`, or `high` research tiers.
- Explicit user opt-out for a turn.
- Route guidance for Context7, Exa, Codex Search, opt-in xAI web search, scout, and Fabric-mediated equivalents.
- Observation of direct research tools and valid Pi Fabric trace V1 records.
- Standard compliance requiring one successful authoritative provider category plus a citation.
- High-risk compliance requiring two independent provider categories and claim-level source mapping.
- One corrective retry, with retry state persisted before dispatch.
- `/research-status` and `/research-metrics` commands exposing metadata only.
- Trusted project configuration in `.pi/research-enforcement.json`.
- Focused automated tests covering policy and lifecycle behavior.

### Out of Scope

- A unified tool that executes provider adapters.
- Provider authentication, transport, or credential management.
- Deep imports into provider or Fabric package internals.
- Restoring previously deleted research or prompt-enforcement extensions.
- Runtime policy thresholds selected by inferred agent type.
- Enforcement in isolated children or sessions using a different working directory when the extension is not loaded.
- Semantic verification that a citation entails or proves a claim.
- Storage of prompts, queries, URLs, retrieved text, answers, or credentials in metrics.
- New dependencies, package manifests, lockfiles, branches, worktrees, commits, pushes, or deployments.

## Proposed Solution

Create a dependency-free policy module and a thin Pi lifecycle integration module.

`policy.ts` will own classification, provider-category normalization, successful-evidence rules, Fabric trace interpretation, citation-shape validation, configuration parsing, metadata shaping, and correction eligibility. Its behavior will be testable without a Pi runtime.

`index.ts` will register lifecycle hooks and commands, maintain per-turn state, observe direct and Fabric-mediated research activity, inject concise route guidance, evaluate the final answer, and dispatch at most one visibly extension-labelled corrective turn. Existing research tools remain directly callable; the extension coordinates and verifies their use rather than replacing them.

`.pi/research-enforcement.json` will define shared project defaults. Malformed or absent configuration must fall back to safe documented defaults. Agent-specific enablement remains an existing Pi loading concern rather than an invented runtime discriminator.

## Functional Requirements

### FR1 — Turn Classification

The policy must classify:

- explicit requests to search, research, verify current information, consult documentation, or compare external approaches as at least `standard`;
- high-consequence legal, medical, financial, security, or similarly sensitive external claims as `high`;
- external API or library claims as `standard` when local evidence is insufficient;
- local code edits, mechanical transformations, and user-provided facts as `none` unless research is explicitly requested;
- an explicit user request not to browse or research as opted out for that turn.

### FR2 — Evidence Contract

- `standard` requires one successful authoritative provider category and at least one valid citation.
- `high` requires two successful, independent provider categories and claim-level source mapping.
- Failed, aborted, timed-out, empty, duplicate-category, malformed, or invalid-trace activity does not satisfy evidence.
- Valid Pi Fabric trace V1 entries may satisfy provider activity only when their exact nested refs and successful outcomes map to an approved category.
- Provider categories, not raw tool-call count, determine independence.
- A successful `xai_grok_web_search` call may satisfy one `xai-web-search` category, whether observed directly or through exact successful Fabric ref `extensions.xai_grok_web_search`; merely loading or exposing the opt-in tool does not count.

### FR3 — Citation Contract

- Standard citations accept a usable HTTPS or Markdown source link, or another explicitly configured authoritative source identifier.
- High-risk findings must contain `[S<n>]` markers and a matching numbered Sources entry for every referenced marker.
- Unresolved, missing, or mismatched source markers fail compliance.
- Citation checks are structural and must not claim semantic entailment.

### FR4 — Corrective Pass

- A noncompliant research-required answer may trigger one correction.
- The correction marker must be persisted before calling `sendMessage` with `triggerTurn`.
- The corrective message must identify itself as extension-generated and state the missing evidence requirement.
- No second correction may be generated for the same user turn.
- A new user turn resets correction eligibility.
- If the session is not idle or a pending-turn race exists, correction must be deferred or skipped safely rather than duplicated.

### FR5 — Research Routing and Observation

- The extension must name the available direct routes instead of pretending to execute peer tools.
- It must recognize configured direct Context7, Exa, Codex Search, opt-in xAI web search, and scout surfaces.
- It must recognize equivalent successful nested calls from valid Fabric trace V1 metadata.
- It must never enable or invoke xAI web search automatically; activation remains an explicit user/session choice because it may consume xAI credits.
- It must not parse prose logs as a substitute for typed trace data.

### FR6 — Configuration and Scope

- Main uses trusted project discovery by default.
- Child agents load or exclude the extension through Pi's existing extension frontmatter controls.
- No unsupported runtime agent-type discriminator is introduced.
- Configuration parsing rejects unknown or invalid values and falls back safely.

### FR7 — Status, Metrics, and Privacy

- `/research-status` reports current policy, tier, observed provider categories, citation state, and correction state.
- `/research-metrics` reports aggregate counts needed to evaluate policy behavior.
- Stored or displayed metrics must exclude raw prompts, queries, URLs, retrieved text, generated answers, and credentials.

## Non-Functional Requirements

- Non-research turns add bounded, negligible work and perform no network access.
- Policy decisions are deterministic and unit-testable.
- Provider integration uses public Pi extension APIs and typed Fabric trace contracts only.
- User-facing notices are concise, text-readable, and do not rely on color alone.
- Compatibility is documented for the installed Pi Fabric trace V1 contract.
- No dependency or package-manager changes are introduced.

## Technical Context

- Pi project extensions are trusted and auto-discovered from `.pi/extensions/`.
- Agent frontmatter supports `extensions` and `exclude_extensions`; `.pi/subagents.json` does not configure Main extension loading.
- There is no stable runtime agent-type discriminator suitable for policy selection.
- Pi Fabric 0.25.12 exposes final-result `details.trace` V1 metadata containing exact nested refs and outcomes while omitting external tool arguments and results.
- Extension tool metadata does not provide a supported way to execute a peer extension tool by name.
- Existing project agents currently allow extension loading, so no agent-definition edit is required for the shared default.
- Installed `pi-xai-oauth` exposes opt-in direct tool `xai_grok_web_search` and captured Fabric ref `extensions.xai_grok_web_search`; successful use is evidence, while availability or activation alone is not.
- The retained full test suite currently has two unrelated baseline failures: a test importing intentionally absent `.pi/extensions/prompt-leverage.ts`, and a Plan-agent assertion expecting `extensions: false`.

## Affected Files

### Implementation

- `.pi/extensions/research-enforcement/policy.ts`
- `.pi/extensions/research-enforcement/index.ts`
- `.pi/research-enforcement.json`
- `.pi/tests/research-enforcement.test.ts`

### Lifecycle Artifacts

- `.pi/artifacts/research-enforcement-extension/spec.md`
- `.pi/artifacts/research-enforcement-extension/tasks.json`
- `.pi/artifacts/research-enforcement-extension/progress.md`
- `.pi/artifacts/.active`

## Tasks

### task-1 — [test] Lock Research-Enforcement Contracts

Focused tests express classification, evidence, citation, privacy, correction, and Fabric integration contracts and demonstrate the intended red state against the absent extension.

- `depends_on`: none
- `parallel`: false
- `conflicts_with`: none
- `files`: `.pi/tests/research-enforcement.test.ts`
- Verify: `node --experimental-strip-types --test --test-name-pattern="research enforcement" .pi/tests/research-enforcement.test.ts`
- Verify: `git diff --check -- .pi/tests/research-enforcement.test.ts`

### task-2 — [policy] Implement Pure Research Policy

A dependency-free policy and trusted configuration satisfy tier classification, evidence normalization, Fabric trace, citation, privacy, and configuration tests without requiring a Pi runtime.

- `depends_on`: `task-1`
- `parallel`: false
- `conflicts_with`: none
- `files`: `.pi/extensions/research-enforcement/policy.ts`, `.pi/research-enforcement.json`, `.pi/tests/research-enforcement.test.ts`
- Verify: `node --experimental-strip-types --test --test-name-pattern="research enforcement.*(classification|evidence|citation|config|privacy|trace)" .pi/tests/research-enforcement.test.ts`
- Verify: `node --experimental-strip-types --check .pi/extensions/research-enforcement/policy.ts`
- Verify: `git diff --check -- .pi/extensions/research-enforcement/policy.ts .pi/research-enforcement.json .pi/tests/research-enforcement.test.ts`

### task-3 — [extension] Wire Corrective Extension Lifecycle

The lifecycle integration injects routes, observes direct and Fabric-mediated research, reports status and metadata-only metrics, and performs at most one race-safe corrective turn.

- `depends_on`: `task-2`
- `parallel`: false
- `conflicts_with`: none
- `files`: `.pi/extensions/research-enforcement/index.ts`, `.pi/tests/research-enforcement.test.ts`
- Verify: `node --experimental-strip-types --test --test-name-pattern="research enforcement.*(correction|status|scope|direct|Fabric)" .pi/tests/research-enforcement.test.ts`
- Verify: `node --experimental-strip-types --check .pi/extensions/research-enforcement/index.ts`
- Verify: `git diff --check -- .pi/extensions/research-enforcement/index.ts .pi/tests/research-enforcement.test.ts`

### task-4 — [verification] Verify Integrated Research Enforcement

The complete feature passes focused checks and graph validation without introducing regressions, restoring deleted extensions, or modifying unrelated runtime state.

- `depends_on`: `task-3`
- `parallel`: false
- `conflicts_with`: none
- `files`: none
- Verify: `node --experimental-strip-types --test .pi/tests/research-enforcement.test.ts`
- Verify: `node --experimental-strip-types --check .pi/extensions/research-enforcement/policy.ts && node --experimental-strip-types --check .pi/extensions/research-enforcement/index.ts`
- Verify: `node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/research-enforcement-extension/tasks.json`
- Verify: `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`
- Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`
- Verify: `git diff --check -- .pi/extensions/research-enforcement .pi/research-enforcement.json .pi/tests/research-enforcement.test.ts .pi/artifacts/research-enforcement-extension`

## Success Criteria

1. Research-required turns are classified into deterministic `standard` or `high` tiers while local/mechanical turns remain `none`. Verify: focused classification tests pass.
2. Standard evidence requires one successful provider category plus a citation; high evidence requires two independent categories plus claim-level mapping. Verify: focused evidence and citation tests pass.
3. Direct research calls—including opt-in `xai_grok_web_search`—and valid Fabric trace V1 refs are recognized, while failures, inactive availability, and malformed traces are rejected. Verify: focused direct and trace tests pass.
4. A noncompliant turn receives at most one transparent correction, with state persisted before dispatch and reset on a new user turn. Verify: focused lifecycle tests pass.
5. Configuration, status, and metrics expose no raw sensitive research content. Verify: focused configuration and privacy tests pass.
6. Main discovery and child load/exclusion behavior use existing Pi contracts without runtime agent inference. Verify: focused scope tests and source inspection pass.
7. Integrated verification introduces no new failures: the full retained suite passes, or only the two documented unrelated baseline failures remain exactly attributable. Verify: full suite, graph validation, syntax checks, and `git diff --check` complete with recorded evidence.

## Risks and Mitigations

- **False positives disrupt normal work.** Keep explicit tier rules, an opt-out, and focused classification fixtures.
- **Fabric trace schema drift hides research.** Accept only typed V1 records, isolate normalization, and fail safely.
- **Correction loops or races create duplicate turns.** Persist the marker before dispatch and enforce one correction per user turn.
- **Citation shape may be mistaken for truth.** Label checks as structural and avoid semantic claims.
- **Metrics leak sensitive data.** Store category and outcome counters only.
- **Isolated children bypass enforcement.** Document extension loading as a scope boundary and test supported load/exclusion behavior.
- **Existing baseline failures obscure regressions.** Capture exact baseline attribution and require no additional failures.
- **xAI search can consume credits if activated.** Count only explicit successful use; the enforcement extension never enables or invokes it automatically.
- **Old deleted extensions are accidentally restored.** Assert prohibited legacy paths remain absent during final verification.

## Resolved Decisions

- Phase one is enforcement over existing tools; unified executing adapters are deferred.
- Work continues in the canonical checkout on `main` by explicit user choice; no branch or worktree is created.
- Standard compliance uses one authoritative provider category plus citation.
- High-risk compliance uses two independent categories plus `[S<n>]` claim-level mapping.
- Shared project policy and existing child load/exclusion controls replace unsupported runtime agent profiles.
- Metrics are secondary and metadata-only; reliable search utilization is the primary outcome.
- xAI web search is an authoritative independent category only after explicit opt-in and a successful result; enforcement never activates the paid tool.

## Open Questions

None blocking implementation. Provider adapters may be reconsidered as a separate future feature after enforcement behavior is measured.