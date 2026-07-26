import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export type CorpusIssue = { code: string; path: string; message: string };
export type CorpusEntry = { slug: string; summary: string; tags: string[]; origin: string; deposited: string; files: string[] };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

  if (!SLUG_PATTERN.test(slug)) issues.push(issue("slug_invalid", "/slug", "slug must be kebab-case"));
  else if (slug !== dirName) issues.push(issue("slug_mismatch", "/slug", `slug ${slug} does not match directory ${dirName}`));
  if (!summary.trim()) issues.push(issue("summary_invalid", "/summary", "summary must be a non-empty string"));
  if (!origin.trim()) issues.push(issue("origin_invalid", "/origin", "origin must be a non-empty string"));
  if (!DATE_PATTERN.test(deposited)) issues.push(issue("deposited_invalid", "/deposited", "deposited must be YYYY-MM-DD"));
  if (!strings(input.tags)) issues.push(issue("tags_invalid", "/tags", "tags must be a string array"));
  if (!strings(input.files)) issues.push(issue("files_invalid", "/files", "files must be a string array"));
  else if (!files.length) issues.push(issue("files_empty", "/files", "entry must keep at least one file"));
  files.forEach((file, index) => {
    if (path.isAbsolute(file) || path.normalize(file).split(path.sep)[0] === "..") {
      issues.push(issue("file_escapes_entry", `/files/${index}`, `file must stay inside the entry directory: ${file}`));
    }
  });

  if (issues.length) return { ok: false, issues };
  return { ok: true, entry: { slug, summary, tags, origin, deposited, files }, issues };
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

export function searchCorpus(entries: CorpusEntry[], term: string): CorpusEntry[] {
  const needle = term.toLowerCase();
  return entries.filter((entry) => entry.slug.toLowerCase().includes(needle)
    || entry.summary.toLowerCase().includes(needle)
    || entry.tags.some((tag) => tag.toLowerCase().includes(needle)));
}

function output(value: unknown, exitCode: number): never { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); process.exit(exitCode); }
function usage(message = "usage: corpus <validate|list|search> <corpus-dir> [term]"): never { return output({ ok: false, error: { code: "usage_error", message } }, 2); }
function scan(corpusDir: string) {
  try { return scanCorpus(corpusDir); }
  catch (error) { return output({ ok: false, error: { code: "corpus_read_error", message: String(error) } }, 2); }
}
function main(args: string[]): never {
  const [command, target, ...rest] = args;
  if (command === "validate" && target && rest.length === 0) { const result = scan(target); return output({ ok: result.ok, count: result.entries.length, issues: result.issues }, result.ok ? 0 : 1); }
  if (command === "list" && target && rest.length === 0) { const result = scan(target); return output({ ok: result.ok, entries: result.entries, issues: result.issues }, result.ok ? 0 : 1); }
  if (command === "search" && target && rest.length === 1) { const result = scan(target); return output({ ok: result.ok, term: rest[0], entries: searchCorpus(result.entries, rest[0]), issues: result.issues }, result.ok ? 0 : 1); }
  return usage();
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) main(process.argv.slice(2));
