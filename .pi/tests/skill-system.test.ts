import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const SKILLS = ".pi/skills";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function readRequired(path: string): string {
  assert.ok(existsSync(path), `required artifact is missing: ${path}`);
  return read(path);
}

function actualSkillNames(): string[] {
  return readdirSync(SKILLS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(`${SKILLS}/${entry.name}/SKILL.md`))
    .map((entry) => entry.name)
    .sort();
}

function manifestSkillNames(): string[] {
  const manifest = JSON.parse(read(`${SKILLS}/manifest.json`)) as {
    tiers: Record<string, { skills: string[] }>;
  };
  return Object.values(manifest.tiers)
    .flatMap((tier) => tier.skills)
    .sort();
}

const orchestrationSurfaces = [
  ".pi/prompts/audit.md",
  ".pi/prompts/create.md",
  ".pi/prompts/gc.md",
  ".pi/prompts/plan.md",
  ".pi/prompts/research.md",
  ".pi/prompts/ship.md",
  ".pi/workflows/audit-pattern.md",
  ".pi/workflows/batch-implement.md",
  ".pi/workflows/deep-research.md",
  ".pi/workflows/development-lifecycle-workflow.md",
  ".pi/workflows/garbage-collection.md",
  ".pi/skills/subagent-driven-development/SKILL.md",
];

test("manifest has exact bidirectional parity with skill directories", () => {
  const manifestNames = manifestSkillNames();
  assert.equal(new Set(manifestNames).size, manifestNames.length, "manifest contains duplicate skill names");
  assert.deepEqual(manifestNames, actualSkillNames());
});

test("organize-workspace is inventory-first and confirmation-gated", () => {
  const path = ".pi/skills/organize-workspace/SKILL.md";
  const skill = readRequired(path);
  assert.match(skill, /inventory[\s\S]*classify[\s\S]*propose[\s\S]*confirm[\s\S]*act[\s\S]*verify/i);
  assert.match(skill, /report[- ]only|inventory[- ]only/i);
  assert.match(skill, /explicit confirmation/i);
  assert.match(skill, /source[\s\S]*configuration[\s\S]*(credential|secret)[\s\S]*\.git[\s\S]*\.pi\/artifacts[\s\S]*symlink[\s\S]*ambiguous/i);
  assert.match(skill, /never|prohibit/i);
});

test("define-language produces evidence-backed terminology without forcing storage", () => {
  const path = ".pi/skills/define-language/SKILL.md";
  const skill = readRequired(path);
  assert.match(skill, /collect evidence[\s\S]*group concepts[\s\S]*(collision|conflict)[\s\S]*canonical term[\s\S]*alias[\s\S]*validate/i);
  assert.match(skill, /meaning/i);
  assert.match(skill, /accepted alias/i);
  assert.match(skill, /rejected|ambiguous/i);
  assert.match(skill, /unresolved question/i);
  assert.match(skill, /only when the caller|caller names a destination/i);
});

test("adopted skills do not import the Bigpowers cockpit", () => {
  const text = [
    readRequired(".pi/skills/organize-workspace/SKILL.md"),
    readRequired(".pi/skills/define-language/SKILL.md"),
  ].join("\n");
  assert.doesNotMatch(text, /specs\/state\.yaml|release-plan\.yaml|execution-status\.yaml|\.bigpowers\//i);
});

test("blast radius and boundary patterns are wired into existing local skills", () => {
  assert.match(read(".pi/skills/planning-and-task-breakdown/SKILL.md"), /blast[- ]radius/i);
  assert.match(read(".pi/skills/api-and-interface-design/SKILL.md"), /boundary validation/i);
});

test("delegation and handoff patterns are wired into existing local skills", () => {
  const delegation = read(".pi/skills/subagent-driven-development/SKILL.md");
  assert.match(delegation, /direct-first/i);
  assert.match(delegation, /task_brief/);
  assert.match(delegation, /result/);
  assert.match(delegation, /sequential shard/i);

  const lifecycle = read(".pi/skills/development-lifecycle/SKILL.md");
  assert.match(lifecycle, /handoff/i);
  assert.match(lifecycle, /progress\.md|worker-context\.md/);
});

test("adapted material has pinned MIT attribution", () => {
  const notice = readRequired(".pi/skills/THIRD_PARTY_NOTICES.md");
  assert.match(notice, /danielvm-git\/bigpowers/);
  assert.match(notice, /d1993d31437bfbdb5bda81e84650628215365754/);
  assert.match(notice, /MIT/);
});

function fanoutLabel(path: string): string {
  const name = path.split("/").at(-1)?.replace(/\.md$/, "") ?? path;
  if (path.includes("/prompts/")) return `${name} prompt`;
  if (path.includes("/workflows/")) return `${name} workflow`;
  return "subagent coordination skill";
}

for (const path of orchestrationSurfaces) {
  test(`${fanoutLabel(path)} fan-out stays within one-to-three agents`, () => {
    const text = read(path);
    const errors: string[] = [];
    const concurrencyLines = text.split("\n").filter((line) => /concurrenc|agents? per wave|review calls|issue .*calls?/i.test(line));
    for (const line of concurrencyLines) {
      const maxMatch = line.match(/max(?:imum)?\s*[:=]?\s*(\d+)/i);
      if (maxMatch && Number(maxMatch[1]) > 3) errors.push(line.trim());
      if (/3-5 agents|five distinct review|issue one call per independent finding together|one call per task.*max 10/i.test(line)) {
        errors.push(line.trim());
      }
    }
    if (!/(at most three|max(?:imum)?\s*[:=]?\s*3|one to three|one-to-three|1–3|1-3)/i.test(text)) {
      errors.push("missing explicit max-three wave policy");
    }
    if (!/sequential[^\n]{0,80}shard|shard[^\n]{0,80}sequential/i.test(text)) {
      errors.push("missing sequential sharding for overflow");
    }
    assert.deepEqual(errors, [], path);
  });
}

test("subagent coordination remains Pi-native and parent-verified", () => {
  for (const path of orchestrationSurfaces) {
    const text = read(path);
    assert.match(text, /pi-subagents/i, path);
    assert.match(text, /omit [^\n]*model[^\n]*thinking/i, path);
    assert.match(text, /parent[^\n]*(inspect|synthesi|verif)|(?:inspect|synthesi|verif)[^\n]*parent/i, path);
  }
});
