---
description: Initialize project setup — AGENTS.md, planning context, user profile, and tech stack
argument-hint: "[--deep] [--context|--user|--all]"
---

# Init: $ARGUMENTS

Initialize project setup. Run once per project.

> **Next step for fresh projects:** `/plan` to create first implementation plan.  
> **Next step for existing codebases:** `/research` for deep codebase analysis, or just start describing what you want to build.

## Fabric Agent Routing

Use `agents.run({...})` inside `fabric_exec` only when delegation saves more context or time than it costs. Direct parent work is the default; there are no named project agent profiles.

- Encode the task role, exact goal, context, non-goals, output contract, stop conditions, approval constraints, and verification in `task`.
- Supply an explicit `tools` allowlist. Local discovery, planning, and review default to `["read", "grep", "find", "ls"]`. External research adds only the required configured network tools; add mutation tools only for approved implementation work.
- Await one foreground `agents.run` when the next decision depends on its result.
- For genuinely independent questions, issue at most three `agents.run` calls in one `Promise.all`; process overflow in sequential shards.
- For small read-only discovery or research, prefer `model: "openai-codex/gpt-5.6-luna"` with `thinking: "medium"` when an explicit override is useful.
- The parent resolves placeholders, inspects child output and changes, synthesizes results, and runs verification itself.
## Idempotency Rules

| File | Rule |
|---|---|
| `AGENTS.md` | Improve in-place — never overwrite blindly |
| `.pi/tech-stack.md` | Overwrite with detected values (auto-regenerated) |
| `.pi/roadmap.md` / `.pi/state.md` | Skip if exists, ask before overwrite |
| `.pi/user.md` | Skip if exists, ask before overwrite |

## Skills

```typescript
read(".pi/skills/brainstorming/SKILL.md");
```

Load `verification-before-completion` inside Mode 1 only (after AGENTS.md creation).

## Parse Arguments

| Argument | Default | Description |
|---|---|---|
| `--deep` | false | Bounded evidence gathering for AGENTS.md; stop when required decisions reach medium-or-higher confidence |
| `--context` | false | Init planning context (roadmap.md, state.md) |
| `--user` | false | Init user profile (user.md) |
| `--all` | false | Full init: AGENTS.md + context + user profile |

**Mode rules:**
- No flags (default): Core project setup — AGENTS.md + tech-stack.md
- `--context`: Planning context (roadmap.md, state.md)
- `--user`: User profile (user.md)
- `--all`: Everything
- `--deep` applies to AGENTS.md generation only

**Brownfield auto-detection:** Existing codebase = any `src/`, `lib/`, or `app/` directory with `.ts`, `.js`, `.tsx`, `.jsx`, `.py`, `.go`, or `.rs` files. Affects Mode 2 discovery scope.

---

## Mode 1: Core Setup (Default)

Before detection or preview classification, load the authoritative universal policy source:

```typescript
read(".pi/templates/agents-policy.md");
```

### Phase 1: Detect Project

