/**
 * Research-Enforcement Extension — pure policy module.
 *
 * Dependency-free. No Pi runtime, no network access, and no tool activation.
 * Every function is deterministic and unit-testable without loading index.ts.
 *
 * This module NEVER enables, activates, or invokes any tool — including the
 * opt-in `xai_grok_web_search` paid tool. It only classifies text, normalizes
 * observed evidence, validates citation structure, and shapes metadata. Any
 * provider category (xai-web-search included) is credited only after an
 * explicit successful result or a successful Fabric trace V1 ref is observed;
 * availability, loading, or activation alone never counts.
 */

// ============================================================
// Public types
// ============================================================

export type ResearchTier = "none" | "standard" | "high";

export type ProviderCategory =
  | "context7"
  | "exa"
  | "codex-search"
  | "xai-web-search"
  | "scout";

export type CorrectionStatus =
  | "eligible"
  | "attempted"
  | "dispatched"
  | "skipped-pending-input"
  | "skipped-busy"
  | "dispatch-failed";

export type TurnPhase = "collecting" | "awaiting-settled" | "correcting" | "settled";

export interface TurnClassification {
  tier: ResearchTier;
  optedOut: boolean;
}

export interface ProviderRecord {
  category: ProviderCategory;
  label: string;
  directToolNames: string[];
  fabricRefs: string[];
  authoritative: boolean;
  independentForHigh: boolean;
}

export interface ResearchEnforcementConfig {
  version: number;
  enabled: boolean;
  providers: ProviderRecord[];
  authoritativeSourceIdentifiers: string[];
  standardCategoryCount: number;
  highCategoryCount: number;
  maxCorrections: number;
}

export interface DirectToolObservation {
  toolName: string;
  input: Record<string, unknown>;
  isError: boolean;
  content: Array<{ type: string; text?: string }>;
}

export interface CitationState {
  standardValid: boolean;
  highValid: boolean;
  referencedSourceCount: number;
  missingCodes: string[];
}

export interface ComplianceResult {
  compliant: boolean;
  categoryCount: number;
  independentCategoryCount: number;
}

export interface TurnSnapshot {
  turnOrdinal: number;
  tier: ResearchTier;
  optedOut: boolean;
  phase: TurnPhase;
  providerCategories: ProviderCategory[];
  citation: CitationState;
  correction: CorrectionStatus;
  guidanceInjected: boolean;
  finalSeen: boolean;
}

export interface AggregateMetrics {
  totalTurns: number;
  researchTurns: number;
  standardCompliant: number;
  highCompliant: number;
  correctionsDispatched: number;
  correctionsSkipped: number;
}

// ============================================================
// Canonical configuration (trusted V1 default)
// ============================================================

const CANONICAL_CATEGORIES: ProviderCategory[] = [
  "context7",
  "exa",
  "codex-search",
  "xai-web-search",
  "scout",
];

const CONFIG_VERSION = 1;
const STANDARD_CATEGORY_COUNT = 1;
const HIGH_CATEGORY_COUNT = 2;
const MAX_CORRECTIONS = 1;
const LABEL_MAX = 64;
const REF_MAX = 128;
const IDENT_MAX = 128;
const MAX_IDENTIFIERS = 64;
const EXPECTED_PROVIDER_COUNT = 5;
const MAX_TOOLS_PER_PROVIDER = 16;
const MAX_REFS_PER_PROVIDER = 16;

