# Source Qualification — MCP Client Development

## Mode and Target

- Adoption mode: **adapt**.
- Target scenario: agents implementing or reviewing an MCP client, gateway, or adapter with a large/dynamic tool inventory, remote schemas, OAuth, and mixed or oversized results.
- Observable outcome: bounded context and output, strict protocol contracts, secure credential handling, recoverable lifecycle failures, and conformance-backed claims.
- Adapted guidance; no source code was copied into this skill.

## Canonical Source

- Repository: https://github.com/nicobailon/pi-mcp-adapter
- Tag: `v2.15.0`
- Commit: `e588296e28b36a22b081d40fcfba76f418d6f84e`
- Commit date observed locally: `2026-07-25T14:13:39-07:00`
- Package version: `2.15.0`
- Source checkout status at qualification: clean

## Graph Qualification

CodeGraphContext was used only as a locator after an exact-repository known-symbol probe. It resolved these symbols to the pinned checkout:

- `guardMcpOutput` -> `mcp-output-guard.ts`
- `computeServerHash` -> `metadata-cache.ts`
- `createJsonSchemaValidator` -> `json-schema-validator.ts`
- `renderMcpToolResult` -> `tool-result-renderer.ts`

The graph's built-in `find_callers` query produced invalid generated Cypher during qualification. A read-only Cypher fallback recovered a subset of call edges, but current source bytes and tests remained authoritative.

## Inspected Source and Integrity

| Path | SHA-256 | Qualification role |
|---|---|---|
| `package.json` | `414cee57800cdf536f28199450eb20b190bf1da0c4546b481fd87c041d7938a1` | package, SDK, and conformance versions |
| `metadata-cache.ts` | `44c6078b29d1bd0a4c8a41a86d0eb138fe37bf6f4e8fb4fdfd62b5823fe49513` | semantic cache identity and atomic write |
| `mcp-output-guard.ts` | `1080ad00796a5972cedce194d4110ac7b02ddbbde960c05efa2a0cd19a2302a1` | byte/line bounds, native images, private spill |
| `json-schema-validator.ts` | `227ad127c2f197316c5d1d9984848307c44d27d896a3abc53e555213cf0f57f0` | declared JSON Schema dialect selection |
| `tool-result-renderer.ts` | `c40069c30be7a7c9db33987e7bab6c54c36e86de7d5a41c5b2f6549ebe474414` | compact normal output and visible errors |
| `mcp-auth.ts` | `d668a408724b56e2be98a14e69707031c383c92396fba922922399021c7790fb` | secure-store-only persistence and migration |
| `mcp-auth-flow.ts` | `c4723c0a8bd1efb716404ece242292b076d09c2d886b63e464e1500d2503ec23` | flow-local state and cleanup |
| `server-manager.ts` | `4d01f59fa7fd5c0970e87fb121fa9a08cdd8941f8faa28228d6ece5ee0208759` | single-flight connect/reconnect and ownership |
| `proxy-modes.ts` | `accaa34ce9ec2fa51c254c55f6da8262e710b0c01f74135d032e93cb68d92439` | search/describe/call and lazy recovery |
| `conformance/README.md` | `3c4c5539eb439c6031f11088924a434ee42729c9a28ab844ed4d1f14433afd15` | official suite and expected-failure policy |

Focused source/test pairs inspected:

- `mcp-output-guard.ts` / `__tests__/mcp-output-guard.test.ts` (`a79b7a7cef11629ae461459d6f3d56c7e19c9c6c660096e77adabefaab532a97`)
- `json-schema-validator.ts` / `__tests__/output-schema-validation.test.ts` (`980f5ac2cfb29ca068fe792f6e834da3fd38ef17745274c32734c914754d4340`)
- `tool-result-renderer.ts` / `__tests__/tool-result-renderer.test.ts` (`e32925dd437c5f7879b22efe0b93144a48999c9af0fae8edbfb7a89303c09e9a`)
- `mcp-auth.ts` / `__tests__/mcp-auth-storage.test.ts` (`9085de2e284554ff14a15c81c05b40e3086078174058ef0130b4f29f1c62fdd9`)
- `server-manager.ts` / `__tests__/server-manager-reconnect.test.ts` (`e5b2a8bf4933c1a01cd9bfb8f89146a5edfad4a523a80ab95f3ce53b4d0e27e4`)

The checkout contained 81 `__tests__/*.test.ts` files at qualification.

## Observed Evidence

Focused upstream command run from the pinned checkout:

```text
node_modules/.bin/vitest run \
  __tests__/metadata-cache-instructions.test.ts \
  __tests__/tool-result-renderer.test.ts \
  __tests__/mcp-output-guard.test.ts \
  __tests__/output-schema-validation.test.ts
```

Observed result: 4 files passed; **48 tests passed**; exit 0.

The source documents 26 official conformance scenarios through `@modelcontextprotocol/conformance` 0.1.16 and an expected-failure baseline that rejects both unexpected failures and stale expected failures. The full conformance suite was not run during this qualification, so those documented results remain unverified here.

## Adaptation Decisions

### Adopted

- proxy-first discovery for large inventories and a selected direct-tool subset;
- lazy startup, single-flight connect/reconnect, and metadata-only caching;
- cache invalidation from capability-affecting identity plus atomic publication;
- output-schema validation across proxy and direct paths;
- separate text/raw-detail budgets, native image preservation, and visible errors;
- secure credential storage, URL binding, flow-local OAuth state, and cleanup;
- official conformance plus self-invalidating expected-failure baselines.

### Adapted

- Numeric output, timeout, cache-age, and idle limits are target budgets, not universal constants.
- Module names and Pi extension registration are replaced by responsibility boundaries that fit the target.
- The MCP server remains argument-validation authority; optional client prevalidation needs exact-version evidence.
- Media policy is separated from text truncation rather than assuming every provider has identical image costs.
- Temp-output retention must be explicit; the source's lack of automatic cleanup is not promoted.

### Excluded

- Pi-specific configuration precedence, panels, keybindings, Glimpse windows, and extension lifecycle wiring;
- command-backed secret resolution and other optional convenience features outside the core client contract;
- exact lifecycle mode names, hard-coded thresholds, environment kill switches, and status glyphs;
- copying the source module graph or its dependencies wholesale;
- treating local focused tests as proof of the unrun full conformance suite.

## Behavioral Qualification

The RED baseline without this skill correctly proposed lazy startup and compact discovery, but it also:

- allowed an in-memory fallback for persistent OAuth;
- returned schema-invalid output as usable data with a warning;
- replaced native image content with placeholders;
- omitted semantic/atomic metadata-cache rules and self-invalidating expected-failure baselines.

GREEN and adversarial pressure results are target-repository evidence and are not embedded here as permanent claims; rerun them when changing behavior.

## Refresh Procedure

1. Resolve a new immutable upstream tag/commit when refreshing version-specific behavior.
2. Re-run an exact-repository known-symbol graph probe, then verify every result against source.
3. Compare the qualified source/test files and hashes above.
4. Inspect changed trust boundaries, documented limitations, and conformance baselines.
5. Run focused upstream tests, the full supported conformance suite when available, skill RED/GREEN/adversarial pressure tests, manifest parity, and the Pi Core containing suite.
6. Update this record only for observed evidence; never carry old passing claims forward.
