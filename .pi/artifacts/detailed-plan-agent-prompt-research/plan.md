# Detailed `Plan` Agent and `/plan` Delegation Implementation Plan

> **For Pi:** Implement this plan task-by-task. `tasks.json` remains authoritative; this file explains the intended TDD sequence and derived waves.

**Goal:** A Pi user invoking `/plan` gets a detailed, relatable planning workflow that conditionally consults the project `Plan` specialist for genuinely complex decisions while the parent exclusively owns canonical artifacts and lifecycle state.

**Discovery Level:** 3 — deep research is complete and reused. Three research angles, an independent cross-check, one bounded local `Explore`, and one foreground `Plan` advisory established the runtime behavior, historical voice, local blast radius, and test seams. No further external research is required.

**Context Budget:** Execute one canonical task at a time. Budget approximately 35–45% context for Tasks 1 and 2, 20–30% for Task 3, and 15–25% for Task 4. Never combine the three behavior tasks because they share `.pi/tests/skill-system.test.ts`.

**Authoritative Graph:** `.pi/artifacts/detailed-plan-agent-prompt-research/tasks.json` — version 2, four stable task IDs, validated before planning.

---

## Must-Haves

### Observable Truths

1. A clear, mechanical `/plan` request can be planned inline without mandatory Plan delegation.
2. Material ambiguity, an architectural trade-off, or cross-subsystem sequencing causes one foreground `Plan` advisory call unless the parent records why delegation would not reduce risk.
3. The Plan child receives a self-contained envelope and does not depend on inherited conversation history.
4. Plan advice retains the original specialist's named principles, five ritual phases, and selected opening and closing quotations while remaining operationally precise.
5. The child returns chat-only advice or proposed deltas and cannot write canonical artifacts, lifecycle state, implementation files, Git state, or dependencies.
6. The parent verifies evidence, writes or validates `plan.md` and `tasks.json`, and hands off to `/ship` without routine `.active` mutation.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Plan specialist contract | Detailed voice, resolved envelope, read-only boundary, and stable advisory schema | `.pi/agents/Plan.md` |
| `/plan` orchestrator | Conditional foreground Plan invocation, parent synthesis, approvals, and safe handoff | `.pi/prompts/plan.md` |
| Reusable planning doctrine | Direct-first Plan/Explore/scout routing and parent ownership | `.pi/skills/planning-and-task-breakdown/SKILL.md` |
| Behavioral contract suite | Exact positive structure and negative ownership/safety invariants | `.pi/tests/skill-system.test.ts` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| `.pi/prompts/plan.md` | `.pi/agents/Plan.md` | Concrete foreground `Agent` call with `subagent_type: "Plan"` | Routing prose names Plan but never invokes it |
| `/plan` routing decision | Plan call | Direct-first rule and three qualification triggers | Plan becomes mandatory for trivial work or is never used |
| Plan call | Plan child | Resolved `planningEnvelope` | Fresh child guesses missing paths, constraints, or decisions |
| `.pi/prompts/plan.md` | Planning skill | Explicit skill load and consistent routing vocabulary | Orchestrator and reusable doctrine diverge |
| Child advice | Parent synthesis | Explicit parent-only artifact and lifecycle ownership | Child appears authorized to update canonical files |
| Contract tests | All three planning surfaces | Extracted call shape, ordered markers, scoped negative checks | Broad vocabulary creates false positives |

## Constraints and Non-Goals

- Preserve task IDs `task-1` through `task-4` and their dependency chain.
- Stay within each task's graph-declared files.
- Preserve the current Plan frontmatter unless a failing contract proves a spec conflict; none is currently known.
- Restore voice additively rather than replacing the operational shell wholesale.
- Keep parent orchestration in `/plan`, specialist identity and judgment in `Plan.md`, and reusable doctrine in the planning skill.
- Do not change `/ship`, `/create`, `/research`, other agent definitions, Pi runtime, dependencies, `.active`, or unrelated tests.
- Do not create extra implementation files.
- Existing dirty edits are concurrent/current work. Inspect them before every task and never discard them.
- Commit, branch, worktree, merge, and publication actions remain outside this plan unless the user separately authorizes them.

