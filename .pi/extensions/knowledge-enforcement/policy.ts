import { resolve } from "node:path";

export type SupervisionMode = "none" | "implementation" | "review-verification";

export type ActivityObservation =
  | { kind: "inspect"; path: string; sequence: number }
  | { kind: "mutate"; path: string; sequence: number }
  | { kind: "verify"; sequence: number }
  | { kind: "diff"; sequence: number }
  | { kind: "graph-health"; sequence: number }
  | { kind: "graph-impact"; sequence: number }
  | { kind: "graph-source"; sequence: number }
  | { kind: "graph-unavailable"; sequence: number }
  | { kind: "mutation-attempt"; sequence: number };

export interface ActivityEvidence {
  inspectedPaths: string[];
  mutatedPaths: string[];
  exemplarPaths: string[];
  verificationCount: number;
  diffInspectionCount: number;
  graphHealthCount: number;
  graphImpactCount: number;
  graphSourceVerificationCount: number;
  mutationSeen: boolean;
  verificationAfterMutation: boolean;
  diffAfterMutation: boolean;
}

export interface ScopeClassification {
  mode: SupervisionMode;
  reasons: string[];
}

const MAINTAINED_EXTENSIONS = [
  ".astro", ".c", ".cc", ".cpp", ".cs", ".go", ".h", ".hpp", ".java", ".js", ".jsx",
  ".json", ".kt", ".php", ".py", ".rb", ".rs", ".svelte", ".swift", ".toml", ".ts",
  ".tsx", ".vue", ".yaml", ".yml",
];

const RUNTIME_PATH_PARTS = [
  "/.git/", "/.pi/artifacts/", "/.pi/fabric/mesh/", "/.pi/hindsight/", "/.pi/state/",
  "/cache/", "/coverage/", "/dist/", "/node_modules/",
];

const HIGH_CONSEQUENCE_PARTS = [
  "/auth/", "/billing/", "/database/", "/migration", "/oauth/", "/payment", "/permission",
  "/security/", "/session", "/storage/",
];

const VERIFICATION_COMMAND = /(?:^|\s)(?:cargo\s+test|deno\s+test|go\s+test|npm\s+(?:run\s+)?test|node\b[^\n]*--test|pnpm\s+(?:run\s+)?test|pytest\b|swift\s+test|yarn\s+test|tsc\b|eslint\b|fallow\b)/i;
const DIFF_COMMAND = /(?:^|\s)git\s+(?:diff|show)(?:\s|$)/i;
const SHELL_MUTATION = /(?:\bsed\b[^\n;&|]*\s-i(?:\s|$)|\bperl\b[^\n;&|]*\s-pi(?:\s|$)|\btee\b|\b(?:cat|printf|echo)\b[^;\n]*>{1,2}\s*\S|\bgit\s+apply\b|(?:^|[;&|]\s*)patch\b)/i;

export function isMutatingShellCommand(command: string): boolean {
  return SHELL_MUTATION.test(command);
}

const PROJECT_INTELLIGENCE_HEALTH_REF = "mcp.pi-core-intelligence.project_health";
const PROJECT_INTELLIGENCE_CODE_REF = "mcp.pi-core-intelligence.find_relevant_code";
const PROJECT_INTELLIGENCE_IMPACT_REF = "mcp.pi-core-intelligence.analyze_impact";
const PROJECT_INTELLIGENCE_CONTEXT_REF = "mcp.pi-core-intelligence.project_context";
const PROJECT_INTELLIGENCE_REFS = new Set([
  PROJECT_INTELLIGENCE_HEALTH_REF,
  PROJECT_INTELLIGENCE_CODE_REF,
  PROJECT_INTELLIGENCE_IMPACT_REF,
  PROJECT_INTELLIGENCE_CONTEXT_REF,
]);

const GRAPH_HEALTH_REFS = new Set([
  "mcp.codegraphcontext.get_repository_stats",
  "mcp.codegraphcontext.find_code",
  PROJECT_INTELLIGENCE_HEALTH_REF,
  PROJECT_INTELLIGENCE_CODE_REF,
]);

const GRAPH_IMPACT_REFS = new Set([
  "mcp.codegraphcontext.analyze_code_relationships",
  "mcp.codegraphcontext.find_dead_code",
  "mcp.codegraphcontext.find_most_complex_functions",
  "mcp.codegraphcontext.calculate_cyclomatic_complexity",
  "mcp.codegraphcontext.simulate_metrics",
  "mcp.codegraphcontext.analyze_architectural_evolution",
  "mcp.codegraphcontext.simulate_architectural_change",
  PROJECT_INTELLIGENCE_IMPACT_REF,
]);

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

