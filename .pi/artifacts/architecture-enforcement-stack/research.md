# Research: Architecture Enforcement Stack for Pi Core

- **Completed:** 2026-07-26T01:06:19Z
- **Execution mode:** Workflow / deep-research
- **Checkout:** `/home/ryan/repo/pi-core`, branch `main`, HEAD `3a1cbd75e3aca3cf2339169311febd3efe3ff53b`
- **Runtime:** Node `v24.16.0`; `@earendil-works/pi-coding-agent` `0.82.1`
- **Artifact routing:** `.active` selects the narrower `engineering-discipline-enforcement-audit`, whose scope excludes runtime command/filesystem gates. This report is standalone; `.active` was not changed.
- **Source routes:** Local code and installed docs, then independent Context7, Exa, and Codex Search retrieval, followed by a dependent read-only cross-check.

## Questions

| Question | Status | Confidence |
|---|---|---|
| Is the proposed five-layer enforcement stack sound? | Answered: yes, with sharper trust boundaries | High |
| Can Pi implement the proposed modes, path gates, and post-turn checks? | Answered: partly; mediated paths only | High |
| Can mutation revisions and receipts prove verification freshness? | Answered: not alone | High |
| Does the current task graph supply owned scope and actor identity? | Answered: scope only, not identity | High |
| Should Pi Core add two new broad architecture skills? | Answered: no; existing skills overlap substantially | High |
| What is the smallest honest first release? | Answered | Medium-high |

## Findings

- **Verdict: adopt with corrections.** The central separation is right: target repositories own architecture truth and language-aware checks; Pi owns workflow/tool admission; skills supply judgment; CI is the merge authority; containers or VMs provide isolation. A rule should live at the lowest layer capable of proving it. [S1][S2][S4][S6]

- **Pi supports the proposed control-plane primitives.** Project `.pi/extensions/*/index.ts` discovery, `tool_call` blocking, mutable tool inputs, `setActiveTools`, built-in overrides, `--no-builtin-tools`, `user_bash`, `pi.exec(command, args)`, SDK tool allowlists, `DefaultResourceLoader`, and per-file `withFileMutationQueue()` are real APIs. Parallel sibling calls are preflighted sequentially and execute concurrently; `tool_execution_end` is completion-ordered, so `turn_end` is a sensible once-per-turn batching point. [S2][S3]

- **`turn_end` is not a freshness proof.** It establishes that the current LLM turn and its tool batch settled; it does not prove exclusive causality, detect later or external mutations, or show that the checker itself was non-mutating. Use it to schedule a changed-scope check, but validate repository and policy state again whenever a receipt gates completion. [S2][S8]

- **The proposed practical Bash mode is best-effort, not deterministic enforcement.** `tool_call` does not mediate user `!`/`!!`, extension `pi.exec`, direct Node filesystem calls, other processes, or every child SDK session. Regexes cannot classify arbitrary shell programs reliably. Label this mode advisory/interactive. Strong mode must remove unrestricted Bash and built-in mutators, expose controlled tools, intercept `user_bash`, construct child sessions with the same loader/tool policy, and still rely on OS isolation for hostile code. [S2][S3][S4]

- **Mutation-counter receipts are too weak.** A useful same-trust receipt should bind at least repository root, task/attempt/claim, HEAD, relevant index/worktree/untracked state digest, policy/checker digest, exact executable and argv, cwd, checker version, exit/signal, timestamp, checked paths, and post-check state. Recompute those inputs at the gate. SLSA supports subject-digest, verifier, result, resource, and expectation binding, but it does not define a generic Pi freshness receipt; an unsigned in-process record is not tamper-proof provenance. [S5][S8]

- **Use a controlled no-shell check runner.** Command-plus-argv policy is correct. Node direct process APIs avoid shell parsing, while `realpath` resolves symlinks. However no-shell execution does not sandbox the invoked checker, and canonical paths are not necessarily unique. `pi.exec` exposes cwd/signal/timeout but no explicit environment allowlist or output cap, so a hardened runner that requires those controls should use a bounded Node process wrapper. Existing targets need `realpath`; new targets require canonicalizing the nearest existing ancestor. TOCTOU races remain an OS-boundary concern. [S2][S5]

- **The current task graph cannot authorize the caller.** Version-2 tasks carry exact `files`, status, attempt, and evidence, but not `architectureImpact`, affected modules, contract changes, or a session/agent claim. Multiple tasks may be running. The extension cannot infer that the current Pi session owns a running task merely from `.active`. Avoid a second task database, but require an explicit, expiring session claim bound to slug + task ID + attempt + session/agent identity; fail closed when selection is ambiguous. Adding architecture metadata is a separate validated graph-schema change, not free-form ignored JSON. [S1]

- **Two new broad skills would duplicate current guidance.** Pi Core already has module-depth/test-seam rules, architecture-refactoring guidance, public-interface contracts, a conditional Boundaries and Testability plan section, and a read-only review workflow. Prefer one thin architecture-governance composition skill that owns impact classification, public/data ownership, policy/checker selection, and decision evidence. Add an architecture-review mode/rubric to the existing review skill unless a genuinely independent contract justifies a separate skill. [S1][S7]

- **Keep `AGENTS.md` additions smaller than the proposal.** The current file is 298 lines. A compact pointer to repository policy/checker authority, change-impact classification, protected architecture changes, and post-mutation verification is defensible only after those mechanisms exist. Module layouts, seam records, contract semantics, exception formats, and review rubrics belong in project policy/skills/checkers—not in the universal operating contract or generic `/init` scaffold. [S1]

