## Research: Strict enforcement architecture source cross-check — 2026-07-26

**Execution mode:** Workflow / deep-research. Three independent angles covered Pi/Fabric admission boundaries, canonical contract and evidence binding, and safe verification execution; one dependent read-only reviewer cross-checked the joined result against the installed source. The parent directly used Context7, Exa, and Codex Search. The parent also invoked xAI Web Search, but it failed locally because this session has no active xAI/Grok model; **no xAI request was sent and xAI supplied no evidence**. A sequential xAI-model child likewise had no web-search tool. This report is therefore complete for the technical questions but **partial against the requested four-provider route**.

### Questions and confidence

| Question | Status | Confidence | Answer |
| --- | --- | --- | --- |
| Which lifecycle effects can be denied before execution today? | Answered | High | Prompt-template/skill input can be handled before expansion; Pi `tool_call` can block native and captured tool execution, including nested Fabric `pi.*` calls. Extension commands are checked before `input`, and provider internals are not universally covered. |
| Does Fabric already preflight `agents.run`? | Answered with qualification | High | Fabric validates normalized arguments and applies generic risk approval before invocation. It does **not** expose a project-supplied deterministic lifecycle validator over those arguments; `AgentsProvider` then calls `manager.spawn` without Pi `tool_call`. |
| What canonical record/digest should enforcement use? | Answered as a design recommendation | Medium-high | Versioned canonical JSON records, RFC 8785-compatible canonical bytes, domain separation, and SHA-256. Unknown versions, duplicate blocks, noncanonical input, and unsupported numbers fail closed. |
| Where should task-to-contract references live? | Answered | High | Keep `tasks.json` as scheduler. `plan.md` maps evidence requirements to task IDs; runtime worker envelopes and `progress.md` evidence bind task ID + attempt + contract digest. Do not duplicate design authority in task state. |
| How should verification commands run? | Answered for injection safety; partial for confinement | High / Medium | Execute validator-approved recipe kinds as an absolute executable plus argv with `shell: false`, bounded cwd/env/time/output, and expected exits. This prevents shell interpretation but is not an OS sandbox and does not make project scripts non-mutating. |
| Is end-to-end modifying-worker enforcement possible without an upstream change? | Partial | High | The only deterministic current option is to deny/disable agent dispatch. Child-side Pi gates can constrain effects but do not prove pre-dispatch admission. Selective strict delegation needs an upstream Fabric authorizer/grant. |

### Verified findings

1. **Use four separate gates, not one overloaded graph validator.** A pure cross-artifact validator establishes the decision state. A command admission gate denies relevant prompt-template/skill invocations when that state is missing or stale. An effect gate denies unauthorized writes/shell actions. An evidence/completion gate denies `passed` transitions and completion claims unless current evidence matches the decision and task attempt. `tasks.json` remains responsible only for readiness, dependencies, conflicts, and state. [E1] [E2] [E7]

2. **Correct the prior Fabric claim.** Installed `pi-fabric` 0.28.1 does have pre-invocation controls: `ActionRegistry` resolves the action, invokes a ref-only host authorizer, prepares and validates arguments, and calls argument-aware risk approval before `provider.invoke`. Policies are risk-class `allow|ask|auto|deny`; `auto` is a model safety classifier, not a deterministic lifecycle contract checker. The missing capability is a trusted, project-supplied deterministic policy hook over the normalized request. [E2]

3. **Pi can enforce parent command and ordinary mutation paths, with explicit limits.** `input` observes raw text before skill/template expansion and may return `handled`, so current prompt-template lifecycle commands are gateable. Extension commands run first and bypass `input`. `tool_call` fires before execution, may block, and fails safe on handler error. Fabric replays that lifecycle for nested Pi and captured tools, but `agents.run`/`spawn` and generic providers do not receive a pre-result Pi `tool_call`. [E1] [E2]

