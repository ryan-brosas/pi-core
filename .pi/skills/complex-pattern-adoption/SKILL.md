---
name: complex-pattern-adoption
description: Use when autonomously locating, copying, adapting, vendoring, importing, or promoting reusable code from indexed projects, inspiration, MCP, or upstream source. Selects the smallest coherent working slice, preserves output behavior, and interrupts only for material conflicts.
version: 2.2.0
tags: [patterns, adoption, reuse]
dependencies: [source-driven-development, verification-before-completion]
---

# Complex Pattern Adoption

## Mandate

External examples are evidence, not paperwork triggers. Every adaptation names an observable behavior contract—the invariant it preserves and the controlled failure that proves it. The user states the desired outcome once; evidence work executes directly without a lifecycle command sequence or persisted scheduler.

Independently rewritten ideas and patterns require no license or provenance ceremony. Do not require source pins, commit hashes, notices, or legal review merely because an external example informed the reasoning.

When copying or distributing upstream files or substantial expressive material, identify the exact source, check the applicable license or terms, retain required notices, and verify source or byte integrity.

Autonomous reuse starts from the requested outcome. After inspecting the target, health-probe the global graph, search the current project and reviewed project implementations before `<work-root>/inspo`, then verify candidate paths against actual source. The graph is a locator, never authority. The agent selects the files and copies the smallest coherent working slice; the user does not manually choose folders or feed source into context.

## Choose the Mode

| Mode | Intent | Evidence center |
|---|---|---|
| **Copy into target** | Copy a related working slice, establish parity, then improve it locally | Working output/behavior contract, coherent dependency boundary, applicable copied-material terms |
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
| Upstream source/tests | What behavior or failure boundary is useful? | Evidence; exact identity is required only for copied bytes or version-specific claims |
| Hindsight | Which prior decisions matter? | Context, not runtime proof |

## Execute in One Fabric Program

Use `fabric_exec` to combine bounded source inspection, target inspection, integrity checks when bytes are copied, and applicable verification. Keep intermediate evidence in the sandbox. Add one `agents.run` only when independent source qualification or review materially improves confidence.

Do not audit an entire repository before reuse. Query broadly, then read only one to three closest candidates and trace enough imports, contracts, tests, and configuration to identify the smallest coherent slice. Prefer working project implementations over raw inspiration when behavior fit is equal.

MCP transports evidence; it is never authority by itself. Verify graph claims against source. Exact commit, path, and byte checks are required only when copying material or making an exact-version claim.

## Copy Into Target Mode

1. Define the working output or behavior as the contract: visible result, interaction, API response, event trace, or other observable evidence.
2. Let the agent choose the related source and copy the smallest coherent slice with required imports, contracts, focused tests, and configuration.
3. Copy first and make the baseline run in the target before generalizing it. Exact copying is allowed when the source fits and applicable terms permit it.
4. Customize and integrate against target constraints. Preserve the baseline as a preset or behavior fixture when useful.
5. Run focused review and deslopification after the copied behavior works; quality compounds in the target instead of requiring a repository-wide source audit.
6. After verification, prefer the improved target implementation for future matching while it remains available at its indexed project path.

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
| Reviewed reusable example | Verified target implementation at its indexed project path; prefer it in future matching |
| Repeated decision rule | One focused skill after multiple successful applications |

## Conflict-Only Interruption

Do not ask the user to select exemplars, folders, names, or placement. Interrupt only when evidence reveals a material conflict: equally suitable but architecturally incompatible candidates, a new or upgraded dependency, a coherent slice much larger than requested, replacement of maintained target behavior, runtime or framework incompatibility, incompatible terms for exact copied material, or concurrent target drift. Otherwise choose, copy, adapt, verify, and report autonomously.

## Stop Conditions

Stop when target/source evidence contradicts the intended behavior, adapted behavior lacks an observable boundary, or a high-risk cluster lacks representative evidence. For copied material only, also stop when source identity, applicable terms, approved path scope, ownership, required authorization, or integrity proof is missing.

## Result Contract

```xml
<skill_result>
  <skill>complex-pattern-adoption</skill>
  <status>success|partial|blocked|failure</status>
  <mode>copy-target|adapt|vendor|curate|promote</mode>
  <evidence>Target behavior proof for adaptations; source/integrity and applicable-terms proof only for copied material; representative risk coverage</evidence>
  <artifacts>Target changes, optional source notes, and copied-material records only when applicable</artifacts>
  <risks>Untested behavior, copied-material permission or integrity gap, ownership conflict, or none</risks>
</skill_result>
```
