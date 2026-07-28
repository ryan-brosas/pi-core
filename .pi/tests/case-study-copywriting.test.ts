import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const skillPath = ".pi/skills/case-study-copywriting/SKILL.md";
const checkerPath = ".pi/skills/case-study-copywriting/scripts/check-copy.mjs";
const skill = readFileSync(skillPath, "utf8");

function checkCopy(copy: string) {
  return spawnSync(process.execPath, [checkerPath], {
    input: copy,
    encoding: "utf8",
  });
}

test("case-study skill follows the Copyhackers case-study method, not homepage copy", () => {
  assert.match(skill, /copyhackers\.com\/2019\/05\/writing-case-studies\//i);
  assert.doesNotMatch(skill, /great-home-page-copy|\bPAS\b|homepage framework/i);
  assert.match(skill, /goal[\s\S]*reader[\s\S]*(?:placement|used)/i);
  assert.match(skill, /choose a story[\s\S]*permission/i);
  assert.match(skill, /Before[\s\S]*During[\s\S]*After/);
  assert.match(skill, /Headline[\s\S]*Challenge[\s\S]*Solution[\s\S]*Results[\s\S]*Call to Action/);
  assert.match(skill, /repur|reused part/i);
});

test("case-study skill gates claims, permissions, readability, and AI slop", () => {
  assert.match(skill, /grade 6/i);
  assert.match(skill, /em dash/i);
  assert.match(skill, /colon/i);
  assert.match(skill, /unsupported claim/i);
  assert.match(skill, /name, logo, quote[\s\S]*permission/i);
  assert.match(skill, /fast-paced world[\s\S]*delve[\s\S]*seamless/i);
});

test("copy checker rejects slop and accepts plain case-study copy", () => {
  const bad = checkCopy("In today's fast-paced landscape, this robust journey unlocks a seamless result—one that is not just fast, but revolutionary.");
  assert.notEqual(bad.status, 0);
  assert.match(bad.stdout, /em dash/i);
  assert.match(bad.stdout, /colon/i);
  assert.match(bad.stdout, /stock phrase/i);

  const good = checkCopy("The old review took 14 minutes. We timed 20 runs. A new rule cut the median to 5 minutes. Three runs had no ID. Each run stopped. The result covers this test only.");
  assert.equal(good.status, 0, good.stdout || good.stderr);
  assert.match(good.stdout, /Copy check passed/);
});
