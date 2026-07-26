# Research: Setting roles for Fabric spawn

**Date:** 2026-07-26
**Scope:** Can `agents.spawn` (and siblings) take a role/persona parameter in pi-fabric?
**Version under test:** pi-fabric `0.28.1` (local install at `/home/ryan/.pi/agent/npm/node_modules/pi-fabric`)
**Execution mode:** Direct (simple research, ~16 tool calls)

---

## Answer

**Split verdict.**

| Surface | First-class role? | Mechanism |
|---|---|---|
| `agents.spawn` / `agents.run` (one-shot) | **No** | Role must be encoded in the `task` string |
| `agents.create` (persistent actor) | **Yes** | `instructions` — required field, is the persona/system-prompt body |
| Global actor templates | **Yes** | `agents.create({ scope: "global" })` + `agents.import` — reusable named role profiles |
| `council.run({ roles })` | **No** (sugar) | Expands to per-role `agents.run` with a prompt prefix |

---

## Q1: Does `agents.spawn` accept a role parameter? — **Answered, HIGH confidence**

No. The runtime schema is closed.

```
tools.describe({ ref: "agents.spawn" })
→ properties: task, name, runner, transport, model, thinking,
              tools, timeoutMs, extensions, recursive, worktree, schema
  required: [task]
  additionalProperties: false
```

`additionalProperties: false` means passing `role` or `instructions` is a hard validation
failure before launch — not a silently ignored field.

`name` is a label only (identification + `pi-fabric/<name>-<id>` worktree branch naming).
It carries no persona.

**Source:** live `tools.describe` against the installed provider; corroborated by
`skills/fabric-exec/references/agents.md:17`, which documents `FabricAgentRequest` as
`{ task, name?, runner?, transport?, model?, thinking?, tools?, timeoutMs?, extensions?, recursive?, worktree?, schema? }`.

**Implication:** for one-shot agents, the role *is* the task string. This is why
`AGENTS.md` says "encode the role, complete task contract, and explicit tool boundary in
each call" and "project-specific named agent profiles do not exist" — that reflects a real
API constraint, not a local convention.

---

## Q2: Is there any first-class persona surface? — **Answered, HIGH confidence**

Yes, on **persistent actors**.

```
tools.describe({ ref: "agents.create" })
→ required: [name, instructions]

tools.describe({ ref: "agents.setInstructions" })
→ "Replace an actor's default instruction (its persona / system-prompt body).
   Default scope 'project' edits a live project actor; scope 'global' edits a
   project-independent template. Takes effect on the actor's next queued message."
```

`instructions` is explicitly the persona / system-prompt body, and it is **required** —
an actor cannot exist without a role. It is mutable at runtime via `agents.setInstructions`
without replacing the actor's runner session.

---

## Q3: Can roles be reused across projects? — **Answered, HIGH confidence**

Yes — **global actor templates**, stored in `~/.pi/agent/fabric/actors/`.

A template carries only the definition (name, instructions, subscriptions, run settings)
and never any history (mailbox, transcript, run logs). Templates are not live; you stamp
one into a project to make it run.

```ts
// Define a reusable role profile
agents.create({
  name: "security-reviewer",
  instructions: "Review changes for security defects. Reply with a directive only for material drift.",
  events: ["agent_settled"],
  responseMode: "directive",
  scope: "global",
});

// Stamp it into a project as a fresh actor
tools.call({ ref: "agents.import", args: { name: "security-reviewer", as: "security-reviewer-2" } });

// Promote a tuned project actor back to the library
tools.call({ ref: "agents.export", args: { id: actorId, overwrite: true } });
```

Slash-command equivalents: `/fabric global`, `/fabric import <name> [as <new>]`,
`/fabric export <id> [--overwrite]`. The dashboard exposes the same operations.

**Current state on this machine:** `~/.pi/agent/fabric/actors/` does not exist — no
templates have been created yet.

**Source:** `docs/agents.md:334-366` ("Global actor templates"); upstream copy at
https://github.com/monotykamary/pi-fabric/blob/main/docs/agents.md (found via Exa).

---

## Q4: What does `council.run({ roles })` actually do? — **Answered, HIGH confidence**

It is prompt-level sugar, not a role primitive. Guest source:

