---
description: Research a topic before implementation
argument-hint: "<topic> [--quick|--thorough] [--save] [--slug <slug>]"
---

# Research: $ARGUMENTS

Gather information before implementation. Find answers, document findings, stop when done.

> Research can happen at any phase when you need external information or codebase understanding.

Delegated research is advisory rather than source evidence; the parent verifies citations directly with configured source tools before synthesis.

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

Research is read-only by default and returns in chat. Persist it only when one of these conditions holds:

1. The user supplied `--save` or explicitly requested a durable report.
2. The user supplied `--slug <slug>` for an existing related feature whose durable decision record should receive the findings.
3. The report is too large for a useful chat result and the user approved creating a file.

When persistence is justified:

- With an explicit `--slug <slug>`, verify that the feature exists, is incomplete, and is demonstrably related before appending a dated `## Research: [topic]` section to its `progress.md`.
- Without `--slug`, derive a stable standalone slug and write `.pi/artifacts/<research-slug>/research.md`, after obtaining approval if this creates a new file.
- Never infer feature ownership or artifact destination from ambient state, prior commands, or unrelated work.
- Cite the artifact path in the final response.

Do not create lifecycle artifacts merely to prove that research occurred.

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
5. **Persist only when required** by the Artifact Destination policy above

**Announce:** "This is complex research requiring multi-angle analysis. Invoking deep-research workflow."

## Direct Execution (Simple Research)

If complexity is simple, execute directly:

### Parse Arguments

| Argument         | Default  | Description                         |
| ---------------- | -------- | ----------------------------------- |
| Topic            | required | What to research                    |
| `--quick`        | false    | Up to 5 source calls for one bounded question |
| `--thorough`     | false    | Up to 20 source calls across distinct unresolved questions |
| `--save`         | false    | Persist a durable report using the Artifact Destination policy |
| `--slug <slug>`  | none     | Explicitly selected related feature destination |

Default depth: up to 10 source calls. These are ceilings, not targets; stop as soon as the implementation decision has medium-or-higher-confidence evidence.

### Before You Research

- **Be certain**: Only research what you need for implementation
- **Don't over-research**: Stop when you have enough to proceed
- **Use source priority**: Codebase → Docs → Source → GitHub → Web
- **Verify confidence**: Medium+ confidence required before stopping
- **Document findings**: Return a concise cited synthesis; persist only under the Artifact Destination policy above

### Available Tools

| Tool or task role        | Use When                        |
| ------------------------ | ------------------------------- |
| Fabric local discovery   | Codebase patterns, LSP analysis |
| Fabric external research | External docs, best practices   |
| `context7`   | Official API references         |
| `opensrc`    | Package source code inspection  |
| `grepsearch` | GitHub code search / real-world examples |

### Phase 1: Load Context

If `--slug <slug>` was supplied, read only that exact artifact’s `spec.md` and extract questions that need answering after confirming relevance. Without `--slug`, no feature artifact is selected.

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
- The selected source-call ceiling is reached
- The last 3 source calls yielded no decision-relevant evidence
- Blocked and need human input

### Phase 4: Document

Produce the report in chat, or persist it when required by the Artifact Destination policy. Include:

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
| Plan details   | `/plan <slug>` |
| Pick up work   | `/ship <slug>` |
| Audit codebase | `/audit`     |
