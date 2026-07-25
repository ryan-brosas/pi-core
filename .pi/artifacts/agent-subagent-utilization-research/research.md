# Research: Role-specific Plan, writer, and build utilization

**Date:** 2026-07-25

## Research question

Can Pi Core intentionally route `/ship` implementation to `build`, and should `/plan` invoke the detailed original `Plan` specialist and then hand its result to `general` to write the canonical plan?

## Execution mode

**Complex deep-research workflow.** One bounded local `Explore` and two distinct `scout` angles examined current project contracts, installed `@tintinweb/pi-subagents` runtime mechanics, official Pi documentation/examples, and orchestration trade-offs. A dependent foreground `review` reopened the cited sources, corrected overclaims, and produced the verified fact set below. No implementation or lifecycle state was changed.

## Questions and answers

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| Can `/ship` route substantial implementation to `build`? | Answered | High | Yes; it already does. Surgical one-to-three-file work routes to `general`, while larger bounded work with resolved architecture routes to `build`. |
| Can `/plan` call `Plan` and then another child sequentially? | Answered | High | Yes. The parent can make sequential foreground `Agent` calls and include the first result in a fresh second envelope. Installed pi-subagents has no dedicated `{previous}` chain parameter. |
| Should the second child be the current `general` agent? | Answered | High | No by default. `general` is a surgical implementation/review-fix worker and its current role conflicts with canonical planning writes. |
| Can the original detailed Plan prompt be retained? | Answered | High | Yes. Keep it only in `.pi/agents/Plan.md`; `/plan` references `subagent_type: "Plan"` and sends a task envelope rather than duplicating the persona. |
| Who should own canonical `plan.md` and `tasks.json`? | Answered | High | The parent. Plan advice and child drafts remain untrusted until the parent reconciles evidence, writes or accepts canonical content, and validates the graph. |
| Is a separate plan writer technically possible? | Answered | High | Yes, but use a dedicated, narrowly scoped `plan-writer` only as an optional mechanical drafter—not `general`, and never as owner of `tasks.json` or lifecycle state. |

## Verified findings

1. **Current `/ship` routing is already the desired role split.** `.pi/prompts/ship.md` routes surgical tasks to `general`, substantial resolved tasks to `build`, and unresolved architecture back to the parent. Children receive one resolved shard and cannot select siblings or mutate lifecycle state.
2. **Current `/plan` is Plan-advisory → parent-writer.** The foreground `Plan` result is chat-only and untrusted. The parent alone writes or validates `plan.md` and `tasks.json`.
3. **`general` is the wrong writer role.** `.pi/agents/general.md` is explicitly a one-to-three-file implementation worker, requires `fabric_exec`, and is not a canonical planning renderer. Reusing it would blur routing and broaden privilege.
4. **Sequential orchestration is parent-owned, not a runtime handoff.** `@tintinweb/pi-subagents` 0.14.3 returns a foreground child result inline. The parent may construct a second self-contained call, but the installed `Agent` surface has no chain or `{previous}` parameter.
5. **Official Pi demonstrates that chains are technically feasible through another extension.** Its bundled subagent example supports sequential `{previous}` chaining, but this project explicitly standardizes on pi-subagents and prohibits mixing orchestration systems. That example is precedent, not the current runtime contract.
6. **Fresh children require explicit envelopes.** `inherit_context: false` prevents parent conversation inheritance; it does not make the task self-contained automatically. A second child needs the verified Plan advisory, spec/graph paths, parent decisions, non-goals, schema, privacy limits, and stop conditions.
7. **Tool allowlists reduce exposure but are not path sandboxes.** A writing child still runs with process permissions. Canonical acceptance therefore requires parent diff inspection and validation.
8. **The original Plan voice should have one source of truth.** Retain Planning Guidelines, Architecture as Ritual, Clarity Through Constraint, Simplicity First, quotations, and Ground → Reset only in `.pi/agents/Plan.md`. Do not copy the full persona into `/plan`, `general`, or a writer prompt.
9. **Version correction:** installed Pi documentation is currently 0.82.0; the earlier artifact citation to installed Pi 0.79.4 is stale. The prompt-template conclusion remains unchanged: templates expand into parent prompts and do not execute Agent calls automatically.

