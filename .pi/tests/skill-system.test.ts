import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const SKILLS = ".pi/skills";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function required(path: string): string {
  assert.ok(existsSync(path), `required path is missing: ${path}`);
  return read(path);
}

function skillDirectories(): string[] {
  return readdirSync(SKILLS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(`${SKILLS}/${entry.name}/SKILL.md`))
    .map((entry) => entry.name)
    .sort();
}

function manifestSkills(): string[] {
  const manifest = JSON.parse(read(`${SKILLS}/manifest.json`)) as {
    tiers: Record<string, { skills: string[] }>;
  };
  return Object.values(manifest.tiers).flatMap((tier) => tier.skills).sort();
}

const removedPhaseSurfaces = [
  ".pi/prompts/create.md",
  ".pi/prompts/plan.md",
  ".pi/prompts/ship.md",
  ".pi/prompts/verify.md",
  ".pi/workflows/audit-pattern.md",
  ".pi/workflows/batch-implement.md",
  ".pi/workflows/deep-research.md",
  ".pi/workflows/development-lifecycle-workflow.md",
  ".pi/workflows/garbage-collection.md",
  ".pi/skills/subagent-driven-development/SKILL.md",
];

const survivingPrompts = [
  ".pi/prompts/audit.md",
  ".pi/prompts/fix.md",
  ".pi/prompts/gc.md",
  ".pi/prompts/init.md",
  ".pi/prompts/research.md",
];

test("skill manifest has exact bidirectional parity and valid discoverable frontmatter", () => {
  const actual = skillDirectories();
  const manifest = manifestSkills();
  assert.equal(new Set(manifest).size, manifest.length, "manifest contains duplicate skill names");
  assert.deepEqual(manifest, actual);

  for (const directory of actual) {
    const source = required(`${SKILLS}/${directory}/SKILL.md`);
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/m)?.[1] ?? "";
    assert.match(frontmatter, /^name:\s*[a-z0-9-]+\s*$/m, `${directory}: valid name`);
    assert.match(frontmatter, /^description:\s*\S|^description:\s*>-/m, `${directory}: description`);
    assert.doesNotMatch(frontmatter, /^agent_types:/m, `${directory}: retired profile metadata`);
  }
});

test("phase-gated lifecycle surfaces are removed rather than hidden behind optional wording", () => {
  for (const path of removedPhaseSurfaces) {
    assert.equal(existsSync(path), false, `obsolete phase surface must be deleted: ${path}`);
  }

  for (const path of survivingPrompts) {
    const source = required(path);
    assert.doesNotMatch(source, /\/(?:create|plan|ship|verify)\b/i, path);
    assert.doesNotMatch(source, /(?:create|plan|ship|verify)\s*(?:→|->)\s*(?:create|plan|ship|verify)/i, path);
  }

  const doctor = required(".pi/scripts/doctor.ts");
  for (const path of removedPhaseSurfaces.slice(0, 4)) {
    assert.ok(!doctor.includes(path), `Doctor must not require ${path}`);
  }
});

test("plain-language work uses full Fabric code mode as the core execution path", () => {
  const fabric = JSON.parse(required(".pi/fabric.json")) as {
    fullCodeMode?: boolean;
    prewalk?: { alwaysRearm?: boolean };
  };
  const toolPolicy = required(".pi/agent-tool-description.md");
  const agents = required("AGENTS.md");
  const readme = required("README.md");

  assert.equal(fabric.fullCodeMode, true);
  assert.notEqual(fabric.prewalk?.alwaysRearm, true, "ordinary prompts must not force automatic handoff");
  for (const [label, source] of Object.entries({ toolPolicy, agents, readme })) {
    assert.match(source, /fabric_exec/i, `${label}: Fabric execution`);
    assert.match(source, /pi\.\*/i, `${label}: nested Pi tools`);
    assert.match(source, /one (?:type-checked )?program/i, `${label}: one-program composition`);
    assert.doesNotMatch(source, /orchestration-only/i, `${label}: obsolete mode`);
  }
  assert.match(toolPolicy, /intermediate[\s\S]*(?:sandbox|context)/i);

  // fullCodeMode edits activate only after a reload/new-session boundary, never mid-task.
  for (const [label, source] of Object.entries({ agents, readme })) {
    assert.match(source, /fullCodeMode/i, `${label}: names fullCodeMode`);
    assert.match(source, /final mutation/i, `${label}: final mutation before activation`);
    assert.match(source, /\/reload|new session/i, `${label}: reload or new session`);
    assert.match(source, /live registry|tool surface|boundary|mid-task/i, `${label}: activation boundary`);
  }
});

