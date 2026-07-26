# Research: Code as a Resource — Curated Corpus vs. Process Scaffolding

**Date:** 2026-07-26
**Execution mode:** Direct (moderate depth, ~14 tool calls)
**Trigger:** Discord exchange (Tom / Rykuuun) — "code from scratch is cheap, code you hold is valuable"; closing ask: "can we design something related code as a resource"
**Enforcement:** authoritative sourcing required via Context7, Exa, Codex Search, xAI Web Search

---

## 1. Provider evidence log

| Provider | Ref invoked | Status |
|---|---|---|
| Context7 | `mcp.context7.resolve-library-id` → `mcp.context7.query-docs` (`/websites/code_claude`, reputation High, benchmark 81.61) | OK |
| Exa | `mcp.exa.web_search_exa` (5 results, 1394ms) | OK |
| Codex Search | `extensions.codex_search` (3 queries, `freshness: indexed`, `search_context_size: high`, 0 failures, 11 citations) | OK |
| xAI Web Search | `extensions.xai_grok_web_search` | **BLOCKED — not obtained** |

**xAI blocker (verified, not assumed):** the tool returned `Error: web_search requires an active xAI/Grok model. No xAI request was sent.` This is a hard model-scope gate in the extension source at `pi-xai-oauth/extensions/xai/tools/grok-native.ts:1004`, covered by `tests/tools/model-scope.test.ts:16` ("requires an active xAI model for web_search"). The host session model is Claude, so no xAI request can be issued.

Attempted workaround: route the call through a Grok-model child (`xai-auth/grok-4.5` is present in `tools.models()`). Rejected by Fabric — `agents.enabled: false` at `.pi/fabric.json:8`. **xAI Web Search cannot be satisfied from this session without switching the host model or enabling agents.**

---

## 2. Questions

| # | Question | Status | Confidence |
|---|---|---|---|
| Q1 | Is "curated examples over rules" vendor-endorsed, or folk wisdom? | Answered | High |
| Q2 | Does this pattern have a named, published shape? | Answered | Medium-High |
| Q3 | Does research support in-repo exemplar retrieval improving code generation? | Answered | High |
| Q4 | What is the supported delivery mechanism into an agent session? | Answered | High |
| Q5 | Where does the existing `.pi/corpus/` sit against that evidence? | Answered | High (direct file read) |
| Q6 | Should corpus retrieval be intent-based (LLM-classified) or lexical? | **Unresolved** | — |

---

## 3. Findings

### 3.1 The vendor position is explicitly "canonical examples, not rule lists"

Anthropic's *Effective context engineering for AI agents* (2025-09-29) states few-shot prompting remains a best practice, but warns against stuffing prompts with edge cases. It recommends **"a set of diverse, canonical examples"** to demonstrate desired behavior rather than an enumerated rule list.

*Effective agents* (2024-12-19) adds the sharper point: many use cases are handled by **retrieval plus in-context examples** before more complex agent architectures are warranted.

> This is the direct evidentiary answer to "I've been obsessed with template and workflow." The vendor's own guidance ranks retrieved examples **above** added process machinery, not beside it.

**Confidence:** High — first-party vendor engineering guidance, two independent posts.
**Source:** Codex Search.

### 3.2 The pattern has a name: codebase-derived pattern library

agentpatterns.ai documents this exact idea as *Codebase Pattern Library Context* (2026-07-02): "A library of proven implementations mined from your own repositories, indexed by intent and served to an agent as retrievable context rather than generic examples."

The framing worth keeping:

> "This is a retrieval problem with a sharper corpus. […] A pattern library instead tunes **what is in the corpus**, narrowing it to vetted, in-house code rather than the open web."

Claimed benefits: higher signal (merged code already encodes your conventions and error handling, so it needs less correction); consistency (avoids a third way to do the same thing); privacy (local store, local transport).

Named risks — these are the load-bearing part:

- **Staleness** — the index reflects the codebase at extraction time and drifts toward deprecated patterns if not rebuilt.
- **Pattern lock-in** — retrieval propagates whatever is already there. "The library amplifies the codebase's habits, good and bad."
- **Maintenance cost** — earns its keep only when reuse is frequent enough to offset re-indexing.

