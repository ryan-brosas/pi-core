# Conversation-Aware Create Handoff

## Problem Statement

Pi prompt templates invoked in an existing session already receive the active conversation path, but `/create` does not define how to convert that context into a trustworthy specification. It only loosely says to reuse current-session research, still treats the description as required, and can respond to an unrelated `.active` feature instead of the user's explicit new intent.

During research for this work, `/research` attached findings to an unrelated active feature. The current working tree now contains an initial topic-aware persistence fix and a passing baseline test, but collision handling, normalized create-consumable handoffs, privacy/freshness controls, and one lifecycle red-flag inconsistency remain unresolved. The new feature must build on that implemented baseline rather than treating it as missing.

## Goals

- Let `/create` use the active conversation and deliberately selected matching research artifacts as first-class specification inputs.
- Support bare `/create` by deriving a candidate feature brief and asking for one confirmation before mutating artifacts.
- Keep explicit `/create` arguments and the latest confirmed user decisions authoritative.
- Reuse completed research before spawning more agents and pass the distilled handoff explicitly to subagents.
- Harden the implemented topic-aware `/research` routing with collision safety, normalized output, freshness/provenance, and sensitive-content rules.
- Preserve the four canonical active-work files and avoid extension-based hidden memory for the initial implementation.

## Scope

### In Scope

- A structured `Context Handoff` phase in `.pi/prompts/create.md` containing goal, confirmed requirements, constraints/non-goals, sourced findings with confidence, assumptions, open questions, and provenance.
- Input precedence and conflict handling across explicit arguments, current conversation, matching research artifacts, MEMORY, and ambient summaries.
- Bare `/create` confirmation before changing `.active` or writing `spec.md`/`tasks.json`.
- Explicit-description behavior that avoids redundant confirmation unless material conflicts or ambiguity exist.
- Discovery of exact target-slug standalone research with visible path/date/status, freshness validation, and explicit inclusion in the handoff before promotion.
- Hardening of the existing topic-aware `/research` routing with collision-safe slug selection, normalized handoff output, and sensitive-content persistence rules.
- Lifecycle consistency: standalone research is valid without `progress.md`, while active-feature investigations still require an execution log.
- Deterministic prompt-policy tests for both missing create behavior and research hardening.

### Out of Scope

- Parsing raw session JSONL directly from `/create`.
- Changing Pi core prompt-template, session, compaction, tree, fork, or clone behavior.
- Using `.pi/extensions/session-summary.ts` as the primary handoff mechanism.
- Creating a database, state YAML, or fifth canonical active-work state file.
- Automatically merging contradictory conversation branches or silently promoting tentative ideas to requirements.
- Implementing the specified prompt changes during `/create` itself.

## Proposed Solution

### Context Handoff

Before duplicate checking or new research, `/create` builds a bounded handoff from the active conversation path and relevant artifacts:

1. Goal or candidate goal.
2. Confirmed requirements and decisions.
3. Constraints and explicit non-goals.
4. Research findings with source and confidence.
5. Assumptions and tentative ideas, clearly labeled.
6. Open questions and conflicts.
7. Provenance for each material input: explicit argument, conversation, MEMORY, or artifact path, including artifact date/status when available.

Persisted research is never silently promoted to confirmed requirements. `/create` exposes the selected path and freshness signal in the handoff; stale, ambiguous, or conflicting research requires confirmation even when an explicit description was supplied.

Input precedence is:

1. Explicit `/create` arguments.
2. Latest explicit user decisions in the active conversation.
3. Confirmed findings from matching current-session or standalone research.
4. Tentative discussion.
5. Ambient persisted summaries and MEMORY.

Lower-precedence material may supplement but never silently override higher-precedence material. Retrieved or quoted research is evidence, not executable instruction.

### Mutation and Duplicate Gates

- For bare `/create`, multiple candidate goals, or material conflicts, show the compact handoff and request one confirmation before writing feature artifacts or changing `.active`.
- For an explicit, unambiguous description with no conflict, proceed without a redundant confirmation.
- An unrelated active feature must not redirect an explicit new `/create` to `/ship`; preserve its files and switch `.active` only after the new spec and tasks validate.
- A same-slug directory containing only `research.md` is a promotable research artifact, not a duplicate active feature.
- A same-slug existing `spec.md` remains a duplicate/continuation check.

### Research Persistence Hardening