test("the default is emergent execution, not user-driven workflow classification", () => {
  const agents = required("AGENTS.md");
  const readme = required("README.md");
  const lifecycle = required(".pi/skills/development-lifecycle/SKILL.md");

  for (const [label, source] of Object.entries({ agents, readme })) {
    assert.match(source, /plain[- ]language|describe (?:the )?(?:goal|outcome)|prompt/i, label);
    assert.match(source, /agent (?:chooses|selects)|choose (?:its|the) (?:execution|workflow)/i, label);
    assert.doesNotMatch(source, /\bQuick\b[\s\S]{0,200}\bStandard\b[\s\S]{0,200}\bComplex\b/i, label);
    assert.doesNotMatch(source, /tasks\.json[^\n]*(?:canonical|required|authoritative)/i, label);
  }

  assert.match(lifecycle, /first run[\s\S]*brute force/i);
  assert.match(lifecycle, /second run[\s\S]*(?:selective|temper|prune|compare)/i);
  assert.match(lifecycle, /third run[\s\S]*(?:promote|skill|codif)/i);
  assert.match(lifecycle, /do not load[\s\S]*ordinary/i);
  assert.doesNotMatch(lifecycle, /\/create|\/plan|\/ship|\/verify|tasks\.json/i);
});

test("advanced Fabric topologies remain explicit options while zero agents stays valid", () => {
  const toolPolicy = required(".pi/agent-tool-description.md");
  const readme = required("README.md");

  assert.match(toolPolicy, /zero agents|no child/i);
  assert.match(toolPolicy, /agents\.run/i);
  assert.match(toolPolicy, /independent[\s\S]*(?:Promise\.all|parallel)/i);
  assert.match(readme, /user[- ]invoked|explicitly opt/i);
  assert.match(readme, /\/skill:fabric-(?:guide|workflow)/i);
});

