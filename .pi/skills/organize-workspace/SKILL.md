---
name: organize-workspace
description: Use when organizing, cleaning, moving, archiving, or deleting files in an existing workspace where ownership and safety must be established before changes.
version: 1.0.0
tags: [workflow, safety, filesystem]
dependencies: []
tools: [read, grep, find, bash]
---

# Organize Workspace

## Core Principle

<HARD-GATE>
Default to **report-only**. Inventory and classify before proposing changes. Never move or delete from blanket advance permission: obtain proposal-specific explicit confirmation after the user sees exact paths and consequences.
</HARD-GATE>

## Protected Classes

Treat source, configuration, credentials or secrets, `.git`, `.pi/artifacts`, symlinks, and ambiguous data as protected. Do not infer that duplicate-looking, generated-looking, temporary, old, or unknown means disposable. Do not follow symlinks while inventorying.

## Workflow

1. **Inventory** — inspect names, types, sizes, links, and relevant ownership signals without changing anything.
2. **Classify** — group entries as keep, candidate move, candidate archive, candidate delete, or protected/ambiguous. State evidence and uncertainty.
3. **Propose** — list every exact source, destination, or deletion plus collision, link, reference, and rollback risk. Prefer reversible moves or archives.
4. **Confirm** — request explicit confirmation for the proposal. Pre-inventory or category-wide consent is insufficient. Any changed proposal requires confirmation again.
5. **Act** — execute only confirmed operations. Stop on path drift, destination collision, permission change, unexpected symlink, or scope expansion.
6. **Verify** — compare the result with the confirmed proposal, confirm protected entries remain untouched, check references when relevant, and report failures or rollback steps.

## When Not to Act

Remain inventory-only when ownership is unclear, evidence conflicts, the destination is unspecified, confirmation is missing, or safe rollback is unavailable. Never turn routine cleanup into source/configuration migration or credential handling.

## Result Contract

Return:
- inventory and classifications;
- protected and ambiguous entries;
- exact proposed operations with evidence and rollback;
- confirmation status;
- actions actually performed;
- verification evidence and unresolved risks.