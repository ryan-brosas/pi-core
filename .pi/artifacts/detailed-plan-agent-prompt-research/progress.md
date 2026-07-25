# Progress: Detailed Plan Agent & `/plan` Prompt Improvements

## 2026-07-25 — `/ship` Task 1 attempt 1 started

- Active slug: `detailed-plan-agent-prompt-research`
- Graph validated; `task-1` is the sole selected frontier node.
- Preflight hashes:
  - `.pi/agents/Plan.md`: `2b75d398c82c1e4c4789de50d7ccc2310c95fd1e2308b18a994aef5e6ab5defd`
  - `.pi/prompts/plan.md`: `324a530d49a8bc2e1e52e052ae7188fecfdbee162c579fab74b68e5351767627`
  - `.pi/tests/skill-system.test.ts`: `5dd612f5fb8c6eb633fb3593691e1906e66e3245063e51748a933ee5b7154800`
- Task 1 neighborhood: `.pi/agents/Plan.md`, plus reference patterns in `.pi/agents/review.md`, `.pi/agents/scout.md`, `.pi/agents/general.md`, `.pi/agents/build.md`, `.pi/prompts/ship.md`, `.pi/skills/planning-and-task-breakdown/SKILL.md`.
- No branch, worktree, or commit will be created without explicit approval.

## Evidence: task-1 attempt 1

- **Implementation:** Rewrote `.pi/agents/Plan.md` directly with operational structure: Identity, Task, Success Criteria, When to Use / When NOT to Use, Required Planning Envelope, Rules/Boundaries, Tool-Use Table, Workflow, Goal-Backward Methodology, Discovery Levels, Context Budget, Dependency Graph, Context Ritual, Pressure Handling, Output schema, and Plan Artifact Structure.
- **Preservation:** kept all valuable planning content (goal-backward, discovery levels, context budget, dependency graph construction) and frontmatter.
- **Verification:** `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` passed 35/35; no regressions in existing contract tests.
- **Diff check:** `git diff --check -- .pi/agents/Plan.md` passed.
- **Commit:** not performed; commit permission has not been granted.

## Evidence: task-2 attempt 1

- **Implementation:** Updated `.pi/prompts/plan.md` with:
  - **Planning Worker Routing** section mapping architecture synthesis → `Plan`, local patterns → `Explore`, external research → `scout`, plus stop-for-parent-decision.
  - **Planning Envelope** section with task identity, goal, constraints, spec/plan paths, dependencies, non-goals, acceptance criteria, discovery level cap, research gaps, expected artifacts, stop conditions, and approval constraints.
  - **Approval Checkpoints** subsection in Phase 1 Guards gating overwrite of `plan.md`, `.active` changes, commits, new files, and destructive operations.
  - **Load Skills** directive for `planning-and-task-breakdown`.
  - **Handoff to `/ship`** section with graph validation and transition instructions.
- **Verification:** `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` passed 35/35; `git diff --check -- .pi/prompts/plan.md` passed.
- **Commit:** not performed; commit permission has not been granted.

## Evidence: task-3 attempt 1

- **Implementation:** Added two focused tests to `.pi/tests/skill-system.test.ts`:
  - `plan agent requires a planning envelope and advisory output`
  - `/plan prompt routes planning work with envelopes and checkpoints`
- **Focused verification:** `node --experimental-strip-types --test --test-name-pattern="plan agent|/plan prompt" .pi/tests/skill-system.test.ts` passed 2/2.
- **Full skill-system verification:** `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` passed 37/37.
- **Diff check:** `git diff --check -- .pi/tests/skill-system.test.ts` passed.
- **Commit:** not performed; commit permission has not been granted.

## Next action

Run Task 4 integrated verification: full retained suite, graph validation, whitespace checks, and final review.

## Research: Detailed `Plan` agent prompts and `/plan` delegation (2026-07-25)

### Execution

- **Mode:** Complex research workflow.
- **Question:** Can `/plan` use the `Plan` agent with the same detailed, relatable energy as the original prompt while retaining safe parent-owned planning?
- **Method:** Reused current-session local research, dispatched one bounded `scout` for installed runtime behavior, then one dependent foreground `review` to re-inspect and cross-check the codebase, installed documentation, installed source, current implementation, tests, and historical prompt.
- **Scope:** Research and documentation only. This section does not change implementation files, `.active`, or task-graph state.
- **Research note:** The scout reached its turn limit after verifying the core lookup and frontmatter behavior. The dependent review independently inspected the authoritative local sources and resolved the remaining gaps.

### Questions and confidence

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| Does a `/plan` prompt automatically invoke the `Plan` agent? | Answered | High | No. Prompt templates expand Markdown into a slash-command prompt; `/plan` must contain an explicit `Agent({ subagent_type: "Plan", ... })` invocation. |
| Should `/plan` always delegate to `Plan`? | Answered | High | No. The parent plans inline by default. Use one foreground `Plan` child only when ambiguity, architectural trade-offs, or cross-subsystem sequencing make an independent blueprint materially useful. |
| Who owns `plan.md`, `tasks.json`, and lifecycle state? | Answered | High | The parent. The child is read-only and advisory. This is a project contract, not a guarantee supplied by the subagent extension, so both prompts and tests must enforce it. |
| Can the existing `.pi/agents/Plan.md` remain capitalized? | Answered | High | Yes. Type lookup is case-insensitive, and `Plan` matches the canonical built-in name while making the project override obvious. |
| How should the original prompt's detailed energy be retained? | Answered | High | Restore its memorable principles, ritual phases, and selected quotations around a precise operational shell; do not replace direct ownership and safety rules with metaphor. |
| Is the current implementation ready for verification-only Task 4? | Answered | High | No. It has substantive gaps and contradictions that the current keyword-based tests do not catch. |

### Verified findings