## TDD Contract

Each behavior task follows this invariant:

1. Add or strengthen a focused test for a verified current gap.
2. Run the narrow test and require a non-zero RED result caused by that exact missing contract.
3. If RED unexpectedly passes, stop and make the test discriminating before editing the prompt or skill.
4. Make the minimum allowed-path implementation change.
5. Run the narrow test to GREEN, then run the scoped whitespace check.
6. Refactor only when it removes duplication without weakening detail or safety, then rerun GREEN.

The current partial implementation is not a reason to skip RED. Tests must target the remaining verified gaps: missing voice markers, unsafe expected-output examples, absent concrete Plan call, incorrect `.active` handoff, absent Plan skill routing, and broad vocabulary assertions.

## Derived Dependency Graph

> Wave labels are a derived snapshot of the current authoritative `tasks.json`. `/ship` must recompute the live frontier after every task transition.

```text
task-1:
  needs: nothing
  creates:
    - tested Plan specialist voice and advisory contract
    - task-1 behavior assertions
  has_checkpoint: false

task-2:
  needs: task-1
  creates:
    - tested conditional foreground Plan orchestration
    - corrected parent ownership and handoff contract
  has_checkpoint: false

task-3:
  needs: task-2
  creates:
    - tested reusable Plan/Explore/scout routing doctrine
    - explicit parent synthesis and lifecycle ownership
  has_checkpoint: false

task-4:
  needs: task-3
  creates:
    - integrated verification evidence
    - independent review evidence
  has_checkpoint: false

Derived Wave 1: task-1
Derived Wave 2: task-2
Derived Wave 3: task-3
Derived Wave 4: task-4
```

No tasks may run in parallel: Tasks 1–3 all modify `.pi/tests/skill-system.test.ts`, and Task 4 verifies their integrated result.

---

## Tasks

### `task-1` — Restore the detailed Plan specialist and advisory boundary

**End state:** `.pi/agents/Plan.md` combines the original planning character with a self-contained, chat-only advisory contract, and focused tests prove both its positive structure and ownership boundaries.

**Allowed files:**

- `.pi/agents/Plan.md`
- `.pi/tests/skill-system.test.ts`

**Needs:** Nothing.

**Creates:** Tested Plan specialist voice, exact runtime contract, and canonical-state-safe output schema.

**Checkpoint:** None. Stop if any additional file is required.

#### RED — contract first

1. **Inspect current owned work (2 minutes).**

   ```bash
   git status --short -- .pi/agents/Plan.md .pi/tests/skill-system.test.ts
   git diff -- .pi/agents/Plan.md .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** Existing edits are visible. No content is restored or discarded. If either file changes again during the task, stop for overlap resolution.

2. **Replace the weak Plan-agent contract with two focused tests (3–5 minutes).**

   In `.pi/tests/skill-system.test.ts`, retain useful existing assertions but add tests named exactly:

   - `plan agent preserves detailed voice and exact runtime contract`
   - `plan agent output is chat-only and canonical-state safe`

   The first test must use `agentFrontmatter(".pi/agents/Plan.md")` and independently require these frontmatter lines:

   - `description: Planning agent for architecture, decomposition, and executable implementation plans`
   - `tools: read, bash, grep, find, ls`
   - `extensions: false`
   - `skills: false`
   - `model: openai-codex/gpt-5.6-sol`
   - `thinking: high`
   - `max_turns: 12`
   - `prompt_mode: replace`
   - `inherit_context: false`

   It must use `agentBody(".pi/agents/Plan.md")` and require the following markers in order:

   1. `# Planning Guidelines`
   2. `## Architecture as Ritual`
   3. `## Clarity Through Constraint`
   4. `## Simplicity First`
   5. `Ground`
   6. `Calibrate`
   7. `Transform`
   8. `Release`
   9. `Reset`

   It must also require the exact leverage opening quotation and architecture/body closing quotation from commit `86adeee`.

   The second test must extract the `## Required Planning Envelope` section and require:

   - bounded advisory question;
   - exact spec, plan, and graph paths;
   - dependencies and prior decisions;
   - resolved research and remaining gaps;
   - `chat-only advice`, `advisory plan draft`, `proposed task-graph delta`, and `validation findings` as output concepts;
   - explicit parent ownership of canonical synthesis;
   - direct prohibitions on writes to `plan.md`, `tasks.json`, `progress.md`, `MEMORY.md`, `.active`, implementation files, Git state, dependencies, and nested agents.

   Scope negative checks to the envelope/output sections so parent-owned file references elsewhere do not create false failures. Reject child-output examples containing the phrases `updated plan.md` or `updated tasks.json`.

