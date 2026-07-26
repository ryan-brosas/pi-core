---
name: mastra-development
description: Use when designing or reviewing Mastra agents, tools, workflows, RAG, storage, and registration code. Extracts qualified clean-code practices from a pinned Mastra template while separating reusable structure from template-specific shortcuts and defects.
version: 2.0.0
tags: [mastra, clean-code, architecture, agents, tools, workflows, rag]
dependencies: [source-driven-development, verification-before-completion]
tools: [read, grep, find, ls, bash]
---

# Mastra Development

## Purpose

Turn a clean Mastra implementation shape into reusable engineering guidance without copying the source tree or canonizing its defects.

Clean means the code makes ownership, dependencies, data flow, and failure boundaries easy to see. It does not mean every implementation decision in the source is production-ready.

Core rule: preserve the source's clarity, then adapt behavior, versions, and safety to the target project.

## Source Qualification

Pinned source inspected for this skill:

- repository: `https://github.com/mastra-ai/template-chat-with-pdf`
- commit: `4b954b41350dcd8139d135abb677ab9ddfae4f6c`
- commit date: `2026-05-28`
- observed package declaration: Apache-2.0
- observed source surface: one registration root, one agent, two tools, one vector-store module, and one three-step workflow

This pinned source is a standalone template, not the full Mastra repository or monorepo. Never copy or import the entire repository or template.

Canonical qualification for the inspected bytes:

- canonical repository: `https://github.com/mastra-ai/mastra`
- canonical byte-matched merge commit: `fb88481957c029167092cef2c47eeaffeb411ce7`
- canonical root `LICENSE.md` exact raw-byte SHA-256, including its final newline: `2b16edbc165d42dee8248296cb22979a26930fad9efaef4ebe263698a416c19c`
- canonical license scope: content outside named `ee/` directories is Apache-2.0; the template is under `templates/`, so it is covered.

Qualification limits:

- the checkout has no dependency lockfile;
- dependencies are not installed;
- no retained tests are present; no template-specific runtime test exists, and general upstream CI is not template runtime proof;
- package metadata declares Apache-2.0, but the standalone checkout itself has no `LICENSE` file; the canonical root `LICENSE.md` above supplies the applicable license qualification;
- therefore source reading and MCP graph resolution prove structure, not runtime compatibility or correctness.

Before applying a pattern:

1. Scope an MCP code-graph health-probe to the exact repository and a known symbol or path.
2. Verify graph results against current source bytes.
3. Read the target manifest and lockfile.
4. Verify imports and behavior against official docs or source for the exact installed version.
5. Run target tests; never claim the uninstalled template itself passed.

When importing a concrete source/test pattern, also load `../complex-pattern-adoption/SKILL.md`.

## Clean-Code Kernel

The source is readable because its structure answers five questions quickly:

| Question | Visible answer |
|---|---|
| Where is the application assembled? | `src/mastra/index.ts` |
| Where does model-guided behavior live? | `agents/` |
| Where do deterministic capabilities live? | `tools/` |
| Where does ordered data processing live? | `workflows/` |
| Where is shared infrastructure configured? | `lib/` |

Extract these practices:

1. **One composition root.** Framework assembly is centralized.
2. **Capability-oriented modules.** Agents, tools, workflows, and infrastructure have distinct homes.
3. **Explicit dependencies.** Imports and registration show what each capability can use.
4. **Schema-first boundaries.** Workflow inputs and outputs are machine-checkable.
5. **Linear orchestration.** Workflow order reads top to bottom.
6. **Named domain metadata.** Retrieval preserves identity and citation fields.
7. **Small enabling infrastructure.** Shared store configuration is centralized without a framework of wrappers.
8. **Comments explain exceptions.** Non-obvious compromises are labeled rather than disguised.
9. **No speculative layers.** Direct code remains direct when only one implementation exists.

Prefer small, focused modules with one responsibility or reason to change. Do not add an abstraction or seam until named variance, a second implementation, or a real alternative exists.

## Recommended Module Shape

Use the source shape as a vocabulary, not a mandatory directory template:

```text
src/mastra/
  index.ts                  # composition and registration only
  agents/
    <capability>-agent.ts   # model-guided policy and declared capabilities
  tools/
    <action>-tool.ts        # deterministic boundary operation
  workflows/
    <process>.ts            # ordered typed steps
  lib/
    <adapter>.ts            # shared store/provider configuration
```

