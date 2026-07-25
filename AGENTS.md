# AGENTS.md — Pi Core Operating Contract

> Guidelines for AI coding agents working in this Pi configuration, extension, prompt, skill, workflow, and artifact repository.
>
> **Template note:** When adapting this file to another repository, update the Project Profile and verification commands. Keep the authority, deletion, destructive-action, concurrent-work, and evidence gates unless the user explicitly replaces them.

---

## Project Profile

| Item | Value |
|---|---|
| Project | Pi Core |
| Canonical checkout | `/home/ryan/repo/pi-core` |
| Primary branch | `main` |
| Runtime | Node.js with `--experimental-strip-types` |
| Package manager | None currently; do not invent install commands or lockfiles |
| Active-work root | `.pi/artifacts/` |
| Canonical task graph | `.pi/artifacts/<slug>/tasks.json` |
| Core verification | `node --experimental-strip-types --test .pi/tests/*.test.ts` |

---

## RULE 0 — USER AUTHORITY

The user's latest explicit instruction controls project intent and overrides defaults in this file. The user is in charge of scope, priorities, trade-offs, and desired outcomes.

System, developer, platform-safety, privacy, and legal constraints remain higher priority. If an instruction cannot be followed for one of those reasons, state the exact conflict and provide the closest safe alternative.

Permission to implement does **not** automatically grant permission to delete files, disturb concurrent work, run destructive commands, switch branches, create worktrees, commit, merge, push, deploy, or change the active artifact. Those actions use the explicit approval gates below.

Analysis, review, research, and planning requests are read-only unless the user explicitly asks for implementation or file changes.

---

## RULE 1 — NO FILE DELETION WITHOUT WRITTEN PERMISSION

**Never delete a file or directory without clear, written user permission naming the affected path.** This includes files created by the agent during the current session.

Deletion includes:

- removing a file or directory;
- renaming or moving it away from its current path;
- truncating it to empty;
- replacing the whole file with an unrelated implementation;
- regenerating output in a way that discards hand-maintained content.

Words such as “cleanup,” “consolidate,” “unused,” “legacy,” “temporary,” “generated,” “migration,” or “simplify” are **not** deletion permission.

Before requesting deletion approval, provide:

1. the exact path list;
2. why each path is believed removable;
3. references and dependencies checked;
4. what behavior or history will disappear;
5. the non-destructive alternative.

If the path list changes, approval must be requested again. Never bundle unapproved deletion into an implementation or refactor commit.

---

## Irreversible Git and Filesystem Actions — TWO-CONFIRMATION GATE

Treat any operation that can discard, overwrite, rewrite, or remotely publish work as destructive. Examples include:

- `git reset --hard`, `git clean -fd`, destructive checkout/restore, branch deletion, history rewrite, or force-push;
- `rm -rf`, recursive removal, overwrite redirects, destructive migrations, and bulk replacement;
- any command whose complete effects are uncertain.

Do not run one merely because it appears safe.

### Required protocol

1. **Preflight:** show the exact command, working directory, branch/HEAD, affected paths, expected effect, rollback limits, and current `git status`.
2. **First confirmation:** the user must provide written approval for that exact command and scope while acknowledging the irreversible effect.
3. **Refresh:** rerun the read-only preflight. If anything drifted, disclose it and restart the protocol.
4. **Second confirmation:** repeat the exact command and affected paths; wait for immediate written confirmation.
5. **Execute exactly:** do not broaden, rewrite, chain, or substitute the approved command.
6. **Audit:** report UTC execution time, exact authorizing user text, command, cwd, branch/HEAD, affected paths, exit code, and post-operation status.

If the audit record is absent, treat the operation as not authorized. Prefer read-only inspection, a new non-destructive copy, or an isolated worktree. Do not use `git stash` on concurrent work.

---

## Concurrent and Unrelated Work — PRESERVE IT

This repository may be changed by multiple agents and processes at the same time. Unexpected modifications are normal.

- Never stash, revert, reset, restore, overwrite, rebase away, stage, commit, or “clean up” work you do not explicitly own.
- Do not stop merely to ask what to do with unrelated changes. Continue using only the paths required by the current task.
- Before editing, record the relevant path status and inspect its current contents. Before finishing, verify that only owned paths changed because of your work.
- If another process changes an owned path while you are editing, stop that edit, preserve both versions, and report the overlap. Do not choose a winner silently.
- Never switch a dirty checkout just to satisfy a workflow.
- If an unauthorized mutation occurs, stop immediately, report the exact branch/worktree/commit/path state, and wait for the user's recovery choice. Do not improvise additional recovery.

