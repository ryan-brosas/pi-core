# Pi Core

An opinionated, project-local operating layer for the [Pi coding agent](https://pi.dev): focused best-practice skills, full Ultra Fabric code mode, behavior-backed reuse, and evidence-backed completion.

Pi Core is configuration, not an application package. It intentionally has no project package manager or lockfile.

## Use it

Prompt Pi with the outcome you want.

```text
"Fix this bug."
"Build the page in /path/to/project."
"Audit the auth boundary."
"Adapt this upstream pattern to our codebase."
```

The agent chooses the execution shape. Ordinary work follows:

```text
plain-language request → inspect → change → prove → report
```

There is no required create/plan/ship/verify command chain, task classification, artifact slug, or fixed multi-agent pipeline.

## Fabric-native execution

Ultra Fabric runs in **full code mode**. The model writes one type-checked program through `fabric_exec` and uses `pi.*` inside it for repository reads, searches, edits, commands, branching, loops, and parallel calls. Intermediate values stay in the sandbox; only the compact result returns to the conversation.

Change `fullCodeMode` in `.pi/fabric.json` as the task's final mutation, then run `/reload` or start a new session before expecting the new tool surface; the live registry switches at that boundary, not mid-task. The installed Ultra runtime also supplies Ultra Consult, one-shot and persistent Agent roles, durable workflows and mesh state, Schema, outcomes, first-class MCP, compaction, and Prewalk.

The agent may choose:

- zero children for coherent direct work;
- one child for a useful independent context or specialist judgment;
- parallel children only for genuinely independent scopes.

Advanced patterns are explicit options rather than defaults:

- `/skill:fabric-guide` — recommend one advanced mechanism;
- `/skill:fabric-workflow` — finite fan-out or pipelines with verification;
- `/skill:fabric-rlm` — recursive decomposition for oversized context;
- `/skill:fabric-schema` — evidence-gated mutation;
- `/skill:fabric-spec` — strict implementation against a supplied design spec;
- `/skill:fabric-advisor`, `/skill:fabric-supervisor`, `/skill:fabric-council`, `/skill:fabric-fusion`, `/skill:fabric-ambient`, and `/skill:fabric-swarm` — user-invoked specialist topologies.

## Skills capture proven behavior

Best practices live in focused, progressively disclosed skills. Inspect useful external behavior, rewrite the invariant independently, and prove it in the target.

Independently rewritten ideas and patterns require no license or provenance ceremony. Exact-source, applicable-terms, notice, and integrity checks apply only when upstream files or substantial expressive material are copied or distributed.

Workflow promotion is empirical:

1. **First run:** brute force the real outcome and measure it.
2. **Second run:** compare, prune, and temper the repeated decisions.
3. **Third run:** pressure-test the stable recipe and promote it only if it prevents recurring mistakes or saves meaningful time.

One good output is not automatically a skill.

## Task-specific commands

Plain prompts are the default. These optional commands are shortcuts for narrow task types, not lifecycle phases:

| Command | Purpose |
|---|---|
| `/init` | Build or refresh detailed project context from natural-language guidance |
| `/fix` | Reproduce and repair a bounded defect |
| `/research` | Run source-backed research |
| `/audit` | Review a cross-cutting code pattern |
| `/gc` | Inventory repository drift and propose cleanup |

`/init` keeps durable rules in `AGENTS.md` and writes detailed context to `.pi/user.md`, `.pi/project.md`, `.pi/roadmap.md`, and `.pi/tech-stack.md`.

## Requirements

- Node.js 24 or newer
- Pi 0.82.1 or a compatible newer release
- Git

Expected Pi packages:

```bash
pi install npm:ultra-fabric@0.31.1-ultra.1
pi install npm:@luxusai/pi-hindsight@0.11.0
```

Ultra Fabric is pinned because this release is experimental. If `pi list` still shows `pi-fabric`, remove it before installing Ultra Fabric; loading both package identities is unsupported. Restart Pi after package changes.

Ultra Fabric provides the first-class MCP runtime; do not install a second MCP adapter. Point global `mcp.configPath` at a private mcporter-compatible registry. `.mcp.example.json` documents the server shape but is not an active or secret-bearing config.

Pi Hindsight also requires the configured server at `http://localhost:8888`. `/init` verifies its project scope, recall/retain state, Fabric session memory, first-class MCP servers, and graph coverage.

## Setup

```bash
git clone https://github.com/ryan-brosas/pi-core.git
cd pi-core
node --experimental-strip-types .pi/scripts/doctor.ts --strict
node --experimental-strip-types --test .pi/tests/*.test.ts
pi
```

Review project-local extensions and skills before trusting the repository. Restart Pi after changing installed packages; after changing local Pi resources or Fabric settings, run `/reload` or start a new session. Use `/fabric status` and `/fabric health` to inspect the active policy and runtime counters.

## Global development

Pi Core is installed as a global local Pi package, so normal work starts in the repository that owns the code:

```bash
cd <project>
pi
```

The shared extensions, prompts, skills, universal policy, and global Fabric defaults remain available without copying Pi Core into the target. See [Global Development with Pi Core](docs/global-development.md) for the goal, ownership boundaries, current architecture, and development plan.

## Repository layout

```text
AGENTS.md                  Always-loaded operating contract
.pi/extensions/            Executable Pi extensions
.pi/prompts/               Optional task-specific prompt templates
.pi/skills/                Progressively disclosed best practices
.pi/scripts/               Repository and compatibility utilities
.pi/tests/                 Contract tests for the configuration
.pi/templates/             Project scaffolds and universal policy
.pi/{user,project,roadmap,tech-stack}.md  Detailed project context
.pi/artifacts/             Historical or explicitly requested durable records
```

Runtime Fabric mesh, Hindsight banks, MCP traces, caches, and session state must not be committed.

## Legacy task graphs

`.pi/scripts/task-graph.ts` remains available to read and validate existing version-1/version-2 artifact graphs. It is compatibility tooling, not the ambient scheduler and not required for ordinary work.

## Verification

```bash
node --experimental-strip-types .pi/scripts/doctor.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
```

Validate a historical graph only when working on that graph:

```bash
node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/<slug>/tasks.json
```

## Security and publication

Project extensions and Pi packages run with local-user authority. Review trust and package sources. Never commit credentials, OAuth state, memory banks, or Fabric runtime logs. Git publication, deployment, and irreversible external effects still require explicit user intent.

## License

No license has been selected yet. Add one before presenting this repository as a reusable public template.
