---
description: Debug and fix a bug or failing test
argument-hint: "<description of bug or error>"
---

# Fix: $ARGUMENTS

Systematically debug and fix the reported issue.

## Pi Subagent Routing

When this prompt says to spawn, delegate to, or use an agent, invoke the pi-subagents `Agent` tool; an agent name is not itself a tool. This is not Fabric agent orchestration.

- `Explore`: internal codebase discovery
- `scout`: external documentation and research
- `review`: correctness, security, and regression review
- `general`: small independent implementation
- `Plan`: architecture and executable planning
- Use a foreground call when the next step depends on the result. For independent parallel work, issue all calls together with `run_in_background: true`.
- Omit `model` and `thinking`; agent definitions and scoped-model settings own those choices.

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
- If the execution path crosses subsystems or remains ambiguous after the first search, call a foreground `Explore` subagent with the exact symptom, paths already checked, and required evidence

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

If verification fails twice on the same approach, escalate with learnings. For a multi-file, security-sensitive, or regression-prone fix, call a foreground `review` subagent with the bug requirements, exact changed files, and verification output; then validate its findings yourself.

## Output

Report:
1. Root cause (with file:line)
2. Fix applied
3. Verification results
4. What else was considered and rejected
