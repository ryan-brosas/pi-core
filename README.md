# Pi Core

An opinionated, project-local operating layer for the [Pi coding agent](https://pi.dev): focused best-practice skills, full Pi Fabric code mode, behavior-backed reuse, and evidence-backed completion.

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

Pi Fabric runs in **full code mode**. The model writes one type-checked program through `fabric_exec` and uses `pi.*` inside it for repository reads, searches, edits, commands, branching, loops, and parallel calls. Intermediate values stay in the sandbox; only the compact result returns to the conversation.

Change `fullCodeMode` in `.pi/fabric.json` as the task's final mutation, then run `/reload` or start a new session before expecting the new tool surface; the live registry switches at that boundary, not mid-task.

The agent may choose:

- zero children for coherent direct work;
- one child for a useful independent context or specialist judgment;
- parallel children only for genuinely independent scopes.

Advanced patterns are explicit options rather than defaults:

- `/skill:fabric-guide` — recommend one advanced mechanism;
- `/skill:fabric-workflow` — finite fan-out or pipelines with verification;
- `/skill:fabric-rlm` — recursive decomposition for oversized context;
- `/skill:fabric-schema` — evidence-gated mutation;
- `/skill:fabric-advisor`, `/skill:fabric-supervisor`, `/skill:fabric-council`, and `/skill:fabric-swarm` — user-invoked specialist topologies.

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
| `/init` | Detect and initialize project-specific context |
| `/fix` | Reproduce and repair a bounded defect |
| `/research` | Run source-backed research |
| `/audit` | Review a cross-cutting code pattern |
| `/gc` | Inventory repository drift and propose cleanup |

## Requirements

- Node.js 24 or newer
- Pi 0.82.1 or a compatible newer release
- Git

Expected Pi packages:

```bash
pi install npm:pi-fabric@0.28.2
pi install npm:pi-mcp-adapter@2.15.0
pi install npm:@luxusai/pi-hindsight@0.11.0
```

Pi Hindsight also requires the configured server at `http://localhost:8888`.

## Setup

```bash
git clone https://github.com/ryan-brosas/pi-core.git
cd pi-core
node --experimental-strip-types .pi/scripts/doctor.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
pi
```

Review project-local extensions and skills before trusting the repository. After changing Pi resources, run `/reload` or start a new session.

## Repository layout

```text
AGENTS.md                  Always-loaded operating contract
.pi/extensions/            Executable Pi extensions
.pi/prompts/               Optional task-specific prompt templates
.pi/skills/                Progressively disclosed best practices
.pi/scripts/               Repository, corpus, and compatibility utilities
.pi/tests/                 Contract tests for the configuration
.pi/templates/             Project scaffolds and universal policy
.pi/corpus/                Reviewed implementation exemplars
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

## Curated corpus and discovery

- Current source and tests are authoritative for target behavior.
- `.pi/corpus/` holds reviewed exemplars worth adapting.
- A healthy code graph can locate current relationships but cannot establish pattern quality or correctness.

```bash
node --experimental-strip-types .pi/scripts/corpus.ts search .pi/corpus <intent>
```

## Security and publication

Project extensions and Pi packages run with local-user authority. Review trust and package sources. Never commit credentials, OAuth state, memory banks, or Fabric runtime logs. Git publication, deployment, and irreversible external effects still require explicit user intent.

## License

No license has been selected yet. Add one before presenting this repository as a reusable public template.
