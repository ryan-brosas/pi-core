---
name: define-language
description: Use when a project has overloaded, conflicting, or implicit domain terms and needs evidence-backed canonical language before design or implementation proceeds.
version: 1.0.0
tags: [architecture, documentation, domain-modeling]
dependencies: []
agent_types: [Plan, general]
tools: [read, grep, find]
---

# Define Project Language

## Core Principle

<HARD-GATE>
Terminology is a contract, not a vote. Do not merge concepts or declare a canonical term when the evidence does not establish identity. Time pressure does not turn an unresolved collision into a decision.
</HARD-GATE>

## Workflow

1. **Collect evidence** — gather terms from user-facing copy, public interfaces, schemas, code, tests, ADRs, support language, and current plans. Cite concrete locations or supplied statements.
2. **Group concepts** — cluster references by demonstrated meaning and lifecycle, not spelling.
3. **Expose collisions** — show one term used for multiple concepts and multiple terms used for a possibly shared concept. Keep uncertain identities separate.
4. **Choose canonical terms** — select only where evidence or an authorized decision supports the choice. State scope: product, API, persistence, or internal code.
5. **Map aliases** — distinguish accepted aliases from legacy, rejected, and ambiguous uses. Never make conflicting terms aliases merely to simplify the glossary.
6. **Validate usage** — test the proposed language against representative sentences, interfaces, data objects, and producer/consumer boundaries. Record contradictions and decisions still required.

## Term Contract

For every concept return:
- canonical term, or `unresolved`;
- meaning and scope;
- evidence;
- accepted aliases;
- rejected or ambiguous uses;
- examples and counterexamples;
- unresolved questions and the decision owner.

## Persistence

Return the glossary and decision set in the response. Persist it only when the caller names a destination; this skill does not create a mandatory artifact or state file.

## Red Flags

Frequency presented as semantic proof; conflicting ADRs silently superseded; a new API or migration invented to support a naming choice; open questions omitted for decisiveness; persistence to an assumed path.