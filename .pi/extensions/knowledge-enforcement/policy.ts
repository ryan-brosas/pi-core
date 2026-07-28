export interface SkillDescriptor {
  name: string;
  description: string;
  filePath: string;
}

export interface TurnClassification {
  required: boolean;
  optedOut: boolean;
}

export type GroundingObservationKind = "skill-read" | "exemplar-read" | "mutation";

export interface GroundingObservation {
  kind: GroundingObservationKind;
  path: string;
  sequence: number;
}

export interface GroundingEvidence {
  skillReads: string[];
  exemplarReads: string[];
  mutationSeen: boolean;
  groundingBeforeMutation: boolean;
}

export interface ComplianceResult {
  compliant: boolean;
  missing: string[];
}

const WAIVER_PHRASES = [
  "skip reference grounding",
  "skip grounding",
  "do not inspect references",
  "don't inspect references",
  "work from scratch without references",
];

const ACTION_WORDS = new Set([
  "add", "build", "create", "develop", "fix", "generalize", "implement", "migrate",
  "modify", "refactor", "replace", "rewrite", "update",
]);

const ARTIFACT_WORDS = new Set([
  "api", "class", "code", "component", "endpoint", "extension", "function", "module",
  "package", "parser", "plugin", "script", "service", "system", "test", "tool", "workflow",
]);

const TRIVIAL_PHRASES = ["fix the typo", "correct the typo", "format this", "reformat this"];

const MATCH_STOP_WORDS = new Set([
  "a", "an", "and", "any", "before", "code", "coding", "create", "creating", "develop",
  "for", "implementation", "in", "is", "modify", "modifying", "of", "or", "project",
  "review", "reviewing", "the", "this", "to", "use", "when", "with", "work", "working",
]);

const CODE_EXTENSIONS = [
  ".astro", ".c", ".cc", ".cpp", ".cs", ".go", ".h", ".hpp", ".java", ".js", ".jsx",
  ".kt", ".php", ".py", ".rb", ".rs", ".svelte", ".swift", ".ts", ".tsx", ".vue",
];

function stem(token: string): string {
  if (token.endsWith("ies") && token.length > 4) return token.slice(0, -3) + "y";
  if (token.endsWith("ing") && token.length > 5) {
    const base = token.slice(0, -3);
    return base.endsWith("at") || base.endsWith("it") ? base + "e" : base;
  }
  if (token.endsWith("ed") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 3) return token.slice(0, -1);
  return token;
}

function tokens(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g)?.map(stem) ?? [];
}

function hasAnyToken(text: string, values: Set<string>): boolean {
  return tokens(text).some((token) => values.has(token));
}

export function classifyTurn(prompt: string): TurnClassification {
  const lower = prompt.toLowerCase();
  if (WAIVER_PHRASES.some((phrase) => lower.includes(phrase))) {
    return { required: false, optedOut: true };
  }
  if (TRIVIAL_PHRASES.some((phrase) => lower.includes(phrase))) {
    return { required: false, optedOut: false };
  }
  return {
    required: hasAnyToken(prompt, ACTION_WORDS) && hasAnyToken(prompt, ARTIFACT_WORDS),
    optedOut: false,
  };
}

export function matchSkills(prompt: string, skills: SkillDescriptor[]): SkillDescriptor[] {
  const promptTokens = new Set(tokens(prompt).filter((token) => !MATCH_STOP_WORDS.has(token)));
  return skills
    .map((skill) => {
      const skillTokens = new Set(
        tokens(skill.name + " " + skill.description).filter((token) => !MATCH_STOP_WORDS.has(token)),
      );
      let score = 0;
      for (const token of promptTokens) {
        if (skillTokens.has(token)) score++;
      }
      return { skill, score };
    })
    .filter((candidate) => candidate.score >= 2)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))
    .slice(0, 2)
    .map((candidate) => candidate.skill);
}

function validTrace(details: unknown): details is {
  success: true;
  trace: { kind: "pi-fabric.execution"; version: 1; outcome: "succeeded"; operations: unknown[] };
} {
  if (!details || typeof details !== "object") return false;
  const envelope = details as Record<string, unknown>;
  if (envelope.success !== true || !envelope.trace || typeof envelope.trace !== "object") return false;
  const trace = envelope.trace as Record<string, unknown>;
  return trace.kind === "pi-fabric.execution" && trace.version === 1 &&
    trace.outcome === "succeeded" && Array.isArray(trace.operations);
}