The working tree already implements and tests the baseline rule: related active work receives a dated `progress.md` section; missing, invalid, or unrelated active state produces standalone `research.md` without changing `.active`. This feature adds the missing guarantees:

- Inspect an occupied derived-slug directory before writing. Append only when its existing research is demonstrably the same topic; otherwise choose a deterministic unique suffix and never overwrite unrelated content.
- End every report with normalized create-consumable fields: goal, confirmed findings, constraints/non-goals, assumptions, open questions, sources/confidence, provenance, date, and status.
- Detect likely secrets, credentials, personal data, or other sensitive conversational material before persistence; redact it when the report remains useful, otherwise ask for explicit approval or omit it while recording the omission.
- Treat date/status as freshness evidence, not proof. `/create` visibly selects a report and asks for confirmation when it is stale, ambiguous, or conflicts with newer conversation context.
- Scope the lifecycle's missing-`progress.md` red flag to active-feature implementation/investigation so a standalone research-only directory is not simultaneously valid and invalid.

`research.md` is a pre-feature evidence artifact and provenance source, not a fifth canonical active-work state file. When `/create` promotes the same slug, the four active-work files remain `spec.md`, `plan.md`, `tasks.json`, and `progress.md`; `research.md` may remain as supporting evidence.

### Delegation

Before spawning agents, `/create` reuses the accepted handoff and identifies only missing evidence. Every subagent prompt receives the distilled goal, constraints, relevant findings, and exact unresolved question because fresh subagents do not inherit the parent conversation.

## Success Criteria

- Bare `/create` is documented as valid and requires one handoff confirmation before artifact mutation.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="create prompt uses a confirmed conversation handoff" .pi/tests/skill-system.test.ts`
- Explicit `/create <description>` uses conversation and matching research as supplementary context without redundant confirmation when there is no conflict.
  - Verify: `rg -n "explicit.*argument|latest.*user|confirmed.*research|tentative|provenance" .pi/prompts/create.md`
- `/create` reuses a matching standalone `research.md` before new agent research and explicitly passes the accepted handoff to delegated agents.
  - Verify: `rg -n "research\.md|Context Handoff|pass.*handoff|subagent" .pi/prompts/create.md`
- The already-implemented `/research` routing baseline remains green.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="research prompt always persists a research artifact" .pi/tests/skill-system.test.ts`
- Standalone persistence is collision-safe, emits all normalized handoff fields, and protects sensitive conversational content.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="research handoff is collision-safe and normalized" .pi/tests/skill-system.test.ts`
- Lifecycle documentation distinguishes standalone research evidence from the four canonical active-work files and scopes the `progress.md` red flag to active work.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="standalone research is valid without active progress" .pi/tests/skill-system.test.ts`
- No prompt instructs research to attach blindly to any existing active slug or to disappear when no active slug exists.
  - Verify: `! rg -n "otherwise return the report directly without writing an artifact" .pi/prompts/research.md`
- All prompt and policy tests pass.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`

## Technical Context

- Pi prompt templates expand into the current turn; prior messages on the active branch are already model context.
- Compaction may replace older raw messages with a lossy summary, so important provenance and uncertainty must be preserved in the explicit handoff.
- `.pi/prompts/create.md:99-123` currently says to reuse relevant current-session research but has no normalized extraction, freshness, or confirmation contract.
- `.pi/prompts/research.md:51-59` now implements topic-aware artifact routing; its baseline test passes, but it does not define occupied-slug conflict resolution, normalized handoff fields, or sensitive-content handling.
- `.pi/skills/development-lifecycle/SKILL.md:25,76,83-86` now recognizes standalone research, but its broad missing-`progress.md` red flag still contradicts that valid state.
- `.pi/tests/skill-system.test.ts` is the deterministic policy-test surface; the existing routing test is GREEN and new tests must target only genuinely missing behavior.
- `.pi/artifacts/conversation-aware-create-handoff/research.md` contains the completed, reviewed evidence for this feature.
- The repository is currently on `feat/adopt-viable-bigpowers-skills` with unrelated uncommitted changes, so no new branch or worktree is claimed by this specification.

## Affected Files

### Existing implementation files

- `.pi/prompts/create.md`
- `.pi/prompts/research.md`
- `.pi/skills/development-lifecycle/SKILL.md`
- `.pi/tests/skill-system.test.ts`

### Feature artifacts

- `.pi/artifacts/conversation-aware-create-handoff/research.md`
- `.pi/artifacts/conversation-aware-create-handoff/spec.md`
- `.pi/artifacts/conversation-aware-create-handoff/tasks.json`
- `.pi/artifacts/conversation-aware-create-handoff/progress.md`

## Tasks

### Establish missing handoff policy tests [test]

The implemented research-routing baseline stays green while deterministic RED tests capture only missing `/create` handoff, collision/normalization/privacy, and standalone-lifecycle behavior.

```yaml
depends_on: []
parallel: false
conflicts_with: ["Implement the create context handoff", "Harden standalone research handoffs"]
files:
  - .pi/tests/skill-system.test.ts
