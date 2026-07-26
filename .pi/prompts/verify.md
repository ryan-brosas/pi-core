---
description: Verify implementation completeness, correctness, and coherence
argument-hint: "<slug|path|all> [--quick] [--full] [--fix] [--no-cache]"
---

# Verify: $ARGUMENTS

Check implementation against PRD before shipping.

## Load Skills

```typescript
read(".pi/skills/verification-before-completion/SKILL.md");
```

## Parse Arguments

| Argument     | Default  | Description                                    |
| ------------ | -------- | ---------------------------------------------- |
| `<slug\|path\|all>` | required | Feature slug, filesystem path, or all current work |
| `--quick`    | false    | Gates only, skip coherence check               |
| `--full`     | false    | Force full verification mode (non-incremental) |
| `--fix`      | false    | Auto-fix lint/format issues                    |
| `--no-cache` | false    | Bypass verification cache, force fresh run     |

## Determine Input Type

| Input Type | Detection | Action |
| --- | --- | --- |
| Slug | Existing `.pi/artifacts/<slug>/` | Verify against that artifact |
| Path | Existing file/directory path | Verify that scope without requiring an artifact |
| `all` | Keyword | Verify all current work without selecting a lifecycle artifact |

## Before You Verify

- **Be certain**: Only flag issues you can verify with tools
- **Don't invent problems**: If an edge case is outside the contract and consequence set, report it separately rather than silently expanding scope
- **Run applicable gates**: Repository-configured acceptance, static, lint, test, build, and integration gates are non-negotiable when present; unavailable gates are reported N/A
- **Discover project conventions**: Read `AGENTS.md`, CI workflows, manifests, and canonical scripts in that order; never infer a package manager

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
| `CURRENT_STAMP == LAST_STAMP`             | Report cached gate evidence, then continue to current completeness and black-box acceptance |
| `CURRENT_STAMP != LAST_STAMP` or no cache | Run gates normally                                     |

When cache hits, report:

```text
Verification: cached PASS (no changes since <timestamp from verify.log>)
```

## Phase 1: Resolve Scope and Gather Context

Resolve the target solely from the required argument; no ambient state selects verification scope:

- **Slug mode:** set `SLUG`, `ARTIFACT_DIR=.pi/artifacts/$SLUG`, and read that artifact’s full `spec.md`, optional `plan.md`, `tasks.json`, and relevant `progress.md` evidence.
- **Path mode:** read applicable `AGENTS.md` files and the requested source/test scope. A lifecycle artifact is not required.
- **All mode:** inspect the complete tracked and untracked worktree without selecting or mutating any lifecycle artifact.

**Verify guards:**

- [ ] The selected scope exists and is unambiguous
- [ ] Every applicable behavior contract has been read
- [ ] Completed or unrelated active artifacts were ignored

## Phase 2: Completeness and Graph Evidence

In slug mode, extract requirements from the PRD. In path/all mode, derive the bounded requirements from the user request, public contracts, tests, and changed files.

- For each applicable requirement, find evidence in the codebase with file:line references.
- Mark it complete, partial, missing, or not applicable.
- Report a completeness score only when a finite requirement set exists.

Only in slug mode, validate the authoritative `$ARTIFACT_DIR/tasks.json`. For every version-2 node, compare status and passes, current attempt, evidence refs, referenced `progress.md` anchors, and the artifacts covered by that evidence. A passed node requires current-attempt evidence that still exists and supports its claimed verification, review, or commit.

If an upstream artifact changed after evidence was recorded, first change that source task to `stale` with `passes: false` while preserving its historical evidence, then run `task-graph descendants`. Pending descendants become blocked; passed or running descendants become stale with `passes: false`; already failed or stale descendants remain unchanged. Other ancestors remain unchanged unless evidence attributes the failure upstream or their produced output changed. Release blocked nodes to pending only when all dependencies pass; stale nodes require explicit rerun. Revalidate and recompute the frontier after every state update, and report the exact affected IDs rather than blanket-resetting the graph.

## Phase 3: Correctness

Follow the [Verification Protocol](../skills/verification-before-completion/references/VERIFICATION_PROTOCOL.md):

**Default: incremental mode** for the current changed-path scope. Resolve every command from the applicable repository-configured gate inventory.

