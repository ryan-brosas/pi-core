# Verification Protocol

## Core Rule: Discover, Do Not Invent

Verification commands come from the repository, not from a language stereotype. Resolve the exact gate inventory in this order:

1. `AGENTS.md` and other repository policy;
2. CI workflow files and their invoked commands;
3. package or build manifests and canonical scripts;
4. nearby tests and task-specific `Verify:` commands.

Read the referenced source before executing it. Never infer a package manager, test runner, linter, typechecker, build tool, or auto-fix command merely from file extensions. A gate that is not configured or is unavailable is **N/A (not applicable)**, with the evidence for that conclusion recorded; it is not silently skipped and no substitute command is invented.

## Modes

**Incremental mode** is the default for a bounded change. Use **full mode** when:

- `--full` is explicitly requested;
- shipping, releasing, or preparing integration;
- more than 20 changed paths make a narrow run unreliable; or
- consequence or shared-surface impact requires the retained suite regardless of file count.

File count selects breadth only. Security, privacy, authorization, data integrity, external-provider, retry/idempotency, cost-control, or recovery consequences always override a narrow changed-file heuristic.

### Complete Changed-Path Set

Resolve the canonical primary branch or ref from `AGENTS.md` and repository metadata, verify that exact ref exists, then compute its merge base with `HEAD`. Never substitute a guessed previous commit:

```bash
PRIMARY_REF="origin/main" # replace only with the primary ref verified from repository policy
git rev-parse --verify "$PRIMARY_REF" >/dev/null 2>&1 || exit 1
BASE_SHA=$(git merge-base "$PRIMARY_REF" HEAD) || exit 1
{
  git diff --name-only "$BASE_SHA" --
  git ls-files --others --exclude-standard
} | sort -u
```

If the verified primary ref or merge base is unavailable, stop and ask rather than narrowing to committed changes. Classify every path as owned, unrelated concurrent work, or runtime-managed state before selecting checks or fixes.

## Build the Gate Inventory

Record each gate before execution:

| Gate | Exact repository command | Mode | Applicability evidence |
|---|---|---|---|
| Task acceptance | From `tasks.json` / `spec.md` | targeted | Observable contract exists |
| Type/static analysis | Repository-defined command or N/A | incremental/full | Policy, CI, or manifest |
| Lint/format | Repository-defined command or N/A | incremental/full | Policy, CI, or manifest |
| Tests | Narrowest relevant command, then retained suite when needed | incremental/full | Test layout and impact map |
| Build/package | Repository-defined command or N/A | full when shipping | CI or manifest |
| Integration/manual | Exact probe or N/A | consequence-based | Boundary and failure risks |

A command copied from prose is executable evidence only after confirming that its referenced files and executable exist in the current checkout.

### Pi Core’s Current Gate Inventory

Pi Core intentionally has no project package manager. Its repository-supported checks are:

```bash
node --experimental-strip-types .pi/scripts/doctor.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
for graph in .pi/artifacts/*/tasks.json; do
  node --experimental-strip-types .pi/scripts/task-graph.ts validate "$graph"
done
```

Run narrower `node --experimental-strip-types --test --test-name-pattern="<pattern>" .pi/tests/*.test.ts` checks first when a focused contract exists. Standalone typecheck, lint, and build gates remain N/A until Pi Core actually configures them.

## Execution Order

1. **Reproduce or RED:** for a behavior change, run the failing observable boundary test before production edits.
2. **Targeted acceptance:** execute the task’s observable acceptance and controlled-failure checks.
3. **Independent static gates:** run only configured, independent type/static and lint/format gates in parallel.
4. **Tests:** run the narrowest relevant tests, then the retained suite when scope or consequence requires it.
5. **Build/integration:** run configured build and real-integration probes after prerequisite gates pass.
6. **Black-box acceptance:** re-run essential success journeys and controlled failures from the public boundary. Gray-box evidence may supplement this only for a named evidence gap.
7. **Diff review:** inspect the complete tracked and untracked worktree; modify only owned paths.

Do not run dependent commands concurrently. After any code-changing fix, rerun every affected prerequisite and the final black-box acceptance check.

## Verification Cache

`.pi/artifacts/verify.log` is runtime-managed cache state, not repository evidence. A cached result may accelerate an ordinary incremental verification only when its fingerprint covers `HEAD`, every tracked diff, and every non-ignored untracked file except the cache itself.

- `--full`, shipping, and releasing always bypass the cache.
- Any changed path invalidates the cached result.
- A cache hit never replaces current task acceptance, consequence-driven checks, or final black-box acceptance.
- Never stage or commit the cache.

Use the same fingerprint function for lookup and recording:

```bash
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
```

Record a cache stamp only after all selected gates and acceptance checks pass.

## Results

Report observed commands and exit status; never summarize expectation as evidence:

```text
| Gate | Status | Mode | Command / evidence |
|---|---|---|---|
| Observable acceptance | PASS | targeted | <exact command and result> |
| Type/static analysis | N/A | — | no configured gate; policy/CI/manifests checked |
| Lint/format | PASS | incremental | <exact repository command> |
| Tests | PASS | full | <exact repository command and count> |
| Build | N/A | — | no configured build command |
```

## Failure Handling

- Stop on a failing applicable gate; show the relevant full error output.
- Attribute the failure to the earliest contract or task whose output must change.
- Do not weaken or delete a test merely to make a gate green.
- After a fix, rerun the failed gate, its prerequisites, affected tests, and black-box acceptance.
- If verification cannot run or evidence conflicts, report the blocker and do not claim completion.