3. **Run RED (2 minutes).**

   ```bash
   node --experimental-strip-types --test --test-name-pattern="plan agent" .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** Non-zero exit. The voice test must fail because the current body lacks the named principle headings and closing quotation. The ownership test must fail because the current envelope advertises updated canonical files.

   **Stop condition:** If all matching tests pass, do not edit `.pi/agents/Plan.md`; strengthen the tests until they fail for a verified current gap.

#### GREEN — minimum specialist correction

4. **Close the advisory-output loophole (3–5 minutes).**

   In `.pi/agents/Plan.md`, preserve frontmatter exactly. Replace child-produced “Expected artifacts” examples with a chat-only advisory output field. Add the bounded advisory question, canonical graph/input paths, dependencies/prior decisions, resolved research, and remaining gaps required for a fresh child. State directly that the parent alone writes or validates canonical artifacts.

   **Expected signal:** The envelope describes information the child returns, not files it updates.

5. **Restore the original voice additively (3–5 minutes).**

   Add concise sections for `Planning Guidelines`, `Architecture as Ritual`, `Clarity Through Constraint`, and `Simplicity First`. Preserve the existing operational workflow while framing Ground → Calibrate → Transform → Release → Reset as the five planning phases. Keep exactly one opening leverage quotation and one closing architecture/body quotation. Do not restore historical wording that implies child writes or lifecycle authority.

   **Expected signal:** Required markers appear in order while the direct Rules/Boundaries section remains unambiguous.

6. **Run GREEN (2 minutes).**

   ```bash
   node --experimental-strip-types --test --test-name-pattern="plan agent" .pi/tests/skill-system.test.ts
   git diff --check -- .pi/agents/Plan.md .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** All matching tests pass; the whitespace command exits successfully with no output.

#### REFACTOR — optional

7. **Remove only proven duplication (2–3 minutes).** Consolidate repeated advisory schemas if the focused tests remain expressive and no required detail disappears. Rerun Step 6. Otherwise skip refactoring.

**Task verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="plan agent" .pi/tests/skill-system.test.ts
git diff --check -- .pi/agents/Plan.md .pi/tests/skill-system.test.ts
```

**Primary risk:** Restored metaphor obscures authority. Mitigation: place direct read-only and parent-ownership statements before or adjacent to the ritual language and test them separately.

---

### `task-2` — Wire conditional Plan delegation into `/plan`

**End state:** `.pi/prompts/plan.md` contains an extractable foreground Plan call, direct-first qualification rules, a self-contained advisory envelope, parent-only canonical writes, precise approvals, and a handoff that leaves `.active` unchanged.

**Allowed files:**

- `.pi/prompts/plan.md`
- `.pi/tests/skill-system.test.ts`

**Needs:** `task-1` GREEN.

**Creates:** Tested parent orchestration contract and safe `/ship` handoff.

**Checkpoint:** None. Stop if changing task IDs, dependencies, or another prompt becomes necessary.

#### RED — orchestration contract first

1. **Inspect current owned work (2 minutes).**

   ```bash
   git status --short -- .pi/prompts/plan.md .pi/tests/skill-system.test.ts
   git diff -- .pi/prompts/plan.md .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** Current partial edits are visible and retained.

