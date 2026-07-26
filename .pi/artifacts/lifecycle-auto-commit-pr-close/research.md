# Research: Phase Auto-Commits and `/pr`/`/close` Lifecycle

- **Date:** 2026-07-26
- **Execution mode:** Workflow (three-angle research, dependent cross-check, parent source verification)
- **Topic:** Add safe automatic commits at lifecycle boundaries and new `/pr` and `/close` commands
- **Artifact routing:** Standalone report because active slug `engineering-discipline-enforcement-audit` has a different implementation boundary; `.active` was not changed
- **Environment checked:** Git 2.43.0; GitHub CLI 2.96.0

## Executive Summary

The feature is feasible, but it is a deliberate policy and runtime change—not just prompt wording. Pi discovers project prompt templates by filename, so `pr.md` and `close.md` would expose `/pr` and `/close`. Templates expand into model instructions, however; safe repeated Git mutation should be centralized in one dependency-free lifecycle helper and behavior-tested rather than duplicated across Markdown prompts.

Recommended lifecycle:

`/research` (sideways/optional) → `/create` → `/plan` (conditional) → `/ship <task-id>` → `/verify` → `/pr` → `/close`

A command invocation may become fresh, bounded authorization for **at most one local checkpoint commit** only after the repository policy explicitly says so. It must never be standing authorization for push, PR creation, merge, branch deletion, or unrelated work. No-op phases create no commit. `/close` closes only the selected lifecycle artifact. It must not close or merge a pull request; those terminal PR actions remain manual human operations.

**User decision (2026-07-26):** artifact closure is automated through `/close`; PR closure and PR merge are always performed manually by a human.

## Questions and Status

| Question | Status | Confidence |
|---|---|---|
| Can `/pr` and `/close` be added as Pi commands? | Answered: add project prompt templates; reload if needed | High |
| Where do phase commits fit today? | Answered: current `/ship` has approval-gated TDD/task commits; other phases do not commit | High |
| Can a commit preserve unrelated dirty/staged work? | Answered for tracked paths; new-file/index failure behavior needs focused tests | High/Medium |
| What should `/pr` do? | Answered: idempotent readiness, explicit push, create-or-reuse PR, report state | High |
| What should `/close` mean? | Answered: validate and close the selected artifact only; never close or merge a PR | High |
| Can command invocation replace per-action confirmation? | Partially answered: only through an explicit policy clarification and bounded scope | Medium |
| Did the duplicated `/ship` in the request mean `/plan` or `/verify`? | Unanswered product wording issue | Low |

## Verified Findings

1. **Current command model.** Pi loads trusted project templates from `.pi/prompts/*.md`; the filename becomes the slash command. The repository has research/create/plan/ship/verify templates but no `pr.md` or `close.md`. Local sources: Pi `docs/prompt-templates.md`; `.pi/prompts/`; `.pi/tests/skill-system.test.ts:32-54`.

2. **Current lifecycle and closure.** The canonical path is `/create → /plan → /ship → /verify`; `/research` is sideways. `/ship` already contains inline artifact closure and changes graph status/progress after user confirmation. Completed artifacts remain in place; `.active` is not cleared or deleted. Sources: `.pi/skills/development-lifecycle/SKILL.md:11-68,98-104`; `.pi/prompts/ship.md:201-222`; `.pi/artifacts/graph-based-development-workflow/{tasks.json,progress.md}`.

3. **Current policy conflicts with implicit auto-commit.** `AGENTS.md`, `.pi/templates/agents-policy.md:22-24`, `.pi/prompts/init.md:128-136`, and `.pi/prompts/ship.md:201-205` require fresh Git approval and reject standing authorization. The prior `/init` work intentionally removed an `Auto-commit` preference. The new behavior therefore needs an explicit distinction between a fresh command invocation and a persistent preference.