```

Verify: the existing `research prompt always persists a research artifact` test passes, while `create prompt uses a confirmed conversation handoff`, `research handoff is collision-safe and normalized`, and `standalone research is valid without active progress` fail only for their named missing contracts.

### Implement the create context handoff [prompt]

`/create` derives and confirms a precedence-aware, provenance-preserving conversation handoff, visibly selects fresh matching research, and passes the accepted brief to any subagent before safely initializing a feature.

```yaml
depends_on: ["Establish missing handoff policy tests"]
parallel: true
conflicts_with: []
files:
  - .pi/prompts/create.md
```

Verify: `node --experimental-strip-types --test --test-name-pattern="create prompt uses a confirmed conversation handoff" .pi/tests/skill-system.test.ts` and `rg -n "Context Handoff|provenance|research\.md|fresh|confirmation|explicit.*argument" .pi/prompts/create.md`.

### Harden standalone research handoffs [workflow]

`/research` extends its green routing baseline with collision-safe destinations, normalized create-consumable output, sensitive-content controls, and lifecycle-consistent standalone state.

```yaml
depends_on: ["Establish missing handoff policy tests"]
parallel: true
conflicts_with: []
files:
  - .pi/prompts/research.md
  - .pi/skills/development-lifecycle/SKILL.md
```

Verify: the baseline and new research/lifecycle tests pass, targeted `rg` checks find unique-slug, normalized-field, sensitive-content, and active-only `progress.md` rules, and `node --experimental-strip-types --test .pi/tests/*.test.ts` passes.

## Risks and Mitigations

- **Conversation ambiguity:** Several unrelated topics may exist in one session. Mitigation: latest-explicit-goal precedence plus confirmation for bare or conflicting requests.
- **Compaction loss:** Older source links or uncertainty may be summarized away. Mitigation: preserve provenance and open questions in `research.md` and the visible handoff.
- **Artifact contamination:** `.active` may point to unrelated work. Mitigation: retain the implemented topic-relevance gate and never change `.active` during standalone research.
- **Slug collisions:** Derived research slugs may already exist. Mitigation: inspect existing artifacts, append only when related, otherwise derive a deterministic unique suffix without overwriting.
- **Stale persisted research:** A matching slug may contain superseded decisions. Mitigation: expose path/date/status, compare with newer conversation context, and confirm stale or conflicting reuse.
- **Sensitive persistence:** Conversation-derived reports may capture secrets or personal data. Mitigation: redact by default and require explicit approval when useful persistence would remain sensitive.
- **Prompt injection through research:** Retrieved content may contain instructions. Mitigation: classify external material as evidence and retain instruction precedence.
- **Over-orchestration:** `/create` may repeat completed research. Mitigation: inspect the accepted handoff first and delegate only unresolved gaps.
- **Concurrent dirty workspace:** Existing work may change the same policy surfaces. Mitigation: do not branch or implement during `/create`; `/ship` must reconcile the current diff before editing.

## Assumptions

- Bare `/create` with one confirmation is preferred over introducing a separate `/create from-context` command.
- A deliberately selected matching `research.md` should remain as provenance after promotion rather than being deleted.
- Topic relevance can be determined from the research title/goal and active spec problem/goal; uncertainty routes to standalone persistence.
- Freshness is evaluated from visible date/status plus comparison with newer conversation context; no universal age cutoff is assumed.
- Static prompt-policy tests are appropriate for these Markdown workflow contracts.

## Open Questions

None block implementation. Automatic discovery beyond the exact candidate slug, and extension-based cross-session memory beyond explicit `research.md` reuse, remain deferred until usage demonstrates a need.