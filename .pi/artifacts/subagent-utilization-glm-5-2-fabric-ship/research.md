# Research: GLM 5.2 subagent utilization with `/ship` and Fabric

**Date:** 2026-07-25

**Execution mode:** Complex research — deep-research workflow (two focused scouts, one dependent review, parent verification)

**Status:** Complete; no implementation performed

## Executive Summary

The repository cannot currently use GLM 5.2 for delegated `/ship` implementation. The only GLM-pinned agent, `build`, is disabled. The spawnable `general` implementation agent uses `openai-codex/gpt-5.4-mini` and has `extensions: false`, so it cannot invoke the `fabric_exec` tool required by `/ship`. This is a hard configuration mismatch, not merely a missing sentence in a handoff prompt. **Confidence: high.**

The safest target architecture is to keep the parent `/ship` session as the sole orchestrator and graph/lifecycle owner, while making `build` and `general` bounded, non-orchestrating implementation workers on GLM 5.2 with Fabric enabled. Route larger ready shards to `build` and surgical fixes to `general`; every child handoff must restate the relevant ship contract because `prompt_mode: replace` does not inherit it. Parent inspection and verification remain mandatory. **Confidence: high.**

The current `/ship` prompt also conflicts with the higher-priority project `AGENTS.md` by treating branch/worktree creation and per-task commits as automatic. Any implementation must first make those operations explicitly approval-gated. **Confidence: high.**

## Questions and Answers

| Question | Status | Answer | Confidence |
|---|---|---|---|
| Is GLM 5.2 available? | Answered | Yes. Fabric's model registry exposes `makora/zai-org/GLM-5.2-NVFP4`, and it is in global `enabledModels`. | High |
| Does current `/ship` use GLM for delegated implementation? | Answered | No. `general` uses GPT-5.4-mini; `build` is disabled. | High |
| Can current `general` follow `/ship`'s Fabric requirement? | Answered | No. `extensions: false` prevents loading the extension that supplies `fabric_exec`. | High |
| Do children automatically inherit `/ship` and project rules? | Answered | No. With `prompt_mode: replace`, the agent body is its system prompt; the task handoff must restate ship constraints. Project approval restrictions must also be included or inherited safely. | High |
| Should Fabric orchestrate children? | Answered | No. `/ship` explicitly assigns child lifecycle to the Pi `Agent` tool and Fabric only to code-mode implementation/batching. | High |
| Can `/ship` automatically create branches/worktrees and commit? | Answered | No. `AGENTS.md` requires separate explicit user approval for each gated Git/worktree/integration action. | High |

## Key Findings

### 1. Current model routing cannot achieve the stated goal

- `.pi/agents/build.md:3-10` pins `makora/zai-org/GLM-5.2-NVFP4`, loads extensions, but sets `enabled: false`; disabled agents are excluded from spawnable types.
- `.pi/agents/general.md:3-10` is enabled by default but pins `openai-codex/gpt-5.4-mini` and sets `extensions: false`.
- `.pi/subagents.json:7-8` enables model scoping and disables bundled default agents; project custom agents remain authoritative.
- `/home/ryan/.pi/agent/settings.json:23-25` includes GLM 5.2 in `enabledModels`.
- Parent verification through Fabric `tools.models()` returned both GLM 5.2 FP8 and NVFP4, including the exact build pin.

**Conclusion:** GLM availability is proven, but no spawnable `/ship` implementation route currently uses it. **Confidence: high.**

### 2. The delegated Fabric contract is presently impossible for `general`

- `.pi/prompts/ship.md:25-30,92-101` requires `Agent` for child orchestration and `fabric_exec` for implementation.
- `.pi/workflows/batch-implement.md:52-61` delegates implementation to `general` and tells that child to use `fabric_exec`.
- Installed `@tintinweb/pi-subagents` 0.14.3 documentation (`README.md:237-249`) states that `extensions:` controls which extensions load.
- Because `general` has `extensions: false`, prompt text cannot grant it `fabric_exec`.

**Conclusion:** Parent-direct `fabric_exec` works; delegated implementation does not until an extension-capable implementation agent is configured. **Confidence: high.**

### 3. The child does not automatically receive the `/ship` contract

- Installed pi-subagents documentation (`README.md:225-233`) makes frontmatter authoritative and defines `prompt_mode: replace` as replacing the inherited system prompt.
- `.pi/agents/build.md:25-31` itself notes that a child receives its agent file, not the build parent's instructions.
- Both implementation agents use `inherit_context: false`.