Module rules:

- one primary exported capability per file;
- names describe domain intent, not generic infrastructure;
- imports point inward to focused shared modules, not back through the composition root;
- no barrel file merely to hide ownership;
- colocate a tiny helper when it serves only one module;
- extract a pure helper or pure core when behavior needs direct tests or a second caller;
- keep framework shells thin around testable policy and transformation code.

Do not force this tree when the target already has a clear convention. Preserve target ownership and adapt the pattern.

## Composition Root

The composition root constructs `new Mastra(...)` and visibly registers agents, workflows, vectors, storage, and logger configuration in one place.

A clean composition root:

- imports already-defined capabilities;
- assigns stable registration keys;
- creates environment-specific adapters;
- contains no parsing, retrieval, ranking, or business decisions;
- makes enabled capabilities auditable from one file;
- exposes one configured Mastra instance.

The source demonstrates a useful black-box shape:

```text
configuration + capabilities -> Mastra instance
```

Review questions:

- Can a reader list every enabled agent and workflow without searching the repository?
- Can storage, vectors, and logging vary at the root without changing domain behavior?
- Does startup fail clearly when configuration is invalid?
- Are experimental capabilities excluded deliberately rather than forgotten?

Keep configuration centralized, but do not turn the root into a service locator used by every module.

## Agent Modules

The source agent is declarative: identity, instructions, model, tools, workflows, and memory are visible in one construction site.

Preserve:

- a stable ID and useful description or name;
- one coherent user-facing responsibility;
- explicit tool and workflow maps;
- direct model configuration through a validated configuration seam;
- instructions that describe capability use, no-result behavior, and grounding;
- memory only when retention semantics are defined.

Improve during adaptation:

- keep authorization and validation in code, never only in instructions;
- split very long instructions into testable behavioral rules when they become hard to review;
- require structured source metadata before citation claims;
- define refusal and controlled-failure behavior;
- keep model/provider selection out of feature prose when environments must vary;
- do not give an agent a tool it never needs.

Agent quality checks:

- each supported intent maps to an observable response or capability call;
- tool names and descriptions make selection unambiguous;
- instructions cannot expand tool permissions;
- empty retrieval does not become a fabricated answer;
- agent behavior remains useful when optional memory is unavailable.

## Tool Modules

The source uses `createTool` to expose small deterministic capabilities with a stable ID, description, Zod `inputSchema`, and a focused `execute` function.

A clean tool boundary contains:

1. an action-oriented ID;
2. a description that says when the agent should call it;
3. bounded input validation;
4. explicit request/user/tenant context when relevant;
5. one operation;
6. normalized success and failure results;
7. no hidden global mutation.

Recommended internal flow:

```text
parse -> authorize -> call pure policy/adapter -> normalize result
```

Keep domain policy testable outside `execute`. The Mastra wrapper should adapt schemas and runtime context, not own every branch.

Schema guidance:

- reject impossible combinations at the boundary;
- make required identity fields required rather than relying on prompt instructions;
- use positive integers and ordered range refinements for page/range inputs;
- define an output schema when supported by the exact installed Mastra version;
- return structured errors or throw typed failures according to the target's public contract.

A tool that lists entities should use an entity registry or repository. A similarity query is a retrieval operation, not a general listing API.

## Workflow Modules

The source builds three `createStep` units. Each `createStep` declares `inputSchema` and `outputSchema`, then a `createWorkflow` repeats the public `inputSchema` and `outputSchema` at the process boundary.

The `.then(step)` chain makes pipeline order visible: download/extract -> split -> embed/store. This is cleaner than hiding sequence inside one large callback.

Preserve:

- one named transition per step;
- explicit handoff schemas;
- top-to-bottom process order;
- final workflow commit after composition;
- helpers near the process when they are truly process-local;
- metadata continuity across every handoff.

For each step, document:

- input assumptions;
- output guarantees;
- side effects;
- retryability;
- timeout/cancellation behavior;
- idempotency key;
- terminal versus recoverable failures.

Do not split a workflow into steps solely to create files. A step earns its boundary when it has a distinct contract, side effect, retry policy, or verification point.

For writes, prefer stage -> verify -> publish. Avoid destructive replacement before new data is known good.

## Shared Infrastructure

The source centralizes a shared vector store and index constant in `lib/vector-store.ts`. This avoids rebuilding adapters or scattering index names across tools and workflows.

