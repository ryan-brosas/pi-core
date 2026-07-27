import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const SKILL = ".pi/skills/rag-ui-development/SKILL.md";
const REFERENCE =
  ".pi/skills/rag-ui-development/references/copilotkit-agent-ui-invariant.md";

function required(path: string): string {
  assert.ok(existsSync(path), "required path is missing: " + path);
  return readFileSync(path, "utf8");
}

test("rag-ui-development keeps retrieval evidence in typed product UI", () => {
  const skill = required(SKILL);
  const reference = required(REFERENCE);

  assert.match(skill, /^name: rag-ui-development$/m);
  assert.match(skill, /^description:.*(?:RAG|retrieval|research).*UI/im);
  assert.match(skill, /chat[^\n]*(?:control plane|command surface)/i);
  assert.match(skill, /structured citation/i);
  assert.match(skill, /claim[^\n]*citation|citation[^\n]*claim/i);
  assert.match(skill, /never[^\n]*(?:model-generated HTML|arbitrary HTML)|(?:model-generated HTML|arbitrary HTML)[^\n]*never/i);
  assert.match(skill, /schema[^\n]*(?:validate|validation)/i);
  assert.match(skill, /historical[^\n]*(?:snapshot|stable|immutable|freeze)/i);
  assert.match(skill, /chain.of.thought|reasoning summaries, not private reasoning/i);
  assert.match(skill, /approval[^\n]*(?:request|resume|resolve)/i);
  assert.match(skill, /inProgress[^\n]*executing[^\n]*complete[^\n]*error/i);
  assert.match(skill, /source\.upserted|source_upserted/);
  assert.match(skill, /artifact\.delta|artifact_delta/);
  assert.match(skill, /citation\.added|citation_added/);
  assert.match(skill, /invalid[^\n]*payload|out.of.order|duplicate event/i);
  assert.match(skill, /do not infer[^\n]*ordinal|ordinal[^\n]*must remain unresolved/i);
  assert.match(skill, /existing backend[^\n]*(?:minimum event|typed event)|minimum event[^\n]*existing backend/i);
  assert.match(skill, /research[^\n]*minimum artifact|minimum artifact[^\n]*research/i);
  assert.match(skill, /degraded mode[^\n]*(?:not complete|incomplete)/i);

  assert.match(reference, /github\.com\/CopilotKit\/CopilotKit/i);
  assert.match(reference, /4efb0969c0ee96ed6e124f78640c5317fbaeba3e/);
  assert.match(reference, /retained/i);
  assert.match(reference, /excluded/i);
  assert.match(reference, /no upstream code/i);
});
