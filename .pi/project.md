---
purpose: Source-backed project purpose, architecture, and operating context
verified-at: 6d78d2e90a75
verified-state: mixed working tree observed 2026-08-03
---

# Project context

## Purpose

Pi Core is the shared operating layer for the Pi coding agent. It owns universal policy, project policy, prompts, skills, the workspace-policy extension, Fabric and Hindsight configuration, diagnostics, and contract tests.

Pi Core is configuration rather than an application package. The Git root has no project package manifest, lockfile, build artifact, or deployment target. Package manifests under `.pi/templates/astro/examples/` are example inputs, not Pi Core dependencies.

## Users and success

The primary user is a developer who starts Pi in the repository that owns the work while using Pi Core's shared resources through one global local-package registration.

Observable success means:

- Target projects can discover Pi Core policy, prompts, skills, and extensions without copying this `.pi/` tree.
- A target project's source and local `AGENTS.md` remain authoritative for project facts.
- Plain-language work uses full Fabric code mode and source-backed proof.
- `/init` keeps durable rules in concise policy while detailed context stays in `.pi/*.md`.
- Workspace enforcement blocks branch and linked-worktree violations without blocking read-only Git inspection.

## Boundaries and invariants

- Canonical checkout: `/home/ryanj/work/projects/pi-core` on `main`.
- Remote identity: `https://github.com/ryan-brosas/pi-core.git`.
- Policy sentinel: `PI_CORE_WORKSPACE_POLICY_V1`.
- Node.js 24 or newer and Pi 0.82.1 or newer are required by `.pi/scripts/doctor.ts`.
- This repository has no package manager. Example manifests are not install authority.
- `.pi/fabric/mesh/`, `.pi/state/`, `.pi/hindsight/`, caches, locks, session files, credentials, and MCP traces are runtime-managed.
- Prompts, policy, skills, extensions, and Fabric changes require `/reload` or a new session.
- The current worktree is mixed. Unrelated modified and untracked paths must remain untouched.

## Architecture

### Global discovery

`/home/ryanj/.pi/agent/settings.json` registers this repository's `.pi` directory as a local Pi package and registers the local Ultra Fabric checkout. `/home/ryanj/.pi/agent/AGENTS.md` resolves to `.pi/templates/agents-policy.md`. Pi loads that policy before a target project's local policy.

`docs/global-development.md` defines the ownership split: Pi Core owns the shared layer, global settings own package and runtime registration, and each target project owns its application source, goals, and local exceptions.

### Request execution

`.pi/fabric.json` enables QuickJS full code mode, mesh, compaction, agents, and in-place Prewalk.

The current worktree config allows eight concurrent children in the runtime but only one child per `fabric_exec` execution and depth one. Project policy still requires one-line user confirmation before ordinary work starts an advanced Fabric workflow.

`.pi/prompts/` contains optional task shortcuts. `.pi/skills/` contains focused guidance indexed by `.pi/skills/manifest.json`. Plain-language requests remain the normal entry point.

### Workspace enforcement

`.pi/extensions/workspace-policy/index.ts` is the executable extension entry point. It installs the Git shim, verifies that the global policy sentinel loaded, inspects Git root, branch, and common directory, then guards mutation-capable tools.

The source flow is:

1. `workspacePolicy` registers runtime hooks in `.pi/extensions/workspace-policy/index.ts`.
2. `inspectWorkspace` reads Git state.
3. `reasonFor` calls `evaluateWorkspace` from `.pi/extensions/workspace-policy/policy.ts`.
4. `evaluateWorkspace` permits non-Git work and primary `main` checkouts, and rejects other branches or linked worktrees.
5. `.pi/extensions/workspace-policy/git-wrapper.ts` and `bin/git` block forbidden Git creation before Git runs.

`.pi/tests/workspace-policy.test.ts` exercises the pure decision, aliases, extension hooks, Git shim, sentinel, and global registration.

### Diagnostics and CI

`.pi/scripts/doctor.ts` is the local health CLI. Its CLI `main` calls `inspectRepository`, prints text or JSON, rejects unknown flags, and returns nonzero for failures or strict-mode warnings.

`.pi/tests/doctor.test.ts` imports the exported checks and spawns the public CLI for success and controlled-failure paths.

`.github/workflows/test.yml` runs the doctor, all `.pi/tests/*.test.ts`, and every retained artifact task-graph validator on Node.js 24. This is configured CI behavior, not evidence of a current remote run.

`.pi/scripts/task-graph.ts` remains compatibility tooling for retained artifact graphs. It is not the ambient task scheduler.

### Initialization context

