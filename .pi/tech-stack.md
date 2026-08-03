---
purpose: Verified runtime, dependencies, integrations, and commands
verified-at: 6d78d2e90a75
verified-state: mixed working tree observed 2026-08-03
---

# Tech stack

## Runtime and languages

- Local runtime: Node.js `v26.5.0`.
- CI runtime: Node.js 24 in `.github/workflows/test.yml`.
- Minimum runtime: Node.js 24, enforced by `.pi/scripts/doctor.ts`.
- Pi CLI: 0.83.0. The doctor requires 0.82.1 or newer.
- Source: TypeScript executed directly with `--experimental-strip-types`, Markdown, JSON, and small shell entry points.
- Platform observed during initialization: Linux 6.6.114.1 under WSL2, x86-64, with `/usr/bin/bash` in `SHELL`.
- Compilation and application build: none.

## Manifests and package management

- Package manager: none for the Git root.
- Authoritative project package manifest: none.
- Project lockfile: none.
- Project-root TypeScript config: none.
- `.pi/templates/astro/examples/**/package.json` files are reference examples, not Pi Core manifests.
- No environment example file was found. Ignored `.envrc` is machine-local and not maintained configuration.
- Dependency rule: do not add a package manager, manifest, lockfile, dependency, or upgrade without explicit authorization.

Global Pi settings register this repository's `.pi` directory, a local Ultra Fabric checkout, and installed Pi packages. Those machine-global registrations are runtime integrations, not dependencies managed by this repository.

## Frameworks and libraries

- Application framework: none.
- Test framework: the Node.js built-in `node:test` runner with `node:assert/strict`.
- Runtime libraries: Node.js built-ins such as `fs`, `path`, `child_process`, `os`, and `url`.
- Build tool, compiler, bundler, linter, and formatter: none configured for the project root.
- CI: GitHub Actions with `actions/checkout@v4` and `actions/setup-node@v4`.

## Fabric and policy configuration

The current uncommitted `.pi/fabric.json` configures:

- `fullCodeMode: true` with QuickJS and a 4 GiB executor memory limit.
- agents and mesh enabled.
- `maxConcurrent: 8`, `maxPerExecution: 1`, and `maxDepth: 1`.
- `budgetUsd: 0` and `maxTokensPerChild: 0`. No semantic meaning beyond the configured raw values is assumed here.
- Pi compaction with target context ratio 0.7.
- in-place Prewalk with `alwaysRearm: true`, model `makora/zai-org/GLM-5.2-NVFP4`, maximum thinking, and five phase revisions.

Project policy still requires explicit one-line user confirmation before ordinary initialization starts an advanced Fabric workflow.

`.pi/extensions/workspace-policy/` is the only maintained executable extension. `.pi/prompts/` holds optional shortcuts, `.pi/skills/` holds focused guidance, and `.pi/skills/manifest.json` is the discovery registry.

## Storage and integrations

### Hindsight

`.pi/hindsight.json` and `hindsight_config` reported:

- project-only memory with remote-derived ID `github-com-ryan-brosas-pi-core`.
- project bank `pi-coding`, with no global or user bank.
- domain-tagged scope with shared observations disabled.
- recall enabled at the `mid` budget with an 800-token cap.
- retain enabled and mental-model injection disabled.
- configured endpoint `http://localhost:8888` and 30-second timeout.

`hindsight_status` reported setup complete and an empty retain queue. A scoped recall returned no relevant facts. This did not prove endpoint health.

### Fabric session memory

`memory.sessions()` exposed one hot active transcript for this Git root. No `~/.pi/memory-md/` directory exists, so there was no legacy index to treat as a hint.

### MCP and graph

The doctor resolved first-class MCP configuration to `/home/ryanj/.config/mcp/mcp.json`. `mcp.servers()` exposed:

- HTTP: `cloudflare`, `cloudflare-bindings`, `cloudflare-builds`, `cloudflare-docs`, `cloudflare-observability`, `deepwiki`, and `exa`.
- stdio: `codegraphcontext`, `context7`, `open-design`, and `pyxel`.

Server metadata proves registration only. No remote or local MCP health call was made except CodeGraphContext queries.

CodeGraphContext's exact project index reported 1,050 files, 560 functions, 26 classes, and 72 modules. `find_code` located current doctor and workspace-policy symbols. Caller, importer, and module dependency queries returned false negatives for source-proven edges. `list_watched_paths` returned no watchers.

No application data store, authentication layer, or application observability system exists in this configuration repository.

## Repository layout

- `AGENTS.md`: concise local operating contract.
- `.pi/extensions/`: executable Pi extensions.
- `.pi/prompts/`: optional task prompts.
- `.pi/skills/`: focused guidance and references.
- `.pi/scripts/`: doctor and task-graph compatibility tooling.
- `.pi/tests/`: contract and behavior tests.
- `.pi/templates/`: universal policy, context scaffolds, and copied reference templates.
- `.pi/artifacts/`: retained historical or explicitly requested records.
- `docs/`: architecture and operating documentation.
- `.github/workflows/test.yml`: CI contract.
- `.cgcignore`: graph exclusions for runtime, history, and non-authoritative reference data.

Runtime-managed or ignored paths include `.pi/fabric/mesh/`, `.pi/state/`, `.pi/hindsight/`, `.pi/mcp-oauth/`, `.pi/mcp-traces/`, `.direnv/`, caches, locks, and session files. `sources/` is absent.

## Observed verification

Observed from `/home/ryanj/work/projects/pi-core` on `main` at HEAD `6d78d2e90a75` with a mixed worktree:

```text
node --version
observed: exit 0, v26.5.0
proves: the current local Node runtime exceeds the repository minimum

node --experimental-strip-types .pi/scripts/doctor.ts
observed: exit 0, 11 PASS and 1 WARN
proves: normal repository checks pass. Ultra Fabric package identity remains a warning

node --experimental-strip-types --test .pi/tests/*.test.ts
observed: exit 1, 362 tests, 361 pass, 1 fail
proves: most local contracts pass. The automatic Prewalk setting conflicts with the plain-language execution contract

mcp.codegraphcontext.get_repository_stats({ repo_path: "/home/ryanj/work/projects/pi-core" })
observed: success, 1,050 files, 560 functions, 26 classes, 72 modules
proves: an exact project index responds to bounded graph queries
```

CI is configured to run the normal doctor, all tests, and every `.pi/artifacts/*/tasks.json` validator. No remote CI run was inspected during initialization.

## Unverified commands

- `node --experimental-strip-types .pi/scripts/doctor.ts --strict`: not run during initial discovery. The current package warning is expected to make it nonzero.
- The CI artifact-validator loop: configured but not yet run during this initialization.
- Any build, package publication, deployment, or target-project smoke command: no such local command is established.

## Build, deployment, and live state

- Build artifact: none.
- Deployment command: none verified.
- Package publication command: none verified.
- Staging or production server: none verified.
- Feature flags: none verified.
- Hindsight endpoint and MCP server health: unconfirmed beyond configuration and bounded graph calls.
- Commit, push, publication, and deployment status: none performed by initialization.

## Constraints and unknowns

- A `/reload` or new session is required after prompt, policy, extension, package, or Fabric changes.
- The current full-suite failure must be resolved before claiming a green baseline.
- The strict doctor package warning must be resolved before claiming a fully configured bootstrap.
- Graph freshness is not automatic without a watcher, and current relationship queries under-report known edges.
- The mixed worktree requires path-scoped ownership for every future edit or commit.
