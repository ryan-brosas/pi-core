# deep-research

Fan out web searches across multiple angles on a question, cross-check sources for contradictions, and produce a cited report with confidence levels. Use when you need multi-source verification or current-events coverage.

## Pi Subagent Execution

Use the pi-subagents `Agent` tool, not Fabric agents, actors, or mesh:

```typescript
Agent({
  subagent_type: "<configured name>",
  description: "<short task label>",
  prompt: `<self-contained phase prompt with resolved inputs and output contract>`,
  run_in_background: true, // only for independent concurrent calls
});
```

- Concurrency 1: omit `run_in_background`, consume the foreground result, then continue.
- Concurrency >1 or dynamic: issue all independent calls together with `run_in_background: true`; let smart join return the group. Do not poll.
- Do not start a dependent phase until upstream results are available.
- Omit `model` and `thinking`; scoped agent definitions own those settings.
- The parent resolves placeholders before dispatch, synthesizes results, inspects child changes, and runs verification itself.

## Args

- `question` (required) — The research question or topic

## Phases

### Phase 1: research

- **Subagent type:** `scout`
- **Concurrency:** Dynamic (1 agent per parent-defined angle, min 3, max 10)
- **Dispatch:** Before spawning, the parent defines distinct `{angle}` values and gives exactly one angle to each scout. Do not send the same broad prompt to every scout.
- **Prompt:**

Research this angle only: {angle}. Question: {question}. Use authoritative sources and relevant recent developments. For each finding, include the URL and publication date. Return findings grouped by angle in this format:

## Angle: [angle name]
- **Finding:** [summary]
- **Source:** [URL]
- **Date:** [publication date]
- **Confidence:** [high/medium/low]

Keep each finding under 200 words.

### Phase 2: cross-check

- **Depends on:** Phase 1
- **Subagent type:** `review`
- **Concurrency:** 1
- **Prompt:**

Cross-check the complete joined Phase 1 result: {phase_1_output}. Flag contradictions between sources, identify confirmable facts with supporting citations, and note where sources disagree or lack evidence. Return a verified fact set in this format:

## Verified Facts
- **Fact:** [statement]
- **Confidence:** [high/medium/low]
- **Supporting sources:** [list of URLs]

## Contradictions
- **Claim A:** [statement]
- **Claim B:** [contradicting statement]
- **Resolution:** [which is more credible and why]

Keep each item under 150 words.

## Final Synthesis (Main Agent)

After Phase 2 completes, synthesize the final report directly from {phase_2_output}.

Write a final cited report using markdown with sections:
1. **Executive Summary** — Brief overview of key findings
2. **Key Findings** — Detailed findings with inline citations
3. **Contradictions & Uncertainties** — Areas of disagreement or low confidence
4. **Sources** — Complete list of all sources consulted

Annotate each claim with confidence level (high/medium/low). Keep the report under 2000 words.