2. **Add two exact `/plan` tests (3–5 minutes).**

   In `.pi/tests/skill-system.test.ts`, add tests named exactly:

   - `Plan delegation uses one foreground self-contained call`
   - `plan prompt keeps canonical and lifecycle writes parent-owned`

   The call test must extract a concrete `Agent({ ... })` block containing `subagent_type: "Plan"`; a routing-table mention cannot satisfy it. Inside that extracted block require:

   - exact `subagent_type: "Plan"`;
   - a non-placeholder `description`;
   - `prompt: planningEnvelope`;
   - absence of invocation-level `model`, `thinking`, and background execution fields.

   Outside the block require direct-first prose and the three exact qualification concepts: material ambiguity, architectural trade-off, and cross-subsystem sequencing. Require a brief rationale when complex planning skips Plan, foreground execution, and a resolved self-contained envelope.

   The ownership test must extract the Planning Envelope and Handoff sections. Require:

   - chat-only advisory output rather than child-produced canonical files;
   - parent inspection, conflict resolution, and canonical `plan.md`/`tasks.json` writes or validation;
   - first canonical `plan.md` creation authorized by invoking `/plan`;
   - overwrite and unrelated extra-file creation separately approval-gated;
   - `.active` unchanged during handoff and exceptional, parent-owned, and approval-gated otherwise.

   Reject the current phrase assigning those actions as `/ship` responsibilities and reject an automatic Plan → Implement → Review ritual.

3. **Run RED (2 minutes).**

   ```bash
   node --experimental-strip-types --test --test-name-pattern="plan prompt|Plan delegation" .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** Non-zero exit because no concrete Plan call can be extracted, unsafe updated-artifact examples remain, and the current handoff delegates `.active` handling to `/ship`.

   **Stop condition:** If the focused suite passes, make the call extraction and scoped negative checks discriminating before editing the prompt.

#### GREEN — minimum parent-orchestration correction

4. **Define direct-first conditional routing (3–5 minutes).**

   In `.pi/prompts/plan.md`, state that the parent plans inline by default. Invoke Plan only for material ambiguity, architectural trade-offs, or cross-subsystem sequencing where independent advice reduces risk. Require a short skip rationale for complex work. Preserve the existing Explore/scout routing, bounded fan-out, and agent-configuration rules.

   **Expected signal:** The decision rule is explicit enough for the test to distinguish conditional delegation from mandatory choreography.

5. **Add the foreground Plan call (3–5 minutes).**

   After evidence gathering and before canonical synthesis, add one concrete example with:

   ```typescript
   Agent({
     subagent_type: "Plan",
     description: `Advise on ${featureSlug} planning decision`,
     prompt: planningEnvelope,
   });
   ```

   Do not add invocation-level execution configuration. State that the call is foreground because the next parent decision depends on its result.

   **Expected signal:** The test extracts exactly one usable Plan call rather than matching routing prose.

6. **Correct the envelope and canonical ownership (3–5 minutes).**

   Replace child-produced expected-artifact examples with the Task 1 chat-only advisory schema. Require exact spec, existing-plan, graph, file/symbol, prior-decision, resolved-research, and remaining-gap inputs. State that the parent verifies the response, resolves conflicts, and alone writes or validates canonical `plan.md` and `tasks.json`.

   **Expected signal:** Child output and parent writes are distinct concepts in distinct sentences.

7. **Correct approvals and handoff (2–3 minutes).**

   Treat first canonical `plan.md` creation as the expected result of invoking `/plan`. Continue to gate overwrite and unrelated extra files. State that `.active` remains unchanged during handoff; any later switch is exceptional, parent-owned, and separately approved. Remove wording that makes switching a routine `/ship` responsibility.

   **Expected signal:** Handoff names the active slug and validated graph without authorizing pointer mutation.

8. **Run GREEN (2 minutes).**

   ```bash
   node --experimental-strip-types --test --test-name-pattern="plan prompt|Plan delegation" .pi/tests/skill-system.test.ts
   git diff --check -- .pi/prompts/plan.md .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** All matching tests pass; whitespace check succeeds with no output.