**Conclusion:** Every implementation handoff must be self-contained: task ID/attempt, exact files, transient neighborhood, non-goals, Fabric requirement, verification commands, stop conditions, approval boundaries, and output contract. **Confidence: high.**

### 4. `build` is not yet suitable as a `/ship` worker even if merely enabled

The current build body describes an orchestrator that may delegate, writes a legacy `.pi/artifacts/TODO.md`, references lower-case agent names, and contains workflow rules that diverge from the canonical task graph. Simply changing `enabled: false` to `true` would create a second orchestrator rather than a bounded ship worker.

**Conclusion:** Before enabling it, redefine `build` as a non-nesting implementation worker or add an explicit ship-worker mode that cannot own graph state, commits, integration, or child spawning. **Confidence: high.**

### 5. `/ship` must be reconciled with project approval policy

- `.pi/prompts/ship.md:44-45,78-80,169-188` treats workspace setup and per-task commits as routine requirements.
- `AGENTS.md` requires separate explicit approval for branch/worktree creation, commits, merges, integration, pushes, active-artifact mutation, and other gated operations.

**Conclusion:** The project contract wins. `/ship` should treat these as approval checkpoints, not automatic steps. **Confidence: high.**

## Recommended Target Design

1. **Keep orchestration in the parent `/ship` session.** The parent validates `tasks.json`, computes the frontier, chooses at most three disjoint tasks, owns lifecycle state, validates child output, and performs final verification.
2. **Use `build` for substantial bounded shards and `general` for surgical work.** Do not let either worker spawn nested agents during `/ship`.
3. **Pin both implementation workers to GLM 5.2.** Omit caller-supplied `model` and `thinking`; frontmatter and scoped settings remain authoritative.
4. **Enable Fabric for both workers.** Prefer the narrowest proven extension configuration; validate with a runtime smoke test rather than assuming an extension alias. `extensions: true` is known to load defaults but is broader than necessary.
5. **Create one canonical ship-worker handoff contract** reused by direct and batch paths. It should require:
   - exact task ID, attempt, files, and transient neighborhood;
   - `fabric_exec` for every code edit/fix;
   - no sibling work, nested agents, graph/progress mutation, commits, worktrees, merges, dependencies, or new files without explicit authorization;
   - at most two fix attempts;
   - exact verification commands and concise evidence output.
6. **Approval-gate Git and lifecycle mutations.** Parent-side `/ship` must stop before unapproved branch/worktree/commit/integration actions.
7. **Add contract tests before relying on the route.** Statically verify frontmatter model/extension/enablement, routing rules, and approval language; then run a read-only `Agent` smoke task proving each worker can see and invoke `fabric_exec`.

## Contradictions and Uncertainties

- The Phase 1 scouts initially described child Fabric availability as unproven. Cross-checking resolved this more strongly: it is unavailable to current `general` because extensions are explicitly disabled.
- The exact narrow extension identifier for loading only Fabric was not proven. Use a runtime discovery/smoke test before choosing an explicit extension allowlist; do not guess.
- Whether both `build` and `general` should use NVFP4 versus one using FP8 is a performance/quality policy decision not answered by repository evidence. NVFP4 is the currently pinned and scoped target.
- Both scouts reached their turn limits, but the dependent review and parent file/model-registry checks independently verified the material conclusions.

## Open Items

1. Decide whether to rewrite the existing `build` agent as a bounded worker or introduce a distinct implementation agent name; the user preference favors retaining `build`.
2. Decide the narrow Fabric extension allowlist after runtime tool-surface discovery.
3. Define which task-size/risk threshold routes to `build` versus `general`.
4. Reconcile `/ship`'s commit/worktree language with `AGENTS.md` before implementation.

## Sources

- `.pi/agents/build.md`
- `.pi/agents/general.md`
- `.pi/prompts/ship.md`
- `.pi/workflows/batch-implement.md`
- `.pi/subagents.json`
- `AGENTS.md`
- `/home/ryan/.pi/agent/settings.json`
- `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/README.md` (installed version 0.14.3)
- `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/src/agent-types.ts`
- `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/src/custom-agents.ts`
- `/home/ryan/.pi/agent/npm/node_modules/pi-fabric/dist/execution-service.js`
- Fabric runtime `tools.models()` result, 2026-07-25