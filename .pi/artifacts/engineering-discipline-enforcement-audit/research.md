# Engineering Discipline Enforcement Audit

- **Date:** 2026-07-25 (UTC)
- **Execution mode:** Workflow — complex, multi-angle research
- **Checkout:** `/home/ryan/repo/pi-core`
- **Branch / HEAD:** `main` / `c486a7ddac49811b1691b1b5e9e54d4f1503c842`
- **Scope:** Current working-tree content, including concurrent uncommitted changes; this is not an audit of HEAD alone.
- **Artifact routing:** `.pi/artifacts/.active` points to the unrelated `hindsight-only-memory` feature, so this report is standalone and `.active` was not changed.

## Executive Summary

**Verdict: PARTIAL.** Pi Core substantially **follows** the proposed discipline in its Problem → Specification → Implementation → Verification workflow, but only selected expectations are **implemented as hard mechanisms**. Its strongest executable controls are the canonical task DAG, state/evidence validation, bounded frontier scheduling, and research-evidence enforcement. Many safety, architecture, delivery, and AI-governance expectations remain prompt/policy rules rather than runtime gates. Deployment and production operations are mostly absent or not applicable because this repository is a Pi configuration/workflow system, not a deployed application service.

Use these terms throughout:

- **ENFORCED:** code, schema, tests, or runtime rejects noncompliance.
- **PROCEDURAL:** mandatory written workflow, but an agent can technically bypass it.
- **PARTIAL:** enforced only in a narrow subsystem or represented incompletely.
- **ABSENT:** no current live mechanism found.
- **N/A:** needs a deployable service, database, queue, or comparable runtime that this repository does not have.

## Findings

- **Overall — PARTIAL (high confidence).** We are following the broad lifecycle, especially specification, bounded implementation, verification, and evidence retention. We have not implemented the entire Deployment → Operation → Learning half as an enforceable system. [S1][S2][S3][S5][S7]
- **Problem and specification — PROCEDURAL/PARTIAL (high confidence).** The PRD template requires a problem, affected users, explicit scope, `WHEN/THEN` scenarios, open questions, and measurable verification. It does not enforce complete example mapping (`rules/examples/questions/assumptions`), impact mapping, or requirements traceability. [S1]
- **Architecture and code/data design — PARTIAL (high confidence).** Lifecycle data has a clear owner (`tasks.json`) and derived views, and selected modules use deterministic functional cores with runtime parsing. There is no live ADR inventory/gate, C4 model, event-storming format, impact map, bounded-context model, dependency-direction checker, or repository-wide type-state discipline. [S1][S2][S3]
- **Implementation and verification — STRONGEST AREA (high confidence).** The task graph rejects malformed IDs, dependency cycles, incoherent pass state, and stale/missing evidence; frontier computation enforces readiness, conflicts, file overlap, serial work, and a three-agent cap. Parent review and fresh verification remain procedural, but the underlying graph contracts are executable. [S1][S2][S9]
- **Security and agent authority — STRONG PROCEDURE, NARROW ENFORCEMENT (high confidence).** Explicit tool allowlists, context minimization, child restrictions, and two-confirmation destructive-action gates are strong policy. Research-provider evidence and privacy-shaped snapshots are executable. There is no universal capability broker that mechanically applies least privilege and approval policy to every tool call. Official agent tooling demonstrates tool guardrails, HITL approval, and trace controls as concrete runtime mechanisms, highlighting this distinction. [S1][S3][S6]
- **Research enforcement is real but semantic assurance is not (high confidence).** The extension requires successful configured provider categories and structurally valid citations, with one bounded correction. It does not prove source authority, true independence, freshness, correctness, or entailment. [S3][S9]
- **Deployment and operation — ABSENT/N/A (high confidence).** Push/deploy and rollback are approval-gated procedures, but there is no CI/CD or promotion pipeline, feature-flag/canary mechanism, reproducible-build contract, SLO/error-budget policy, general metrics/logs/traces correlation, runbook system, on-call model, or incident/postmortem loop. Google SRE and OpenTelemetry show what those production mechanisms would entail; they should not be added until Pi Core has a concrete deployed-runtime need. [S1][S7][S8]
- **Learning and AI evaluation — PARTIAL (high confidence).** `progress.md`, Hindsight retention, research metrics, and a one-turn correction loop preserve evidence and feedback. There is no general model-output evaluation corpus, prompt/model/context/tool-schema provenance record, outcome trend loop, or comprehensive hard budget for tokens, cost, duration, tool calls, recursion, retries, and modified files. NIST’s lifecycle guidance treats documented TEVV, monitoring, incident review, and continual improvement as distinct controls; Pi Core currently covers only parts of that set. [S3][S4][S5]

