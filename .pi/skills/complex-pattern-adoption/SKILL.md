---
name: complex-pattern-adoption
description: Use when adopting, adapting, importing, or promoting a reusable code pattern discovered through MCP, the project corpus, inspo, or upstream source. Always uses Complex delivery with explicit lifecycle identity, provenance, license, source/test qualification, target impact analysis, and parent verification.
version: 1.0.0
tags: [mcp, corpus, patterns, provenance, complex-delivery]
dependencies: [development-lifecycle, source-driven-development, verification-before-completion]
tools: [read, grep, find, ls, bash]
---

# Complex Pattern Adoption

## Mandate

Any decision to adopt, adapt, import, or promote a reusable pattern from MCP, the project corpus, inspo, or upstream source **always uses Complex delivery**:

```text
/create <goal> → /plan <slug> → /ship <slug> → /verify <slug>
```

Each command remains explicit and parent-controlled; this skill never triggers the next phase automatically. A read-only lookup that produces no adoption decision may stop after evidence retrieval. Once code shape, target behavior, corpus contents, or policy may change, the Complex path is mandatory.

Complex classification is not approval to create files, install dependencies, alter Git state, commit, or deploy. Existing approval gates still apply.

## Load Before Use

Read these existing authorities rather than restating them from memory:

- `../development-lifecycle/SKILL.md`
- `../source-driven-development/SKILL.md`
- `../verification-before-completion/SKILL.md`

Use one explicit slug throughout the graph-backed sequence. Missing, unsafe, or ambiguous lifecycle identity is a stop condition.

## Evidence Roles

| Evidence seam | Question answered | Authority limit |
|---|---|---|
| Current target source and tests | What exists and works now? | Authoritative for target behavior |
| Configured MCP code graph | What may call, depend on, or break around the target? | Optional gray-box impact map only |
| Project corpus | What reviewed implementation shape is reusable? | Curated exemplar, not target compatibility proof |
| MCP-fetched docs or upstream source | What does the pinned external version claim or implement? | Must be pinned and verified |
| Hindsight | Which durable project decisions already exist? | Decision context, not runtime evidence |

**MCP is an evidence transport, never the authority or proof of correctness.** Current source, executable tests, and observable target behavior remain authoritative. The local corpus remains a separate curated seam even when MCP retrieves graph or upstream evidence.

## Phase 1 — Create the Observable Contract

Use `/create <goal>` to establish the explicit slug and full specification before adopting code.

Define:

- the user-visible success behavior;
- at least one controlled failure behavior;
- target versions and compatibility constraints;
- the named problem the candidate pattern solves;
- non-goals, especially architecture not being imported;
- security, privacy, migration, and rollback consequences;
- acceptance evidence that can fail independently of implementation internals.

Do not begin with the exemplar's classes, modules, or abstractions. Begin with the target's observable contract.

## Phase 2 — Map Current Target Impact Through MCP

Prefer a configured MCP code graph for relationship discovery when it is healthy:

1. Confirm the indexed repository is the exact target repository.
2. Run a **code graph health-probe against a known target symbol or path** and confirm it resolves to current files.
3. Ask bounded questions about entry points, callers, dependencies, trust boundaries, seams, and nearby tests.
4. Verify every graph result against current source before using it in a requirement or plan.
5. If scope is ambiguous, the health probe fails, or results are stale, fall back to `read`, `grep`, and `find`.

Do not request a repository dump. Keep the MCP result to a bounded impact map with file/symbol evidence and unresolved gaps.

## Phase 3 — Qualify Corpus and Upstream Evidence

Run the local corpus gates in order:

```bash
node --experimental-strip-types .pi/scripts/corpus.ts validate .pi/corpus
node --experimental-strip-types .pi/scripts/corpus.ts stale .pi/corpus 90
node --experimental-strip-types .pi/scripts/corpus.ts search .pi/corpus "<one normalized intent term or exact tag>" 3
```

A stale report is a requalification signal, not permission to ignore provenance. Search is literal and case-insensitive, so use one discriminative term or exact tag; if it returns no match, try one bounded synonym rather than dumping the corpus. Read only the selected entry's `entry.json` and listed source/test/license files.

