---
description: Verify implementation completeness, correctness, and coherence
argument-hint: "[path|all] [--quick] [--full] [--fix] [--no-cache]"
---

# Verify: $ARGUMENTS

Check implementation against PRD before shipping.

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
read(".pi/skills/verification-before-completion/SKILL.md");
```

## Parse Arguments

| Argument     | Default  | Description                                    |
| ------------ | -------- | ---------------------------------------------- |
| `<path\|all>`| required | The path or keyword to verify                  |
| `--quick`    | false    | Gates only, skip coherence check               |
| `--full`     | false    | Force full verification mode (non-incremental) |
| `--fix`      | false    | Auto-fix lint/format issues                    |
| `--no-cache` | false    | Bypass verification cache, force fresh run     |

## Determine Input Type

| Input Type | Detection           | Action                     |
| ---------- | ------------------- | -------------------------- |
| Path       | File/directory path | Verify that specific path  |
| `all`      | Keyword             | Verify all in-progress work |

## Before You Verify

- **Be certain**: Only flag issues you can verify with tools
- **Don't invent problems**: If an edge case isn't in the PRD, don't flag it
- **Run the gates**: Build, test, lint, typecheck are non-negotiable
- **Use project conventions**: Check `package.json` scripts first

## Phase 0: Check Verification Cache

Before running any gates, check if a recent verification is still valid:

```bash
# Fingerprint HEAD + every tracked diff + every non-ignored untracked path/content.
# Exclude only the cache file itself so recording a PASS does not invalidate it.
compute_verification_stamp() {
  {
    printf '%s\0' "$(git rev-parse HEAD)"
    git diff --binary HEAD -- . ':(exclude).pi/artifacts/verify.log'
    git ls-files --others --exclude-standard -z |
      while IFS= read -r -d '' file; do
        [ "$file" = ".pi/artifacts/verify.log" ] && continue
        printf '%s\0' "$file"
        shasum -a 256 -- "$file" | awk '{print $1}'
        printf '\0'
      done
  } | shasum -a 256 | cut -d' ' -f1
}

CURRENT_STAMP=$(compute_verification_stamp)
LAST_STAMP=$(tail -1 .pi/artifacts/verify.log 2>/dev/null | awk '{print $1}')
```

| Condition                                 | Action                                                 |
| ----------------------------------------- | ------------------------------------------------------ |
| `--no-cache` or `--full`                  | Skip cache check, run fresh                            |
| `CURRENT_STAMP == LAST_STAMP`             | Report **cached PASS**, skip to Phase 2 (completeness) |
| `CURRENT_STAMP != LAST_STAMP` or no cache | Run gates normally                                     |

When cache hits, report:

```text
Verification: cached PASS (no changes since <timestamp from verify.log>)
```

## Phase 1: Gather Context

Read `.pi/artifacts/$(cat .pi/artifacts/.active)/spec.md` to understand the requirements.

Read `.pi/artifacts/$(cat .pi/artifacts/.active)/` to check what plan artifacts exist.

Read the PRD, `plan.md` when present, and relevant research/design sections recorded in the active `progress.md`.

**Verify guards:**

- [ ] Plan/spec exists and is up to date
- [ ] You have read the full spec

## Phase 2: Completeness and Graph Evidence

Extract all requirements/tasks from the PRD and verify each is implemented:

- For each requirement: find evidence in the codebase (file:line reference)
- Mark as: complete, partial, or missing
- Report completeness score (X/Y requirements met)

Validate the authoritative `tasks.json`. For every version-2 node, compare status and passes, current attempt, evidence refs, referenced `progress.md` anchors, and the artifacts covered by that evidence. A passed node requires current-attempt evidence that still exists and supports its claimed verification, review, or commit.

If an upstream artifact changed after evidence was recorded, mark its affected evidence stale and run `task-graph descendants`. Pending descendants become blocked; passed or running descendants become stale with `passes: false`; already failed or stale descendants remain unchanged. Ancestors remain unchanged unless evidence attributes the failure upstream or their produced output changed. Release blocked nodes to pending only when all dependencies pass; stale nodes require explicit rerun. Revalidate and recompute the frontier after every state update, and report the exact affected IDs rather than blanket-resetting the graph.

## Phase 3: Correctness

Follow the [Verification Protocol](../skills/verification-before-completion/references/VERIFICATION_PROTOCOL.md):

**Default: incremental mode** (changed files only, parallel gates).

| Mode        | When                                      | Behavior                         |
| ----------- | ----------------------------------------- | -------------------------------- |
| Incremental | Default, <20 changed files                | Lint changed files, test changed |
| Full        | `--full` flag, >20 changed files, or ship | Lint all, test all               |

If `--fix` is set, run the project's auto-fix command **before** final verification (for example `npm run lint:fix`, `ruff check --fix`, or `cargo clippy --fix`). Refresh the changed-file set afterward. If auto-fix fails, stop; do not use cached evidence.

**Execution order after any auto-fix:**

1. **Parallel**: typecheck + lint (simultaneously)
2. **Sequential** (after parallel passes): test, then build (ship only)

For browser/manual local-web requirements, use stable URLs as verification evidence. A reachable URL supplements, but never replaces, typecheck/lint/test/build evidence.

Report results with mode column:

```text
| Gate      | Status | Mode        | Time   |
|-----------|--------|-------------|--------|
| Typecheck | PASS   | full        | 2.1s   |
| Lint      | PASS   | incremental | 0.3s   |
| Test      | PASS   | incremental | 1.2s   |
| Build     | SKIP   | —           | —      |
```

**After all gates pass**, recompute the post-fix/post-gate fingerprint and record it:

```bash
CURRENT_STAMP=$(compute_verification_stamp)
echo "$CURRENT_STAMP $(date -u +%Y-%m-%dT%H:%M:%SZ) PASS" >> .pi/artifacts/verify.log
```

For `--full` verification or a change spanning more than 20 files, call one foreground `review` subagent with the spec path, exact changed-file list, and gate output. Treat its report as review evidence, not a replacement for parent-run gates.

## Phase 4: Coherence (skip with --quick)

Cross-reference artifacts for contradictions:

- PRD vs implementation (does code address all PRD requirements?)
- Plan vs implementation (did code follow the plan?)
- Research recommendations vs actual approach (if different, is it justified?)

Flag contradictions with specific file references.

## Phase 5: Report

Append to `.pi/artifacts/$(cat .pi/artifacts/.active)/progress.md`: `Verification: [PASS|PARTIAL|FAIL] - [summary]`

Output:

1. **Result**: READY TO SHIP / NEEDS WORK / BLOCKED
2. **Completeness**: score and status
3. **Correctness**: gate results (with mode column)
4. **Coherence**: contradictions found (if not --quick)
5. **Blocking issues** to fix before shipping
6. **Next step**: `/ship $ARGUMENTS` if ready, or list fixes needed

Record significant findings in context files:

```bash
# Append to .pi/artifacts/MEMORY.md:
#   - YYYY-MM-DD: [scope] [key finding] — [what, impact, resolution]
# Put under the Decisions or Gotchas section as appropriate
```

## Related Commands

| Need              | Command       |
| ----------------- | ------------- |
| Ship after verify | `/ship <id>`  |
| Plan a feature    | `/plan`       |
| Fix a bug         | `/fix`        |