Treat concurrent changes with the same care as your own work, but never claim or commit them as yours.

---

## Git Branch and Integration Policy

- `main` is the canonical integration branch. Do not use or document `master` as the primary branch.
- Feature branches and worktrees are isolation mechanisms, not alternate sources of truth.
- Do not switch branches, create a worktree, commit, merge, rebase, push, force-push, delete a branch, or mutate a remote without explicit user approval for that action.
- Implementation approval alone is not approval to commit or integrate.
- Before requesting integration approval, report:
  - absolute source worktree and branch;
  - target branch;
  - exact commits;
  - changed paths and deletions;
  - verification evidence;
  - known conflicts and rollback.
- Stage only reviewed, owned paths. Never use broad staging in a mixed worktree.
- Keep implementation, cleanup, generated output, runtime state, artifact-pointer changes, and unrelated work in separate commits.
- Before claiming work is present or restored, verify it in the user's actual checkout and report the absolute path, branch, HEAD, and status.
- A legacy remote branch, if one exists, is owner-managed. Never synchronize or push it without explicit approval.

---

## Code and File Editing Discipline

### Manual, targeted edits

- Read the relevant file and nearby contracts before editing.
- Prefer exact, bounded edits to existing files.
- Do not use ad hoc scripts, broad regex replacements, codemods, format-all operations, or repository-wide mutation commands unless the user explicitly approves the exact scope.
- A canonical project generator is the only normal exception; edit its source, run it deliberately, and review every generated change.
- Inspect the resulting diff immediately after each meaningful edit.

### No file proliferation

Revise the natural existing file whenever possible. Do not create `*_v2`, `*_improved`, `*_new`, backup copies, speculative helpers, duplicate documentation, or repository-local scratch files.

A new file is justified only when it has a distinct required responsibility, is a canonical lifecycle artifact, or the user explicitly requests it. New files are still protected by the no-deletion rule.

### Compatibility

Compatibility is contract-driven, not automatic. Preserve documented compatibility—especially version-1 `tasks.json` readability. Do not add speculative shims, deprecated wrappers, or parallel implementations without a concrete requirement.

---

## Generated and Runtime-Managed Files

- Identify the authoritative source and generator before touching generated output.
- Modify the source, run the canonical generator, and review source/output together.
- Never hand-edit generated output unless the user explicitly requests an emergency exception.
- Generated does not mean disposable; deleting generated output still requires written permission.
- Treat `.pi/fabric/mesh/**`, `.pi/state/session-summary.md`, lock directories, caches, and similar files as runtime-managed unless the task explicitly targets them.
- `.pi/fabric.json` is configuration, but runtime tools may change it. Inspect provenance and never absorb its changes incidentally.
- Do not stage runtime state alongside implementation.
- If ownership or the generator is unknown, stop and report the gap rather than guessing.

---

## Research and Third-Party Dependencies

Use this evidence order:

1. local code, tests, configuration, active artifacts, and automatically recalled Hindsight project context;
2. for a material memory gap, topic-bounded `hindsight_recall`; use `hindsight_reflect` only when synthesis across memories is required;
3. official documentation, specifications, and release notes for the exact version;
4. maintained upstream source and tests;
5. maintainer examples;
6. dated community material with explicit caveats.

Rules:

- Cite non-trivial external claims and record version/date.
- When documentation and source disagree, report the contradiction.
- Mark assumptions and confidence; do not present inference as fact.
- Do not add or upgrade dependencies without explicit approval and source-backed justification.
- Pi Core currently has no package manifest or lockfile. Do not introduce package-manager commands, manifests, or lockfiles unless the task requires and the user approves them.
- Stop researching when the implementation question is answered with medium-or-higher confidence; do not collect context without a decision it supports.

---

## Graph-Based Development Lifecycle

Resolve `.pi/artifacts/.active` before feature-specific execution.

Each active slug uses four canonical files:

| File | Purpose |
|---|---|
| `spec.md` | Requirements, scope, and success criteria |
| `plan.md` | Human-readable execution details and derived waves |
| `tasks.json` | Sole authoritative persisted task DAG |
| `progress.md` | Attempts, blockers, review, and verification evidence |

Additional rules:

