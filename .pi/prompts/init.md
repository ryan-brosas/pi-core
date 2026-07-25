---
description: Initialize project setup — AGENTS.md, planning context, user profile, and tech stack
argument-hint: "[--deep] [--context|--user|--all]"
---

# Init: $ARGUMENTS

Initialize project setup. Run once per project.

> **Next step for fresh projects:** `/plan` to create first implementation plan.  
> **Next step for existing codebases:** `/research` for deep codebase analysis, or just start describing what you want to build.

## Pi Subagent Routing

When this prompt says to spawn, delegate to, or use an agent, invoke the pi-subagents `Agent` tool; an agent name is not itself a tool. This is not Fabric agent orchestration.

- `Explore`: internal codebase discovery
- `scout`: external documentation and research
- `review`: correctness, security, and regression review
- `general`: small independent implementation
- `Plan`: architecture and executable planning
- Use a foreground call when the next step depends on the result. For independent parallel work, issue all calls together with `run_in_background: true`.
- Omit `model` and `thinking`; agent definitions and scoped-model settings own those choices.
## Idempotency Rules

| File | Rule |
|---|---|---|
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
| `--deep` | false | Comprehensive research for AGENTS.md (~100+ tool calls) |
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

### Phase 1: Detect Project

Detect and validate:
- Package manager and dependencies (with versions)
- Build, test, lint, dev commands — **validate each actually works**
- CI/CD configuration
- Existing AI rules (`.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
- Top-level directory structure

With `--deep`:
- Analyze git history (last 50 commits for patterns)
- Map source directory structure and subsystem candidates
- Identify common patterns (error handling, logging, data flow)
- Detect testing patterns and coverage gaps

### Phase 2: Preview Detection

Show detected summary and ask for confirmation before writing:

```typescript
question({
  questions: [
    {
      header: "Proceed?",
      question: "Write AGENTS.md and tech-stack.md with the detected configuration?",
      options: [
        { label: "Yes (Recommended)", description: "Create both files" },
        { label: "AGENTS.md only", description: "Skip tech-stack.md" },
        { label: "Cancel", description: "Don't write anything" },
      ],
    },
  ],
});
```

### Phase 3: Create AGENTS.md

```typescript
read(".pi/skills/verification-before-completion/SKILL.md");
```

Create `./AGENTS.md` — target <60 lines (max 150). Include:
- Tech stack with versions, file structure, validated commands
- Code example from actual codebase
- Testing conventions, boundaries, gotchas

**Principles:** Examples > explanations. Pointers > copies. If AGENTS.md exists, improve it — don't overwrite blindly.

### Phase 4: Create tech-stack.md

Write detected values to `.pi/tech-stack.md`. Then persist:

```markdown
# Append to .pi/artifacts/MEMORY.md (under Decisions section):
## YYYY-MM-DD Project initialized — [tech stack summary]

Core setup completed: AGENTS.md, tech-stack.md created for [language/framework] project.
```

### Phase 5: Setup Fallow (if available)

Check if fallow is available. If yes and no `.fallowrc.json` exists:

```bash
npx fallow init --quiet 2>/dev/null || true
```

---

## Mode 2: Planning Context (`--context`)

Initialize project planning context with roadmap and state files.

### Phase 1: Discovery (brownfield)

If the project has existing code (brownfield — see auto-detection above), run parallel codebase analysis:

```typescript
Agent({
  subagent_type: "Explore",
  description: "Map architecture patterns",
  prompt: `Analyze architecture and runtime flow only: entry points, data flow, dependency direction, and cross-layer wiring. Do not inventory domains. Return file:line evidence for key architectural decisions and flows.`,
  run_in_background: true,
});

Agent({
  subagent_type: "Explore",
  description: "Map domain boundaries",
  prompt: `Inventory domain boundaries only: top-level domains, module ownership, public boundaries, and cross-domain coupling. Do not repeat runtime data-flow analysis. Return file:line evidence and unresolved boundary ambiguities.`,
  run_in_background: true,
});
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
        { label: "Auto-commit", description: "Commit directly after completion" },
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

Report what was created:
1. AGENTS.md (if core setup ran)
2. tech-stack.md (if core setup ran)
3. roadmap.md + state.md (if `--context`)
4. user.md (if `--user`)
5. Recommended next command: `/plan` to start planning, `/research` to explore the codebase, or just describe what you want to build.

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
