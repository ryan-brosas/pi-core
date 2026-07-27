# AGENTS.md — Pi Core Operating Contract

> Project policy for agents working in this Pi configuration, extension, prompt, skill, workflow, and artifact repository.

## Project Profile

| Item | Value |
|---|---|
| Project | Pi Core |
| Canonical checkout | `/home/ryanj/work/projects/pi-core` |
| Primary branch | `main` |
| Runtime | Node.js with `--experimental-strip-types` |
| Package manager | None; do not invent install commands or lockfiles |
| Core verification | `node --experimental-strip-types --test .pi/tests/*.test.ts` |

---

## RULE 0 — USER AUTHORITY

The user's latest explicit instruction controls project intent and overrides defaults in this file. The user owns scope, priorities, trade-offs, and desired outcomes.

System, developer, platform-safety, privacy, and legal constraints remain higher authority. Everything below is a **project default**, not a mechanism for overruling an explicit user choice.

The user may explicitly replace or waive a project gate for a named scope. Language such as “proceed destructively for this refactor,” “skip the confirmation ceremony,” or “replace this workflow wholesale” is an explicit replacement, not ordinary implementation permission. Once a gate is explicitly replaced, do not reassert it, demand the waived sequence, or ask the user to repeat the decision. Reconfirm only if the requested scope materially expands.

Analysis and planning remain read-only unless the user requests implementation or mutation.

---

## Default Safety Boundaries

These defaults apply until the user explicitly replaces them for the requested scope.

### Deletion and destructive actions

- Do not delete, move, rename, empty, or discard maintained files without written user authorization covering that scope.
- Treat irreversible Git/filesystem actions and remote publication as destructive.
- By default, show the exact command, cwd, branch/HEAD, affected paths, effect, rollback limits, and status; obtain two confirmations separated by a refreshed preflight; then audit execution.
- A scope-level destructive authorization may replace that ceremony under Rule 0. Execute only inside the authorized scope and report exact affected paths afterward.
- Prefer bounded edits when destructive replacement is not part of the user’s request.

### Concurrent and unrelated work

- Preserve unrelated and runtime-managed changes. Never stash, reset, restore, rebase away, stage, commit, or clean them up.
- Record relevant path status and inspect current contents before editing.
- If an owned path changes concurrently after inspection, stop that edit, preserve both versions, and report the overlap.
- Unrelated dirty files are not a reason to stop work.

### Git and external effects

- Do not switch branches, create worktrees, commit, merge, rebase, push, deploy, publish, or mutate remotes unless the user requests that action.
- Stage only reviewed owned paths; never use broad staging in a mixed worktree.
- Before claiming work exists on a branch, verify the absolute checkout, branch, HEAD, and status.

---

## Editing Discipline

- Read current source and nearby contracts before editing.
- Prefer exact edits; use a whole-file rewrite only when the requested responsibility itself is being replaced.
- Inspect the diff after each meaningful mutation.
- Do not create backup, `*_v2`, duplicate, or speculative files.
- Identify authoritative generators before touching generated output; change the source and review regenerated output.
- Treat `.pi/fabric/mesh/**`, `.pi/state/**`, `.pi/hindsight/**`, caches, locks, MCP state, and similar paths as runtime-managed unless explicitly targeted.
- `.pi/fabric.json` is configuration but may also be changed by Fabric settings; inspect it before editing.

Legacy version-1 and version-2 `tasks.json` files remain readable through `.pi/scripts/task-graph.ts` for historical compatibility. They are not the default execution model.

---

## External Evidence and Reuse

> Good ideas do not need paperwork. Useful behavior still needs proof.

When learning from code, skills, prompts, workflows, or exemplars:

1. Start from the target scenario and observable outcome.
2. Inspect the useful behavior, tests, trust boundaries, and failure limits.
3. Extract the invariant, decision rule, recipe, and failure boundary—not incidental prose or architecture.
4. Rewrite it independently in the smallest project-native form.
5. Verify target behavior proportionately.
6. Promote only after repeated value is observed.

Independently rewritten ideas and patterns require no license or provenance ceremony. Do not require source pins, hashes, retained notices, or legal review merely because an external example informed the reasoning.

Only when copying or distributing upstream files or substantial expressive material: identify the exact source, check applicable terms, retain required notices, and verify source or byte integrity.

Use `writing-skills` for skill changes and `complex-pattern-adoption` for external reuse. A polished first result is candidate evidence, not proof of a reusable workflow.

---

## Research and Dependencies

Evidence priority:

