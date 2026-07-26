---
name: development-lifecycle
description: Use when choosing Quick, Standard, or Complex delivery and coordinating `/create`, `/plan`, `/ship`, `/verify`, and `/research` with optional graph-backed artifacts.
version: 2.0.0
tags: [workflow, artifacts, planning, work-sessions]
tools: [read, write, edit, grep, bash]
---

# Development Lifecycle

## Graph-Backed Artifact Files

Graph-backed commands use an explicit `.pi/artifacts/<slug>/` identity supplied by the caller. Missing, unsafe, or ambiguous slugs stop; no ambient file or previous command selects work.

| File | Purpose | Maintained by |
|---|---|---|
| `spec.md` | Requirements, scope, and success criteria | `/create` |
| `plan.md` | Optional boundary detail and derived wave snapshots | `/plan <slug>` when complex |
| `tasks.json` | Authoritative persisted work graph and task status | `/create`, `/plan`, `/ship`, `/verify` |
| `progress.md` | Attempt-scoped execution, review, verification, and blocker evidence | `/ship`, `/verify` |

Durable cross-feature knowledge belongs in project Hindsight. Automatically recalled Hindsight context is used first, and automatic Hindsight retain captures ordinary durable session deltas. Attempt evidence remains under its explicit slug.

`/research` is read-only by default. It persists only with `--save`, explicit user instruction, or a durable decision tied to an existing related artifact; it never creates lifecycle state merely to prove research occurred.

## Contract–Seam–Feedback Kernel

This is the sole named lifecycle authority. Define the observable contract before implementation. Add a seam only for named variance, a trust boundary, or a failure risk; every seam requires a reachable enabling point and a concrete alternative. Verify from the outside first, adding deeper evidence only for a named evidence gap and its consequence. Deliver the smallest safe vertical slice. Route feedback to the earliest lifecycle phase whose contract must change.

**Compact rule:** No requirement without an observable contract; no seam without concrete variance; no gray-box check without a named evidence gap; no MVP claim without a learning signal.

| Existing authority | Responsibility |
|---|---|
| `spec.md` | Observable contract |
| `plan.md` | Boundary and seam design plus evidence design |
| `tasks.json` | Authoritative scheduling |
| `progress.md` | Attempt evidence and advisory route decision |
| Hindsight | Durable cross-feature memory |

## Pattern Discovery and Promotion

Use each evidence source for one question; none replaces another:

| Source | Answers | Guard |
|---|---|---|
| Current source and tests | What exists and works now? | Authoritative; read entry points, contracts, dependents, and nearby tests |
| Configured code graph | What relationships and impact may matter? | Scope to the exact repository, health-probe a known target symbol or path, verify against source, and fall back to `read`, `grep`, and `find` when unhealthy or ambiguous |
| Project corpus | What reviewed implementation shape is worth imitating? | Run bounded `node --experimental-strip-types .pi/scripts/corpus.ts search .pi/corpus <intent>`; a curated exemplar is neither an impact map nor compatibility proof |
| Inspo or upstream code | What might become a pattern? | Candidate evidence only until qualified |

Promotion reuses the existing lifecycle and does not create a new workflow or artifact type. For any decision to adopt, adapt, import, or promote a pattern found through MCP, the corpus, inspo, or upstream source, load `complex-pattern-adoption`. Pattern adoption and promotion always use Complex delivery; a read-only lookup that makes no adoption decision may stop after evidence retrieval.

1. **Discover** a named current problem; do not harvest code without a decision it supports.
2. **Qualify** the candidate with its exact commit, license, and canonical or focused tests; record observed failures as well as passes.
3. **Extract** the observable contract, justified seam and enabling point, real alternative, and smallest useful source and test pair. Adapt the invariant rather than importing an architecture.
4. **Trial** it through Complex delivery with a failing public-boundary check and the smallest safe vertical slice.
5. **Verify** observable success and controlled failure first; use gray-box evidence only for a named gap.
6. **Promote** only to the narrowest durable level:

| Proven value | Destination |
|---|---|
| Feature-specific implementation | Target source and tests only |
| Durable decision and rationale | Project Hindsight |
| Reusable reviewed exemplar | `.pi/corpus/<slug>/` with pinned origin and validation evidence |
| Rule proven by two successful applications | One relevant skill or lifecycle authority; prompts reference it rather than restating it |

Clean-looking code alone is not promotable, and a corpus entry never becomes target behavior without a current contract and verification.

