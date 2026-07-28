import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const skillPath = ".pi/skills/about-page-copywriting/SKILL.md";
const checkerPath = ".pi/skills/about-page-copywriting/scripts/check-copy.mjs";
const skill = readFileSync(skillPath, "utf8");

function checkCopy(copy: string) {
  return spawnSync(process.execPath, [checkerPath], {
    input: copy,
    encoding: "utf8",
  });
}

test("About skill uses the Copyhackers About and research resources", () => {
  assert.match(skill, /how-to-write-about-us-page/i);
  assert.match(skill, /write-an-about-page/i);
  assert.match(skill, /copywriting-research/i);
  assert.match(skill, /one reader/i);
  assert.match(skill, /interviews[\s\S]*reviews[\s\S]*analytics[\s\S]*competitor/i);
});

test("About skill keeps company facts tied to reader trust", () => {
  assert.match(skill, /reader opening[\s\S]*fit and help[\s\S]*bridge[\s\S]*relevant story/i);
  assert.match(skill, /proof near the claim/i);
  assert.match(skill, /Crossheads[\s\S]*skim reader/i);
  assert.match(skill, /bio answers one question/i);
  assert.match(skill, /one primary next step|one primary CTA/i);
  assert.match(skill, /Do not use a logo, quote, photo, name[\s\S]*permission/i);
});

test("About skill blocks hard-to-read and generic AI copy", () => {
  assert.match(skill, /grade 6/i);
  assert.match(skill, /em dash/i);
  assert.match(skill, /colon/i);
  assert.match(skill, /ego-first/i);
  assert.match(skill, /fast-paced world[\s\S]*delve[\s\S]*seamless/i);

  const bad = checkCopy("In today's fast-paced landscape, our visionary team unlocks a seamless journey—one that is not just bold, but world-class.");
  assert.notEqual(bad.status, 0);
  assert.match(bad.stdout, /em dash/i);
  assert.match(bad.stdout, /colon/i);
  assert.match(bad.stdout, /stock phrase/i);

  const good = checkCopy("You need one work step you can trust. Ryan builds small systems with clear checks. Each task can stop when key data is missing. Read a case study to see how that works.");
  assert.equal(good.status, 0, good.stdout || good.stderr);
  assert.match(good.stdout, /Copy check passed/);
});