function buildCanonicalConfig(): ResearchEnforcementConfig {
  return {
    version: CONFIG_VERSION,
    enabled: true,
    providers: [
      {
        category: "context7",
        label: "Context7",
        directToolNames: ["context7.query-docs"],
        fabricRefs: ["mcp.context7.query-docs"],
        authoritative: true,
        independentForHigh: true,
      },
      {
        category: "exa",
        label: "Exa",
        directToolNames: ["exa.web_search_exa", "exa.web_fetch_exa"],
        fabricRefs: ["mcp.exa.web_search_exa", "mcp.exa.web_fetch_exa"],
        authoritative: true,
        independentForHigh: true,
      },
      {
        category: "codex-search",
        label: "Codex Search",
        directToolNames: ["codex_search"],
        fabricRefs: ["extensions.codex_search"],
        authoritative: true,
        independentForHigh: true,
      },
      {
        category: "xai-web-search",
        label: "xAI Web Search",
        directToolNames: ["xai_grok_web_search"],
        fabricRefs: ["extensions.xai_grok_web_search"],
        authoritative: true,
        independentForHigh: true,
      },
      {
        category: "scout",
        label: "Scout",
        directToolNames: ["Agent"],
        fabricRefs: [],
        authoritative: true,
        independentForHigh: false,
      },
    ],
    authoritativeSourceIdentifiers: [],
    standardCategoryCount: STANDARD_CATEGORY_COUNT,
    highCategoryCount: HIGH_CATEGORY_COUNT,
    maxCorrections: MAX_CORRECTIONS,
  };
}

export function defaultConfig(): ResearchEnforcementConfig {
  return buildCanonicalConfig();
}

// ============================================================
// Strict configuration parsing (all-or-nothing V1)
// ============================================================

const TOP_LEVEL_KEYS = new Set([
  "version",
  "enabled",
  "providers",
  "authoritativeSourceIdentifiers",
  "standardCategoryCount",
  "highCategoryCount",
  "maxCorrections",
]);

const PROVIDER_KEYS = new Set([
  "category",
  "label",
  "directToolNames",
  "fabricRefs",
  "authoritative",
  "independentForHigh",
]);

function isNonEmptyBoundedString(value: unknown, max: number): boolean {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function boundedStringArray(
  value: unknown,
  maxItems: number,
  perItemMax: number,
  rejectWildcard: boolean,
): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > maxItems) return null;
  const out: string[] = [];
  for (const item of value) {
    if (!isNonEmptyBoundedString(item, perItemMax)) return null;
    const str = item as string;
    if (rejectWildcard && str.includes("*")) return null;
    out.push(str);
  }
  return out;
}

function validateProviderRecord(value: unknown): ProviderRecord | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!PROVIDER_KEYS.has(key)) return null;
  }
  for (const key of PROVIDER_KEYS) {
    if (!(key in obj)) return null;
  }
  const category = obj.category;
  if (typeof category !== "string") return null;
  if (!(CANONICAL_CATEGORIES as string[]).includes(category)) return null;
  if (!isNonEmptyBoundedString(obj.label, LABEL_MAX)) return null;
  const directToolNames = boundedStringArray(
    obj.directToolNames,
    MAX_TOOLS_PER_PROVIDER,
    REF_MAX,
    true,
  );
  if (directToolNames === null) return null;
  const fabricRefs = boundedStringArray(
    obj.fabricRefs,
    MAX_REFS_PER_PROVIDER,
    REF_MAX,
    true,
  );
  if (fabricRefs === null) return null;
  if (typeof obj.authoritative !== "boolean") return null;
  if (typeof obj.independentForHigh !== "boolean") return null;
  return {
    category: category as ProviderCategory,
    label: obj.label as string,
    directToolNames,
    fabricRefs,
    authoritative: obj.authoritative,
    independentForHigh: obj.independentForHigh,
  };
}