#### REFACTOR — optional

9. **Remove redundant orchestration prose (2–3 minutes).** Keep goal-backward, graph-authority, derived-wave, discovery, and constitutional sections intact. Remove only duplicated routing/envelope wording proven unnecessary by the focused tests, then rerun Step 8.

**Task verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="plan prompt|Plan delegation" .pi/tests/skill-system.test.ts
git diff --check -- .pi/prompts/plan.md .pi/tests/skill-system.test.ts
```

**Primary risk:** A test matches the routing list instead of an executable call. Mitigation: extract and inspect the concrete call block independently.

---

### `task-3` — Align reusable planning doctrine and routing

**End state:** The planning skill gives reusable direct-first Plan/Explore/scout routing and unambiguously leaves conflict resolution, canonical writes, and lifecycle ownership with the parent.

**Allowed files:**

- `.pi/skills/planning-and-task-breakdown/SKILL.md`
- `.pi/tests/skill-system.test.ts`

**Needs:** `task-2` GREEN.

**Creates:** Tested reusable routing and ownership doctrine without duplicating the full Plan persona or `/plan` lifecycle.

**Checkpoint:** None. Stop if changing the skill manifest or adding another skill becomes necessary.

#### RED — skill contract first

1. **Inspect current owned work (2 minutes).**

   ```bash
   git status --short -- .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts
   git diff -- .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** The skill is currently unmodified; accumulated test edits are visible.

2. **Add two focused skill tests (3–5 minutes).**

   Add tests named exactly:

   - `planning skill conditionally routes bounded Plan advice`
   - `planning ownership remains with the parent`

   Read the skill body, not frontmatter alone. Require:

   - direct parent planning as the default;
   - a concrete bounded `Agent` call contract using `subagent_type: "Plan"`;
   - Plan for material ambiguity, architecture trade-offs, or cross-subsystem sequencing;
   - Explore for local evidence and scout for external evidence;
   - foreground use when the answer blocks synthesis;
   - parent evidence verification, conflict resolution, canonical `plan.md`/`tasks.json` writes, and lifecycle ownership;
   - advisory-only worker output.

   Avoid requiring the full planning envelope or ritual language; those belong to other surfaces.

3. **Run RED (2 minutes).**

   ```bash
   node --experimental-strip-types --test --test-name-pattern="planning skill|planning ownership" .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** Non-zero exit because the current skill only gives concrete Explore/scout calls and does not state the conditional Plan contract or complete parent ownership.

   **Stop condition:** If the suite passes because frontmatter contains `Plan`, revise it to inspect the skill body and concrete routing prose.

#### GREEN — minimum reusable-doctrine correction

4. **Add concise three-way routing (3–5 minutes).**

   In `## Pi Subagent Inputs`, state that direct parent planning is the default, Plan supplies bounded ambiguity/architecture/cross-subsystem advice, Explore supplies local evidence, and scout supplies external evidence. Include one compact Plan call example, but refer to `/plan` for the full envelope rather than copying it.

   **Expected signal:** All three agent roles and the conditional boundary are readable in one bounded section.

5. **Make parent ownership explicit (2–3 minutes).**

   State that the parent validates evidence, resolves conflicts, writes canonical `plan.md` and `tasks.json`, and owns lifecycle state. Describe worker results as advisory inputs. Ensure the skill result contract does not imply a child writes canonical artifacts.

   **Expected signal:** The reusable skill cannot be read as granting lifecycle authority to a worker.