test("policy files keep authority and safety concise", () => {
  for (const path of ["AGENTS.md", ".pi/templates/agents-policy.md"]) {
    const source = required(path);
    const lines = source.split("\n");
    const words = source.trim().split(/\s+/);
    assert.match(source, /user(?:'s)? latest explicit instruction[\s\S]*(?:controls|replace)/i, path);
    assert.match(source, /named (?:request|authorization)[\s\S]*(?:sufficient|authorization)/i, path);
    assert.match(source, /preserve unrelated[\s\S]*(?:concurrent|work)/i, path);
    assert.match(source, /verification|self-verif/i, path);
    assert.ok(lines.length <= 90, `${path}: concise line budget`);
    assert.ok(words.length <= 850, `${path}: concise word budget`);
    assert.ok(Math.max(...lines.map((line) => line.length)) <= 240, `${path}: readable lines`);
  }
});

test("global policy retains runtime, source, and opt-in boundaries", () => {
  const source = required(".pi/templates/agents-policy.md");
  assert.match(source, /PI_CORE_WORKSPACE_POLICY_V1/);
  assert.match(source, /primary checkout[\s\S]*main[\s\S]*(?:branch|worktree)/i);
  assert.match(source, /do not narrate[^\n]*tool[\s\S]*echo[^\n]*file/i);
  assert.match(source, /sources\/[\s\S]*clone[^\n]*(?:repository|source)/i);
  assert.match(source, /fabric_exec[\s\S]*pi\.\*/i);
  assert.match(source, /CodeGraphContext[\s\S]*(?:callers|importers|module dependencies)[\s\S]*verify every hit/i);
  assert.match(source, /graph edge[^\n]*(?:locator|not authority)/i);
  assert.match(source, /current project[\s\S]*reviewed project[\s\S]*inspo/i);
  assert.match(source, /smallest coherent slice[\s\S]*working behavior[\s\S]*contract/i);
  assert.match(source, /agents?[\s\S]*actors?[\s\S]*one-line user confirmation/i);
  assert.match(source, /secrets?[\s\S]*(?:instructions|messages)[\s\S]*mesh/i);
  assert.match(source, /operation[\s\S]*context[\s\S]*targets[\s\S]*rollback/i);
});

test("init is outcome-oriented and maintains the full context set", () => {
  const source = required(".pi/prompts/init.md");
  assert.match(source, /\$\{ARGUMENTS:-[^}]+\}/);
  assert.match(source, /natural-language outcome[\s\S]*(?:not flags|not .*command grammar)/i);
  assert.match(source, /choose the execution order[\s\S]*do not[^\n]*(?:fixed lifecycle|step chain)/i);
  assert.match(source, /one `fabric_exec` program/i);
  assert.match(source, /one-line user confirmation[\s\S]*advanced Fabric/i);
  assert.doesNotMatch(source, /## Modes|Reject unknown flags|typescript mode/i);

  for (const name of ["agents-policy", "user", "project", "roadmap", "tech-stack"]) {
    assert.match(source, new RegExp(`\\.pi/templates/${name}\\.md`, "i"), name);
  }
  for (const path of ["AGENTS.md", ".pi/user.md", ".pi/project.md", ".pi/roadmap.md", ".pi/tech-stack.md"]) {
    assert.ok(source.includes(path), path);
  }

  assert.match(source, /AGENTS\.md[\s\S]*concise[\s\S]*under 80 lines/i);
  assert.match(source, /project\.md[\s\S]*(?:architecture|execution flows)[\s\S]*source paths/i);
  assert.match(source, /roadmap\.md[\s\S]*confirmed commitments[\s\S]*proposed work[\s\S]*effort/i);
  assert.match(source, /S`, `M`, or `L`[\s\S]*not a time promise/i);
  assert.match(source, /list_indexed_repositories[\s\S]*find_code[\s\S]*analyze_code_relationships/i);
  assert.match(source, /verify graph hits[\s\S]*current source/i);
  assert.match(source, /hindsight_status[\s\S]*hindsight_scope[\s\S]*hindsight_config/i);
  assert.match(source, /memory\.sessions[\s\S]*mcp\.servers/i);
  assert.match(source, /do not change[\s\S]*(?:global MCP|dependencies|packages)[\s\S]*explicit authorization/i);
  assert.match(source, /preview[\s\S]*preserve[\s\S]*unsupported claims/i);
  assert.match(source, /\/reload|new session/i);
  assert.ok(source.split("\n").length <= 95, "init prompt should remain scannable");
});

test("context templates demand detailed evidence without stale workflow jargon", () => {
  const user = required(".pi/templates/user.md");
  const project = required(".pi/templates/project.md");
  const roadmap = required(".pi/templates/roadmap.md");
  const tech = required(".pi/templates/tech-stack.md");

  assert.match(user, /explicit user preferences[\s\S]*do not infer identity/i);
  assert.match(user, /privacy and secrets[\s\S]*unknowns/i);
  assert.match(project, /architecture[\s\S]*CodeGraphContext links[\s\S]*source proof/i);
  assert.match(project, /verification and operations[\s\S]*live servers and flags/i);
  assert.match(roadmap, /confirmed work[\s\S]*proposed work/i);
  assert.match(roadmap, /effort scale[\s\S]*dependencies[\s\S]*acceptance/i);
  assert.match(tech, /manifests and package management[\s\S]*verified commands[\s\S]*unverified commands/i);
  for (const source of [user, project, roadmap, tech]) {
    assert.doesNotMatch(source, /\bbeads?\b|opencode\.json|updated: 2024/i);
  }
});

test("Pi Core keeps detailed context outside the concise AGENTS contract", () => {
  const agents = required("AGENTS.md");
  const user = required(".pi/user.md");
  const project = required(".pi/project.md");
  const roadmap = required(".pi/roadmap.md");
  const tech = required(".pi/tech-stack.md");

  assert.ok(agents.split("\n").length <= 80);
  for (const path of [".pi/user.md", ".pi/project.md", ".pi/roadmap.md", ".pi/tech-stack.md"]) {
    assert.ok(agents.includes(path), path);
  }
  assert.match(user, /priorities[\s\S]*communication[\s\S]*workflow[\s\S]*privacy|priorities[\s\S]*communication[\s\S]*workflow[\s\S]*secrets/i);
  assert.match(project, /architecture[\s\S]*workspace enforcement[\s\S]*CodeGraphContext/i);
  assert.match(roadmap, /effort scale[\s\S]*confirmed work[\s\S]*proposed work/i);
  assert.match(tech, /observed verification[\s\S]*build, deployment, and live state/i);
});

test("global policy keeps precedent retrieval source-qualified", () => {
  const source = required(".pi/templates/agents-policy.md");
  assert.match(source, /target behavior[\s\S]*compatibility needs/i);
  assert.match(source, /source, tests, imports, dependencies, and config/i);
  assert.match(source, /graph edge[\s\S]*locator[\s\S]*not authority/i);
  assert.match(source, /smallest coherent slice/i);
  assert.match(source, /no candidate fits[\s\S]*target-native[\s\S]*no-match/i);
});

test("planning is an on-demand reasoning skill, not a persisted scheduler", () => {
  const planning = required(".pi/skills/planning-and-task-breakdown/SKILL.md");
  assert.match(planning, /material (?:coupling|sequencing|boundary|rollback)/i);
  assert.match(planning, /chat|inline/i);
  assert.match(planning, /fabric_exec/i);
  assert.match(planning, /agents\.run/i);
  assert.doesNotMatch(planning, /tasks\.json|canonical plan|lifecycle state|feature slug/i);
});

test("external reuse skips license ceremony for independently rewritten ideas", () => {
  const agents = required("AGENTS.md");
  const readme = required("README.md");
  const adoption = required(".pi/skills/complex-pattern-adoption/SKILL.md");
  const writing = required(".pi/skills/writing-skills/SKILL.md");
  const inspo = required(".pi/skills/inspo-graph-adoption/SKILL.md");
  const mastra = required(".pi/skills/mastra-development/SKILL.md");

  for (const [label, source] of Object.entries({ agents, readme, adoption, writing, inspo })) {
    assert.match(source, /independent(?:ly)? rewrit|rewrite[^\n]*independently|rewritten independently/i, label);
    assert.match(source, /no[^\n]*(?:license|provenance)[^\n]*ceremony|do not require[^\n]*(?:license|provenance)/i, label);
  }
  assert.match(adoption, /cop(?:y|ied|ying)[\s\S]*(?:license|applicable terms)/i);
  assert.match(writing, /vendor(?:ed|ing)?[\s\S]*(?:license|applicable terms)/i);
  assert.match(adoption, /source parity|byte parity|integrity/i);
  assert.match(adoption, /observable[\s-]*(?:contract|behavior)/i);
  assert.match(adoption, /parent[\s\S]*verif/i);
  assert.doesNotMatch(mastra, /\blicen[cs]e\b|copyright/i);
  assert.doesNotMatch(adoption, /development-lifecycle|graph-backed|task graph|confirm one slug|\/create|\/plan|\/ship|\/verify/i);
});

test("writing-skill references use Fabric children only", () => {
  for (const path of [
    ".pi/skills/writing-skills/references/testing-methodology.md",
    ".pi/skills/writing-skills/references/claude-search-optimization.md",
  ]) {
    const text = required(path);
    assert.doesNotMatch(text, /pi-subagents|subagent_type|\bAgent\s*\(/i, path);
    assert.match(text, /agents\.run/i, path);
    assert.match(text, /fabric_exec/i, path);
  }
});

test("organize-workspace is inventory-first and confirmation-gated", () => {
  const skill = required(".pi/skills/organize-workspace/SKILL.md");
  assert.match(skill, /inventory[\s\S]*classify[\s\S]*propose[\s\S]*confirm[\s\S]*act[\s\S]*verify/i);
  assert.match(skill, /report[- ]only|inventory[- ]only/i);
  assert.match(skill, /explicit confirmation/i);
  assert.match(skill, /source[\s\S]*configuration[\s\S]*(credential|secret)[\s\S]*\.git[\s\S]*\.pi\/artifacts[\s\S]*symlink[\s\S]*ambiguous/i);
  assert.match(skill, /never|prohibit/i);
});

test("define-language produces evidence-backed terminology without forcing storage", () => {
  const skill = required(".pi/skills/define-language/SKILL.md");
  assert.match(skill, /collect evidence[\s\S]*group concepts[\s\S]*(collision|conflict)[\s\S]*canonical term[\s\S]*alias[\s\S]*validate/i);
  assert.match(skill, /meaning/i);
  assert.match(skill, /accepted alias/i);
  assert.match(skill, /rejected|ambiguous/i);
  assert.match(skill, /unresolved question/i);
  assert.match(skill, /only when the caller|caller names a destination/i);
});

test("adopted skills do not import the Bigpowers cockpit", () => {
  const text = [
    required(".pi/skills/organize-workspace/SKILL.md"),
    required(".pi/skills/define-language/SKILL.md"),
  ].join("\n");
  assert.doesNotMatch(text, /specs\/state\.yaml|release-plan\.yaml|execution-status\.yaml|\.bigpowers\//i);
});

test("api-and-interface-design retains boundary validation guidance", () => {
  assert.match(required(".pi/skills/api-and-interface-design/SKILL.md"), /boundary validation/i);
});

test("verification and quality remain evidence gates instead of phases", () => {
  const verification = required(".pi/skills/verification-before-completion/SKILL.md");
  const protocol = required(".pi/skills/verification-before-completion/references/VERIFICATION_PROTOCOL.md");
  const quality = required(".pi/skills/agent-code-quality-gate/SKILL.md");

  assert.match(verification, /No completion claim without evidence/i);
  assert.match(verification, /Fabric child[\s\S]*cannot satisfy/i);
  assert.match(protocol, /AGENTS\.md[\s\S]*(?:CI|workflow)[\s\S]*(?:manifest|script)/i);
  assert.doesNotMatch(protocol, /\bnpm run\b|\bnpx\b|\bpnpm\b|\byarn\b/);
  assert.match(quality, /Scope[\s\S]*Duplication[\s\S]*Behavior tests[\s\S]*Verification evidence[\s\S]*Regressions/i);
});

test("ordinary implementation skills do not mutate lifecycle artifacts", () => {
  for (const path of [
    ".pi/skills/incremental-implementation/SKILL.md",
    ".pi/skills/source-driven-development/SKILL.md",
  ]) {
    const source = required(path);
    assert.doesNotMatch(source, /\.pi\/artifacts|tasks\.json|progress\.md|lifecycle state/i, path);
  }
  assert.match(required(".pi/skills/source-driven-development/SKILL.md"), /fabric_exec/i);
});

test("task-specific prompts load reusable skills through full code mode", () => {
  for (const path of survivingPrompts) {
    const source = required(path);
    assert.doesNotMatch(source, /^\s*read\("\/home\/ryanj\/work\/projects\/pi-core\//m, path);
    if (source.includes("/home/ryanj/work/projects/pi-core/.pi/skills/")) {
      assert.match(source, /pi\.read/i, path);
    }
  }
});

test("graph adoption skills do not publish workstation paths", () => {
  for (const path of [
    ".pi/skills/inspo-graph-adoption/SKILL.md",
    ".pi/skills/rag-ui-development/references/copilotkit-agent-ui-invariant.md",
  ]) {
    assert.doesNotMatch(required(path), /\/home\/[^/\s]+/i, path);
  }
  const manifest = JSON.parse(required(".pi/skills/manifest.json")) as { description: string };
  assert.match(manifest.description, /Pi Core/i);
});

test("retained best-practice skills remain available without profile orchestration", () => {
  for (const skill of [
    "agent-code-quality-gate",
    "debugging-and-error-recovery",
    "planning-and-task-breakdown",
    "source-driven-development",
    "test-driven-development",
    "verification-before-completion",
    "writing-skills",
  ]) {
    assert.ok(existsSync(`${SKILLS}/${skill}/SKILL.md`), skill);
  }

  const allSkillText = skillDirectories().map((name) => read(`${SKILLS}/${name}/SKILL.md`)).join("\n");
  assert.doesNotMatch(allSkillText, /pi-subagents|subagent_type/i);
});

test("architecture work composes graph-assisted seams, black-box proof, cleanup, and verification", () => {
  const architecture = required(".pi/skills/improve-codebase-architecture/SKILL.md");
  const interfaceDesign = required(".pi/skills/improve-codebase-architecture/INTERFACE-DESIGN.md");
  const deepening = required(".pi/skills/improve-codebase-architecture/DEEPENING.md");
  const quality = required(".pi/skills/agent-code-quality-gate/SKILL.md");
  const cleanup = required(".pi/skills/code-cleanup/SKILL.md");
  const review = required(".pi/skills/code-review-and-quality/SKILL.md");
  const deepModule = required(".pi/skills/deep-module-design/SKILL.md");
  const protocol = required(".pi/skills/verification-before-completion/references/VERIFICATION_PROTOCOL.md");
  const report = required(".pi/skills/improve-codebase-architecture/HTML-REPORT.md");

  assert.match(architecture, /LANGUAGE\.md[\s\S]*DEEPENING\.md[\s\S]*INTERFACE-DESIGN\.md/i);
  assert.match(architecture, /known[- ]symbol[\s\S]*exact repository/i);
  assert.match(architecture, /optional locator/i);
  assert.match(architecture, /verify every (?:graph )?hit[\s\S]*(?:source|bytes)/i);
  assert.match(architecture, /fall back[\s\S]*pi\.read[\s\S]*pi\.grep[\s\S]*pi\.find/i);
  assert.match(architecture, /public (?:interface|seam)[\s\S]*success[\s\S]*controlled failure/i);
  assert.doesNotMatch(architecture, /\bCommit\.[\s\S]*One commit per change/i);

  assert.match(interfaceDesign, /zero children|Main can/i);
  assert.match(interfaceDesign, /agents\.run[\s\S]*fabric_exec/i);
  assert.doesNotMatch(interfaceDesign, /Agent tool|Spawn 3\+ sub-agents|Agent \d/i);
  assert.match(deepModule, /depth[\s\S]*(?:leverage|capability)[\s\S]*interface/i);
  assert.doesNotMatch(deepModule, /impl(?:ementation)? (?:size|lines?)[^\n]*interface (?:size|lines?)/i);
  assert.doesNotMatch(deepModule, /use \`improve-codebase-architecture\`/i);

  assert.match(deepening, /replacement coverage[\s\S]*(?:equivalent|same)[\s\S]*observable/i);
  assert.match(deepening, /authorization/i);
  assert.doesNotMatch(deepening, /become waste[\s\S]*delete them/i);

  assert.match(quality, /public (?:interface|seam)[\s\S]*controlled failure/i);
  assert.match(quality, /fallow|deterministic/i);
  assert.doesNotMatch(quality, /in the commit/i);
  assert.match(cleanup, /configured|available/i);
  assert.match(cleanup, /authorization/i);
  assert.match(quality, /automatic completion gate/i);
  assert.match(review, /independent|requested/i);
  assert.match(review, /public (?:interface|seam)|black-box/i);
  assert.match(architecture, /ADR-FORMAT\.md[\s\S]*CONTEXT-FORMAT\.md/i);
  assert.match(report, /securityLevel:\s*["\']strict["\']/i);

  assert.match(protocol, /code graph[\s\S]*known[- ]symbol/i);
  assert.match(protocol, /graph[\s\S]*(?:N\/A|unavailable)[\s\S]*(?:pi\.read|source)/i);
  assert.match(protocol, /graph (?:claim|hit)[\s\S]*(?:source|bytes)/i);
  assert.doesNotMatch(protocol, /\/home\/ryanj\/work\/projects\/pi-core/);
});

test("maintained architecture references contain no retired Agent-tool choreography", () => {
  for (const path of [
    ".pi/skills/improve-codebase-architecture/SKILL.md",
    ".pi/skills/improve-codebase-architecture/DEEPENING.md",
    ".pi/skills/improve-codebase-architecture/INTERFACE-DESIGN.md",
    ".pi/skills/improve-codebase-architecture/LANGUAGE.md",
  ]) {
    assert.doesNotMatch(required(path), /pi-subagents|subagent_type|Agent tool|Spawn 3\+ sub-agents|Agent \d/i, path);
  }
});

test("Hindsight and Astro resource boundaries remain intact", () => {
  const hindsight = JSON.parse(required(".pi/hindsight.json")) as {
    banks?: {
      project?: { enabled?: boolean };
      user?: { enabled?: boolean };
    };
    scope?: { mode?: string };
  };
  assert.equal(hindsight.banks?.project?.enabled, true);
  assert.equal(hindsight.banks?.user?.enabled, false);
  assert.equal(hindsight.scope?.mode, "domain-tagged");
  assert.equal(existsSync("MEMORY.md"), false);

  for (const path of [
    ".pi/skills/astro-web-practices/SKILL.md",
    ".pi/skills/astro-web-practices/references/provenance.md",
    ".pi/skills/astro-web-practices/references/example-library.md",
  ]) {
    assert.ok(existsSync(path), path);
  }
  assert.match(required(".pi/skills/astro-web-practices/SKILL.md"), /repository identity/i);
});