function validateConfigShape(input: unknown): ResearchEnforcementConfig | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!TOP_LEVEL_KEYS.has(key)) return null;
  }
  for (const key of TOP_LEVEL_KEYS) {
    if (!(key in obj)) return null;
  }
  if (obj.version !== CONFIG_VERSION) return null;
  if (typeof obj.enabled !== "boolean") return null;
  if (obj.standardCategoryCount !== STANDARD_CATEGORY_COUNT) return null;
  if (obj.highCategoryCount !== HIGH_CATEGORY_COUNT) return null;
  if (obj.maxCorrections !== MAX_CORRECTIONS) return null;
  if (!Array.isArray(obj.providers)) return null;
  if (obj.providers.length !== EXPECTED_PROVIDER_COUNT) return null;
  const seenCategories = new Set<string>();
  const builtProviders: ProviderRecord[] = [];
  for (const provider of obj.providers) {
    const record = validateProviderRecord(provider);
    if (record === null) return null;
    if (seenCategories.has(record.category)) return null;
    seenCategories.add(record.category);
    builtProviders.push(record);
  }
  for (const category of CANONICAL_CATEGORIES) {
    if (!seenCategories.has(category)) return null;
  }
  if (!Array.isArray(obj.authoritativeSourceIdentifiers)) return null;
  if (obj.authoritativeSourceIdentifiers.length > MAX_IDENTIFIERS) return null;
  const identifiers: string[] = [];
  for (const identifier of obj.authoritativeSourceIdentifiers) {
    if (!isNonEmptyBoundedString(identifier, IDENT_MAX)) return null;
    if ((identifier as string).includes("*")) return null;
    identifiers.push(identifier as string);
  }
  return {
    version: CONFIG_VERSION,
    enabled: obj.enabled,
    providers: builtProviders,
    authoritativeSourceIdentifiers: identifiers,
    standardCategoryCount: STANDARD_CATEGORY_COUNT,
    highCategoryCount: HIGH_CATEGORY_COUNT,
    maxCorrections: MAX_CORRECTIONS,
  };
}

/**
 * Parse and validate a research-enforcement configuration object.
 *
 * Validation is strict and all-or-nothing: any unknown key, duplicate category,
 * wildcard ref, invalid boolean, oversized string, unsupported version, or
 * missing canonical provider causes a complete fall back to the trusted
 * built-in default. A weakened configuration is never partially applied.
 */
export function parseConfig(input: unknown): ResearchEnforcementConfig {
  const validated = validateConfigShape(input);
  if (validated === null) {
    return buildCanonicalConfig();
  }
  return validated;
}

// ============================================================
// Turn classification (deterministic, opt-out precedence)
// ============================================================

const OPT_OUT_PHRASES = [
  "do not search",
  "don't search",
  "do not browse",
  "don't browse",
  "do not research",
  "don't research",
  "no search",
  "no browsing",
  "no web search",
  "no research",
  "do not use the web",
  "without searching",
  "without browsing",
];

const HIGH_KEYWORDS = [
  // legal
  "legal", "lawsuit", "liability", "gdpr", "hipaa", "regulatory", "regulation",
  "statute", "litigation",
  // medical
  "medical", "medication", "medicine", "drug", "drugs", "dosage", "prescription",
  "pregnancy", "pregnant", "health", "disease", "diagnosis", "treatment", "doctor",
  // financial
  "tax", "taxes", "taxation", "investment", "investments", "investing",
  "financial", "finance", "portfolio", "mortgage", "retirement",
  // security
  "security", "vulnerability", "vulnerabilities", "cve", "exploit", "exploits",
  "malware", "ransomware", "phishing", "breach",
];

const STANDARD_KEYWORDS = [
  "search", "searches", "searching", "research", "researching", "investigate",
  "current", "latest", "newest", "recent",
  "version", "versions", "release", "releases", "changelog",
  "documentation", "docs", "api", "library", "libraries", "framework",
  "frameworks", "package", "packages", "npm", "pypi",
  "verify", "compare", "external", "web", "browse", "browsing", "online", "news",
];

const LOCAL_ACTION_KEYWORDS = [
  "add", "convert", "debug", "edit", "fix", "format", "implement", "refactor",
  "remove", "rename", "test", "update", "write",
];

const LOCAL_ARTIFACT_KEYWORDS = [
  "check", "class", "code", "component", "endpoint", "file", "function", "json",
  "method", "module", "test", "yaml",
];

const EXTERNAL_RESEARCH_KEYWORDS = [
  "browse", "current", "documentation", "docs", "external", "latest", "library",
  "news", "online", "package", "recent", "release", "research", "search", "verify",
  "version", "web",
];

const SENSITIVE_MECHANICAL_VERBS = [
  "summarize", "summarise", "translate", "analyze", "analyse", "paraphrase",
  "rewrite", "review", "extract", "outline", "condense", "simplify", "proofread",
  "redact", "anonymize", "rephrase",
];