## Stage Scorecard

| Stage | Status | Current reality |
|---|---|---|
| Problem | **PROCEDURAL** | Problem, users, scope, and motivation are template requirements. |
| Specification | **PARTIAL** | Scenarios and observable success criteria exist; complete example/impact mapping is not enforced. |
| Architecture | **PARTIAL** | Strong lifecycle-state architecture; formal ADR/C4/domain architecture is absent. |
| Implementation | **PROCEDURAL + narrow ENFORCED** | Small-scope, owned-path, and delegation rules; selected parsers and graph invariants are executable. |
| Verification | **ENFORCED/STRONG** | Current-attempt evidence, deterministic graph tests, source/citation contracts, and explicit verification commands. |
| Deployment | **PROCEDURAL/ABSENT** | Approval and rollback expectations, but no deployment system. |
| Operation | **ABSENT/N/A** | No production service reliability or observability control plane. |
| Learning | **PARTIAL** | Hindsight/progress/research feedback, but no full evaluation and incident-learning loop. |

## Recommended-Order Coverage

| # | Practice | Status |
|---:|---|---|
| 1 | Specification by example | **PARTIAL** |
| 2 | Modular monolith / bounded contexts | **N/A / ABSENT as explicit model** |
| 3 | Functional core / imperative shell | **PARTIAL, narrow subsystem** |
| 4 | Illegal states unrepresentable | **PARTIAL; runtime rejection, not type-level globally** |
| 5 | Data ownership / canonical-derived | **ENFORCED for lifecycle artifacts** |
| 6 | Idempotency / transactional outbox | **Limited / N/A** |
| 7 | Threat modeling / least privilege | **PROCEDURAL / PARTIAL** |
| 8 | Timeouts, retries, backpressure, degradation | **No repository-wide profile; mostly N/A** |
| 9 | Structured observability / audit | **PARTIAL evidence/metrics; no general telemetry** |
| 10 | Evaluation-driven AI development | **PARTIAL mechanics; no quality eval corpus** |
| 11 | Tool capability boundaries | **PROCEDURAL + narrow ENFORCED** |
| 12 | Small releases, flags, rollback | **Small scope/rollback procedural; flags/canaries absent** |
| 13 | ADRs / architecture fitness functions | **ADRs weak; fitness contracts strong** |
| 14 | Evidence-bearing completion | **ENFORCED for task graph; procedural for final claims** |

## Questions Answered

1. **Did we implement the complete discipline?** No — **answered, high confidence**.
2. **Are we following it?** Yes, substantially in the first five stages — **answered, high confidence**.
3. **Which expectations are hard mechanisms?** Task-graph invariants/frontier, current-attempt evidence, research evidence/citation shape, bounded correction, and selected privacy-shaped state — **answered, high confidence**.
4. **Which gaps are defects now?** AI evaluation/provenance/budgets and architecture-decision traceability are plausible current gaps; production SRE/database/distributed-system practices are mostly conditional — **answered, medium-high confidence**.

## Contradictions and Uncertainties

