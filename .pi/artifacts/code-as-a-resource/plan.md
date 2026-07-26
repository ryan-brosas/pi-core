# Code as a Resource — Implementation Plan

> **For Pi:** Implement this plan task-by-task. `tasks.json` is the scheduling authority; this file explains *how*.

**Goal:** An agent querying `.pi/corpus/` receives a small, deterministically ranked set of exemplars and can tell whether they are still trustworthy.

**Discovery Level:** 2 — external research was run and materially shaped this plan. Two rounds via Codex Search, Exa, and Context7 settled the exemplar cap, the ranking contract, the determinism test, and the provenance field model. No further discovery is needed before implementation.

**Context Budget:** ~10–15% per task across 4 strictly serial tasks (~50% total). All three implementation slices edit the same two files, so `max_concurrent_agents` is 1.

---

## Must-Haves

### Observable Truths

1. A search returns at most 3 exemplars by default, and the caller can see how many matched before truncation.
2. The same query returns the same ordered set on every run, regardless of directory read order.
3. The caller can override the limit explicitly, and a nonsensical limit is rejected rather than silently coerced.
4. Anyone can ask "is anything in the corpus too old?" and get a per-entry answer, with a non-zero exit when the answer is yes.
5. An entry can record what proves it worth copying, and entries lacking that record keep working unchanged.
6. Existing `validate` and `list` behavior and exit codes are untouched.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| `rankTier` (module-private) | Assigns a match tier to an entry for a term | `.pi/scripts/corpus.ts` |
| `searchCorpus` (changed signature) | Ranked, capped result plus pre-truncation total | `.pi/scripts/corpus.ts` |
| `SearchResult` type | `{ entries, total, limit }` contract | `.pi/scripts/corpus.ts` |
| `reportStaleness` | Per-entry age in days and stale flag | `.pi/scripts/corpus.ts` |
| `StaleReport` type | `{ slug, deposited, ageDays, stale }` | `.pi/scripts/corpus.ts` |
| `stale` CLI command | Fail-closed age check | `.pi/scripts/corpus.ts` (`main`) |
| Optional `validated` field | Evidence that qualified the entry | `.pi/scripts/corpus.ts` (`validateEntry`) |
| Behavior tests | Proof for all of the above | `.pi/tests/corpus.test.ts` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| `searchCorpus` | CLI JSON output | `main()` search branch | Truncation happens but `total` is not surfaced, so the caller cannot tell an exemplar was dropped |
| Rank tiers | Final order | `.sort()` comparator | Comparator returns 0 for same-tier entries, so `readdirSync` order leaks into results and ranking becomes non-reproducible |
| v1 match set | v2 match set | `rankTier` returning `-1` | A tier is missed (e.g. partial tag), silently shrinking which entries match at all |
| `reportStaleness` | Process exit code | `main()` stale branch | Report prints stale entries but still exits 0, failing open |
| Entry without `validated` | `validateEntry` | `"validated" in input` guard | Guard treats absent as invalid, breaking every existing v1 entry |
| `Date.now()` | Age computation | injected `now` parameter | Test depends on wall clock and rots |

### Boundaries and Testability

#### Module Boundaries

| Boundary | Hidden decision | Public behavior |
| --- | --- | --- |
| `searchCorpus` | How relevance is tiered and how ties are broken | Returns at most `limit` entries in a reproducible order, plus the pre-truncation `total` |
| `reportStaleness` | How age in days is computed from an ISO date | Returns per-entry age and a stale flag against a supplied threshold |
| `validateEntry` | Which fields are required vs optional | Accepts v1 entries unchanged; rejects a present-but-empty `validated` with a typed issue code |

#### Proposed Seams

| Seam | Substitution need | Enabling point | Real alternative implementation |
| --- | --- | --- | --- |
| `now` clock | Current time is volatile and untestable | `reportStaleness(entries, maxAgeDays, now)` parameter | Tests pass a fixed `Date`; `main()` passes `new Date()` |

No other seam is proposed. The corpus directory is already substitutable because every function takes a path, and the tests already use temp-dir fixtures.

#### Gray-Box Exceptions

| Verification | Internal knowledge used | Why externally observable behavior is insufficient |
| --- | --- | --- |
| Permutation-invariance test | Test shuffles the entry array before calling `searchCorpus` | Non-determinism from a 0-returning comparator is invisible at the CLI on a one-entry corpus; it only appears with multiple same-tier entries in varying input order |

Gray-box knowledge here means constructing adversarial input, not mocking internals. Nothing is mocked.

---

## Derived Dependency Graph

> Derived snapshot of the current authoritative `tasks.json`. `/ship` recomputes the live frontier.

```
task-1 (Bound and Rank Corpus Search): needs nothing, changes .pi/scripts/corpus.ts + .pi/tests/corpus.test.ts
task-2 (Report Corpus Entry Staleness): needs task-1, same two files
task-3 (Record What Validates an Entry): needs task-2, same two files
task-4 (Integration Verification): needs task-3, changes nothing

Wave 1: task-1
Wave 2: task-2
Wave 3: task-3
Wave 4: task-4
```

