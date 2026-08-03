---
purpose: Confirmed direction, proposed work, dependencies, and acceptance checks
verified-at: f33c4b9
---

# Roadmap

This roadmap separates user-confirmed outcomes from proposed work. Effort describes relative scope, not elapsed time.

## Effort scale

- `S`: one bounded cohort with narrow verification.
- `M`: several coupled files or checks within Pi Core.
- `L`: cross-project, migration, deployment, or live coordination.

## Current direction

Keep Pi Core small enough to load globally, strict enough to prevent unsafe workspace changes, and detailed enough to understand a target project without inflating `AGENTS.md`.

## Confirmed work

### Concise policy and detailed initialization context

- Status: complete locally, not committed.
- Effort: `M` because it changes global policy, project policy, `/init`, four templates, generated context, and contract tests.
- Evidence: the user requested a shorter `AGENTS.md`, natural-language `/init`, and detailed `user.md`, `project.md`, and `roadmap.md` output.
- Dependencies: existing Pi prompt discovery, global package registration, Hindsight, Fabric MCP, and CodeGraphContext.
- Acceptance:
  - `AGENTS.md` remains under 80 lines and contains only durable rules and project invariants.
  - `/init` treats its argument as natural-language guidance rather than flags or a lifecycle.
  - `/init` reconciles `.pi/user.md`, `.pi/project.md`, `.pi/roadmap.md`, and `.pi/tech-stack.md`.
  - Roadmap items carry status, relative effort, dependencies, acceptance checks, risks, and live confirmation.
  - Focused policy, init, graph, and workspace tests pass.
- Risks: detailed context can become stale if source changes without a later `/init` refresh.
- Live confirmation: none. A reload is required for active Pi sessions.

### Keep the runtime surface lean

- Status: complete locally, not committed.
- Effort: `L` because the cleanup crossed project files, global MCP configuration, and an external checkout.
- Evidence: the user requested removal of unused workday, corpus, research-enforcement, and duplicate Project Intelligence machinery.
- Dependencies: CodeGraphContext and direct research MCP routes must remain available.
- Acceptance:
  - `workspace-policy` is the only project extension.
  - Research routes directly through Fabric providers without an enforcement extension.
  - CodeGraphContext replaces Project Intelligence for structural lookup.
  - Fabric child limits remain one concurrent child, depth one, and 100,000 tokens per child.
- Risks: CodeGraphContext caller analysis and watcher behavior remain unreliable.
- Live confirmation: `/reload` or a new session must confirm the reduced registry.

### Preserve global project isolation

- Status: ongoing.
- Effort: `M` because it spans global registration, policy linkage, project startup, and cross-directory smoke tests.
- Evidence: `docs/global-development.md` defines Pi Core as the shared layer while target repositories own source, requirements, and local policy.
- Dependencies: the global Pi settings entry, policy symlink, Hindsight project scope, and workspace-policy extension.
- Acceptance:
  - Starting Pi in another project exposes Pi Core resources without copying this repository.
  - The target project's policy and source remain authoritative.
  - Hindsight and session memory do not cross project identity boundaries.
- Risks: machine-global settings can drift from this checkout.
- Live confirmation: run a smoke session from a non-Pi-Core repository.

## Proposed work

### Smoke-test `/init` in a representative target project

- Why it may matter: static contracts prove prompt text, not the quality of generated context in another repository.
- Effort: `M` because the check needs a separate trusted project, generated-file review, graph evidence, and cleanup or explicit retention.
- Decision needed: choose a safe target project and authorize its project-local context writes.
- Dependencies: reload the new prompt and confirm the target's trust boundary.
- Acceptance if approved: the target receives concise policy plus accurate detailed context without global config changes.

### Resolve strict doctor package identity

- Why it may matter: the normal doctor passes with one warning, while the full suite's strict bootstrap test fails.
- Effort: `S` if the expected package name only needs to accept the configured local Ultra Fabric checkout. `M` if package discovery must change.
- Decision needed: define whether local source registration or only a package identity satisfies bootstrap.
- Dependencies: inspect `pi list`, global settings resolution, and Ultra Fabric package metadata.
- Acceptance if approved: `doctor --strict` exits zero without hiding a real missing runtime.

### Make graph refresh deterministic

- Why it may matter: stale graph nodes can survive deletions, caller queries can fail in the backend, and `watch_directory` can hold the MCP request open.
- Effort: `M` because the work crosses MCP behavior, index lifecycle, fallback policy, and verification.
- Decision needed: choose a supported refresh path that does not delete graph data silently.
- Dependencies: CodeGraphContext server behavior and exact repository ownership.
- Acceptance if approved: a source edit or deletion becomes visible through a bounded refresh probe, with source fallback on failure.

### Add drift synchronization only after evidence of drift

- Why it may matter: global package registration, policy linkage, and Fabric defaults could diverge across machines.
- Effort: `L` because a synchronizer would mutate machine-global configuration and need rollback and cross-machine tests.
- Decision needed: wait for repeated drift before adding machinery.
- Dependencies: observed drift from at least two real setups.
- Acceptance if approved: an idempotent tool reports and repairs only authorized differences.

## Completed outcomes

- Removed the abandoned `/workday` prompt and test.
- Removed corpus source, tests, doctor coupling, and its dedicated artifact.
- Removed the research-enforcement extension, config, tests, and artifact.
- Removed the duplicate Project Intelligence MCP registration, policy test, and checkout.
- Reduced project extensions to `workspace-policy`.
- Replaced procedural `/init` modes with natural-language guidance and source-backed context files.

These outcomes exist only in the current worktree until committed. No deployment or publication occurred.

## Blockers and risks

- Exact staged-tree suite: 75 tests, 72 pass, 0 fail, and 3 environment-dependent skips. The normal doctor still warns because Ultra Fabric is not reported under the expected package identity.
- The worktree contains unrelated changes. Any future commit must remain path-scoped.
- A live Pi process keeps old prompts and extensions until `/reload` or a new session.
