# Garbage Collection Workflow

Scans the codebase for drift from quality standards and opens targeted cleanup PRs.

> **Pattern:** Fallow analysis → review findings → file issues → optional auto-fix PRs
> **Trigger:** Manual via `/gc` command or scheduled cadence

## Pi Subagent Execution

Use the pi-subagents `Agent` tool, not Fabric agents, actors, or mesh:

```typescript
Agent({
  subagent_type: "<configured name>",
  description: "<short task label>",
  prompt: `<self-contained phase prompt with resolved inputs and output contract>`,
  run_in_background: true, // only for independent concurrent calls
});
```

- Concurrency 1: omit `run_in_background`, consume the foreground result, then continue.
- A concurrent wave contains at most three independent calls. Issue those together with `run_in_background: true`; let smart join return the group. Process additional work in sequential shards and do not poll.
- Do not start a dependent phase until upstream results are available.
- Omit `model` and `thinking`; scoped agent definitions own those settings.
- The parent resolves placeholders before dispatch, synthesizes results, inspects child changes, and runs verification itself.

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
| Documentation | `.pi/artifacts/MEMORY.md` | Manual + link checker |

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
Agent({
  subagent_type: "general",
  description: "Fix [finding]",
  prompt: "[self-contained finding, exact file scope, acceptance criteria, and verification]",
  run_in_background: true,
  isolation: "worktree",
});
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
