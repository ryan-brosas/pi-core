import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type CorpusIssue = { code: string; path: string; message: string };
export type CorpusEntry = { slug: string; summary: string; tags: string[]; origin: string; deposited: string; files: string[]; validated?: string };
export type SearchResult = { entries: CorpusEntry[]; total: number; limit: number };
export type StaleReport = { slug: string; deposited: string; ageDays: number; stale: boolean };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Parse an exact YYYY-MM-DD calendar date into UTC milliseconds, or null if the
// date is impossible. Uses the ISO date-time string form ("YYYY-MM-DDT00:00:00Z"),
// which Date.parse interprets as UTC without the Date.UTC year 0-99 -> 1900-1999
// remapping, then rejects silently-normalized dates via an exact UTC round-trip.
function parseDepositedMs(date: string): number | null {
  if (!DATE_PATTERN.test(date)) return null;
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(ms)) return null;
  if (new Date(ms).toISOString().slice(0, 10) !== date) return null;
  return ms;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function issue(code: string, issuePath: string, message: string): CorpusIssue {
  return { code, path: issuePath, message };
}

export function validateEntry(input: unknown, dirName: string): { ok: boolean; entry?: CorpusEntry; issues: CorpusIssue[] } {
  if (!record(input)) return { ok: false, issues: [issue("root_invalid", "", "entry must be an object")] };
  const issues: CorpusIssue[] = [];
  const slug = typeof input.slug === "string" ? input.slug : "";
  const summary = typeof input.summary === "string" ? input.summary : "";
  const origin = typeof input.origin === "string" ? input.origin : "";
  const deposited = typeof input.deposited === "string" ? input.deposited : "";
  const tags = strings(input.tags) ? input.tags : [];
  const files = strings(input.files) ? input.files : [];
  const validated = input.validated;
  const validatedPresent = Object.prototype.hasOwnProperty.call(input, "validated");

  if (!SLUG_PATTERN.test(slug)) issues.push(issue("slug_invalid", "/slug", "slug must be kebab-case"));
  else if (slug !== dirName) issues.push(issue("slug_mismatch", "/slug", `slug ${slug} does not match directory ${dirName}`));
  if (!summary.trim()) issues.push(issue("summary_invalid", "/summary", "summary must be a non-empty string"));
  if (!origin.trim()) issues.push(issue("origin_invalid", "/origin", "origin must be a non-empty string"));
  if (parseDepositedMs(deposited) === null) issues.push(issue("deposited_invalid", "/deposited", "deposited must be YYYY-MM-DD"));
  if (!strings(input.tags)) issues.push(issue("tags_invalid", "/tags", "tags must be a string array"));
  if (!strings(input.files)) issues.push(issue("files_invalid", "/files", "files must be a string array"));
  else if (!files.length) issues.push(issue("files_empty", "/files", "entry must keep at least one file"));
  files.forEach((file, index) => {
    if (path.isAbsolute(file) || path.normalize(file).split(path.sep)[0] === "..") {
      issues.push(issue("file_escapes_entry", `/files/${index}`, `file must stay inside the entry directory: ${file}`));
    }
  });
  if (validatedPresent && (typeof validated !== "string" || validated.trim() === "")) {
    issues.push(issue("validated_invalid", "/validated", "validated must be a non-empty string when present"));
  }

  if (issues.length) return { ok: false, issues };
  return { ok: true, entry: { slug, summary, tags, origin, deposited, files, ...(typeof validated === "string" ? { validated } : {}) }, issues };
}