## Primary recommendation

Keep the architecture as **specialist advice → parent canonical synthesis → bounded implementation worker**.

### Recommended `/plan` flow

1. Parent resolves the active artifact, approvals, spec, current graph, and existing plan.
2. Parent gathers only missing evidence through `Explore` or `scout`.
3. For ambiguity, architecture trade-offs, or cross-subsystem sequencing, parent invokes one foreground `Plan` child with a privacy-minimized, self-contained envelope.
4. Parent verifies Plan citations and resolves open decisions.
5. Parent updates `tasks.json` first when task decomposition changes, validates it, then writes or updates `plan.md` under the existing approval gates.
6. Parent checks spec/graph/plan task-ID consistency and hands the validated artifact to `/ship` without routine `.active` mutation.

### Recommended `/ship` flow

1. Parent validates the canonical graph and recomputes the ready, conflict-free frontier.
2. Parent routes each resolved shard to `general` for surgical work or `build` for substantial bounded implementation.
3. Worker changes code only; parent inspects actual files, reruns verification/review, and alone records graph/progress transitions.
4. Parent revalidates and recomputes the frontier after every transition.

## Optional alternative: dedicated `plan-writer`

If reducing parent formatting work is an explicit product goal, create a distinct opt-in `plan-writer` rather than changing `general`:

- It receives only a verified Plan advisory plus resolved parent decisions and the exact canonical plan schema.
- It performs no architecture judgment, research, nested delegation, Git, dependency, implementation, `.active`, `progress.md`, or lifecycle work.
- Prefer chat-only fully formatted output, which the parent writes. If direct file writing is required, limit it to a candidate `plan.md`; never permit `tasks.json` mutation.
- The parent verifies the full candidate, reconciles it against `spec.md` and `tasks.json`, validates task IDs/dependencies, and only then accepts it as canonical.

This alternative is safer than reusing `general`, but still adds latency, context-loss risk, and another untrusted hop. Use it only for unusually large or mechanical plan rendering.

## Main risks

- **High:** graph/prose divergence if a writer changes `plan.md` without parent-first `tasks.json` reconciliation.
- **High:** ownership ambiguity if a child-generated file is treated as canonical before parent acceptance.
- **High:** excessive writer privilege; tool configuration is not filesystem containment.
- **Medium:** context loss between fresh Plan and writer children.
- **Medium:** extra latency and verification cost without better planning judgment.

## Open user decisions

1. Keep Plan conditional, or invoke it for every `/plan` run?
2. Is parent canonical writing acceptable, or is child-produced formatting a required feature?
3. If formatting is delegated, should `plan-writer` return chat-only content or write a candidate `plan.md`?
4. What explicit size threshold justifies the extra writer pass?

## Sources

1. `.pi/prompts/ship.md:15-46,98-130`
2. `.pi/prompts/plan.md:25-78,159-166,319-348,482-494`
3. `.pi/agents/Plan.md:1-105,285-385`
4. `.pi/agents/general.md:1-48`
5. `.pi/agents/build.md:1-55`
6. `.pi/agent-tool-description.md:1-29`
7. `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/README.md` and `src/index.ts:835-846,1320-1429` (version 0.14.3)
8. `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/prompt-templates.md:3-17,31-33`
9. `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/examples/extensions/subagent/README.md:79-97`
10. `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/extensions.md` (installed Pi 0.82.0)

---

## Research update: Outcome-sized execution and Fabric Prewalk

**Date:** 2026-07-25
**Execution mode:** Complex deep-research workflow — two independent scouts, one dependent review, and parent source verification
**Status:** Complete; research only, no workflow implementation or deletion performed

### Question

Should serial `/ship` execution stop spawning a fresh `general` or `build` child for every microtask, use outcome-sized artifacts with internal phases, and hand a grounded Main trajectory to a Fabric Prewalk executor instead?

### Executive summary