const SUPPLIED_CONTENT_PHRASES = [
  "this note", "this paragraph", "this report", "this statement", "this document",
  "this text", "this content", "this file", "this excerpt", "this message",
  "this medical", "this legal", "this financial", "this security",
  "provided", "pasted", "below", "attached", "following", "supplied",
];

const EXPLICIT_RESEARCH_PHRASES = [
  "search", "research", "browse", "investigate", "verify", "look up", "compare with",
  "consult", "online", "on the web", "web search",
];

function containsPhrase(lowerText: string, phrases: string[]): boolean {
  for (const phrase of phrases) {
    if (lowerText.includes(phrase)) return true;
  }
  return false;
}

function containsWord(lowerText: string, words: string[]): boolean {
  for (const word of words) {
    if (new RegExp(`\\b${word}\\b`).test(lowerText)) return true;
  }
  return false;
}

/**
 * Classify a turn prompt into a research tier.
 *
 * Precedence is explicit opt-out (→ `none`), then local/mechanical work (→
 * `none`), then sensitive mechanical transformations of user-provided text (→
 * `none` unless explicit external/current research intent is present), then
 * high-consequence external claims (→ `high`), then explicit
 * research/current/external requests (→ `standard`).
 */
export function classifyTurn(prompt: string): TurnClassification {
  const text = typeof prompt === "string" ? prompt : "";
  const lowerText = text.toLowerCase();
  if (containsPhrase(lowerText, OPT_OUT_PHRASES)) {
    return { tier: "none", optedOut: true };
  }
  const isLocalMechanical =
    containsWord(lowerText, LOCAL_ACTION_KEYWORDS) &&
    containsWord(lowerText, LOCAL_ARTIFACT_KEYWORDS) &&
    !containsWord(lowerText, EXTERNAL_RESEARCH_KEYWORDS);
  if (isLocalMechanical) {
    return { tier: "none", optedOut: false };
  }
  // Mechanical transformations of user-provided sensitive text (summarize a
  // medical note, translate a legal paragraph, analyze supplied financial or
  // security text) do not seek external or current research. They classify as
  // none unless an explicit external/current research keyword is also present.
  const hasSensitiveMechanicalIntent =
    containsWord(lowerText, SENSITIVE_MECHANICAL_VERBS) &&
    containsWord(lowerText, HIGH_KEYWORDS);
  const referencesSuppliedContent = containsPhrase(lowerText, SUPPLIED_CONTENT_PHRASES);
  const requestsExternalResearch = containsPhrase(lowerText, EXPLICIT_RESEARCH_PHRASES);
  const isSensitiveMechanical =
    hasSensitiveMechanicalIntent &&
    !requestsExternalResearch &&
    (referencesSuppliedContent || !containsWord(lowerText, EXTERNAL_RESEARCH_KEYWORDS));
  if (isSensitiveMechanical) {
    return { tier: "none", optedOut: false };
  }
  if (containsWord(lowerText, HIGH_KEYWORDS)) {
    return { tier: "high", optedOut: false };
  }
  if (containsWord(lowerText, STANDARD_KEYWORDS)) {
    return { tier: "standard", optedOut: false };
  }
  return { tier: "none", optedOut: false };
}

// ============================================================
// Direct tool evidence
// ============================================================

/**
 * Map an observed direct tool call to a provider category.
 *
 * Matching is exact against configured `directToolNames`. The generic `Agent`
 * tool counts as `scout` only when `input.subagent_type === "scout"`; other
 * subagent types and an absent subtype never match. `context7.resolve-library-id`
 * is routing/setup activity and does not match any evidence category.
 */
export function categorizeDirectTool(
  config: ResearchEnforcementConfig,
  observation: DirectToolObservation,
): ProviderCategory | null {
  const toolName = observation?.toolName;
  if (typeof toolName !== "string" || toolName.length === 0) return null;
  const input = observation?.input;
  for (const provider of config.providers) {
    if (!Array.isArray(provider.directToolNames)) continue;
    if (!provider.directToolNames.includes(toolName)) continue;
    if (toolName === "Agent") {
      if (
        input &&
        typeof input === "object" &&
        (input as Record<string, unknown>).subagent_type === "scout"
      ) {
        return provider.category;
      }
      continue;
    }
    return provider.category;
  }
  return null;
}

