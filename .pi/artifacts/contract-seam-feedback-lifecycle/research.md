# Research: Contract–Seam–Feedback as the Lifecycle Kernel

- **Completed:** 2026-07-25T21:05:44Z
- **Mode:** Workflow (`deep-research`): Exa and Codex Search retrieval, one bounded local-discovery agent, one dependent read-only cross-check, parent synthesis
- **Scope:** Research only; no workflow implementation or active-artifact switch
- **Artifact routing:** Standalone research at `.pi/artifacts/contract-seam-feedback-lifecycle/research.md`; `.pi/artifacts/.active` remains unchanged.
- **Relationship:** Broadens the earlier planning-only seam/black-box/grey-box work into a lifecycle-wide methodology; it does not reopen or alter that completed feature graph.

## Questions

| Question | Status | Confidence |
|---|---|---|
| Can the seam/black-box/grey-box distinction become the lifecycle's central methodology? | Answered: yes, as a concise cross-phase kernel | High |
| Should the lifecycle mechanically restart at research after every verification? | Answered: no; route feedback to the earliest phase that must change | High |
| Should black-box-by-default exclude structural or white-box verification? | Answered: no; those remain supplementary and risk-driven | High |
| What constitutes reaching MVP? | Answered: a minimal learning-capable product/experiment, not a code-quality score | High |
| Where does the current repository already comply, and what remains? | Answered | High for current working tree |

## Findings

- **The central distinction is sound, with one correction:** a seam is not necessarily *deliberately designed*. Feathers' original model includes seams discovered in legacy code. What is mandatory is a behavior-substitution location plus a reachable enabling point. For new design, deliberately placing seams around named volatility or risk is a good policy; calling every interface a seam is not. [S1][S2]
- **Adopt this as a kernel, not another lifecycle phase, framework, or artifact.** The kernel should ask three questions in every applicable phase: (1) what observable contract matters, (2) what concrete change or risk justifies a seam, and (3) what evidence vantage proves the behavior? Ports-and-adapters supports isolated testing, while iterative delivery sources favor small working increments and adaptation rather than a large up-front architecture. [S2][S7][S8][S11]
- **Black-box should be the default, not the only evidence.** NIST defines black-box cases from specifications and requirements while also recommending code-based structural cases, threat modeling, fuzzing, static analysis, and historical tests. Verification depth should therefore follow consequence, trust, volatility, and failure cost—not a fixed black/grey ratio or changed-file count. [S3]
- **Grey-box checks need a named evidence gap.** They are justified for stable, high-risk invariants such as authorization filtering, transactionality, idempotency, retry limits, tenant isolation, cost controls, and audit emission when public results cannot prove the property. They should cross a stable inspection seam and must not devolve into private-method, call-order, or internal-store assertions. Mock-heavy interaction tests are more coupled to implementation changes. [S3][S5]
- **Use precise test names.** Tests that keep a double aligned with an independently changing external provider are contract tests; shared behavioral suites over local adapters are adapter-conformance tests. Both complement—not replace—black-box application behavior and selected real-infrastructure integration tests. [S4][S6]
- **The proposed lifecycle is iterative but not mechanically linear.** `init` is normally once per project or major pivot. Research is an on-demand side loop whenever an unresolved fact can change scope, contract, architecture, or risk. After verification, route a known implementation defect directly to `ship`, a design gap to `plan`, changed product behavior to `create`, and a genuine unknown to `research`. Scrum and Agile support inspect/adapt and frequent working increments, not ceremonial repetition of every phase. [S7][S8]
- **MVP is a learning boundary, not a review score.** Ries defines an MVP as the version that enables maximum validated learning about customers with least effort and explicitly says it is not simply a minimal product. Technical verification can prove that the MVP experiment is safe, usable, observable, and ready; only customer behavior or another defined learning signal can validate the product hypothesis. [S9]
- **Pi Core already implemented the planning slice of this doctrine.** The current checkout requires externally observable PRD success criteria, a conditional `Boundaries and Testability` plan section, seam justification through substitution need + enabling point + real alternative, and explicit grey-box exceptions. The completed prior artifact shows those changes passed focused and retained tests. The remaining opportunity is lifecycle-wide consistency in `init`, `research`, `create`, `ship`, `verify`, and the MVP feedback decision. [S10]

## Recommendation

Use an optional name, **Contract–Seam–Feedback (CSF)**, for one lifecycle kernel:

> Define observable behavior before implementation. Add a seam only for a named volatility, trust boundary, or failure risk, with a reachable enabling point and a concrete alternative. Verify black-box behavior first; add explicitly justified grey-box checks for high-risk evidence gaps and structural/white-box techniques as supplementary assurance. Deliver the smallest safe vertical slice, inspect evidence and user learning, and adapt until the MVP hypothesis can be tested.

A compact enforcement rule:

> **No requirement without an observable contract. No seam without concrete variance. No grey-box check without an evidence gap. No MVP claim without a learning signal.**

Do not add a fifth canonical artifact or a universal interface layer. Store the outputs in the existing four artifacts.

## Recommended Operating Loop

```text
init once (or on a major pivot)
  ↓
create/refine the product contract ← research whenever a material unknown appears
  ↓
plan/refine boundaries, slices, and evidence (skip only when genuinely trivial)
  ↓
ship one end-to-end vertical slice
  ↓
verify observable behavior + risk controls + learning instrumentation
  ↓
inspect and route:
  unknown fact ───────────────→ research
  changed desired behavior ───→ create
  architecture/design gap ────→ plan
  known implementation defect → ship
  MVP experiment ready ───────→ release/observe/learn
```

This preserves `/research` as a sideways capability while still allowing a full `research → create → plan → ship → verify` cycle when a discovery changes the product contract.