4. **Canonicalization and hashing solve deterministic identity, not authority.** RFC 8785 defines I-JSON constraints, deterministic property ordering, and invariant JSON suitable for hashing, while explicitly requiring no duplicate object names. It is informational and does not mandate SHA-256. Recommended digest input is `UTF8("pi.lifecycle.contract/v1\\0" + JCS(bundle))`, reported as `sha256:<lowercase-hex>`. Restrict numeric fields to safe integers and reject a block whose stored bytes are not canonical; this also exposes duplicate-key and alternate-serialization inputs. A digest proves byte identity relative to an expected digest, not authorship, freshness, execution, or correctness. [E3]

5. **Bind evidence like an expectation check.** SLSA verifies that a subject digest matches the artifact and separately checks signature/root of trust and expected parameters; unrecognized parameters should fail. Adapt that pattern—not SLSA semantics themselves—by binding each result to contract digest, artifact slug, task ID, attempt, validator version, vantage, unique evidence anchor, recipe ID/digest, relevant declared-file hashes, exit/signal state, and bounded output digest. Recompute before completion. Same-trust-domain v1 may rely on a trusted extension protecting/writing records; cross-trust evidence needs a signature or equivalent root of trust. [E4]

6. **Do not automatically execute existing free-form verification strings.** For strict evidence, plan-time Evidence Design should reference typed recipe kinds whose validator owns the executable and argument grammar. Execute with an argv array, `shell: false`, absolute executable resolution, repository-bounded cwd, explicit environment allowlist, timeout/abort, output cap, and accepted exit codes. Reject pipes, redirects, interpolation, globs, and arbitrary shell text rather than trying to escape them. OWASP supports structured command/data separation and positive allowlists; Node documents that `execFile` runs directly without a shell by default. No-shell execution controls injection, not malicious test code or filesystem effects. [E5] [E6]

7. **Keep task references out of scheduler authority in v1.** Embed one canonical spec record in `spec.md`; when planning is triggered, embed independent canonical `boundaries-and-seams` and `evidence-design` records in `plan.md`. Evidence Design lists the task IDs and recipe/vantage requirements it governs. At dispatch the parent derives a worker envelope from the current task object plus contract digest; `progress.md` stores the matching evidence record. The semantic validator checks coverage and references before allowing graph transitions, without making a second scheduler.

8. **Preferred worker fix: an upstream one-use authorization grant.** Add a deterministic preflight after argument preparation/schema validation and before provider invocation. It receives normalized ref/args, cwd, task/attempt, contract digest, parent identity, and requested tools. A successful check issues a one-use grant consumed at the actual spawn boundary. Cover `run`, `spawn`, deferred handoff/prewalk, actor activation, and recursive dispatch; denial must prevent process/transport launch. A callback only at `AgentsProvider.invoke` is insufficient if internal actor or handoff paths can reach `manager.spawn` directly. Until then, global `agent: deny`/disabled agents is the only honest strict admission mode; Pi-only child effect gates are an explicitly interim, not end-to-end, guarantee. [E2]

### Recommended embedded record contract

- Unique HTML-comment sentinels identify `spec`, `boundaries-and-seams`, `evidence-design`, and `evidence` record kinds and versions.
- The enclosed JSON is one canonical JCS value; reject missing/duplicate blocks, unknown keys or versions, unsafe numbers, duplicate keys, and noncanonical bytes.
- The contract digest covers normalized decision records and validator/policy version, not whole Markdown files or `progress.md`, avoiding circular and irrelevant staleness.
- Evidence records carry the digest and current file hashes; they are outside the digest they attest.
- Protected record regions are writable only through the trusted lifecycle extension/validator path.

### Decision record