- File overlap and concurrency are enforced by **frontier computation**, not graph validation; audit language must keep that boundary precise.
- Research enforcement proves configured **category diversity**, not semantic independence or authority of sources.
- Absence of SLOs, outboxes, canaries, or circuit breakers is not automatically a defect in a non-service repository.
- Current evidence includes concurrent uncommitted work and may change before integration; re-audit after the working tree stabilizes if this becomes a formal baseline.

## Recommendation

Do not import the entire catalog blindly. First define a **Pi Core engineering profile** that marks each practice Required, Conditional, or N/A. The highest-value next increments are:

1. make specification outcomes, assumptions, unresolved questions, and scenario coverage machine-checkable;
2. add decision traceability (an ADR index or task-to-decision references) only for consequential architecture choices;
3. create a representative AI evaluation corpus plus prompt/model/context/tool-schema provenance;
4. enforce explicit runtime budgets and capabilities where Fabric supports them;
5. add deployment/operation controls only when a real deployable runtime and reliability objective exist.

No implementation was performed.

## Verification

- `node --experimental-strip-types --test .pi/tests/task-graph.test.ts .pi/tests/research-enforcement.test.ts`
- Result at `2026-07-25T21:47:59Z`: **88 tests passed, 0 failed**. [S9]
- External research used three independently routed providers: **Exa, Context7, and Codex Search**.
- A dependent read-only cross-check reviewed the joined local/external claim set and corrected two overstatements: graph validation versus frontier enforcement, and source-category diversity versus semantic authority.

## Open Items

These are product decisions, not unanswered research facts:

- Should Pi Core itself be operated as a production agent platform with explicit SLOs and incident processes?
- Which AI quality dimensions and benchmark tasks should become release gates?
- Which Fabric limits can be enforced in runtime configuration rather than prompts?
- Is formal ADR/C4 documentation worth its maintenance cost for this repository?

## Sources

- [S1] **Local operating/specification contracts:** `AGENTS.md:24-128,177-224,227-268`; `.pi/templates/prd.md:26-101,135-141`; `.pi/skills/documentation-and-adrs/SKILL.md:18-71` (current working tree, inspected 2026-07-25).
- [S2] **Local executable lifecycle:** `.pi/scripts/task-graph.ts:33-175,189-223`; `.pi/tests/task-graph.test.ts:18-93` (current working tree).
- [S3] **Local AI research enforcement:** `.pi/extensions/research-enforcement/policy.ts:422-445,472-624,746-856`; `.pi/extensions/research-enforcement/index.ts:396-482`; `.pi/tests/research-enforcement.test.ts` (current working tree).
- [S4] **Local retention/runtime configuration:** `.pi/hindsight.json`; `.pi/fabric.json`; `.pi/skills/development-lifecycle/SKILL.md` (current working tree).
- [S5] **Exa:** NIST, *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile*, NIST AI 600-1, published July 2024; NIST page updated 2026-04-08. https://doi.org/10.6028/NIST.AI.600-1
- [S6] **Context7:** OpenAI Agents SDK Python v0.7.0 official source docs: tool guardrails, MCP approval, and tracing; accessed 2026-07-25. https://github.com/openai/openai-agents-python/blob/v0.7.0/docs/guardrails.md · https://github.com/openai/openai-agents-python/blob/v0.7.0/docs/mcp.md · https://github.com/openai/openai-agents-python/blob/v0.7.0/docs/tracing.md
- [S7] **Codex Search:** Google SRE Workbook, *Example Error Budget Policy* and *Monitoring* (living official documentation; accessed 2026-07-25). https://sre.google/workbook/error-budget-policy/ · https://sre.google/workbook/monitoring/
- [S8] **Codex Search:** OpenTelemetry official documentation, *Context propagation* and signal concepts (living official documentation; accessed 2026-07-25). https://opentelemetry.io/docs/concepts/context-propagation/ · https://opentelemetry.io/docs/concepts/signals/traces/ · https://opentelemetry.io/docs/concepts/signals/logs/
- [S9] **Local execution evidence:** focused Node test run at 2026-07-25T21:47:59Z; 88 passed, 0 failed.