1. current local source, tests, and configuration;
2. relevant automatically recalled project context;
3. official versioned documentation and specifications;
4. maintained upstream source and tests;
5. maintainer examples;
6. dated community material with explicit caveats.

A configured code graph is an optional locator after an exact-repository known-symbol health probe; verify every hit against source and fall back to `pi.read`, `pi.grep`, and `pi.find` when unhealthy. `.pi/corpus/` contains curated exemplars, not current-code truth.

Do not add or upgrade dependencies without explicit user approval and source-backed justification. Pi Core has no package manifest or lockfile.

---

## Emergent Execution

The user prompts for an outcome. The agent chooses and executes the workflow.

```text
plain-language request → inspect → change → prove → report
```

This is a behavior loop, not a sequence of user-operated phases. Ordinary work requires no lifecycle classification, command chain, task graph, artifact slug, formal plan, or prescribed agent topology.

### Full Fabric code mode

Pi Fabric owns core tool execution. Use one type-checked `fabric_exec` program for dependent inspection, edits, tests, branching, loops, and parallel calls. Inside that program use `pi.*` for core tools, known provider proxies for MCP/memory/state/schema, and `tools.*` only for discovery or computed refs. Keep intermediate results in the sandbox and return only the compact result needed by the parent context.

Load the `fabric-exec` reference before the first Fabric call or after an argument-shape error.

Apply a `fullCodeMode` change in `.pi/fabric.json` as the task's final mutation, then run `/reload` or start a new session before expecting the new tool surface; the live registry switches at that boundary, not mid-task.

### Agent choice

The agent chooses the smallest useful topology from observed task shape:

- **Zero children:** default when Main can inspect, implement, and verify coherently in one program.
- **One child:** use for an isolated specialist judgment, fresh-context implementation, or independent review that has clear value.
- **Parallel children:** use only for genuinely independent work; join results in the same program and verify them at the parent boundary.
- **Advanced Fabric patterns:** councils, RLM, Schema, actors, supervisors, and swarms are user-invoked or explicitly requested, not automatically imposed.

Do not predeclare Plan → Implement → Review pipelines for ordinary tasks. Let code, evidence, and failures reveal the useful workflow.

### Learning before promotion

- **First run:** brute force the outcome safely and measure time, turns, failures, rework, and proof.
- **Second run:** compare with the first, prune accidental steps, and retain only repeated decision rules.
- **Third run:** pressure-test the stable recipe. Promote it to a skill only if it now prevents recurring mistakes or materially improves throughput or quality.

Best practices that apply across tasks belong in focused skills. One-off execution detail belongs in the target code or chat receipt. A recurring event-driven responsibility may justify a Fabric actor; finite fan-out may justify a user-invoked Fabric workflow. Do not turn every successful run into infrastructure.

### Planning and durable state

Plan inline only when material coupling, sequencing, rollback, or an unresolved boundary requires it. Persist a plan or coordination state only when the user requests it or work genuinely must survive sessions or collaborators. Prefer Fabric’s native run/mesh/state facilities for live coordination; do not make repository task graphs the ambient scheduler.

Automatic Hindsight retain handles ordinary durable session learning. Use explicit retention only for raw, high-value facts that must persist immediately.

---

## Verification — Evidence Before Claims

Run the narrowest relevant proof first, then broaden for a named integration or consequence.

```bash
node --experimental-strip-types --test --test-name-pattern="<pattern>" .pi/tests/*.test.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
git diff --check -- <owned-paths>
git status --short --branch
```

For existing historical task graphs, compatibility validation remains available but is not a universal completion gate:

```bash
node --experimental-strip-types .pi/scripts/task-graph.ts validate <path-to-tasks.json>
```

Before reporting completion:

1. inspect every owned diff;
2. confirm unrelated/runtime work was not altered;
3. run applicable current verification and inspect exit status/output;
4. report checkout, branch, HEAD, status, changed paths, and remaining risks;
5. do not claim commit, merge, push, deployment, or publication unless it actually occurred.

A child result is evidence to inspect, never completion proof by itself.

---

## Stop Conditions

Stop only the affected action when:

- a required higher-authority constraint blocks it;
- desired behavior or a consequential trade-off remains genuinely ambiguous;
- an owned path changes concurrently;
- generated-file ownership is unknown;
- verification is contradictory or cannot establish the requested claim;
- requested scope expands beyond the user’s authorization.

Do not stop for ceremony the user explicitly replaced, unrelated dirty files, or the absence of a lifecycle artifact.
