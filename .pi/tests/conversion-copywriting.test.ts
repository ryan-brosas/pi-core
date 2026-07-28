import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = ".pi/skills/conversion-copywriting";
const skill = readFileSync(`${root}/SKILL.md`, "utf8");
const expectedReferences = [
  "awareness.md",
  "email.md",
  "headlines.md",
  "messaging.md",
  "offers-cta.md",
  "pages.md",
  "proof.md",
  "research.md",
  "source-map.md",
  "testing-editing.md",
];

function checkCopy(copy: string) {
  return spawnSync(process.execPath, [`${root}/scripts/check-copy.mjs`], {
    input: copy,
    encoding: "utf8",
  });
}

test("conversion-copywriting ships complete progressive references", () => {
  assert.deepEqual(readdirSync(`${root}/references`).sort(), expectedReferences);
  for (const reference of expectedReferences.filter((name) => name !== "source-map.md")) {
    const text = readFileSync(`${root}/references/${reference}`, "utf8");
    for (const heading of ["## Job", "## Inputs", "## Decision Rules", "## Workflow", "## Controlled Failures", "## Validation", "## Sources"]) {
      assert.match(text, new RegExp(`^${heading.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "m"), `${reference} ${heading}`);
    }
  }
});

test("source map covers 67 unique public sources across the major copy jobs", () => {
  const map = readFileSync(`${root}/references/source-map.md`, "utf8");
  const urls = [...map.matchAll(/https:\/\/copyhackers\.com\/[^)\s]+/g)].map((match) => match[0]);
  assert.equal(urls.length, 67);
  assert.equal(new Set(urls).size, 67);
  for (const heading of ["Research and voice of customer", "Messaging and positioning", "Awareness and persuasion", "Headlines", "Page architecture", "Offers and calls to action", "Proof and trust", "Email lifecycle copy", "Testing and editing"]) {
    assert.match(map, new RegExp(`^## ${heading}$`, "m"));
  }
});

test("router composes research, message, channel, proof, and testing without loading everything", () => {
  assert.match(skill, /Load only the references needed/i);
  for (const reference of expectedReferences.filter((name) => name !== "source-map.md")) {
    assert.match(skill, new RegExp(reference.replace(".", "\\.")));
  }
  assert.match(skill, /about-page-copywriting/);
  assert.match(skill, /case-study-copywriting/);
  assert.match(skill, /research[\s\S]*message hierarchy[\s\S]*awareness[\s\S]*proof[\s\S]*validate/i);
});

test("conversion copy rejects unsupported pressure and hard-to-read slop", () => {
  assert.match(skill, /Do not invent[\s\S]*urgency[\s\S]*scarcity[\s\S]*guarantees/i);
  assert.match(skill, /grade 6/i);
  assert.match(skill, /em dash/i);
  assert.match(skill, /colon/i);

  const bad = checkCopy("In today's fast-paced landscape, this visionary offer unlocks a seamless journey—one that is not just bold, but world-class: Act now.");
  assert.notEqual(bad.status, 0);
  assert.match(bad.stdout, /em dash/i);
  assert.match(bad.stdout, /colon/i);
  assert.match(bad.stdout, /stock phrase/i);

  const good = checkCopy("One task keeps taking your time. Start with a review of that task. You will see each step, check, and stop. Read the case study before you choose.");
  assert.equal(good.status, 0, good.stdout || good.stderr);
  assert.match(good.stdout, /Copy check passed/);
});