/**
 * A direct tool result satisfies evidence only when it is not an error and its
 * content array is structurally non-empty. The actual content text is never
 * retained or inspected by this check.
 */
export function isSuccessfulDirectResult(observation: DirectToolObservation): boolean {
  if (!observation || observation.isError === true) return false;
  const content = observation.content;
  if (!Array.isArray(content) || content.length === 0) return false;
  return content.some((item) => {
    if (!item || typeof item !== "object") return false;
    if (item.type === "text") return typeof item.text === "string" && item.text.trim().length > 0;
    return typeof item.type === "string" && item.type.length > 0;
  });
}

// ============================================================
// Fabric trace V1 evidence
// ============================================================

function isFabricTraceV1Envelope(details: unknown): boolean {
  if (!details || typeof details !== "object") return false;
  const envelope = details as Record<string, unknown>;
  if (envelope.success !== true) return false;
  const trace = envelope.trace;
  if (!trace || typeof trace !== "object") return false;
  const t = trace as Record<string, unknown>;
  if (t.kind !== "pi-fabric.execution") return false;
  if (t.version !== 1) return false;
  if (t.outcome !== "succeeded") return false;
  if (!Array.isArray(t.operations)) return false;
  return true;
}

function matchFabricRef(
  config: ResearchEnforcementConfig,
  ref: string,
): ProviderCategory | null {
  for (const provider of config.providers) {
    if (Array.isArray(provider.fabricRefs) && provider.fabricRefs.includes(ref)) {
      return provider.category;
    }
  }
  return null;
}

/**
 * Extract provider categories from a persisted Fabric execution `details`
 * envelope. Only a strict Trace V1 record (`success === true`,
 * `kind === "pi-fabric.execution"`, `version === 1`, trace `outcome ===
 * "succeeded"`, structurally valid operations) contributes, and only exact
 * operations whose own `outcome === "succeeded"` and whose `ref` matches a
 * configured `fabricRefs` entry exactly. Operation arguments, results, and
 * error prose are never inspected. The ambiguous nested `extensions.Agent`
 * ref has no matching category and never counts.
 */
export function extractFabricCategories(
  config: ResearchEnforcementConfig,
  details: unknown,
): ProviderCategory[] {
  if (!isFabricTraceV1Envelope(details)) return [];
  const trace = (details as {
    trace: { operations: Array<Record<string, unknown>> };
  }).trace;
  const categories: ProviderCategory[] = [];
  const seen = new Set<string>();
  for (const op of trace.operations) {
    if (!op || typeof op !== "object") continue;
    if (op.type !== "call") continue;
    if (!Number.isInteger(op.sequence) || (op.sequence as number) < 0) continue;
    if (!op.args || typeof op.args !== "object" || Array.isArray(op.args)) continue;
    if (op.outcome !== "succeeded") continue;
    const ref = op.ref;
    if (typeof ref !== "string") continue;
    const category = matchFabricRef(config, ref);
    if (category === null) continue;
    if (seen.has(category)) continue;
    seen.add(category);
    categories.push(category);
  }
  return categories;
}

// ============================================================
// Compliance evaluation
// ============================================================

/**
 * Evaluate evidence compliance for a tier.
 *
 * `none` requires no provider categories and is always compliant. `standard`
 * requires at least `standardCategoryCount` distinct authoritative provider
 * categories and a standard-valid citation. `high` requires at least
 * `highCategoryCount` distinct categories that are independent for high and a
 * high-valid citation. Duplicate categories deduplicate to one. Scout is
 * authoritative for standard but not independent for high.
 */