1. **A concrete call is required.** Pi prompt templates turn `.pi/prompts/plan.md` into `/plan`, but do not perform tool calls. The current prompt discusses routing yet contains no concrete `Plan` invocation; its only concrete planning-related child example is `Explore`.
2. **The project agent override is valid.** Installed `@tintinweb/pi-subagents` is version `0.14.3`. Project agents in `.pi/agents/*.md` override same-name defaults, and agent-type lookup is case-insensitive. Keeping `.pi/agents/Plan.md` and `subagent_type: "Plan"` is correct.
3. **The child starts without assumed parent context.** With `prompt_mode: replace`, the custom body supplies the child's role prompt rather than inheriting the parent system/project instructions. With `inherit_context: false`, the parent conversation is not prepended. The parent therefore must provide a self-contained envelope instead of references such as “the current task” or “the files discussed above.”
4. **Frontmatter is authoritative.** The Plan agent's configured tools, skills, model, thinking, turn limit, context inheritance, and prompt mode define its execution boundary. Invocation-time prose cannot be relied upon to override locked frontmatter.
5. **Delegation is conditional, not ceremonial.** Project guidance explicitly prefers direct parent work and warns against an automatic Plan → Implement → Review ritual. `Plan` is appropriate for ambiguous requirements, architectural decisions, and cross-subsystem sequencing; `Explore` remains the local-evidence specialist and `scout` the external-evidence specialist.
6. **Canonical ownership must be explicit.** The extension does not know that `plan.md` and `tasks.json` are authoritative project artifacts. `.pi/prompts/plan.md`, `.pi/agents/Plan.md`, and contract tests must state that the child returns advice in chat while the parent reconciles evidence, writes artifacts, validates the graph, and manages approval gates.
7. **Current ownership wording is contradictory.** The Plan agent says it is advisory and read-only, but its envelope requests `updated plan.md` and `updated tasks.json` as “expected artifacts.” Those must become parent-owned artifacts *informed by* a structured advisory response, not outputs the child creates.
8. **Current `/plan` handoff misstates `.active` ownership.** Saying `.active` mutation belongs to `/ship` is unsafe. Changes to `.active` remain exceptional and approval-gated; ordinary `/ship` execution consumes an explicitly selected active slug rather than taking ownership of switching it.
9. **The canonical-plan creation gate needs precision.** Invoking `/plan` should normally authorize creation of the expected canonical `plan.md`. Separate confirmation remains appropriate for overwriting an existing plan, creating additional non-canonical files, changing `.active`, dependencies, Git writes, or destructive actions.
10. **The tests verify vocabulary rather than behavior.** Current broad regular expressions can pass when only one of several required concepts appears. Tests do not require an executable Plan call, advisory-only expected output, parent ownership, forbidden child writes, correct `.active` language, or preservation of the original voice.
11. **The rewrite flattened useful character.** The pre-change prompt at commit `86adeee` included “Planning Guidelines,” “Architecture as Ritual,” “Clarity Through Constraint,” “Simplicity First,” the Ground → Calibrate → Transform → Release → Reset ritual, and memorable quotations. These are useful identity and reasoning cues and can coexist with strict operational sections.

### Recommended responsibility split

#### `.pi/prompts/plan.md` — parent orchestration

- Resolve and validate the active spec and canonical graph.
- Decide whether direct parent planning is sufficient.
- Gather bounded missing evidence with `Explore` or `scout` before synthesis.
- Invoke one foreground `Plan` child only when the conditional routing rule is met.
- Build the complete child envelope, inspect its evidence, resolve conflicts, and accept or reject its advice.
- Create or overwrite canonical `plan.md` under the proper gate, update `tasks.json`, validate it, and prepare the `/ship` handoff.
- Keep `.active`, dependency, Git, destructive-action, and unrelated-file gates parent-owned.

#### `.pi/agents/Plan.md` — advisory specialist

- Define the specialist's identity, planning principles, method, hard boundaries, and stable response schema.
- Require a complete fresh-child envelope and stop when a material field is absent.
- Inspect local evidence read-only and return one bounded blueprint with alternatives only when decision-relevant.
- Never write canonical artifacts, lifecycle state, implementation, dependencies, or Git state; never schedule nested agents.
- Preserve the original voice as a memorable reasoning framework without weakening direct imperative rules.

#### `.pi/skills/planning-and-task-breakdown/SKILL.md` — reusable doctrine

- Hold shared methods for blast-radius analysis, vertical slices, ordering, TDD/verification, risks, assumptions, and stop conditions.
- State the parent-synthesis and canonical-ownership invariant.
- Describe conditional routing among `Plan`, `Explore`, and `scout` without duplicating the whole `/plan` lifecycle or the Plan system prompt.

### Recommended invocation rule

Plan inline by default. After resolving local and external evidence gaps, invoke one foreground `Plan` child only when requirements remain materially ambiguous, an architecture trade-off needs resolution, or sequencing crosses subsystems and an independent blueprint is likely to reduce risk. Do not invoke it for clear mechanical decomposition or merely to complete a ritual.

```typescript
Agent({
  subagent_type: "Plan",
  description: `Advise on ${featureSlug} planning decision`,
  prompt: planningEnvelope,
});
```

The call should omit `model` and `thinking`; agent frontmatter owns those values. It should remain foreground because canonical parent synthesis depends on the result.

### Required advisory envelope

The parent should resolve every field before dispatch:

1. **Task identity:** feature slug, planning round, and one bounded advisory question.
2. **Goal:** an outcome-shaped, user-visible goal.
3. **Inputs:** exact paths for the spec, existing plan or `none`, canonical task graph, and relevant files/symbols.
4. **Constraints:** hard constraints, soft preferences, and the non-negotiable parent-ownership boundary.
5. **Prior decisions and dependencies:** resolved evidence rather than references to unseen conversation.
6. **Non-goals:** explicit exclusions.
7. **Acceptance criteria:** questions the advisory must settle, evidence requirements, and treatment of uncertainty.
8. **Discovery cap and research state:** allowed depth, resolved findings, and remaining gaps; external gaps return to the parent.
9. **Expected output:** one structured chat-only advisory containing a primary recommendation, observable truths, required artifacts, key links, dependency implications, verification strategy, risks, assumptions, and open decisions.
10. **Stop conditions:** missing envelope fields, unavailable material evidence, user-authority decisions, or scope beyond the named question.
11. **Approval constraints:** read-only inspection; no file/lifecycle/Git/dependency/destructive changes, implementation, nested agents, or sibling scheduling.

The phrase `updated plan.md` or `updated tasks.json` must not appear as a child-produced expected artifact.

### Contract tests needed

