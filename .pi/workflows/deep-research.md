# deep-research

Fan out web searches across multiple angles on a question, cross-check sources for contradictions, and produce a cited report with confidence levels. Use when you need multi-source verification or current-events coverage.

## Fabric Agent Execution

Run one-shot children with `agents.run({...})` inside `fabric_exec`; there are no named project agent profiles:

```typescript
const researchTools = ["read", "grep", "find", "ls", "exa.web_search_exa", "exa.web_fetch_exa"];
const result = await agents.run({
  name: "external-research-worker",
  task: "[resolved self-contained research angle, source requirements, non-goals, output, stop conditions, and verification]",
  tools: researchTools,
});
return result.text;
```

- Await one foreground run when its result is required by the next phase.
- A concurrent wave contains at most three genuinely independent `agents.run` calls issued together with `Promise.all`; process additional work in sequential shards.
- Do not start a dependent phase until upstream results are available.
- Use an explicit `tools` allowlist per phase. External research adds only the required configured network source tools; add `bash`, `edit`, or `write` only for approved modifying work.
- An `agents.run` lifecycle operation is not provider evidence. The parent directly invokes configured source tools to verify cited sources, resolves placeholders, synthesizes results, and runs verification itself.
## Args

- `question` (required) — The research question or topic

## Phases

### Phase 1: research

- **Fabric task role:** `external-research`
- **Concurrency:** Dynamic (one `agents.run` call per parent-defined angle, min 1, max 3)
- **Dispatch:** Before running the wave, the parent defines distinct `{angle}` values and gives exactly one angle to each research child. Do not send the same broad task to every child. If more than three angles remain, complete sequential shards of at most three before starting the dependent cross-check.
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
- **Fabric task role:** `read-only-cross-check`
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