function operationCommand(args: unknown): string | null {
  if (!args || typeof args !== "object" || Array.isArray(args)) return null;
  const value = args as Record<string, unknown>;
  const candidate = value.cmd ?? value.command ?? value.shell;
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

function operationSettlesFailures(args: unknown): boolean {
  return Boolean(args && typeof args === "object" && !Array.isArray(args) &&
    (args as Record<string, unknown>).settle === true);
}

function resolveOperationPath(path: string, cwd: string): string {
  return resolve(cwd, path);
}

function isWithinCwd(path: string, cwd: string): boolean {
  const prefix = cwd.endsWith("/") ? cwd : cwd + "/";
  return path === cwd || path.startsWith(prefix);
}

function graphScopesCwd(args: unknown, cwd: string): boolean {
  if (!args || typeof args !== "object" || Array.isArray(args)) return false;
  const input = args as Record<string, unknown>;
  if (typeof input.projectRoot === "string" && input.projectRoot.length > 0) {
    return resolve(cwd, input.projectRoot) === resolve(cwd);
  }
  const indexRoot = input.repo_path ?? input.indexRoot;
  if (typeof indexRoot !== "string" || indexRoot.length === 0) return false;
  return isWithinCwd(resolve(cwd), resolve(cwd, indexRoot));
}

function graphScopesExactCwd(args: unknown, cwd: string): boolean {
  if (!args || typeof args !== "object" || Array.isArray(args)) return false;
  const repoPath = (args as Record<string, unknown>).repo_path;
  return typeof repoPath === "string" && resolve(cwd, repoPath) === resolve(cwd);
}

function parsedObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseGraphPayload(result: unknown): Record<string, unknown> | null {
  const wrapper = parsedObject(result);
  if (!wrapper) return null;
  const structured = parsedObject(wrapper.structuredContent);
  if (structured) return structured;
  const texts = [
    typeof wrapper.text === "string" ? wrapper.text : null,
    ...(Array.isArray(wrapper.content)
      ? wrapper.content.map((entry) => parsedObject(entry)?.text).filter((value): value is string =>
        typeof value === "string")
      : []),
  ];
  for (const text of texts) {
    if (text === null) continue;
    try {
      const parsed = parsedObject(JSON.parse(text));
      if (parsed) return parsed;
    } catch {
      return null;
    }
  }
  return wrapper;
}

function resultPaths(value: unknown, paths: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) resultPaths(item, paths);
    return paths;
  }
  const object = parsedObject(value);
  if (!object) return paths;
  if (typeof object.path === "string") paths.push(object.path);
  for (const nested of Object.values(object)) resultPaths(nested, paths);
  return paths;
}

function successfulProjectIntelligenceResult(
  payload: Record<string, unknown>,
  ref: string,
  cwd: string,
): boolean {
  const status = payload.status;
  const reason = payload.reason;
  const paths = resultPaths(payload.evidence);
  const hasCurrentPath = paths.some((path) => isWithinCwd(resolve(cwd, path), resolve(cwd)));
  if (ref === PROJECT_INTELLIGENCE_HEALTH_REF) {
    return status === "ready" &&
      (reason === "exact-index-statistics" || (reason === "project-source-hit" && hasCurrentPath));
  }
  if (ref === PROJECT_INTELLIGENCE_CODE_REF) {
    return status === "found" && reason === "project-source-hit" && hasCurrentPath;
  }
  if (ref === PROJECT_INTELLIGENCE_IMPACT_REF) {
    return (status === "empty" && reason === "no-project-relationships") ||
      (status === "found" && reason === "project-relationship-hit" && hasCurrentPath);
  }
  return false;
}

function successfulGraphResult(
  operation: Record<string, unknown>,
  ref: string,
  cwd: string,
): boolean {
  if (!("result" in operation)) return !PROJECT_INTELLIGENCE_REFS.has(ref);
  const payload = parseGraphPayload(operation.result);
  if (!payload || payload.success === false || typeof payload.error === "string") return false;
  if (PROJECT_INTELLIGENCE_REFS.has(ref)) {
    return successfulProjectIntelligenceResult(payload, ref, cwd);
  }
  const results = parsedObject(payload.results);
  if (results && typeof results.error === "string") return false;
  const paths = resultPaths(results);
  const hasCurrentPath = paths.some((path) => isWithinCwd(resolve(cwd, path), resolve(cwd)));
  if (ref === "mcp.codegraphcontext.find_code") {
    return typeof results?.total_matches === "number" && results.total_matches > 0 && hasCurrentPath;
  }
  if (GRAPH_IMPACT_REFS.has(ref) && paths.length > 0 && !hasCurrentPath) return false;
  return payload.success === true;
}