function operationPath(args: unknown): string | null {
  if (!args || typeof args !== "object" || Array.isArray(args)) return null;
  const value = args as Record<string, unknown>;
  const candidate = value.path ?? value.filePath;
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

function isCodePath(path: string): boolean {
  const lower = path.toLowerCase();
  return CODE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function isExcludedExemplar(path: string): boolean {
  const lower = path.toLowerCase();
  return lower.includes("/.pi/skills/") || lower.includes("/.pi/tests/") ||
    lower.includes("/test/") || /(?:^|\/)tests?\//.test(lower) ||
    /(?:\.test|\.spec)\.[^.]+$/.test(lower);
}

function isWithinCwd(path: string, cwd: string): boolean {
  const prefix = cwd.endsWith("/") ? cwd : cwd + "/";
  return path === cwd || path.startsWith(prefix);
}

export function extractFabricObservations(
  details: unknown,
  cwd: string,
  matchedSkills: SkillDescriptor[],
): GroundingObservation[] {
  if (!validTrace(details)) return [];
  const skillPaths = new Set(matchedSkills.map((skill) => skill.filePath));
  const operations = details.trace.operations
    .filter((raw): raw is Record<string, unknown> => Boolean(raw) && typeof raw === "object")
    .filter((operation) => operation.type === "call" && operation.outcome === "succeeded" &&
      Number.isInteger(operation.sequence) && (operation.sequence as number) >= 0 &&
      typeof operation.ref === "string");
  const mutationPaths = new Set(
    operations
      .filter((operation) => operation.ref === "pi.edit" || operation.ref === "pi.write")
      .map((operation) => operationPath(operation.args))
      .filter((path): path is string => path !== null),
  );
  const observations: GroundingObservation[] = [];
  for (const operation of operations) {
    const ref = operation.ref as string;
    const sequence = operation.sequence as number;
    const path = operationPath(operation.args);
    if (path === null) continue;
    if (ref === "pi.edit" || ref === "pi.write") {
      observations.push({ kind: "mutation", path, sequence });
      continue;
    }
    if (ref !== "pi.read" && ref !== "pi.grep") continue;
    if (ref === "pi.read" && skillPaths.has(path)) {
      observations.push({ kind: "skill-read", path, sequence });
      continue;
    }
    if (isWithinCwd(path, cwd) && isCodePath(path) && !isExcludedExemplar(path) &&
      !mutationPaths.has(path)) {
      observations.push({ kind: "exemplar-read", path, sequence });
    }
  }
  return observations.sort((a, b) => a.sequence - b.sequence);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function applyObservations(
  current: GroundingEvidence | undefined,
  observations: GroundingObservation[],
  matchedSkills: SkillDescriptor[],
): GroundingEvidence {
  const evidence: GroundingEvidence = current
    ? { ...current, skillReads: [...current.skillReads], exemplarReads: [...current.exemplarReads] }
    : { skillReads: [], exemplarReads: [], mutationSeen: false, groundingBeforeMutation: false };
  const requiredSkillPaths = matchedSkills.map((skill) => skill.filePath);
  for (const observation of [...observations].sort((a, b) => a.sequence - b.sequence)) {
    if (observation.kind === "skill-read") evidence.skillReads.push(observation.path);
    if (observation.kind === "exemplar-read") evidence.exemplarReads.push(observation.path);
    if (observation.kind === "mutation" && !evidence.mutationSeen) {
      const skillsReady = requiredSkillPaths.length === 0 ||
        requiredSkillPaths.every((path) => evidence.skillReads.includes(path));
      evidence.groundingBeforeMutation = skillsReady && evidence.exemplarReads.length > 0;
      evidence.mutationSeen = true;
    }
  }
  evidence.skillReads = unique(evidence.skillReads);
  evidence.exemplarReads = unique(evidence.exemplarReads);
  return evidence;
}

export function evaluateCompliance(
  required: boolean,
  matchedSkills: SkillDescriptor[],
  evidence: GroundingEvidence,
): ComplianceResult {
  if (!required || !evidence.mutationSeen) return { compliant: true, missing: [] };
  const missing: string[] = [];
  if (matchedSkills.some((skill) => !evidence.skillReads.includes(skill.filePath))) {
    missing.push("matched-skill-read");
  }
  if (evidence.exemplarReads.length === 0) missing.push("exemplar-read");
  if (!evidence.groundingBeforeMutation) missing.push("grounding-before-mutation");
  return { compliant: missing.length === 0, missing };
}