- Require a concrete `Agent` call with `subagent_type: "Plan"` in `/plan`.
- Require direct-first routing and all three qualifying triggers; reject automatic Plan → Implement → Review sequencing.
- Require foreground use and omission of invocation-level `model` and `thinking`.
- Require advisory-only output and explicit parent ownership of both canonical files.
- Reject child expected-output language that asks for updated `plan.md` or `tasks.json`.
- Require prohibitions on child writes to `plan.md`, `tasks.json`, `progress.md`, `.active`, and implementation files.
- Distinguish authorized first creation of canonical `plan.md` from gated overwrite and additional-file creation.
- Require `.active` to remain exceptional and approval-gated rather than a routine `/ship` responsibility.
- Parse and verify exact Plan frontmatter where practical instead of relying only on loose regular expressions.
- Require selected original headings/ritual cues so future operational edits do not erase the requested voice again.

### Recommendation

Adopt an **additive operational shell**, not a wholesale rewrite: restore the original Plan identity and ritual language, retain the new explicit boundaries and schema, add a real conditional foreground Plan call to `/plan`, correct ownership and `.active` wording, and strengthen tests around executable behavior and negative safety invariants. The parent remains the sole canonical planner.

Because the active graph currently records Tasks 1–3 as passed and Task 4 as running while this research identifies gaps in all three edited surfaces, do not treat Task 4 as verification-only. Before resuming `/ship`, reconcile the findings with the canonical task graph and use its attempt/stale/recovery rules rather than silently preserving obsolete pass evidence.

### Open decisions

1. **Delegation strictness:** whether every qualifying case must invoke `Plan` or the parent may decline when delegation cost outweighs value. **Recommendation:** preserve parent discretion and require a short rationale either way.
2. **Voice budget:** exactly which original quotations to retain. **Recommendation:** keep the named principles, five ritual phases, and at most one opening and one closing quotation.
3. **First-plan authorization:** whether `/plan` itself authorizes initial canonical `plan.md` creation. **Recommendation:** yes; ask separately only for overwrite or extra files.

### Sources

1. `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/prompt-templates.md:3-15,31,65-69,93`
2. `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/package.json:1-4`
3. `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/src/custom-agents.ts:12-31`
4. `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/src/agent-types.ts:37-75`
5. `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/README.md:152-176,204-231`
6. `.pi/agent-tool-description.md:1-14,25-29`
7. `.pi/skills/planning-and-task-breakdown/SKILL.md:41-50`
8. `.pi/prompts/plan.md:25-52,109-124,469`
9. `.pi/agents/Plan.md:21-27,52-76,316-320`
10. `.pi/tests/skill-system.test.ts:349-385`

## Research: Clean rerun — detailed `Plan` agent and `/plan` delegation (2026-07-25)

> This is the requested clean `/research` rerun. It supersedes the earlier research in this artifact wherever conclusions conflict.

### Execution mode

- **Mode:** Complex deep-research workflow.
- **Phase 1:** Three independent `scout` angles: installed runtime mechanics, historical Plan voice, and project workflow/test contracts.
- **Phase 2:** One dependent foreground `review` cross-checked the complete joined findings against installed source, official documentation, Git history, and project policy.
- **Source priority:** local code/history → installed official-version docs/source → upstream official repositories.
- **Limits:** Two scouts reached their turn cap after returning complete evidence packets. The dependent reviewer independently reopened the cited sources and resolved their overclaims; no remaining conclusion relies only on an incomplete scout assertion.
- **Mutation boundary:** Research only. No implementation file, `.active`, or task-graph state was changed by this rerun.

### Executive summary

**Yes, `/plan` can and should use the project `Plan` agent for genuine deep-planning work.** A prompt template does not launch a child by itself, so `.pi/prompts/plan.md` needs a concrete foreground `Agent({ subagent_type: "Plan", ... })` instruction with a fully resolved advisory envelope. The call should be conditional under current project policy: use it when requirements remain ambiguous, an architecture trade-off must be resolved, or sequencing spans subsystems; plan inline for clear mechanical work.

The parent remains the canonical planner. The child returns a chat-only advisory; the parent alone reconciles evidence, writes `plan.md` and `tasks.json`, validates the graph, and controls lifecycle state. The original Plan prompt's detailed, relatable energy should be restored additively—named principles, selected quotations, and Ground → Calibrate → Transform → Release → Reset—without restoring language that implies file writes, nested delegation, or lifecycle ownership.

The current implementation is not yet consistent with that result: `/plan` names Plan but never concretely invokes it; both planning envelopes still imply child-produced canonical files; the handoff misassigns `.active` to `/ship`; and tests verify words rather than executable and negative safety contracts.

### Questions answered

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| Can `/plan` invoke the custom `Plan` agent? | Answered | High | Yes. Use `Agent({ subagent_type: "Plan", ... })`; exact `Plan` casing matches the project override. |
| Does mentioning Plan in routing prose invoke it? | Answered | High | No. Pi expands the Markdown prompt; the parent model still needs an explicit Agent-call instruction. |
| Should every `/plan` run invoke Plan? | Partially policy-dependent | High technical / Medium policy | Current policy says direct-first. Invoke Plan for ambiguity, architecture, or cross-subsystem sequencing. Making it mandatory for every `/plan` would be an explicit policy change. |
| Who writes canonical planning artifacts? | Answered | High | The parent only. The child returns advisory text and proposed deltas, never canonical writes. |
| Should `Plan.md` stay capitalized? | Answered | High | Yes. Lookup is case-insensitive, but exact casing reliably replaces the same-name built-in and avoids override ambiguity. |
| How should the original “energy” return? | Answered | High | Preserve its voice and ritual as the child specialist's reasoning layer, wrapped in direct boundaries and a strict advisory schema. |
| Are the current tests sufficient? | Answered | High | No. They do not prove a real Plan invocation or reject unsafe ownership language. |

### Key findings

#### 1. Runtime behavior requires an explicit call

Pi prompt templates expand Markdown into the parent prompt; they are not executable agent declarations. `/plan` therefore needs a concrete instruction such as:

```typescript
Agent({
  subagent_type: "Plan",
  description: `Advise on ${featureSlug} planning decision`,
  prompt: planningEnvelope,
});
```

Use a foreground call because canonical synthesis depends on its result. Omit `model` and `thinking`; the agent frontmatter owns configured values. An explicit instruction strongly establishes the intended behavior, but it is still an LLM tool instruction—not a runtime-level guarantee.

#### 2. Preserve exact `Plan` casing and fresh-child semantics

