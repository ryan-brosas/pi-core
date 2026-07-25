# Garbage Collection Workflow

Scans the codebase for drift from quality standards and opens targeted cleanup PRs.

> **Pattern:** Fallow analysis → review findings → file issues → optional auto-fix PRs
> **Trigger:** Manual via `/gc` command or scheduled cadence

## Fabric Agent Execution

Run one-shot children with `agents.run({...})` inside `fabric_exec`; there are no named project agent profiles:

```typescript
const result = await agents.run({
  name: "bounded-worker",
  task: "[resolved self-contained phase goal, context, non-goals, output, stop conditions, and verification]",
  tools: ["read", "grep", "find", "ls"],
});
return result.text;
```

- Await one foreground run when its result is required by the next phase.
- A concurrent wave contains at most three genuinely independent `agents.run` calls issued together with `Promise.all`; process additional work in sequential shards.
- Do not start a dependent phase until upstream results are available.
- Use an explicit `tools` allowlist per phase. External research adds only the required configured network source tools; add `bash`, `edit`, or `write` only for approved modifying work.
- The parent resolves placeholders, synthesizes results, inspects child changes, and runs verification itself.
## Phase 1: Fallow Scan

Run full structural analysis:

```bash
npx fallow --format json --quiet > .pi/artifacts/gc-fallow.json
```

Extract key findings:
- Dead code (unused exports, files, dependencies)
- Code duplication (clone groups)
- Complexity hotspots (high cyclomatic complexity)
- Architecture boundary violations

## Phase 2: Quality Grade Update

Grade each domain by scanning findings:

| Domain | Definition | Source |
|---|---|---|
| Plugin layer | `.pi/extensions/*.ts` | Fallow + structural check |
| Command layer | `.pi/prompts/*.md` | Manual assessment |
| Skills layer | `.pi/skills/*/SKILL.md` | Fallow |
| Hindsight config | `.pi/hindsight.json` | Manual config validation |
| Hindsight runtime | `.pi/hindsight/` | Runtime-managed; inspect only, never clean |

For each domain, assign grade:
- **A** — No issues, well-maintained
- **B** — Minor issues, no blockers
- **C** — Notable decay, needs cleanup
- **D** — Significant decay, priority cleanup

Update `.pi/QUALITY.md` with current grades.

## Phase 3: Prioritize Findings

| Severity | Criteria | Action |
|---|---|---|
| P0 | Dead code in critical path, security hazard | Immediate fix PR |
| P1 | Duplication >5 instances, complexity >20 | File issue / schedule PR |
| P2 | Minor style drift, stale docs | Log for next GC cycle |
| P3 | Informational | Note only |

## Phase 4: Open Cleanup PRs (Optional)

Partition independent P0/P1 findings into ordered, non-overlapping waves of at most three. Issue only the current wave together:

```typescript
const fixes = await Promise.all(currentWave.map((finding) => agents.run({
  name: `gc-fix-${finding.id}`,
  task: buildGcFixTask(finding),
  tools: ["read", "grep", "find", "ls", "bash", "edit", "write"],
  worktree: true,
})));
return fixes.map((result) => result.text);
```

Keep dependent or same-file findings foreground and sequential. After each joined wave, the parent inspects every result, reruns verification, and integrates accepted fixes before continuing later sequential shards. Each child applies and verifies exactly one fix in its isolated worktree and reports the branch/commit. Children must not switch the shared workspace branch or open PRs concurrently.

## Phase 5: Report

```text
## GC Report — $(date -u +%Y-%m-%d)

| Domain | Grade | Issues | Trend |
|--------|-------|--------|-------|
| Plugins | A | 0 | → |
| Commands | B | 2 | ↓ |
| Skills | A | 0 | → |
| Docs | B | 1 | ↓ |

**P0:** 0 | **P1:** 2 | **P2:** 1 | **P3:** 3
**PRs opened:** 1
```