export function evaluateCompliance(
  config: ResearchEnforcementConfig,
  tier: ResearchTier,
  categories: ProviderCategory[],
  citation: CitationState,
): ComplianceResult {
  const authoritativeSet = new Set(
    config.providers.filter((p) => p.authoritative).map((p) => p.category),
  );
  const independentSet = new Set(
    config.providers.filter((p) => p.independentForHigh).map((p) => p.category),
  );
  const distinct = new Set(categories as string[]);
  let categoryCount = 0;
  let independentCategoryCount = 0;
  for (const category of distinct) {
    if (authoritativeSet.has(category)) categoryCount++;
    if (independentSet.has(category)) independentCategoryCount++;
  }
  let compliant = false;
  if (tier === "none") {
    compliant = true;
  } else if (tier === "standard") {
    compliant =
      categoryCount >= config.standardCategoryCount &&
      citation?.standardValid === true;
  } else if (tier === "high") {
    compliant =
      independentCategoryCount >= config.highCategoryCount &&
      citation?.highValid === true;
  }
  return { compliant, categoryCount, independentCategoryCount };
}

// ============================================================
// Citation validation (structural only — never semantic)
// ============================================================

const HTTPS_URL_RE = /https:\/\/[^\s)]+/g;
const DNS_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

function hasValidHostname(hostname: string): boolean {
  if (hostname.length === 0 || hostname.length > 253) return false;
  const labels = hostname.split(".");
  if (labels.length < 2) return false;
  return labels.every((label) =>
    label.length > 0 && label.length <= 63 && DNS_LABEL_RE.test(label));
}

function hasHttpsUrl(text: string): boolean {
  const candidates = text.match(HTTPS_URL_RE);
  if (!candidates) return false;
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" && hasValidHostname(url.hostname)) {
        return true;
      }
    } catch {
      // Not a usable HTTPS URL; try the next candidate.
    }
  }
  return false;
}

function hasAuthoritativeIdentifier(
  text: string,
  config: ResearchEnforcementConfig,
): boolean {
  for (const identifier of config.authoritativeSourceIdentifiers) {
    if (typeof identifier === "string" && identifier.length > 0 && text.includes(identifier)) {
      return true;
    }
  }
  return false;
}

function isStandardCitationValid(
  text: string,
  config: ResearchEnforcementConfig,
): boolean {
  return hasHttpsUrl(text) || hasAuthoritativeIdentifier(text, config);
}

function extractSourceMarkers(text: string): string[] {
  const re = /\[S(\d+)\]/g;
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    out.push("S" + match[1]);
  }
  return out;
}

function findSectionIndex(text: string, name: string): number {
  const re = new RegExp(`^##\\s+${name}\\b.*$`, "m");
  const match = re.exec(text);
  return match ? match.index : -1;
}

function computeHighCitation(
  text: string,
  config: ResearchEnforcementConfig,
): { highValid: boolean; referencedSourceCount: number; missingCodes: string[] } {
  const missingCodes: string[] = [];
  const findingsIndex = findSectionIndex(text, "Findings");
  const sourcesIndex = findSectionIndex(text, "Sources");
  if (findingsIndex === -1 || sourcesIndex === -1 || findingsIndex >= sourcesIndex) {
    return { highValid: false, referencedSourceCount: 0, missingCodes: ["missing-section"] };
  }
  const findingsText = text.slice(findingsIndex, sourcesIndex);
  const sourcesText = text.slice(sourcesIndex);

  const findingMarkers = new Set<string>();
  for (const rawLine of findingsText.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (!/^[-*]\s+\S/.test(line)) continue;
    const markers = extractSourceMarkers(line);
    if (markers.length === 0) {
      missingCodes.push("finding-without-marker");
      continue;
    }
    for (const marker of markers) findingMarkers.add(marker);
  }

  const sourceOrder: string[] = [];
  const sourceCitations = new Map<string, string>();
  for (const rawLine of sourcesText.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = /^\[(S\d+)\]\s*(.*)$/.exec(line);
    if (!match) continue;
    const id = match[1];
    const citation = match[2].trim();
    if (sourceCitations.has(id)) {
      missingCodes.push("duplicate-source-id");
      continue;
    }
    sourceCitations.set(id, citation);
    sourceOrder.push(id);
  }

  let resolvedCount = 0;
  for (const id of sourceOrder) {
    const citation = sourceCitations.get(id);
    if (!citation || !isStandardCitationValid(citation, config)) {
      missingCodes.push("marker-only-source");
      continue;
    }
    if (findingMarkers.has(id)) {
      resolvedCount++;
    } else {
      missingCodes.push("orphan-source-marker");
    }
  }

  for (const marker of findingMarkers) {
    if (!sourceCitations.has(marker)) {
      missingCodes.push("unresolved-marker");
    }
  }

  const highValid =
    missingCodes.length === 0 &&
    findingMarkers.size > 0 &&
    resolvedCount === findingMarkers.size;

  return { highValid, referencedSourceCount: resolvedCount, missingCodes };
}

