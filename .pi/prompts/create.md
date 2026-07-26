---
description: Create a specification with PRD, tasks, and workspace setup
argument-hint: "<description>"
---

# Create: $ARGUMENTS

Create a specification (PRD), set up workspace, and define executable tasks — ready for `/ship`.

> **Workflow:** **`/create`** → `/ship`

## Fabric Agent Routing

Use `agents.run({...})` inside `fabric_exec` only when delegation saves more context or time than it costs. Direct parent work is the default; there are no named project agent profiles.

- Encode the task role, exact goal, context, non-goals, output contract, stop conditions, approval constraints, and verification in `task`.
- Supply an explicit `tools` allowlist. Local discovery, planning, and review default to `["read", "grep", "find", "ls"]`. External research adds only the required configured network tools; add mutation tools only for approved implementation work.
- Await one foreground `agents.run` when the next decision depends on its result.
- For genuinely independent questions, issue at most three `agents.run` calls in one `Promise.all`; process overflow in sequential shards.
- For small read-only discovery or research, prefer `model: "openai-codex/gpt-5.6-luna"` with `thinking: "medium"` when an explicit override is useful.
- The parent resolves placeholders, inspects child output and changes, synthesizes results, and runs verification itself.
## Parse Arguments

| Argument        | Default       | Description                               |
| --------------- | ------------- | ----------------------------------------- |
| `<description>` | required      | What to build/fix (quoted string)         |

## Determine Input Type

| Input Type  | Detection            | Action                        |
| ----------- | -------------------- | ----------------------------- |
| Quoted text | `"description here"` | Create PRD from description   |
| Short form  | Simple string        | Ask for more detail if needed |

## Before You Create

- **Be certain**: Only create specs you're confident have clear scope
- **Don't over-spec**: If the description is vague, ask clarifying questions first
- **Check duplicates**: Always check for existing work
- **No implementation**: This command creates specs and workspace — don't write implementation code
- **Verify PRD**: Before saving, verify all sections are filled (no placeholders)
- **Flag uncertainty**: Use `[NEEDS CLARIFICATION]` markers for unknowns — never guess silently

## Available Tools

| Fabric task role   | Use When                                     |
| ------------------ | -------------------------------------------- |
| Local discovery    | Finding patterns in codebase, affected files |
| External research  | Current docs, upstream source, best practices |

## Phase 1: Duplicate Check

### Context Search

Use automatically recalled Hindsight project context first for prior decisions and similar work. If a material gap remains, call `hindsight_recall` with a topic-bounded query; use `hindsight_reflect` only when synthesis across memories is required. Do not query memory speculatively.

### Existing Work Check

Check `.pi/artifacts/.active` for existing work in progress. If active slug exists with a `spec.md`, ask user if they want to continue with `/ship` instead.

## Phase 3: Choose Research Depth

Ask user before spawning agents:

```typescript
question({
  questions: [
    {
      header: "Research Depth",
      question: "How much codebase research do you need?",
      options: [
        {
          label: "Deep (Recommended for complex work)",
          description: "At most 3 agents: one local scan plus distinct specialist inputs",
        },
        {
          label: "Standard",
          description: "2 agents: patterns + tests (~1 min)",
        },
        {
          label: "Minimal",
          description: "1 agent: quick file scan (~30 sec)",
        },
        {
          label: "Skip",
          description: "I know the codebase, use existing knowledge",
        },
      ],
    },
  ],
});
```

## Phase 4: Gather Context

Reuse relevant research already completed in the current session before spawning. Based on the selected depth, dispatch only distinct missing inputs; the parent inspects evidence, resolves conflicts, and verifies the resulting PRD.

**If Deep (at most three Fabric runs):**

- 1x read-only local-discovery task for patterns, tests, and dependencies
- Up to 2 distinct local-discovery or external-research tasks for unresolved risks
- Issue the independent current wave with `Promise.all` and process additional questions in later sequential shards
- Run a dependent foreground read-only review only after research joins, and only when feature risk warrants it

**If Standard (at most two Fabric runs):**

- 1x read-only local-discovery task for patterns and tests
- Optionally 1x external-research task for one unresolved question

**If Minimal:**

- 0–1 read-only local-discovery run for a bounded gap

**If Skip:**

- No agents; use existing AGENTS.md and current-session evidence

**While independent Fabric runs execute**, ask clarifying questions if the description lacks scope or expected outcome. For bugs, also ask for reproduction steps and expected vs actual behavior.

## Phase 5: Initialize Plan

Extract title and description from `$ARGUMENTS`:

- If user provided a single line, use it for both title and description.
- If user provided multiple lines, use first line as title and full text as description.

Derive a kebab-case slug from the title. This slug becomes the feature's namespace:

```bash
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g; s/^-//; s/-$//')
mkdir -p ".pi/artifacts/$SLUG"
echo "$SLUG" > ".pi/artifacts/.active"
```

## Phase 6: Determine PRD Rigor

Not every change needs a full spec. Assess complexity to choose the right PRD level:

| Signal | Lite PRD | Full PRD |
| --- | --- | --- |
| Scope | Simple, single-concern | Cross-cutting, multi-system |
| Files affected | 1-3 | 4+ |
| Research depth | Skip or Minimal | Standard or Deep |
| Description | "Fix X in Y" | "Implement X with Y and Z" |