**Confidence:** Medium-High — single practitioner source, but specific, dated, and consistent with tier-3 research below.
**Source:** Exa.

### 3.3 Research literature: retrieval helps, but *retrieval quality* is the variable

Consensus across peer-reviewed work is that retrieving in-repo exemplars improves code generation, especially for repository-level tasks with cross-file dependencies and project-specific symbols. Notably, *Can Long-Context Language Models Solve Repository-Level Code Generation?* finds **RAG/retrieval still tends to outperform long-context alone** on larger repositories — i.e. a corpus you can search beats simply pasting more in.

The caveat that matters: reported gains "depend heavily on retrieval quality, context selection, and repository size/structure." **Having a corpus is not the win; being able to hit the right entry is the win.**

**Confidence:** High — six sources incl. a 2025 survey and multiple OpenReview papers.
**Source:** Codex Search.

### 3.4 Delivery mechanism: progressive disclosure via reference files

Claude Code documentation shows the supported shape — a thin always-loaded pointer that references heavier files loaded only on demand:

```markdown
## Additional resources

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

Skills are filesystem artifacts auto-discovered at startup and invoked autonomously based on context. This reconciles with the existing decision that the corpus is deliberately *not* a skill: skills are the **pointer** layer, and the corpus can remain a separate retrievable store that a thin pointer references. The two are not competing designs.

**Confidence:** High — official vendor documentation.
**Source:** Context7 (`/websites/code_claude`).

### 3.5 Context engineering framing, and the trap inside it

Birgitta Böckeler (martinfowler.com, 2026-02-05) defines context engineering, via Bharani Subramaniam, as "curating what the model sees so that you get a better result," and observes that **almost all** current AI-coding context engineering "ultimately involve[s] a bunch of markdown files with prompts" — split into *instructions* (do this) and *guidance* (rules/guardrails).

That observation is the trap the corpus is designed to escape: if the corpus degenerates into more markdown prose about code, it has become guidance again. Its distinguishing property is that entries are **runnable artifacts**, not descriptions of artifacts.

**Confidence:** High — recognized authoritative practitioner source.
**Source:** Exa.

### 3.6 Precedent for a derived index

`llms.txt` (Jeremy Howard / Answer.AI) is a curated Markdown index pointing at high-signal content instead of forcing parsers through raw HTML. Status is an **emerging convention, not a ratified standard** — cite it as precedent for shape, never as a compliance requirement.

**Confidence:** High for what it is; the "not a standard" qualifier is explicit in the source.
**Source:** Codex Search.

---

## 4. Assessment of the existing `.pi/corpus/`

Read directly at `/home/ryan/repo/pi-core/.pi/scripts/corpus.ts` and `/home/ryan/repo/pi-core/.pi/corpus/`.

Current state: one entry (`node-cli-with-pure-core/` → `entry.json` + `task-graph.ts`). Schema is `{slug, summary, tags, origin, deposited, files}`, validated for kebab-case slug, slug/directory agreement, non-empty summary and origin, ISO date, non-empty file list, and path-escape rejection. `scanCorpus` derives the index at read time; `searchCorpus` does lowercase substring matching.

Against the evidence:

| Evidence | Corpus today | Gap |
|---|---|---|
| Vetted in-house corpus over generic examples (3.1, 3.2) | Satisfied by construction | — |
| Derived, not stored, index (3.6) | Satisfied — `scanCorpus` derives per read | — |
| Runnable artifacts, not prose (3.5) | Satisfied — entries are `.ts` files | — |
| **Retrieval quality is the actual variable (3.3)** | `searchCorpus` is substring match over text fields | **Largest gap.** Corpus grows → recall degrades. This is where measured gains come from. |
| **Staleness risk (3.2)** | `deposited` recorded; nothing validates freshness or drift from origin | Date is captured but unused as a signal |
| **Pattern lock-in risk (3.2)** | No field records *why* an entry is good or what validated it | An entry cannot be distinguished from a merely-old entry |

---

## 5. Decisions

### D1 — Is "code as a resource" a sound design direction?

- **Evidence:** 3.1 (vendor), 3.2 (named pattern), 3.3 (peer-reviewed).
- **Confidence:** High.
- **Alternatives considered:** more workflow/template scaffolding (contradicted by 3.1); rely on long context instead of retrieval (contradicted by 3.3).
- **Contract impact:** none yet — validates the existing `.pi/corpus/` direction rather than changing it.
- **Unresolved risk:** the pattern's payoff is conditional on reuse frequency (3.2 maintenance cost). One entry is not yet evidence of payoff.

### D2 — What is the highest-value next change?

- **Decision:** improve **retrieval quality**, not schema breadth.
- **Evidence:** 3.3 states gains depend heavily on retrieval quality and context selection; 3.2 frames the whole thing as "a retrieval problem with a sharper corpus."
- **Confidence:** High on the direction; the specific mechanism is Q6, still open.
- **Alternatives:** add more entries first (defensible — a 1-entry corpus has no retrieval problem yet); add intent classification now (premature without volume).
- **Contract impact:** would change `searchCorpus`, not `validateEntry`. `entry.json` v1 stays readable.
- **Unresolved risk:** optimizing retrieval against a 1-entry corpus is unmeasurable. Recommend deferring until entry count makes recall failures observable.

### D3 — Should the corpus become a skill?

- **Decision:** no; keep the existing separation.
- **Evidence:** 3.4 — skills are the pointer/progressive-disclosure layer; the corpus is the retrievable store. These compose rather than compete.
- **Confidence:** High.
- **Contract impact:** none.

---

## 6. Open items

1. **xAI Web Search was not obtained.** Blocked by a verified model-scope gate plus `agents.enabled: false`. Requires either an xAI host model or enabling Fabric agents. Research enforcement for this session is therefore **3 of 4 named providers**.
2. **Q6 unresolved:** intent-based retrieval (AST extraction + LLM classification, per 3.2) vs. improved lexical search. Not decidable at current corpus size.
3. **No staleness signal.** `deposited` exists but nothing consumes it; risk 3.2 is unmitigated.
4. **No provenance-of-quality field.** Nothing records what validated an entry, which is the specific defense against pattern lock-in (3.2).

---

## 7. Sources

**Context7** — `/websites/code_claude`
- Claude Code — referencing supporting files from SKILL.md: https://code.claude.com/docs/en/slash-commands
- Claude Agent SDK — Skills: https://code.claude.com/docs/en/agent-sdk/skills

**Exa**
- Codebase Pattern Library Context (2026-07-02): https://agentpatterns.ai/context-engineering/codebase-pattern-library-context/
- Böckeler, *Context Engineering for Coding Agents* (2026-02-05): https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html

**Codex Search**
- Anthropic, *Effective context engineering for AI agents* (2025-09-29): https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, *Building effective agents* (2024-12-19): https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, *Writing effective tools for AI agents* (2025-09-11): https://www.anthropic.com/engineering/writing-tools-for-agents
- *Retrieval-Augmented Code Generation: A Survey with Focus on Repository-Level Approaches*: https://arxiv.org/abs/2510.04905
- *RepoHyper: Better Context Retrieval Is All You Need*: https://openreview.net/forum?id=AIg9u1AjwlG
- *Can Long-Context Language Models Solve Repository-Level Code Generation?*: https://openreview.net/forum?id=pmcWo9DtDw
- *Repository-Level Prompt Generation for LLMs of Code*: https://openreview.net/forum?id=MtGmCCPJD-
- *Teaching Code LLMs to Use Autocompletion Tools (ToolGen)*: https://arxiv.org/abs/2401.06391
- *Iterative Refinement of Project-Level Code Context (CoCoGen)*: https://openreview.net/forum?id=sxXV2-mK1-
- AnswerDotAI/llms-txt: https://github.com/answerdotai/llms-txt

**xAI Web Search** — no sources; provider blocked (see §1).