| Mode | When | Behavior |
| --- | --- | --- |
| Incremental | Default bounded change | Run targeted acceptance and every configured gate that supports safe narrowing |
| Full | `--full`, >20 changed paths, ship, or consequence escalation | Run all applicable repository-configured retained gates |

### Consequence-Based Evidence

The changed-file heuristic still selects incremental or full gate breadth; file count never substitutes for consequence. Escalation uses exactly this bounded consequence set and no other categories: **security; privacy; authorization or tenant isolation; data integrity; external providers; retries or idempotency; cost controls; recovery.**

Verify observable behavior across essential journeys and controlled failures first. Add deeper checks only to close a named evidence gap and only through a stable inspection seam.

Every recorded result or evidence item must name its vantage: observable behavior, adapter/provider contract, real integration, or justified structural or gray-box evidence.

### Conditional Experiment Readiness

Only for product or release work, apply this conditional MVP or experiment readiness check: essential journeys, deferred scope, non-deferrable controls, observable failures, current technical evidence, and a learning signal or real feedback path. Tests or a reviewer score cannot establish validated learning.

### Advisory Feedback Routing

Routing is advisory and never automatic:

- An unknown fact routes to research.
- Changed desired behavior routes to create.
- An architecture or design gap routes to plan.
- A known implementation defect routes to ship.

In slug mode, the parent records the advisory route decision in the matching `progress.md`. In path/all mode, report the route in chat only and never create or write a lifecycle artifact for it. No mode invokes another phase, selects work, or changes lifecycle state automatically.

If `--fix` is set, run an auto-fix command only when the current repository explicitly configures that exact command and the affected paths are owned. Refresh and reclassify the changed-file set afterward. If auto-fix fails or touches unrelated/runtime paths, stop; do not use cached evidence.

**Execution order after any auto-fix:**

1. Re-run targeted observable acceptance or the exact reproduction.
2. Run independent applicable repository-configured static gates concurrently only when they have no dependency.
3. Run affected tests, then the retained suite when mode or consequence requires it.
4. Run configured build/integration checks after their prerequisites.
5. Re-run black-box success journeys and controlled failures.

For browser/manual local-web requirements, use stable URLs as verification evidence. A reachable URL supplements, but never replaces, any applicable repository-configured gate.

Report results with a mode and command/evidence column. Use N/A rather than claiming an unavailable gate passed.

**After all applicable gates and current black-box acceptance pass**, recompute the post-fix/post-gate fingerprint and record it:

```bash
CURRENT_STAMP=$(compute_verification_stamp)
echo "$CURRENT_STAMP $(date -u +%Y-%m-%dT%H:%M:%SZ) PASS" >> .pi/artifacts/verify.log
```

For `--full` verification or a change spanning more than 20 files, run one foreground read-only Fabric review with the spec path, exact changed-file list, and gate output. Treat its report as review evidence, not a replacement for parent-run gates.

## Phase 4: Coherence (skip with --quick)

Cross-reference artifacts for contradictions:

- PRD vs implementation (does code address all PRD requirements?)
- Plan vs implementation (did code follow the plan?)
- Research recommendations vs actual approach (if different, is it justified?)

Flag contradictions with specific file references.

## Phase 5: Report

In slug mode, append `Verification: [PASS|PARTIAL|FAIL] - [summary]` to `$ARTIFACT_DIR/progress.md`. In path/all mode, do not create lifecycle artifacts solely to record verification.

Output:

1. **Result**: READY TO SHIP / NEEDS WORK / BLOCKED
2. **Completeness**: score and status
3. **Correctness**: gate results (with mode column)
4. **Coherence**: contradictions found (if not --quick)
5. **Blocking issues** to fix before shipping
6. **Next step**: `/ship $SLUG` in slug mode when ready, or list fixes needed

Record attempt-scoped findings in `$ARTIFACT_DIR/progress.md` only in slug mode. Hindsight automatic retain captures ordinary durable session deltas; use `hindsight_retain` only for raw, high-value facts or decisions that require immediate persistence, never to duplicate the progress log.

## Related Commands

| Need              | Command       |
| ----------------- | ------------- |
| Ship after verify | `/ship <slug>` |
| Plan a feature    | `/plan`       |
| Fix a bug         | `/fix`        |
