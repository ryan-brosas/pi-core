# Lifecycle Agent Routing and Research-Enforcement Audit

- **Completed:** 2026-07-26
- **Status:** Research complete
- **Execution mode:** Complex, bounded workflow
- **Related active work:** `contract-seam-feedback-lifecycle`
- **Artifact scope:** Standalone research; `.pi/artifacts/.active` remains unchanged

## Executive Summary

Use direct parent context first for `/research`, `/create`, and `/plan`. When material evidence is still missing, use one awaited, one-shot Fabric child through `agents.run`; use up to three only for genuinely independent angles. Do not introduce a persistent actor for lifecycle intake or planning. These phases require their result before parent synthesis, while Hindsight plus `spec.md`, `plan.md`, `tasks.json`, and `progress.md` already form the persistent context layer.

The research-enforcement extension is compatible with the current Fabric action surface at the configured-route and trace-observation layer. Its four provider categories resolve, successful exact Trace V1 refs are credited, orchestration calls do not count, and the focused suite passes 72/72. No compatibility rewrite is needed.

Two bounded corrections are recommended: distinguish configured retrieval routes from authoritative primary sources in injected guidance, and align `/research` documentation with the four enforced Fabric routes. Provider-result-to-citation URL binding is optional stronger hardening and should be scoped separately because it changes evidence and privacy semantics.

## Questions and Confidence

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| How should lifecycle phases route delegated work? | Answered | High | Parent-owned by default; one awaited `agents.run` child only for bounded missing evidence. |
| When is parallel fan-out justified? | Answered | High | Only for genuinely independent subtasks or materially useful independent perspectives. |
| Is a persistent actor warranted? | Answered | High | No; there is no recurring event-driven responsibility requiring a durable mailbox and retained actor state. |
| Is research enforcement Fabric-compatible? | Answered | High | Yes for exact configured refs, successful Trace V1 observation, and orchestration exclusion. |
| Does current compliance prove source authority or provider-to-citation provenance? | Answered | High | No; provider success and structural citation validity are independent checks. |

## Evidence

### Local contracts

- `.pi/prompts/research.md:14-21` makes direct parent work the default, requires awaited one-shot children when needed, limits parallel runs to independent questions, and states that `agents.run` is not provider evidence.
- `.pi/prompts/create.md:14-21,61-116` keeps clarification and specification parent-owned while allowing bounded local discovery.
- `.pi/prompts/plan.md:25-75` keeps planning synthesis parent-owned and permits one advisory child only for material ambiguity, architectural trade-offs, or cross-subsystem sequencing.
- The local Fabric agents reference defines `agents.run` as a one-shot run-to-completion operation. Persistent actors instead have a fixed runner, serial mailbox, subscriptions, and restored state.
- `.pi/skills/development-lifecycle/SKILL.md` assigns durable cross-feature context to Hindsight and active evidence to the four lifecycle artifacts.

### Research-enforcement implementation

- `.pi/extensions/research-enforcement/policy.ts:125-163` configures four categories:
  - `mcp.context7.query-docs`
  - `mcp.exa.web_search_exa` and `mcp.exa.web_fetch_exa`
  - `extensions.codex_search`
  - `extensions.xai_grok_web_search`
- All five exact actions resolve in the current Fabric registry.
- `.pi/extensions/research-enforcement/policy.ts:505-565` accepts only successful Fabric Trace V1 envelopes and successful exact matching refs.
- `.pi/extensions/research-enforcement/index.ts:341-383` observes successful direct results and Fabric trace details.
- `.pi/tests/research-enforcement.test.ts:735-748` proves that `agents.run`, `agents.spawn`, and removed orchestration variants do not count as source-provider evidence.
- Fresh verification: `node --experimental-strip-types --test .pi/tests/research-enforcement.test.ts` passed **72/72**, with zero failures.

### External corroboration

The primary sources below were located and fetched directly through Exa. Exa is the retrieval route; Anthropic and Microsoft are the source authorities.

- Anthropic recommends finding the simplest solution possible and increasing agentic complexity only when needed. Its parallelization pattern applies to independent subtasks or multiple perspectives that materially improve confidence [S1].
- Anthropic reports that multi-agent research is strongest for breadth-first questions pursuing multiple independent directions. It also reports rapidly increasing coordination complexity and over-allocation to simple queries as failure modes [S2].
- Microsoft describes actors as perpetually addressable entities that encapsulate identity, state, and behavior and communicate through asynchronous messages [S3]. This supports using actors for stable, recurring responsibilities rather than one-shot lifecycle inputs.

