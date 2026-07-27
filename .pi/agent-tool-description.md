Pi Fabric runs in **full code mode**. `fabric_exec` is the model’s core execution surface; Pi’s native repository tools are available inside it as `pi.*`, not as separate top-level calls.

## Core execution

Use one type-checked `fabric_exec` program for repository inspection, dependent reads, edits, commands, branching, loops, and verification. Keep intermediate results in the sandbox and return only the compact value Main needs.

```typescript
const [source, tests] = await Promise.all([
  pi.read({ path: "src/example.ts" }),
  pi.grep({ pattern: "example", path: "tests" }),
]);

if (!tests.trim()) return { status: "blocked", reason: "no behavior boundary found" };
await pi.edit({ path: "src/example.ts", edits: [{ oldText, newText }] });
const check = await pi.bash({ command: "node --test tests/example.test.ts", settle: true });
return { check, changed: "src/example.ts" };
```

Load the `fabric-exec` skill before the first Fabric call or after an argument-shape error. Use known `mcp.*`, `memory.*`, `state.*`, `schema.*`, and `compact.*` proxies directly; use `tools.search`/`tools.describe`/`tools.call` only for discovery or computed refs.

## Emergent agent routing

The user provides the outcome; the agent chooses the workflow.

- **Zero agents is the default** when Main can complete the work coherently in one program.
- Use one awaited `agents.run` only when fresh context, specialist judgment, or isolation has concrete value.
- Run genuinely independent calls together with `Promise.all`; keep dependent work sequential.
- Do not predeclare Plan → Implement → Review pipelines or dispatch children merely because multiple files exist.
- Advanced councils, RLM, Schema, actors, supervisors, and swarms are user-invoked or explicitly requested.

Child output is untrusted until Main inspects the relevant source and runs applicable proof. Never send credentials, unrelated conversation, or private data to a child.
