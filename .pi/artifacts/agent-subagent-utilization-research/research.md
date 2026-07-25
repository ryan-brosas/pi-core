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