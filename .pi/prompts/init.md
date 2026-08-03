---
description: Build or refresh detailed project context from natural-language guidance
argument-hint: "[what this project should remember or emphasize]"
---

# Initialize this project

User guidance:

${ARGUMENTS:-Understand this project and establish a trustworthy working baseline.}

Treat that sentence as a natural-language outcome, not flags or command grammar. A bare `/init` asks for the same detailed baseline. Ask only when a consequential identity, trust, privacy, or write boundary cannot be learned from the repository or conversation.

`/init` should leave one coherent Git project easier to understand and safer to change. Choose the execution order from the evidence. Do not turn initialization into a fixed lifecycle or step chain.

## Working context

Resolve and read the installed Pi Core policy and these package templates:

- `.pi/templates/agents-policy.md`
- `.pi/templates/user.md`
- `.pi/templates/project.md`
- `.pi/templates/roadmap.md`
- `.pi/templates/tech-stack.md`

Read the target project's `AGENTS.md` or `CLAUDE.md`, manifests, lockfiles, config, CI, docs, source layout, tests, environment examples, and relevant memory. Check `sources/` early. If upstream source is needed, clone it into that directory and inspect it locally. Check `~/.pi/memory-md/<project>/` only when it exists, and treat its index as a retrieval hint rather than current truth.

Use one `fabric_exec` program for dependent discovery. Ordinary initialization uses no child agents or actors. Get one-line user confirmation before any advanced Fabric workflow unless the request already names it.

Use CodeGraphContext to connect entry points, callers, importers, module dependencies, ownership boundaries, and tests when the project is indexed. Call `list_indexed_repositories`, reuse the narrowest indexed ancestor of the exact Git root, then use scoped `find_code` and `analyze_code_relationships`. Inspect `list_watched_paths` and use `watch_directory` when a safe watcher is needed. Do not create a manual catalog. Verify graph hits in current source before writing them into project context. If the graph is stale or a relationship query fails, use `pi.read`, `pi.grep`, and `pi.find` and mark the graph limit.

## Context to maintain

Reconcile these files without blindly replacing user-authored content:

- `AGENTS.md` contains only durable operating rules, project invariants, safety gates, and exact verification commands. Keep it concise, preferably under 80 lines.
- `.pi/user.md` records explicit user preferences, communication style, workflow choices, environment facts, and privacy boundaries. Do not infer identity or store secrets.
- `.pi/project.md` explains purpose, users, success criteria, boundaries, architecture, key execution flows, source ownership, tests, integrations, risks, and open questions. Link graph findings to source paths.
- `.pi/roadmap.md` separates confirmed commitments from proposed work. Each item states outcome, status, effort with a short basis, dependencies, acceptance checks, risks, and any live verification still required. Use `S`, `M`, or `L` as relative scope, not a time promise.
- `.pi/tech-stack.md` records detected runtimes, frameworks, package managers, manifests, dependencies, generated or runtime paths, integrations, and commands whose exit status was observed. Mark unrun commands as unverified.

Detailed context belongs in those `.pi` files, not in `AGENTS.md`. Do not create a second task-state or handoff system. Do not invent product goals, roadmap commitments, live server state, feature flags, or user preferences. Label uncertain facts and proposed roadmap items clearly.

## Runtime context

Inspect configured Hindsight, Fabric session memory, first-class MCP, and graph coverage when those capabilities exist. Use `hindsight_status`, `hindsight_scope`, and `hindsight_config` to understand project memory. Use `memory.sessions` for transcript availability and `mcp.servers` for the effective MCP registry. Retain finalized context only when durable memory is enabled, the content is secret-scanned, and the update replaces the same deterministic document rather than creating duplicates.

Do not change Hindsight config, mental models, global MCP config, dependencies, packages, or remote services without explicit authorization. A missing optional provider does not block source-grounded project context.

## Safe merge and proof

Before writing, give one compact preview of the target root, files to create or merge, custom content to preserve, unsupported claims to omit, and any project-local or global effects. Existing scoped authorization covers the named project-local files. Ask again only if scope expands.

After writing, compare every context claim with source or observed command output. Run the repository's narrow checks, inspect the owned diff, exercise controlled failure where relevant, and check status. Confirm that `AGENTS.md` stays concise while the other context files contain the detail.

Return a short initialization receipt with the root, branch, HEAD, status, context files changed, key architecture links, graph coverage or fallback, memory and MCP gaps, verification results, and remaining risks. Separate local proof from named live servers or flags that still need confirmation. State that new prompt, policy, or context discovery takes effect after `/reload` or a new session.

Never claim a commit, deployment, publication, healthy service, or working feature without direct evidence.
