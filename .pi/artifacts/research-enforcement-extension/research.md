# Research: Pi Research-Enforcement Extension

**Completed:** 2026-07-25T12:34:34Z  
**Execution mode:** Complex / deep-research workflow  
**Topic:** Feasibility of a trusted project-local Pi extension that detects research-required turns, routes Context7/Exa/Codex research, requires citations, and performs one transparent corrective pass for Main and configurable subagents.

## Executive Summary

The corrective enforcement design is feasible with high confidence. Pi exposes the required prompt, tool, message, settled-run, persistence, command, and UI hooks. A project-local extension can classify a turn in `before_agent_start`, observe successful research in `tool_call`/`tool_result`, inspect the finalized assistant response, and trigger exactly one labelled corrective turn after `agent_settled`.

One part of the rough design needs refinement: a project extension cannot safely call existing tools such as `mcp` or `codex_search` by name. `ExtensionAPI.getAllTools()` returns metadata only and no public peer-tool execution API exists. A genuinely unified executing `research` tool must own provider adapters, or the first implementation should route and enforce use of the existing direct tools without pretending they are wrapped.

## Questions and Answers

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| Can Pi detect research-oriented turns and inject routing policy? | Answered | High | Yes, through `before_agent_start`; classification remains a project-defined heuristic. |
| Can it observe actual retrieval and citation evidence? | Answered | High | Yes, via tool events, tool results, and finalized assistant messages. Provider-specific result parsing is needed. |
| Can it perform one corrective pass without looping? | Answered | High | Yes. Trigger one displayed extension message after `agent_settled`, persist a per-turn correction marker, and suppress re-entry. |
| Can a unified tool execute installed peer-extension tools? | Answered | High | No supported public API exists. `getAllTools()` is metadata-only. |
| Can a unified tool own Context7, Exa, and Codex adapters? | Partial | Medium | Context7 direct HTTP and MCP ownership are demonstrated. Codex internals are reusable but not a stable public package API; exact Exa transport/schema still needs resolution. |
| Can policy vary between Main and subagent types? | Partial | Medium-high | Project extensions can be selectively loaded by subagent configuration, but Pi exposes no stable main/subagent-type discriminator inside the extension. Prefer load-time configuration over session-name inference. |
| Will project-local loading work everywhere? | Answered | High | Only in trusted projects; non-interactive sessions also need saved trust, `defaultProjectTrust: "always"`, or `--approve`. Custom cwd/isolation may prevent child loading. |

## Verified Findings

### 1. Corrective enforcement is supported

- `before_agent_start` can inject a message or replace the system prompt for the turn. **High confidence.**  
  Source: `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md:521-556`
- Public events include `message_end`, `tool_call`, `tool_result`, and `agent_settled`. **High confidence.**  
  Sources: `docs/extensions.md:558-594,751-765,814-825`; `dist/core/extensions/types.d.ts:517-570,642-692,847-878`
- `pi.appendEntry()` provides durable, non-context extension state; session APIs can recover it. **High confidence.**  
  Sources: `docs/extensions.md:1491-1518`; `docs/session-format.md` “CustomEntry” and “SessionManager API”
- `pi.sendMessage(..., { triggerTurn: true })` can create a visible extension-labelled correction. This is more transparent than `sendUserMessage`, which makes extension text appear as user-authored text. **High confidence.**  
  Sources: `docs/extensions.md:1386-1433`; `examples/extensions/send-user-message.ts:16-70`

### 2. Project trust and subagents constrain scope

- Project-local extensions under `.pi/extensions` load only after project trust. **High confidence.**  
  Source: `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/security.md:5-29`
- pi-subagents can load all discovered extensions with `extensions: true`, allowlist them with an array, or disable them through isolation/exclusions. Custom cwd/config cwd affects discovery. **High confidence.**  
  Sources: `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/src/agent-runner.ts:350-376,500-528,579-645,730-775`; `src/agent-manager.ts:200-260`
- `ExtensionAPI` and `ExtensionContext` expose no stable parent identity or agent type. Session names are only a convention. **High confidence.**  
  Sources: Pi `dist/core/extensions/types.d.ts:207-224,845-940`; pi-subagents `src/agent-runner.ts:812-815`

