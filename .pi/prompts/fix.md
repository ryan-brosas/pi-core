---
description: Debug and fix a bug or failing test
argument-hint: "<description of bug or error>"
---

# Fix: $ARGUMENTS

Systematically debug and fix the reported issue.

## Fabric Agent Routing

Use `agents.run({...})` inside `fabric_exec` only when delegation saves more context or time than it costs. Direct parent work is the default; there are no named project agent profiles.

- Encode the task role, exact goal, context, non-goals, output contract, stop conditions, approval constraints, and verification in `task`.
- Supply an explicit `tools` allowlist. Local discovery, planning, and review default to `["read", "grep", "find", "ls"]`. External research adds only the required configured network tools; add mutation tools only for approved implementation work.
- Await one foreground `agents.run` when the next decision depends on its result.
- For genuinely independent questions, issue at most three `agents.run` calls in one `Promise.all`; process overflow in sequential shards.
- For small read-only discovery or research, prefer `model: "openai-codex/gpt-5.6-luna"` with `thinking: "medium"` when an explicit override is useful.
- The parent resolves placeholders, inspects child output and changes, synthesizes results, and runs verification itself.
## Load Skills

```typescript
read(".pi/skills/root-cause-tracing/SKILL.md");
read(".pi/skills/verification-before-completion/SKILL.md");
```

## Process

### Phase 1: Reproduce

```bash
# Reproduce the issue with the exact steps or command
```

### Phase 2: Isolate

- Search for the error message or symptom in the codebase
- Trace the execution path to find the root cause
- Read the 2-4 most relevant files
- Distinguish symptom from root cause
- If the execution path crosses subsystems or remains ambiguous after the first search, run one foreground read-only local-discovery task with the exact symptom, paths already checked, and required evidence

### Phase 3: Fix

- Apply the minimal fix for the root cause
- Do not add speculative guards, tolerant readers, or defensive copies
- Prefer making the bad state impossible over handling all bad states

### Phase 4: Verify

```bash
npm run typecheck
npm run lint
npm test            # or vitest relevant test
```

If verification fails twice on the same approach, escalate with learnings. For a multi-file, security-sensitive, or regression-prone fix, run one foreground read-only Fabric review with the bug requirements, exact changed files, and verification output; then validate its findings yourself.

## Output

Report:
1. Root cause (with file:line)
2. Fix applied
3. Verification results
4. What else was considered and rejected
