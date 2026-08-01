import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("global policy prefers configured Project Intelligence retrieval", () => {
  const source = readFileSync(".pi/templates/agents-policy.md", "utf8");
  assert.match(source, /Project Intelligence[\s\S]{0,300}project_health[\s\S]{0,200}find_relevant_code[\s\S]{0,240}analyze_impact/i);
  assert.match(source, /searchTerms[\s\S]{0,180}(?:three|3)[\s\S]{0,180}(?:symbol|keyword)/i);
});