- Durable cross-feature context belongs in project Hindsight. Automatic Hindsight retain captures ordinary session deltas; use `hindsight_retain` only for raw, high-value facts or decisions that require immediate persistence.
- `tasks.json`, not prose waves, determines readiness, dependencies, conflicts, and task state.
- Validate the graph before scheduling. Execute only ready, dependency-satisfied, conflict-free nodes.
- Recompute the frontier after each state transition or integration.
- Passed version-2 nodes require current-attempt evidence. Failures block or stale descendants; ancestors reopen only with attributed cause or changed output.
- Cross-artifact frontier reporting is read-only. It must never change `.active`, select a slug, or dispatch work.
- Execution requires an explicitly selected active slug. Never switch `.active` implicitly.
- Read-only analysis must not mutate lifecycle artifacts merely to record that analysis.

---

## Fabric Agent Routing

When delegation is useful, use Pi Fabric `agents.run({...})` inside `fabric_exec`. Project-specific named agent profiles do not exist. Encode the role, complete task contract, and explicit tool boundary in each call.

| Need | Fabric task shape | Default tools |
|---|---|---|
| Local discovery | Read-only codebase mapping | `read`, `grep`, `find`, `ls` |
| External documentation/source research | Read-only cited research | `read`, `grep`, `find`, `ls`; retain only required extensions |
| Correctness/security/regression review | Read-only scoped review | `read`, `grep`, `find`, `ls` |
| Small isolated implementation | Surgical bounded edit | inspection tools plus only required `bash`, `edit`, `write` |
| Architecture and executable planning | Read-only advisory blueprint | `read`, `grep`, `find`, `ls` |
| Larger resolved implementation | Substantial bounded edit | explicit task-specific allowlist |
| Visual/UI analysis | Read-only visual evidence | explicit visual tools only |

- Prefer direct execution for clear, surgical work.
- Parent-provided task-relevant Hindsight context is the only memory context sent to Fabric children. If context is missing, children report the context gap to the parent instead of broadening memory access. Never include credentials, secrets, private conversation, or unrelated user data.
- Await one foreground `agents.run` when the next decision depends on the result.
- Run only genuinely independent, disjoint tasks concurrently using at most three `agents.run` calls in one `Promise.all`; process overflow in sequential shards.
- For small read-only discovery or research, prefer `openai-codex/gpt-5.6-luna` with `thinking: "medium"` when an explicit override is useful.
- Concurrent implementation requires isolated worktrees, explicit approval, and disjoint file ownership.
- Child agents may not schedule siblings, alter `.active`, own lifecycle state, integrate branches, commit, merge, push, or modify unrelated work unless the user separately approves that action.
- The parent must inspect child changes and rerun verification. A child result is evidence to check, not proof of completion.
---

## Verification — EVIDENCE BEFORE CLAIMS

Run the narrowest relevant check first, then broaden for integrated changes.

### Targeted tests

```bash
node --experimental-strip-types --test --test-name-pattern="<pattern>" .pi/tests/*.test.ts
```

### Full retained suite

```bash
node --experimental-strip-types --test .pi/tests/*.test.ts
```

### Validate every artifact graph

```bash
for f in .pi/artifacts/*/tasks.json; do
  node --experimental-strip-types .pi/scripts/task-graph.ts validate "$f"
done
```

### Prove cross-artifact reporting is read-only

```bash
before=$(sha256sum .pi/artifacts/.active)
node --experimental-strip-types .pi/scripts/task-graph.ts frontier --all .pi/artifacts >/dev/null
test "$before" = "$(sha256sum .pi/artifacts/.active)"
```

### Diff and checkout evidence

```bash
git diff --check -- <owned-paths>
git status --short --branch
```

Report each command, exit status, and observed result. Never claim “done,” “fixed,” “restored,” “present on main,” or “passing” from expectation alone. Redact secrets and sensitive output from evidence.

Do not advertise a tool or gate that is unavailable or known to check obsolete paths.

---

## Stop Conditions

Stop the affected action and ask for direction when:

- required approval is absent or ambiguous;
- deletion or destructive scope changes;
- an owned file has concurrent overlapping edits;
- the active slug changes unexpectedly;
- generated-file ownership is unknown;
- verification cannot run or yields contradictory evidence;
- implementation requires an unapproved dependency, new file, branch operation, commit, merge, push, or deployment.

Unrelated dirty files alone are **not** a stop condition. Leave them untouched and continue within owned paths.

---

## Session Completion

Before reporting completion:

1. inspect the diff for every owned path;
2. confirm no file was deleted without written permission;
3. confirm unrelated/runtime changes were not staged or altered;
4. run and report the relevant verification commands;
5. report absolute checkout path, branch, HEAD, and status;
6. list remaining risks or blocked checks;
7. commit, merge, push, or update task state only when explicitly authorized.