### 3. A peer-tool wrapper is not supported

- `getAllTools()` returns schemas, guidelines, and source metadata, but there is no public execute-by-name method on `ExtensionAPI`. **High confidence.**  
  Sources: `dist/core/extensions/types.d.ts:922-929`; `docs/extensions.md:1622-1647`
- pi-mcp-adapter 2.13.0 registers its own `mcp` tool and keeps connection state plus `executeCall` inside its extension implementation; it does not publish a stable cross-extension invocation API. **High confidence.**  
  Sources: `/home/ryan/.pi/agent/npm/node_modules/pi-mcp-adapter/package.json:1-18`; `index.ts:579-616,701-703`
- pi-codex-search 0.1.6 exposes lower-level source helpers internally, but has no explicit package exports map for them. Deep imports would be version-coupled and would still require auth/config glue. **High confidence.**  
  Sources: `/home/ryan/.pi/agent/npm/node_modules/pi-codex-search/package.json:1-35`; `src/codex.ts:1-52`; `src/pi-auth.ts:19-35`

### 4. Provider ownership is technically possible

- Historical `HEAD:.pi/extensions/context7.ts` directly called Context7 API v2 and registered one native tool. **High confidence.**
- Historical `HEAD:.pi/extensions/skill-mcp.ts` and `skill-mcp/client.ts` spawned MCP servers and issued JSON-RPC `tools/list`/`tools/call`. **High confidence.**
- Codex Search exposes structured citations in tool details, reducing heuristic parsing for that provider. **High confidence.**  
  Source: `pi-codex-search/index.ts:534-596,732-753`

These deleted paths were inspected from Git history only and were not restored or modified.

## Recommendation

Preserve the approved corrective policy, but separate enforcement from provider integration:

1. Treat the extension as the owner of turn classification, evidence tracking, citation checking, one-pass correction, status, and loop prevention.
2. For the lowest-risk first implementation, route the model explicitly to the already available Context7, Exa, Codex Search, or scout surfaces and count their successful results. This directly addresses the reported failure: Main not searching.
3. Add an executing unified `research` tool only with explicit provider adapters. Do not claim to wrap peer tools through `getAllTools()`.
4. Prefer direct Context7/Exa APIs or a maintained MCP client. For Codex, either obtain a stable upstream library export or accept and test a pinned deep import as a known compatibility risk.
5. Apply per-agent policy through extension loading/configuration. Do not infer agent type from session names.
6. Use a displayed custom correction message and persist one correction marker per originating turn.

## Risks and Uncertainties

- Research-required and citation-compliance classification will remain heuristic and needs false-positive tests.
- Exact Exa credentials, transport, result schema, and structured citation fields remain unresolved.
- Codex deep imports may break on package updates.
- Subagents using isolation, excluded extensions, or a different cwd may not receive enforcement.
- Two phase-one scouts exhausted their turn limits without a final packet; their two angles were re-investigated directly and cross-checked by a dependent review agent.
- The existing active artifact `agent-subagent-utilization-research` is unrelated to this feature, so this report is intentionally standalone and `.pi/artifacts/.active` was not changed.

## Open Items Before Planning

1. Choose MVP integration: enforce existing direct tools first, or build owned provider adapters immediately.
2. Resolve Exa’s exact supported transport and citation schema.
3. Decide whether a pinned Codex deep import is acceptable or whether upstream support is required.
4. Define config semantics for Main and each subagent without relying on runtime identity inference.

## Source Set

- Pi official installed docs: `docs/extensions.md`, `docs/security.md`, `docs/session-format.md`
- Pi official types/examples: `dist/core/extensions/types.d.ts`, `examples/extensions/send-user-message.ts`
- pi-subagents installed source: `src/agent-runner.ts`, `src/agent-manager.ts`
- pi-mcp-adapter 2.13.0 installed source and package metadata
- pi-codex-search 0.1.6 installed source and package metadata
- Historical Pi Core extension sources read from `HEAD`
