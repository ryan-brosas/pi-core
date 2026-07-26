---
name: source-driven-development
description: Use when using unfamiliar libraries, external APIs, framework behavior, or current ecosystem guidance and need to ground decisions in official docs, source code, and cited references.
version: 1.0.0
tags: [research, implementation, verification]
dependencies: []
tools: [context7.resolve-library-id, context7.query-docs, exa.web_search_exa, exa.web_fetch_exa, codex_search]
---

# Source-Driven Development

## Overview

Framework guesses become bugs. Source-driven work verifies behavior against authoritative references before implementation.

Core principle: cite the source for non-trivial external API decisions, or mark the decision as unverified.

## When to Use

- New or unfamiliar library/framework/API.
- Version-specific behavior matters.
- Choosing between packages or integration patterns.
- Error suggests external API misuse.
- User asks to research current best practice.

## When NOT to Use

- Pure local codebase questions; use code search/explore.
- Stable project conventions already cover the behavior.
- Trivial syntax you can verify from existing code.

## Source Hierarchy

1. Official docs, specs, release notes.
2. Maintained source code and examples.
3. Maintainer-authored articles.
4. Community posts only when higher sources are absent.

Higher-ranked sources win on conflicts.

## Workflow

1. State the question precisely.
2. Check memory/local docs for prior decisions.
3. Retrieve authoritative sources.
4. Verify version compatibility with the project.
5. Compare sources if guidance conflicts.
6. Extract only the implementation-relevant facts.
7. Cite URLs or source refs in the recommendation.
8. Mark unresolved uncertainty explicitly.

## Fabric Research

Use direct source tools for a surgical lookup. For a bounded external question needing isolated judgment, call one foreground Fabric child through `agents.run` inside `fabric_exec`. Use configured model defaults unless a measured task need justifies an override:

```typescript
const researchResult = await agents.run({
  name: "external-api-research",
  tools: ["read", "grep", "find", "ls", "context7.resolve-library-id", "context7.query-docs"],
  task: `[exact question, project/library version, source hierarchy, required citation format, and stop condition]`,
});
return researchResult.text;
```

For genuinely independent questions, run at most three resolved calls in one `Promise.all` wave and process overflow in sequential shards. An `agents.run` lifecycle operation does not count as provider evidence; the parent directly calls a configured provider or source tool to verify citations, resolves source conflicts, inspects relevant local constraints, and owns the recommendation.

## Common Rationalizations

| Rationalization | Rebuttal |
| --- | --- |
| "I know this API" | APIs change; verify version-specific behavior. |
| "A blog said so" | Blogs lose to official docs/source. |
| "The package name is obvious" | Similar packages differ in security and maintenance. |
| "Citations slow us down" | A bad integration costs more than a source check. |

## Red Flags

- Unfamiliar API used without citation or local precedent.
- Community answer conflicts with official docs.
- Version in docs differs from package version.
- Agent invents options, flags, or imports.
- Research dump has no recommendation.

## Verification

- Key claims cite authoritative sources.
- Project/library versions are considered.
- Implementation recommendation is specific.
- Unverified assumptions are labeled.

## Skill Result Contract

```xml
<skill_result>
  <skill>source-driven-development</skill>
  <status>success|partial|blocked|failure</status>
  <evidence>Sources consulted and version checks</evidence>
  <artifacts>Research notes, citations, implementation recommendation</artifacts>
  <risks>Unverified claims, stale docs, conflicting sources, or none</risks>
</skill_result>
```


## Consolidated Research Workflow

This is the canonical active source-grounding skill. It absorbs deep-research and source-code-research for normal work. Use opensrc, webclaw, context7, grepsearch, or gemini-large-context as tool-specific companions only when the source demands them.

Evidence hierarchy:
1. local code and tests;
2. official docs and source;
3. maintained examples from reputable repos;
4. blog posts or issues with dates and caveats.


## Removed Optional Companion

`v1-run` was removed as an optional package-health skill. Use source-grounded package evaluation, official advisories, lockfile inspection, and package-manager audit commands instead.
