---
purpose: Verified runtime, dependencies, integrations, and commands
verified-at: f33c4b9
---

# Tech stack

## Runtime and languages

- Local runtime: Node.js 26.5.0.
- CI runtime: Node.js 24 in `.github/workflows/test.yml`.
- Minimum runtime: Node.js 24, enforced by `.pi/scripts/doctor.ts`.
- Pi CLI: 0.83.0. The doctor requires 0.82.1 or newer.
- Source language: TypeScript executed directly with `--experimental-strip-types`.
- Compilation: none.

## Manifests and package management

- Package manager: none.
- Project package manifest: none.
- Project lockfile: none.
- TypeScript config: none.
- Dependency rule: do not add a package manager, manifest, lockfile, dependency, or upgrade without explicit user authorization.

Global Pi settings register this repository's `.pi` directory as a local package. They also register a local Ultra Fabric checkout and `@luxusai/pi-hindsight@0.11.0`.

The doctor sees Hindsight but warns that `ultra-fabric>=0.31.1-ultra.1` is not installed under the expected package identity. The current session still exposes full Fabric code mode, so package reporting and runtime availability are distinct facts.

## Runtime configuration

`.pi/fabric.json` enables:

- full code mode.
- QuickJS execution with a 1 GiB memory cap.
- agents and mesh.
- one concurrent child and one child per execution.
- maximum child depth one.
- 100,000 tokens per child.
- Pi compaction at a 0.7 target context ratio.
- in-place Prewalk without a configured model.

`.pi/hindsight.json` enables:

- project bank `pi-coding`.
- domain-tagged scope.
- project recall and retain.
- explicit-only user retention.
- no user bank.
- no automatic mental-model injection.

## Extensions, prompts, and skills

- Maintained extension: `.pi/extensions/workspace-policy/`.
- Prompt templates: `audit`, `fix`, `gc`, `init`, and `research`.
- Skills: `.pi/skills/`, indexed by `.pi/skills/manifest.json`.
- Context templates: `.pi/templates/{agents-policy,user,project,roadmap,tech-stack}.md`.
- Context output: `AGENTS.md` and `.pi/{user,project,roadmap,tech-stack}.md`.

## MCP and code graph

Fabric reads MCP configuration from `/home/ryanj/.config/mcp/mcp.json`.

Relevant providers:

- CodeGraphContext for local structural lookup.
- Context7 for library documentation.
- Exa or Codex Search for web sources.
- DeepWiki for repository documentation.

The exact CodeGraphContext index for this checkout reported:

- 950 files.
- 558 functions.
- 26 classes.
- 72 modules.

Graph results are locators. Current source and executable tests remain authoritative. Caller analysis has returned a backend Cypher syntax error, and a watcher probe did not return cleanly.

## Repository layout

- `AGENTS.md`: concise local operating contract.
- `.pi/extensions/`: executable Pi extensions.
- `.pi/prompts/`: optional task prompts.
- `.pi/skills/`: focused guidance.
- `.pi/scripts/`: doctor and compatibility utilities.
- `.pi/tests/`: contract tests.
- `.pi/templates/`: global policy and context scaffolds.
- `.pi/artifacts/`: historical or explicitly requested records.
- `docs/`: architecture and operating documentation.
- `.github/workflows/test.yml`: CI contract.

Runtime-managed paths include `.pi/fabric/mesh/`, `.pi/state/`, `.pi/hindsight/`, caches, locks, MCP state, and session data.

## Observed verification

From `/home/ryanj/work/projects/pi-core` on `main` at `f33c4b9`:

```text
node --experimental-strip-types .pi/scripts/doctor.ts
observed: exit 0, 11 PASS and 1 WARN
proves: repository contracts pass in non-strict mode. Ultra Fabric package identity remains unresolved

node --experimental-strip-types --test .pi/tests/skill-system.test.ts
observed: 26 pass, 0 fail
proves: concise policy, natural-language init, context templates, skills, and graph guidance satisfy focused contracts

node --experimental-strip-types --test .pi/tests/autonomous-exemplar-reuse.test.ts
observed: 5 pass, 0 fail
proves: graph setup and source-qualified reuse contracts remain intact

node --experimental-strip-types --test .pi/tests/workspace-policy.test.ts
observed: 7 pass, 0 fail
proves: main-only workspace enforcement and global policy linkage work locally

node --experimental-strip-types --test .pi/tests/*.test.ts  # isolated staged tree
observed: 75 tests, 72 pass, 0 fail, 3 skipped
proves: the exact commit candidate passes while the normal doctor reports its package warning separately
```

CI runs the doctor, the full test suite, and every `.pi/artifacts/*/tasks.json` validator.

## Build, deployment, and live state

- Build command: none.
- Build artifact: none.
- Deployment command: none verified.
- Staging or production server: none verified.
- Feature flags: none verified.
- Publication status: no commit, push, package publication, or deployment occurred in this worktree.

## Known constraints

- A `/reload` or new session is required after prompt, policy, extension, package, or Fabric changes.
- The strict doctor package warning must be resolved before claiming a fully configured bootstrap.
- Graph freshness is not automatic when no watcher is active.
