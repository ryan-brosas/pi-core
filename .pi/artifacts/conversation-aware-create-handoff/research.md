# Research: Conversation-aware `/research` → `/create` handoff

Date: 2026-07-25
Status: complete

## Execution

- Mode: deep-research workflow (three distinct scout angles, one replacement for an aborted angle, one local `Explore`, and one dependent `review` cross-check).
- Scope: research only; no implementation was performed.

## Questions and confidence

1. **Can `/create` already see the preceding conversation? — Answered, high confidence.** A Pi prompt template expands into the current turn; it does not start a new session. Prior messages on the active branch remain available, subject to compaction.
2. **Why is the handoff still awkward? — Answered, high confidence.** The current prompt says to reuse relevant current-session research (`.pi/prompts/create.md:99-123`) but does not define how to extract and classify confirmed requirements, tentative ideas, evidence, assumptions, or open questions. Bare `/create` also still declares its description required.
3. **Is durable extension state required? — Answered for the first iteration, high confidence.** No for same-session handoff. Native conversation context plus a structured prompt contract is sufficient. Persistence is only needed for a new session or a compaction-resistant explicit handoff.
4. **What is the safest design direction? — Answered, high confidence.** Add a bounded, visible context-handoff phase to `/create`; keep explicit arguments and latest confirmed user decisions authoritative; require confirmation when inferring a feature from a bare or ambiguous command.
5. **How should cross-session handoff work? — Partially answered, medium confidence.** Prefer Pi resume/clone/fork or an explicit report/file reference initially. A new persisted handoff format should be added only if real cross-session demand justifies freshness, privacy, and invalidation machinery.

## Verified findings

- **Native context already exists.** Pi stores active-session messages in a tree and builds model context from the active branch. Compaction is lossy for model context but preserves full JSONL history on disk. Sources: Pi `prompt-templates.md`, `session-format.md`, `sessions.md`, and `compaction.md`.
- **The repository has partial prompt support, not a complete handoff contract.** `/create` now says to reuse current-session research before spawning agents, while `/research` returns or appends findings. Neither defines a normalized handoff containing goal, confirmed decisions, constraints/non-goals, sourced findings with confidence, assumptions, and unresolved questions. Sources: `.pi/prompts/create.md:99-123`, `.pi/prompts/research.md:53-64,143-150`.
- **Artifact routing can attach research to the wrong feature.** `/research` appends to any existing `.active` slug without validating topic relevance. Source: `.pi/prompts/research.md:64,145`.
- **Ambient persistent summary is currently unsafe as the primary bridge.** `.pi/extensions/session-summary.ts` reloads project-wide state and injects it into the system prompt, but handlers only infer one intent and track files; they do not populate decisions or next steps. The current state begins with an unrelated stale intent. Sources: `.pi/extensions/session-summary.ts:53-83,117-139`, `.pi/state/session-summary.md:1-2`.
- **Subagents need explicit handoffs.** Fresh subagents do not inherit the parent conversation, so `/create` must pass any distilled conversational brief in each delegated prompt. Source: `.pi/agent-tool-description.md:26-30`.
- **External tools support a hybrid pattern.** Claude Code documents resume/continue, Codex documents persisted threads and goals, and Aider exposes explicit message/file/history inputs. These support—not prove—the design inference that ambient same-session context should be paired with an explicit, inspectable summary when reproducibility matters.

## Recommendation

Use a **prompt-first hybrid**, not an extension-first solution:

1. Add a `/create` **Context Handoff** phase before duplicate checking and new research. It should inspect only the active conversation path and produce a compact draft with: goal; confirmed requirements; constraints/non-goals; research findings with source/confidence; assumptions; open questions; and provenance (`conversation`, artifact path, or explicit argument).
2. Define precedence: explicit `/create` arguments > latest explicit user decisions > confirmed conversation findings > tentative ideas > ambient persisted summaries/MEMORY. Conflicts must be surfaced, not silently merged.
3. For bare `/create` or when multiple candidate goals exist, show the distilled brief and ask one confirmation before changing `.active` or writing `spec.md`. With clear explicit arguments and no conflicts, avoid redundant confirmation.
4. Reuse the accepted handoff before spawning more research agents, and pass it explicitly to every subagent.
5. Make `/research` end with the same compact handoff shape. Append it only when the active slug is demonstrably related; otherwise create a standalone research artifact without changing `.active`.
6. Defer session-summary changes. If cross-session handoff later proves necessary, make it feature-scoped, timestamped, source-labeled, resettable, privacy-conscious, and visibly selected by `/create` rather than silently injected.

## Edge cases and uncertainties

- Compaction may omit source links, dissent, or uncertainty; `/create` must preserve unknowns instead of converting a summary into fact.
- `/tree`, `/fork`, and `/clone` change the active path; only the selected path and deliberately imported summaries should count.
- Earlier direct user requirements remain valid instructions, while retrieved/quoted research should be delimited as untrusted evidence.
- Multiple unrelated discussions require relevance boundaries and latest-explicit-goal precedence.
- Open product choice: whether bare `/create` should be officially supported or require `/create from-context`; the lowest-friction recommendation is bare `/create` with one confirmation.

## Sources

- https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/prompt-templates.md
- https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/session-format.md
- https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md
- https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/compaction.md
- https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md
- https://docs.anthropic.com/en/docs/claude-code/cli-usage
- https://docs.anthropic.com/en/docs/claude-code/memory
- https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md
- https://aider.chat/docs/config/options.html
- https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- https://help.openai.com/en/articles/6654000-how-to-use-prompt-engineering
- https://www.atlassian.com/software/confluence/templates/product-requirements

## Next step

Run `/create "conversation-aware research-to-spec handoff"` using this report as evidence, then choose the prompt-first scope above before considering extension persistence.