| Decision | Evidence | Confidence | Alternatives | Contract impact | Residual risk |
| --- | --- | --- | --- | --- | --- |
| Use RFC 8785-compatible canonical JSON + domain-separated SHA-256 | [E3], Context7 Node crypto retrieval, Codex cross-check | Medium-high | Ad hoc sorted JSON; whole-file hashes | Defines stable digest bytes and rejection rules | Requires a tested canonicalizer; RFC is informational |
| Keep task binding in plan/runtime/progress, not a new scheduler field | Local graph model; [E4] expectation binding | High | Add `contract_ref` to every task | Preserves `tasks.json` as scheduler | Validator must prove every executable task is covered |
| Use typed no-shell verification recipes | [E5] [E6] | High for injection control | Execute free-form task strings; fixed hard-coded commands only | Existing strings become explanatory unless migrated | Child code can still mutate; no OS sandbox is provided |
| Require upstream selective worker authorization; globally deny workers for strict current mode | Installed Fabric source [E2] | High | Pi-only child gate; post-run rejection | Separates honest v1 limits from full delegation | Disabling agents removes read-only delegation too |
| Treat plain hashes as same-trust integrity only | [E3] [E4] | High | HMAC/signatures immediately | Forces explicit threat model | Local privileged tampering is out of scope unless signing is added |

### Contradictions and uncertainties

- The earlier phrase “Fabric has no pre-invocation gate” was too broad: schema validation and generic risk approval do occur before spawn. The accurate gap is **no deterministic lifecycle-specific, argument-aware extension/provider preflight**.
- `tool_call` is not a universal effect sandbox; extension command handlers, provider internals, and executed project code can have effects outside it.
- RFC 8785 provides canonicalization, not SHA-256 selection or authenticity.
- SLSA is an analogy for digest/expectation/provenance binding, not a Pi lifecycle specification.
- xAI Web Search remains unavailable. Its failed local invocation is not provider evidence and no xAI citation is claimed.

### Recommendation and next step

Create a **separate strict-enforcement specification**, leaving this completed artifact closed. Specify the canonical block grammar, restricted data profile, digest test vectors, validator semantics, protected-region rules, task coverage mapping, recipe registry, and exact failure behavior. Make selective delegated modification depend on an upstream Fabric authorization-grant hook; otherwise scope v1 to parent execution with agents denied. Then run `/plan` for that new slug.

### Open items

1. Choose the threat model: accidental/stale-policy enforcement in one trusted local process, or adversarial tamper resistance requiring signatures/HMAC and key management.
2. Decide whether v1 accepts the operational cost of globally denying all agents until the upstream hook exists.
3. Define compatibility/migration for existing version-1/version-2 graphs whose `verification` fields contain shell strings.
4. Enable/select an active xAI/Grok model and rerun xAI Web Search if four-provider evidence is a hard completion condition.

### Sources

- **[E1]** Pi extension lifecycle, command ordering, `input`, `tool_call`, and fail-safe errors: https://github.com/earendil-works/pi-mono/blob/main/packages/coding-agent/docs/extensions.md (local installed docs also inspected completely by relevant section; fetched with Exa and cross-checked with Codex Search).
- **[E2]** Pi Fabric 0.28.1 installed package/source: `dist/core/action-registry.js`, `dist/core/approval-controller.js`, `dist/providers/{agents-provider,pi-tools-provider,captured-tools-provider}.js`, `dist/core/tool-result-proxy.js`, and `docs/{architecture,providers,configuration}.md`; upstream: https://github.com/monotykamary/pi-fabric
- **[E3]** RFC 8785, *JSON Canonicalization Scheme (JCS)*, June 2020: https://www.rfc-editor.org/rfc/rfc8785.html (retrieved with Exa; independently found with Codex Search).
- **[E4]** SLSA v1.2, *Build: Verifying artifacts*: https://slsa.dev/spec/v1.2/verifying-artifacts (retrieved with Exa; independently found with Codex Search).
- **[E5]** Node.js v22.17.0, `child_process`: https://nodejs.org/download/release/v22.17.0/docs/api/child_process.html and https://github.com/nodejs/node/blob/main/doc/api/child_process.md (retrieved through Context7 `/nodejs/node`, Exa, and Codex Search).
- **[E6]** OWASP, *OS Command Injection Defense Cheat Sheet*: https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html (retrieved with Exa; independently found with Codex Search).
- **[E7]** NIST CSRC, *fail secure*: https://csrc.nist.gov/glossary/term/fail_secure (retrieved with Exa).
