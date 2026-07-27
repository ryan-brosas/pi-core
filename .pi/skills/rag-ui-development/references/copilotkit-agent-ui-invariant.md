# CopilotKit agent-UI invariant

## Source

- Repository: https://github.com/CopilotKit/CopilotKit
- Inspected revision: 4efb0969c0ee96ed6e124f78640c5317fbaeba3e
- License: MIT
- Local sparse exemplar: operator-selected `<inspo-root>/copilotkit` checkout

This skill is an independent target-native rewrite of observed invariants. **No upstream code** or substantial upstream prose is copied into the skill.

## Observable invariant retained

Retrieval becomes effective product UI when the backend emits structured, incremental state and the frontend maps validated activity/tool types to owned components. Chat remains the command surface while progress, evidence, approval, and artifacts receive dedicated representations.

Retained source evidence:

- examples/showcases/research-canvas/agent/state.py — separates sources, logs, proposal, outline, sections, and tool state from messages.
- agent/tools/tavily_search.py and section_writer.py — emit intermediate search, source, progress, and artifact state.
- frontend/src/app/page.tsx — composes progress rendering, interrupt/approval UI, source access, chat, and document canvas.
- frontend/src/components/progress.tsx, resource-modal.tsx, and structure-proposal-viewer.tsx — give distinct information distinct UI.
- packages/react-core/src/v2/hooks/use-render-tool.tsx — models partial/executing/complete tool-render states with typed schemas.
- use-render-activity-message.tsx — resolves renderer scope and validates activity payloads.
- use-agent.tsx — batches/throttles high-frequency state updates.
- use-coagent-state-render-bridge.tsx — binds and freezes message/run snapshots so later live state does not wipe history.
- Corresponding retained tests cover tool/activity rendering, throttling, rerenders, performance, and state-render claiming.

## Failure boundaries retained

- Streaming payloads are incomplete until their lifecycle says otherwise.
- Schema mismatch must not silently become trusted UI.
- Replayed/live state must not duplicate or rewrite historical renderers.
- Agent output chooses a registered semantic component; it does not supply arbitrary executable markup.
- Human approval pauses and resumes through explicit data, not modal-only local state.

## Excluded material

The clone intentionally excludes CopilotKit's multi-framework packages, channels, cloud/intelligence product, runtime adapters, A2UI/MCP Apps, CLI, most examples, and general chat styling. Those surfaces solve distribution and framework concerns rather than the RAG UI invariant.

Also excluded from adoption:

- The research backend's Tavily search/extract/prompt-stuffing implementation; it is not a complete production RAG architecture.
- Model-authored markdown footnotes without structured claim-to-source verification.
- Weakly typed cross-language state duplication, local-storage mirroring, deep JSON.stringify comparisons, deep package imports, and ignored TypeScript errors in the showcase.
- CopilotKit's renderer registry, bridge machinery, dependencies, and component styling as implementation dependencies.

## Refresh

Review a candidate upstream revision, update the sparse checkout only after confirming retained paths and behavior still exist, then update this note. Resolve the active indexed ancestor with `cgc list`; refresh it separately only with the required destructive-operation authorization. Source files remain authority even after graph ingestion.