/**
 * Validate the structural citation shape of an answer.
 *
 * Standard accepts a bare or Markdown HTTPS URL (parsed with the URL
 * constructor and requiring a valid non-empty hostname) or an exact configured
 * authoritative source identifier. High requires `## Findings` and `## Sources`
 * sections where every finding bullet carries at least one `[S<n>]` marker and
 * every referenced marker resolves to exactly one numbered source entry that is
 * itself standard-valid. This is a structural compliance check only; it never
 * claims truth, verification, or entailment.
 */
export function validateCitation(
  text: string,
  config: ResearchEnforcementConfig,
): CitationState {
  const safeText = typeof text === "string" ? text : "";
  const standardValid = isStandardCitationValid(safeText, config);
  const high = computeHighCitation(safeText, config);
  return {
    standardValid,
    highValid: high.highValid,
    referencedSourceCount: high.referencedSourceCount,
    missingCodes: high.missingCodes,
  };
}

// ============================================================
// Metadata shaping (privacy: metadata only)
// ============================================================

function defaultCitationState(): CitationState {
  return {
    standardValid: false,
    highValid: false,
    referencedSourceCount: 0,
    missingCodes: [],
  };
}

/**
 * Shape a per-turn snapshot, retaining only approved enum, boolean, count, and
 * category data. Raw prompts, answers, URLs, queries, tool arguments/results,
 * and credentials are never carried through.
 */
export function shapeSnapshot(snapshot: TurnSnapshot): TurnSnapshot {
  const source = snapshot ?? ({} as TurnSnapshot);
  const citation = source.citation ?? defaultCitationState();
  return {
    turnOrdinal: typeof source.turnOrdinal === "number" ? source.turnOrdinal : 0,
    tier: source.tier ?? "none",
    optedOut: source.optedOut === true,
    phase: source.phase ?? "collecting",
    providerCategories: Array.isArray(source.providerCategories)
      ? [...source.providerCategories]
      : [],
    citation: {
      standardValid: citation.standardValid === true,
      highValid: citation.highValid === true,
      referencedSourceCount:
        typeof citation.referencedSourceCount === "number"
          ? citation.referencedSourceCount
          : 0,
      missingCodes: Array.isArray(citation.missingCodes)
        ? [...citation.missingCodes]
        : [],
    },
    correction: source.correction ?? "eligible",
    guidanceInjected: source.guidanceInjected === true,
    finalSeen: source.finalSeen === true,
  };
}

/**
 * Shape aggregate metrics, retaining only versioned integer counters. No raw
 * research content is ever carried through.
 */
export function shapeMetrics(metrics: AggregateMetrics): AggregateMetrics {
  const source = metrics ?? ({} as AggregateMetrics);
  return {
    totalTurns: typeof source.totalTurns === "number" ? source.totalTurns : 0,
    researchTurns: typeof source.researchTurns === "number" ? source.researchTurns : 0,
    standardCompliant:
      typeof source.standardCompliant === "number" ? source.standardCompliant : 0,
    highCompliant: typeof source.highCompliant === "number" ? source.highCompliant : 0,
    correctionsDispatched:
      typeof source.correctionsDispatched === "number"
        ? source.correctionsDispatched
        : 0,
    correctionsSkipped:
      typeof source.correctionsSkipped === "number" ? source.correctionsSkipped : 0,
  };
}