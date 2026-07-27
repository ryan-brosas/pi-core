---
description: Repair or refresh project-local Pi context
argument-hint: "[--refresh] [--deep] [--context|--user|--all]"
---

# Init: $ARGUMENTS

Initialize or reconcile project policy and context. Ordinary coding does not require this command; after initialization the user simply describes the desired outcome.

## Load authoritative sources

```typescript
const [policy, verification] = await Promise.all([
  pi.read("/home/ryanj/work/projects/pi-core/.pi/templates/agents-policy.md"),
  pi.read("/home/ryanj/work/projects/pi-core/.pi/skills/verification-before-completion/SKILL.md"),
]);
```

Load `brainstorming` only when the project’s intended outcome is materially unclear.

## Modes

- default: reconcile `AGENTS.md` and regenerate detected `.pi/tech-stack.md`;
- `--refresh`: repair an untracked target project and protect private project-local `.pi/` state;
- `--context`: create requested roadmap/state context;
- `--user`: create an on-demand user profile;
- `--all`: combine the requested outputs;
- `--deep`: permit bounded independent discovery only for unresolved policy facts.

Reject unknown flags.

## Execute

Use one `fabric_exec` program to inspect the exact Git root, existing policies, runtime/package manifests, CI, branch, generated/runtime paths, and executable verification commands. Include only facts verified from the target.

Before writing, show a compact preview of:

- universal policy defaults;
- project-detected facts;
- conflicts and proposed repairs;
- preserved custom content;
- unsupported facts omitted;
- exact paths that will be created or changed.

Merge existing `AGENTS.md` content rather than blindly replacing it. A new file should stay concise; never truncate preserved user rules to satisfy a line budget. `--refresh` must stop if `.pi` is already tracked and must not untrack it automatically.

Use zero children by default. With `--deep`, add read-only children only for genuinely independent evidence questions and join them before synthesis.

## Verify and report

Run the target’s discovered checks, inspect the exact diff, and report each created/merged/regenerated path. If Pi resources changed, tell the user to run `/reload` or start a new session. The next action is a plain-language prompt; no planning command is required.
