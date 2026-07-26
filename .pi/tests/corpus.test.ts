import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const MODULE_PATH = path.join(ROOT, ".pi/scripts/corpus.ts");
const NODE_ARGS = ["--experimental-strip-types", MODULE_PATH];

type EntrySpec = { entry?: unknown; files?: Record<string, string> };
async function api() { return import(pathToFileURL(MODULE_PATH).href); }
function entry(slug: string, overrides: Record<string, unknown> = {}) { return { version: 1, slug, summary: slug + " summary", tags: ["ts"], origin: "fixture", deposited: "2026-07-26", files: ["main.ts"], ...overrides }; }
function writeCorpus(specs: Record<string, EntrySpec>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "corpus-"));
  for (const [name, spec] of Object.entries(specs)) {
    const entryDir = path.join(dir, name);
    mkdirSync(entryDir, { recursive: true });
    if (spec.entry !== undefined) writeFileSync(path.join(entryDir, "entry.json"), typeof spec.entry === "string" ? spec.entry : JSON.stringify(spec.entry, null, 2));
    for (const [file, content] of Object.entries(spec.files ?? { "main.ts": "export const value = 1;\n" })) writeFileSync(path.join(entryDir, file), content);
  }
  return dir;
}
function cli(args: string[]) { return spawnSync(process.execPath, [...NODE_ARGS, ...args], { cwd: ROOT, encoding: "utf8" }); }

test("exports the pure corpus API", async () => { const module = await api(); assert.equal(typeof module.validateEntry, "function"); assert.equal(typeof module.scanCorpus, "function"); assert.equal(typeof module.searchCorpus, "function"); });

test("accepts a well-formed entry and returns the normalized record", async () => {
  const { validateEntry } = await api();
  const result = validateEntry(entry("good-thing"), "good-thing");
  assert.deepEqual(result, { ok: true, entry: { slug: "good-thing", summary: "good-thing summary", tags: ["ts"], origin: "fixture", deposited: "2026-07-26", files: ["main.ts"] }, issues: [] });
});

test("reports deterministic field invariant issues", async () => {
  const { validateEntry } = await api();
  const fixtures = [
    [entry("Bad_Slug"), "slug_invalid", "/slug"],
    [entry("a", { summary: "   " }), "summary_invalid", "/summary"],
    [entry("a", { origin: "" }), "origin_invalid", "/origin"],
    [entry("a", { deposited: "26-07-2026" }), "deposited_invalid", "/deposited"],
    [entry("a", { tags: "ts" }), "tags_invalid", "/tags"],
    [entry("a", { files: 3 }), "files_invalid", "/files"],
    [entry("a", { files: [] }), "files_empty", "/files"],
  ] as const;
  for (const [input, code, issuePath] of fixtures) {
    const result = validateEntry(input, (input as { slug: string }).slug);
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((item: { code: string; path: string }) => item.code === code && item.path === issuePath), "expected " + code + " at " + issuePath);
  }
  assert.deepEqual(validateEntry("nope", "a"), { ok: false, issues: [{ code: "root_invalid", path: "", message: "entry must be an object" }] });
});

test("requires the slug to match its directory name", async () => {
  const { validateEntry } = await api();
  const result = validateEntry(entry("declared"), "actual");
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((item: { code: string }) => item.code === "slug_mismatch"));
});

test("rejects files that escape the entry directory", async () => {
  const { validateEntry } = await api();
  for (const file of ["../outside.ts", "/etc/passwd", "../../a/b.ts"]) {
    const result = validateEntry(entry("a", { files: [file] }), "a");
    assert.equal(result.ok, false, "expected rejection for " + file);
    assert.ok(result.issues.some((item: { code: string; path: string }) => item.code === "file_escapes_entry" && item.path === "/files/0"));
  }
  assert.equal(validateEntry(entry("a", { files: ["nested/main.ts"] }), "a").ok, true);
});