**Yes, as the default serial path and as a measured pilot—not as a proven universal optimization. Confidence: medium-high.**

The user's category-level claim is accurate: Fabric Prewalk, `build`, and `general` all involve a child agent. The material difference is context transfer. Current `build` and `general` calls are fresh role sessions with `inherit_context: false` and `prompt_mode: replace`; they receive a reconstructed task envelope rather than Main's working trajectory. Fabric Prewalk launches a new one-shot Pi child agent over a real fork of Main's persisted session branch, then appends the exact finalized outer `fabric_exec` result. It preserves stored messages, tool calls, and persisted thinking blocks. It does not preserve provider-private reasoning that was never stored.

In precise Fabric terminology, Prewalk is a **one-shot agent**, not a persistent **actor**. In the user's broader sense—“it is still another agent”—the answer is **yes**.

The recommended unit model is:

- **Artifact:** one independently verifiable and reversible user/system outcome.
- **Phase:** an internal execution or feedback transition inside that outcome.
- **Persisted task node:** only a real scheduling, ownership, parallelism, checkpoint, or selective-recovery boundary.
- **Step:** a transient implementation checklist item, not another child-agent boundary.

### Questions and confidence

| Question | Answer | Confidence |
| --- | --- | --- |
| Is Prewalk still an agent handoff? | Yes. Fabric spawns a new one-shot Pi child recorded as `kind: "agent"`; it is not a persistent actor. | High |
| Is it equivalent to `build`/`general`? | Same broad child-agent category, different handoff semantics. Cold workers get an explicit envelope; Prewalk gets a native session-branch trajectory. | High |
| Does stored thinking transfer? | Persisted `ThinkingContent` and thinking-level settings do; hidden provider reasoning that Pi never stored does not. | High |
| Do the original 97% / 41%-cheaper / 1.9× claims apply to Fabric? | No. They motivate a test but cannot validate Fabric's coarser mechanism. | High |
| Does arXiv prove this exact Pi design? | No. It supports simpler/selective decomposition and trajectory coherence only indirectly. | High |
| Should `build` and `general` be deleted now? | No. Remove them from the automatic serial path first; retain them for isolation, parallelism, deliberate fresh context, and specialized restrictions while measuring. | High |

### Verified findings

1. **Current `/ship` hard-codes cold per-task dispatch.** `.pi/prompts/ship.md:26-44,122-133` selects `general|build`, makes one foreground call per selected task, and rebuilds a complete ship-worker envelope. `.pi/agents/build.md:1-32` and `.pi/agents/general.md:1-33` both use `prompt_mode: replace` and `inherit_context: false`. This is cold only with respect to Main's conversation/trajectory; the workers still receive project rules and their explicit envelope.

2. **Fabric Prewalk is trajectory-preserving delegation.** Installed `pi-fabric` 0.28.1 snapshots or forks Main's active branch through the assistant entry containing the sole top-level `fabric_exec`, synchronizes model/thinking settings, appends the exact finalized outer tool result, and spawns a Pi child recorded as `kind: "agent"`. Upstream tests show the child has a different session ID while `buildSessionContext()` retains prior user/assistant messages, stored thinking, the native tool call, and its exact result.

3. **Fabric's handoff boundary is coarser than original Prewalk.** A successful `pi.edit`, `pi.write`, or `schema.commit` marks the outer Fabric invocation. All later nested calls still run; handoff starts only after that whole `fabric_exec` completes. Therefore, a giant mutation-and-verification call may leave little useful work for the executor. The frontier call should be bounded if the intent is to hand off after grounding and an initial implementation move.

4. **Original Prewalk is evidence for the hypothesis, not Fabric's effect size.** Can Bölük's benchmark reports 97% of frontier performance, 41% lower cost, and 1.9× faster on its tested SWE-Bench Pro arms. Its implementation performs an in-place model switch after a TODO-gated first edit/write and adds hidden plan/verification nudges. Fabric instead forks a new child at the outer `fabric_exec` boundary and explicitly documents the different mechanism. No Fabric-specific benchmark was found.