Serial by construction — all three implementation slices edit the same two files, and concurrency would require unapproved worktree isolation.

**Sequencing note (considered and rejected):** research suggests a recorded verification date is a stronger staleness signal than file age, which argues for task-3 before task-2. The existing order is kept because task-2 requires no schema change and is therefore the lower-risk slice to land first. Revisit if `validated` later becomes structured.

---

## Tasks

### task-1 — Bound and Rank Corpus Search

**Files:** `.pi/scripts/corpus.ts`, `.pi/tests/corpus.test.ts`

**Resolved design decisions:**

- Four tiers, not three: `0` exact tag, `1` slug substring, `2` summary substring, `3` partial tag. The fourth tier exists so the v2 match *set* is identical to v1 — v1 matched partial tags, and dropping that would silently narrow results.
- Total ordering is `(tier ASC, slug ASC)`. A stable sort alone is not enough: stability only preserves *input* order for equal keys, and input order comes from `readdirSync`.
- Slug comparison uses UTF-16 code units via a module-private `codeUnitCompare(a, b)` returning `a < b ? -1 : a > b ? 1 : 0`, **not** `localeCompare`. `localeCompare` is locale-sensitive and ICU-version dependent, so ordering could vary by machine and defeat the determinism this task exists to guarantee. Slugs are ASCII kebab-case by `SLUG_PATTERN`, so code-unit order is total and readable.
- Default limit `3`. Limit validation lives in the CLI (usage error, exit 2); `searchCorpus` takes an already-valid positive integer.

**Steps:**

1. **RED** — In `.pi/tests/corpus.test.ts`, add a test building 5 in-memory entries where 2 share the exact-tag tier, asserting `searchCorpus(entries, "ts").entries.length === 3` and `.total === 5`. Run `node --experimental-strip-types --test .pi/tests/corpus.test.ts`; confirm it fails (`searchCorpus` still returns an array, so `.entries` is `undefined`).
2. **RED** — Add the permutation-invariance test: build entries that all land in the same tier, then for several shuffles of the input assert `JSON.stringify(searchCorpus(shuffled, term))` is identical. Confirm it fails.
3. **RED** — Add a CLI test via `spawnSync` asserting `search <dir> <term> 0` exits 2 and `search <dir> <term> 2` exits 0 with `limit: 2` in the JSON. Confirm both fail.
4. **GREEN** — In `.pi/scripts/corpus.ts`, add `export type SearchResult = { entries: CorpusEntry[]; total: number; limit: number }` and `const DEFAULT_SEARCH_LIMIT = 3`.
5. **GREEN** — Add module-private `rankTier(entry, needle): number` returning `0..3` or `-1` for no match, in the tier order above.
6. **GREEN** — Rewrite `searchCorpus(entries, term, limit = DEFAULT_SEARCH_LIMIT): SearchResult` to map to `{ entry, tier }`, filter `tier >= 0`, sort by `a.tier - b.tier || codeUnitCompare(a.entry.slug, b.entry.slug)`, then return `{ entries: sorted.slice(0, limit).map(i => i.entry), total: sorted.length, limit }`.
7. **GREEN** — In `main()`, accept `search <dir> <term> [limit]` (`rest.length === 1 || rest.length === 2`). Parse the limit with `Number.parseInt`; if it is `NaN` or `< 1`, return `usage(...)`. Emit `{ ok, term, limit, total, entries, issues }`.
8. **GREEN** — Update the `usage()` default message to include `stale` and the optional limit argument.
9. **VERIFY** — Run the three commands in `task-1.verification`. All new tests green, the 12 existing tests still green, `git diff --check` clean.

---

### task-2 — Report Corpus Entry Staleness

**Files:** `.pi/scripts/corpus.ts`, `.pi/tests/corpus.test.ts`

**Resolved design decisions:**

- `now` is an injected parameter, not `Date.now()` inside the function. This is the only new seam.
- Age is whole days, UTC: `Math.floor((now - Date.parse(deposited + "T00:00:00Z")) / 86400000)`.
- Stale is `ageDays >= maxAgeDays` (at-or-beyond, matching the acceptance criterion).
- `maxAgeDays` of `0` is legal (everything is stale); negative is a usage error.

**Steps:**

