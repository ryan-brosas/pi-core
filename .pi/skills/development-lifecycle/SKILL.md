---
name: development-lifecycle
description: Use when starting, planning, shipping, or verifying a work session — describes how `/create`, `/plan`, `/ship`, `/verify`, and `/research` interact with the 4 canonical artifact files at `.pi/artifacts/`.
version: 2.0.0
tags: [workflow, artifacts, planning, work-sessions]
agent_types: [Plan, general, review, scout]
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

Durable cross-feature knowledge belongs in `.pi/artifacts/MEMORY.md`, outside the active slug.

## Slash Commands (Lifecycle Hooks)

- `/create <idea>` — create the active slug and write `spec.md`. Loaded from `brainstorming` + `spec-driven-development`.
- `/plan` — create or refine the active `plan.md`. Loaded from `planning-and-task-breakdown`.
- `/ship` — execute `plan.md` or `tasks.json`, recording `progress.md`. Loaded from `shipping-and-launch`.
- `/verify` — run the evidence gate and append results to `progress.md`. Loaded from `verification-before-completion`.
- `/research` — write active research findings and progress that feed `/create` or `/plan`.

## Workflow

```
   /create  ──>  /plan  ──>  /ship  ──>  /verify
      │            │           │           │
   spec.md      plan.md     tasks.json   evidence
   .active      waves       progress.md  progress.md
```

**`/research` is sideways** — it feeds `/plan` or `/create`, not the linear path. These four canonical active-work files remain the complete lifecycle contract: `tasks.json` is authoritative, `plan.md` explains derived views, and `progress.md` stores evidence.

## When to Use Each Phase

| Phase | Trigger | Skip if |
|---|---|---|
| `/create` | New feature / product / PRD | Trivial one-liner |
| `/plan` | Multi-file change, ambiguous spec | Single known file, clear spec |
| `/ship` | Before merge / commit | No code change this session |
| `/verify` | Before "done" claim, always | Never skip |
| `/research` | Open-ended question, no answer path | The answer is in the code or docs already |

## Pi Subagent Routing

Skills are available to configured pi-subagents because the agent definitions enable skill loading. Route bounded work with `Agent`, never Fabric agents/actors/mesh:

| Need | `subagent_type` | Parent responsibility |
|---|---|---|
| Local discovery | `Explore` | Validate file:line evidence |
| External research | `scout` | Check citations and versions |
| Independent review | `review` | Run gates and verify findings |
| Small implementation | `general` | Inspect changes and test |
| Architecture/plan | `Plan` | Resolve decisions and own final plan |

Foreground for dependencies; independent calls may be issued together with `run_in_background: true`. Omit `model` and `thinking` so scoped definitions apply.

## Compact Handoff

At a pause, session boundary, or child integration point, append a compact handoff to the active `progress.md`: current goal, completed commits, next dependency, blockers, changed files, and last verification evidence. If bounded shared context would exceed about 500 tokens, an optional `worker-context.md` may hold it; reference that path from `progress.md` and delete or refresh it when stale. It is not a fifth canonical artifact or a state database.

## Lifecycle Rules
1. **No silent skipping** — if you skip a phase, name it in the response ("skipped /plan: single-file fix with clear spec"). This becomes the audit trail.
2. **Resolve `.active` first** — all feature-specific reads and writes use `.pi/artifacts/$(cat .pi/artifacts/.active)/`.
3. **`tasks.json` is the authoritative work graph** — `/create` emits version 2, `/plan` refines the same IDs, and displayed waves are derived snapshots only.
4. **`progress.md` is the evidence log** — attempts, failures, reviews, and current-attempt verification evidence go there.
5. **Durable decisions go to `MEMORY.md`** — only cross-feature learnings belong outside the active slug.
6. **`/verify` is non-negotiable** — every "done" claim cites evidence.

## Red Flags

- `.active` is missing or points to a nonexistent slug.
- Commands read root-level `TODO.md`/`PLAN.md` while the active slug uses lowercase artifacts.
- `progress.md` is empty after implementation or investigation.
- "Done" claim without `/verify` evidence.

## Skill Result Contract

```xml
<skill_result>
  <skill>development-lifecycle</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Phase(s) used named, artifact files updated, /verify evidence cited</evidence>
  <artifacts>Active spec.md / plan.md / tasks.json / progress.md paths touched</artifacts>
  <risks>Skipped phases, stale entries, or none</risks>
</skill_result>
```
