---
name: rag-ui-development
description: Use when designing or implementing RAG, retrieval, or research-agent UI: streaming progress, source evidence, claim-linked citations, human approval, editable artifacts, or tool/activity renderers. Converts retrieval events into typed product UI instead of chat-only prose.
version: 1.0.0
tags: [rag, ui, agent-ui, retrieval, citations]
dependencies: [frontend-design, accessibility-audit, source-driven-development]
tools: []
---

# RAG UI Development

## Mandate

Turn retrieval and agent execution into inspectable product state. **Chat is the control plane, not the product surface.** The answer, artifact, evidence, progress, and decisions deserve purpose-built UI.

This skill owns the RAG-to-UI contract. For React implementation, also load **frontend-design**. Choose exactly one aesthetic overlay when needed; use **accessibility-audit** and browser verification before launch. Retrieval algorithms remain the backend's responsibility.

## Iron Laws

- Emit typed events and state; never hide retrieval status inside assistant prose.
- Every factual claim uses a structured citation linked by stable claimId and citationId values. Model-written footnote text is not provenance.
- Never render model-generated HTML or arbitrary HTML. The model selects a known activity/tool type and validated payload; product code owns the component.
- Apply schema validation before a payload reaches a renderer. Invalid payloads produce visible controlled errors, not blank UI.
- Freeze historical snapshots by run/message. Live state must not rewrite completed activity, evidence, or artifacts.
- Show reasoning summaries, not private reasoning or chain-of-thought.
- Model human intervention as an approval request that can resolve and resume the same run.
- Preserve the product's design system. Generative UI is component selection, not generative styling.

## Minimum Contract

Use stable IDs and a discriminated event union. Add domain fields only when the product proves they are needed.

~~~typescript
export type Source = {
  id: string;
  url: string;
  title: string;
  excerpt?: string;
  locator?: string;
  retrievalScore?: number; // ranking signal, never displayed as truth confidence
};

export type Citation = {
  id: string;
  claimId: string;
  sourceId: string;
  quote?: string;
  locator?: string;
  verification: "verified" | "unverified" | "missing";
};

export type ResearchStep = {
  id: string;
  kind: "plan" | "retrieve" | "rerank" | "read" | "compose" | "verify";
  label: string;
  status: "inProgress" | "executing" | "complete" | "error";
  error?: { code: string; message: string };
};

export type ResearchEvent =
  | { type: "run.started"; runId: string }
  | { type: "activity.updated"; runId: string; step: ResearchStep }
  | { type: "source.upserted"; runId: string; source: Source }
  | { type: "artifact.delta"; runId: string; artifactId: string; delta: string }
  | { type: "citation.added"; runId: string; citation: Citation }
  | { type: "approval.requested"; runId: string; request: ApprovalRequest }
  | { type: "approval.resolved"; runId: string; resolution: ApprovalResolution }
  | { type: "run.finished"; runId: string }
  | { type: "run.failed"; runId: string; error: { code: string; message: string } };
~~~

Snapshot events replace a complete object; delta events patch one stable identity. Make reducers idempotent so duplicate events and reconnect replay are safe. Reject out-of-order transitions that would regress a terminal state.

## Existing Backends and Degraded Mode

An existing backend that streams only text and a final document array is not a reason to encode retrieval into prose. Add the minimum event extension: run start, retrieval/activity update, source upsert, artifact delta, and terminal success/error. This is a small boundary, not adoption of a framework.

Do not infer claim evidence from ordinal footnotes or document-array position. Ordinal markers without a backend claim/source link must remain unresolved. Show the returned sources separately until structured citations exist.

For a research task, ship a minimum artifact surface separate from the transcript—even if it is one read-only result panel beside or above a collapsible command surface. "The prose is the artifact" is a chat-only fallback, not a research UI.

If the backend cannot change, explicitly label the experience **degraded mode and incomplete**: preserve partial prose, show an unlinked source list, expose missing provenance, and do not claim that the RAG UI contract is complete.

