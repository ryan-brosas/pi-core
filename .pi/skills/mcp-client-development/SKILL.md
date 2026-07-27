---
name: mcp-client-development
description: Use when designing, implementing, reviewing, or hardening an MCP client, gateway, adapter, proxy surface, server lifecycle, OAuth flow, schema boundary, or result renderer. Do not use merely to call an MCP tool.
version: 1.0.0
tags: [mcp, integration, architecture, security, tools]
dependencies: [source-driven-development, security-and-hardening, verification-before-completion]
tools: [read, grep, find, ls, bash]
---

# MCP Client Development

## Purpose

Build an MCP client boundary that keeps model context bounded, starts and reconnects servers safely, honors protocol contracts, protects credentials, and returns useful output without hiding failures.

This skill is for the client or gateway implementation. Do not use it merely to call or discover an MCP tool; use the host's normal MCP or Fabric caller surface for that.

## Observable Outcome

A qualifying integration demonstrates all of these at its public boundary:

- a large or changing tool inventory does not flood the model context;
- a cold, stale, or failed server produces a bounded controlled failure rather than hanging the agent loop;
- schema-invalid structured output cannot appear as successful output;
- oversized text stays inspectable while native media and errors keep their meaning;
- unavailable secure storage stops persistent OAuth instead of weakening storage;
- official conformance and target behavior tests distinguish known gaps from regressions.

Read [the source qualification](references/provenance.md) when changing these rules or importing implementation material. The source is evidence, not a mandatory architecture.

## Contract First

Before choosing modules or libraries, record:

1. the exact MCP protocol revision and SDK versions in the target;
2. supported transports and ownership of each process or connection;
3. model-facing context and result budgets;
4. authentication modes and credential-store availability;
5. cancellation, timeout, retry, and idempotency policy;
6. supported content blocks and JSON Schema dialects;
7. success plus one controlled failure for every boundary above.

Verify version-specific behavior against the official versioned MCP specification, the installed SDK source, and its conformance package. Do not copy options or defaults from this skill into an incompatible version.

## Context Surface: Discover, Then Promote

Use a **proxy-first** surface when inventories are large, dynamic, or rarely used:

- expose compact search, list, describe, instructions, connect, and call operations;
- search cached metadata without starting every server;
- reveal a full tool schema only when selection or execution needs it;
- namespace tools deterministically and make collisions explicit;
- preserve server instructions as versioned metadata rather than ambient prose;
- refresh metadata on reconnect and list-change notifications.

Direct or first-class tools are a bounded subset: promote only stable, frequent, high-value tools whose saved discovery turn justifies their prompt cost. A server with many tools is not a reason to register them all.

Unknown or removed tools return a typed not-found result, refresh the relevant inventory once, and name the recovery action. Never silently call a fuzzy match.

## Lifecycle and Metadata Cache

Lazy connection is the default unless measured latency or event-driven behavior justifies eager or keep-alive ownership.

- coalesce concurrent starts and reconnects through a per-server **single-flight** operation;
- make connection states explicit: cold, connecting, connected, needs-auth, closed, and failed or their target-native equivalents;
- bind every operation to cancellation and a positive timeout;
- close only the stale connection instance that was actually observed;
- never retry a side-effecting call merely because transport recovery succeeded;
- keep process ownership and shared-daemon ownership explicit.

Cache metadata, never live clients, transports, tokens, or authorization codes. The cache key or hash includes only capability-surface identity: endpoint or command identity, relevant environment/configuration, auth mode, resources, and tool filters. Runtime tuning such as debug display or idle duration must not invalidate capabilities unless it changes the advertised surface.

Version the cache, give it a bounded age, invalidate it on capability-affecting configuration or list changes, and reject corrupt entries. Write the cache atomically through a temporary file and rename so interruption cannot publish partial JSON.

A stale cache may support discovery, but execution reconnects and verifies the live tool. Stale metadata never proves a server is available.

## Schema Boundary

Treat all remote metadata and results as untrusted input.

### Input

The MCP server remains the argument-validation authority. Preserve its `inputSchema`, adapt it only as required by the host tool API, and never silently coerce unknown arguments. Add client-side prevalidation only when the host contract requires earlier feedback and the exact validator/dialect behavior is tested; server errors remain authoritative.

### Output

When a tool advertises `outputSchema`, validate returned `structuredContent` on every execution path, including proxy and direct tools. Select validation behavior from the schema's declared dialect; explicitly test draft-07 and 2020-12, including unstamped-schema behavior for the installed SDK.

A schema mismatch is a controlled failure or call failure, never a successful result with a warning. Preserve sanitized diagnostics, but do not let malformed structured data cross the typed boundary as valid.

Do not assume text content and structured content are interchangeable. Test missing content, empty content, malformed schemas, unsupported dialects, and mixed content blocks separately.

## Output Guard and Rendering

Bound model-facing text and retained raw details independently.

