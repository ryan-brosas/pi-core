---
name: inspo-graph-adoption
description: "Use when finding high-signal GitHub reference code, placing it in an operator-selected inspiration library, refreshing CodeGraphContext safely, and adapting the reviewed invariant into a Pi skill. Common targets include Pydantic AI, Mastra, and Pi extension/plugin implementations."
version: 1.1.0
tags: [adoption, github, code-graph, inspiration, workflow]
dependencies: [complex-pattern-adoption, writing-skills, opensrc, organize-workspace, source-driven-development, verification-before-completion]
tools: [read, bash, grep, find]
---

# Inspo → Code Graph → Skill

## Mandate

Find a qualified reference implementation, place it in the existing inspo organization, refresh the CodeGraphContext index without duplicating repositories, then independently rewrite only the proven invariant into a skill. The local clone is behavior evidence; the graph is a locator.

Independently rewritten ideas and patterns require no license or provenance ceremony. Do not require source pins, hashes, notices, or legal review merely because an inspo repository informed the reasoning. When copying or distributing upstream files or substantial expressive material, identify the source, check applicable terms, retain required notices, and verify source or byte integrity.

Do not use `.pi/corpus/` or create `.pi/inspo/`.

## Established Layout

Resolve the operator's existing inspiration root before choosing a destination. Use an already configured value such as `PI_INSPO_ROOT`, or ask for the absolute root when none is established; never infer another user's home layout.

```bash
: "${PI_INSPO_ROOT:?Set PI_INSPO_ROOT to the existing inspiration library}"
INSPO_ROOT="$PI_INSPO_ROOT"
```

Existing layouts may be category/repository (for example `pi-plugin/pi-fabric`) or an explicitly approved top-level repository/category (for example `pydantic-ai`). Never invent or flatten categories when the user's organization already answers the placement question.

## Workflow

### 1. Inspect before searching

```bash
find "$INSPO_ROOT" -maxdepth 2 -type d | sort
cgc list
```

Record existing candidates, indexed roots, collisions, and the intended destination. If placement is ambiguous, propose the exact path before cloning.

### 2. Qualify the source

Prefer an explicit canonical repository. For topic searches, shortlist small, focused candidates with:

- observable output or examples;
- maintained source and tests;
- a narrow pattern worth adopting;
- copied material, if any, that can be bounded and checked against applicable terms;
- no unnecessary generated bundles, vendored dependencies, or destructive setup.

Examples include Pydantic AI, Mastra templates, and Pi extension/plugin repositories. Do not equate stars or polished screenshots with code quality.

### 3. Clone narrowly and classify reuse

Use a shallow clone by default. For very large monorepos, use sparse checkout for only the relevant examples or packages.

```bash
DEST="$INSPO_ROOT/<approved-destination>"
git clone --depth 1 https://github.com/<owner>/<repo>.git "$DEST"
git -C "$DEST" rev-parse HEAD
find "$DEST" -maxdepth 1 -iname 'LICENSE*' -type f -print
```

Classify the intended use before adoption:

- **Independent rewrite:** extract the behavior or decision rule and implement it independently. Record only maintenance-relevant decisions; do not require license or provenance ceremony.
- **Copied material:** record exact source identity, applicable terms, retained notices, copied paths, excluded paths, and an integrity or parity method.

Stop on a destination collision or unbounded clone. Stop copied-material adoption when ownership, applicable terms, or approved scope cannot be established; those are not gates for an independent rewrite.

### 4. Select the correct CGC operation

CodeGraphContext `0.5.x` distinguishes initial indexing from refresh:

- `cgc index <path>` indexes a new independent repository. Repeating it for the same repository skips the existing index rather than duplicating it.
- `cgc update <path>` refreshes an indexed repository by deleting that repository's old index and rebuilding it.

If the clone is under an already indexed ancestor, refresh that indexed ancestor instead of indexing the nested clone separately. Resolve the exact ancestor from `cgc list`; do not assume the inspiration root itself is registered.

```bash
INDEX_ROOT=<absolute-indexed-ancestor-from-cgc-list>
cgc update "$INDEX_ROOT"
```

This command mutates the graph and can leave the indexed root temporarily absent if rebuilding fails. Follow the repository's destructive-operation confirmation policy before running it.

Do not use `--force` unless an explicit re-index is intended.

### 5. Verify ingestion

CGC CLI indexing is synchronous: successful completion prints an index summary. Large indexed roots can exceed an interactive tool timeout; when explicitly authorized, launch them with a captured PID and log, then monitor the process until it exits. Partial file counts do not prove completion.

On Neo4j, concurrent maintenance writers can produce transient deadlock retries during relationship linking. Inspect process health and active transactions rather than starting another refresh or killing runtime-managed maintenance blindly.

Verify both the completed index and query surface:

```bash
cgc list
cgc stats
```

```typescript
const indexedRoot = "<absolute indexed ancestor from cgc list>";
const stats = await mcp.codegraphcontext.get_repository_stats({
  repo_path: indexedRoot,
});
const hit = await mcp.codegraphcontext.find_code({
  query: "<known symbol or behavior>",
  repo_path: indexedRoot,
});
```

Require the query result to reference the current destination path. A hit from a deleted or moved path proves the index is stale, not successful.

On the current Neo4j backend, `list_graphs` is unsupported. Do not require FalkorDB-only `graph_name` behavior.

### 6. MCP write-path fallback

Probe `mcp.codegraphcontext.add_code_to_graph` only when the environment is known to support it. If it returns `-32000`, do not retry repeatedly or poll a nonexistent job. Use the working `cgc index`/`cgc update` CLI path and then query through MCP.

If neither CLI indexing nor MCP queries work, keep the clone as local evidence and use `pi.read`/`pi.grep`; report graph ingestion as blocked.

### 7. Adopt the invariant

After source and graph verification:

- use graph results only to locate relevant code;
- verify every result against the local clone;
- load `complex-pattern-adoption` in Adapt mode;
- load `writing-skills` to author or revise the resulting skill;
- independently rewrite the smallest target-native behavior and preserve its behavior boundary and verification evidence;
- apply source, license, notices, and parity requirements only when copied expressive material remains.

Do not copy an architecture wholesale when one small invariant is enough.

## Deletion and Cleanup

`cgc delete` removes a repository from the graph and may be disabled by `ALLOW_DB_DELETION`. Never enable deletion or delete an index without explicit authorization and the required destructive-operation preflight.

`cgc clean` removes nodes not connected to any repository. It does not replace deletion of a still-registered repository. Updating one indexed root does not remove a different registered repository.

## Stop Conditions

Stop the affected action when:

- destination ownership or category is unclear;
- copied material lacks bounded source identity, applicable terms, or required notices;
- the destination already exists;
- the candidate is too broad to inspect proportionately;
- an indexed ancestor refresh requires destructive authorization;
- CGC returns stale paths after refresh;
- adoption would duplicate an existing skill without a distinct behavior improvement.

## Result Contract

```xml
<skill_result>
  <skill>inspo-graph-adoption</skill>
  <status>success|partial|blocked|failure</status>
  <target>approved destination and reuse classification; copied-source details only when applicable</target>
  <inspo>current absolute path and retained scope</inspo>
  <graph>index command, synchronous result, repository stats, current-path query proof</graph>
  <adoption>invariant extracted and resulting skill or handoff</adoption>
  <risks>stale graph, blocked indexing, unbounded source, copied-material terms gap, or none</risks>
</skill_result>
```