4. **Git exact-path behavior.** Installed Git 2.43 documents that ordinary `git commit` records the whole index. Supplying paths (`git commit --only -- <paths>`) disregards staged content for other paths, but listed files must already be known to Git. New files therefore need exact staging first. `git status --porcelain=v1 -z` is stable and includes untracked paths. Hooks may abort commits; the helper must preserve and report the resulting state rather than bypass hooks or auto-reset. [Git commit 2.43](https://git-scm.com/docs/git-commit/2.43.0), [Git status 2.43](https://git-scm.com/docs/git-status/2.43.0), [Git hooks 2.43](https://git-scm.com/docs/githooks/2.43.0).

5. **GitHub PR semantics.** `gh pr create` may prompt to push; even `--dry-run` may still push. A safe `/pr` must explicitly control push and then use `--head`. `gh pr list --state all --head ... --base ... --json ...` enables create-or-reuse behavior. `gh pr checks --required` exposes required checks and uses exit code 8 for pending checks. `gh pr view --json state,mergedAt,...` distinguishes merged from closed-unmerged. `gh pr close` closes without integration, while merge is a separate terminal action. These facts support read-only status reporting and a human handoff; `/close` must invoke neither operation. [create](https://cli.github.com/manual/gh_pr_create), [list](https://cli.github.com/manual/gh_pr_list), [view](https://cli.github.com/manual/gh_pr_view), [checks](https://cli.github.com/manual/gh_pr_checks), [merge](https://cli.github.com/manual/gh_pr_merge), [close](https://cli.github.com/manual/gh_pr_close), [GitHub closing guidance](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/closing-a-pull-request).

6. **Self-hash limitation.** A commit cannot contain its own final SHA. Replace the current “commit, then record hash in progress” expectation with commit trailers plus next-phase reconciliation, or accept a second metadata commit. The simpler contract is trailers (`Lifecycle-Phase`, `Artifact-Slug`, optional `Task-ID`) and recording the prior checkpoint during the next phase.

## Recommended Contract

### Phase Checkpoint Commit

Each mutating command declares an exact owned-path manifest, runs its phase-specific verification, and then:

1. Capture branch/HEAD and `git status --porcelain=v1 -z`; reject detached HEAD, merge/rebase/conflict state, owned-path drift, or ambiguous ownership.
2. If no owned path changed, report `commit: skipped (no changes)`; never use `--allow-empty`.
3. Stage only exact new owned files. Commit exact tracked paths with path-limited `--only`; never use `git add .`, `git add -A`, broad directories, or plain index-wide `git commit`.
4. Never include runtime state such as `.pi/fabric/**`, `.pi/hindsight/**`, `.pi/openai-server-compaction.json`, or `.pi/artifacts/verify.log`.
5. Run hooks normally; never add `--no-verify`. On failure, preserve state and stop.
6. Verify the new commit changed only the owned manifest and that unrelated staged state is unchanged.

Suggested boundaries:

| Command | Commit boundary |
|---|---|
| `/research` | The related `progress.md` append or standalone `research.md` only |
| `/create` | `.active`, `spec.md`, and version-2 `tasks.json` |
| `/plan` | `plan.md` and any intentional same-ID `tasks.json` refinement |
| `/ship <task-id>` | One passed task's exact implementation files plus permissible parent-owned lifecycle updates |
| `/verify` | Durable `progress.md` evidence only; exclude `verify.log` |
| `/pr` | Usually no local commit; no empty marker commit |
| `/close` | Final graph/progress artifact-closure record only; no PR close or merge |

Use `/ship <task-id>` as the default one-invocation/one-commit form. A broad `/ship` needs an explicit batch preview listing task IDs and maximum commit count.

### `/pr`

- Read-only preflight: branch/base/head, intended commits, current verification, remote, existing PR lookup, and exact planned commands.
- Reuse an open PR; return success for an already merged PR; stop on closed-unmerged until the user chooses reopen versus replacement.
- Separate permissions: `/pr` prepares/reports; `/pr --publish` is the explicit grant for one push plus create-or-reuse operation.
- Push explicitly, verify remote head, then call `gh pr create --head ... --base ...`; do not use `--dry-run` as a safety boundary.
- Do not merge, close, or delete branches.

### `/close`

- Means **artifact closure only**: validate and mark the exact selected lifecycle artifact complete.
- Require all graph tasks passed, current verification/review evidence, no blockers, and an exact selected slug. PR merge status is not an artifact-closure precondition.
- Create the final local artifact-closure checkpoint when durable artifact files changed. If the artifact is already closed, behave idempotently and create no local commit.
- Never invoke `gh pr close`, `gh pr merge`, an equivalent API, branch deletion, or any other terminal PR operation. Do not offer `/close --merge` or `/close --pr-close`.
- PR inspection may be read-only. Report the PR URL/state/checks and any unpublished closure commit, then hand off publication, PR closure, or merge to a human without claiming integration is complete.

## Decision Records

| Decision | Evidence / confidence | Alternatives | Contract impact / risk |
|---|---|---|---|
| Invocation is a bounded grant, not standing preference | Current policy plus user goal / Medium | Prompt every time; persistent auto mode | Requires policy/template/test clarification; scope drift must invalidate grant |
| Central helper, not copied shell snippets | Prompt templates are instructions; strict local enforcement research / High | Markdown only | Adds one script/test pair but provides deterministic ownership and postconditions |
| No-op means no commit | Git `--allow-empty` is optional; no lifecycle value / High | Empty phase markers | Avoids noisy history and false progress |
| `/close` is artifact completion only | Existing inline artifact close plus explicit user decision / High | Couple artifact closure to PR state | Keeps local lifecycle completion independent of repository integration |
| PR closure and merge are human-only | Explicit user decision plus GitHub terminal-action semantics / High | `/close --merge`; automated `gh pr close` | `/close` may report PR state but must never perform either action |
| `/pr` and `/close` are idempotent state machines | `gh pr list/view/checks` fields / High | Fire-and-forget CLI calls | `/pr` handles publication state; `/close` handles artifact state and read-only PR reporting |

## Smallest Coherent Implementation Surface

1. Add a dependency-free `.pi/scripts/lifecycle-git.ts` and behavior tests in `.pi/tests/lifecycle-git.test.ts`.
2. Add `.pi/prompts/pr.md` and `.pi/prompts/close.md`.
3. Wire checkpoint calls into `.pi/prompts/{research,create,plan,ship,verify}.md`.
4. Update `.pi/skills/development-lifecycle/SKILL.md` and `.pi/workflows/development-lifecycle-workflow.md`.
5. Clarify invocation-scoped authorization in `AGENTS.md`, `.pi/templates/agents-policy.md`, and `.pi/prompts/init.md`; update `.pi/tests/skill-system.test.ts`.
6. Keep `.pi/scripts/task-graph.ts` focused on graph state unless closure requires a new mechanically validated transition.

## Open Items

- Confirm the intended phase list behind the duplicated `/ship`.
- Decide whether auto-commit is the documented default with `--no-commit`, or requires `--commit`.
- Define the exact human-handoff output for an open PR (URL, head SHA, checks, and any unpublished artifact-closure commit); `/close` itself must not close or merge it.
- Focused tests must resolve new-file staging, hook failure, unrelated pre-staged content, filenames with special characters, concurrent owned-path drift, PR duplicates, and reruns after partial remote failure.

## Sources

Authoritative external sources were retrieved directly through Exa on 2026-07-26: Git 2.43 documentation; GitHub CLI manuals; GitHub pull-request guidance; and Pi upstream command/source references. Local authoritative evidence: `AGENTS.md`, Pi `docs/prompt-templates.md`, `.pi/prompts/`, `.pi/skills/development-lifecycle/SKILL.md`, `.pi/workflows/development-lifecycle-workflow.md`, `.pi/templates/agents-policy.md`, `.pi/tests/skill-system.test.ts`, and retained completed artifacts.