- enforce both byte and line limits;
- truncate on a valid UTF-8 boundary and state original versus returned size;
- retain a bounded head preview plus an explicit omission notice;
- spill full text or raw JSON only to a private `0600` file and return its path;
- treat spilled output as sensitive, with an explicit retention and cleanup policy;
- if persistence fails, return the bounded preview and the write failure visibly;
- summarize oversized nested details without duplicating their payload into session state.

Image content blocks stay native and unchanged rather than becoming base64 text or disappearing behind a text placeholder. Apply a separate, explicit media-size policy when the target requires one; a text budget does not account for image cost.

Keep normal terminal output collapsed or compact, but keep errors visible and expanded. A collapsed row still shows server/tool identity, truncation, and failure status. Rendering compactly must not change the semantic result delivered to the model.

Never persist unrestricted prompts, tool arguments, results, authorization data, or URLs in diagnostic traces. Metadata-only tracing requires an explicit allowlist and bounded files.

## OAuth and Credential Trust Boundary

Persistent secrets go to an OS secure credential store. If that store is unavailable, fail closed with a recovery message; there is no plaintext fallback. An in-memory store is acceptable only as an explicit ephemeral test seam.

For browser authorization:

- use PKCE and cryptographically random, flow-local CSRF state;
- bind tokens and registered clients to the exact server URL and, where applicable, issuer or protected resource;
- reject or clear credentials when that binding changes;
- validate redirect scheme, loopback host, port, and callback path;
- register callback handling before opening the browser;
- expire and clean up pending flows on timeout, cancellation, completion, and shutdown;
- never log tokens, client secrets, authorization codes, redirect URLs, or verifiers.

A legacy plaintext store may be migrated only by writing the secure entry first and then deleting the plaintext source. New credentials are never written there. Client-credentials flows do not open a browser; interactive authorization never silently becomes client credentials.

## Failure Vocabulary

Return target-native typed failures that preserve these distinctions:

| Failure | Required behavior |
|---|---|
| configuration | reject impossible transport/auth combinations before startup |
| unavailable or timeout | bound the wait, name the server, preserve cancellation |
| needs-auth | distinguish missing authorization from transport failure |
| tool not found | refresh one inventory, then return available recovery information |
| invalid arguments | preserve server validation details without leaking secrets |
| output schema mismatch | fail the call boundary; never bless malformed structured data |
| oversized output | return bounded preview, omission notice, and secure inspection path |
| stale session | single-flight reconnect; do not tear down a newer connection |
| cleanup failure | aggregate with the primary failure rather than swallowing either |

Do not flatten these into one generic string. The agent needs to know whether to correct input, authenticate, retry safely, inspect retained output, or stop.

## Evidence Strategy

Run the narrowest target behavior first, then the official client conformance suite supported by the installed revision.

Minimum behavior matrix:

- proxy discovery does not start a lazy server;
- a selected direct tool and its proxy path preserve the same contract;
- concurrent cold calls create one connection;
- a list-change or reconnect replaces stale metadata without clobbering a fresh connection;
- valid and invalid draft-07 and 2020-12 output pass/fail through every call path;
- byte-only, line-only, multibyte UTF-8, mixed text/image, spill failure, and nested-detail limits;
- secure-store unavailable, URL binding change, PKCE/state mismatch, timeout, cancellation, and logout;
- normal output collapses while error output remains visible;
- traces and errors contain none of the seeded secrets.

Maintain an **expected-failure baseline** only for named protocol or SDK gaps. An unexpected failure fails the run, and a baseline scenario that starts passing also fails until the obsolete expectation is removed. Run callback-port-sensitive OAuth scenarios sequentially when parallelism would test port contention instead of protocol behavior.

A fake-server matrix complements official conformance; it does not replace it. Test real transports and the target's actual host registration boundary.

## Adoption Workflow

1. Name the target scenario and observable outcome.
2. Pin the exact protocol and SDK because their behavior is version-specific. Exemplars need no source paperwork when their ideas are rewritten independently.
3. Inspect target source, source/test pairs, trust boundaries, and current failure behavior.
4. Choose proxy, direct, or hybrid exposure from measured context and latency costs.
5. Define controlled failures before implementation.
6. Implement the smallest target-native slice: discovery plus one successful call and one failure.
7. Add lifecycle, schema, output, and auth behavior only at their real boundaries.
8. Run focused tests, official conformance, containing tests, and secret scans.
9. Review for copied architecture, speculative abstractions, and hidden unsafe fallbacks.

## Stop Conditions

Stop the affected integration when the target protocol/SDK version is unknown; secure credential storage is unavailable for persistent OAuth; schema dialect behavior is unverified; output cannot be bounded without silent loss; retries cannot distinguish safe from side-effecting calls; or official conformance contradicts the claimed contract.

## Result Contract

```xml
<skill_result>
  <skill>mcp-client-development</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Exact versions, model-context surface, lifecycle/schema/output/auth behavior tests, official conformance, and controlled failures</evidence>
  <artifacts>Target client code/tests plus an optional source note when it materially helps maintenance</artifacts>
  <risks>Context bloat, stale metadata, unsafe retry, schema drift, secret persistence, hidden truncation, unrun conformance, or none</risks>
</skill_result>
```
