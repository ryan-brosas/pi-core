---
description: Debug and fix a bug or failing test
argument-hint: "<description of bug or error>"
---

# Fix: $ARGUMENTS

Systematically debug and fix the reported issue.

## Load Skills

```typescript
read(".pi/skills/root-cause-tracing/SKILL.md");
read(".pi/skills/test-driven-development/SKILL.md");
read(".pi/skills/verification-before-completion/SKILL.md");
```

## Process

### Phase 1: Reproduce

Reproduce the issue with the exact steps or command. For every behavior-changing bug fix, add the smallest failing observable regression test and confirm it fails for the reported reason before editing production code. Documentation-only or pure-configuration fixes use an exact failing executable check instead of inventing a runtime test.

### Phase 2: Isolate

- Search for the error message or symptom in the codebase
- Trace the execution path to find the root cause
- Read the 2-4 most relevant files
- Distinguish symptom from root cause
- A configured code graph may supplement the impact map only after a known target symbol resolves in the exact repository; otherwise use `read`, `grep`, and `find`
- A project corpus may supply a curated implementation exemplar, but it does not trace the current failure path
- If the execution path crosses subsystems or remains ambiguous after direct source search, run one foreground read-only local-discovery task with the exact symptom, paths already checked, and required evidence

### Phase 3: Fix

- Apply the minimal fix for the root cause
- Do not add speculative guards, tolerant readers, or defensive copies
- Prefer making the bad state impossible over handling all bad states

### Phase 4: Verify

Discover verification commands from `AGENTS.md`, repository manifests, and CI. Never invent npm, pnpm, Python, Cargo, or other package-manager commands merely because they are common.

1. Re-run the exact reproduction and confirm it now passes.
2. Run the narrowest relevant test or static check.
3. Broaden to the repository-supported retained suite when the change can affect shared behavior.
4. Inspect the complete worktree diff, including untracked files, before reporting completion.

If verification fails twice on the same approach, escalate with learnings. For a multi-file, security-sensitive, or regression-prone fix, run one foreground read-only Fabric review with the bug requirements, exact changed files, and verification output; then validate its findings yourself.

## Output

Report:
1. Root cause (with file:line)
2. Fix applied
3. Verification results
4. What else was considered and rejected
