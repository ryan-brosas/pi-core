---
purpose: Confirmed direction, proposed work, dependencies, and acceptance checks
verified-at: 6d78d2e90a75
verified-state: mixed working tree observed 2026-08-03
---

# Roadmap

This roadmap separates user-confirmed outcomes from proposed work. Effort is relative scope, not elapsed time.

## Current direction

Keep Pi Core lean enough to load globally, strict enough to prevent unsafe workspace changes, and detailed enough to understand a target project without inflating `AGENTS.md`. Prefer small cohorts and sensitive mechanical gates over more tests, more agents, or more abstractions.

## Effort scale

- `S`: one bounded cohort with narrow verification.
- `M`: several coupled files or checks within Pi Core.
- `L`: cross-area, cross-repository, migration, deployment, or live coordination.

## Confirmed work

### Maintain concise policy and trustworthy initialization context

- Status: complete locally for this refresh and uncommitted.
- Effort: `M` because the baseline reconciles four detailed documents against policy, source, runtime providers, graph evidence, and tests.
- Evidence: the user invoked `/init`. `.pi/prompts/init.md` defines the five-file context contract.
- Dependencies: installed policy, current source, Hindsight inspection, Fabric session memory, first-class MCP, CodeGraphContext, and local verification.
- Acceptance:
  - `AGENTS.md` remains under 80 lines and contains durable rules plus exact checks.
  - `.pi/user.md`, `.pi/project.md`, `.pi/roadmap.md`, and `.pi/tech-stack.md` preserve authored facts and mark uncertainty.
  - Current graph, memory, MCP, Fabric, and test limits are recorded without health claims.
  - Focused initialization contracts pass and the containing-suite result is reported accurately.
- Risks: context becomes stale after configuration, graph, or ownership changes.
- Live confirmation: `/reload` or a new session is required before changed context affects a live Pi prompt.

### Preserve global project isolation

- Status: ongoing.
- Effort: `M` because the contract spans global registration, policy linkage, target-project startup, memory scope, and workspace enforcement.
- Evidence: `docs/global-development.md`, global settings, the policy symlink, and workspace-policy tests.
- Dependencies: one Pi Core package registration, project-scoped Hindsight, the primary checkout, and target-local policy.
- Acceptance:
  - Starting Pi in another project exposes Pi Core resources without copying this repository.
  - Target source and local policy remain authoritative.
  - Hindsight tags and transcript discovery stay scoped to the target project.
- Risks: machine-global settings can drift. A target-project smoke run can mutate local context.
- Live confirmation: a separately authorized smoke session in a non-Pi-Core repository remains required.

### Codify sensitive verification instead of test-count optimization

- Status: implemented locally in untracked `.pi/skills/pass-rate-workflow/` and not committed.
- Effort: `M` because the workflow joins cohort design, test ownership, broken and fixed proof, controlled failure, and project-native mechanization.
- Evidence: the user asked to preserve the verification advice. `.pi/tests/pass-rate-workflow.test.ts` guards the resulting skill.
- Dependencies: `test-driven-development`, `incremental-implementation`, `testing-anti-patterns`, and `verification-before-completion`.
- Acceptance:
  - Each owning gate fails on an unfixed or deliberately broken form and passes on the fixed form.
  - Test count alone is not treated as evidence.
  - Existing broad gates are extended before duplicate incident tests are added.
  - The focused pass-rate workflow tests pass.
- Risks: a static skill contract cannot prove every future task follows the method.
- Live confirmation: none for the text itself. Future implementation cohorts must supply their own behavioral proof.

## Proposed work

### Reconcile automatic Prewalk with the plain-language contract

- Status: proposed and blocked on intended behavior.
- Effort: `S` if either the config or one assertion is wrong. `M` if automatic rearming needs a new public contract.
- Evidence: the full suite has one failure because `.pi/fabric.json` sets `prewalk.alwaysRearm: true` while `.pi/tests/skill-system.test.ts` rejects automatic handoff for ordinary prompts.
- Dependencies: user decision on whether automatic Prewalk is desired.
- Acceptance if approved:
  - Config, README, policy, and test describe one behavior.
  - The focused contract demonstrates the intended automatic or non-automatic boundary.
  - The full local suite exits 0.
- Risks: changing config affects the next session and may alter model handoff behavior.
- Live confirmation: `/reload` or a new session must confirm the selected behavior.

### Smoke-test `/init` in a representative target project

- Status: proposed.
- Effort: `M` because it needs a separate trusted Git root, project-local writes, context review, and cleanup or retention decisions.
- Evidence: Pi Core's static tests prove prompt structure, not generated-context quality in another project.
- Dependencies: a user-selected target and authorization for that project's context paths.
- Acceptance if approved:
  - The target receives concise local policy and accurate detailed context.
  - Graph, memory, and MCP limits are source-checked.
  - No Pi Core tree or target secrets are copied into context.
- Risks: cross-repository scope and generated files can disturb another worktree.
- Live confirmation: run and review one target-project session.

### Resolve the doctor package-identity warning

- Status: proposed.
- Effort: `S` if local source registration should satisfy the expected identity. `M` if package discovery must change.
- Evidence: the normal doctor exits 0 but warns that `ultra-fabric>=0.31.1-ultra.1` is not reported by `pi list`. The current session still exposes Fabric.
- Dependencies: inspect Pi package metadata and decide whether source registration or npm identity is authoritative.
- Acceptance if approved:
  - `doctor --strict` exits 0 without hiding a missing runtime.
  - The documented requirement matches what `pi list` can prove.
- Risks: weakening the check could mask a missing package. Package changes require explicit authorization.
- Live confirmation: restart or open a new Pi session after any package change.

### Make graph refresh deterministic

- Status: proposed.
- Effort: `M` because refresh affects MCP state, stale-node handling, relationship fallback, and verification.
- Evidence: the exact index is healthy for `find_code`, no watcher is active, and relationship queries returned zero for source-proven edges.
- Dependencies: supported CodeGraphContext watcher or reindex behavior and explicit authority for graph-state changes.
- Acceptance if approved:
  - A bounded source edit and deletion become visible through a documented refresh probe.
  - Known call and import edges either resolve or trigger a clear source fallback.
  - No broad ancestor index is duplicated or deleted silently.
- Risks: watchers can hang and index mutation can affect other sessions.
- Live confirmation: observe one bounded refresh against the exact repository index.

## Blockers and risks

- Local full suite: 362 tests, 361 pass, one fail on automatic Prewalk contract drift.
- The worktree contains many unrelated modified and untracked paths. Future commits must remain path-scoped.
- The CodeGraphContext index has no watcher and relationship queries under-report source-proven edges.
- MCP registration and Hindsight configuration do not prove live server health.

## Completed outcomes

- Natural-language `/init`, concise `AGENTS.md`, and the four detailed context files are present at HEAD.
- The abandoned workday prompt and test, `.pi/corpus`, and the research-enforcement extension are absent.
- The effective MCP registry has CodeGraphContext and no duplicate Project Intelligence server.
- `workspace-policy` is the only maintained project extension.

## Deferred or out of scope

- Do not add a global drift synchronizer until repeated real drift justifies it.
- Do not change Hindsight, MCP, global packages, graph watchers, dependencies, or remote services as part of initialization.
- External inspiration-clone or graph cleanup belongs to a separately scoped, evidence-based operation. Nothing was deleted during this initialization.