Installed `@tintinweb/pi-subagents` is version `0.14.3`. `.pi/agents/Plan.md` reliably overrides built-in `Plan`, and invocation lookup is case-insensitive. `prompt_mode: replace` means the custom body is the specialist prompt rather than inherited AGENTS/CLAUDE policy. `inherit_context: false` means no parent conversation history is forked; it does **not** mean the child lacks its agent configuration or project environment. The task prompt must therefore be self-contained.

#### 3. Use a three-layer responsibility split

- **`.pi/prompts/plan.md`:** guards, discovery choice, explicit worker routing, resolved envelope, approval gates, parent synthesis, canonical writes/validation, and `/ship` handoff.
- **`.pi/agents/Plan.md`:** specialist identity, original voice, read-only/advisory boundaries, planning judgment, and stable response schema.
- **`planning-and-task-breakdown/SKILL.md`:** reusable doctrine—blast radius, vertical slicing, ordering, verification, risk, assumptions, and stop conditions.

This avoids copying the entire goal-backward/discovery/context-budget method into all three surfaces.

#### 4. Restore the original voice additively

Verified at commit `86adeee`, the original prompt contained:

- “Planning Guidelines” and “Architecture as Ritual”
- “Clarity Through Constraint” and “Simplicity First”
- “A good plan doesn't predict the future; it creates leverage for the builder.”
- “The body is architecture. The breath is wiring. The rhythm is survival.”
- Ground / Calibrate / Transform / Release / Reset, including reflective “silence pockets”
- “What must be TRUE for the goal to be achieved?”
- “Plans are leverage, not the deliverable.”

Retain those as identity and reasoning cues. Do not restore any language that permits child writes, nested agents, implicit “leader” ownership, or duplicated lifecycle doctrine. Direct imperative safety rules must outrank metaphor.

#### 5. Send a resolved advisory envelope

The parent must provide:

1. Feature slug, planning round, and one bounded advisory question.
2. Outcome-shaped goal.
3. Exact spec, existing-plan, graph, file, and symbol paths.
4. Hard constraints, preferences, dependencies, and prior decisions.
5. Explicit non-goals and acceptance criteria.
6. Discovery cap, resolved research, and remaining evidence gaps.
7. Expected **chat-only advisory**: primary recommendation, observable truths, artifacts, key links, graph implications, verification, risks, assumptions, and open decisions.
8. Stop conditions and read-only approval constraints.

Use “advisory plan draft,” “proposed task-graph delta,” or “validation findings.” Do not call `updated plan.md` or `updated tasks.json` child outputs.

#### 6. Strengthen behavior-level contract tests

Positive assertions should require:

- A concrete `Agent` example containing `subagent_type: "Plan"`.
- Direct-first routing plus the three qualifying Plan triggers.
- A self-contained advisory envelope and foreground execution.
- Explicit parent-only writes and graph validation.
- Exact Plan frontmatter and selected original voice markers.
- Initial canonical-plan creation distinguished from overwrite and extra-file gates.

Negative assertions should reject:

- Child-produced `updated plan.md` or `updated tasks.json`.
- Child mutation of `plan.md`, `tasks.json`, `progress.md`, `.active`, implementation, Git, or dependencies.
- Nested agents and automatic Plan → Implement → Review choreography.
- Language assigning `.active` switching to `/ship`.

Parse frontmatter and inspect a concrete call shape where practical; broad alternation regexes are insufficient.

### Contradictions and corrections

1. **Earlier research said expected child artifacts could include updated canonical files.** Incorrect. That conflicts with parent ownership and must be replaced with advisory drafts or proposed deltas.
2. **One runtime finding said an explicit call “guarantees” execution.** Too strong. It is the required prompt instruction, but execution remains mediated by the parent model.
3. **“Filename-driven and case-insensitive override” was overgeneralized.** Invocation lookup is case-insensitive, but overrides are inserted under exact names. Preserve `Plan.md` casing.
4. **“Only explicit context” overstated `inherit_context: false`.** It prevents inherited conversation history; the child still has its specialist prompt/configuration and project environment.
5. **Current `/plan` says `.active` mutation belongs to `/ship`.** Project policy instead makes active-artifact changes exceptional, parent-owned, and approval-gated everywhere.
6. **Current files duplicate doctrine despite recommending consolidation.** The responsibility split above is the target architecture, not a description of the present implementation.

### Recommendation

Use an **explicit, foreground, bounded Plan advisory** in `/plan` after guards and evidence gathering. Under current policy, call it for Level 2–3 ambiguity, architecture, or cross-subsystem sequencing; require a short skip rationale for a complex `/plan` run that does not use it. Keep the parent as sole artifact/state owner. Restore the original voice inside `Plan.md`, while consolidating reusable mechanics in the planning skill and keeping `/plan` focused on orchestration.

The active graph currently records Tasks 1–3 as passed and Task 4 as running, but this clean rerun finds material gaps in all three changed surfaces. Before continuing `/ship`, the graph and attempt evidence need to be reconciled through the defined stale/recovery process; Task 4 should not proceed as verification-only.

### Open policy decisions

1. **Mandatory versus conditional Plan use:** Recommended default is conditional under current AGENTS routing. If every `/plan` must call Plan, explicitly change that project policy rather than implying it indirectly.
2. **Initial plan creation authorization:** Recommended: invoking `/plan` authorizes its expected first canonical `plan.md`; only overwrite and unrelated extra files need separate approval.
3. **Voice placement:** Recommended: full ritual voice in `Plan.md`; concise relatable framing in `/plan` output; reusable mechanics in the skill.

### Sources

1. Pi prompt-template documentation, installed Pi `0.79.4`: `/home/ryan/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/prompt-templates.md:5-17,31-33,57-63`; upstream: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/prompt-templates.md
2. pi-subagents `0.14.3`: `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/README.md:152-176,215-231,274-290`; upstream: https://github.com/tintinweb/pi-subagents
3. Agent resolution source: `/home/ryan/.pi/agent/npm/node_modules/@tintinweb/pi-subagents/src/agent-types.ts:45-75`
4. Original Plan prompt: Git commit `86adeee`, `.pi/agents/Plan.md:15-78,411-412`, dated 2026-07-25
5. Current Plan agent: `.pi/agents/Plan.md:15-100,285-320`
6. Current `/plan`: `.pi/prompts/plan.md:15-52,109-147,457-469`
7. Planning doctrine: `.pi/skills/planning-and-task-breakdown/SKILL.md:25-99`
8. Parent routing policy: `.pi/agent-tool-description.md:1-29`
9. Project lifecycle policy: `AGENTS.md:178-221`
10. Current contract tests: `.pi/tests/skill-system.test.ts:349-385`

