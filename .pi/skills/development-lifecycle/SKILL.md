---
name: development-lifecycle
description: Use when starting, planning, shipping, or verifying a work session — describes how `/create`, `/plan`, `/ship`, `/verify`, and `/research` interact with the 4 canonical artifact files at `.pi/artifacts/`.
version: 2.0.0
tags: [workflow, artifacts, planning, work-sessions]
tools: [read, write, edit, grep, bash]
---

# Development Lifecycle

## The 4 Active-Work Artifact Files

`.pi/artifacts/.active` contains the current slug. Its directory `.pi/artifacts/<slug>/` contains:

| File | Purpose | Maintained by |
|---|---|---|
| `spec.md` | Requirements, scope, and success criteria | `/create` |
| `plan.md` | Explanatory task details and derived wave snapshots | `/plan` when needed |
| `tasks.json` | Authoritative persisted work graph and task status | `/create`, `/plan`, `/ship`, `/verify` |
| `progress.md` | Attempt-scoped execution, review, verification, and blocker evidence | `/research`, `/ship`, `/verify` |

Durable cross-feature knowledge belongs in project Hindsight. Automatically recalled Hindsight context is used first, and automatic Hindsight retain captures ordinary durable session deltas. Active attempt evidence remains in the active slug.

When `/research` has no demonstrably related active slug, it writes `.pi/artifacts/<research-slug>/research.md` without changing `.active`. This is a standalone report, not a fifth active-work artifact.

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

## Slash Commands (Lifecycle Hooks)

- `/create <idea>` — create the active slug and write `spec.md`. Loaded from `brainstorming` + `spec-driven-development`.
- `/plan` — create or refine the active `plan.md`. Loaded from `planning-and-task-breakdown`.
- `/ship` — execute the authoritative `tasks.json`, consult `plan.md` only as an explanatory view, and record `progress.md`; stop if plan and graph task IDs diverge. Loaded from `shipping-and-launch`.
- `/verify` — run the evidence gate and append results to `progress.md`. Loaded from `verification-before-completion`.
- `/research` — persist findings in related active `progress.md`, or create a standalone `research.md` when active work is missing or unrelated; feed the result into `/create` or `/plan`.

## Workflow

```
   /create  ──>  /plan  ──>  /ship  ──>  /verify
      │            │           │           │
   spec.md      plan.md     tasks.json   evidence
   .active      waves       progress.md  progress.md
```

**`/research` is sideways** — it feeds `/plan` or `/create`, not the linear path. These four canonical active-work files remain the complete lifecycle contract: `tasks.json` is authoritative, `plan.md` explains derived views, and `progress.md` stores evidence.

Feedback routes are advisory recommendations; record the route decision in `progress.md`.

| Finding | Recommended route |
|---|---|
| Unknown fact | `research` |
| Changed desired behavior | `create` |
| Architecture or design gap | `plan` |
| Known implementation defect | `ship` |

Selecting a route does not automatically invoke any command or phase; it never mutates `.active` or changes lifecycle state automatically.

## When to Use Each Phase

| Phase | Trigger | Skip if |
|---|---|---|
| `/create` | New feature / product / PRD | Trivial one-liner |
| `/plan` | Multi-file change, ambiguous spec | Single known file, clear spec |
| `/ship` | Before merge / commit | No code change this session |
| `/verify` | Before "done" claim, always | Never skip |
| `/research` | Open-ended question, no answer path | The answer is in the code or docs already |

## Fabric Agent Routing

Direct parent work is the default. Route bounded task shapes through `agents.run` inside `fabric_exec` with a self-contained task and explicit tool allowlist:

| Need | Fabric task shape | Parent responsibility |
|---|---|---|
| Local discovery | Read-only local evidence | Validate file:line evidence |
| External research | Read-only source research | Check citations and versions |
| Independent review | Read-only scoped review | Run gates and verify findings |
| Small implementation | Surgical bounded edit | Inspect changes and test |
| Architecture/plan | Advisory blueprint | Resolve decisions and own final plan |

Keep dependencies foreground and sequential. For genuinely independent work, run at most three calls in one `Promise.all` wave and process overflow in sequential shards. Small read-only discovery or research should prefer `openai-codex/gpt-5.6-luna` with `thinking: "medium"` when available. The parent inspects child output and verifies all results.

## Compact Handoff

At a pause, session boundary, or child integration point, append a compact handoff to the active `progress.md`: current goal, completed commits, next dependency, blockers, changed files, and last verification evidence. If bounded shared context would exceed about 500 tokens, an optional `worker-context.md` may hold it; reference that path from `progress.md` and delete or refresh it when stale. It is not a fifth canonical artifact or a state database.

## Lifecycle Rules
1. **No silent skipping** — if you skip a phase, name it in the response ("skipped /plan: single-file fix with clear spec"). This becomes the audit trail.
2. **Resolve `.active` first** — all feature-specific reads and writes use `.pi/artifacts/$(cat .pi/artifacts/.active)/`. `/research` must verify topic relevance before using it and otherwise write a standalone report without changing `.active`.
3. **`tasks.json` is the authoritative work graph** — `/create` emits version 2, `/plan` refines the same IDs, and displayed waves are derived snapshots only.
4. **`progress.md` is the evidence log** — attempts, failures, reviews, and current-attempt verification evidence go there.
5. **Hindsight is the durable memory authority** — use automatic recall first, bounded `hindsight_recall` or `hindsight_reflect` only for material gaps, automatic retain for ordinary session deltas, and `hindsight_retain` only for raw high-value content requiring immediate persistence.
6. **`/verify` is non-negotiable** — every "done" claim cites evidence.

## Red Flags

- An active-feature command finds `.active` missing or pointing to a nonexistent slug; standalone `/research` is the exception.
- `/research` attaches findings to an active slug without establishing topic relevance.
- Commands read root-level `TODO.md`/`PLAN.md` while the active slug uses lowercase artifacts.
- `progress.md` is empty after implementation or investigation.
- "Done" claim without `/verify` evidence.

## Skill Result Contract

```xml
<skill_result>
  <skill>development-lifecycle</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Phase(s) used named, artifact files updated, /verify evidence cited</evidence>
  <artifacts>Active spec.md / plan.md / tasks.json / progress.md paths, or standalone research.md, touched</artifacts>
  <risks>Skipped phases, stale entries, or none</risks>
</skill_result>
```