function controlledProjectIntelligenceUnavailability(
  operation: Record<string, unknown>,
  ref: string,
): boolean {
  if (!PROJECT_INTELLIGENCE_REFS.has(ref) || !("result" in operation)) return false;
  const payload = parseGraphPayload(operation.result);
  if (!payload) return false;
  if (payload.status === "unavailable") return true;
  if (ref === PROJECT_INTELLIGENCE_CONTEXT_REF) {
    return payload.status === "unresolved" && payload.reason === "no-covering-index";
  }
  if (payload.reason === "stale-graph-evidence") return true;
  return ref === PROJECT_INTELLIGENCE_HEALTH_REF && payload.status === "unproven" &&
    ["no-covering-index", "index-does-not-cover-project", "no-project-evidence"].includes(
      String(payload.reason),
    );
}

function isMaintainedPath(path: string, cwd: string): boolean {
  const lower = path.toLowerCase();
  return isWithinCwd(path, cwd) &&
    !RUNTIME_PATH_PARTS.some((part) => lower.includes(part)) &&
    MAINTAINED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function extractFabricActivity(details: unknown, cwd: string): ActivityObservation[] {
  if (!validTrace(details)) return [];
  const observations: ActivityObservation[] = [];
  const operations = details.trace.operations
    .filter((raw): raw is Record<string, unknown> => Boolean(raw) && typeof raw === "object")
    .filter((operation) => operation.type === "call" && operation.outcome === "succeeded" &&
      Number.isInteger(operation.sequence) && (operation.sequence as number) >= 0 &&
      typeof operation.ref === "string")
    .sort((a, b) => (a.sequence as number) - (b.sequence as number));
  let graphImpactSeen = false;
  for (const operation of operations) {
    const ref = operation.ref as string;
    const sequence = operation.sequence as number;
    if (ref === PROJECT_INTELLIGENCE_CONTEXT_REF) {
      if (graphScopesCwd(operation.args, cwd) &&
        controlledProjectIntelligenceUnavailability(operation, ref)) {
        observations.push({ kind: "graph-unavailable", sequence });
      }
      continue;
    }
    if (GRAPH_HEALTH_REFS.has(ref)) {
      const exactStats = ref !== "mcp.codegraphcontext.get_repository_stats" ||
        graphScopesExactCwd(operation.args, cwd);
      if (exactStats && graphScopesCwd(operation.args, cwd)) {
        if (successfulGraphResult(operation, ref, cwd)) {
          observations.push({ kind: "graph-health", sequence });
        } else if (controlledProjectIntelligenceUnavailability(operation, ref)) {
          observations.push({ kind: "graph-unavailable", sequence });
        }
      }
      continue;
    }
    if (GRAPH_IMPACT_REFS.has(ref)) {
      if (graphScopesCwd(operation.args, cwd)) {
        if (successfulGraphResult(operation, ref, cwd)) {
          observations.push({ kind: "graph-impact", sequence });
          graphImpactSeen = true;
        } else if (controlledProjectIntelligenceUnavailability(operation, ref)) {
          observations.push({ kind: "graph-unavailable", sequence });
        }
      }
      continue;
    }
    if (ref === "pi.read" || ref === "pi.grep") {
      const rawPath = operationPath(operation.args);
      const path = rawPath ? resolveOperationPath(rawPath, cwd) : null;
      if (path && isMaintainedPath(path, cwd)) {
        observations.push({ kind: "inspect", path, sequence });
        if (graphImpactSeen) observations.push({ kind: "graph-source", sequence });
      }
      continue;
    }
    if (ref === "pi.edit" || ref === "pi.write") {
      const rawPath = operationPath(operation.args);
      const path = rawPath ? resolveOperationPath(rawPath, cwd) : null;
      if (path && isMaintainedPath(path, cwd)) observations.push({ kind: "mutate", path, sequence });
      continue;
    }
    if (ref !== "pi.bash") continue;
    const command = operationCommand(operation.args);
    if (!command) continue;
    if (isMutatingShellCommand(command)) observations.push({ kind: "mutation-attempt", sequence });
    if (operationSettlesFailures(operation.args)) continue;
    if (VERIFICATION_COMMAND.test(command)) observations.push({ kind: "verify", sequence });
    if (DIFF_COMMAND.test(command)) observations.push({ kind: "diff", sequence });
  }
  return observations;
}

export function applyActivity(
  current: ActivityEvidence | undefined,
  observations: ActivityObservation[],
): ActivityEvidence {
  const state: ActivityEvidence = current
    ? {
        inspectedPaths: [...current.inspectedPaths],
        mutatedPaths: [...current.mutatedPaths],
        exemplarPaths: [...current.exemplarPaths],
        verificationCount: current.verificationCount,
        diffInspectionCount: current.diffInspectionCount,
        graphHealthCount: current.graphHealthCount,
        graphImpactCount: current.graphImpactCount,
        graphSourceVerificationCount: current.graphSourceVerificationCount,
        mutationSeen: current.mutationSeen,
        verificationAfterMutation: current.verificationAfterMutation,
        diffAfterMutation: current.diffAfterMutation,
      }
    : {
        inspectedPaths: [],
        mutatedPaths: [],
        exemplarPaths: [],
        verificationCount: 0,
        diffInspectionCount: 0,
        graphHealthCount: 0,
        graphImpactCount: 0,
        graphSourceVerificationCount: 0,
        mutationSeen: false,
        verificationAfterMutation: false,
        diffAfterMutation: false,
      };
  const explicitGraphSource = new Set(
    observations.filter((observation) => observation.kind === "graph-source")
      .map((observation) => observation.sequence),
  );
  let graphHealthSeen = state.graphHealthCount > 0;
  let graphImpactSeen = state.graphImpactCount > 0;
  for (const observation of [...observations].sort((a, b) => a.sequence - b.sequence)) {
    if (observation.kind === "inspect") {
      state.inspectedPaths.push(observation.path);
      if (graphImpactSeen && !explicitGraphSource.has(observation.sequence)) {
        state.graphSourceVerificationCount++;
      }
    }
    if (observation.kind === "mutate") state.mutatedPaths.push(observation.path);
    if (observation.kind === "mutate" || observation.kind === "mutation-attempt") {
      state.mutationSeen = true;
      state.verificationAfterMutation = false;
      state.diffAfterMutation = false;
    }
    if (observation.kind === "verify") {
      state.verificationCount++;
      if (state.mutationSeen) state.verificationAfterMutation = true;
    }
    if (observation.kind === "diff") {
      state.diffInspectionCount++;
      if (state.mutationSeen) state.diffAfterMutation = true;
    }
    if (observation.kind === "graph-health") {
      state.graphHealthCount++;
      graphHealthSeen = true;
    }
    if (observation.kind === "graph-impact" && graphHealthSeen) {
      state.graphImpactCount++;
      graphImpactSeen = true;
    }
    if (observation.kind === "graph-source" && graphImpactSeen) {
      state.graphSourceVerificationCount++;
    }
  }
  state.inspectedPaths = unique(state.inspectedPaths);
  state.mutatedPaths = unique(state.mutatedPaths);
  const mutated = new Set(state.mutatedPaths);
  state.exemplarPaths = state.inspectedPaths.filter((path) => !mutated.has(path) &&
    !/(?:^|\/)(?:tests?|__tests__)(?:\/|$)|(?:\.test|\.spec)\.[^.]+$/i.test(path));
  return state;
}

export function hasGraphEditReceipt(evidence: ActivityEvidence): boolean {
  return evidence.graphHealthCount > 0 && evidence.graphImpactCount > 0 &&
    evidence.graphSourceVerificationCount > 0;
}

export function classifyObservedScope(evidence: ActivityEvidence): ScopeClassification {
  const reasons: string[] = [];
  if (evidence.mutatedPaths.length > 0) {
    if (evidence.mutatedPaths.length > 1) reasons.push("multiple-maintained-files");
    if (evidence.exemplarPaths.length > 0) reasons.push("exemplar-adaptation");
    if (evidence.mutatedPaths.some((path) =>
      HIGH_CONSEQUENCE_PARTS.some((part) => path.toLowerCase().includes(part)))) {
      reasons.push("high-consequence-path");
    }
    return reasons.length > 0 ? { mode: "implementation", reasons } : { mode: "none", reasons: [] };
  }
  if (evidence.inspectedPaths.length === 0) return { mode: "none", reasons: [] };
  if (evidence.diffInspectionCount > 0) reasons.push("observed-review");
  if (evidence.verificationCount > 0) reasons.push("observed-verification");
  return reasons.length > 0
    ? { mode: "review-verification", reasons }
    : { mode: "none", reasons: [] };
}
