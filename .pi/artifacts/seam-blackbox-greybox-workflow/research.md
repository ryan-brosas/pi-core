# Research: Designing Our Workflow Around Seam, Black-Box, and Gray-Box Principles

- **Date:** 2026-07-26
- **Mode:** Workflow (deep-research), standalone report
- **Active slug at time of research:** `research-enforcement-extension` (unrelated; `.active` unchanged)
- **Phases:** Phase 1 discovery and multi-route retrieval, Phase 2 foreground `review` cross-check, parent synthesis

## Questions

| Question | Status | Confidence |
|---|---|---|
| What are the authoritative definitions of seam, information hiding, black-box, and gray-box? | Answered | High |
| Are black-box/gray-box legitimate module-design categories or testing terms? | Answered | High |
| Which lifecycle surface is the minimal authoritative insertion point? | Answered | High |
| How should gray-box exceptions be governed? | Answered | Medium-high |
| Does this duplicate or contradict `deep-module-design`? | Answered | High |
| Should adapter substitution be constructed or swapped at runtime? | Answered | Medium-high |

## Findings

- A seam is "a place where you can alter behavior in your program without editing in that place," and every seam has an enabling point where the alternative behavior is selected [S1]. An interface is therefore not automatically a seam; it becomes one only when an enabling point exists [S1][S6].
- Information hiding decomposes a system so each module hides a design decision likely to change, rather than decomposing by processing steps [S2]. This is the design-time rationale for black-box boundaries, and it treats "do not decompose by flow" as strong guidance rather than an absolute rule [S2].
- Gray-box testing "assumes some knowledge of the internal structure and implementation detail of the assessment object" [S3]. ISTQB likewise classifies black-, white-, and grey-box testing as test-context terms [S4].
- Black-box and gray-box are verification perspectives, not module-design categories. Extending them to module boundaries is defensible only when explicitly labeled as a verification-visibility policy [S3][S4].
- Gray-box knowledge can guide test selection while tests still exercise public APIs; it does not license mocking internals [S3][S4].
- Ports and adapters make driven actors substitutable and allow regression tests to run without a real UI or database [S5]. The source demonstrates selection through construction and configuration, and does not establish arbitrary runtime swapping [S5].
- A contract test verifies that a test double for an external service still matches the real service's contract; it was originally called an integration contract test [S6][S7]. Shared tests across several local adapters are better named adapter conformance tests [S6].
- Locally, `.pi/skills/deep-module-design/SKILL.md` already owns interface-depth and test-seam guidance, including the claim that tests mocking internals indicate leakage [S8]. Its example supplies the enabling point through constructor injection [S8]. It also excludes trivial helpers and non-module work from scope [S8].
- The canonical lifecycle artifacts are `spec.md`, `plan.md`, `tasks.json`, and `progress.md`, and `tasks.json` alone owns the work graph [S9]. `.pi/templates/design.md` is an inert scaffold, not a lifecycle authority [S9].
- The full PRD template already carries proposed solution and technical context, so a blanket "PRD is black-box only" rule would contradict it; the constraint belongs to acceptance criteria [S10].

## Recommended Workflow

Adopt a single conditional contract rather than repeating the rule across templates.

| Phase | Surface | Requirement |
|---|---|---|
| `/create` | `spec.md` | Success criteria describe externally observable behavior only. Implementation detail stays out of acceptance criteria, not out of the whole document. |
| `/plan` | `plan.md` | One conditional **Boundaries and Testability** section: module boundaries, each proposed seam with its substitution need and enabling point, and any gray-box exception with justification. |
| `/plan` | `tasks.json` | Emit adapter or conformance-test nodes only when a seam is justified. Reserve "contract test" for external-service doubles. |
| `/ship` | implementation | Construct seam selection at composition time; do not introduce runtime swapping without a stated need. |
| `/verify` | `progress.md` | Record verification evidence and note which checks relied on gray-box knowledge. |
| Durable | `MEMORY.md` | Record cross-feature boundary decisions; use an ADR only for a significant or contested exception. |

### Seam Justification Gate

Add no abstraction unless the plan names all three:

1. the volatile dependency or decision being isolated,
2. the enabling point that selects an alternative,
3. at least one concrete alternative implementation that will exist.

A seam with no second implementation and no substitution need is over-abstraction.

### Gray-Box Exception Record

Each exception states the internal knowledge used, why public behavior cannot supply adequate evidence, and whether the exposed detail is stable or experimental.

## Corrections Applied From Cross-Check

- Do not place the rule in `.pi/templates/design.md`; that file is inert and is not a lifecycle authority [S9].
- Do not assert "the interface IS the test seam" as an absolute; require an enabling point [S1][S8].
- Do not make the whole PRD black-box; scope the constraint to acceptance criteria [S10].
- Do not claim hexagonal architecture requires runtime adapter swapping [S5].
- Do not call local multi-adapter shared tests "contract tests" [S6][S7].

## Open Items

- Whether the conditional section belongs in `.pi/prompts/plan.md` guidance, the `planning-and-task-breakdown` skill, or both, without duplicating `deep-module-design`.
- Whether `.pi/tests/skill-system.test.ts` should assert the new contract, and what minimal semantic assertion avoids brittleness.
- Exact publication date of the Cockburn article: the reviewed page displayed 4 September 2005, while an index page labels it January 2005. Low materiality.
- Whether `.pi/templates/design.md` should reference the canonical plan section or remain untouched.

## Sources

- [S1] Martin Fowler, "LegacySeam" (quoting Michael Feathers). https://martinfowler.com/bliki/LegacySeam.html — accessed 2026-07-26
- [S2] David L. Parnas, "On the Criteria To Be Used in Decomposing Systems into Modules," Communications of the ACM, December 1972. https://doi.org/10.1145/361598.361623 — accessed 2026-07-26
- [S3] NIST CSRC Glossary, "gray box testing." https://csrc.nist.gov/glossary/term/gray_box_testing — accessed 2026-07-26
- [S4] ISTQB Glossary, "black-box testing" and "grey-box testing." https://istqb.missionwares.com/glossary/black-box-testing.html — accessed 2026-07-26
- [S5] Alistair Cockburn, "Hexagonal Architecture (Ports and Adapters)," 2005. https://alistair.cockburn.us/hexagonal-architecture/ — accessed 2026-07-26
- [S6] Martin Fowler, "ContractTest." https://martinfowler.com/bliki/ContractTest.html — accessed 2026-07-26
- [S7] Martin Fowler et al., "Testing Strategies in a Microservice Architecture." https://martinfowler.com/articles/microservice-testing/fallback.html — accessed 2026-07-26
- [S8] Local: `.pi/skills/deep-module-design/SKILL.md` (scope exclusions and constructor-injection test-seam example)
- [S9] Local: `.pi/skills/development-lifecycle/SKILL.md` (four canonical artifacts; `tasks.json` authoritative)
- [S10] Local: `.pi/templates/prd.md` (Proposed Solution and Technical Context sections)

**Retrieval routes used:** Exa MCP web search and Codex Search (two independent authoritative provider categories), plus local file inspection and a foreground `review` cross-check.