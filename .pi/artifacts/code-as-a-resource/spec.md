# Code as a Resource — Retrievable, Trustworthy Corpus

**Slug:** `code-as-a-resource`
**Created:** 2026-07-26
**Research:** [`research.md`](research.md) (same directory)

---

## Problem Statement

`.pi/corpus/` already holds validated working code as reference material, and the direction is sound — Anthropic's context-engineering guidance recommends "a set of diverse, canonical examples" over enumerated rule lists (https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), and the pattern is documented externally as a *codebase-derived pattern library* (https://agentpatterns.ai/context-engineering/codebase-pattern-library-context/).

But the current implementation cannot deliver on that premise as it grows, for three reasons found in `research.md`:

1. **Retrieval is unbounded and unranked.** `searchCorpus` (`.pi/scripts/corpus.ts`) returns *every* substring match in scan order. The code-generation literature is consistent that **2–4 well-selected exemplars** capture most of the benefit and that performance **degrades past roughly 3–5** through context saturation (https://www.mdpi.com/2079-9292/15/11/2275, https://openreview.net/forum?id=X9wW4t4xgS). It also finds that *which* examples are chosen matters more than how many (https://arxiv.org/abs/2412.02906). Returning everything is the wrong shape for the consumer.
2. **No staleness signal.** `deposited` is recorded but nothing reads it. Staleness is the first named risk of this pattern, and detecting drift in reference code is an established, tractable problem (https://arxiv.org/abs/2212.01479).
3. **No record of why an entry is good.** `origin` says where an entry came from; nothing says what proves it worth copying. This is the defense against the second named risk, **pattern lock-in** — "the library amplifies the codebase's habits, good and bad."

With one entry these are invisible. They become load-bearing at ten.

## Scope

### In Scope
- Bounded, deterministically ranked corpus search with an explicit limit override.
- An age-based staleness report derived from the existing `deposited` field.
- An optional `validated` provenance field on `entry.json`, backward compatible with existing entries.
- Tests for all of the above in `.pi/tests/corpus.test.ts`.

### Out of Scope
- Semantic / embedding / intent-based retrieval. Unjustified at current corpus size; see Open Questions.
- AST extraction or LLM classification pipelines.
- Exposing the corpus over MCP or as a skill. Delivery stays CLI-only for now.
- Parsing the free-text `origin` field to detect syntactic drift against a commit SHA.
- Any change to `.pi/corpus/node-cli-with-pure-core/` content.
- Repairing the two pre-existing `skill-system.test.ts` failures caused by untracked `.pi/skills/memory/`.

## Proposed Solution

Keep the existing architecture — pure exported functions plus a thin IO shell, which is itself the pattern the one corpus entry documents. Extend it along three axes, each a small change to the same two files:

1. **Cap and rank.** `searchCorpus` gains a limit (default 3) and a deterministic ordering: exact tag match, then slug match, then summary substring. The CLI reports both the applied limit and the pre-truncation match total so truncation is never silent.
2. **Age reporting.** A `stale` command computes each entry's age from `deposited` against a caller-supplied maximum, exiting non-zero when any entry is past it. No schema change — this reuses a field that already exists.
3. **Provenance.** An optional `validated` string on `entry.json` records the evidence that qualified the entry. Absent means valid (v1 entries keep working); present-but-empty is rejected.

The deliberate non-choice is semantic retrieval. The research supports it in principle but conditions the payoff on reuse frequency and corpus size, and a one-entry corpus cannot measure a recall improvement.

## Technical Context

- `.pi/scripts/corpus.ts` exports `validateEntry`, `scanCorpus`, `searchCorpus`; `main()` dispatches `validate | list | search` and is guarded by an `import.meta.url` check so tests can import without executing.
- Output is JSON to stdout with meaningful exit codes: `0` ok, `1` validation failure, `2` usage error. This convention must hold for new commands.
- `.pi/tests/corpus.test.ts` has 12 passing tests using `node:test`, exercising both the pure API and the CLI via `spawnSync` against temp-dir fixtures.
- `entry.json` fields today: `version`, `slug`, `summary`, `tags`, `origin`, `deposited`, `files`. Validation enforces kebab-case slug, slug/directory agreement, ISO date, non-empty `files`, and rejects path escapes.
- Zero runtime dependencies; no package manifest. Do not introduce one.

## Affected Files

- `.pi/scripts/corpus.ts` — all three behavior changes
- `.pi/tests/corpus.test.ts` — tests for all three

No other file is modified. `.pi/corpus/**` is read-only for this feature.

## Success Criteria

- [ ] Corpus search never returns more than 3 entries unless explicitly overridden, and never truncates silently
  - Verify: `node --experimental-strip-types --test .pi/tests/corpus.test.ts`
- [ ] `corpus search .pi/corpus ts` returns ranked, bounded JSON and exits 0
  - Verify: `node --experimental-strip-types .pi/scripts/corpus.ts search .pi/corpus ts`
- [ ] A stale entry is detectable without opening any file by hand
  - Verify: `node --experimental-strip-types .pi/scripts/corpus.ts stale .pi/corpus 3650`
- [ ] Existing entries lacking `validated` still validate
  - Verify: `node --experimental-strip-types .pi/scripts/corpus.ts validate .pi/corpus`
- [ ] No whitespace or conflict damage in owned files
  - Verify: `git diff --check -- .pi/scripts/corpus.ts .pi/tests/corpus.test.ts`

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Default limit of 3 hides a relevant entry | Wrong exemplar retrieved | CLI reports pre-truncation match count; limit is overridable |
| Age-based staleness is a weak proxy for real drift | False confidence in an outdated entry | Documented as a proxy, not proof; syntactic drift detection is explicitly deferred, not assumed solved |
| Optional `validated` stays unused | Pattern lock-in undefended in practice | Field is cheap and additive; adoption is a curation habit, tracked in `progress.md` rather than enforced by schema |
| Over-building for a one-entry corpus | Wasted effort, maintenance cost exceeds reuse benefit | Semantic retrieval and MCP delivery deliberately excluded until corpus size justifies them |

## Open Questions

1. At what entry count does lexical ranking stop being adequate and semantic retrieval earn its maintenance cost? Unmeasurable at n=1. Revisit at roughly 10 entries with a recall comparison.
2. Should `origin` become structured (repo, path, commit SHA) to enable real drift detection? Deferred — would break the current free-text values and needs a migration decision.
3. Should the corpus be reachable mid-task by an agent (MCP or skill pointer) rather than CLI-only? Out of scope here; the vendor mechanism for this is progressive disclosure via reference files (https://code.claude.com/docs/en/agent-sdk/skills).

## Tasks

See [`tasks.json`](tasks.json) for the authoritative graph. Summary:

| ID | Category | Title | Depends on |
|---|---|---|---|
| task-1 | core | Bound and Rank Corpus Search | — |
| task-2 | core | Report Corpus Entry Staleness | task-1 |
| task-3 | core | Record What Validates an Entry | task-2 |
| task-4 | verify | Integration Verification | task-3 |

All implementation tasks edit the same two files and are therefore strictly serial (`max_concurrent_agents: 1`).