6. **Run GREEN (2 minutes).**

   ```bash
   node --experimental-strip-types --test --test-name-pattern="planning skill|planning ownership" .pi/tests/skill-system.test.ts
   git diff --check -- .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** All matching tests pass; whitespace check succeeds with no output.

#### REFACTOR — optional

7. **Trim only verbatim duplication (2–3 minutes).** Preserve blast radius, vertical slicing, ordering, verification, risks, stop conditions, and compact routing. Rerun Step 6.

**Task verification:**

```bash
node --experimental-strip-types --test --test-name-pattern="planning skill|planning ownership" .pi/tests/skill-system.test.ts
git diff --check -- .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts
```

**Primary risk:** Reusable doctrine becomes a second copy of `/plan`. Mitigation: keep the skill agent-neutral and link concepts rather than duplicating lifecycle steps.

---

### `task-4` — Run integrated verification and independent review

**End state:** Every focused and retained gate passes, the graph validates, scoped diffs are clean, and independent review reports no unresolved critical or important contract finding.

**Allowed implementation files:** None.

**Needs:** `task-3` GREEN.

**Creates:** Integrated verification and review evidence only.

**Checkpoint:** None initially. A failing full-suite gate or architectural review finding stops completion and is reported to the user.

#### FALSIFICATION GATE

1. **Confirm scoped implementation paths (2 minutes).**

   ```bash
   git status --short -- .pi/agents/Plan.md .pi/prompts/plan.md .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** Scoped evidence names only the four declared implementation files. Unrelated dirty paths remain untouched and excluded.

2. **Run integrated retained tests (2–5 minutes).**

   ```bash
   node --experimental-strip-types --test .pi/tests/skill-system.test.ts .pi/tests/task-graph.test.ts
   ```

   **Expected signal:** Exit success with zero failed tests. Any failure blocks Task 4.

3. **Run the full core suite (2–5 minutes).**

   ```bash
   node --experimental-strip-types --test .pi/tests/*.test.ts
   ```

   **Expected signal:** Exit success with zero failed tests. Any non-zero result blocks completion. If the failure is unrelated and predates this feature, document that evidence without changing unrelated files, but still report the full-suite gate as blocked unless the user explicitly changes the acceptance decision.

4. **Validate the graph and whitespace (2 minutes).**

   ```bash
   node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/detailed-plan-agent-prompt-research/tasks.json
   git diff --check -- .pi/agents/Plan.md .pi/prompts/plan.md .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts
   ```

   **Expected signal:** Graph output reports `"ok": true`, version 2, and no issues; whitespace check succeeds with no output.

5. **Run one independent foreground review (3–5 minutes).**

   Review only the four declared implementation paths against `spec.md`, this plan, and the canonical graph. Require severity-ranked findings with file:line evidence covering:

   - parent/child ownership;
   - conditional routing and foreground call shape;
   - fresh-child envelope completeness;
   - lifecycle and `.active` safety;
   - preserved graph doctrine and historical voice;
   - test false positives and negative-scope precision;
   - simplicity and duplication.

   **Expected signal:** No unresolved critical or important finding. Minor findings are recorded without expanding scope.

6. **Handle review outcomes (2 minutes).**

   - If review is clean, Task 4 may pass after evidence is recorded.
   - If a finding requires an edit, Task 4 must not edit files. Reopen or invalidate the owning behavior task, apply its TDD sequence, then rerun Task 4 from Step 1.
   - If a finding requires an architecture decision, stop and ask the user.

**Task verification:**

```bash
node --experimental-strip-types --test .pi/tests/skill-system.test.ts .pi/tests/task-graph.test.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
node --experimental-strip-types .pi/scripts/task-graph.ts validate .pi/artifacts/detailed-plan-agent-prompt-research/tasks.json
git diff --check -- .pi/agents/Plan.md .pi/prompts/plan.md .pi/skills/planning-and-task-breakdown/SKILL.md .pi/tests/skill-system.test.ts
```