## Phase Contract

| Phase | Required output/gate | Explicit non-goal |
|---|---|---|
| **init** | Validate runtime/test/build facts; identify major external, trust, and volatility boundaries; establish the product hypothesis and evidence channels. | Do not invent speculative seams or design every future adapter. |
| **research** | State the decision question, evidence, confidence, alternatives, contract impact, and unresolved risks; stop at medium-or-higher confidence. | Do not collect context without a decision it supports or attach to unrelated active work. |
| **create** | Put essential user journeys, inputs/outputs/errors/side effects, non-goals, risk controls, and the intended MVP learning signal into observable success criteria. | Do not make the entire PRD black-box; implementation context may remain in technical sections. |
| **plan** | For changed boundaries, record hidden decision and public behavior; for every seam require substitution need, enabling point, and real alternative; select black-box, conformance/contract, integration, grey-box, structural, security, and architecture checks by risk. | Do not create interfaces merely to satisfy a template. |
| **ship** | Implement one thin vertical slice test-first; begin with a failing boundary behavior test where practical; use fakes at seams, translate infrastructure errors, and make nondeterministic dependencies replaceable only when they affect behavior. | Do not mock private methods or add test-only production APIs. |
| **verify** | First exercise essential journeys and controlled failures; then adapter/provider contracts, justified grey-box invariants, structural/security/architecture checks, graph evidence, and coherence. Record vantage and current evidence in `progress.md`. | Do not equate task completion, test count, changed-file count, or reviewer score with product completion. |
| **loop to MVP** | Keep current evidence for every must-have journey and non-deferrable risk control, plus instrumentation or a feedback path for the stated learning hypothesis. Defer nonessential scope explicitly. | Do not claim validated learning from internal tests alone. |

## MVP Gate

Treat verification as producing **MVP experiment readiness**, requiring:

1. one or more essential user journeys that deliver the hypothesized value;
2. explicit non-goals and deferred scope;
3. non-deferrable security, privacy, data-integrity, and recovery controls;
4. observable failure behavior and operational diagnostics at important seams;
5. a measurable learning signal or real feedback path;
6. current black-box evidence, plus risk-justified deeper evidence.

After release or exposure to representative users, the observed signal determines **persevere, refine, or pivot**. That product-learning decision may reopen `research` or `create`; it is not reducible to the software test suite.

## Local Adoption Shape

The smallest coherent future implementation would place the normative kernel in `.pi/skills/development-lifecycle/SKILL.md`, retain the detailed existing boundary template in planning guidance, and add only short phase-specific hooks to the relevant prompts. Behavior-level contract tests should guard the hooks without copying the full doctrine into every file. Because `seam-blackbox-greybox-workflow` is complete and the current active slug is unrelated, implementation should require an explicit scope decision: reopen/extend the completed feature or create a new lifecycle-wide feature after the current active work is resolved. No active-pointer change is implied by this research.

## Open Decisions

1. Whether to use the name **Contract–Seam–Feedback** or keep the kernel unnamed.
2. Whether MVP readiness belongs in every feature's `spec.md` or only product/release-level specs.
3. The minimum shared record shape: likely existing success criteria + the current plan boundary table + a verification-vantage note, rather than schema expansion.
4. Whether `verify` should replace changed-file-count risk selection with consequence-based triggers or combine both.
5. Whether the completed same-topic graph should be extended or a new feature graph should own lifecycle-wide adoption.

## Sources

- [S1] Michael Feathers, **The Seam Model**, authorized Pearson sample from *Working Effectively with Legacy Code*, Chapter 4. https://ptgmedia.pearsoncmg.com/images/0131177052/samplechapter/0131177052_ch04.pdf — accessed 2026-07-25
- [S2] Alistair Cockburn, **Hexagonal Architecture (Ports and Adapters)**, original article, 4 September 2005. https://alistair.cockburn.us/hexagonal-architecture — accessed 2026-07-25
- [S3] NISTIR 8397, **Guidelines on Minimum Standards for Developer Verification of Software**, October 2021. https://doi.org/10.6028/NIST.IR.8397 — accessed 2026-07-25
- [S4] Martin Fowler, **Contract Test**. https://martinfowler.com/bliki/ContractTest.html — accessed 2026-07-25
- [S5] Martin Fowler, **Mocks Aren't Stubs**. https://martinfowler.com/articles/mocksArentStubs.html — accessed 2026-07-25
- [S6] Pact Documentation, **Verifying Pacts**. https://docs.pact.io/getting_started/verifying_pacts — accessed 2026-07-25
- [S7] **Principles behind the Agile Manifesto**. https://agilemanifesto.org/principles — accessed 2026-07-25
- [S8] Ken Schwaber and Jeff Sutherland, **The Scrum Guide**, November 2020. https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf — accessed 2026-07-25
- [S9] Eric Ries, **Minimum Viable Product: a guide**, August 2009. https://www.startuplessonslearned.com/2009/08/minimum-viable-product-guide.html — accessed 2026-07-25
- [S10] Local current-working-tree evidence: `.pi/skills/development-lifecycle/SKILL.md`, `.pi/prompts/{init,research,create,plan,ship,verify}.md`, `.pi/templates/prd.md`, `.pi/skills/{deep-module-design,planning-and-task-breakdown,test-driven-development,testing-anti-patterns}/SKILL.md`, and `.pi/artifacts/seam-blackbox-greybox-workflow/{research,spec,progress,tasks.json}` — inspected 2026-07-25
- [S11] DORA, **Working in Small Batches**. https://dora.dev/capabilities/working-in-small-batches/ — accessed 2026-07-25

**Retrieval routes used:** Exa MCP web search/fetch and Codex Search, plus current local file inspection and a dependent foreground Fabric cross-check.