## 2026-07-25 — `/ship` task-1 attempt 1 started

- Fresh version-2 graph validated; the live frontier selected only `task-1`.
- Declared files: `.pi/agents/Plan.md`, `.pi/tests/skill-system.test.ts`.
- Transient neighborhood: `.pi/artifacts/detailed-plan-agent-prompt-research/spec.md`, `.pi/artifacts/detailed-plan-agent-prompt-research/plan.md`, `.pi/artifacts/detailed-plan-agent-prompt-research/research.md`, `.pi/agent-tool-description.md`, `.pi/agents/review.md`, `.pi/agents/scout.md`, `.pi/agents/general.md`, `.pi/agents/build.md`, and historical `86adeee:.pi/agents/Plan.md`.
- Pre-edit hashes:
  - `.pi/agents/Plan.md`: `f89988e2b1e531fa7a84d0d85026920b52dbf321f42aa124fb3faac3d187ec98`
  - `.pi/tests/skill-system.test.ts`: `308d18b04dbf437edd13aebc9a7ad86f0a71d2b9a60c9529babc93387a802f5e`
- Existing unrelated and runtime-managed workspace changes are excluded and will remain untouched.
- TDD seam: first add exact voice/runtime and advisory-ownership tests, require RED for the verified current gaps, then minimally update `Plan.md`.

## Evidence: task-1 attempt 1

- **RED:** `node --experimental-strip-types --test --test-name-pattern="plan agent" .pi/tests/skill-system.test.ts` exited `1` with 2/2 intended failures: missing `# Planning Guidelines` ordering and missing bounded advisory-envelope fields.
- **RED commit:** `c2e48fb3ed3f4a831c73c1798bdbcae40687db77` (`test(plan): add failing Plan advisory contracts`).
- **GREEN implementation:** restored the selected original Plan voice and five-phase ritual; replaced child-produced canonical artifacts with chat-only advisory outputs; made parent ownership and no-write boundaries explicit.
- **Focused verification:** `node --experimental-strip-types --test --test-name-pattern="plan agent" .pi/tests/skill-system.test.ts` exited `0`, 2 tests passed, 0 failed.
- **Regression verification:** `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` exited `0`, 37 tests passed, 0 failed.
- **Whitespace verification:** `git diff --check -- .pi/agents/Plan.md .pi/tests/skill-system.test.ts` exited `0`.
- **Parent review:** inspected the complete task diff; changes are confined to the two declared paths, preserve exact frontmatter, and do not grant child artifact or lifecycle writes.
- **GREEN commit:** `2a6e26129e3c91658eca6448cf753ce4aa80b2ee` (`feat(plan): restore detailed Plan advisory contract`).
- **Refactor:** skipped; no additional simplification was needed after GREEN.

## 2026-07-25 — `/ship` task-2 attempt 1 started

- Fresh graph validation selected only `task-2`; `task-1` has current-attempt evidence.
- Declared files: `.pi/prompts/plan.md`, `.pi/tests/skill-system.test.ts`.
- Transient neighborhood: `.pi/agents/Plan.md`, `.pi/skills/planning-and-task-breakdown/SKILL.md`, `.pi/agent-tool-description.md`, `.pi/prompts/ship.md`, active `spec.md`, `plan.md`, `research.md`, and installed Pi prompt-template/pi-subagents runtime documentation already cited by research.
- Pre-edit hashes:
  - `.pi/prompts/plan.md`: `97eedab273ef4e66487f2b0ed9a5173390753d275dfd2e9afbe923f039b397e8`
  - `.pi/tests/skill-system.test.ts`: `fe5fd25a941c17ee90e0ebeddca41011a4ec4796a0e445b29a8c19abcdd7c8b0`
- Existing unrelated and runtime-managed changes remain excluded.
- TDD seam: add an extractable Plan call and scoped ownership/handoff tests first; require RED before changing `/plan`.

## Evidence: task-2 attempt 1

- **RED:** `node --experimental-strip-types --test --test-name-pattern="plan prompt|Plan delegation" .pi/tests/skill-system.test.ts` exited `1`; the intended failures were zero extractable Plan calls and missing chat-only ownership/handoff language.
- **RED commit:** `a09f5065feb750337e05d706ab330b3b80924a46` (`test(plan): add failing /plan delegation contracts`).
- **GREEN implementation:** added direct-first qualification triggers, one foreground self-contained Plan call, chat-only child output, parent-only canonical writes, first-plan versus overwrite gates, and an unchanged/exceptional `.active` handoff.
- **Fix attempt 1:** the first GREEN run exposed an over-narrow test grammar (`overwrite` versus `overwriting`); widened only that verb form without weakening explicit-approval coverage.
- **Focused verification:** the corrected `node --experimental-strip-types --test --test-name-pattern="plan prompt|Plan delegation" .pi/tests/skill-system.test.ts` run exited `0`, 3 tests passed, 0 failed.
- **Regression verification:** `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` exited `0`, 39 tests passed, 0 failed.
- **Whitespace verification:** `git diff --check -- .pi/prompts/plan.md .pi/tests/skill-system.test.ts` exited `0`.
- **Parent review:** inspected the key diff and concrete call; it has exactly `subagent_type`, `description`, and `prompt`, omits invocation-level execution configuration, and leaves artifact/lifecycle writes with the parent.
- **GREEN commit:** `599da2228f80541665636860ee325afc03e0fec0` (`feat(plan): wire conditional Plan delegation`).
- **Refactor:** limited to clearer non-ceremonial routing wording; no scope expansion.

## 2026-07-25 — `/ship` task-3 attempt 1 started

- Fresh graph validation selected only `task-3`; Tasks 1–2 have current-attempt evidence.
- Declared files: `.pi/skills/planning-and-task-breakdown/SKILL.md`, `.pi/tests/skill-system.test.ts`.
- Transient neighborhood: `.pi/prompts/plan.md`, `.pi/agents/Plan.md`, `.pi/agent-tool-description.md`, `.pi/skills/development-lifecycle/SKILL.md`, active `spec.md`, `plan.md`, `research.md`, and nearby skill contract tests.
- Pre-edit hashes:
  - `.pi/skills/planning-and-task-breakdown/SKILL.md`: `73ebdf1441977b1e2ceb996f0ddeff77af0ffe2968950331a563941a1e700885`
  - `.pi/tests/skill-system.test.ts`: `44ea6e56f6768375f0fafbb4222328d7a9755602df81bf4bbdf45658b9626bee`
