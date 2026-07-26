---
description: Research a topic before implementation
argument-hint: "<topic> [--quick|--thorough]"
---

# Research: $ARGUMENTS

Gather information before implementation. Find answers, document findings, stop when done.

> Research can happen at any phase when you need external information or codebase understanding.

## Fabric Agent Routing

Use `agents.run({...})` inside `fabric_exec` only when delegation saves more context or time than it costs. Direct parent work is the default; there are no named project agent profiles.

- Encode the task role, exact goal, context, non-goals, output contract, stop conditions, approval constraints, and verification in `task`.
- Supply an explicit `tools` allowlist. Local discovery, planning, and review default to `["read", "grep", "find", "ls"]`. External research adds only the required configured network tools; add mutation tools only for approved implementation work.
- Await one foreground `agents.run` when the next decision depends on its result.
- For genuinely independent questions, issue at most three `agents.run` calls in one `Promise.all`; process overflow in sequential shards.
- For small read-only discovery or research, prefer `model: "openai-codex/gpt-5.6-luna"` with `thinking: "medium"` when an explicit override is useful.
- An `agents.run` lifecycle operation is not provider evidence. The parent directly invokes configured source tools to verify citations, resolves placeholders, inspects child output, synthesizes results, and runs verification itself.
## Complexity Detection

Before starting, analyze the research topic complexity:

**Simple research** (execute directly):
- Single factual question
- One specific API or library
- Narrow scope with clear boundaries
- Example: "How does React useEffect work?"

**Complex research** (invoke workflow):
- Multi-angle topic requiring cross-checking
- Broad scope with multiple perspectives
- Requires verification from multiple sources
- Example: "What are the best practices for authentication in 2026?"

### Decision Logic

1. **Parse the topic** from $ARGUMENTS
2. **Assess complexity:**
   - Contains "best practices", "compare", "approaches", "strategies" → Complex
   - Contains "how does", "what is", "explain" → Simple
   - Topic spans multiple domains or technologies → Complex
   - Topic is narrow and specific → Simple
3. **Route accordingly:**
   - Simple → Execute directly (see "Direct Execution" below)
   - Complex → Invoke `deep-research` workflow (see "Workflow Execution" below)

## Artifact Destination

Always persist completed research before the final response:

1. Inspect `.pi/artifacts/.active` without assuming it is relevant.
2. If the active slug is valid and demonstrably related to the research topic, append a dated `## Research: [topic]` section to `.pi/artifacts/<active-slug>/progress.md`.
3. If `.active` is missing, invalid, or unrelated, derive a stable kebab-case slug from the topic, create `.pi/artifacts/<research-slug>/`, and write the report to `.pi/artifacts/<research-slug>/research.md`. If that file already contains research for the same topic, append a dated section instead of overwriting it. Do not change or overwrite `.pi/artifacts/.active`.
4. When relevance is uncertain, use the standalone `research.md` path. Never attach research to an unrelated active feature.
5. Cite the artifact path in the final response.

## Workflow Execution (Complex Research)

If complexity is detected as complex:

1. **Reuse current-session research**, then read `.pi/workflows/deep-research.md` only for unresolved gaps.
2. **Execute bounded phases:**
   - Phase 1: Run one focused external-research task for bounded work or at most three distinct angles in one `Promise.all`; process additional angles in sequential shards
   - Phase 2: After every research shard joins, run one dependent foreground read-only review to cross-check findings
   - Final synthesis: the parent combines verified results and writes the report
3. **Replace placeholders:**
   - `{question}` → the research topic from $ARGUMENTS
   - `{phase_N_output}` → actual output from completed phases
4. **Aggregate results** between phases
5. **Persist the final synthesis** using the Artifact Destination policy above

**Announce:** "This is complex research requiring multi-angle analysis. Invoking deep-research workflow."

## Direct Execution (Simple Research)

If complexity is simple, execute directly:

### Parse Arguments

| Argument         | Default  | Description                         |
| ---------------- | -------- | ----------------------------------- |
| Topic            | required | What to research                    |
| `--quick`        | false    | ~10 tool calls, single question     |
| `--thorough`     | false    | ~100+ calls, comprehensive analysis |

Default depth: ~30 tool calls for moderate exploration.

### Before You Research

- **Be certain**: Only research what you need for implementation
- **Don't over-research**: Stop when you have enough to proceed
- **Use source priority**: Codebase → Docs → Source → GitHub → Web
- **Verify confidence**: Medium+ confidence required before stopping
- **Document findings**: Persist every completed report using the Artifact Destination policy above

### Available Tools

| Tool or task role        | Use When                        |
| ------------------------ | ------------------------------- |
| Fabric local discovery   | Codebase patterns, LSP analysis |
| Fabric external research | External docs, best practices   |
| `context7`   | Official API references         |
| `opensrc`    | Package source code inspection  |
| `grepsearch` | GitHub code search / real-world examples |

### Phase 1: Load Context

If `.pi/artifacts/.active` resolves to a valid, related slug, read its `spec.md` and extract questions that need answering. Ignore unrelated active work.

#### Context Search (Required)

Use automatically recalled Hindsight project context first to skip answered questions, narrow research to genuine gaps, and avoid contradicting prior decisions without justification. If a material gap remains, call `hindsight_recall` with a topic-bounded query; use `hindsight_reflect` only when synthesis across memories is required.

### Phase 2: Research

#### Source Priority

1. **Codebase patterns** — delegate a read-only Fabric local-discovery task for LSP analysis
2. **Official docs** — `context7` for API references
3. **Source code** — `npx opensrc <package>` when docs are insufficient
4. **GitHub examples** — `grepsearch` for real-world patterns
5. **Web search** — only if tiers 1-4 don't answer

#### Delegation

| What              | Fabric task role                         | When                                   |
| ----------------- | ---------------------------------------- | -------------------------------------- |
| Codebase analysis | Read-only local discovery                | Internal patterns, file structure, LSP |
| External docs     | Read-only external research              | Library APIs, best practices           |
| Multiple domains  | Parallel distinct roles via `Promise.all` | Independent questions, maximum three   |

#### Confidence Levels

- **High**: Multiple authoritative sources agree, verified in codebase
- **Medium**: Single good source, plausible but unverified
- **Low**: Conflicting info, speculation — discard without corroboration

### Phase 3: Stop When

- All questions answered with medium+ confidence
- Tool budget exhausted for depth level
- Last 5 tool calls yielded no new insights
- Blocked and need human input

### Phase 4: Document

Persist the report using the Artifact Destination policy above. Include:

- Questions asked → answered/partial/unanswered with confidence
- Key findings with sources (file paths, docs)
- Recommendation based on findings
- Open items needing resolution

For each decision, record the decision question, evidence, confidence, alternatives, contract impact, and unresolved risks.

## Output

Report:

1. **Execution mode:** Direct or Workflow
2. Depth level and tool call count (if direct)
3. Questions with answer status and confidence
4. Key insights (bullet points)
5. Open items remaining
6. Next step suggestion

## Related Commands

| Need           | Command      |
| -------------- | ------------ |
| Create + start | `/create`    |
| Plan details   | `/plan <id>` |
| Pick up work   | `/ship <id>` |
| Audit codebase | `/audit`     |