## Slash Commands (Lifecycle Hooks)

- `/create <idea>` — derive a candidate slug, check that exact artifact, then create `.pi/artifacts/<slug>/spec.md` and `tasks.json`.
- `/plan <slug>` — add optional implementation detail for complex work.
- `/ship <slug>` — execute the authoritative graph and record attempt evidence; stop if plan and graph IDs diverge.
- `/verify <slug|path|all>` — run evidence gates with or without a lifecycle artifact.
- `/research <topic> [--save]` — answer in chat by default and feed durable decisions into `/create` or `/plan` when needed.

## Workflow

```text
Quick:    request ───────────────────────────────> verify
Standard: create <slug> ─────────> ship <slug> ─> verify <slug>
Complex:  create <slug> ─> plan <slug> ─> ship <slug> ─> verify <slug>
```

**`/research` is sideways** — it feeds a decision into `/create` or `/plan`, not the linear path. `tasks.json` remains authoritative for graph-backed work, `plan.md` explains derived views, and `progress.md` stores attempt evidence.

Feedback routes are advisory recommendations; for graph-backed work, record the route decision in `progress.md`.

| Finding | Recommended route |
|---|---|
| Unknown fact | `research` |
| Changed desired behavior | `create` |
| Architecture or design gap | `plan` |
| Known implementation defect | `ship` |

Selecting a route does not automatically invoke any command or phase, select a slug, or change lifecycle state.

## When to Use Each Phase

| Phase | Trigger | Skip if |
|---|---|---|
| `/create` | Bounded feature needing a durable contract | Known low-risk Quick change |
| `/plan` | Cross-boundary sequencing or unresolved design | Lite spec is executable as written |
| `/ship` | Execute a selected graph-backed feature | Quick direct change |
| `/verify` | Before every "done" claim | Never skip applicable evidence |
| `/research` | A material unknown needs external/current evidence | Local code or existing docs answer it |

## Fabric Agent Routing

Direct parent work is the default. Route bounded task shapes through `agents.run` inside `fabric_exec` with a self-contained task and explicit tool allowlist:

| Need | Fabric task shape | Parent responsibility |
|---|---|---|
| Local discovery | Read-only local evidence | Validate file:line evidence |
| External research | Read-only source research | Check citations and versions |
| Independent review | Read-only scoped review | Run gates and verify findings |
| Small implementation | Surgical bounded edit | Inspect changes and test |
| Architecture/plan | Advisory blueprint | Resolve decisions and own final plan |

Keep dependencies foreground and sequential. For genuinely independent work, run at most three calls in one `Promise.all` wave and process overflow in sequential shards. Use configured model defaults unless a measured task need justifies an override. The parent inspects child output and verifies all results.

## Compact Handoff

For graph-backed work, a pause or child integration point may append a compact handoff to `<slug>/progress.md`: current goal, completed commits, next dependency, blockers, changed files, and last verification evidence. Keep it concise; do not create a separate state database for Quick work.

## Lifecycle Rules
1. **Choose the smallest mode** — Quick work does not need artifacts; name `/plan` omissions only when a graph-backed feature would reasonably require one.
2. **Require an explicit slug** — graph-backed planning and execution stop when the caller does not supply a valid slug; scope is never inferred from ambient state.
3. **`tasks.json` is authoritative when present** — `/create` emits version 2, `/plan` preserves IDs, and displayed waves are derived only.
4. **`progress.md` is attempt evidence, not a diary** — record failures, reviews, and current verification; omit routine narration.
5. **Hindsight is durable memory** — use automatic recall first, bounded `hindsight_recall` or `hindsight_reflect` only for material gaps, automatic retain for ordinary deltas, and `hindsight_retain` only for raw high-value content requiring immediate persistence.
6. **Verification is non-negotiable** — every "done" claim cites applicable evidence.

## Red Flags

- A graph-backed command proceeds without an explicitly supplied valid slug.
- Ambient state, a previous command, or a child selects lifecycle scope.
- `/research` writes an artifact without `--save`, explicit approval, or a durable related decision.
- `progress.md` contains routine narration rather than attempt evidence.
- A "done" claim lacks current applicable verification.

## Skill Result Contract

```xml
<skill_result>
  <skill>development-lifecycle</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Selected mode, applicable phases, and current verification</evidence>
  <artifacts>Explicit slug paths for graph-backed work, or none for Quick/read-only work</artifacts>
  <risks>Skipped required gates, stale evidence, or none</risks>
</skill_result>
```
