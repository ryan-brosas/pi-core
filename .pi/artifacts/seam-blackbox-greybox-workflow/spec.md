# Boundaries and Testability in the Planning Workflow

- **Created:** 2026-07-26
- **Status:** Approved for implementation
- **Tracking:** Project artifact graph
- **Research:** `.pi/artifacts/seam-blackbox-greybox-workflow/research.md`

## Problem Statement

This repository has strong module-design guidance in `.pi/skills/deep-module-design/SKILL.md`, but nothing in the lifecycle requires a plan to state where its module boundaries are, which dependencies get a substitutable seam, or when a verification step is allowed to rely on internal knowledge. As a result, boundary decisions are made implicitly during `/ship` and are never recorded, reviewed, or verified.

Two failure modes follow. Plans either under-specify boundaries, so tests reach into internals and couple to implementation detail; or they over-specify, adding interfaces and adapters that have exactly one implementation and no substitution need. Neither is currently caught by any gate.

A prior cross-check also found that the obvious fix is wrong. `.pi/templates/design.md` is an inert scaffold, not a lifecycle authority, and a blanket "specs are black-box only" rule contradicts the existing PRD template, which legitimately carries a Proposed Solution and Technical Context.

## Goals

1. Make boundary and seam decisions explicit and reviewable at plan time.
2. Prevent speculative seams by requiring a named substitution need before any abstraction is added.
3. Keep verification-visibility language accurate: black-box and gray-box are testing perspectives, not module categories.
4. Add the requirement to the canonical lifecycle surface only, without duplicating existing skill guidance.

## Scope

### In Scope

- A conditional **Boundaries and Testability** section in the canonical plan surface `.pi/prompts/plan.md` and the matching template in `.pi/skills/planning-and-task-breakdown/SKILL.md`.
- A seam justification gate requiring substitution need, enabling point, and a real alternative implementation.
- A gray-box exception record naming the internal knowledge used and why public behavior is insufficient.
- Scoping observable-behavior wording to the Success Criteria section of `.pi/templates/prd.md` only.
- Correcting the absolute "the interface IS the test seam" claim in `.pi/skills/deep-module-design/SKILL.md`.
- Contract tests in `.pi/tests/skill-system.test.ts` asserting the above.

### Out of Scope

- Any change to `.pi/templates/design.md`, `adr.md`, or `tasks.md`; they are not lifecycle authorities.
- Changing the canonical four-artifact model or the authority of `tasks.json`.
- Rewriting `.pi/skills/deep-module-design/SKILL.md` beyond the one inaccurate claim.
- Mandating interfaces, ports, adapters, or dependency injection as a default.
- Automated detection of seams or boundary violations in source code.
- Renaming existing concepts, adding dependencies, package manifests, lockfiles, branches, worktrees, commits, or pushes.

## Proposed Solution

Add one conditional section to the plan surface rather than repeating a rule across templates.

`.pi/prompts/plan.md` Phase 7 gains a **Boundaries and Testability** block in the Required Plan Header, emitted only when the feature introduces or changes a module boundary. It records module boundaries, each proposed seam with its substitution need and enabling point, and any gray-box exception. `.pi/skills/planning-and-task-breakdown/SKILL.md` gains the matching template section so the skill and prompt agree.

The seam justification gate requires three named things before any abstraction is added: the volatile dependency or decision being isolated, the enabling point that selects an alternative, and at least one concrete alternative implementation that will actually exist. A seam failing any of the three is speculative generality and must not be added.

`.pi/templates/prd.md` gains one line under Success Criteria restricting criteria to externally observable behavior. The rest of the PRD is untouched.

`.pi/skills/deep-module-design/SKILL.md` has its absolute seam claim qualified: an interface becomes a seam only when an enabling point can select another behavior.

## Functional Requirements

### FR1 — Conditional Boundaries Section

`.pi/prompts/plan.md` must instruct that the Boundaries and Testability section is emitted only when a plan introduces or changes a module boundary, and omitted otherwise. It must not be an unconditional heading.

### FR2 — Seam Justification Gate

The plan surface must require every proposed seam to name its substitution need, its enabling point, and at least one real alternative implementation. It must state that a seam missing any of the three is not added.

### FR3 — Gray-Box Exception Record

The plan surface must require each gray-box exception to state the internal knowledge relied on and why externally observable behavior cannot supply adequate evidence.

### FR4 — Verification-Visibility Vocabulary

The plan surface must label black-box and gray-box as verification perspectives rather than module-design categories, and must not imply that gray-box knowledge licenses mocking internals.

### FR5 — Observable Acceptance Criteria

`.pi/templates/prd.md` must require Success Criteria to describe externally observable behavior. The Proposed Solution and Technical Context sections must remain unchanged.

### FR6 — Accurate Seam Claim

`.pi/skills/deep-module-design/SKILL.md` must not assert that an interface is unconditionally a test seam. It must require an enabling point.

## Success Criteria

- [ ] The plan surface carries a conditional Boundaries and Testability section with the seam gate and gray-box exception record.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="boundaries" .pi/tests/skill-system.test.ts`
- [ ] The planning skill template agrees with the plan prompt.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="boundaries" .pi/tests/skill-system.test.ts`
- [ ] PRD Success Criteria require externally observable behavior while Proposed Solution and Technical Context survive unchanged.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="observable" .pi/tests/skill-system.test.ts`
- [ ] The deep-module-design seam claim requires an enabling point.
  - Verify: `node --experimental-strip-types --test --test-name-pattern="seam" .pi/tests/skill-system.test.ts`
- [ ] `.pi/templates/design.md`, `adr.md`, and `tasks.md` are byte-identical to HEAD.
  - Verify: `git diff --quiet HEAD -- .pi/templates/design.md .pi/templates/adr.md .pi/templates/tasks.md`
- [ ] The full retained suite stays green.
  - Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`