## Findings

### 1. Parent synthesis is the correct authority

Lifecycle intake and planning decisions depend on user intent, local contracts, Hindsight, and canonical artifacts. The parent must reconcile those inputs and immediately use the result. An awaited one-shot child preserves this control flow; an actor introduces an unnecessary durable context boundary.

### 2. Parallelism must follow independence

Use up to three children only when the questions can be answered independently. Dependent discovery, review, and synthesis remain sequential. This matches both the current prompts and Anthropic's documented parallelization conditions [S1] [S2].

### 3. Basic Fabric compatibility is already correct

The extension recognizes every configured exact route, rejects malformed or failed traces, and excludes orchestration. The registry and tests support the current compatibility claim. Action registration does not prove live health for every paid or model-dependent provider, so xAI should not be invoked merely as a health check.

### 4. Retrieval routes are not inherently authoritative

The current injected wording in `.pi/extensions/research-enforcement/index.ts:258-275` can imply that Exa, Codex Search, or xAI is itself authoritative. These tools retrieve candidate sources; authority comes from the primary source selected from the result.

Recommended standard-tier wording:

> Directly call at least one configured source provider through `fabric_exec`—Context7, Exa, Codex Search, or xAI Web Search—use an authoritative primary source from its result, and cite it. `agents.run` alone is not provider evidence.

High-tier guidance should preserve the current requirement for two independent provider categories and structured Findings/Sources citations while making the same route/source distinction.

### 5. `/research` documentation is misaligned

`.pi/prompts/research.md:99-125` still emphasizes generic `context7`, `opensrc`, and `grepsearch`. It should name the four configured Fabric source routes and explain that source authority must be evaluated after retrieval.

### 6. Citation provenance is intentionally not enforced

`.pi/extensions/research-enforcement/policy.ts:617-776` validates citation structure only. Any syntactically valid HTTPS URL can satisfy the standard citation check. Compliance then combines that independent result with a successful provider category.

Therefore, current enforcement does not prove that:

- the cited URL appeared in the provider result;
- the cited page is a primary or authoritative source;
- the source supports the claim being made.

Strict URL binding would require transient extraction and normalization of provider-result URLs, comparison against final citations, mismatch/provider-matrix tests, and an explicit privacy policy for URL handling. This is separate hardening, not a basic compatibility repair.

### 7. Child network-tool propagation needs investigation

One bounded `agents.run` child was given Exa actions in its explicit allowlist but reported only local discovery tools and completed with zero tool calls. Direct parent Exa calls succeeded. The routing verdict is unchanged, but external-research children should not be documented as reliably source-capable until this propagation path is verified.

## Decision Record

| Decision | Evidence | Confidence | Alternatives | Contract impact | Unresolved risk |
| --- | --- | --- | --- | --- | --- |
| Direct parent first, one-shot child for bounded gaps | Current prompts, Fabric API, [S1], [S2] | High | Always delegate; persistent actor | No routing rewrite | Child network tools need diagnosis |
| Keep Hindsight and lifecycle artifacts as persistent context | Lifecycle skill and actor semantics [S3] | High | Parallel actor memory | Avoids competing authority | None for current phase |
| Retain exact refs and Trace V1 implementation | Local policy/index/tests; 72/72 pass | High | Compatibility rewrite | Guidance/docs only | Provider health varies by configuration |
| Scope URL binding separately | Structural validator and privacy-minimizing design | High | Keep structural-only enforcement | New evidence/privacy contract | Authority and entailment remain semantic judgments |

## Recommendation

Do not add a persistent actor and do not rewrite Fabric compatibility. If implementation is authorized later:

1. tighten standard/high injected guidance;
2. align the `/research` tool table and source-priority text;
3. investigate child network-tool propagation;
4. decide separately whether strict provider-result-to-citation binding is worth its privacy and complexity cost.

## Open Items

1. Why did the one-shot child not receive the requested Exa tools?
2. Should structural citation enforcement remain the documented boundary, or should URL provenance become a new feature?
3. If URL binding is added, what provider-result shape and transient URL-retention policy apply across all four categories?

## Sources

- **[S1]** Anthropic, *Building effective agents*, published 2024-12-19. https://www.anthropic.com/engineering/building-effective-agents
- **[S2]** Anthropic, *How we built our multi-agent research system*, published 2025-06-13. https://www.anthropic.com/engineering/multi-agent-research-system
- **[S3]** Microsoft Learn, *Orleans overview*, document date 2026-01-20, updated 2026-06-29. https://learn.microsoft.com/en-us/dotnet/orleans/overview