---
purpose: Source-backed project purpose, architecture, and operating context
verified-at: f33c4b9
---

# Project context

## Purpose

Pi Core is the shared operating layer for the Pi coding agent. It provides global policy, project policy, prompt templates, skills, extensions, Fabric configuration, memory configuration, and contract tests.

It is configuration rather than an application package. The repository has no package manifest, lockfile, build artifact, or deployment target.

## Users and success

The primary user is a developer who starts Pi in the repository that owns the work while keeping Pi Core's shared resources available globally.

Observable success means:

- A target project can load Pi Core prompts, skills, extensions, and policy without copying `.pi/` into that project.
- A target project's own source and `AGENTS.md` remain authoritative for local facts.
- Plain-language tasks run through full Fabric code mode and receive source-backed verification.
- `/init` can keep `AGENTS.md` concise while building detailed project context.
- Workspace enforcement blocks branch and worktree violations without blocking read-only Git work.

## Boundaries and invariants

- Canonical checkout: `/home/ryanj/work/projects/pi-core`.
- Primary branch: `main`.
- Git remote: `https://github.com/ryan-brosas/pi-core.git`.
- The workspace-policy extension enforces the primary checkout and sentinel `PI_CORE_WORKSPACE_POLICY_V1`.
- Node.js 24 or newer is required. Local verification used Node.js 26.5.0.
- Pi 0.82.1 or newer is required. Local verification used Pi 0.83.0.
- No package manager belongs to this repository.
- Runtime state, credentials, memory banks, caches, and MCP traces must remain outside maintained source.

## Architecture

### Global discovery

`/home/ryanj/.pi/agent/settings.json` registers `/home/ryanj/work/projects/pi-core/.pi` as a local Pi package. The same settings file points at a local Ultra Fabric checkout and installed provider packages.

`/home/ryanj/.pi/agent/AGENTS.md` is a symlink to `.pi/templates/agents-policy.md`. Pi loads that global policy before a target project's local policy. Changes to prompts, skills, extensions, policy, or Fabric settings require `/reload` or a new session.

### Request execution

`.pi/fabric.json` enables full code mode, agents, mesh, compaction, and in-place Prewalk. Ordinary work uses one `fabric_exec` program with `pi.*`. Agent execution is available but capped at one child and requires user opt-in under policy.

Prompts in `.pi/prompts/` provide optional shortcuts. Skills in `.pi/skills/` carry focused guidance. Neither replaces plain-language requests.

### Workspace enforcement

`.pi/extensions/workspace-policy/index.ts` installs a Git shim, checks that the global policy sentinel was loaded, inspects the active workspace, and guards mutation-capable tools.

CodeGraphContext found `evaluateWorkspace` in `.pi/extensions/workspace-policy/policy.ts` and linked it to `reasonFor` in the extension entry point. Source inspection confirms that `reasonFor` converts the policy decision into the runtime block reason. `.pi/tests/workspace-policy.test.ts` exercises the pure policy, extension hooks, Git shim, aliases, and global registration.

### Repository health

`.pi/scripts/doctor.ts` owns environment checks. Its `main` function calls `inspectRepository` in the same file and exits nonzero for failures, or warnings under `--strict`. CodeGraphContext reported no module importers for the CLI module. Source inspection and `.pi/tests/doctor.test.ts` provide the behavioral contract.

### Initialization context

`.pi/prompts/init.md` reads the policy and context templates, inspects one Git project, uses CodeGraphContext when healthy, and reconciles:

- `AGENTS.md`
- `.pi/user.md`
- `.pi/project.md`
- `.pi/roadmap.md`
- `.pi/tech-stack.md`

The detailed files are not Pi context files by themselves. `AGENTS.md` points agents to the relevant document, and `/init` may retain secret-scanned content in configured project memory.

## Source ownership

- `AGENTS.md`: concise Pi Core project contract.
- `.pi/templates/agents-policy.md`: global policy source and workspace sentinel.
- `.pi/extensions/workspace-policy/`: the only maintained project extension.
- `.pi/prompts/`: optional task prompts.
- `.pi/skills/`: reusable guidance, indexed by `.pi/skills/manifest.json`.
- `.pi/scripts/doctor.ts`: repository and runtime diagnostics.
- `.pi/tests/`: static and behavioral contracts.
- `docs/global-development.md`: global installation and project-isolation architecture.
- `.pi/artifacts/`: historical records, not the ambient scheduler.

## Memory, MCP, and graph

`.pi/hindsight.json` enables the `pi-coding` project bank, domain-tagged scope, recall, and retain. The user bank is disabled.

Fabric reads first-class MCP definitions from `/home/ryanj/.config/mcp/mcp.json`. The relevant providers are CodeGraphContext for local structure, Context7 for library docs, Exa or Codex Search for web sources, and DeepWiki for repository docs.

CodeGraphContext has an exact index for this checkout. The observed index contained 950 files, 558 functions, 26 classes, and 72 modules. Graph caller queries have produced a backend Cypher syntax error, and `watch_directory` did not return cleanly in one probe. Source search and executable tests remain the fallback.

## Verification and operations

CI on Node.js 24 runs the doctor, all `.pi/tests/*.test.ts`, and every historical artifact graph validator.

There is no build, package publication, deployment command, staging server, production server, or project feature flag verified for Pi Core.

## Risks and open questions

- `doctor --strict` currently fails because `pi list` does not report the expected `ultra-fabric` package identity, even though settings register a local Ultra Fabric checkout and the current session exposes Fabric.
- The CodeGraphContext watcher and caller relationship endpoint need a reliable refresh path before graph freshness can be treated as automatic.
- The new `/init` context set still needs a smoke run in a separate target project.
- The worktree contains unrelated and uncommitted changes. No commit or publication is implied.
