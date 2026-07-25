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
  ".pi/prompts/init.md",
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

test("subagent coordination remains Pi-native and parent-verified", () => {
  for (const path of orchestrationSurfaces) {
    const text = read(path);
    assert.match(text, /pi-subagents/i, path);
    assert.match(text, /omit [^\n]*model[^\n]*thinking/i, path);
    assert.match(text, /parent[^\n]*(inspect|synthesi|verif)|(?:inspect|synthesi|verif)[^\n]*parent/i, path);
  }
});

function agentFrontmatter(path: string): string {
  const match = readRequired(path).match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, `agent frontmatter is missing: ${path}`);
  return match[1];
}

function agentBody(path: string): string {
  return readRequired(path).replace(/^---\n[\s\S]*?\n---\n?/, "");
}

test("GLM ship workers expose Fabric", () => {
  const build = agentFrontmatter(".pi/agents/build.md");
  const general = agentFrontmatter(".pi/agents/general.md");
  for (const [path, frontmatter] of [["build", build], ["general", general]] as const) {
    assert.match(frontmatter, /^model: makora\/zai-org\/GLM-5\.2-NVFP4$/m, path);
    assert.match(frontmatter, /^extensions: true$/m, path);
  }
  assert.match(build, /^enabled: true$/m);
});

test("GLM ship workers are bounded executors", () => {
  const build = agentBody(".pi/agents/build.md");
  const general = agentBody(".pi/agents/general.md");
  for (const [path, body] of [["build", build], ["general", general]] as const) {
    assert.match(body, /(?:do not|never|must not)[^\n]*(?:spawn|delegate)[^\n]*agent/i, path);
    assert.match(body, /(?:do not|never|must not)[^\n]*(?:\.active|task graph|tasks\.json|progress\.md|lifecycle)/i, path);
    assert.match(body, /(?:undeclared|outside)[^\n]*files?[^\n]*(?:stop|report)|(?:stop|report)[^\n]*(?:undeclared|outside)[^\n]*files?/i, path);
    assert.match(body, /explicit approval[^\n]*(?:branch|worktree|commit|merge|dependency|new file)/i, path);
  }
  assert.doesNotMatch(build, /you are[^\n]*orchestrator/i);
  assert.doesNotMatch(build, /\.pi\/artifacts\/TODO\.md/i);
});

