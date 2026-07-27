---
name: complex-pattern-adoption
description: Use when adopting, adapting, vendoring, importing, or promoting reusable material from MCP, the project corpus, inspiration, or upstream source. Separates independently rewritten ideas from copied material and applies behavior or integrity evidence proportionately.
version: 2.1.0
tags: [patterns, adoption, corpus]
dependencies: [source-driven-development, verification-before-completion]
---

# Complex Pattern Adoption

## Mandate

External examples are evidence, not paperwork triggers. Every adaptation names an observable behavior contract—the invariant it preserves and the controlled failure that proves it. The user states the desired outcome once; evidence work executes directly without a lifecycle command sequence or persisted scheduler.

Independently rewritten ideas and patterns require no license or provenance ceremony. Do not require source pins, commit hashes, notices, or legal review merely because an external example informed the reasoning.

When copying or distributing upstream files or substantial expressive material, identify the exact source, check the applicable license or terms, retain required notices, and verify source or byte integrity.

## Choose the Mode

| Mode | Intent | Evidence center |
|---|---|---|
| **Adapt** | Independently rewrite an external invariant into target behavior | Observable target RED/GREEN and controlled failure; no provenance gate |
| **Vendor** | Distribute approved upstream files unchanged | Exact source, applicable terms/notices, byte/source parity, allowlist, load checks |
| **Curate** | Select multiple independent upstream units | Complete inventory, integrity for copied files, representative risk tests |
| **Promote exemplar** | Retain reviewed behavior worth imitating | Target behavior evidence; source note only when it helps maintenance |

Do not call rewritten behavior verbatim. Do not force behavior tests onto unchanged vendored bytes when integrity is the real contract.

## Required Inputs

For every mode, establish:

- target scenario and observable outcome;
- useful behavior, failure boundary, and target impact;
- copied, independently rewritten, and excluded material with reasons;
- dependencies, generated content, trust boundaries, and refresh path;
- target behavior or integrity proof and rollback.

For copied or distributed material only, also establish the exact source and destination paths, applicable terms and required notices, approved file scope, and parity method. Reject copied material when permission, identity, ownership, or bounded scope cannot be established. Those are not gates for independently rewritten ideas.

## Evidence Roles

| Evidence | Answers | Limit |
|---|---|---|
| Target source/tests | What currently exists and works? | Target authority |
| Optional code graph | What relationships may be affected? | Locator only; verify against source |
| Project corpus | What reviewed shape may be useful? | Exemplar, not compatibility proof |
| Upstream source/tests | What behavior or failure boundary is useful? | Evidence; exact identity is required only for copied bytes or version-specific claims |
| Hindsight | Which prior decisions matter? | Context, not runtime proof |

## Execute in One Fabric Program

Use `fabric_exec` to combine bounded source inspection, target inspection, integrity checks when bytes are copied, and applicable verification. Keep intermediate evidence in the sandbox. Add one `agents.run` only when independent source qualification or review materially improves confidence.

For project corpus evidence:

```bash
node --experimental-strip-types .pi/scripts/corpus.ts validate .pi/corpus
node --experimental-strip-types .pi/scripts/corpus.ts stale .pi/corpus 90
node --experimental-strip-types .pi/scripts/corpus.ts search .pi/corpus <intent> 3
```

MCP transports evidence; it is never authority by itself. Verify graph claims against source. Exact commit, path, and byte checks are required only when copying material or making an exact-version claim.

## Adapt Mode

1. Define the reusable observable invariant and controlled failure.
2. Write or identify the failing target boundary.
3. Implement the smallest independently rewritten target-native behavior; do not import an architecture wholesale.
4. Verify target success, controlled failure, and affected integration.
5. Record only decisions that materially help maintenance. A source note is optional; license and provenance are not adaptation gates.

## Vendor Mode

1. Define the exact allowlist and destination layout.
2. Establish a failing absence/parity/frontmatter/reference check.
3. Copy only approved bytes.
4. Verify exact-source identity, applicable license or terms, required notices, byte or source parity, loading, references, and exclusions.
5. Run containing repository checks.

## Curate Mode

1. Inventory every candidate from the source used for selection.
2. Decide `vendor`, `adapt`, or `exclude` per item with a reason.
3. Verify integrity for every included unchanged file.
4. Run behavioral RED/GREEN for every adaptation.
5. Pressure-test representative risk clusters and every destructive, financial, security/privacy, or broad-routing outlier.
6. Block only the affected item or cluster when possible.

## Parent Verification

The parent inspects target behavior, tests, child results, actual edits, complete worktree, and target gates. For copied material, it also checks source identity, applicable terms/notices, and integrity. Child or MCP output is evidence, never completion proof.

Promotion stays narrow:

| Proven result | Destination |
|---|---|
| Feature-specific adaptation | Target source and tests |
| Vendored skill | Skill catalog plus source/integrity record and required notices |
| Reviewed reusable example | Behavior-qualified corpus entry; optional source note |
| Repeated decision rule | One focused skill after multiple successful applications |

## Stop Conditions

Stop when target/source evidence contradicts the intended behavior, adapted behavior lacks an observable boundary, or a high-risk cluster lacks representative evidence. For copied material only, also stop when source identity, applicable terms, approved path scope, ownership, required authorization, or integrity proof is missing.

## Result Contract

```xml
<skill_result>
  <skill>complex-pattern-adoption</skill>
  <status>success|partial|blocked|failure</status>
  <mode>adapt|vendor|curate|promote</mode>
  <evidence>Target behavior proof for adaptations; source/integrity and applicable-terms proof only for copied material; representative risk coverage</evidence>
  <artifacts>Target changes, optional source notes, and copied-material records only when applicable</artifacts>
  <risks>Untested behavior, copied-material permission or integrity gap, ownership conflict, or none</risks>
</skill_result>
```
