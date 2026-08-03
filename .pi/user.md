---
purpose: Explicit user preferences and working boundaries
source: User instructions in Pi sessions
---

# User context

This file records preferences the user stated directly. It does not record identity, credentials, or inferred personal data.

## Priorities

- Optimize for pass rate and correct outcomes before minimizing output tokens.
- Use smaller models when speed or cost matters, but do not trade away proof.
- Keep files small and split larger changes into coherent cohorts.
- Avoid forcing one shared abstraction across workflows when reuse would add branching and complexity.
- Remove unused machinery rather than keeping it for possible future use.

## Communication

- Do not narrate tool calls.
- Do not echo file contents the user can inspect.
- Keep explanations proportional to the task.
- Use plain Markdown without box-drawing characters. Keep tables rare and small.
- Restate meaningful feature work in one or two sentences with concrete acceptance criteria.
- Ask only when intent or a consequential boundary remains unclear.

## Workflow

- Read project context, config, and relevant memory before asking intent questions.
- Check `sources/` early. Clone needed upstream or mod repositories there and inspect them locally.
- Prefer semantic navigation before text search. Find references before renames or signature changes.
- Use a compact formal plan for non-trivial work. Name files, order, tests, deployment, and live checks.
- Ask before a multi-file refactor or architecture decision unless the user already requested that scope.
- Implement the smallest working slice, test it, then expand only when evidence requires more.
- Separate local verification from checks that still require named live servers or feature flags.

## Agents and actors

- Ordinary work stays on plain `fabric_exec`.
- Do not start an agent, actor, supervisor, council, or other advanced Fabric workflow without one-line user confirmation unless the request names it.
- Use one-shot agents only for isolated work that would bloat Main context.
- Use actors only for a user-requested ongoing concern.
- Never put secrets in agent instructions, messages, or mesh payloads.

## Git and publication

- Keep commit messages, PR text, and Javadoc terse and casual when that matches the repository.
- Preserve verbatim commit or PR wording unless the user asks for edits.
- When a commit is requested, use the current allowed branch. Do not invent a branch.
- Do not claim a commit, push, deployment, publication, or live feature without direct evidence.

## Environment

- Confirm the current working directory before shell commands.
- The interactive shell is fish unless current evidence says otherwise.
- A backup must replace the real extension. Use `mymod.bak`, not `mymod.jar.bak`.

## Writing

- Use one name per thing and active voice.
- Prefer short common words and short paragraphs.
- Avoid hype, hedging, stacked auxiliaries, soft phrasal verbs, semicolons, and em dashes in prose.
- Keep instruction files concise. Announce changes of ten or more lines before applying them.

## Accuracy and debugging

- Verify operational claims or label them unconfirmed.
- Before proposing a root cause, list the symptoms every valid theory must explain.
- Run available diagnostics after code changes and fix introduced errors.

## Memory

- Treat injected memory indexes as retrieval hints, not full memory.
- Read only task-relevant memories.
- Update existing durable memory instead of creating duplicates.
- Keep cross-project preferences global and repository facts project-scoped.
- Do not save facts already represented by source, documentation, or Git history.

## Unknowns

- Preferred name and personal identity are not recorded.
- No standing authorization exists for commits, remote changes, package changes, deployments, or secret retention.
