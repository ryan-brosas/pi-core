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

test("verification discovers repository gates and never invents package commands", () => {
  const protocol = readRequired(".pi/skills/verification-before-completion/references/VERIFICATION_PROTOCOL.md");
  assert.match(protocol, /AGENTS\.md[\s\S]*(?:CI|workflow)[\s\S]*(?:manifest|script)/i);
  assert.match(protocol, /not configured|unavailable[\s\S]{0,120}(?:N\/A|not applicable)/i);
  assert.match(protocol, /node --experimental-strip-types --test \.pi\/tests\/\*\.test\.ts/);
  assert.doesNotMatch(protocol, /\bnpm run\b|\bnpx\b|\bpnpm\b|\byarn\b/);

  const verify = readRequired(".pi/prompts/verify.md");
  assert.match(verify, /applicable[^\n]*repository-configured|repository-configured[^\n]*applicable/i);
});

test("create and plan establish exact local evidence in a valid order", () => {
  const create = readRequired(".pi/prompts/create.md");
  const skip = boundedTextBetween(create, /^\*\*If Skip:\*\*[ \t]*$/m, /^\*\*While independent Fabric runs execute\*\*/m, "create skip research");
  assert.match(skip, /direct parent[^\n]*(?:read|inspect)[^\n]*exact source/i);
  assert.match(skip, /affected paths|tests|impact map/i);

  const validation = boundedTextBetween(create, /^## Phase 8: Validate PRD[ \t]*$/m, /^## Phase 9: Prepare Workspace[ \t]*$/m, "create validation");
  assert.match(validation, /Full PRD[^\n]*Technical Context|Technical Context[^\n]*Full PRD/i);
  assert.match(validation, /Lite PRD[^\n]*(?:omit|not applicable)|(?:omit|not applicable)[^\n]*Lite PRD/i);
  assert.doesNotMatch(validation, /actual `?src\//i);

  const plan = readRequired(".pi/prompts/plan.md");
  const guardIndex = plan.indexOf("## Phase 1: Guards");
  const assessmentIndex = plan.indexOf("## Phase 2: Discovery Assessment");
  const discoveryDispatchIndex = plan.indexOf('name: "planning-local-evidence"');
  assert.ok(guardIndex >= 0 && assessmentIndex > guardIndex, "guards must precede discovery assessment");
  assert.ok(discoveryDispatchIndex > assessmentIndex, "local-discovery dispatch must follow guards and level selection");
  assert.doesNotMatch(plan, /never force push main|Quality Bar: strong typing|Task modifying >3 files|--no-verify/i);
});

test("lifecycle separates impact discovery from evidence-gated pattern promotion", () => {
  const lifecycle = readRequired(".pi/skills/development-lifecycle/SKILL.md");
  const promotion = boundedTextBetween(
    lifecycle,
    /^## Pattern Discovery and Promotion[ \t]*$/m,
    /^## Slash Commands \(Lifecycle Hooks\)[ \t]*$/m,
    "pattern promotion",
  );
  assert.match(promotion, /code graph[^\n]*(?:impact|call|dependenc|relationship)/i);
  assert.match(promotion, /known (?:target )?(?:symbol|path)[^\n]*(?:health|probe|resolve)/i);
  assert.match(promotion, /fall back[^\n]*(?:read|grep|find)/i);
  assert.match(promotion, /corpus[^\n]*curated[^\n]*(?:exemplar|pattern)/i);
  assert.match(promotion, /corpus\.ts search|search[^\n]*\.pi\/corpus/i);
  assert.match(promotion, /exact commit[^\n]*license[^\n]*(?:canonical|focused)[^\n]*tests?/i);
  assert.match(promotion, /smallest[^\n]*source[^\n]*test[^\n]*pair/i);
  assert.match(promotion, /feature-specific[^\n]*target source/i);
  assert.match(promotion, /durable decision[^\n]*Hindsight/i);
  assert.match(promotion, /reusable[^\n]*(?:exemplar|pattern)[^\n]*corpus/i);
  assert.match(promotion, /two successful applications[^\n]*(?:skill|lifecycle)/i);
  assert.match(promotion, /does not create[^\n]*new workflow|no new workflow/i);
});

test("MCP and corpus pattern adoption always uses the Complex on-demand skill", () => {
  const skill = readRequired(".pi/skills/complex-pattern-adoption/SKILL.md");
  assert.match(skill, /^name:\s*complex-pattern-adoption$/m);
  assert.match(skill, /always[^\n]*Complex|Complex[^\n]*always/i);
  assert.match(skill, /\/create[^\n]*\/plan[^\n]*\/ship[^\n]*\/verify|\/create[\s\S]{0,160}\/plan[\s\S]{0,160}\/ship[\s\S]{0,160}\/verify/i);
  assert.match(skill, /explicit[^\n]*slug/i);
  assert.match(skill, /code graph[^\n]*(?:health-probe|health probe)[^\n]*known[^\n]*(?:symbol|path)/i);
  assert.match(skill, /verify[^\n]*graph[^\n]*current source|graph[^\n]*fall back[^\n]*(?:read|grep|find)/i);
  assert.match(skill, /corpus\.ts validate[\s\S]{0,240}corpus\.ts stale[\s\S]{0,240}corpus\.ts search/i);
  assert.match(skill, /MCP[^\n]*(?:transport|evidence)[^\n]*(?:not|never)[^\n]*(?:authority|proof|source of truth)/i);
  assert.match(skill, /exact commit[^\n]*license[^\n]*(?:canonical|focused)[^\n]*tests?/i);
  assert.match(skill, /record[^\n]*failures?[^\n]*passes?|passes?[^\n]*failures?/i);
  assert.match(skill, /observable contract/i);
  assert.match(skill, /seam[^\n]*enabling point[^\n]*(?:alternative|substitute)/i);
  assert.match(skill, /black-box[^\n]*(?:first|before)|public boundary[^\n]*(?:first|before)/i);
  assert.match(skill, /gray-box[^\n]*named[^\n]*(?:gap|consequence)/i);
  assert.match(skill, /(?:do not|never)[^\n]*(?:auto-copy|copy automatically|automatic promotion)/i);
  assert.match(skill, /parent[^\n]*(?:inspect|verify)|(?:inspect|verify)[^\n]*parent/i);

  const lifecycle = readRequired(".pi/skills/development-lifecycle/SKILL.md");
  const promotion = boundedTextBetween(
    lifecycle,
    /^## Pattern Discovery and Promotion[ \t]*$/m,
    /^## Slash Commands \(Lifecycle Hooks\)[ \t]*$/m,
    "pattern promotion",
  );
  assert.match(promotion, /complex-pattern-adoption/i);
  assert.match(promotion, /(?:adoption|promotion)[^\n]*always[^\n]*Complex|always[^\n]*Complex[^\n]*(?:adoption|promotion)/i);
});

test("Mastra skill extracts clean source practices without canonizing template anomalies", () => {
  const skill = readRequired(".pi/skills/mastra-development/SKILL.md");
  assert.match(skill, /^name:\s*mastra-development$/m);
  assert.doesNotMatch(skill, /\bportfolio\b/i, "the source-pattern skill must not be shaped around one consumer");
  assert.match(skill, /https:\/\/github\.com\/mastra-ai\/template-chat-with-pdf/i);
  assert.match(skill, /4b954b41350dcd8139d135abb677ab9ddfae4f6c/i);
  assert.match(skill, /commit date[^\n]*2026-05-28/i);
  assert.match(skill, /observed source surface[^\n]*one registration root[^\n]*one agent[^\n]*two tools[^\n]*one vector[- ]store module[^\n]*one three[- ]step workflow/i);
  assert.match(skill, /(?:package declaration|package metadata)[^\n]*Apache-2\.0/i);
  assert.match(skill, /standalone template[^\n]*(?:not|isn['’]t)[^\n]*(?:full )?Mastra (?:repository|monorepo)/i);

  const sourceQualification = boundedTextBetween(
    skill,
    /^## Source Qualification[ \t]*$/m,
    /^## Clean-Code Kernel[ \t]*$/m,
    "Mastra source qualification",
  );
  assert.match(sourceQualification, /canonical repository:[^\n]*`https:\/\/github\.com\/mastra-ai\/mastra`/i);
  assert.match(sourceQualification, /canonical byte-matched (?:merge )?commit:[^\n]*`fb88481957c029167092cef2c47eeaffeb411ce7`/i);
  assert.match(sourceQualification, /canonical root `LICENSE\.md`[^\n]*raw-byte SHA-256[^\n]*`2b16edbc165d42dee8248296cb22979a26930fad9efaef4ebe263698a416c19c`/i);
  assert.match(sourceQualification, /outside[^\n]*`ee\/`[^\n]*Apache-2\.0[^\n]*`templates\/`[^\n]*(?:covered|applies|scope)/i);
  assert.match(skill, /source reading[^\n]*MCP graph (?:resolution|evidence)[^\n]*prove structure[^\n]*(?:not|never)[^\n]*runtime compatibility[^\n]*(?:or|and)[^\n]*correctness/i);
  assert.match(skill, /MCP[^\n]*(?:health-probe|health probe)[^\n]*known[^\n]*(?:symbol|path)/i);
  assert.match(skill, /official[^\n]*(?:docs|source)[^\n]*(?:installed|exact|version)/i);
  assert.match(skill, /(?:never|do not)[^\n]*claim[^\n]*uninstalled template(?: itself)?[^\n]*passed/i);

  for (const heading of [
    "## Source Qualification",
    "## Clean-Code Kernel",
    "## Recommended Module Shape",
    "## Composition Root",
    "## Agent Modules",
    "## Tool Modules",
    "## Workflow Modules",
    "## Shared Infrastructure",
    "## RAG Data Contracts",
    "## Error Design",
    "## Testing Strategy",
    "## Template Strengths",
    "## Template Anomalies",
    "## Adoption Checklist",
    "## Corpus Rule",
  ]) {
    assert.ok(skill.includes(`\n${heading}\n`), `missing detailed section: ${heading}`);
  }

  assert.match(skill, /(?:small|focused)[^\n]*modules?[^\n]*(?:one|single)[^\n]*(?:responsibility|reason to change)/i);
  assert.match(skill, /composition root[\s\S]{0,320}agents[\s\S]{0,120}workflows[\s\S]{0,120}vectors[\s\S]{0,120}storage[\s\S]{0,120}logger/i);
  assert.match(skill, /createTool[^\n]*(?:inputSchema|Zod)/i);
  assert.match(skill, /createStep[\s\S]{0,240}inputSchema[\s\S]{0,180}outputSchema/i);
  assert.match(skill, /createWorkflow[\s\S]{0,240}inputSchema[\s\S]{0,180}outputSchema/i);
  assert.match(skill, /\.then\([^\n]*\)[^\n]*(?:pipeline|flow|order)|(?:pipeline|flow|order)[^\n]*\.then\(/i);
  assert.match(skill, /stable[^\n]*(?:id|identifier)[^\n]*description/i);
  assert.match(skill, /shared[^\n]*vector store[^\n]*(?:index name|index constant)|(?:index name|index constant)[^\n]*shared[^\n]*vector store/i);
  assert.match(skill, /documentId[^\n]*documentTitle[^\n]*(?:url|source)[^\n]*pageNumber[^\n]*totalPages/i);
  assert.match(skill, /HACK[^\n]*(?:limitation|tradeoff)[\s\S]{0,240}(?:production alternative|cleaner approach)/i);
  assert.match(skill, /pure[^\n]*(?:helper|core|function)/i);
  assert.match(skill, /(?:do not|never)[^\n]*(?:abstract|abstraction|seam)[^\n]*(?:variance|second implementation|alternative)/i);
  assert.match(skill, /(?:do not|never)[^\n]*(?:copy|import)[^\n]*entire[^\n]*(?:repo|template)/i);

  const anomalies = /["'`]latest["'`][\s\S]*no lockfile[\s\S]*no retained tests[\s\S]*no LICENSE file[\s\S]*swallow[^\n]*errors?[\s\S]*\bany\b[\s\S]*(?:SSRF|arbitrary URL)[\s\S]*random[\s\S]*hard-coded model[\s\S]*similarity search[^\n]*registry[\s\S]*delete[^\n]*before[^\n]*upsert[\s\S]*(?:base64|document ID)/i;
  assert.match(skill, anomalies);
  assert.match(skill, /documentId[^\n]*optional[^\n]*schema[^\n]*instructions[^\n]*(?:mandatory|required)/i);
  assert.match(skill, /page ranges?[^\n]*(?:positive[^\n]*ordered|ordered[^\n]*positive)[^\n]*bounds?/i);
  assert.match(skill, /local[^\n]*file-backed storage[^\n]*development[^\n]*(?:not|production)/i);
  assert.match(skill, /agent instruction[^\n]*(?:large|long)[^\n]*behavior tests[^\n]*decomposition/i);
  assert.match(skill, /corpus[^\n]*(?:only|after)[^\n]*(?:target|application)[^\n]*(?:passes|verified|works)/i);
});

test("shipping requires behavior-first evidence and fixes only owned paths", () => {
  const ship = readRequired(".pi/prompts/ship.md");
  assert.match(ship, /read\("\.pi\/skills\/test-driven-development\/SKILL\.md"\)/);
  assert.match(ship, /black-box acceptance/i);
  assert.match(ship, /observable[^\n]*(?:success|acceptance)[^\n]*(?:controlled failure|error)|controlled failure[^\n]*observable/i);
  assert.doesNotMatch(ship, /Goal-Backward Verification \(if plan\.md exists\)/);
  assert.match(ship, /classif[^\n]*(?:owned|unrelated|runtime)[\s\S]{0,220}(?:tracked and untracked|tracked[^\n]*untracked)/i);
  assert.match(ship, /only[^\n]*owned[^\n]*(?:auto-fix|modifying|fix)/i);
  assert.match(ship, /unrelated[^\n]*(?:read-only|report)[^\n]*(?:do not|never)[^\n]*(?:fix|modify)/i);
  assert.doesNotMatch(ship, /review-state\.json/i, "iterative review state must remain parent-owned unless a new file is approved");
  const iterativeReview = boundedTextBetween(ship, /^### Iterative Quality Loop Mode[ \t]*$/m, /^### Goal-Backward Verification[ \t]*$/m, "iterative review loop");
  assert.match(iterativeReview, /loop state[^\n]*parent memory|parent-owned in-memory loop state/i);
  assert.match(iterativeReview, /do not create a state file[^\n]*separately approves[^\n]*exact new path/i);
  assert.match(iterativeReview, /VERIFY \+ RE-REVIEW[^\n]*parent-owned in-memory loop state/i);
  assert.doesNotMatch(iterativeReview, /(?:cat|write|create)[^\n]*review[- ]state[^\n]*\.(?:json|md|yaml)/i);
  assert.match(ship, /append[^\n]*(?:task state|evidence)[^\n]*(?:before|independent|whether or not)[^\n]*(?:commit|integration)|(?:commit|integration)[^\n]*optional[^\n]*(?:task state|evidence)/i);

  const verify = readRequired(".pi/prompts/verify.md");
  assert.match(verify, /slug mode[^\n]*progress\.md/i);
  assert.match(verify, /path\/all mode[^\n]*(?:chat|report)[^\n]*(?:never|do not)[^\n]*(?:create|write)[^\n]*lifecycle artifact/i);

  const protocol = readRequired(".pi/skills/verification-before-completion/references/VERIFICATION_PROTOCOL.md");
  for (const [label, text] of [["ship", ship], ["verification protocol", protocol]] as const) {
    assert.doesNotMatch(text, /HEAD~1/, `${label}: never guess the review base`);
    assert.match(text, /primary[^\n]*(?:branch|ref)[\s\S]{0,180}merge-base|merge-base[\s\S]{0,180}primary[^\n]*(?:branch|ref)/i, `${label}: resolve a verified primary-branch merge base`);
    assert.match(text, /git rev-parse --verify "\$PRIMARY_REF"[\s\S]{0,180}git merge-base "\$PRIMARY_REF" HEAD/i, `${label}: verify the declared ref before computing the merge base`);
  }

  const readme = readRequired("README.md");
  assert.match(readme, /impact map[^\n]*(?:when useful|optional|when needed)|(?:when useful|optional|when needed)[^\n]*impact map/i);
  assert.match(readme, /optional code graph|code graph[^\n]*optional/i);
  assert.match(readme, /(?:preserve|add|create|select)[^\n]*seam[^\n]*(?:only|justified)|seam[^\n]*(?:only|justified)/i);
  assert.match(readme, /gray-box[^\n]*only[^\n]*named[^\n]*(?:gap|evidence)/i);

  const tdd = boundedTextBetween(ship, /^### TDD Execution Flow[ \t]*$/m, /^### Task Commit Protocol[ \t]*$/m, "ship TDD flow");
  assert.doesNotMatch(tdd, /where practical|When task specifies TDD/i);
  assert.doesNotMatch(tdd, /^\s*\d+\. Commit:/m, "TDD evidence must not imply Git approval");

  const fix = readRequired(".pi/prompts/fix.md");
  assert.match(fix, /test-driven-development\/SKILL\.md/);
  assert.match(fix, /failing observable regression test|observable regression test[^\n]*fail/i);
});

test("audit completeness is reconciled by the parent", () => {
  const prompt = readRequired(".pi/prompts/audit.md");
  const workflow = readRequired(".pi/workflows/audit-pattern.md");
  for (const [label, text] of [["audit prompt", prompt], ["audit workflow", workflow]] as const) {
    assert.match(text, /parent[^\n]*(?:rerun|repeat)[^\n]*(?:exact|local)[^\n]*(?:search|grep)/i, label);
    assert.match(text, /reconcile[^\n]*(?:count|occurrence|match)/i, label);
    assert.match(text, /(?:cannot|do not|must not) claim[^\n]*(?:all|exhaustive|complete)/i, label);
    assert.doesNotMatch(text, /csearch/i, label);
  }
});

test("subagent handoffs use an explicit slug and approval-gated files", () => {
  const skill = readRequired(".pi/skills/subagent-driven-development/SKILL.md");
  assert.match(skill, /explicitly resolved[^\n]*\.pi\/artifacts\/<slug>\/(?:tasks\.json|progress\.md)/i);
  assert.doesNotMatch(skill, /explicitly active|active `worker-context\.md`|active `progress\.md`/i);
  assert.match(skill, /worker-context\.md[^\n]*explicit[^\n]*approval|explicit[^\n]*approval[^\n]*worker-context\.md/i);
  assert.match(skill, /approval[^\n]*(?:absent|not granted)[^\n]*inline|inline[^\n]*approval/i);
});

test("research is read-only by default and persists only to an explicit destination", () => {
  const research = readRequired(".pi/prompts/research.md");
  assert.match(research, /read-only by default/i);
  assert.match(research, /--save|explicitly requested a durable report/i);
  assert.match(research, /--slug[^\n]*(?:explicit|selected)|(?:explicit|selected)[^\n]*--slug/i);
  assert.match(research, /explicit[^\n]*slug[^\n]*demonstrably related[^\n]*progress\.md/i);
  assert.match(research, /without[^\n]*(?:--slug|feature slug)[^\n]*standalone[^\n]*research\.md/i);
  assert.match(research, /never[^\n]*infer[^\n]*(?:feature|artifact)[^\n]*(?:ownership|destination)/i);
  assert.match(research, /do not create lifecycle artifacts merely/i);
  assert.doesNotMatch(research, /always persist/i);
});

test("graph-backed commands require explicit slugs and no ambient selection pointer", () => {
  const plan = readRequired(".pi/prompts/plan.md");
  const ship = readRequired(".pi/prompts/ship.md");
  assert.match(plan, /^argument-hint:\s*"<slug>"$/m);
  assert.match(ship, /^argument-hint:\s*"<slug>"$/m);
  assert.match(plan, /missing[^\n]*slug[^\n]*stop|slug[^\n]*required/i);
  assert.match(ship, /missing[^\n]*slug[^\n]*stop|slug[^\n]*required/i);

  const liveSurfaces = [
    "AGENTS.md",
    ".pi/agent-tool-description.md",
    ".pi/prompts/create.md",
    ".pi/prompts/plan.md",
    ".pi/prompts/research.md",
    ".pi/prompts/ship.md",
    ".pi/prompts/verify.md",
    ".pi/skills/development-lifecycle/SKILL.md",
    ".pi/skills/subagent-driven-development/SKILL.md",
    ".pi/workflows/batch-implement.md",
    ".pi/workflows/development-lifecycle-workflow.md",
    "README.md",
  ];
  for (const path of liveSurfaces) {
    assert.doesNotMatch(readRequired(path), /(?:\.pi\/artifacts\/)?\.active\b/i, path);
  }
  const retiredPointer = [".pi", "artifacts", ".active"].join("/");
  assert.equal(existsSync(retiredPointer), false, "retired ambient selection pointer must remain absent");
  assert.doesNotMatch(readRequired(".gitignore"), /artifacts\/\.active/i);
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

test("init refresh keeps the private Pi template local in new target projects", () => {
  const init = readRequired(".pi/prompts/init.md");
  assert.match(init, /^argument-hint:[^\n]*--refresh/m);
  assert.match(init, /\| `--refresh` \| false \|[^\n]*new target project[^\n]*(?:private|proprietary)[^\n]*\.pi/i);
  assert.match(init, /git ls-files -- \.pi/);
  assert.match(init, /if (?:no|zero) `\.pi` paths are tracked[\s\S]{0,320}(?:append|add) `\/\.pi\/`/i);
  assert.match(init, /if any `\.pi` path is tracked[\s\S]{0,320}(?:stop|do not modify)[^\n]*\.gitignore/i);
  assert.match(init, /preserv[^\n]*existing[^\n]*(?:content|entries)/i);
  assert.match(init, /prevent[^\n]*accidental[^\n]*Git[\s\S]{0,220}(?:not|does not)[^\n]*(?:security boundary|force-add|copied)/i);
  assert.doesNotMatch(readRequired(".gitignore"), /^(?:\/?\.pi\/?)$/m);
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
  assert.match(lifecycle, /explicit[^\n]*\.pi\/artifacts\/<slug>/i);
  assert.match(lifecycle, /Quick work does not need artifacts/i);
  for (const artifact of ["spec.md", "plan.md", "tasks.json", "progress.md"]) {
    assert.match(lifecycle, new RegExp(artifact.replace(".", "\\.")), artifact);
  }
});

test("graph producers emit executable task contracts", () => {
  const template = readRequired(".pi/templates/prd.md");
  const create = readRequired(".pi/prompts/create.md");
  const plan = readRequired(".pi/prompts/plan.md");
  const templateTasks = boundedTextBetween(
    template,
    /^## Tasks[ \t]*$/m,
    /^## Dependency Legend[ \t]*$/m,
    "PRD template tasks",
  );
  const createTasks = boundedTextBetween(
    create,
    /^## Phase 7: Write PRD[ \t]*$/m,
    /^## Phase 8: Validate PRD[ \t]*$/m,
    "create PRD tasks",
  );
  const planTasks = boundedTextBetween(
    plan,
    /^## Phase 7: Write Plan[ \t]*$/m,
    /^## Phase 8: Constitutional Compliance Gate[ \t]*$/m,
    "plan tasks",
  );
  const createLite = boundedTextBetween(
    create,
    /^### Lite PRD Format[ \t]*$/m,
    /^### Full PRD Format[ \t]*$/m,
    "create Lite PRD format",
  );
  const liteTaskFormat = boundedTextBetween(
    createLite,
    /^## Tasks[ \t]*$/m,
    /^## Success Criteria[ \t]*$/m,
    "create Lite task format",
  );
  const producers = [["PRD template", templateTasks], ["/create", createTasks], ["/plan", planTasks]] as const;

  for (const [scope, text] of producers) {
    assert.match(text, /\bacceptance_criteria\b/i, `${scope}: name acceptance_criteria`);
    assert.match(text, /\bverification\b/i, `${scope}: name verification`);
    assert.match(text, /\bnon-empty\b[^\n]{0,160}\barrays?\b|\barrays?\b[^\n]{0,160}\bnon-empty\b/i, `${scope}: require non-empty arrays`);
    assert.match(text, /at least one[^\n]{0,100}observable acceptance criteri(?:on|a)/i, `${scope}: require an observable criterion per task`);
    assert.match(text, /at least one[^\n]{0,140}repository[- ]supported verification command/i, `${scope}: require a repository-supported command per task`);
  }

  const nonEmptyArrayShape = (field: string): RegExp => new RegExp(
    String.raw`(?:^|\n)[ \t]*(?:-[ \t]+)?${field}:[ \t]*(?:\[[^\]\r\n]*\S[^\]\r\n]*\]|\r?\n[ \t]+-[ \t]+\S)`,
    "i",
  );
  assert.match(liteTaskFormat, nonEmptyArrayShape("acceptance_criteria"), "/create Lite: show a non-empty acceptance_criteria array");
  assert.match(liteTaskFormat, nonEmptyArrayShape("verification"), "/create Lite: show a non-empty verification array");
  assert.match(liteTaskFormat, /\bacceptance_criteria\b[\s\S]{0,240}\bobservable (?:acceptance criteri(?:on|a)|behavior|outcome|state)\b/i, "/create Lite: show an observable acceptance criterion");
  assert.match(liteTaskFormat, /\bverification\b[\s\S]{0,240}\brepository[- ]supported (?:verification )?command\b/i, "/create Lite: show a repository-supported verification command");
  assert.doesNotMatch(createLite, /\bnpm\s+run\s+(?:typecheck|lint)\b/i, "/create Lite: do not hard-code unavailable npm commands");
  assert.match(createLite, /\bdiscover(?:ed|ing|y)?\b[\s\S]{0,180}\b(?:verification )?commands?\b|\b(?:verification )?commands?\b[\s\S]{0,180}\bdiscover(?:ed|ing|y)?\b/i, "/create Lite: discover verification commands");
  assert.match(createLite, /\b(?:supported by|available in|from)\b[^\n]{0,80}\b(?:the )?current repository\b|\bcurrent repository\b[^\n]{0,80}\b(?:supported|available|discover)/i, "/create Lite: use commands supported by the current repository");
  assert.match(createLite, /\b(?:do not|never|rather than|instead of)\b[^\n]{0,120}\binvent(?:ed|ing)?\b[^\n]{0,120}\bpackage[- ]manager commands?\b/i, "/create Lite: reject invented package-manager commands");

  const templateExampleMatches = [...templateTasks.matchAll(/^### <Task Title> \[category\][ \t]*$/gm)];
  assert.equal(templateExampleMatches.length, 2, "PRD template: expected exactly two task examples");
  const templateExamples = templateExampleMatches.map((match, index) => templateTasks.slice(
    match.index,
    templateExampleMatches[index + 1]?.index ?? templateTasks.length,
  ));
  for (const [index, example] of templateExamples.entries()) {
    const scope = `PRD template example ${index + 1}`;
    const acceptanceHeading = /^\*\*Acceptance Criteria:\*\*[ \t]*$/m.exec(example);
    const verificationHeading = /^\*\*Verification:\*\*[ \t]*$/m.exec(example);
    assert.ok(acceptanceHeading, `${scope}: missing Acceptance Criteria block`);
    assert.ok(verificationHeading, `${scope}: missing Verification block`);
    assert.ok(acceptanceHeading.index < verificationHeading.index, `${scope}: Acceptance Criteria must precede Verification`);
    const acceptanceBlock = example.slice(acceptanceHeading.index + acceptanceHeading[0].length, verificationHeading.index);
    const verificationBlock = example.slice(verificationHeading.index + verificationHeading[0].length);
    assert.match(acceptanceBlock, /^-[ \t]+\[[^\]\r\n]*\bobservable\b[^\]\r\n]*\][ \t]*$/im, `${scope}: missing observable acceptance placeholder`);
    assert.match(verificationBlock, /^-[ \t]+\[[^\]\r\n]*\brepository[- ]supported\b[^\]\r\n]*\bcommand\b[^\]\r\n]*\][ \t]*$/im, `${scope}: missing explicit repository-supported command placeholder`);
    assert.doesNotMatch(example, /\bcommand or check\b/i, `${scope}: ambiguous command-or-check placeholder`);
  }

  const createConversion = boundedTextBetween(
    create,
    /^## Phase 10: Convert PRD to the Canonical Task Graph[ \t]*$/m,
    /^## Phase 11: Report[ \t]*$/m,
    "create graph conversion",
  );
  const planRefinement = boundedTextBetween(
    plan,
    /^## Phase 6: Refine the Authoritative Task Graph[ \t]*$/m,
    /^## Phase 7: Write Plan[ \t]*$/m,
    "plan graph refinement",
  );
  for (const [scope, text] of [["create conversion", createConversion], ["plan refinement", planRefinement]] as const) {
    assert.match(text, /preserv/i, `${scope}: preserve execution contracts`);
    assert.match(text, /\bacceptance_criteria\b/i, `${scope}: preserve acceptance_criteria`);
    assert.match(text, /\bverification\b/i, `${scope}: preserve verification`);
    assert.match(text, /\bnon-empty\b/i, `${scope}: preserve non-empty values`);
    assert.match(text, /\barrays?\b/i, `${scope}: preserve arrays`);
  }

  const structuralLimit = /structural (?:task-graph validation|validation|validity)[\s\S]{0,240}(?:does not|cannot|neither)[\s\S]{0,180}(?:semantic adequacy|semantically adequate)/i;
  const executionLimit = /structural (?:task-graph validation|validation|validity)[\s\S]{0,320}(?:does not|cannot|neither)[\s\S]{0,240}(?:command success|commands? (?:succeed|pass)|successful command execution)/i;
  for (const [scope, text] of [["PRD template", templateTasks], ["/create", create], ["/plan", plan]] as const) {
    assert.match(text, structuralLimit, `${scope}: distinguish structure from semantic adequacy`);
    assert.match(text, executionLimit, `${scope}: distinguish structure from command success`);
  }
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
  assert.match(delegation, /(?:must not|forbid)[^\n]*schedule[^\n]*(?:select|lifecycle)|(?:must not|forbid)[^\n]*(?:select|lifecycle)[^\n]*schedule/i);
});

test("ship reviews the complete worktree rather than committed HEAD only", () => {
  const ship = readRequired(".pi/prompts/ship.md");
  assert.match(ship, /current worktree relative to `?BASE_SHA`?/i);
  assert.match(ship, /git diff --name-only "\$BASE_SHA" --/);
  assert.match(ship, /git ls-files --others --exclude-standard/);
  assert.match(ship, /including (?:both )?tracked and untracked|tracked and untracked/i);
  assert.doesNotMatch(ship, /git diff --name-only \$BASE_SHA\.\.\.HEAD/);
  assert.doesNotMatch(ship, /Diff:\s*\{BASE_SHA\}\.\.\.\{HEAD_SHA\}/);
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

const dispatchNouns = "(?:agents?|subagents?|reviewers?|workers?|scouts?|fabric\\s+(?:runs?|calls?)|(?:pi-)?subagents?\\s+calls?|(?:agent|review|worker|scout)[\\w-]*\\s+calls?)";
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
  assert.deepEqual(explicitDispatchCountErrors("Issue 5 Fabric runs."), ["Issue 5 Fabric runs."]);
  assert.deepEqual(explicitDispatchCountErrors("Dispatch five Fabric calls."), ["Dispatch five Fabric calls."]);
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

test("Fabric routing is centrally bounded while dispatch surfaces keep local contracts", () => {
  const policy = readRequired(".pi/agent-tool-description.md");
  assert.match(policy, /direct execution[^\n]*default|direct[^\n]*default/i);
  assert.match(policy, /at most three|max(?:imum)?[^\n]*3|one-to-three|1–3/i);
  assert.match(policy, /sequential[^\n]*shard|shard[^\n]*sequential/i);
  assert.match(policy, /parent[^\n]*(?:inspect|verif)|(?:inspect|verif)[^\n]*parent/i);

  const fabric = JSON.parse(readRequired(".pi/fabric.json")) as { agents?: { maxConcurrent?: number } };
  assert.ok(Number.isInteger(fabric.agents?.maxConcurrent));
  assert.ok((fabric.agents?.maxConcurrent ?? 0) >= 1 && (fabric.agents?.maxConcurrent ?? 0) <= 3);

  for (const path of orchestrationSurfaces) {
    const text = read(path);
    assert.deepEqual(explicitDispatchCountErrors(text), [], path);
    if (/agents\.run/i.test(text)) assert.match(text, /fabric_exec/i, path);
    assert.doesNotMatch(text, /pi-subagents|subagent_type|\bAgent\s*\(/i, path);
  }

  for (const path of orchestrationSurfaces.filter((value) => value.startsWith(".pi/prompts/"))) {
    assert.doesNotMatch(read(path), /^## Fabric Agent Routing[ \t]*$/m, path);
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
  const fabric = JSON.parse(readRequired(".pi/fabric.json")) as {
    agents?: { enabled?: boolean };
    capture?: { keepVisible?: string[] };
  };
  assert.equal(fabric.agents?.enabled, true, "Fabric agents must be enabled");
  assert.equal(fabric.capture?.keepVisible?.includes("Agent") ?? false, false, "legacy Agent capture must be absent");
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
    assert.match(text, /lifecycle (?:identity|state)|artifact selection/i, path);
  }
  assert.doesNotMatch(ship, /Set up the workspace: create branch, install deps if needed/i);
  assert.doesNotMatch(ship, /Commit before close[^\n]*required/i);
});

test("planning advisory uses one foreground Fabric run", () => {
  const planPrompt = readRequired(".pi/prompts/plan.md");
  const heading = "## Planning Worker Routing";
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
  assert.match(handoff, /explicitly selected slug[^\n]*`?\/ship/i);
  assert.match(handoff, /no ambient[^\n]*(?:pointer|selection)/i);
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
  const routingStart = planPrompt.indexOf("## Planning Worker Routing");
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

test("planning keeps boundary design conditional and gray-box evidence independently justified", () => {
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
    "plan prompt": fencedTemplate(readRequired(".pi/prompts/plan.md"), "### Required Plan Header", "````markdown", "````"),
    "planning skill": fencedTemplate(readRequired(".pi/skills/planning-and-task-breakdown/SKILL.md"), "## Plan Template", "```", "```"),
  };

  for (const [label, text] of Object.entries(surfaces)) {
    assert.match(text, /Boundary Design \(conditional\)/, `${label}: missing conditional boundary design`);
    assert.match(text, /only when[^\n]*introduces or changes[^\n]*module boundary[^\n]*omit it otherwise/i);
    assert.match(text, /substitution need/i);
    assert.match(text, /enabling point/i);
    assert.match(text, /real alternative implementation/i);
    assert.match(text, /if any[^\n]*missing[^\n]*(?:do not|must not) add[^\n]*seam/i);

    assert.match(text, /Gray-Box Evidence \(conditional\)/, `${label}: missing independently conditional gray-box evidence`);
    assert.match(text, /named[^\n]*evidence gap/i);
    assert.match(text, /independent[^\n]*module boundary|whether or not[^\n]*module boundary/i);
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

type SemanticMarkerGroup = readonly [name: string, alternatives: readonly RegExp[]];

function boundedTextBetween(document: string, start: RegExp, end: RegExp, label: string): string {
  const startMatch = start.exec(document);
  assert.ok(startMatch, `${label}: missing section start`);
  const contentStart = startMatch.index + startMatch[0].length;
  const endMatch = end.exec(document.slice(contentStart));
  assert.ok(endMatch, `${label}: missing section end`);
  return document.slice(contentStart, contentStart + endMatch.index);
}

function assertSemanticMarkerGroups(text: string, scope: string, groups: readonly SemanticMarkerGroup[]): void {
  const missing = groups
    .filter(([, alternatives]) => !alternatives.some((pattern) => pattern.test(text)))
    .map(([name]) => name);
  assert.deepEqual(missing, [], `${scope}: missing semantic obligations`);
}

const anonymousKernelDoctrineDimensions: readonly SemanticMarkerGroup[] = [
  [
    "observable contract before implementation",
    [
      /observable (?:behavior|contract)[\s\S]{0,120}(?:before|precedes?) implementation/i,
      /(?:before|prior to) implementation[\s\S]{0,120}observable (?:behavior|contract)/i,
    ],
  ],
  [
    "justified concrete seam",
    [
      /seams?[\s\S]{0,180}(?:named variance|trust boundar|failure risk)[\s\S]{0,180}(?:enabling point|concrete alternative)/i,
      /(?:enabling point|concrete alternative)[\s\S]{0,180}seams?[\s\S]{0,180}(?:named variance|trust boundar|failure risk)/i,
    ],
  ],
  [
    "outside-first consequence-aware evidence",
    [
      /(?:outside[- ]first|from the outside first|observable boundary (?:evidence|test|behavior)[^\n]{0,80}first)[\s\S]{0,180}deeper (?:checks?|evidence)[\s\S]{0,140}named evidence gap[\s\S]{0,100}consequence/i,
      /consequence[\s\S]{0,180}(?:outside[- ]first|from the outside first|observable boundary (?:evidence|test|behavior)[^\n]{0,80}first)[\s\S]{0,180}deeper (?:checks?|evidence)[\s\S]{0,140}named evidence gap/i,
    ],
  ],
  ["smallest safe vertical slice", [/smallest safe[\s\S]{0,80}(?:vertical|end-to-end)[\s\S]{0,40}(?:slice|behavior)/i]],
  [
    "feedback returns to the earliest contract",
    [/feedback[\s\S]{0,160}earliest (?:lifecycle )?phase[\s\S]{0,100}contract[\s\S]{0,80}(?:change|reopen)/i],
  ],
];

const approvedVerificationConsequenceGroups = [
  "security",
  "privacy",
  "authorization or tenant isolation",
  "data integrity",
  "external providers",
  "retries or idempotency",
  "cost controls",
  "recovery",
] as const;

function assertUnnamedLifecycleSurface(text: string, scope: string): void {
  assert.doesNotMatch(text, /Contract[–-]Seam[–-]Feedback|\bCSF\b/i, scope);
  const missingDimensions = anonymousKernelDoctrineDimensions
    .filter(([, alternatives]) => !alternatives.some((pattern) => pattern.test(text)))
    .map(([name]) => name);
  assert.notEqual(
    missingDimensions.length,
    0,
    `${scope}: anonymous full-doctrine repetition duplicates every kernel dimension`,
  );
}

function normalizedBoundedConsequenceGroups(text: string, scope: string): string[] {
  const source = /bounded consequence set[^:\n]*:\s*\*\*([^*\n]+)\*\*/i.exec(text)?.[1];
  assert.ok(source, `${scope}: missing explicitly bounded semicolon-delimited consequence source list`);
  return source
    .split(";")
    .map((member) => member.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!?]+$/g, ""))
    .filter((member) => member.length > 0)
    .sort();
}

function assertExactBoundedConsequenceGroups(text: string, scope: string): void {
  assert.deepEqual(
    normalizedBoundedConsequenceGroups(text, scope),
    [...approvedVerificationConsequenceGroups].sort(),
    `${scope}: bounded source list must contain exactly the approved eight normalized groups`,
  );
}

const feedbackRouteMarkerGroups: readonly SemanticMarkerGroup[] = [
  ["unknown fact routes to research", [/unknown facts?[^\n]{0,100}research|research[^\n]{0,100}unknown facts?/i]],
  [
    "changed desired behavior routes to create",
    [/changed desired behavior[^\n]{0,100}create|create[^\n]{0,100}changed desired behavior/i],
  ],
  [
    "architecture or design gap routes to plan",
    [/(?:architecture|design) gap[^\n]{0,100}plan|plan[^\n]{0,100}(?:architecture|design) gap/i],
  ],
  [
    "known implementation defect routes to ship",
    [/known implementation defect[^\n]{0,100}ship|ship[^\n]{0,100}known implementation defect/i],
  ],
  ["route is advisory", [/advisory|recommend(?:ed|ation)?/i]],
  ["route decision is evidence", [/progress\.md[\s\S]{0,120}route|route[\s\S]{0,120}progress\.md/i]],
  [
    "route does not invoke another phase automatically",
    [
      /(?:does not|must not|never)[^\n]{0,120}(?:invoke|run|trigger)[^\n]{0,80}(?:command|phase)/i,
      /(?:command|phase)[^\n]{0,80}(?:is not|is never|does not)[^\n]{0,80}(?:automatic|invoked|triggered)/i,
    ],
  ],
  [
    "route does not select lifecycle scope",
    [
      /(?:does not|must not|never)[^\n]{0,120}(?:select|choose)[^\n]{0,80}(?:slug|artifact|work)/i,
      /(?:slug|artifact|work)[^\n]{0,80}(?:is not|is never|does not)[^\n]{0,80}(?:selected|chosen)/i,
    ],
  ],
];

test("contract-seam-feedback kernel is semantically single-sourced", () => {
  const lifecycle = readRequired(".pi/skills/development-lifecycle/SKILL.md");
  const unnamedSurfaces = [
    ".pi/prompts/init.md",
    ".pi/prompts/research.md",
    ".pi/prompts/create.md",
    ".pi/prompts/ship.md",
    ".pi/prompts/verify.md",
    ".pi/workflows/development-lifecycle-workflow.md",
  ];

  for (const path of unnamedSurfaces) {
    assertUnnamedLifecycleSurface(readRequired(path), path);
  }

  const anonymousDoctrineMutation = [
    "Define observable behavior before implementation.",
    "Add a seam only for named variance, a trust boundary, or a failure risk, with a reachable enabling point and a concrete alternative.",
    "Verify from the outside first, adding deeper evidence only for a named evidence gap and its consequence.",
    "Deliver the smallest safe vertical slice.",
    "Route feedback to the earliest lifecycle phase whose contract must change.",
  ].join(" ");
  assert.throws(
    () => assertUnnamedLifecycleSurface(anonymousDoctrineMutation, "synthetic unnamed surface"),
    /anonymous full-doctrine repetition/i,
  );

  assert.equal(
    (lifecycle.match(/Contract[–-]Seam[–-]Feedback/gi) ?? []).length,
    1,
    "development lifecycle must contain one named kernel authority",
  );

  const kernelHeading = /^## Contract[–-]Seam[–-]Feedback(?: \(CSF\))?(?: Lifecycle)? Kernel[ \t]*$/im;
  const kernel = boundedTextBetween(
    lifecycle,
    kernelHeading,
    /^## Slash Commands \(Lifecycle Hooks\)[ \t]*$/m,
    "lifecycle kernel",
  );
  const kernelAndFlow = boundedTextBetween(
    lifecycle,
    kernelHeading,
    /^## When to Use Each Phase[ \t]*$/m,
    "lifecycle kernel and flow",
  );

  assertSemanticMarkerGroups(kernel, "lifecycle kernel", [
    [
      "observable behavior precedes implementation",
      [
        /observable (?:behavior|contract)[\s\S]{0,100}before implementation/i,
        /before implementation[\s\S]{0,100}observable (?:behavior|contract)/i,
      ],
    ],
    ["seam requires named or concrete variance", [/seams?[\s\S]{0,120}(?:named|concrete) variance/i]],
    ["trust boundary is a seam reason", [/trust boundar/i]],
    ["failure risk is a seam reason", [/failure risk/i]],
    ["seam has an enabling point", [/(?:reachable )?enabling point/i]],
    ["seam has a concrete alternative", [/(?:concrete|real) alternative/i]],
    ["evidence starts outside", [/outside[- ]first|from the outside first|observable boundary evidence first/i]],
    ["deeper evidence is explicit", [/deeper evidence/i]],
    ["deeper evidence names a gap", [/named evidence gap/i]],
    ["deeper evidence is consequence-aware", [/\bconsequence\b/i]],
    ["delivery is the smallest safe vertical slice", [/smallest safe (?:vertical|end-to-end) (?:slice|behavior)/i]],
    [
      "feedback returns to the earliest contract",
      [/earliest (?:lifecycle )?phase[\s\S]{0,100}contract[\s\S]{0,60}(?:change|reopen)/i],
    ],
    ["compact rule requires an observable contract", [/observable contract/i]],
    [
      "compact rule rejects unjustified gray-box checks",
      [/gray-box[\s\S]{0,100}evidence gap|evidence gap[\s\S]{0,100}gray-box/i],
    ],
    ["compact rule ties MVP claims to learning", [/MVP[\s\S]{0,100}learning signal|learning signal[\s\S]{0,100}MVP/i]],
    [
      "spec stores the observable contract",
      [/spec\.md[\s\S]{0,120}observable contract|observable contract[\s\S]{0,120}spec\.md/i],
    ],
    [
      "plan stores boundary and seam design",
      [/plan\.md[\s\S]{0,120}(?:boundar|seam)|(?:boundar|seam)[\s\S]{0,120}plan\.md/i],
    ],
    [
      "plan stores evidence design",
      [/plan\.md[\s\S]{0,120}evidence|evidence[\s\S]{0,120}plan\.md/i],
    ],
    [
      "tasks graph remains scheduling authority",
      [/tasks\.json[\s\S]{0,120}(?:authoritative|schedul)|(?:authoritative|schedul)[\s\S]{0,120}tasks\.json/i],
    ],
    [
      "progress stores attempt evidence",
      [/progress\.md[\s\S]{0,120}(?:attempt|evidence)|(?:attempt|evidence)[\s\S]{0,120}progress\.md/i],
    ],
    [
      "progress stores the route decision",
      [/progress\.md[\s\S]{0,120}route|route[\s\S]{0,120}progress\.md/i],
    ],
    [
      "Hindsight remains durable cross-feature memory",
      [
        /Hindsight[\s\S]{0,120}durable[\s\S]{0,80}cross-feature/i,
        /durable[\s\S]{0,80}cross-feature[\s\S]{0,120}Hindsight/i,
      ],
    ],
  ]);
  assertSemanticMarkerGroups(kernelAndFlow, "lifecycle feedback routing", feedbackRouteMarkerGroups);
});

test("lifecycle intake phases expose decision-bearing contracts", () => {
  const init = boundedTextBetween(
    readRequired(".pi/prompts/init.md"),
    /^### Phase 1: Detect Project[ \t]*$/m,
    /^### Phase 2: Preview Detection and Merge[ \t]*$/m,
    "init detection",
  );
  const research = boundedTextBetween(
    readRequired(".pi/prompts/research.md"),
    /^### Phase 4: Document[ \t]*$/m,
    /^## Output[ \t]*$/m,
    "research documentation",
  );
  const create = boundedTextBetween(
    readRequired(".pi/prompts/create.md"),
    /^## Phase 7: Write PRD[ \t]*$/m,
    /^## Phase 8: Validate PRD[ \t]*$/m,
    "create PRD",
  );

  assertSemanticMarkerGroups(init, "init detection", [
    ["validated intended outcome or hypothesis", [/(?:intended outcome|product hypothesis)/i]],
    ["material boundaries", [/(?:material|major)[^\n]{0,100}boundar|boundar[^\n]{0,100}(?:material|major)/i]],
    ["external boundary", [/external[^\n]{0,60}boundar|boundar[^\n]{0,60}external/i]],
    ["trust boundary", [/trust[^\n]{0,60}boundar|boundar[^\n]{0,60}trust/i]],
    ["volatility boundary", [/volatil[^\n]{0,60}boundar|boundar[^\n]{0,60}volatil/i]],
    ["available evidence or feedback channels", [/(?:evidence|feedback)[^\n]{0,60}channels?/i]],
    [
      "initialization does not invent speculative seams",
      [/(?:do not|must not|never)[^\n]{0,100}(?:invent|speculat)[^\n]{0,60}(?:seams?|adapters?)/i],
    ],
  ]);

  assertSemanticMarkerGroups(research, "research documentation", [
    ["decision question", [/decision question/i]],
    ["evidence", [/\bevidence\b/i]],
    ["confidence", [/\bconfidence\b/i]],
    ["alternatives", [/\balternatives?\b/i]],
    ["contract impact", [/contract impact/i]],
    ["unresolved risks", [/unresolved risks?/i]],
  ]);

  assertSemanticMarkerGroups(create, "create PRD", [
    ["observable success behavior", [/observable[^\n]{0,80}(?:success|behavior)|success[^\n]{0,80}observable/i]],
    ["essential journeys", [/essential journeys?/i]],
    ["inputs", [/\binputs?\b/i]],
    ["outputs", [/\boutputs?\b/i]],
    ["errors", [/\berrors?\b/i]],
    ["side effects", [/side effects?/i]],
    ["non-goals", [/non-goals?/i]],
    ["non-deferrable controls", [/non-deferrable[^\n]{0,40}controls?/i]],
    [
      "learning guidance is conditional to product or release work",
      [
        /(?:only|conditional)[^\n]{0,120}(?:product|release)/i,
        /(?:product|release)[^\n]{0,120}(?:only|conditional|when relevant)/i,
      ],
    ],
    ["learning signal or real feedback path", [/learning signal|real feedback path/i]],
    [
      "internal tooling does not invent a learning signal",
      [
        /internal (?:tooling|work)[^\n]{0,120}(?:does not|must not|should not|never)[^\n]{0,80}(?:invent|require)/i,
        /(?:does not|must not|should not|never)[^\n]{0,100}(?:invent|require)[^\n]{0,80}internal (?:tooling|work)/i,
      ],
    ],
    [
      "technical readiness is not validated learning",
      [
        /tests?[^\n]{0,100}readiness[^\n]{0,80}(?:not|cannot|does not)[^\n]{0,60}validated learning/i,
        /readiness[^\n]{0,80}(?:not|cannot|does not)[^\n]{0,80}validated learning/i,
      ],
    ],
  ]);
});

test("delivery phases select observable and consequence-based evidence", () => {
  const ship = boundedTextBetween(
    readRequired(".pi/prompts/ship.md"),
    /^### TDD Execution Flow[ \t]*$/m,
    /^### Task Commit Protocol[ \t]*$/m,
    "ship TDD flow",
  );
  const verify = boundedTextBetween(
    readRequired(".pi/prompts/verify.md"),
    /^## Phase 3: Correctness[ \t]*$/m,
    /^## Phase 4: Coherence \(skip with --quick\)[ \t]*$/m,
    "verify correctness",
  );

  assertSemanticMarkerGroups(verify, "verify changed-file execution mode", [
    ["changed-file heuristic", [/changed files?|changed-file/i]],
    ["incremental mode", [/\bincremental\b/i]],
    ["full mode", [/\bfull\b/i]],
  ]);

  assertSemanticMarkerGroups(ship, "ship TDD flow", [
    ["smallest safe vertical slice", [/smallest safe[\s\S]{0,80}(?:vertical|end-to-end)[\s\S]{0,40}(?:slice|behavior)/i]],
    ["failing observable boundary evidence", [/failing[\s\S]{0,80}observable boundary (?:test|evidence|behavior)/i]],
    [
      "observable boundary test is mandatory for behavior changes",
      [
        /behavior-changing[^\n]{0,120}(?:must|required)[^\n]{0,100}failing observable boundary test/i,
        /failing observable boundary test[^\n]{0,120}(?:must|required)[^\n]{0,100}behavior-changing/i,
      ],
    ],
    ["test doubles use justified seams", [/(?:fakes?|test doubles?)[^\n]{0,100}justified seams?/i]],
    [
      "private-method mocks are prohibited",
      [/(?:do not|must not|never|no|prohibit)[^\n]{0,100}(?:private[- ]method mocks?|mock(?:ing|s)?[^\n]{0,30}private)/i],
    ],
    [
      "test-only production APIs are prohibited",
      [/(?:do not|must not|never|no|prohibit)[^\n]{0,100}test-only production (?:APIs?|methods?)/i],
    ],
    [
      "speculative test interfaces are prohibited",
      [
        /(?:do not|must not|never|no|prohibit)[^\n]{0,120}(?:speculative interfaces?|interfaces?[^\n]{0,50}(?:solely|only)[^\n]{0,40}(?:for )?testing)/i,
      ],
    ],
  ]);

  const consequenceMarkerGroups: readonly SemanticMarkerGroup[] = [
    ["security", [/\bsecurity\b/i]],
    ["privacy", [/\bprivacy\b/i]],
    [
      "authorization and tenant isolation",
      [
        /authori[sz]ation[\s\S]{0,100}tenant isolation/i,
        /tenant isolation[\s\S]{0,100}authori[sz]ation/i,
      ],
    ],
    ["data integrity", [/data integrity/i]],
    ["external providers", [/external providers?/i]],
    [
      "retries and idempotency",
      [/retr(?:y|ies)[\s\S]{0,100}idempoten|idempoten[\s\S]{0,100}retr(?:y|ies)/i],
    ],
    ["cost controls", [/cost controls?/i]],
    ["recovery", [/\brecovery\b/i]],
  ];
  assert.equal(consequenceMarkerGroups.length, 8, "verification consequence set must stay bounded to eight groups");
  assertSemanticMarkerGroups(verify, "verify bounded consequence set", [
    ["consequence set is explicitly bounded", [/bounded[^\n]{0,80}(?:consequence|risk)|(?:consequence|risk)[^\n]{0,80}bounded/i]],
    ...consequenceMarkerGroups,
  ]);
  assertExactBoundedConsequenceGroups(verify, "verify bounded consequence set");

  const ninthConsequenceMutation = verify.replace(
    /cost controls; recovery\./i,
    "cost controls; availability; recovery.",
  );
  assert.notEqual(ninthConsequenceMutation, verify, "ninth-consequence mutation must alter the bounded source list");
  assert.throws(
    () => assertExactBoundedConsequenceGroups(ninthConsequenceMutation, "synthetic ninth-consequence source list"),
    /exactly the approved eight/i,
  );

  assertSemanticMarkerGroups(verify, "verify evidence selection", [
    [
      "observable behavior and controlled failures come first",
      [
        /observable (?:behavior|evidence)[\s\S]{0,160}controlled failures?[\s\S]{0,100}first/i,
        /first[\s\S]{0,100}observable (?:behavior|evidence)[\s\S]{0,160}controlled failures?/i,
      ],
    ],
    ["deeper checks require a named evidence gap", [/deeper (?:checks?|evidence)[\s\S]{0,120}named evidence gap/i]],
    ["deeper checks use a stable inspection seam", [/stable inspection seam/i]],
    ["recorded evidence names its vantage", [/(?:recorded )?(?:result|evidence)[\s\S]{0,120}(?:names?|states?)[^\n]{0,60}vantage/i]],
    ["observable-behavior vantage", [/observable behavior/i]],
    ["provider-contract vantage", [/(?:adapter|provider) contract/i]],
    ["real-integration vantage", [/real integration/i]],
    ["justified structural or gray-box vantage", [/(?:structural|gray-box) evidence/i]],
    [
      "experiment readiness is scoped to product or release work",
      [
        /(?:product|release)[^\n]{0,120}experiment readiness/i,
        /experiment readiness[^\n]{0,120}(?:product|release)/i,
      ],
    ],
    [
      "experiment-readiness scope is conditional",
      [
        /conditional[^\n]{0,120}(?:product|release|experiment readiness)/i,
        /(?:product|release|experiment readiness)[^\n]{0,120}(?:conditional|only for|when relevant)/i,
      ],
    ],
    ["validated learning remains distinct", [/validated learning/i]],
    [
      "technical evidence cannot establish validated learning",
      [/(?:tests?|reviewer score)[^\n]{0,120}(?:cannot|does not|do not)[^\n]{0,100}(?:establish|prove)[^\n]{0,80}validated learning/i],
    ],
  ]);
  assertSemanticMarkerGroups(verify, "verify feedback routing", feedbackRouteMarkerGroups);
});

test("Astro upstream skills, practice skill, and templates are available", () => {
  const upstreamSkills = [
    "analyze-github-action-logs",
    "astro-developer",
    "astro-pr-writer",
    "changeset",
    "merge",
    "triage",
    "writing-comments",
  ];

  for (const name of upstreamSkills) {
    const skill = readRequired(`${SKILLS}/${name}/SKILL.md`);
    assert.match(skill, new RegExp(`^name:\\s*${name}$`, "m"), name);
    assert.ok(existsSync(`${SKILLS}/${name}/LICENSE`), `${name}: upstream MIT license is missing`);
  }

  const practices = readRequired(`${SKILLS}/astro-web-practices/SKILL.md`);
  assert.match(practices, /^name:\s*astro-web-practices$/m);
  assert.match(practices, /smallest relevant official example/i);
  assert.match(practices, /semantic HTML/i);
  assert.match(practices, /hydrate[^\n]*(?:only|when)/i);
  assert.match(practices, /prefers-reduced-motion/i);
  assert.match(practices, /repository-defined|project-defined/i);

  const provenance = readRequired(`${SKILLS}/astro-web-practices/references/provenance.md`);
  assert.match(provenance, /0fc519de12d69088052b76e096a4adfdc789c30c/);
  assert.match(provenance, /2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/);
  assert.match(provenance, /MIT/i);

  const templateRoot = ".pi/templates/astro/examples";
  const templateDirs = readdirSync(templateRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  assert.equal(templateDirs.length, 24);
  for (const name of ["minimal", "basics", "blog", "ssr", "with-mdx", "with-vitest"]) {
    assert.ok(existsSync(`${templateRoot}/${name}`), `Astro template is missing: ${name}`);
  }
  assert.ok(existsSync(".pi/templates/astro/LICENSE"), "Astro template MIT license is missing");
  assert.ok(existsSync(".pi/templates/astro/UPSTREAM.md"), "Astro template provenance is missing");
});

test("lifecycle workflow is optional and non-cyclic", () => {
  const lifecycleFlow = boundedTextBetween(
    readRequired(".pi/skills/development-lifecycle/SKILL.md"),
    /^## Workflow[ \t]*$/m,
    /^## When to Use Each Phase[ \t]*$/m,
    "lifecycle workflow",
  );
  const workflowIntro = boundedTextBetween(
    readRequired(".pi/workflows/development-lifecycle-workflow.md"),
    /^# development-lifecycle-workflow[ \t]*$/m,
    /^## Fabric Agent Execution[ \t]*$/m,
    "optional workflow introduction",
  );

  assertSemanticMarkerGroups(lifecycleFlow, "canonical lifecycle workflow", [
    ["research remains sideways", [/research[^\n]{0,80}sideways|sideways[^\n]{0,80}research/i]],
    ["tasks graph remains authoritative", [/tasks\.json[^\n]{0,100}authoritative/i]],
  ]);
  assertSemanticMarkerGroups(workflowIntro, "optional lifecycle workflow", [
    ["workflow is optional", [/\boptional\b/i]],
    ["workflow is bounded", [/\bbounded\b/i]],
    ["workflow is a helper", [/\bhelper\b/i]],
    ["workflow is one-shot", [/one[- ]shot/i]],
    ["workflow is not canonical", [/(?:not|isn't)[^\n]{0,80}canonical lifecycle|canonical lifecycle[^\n]{0,80}(?:not|isn't)/i]],
    ["workflow does not loop or cycle", [/(?:does not|must not|never)[^\n]{0,80}(?:loop|cycle)|non[- ]cyclic/i]],
    [
      "workflow does not trigger another phase automatically",
      [/(?:does not|must not|never)[^\n]{0,100}(?:trigger|invoke|start)[^\n]{0,100}(?:phase|command)[^\n]{0,80}automatic/i],
    ],
    [
      "workflow does not select lifecycle scope",
      [/(?:does not|must not|never)[^\n]{0,100}(?:select|choose)[^\n]{0,80}(?:slug|artifact|work)/i],
    ],
  ]);
});