- Existing unrelated and runtime-managed changes remain excluded.
- TDD seam: add body-level direct-first Plan/Explore/scout routing and parent-ownership tests before changing the reusable doctrine.

## Evidence: task-3 attempt 1

- **RED:** `node --experimental-strip-types --test --test-name-pattern="planning skill|planning ownership" .pi/tests/skill-system.test.ts` exited `1`; intended failures showed no direct-first Plan call and incomplete parent evidence/canonical/lifecycle ownership.
- **RED commit:** `91c985aa872bbd018db15bcef50b87cb87e4956b` (`test(plan): add failing planning ownership contracts`).
- **GREEN implementation:** added compact conditional Plan/Explore/scout routing, foreground blocking semantics, parent evidence verification/conflict resolution, parent-only canonical writes, lifecycle ownership, and an advisory result contract.
- **Focused verification:** `node --experimental-strip-types --test --test-name-pattern="planning skill|planning ownership" .pi/tests/skill-system.test.ts` exited `0`, 2 tests passed, 0 failed.
- **Regression verification:** `node --experimental-strip-types --test .pi/tests/skill-system.test.ts` exited `0`, 41 tests passed, 0 failed.
- **Whitespace verification:** `git diff --check -- .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts` exited `0`.
- **Parent review:** inspected the complete skill diff; it is limited to reusable routing/ownership doctrine and does not duplicate the full `/plan` envelope or Plan persona.
- **GREEN commit:** `fda6fb60aebb705d7efcc2d68a9eed3724d3cedd` (`feat(plan): align planning delegation doctrine`).
- **Refactor:** the skill result contract now describes advisory input or a parent-written section; no further cleanup was needed.

## 2026-07-25 — `/ship` task-4 attempt 1 started

- Fresh graph validation selected only `task-4`; Tasks 1–3 have current-attempt evidence.
- Declared implementation files: none. Task 4 may record lifecycle evidence but may not fix implementation.
- Verification neighborhood: `.pi/agents/Plan.md`, `.pi/prompts/plan.md`, `.pi/skills/planning-and-task-breakdown/SKILL.md`, `.pi/tests/skill-system.test.ts`, `.pi/tests/task-graph.test.ts`, active `spec.md`, `plan.md`, `tasks.json`, and `progress.md`.
- Integrated-input hashes:
  - `.pi/agents/Plan.md`: `e095a85577179acedd5693ec3c684166819c3273aa3efc72d219773491784f24`
  - `.pi/prompts/plan.md`: `97dcbf88b758f090fc6ad2922c4473e744a2a2f2377c1a96ea43b266149a5ca7`
  - `.pi/skills/planning-and-task-breakdown/SKILL.md`: `22f2d0125a4ed2fa4e9e79515a9dfcaffeca3529cd7ea1c82c27a3e73a99fb3b`
  - `.pi/tests/skill-system.test.ts`: `db13dc392630145bfd5f215650d356c219a565d2af74eb9373c2bf6a06e6d61a`
- Existing unrelated and runtime-managed changes remain excluded.
- Falsification rule: any gate or review finding that requires edits reopens the owning behavior task; task-4 itself owns no implementation path.

## Failure: task-4 attempt 1

- **Integrated gates passed:** committed-path scope contained exactly the four declared files; Node strip-types syntax check exited `0`; whitespace gate exited `0`; `skill-system.test.ts` plus `task-graph.test.ts` exited `0` with 57 passed and 0 failed.
- **Full-suite gate failed:** `node --experimental-strip-types --test .pi/tests/*.test.ts` exited `1`, with 57 passed and 1 failed because `.pi/tests/prompt-leverage.test.ts` could not import the already-deleted `.pi/extensions/prompt-leverage.ts`.
- **Attribution for full-suite blocker:** unrelated concurrent workspace deletion present before this feature's commits and absent from `9bebff6..fda6fb6`; task-4 cannot restore or modify it.
- **Independent review:** 1 Important finding — both fresh-child envelopes omit explicit data minimization and secret/private-context prohibitions (`.pi/agents/Plan.md`, `.pi/prompts/plan.md`). This attributes corrective work to `task-1` and `task-2` outputs.
- **Independent review:** 1 Minor finding — Plan.md retains three overlapping output schemas. Logged for later assessment; it does not independently trigger scope expansion.
- **Task-4 result:** failed. It owns no implementation files and cannot apply the Important correction.
- **Recovery:** reopen `task-1`; stale `task-2` and `task-3` because their dependency/test evidence must be rerun after the attributed correction; rerun task-4 only after the behavior chain passes again.

## 2026-07-25 — `/ship` task-1 attempt 2 started

- Recovery frontier selected `task-1`; attempt incremented from 1 to 2 with historical evidence preserved.
- Review-attributed scope: `.pi/agents/Plan.md` and `.pi/tests/skill-system.test.ts` only.
- Current hashes:
  - `.pi/agents/Plan.md`: `e095a85577179acedd5693ec3c684166819c3273aa3efc72d219773491784f24`
  - `.pi/tests/skill-system.test.ts`: `db13dc392630145bfd5f215650d356c219a565d2af74eb9373c2bf6a06e6d61a`
- TDD seam: require the Plan envelope to minimize context and explicitly exclude credentials, secrets, private conversation, and unrelated user data before editing the specialist.

## Evidence: task-1 attempt 2

- **RED:** the focused Plan-agent suite exited `1`; 1/2 tests failed because the envelope lacked task-relevant minimization and explicit secret/private-context exclusions.
- **RED commit:** `27a5593ff5314d114fa5547a0ee9bd2ca9cf5e0f` (`test(plan): add failing Plan privacy boundary`).
- **GREEN implementation:** added one privacy/data-minimization envelope field requiring task-relevant evidence and excluding credentials, secrets, private conversation, and unrelated user data.
- **Focused verification:** Plan-agent suite exited `0`, 2 passed, 0 failed.
- **Regression verification:** full `skill-system.test.ts` exited `0`, 41 passed, 0 failed.
- **Whitespace verification:** scoped `git diff --check` exited `0`.
- **Review closure:** directly resolves the Important review finding for `.pi/agents/Plan.md`; no unrelated output-schema refactor was included.
- **GREEN commit:** `2a5f71e832a911f6c03d7814693bfd2a4b4f7b9e` (`fix(plan): minimize Plan advisory context`).

