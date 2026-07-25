---
description: Run garbage collection — Fallow analysis, quality grading, and cleanup PRs
---

# Garbage Collection

Run structural analysis, update quality grades, and open cleanup PRs.

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
const fixes = await Promise.all(currentWave.map((finding) => agents.run({
  name: `gc-fix-${finding.id}`,
  task: buildGcFixTask(finding),
  tools: ["read", "grep", "find", "ls", "bash", "edit", "write"],
  worktree: true,
})));
return fixes.map((result) => result.text);
```

The parent partitions independent P0/P1 findings into ordered, non-overlapping waves of at most three. After explicit worktree approval, issue only the current wave with `Promise.all`; then the parent inspects each isolated branch/commit and reruns verification before continuing with later sequential shards. Same-file or dependent findings stay foreground and sequential. Children must not switch the shared workspace branch or open PRs concurrently.

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