Detect and validate before including a fact:
- Primary branch, runtime, package manager, dependencies, and lockfile policy
- Build, test, lint, dev, and integration commands — validate each command actually works
- Project layout, compatibility contracts, lifecycle/task configuration, and generated or runtime-managed paths
- Existing `AGENTS.md` plus other AI rules (`.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
- CI/CD configuration
- Optional workflows: require both project/configuration evidence and executable validation; PATH presence alone is insufficient

With `--deep`:
- Define distinct discovery questions before dispatch.
- Use at most three agents in a wave; process overflow in sequential shards.
- Analyze only the git history, architecture, conventions, and test evidence needed to answer those questions.
- Stop when every generation decision has medium-or-higher-confidence evidence; do not target an arbitrary tool-call count.
- The parent inspects evidence, resolves conflicts, and owns synthesis.

### Phase 2: Preview Detection and Merge

Before any target-file write, show these classifications in order:

1. **Mandatory** — universal gates from the scaffold.
2. **Project-detected** — validated facts and commands.
3. **Conditional** — optional workflows with project/configuration evidence plus executable validation.
4. **Conflicting** — existing rules that weaken a mandatory gate and their proposed repairs.
5. **Preserved-custom** — existing sections retained unchanged.
6. **Omissions** — unresolved or unsupported facts/workflows.
7. **Line-budget exception** — whether preserving existing content can exceed the normal limit.

The preview must list additions, preserved sections, repairs, omissions, and any line-budget exception. If the user selects Cancel, change no target file.

```typescript
question({
  questions: [
    {
      header: "Proceed?",
      question: "Create or merge AGENTS.md and write tech-stack.md with the previewed configuration?",
      options: [
        { label: "Yes (Recommended)", description: "Create or merge both files" },
        { label: "AGENTS.md only", description: "Skip tech-stack.md" },
        { label: "Cancel", description: "No target file is changed" },
      ],
    },
  ],
});
```

### Phase 3: Create or Merge AGENTS.md

```typescript
read(".pi/skills/verification-before-completion/SKILL.md");
```

Synthesize the root `AGENTS.md`; do not copy the scaffold verbatim and never blindly replace or overwrite an existing AGENTS.md.

- Classify output as mandatory, project-detected, conditional, conflicting, and preserved-custom content.
- Include only validated project facts. Optional workflows require project/configuration evidence plus executable validation.
- Preserve existing custom content unless it weakens a mandatory gate. Disclose conflicts in the preview before mandatory repairs win.
- A new AGENTS.md must remain at or below 150 lines; prefer pointers over copied manuals.
- If an existing file is already oversized, or preserved content plus the kernel cannot fit, preserve user content, minimize only generated additions, report the line-budget exception, and never truncate user-authored rules.
- Git preferences are not standing authorization: require fresh confirmation for every commit, push, publication, branch, worktree, merge, or deployment action. Never perform automatic legacy-branch synchronization.

**Principles:** Examples > explanations. Pointers > copies. Evidence > inference.

### Phase 4: Create tech-stack.md

Write detected values to `.pi/tech-stack.md`. Then persist:

```markdown
# Append to .pi/artifacts/MEMORY.md (under Decisions section):
## YYYY-MM-DD Project initialized — [tech stack summary]

Core setup completed: AGENTS.md, tech-stack.md created for [language/framework] project.
```

### Phase 5: Setup Optional Workflows

Do not infer project adoption from PATH alone. Offer Fallow setup only when repository/configuration evidence shows it belongs to this project and executable validation succeeds. If initialization would install a dependency or create configuration, request explicit approval before acting.

---

## Mode 2: Planning Context (`--context`)

Initialize project planning context with roadmap and state files.

### Phase 1: Discovery (brownfield)

If the project has existing code (brownfield — see auto-detection above), run parallel codebase analysis:

```typescript
const [architecture, domains] = await Promise.all([
  agents.run({
    name: "init-architecture-map",
    model: "openai-codex/gpt-5.6-luna",
    thinking: "medium",
    tools: ["read", "grep", "find", "ls"],
    task: `Analyze architecture and runtime flow only: entry points, data flow, dependency direction, and cross-layer wiring. Do not inventory domains. Return file:line evidence for key architectural decisions and flows.`,
  }),
  agents.run({
    name: "init-domain-map",
    model: "openai-codex/gpt-5.6-luna",
    thinking: "medium",
    tools: ["read", "grep", "find", "ls"],
    task: `Inventory domain boundaries only: top-level domains, module ownership, public boundaries, and cross-domain coupling. Do not repeat runtime data-flow analysis. Return file:line evidence and unresolved boundary ambiguities.`,
  }),
]);
return { architecture: architecture.text, domains: domains.text };
```

If greenfield (no existing code), skip to requirements gathering.

### Phase 2: Requirements Gathering

Ask questions to define project direction:

```typescript
question({
  questions: [
    {
      header: "Project vision",
      question: "What is the project vision? (1-2 sentences)",
      options: [
        { label: "Let me type it", description: "Custom input" },
      ],
    },
    {
      header: "Target users",
      question: "Who are the primary users?",
      multiple: true,
      options: [
        { label: "Developers", description: "Tooling, libraries, CLI" },
        { label: "End users", description: "Consumer-facing application" },
        { label: "Internal team", description: "Internal tool or service" },
        { label: "Both", description: "Multiple user types" },
      ],
    },
    {
      header: "Success criteria",
      question: "What defines success for this project? (select all that apply)",
      multiple: true,
      options: [
        { label: "Stability", description: "Reliability and correctness first" },
        { label: "Speed", description: "Performance and low latency" },
        { label: "UX", description: "User experience and polish" },
        { label: "Maintainability", description: "Code quality and extensibility" },
      ],
    },
  ],
});
```

### Phase 3: Preview

Show the gathered requirements as a structured outline and ask for confirmation before writing files.

### Phase 4: Create Files

```typescript
// Create roadmap.md
write({
  filePath: ".pi/roadmap.md",
  content: `# Roadmap

## Vision
[1-2 sentences]

## Target Users
- ...

## Feature Roadmap
- ...
`,
});

// Create state.md
write({
  filePath: ".pi/state.md",
  content: `# State

## Current Status
Initial setup

## Active Decisions
(none)

## Next Priorities
- ...
`,
});
```

These files are written for reference. They are not injected via `instructions[]` — use `read` for on-demand access.

---

## Mode 3: User Profile (`--user`)

Create personalized user profile at `.pi/user.md`.

### Phase 1: Gather Preferences

```typescript
question({
  questions: [
    {
      header: "Identity",
      question: "What is your name and role?",
      options: [
        { label: "Set name", description: "Tell me your details" },
      ],
    },
    {
      header: "Communication",
      question: "How detailed should AI responses be?",
      options: [
        { label: "Concise (Recommended)", description: "Short, direct answers" },
        { label: "Detailed", description: "Full explanations and reasoning" },
        { label: "Mixed", description: "Depends on context" },
      ],
    },
    {
      header: "Git workflow",
      question: "How should git commits be handled?",
      options: [
        { label: "Ask first (Recommended)", description: "Always confirm before commit/push" },
        { label: "Offer to commit", description: "Offer after completion, then require per-action confirmation for each commit or push" },
      ],
    },
  ],
});
```

### Phase 2: Preview

Show the captured preferences as a summary and ask for confirmation before writing.

### Phase 3: Create user.md

Write to `.pi/user.md` with the captured preferences.

### Phase 4: Verify

The file is written for on-demand reference — not injected via `instructions[]`. Use `read .pi/user.md` when you need preferences.

---

## Output

Report what was created or merged:
1. AGENTS.md (if core setup ran), explicitly labeled `created` or `merged`
2. tech-stack.md (if core setup ran)
3. roadmap.md + state.md (if `--context`)
4. user.md (if `--user`)
5. If AGENTS.md changed, tell the user to run `/reload` or start a new session before Pi loads it. State that the generated policy is not active earlier in the current turn.
6. Recommended next command: `/plan` to start planning, `/research` to explore the codebase, or just describe what you want to build.

---

### Skill Loading

Project skills already live under `.pi/skills/` and are loaded on demand. When a platform-specific technology applies, read its `SKILL.md` or invoke the native slash command:

```text
/skill:cloudflare
/skill:react-best-practices
/skill:supabase-postgres-best-practices
/skill:swiftui-expert-skill
/skill:swift-concurrency
/skill:core-data-expert
```

List available skills with `find .pi/skills -mindepth 2 -maxdepth 2 -name SKILL.md`. Load only the skills relevant to the current task.
