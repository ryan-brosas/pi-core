# Research: Hindsight-Only Memory

- **Date:** 2026-07-25 (UTC)
- **Execution mode:** Workflow — complex, multi-angle research
- **Repository:** `/home/ryan/repo/pi-core`
- **Branch / HEAD:** `main` / `4c8920f0d6a204ce4877e1c0de0c8789763d2f25`
- **Scope:** Research only; no memory file, skill, configuration, or active artifact was changed by this report.
- **Artifact routing:** The active slug `seam-blackbox-greybox-workflow` is unrelated, so this report is standalone and `.pi/artifacts/.active` remains unchanged.
- **Independent evidence channels:** Exa, Codex Search, and a Pi `scout`; one dependent Pi `review` cross-checked the joined evidence.

## Questions

| Question | Status | Confidence |
| --- | --- | --- |
| Can Hindsight be the sole durable memory system? | Answered: yes | High |
| Is any `MEMORY.md` import or migration needed? | Answered: no | High |
| Which configuration removes the demonstrated duplication? | Answered | High |
| What live repository surface must change? | Answered | High |
| What remains to verify after implementation? | Partial: fresh-session prompt measurement | Medium |

## Findings

- Hindsight is already the functioning project memory system: domain-tagged scope, stable `pi-coding` project bank, strict project filtering, automatic observation recall, and automatic structured session retain are enabled; the user bank is disabled. [S1][S2]
- There is **nothing to migrate from `MEMORY.md`**. The file is unused by user intent, contains stale `.opencode` paths, and records an obsolete decision rejecting automated memory. Importing it would seed contradictory policy. Hindsight already retains raw structured session deltas at `agent_end`; official guidance prefers raw context over pre-summarized imports. [S1][S2][S3]
- The observed redundancy is real and explained by version 0.11.0 source: automatic recall independently renders observations, loads mental-model snapshots, then concatenates both blocks. Its quality filter removes exact duplicate recall items but does not semantically deduplicate recall against mental-model prose. [S1][S5]
- Current defaults allow up to 12,000 mental-model characters in addition to an 800-token recall budget. The live bank has four models totaling about 10.7K characters; the operating-preferences model alone is 7,367 characters/1,046 words despite `max_tokens: 600`. This matches the user-visible truncated and repetitive injection. [S1]
- The best repo-specific configuration is Hindsight-only with `project-only`, automatic retain **on**, automatic recall **on**, and automatic mental-model injection **off**. This removes the redundant always-on block without deleting server-side mental models; explicit `hindsight_reflect` still uses mental models before observations and raw facts. A dry run confirmed the installed control plane accepts this exact patch. [S1][S2][S3]
- Upstream examples permit recall and mental-model injection to coexist when their content is genuinely distinct, but Pi Hindsight’s own quality guide warns against “duplicating recall … as a mental model.” The upstream pattern is therefore optional, not a requirement; observed local behavior and explicit user intent justify disabling injection here. [S2][S3][S4][S5]
- The file-memory skill needs no replacement. Pi Hindsight already supplies automatic hooks plus `hindsight_recall`, `hindsight_retain`, `hindsight_reflect`, status, scope, bank, config, and mental-model controls. The packaged `hindsight-memory-doctor` remains a separate diagnostic skill. [S1][S2][S5]
- The implementation scope resolves to two deletions and seventeen supporting edits (nineteen implementation paths total): delete `.pi/artifacts/MEMORY.md` and `.pi/skills/memory/SKILL.md`; remove `memory` from `.pi/skills/manifest.json`; update the remaining live references in `AGENTS.md`, three agent definitions, seven prompts, the development-lifecycle skill, tech-stack template, garbage-collection workflow, and skill-system tests. Historical `.pi/artifacts/**` records and runtime `.pi/state/session-summary.md` must remain untouched. [S1]
- Five required supporting paths already contain unrelated work: `AGENTS.md`, `.pi/agents/Plan.md`, `.pi/agents/scout.md`, `.pi/prompts/plan.md`, and `.pi/tests/skill-system.test.ts`. The active unrelated feature owns additions in the latter two, so implementation must use hunk-level preservation and stop on overlapping concurrent edits. [S1]

## Recommendation

1. Do not import, summarize, retain, or otherwise migrate `.pi/artifacts/MEMORY.md`.
2. Make the Hindsight policy explicit in `.pi/hindsight.json`: project-only/domain-tagged `pi-coding`, recall on, retain on, user bank off, and `mentalModels.inject: false`.
3. Delete the two user-selected file-memory targets and remove `memory` from the skill manifest.
4. Replace live `MEMORY.md` lookup/write instructions with Hindsight automatic recall/retain semantics and explicit recall/reflect only where a workflow genuinely needs deeper history.
5. Keep current observation-only `mid`/800 recall initially. Tune to `low`, lower the token cap, or add measured score floors only if a fresh-session trace remains noisy.
6. Update contract tests to enforce manifest parity, absence of live file-memory references, parent-owned Hindsight context for subagents, and preservation of historical/runtime artifacts.

## Verification Baseline

- `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` — **47/47 passed**.
- `node --experimental-strip-types --test .pi/tests/*.test.ts` — **135/135 passed**.
- Every current `.pi/artifacts/*/tasks.json` validated successfully.
- `git diff --check` passed for the currently dirty overlapping paths.

## Open Items

- Measure actual prompt reduction in a fresh session after configuration reload; existing session context may already contain injected blocks.
- Existing Hindsight facts/observations are not part of this removal. Purging or rebuilding bank contents would be a separate destructive decision and is not recommended by this research.
- Before implementation, preserve the five overlapping dirty paths and apply the repository’s exact deletion/confirmation gate to the two resolved deletion targets.

## Sources

- [S1] Local repository and exact installed release evidence: `.pi/hindsight.json:1-32`; `.pi/artifacts/MEMORY.md:3,44-57`; `.pi/skills/memory/SKILL.md:1-47`; `.pi/skills/manifest.json:1-73`; `.pi/tests/skill-system.test.ts:23-39,417-429`; installed `@luxusai/pi-hindsight` `v0.11.0` source at `extensions/config/config-defaults.ts:13-28,65-69`, `extensions/lifecycle/recall.ts:238-248`, and `extensions/lifecycle/mental-models.ts:175-191`. Release: https://github.com/luxus/pi-hindsight/releases/tag/v0.11.0
- [S2] Exa retrieval of official Pi Hindsight documentation: https://luxus.github.io/pi-hindsight/concepts/memory-behavior/ ; https://luxus.github.io/pi-hindsight/concepts/mission-and-mental-model-quality/ ; https://luxus.github.io/pi-hindsight/reference/configuration/
- [S3] Exa retrieval of official Vectorize Hindsight documentation: https://hindsight.vectorize.io/best-practices ; https://hindsight.vectorize.io/developer/api/mental-models
- [S4] Codex Search live cross-check (2026-07-25) independently returned and summarized the official Best Practices and Mental Models sources in [S3], including stable document IDs, end-of-turn retain, and scoped mental-model guidance.
- [S5] Pi `scout` cross-check of official source and accepted ADRs: https://github.com/luxus/pi-hindsight/blob/v0.11.0/docs/adr/005-domain-banks-and-agent-first-surface.md ; https://github.com/luxus/pi-hindsight/blob/v0.11.0/docs/adr/004-lifeos-dual-bank-design.md ; https://github.com/luxus/pi-hindsight/blob/v0.11.0/docs/starter-mental-model-suggestions.md