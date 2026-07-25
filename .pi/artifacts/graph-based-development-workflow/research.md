# Research: Graph-Based Development Instead of a Linear Lifecycle

Date: 2026-07-25
Status: complete
Execution mode: deep research — three independent source angles, local workflow inspection, dependent cross-check, and parent verification

## Questions and confidence

1. **Do code graphs help repository-scale agents navigate without reading files linearly? — Answered, high confidence.** RepoGraph and CodexGraph directly evaluate graph-backed repository navigation/retrieval.
2. **Do papers validate a complete graph-based software-development lifecycle? — Answered, medium confidence: no.** Papers validate components—code graphs, optimizable agent graphs, feedback loops, and trajectory verifiers—not this complete lifecycle.
3. **Is the current workflow already graph-capable? — Answered, high confidence.** It stores dependency edges, but execution collapses them into static textual waves and a single active-feature pointer.
4. **What is the smallest useful experiment? — Answered, high confidence as a local design recommendation.** Make `tasks.json` the authoritative work DAG, compute its ready frontier dynamically, link task state to evidence, and derive code neighborhoods only on demand.

## Executive summary

The useful lesson is **not “replace every phase with a graph database.”** The papers support three narrower graph layers:

1. **Work graph:** dependencies, conflicts, attempts, and runnable tasks.
2. **Code graph:** symbols/files/imports/tests needed for the selected task.
3. **Evidence graph:** tests, reviews, commits, and research that support or invalidate task state.

The local workflow already has the beginnings of the first layer, but it is split between `plan.md` waves and `tasks.json`; it lacks graph validation, a recomputed ready frontier, evidence-linked state, and selective invalidation. The lifecycle is still presented as `/create → /plan → /ship → /verify`, while `/research` sits “sideways.”

**Recommendation:** do not add an extension, graph database, or fifth canonical artifact. Pilot a dynamic scheduler over the existing `tasks.json`, use `progress.md` for evidence, and compute code/test neighborhoods transiently. Keep the slash commands during the pilot; only consider turning them into graph views/operations if measured outcomes improve.

## Most relevant papers

