---
name: improve-codebase-architecture
description: Use when the user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more testable and AI-navigable.
version: 1.1.0
tags: [architecture, refactor, code-quality, code-graph]
dependencies: [test-driven-development, code-cleanup, agent-code-quality-gate, verification-before-completion]
tools: [read, grep, find, bash]
---

# Improve Codebase Architecture

## Iron Laws

<EXTREMELY-IMPORTANT>
- **Architecture change = behavior-preserving.** Tests stay green.
- **One axis at a time.** Not naming + layering + packaging in one PR.
- **Each step independently shippable.** Strangler fig, not big-bang.
- **Measure before and after.** Cyclomatic complexity, coupling, build time.
- **The code graph is an optional locator, never authority.** Source and observable behavior decide.
- **A seam requires real variance.** Do not add an interface only to make mocking convenient.
- **Make easy changes easy, hard changes possible.** Not "perfect". Just better.
</EXTREMELY-IMPORTANT>

## When to Use

"Improve the architecture"; module too coupled; tests hard to write; "this class is too big"; AI tools struggle; build/test time high; on-boarding painful.

## When NOT to Use

Architecture is fine; "redesign" without a problem; rewrites (different risk); user wants features.

## Load the Focused References

Read only the branch needed for the task:

1. Start with [LANGUAGE.md](LANGUAGE.md) when naming modules, interfaces, seams, adapters, depth, leverage, or locality.
2. Read [DEEPENING.md](DEEPENING.md) before consolidating modules or changing a seam.
3. Read [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md) only when materially different public interfaces deserve comparison. Zero children remains valid.
4. Read [ADR-FORMAT.md](ADR-FORMAT.md) only when a hard-to-reverse, surprising trade-off warrants an ADR.
5. Read [CONTEXT-FORMAT.md](CONTEXT-FORMAT.md) only when project-specific language must be made explicit.
6. Use [HTML-REPORT.md](HTML-REPORT.md) only when the user asks for the visual architecture report.

## Graph-Assisted Impact Map

For a shared-surface refactor, first probe the configured code graph with a known symbol from the exact repository. The graph is an optional locator:

- if healthy, locate callers, importers, module dependencies, complexity, and likely blast radius;
- verify every graph hit against current source bytes with `pi.read`, `pi.grep`, or `pi.find` before using it;
- if the probe is stale, contradictory, unavailable, or misses the known symbol, record graph analysis as N/A and fall back to `pi.read`, `pi.grep`, and `pi.find`;
- never let graph output replace source inspection, tests, or public-interface acceptance.

Do not require graph analysis for a local body-only edit whose callers and consequences are already explicit.

## Responsibility Chain

This skill owns pre-edit impact and seam decisions. `test-driven-development` owns RED/GREEN behavior. `code-cleanup` owns post-GREEN simplification. `agent-code-quality-gate` is the automatic completion gate for scope, duplication, behavior, evidence, and regressions. `verification-before-completion` owns repository commands and the final black-box claim. `code-review-and-quality` is an independent requested or consequence-driven review, not another automatic pass. Do not duplicate those responsibilities here.

## The Refactoring Ladder

```
1. Rename    (~hours, high signal)
2. Extract   (~hours)
3. Move      (~hours)
4. Restructure (interface, layering — ~days)
5. Repackage (~weeks)
6. Rewrite   (~months)
```

Start at the bottom. Don't jump to 5.

## Approach

1. **Identify the smell.** Don't refactor what isn't broken.
2. **Define the public contract.** Through the public interface or seam, name black-box success and controlled failure criteria; `test-driven-development` and verification prove them.
3. **Map impact.** Use current source; add the optional healthy-graph locator only for shared or unclear blast radius.
4. **Choose the seam.** Name the concrete production and test alternatives. If nothing varies, keep direct code.
5. **Measure baseline.** Record only applicable coupling, complexity, behavior, or build evidence.
6. **Pick the smallest change.** One independently verifiable rename, extract, move, or interface slice.
7. **Prove and simplify.** Run RED/GREEN where behavior changes, then `code-cleanup` and the quality gate.
8. **Measure and report.** Compare the same evidence and stop when the named problem improves. Commit only when the user explicitly requests it.

## Common Smells

| Smell | Indicator | First move |
|---|---|---|
| Long method | > 30 lines, multiple responsibilities | Extract method |
| God class | 1000+ lines, 20+ methods | Extract class |
| Tight coupling | Changing A forces changes in B | Dependency injection |
| Feature envy | Method uses B's data more | Move method to B |
| Primitive obsession | Strings/numbers for domain | Value objects / branded |
| Long parameter list | > 3 params, especially bools | Parameter object / options |
| Shotgun surgery | One change touches 5+ files | Consolidate |
| Divergent change | One class changes for many reasons | Split by axis |

## Module Boundaries

**Good**: single purpose, small interface, changes localized, testable.
**Bad**: two things, wide interface, one change touches many files, tests mock the world.

## When to Stop

Continue only while the named problem measurably improves without expanding scope. Stop when the evidence plateaus, the contract is easy to verify, or the next step costs more than the named consequence justifies.

## Strangler Fig Pattern

For larger refactors:
1. **Build new alongside old.** Both work.
2. **Route traffic incrementally.** 10% → 50% → 100%.
3. **Remove old path.** Once 100% on new.
4. **One piece at a time.** Module by module.

## Common Mistakes

Refactor without tests; big-bang rewrite; "perfect is the enemy" → over-polish; rename without target; refactor + feature in one PR; no measurement.

## Red Flags

Refactor without tests; no baseline; "I think this is better" (no metric); "rewrite it"; multiple axes; refactor + feature; tests skipped; "moved it, better" (no proof).

## Anti-Patterns

**Refactor without tests**; **no baseline**; **"rewrite"**; **multiple axes**; **refactor + feature**; **"I think"**; **"moved it"**; **one PR, many changes**.