5. **Academic evidence favors selective, coherent decomposition—not a universal topology.** AGENTLESS arXiv v2 reports 32.00% (96 fixes) at $0.70 with a simple localization → repair → validation pipeline. A 120-trajectory/2,822-interaction study analyzes coherence and feedback integration as whole trajectories. A single-agent/multi-agent comparison reports diminishing multi-agent benefit with stronger models and gains from selective cascading. A fault-localization study finds function-level context best in one controlled setup but explicitly says optimal granularity is task-dependent. SWE-Cycle reports a sharp drop when isolated phases become an end-to-end cycle because cross-phase dependencies are difficult. None directly compares Pi cold workers with Fabric Prewalk.

6. **Local lifecycle state shows churn, not causal token proof.** The completed agent-utilization graph has four tasks with recorded attempt counters totaling 23. Current `/ship` revalidates, records evidence, reconstructs context, and re-dispatches at every task boundary. This establishes repeated orchestration boundaries; it does not by itself measure tokens or prove that Prewalk will be cheaper.

### Recommended operating model

For one coherent serial outcome:

1. Main/frontier remains the implementation owner: ground in the repository, resolve the design, define proof, and make the first bounded implementation move.
2. Fabric Prewalk hands the persisted trajectory to one executor to continue implementation and focused verification in the same workspace.
3. Main resumes canonical lifecycle ownership for diff inspection, independent review where risk warrants it, evidence recording, and final verification.
4. Keep internal phases—localize, RED, GREEN, refactor, verify—as phases/checklists unless one is independently schedulable or recoverable.

Keep cold `build`/`general` workers only when a fresh boundary adds value: disjoint worktree parallelism, security/trust isolation, unrelated outcomes, a deliberately fresh perspective, explicit persona/tool restrictions, or a trajectory too polluted/long to continue safely. Independent `review`, `scout`, and `Explore` roles remain useful because their value is separation, not implementation continuity.

Do **not** physically delete `.pi/agents/build.md` or `.pi/agents/general.md` during the pilot. Existing prompt, workflow, and `.pi/tests/skill-system.test.ts` contracts explicitly depend on both names. First test removal from automatic serial routing; any later deletion requires a coordinated migration and separate explicit path approval.

### Required pilot evidence

Compare matched serial changes under:

- **Baseline:** current fresh `general|build` worker per task.
- **Treatment:** one grounded Main → Fabric Prewalk trajectory per coherent outcome.

Capture total input/output/cache tokens, wall time, repeated file reads, child count, fix attempts, verification pass rate, review defects, and manual recovery. Reject or narrow the change if quality or recoverability regresses even when token use improves. Published Stencil percentages are not acceptance criteria.

### Contradictions and uncertainties

- Earlier research in this file recommended `general|build` as the serial `/ship` default because it evaluated role routing without Fabric trajectory handoff. This update **supersedes that serial default only**; the earlier isolation/parallel-worker conclusions remain valid.
- “Prewalk keeps the same agent” is false as process identity but directionally true as trajectory continuity.
- “Thinking transfers” applies only to model-visible content persisted in Pi's session format.
- No direct paper or local run proves the expected savings. The final routing decision must be evidence from the Pi Core pilot.

### Sources

1. `.pi/prompts/ship.md:26-60,114-141`
2. `.pi/agents/build.md:1-51`; `.pi/agents/general.md:1-52`
3. Installed `pi-fabric` 0.28.1: `dist/agents/handoff.js`, `dist/prewalk/handoff.js`, `dist/providers/agents-provider.js`
4. https://github.com/monotykamary/pi-fabric/blob/main/docs/agents.md
5. https://github.com/monotykamary/pi-fabric/blob/main/tests/handoff.test.ts
6. https://stencil.so/blog/prewalk and https://github.com/can1357/oh-my-pi/blob/c0d0ad76/packages/coding-agent/test/agent-session-prewalk.test.ts
7. https://arxiv.org/abs/2407.01489
8. https://arxiv.org/abs/2506.18824
9. https://arxiv.org/abs/2505.18286
10. https://arxiv.org/abs/2604.00167 and https://arxiv.org/abs/2605.13139
