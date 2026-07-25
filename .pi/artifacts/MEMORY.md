# Project Memory

Durable project knowledge. Search with `rg -n "topic" .opencode/artifacts/MEMORY.md`, read with `read`, append with `edit`.

Updated: 2026-07-08

---

## Architecture

### Layers

```text
1. Instructions           AGENTS.md, skills
2. Commands               command/ — slash commands
3. Workflows              workflows/ — multi-agent orchestration
4. Plugins                plugin/ — runtime TypeScript plugins
5. Tools                  tool/ — agent-available tools
6. SDK                    plugin/sdk/ — shared types, interfaces
```

### Dependency Rules

| Layer | Can Import From |
|---|---|
| Instructions | Nothing (markdown, self-contained) |
| Commands | Instructions, Skills |
| Workflows | Commands, Instructions, Skills |
| Plugins | SDK only. Never from other plugins. |
| Tools | SDK, Plugins (via defined tool interfaces) |
| SDK | Nothing external. Must be self-contained types. |

### Principles

- **Plugin isolation** — plugins are independent modules; communicate via SDK interfaces, never by importing each other
- **No circular dependencies** — extract shared concerns to SDK
- **Minimal surface area** — keep SDK interfaces small and stable
- **File boundaries** — plugins ≤300 lines, SDK ≤150 lines, commands ≤500 lines, workflows ≤150 lines

---

## Decisions

### [2026-07-08] Memory System: File-Based Project Context

- **Context:** Replaced automated memory pipeline (observation tool, memory-search, memory.db) with file-based context
- **Decision:** Single `.opencode/artifacts/MEMORY.md` file for all durable project knowledge
- **Rationale:** Simpler than 4 separate files. No database, no auto-injection, no black-box pipeline. Grep-friendly, version-controlled.
- **Consequences:** Agents search with `rg -n`, read with `read`, append with `edit`. No automated capture.

---

## Patterns

### File-Based Context Reads

Before starting work: `rg -n "topic" .opencode/artifacts/MEMORY.md` to find relevant decisions, patterns, gotchas.

### Minimal Delegation

Prefer direct tools over `task()` delegation for surgical fixes. Delegate only for isolation, parallelism, or specialist focus. Cap each concurrent agent wave at three; preserve larger workloads with sequential, non-overlapping shards and parent verification.

### Agent Fan-Out Validation

Fan-out policy checks must distinguish agent counts and explicit concurrency maxima from unrelated tool-call, API-call, line, and context budgets. Include synthetic positive and negative cases whenever the detector changes.

### Close the Loop

Every non-trivial phase ends with a 1-3 line summary. If you can't summarize it, you don't understand it.

---

## Gotchas

- Task-graph schedulers must normalize repository-relative file aliases and subtract already-running tasks from shard capacity; serial tasks require zero running work. Keep regression tests for both invariants.
