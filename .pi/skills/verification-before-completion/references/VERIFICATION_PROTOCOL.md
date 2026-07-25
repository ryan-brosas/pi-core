# Verification Protocol

## Default: Incremental Mode

**Incremental is the default.** Only switch to full mode when:

- `--full` flag is explicitly passed
- Shipping/releasing (pre-merge, CI pipeline)
- More than 20 files changed

### Changed Files Detection

```bash
# Get changed files (uncommitted + staged + untracked)
CHANGED=$({
  git diff --name-only --diff-filter=d HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx'
  git ls-files --others --exclude-standard -- '*.ts' '*.tsx' '*.js' '*.jsx'
} | sort -u)

# If in a plan worktree, diff against the branch point:
# CHANGED=$({
#   git diff --name-only --diff-filter=d main...HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx'
#   git ls-files --others --exclude-standard -- '*.ts' '*.tsx' '*.js' '*.jsx'
# } | sort -u)

# Count for mode decision
FILE_COUNT=$(echo "$CHANGED" | grep -c .)
# > 20 files → switch to full mode automatically
```

## Standard Gates

### Gate Execution Order

```
┌─────────────────────────────────────┐
│  Parallel (run simultaneously)      │
│  ┌─────────────┐ ┌───────────────┐  │
│  │  Typecheck   │ │  Lint         │  │
│  │  (always     │ │  (changed     │  │
│  │   full)      │ │   files only) │  │
│  └──────┬──────┘ └──────┬────────┘  │
│         └───────┬───────┘           │
│            both must pass           │
├─────────────────────────────────────┤
│  Sequential (after parallel passes) │
│  ┌─────────────┐ ┌───────────────┐  │
│  │  Test        │ │  Build        │  │
│  │  (--changed  │ │  (ship/release│  │
│  │   or full)   │ │   only)       │  │
│  └─────────────┘ └───────────────┘  │
└─────────────────────────────────────┘
```

### Parallel Group (independent — run simultaneously)

```bash
# Gate 1: Typecheck (always full — type errors propagate across files)
npm run typecheck 2>&1 &
PID_TC=$!

# Gate 2: Lint
# Incremental (default): lint only changed files
npx oxlint $CHANGED 2>&1 &
# Full mode: lint everything
# npm run lint 2>&1 &
PID_LINT=$!

STATUS_TC=0
STATUS_LINT=0
wait "$PID_TC" || STATUS_TC=$?
wait "$PID_LINT" || STATUS_LINT=$?

if [ "$STATUS_TC" -ne 0 ] || [ "$STATUS_LINT" -ne 0 ]; then
  printf 'Parallel gates failed: typecheck=%s lint=%s\n' "$STATUS_TC" "$STATUS_LINT" >&2
  exit 1
fi
```

### Sequential Group (depends on parallel group passing)

```bash
# Gate 3: Tests
# Incremental (default): only tests affected by changed files
npx vitest run --changed
# Full mode: run all tests
# npm test

# Gate 4: Build (only if shipping/releasing)
# npm run build
```

### Gate Commands Summary

| Gate      | Incremental (default)        | Full (`--full`)     | When              |
| --------- | ---------------------------- | ------------------- | ----------------- |
| Typecheck | `npm run typecheck`          | `npm run typecheck` | Always (parallel) |
| Lint      | `npx oxlint <changed-files>` | `npm run lint`      | Always (parallel) |
| Test      | `npx vitest run --changed`   | `npm test`          | Always            |
| Build     | Skip                         | `npm run build`     | Ship/release only |

## Verification Cache

Avoid redundant verification when nothing changed since the last successful run.

### Cache Protocol

After all gates pass, record a verification stamp:

```bash
# Fingerprint HEAD + every tracked diff + every non-ignored untracked path/content.
# Exclude only the cache file itself.
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

STAMP=$(compute_verification_stamp)
echo "$STAMP $(date -u +%Y-%m-%dT%H:%M:%SZ) PASS" >> .pi/artifacts/verify.log
```

### Skip Check (before running gates)

```bash
# Read last verification stamp
LAST_STAMP=$(tail -1 .pi/artifacts/verify.log 2>/dev/null | awk '{print $1}')

# Recompute current fingerprint with the same helper used for recording.
CURRENT_STAMP=$(compute_verification_stamp)

if [ "$LAST_STAMP" = "$CURRENT_STAMP" ]; then
  echo "Verification cached: no changes since last PASS"
  # Skip gates — report cached result
else
  # Run gates normally
fi
```

### When Cache is Invalidated

- Any file edited, staged, or committed since last verification
- `--full` flag always bypasses cache
- Manual `--no-cache` flag bypasses cache
- Different plan context (plan ID changed)

### Agent Behavior

When another command needs verification (e.g., closing a plan, `/ship`):

1. **Check cache first** — if clean, report `"Verification: cached PASS (no changes since <timestamp>)"`
2. **If cache miss** — run incremental gates normally
3. **Always record** — append to `verify.log` after successful run
4. **Never skip on ship/release** — always run full mode regardless of cache

## Gate Results Format

Report results as:

```text
| Gate      | Status | Mode        | Time   |
|-----------|--------|-------------|--------|
| Typecheck | PASS   | full        | 2.1s   |
| Lint      | PASS   | incremental | 0.3s   |
| Test      | PASS   | incremental | 1.2s   |
| Build     | SKIP   | —           | —      |
```

Include the mode column so it's clear whether incremental or full was used.

## Failure Handling

- If any gate fails, stop and fix before proceeding
- Show the FULL error output for failed gates
- After any code-changing fix, re-run the complete selected-mode gate sequence: both parallel gates (typecheck + lint), then tests, then build when required
- Cache is NOT written on failure — next run will execute gates normally