**Primary risk:** Verification task silently fixes behavior. Mitigation: it owns no implementation files; findings route back to the task that owns the affected surface.

---

## Goal-Backward Verification for `/ship`

### Level 1 — Exists

```bash
test -s .pi/agents/Plan.md &&
test -s .pi/prompts/plan.md &&
test -s .pi/skills/planning-and-task-breakdown/SKILL.md &&
test -s .pi/tests/skill-system.test.ts
```

**Expected signal:** Exit success.

### Level 2 — Substantive

```bash
node --experimental-strip-types --test --test-name-pattern="plan agent|plan prompt|Plan delegation|planning skill|planning ownership" .pi/tests/skill-system.test.ts
```

**Expected signal:** All selected behavior contracts pass. The tests require ordered voice markers, scoped ownership rules, an extracted Plan call, and body-level skill routing rather than generic vocabulary.

### Level 3 — Wired

```bash
node --experimental-strip-types --test .pi/tests/skill-system.test.ts .pi/tests/task-graph.test.ts
```

**Expected signal:** The Plan specialist, `/plan` orchestrator, planning skill, tests, and canonical graph contracts pass together.

Manual wiring checks:

1. `/plan` contains exactly one concrete foreground Plan call example.
2. The call consumes the resolved planning envelope.
3. `/plan` still loads `.pi/skills/planning-and-task-breakdown/SKILL.md`.
4. Plan.md, `/plan`, and the skill consistently assign canonical writes and lifecycle state to the parent.
5. No child-produced canonical-output wording remains.
6. Handoff leaves `.active` unchanged.

## Risks, Assumptions, and Stop Conditions

### Risks

- **Metaphor obscures authority:** Keep direct safety language separate and testable.
- **Tests match incidental words:** Extract sections and call blocks before asserting.
- **Doctrine is triplicated:** Enforce persona/orchestration/reusable-doctrine boundaries.
- **Dirty-path overlap:** Snapshot hashes and diffs before each owned edit; stop on concurrent changes.
- **Full-suite baseline failure:** Treat any non-zero gate as a blocker rather than silently redefining success.
- **Self-contained prompts leak sensitive context:** Include only task-relevant paths, decisions, and evidence; never credentials or unnecessary conversation content.

### Assumptions

- Invoking `/plan` authorizes first creation of this canonical `plan.md`.
- The parent executes one canonical task at a time and owns graph/progress transitions.
- Existing unrelated dirty work remains untouched.
- No additional files or dependencies are required.

### Stop Conditions

Stop rather than improvise when:

- a RED test passes against the verified current gap;
- a RED failure comes from test syntax or unrelated setup;
- implementation needs a path outside the task's declared files;
- an owned path changes concurrently;
- graph IDs or dependencies diverge from `tasks.json`;
- a new file, dependency, branch/worktree, commit, lifecycle pointer change, deletion, or destructive action becomes necessary;
- Task 4 finds a critical or important issue requiring edits;
- the full suite is non-zero;
- user authority is required for an architecture or approval decision.

## Privacy and Security

- Treat Plan-child output and citations as untrusted until the parent verifies them.
- Keep the self-contained envelope minimal and task-specific.
- Do not include secrets, credentials, private conversation, or unrelated user data.
- Preserve explicit approval gates for artifact overwrite, lifecycle changes, Git writes, dependencies, and destructive actions.

## Open Decisions

None. Conditional Plan use, first-plan authorization, exact casing, voice placement, canonical ownership, and `.active` policy are resolved by the spec and research.

## Handoff to `/ship`

1. Revalidate `.pi/artifacts/detailed-plan-agent-prompt-research/tasks.json`.
2. Confirm this plan lists exactly `task-1` through `task-4` with the same dependency chain.
3. Run the frontier command and execute only its selected task.
4. Use the task-specific RED → GREEN → optional REFACTOR sequence above.
5. Keep `.active` unchanged; any switch is a separate parent-owned, approval-gated action.

**Next command:** `/ship`