For every external candidate, record its **exact commit, license, and canonical or focused tests** on one evidence line. Record observed failures as well as passes, including environment or version caveats. When MCP returns source content, verify the repository, ref, path, and relevant bytes against the declared origin.

Reject candidates that lack a compatible license, a stable origin, behavior-bearing tests, or a target problem they actually solve.

## Phase 4 — Extract the Invariant, Not the Architecture

In `/plan <slug>`, compare candidate and target explicitly:

| Required field | Question |
|---|---|
| Observable contract | Which externally visible invariant is reusable? |
| Target impact | Which current entry points, dependents, and tests are affected? |
| Adaptation delta | What must change for target versions and conventions? |
| Non-goals | Which candidate architecture, naming, or dependencies stay behind? |
| Verification | Which black-box and consequence checks prove the adaptation? |
| Rollback | How can the target return to its prior behavior safely? |

Add a seam only for named variance, a trust boundary, or a concrete failure risk. Every proposed **seam must name its enabling point and a real alternative or substitute**. If any of those are missing, keep the implementation direct.

The plan must identify the smallest useful source and test pair, then decompose it into safe vertical slices. Upstream file structure is evidence, not a required target layout.

## Phase 5 — Implement With Outside-In Evidence

During `/ship <slug>`:

1. Write or identify the failing public-boundary test first.
2. Confirm it fails for the intended contract reason.
3. Implement the smallest vertical slice that makes it pass.
4. Verify controlled failure behavior.
5. Inspect the complete tracked and untracked worktree.
6. Recompute the task frontier after each graph transition.

**Black-box or public-boundary evidence comes first.** Use gray-box evidence only for a named evidence gap and consequence. Never use internal knowledge merely because MCP or the exemplar exposed it.

Never auto-copy a candidate, copy an entire architecture automatically, or perform automatic promotion. Adapt only the qualified invariant needed by the explicit target contract.

## Fabric and Parent Ownership

Use direct parent work for known-path verification. Delegate only bounded, independent evidence questions through `agents.run` inside `fabric_exec`, using configured MCP refs in the explicit child tool allowlist when needed. Follow the central maximum-three and sequential-sharding policy.

The parent must inspect and verify citations, graph results, source bytes, licenses, tests, child findings, actual edits, and final target behavior. Child output and MCP output are evidence packets, never completion proof.

## Phase 6 — Verify and Promote

Run `/verify <slug>` with:

- observable success and controlled failure evidence;
- target repository gates;
- compatibility/version evidence;
- complete worktree review;
- graph claims reconciled with current source;
- corpus/upstream provenance and license evidence;
- unresolved risks and rollback status.

Promotion remains narrow:

| Proven result | Destination |
|---|---|
| Feature-specific adaptation | Target source and tests only |
| Durable decision and rationale | Project Hindsight |
| Reusable reviewed exemplar | Pinned `.pi/corpus/<slug>/` entry |
| Rule proven by two successful applications | One relevant skill or lifecycle authority |

Do not promote a pattern because it looks clean, came through MCP, or passed only upstream tests.

## Stop Conditions

Stop and return to the parent when:

- no explicit lifecycle slug exists;
- the target contract is unclear;
- MCP repository scope or graph health cannot be established;
- current source contradicts graph output;
- origin, commit, license, or tests are missing;
- candidate and target versions are incompatible;
- a seam lacks an enabling point or real alternative;
- required approval is absent;
- target black-box evidence cannot be made to fail for the intended reason.

## Skill Result Contract

```xml
<skill_result>
  <skill>complex-pattern-adoption</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Explicit slug; target contract; MCP health probe and verified impact map; corpus/upstream provenance, license, tests, failures, and target verification</evidence>
  <artifacts>Complex lifecycle spec, plan, task graph, progress evidence, and any separately approved corpus entry</artifacts>
  <risks>Stale graph, incompatible version, unverified source, license gap, unjustified seam, missing approval, or none</risks>
</skill_result>
```
