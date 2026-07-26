# Pi Core

An opinionated, project-local operating layer for the [Pi coding agent](https://pi.dev): safety rules, adaptive delivery prompts, on-demand skills, Fabric orchestration, and evidence-backed verification.

Pi Core is a configuration repository, not an application package. It intentionally has no project package manager or lockfile.

## Delivery modes

Use the smallest process that fits the risk.

| Mode | Use when | Workflow | Durable artifacts |
|---|---|---|---|
| Quick | Known, low-risk change affecting roughly 1–3 files | Describe the change or use `/fix` | None required |
| Standard | One bounded feature or boundary with moderate uncertainty | `/create` → `/ship` | Lite `spec.md`, `tasks.json`, concise evidence |
| Complex | Cross-system work, migrations, security/privacy, or multiple dependent tasks | `/create` → `/plan` → `/ship` | Full spec, plan, task graph, progress evidence |

The engineering loop is the same at every level:

```text
black-box contract
  → proportional relationship/impact map (optional code graph when useful)
  → verify exact source
  → preserve the boundary or add a justified seam only for concrete variance
  → white-box implementation
  → gray-box integration evidence only for a named public-boundary gap
  → black-box acceptance
  → review the complete worktree diff
```

## Requirements

- Node.js 24 or newer
- Pi 0.82.1 or a compatible newer release
- Git

The current configuration expects these Pi packages:

```bash
pi install npm:pi-fabric@0.28.1
pi install npm:pi-mcp-adapter@2.15.0
pi install npm:@luxusai/pi-hindsight@0.11.0
```

Pi Hindsight also requires a configured Hindsight server. The checked-in `.pi/hindsight.json` expects `http://localhost:8888`.

Automated research enforcement is disabled in `.pi/research-enforcement.json` until its source providers are installed and verified. `/research` still applies the source and citation workflow explicitly.

Project package pinning is intentionally not active yet; add `.pi/settings.json` only after reviewing and approving the packages that a trusted clone may install automatically.

## Setup

```bash
git clone https://github.com/ryan-brosas/pi-core.git
cd pi-core
node --experimental-strip-types .pi/scripts/doctor.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
pi
```

The default doctor fails on broken repository contracts and reports bootstrap-dependent conditions as warnings. An absent optional MCP config and intentionally deferred `.pi/settings.json` are expected until enabled. A missing required Pi package degrades that capability. Tracked Fabric mesh or session state is a real repository anomaly that must be untracked with separate path-scoped Git approval; ignore rules alone cannot remove already tracked files. Ambient artifact-selection pointers are retired and Doctor treats their reappearance as a repository-contract failure. Use `--strict` when every warning is expected to be resolved in the current environment.

On first launch, review the project-local extensions and skills before trusting the repository. After changing Pi resources, run `/reload` or start a new session.

## Commands

| Command | Purpose |
|---|---|
| `/init` | Detect and initialize project-specific context |
| `/create` | Create a lite or full behavior contract and task graph |
| `/plan` | Add implementation detail for complex work only |
| `/ship` | Execute the current validated task frontier |
| `/verify` | Check requirements, tests, and coherence |
| `/fix` | Reproduce and repair a bounded defect |
| `/research` | Explicit source-backed research |
| `/audit` | Review a cross-cutting code pattern |
| `/gc` | Inventory repository drift and propose cleanup |

## Repository layout

```text
AGENTS.md                  Always-loaded operating contract
.pi/extensions/            Executable Pi extensions
.pi/prompts/               Slash-command prompt templates
.pi/skills/                Progressively disclosed skills
.pi/scripts/               Pure lifecycle and corpus utilities
.pi/tests/                 Contract tests for the configuration
.pi/templates/             Project and lifecycle scaffolds
.pi/artifacts/             Feature contracts and evidence
.pi/corpus/                Curated implementation exemplars
```

Runtime state such as Fabric mesh data, Hindsight banks, MCP traces, session summaries, and verification cache must not be committed. Graph-backed commands receive their artifact slug explicitly.

## Verification

```bash
node --experimental-strip-types .pi/scripts/doctor.ts
node --experimental-strip-types --test .pi/tests/*.test.ts

for graph in .pi/artifacts/*/tasks.json; do
  node --experimental-strip-types .pi/scripts/task-graph.ts validate "$graph"
done
```

CI runs the same checks on pushes and pull requests.

## Curated corpus and target-code discovery

`.pi/corpus/` and CodeGraphContext are complementary, not duplicate stores:

- **The corpus** contains reviewed, provenance-pinned implementation exemplars worth imitating. Search it by implementation intent and read only the bounded selected entries:

  ```bash
  node --experimental-strip-types .pi/scripts/corpus.ts search .pi/corpus <intent>
  ```

- **Current source and tests** remain authoritative for the target repository.
- **A code graph** maps current relationships such as entry points, callers, dependencies, seams, and affected tests. It does not establish that a pattern is good or copyable.

The corpus remains useful even when MCP is available because graph discovery answers “what is connected now?” while the corpus answers “what reviewed implementation shape is worth reusing?” Remove the corpus only if Pi Core deliberately drops curated exemplars as a supported capability—not merely because a graph server exists.

## Optional CodeGraphContext

CodeGraphContext is a gray-box discovery aid for large target repositories. It does not replace requirements, exact source reads, the curated corpus, or tests.

1. Copy `.mcp.example.json` to `.mcp.json` and review it.
2. Install CodeGraphContext separately.
3. Index or watch the exact target repository.
4. Before trusting graph output, list the indexed repository scope and query a known target symbol or path. If it does not resolve, treat the graph as unhealthy or stale and fall back to `read`, `grep`, and `find`.
5. Use healthy graph results to find entry points, call chains, seams, and affected tests.
6. Verify every result against the actual source before editing.

Keep CodeGraphContext databases and generated state outside Git. For small repositories, normal `read`, `grep`, and `find` calls are usually cheaper and clearer.

## Security and publication

- Project extensions and Pi packages execute with the local user’s permissions.
- Review project trust and package sources before activation.
- Never commit credentials, MCP OAuth state, memory banks, or Fabric runtime logs.
- Commit, push, PR, deployment, destructive operations, and history rewrites require explicit approval under `AGENTS.md`.

## License

No license has been selected yet. Add one before presenting this repository as a reusable public template.