## Product Surfaces

Build only the surfaces the task needs, but do not collapse unlike information into chat prose:

1. **Command surface** — user intent, concise agent responses, stop/retry.
2. **Activity timeline** — named stages, current work, controlled failure, elapsed state; no fake percent when work is unbounded.
3. **Artifact canvas** — streamed answer/report/code beside chat; preserve selection and permit explicit editing after safe boundaries.
4. **Evidence surface** — source drawer/cards with title, domain, exact excerpt or locator, and open-source action.
5. **Inline citations** — selecting a citation highlights the supporting excerpt and exposes missing/unverified states.
6. **Approval card** — proposed action, consequences, editable scope, approve/reject; resume through a typed resolution event.

On narrow screens, prioritize artifact then evidence, with chat as a drawer. Do not make the primary artifact permanently compete with a fixed 50% chat pane.

## Renderer Boundary

Register renderers by typed activity/tool name. Resolve exact type and agent scope before a wildcard fallback. Treat streamed arguments as partial until execution starts.

The renderer lifecycle is **inProgress → executing → complete → error**. Each state needs intentional UI. Keep historical renderer definitions available while persisted runs can reference them.

Render functions stay pure. Put effects, telemetry, and hooks in mounted components. Reuse the consumer's primitives and tokens rather than introducing a parallel card system.

## Streaming and Persistence

- Batch high-frequency deltas and preserve scroll position when the user has scrolled away from the live edge.
- Use stable run, message, activity, artifact, claim, citation, and source IDs.
- Persist completed snapshots; reconstruct live state from snapshot plus ordered deltas.
- On reconnect, deduplicate replayed events and continue from the last acknowledged sequence.
- Abort visibly. Keep useful partial evidence but label incomplete artifacts and citations.
- Never use mirrored local state plus stringified deep comparisons as the synchronization protocol.

## Citation UX

A citation click must connect a claim to evidence, not merely jump to a bibliography number. Show source identity, exact supporting text or locator when available, and verification state. Never invent a source when citation linkage is absent.

Test keyboard activation, focus return, target highlighting, external-link labeling, long excerpts, duplicate sources, unavailable URLs, and claims with multiple sources. Retrieval score is ranking metadata—not certainty and not a substitute for verification.

## Workflow

1. Inspect the retrieval outputs, existing design system, and real user task.
2. Define the smallest event/state contract and controlled failure states.
3. Test the reducer with partial, duplicate, replayed, invalid, and out-of-order events.
4. Build activity and evidence renderers with schema-validated payloads.
5. Add the artifact surface and preserve historical snapshots.
6. Add claim-linked citations and missing/unverified behavior.
7. Add approval request/resolve/resume only where consequences require it.
8. Verify streaming in a browser, keyboard access, reduced motion, reconnect, abort, and responsive hierarchy.

## Quality Gate

Before completion, prove:

- success, abort, and backend error paths;
- partial tool arguments do not crash renderers;
- invalid payloads render a controlled error;
- duplicate events are idempotent and out-of-order events cannot regress completion;
- historical snapshots remain stable during later runs;
- every rendered citation resolves to a known claim and source or visibly reports that it cannot;
- approval resolution resumes exactly once;
- high-frequency streaming does not cause scroll jumps or uncontrolled rerenders;
- no raw model HTML, private reasoning, or fabricated progress enters the UI.

## Anti-Patterns

Chat-only research products; generic spinner for every stage; status embedded in prose; model-generated HTML; ordinal footnotes mapped to array position; unstructured citation strings; mutable historical cards; fake confidence from retrieval scores; hidden schema failures; duplicated client/agent state; arbitrary component generation; adopting a full agent framework for a renderer registry and event reducer.

See [the bounded CopilotKit evidence note](references/copilotkit-agent-ui-invariant.md) for the inspected source behavior and exclusions.
