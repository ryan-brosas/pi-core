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
  ".pi/prompts/fix.md",
  ".pi/prompts/gc.md",
  ".pi/prompts/init.md",
  ".pi/prompts/plan.md",
  ".pi/prompts/research.md",
  ".pi/prompts/ship.md",
  ".pi/prompts/verify.md",
  ".pi/workflows/audit-pattern.md",
  ".pi/workflows/batch-implement.md",
  ".pi/workflows/deep-research.md",
  ".pi/workflows/development-lifecycle-workflow.md",
  ".pi/workflows/garbage-collection.md",
  ".pi/skills/code-review-and-quality/SKILL.md",
  ".pi/skills/development-lifecycle/SKILL.md",
  ".pi/skills/planning-and-task-breakdown/SKILL.md",
  ".pi/skills/source-driven-development/SKILL.md",
  ".pi/skills/subagent-driven-development/SKILL.md",
  ".pi/skills/verification-before-completion/SKILL.md",
  ".pi/skills/writing-skills/SKILL.md",
];

test("manifest has exact bidirectional parity with skill directories", () => {
  const manifestNames = manifestSkillNames();
  assert.equal(new Set(manifestNames).size, manifestNames.length, "manifest contains duplicate skill names");
  assert.deepEqual(manifestNames, actualSkillNames());
});

test("skills do not retain deleted profile metadata", () => {
  for (const name of actualSkillNames()) {
    assert.doesNotMatch(readRequired(`${SKILLS}/${name}/SKILL.md`), /^agent_types:/m, name);
  }
});

