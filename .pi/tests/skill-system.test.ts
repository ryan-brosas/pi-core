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
  ".pi/skills/source-driven-development/SKILL.md",
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

test("graph producers use one canonical task graph", () => {
  const create = readRequired(".pi/prompts/create.md");
  const plan = readRequired(".pi/prompts/plan.md");
  const lifecycle = readRequired(".pi/skills/development-lifecycle/SKILL.md");
  assert.match(create, /version 2[\s\S]*attempt[\s\S]*evidence_refs/i);
  assert.match(create, /task-graph[^\n]*validate/i);
  assert.match(plan, /tasks\.json[^\n]*authoritative/i);
  assert.match(plan, /derived[^\n]*wave/i);
  assert.match(plan, /(task id|task IDs)[^\n]*diverg/i);
  assert.match(lifecycle, /tasks\.json[^\n]*authoritative/i);
  assert.match(lifecycle, /four canonical/i);
});

test("ship executes a validated dynamic frontier", () => {
  const ship = readRequired(".pi/prompts/ship.md");
  const batch = readRequired(".pi/workflows/batch-implement.md");
  const delegation = readRequired(".pi/skills/subagent-driven-development/SKILL.md");
  assert.match(ship, /task-graph[^\n]*validate/i);
  assert.match(ship, /task-graph[^\n]*frontier/i);
  assert.match(ship, /recompute[^\n]*frontier/i);
  assert.match(ship, /conflict-free[^\n]*shard/i);
  assert.match(ship, /transient[^\n]*(neighborhood|code\/test)/i);
  assert.match(ship, /explicit[^\n]*slug/i);
  assert.match(batch, /parent-selected[^\n]*ready[^\n]*shard/i);
  assert.match(batch, /rerun[^\n]*(validate|frontier)/i);
  assert.match(delegation, /validated[^\n]*ready[^\n]*shard/i);
  assert.match(delegation, /(?:must not|forbid)[^\n]*(schedule|\.active)/i);
});

test("graph state is evidence-linked and selectively invalidated", () => {
  const ship = readRequired(".pi/prompts/ship.md");
  const verify = readRequired(".pi/prompts/verify.md");
  const combined = `${ship}\n${verify}`;
  assert.match(combined, /increment[^\n]*attempt/i);
  assert.match(combined, /current-attempt[^\n]*evidence|evidence[^\n]*current attempt/i);
  assert.match(combined, /descendants/i);
  assert.match(combined, /pending[^\n]*blocked/i);
  assert.match(combined, /passed[^\n]*(stale|invalid)/i);
  assert.match(combined, /ancestors?[^\n]*(remain|unchanged|never reopen)/i);
  assert.match(combined, /revalidate[^\n]*(recompute|frontier)/i);
});

function fanoutLabel(path: string): string {
  const parts = path.split("/");
  const name = parts.at(-1)?.replace(/\.md$/, "") ?? path;
  if (path.includes("/prompts/")) return `${name} prompt`;
  if (path.includes("/workflows/")) return `${name} workflow`;
  return `${parts.at(-2) ?? name} skill`;
}

const dispatchNouns = "(?:agents?|subagents?|reviewers?|workers?|scouts?|(?:pi-)?subagents?\\s+calls?|(?:agent|review|worker|scout)[\\w-]*\\s+calls?)";
const spelledAboveThree = "(?:four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[-\\s](?:one|two|three|four|five|six|seven|eight|nine))?)|hundred)";
const numericDispatchCount = new RegExp(`\\b(\\d+)\\b(?:\\s+(?!\\d+\\b)[\\w-]+){0,2}\\s+${dispatchNouns}\\b`, "ig");
const spelledDispatchCount = new RegExp(`\\b${spelledAboveThree}\\b(?:\\s+[\\w-]+){0,2}\\s+${dispatchNouns}\\b`, "i");

function explicitDispatchCountErrors(text: string): string[] {
  const errors: string[] = [];
  for (const line of text.split("\n")) {
    for (const numeric of line.matchAll(numericDispatchCount)) {
      if (Number(numeric[1]) > 3) errors.push(line.trim());
    }
    const concurrencyMax = line.match(/\bmax(?:imum)?\s*[:=]?\s*(\d+)\s*(?=\)|,|[.;]?$)/i);
    if (/^\s*-\s*\*\*Concurrency:\*\*/i.test(line) && concurrencyMax && Number(concurrencyMax[1]) > 3) errors.push(line.trim());
    if (spelledDispatchCount.test(line) || /3-5 agents|five distinct review|issue one call per independent finding together|one call per task.*max 10/i.test(line)) {
      errors.push(line.trim());
    }
  }
  return [...new Set(errors)];
}

test("fan-out detector rejects every explicit agent count above three", () => {
  assert.deepEqual(explicitDispatchCountErrors("Spawn 11 scouts together."), ["Spawn 11 scouts together."]);
  assert.deepEqual(explicitDispatchCountErrors("Dispatch fifteen review agents."), ["Dispatch fifteen review agents."]);
  assert.deepEqual(explicitDispatchCountErrors("Dispatch twenty-one agents."), ["Dispatch twenty-one agents."]);
  assert.deepEqual(explicitDispatchCountErrors("Issue 5 pi-subagents calls."), ["Issue 5 pi-subagents calls."]);
  assert.deepEqual(explicitDispatchCountErrors("Use 3 scouts initially, then spawn 11 scouts together."), ["Use 3 scouts initially, then spawn 11 scouts together."]);
  assert.deepEqual(explicitDispatchCountErrors("Use between 3 and 11 agents."), ["Use between 3 and 11 agents."]);
  assert.deepEqual(explicitDispatchCountErrors("- **Concurrency:** Dynamic (one shard per agent, min 1, max 15)"), ["- **Concurrency:** Dynamic (one shard per agent, min 1, max 15)"]);
});

test("fan-out detector ignores unrelated budgets even on agent lines", () => {
  const text = "Budget: maximum 100 tool calls.\nAllow 10 API calls.\nCreate AGENTS.md with max 150 lines.\nDispatch one scout with maximum 100 tool calls.\nDispatch one agent to create AGENTS.md with max 150 lines.\n- **Concurrency:** one agent with maximum 100 tool calls.";
  assert.deepEqual(explicitDispatchCountErrors(text), []);
});

for (const path of orchestrationSurfaces) {
  test(`${fanoutLabel(path)} fan-out stays within one-to-three agents`, () => {
    const text = read(path);
    const errors = explicitDispatchCountErrors(text);
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