- [ ] Every artifact graph still validates.
  - Verify: `for f in .pi/artifacts/*/tasks.json; do node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"; done`

## Technical Context

- `.pi/prompts/plan.md` Phase 7 "Write Plan" begins at line 346; the Required Plan Header fenced block runs from roughly line 350 to 404 and already contains Must-Haves, Observable Truths, Required Artifacts, Key Links, Derived Dependency Graph, and Tasks. The new section belongs inside this block.
- `.pi/skills/planning-and-task-breakdown/SKILL.md` has a `## Plan Template` section at line 70 followed by Goal, Non-goals, Slices, Open questions, and Stop conditions headings.
- `.pi/tests/skill-system.test.ts` uses `node:test` with `read()` and `readRequired()` helpers defined at lines 6-13, and already lists `.pi/prompts/plan.md` in its `orchestrationSurfaces` array at line 36. Existing assertions against the plan prompt sit at lines 141, 435, 456, and 530; assertions against the planning skill sit at lines 85, 488, and 507.
- `.pi/skills/deep-module-design/SKILL.md` supplies its enabling point through constructor injection in the example at lines 71-84 and excludes trivial helpers from scope at lines 27-29.
- `.pi/templates/prd.md` Success Criteria is a checklist with nested `Verify:` lines; Proposed Solution begins at line 56.
- The retained suite currently passes 132/132.

## Affected Files

| Path | Change |
| --- | --- |
| `.pi/tests/skill-system.test.ts` | Add contract tests for the boundaries section, seam gate, observable criteria, and corrected seam claim |
| `.pi/prompts/plan.md` | Add the conditional Boundaries and Testability section to the Phase 7 Required Plan Header |
| `.pi/skills/planning-and-task-breakdown/SKILL.md` | Add the matching Plan Template section |
| `.pi/templates/prd.md` | Restrict Success Criteria to externally observable behavior |
| `.pi/skills/deep-module-design/SKILL.md` | Qualify the absolute seam claim to require an enabling point |

## Tasks

### Task 1 — Lock Boundary and Testability Contracts [test]

Focused tests express the conditional section, seam gate, gray-box record, observable-criteria, and corrected-seam contracts, and fail against the current unmodified surfaces.

- depends_on: none
- parallel: false
- conflicts_with: none
- files: `.pi/tests/skill-system.test.ts`
- Verify: `node --experimental-strip-types --test .pi/tests/skill-system.test.ts`

### Task 2 — Add the Boundaries and Testability Plan Section [docs]

The plan prompt and planning skill both carry the conditional section, the three-part seam gate, the gray-box exception record, and verification-perspective vocabulary.

- depends_on: task-1
- parallel: true
- conflicts_with: none
- files: `.pi/prompts/plan.md`, `.pi/skills/planning-and-task-breakdown/SKILL.md`
- Verify: `node --experimental-strip-types --test --test-name-pattern="boundaries" .pi/tests/skill-system.test.ts`

### Task 3 — Scope Observable Behavior to Acceptance Criteria [docs]

The PRD template requires Success Criteria to describe externally observable behavior while Proposed Solution and Technical Context remain untouched.

- depends_on: task-1
- parallel: true
- conflicts_with: none
- files: `.pi/templates/prd.md`
- Verify: `node --experimental-strip-types --test --test-name-pattern="observable" .pi/tests/skill-system.test.ts`

### Task 4 — Correct the Absolute Seam Claim [docs]

The deep-module-design skill states that an interface becomes a test seam only when an enabling point can select another behavior.

- depends_on: task-1
- parallel: true
- conflicts_with: none
- files: `.pi/skills/deep-module-design/SKILL.md`
- Verify: `node --experimental-strip-types --test --test-name-pattern="seam" .pi/tests/skill-system.test.ts`

### Task 5 — Verify Integrated Boundary Guidance [verify]

The full retained suite is green, every artifact graph validates, and the untouched templates are byte-identical to HEAD.

- depends_on: task-2, task-3, task-4
- parallel: false
- conflicts_with: none
- files: none
- Verify: `node --experimental-strip-types --test .pi/tests/*.test.ts`

## Risks

| Risk | Mitigation |
| --- | --- |
| The new section duplicates `.pi/skills/deep-module-design/SKILL.md` and creates two competing authorities | The plan section records decisions; the skill teaches how to make them. Task 4 removes the one overlapping inaccurate claim rather than restating skill content in the prompt. |
| An unconditional heading trains planners to emit an empty Boundaries section for every feature | FR1 makes the section conditional, and Task 1 asserts the conditional wording rather than just the heading. |
| Requiring seams encourages the speculative generality the spec is trying to prevent | The three-part gate requires a real alternative implementation, so a seam with one implementation cannot pass. |
| Test assertions on prose become brittle to harmless rewording | Assertions target stable semantic markers such as the section heading and the three gate terms, not full sentences. |
| Editing `.pi/tests/skill-system.test.ts` collides with concurrent agent-configuration work in the same file | Task 1 appends new tests without altering existing assertions, and Task 5 confirms the whole suite still passes. |

## Open Questions

- Whether `.pi/templates/design.md` should eventually gain a pointer to the canonical plan section, or stay inert. Deferred; out of scope here.
- Whether a future fitness-function-style automated check could detect seams with a single implementation. Not attempted in this feature.