**Auto-detect:** If research was Skip/Minimal AND description is a single sentence → default to Lite.

### Lite PRD Format

For simple, well-scoped work (bugs, small tasks):

Discover verification commands supported by the current repository; do not invent package-manager commands.

````markdown
# [Title]

## Problem
[1-2 sentences: what's wrong or what's needed]

## Solution
[1-2 sentences: what to do]

## Affected Files
- `src/path/to/file.ts`

## Tasks
### [Task Title] [category]
[One sentence describing the observable end state.]

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files: ["src/path/to/file.ts"]
```

**Execution Contract:**

```yaml
acceptance_criteria:
  - "[Observable acceptance criterion proving the end state]"
verification:
  - "[Repository-supported verification command discovered from the current repository]"
```

## Success Criteria
- [ ] [Observable success criterion]
  - Verify: `[Repository-supported verification command discovered from the current repository]`
````

### Full PRD Format

For features and complex work, use the full template:

Read the PRD template and write it to the active feature's spec (`.pi/artifacts/$(cat .pi/artifacts/.active)/spec.md`).

## Phase 7: Write PRD

Copy and fill the PRD template (lite or full) using context from Phase 4.

**If Lite PRD:** Fill the lite format directly. No template file needed.

**If Full PRD:** Read the template and fill all required sections:

| Section           | Source                                                     | Required          |
| ----------------- | ---------------------------------------------------------- | ----------------- |
| Problem Statement | User description + clarifying questions                    | Always            |
| Scope (In/Out)    | User input + codebase exploration                          | Always            |
| Proposed Solution | Codebase patterns + user intent                            | Always            |
| Success Criteria  | User verification + test commands (must include `Verify:`) | Always            |
| Technical Context | Verified local-discovery findings                            | Always            |
| Affected Files    | Verified local-discovery findings (real paths from Phase 4) | Always            |
| Tasks             | Derived from scope + solution                              | Always            |
| Risks             | Codebase exploration                                       | Feature/epic only |
| Open Questions    | Unresolved items from Phase 4                              | If any exist      |

Define observable success behavior for essential journeys, including inputs, outputs, errors, side effects, non-goals, and non-deferrable controls.

For product- or release-level specifications only, include a measurable learning signal or real feedback path. Internal tooling and internal work must not invent one. Tests establish readiness, not validated learning.

### Task Format

Tasks must follow this format:

- Title with `[category]` tag
- One-sentence **end state** description (not step-by-step)
- Metadata block: `depends_on`, `parallel`, `conflicts_with`, `files`
- Non-empty `acceptance_criteria` and `verification` arrays for every task
- At least one observable acceptance criterion per task
- At least one repository-supported verification command per task

## Phase 8: Validate PRD

Before saving, verify:

- [ ] No placeholder text remains (e.g., "[Clear description", "[List what's allowed]")
- [ ] Success criteria include `Verify:` commands
- [ ] Technical context references actual `src/` paths from exploration
- [ ] Affected files list real paths
- [ ] Tasks have `[category]` headings
- [ ] Every task has non-empty `acceptance_criteria` and `verification` arrays
- [ ] No implementation code in the PRD
- [ ] No unresolved `[NEEDS CLARIFICATION]` markers remain (convert to Open Questions or resolve)

If any check fails, fix it — don't ask the user.

## Phase 9: Prepare Workspace

### Workspace Check

```bash
git status --porcelain
git branch --show-current
```

- If uncommitted changes: ask user to stash, commit, or continue

### Create Branch

### Workspace Setup

Set up the workspace: create branch, install deps if needed.

Additionally offer a "Create worktree" option:

```typescript
read(".pi/skills/using-git-worktrees/SKILL.md");
```

## Phase 10: Convert PRD to the Canonical Task Graph

Convert the PRD markdown into the authoritative `.pi/artifacts/$(cat .pi/artifacts/.active)/tasks.json`. New graphs use top-level version 2 (`"version": 2`); every task preserves its stable ID, dependencies, conflicts, files, and both non-empty `acceptance_criteria` and `verification` arrays, then initializes:

```json
{ "status": "pending", "passes": false, "attempt": 0, "evidence_refs": [] }
```

After writing, run `node --experimental-strip-types .pi/scripts/task-graph.ts validate ".pi/artifacts/$(cat .pi/artifacts/.active)/tasks.json"`. If task-graph validation fails, stop and report its machine-readable issues without changing execution state.

Structural task-graph validation checks shape only; it does not prove semantic adequacy or successful command execution, so verification commands do not necessarily pass. Verification strings are inert data and are not executed by validation.

## Phase 11: Report

Output:

1. Summary: task count, success criteria count, affected files count
2. Branch name and workspace (if claimed)
3. Active feature: `.pi/artifacts/$(cat .pi/artifacts/.active)/`
4. Next step: `/ship` (or `/plan` for complex work)

---

## Related Commands

| Need               | Command      |
| ------------------ | ------------ |
| Research first     | `/research`  |
| Plan after spec    | `/plan`      |
| Implement and ship | `/ship`      |