1. **RED** — Add a test calling `reportStaleness` with two fixed entries and a fixed `new Date("2026-07-26T00:00:00Z")`, asserting exact `ageDays` values and `stale` flags on both sides of the threshold. Confirm it fails — the function does not exist.
2. **RED** — Add a boundary test: an entry whose age exactly equals `maxAgeDays` is `stale: true`. Confirm it fails.
3. **RED** — Add CLI tests via `spawnSync`: a corpus past the threshold exits 1; under the threshold exits 0; `stale <dir> abc` and `stale <dir> -1` both exit 2. Confirm all fail.
4. **GREEN** — Add `export type StaleReport = { slug: string; deposited: string; ageDays: number; stale: boolean }`.
5. **GREEN** — Add `export function reportStaleness(entries: CorpusEntry[], maxAgeDays: number, now: Date): StaleReport[]` implementing the UTC day arithmetic above.
6. **GREEN** — In `main()`, add the `stale` branch: require `rest.length === 1`, accept only a canonical nonnegative safe-integer string (including `0`), rejecting negative, fractional, prefixed, malformed, or unsafe values via `usage(...)`. Emit `{ ok, maxAgeDays, entries: reports, issues }` and exit `1` when any report is stale or the scanned corpus had issues, else `0`. A missing or unreadable corpus root remains the existing `corpus_read_error` usage condition (exit `2`).
7. **VERIFY** — Run the three commands in `task-2.verification`. `stale .pi/corpus 3650` exits 0 against the current single entry.

---

### task-3 — Record What Validates an Entry

**Files:** `.pi/scripts/corpus.ts`, `.pi/tests/corpus.test.ts`

**Resolved design decisions:**

- `validated` is a free-text string this round. Research supports splitting provenance into trust / validity / lineage groups, but that is a schema decision the spec defers; a single field keeps v1 entries readable and is additive.
- Absent means valid. Present-but-empty, whitespace-only, or non-string is rejected with issue code `validated_invalid`.
- The field is only present on the returned entry when it was present on input — no `undefined` keys in JSON output.

**Steps:**

1. **RED** — Add a test that an entry object with `validated: "corpus test suite passes at 12/12"` validates and that `result.entry.validated` round-trips. Confirm it fails.
2. **RED** — Add a test that an entry with no `validated` key still validates and that `"validated" in result.entry` is `false`. Run it — this should already pass, and it is the backward-compatibility guard.
3. **RED** — Add tests that `validated: ""`, `validated: "   "`, and `validated: 42` each produce exactly one issue with code `validated_invalid` and path `/validated`. Confirm they fail.
4. **GREEN** — Add `validated?: string` to the `CorpusEntry` type.
5. **GREEN** — In `validateEntry`, after the existing field checks, add: if `"validated" in input` and (`typeof input.validated !== "string"` or `!input.validated.trim()`), push `issue("validated_invalid", "/validated", "validated must be a non-empty string when present")`.
6. **GREEN** — Build the success return as `{ slug, summary, tags, origin, deposited, files, ...(typeof input.validated === "string" ? { validated: input.validated } : {}) }`.
7. **VERIFY** — Run the three commands in `task-3.verification`. `validate .pi/corpus` and `list .pi/corpus` both still exit 0 against the existing entry, which has no `validated` field.

---

### task-4 — Integration Verification

**Files:** none (verification only)

**Steps:**

1. Run `node --experimental-strip-types --test .pi/tests/corpus.test.ts`; record the pass/fail counts and exit code.
2. Exercise every CLI command and record each exit code: `validate .pi/corpus` (0), `list .pi/corpus` (0), `search .pi/corpus ts` (0), `search .pi/corpus ts 0` (2), `stale .pi/corpus 3650` (0), `stale .pi/corpus 0` (1), and a bare invocation with no arguments (2).
3. Run `git diff --check -- .pi/scripts/corpus.ts .pi/tests/corpus.test.ts` and confirm no whitespace or conflict damage.
4. Run `git status --short --branch` and confirm the only files changed by this feature are the two owned files.
5. Run the full suite `node --experimental-strip-types --test .pi/tests/*.test.ts` and report the two pre-existing `skill-system.test.ts` failures caused by untracked `.pi/skills/memory/` as **unchanged and out of scope**. Do not repair them.
6. Record all of the above in `progress.md` with exit codes and counts.

---

## Research Basis

Findings that changed or confirmed this plan, with the round they came from:

- **Cap of 3 confirmed.** Code-generation literature reports degradation past roughly 4–8 exemplars, with drops measured on MBPP when moving from 3 to 8. The spec's default was already right.
- **Tie-break confirmed, determinism argument sharpened.** The spec already specified ascending-slug tie-breaks. Research added *why* it is load-bearing: stability and determinism are distinct properties, and tied scores are a documented source of non-reproducible rankings whose standard fix is breaking ties on an external id.
- **Permutation invariance added.** This is the one new acceptance criterion (task-1, criterion 5). Asserting a single hand-picked order does not catch a comparator that returns 0; shuffling the input does.
- **Provenance structure noted but deferred.** Established provenance modeling separates trust, validity, and lineage fields. A single free-text `validated` covers only trust. Recorded as a follow-up rather than expanded here, consistent with the spec's stated scope.
- **Precedent exists.** A comparable public corpus for coding agents anchors every entry to a pinned `path:line-range @ sha` citation and separates "may copy" from "may imitate". Both are candidates for a future structured `origin`, which the spec already lists as open question 2.

Sources are recorded in the session transcript and in `research.md`.