export function scanCorpus(corpusDir: string): { ok: boolean; entries: CorpusEntry[]; issues: CorpusIssue[] } {
  const issues: CorpusIssue[] = [];
  const entries: CorpusEntry[] = [];
  const dirNames = readdirSync(corpusDir, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort();
  for (const dirName of dirNames) {
    let parsed: unknown;
    try { parsed = JSON.parse(readFileSync(path.join(corpusDir, dirName, "entry.json"), "utf8")); }
    catch (error) { issues.push(issue("entry_unreadable", dirName, String(error))); continue; }
    const result = validateEntry(parsed, dirName);
    if (!result.entry) { issues.push(...result.issues.map((item) => issue(item.code, `${dirName}${item.path}`, item.message))); continue; }
    for (const file of result.entry.files) {
      if (!existsSync(path.join(corpusDir, dirName, file))) issues.push(issue("file_missing", `${dirName}/${file}`, "listed file does not exist"));
    }
    entries.push(result.entry);
  }
  return { ok: issues.length === 0, entries, issues };
}

function searchTier(entry: CorpusEntry, needle: string): number | undefined {
  const tags = entry.tags.map((tag) => tag.toLowerCase());
  if (tags.some((tag) => tag === needle)) return 0;
  if (entry.slug.toLowerCase().includes(needle)) return 1;
  if (entry.summary.toLowerCase().includes(needle)) return 2;
  if (tags.some((tag) => tag.includes(needle))) return 3;
  return undefined;
}

export function searchCorpus(entries: CorpusEntry[], term: string, limit = 3): SearchResult {
  const needle = term.toLowerCase();
  const ranked = entries.flatMap((entry) => {
    const tier = searchTier(entry, needle);
    return tier === undefined ? [] : [{ entry, tier }];
  });
  ranked.sort((left, right) => left.tier - right.tier
    || (left.entry.slug < right.entry.slug ? -1 : left.entry.slug > right.entry.slug ? 1 : 0));
  return { entries: ranked.slice(0, limit).map(({ entry }) => entry), total: ranked.length, limit };
}

const CANONICAL_NONNEG_INT = /^(?:0|[1-9][0-9]*)$/;
function parseMaxAgeDays(raw: string): number | null {
  if (!CANONICAL_NONNEG_INT.test(raw)) return null;
  if (BigInt(raw) > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(raw);
}

export function reportStaleness(entries: CorpusEntry[], maxAgeDays: number, now: Date): StaleReport[] {
  return entries.map((entry) => {
    const depositedMs = parseDepositedMs(entry.deposited);
    if (depositedMs === null) throw new RangeError(`invalid deposited date for ${entry.slug}: ${entry.deposited}`);
    const ageDays = Math.floor((now.getTime() - depositedMs) / 86_400_000);
    return { slug: entry.slug, deposited: entry.deposited, ageDays, stale: ageDays >= maxAgeDays };
  });
}

function output(value: unknown, exitCode: number): never { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); process.exit(exitCode); }
function usage(message = "usage: corpus <validate|list|search|stale> <corpus-dir> [term] [limit] [max-age-days]"): never { return output({ ok: false, error: { code: "usage_error", message } }, 2); }
function scan(corpusDir: string) {
  try { return scanCorpus(corpusDir); }
  catch (error) { return output({ ok: false, error: { code: "corpus_read_error", message: String(error) } }, 2); }
}
function main(args: string[]): never {
  const [command, target, ...rest] = args;
  if (command === "validate" && target && rest.length === 0) { const result = scan(target); return output({ ok: result.ok, count: result.entries.length, issues: result.issues }, result.ok ? 0 : 1); }
  if (command === "list" && target && rest.length === 0) { const result = scan(target); return output({ ok: result.ok, entries: result.entries, issues: result.issues }, result.ok ? 0 : 1); }
  if (command === "search" && target && (rest.length === 1 || rest.length === 2)) {
    const [term, limitArg] = rest;
    if (limitArg !== undefined && !/^[1-9]\d*$/.test(limitArg)) return usage();
    const limit = limitArg === undefined ? 3 : Number(limitArg);
    if (!Number.isSafeInteger(limit)) return usage();
    const result = scan(target);
    const search = searchCorpus(result.entries, term, limit);
    return output({ ok: result.ok, term, limit: search.limit, total: search.total, entries: search.entries, issues: result.issues }, result.ok ? 0 : 1);
  }
  if (command === "stale" && target && rest.length === 1) {
    const maxAgeDays = parseMaxAgeDays(rest[0]);
    if (maxAgeDays === null) return usage();
    const result = scan(target);
    const reports = reportStaleness(result.entries, maxAgeDays, new Date());
    const ok = result.ok && !reports.some((report) => report.stale);
    return output({ ok, maxAgeDays, entries: reports, issues: result.issues }, ok ? 0 : 1);
  }
  return usage();
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) main(process.argv.slice(2));