- **The target-repository rule catalog is directionally good but not universally inferable.** Public entrypoints, forbidden dependency direction, cycles, production-to-testkit imports, public-export diffs, and expiring exceptions are strong checker candidates. Adapter participation, side-effect purity, and data ownership require explicit project manifests/registries; Pi should invoke the declared checker rather than guess language semantics. A passing fitness function proves only the property it models. [S6]

- **Use precise test terminology.** Shared behavioral suites across local implementations and fakes are adapter/port conformance tests. Consumer-driven contract tests describe consumer-provider expectations and do not replace semantic integration tests. Tests should cover only promised behavior—failure mapping, idempotency, cancellation, ordering, persistence, and serialization where those are actual contract obligations—not a mandatory universal checklist. [S7]

- **Smallest honest release:** (1) pure dependency-free policy/path/receipt logic and deterministic tests; (2) a thin extension with `plan`, `build`, and `verify` modes; (3) controlled changed/full check tools using command+argv; (4) direct `edit`/`write` scope and protected-path blocking; (5) explicit status showing guarantees and bypasses. Defer `architecture` mode, task-bound scope, commit/push claims, globs/baselines, policy editing, and child propagation until claim identity and authorization semantics are specified. Commit/push also remain separately user-approval-gated by `AGENTS.md`; fresh architecture evidence is necessary, not authorization. [S1][S2][S3][S8]

## Decision Record

| Decision question | Recommendation | Alternatives considered | Contract impact | Residual risk |
|---|---|---|---|---|
| Add the subsystem? | Yes, narrowly and in phases | Prose-only; universal parser | New project policy contract and Pi control-plane extension | Mediated paths are not containment |
| Add two skills? | No broad duplicates; compose one governance skill and existing review | Two new standalone skills | Manifest/tests only if a distinct skill is approved | Existing skill boundaries may still need cleanup |
| Put architecture metadata in v2 tasks now? | No; define caller claim first | Infer the sole running task; second scope file | None in v1 | Task-bound enforcement deferred |
| Treat receipts as authoritative? | Same-trust state-bound evidence only | In-memory mutation counter; signed attestation | Gate-time digest validation | External mutation and tampering remain possible |
| Parse Bash for safety? | Advisory mode only | Exhaustive regex denylist | No strong guarantee | Bypassable by design |

## Open Items

1. Define who may issue and revoke a task claim, and how it binds Main/Fabric children.
2. Choose the default threat model: cooperative interactive workflow or fail-closed controlled execution.
3. Define the exact repository-state digest, including untracked and index state, without hashing unrelated large trees.
4. Decide whether architecture review extends `code-review-and-quality` or earns a distinct skill contract.
5. Define policy/checker protection and explicit user authorization for future `architecture` mode.
6. Create a new feature artifact before implementation; do not broaden the currently active audit artifact implicitly.

## Sources

- **[S1] Local Pi Core evidence (current working tree, inspected 2026-07-26):** `AGENTS.md:155-268`; `.pi/skills/development-lifecycle/SKILL.md:24-38,98-104`; `.pi/skills/planning-and-task-breakdown/SKILL.md:83-107`; `.pi/skills/deep-module-design/SKILL.md:14-72`; `.pi/skills/code-review-and-quality/SKILL.md:16-48`; `.pi/scripts/task-graph.ts:7-20,42-72,156-191`; `.pi/extensions/research-enforcement/{policy,index}.ts`; `.pi/tests/research-enforcement.test.ts`; `.pi/artifacts/engineering-discipline-enforcement-audit/spec.md:19,45-49`.
- **[S2] Pi Extensions documentation, installed 0.82.1 and upstream (Context7 + Exa, accessed 2026-07-26):** discovery, lifecycle ordering, `tool_call`, `user_bash`, `pi.exec`, active tools, built-in overrides, and mutation queue. https://pi.dev/docs/latest/extensions · https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md
- **[S3] Pi SDK documentation (Context7 + Exa + Codex Search, accessed 2026-07-26):** exact tool selection, `noTools`, `excludeTools`, `DefaultResourceLoader`, and replacement-session rebinding. https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md
- **[S4] Pi Security and Containerization documentation (Exa + installed docs, accessed 2026-07-26):** project trust is not a sandbox; real isolation requires container/VM/micro-VM or equivalent OS controls. https://pi.dev/docs/latest/security · https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/containerization.md
- **[S5] Node.js v24 documentation (Context7 + Codex Search, accessed 2026-07-26):** `fs.realpath` canonicalization and direct child-process execution with `shell: false`. https://nodejs.org/docs/latest-v24.x/api/fs.html · https://nodejs.org/docs/latest-v24.x/api/child_process.html
- **[S6] Executable architecture checks and fitness functions (Exa + Codex Search):** ArchUnit User Guide 1.4.2; Thoughtworks, “Architectural fitness function,” published 2017-11-30, updated 2018-05-15. https://www.archunit.org/userguide/html/000_Index.html · https://www.thoughtworks.com/en-ca/radar/techniques/architectural-fitness-function
- **[S7] Module/seam and contract-test foundations (Exa + Codex Search):** D. L. Parnas, “On the Criteria To Be Used in Decomposing Systems into Modules,” 1972, https://doi.org/10.1145/361598.361623 · Alistair Cockburn, “Hexagonal Architecture,” 2005, https://alistair.cockburn.us/hexagonal-architecture/ · Martin Fowler, “ContractTest,” https://martinfowler.com/bliki/ContractTest.html · Pact, “How Pact works,” https://docs.pact.io/getting_started/how_pact_works
- **[S8] SLSA v1.2 source verification and provenance guidance (Exa + Codex Search, accessed 2026-07-26):** subject/verifier/expectation binding and limits of verification summaries. https://slsa.dev/spec/v1.2/verifying-source · https://slsa.dev/spec/v1.2/verification_summary · https://slsa.dev/spec/draft/verifying-artifacts