Use one focused infrastructure module per real adapter responsibility:

- validated configuration enters once;
- the adapter and stable identifiers are exported;
- domain modules depend on the narrow capability they need;
- environment-specific choices stay outside domain policy;
- test seams substitute a real alternative, not an invented interface hierarchy.

Centralize together when values must remain coherent:

- embedding model;
- vector dimension;
- distance metric;
- index name;
- storage URL/provider;
- metadata schema version.

Do not centralize unrelated constants into a generic dumping ground. Do not expose credentials from infrastructure modules.

## RAG Data Contracts

The source's strongest RAG practice is metadata preservation. Its chunks carry `documentId`, `documentTitle`, `url` or source, `pageNumber`, and `totalPages` through ingestion and retrieval.

That metadata enables:

- document-scoped queries;
- page citations;
- duplicate detection;
- debugging;
- future deletion and re-ingestion;
- user-visible source attribution.

A production chunk contract should also consider:

- stable chunk ID;
- owner/tenant and visibility;
- source version/content hash;
- section or heading;
- embedding configuration version;
- ingestion timestamp/status.

Maintain these invariants:

- embedding vector count equals metadata count;
- embedding model and vector dimension agree with the index;
- filters use the same metadata types written during ingestion;
- source identity is stable across re-ingestion;
- no-match and store failure remain distinguishable;
- re-ingestion is idempotent and does not duplicate chunks.

Batching embeddings is a good source pattern because limits are explicit and work is bounded. The batch size must come from current provider limits and measured memory/cost constraints, not copied folklore.

Keep a separate document registry when listing, status, ownership, deletion, or versioning matters. Vectors are a retrieval index, not the system of record.

## Error Design

Clean code makes failures legible at the boundary where they can be handled.

Use a small failure vocabulary:

| Failure | Meaning | Typical handling |
|---|---|---|
| validation | caller supplied impossible input | return bounded caller error |
| authorization | actor cannot access capability/data | deny without leaking existence |
| not found/no match | valid operation produced no entity/content | explicit empty result |
| dependency unavailable | provider/store/network failed | retry or degrade according to policy |
| invariant violation | configuration or stored state is inconsistent | fail closed and alert |
| cancelled/timeout | bounded operation did not complete | stop downstream work safely |

Rules:

- never swallow errors and return the same shape as a legitimate empty result;
- catch only when adding context, translating a known error, compensating, or degrading deliberately;
- include operation and stable IDs in sanitized diagnostics;
- preserve causes without logging secrets or unrestricted content;
- do not use `any` at tool, workflow, metadata, or adapter boundaries;
- make partial workflow completion observable;
- test controlled failure paths from the public boundary.

Comments should explain why an error is intentionally ignored and what invariant makes that safe.

## Testing Strategy

The source has no retained tests, so its clean visual structure must be paired with target evidence.

### Unit

Test pure helpers and policy directly:

- ID generation and collision behavior;
- range validation;
- metadata mapping;
- chunk ordering and batching;
- deduplication and replacement decisions;
- error translation;
- deterministic sampling/ranking.

### Tool contract

Test:

- valid and invalid schema inputs;
- required identity/filter fields;
- success, no-match, dependency failure, timeout, and cancellation;
- adapter arguments;
- output stability.

### Workflow contract

Test:

- each step's input/output boundary;
- visible step order;
- retry and idempotency behavior;
- partial failure and recovery;
- vector/metadata count coherence;
- safe re-ingestion.

### Agent contract

Use behavior-level scenarios:

- correct tool/workflow selected;
- unsupported request clarified or refused;
- retrieved claims cite real source metadata;
- no retrieval produces no fabricated claim;
- tool failure remains a controlled response.

### Integration

Run exact installed Mastra packages with test providers/adapters at justified seams. Verify registration keys, storage/vector configuration, and one end-to-end success plus controlled failure.

Black-box evidence comes first. Add gray-box checks only for a named evidence gap and consequence.

## Template Strengths

Template patterns to keep or adapt:

- thin, obvious composition root;
- capability-oriented folders;
- one primary responsibility per module;
- explicit agent dependencies;
- stable IDs and descriptions;
- schema-defined workflow handoffs;
- readable `.then(...)` orchestration;
- shared vector-store configuration and index identifier;
- metadata preserved for filtering and citations;
- bounded embedding batches;
- local helpers instead of premature utility frameworks;
- comments that identify compromises honestly.