```js
async run(args) {
  const { task, roles, synthesize = true, ...agentOptions } = args;
  const results = await Promise.all(roles.map((role) => __budgetedRun({
    ...agentOptions,
    name: role,
    task: "Act as the " + role + " council member. Independently analyze this task:\n\n" + task,
  })));
  ...
}
```

Each role becomes `name: role` plus a task prefix. It confirms rather than contradicts Q1:
even Fabric's own multi-role helper injects roles through the `task` string.

**Source:** `String(council.run)` read directly from the QuickJS guest runtime.

---

## Q5 (incidental): Guest proxy vs. host provider parity — **Answered, HIGH confidence**

The host `agents` provider exposes **38** refs; the QuickJS guest `agents` object exposes
only **32**. Missing from the guest proxy in 0.28.1:

`agents.import`, `agents.export`, `agents.setTools`, `agents.setDeliveryPolicy`,
`agents.compact`, `agents.clearMessages`

These are reachable, but only via the generic fallback:

```ts
await tools.call({ ref: "agents.import", args: { name: "security-reviewer" } });
```

Calling `agents.import(...)` directly throws. `docs/agents.md` shows the direct form, so
the docs are ahead of the guest binding here. Worth knowing before writing template code.

**Source:** `tools.list({ provider: "agents" })` vs. `Object.keys(agents)`, same session.

---

## Source enforcement record

| Source | Result |
|---|---|
| **Live runtime schema** (`tools.describe`) | Authoritative. Primary evidence for Q1, Q2, Q5. |
| **First-party docs** (`pi-fabric/docs/agents.md`, `skills/fabric-exec/references/agents.md`) | Authoritative. Q2, Q3. |
| **Exa** (`web_search_exa`) | Located upstream https://github.com/monotykamary/pi-fabric/blob/main/docs/agents.md — matches local docs verbatim. |
| **Context7** | **No `pi-fabric` entry.** `resolve-library-id` returned only unrelated projects (`/danielmiessler/fabric`, `/fabric/fabric` SSH lib) and Pi itself (`/websites/pi_dev`, `/earendil-works/pi`). Querying `/websites/pi_dev` returned Pi SDK `createAgentSession` docs with no Fabric agent-role API. **Negative result.** |
| **Codex Search** | Found https://pi.dev/packages/pi-fabric (confirms actors/templates/councils feature set) and https://pi.dev/docs/latest/prompt-templates. Explicitly could not verify a first-party `agents.create` reference. Note: it surfaced `~/.pi/agent/agents/<name>.md` from `@nerisma/pi-agents` — a **different package**, not pi-fabric. Discarded. |
| **xAI Web Search** | **BLOCKED.** `xai_grok_web_search` returned "web_search requires an active xAI/Grok model. No xAI request was sent." Gated behind an active Grok model; enable via `/xai-tools`. **No evidence obtained from this source.** |

Version caveat: https://pi.dev/packages/pi-fabric advertises `0.25.7`; the local install is
`0.28.1`. All schema claims above come from the local 0.28.1 runtime, not the registry page.

---

## Recommendation

1. **Do not try to add a role parameter to `agents.spawn`.** The schema is closed and the
   constraint is deliberate — one-shot agents are stateless workers whose contract is the
   task string. Current `AGENTS.md` guidance is correct as written.

2. **If the goal is reusable named roles** (e.g. a standing "security reviewer" or
   "correctness reviewer"), the supported path is a **global actor template**:
   `agents.create({ ..., scope: "global" })` once, then `agents.import` per project. This
   gives a persisted persona, tool allowlist, model, thinking level, and delivery policy
   under one name.

3. **If the goal is only to stop retyping role preambles for one-shot work**, keep it local:
   a plain TypeScript constant map of role → task-preamble inside the `fabric_exec` program.
   No Fabric feature is needed and nothing new persists.

4. **Use `tools.call({ ref: "agents.import" })`**, not `agents.import(...)`, until the guest
   proxy catches up.

---

## Open items

- Whether the guest-proxy omission of `import`/`export`/`setTools`/`setDeliveryPolicy` is
  intentional (host-only risk gating) or an oversight in 0.28.1. Not resolvable from docs;
  would need an upstream issue or changelog check.
- xAI Web Search produced no evidence. If that source is required for sign-off, enable it
  via `/xai-tools` with an active Grok model and re-run.