test("scans a corpus directory into sorted entries", async () => {
  const { scanCorpus } = await api();
  const dir = writeCorpus({ "b-thing": { entry: entry("b-thing") }, "a-thing": { entry: entry("a-thing") } });
  const result = scanCorpus(dir);
  assert.equal(result.ok, true);
  assert.deepEqual(result.entries.map((item: { slug: string }) => item.slug), ["a-thing", "b-thing"]);
  assert.deepEqual(scanCorpus(mkdtempSync(path.join(tmpdir(), "corpus-empty-"))), { ok: true, entries: [], issues: [] });
});

test("reports listed files that are missing from disk", async () => {
  const { scanCorpus } = await api();
  const dir = writeCorpus({ "a-thing": { entry: entry("a-thing", { files: ["main.ts", "gone.ts"] }) } });
  const result = scanCorpus(dir);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((item: { code: string; path: string }) => item.code === "file_missing" && item.path === "a-thing/gone.ts"));
});

test("reports unreadable or invalid entry files with directory-scoped paths", async () => {
  const { scanCorpus } = await api();
  const dir = writeCorpus({ "broken-json": { entry: "{ not json" }, "no-entry": {}, "bad-field": { entry: entry("bad-field", { origin: "" }) } });
  const result = scanCorpus(dir);
  assert.equal(result.ok, false);
  const codes = result.issues.map((item: { code: string }) => item.code);
  assert.ok(codes.filter((code: string) => code === "entry_unreadable").length === 2);
  assert.ok(result.issues.some((item: { code: string; path: string }) => item.code === "origin_invalid" && item.path === "bad-field/origin"));
  assert.equal(result.entries.length, 0);
});

test("searches slug, summary, and tags case-insensitively", async () => {
  const { searchCorpus } = await api();
  const entries = [
    { slug: "auth-flow", summary: "session handling", tags: ["security"], origin: "x", deposited: "2026-07-26", files: ["a.ts"] },
    { slug: "grid-layout", summary: "responsive BENTO grid", tags: ["css"], origin: "x", deposited: "2026-07-26", files: ["a.ts"] },
  ];
  assert.deepEqual(searchCorpus(entries, "AUTH").map((item) => item.slug), ["auth-flow"]);
  assert.deepEqual(searchCorpus(entries, "bento").map((item) => item.slug), ["grid-layout"]);
  assert.deepEqual(searchCorpus(entries, "security").map((item) => item.slug), ["auth-flow"]);
  assert.deepEqual(searchCorpus(entries, "zzz"), []);
});

test("cli reports validate, list, and search results with meaningful exit codes", () => {
  const dir = writeCorpus({ "a-thing": { entry: entry("a-thing") } });
  const validate = cli(["validate", dir]);
  assert.equal(validate.status, 0);
  assert.deepEqual(JSON.parse(validate.stdout), { ok: true, count: 1, issues: [] });
  assert.deepEqual(JSON.parse(cli(["list", dir]).stdout).entries.map((item: { slug: string }) => item.slug), ["a-thing"]);
  assert.deepEqual(JSON.parse(cli(["search", dir, "a-thing"]).stdout).entries.map((item: { slug: string }) => item.slug), ["a-thing"]);
  assert.deepEqual(JSON.parse(cli(["search", dir, "zzz"]).stdout).entries, []);
});

test("cli fails closed on invalid corpora, unknown commands, and unreadable directories", () => {
  const broken = writeCorpus({ "a-thing": { entry: entry("a-thing", { files: ["main.ts", "gone.ts"] }) } });
  assert.equal(cli(["validate", broken]).status, 1);
  for (const args of [[], ["validate"], ["nope", broken], ["search", broken]]) assert.equal(cli(args).status, 2, "expected usage error for " + JSON.stringify(args));
  assert.equal(cli(["validate", path.join(tmpdir(), "corpus-does-not-exist-xyz")]).status, 2);
});

test("the repository corpus is valid", () => {
  const result = cli(["validate", path.join(ROOT, ".pi/corpus")]);
  assert.equal(result.status, 0, result.stdout);
  assert.ok(JSON.parse(result.stdout).count >= 1);
});
