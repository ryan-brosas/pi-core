---
purpose: Source-backed project purpose, architecture, and operating context
---

# Project context

Every claim in this file should point to repository evidence, observed command output, or explicit user guidance. Label uncertain claims.

## Purpose

- Project outcome: [what this project exists to achieve]
- Current problem: [the need it addresses]
- Non-goals: [explicit exclusions]

## Users and success

- Primary users: [who and what they need]
- Secondary users: [if verified]
- Observable success criteria:
  - [user-visible or operational outcome]

## Boundaries and invariants

- Trust boundary: [repository, service, or data boundary]
- Compatibility contract: [runtime, API, data, or deployment constraint]
- Generated and runtime-managed paths: [paths and owners]
- Rules that must not change silently: [invariants]

## Architecture

Describe the smallest useful map of components and their responsibilities.

- Entry points: [path and role]
- Core modules: [path and role]
- Data or control flow: [source-backed path through the system]
- External integrations: [service and boundary]
- Configuration authority: [path]

## CodeGraphContext links

Record only graph findings verified in current source.

- Known symbol or path probe: [query and source path]
- Callers or importers: [relationship and source proof]
- Module dependencies: [relationship and source proof]
- Test targets: [relationship and executable proof]
- Graph limits or stale results: [fallback used]

## Source ownership

- Maintained source: [paths]
- Tests: [paths]
- Documentation: [paths]
- Generated output: [paths and generator]
- Runtime state: [paths]

## Verification and operations

- Local checks: [commands and observed status]
- Build or packaging: [command or none]
- Deployment path: [verified process or unknown]
- Live servers and flags: [verified names or unconfirmed]
- Rollback boundary: [verified process or unknown]

## Decisions, risks, and questions

- Current decisions: [source or user-backed]
- Known risks: [risk and evidence]
- Open questions: [what source cannot answer]

Update this file when architecture, purpose, ownership, or operational boundaries change.