test("writing-skill references use Fabric children only", () => {
  for (const path of [
    ".pi/skills/writing-skills/references/testing-methodology.md",
    ".pi/skills/writing-skills/references/claude-search-optimization.md",
  ]) {
    const text = readRequired(path);
    assert.doesNotMatch(text, /pi-subagents|subagent_type|\bAgent\s*\(/i, path);
    assert.match(text, /agents\.run/i, path);
    assert.match(text, /fabric_exec/i, path);
  }
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

test("research prompt always persists a research artifact", () => {
  const research = readRequired(".pi/prompts/research.md");
  assert.match(research, /always persist/i);
  assert.match(research, /active slug[^\n]*(demonstrably related|matches)[^\n]*progress\.md/i);
  assert.match(research, /(missing|invalid|unrelated)[\s\S]*derive[^\n]*slug[\s\S]*research\.md/i);
  assert.match(research, /do not (change|overwrite)[^\n]*\.active/i);
  assert.doesNotMatch(research, /otherwise return the report directly without writing an artifact/i);
});

test("init policy synthesis preserves evidence and existing content", () => {
  const init = readRequired(".pi/prompts/init.md");
  assert.match(init, /read\(\"\.pi\/templates\/agents-policy\.md\"\)/i);
  const scaffoldRead = init.indexOf('read(".pi/templates/agents-policy.md")');
  const previewStart = init.indexOf("### Phase 2: Preview Detection and Merge");
  assert.ok(scaffoldRead >= 0 && previewStart >= 0 && scaffoldRead < previewStart, "policy scaffold must load before preview classification");
  assert.match(init, /mandatory[\s\S]*project-detected[\s\S]*conditional[\s\S]*conflicting[\s\S]*preserved-custom/i);
  assert.match(init, /project\/configuration evidence[\s\S]*executable validation/i);
  assert.match(init, /preserved sections[\s\S]*repairs[\s\S]*omissions[\s\S]*line-budget exception/i);
  assert.match(init, /never (blindly )?(replace|overwrite)|without blind replacement/i);
  assert.match(init, /cancel[\s\S]*no target file/i);
  assert.match(init, /new AGENTS\.md[\s\S]*150 lines/i);
  assert.match(init, /existing file[\s\S]*preserve[\s\S]*minimize[\s\S]*exception[\s\S]*(never|do not) trunca/i);
});

test("init policy safety requires fresh Git approval", () => {
  const init = readRequired(".pi/prompts/init.md");
  assert.doesNotMatch(init, /Auto-commit/i);
  assert.match(init, /fresh confirmation[\s\S]*commit[\s\S]*(push|publication)/i);
  assert.match(init, /legacy-branch synchronization|legacy branch synchronization/i);
  assert.match(init, /project\/configuration evidence[\s\S]*executable validation/i);
});

test("init policy activation requires reload or a new session", () => {
  const init = readRequired(".pi/prompts/init.md");
  assert.match(init, /\/reload[\s\S]*new session|new session[\s\S]*\/reload/i);
  assert.match(init, /not (yet )?active|does not claim[\s\S]*active/i);
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

test("init policy scaffold carries universal gates without project assumptions", () => {
  const scaffold = readRequired(".pi/templates/agents-policy.md");
  const lines = scaffold.trimEnd().split(/\r?\n/);
  assert.ok(lines.length <= 150, "scaffold exceeds 150 lines: " + lines.length);
  assert.match(scaffold, /inert source scaffold[\s\S]*explicitly read by \/init/i);
  assert.match(scaffold, /user authority/i);
  assert.match(scaffold, /system\/platform safety/i);
  assert.match(scaffold, /requested scope/i);
  assert.match(scaffold, /never delete a file or directory without written permission naming the paths/i);

  const destructiveTerms = ["preflight", "first written confirmation", "refreshed preflight", "second immediate confirmation", "exact execution", "audit"];
  let destructiveCursor = -1;
  for (const term of destructiveTerms) {
    const next = scaffold.toLowerCase().indexOf(term, destructiveCursor + 1);
    assert.ok(next > destructiveCursor, `missing or out-of-order destructive term: ${term}`);
    destructiveCursor = next;
  }

  assert.match(scaffold, /preserve concurrent and unrelated work/i);
  assert.match(scaffold, /do not stash, reset, restore, rebase away, or overwrite other changes/i);
  assert.match(scaffold, /do not branch, create worktrees, commit, merge, push, or deploy without explicit approval/i);
  assert.match(scaffold, /each action needs fresh confirmation; no standing authorization/i);
  assert.match(scaffold, /prefer manual targeted edits/i);
  assert.match(scaffold, /avoid speculative file proliferation/i);
  assert.match(scaffold, /edit the authoritative source[\s\S]*regenerate[\s\S]*review the output/i);
  assert.match(scaffold, /evidence before completion[\s\S]*narrowest[\s\S]*broader checks/i);
  assert.match(scaffold, /do not claim completion without observable evidence/i);
  assert.match(scaffold, /delegate only when useful and keep it bounded[\s\S]*parent-verified/i);
  assert.match(scaffold, /parent inspection and verification remain required/i);
  assert.doesNotMatch(scaffold, /bun|node\.js|main branch|primary branch|npm|pnpm|yarn|lockfile|verify command|AGENTS\.md path|fallow|beads|mcp agent mail|\bbv\b|\bubs\b|\brch\b|\bdcg\b|\bmorph\b/i);
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

test("Fabric coordination remains direct-first and parent-verified", () => {
  for (const path of orchestrationSurfaces) {
    const text = read(path);
    assert.match(text, /fabric_exec/i, path);
    assert.match(text, /agents\.run/i, path);
    assert.doesNotMatch(text, /pi-subagents|subagent_type|\bAgent\s*\(/i, path);
    assert.match(text, /parent[^\n]*(inspect|synthesi|verif)|(?:inspect|synthesi|verif)[^\n]*parent/i, path);
  }
});

test("legacy Pi-subagent project configuration is absent", () => {
  for (const path of [
    ".pi/agents/Explore.md",
    ".pi/agents/Plan.md",
    ".pi/agents/build.md",
    ".pi/agents/general.md",
    ".pi/agents/review.md",
    ".pi/agents/scout.md",
    ".pi/agents/vision.md",
    ".pi/subagents.json",
  ]) {
    assert.equal(existsSync(path), false, `legacy Pi-subagent artifact remains: ${path}`);
  }
  const fabric = JSON.parse(readRequired(".pi/fabric.json")) as { agents?: { enabled?: boolean } };
  assert.equal(fabric.agents?.enabled, true, "Fabric agents must be enabled");
});

test("ship routes bounded Fabric workers with self-contained contracts", () => {
  const ship = readRequired(".pi/prompts/ship.md");
  const batch = readRequired(".pi/workflows/batch-implement.md");
  const delegation = readRequired(".pi/skills/subagent-driven-development/SKILL.md");
  for (const [path, text] of [["ship", ship], ["batch", batch], ["delegation", delegation]] as const) {
    assert.match(text, /agents\.run/i, path);
    assert.match(text, /ship-worker envelope/i, path);
    assert.match(text, /task (?:ID|id)[^\n]*attempt|attempt[^\n]*task (?:ID|id)/i, path);
    assert.match(text, /exact files|files in scope/i, path);
    assert.match(text, /non-goals/i, path);
    assert.match(text, /acceptance criteria/i, path);
    assert.match(text, /tools/i, path);
    assert.match(text, /verification/i, path);
    assert.match(text, /stop conditions/i, path);
    assert.match(text, /parent[^\n]*(?:inspect|verify)|(?:inspect|verify)[^\n]*parent/i, path);
    assert.doesNotMatch(text, /subagent_type|\bAgent\s*\(/i, path);
  }
});

test("ship honors project approval gates", () => {
  const ship = readRequired(".pi/prompts/ship.md");
  const batch = readRequired(".pi/workflows/batch-implement.md");
  const delegation = readRequired(".pi/skills/subagent-driven-development/SKILL.md");
  for (const [path, text] of [["ship", ship], ["batch", batch], ["delegation", delegation]] as const) {
    assert.match(text, /explicit approval/i, path);
    assert.match(text, /checkpoint/i, path);
    assert.match(text, /branch[^\n]*worktree|worktree[^\n]*branch/i, path);
    assert.match(text, /commit[^\n]*(?:merge|integrat)|(?:merge|integrat)[^\n]*commit/i, path);
    assert.match(text, /dependenc[^\n]*new file|new file[^\n]*dependenc/i, path);
    assert.match(text, /\.active|active artifact/i, path);
  }
  assert.doesNotMatch(ship, /Set up the workspace: create branch, install deps if needed/i);
  assert.doesNotMatch(ship, /Commit before close[^\n]*required/i);
});

test("planning advisory uses one foreground Fabric run", () => {
  const planPrompt = readRequired(".pi/prompts/plan.md");
  const heading = "### Planning Worker Routing";
  const start = planPrompt.indexOf(heading);
  assert.notEqual(start, -1, "missing planning worker routing section");
  const rest = planPrompt.slice(start + heading.length);
  const next = rest.search(/\n#{2,3}\s/);
  const section = rest.slice(0, next === -1 ? undefined : next);
  const calls = [...section.matchAll(/agents\.run\s*\(\s*\{[\s\S]*?\}\s*\)/g)].map((match) => match[0]);
  assert.equal(calls.length, 1, "expected one concrete foreground Fabric planning call");
  const call = calls[0];
  assert.match(call, /name:\s*["']planning-advisor["']/);
  assert.match(call, /task:\s*planningEnvelope/);
  assert.match(call, /tools:\s*\[[^\]]*"read"[^\]]*"grep"[^\]]*"find"[^\]]*"ls"[^\]]*\]/);
  assert.doesNotMatch(section, /agents\.spawn|Promise\.all/);

  assert.match(planPrompt, /parent plans inline by default/i);
  assert.match(planPrompt, /material ambiguity/i);
  assert.match(planPrompt, /architectural trade-offs?/i);
  assert.match(planPrompt, /cross-subsystem sequencing/i);
  assert.match(planPrompt, /(?:skip|skips|decline)[^\n]*rationale|rationale[^\n]*(?:skip|skips|decline)/i);
  assert.match(planPrompt, /foreground[^\n]*(?:depends|dependency|next decision)|(?:depends|dependency|next decision)[^\n]*foreground/i);
  assert.match(planPrompt, /resolved[^\n]*self-contained[^\n]*envelope|self-contained[^\n]*resolved[^\n]*envelope/i);
});

test("plan prompt keeps canonical and lifecycle writes parent-owned", () => {
  const planPrompt = readRequired(".pi/prompts/plan.md");
  const section = (heading: string): string => {
    const start = planPrompt.indexOf(heading);
    assert.notEqual(start, -1, `missing /plan section: ${heading}`);
    const contentStart = start + heading.length;
    const next = planPrompt.indexOf("\n## ", contentStart);
    return planPrompt.slice(contentStart, next === -1 ? undefined : next);
  };

  const envelope = section("### Planning Envelope");
  assert.match(envelope, /chat-only advisory/i);
  assert.match(envelope, /canonical graph and input paths/i);
  assert.match(envelope, /dependencies and prior decisions/i);
  assert.match(envelope, /resolved research/i);
  assert.match(envelope, /remaining gaps/i);
  assert.match(envelope, /include only task-relevant evidence/i, "planning envelope must minimize context");
  assert.match(envelope, /never include[^\n]*credentials[^\n]*secrets[^\n]*private conversation[^\n]*unrelated user data/i);
  assert.doesNotMatch(envelope, /updated\s+`?plan\.md`?/i);
  assert.doesNotMatch(envelope, /updated\s+`?tasks\.json`?/i);

  assert.match(planPrompt, /parent alone (?:writes|updates|validates)[^\n]*`plan\.md`[^\n]*`tasks\.json`/i);
  assert.match(planPrompt, /invoking `?\/plan`?[^\n]*(?:authorizes|permits)[^\n]*first[^\n]*`plan\.md`/i);
  assert.match(planPrompt, /overwrit(?:e|ing)[^\n]*`plan\.md`[^\n]*explicit approval/i);
  assert.match(planPrompt, /unrelated (?:extra )?files?[^\n]*explicit approval/i);

  const handoff = section("## Phase 9: Handoff to `/ship`");
  assert.match(handoff, /`\.active` remains unchanged/i);
  assert.match(handoff, /exceptional[^\n]*parent-owned[^\n]*explicit approval/i);
  assert.doesNotMatch(handoff, /those are `?\/ship`? responsibilities/i);
});

test("planning skill conditionally routes bounded Fabric advice", () => {
  const skill = readRequired(".pi/skills/planning-and-task-breakdown/SKILL.md");
  const start = skill.indexOf("## Fabric Planning Inputs");
  assert.notEqual(start, -1, "planning skill is missing Fabric Planning Inputs");
  const next = skill.indexOf("\n## ", start + 1);
  const inputs = skill.slice(start, next === -1 ? undefined : next);

  assert.match(inputs, /direct parent planning is the default/i);
  assert.match(inputs, /agents\.run/i);
  assert.match(inputs, /name:\s*["']planning-advisor["']/);
  assert.match(inputs, /material ambiguity/i);
  assert.match(inputs, /architectural trade-offs?/i);
  assert.match(inputs, /cross-subsystem sequencing/i);
  assert.match(inputs, /local evidence/i);
  assert.match(inputs, /external evidence/i);
  assert.match(inputs, /foreground[^\n]*(?:blocks|depends)|(?:blocks|depends)[^\n]*foreground/i);
  assert.match(inputs, /advisory (?:input|output|result)/i);
  assert.doesNotMatch(inputs, /subagent_type|\bAgent\s*\(/i);
});

test("planning ownership remains with the parent", () => {
  const skill = readRequired(".pi/skills/planning-and-task-breakdown/SKILL.md");
  assert.match(skill, /parent[^\n]*(?:verifies|validates)[^\n]*evidence/i);
  assert.match(skill, /parent[^\n]*resolves conflicts/i);
  assert.match(skill, /parent alone writes[^\n]*`plan\.md`[^\n]*`tasks\.json`/i);
  assert.match(skill, /parent[^\n]*owns lifecycle state/i);
  assert.match(skill, /worker[^\n]*advisory (?:input|output|result)/i);
});

test("Fabric delegation policy defines task-shaped routing", () => {
  const policy = readRequired(".pi/agent-tool-description.md");
  assert.match(policy, /agents\.run/i);
  assert.match(policy, /architecture|cross-subsystem/i);
  assert.match(policy, /surgical|well-bounded|bounded implementation/i);
  assert.match(policy, /larger|substantial/i);
  assert.match(policy, /read-only/i);
  assert.match(policy, /explicit[^\n]*tools|tools[^\n]*allowlist/i);
  assert.match(policy, /direct[^\n]*default|default[^\n]*direct/i);
  assert.match(policy, /\/ship[^\n]*(?:stricter|require|worker|routing)/i);
  assert.match(policy, /without[^\n]*transfer|not[^\n]*transfer[^\n]*ownership|ownership[^\n]*(?:retain|unchanged|not transfer)/i);
  assert.doesNotMatch(policy, /pi-subagents|subagent_type|\bAgent\s*\(/i);
  assert.doesNotMatch(policy, /agents\.spawn/i, "ordinary delegation must stay awaited and parent-observable");
});

test("Fabric research children have explicit network tools and parent-owned evidence", () => {
  const skill = readRequired(".pi/skills/source-driven-development/SKILL.md");
  assert.match(skill, /agents\.run/i);
  assert.match(skill, /tools:\s*\[[^\]]*context7\.resolve-library-id[^\]]*context7\.query-docs[^\]]*\]/i);
  assert.match(skill, /agents\.run[^\n]*(?:does not|never)[^\n]*(?:provider|research) evidence/i);
  assert.match(skill, /parent[^\n]*direct(?:ly)?[^\n]*(?:provider|source tool)/i);
});

test("plan writer boundary keeps canonical plan.md and tasks.json parent-owned", () => {
  const planPrompt = readRequired(".pi/prompts/plan.md");
  assert.match(
    planPrompt,
    /never hand(?:ed)?[^\n]*planning advisory[^\n]*(?:render|write)[^\n]*(?:`?plan\.md`?[^\n]*`?tasks\.json`?|`?tasks\.json`?[^\n]*`?plan\.md`?)/i,
    "planning advisory output must never be handed to a child to write canonical plan.md or tasks.json",
  );
  const routingStart = planPrompt.indexOf("### Planning Worker Routing");
  const routingEnd = planPrompt.indexOf("\n## ", routingStart);
  const routing = planPrompt.slice(routingStart, routingEnd === -1 ? undefined : routingEnd);
  assert.doesNotMatch(routing, /"edit"|"write"|worktree:\s*true/i, "planning advisory must remain read-only");
});

test("ship primary worker dispatches one foreground Fabric run", () => {
  const ship = readRequired(".pi/prompts/ship.md");
  const heading = "### Primary Worker Dispatch";
  const start = ship.indexOf(heading);
  assert.notEqual(start, -1, "missing primary worker dispatch section");
  assert.equal(ship.split(heading).length - 1, 1, "primary worker dispatch heading must be unique");

  const contentStart = start + heading.length;
  const rest = ship.slice(contentStart);
  const nextHeading = rest.match(/\n#{1,3}\s/);
  const section = rest.slice(0, nextHeading ? nextHeading.index : rest.length);
  const tsBlocks = [...section.matchAll(/```(?:typescript|ts)\n([\s\S]*?)\n```/g)].map((match) => match[1]);
  assert.equal(tsBlocks.length, 1, "expected exactly one fenced TypeScript block in the primary worker dispatch section");
  const block = tsBlocks[0];
  const calls = [...block.matchAll(/agents\.run\s*\(\s*\{[\s\S]*?\}\s*\)/g)].map((match) => match[0]);
  assert.equal(calls.length, 1, "expected exactly one agents.run call in the primary worker dispatch block");
  const call = calls[0];
  assert.match(call, /name:\s*(?:`[^`]+`|"[^"]+")/);
  assert.match(call, /task:\s*shipWorkerEnvelope/);
  assert.match(call, /tools:\s*workerTools/);
  assert.doesNotMatch(call, /worktree:\s*true|recursive:\s*true/);

  const callIndex = block.indexOf(call);
  const beforeCall = block.slice(0, callIndex);
  assert.match(beforeCall, /const\s+workerTools\s*=/, "worker tool allowlist must be resolved before dispatch");
  const unresolvedGuard = /^If any unresolved architecture, security, migration, scope, or approval question remains, stop before worker selection\.$/m;
  const guardIndex = section.search(unresolvedGuard);
  assert.notEqual(guardIndex, -1, "primary dispatch must stop for every unresolved decision class");
  assert.ok(guardIndex < section.indexOf("```"), "unresolved-decision guard must occur before the dispatch code fence");
});

test("planning boundaries and testability contract is conditional", () => {
  const fencedTemplate = (document: string, heading: string, opener: string, closer: string): string => {
    const sectionStart = document.indexOf(heading);
    assert.notEqual(sectionStart, -1, `missing template section: ${heading}`);
    const start = document.indexOf(opener, sectionStart);
    assert.notEqual(start, -1, `missing template opener after: ${heading}`);
    const end = document.indexOf(closer, start + opener.length);
    assert.notEqual(end, -1, `missing template closer after: ${heading}`);
    return document.slice(start + opener.length, end);
  };

  const surfaces = {
    "plan prompt": {
      text: fencedTemplate(readRequired(".pi/prompts/plan.md"), "### Required Plan Header", "````markdown", "````"),
      heading: /^### Boundaries and Testability \(conditional\)$/m,
    },
    "planning skill": {
      text: fencedTemplate(readRequired(".pi/skills/planning-and-task-breakdown/SKILL.md"), "## Plan Template", "```", "```"),
      heading: /^## Boundaries and Testability \(conditional\)$/m,
    },
  };

  for (const [label, { text, heading }] of Object.entries(surfaces)) {
    assert.equal((text.match(/Boundaries and Testability/g) ?? []).length, 1, `${label} must contain the section exactly once`);
    assert.match(text, heading, `${label} must use its template-level heading`);
    assert.match(
      text,
      /only when[^\n]*introduces or changes[^\n]*module boundary[^\n]*omit it otherwise/i,
      `${label} must make the section conditional`,
    );
    assert.match(text, /black-box and gray-box are verification perspectives, not module-design categories/i);
    assert.match(text, /substitution need/i);
    assert.match(text, /enabling point/i);
    assert.match(text, /real alternative implementation/i);
    assert.match(text, /if any[^\n]*missing[^\n]*(?:do not|must not) add[^\n]*seam/i);
    assert.match(text, /gray-box exceptions?/i);
    assert.match(text, /internal knowledge/i);
    assert.match(text, /why externally observable behavior is insufficient/i);
    assert.match(text, /gray-box knowledge does not justify mocking internals/i);
  }
});

test("PRD success criteria describe externally observable behavior", () => {
  const prd = readRequired(".pi/templates/prd.md");
  const section = (heading: string): string => {
    const start = prd.indexOf(heading);
    assert.notEqual(start, -1, `missing PRD section: ${heading}`);
    const rest = prd.slice(start + heading.length);
    const next = rest.indexOf("\n## ");
    return rest.slice(0, next === -1 ? undefined : next);
  };

  assert.match(section("## Success Criteria"), /externally observable behavior/i);
  assert.doesNotMatch(
    `${section("## Proposed Solution")}\n${section("## Technical Context")}`,
    /externally observable behavior|black-box|gray-box/i,
    "observable-behavior policy must remain scoped to Success Criteria",
  );
});

test("deep module design requires an enabling point for a test seam", () => {
  const skill = readRequired(".pi/skills/deep-module-design/SKILL.md");
  assert.doesNotMatch(skill, /The interface IS the test seam/i);
  assert.match(
    skill,
    /An interface becomes a test seam only when an enabling point can select one behavior or a real alternative\./i,
  );
});

test("Hindsight runtime policy is project-only and non-redundant", () => {
  const config = JSON.parse(readRequired(".pi/hindsight.json")) as {
    setupComplete?: boolean;
    scope?: { mode?: string };
    agentUse?: string;
    banks?: {
      project?: { enabled?: boolean; derive?: string; bankId?: string };
      user?: { enabled?: boolean };
    };
    userRetain?: { mode?: string };
    recall?: { enabled?: boolean };
    retain?: { enabled?: boolean };
    mentalModels?: { inject?: boolean };
  };

  assert.equal(config.setupComplete, true);
  assert.equal(config.scope?.mode, "domain-tagged");
  assert.equal(config.agentUse, "coding");
  assert.deepEqual(config.banks?.project, { enabled: true, derive: "manual", bankId: "pi-coding" });
  assert.equal(config.banks?.user?.enabled, false);
  assert.equal(config.userRetain?.mode, "explicit-only");
  assert.equal(config.recall?.enabled, true);
  assert.equal(config.retain?.enabled, true);
  assert.equal(config.mentalModels?.inject, false, "automatic mental-model injection must be disabled");
});

function retiredMemoryMarkers(): string[] {
  const filename = ["MEMORY", ".md"].join("");
  return [filename, [".opencode", "artifacts", filename].join("/")];
}

function assertNoRetiredMemory(path: string, text: string): void {
  for (const marker of retiredMemoryMarkers()) {
    assert.equal(text.includes(marker), false, `${path} still references retired file memory: ${marker}`);
  }
}

test("parent lifecycle memory policy uses Hindsight", () => {
  const surfaces = {
    "AGENTS.md": readRequired("AGENTS.md"),
    "development lifecycle": readRequired(".pi/skills/development-lifecycle/SKILL.md"),
  };

  for (const [path, text] of Object.entries(surfaces)) {
    assert.match(text, /Hindsight/i, `${path} must name the durable memory authority`);
    assert.match(text, /automatic(?:ally)?[^\n]*recall/i, `${path} must use automatic recall first`);
    assert.match(text, /automatic(?:ally)?[^\n]*retain/i, `${path} must define automatic retain`);
    assertNoRetiredMemory(path, text);
  }

  assert.match(surfaces["AGENTS.md"], /hindsight_recall/i);
  assert.match(surfaces["AGENTS.md"], /hindsight_reflect/i);
  assert.match(surfaces["development lifecycle"], /progress\.md[^\n]*(?:attempt|evidence)|(?:attempt|evidence)[^\n]*progress\.md/i);
});

test("Fabric child Hindsight context is parent-owned", () => {
  const surfaces = {
    "AGENTS.md": readRequired("AGENTS.md"),
    "plan prompt": readRequired(".pi/prompts/plan.md"),
    "ship prompt": readRequired(".pi/prompts/ship.md"),
  };

  for (const [path, text] of Object.entries(surfaces)) {
    assert.match(text, /parent[- ]provided[^\n]*task-relevant[^\n]*Hindsight context|parent[^\n]*task-relevant[^\n]*Hindsight context/i, path);
    assert.match(text, /(?:missing context|context gap)[^\n]*(?:report|return)[^\n]*parent|(?:report|return)[^\n]*(?:missing context|context gap)[^\n]*parent/i, path);
  }

  assert.match(
    Object.values(surfaces).join("\n"),
    /credentials[^\n]*secrets[^\n]*private conversation[^\n]*unrelated user data/i,
    "delegation context must preserve the privacy boundary",
  );
});

test("orchestration surfaces use Hindsight without file memory", () => {
  const contextPaths = [
    ".pi/prompts/create.md",
    ".pi/prompts/plan.md",
    ".pi/prompts/research.md",
    ".pi/prompts/ship.md",
  ];
  const retentionPaths = [
    ".pi/prompts/init.md",
    ".pi/prompts/ship.md",
    ".pi/prompts/verify.md",
  ];

  for (const path of new Set([...contextPaths, ...retentionPaths])) {
    assertNoRetiredMemory(path, readRequired(path));
  }
  for (const path of contextPaths) {
    const text = readRequired(path);
    assert.match(text, /Hindsight/i, path);
    assert.match(text, /automatic(?:ally)?[^\n]*recall/i, path);
    assert.match(text, /hindsight_recall/i, path);
  }
  for (const path of retentionPaths) {
    const text = readRequired(path);
    assert.match(text, /Hindsight/i, path);
    assert.match(text, /automatic(?:ally)?[^\n]*retain/i, path);
    assert.match(text, /hindsight_retain/i, path);
  }
});

test("Hindsight configuration and runtime state are protected", () => {
  for (const path of [".pi/prompts/gc.md", ".pi/workflows/garbage-collection.md"]) {
    const text = readRequired(path);
    assert.match(text, /\.pi\/hindsight\.json/i, path);
    assert.match(text, /\.pi\/hindsight\//i, path);
    assert.match(text, /runtime-managed/i, path);
    assertNoRetiredMemory(path, text);
  }

  const techStack = readRequired(".pi/templates/tech-stack.md");
  assert.match(techStack, /Hindsight/i);
  assertNoRetiredMemory(".pi/templates/tech-stack.md", techStack);
});

test("legacy file memory is absent", () => {
  const artifactPath = [".pi", "artifacts", ["MEMORY", ".md"].join("")].join("/");
  const skillPath = [".pi", "skills", "memory", "SKILL.md"].join("/");
  assert.equal(existsSync(artifactPath), false, `retired memory artifact remains: ${artifactPath}`);
  assert.equal(existsSync(skillPath), false, `retired memory skill remains: ${skillPath}`);
  assert.equal(manifestSkillNames().includes("memory"), false, "retired memory skill remains in manifest");
});