## Recovery: task-2 ready for attempt 2

- `task-1` attempt 2 passed with current privacy evidence.
- `task-2` moved from `stale` to `pending`; attempt-1 evidence remains historical and must not satisfy attempt 2.

## 2026-07-25 — `/ship` task-2 attempt 2 started

- Recovery frontier selected `task-2`; attempt incremented from 1 to 2 with historical evidence preserved.
- Review-attributed scope: `.pi/prompts/plan.md` and `.pi/tests/skill-system.test.ts` only.
- Current hashes:
  - `.pi/prompts/plan.md`: `97dcbf88b758f090fc6ad2922c4473e744a2a2f2377c1a96ea43b266149a5ca7`
  - `.pi/tests/skill-system.test.ts`: `2a8e646039defdfe924d8d230ea50953227530d783cd04d7c0e5d710cad459fc`
- TDD seam: require the parent planning envelope to minimize context and exclude credentials, secrets, private conversation, and unrelated user data.

## Evidence: task-2 attempt 2

- **RED:** focused `/plan` suite exited `1`; 1/3 tests failed because the parent envelope lacked task-relevant minimization and explicit secret/private-context exclusions.
- **RED commit:** `32e66a7772b948e5d44df135a62718c586740c3a` (`test(plan): add failing /plan privacy boundary`).
- **GREEN implementation:** added one privacy/data-minimization field to every planning child envelope.
- **Focused verification:** `/plan` suite exited `0`, 3 passed, 0 failed.
- **Regression verification:** full `skill-system.test.ts` exited `0`, 41 passed, 0 failed.
- **Whitespace verification:** scoped `git diff --check` exited `0`.
- **Review closure:** directly resolves the Important review finding for `.pi/prompts/plan.md` without changing routing or lifecycle behavior.
- **GREEN commit:** `1dfa8023afbffeff58c23f18ec31517b3c9a80a2` (`fix(plan): minimize planning-envelope context`).

## Recovery: task-3 ready for attempt 2

- Tasks 1–2 passed attempt 2 with fresh privacy evidence.
- `task-3` moved from `stale` to `pending` for explicit dependency and shared-test re-verification; its implementation output remains commit `fda6fb60aebb705d7efcc2d68a9eed3724d3cedd`.

## 2026-07-25 — `/ship` task-3 attempt 2 started

- Recovery frontier selected `task-3`; attempt incremented from 1 to 2 with historical evidence preserved.
- No implementation edit is expected: the skill output hash remains `22f2d0125a4ed2fa4e9e79515a9dfcaffeca3529cd7ea1c82c27a3e73a99fb3b`.
- Re-verification scope: focused planning-skill contracts, full skill-system regressions, and whitespace for the declared skill/test paths.

## Evidence: task-3 attempt 2

- **Implementation:** no edit; skill output remained byte-identical to attempt 1.
- **Focused verification:** planning-skill/ownership suite exited `0`, 2 passed, 0 failed.
- **Regression verification:** full `skill-system.test.ts` exited `0`, 41 passed, 0 failed after both upstream privacy fixes.
- **Whitespace verification:** declared skill/test paths exited `0`.
- **Review:** upstream Important finding did not apply to the reusable skill; parent re-inspection confirmed routing and ownership semantics remain intact.
- **Commit evidence:** implementation remains `fda6fb60aebb705d7efcc2d68a9eed3724d3cedd` (`feat(plan): align planning delegation doctrine`).

## Recovery: task-4 ready for attempt 2

- Tasks 1–3 now pass their latest attempts with current evidence.
- The review-attributed Important privacy finding is fixed in both envelopes and protected by focused tests.
- `task-4` moved from `failed` to `pending`; attempt-1 full-suite and review evidence remains historical.

## 2026-07-25 — `/ship` task-4 attempt 2 started

- Recovery frontier selected `task-4`; attempt incremented from 1 to 2 with historical evidence preserved.
- Corrected-input hashes:
  - `.pi/agents/Plan.md`: `2e1595fcbdce913518a22d673fb866fef9d71b2f9ab29b83d816a583e0fdc489`
  - `.pi/prompts/plan.md`: `b66d464a7018af63201bd7fa3ebffd808ffa96e01066144c37e68231a3f4a3c5`
  - `.pi/skills/planning-and-task-breakdown/SKILL.md`: `22f2d0125a4ed2fa4e9e79515a9dfcaffeca3529cd7ea1c82c27a3e73a99fb3b`
  - `.pi/tests/skill-system.test.ts`: `0fd963e5e17858b3ed4a1f522740af32fe49debc3248f844913cafbc3e0daef5`
- Attempt-2 goal: rerun all gates and independent review; the unrelated deleted extension remains outside task scope.

## Failure: task-4 attempt 2

- **Scope gate:** `9bebff6..1dfa802` contains exactly the four declared implementation paths.
- **Type/syntax gate:** Node strip-types syntax check exited `0`.
- **Lint/whitespace gate:** scoped committed diff check exited `0`.
- **Integrated test gate:** `skill-system.test.ts` plus `task-graph.test.ts` exited `0`, 57 passed, 0 failed.
- **Graph gates:** active graph and every artifact graph validated successfully.
- **Full-suite gate:** exited `1` again, 57 passed and 1 failed; `.pi/tests/prompt-leverage.test.ts` cannot import the concurrently deleted `.pi/extensions/prompt-leverage.ts`.
- **Review-fix verification:** both privacy contracts pass in the focused and integrated suites. Re-review was not run because the mandatory full gate failed first.
- **Stop condition:** task-4 has now failed verification twice. No further fix attempt is allowed without user intervention.
- **Unresolved Minor review note:** Plan.md retains overlapping output schemas; not promoted to a blocker and not changed outside an owner-task cycle.
- **Required intervention:** restore/resolve the unrelated extension deletion outside this task, or explicitly change the full-suite acceptance decision; then rerun task-4 in a new attempt.

## 2026-07-25 — `/ship` task-4 attempt 3 started