`.pi/prompts/init.md` reconciles `AGENTS.md`, `.pi/user.md`, `.pi/project.md`, `.pi/roadmap.md`, and `.pi/tech-stack.md`. `AGENTS.md` points to the detailed files but remains the only always-loaded project policy among them.

## CodeGraphContext links

- Repository probe: the exact index `/home/ryanj/work/projects/pi-core` responded with 1,050 files, 560 functions, 26 classes, and 72 modules.
- Known-symbol probes: `find_code` located `inspectRepository` in `.pi/scripts/doctor.ts:152` and `evaluateWorkspace` in `.pi/extensions/workspace-policy/policy.ts:114`. It also located `reasonFor` in the extension entry point.
- Source-verified doctor edge: `.pi/scripts/doctor.ts:355` calls `inspectRepository`. `.pi/tests/doctor.test.ts:8` imports it and the test at line 24 calls it.
- Source-verified policy edge: `.pi/extensions/workspace-policy/index.ts:8` imports `evaluateWorkspace`, and `reasonFor` calls it at line 85. `.pi/tests/workspace-policy.test.ts` dynamically imports the policy module and exercises `evaluateWorkspace`.
- Relationship limit: `find_all_callers`, `find_importers`, and `module_deps` returned zero for both known edges despite the current source above.
- Freshness limit: `list_watched_paths` returned an empty set.
- Fallback: graph search is a useful locator, but relationship negatives and freshness are not authoritative here. Source grep, direct reads, and executable tests remain authoritative.

## Source ownership

- `AGENTS.md`: concise project operating contract.
- `.pi/templates/agents-policy.md`: universal policy source and sentinel.
- `.pi/extensions/workspace-policy/`: maintained executable extension.
- `.pi/prompts/`: optional task prompts.
- `.pi/skills/` and `.pi/skills/manifest.json`: reusable guidance and registry.
- `.pi/scripts/doctor.ts`: health checks. `.pi/scripts/task-graph.ts`: compatibility validator.
- `.pi/tests/`: static and behavioral contracts.
- `.pi/templates/`: policy and project-context scaffolds plus reference templates.
- `docs/global-development.md`: global installation and project-isolation architecture.
- `.pi/artifacts/`: retained historical records, not ambient task state.

No `sources/` directory exists in this checkout. Initialization did not need upstream source.

## Memory, MCP, and runtime integrations

Hindsight is configured project-only with remote-derived project ID `github-com-ryan-brosas-pi-core`, bank `pi-coding`, recall and retain enabled, shared observations disabled, and mental-model injection disabled.

A scoped recall returned no relevant facts during initialization. The configured `http://localhost:8888` endpoint was not health-checked.

Fabric session memory exposed one hot active transcript for this Git root. No legacy `~/.pi/memory-md/` directory exists.

`mcp.servers()` exposed eleven effective server names: `cloudflare`, `cloudflare-bindings`, `cloudflare-builds`, `cloudflare-docs`, `cloudflare-observability`, `codegraphcontext`, `context7`, `deepwiki`, `exa`, `open-design`, and `pyxel`.

Registry metadata proves discovery, not server health. The doctor resolved the first-class MCP config to `/home/ryanj/.config/mcp/mcp.json`. Ignored `.mcp.json` is not maintained source.

## Verification and operations

At this initialization baseline:

- Node.js reported `v26.5.0`, and the process shell reported `/usr/bin/bash` on WSL2 Linux.
- `node --experimental-strip-types .pi/scripts/doctor.ts` exited 0 with 11 passes and one package-identity warning.
- `node --experimental-strip-types --test .pi/tests/*.test.ts` ran 362 tests: 361 passed and one failed.
- The failing contract is `plain-language work uses full Fabric code mode as the core execution path`. The current uncommitted `.pi/fabric.json` sets `prewalk.alwaysRearm` to `true`, while the test requires ordinary prompts not to force automatic handoff.

There is no verified build, package publication, deployment command, staging server, production server, or feature flag.

## Decisions, risks, and open questions

- Decision: source and executable tests outrank graph relationships, memory hints, and registry metadata.
- Risk: the current full suite is red because Fabric Prewalk configuration and its contract disagree.
- Risk: the doctor warns that `pi list` does not expose the expected `ultra-fabric` package identity even though settings register its local checkout and this session exposes Fabric.
- Risk: graph relationship queries under-report known edges and no watcher is active.
- Risk: a large mixed worktree raises ownership and commit-scope risk.
- Open question: whether automatic Prewalk rearming is intended, or the current config should return to the non-automatic contract.
- Open question: Hindsight, remote MCP servers, and global project isolation still need named live probes before any health claim.
