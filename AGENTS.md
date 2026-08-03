# Pi Core

Pi Core is the shared operating layer for Pi prompts, skills, extensions, policy, and verification.
Detailed context lives in `.pi/user.md`, `.pi/project.md`, `.pi/roadmap.md`, and `.pi/tech-stack.md`.
Read only the files relevant to the task.

## Authority

The user's latest explicit instruction controls scope and may replace project defaults.
Higher-authority constraints remain. Do not reassert a replaced gate unless scope expands.
Analysis is read-only until the user requests a mutation.

Preserve unrelated and concurrent work. A named request is sufficient authorization for that scope. Do not ask again unless the target or effect changes.

## Project invariants

- Canonical checkout: `/home/ryanj/work/projects/pi-core` on `main`.
- Policy sentinel: `PI_CORE_WORKSPACE_POLICY_V1`.
- Runtime enforcement requires the primary checkout on `main`. Branch and worktree creation or entry are disabled.
- Runtime: Node.js with `--experimental-strip-types`.
- Package manager: none. Do not invent install commands, manifests, or lockfiles.
- Core verification: `node --experimental-strip-types --test .pi/tests/*.test.ts`.

## Working contract

The user describes an outcome. The agent chooses the execution workflow, then follows `inspect -> change -> prove -> report`.

- Use one type-checked program through `fabric_exec` with `pi.*` for dependent repository work. Keep intermediate data in the sandbox and return compact evidence.
- Prefer Main. Do not start an agent, actor, supervisor, council, or other advanced Fabric workflow without one-line user confirmation unless the request names it.
- Change `fullCodeMode` only as the final mutation. Its live registry and tool surface change after `/reload` or a new session, never mid-task.
- For meaningful work, state the goal and acceptance checks. Plan only when coupling, order, rollback, or live deployment makes a plan useful.
- Check `sources/` early. When upstream source is needed, clone it there and inspect it locally.
- For non-trivial code changes in this indexed repository, use CodeGraphContext relationships before the first edit.
  Treat the graph as a locator, verify hits in current source, and fall back to `pi.read`, `pi.grep`, and `pi.find` when stale or broken.

## Safety and editing

- Record status and owned paths before editing. Re-read an owned path before changing it and stop that edit on concurrent drift.
- Preserve unrelated work. Never stash, reset, restore, rebase, clean, or broadly stage a mixed worktree.
- Before a destructive or hard-to-reverse action, show the operation, context, exact targets, effect, rollback limit, and status.
- Do not commit, push, deploy, publish, change dependencies, or mutate remotes unless the user requests it.
- Edit authoritative source, not generated output. Do not create backups, duplicates, or speculative files.
- Treat `.pi/fabric/mesh/**`, `.pi/state/**`, `.pi/hindsight/**`, caches, locks, and MCP state as runtime-managed unless explicitly targeted.

## Research and reuse

Use local source and tests first, then official versioned docs and maintained upstream source.
For precedent work, autonomously search the current project and reviewed project code before `inspo`.
Source-qualify candidates and select the smallest coherent slice. A graph edge, README, filename, or summary is a locator, not proof.

Preserve working behavior as the contract.
Interrupt only for a material architecture, dependency, scope, compatibility, terms, or ownership conflict.
Independently rewritten ideas need no license or provenance ceremony. Exact copied material keeps applicable terms and notices.

## Verification

Main self-verifies each mutation. Inspect the owned diff, test observable success and controlled failure, run the narrowest applicable checks, then inspect status.

```bash
node --experimental-strip-types .pi/scripts/doctor.ts
node --experimental-strip-types --test --test-name-pattern="<pattern>" .pi/tests/*.test.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
git diff --check -- <owned-paths>
git status --short --branch
```

Report the outcome, changed paths, observed verification, and remaining risk. Never claim a commit, deployment, publication, or working feature without direct evidence.
