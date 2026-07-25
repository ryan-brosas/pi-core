---
description: Run garbage collection — Fallow analysis, quality grading, and cleanup PRs
---

# Garbage Collection

Run structural analysis, update quality grades, and open cleanup PRs.

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
read(".pi/skills/fallow/SKILL.md");
read(".pi/skills/verification-before-completion/SKILL.md");
```

## Phase 1: Run Fallow Scan

```bash
npx fallow --format json --quiet
```

Extract:
- Dead code (unused exports, files, dependencies)
- Code duplication (clone groups)
- Complexity hotspots (cyclomatic complexity)
- Architecture boundary violations

## Phase 2: Read Existing Quality Grades

Read `.pi/QUALITY.md` if it exists. Compare with current Fallow findings.

## Phase 3: Grade Each Domain

Run the structural check:

```bash
.pi/extensions/structural-check.sh
```

Update `.pi/QUALITY.md` with grades per domain:

| Domain | Source | Grade |
|---|---|---|
| Plugins | `.pi/extensions/*.ts` | A–D |
| Commands | `.pi/prompts/*.md` | A–D |
| Skills | `.pi/skills/` | A–D |
| Docs | `.pi/artifacts/MEMORY.md` | A–D |

## Phase 4: Open Cleanup PRs (if findings warrant)

For each P0/P1 finding from Fallow:

```typescript
Agent({
  subagent_type: "general",
  description: "Fix [finding type]",
  prompt: `Fix only this Fallow finding: [detail]. Stay within [exact files]. Run verification and report the worktree branch/commit, changed files, and command output.`,
  run_in_background: true,
  isolation: "worktree",
});
```

The parent partitions independent P0/P1 findings into ordered, non-overlapping waves of at most three. Issue only the current wave together, let smart join return it, then the parent inspects each isolated branch/commit and reruns verification before continuing with later sequential shards. Same-file or dependent findings stay foreground and sequential. Children must not switch the shared workspace branch or open PRs concurrently.

## Phase 5: Report

Output:

1. **Quality Grades:** Per-domain status
2. **Issues Found:** Count by severity
3. **Cleanup PRs:** Opened/not needed
4. **Recommendations:** Suggested improvements for next cycle

## Related Commands

| Need | Command |
|---|---|
| Full verification | `/verify all --full` |
| Architecture audit | `/audit` |