- User confirmed the deleted prompt-leverage extension is intentional and accepted its obsolete retained-test failure as out of scope.
- Fresh scope: rerun integrated gates, report the known full-suite failure separately, complete independent review, and verify goal wiring.
- The deleted extension and its retained test remain untouched.

## Failure: task-4 attempt 3

- **Fresh integrated gates:** syntax/type proxy, scoped whitespace, active/all graph validation, and integrated planning/task-graph tests passed; integrated suite reported 57 passed and 0 failed.
- **Known accepted full-suite blocker:** 57 passed and 1 failed because the intentionally removed prompt-leverage extension still has an obsolete retained test. The extension and test were not modified.
- **Independent review:** no Critical findings; three Important findings in `.pi/agents/Plan.md` and its contract tests: unbounded `MEMORY.md` reading, competing output schemas, and output-section negative tests that do not directly guard canonical-write regressions.
- **Attribution:** all three findings belong to `task-1` outputs. Reopen task-1 and stale dependent task-2/task-3 verification before rerunning task-4.

## 2026-07-25 — `/ship` task-1 attempt 3 started

- Review-attributed scope: `.pi/agents/Plan.md` and `.pi/tests/skill-system.test.ts` only.
- TDD seams: require topic-bounded institutional-memory access, one unambiguous advisory output schema, and direct negative checks over the actual `## Output` section.
- Current hashes: Plan `2e1595fcbdce913518a22d673fb866fef9d71b2f9ab29b83d816a583e0fdc489`; test `0fd963e5e17858b3ed4a1f522740af32fe49debc3248f844913cafbc3e0daef5`.

## Evidence: task-1 attempt 3

- **RED:** focused Plan-agent suite exited `1`; the canonical-state safety test failed on missing parent-provided, topic-bounded `MEMORY.md` handling.
- **RED commit:** `f52ed4fef3a2ba17b2f9960b92ba06c002e92a74` (`test(plan): cover final Plan review boundaries`).
- **GREEN:** Plan-agent suite exited `0`, 2 passed; full skill-system suite exited `0`, 41 passed.
- **Implementation:** Ground now uses parent-provided memory excerpts or topic-bounded grep, and Output has one required handoff schema with conditional emphasis rather than competing formats.
- **Whitespace/syntax:** scoped `git diff --check` and Node strip-types check exited `0`.
- **Review closure:** directly resolves all three Important final-review findings in the owning Plan surface and tests.
- **GREEN commit:** `7203603ae7564ce21b42a4f5f0daa61fb94cadfa` (`fix(plan): tighten Plan advisory boundaries`).

## 2026-07-25 — `/ship` task-2 attempt 3 started

- No task-2 implementation edit is expected; `/plan` remains commit `1dfa8023afbffeff58c23f18ec31517b3c9a80a2`.
- Reverify focused `/plan` contracts, full skill-system regressions, and declared whitespace after the upstream Plan/test correction.

## Evidence: task-2 attempt 3

- **Implementation:** no task-2 edit; `/plan` output remains commit `1dfa8023afbffeff58c23f18ec31517b3c9a80a2`.
- **Focused verification:** `/plan` suite exited `0`, 3 passed.
- **Regression verification:** full skill-system suite exited `0`, 41 passed.
- **Whitespace:** declared prompt/test paths exited `0`.
- **Review:** task-4 findings were confined to the Plan specialist and tests; parent re-inspection and fresh tests confirm `/plan` routing and ownership remain intact.

## 2026-07-25 — `/ship` task-3 attempt 3 started

- No task-3 implementation edit is expected; the planning skill remains commit `fda6fb60aebb705d7efcc2d68a9eed3724d3cedd`.
- Reverify focused planning-skill contracts, full skill-system regressions, and declared whitespace.

## Evidence: task-3 attempt 3

- **Implementation:** no task-3 edit; planning skill remains commit `fda6fb60aebb705d7efcc2d68a9eed3724d3cedd`.
- **Focused verification:** planning-skill/ownership suite exited `0`, 2 passed.
- **Regression verification:** full skill-system suite exited `0`, 41 passed.
- **Whitespace:** declared skill/test paths exited `0`.
- **Review:** final findings did not apply to the reusable skill; routing and parent ownership remain intact after upstream correction.

## 2026-07-25 — `/ship` task-4 attempt 4 started

- Fresh final scope: integrated planning/task-graph checks, active/all graph validation, committed-path and whitespace checks, explicit reporting of the accepted obsolete extension-test failure, goal-backward wiring checks, and independent re-review.
- Current implementation HEAD: `7203603ae7564ce21b42a4f5f0daa61fb94cadfa`.

## Failure: task-4 attempt 4

- **Integrated tests:** exited `0`, 57 passed and 0 failed.
- **Syntax/whitespace/scope:** passed; committed implementation contains exactly the four declared paths.
- **Graph checks:** active and all artifact graphs validated; cross-artifact frontier preserved `.active`.
- **Goal-backward checks:** all four artifacts exist and are substantive; Plan invocation, envelope, parent ownership, bounded memory access, single-schema marker, and planning-skill routing are wired.
- **Known accepted full-suite blocker:** 57 passed and 1 failed solely because the intentionally removed prompt-leverage extension retains an obsolete importing test.
- **Independent re-review:** prior memory and Output-test findings resolved; one Important inconsistency remains in `.pi/agents/Plan.md`: Must-Haves still says to document plan frontmatter, while the mandatory chat schema has no frontmatter or explicit architecture recommendation/trade-off/alternative/effort fields.
- **Stop condition:** task-4 has exceeded two failed verification attempts. Do not start another fix cycle without fresh user direction.

## Completion — user-approved close

- **User decision:** explicitly accepted the remaining Plan output-contract inconsistency and directed: “this is fine close it out.”
- **Accepted known blocker:** the full retained suite remains 57 passed / 1 failed because an obsolete test imports the intentionally deleted prompt-leverage extension.
- **Accepted review note:** `.pi/agents/Plan.md` retains a mismatch between plan-frontmatter guidance and the single chat handoff schema.
- **Passing evidence:** integrated planning/task-graph suite 57/57; focused skill-system suite 41/41; syntax, whitespace, committed-path scope, active/all graph validation, read-only frontier, and goal-backward wiring checks passed.
- **Implementation HEAD:** `7203603ae7564ce21b42a4f5f0daa61fb94cadfa` on `main`.
- **Close status:** all four canonical tasks marked passed under the explicit user waiver; no push or PR was performed.