test("ship routes GLM Fabric workers with self-contained contracts", () => {
  const ship = readRequired(".pi/prompts/ship.md");
  const batch = readRequired(".pi/workflows/batch-implement.md");
  const delegation = readRequired(".pi/skills/subagent-driven-development/SKILL.md");
  assert.match(ship, /(?:larger|substantial)[^\n]*`build`|`build`[^\n]*(?:larger|substantial)/i);
  assert.match(ship, /(?:surgical|one[- ]to[- ]three)[^\n]*`general`|`general`[^\n]*(?:surgical|one[- ]to[- ]three)/i);
  assert.match(batch, /worker_type[\s\S]*build\|general/i);
  assert.match(delegation, /worker_type[\s\S]*build\|general/i);
  for (const [path, text] of [["ship", ship], ["batch", batch], ["delegation", delegation]] as const) {
    assert.match(text, /ship-worker envelope/i, path);
    assert.match(text, /task (?:ID|id)[^\n]*attempt|attempt[^\n]*task (?:ID|id)/i, path);
    assert.match(text, /exact files|files in scope/i, path);
    assert.match(text, /non-goals/i, path);
    assert.match(text, /acceptance criteria/i, path);
    assert.match(text, /fabric_exec/i, path);
    assert.match(text, /verification/i, path);
    assert.match(text, /stop conditions/i, path);
    assert.match(text, /parent[^\n]*(?:inspect|verify)|(?:inspect|verify)[^\n]*parent/i, path);
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

test("plan agent preserves detailed voice and exact runtime contract", () => {
  const frontmatter = agentFrontmatter(".pi/agents/Plan.md");
  for (const expected of [
    "description: Planning agent for architecture, decomposition, and executable implementation plans",
    "tools: read, bash, grep, find, ls",
    "extensions: false",
    "skills: false",
    "model: openai-codex/gpt-5.6-sol",
    "thinking: high",
    "max_turns: 12",
    "prompt_mode: replace",
    "inherit_context: false",
  ]) {
    assert.ok(frontmatter.split("\n").includes(expected), `missing exact Plan frontmatter line: ${expected}`);
  }

  const plan = agentBody(".pi/agents/Plan.md");
  const orderedMarkers = [
    "# Planning Guidelines",
    "## Architecture as Ritual",
    "## Clarity Through Constraint",
    "## Simplicity First",
    "**Ground**",
    "**Calibrate**",
    "**Transform**",
    "**Release**",
    "**Reset**",
  ];
  let previous = -1;
  for (const marker of orderedMarkers) {
    const index = plan.indexOf(marker);
    assert.ok(index > previous, `Plan marker is missing or out of order: ${marker}`);
    previous = index;
  }
  assert.match(plan, /A good plan doesn't predict the future; it creates leverage for the builder\./);
  assert.match(plan, /The body is architecture\. The breath is wiring\. The rhythm is survival\./);
});

test("plan agent output is chat-only and canonical-state safe", () => {
  const plan = agentBody(".pi/agents/Plan.md");
  const section = (heading: string): string => {
    const start = plan.indexOf(heading);
    assert.notEqual(start, -1, `missing Plan section: ${heading}`);
    const contentStart = start + heading.length;
    const next = plan.indexOf("\n## ", contentStart);
    return plan.slice(contentStart, next === -1 ? undefined : next);
  };

  const envelope = section("## Required Planning Envelope");
  for (const expected of [
    "bounded advisory question",
    "canonical graph and input paths",
    "dependencies and prior decisions",
    "resolved research",
    "remaining gaps",
    "chat-only advice",
    "advisory plan draft",
    "proposed task-graph delta",
    "validation findings",
  ]) {
    assert.match(envelope, new RegExp(expected, "i"), `missing Plan envelope contract: ${expected}`);
  }
  assert.doesNotMatch(envelope, /updated\s+`?plan\.md`?/i);
  assert.doesNotMatch(envelope, /updated\s+`?tasks\.json`?/i);
  assert.match(envelope, /include only task-relevant evidence/i);
  assert.match(envelope, /never include[^\n]*credentials[^\n]*secrets[^\n]*private conversation[^\n]*unrelated user data/i);

  const workflow = section("## Workflow");
  assert.match(workflow, /parent-provided[^\n]*`MEMORY\.md` excerpts/i);
  assert.match(workflow, /topic-bounded[^\n]*(?:search|grep)/i);
  assert.doesNotMatch(workflow, /read[^\n]*`MEMORY\.md`[^\n]*prior decisions/i);

  const output = section("## Output");
  assert.equal((output.match(/^### Required Handoff Schema$/gm) ?? []).length, 1);
  assert.doesNotMatch(output, /^### (?:Advisory Response Format|Plan Artifact Structure)$/m);
  assert.match(output, /do not write to `plan\.md`, `tasks\.json`/i);
  assert.doesNotMatch(output, /updated\s+`?plan\.md`?/i);
  assert.doesNotMatch(output, /updated\s+`?tasks\.json`?/i);

  assert.match(plan, /parent alone (?:writes|updates|validates)[^\n]*`plan\.md`[^\n]*`tasks\.json`/i);
  assert.match(plan, /never write or edit[^\n]*`plan\.md`[^\n]*`tasks\.json`[^\n]*`progress\.md`[^\n]*`MEMORY\.md`[^\n]*`\.active`/i);
  assert.match(plan, /never write or edit[^\n]*implementation files[^\n]*Git state[^\n]*dependencies/i);
  assert.match(plan, /(?:do not|never|must not)[^\n]*(?:spawn|delegate|schedule)[^\n]*agents?/i);
});

test("Plan delegation uses one foreground self-contained call", () => {
  const planPrompt = readRequired(".pi/prompts/plan.md");
  const calls = [...planPrompt.matchAll(/Agent\(\{[\s\S]*?\n\s*\}\);/g)]
    .map((match) => match[0])
    .filter((call) => /subagent_type:\s*"Plan"/.test(call));
  assert.equal(calls.length, 1, "expected exactly one concrete Plan Agent call");
  const call = calls[0];
  assert.match(call, /description:\s*(?:`[^`]+`|"[^"]+")/);
  assert.match(call, /prompt:\s*planningEnvelope/);
  assert.doesNotMatch(call, /\b(?:model|thinking|run_in_background)\s*:/);

  assert.match(planPrompt, /parent plans inline by default/i);
  assert.match(planPrompt, /material ambiguity/i);
  assert.match(planPrompt, /architectural trade-offs?/i);
  assert.match(planPrompt, /cross-subsystem sequencing/i);
  assert.match(planPrompt, /(?:skip|skips|decline)[^\n]*rationale|rationale[^\n]*(?:skip|skips|decline)/i);
  assert.match(planPrompt, /foreground[^\n]*(?:depends|dependency|next decision)|(?:depends|dependency|next decision)[^\n]*foreground/i);
  assert.match(planPrompt, /resolved[^\n]*self-contained[^\n]*envelope|self-contained[^\n]*resolved[^\n]*envelope/i);
  assert.doesNotMatch(planPrompt, /Plan\s*(?:→|->)\s*Implement\s*(?:→|->)\s*Review/i);
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

test("planning skill conditionally routes bounded Plan advice", () => {
  const skill = readRequired(".pi/skills/planning-and-task-breakdown/SKILL.md");
  const start = skill.indexOf("## Pi Subagent Inputs");
  assert.notEqual(start, -1, "planning skill is missing Pi Subagent Inputs");
  const next = skill.indexOf("\n## ", start + 1);
  const inputs = skill.slice(start, next === -1 ? undefined : next);

  assert.match(inputs, /direct parent planning is the default/i);
  const calls = [...inputs.matchAll(/Agent\(\{[^\n]*subagent_type:\s*"Plan"[^\n]*\}\);/g)];
  assert.equal(calls.length, 1, "expected one compact Plan advisory call in the planning skill body");
  assert.match(inputs, /material ambiguity/i);
  assert.match(inputs, /architectural trade-offs?/i);
  assert.match(inputs, /cross-subsystem sequencing/i);
  assert.match(inputs, /Explore[^\n]*local evidence|local evidence[^\n]*Explore/i);
  assert.match(inputs, /scout[^\n]*external evidence|external evidence[^\n]*scout/i);
  assert.match(inputs, /foreground[^\n]*(?:blocks|depends)|(?:blocks|depends)[^\n]*foreground/i);
  assert.match(inputs, /advisory (?:input|output|result)/i);
});

test("planning ownership remains with the parent", () => {
  const skill = readRequired(".pi/skills/planning-and-task-breakdown/SKILL.md");
  assert.match(skill, /parent[^\n]*(?:verifies|validates)[^\n]*evidence/i);
  assert.match(skill, /parent[^\n]*resolves conflicts/i);
  assert.match(skill, /parent alone writes[^\n]*`plan\.md`[^\n]*`tasks\.json`/i);
  assert.match(skill, /parent[^\n]*owns lifecycle state/i);
  assert.match(skill, /worker[^\n]*advisory (?:input|output|result)/i);
});

test("agent utilization policy distinguishes Plan, general, build, and lifecycle routing", () => {
  // Global Agent policy must keep conditional Plan, surgical general, substantial bounded build, and lifecycle-specific routing coherent.
  const policy = readRequired(".pi/agent-tool-description.md");

  assert.match(policy, /`?Plan`?[^\n]*(?:ambigu|architect|cross-subsystem)/i);
  assert.match(policy, /`?general`?[^\n]*(?:surgical|well-bounded|bounded)[^\n]*(?:implementation|review|fix)/i);
  assert.match(policy, /`?build`?[^\n]*(?:substantial|larger|bounded)/i, "build role must be defined as substantial/bounded work");
  assert.match(policy, /`?build`?[^\n]*architect[^\n]*(?:resolved|after)/i, "build must be used after resolved architecture");
  assert.match(policy, /direct[^\n]*default|default[^\n]*direct/i, "direct-first must remain the generic default");
  assert.match(policy, /\/ship[^\n]*(?:stricter|require|worker|routing)/i, "lifecycle /ship worker routing must be explicit");
  assert.match(policy, /without[^\n]*transfer|not[^\n]*transfer[^\n]*ownership|ownership[^\n]*(?:retain|unchanged|not transfer)/i, "lifecycle routing must not transfer parent ownership");
});

test("plan writer boundary keeps canonical plan.md and tasks.json parent-owned", () => {
  // /plan must never hand Plan advisory output to general to render or write canonical plan.md or tasks.json.
  const planPrompt = readRequired(".pi/prompts/plan.md");

  assert.match(
    planPrompt,
    /never hand(?:ed)?[^\n]*`?general`?[^\n]*(?:render|write)[^\n]*(?:`?plan\.md`?[^\n]*`?tasks\.json`?|`?tasks\.json`?[^\n]*`?plan\.md`?)/i,
    "Plan advisory output must never be handed to general to render/write canonical plan.md or tasks.json",
  );

  const calls = [...planPrompt.matchAll(/Agent\(\{[\s\S]*?\}\);/g)].map((match) => match[0]);
  const nonAdvisoryCalls = calls.filter((call) => {
    const role = call.match(/subagent_type:\s*([^,\n]+)/)?.[1].trim();
    return !role || !/^["'](?:Plan|Explore|scout)["']$/.test(role);
  });
  assert.equal(nonAdvisoryCalls.length, 0, "/plan concrete calls must use literal advisory/research roles, never an implementation worker or variable role");
});

test("ship primary worker call resolves workerType and dispatches one foreground Agent", () => {
  // /ship primary dispatch must close workerType to general|build and issue one foreground Agent call carrying the ship-worker envelope.
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
  const executableBlock = block
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  const agentCalls = [...executableBlock.matchAll(/Agent\(\{[\s\S]*?\}\);/g)].map((match) => match[0]);
  assert.equal(agentCalls.length, 1, "expected exactly one Agent call in the primary worker dispatch block");
  const call = agentCalls[0];

  assert.match(call, /subagent_type:\s*workerType/, "primary call must use the resolved workerType variable");
  assert.match(call, /description:\s*(?:`[^`]+`|"[^"]+")/, "primary call must carry a concrete description");
  assert.match(call, /prompt:\s*shipWorkerEnvelope/, "primary call must use the shipWorkerEnvelope");
  assert.doesNotMatch(call, /\b(?:model|thinking|run_in_background)\s*:/, "primary call must omit invocation-level model/thinking/background overrides");

  const callIndex = executableBlock.indexOf(call);
  const beforeCall = executableBlock.slice(0, callIndex);
  assert.match(
    beforeCall,
    /^(?!\s*\/\/)\s*const\s+workerType\s*:\s*"general"\s*\|\s*"build"\s*=\s*resolvedWorkerType\s*;\s*$/m,
    "workerType must be an uncommented executable general|build union before the primary call",
  );
  const unresolvedGuard = /if any unresolved architecture, security, migration, scope, or approval question remains,\s*stop before worker selection\./i;
  const guardIndex = section.search(unresolvedGuard);
  assert.notEqual(guardIndex, -1, "primary dispatch must stop for every unresolved decision class");
  assert.ok(guardIndex < section.indexOf("```"), "unresolved-decision guard must occur before the dispatch code fence");
});