The list-documents tool labels its workaround as a `HACK`, states the limitation and tradeoff, and names a production alternative or cleaner approach. That honesty is a clean-code strength even though the workaround itself should not be promoted.

The source is also clean because it does not manufacture repositories, factories, classes, interfaces, or dependency containers around single implementations.

## Template Anomalies

Do not promote these source decisions as best practices:

1. `"latest"` dependency ranges make API behavior unpinned.
2. There is no lockfile in the inspected checkout.
3. There are no retained tests to prove behavior.
4. There is no LICENSE file even though package metadata declares Apache-2.0.
5. Broad catches swallow errors and collapse provider failure into empty results.
6. `any` appears in metadata and filter boundaries.
7. Arbitrary URL fetching lacks SSRF, redirect, content-type, size, and timeout controls.
8. Random page/result shuffling makes behavior and tests nondeterministic.
9. A hard-coded model and embedding choice mix environment policy into feature modules.
10. Similarity search is used as a document registry/listing workaround.
11. Existing vectors are deleted before the replacement upsert is known good.
12. A truncated base64 document ID is not a robust content/source identity strategy.
13. Query `documentId` is optional in the schema while instructions say it is mandatory.
14. Page ranges do not enforce positive ordered bounds.
15. Local file-backed storage is a development choice, not a universal production default.
16. The agent instruction block is large enough to require behavior tests and likely decomposition.

An anomaly can be acceptable in a demo when it is explicit and bounded. It does not become reusable merely because the surrounding code is readable.

## Adoption Workflow

1. Name the target problem.
2. Use MCP to locate the exact source symbol and its immediate dependencies.
3. Read the source module and related registration/handoffs.
4. Separate invariant from template-specific choices.
5. Record source strength, anomaly, and required adaptation.
6. Define the target's observable contract.
7. Implement the smallest source/test pair in target conventions.
8. Verify success and controlled failure.
9. Review whether a new abstraction is actually justified.
10. Promote only after target evidence exists.

A compact extraction table:

| Source element | Reusable invariant | Adapt in target | Reject |
|---|---|---|---|
| `index.ts` | one visible composition root | target adapters/config | business logic in root |
| agent module | explicit capabilities | target intents/model policy | prompt-only authorization |
| tool module | schema + one operation | target context/errors | broad catch/empty collapse |
| workflow | typed linear steps | idempotency/recovery | destructive replacement |
| vector module | shared coherent config | provider/migration policy | scattered hard-coded settings |

## Adoption Checklist

### Structure

- [ ] One composition root exposes enabled capabilities.
- [ ] Agents, tools, workflows, and adapters have clear owners.
- [ ] Small modules have one reason to change.
- [ ] Pure behavior is separable from framework shells.
- [ ] No speculative abstraction or generic dumping ground was added.

### Contracts

- [ ] Stable IDs and descriptions express intent.
- [ ] Schemas reject impossible inputs.
- [ ] Workflow handoffs preserve typed data and metadata.
- [ ] Errors distinguish empty, invalid, unavailable, and invariant failure.
- [ ] Identity, tenant, and source filters are enforced in code.

### RAG

- [ ] Registry and vector index have separate responsibilities.
- [ ] Model, dimensions, metric, index, and metadata agree.
- [ ] Re-ingestion is idempotent and safe.
- [ ] Retrieval is deterministic where tests require it.
- [ ] Citations originate from stored source metadata.

### Evidence

- [ ] Exact target versions and official API sources were checked.
- [ ] Source graph claims were verified against bytes.
- [ ] Black-box success and controlled failure pass.
- [ ] Relevant unit, tool, workflow, agent, and integration checks pass.
- [ ] Source anomalies were adapted or explicitly accepted with bounds.

## Corpus Rule

Add a Mastra source/test pair to the corpus only after the target application passes its observable contract and the extracted pattern demonstrates reusable value. Clean-looking template code alone is not corpus evidence.

## Result Contract

```xml
<skill_result>
  <skill>mastra-development</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Pinned source, MCP health probe, exact target versions, extracted invariant, anomaly adaptations, and target tests</evidence>
  <artifacts>Target Mastra source/test pair; corpus entry only after qualified target reuse</artifacts>
  <risks>Unverified API, copied demo shortcut, missing tests/license, unsafe retrieval, unjustified abstraction, or none</risks>
</skill_result>
```