| Paper | What it actually supports | Local implication | Confidence |
|---|---|---|---|
| [RepoGraph (arXiv:2410.14684)](https://arxiv.org/abs/2410.14684) | Repository-level code graph as a plug-in for navigation; reports improvements across SWE-bench methods and evaluates CrossCodeEval. | Before editing, retrieve the selected task's structural neighborhood instead of reading files sequentially. It does **not** validate task scheduling. | High |
| [CodexGraph (arXiv:2408.03910)](https://arxiv.org/abs/2408.03910) | Lets agents query a code-graph database for structure-aware navigation; evaluated on CrossCodeEval, SWE-bench, and EvoCodeBench. | Graph queries can be a better context-selection interface, but a persistent graph database is unnecessary until an on-demand prototype proves value. | High |
| [Language Agents as Optimizable Graphs / GPTSwarm (arXiv:2402.16823)](https://arxiv.org/abs/2402.16823) | Models agent systems as graphs and optimizes node prompts and edge connectivity. | Treat orchestration topology as something testable rather than fixed. Its graph is an **agent graph**, not a software dependency graph. | High |
| [AFlow: Automating Agentic Workflow Generation (arXiv:2410.10762)](https://arxiv.org/abs/2410.10762) | Searches code-represented agent workflows using MCTS, execution feedback, and accumulated tree experience; later published at ICLR 2025. | Evaluate alternative paths and keep execution feedback, but do not add automatic workflow search before a deterministic task graph works. | High |
| [DepsRAG (arXiv:2405.20455)](https://arxiv.org/abs/2405.20455) | Combines a direct/transitive dependency knowledge graph with external evidence and a critic; reports a threefold accuracy increase on three multi-step dependency tasks. | Pair dependency structure with evidence and critique. The evidence is for package-dependency reasoning, not general project scheduling. | High |
| [Self-Refine (arXiv:2303.17651)](https://arxiv.org/abs/2303.17651) | Iterative self-feedback/refinement reports about 20 absolute points average improvement across seven tasks. | Keep bounded node-local refine/test loops rather than restarting the whole lifecycle. Most evaluated tasks are not repository SWE. | High |
| [SWE-Gym (arXiv:2412.21139)](https://arxiv.org/abs/2412.21139) | Provides 2,438 executable Python SWE tasks and trains verifiers on agent trajectories. | Store execution paths and verification evidence so route quality can be evaluated, not merely narrated. It does not validate a graph lifecycle. | High |

### Watchlist, not design anchors

- [Graph of Thoughts (arXiv:2308.09687)](https://arxiv.org/abs/2308.09687) supports arbitrary graph-shaped reasoning, but its core experiments are not repository-level software development.
- [Runtime-Structured Task Decomposition (arXiv:2605.15425)](https://arxiv.org/abs/2605.15425) is directionally relevant because it reports local reruns and warns that static decomposition can cost more than monolithic execution, but it is a very recent preprint with only two workloads and ten runs.
- [Meta-Agent (arXiv:2605.25233)](https://arxiv.org/abs/2605.25233) describes verified task DAGs and targeted regeneration, but is too recent and lightly evaluated to anchor the design.

## Local diagnosis

1. **The lifecycle remains linear at the top level.** `.pi/skills/development-lifecycle/SKILL.md:35-44` depicts `/create → /plan → /ship → /verify`; research is explicitly “sideways.”
2. **There are two work-graph representations.** `.pi/prompts/plan.md:245-320` creates textual `needs` edges and wave snapshots, while `tasks.json` separately stores `depends_on` and conflicts. `.pi/prompts/ship.md:131-148` prefers static plan waves when present. They can drift.
3. **Scheduling is snapshot-based, not frontier-based.** `/ship` parses waves or falls back to a sequential loop. Local searches found no required cycle detection, dangling-target checks, topological validation, or ready-set recomputation after each state transition.
4. **Failure does not propagate through the graph.** `.pi/prompts/ship.md:154-165,255-260` retries a failed task and then stops; descendants are not marked blocked/stale, and upstream causes are not selectively reopened.
5. **Evidence is detached from task state.** Verification commands live on tasks, but observed results are appended to `progress.md`; passed nodes do not point to the exact evidence, commit, or dependency generation that justified the pass.
6. **The single active pointer hides other frontiers.** `.pi/artifacts/.active` points to `lets-adopt-whats-viable-to-our-needs`, whose tasks are all passed, while `.pi/artifacts/conversation-aware-create-handoff/tasks.json` has a dependency-free pending task. Work exists, but the active pointer does not expose it.
7. **Fabric mesh should not become canonical state.** `.pi/fabric.json:27-31` points mesh state at a temporary smoke-test path, and `/ship` explicitly excludes Fabric mesh orchestration. Existing mesh hypotheses also contain stale evidence.

## Recommended model

Keep the current four artifacts. Use three connected views rather than one giant persisted graph:

### 1. Persisted work DAG — `tasks.json`

- **Node:** existing task fields plus `attempt` and `evidence_refs`.
- **Dependency edge:** `dependency → dependent`, derived from `depends_on`.
- **Conflict relation:** `conflicts_with` plus overlapping file ownership; never treat this as a dependency.
- **Ready frontier:** pending nodes whose dependencies passed and which conflict with no running node.
- **Required validation:** unique IDs, existing edge targets, no self-edges, no dependency cycles, symmetric/valid conflicts, and coherent `status`/`passes`.

`plan.md` becomes the human-readable explanation of the same task IDs. Textual waves are derived snapshots, never a second source of truth.

### 2. Transient code/test neighborhood

For the selected ready node, derive only the relevant imports, references, callers, tests, public contracts, and recent changes using current search/static-analysis tools. Do not persist a repository graph until a pilot shows better context selection than plain search.

### 3. Evidence links — `tasks.json` → `progress.md`

Each passed task records references to its test output, review, commit, and relevant research. When an upstream artifact changes, invalidate dependent evidence and recompute descendants.

Failure semantics should be conservative:

- failed node → `failed`; descendants → `blocked` or `stale`;
- do **not** automatically reopen every ancestor;
- reopen an ancestor only when failure attribution identifies it or its produced artifact changed.

## Minimal pilot

Run three comparable changes with 3–6 tasks and at least one fork/join:

1. Add deterministic task-graph validation and ready-frontier calculation to `/ship`.
2. Recompute the frontier after every pass, failure, or invalidation instead of executing fixed waves.
3. Add a read-only cross-artifact frontier report over `.pi/artifacts/*/tasks.json`; require explicit slug selection and never silently change `.active`.
4. Store short evidence entries in `progress.md` and their references on task nodes.
5. Derive a code/test neighborhood only for the selected task.
6. Preserve `/create`, `/plan`, `/ship`, and `/verify` semantics during the experiment.

Only after the pilot succeeds should commands become graph operations: `/create` adds goals/constraints, `/research` adds evidence, `/plan` expands/refines nodes, `/ship` executes the ready frontier, and `/verify` closes or invalidates nodes.

## Falsification metrics

Reject or narrow the design if it fails any of these:

- Detect 100% of seeded cycles, dangling IDs, self-edges, and inconsistent pass states.
- Start zero tasks before dependencies pass and allow zero concurrent file/conflict overlaps.
- Surface every manually audited runnable node across artifacts.
- Keep zero passed nodes without current evidence references and zero plan/task ID divergence.
- Mark all affected descendants stale after an upstream change without reopening unrelated ancestors.
- Keep full-test results and review-defect rate no worse than matched baseline changes.
- Improve median wall time, model/tool usage, or rerun count by at least 20% on one measure without more than 10% regression on the others.
- Abandon persistent code-graph work if transient neighborhoods do not improve relevant-file recall per context token.
- Abandon broader graph orchestration if manual state repairs or scheduler overrides increase.

## Contradictions and uncertainty

- Code-graph papers support repository navigation, not task-DAG scheduling.
- GPTSwarm and AFlow optimize agent workflows, not software requirement/dependency graphs.
- Feedback papers support bounded iteration, not blanket graph invalidation.
- No reviewed paper validates the full proposed lifecycle end to end.
- Graph extraction and state maintenance can create a new form of darkness when edges become stale or unverifiable.
- Static decomposition may add overhead; the value comes from validated edges, dynamic readiness, evidence, and selective recovery—not from drawing a DAG.

## Recommendation

Adopt **graph-aware execution**, not “a graph platform.” The first implementation target should be a validated, evidence-linked ready-frontier scheduler over the existing `tasks.json`. Pair it with transient code neighborhoods and measure it against the current workflow. Do not add an extension, database, persistent code graph, automatic MCTS workflow search, or Fabric integration in the first iteration.

## Sources

- https://arxiv.org/abs/2410.14684
- https://arxiv.org/abs/2408.03910
- https://arxiv.org/abs/2402.16823
- https://arxiv.org/abs/2410.10762
- https://arxiv.org/abs/2405.20455
- https://arxiv.org/abs/2303.17651
- https://arxiv.org/abs/2412.21139
- https://arxiv.org/abs/2308.09687
- https://arxiv.org/abs/2605.15425
- https://arxiv.org/abs/2605.25233