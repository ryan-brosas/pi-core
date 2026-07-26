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
function searchEntry(slug: string, summary = slug + " summary", tags = ["ts"]) { return { slug, summary, tags, origin: "fixture", deposited: "2026-07-26", files: ["main.ts"] }; }
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

test("exports the staleness report API", async () => { const module = await api(); assert.equal(typeof module.reportStaleness, "function"); });

test("accepts a well-formed entry and returns the normalized record", async () => {
  const { validateEntry } = await api();
  const result = validateEntry(entry("good-thing"), "good-thing");
  assert.deepEqual(result, { ok: true, entry: { slug: "good-thing", summary: "good-thing summary", tags: ["ts"], origin: "fixture", deposited: "2026-07-26", files: ["main.ts"] }, issues: [] });
});

test("round-trips a non-empty validated provenance string through validateEntry", async () => {
  const { validateEntry } = await api();
  const result = validateEntry(entry("good-thing", { validated: "evidence: matched source at commit 1234567" }), "good-thing");
  assert.equal(result.ok, true);
  assert.deepEqual(result.entry, { slug: "good-thing", summary: "good-thing summary", tags: ["ts"], origin: "fixture", deposited: "2026-07-26", files: ["main.ts"], validated: "evidence: matched source at commit 1234567" });
});

test("absent validated field validates and omits the own property (no undefined JSON key)", async () => {
  const { validateEntry } = await api();
  const result = validateEntry(entry("good-thing"), "good-thing");
  assert.equal(result.ok, true);
  assert.ok(result.entry);
  assert.equal(Object.prototype.hasOwnProperty.call(result.entry, "validated"), false);
  assert.equal(("validated" in (result.entry as Record<string, unknown>)), false);
  assert.deepEqual(result.entry, { slug: "good-thing", summary: "good-thing summary", tags: ["ts"], origin: "fixture", deposited: "2026-07-26", files: ["main.ts"] });
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

test("validateEntry rejects impossible calendar dates as deposited_invalid and accepts leap day", async () => {
  const { validateEntry } = await api();
  const impossible: ReadonlyArray<readonly [string, string]> = [
    ["2026-02-31", "Feb 31"],
    ["2025-02-29", "non-leap Feb 29"],
    ["2026-04-31", "Apr 31"],
    ["2026-06-31", "Jun 31"],
    ["2026-13-01", "month 13"],
    ["2026-00-01", "month 00"],
    ["2026-06-00", "day 00"],
    ["2026-00-00", "month and day 00"],
  ];
  for (const [value, label] of impossible) {
    const result = validateEntry(entry("a", { deposited: value }), "a");
    assert.equal(result.ok, false, `expected rejection for impossible date ${label} ${JSON.stringify(value)}`);
    assert.equal(result.issues.length, 1, `expected exactly one issue for ${label}, got ${JSON.stringify(result.issues)}`);
    assert.deepEqual(result.issues[0], { code: "deposited_invalid", path: "/deposited", message: "deposited must be YYYY-MM-DD" });
  }
  const leap = validateEntry(entry("leap-day", { deposited: "2024-02-29" }), "leap-day");
  assert.equal(leap.ok, true, `expected 2024-02-29 (leap day) to be accepted; got ${JSON.stringify(leap.issues)}`);
});

test("rejects present-but-invalid validated values with validated_invalid at /validated", async () => {
  const { validateEntry } = await api();
  const invalid: ReadonlyArray<readonly [unknown, string]> = [["", "empty"], ["   ", "whitespace"], ["\t\n ", "tabs/newlines"], [123, "number"], [{}, "object"], [[], "array"], [true, "boolean"], [null, "null"]];
  for (const [value, label] of invalid) {
    const result = validateEntry(entry("a", { validated: value }), "a");
    assert.equal(result.ok, false, `expected rejection for validated ${label} ${JSON.stringify(value)}`);
    assert.equal(result.issues.length, 1, `expected exactly one issue for ${label}, got ${JSON.stringify(result.issues)}`);
    assert.deepEqual(result.issues[0], { code: "validated_invalid", path: "/validated", message: "validated must be a non-empty string when present" });
  }
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

test("scanCorpus includes validated in normalized output when present", async () => {
  const { scanCorpus } = await api();
  const dir = writeCorpus({ "a-thing": { entry: entry("a-thing", { validated: "evidence: matched source at commit 1234567" }) } });
  const result = scanCorpus(dir);
  assert.equal(result.ok, true);
  assert.equal(result.entries.length, 1);
  assert.equal(Object.prototype.hasOwnProperty.call(result.entries[0], "validated"), true);
  assert.deepEqual(result.entries[0], { slug: "a-thing", summary: "a-thing summary", tags: ["ts"], origin: "fixture", deposited: "2026-07-26", files: ["main.ts"], validated: "evidence: matched source at commit 1234567" });
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

test("searches slug, summary, and tags case-insensitively with the SearchResult contract", async () => {
  const { searchCorpus } = await api();
  const auth = searchEntry("auth-flow", "session handling", ["security"]);
  const grid = searchEntry("grid-layout", "responsive BENTO grid", ["css"]);
  const entries = [auth, grid];
  assert.deepEqual(searchCorpus(entries, "AUTH"), { entries: [auth], total: 1, limit: 3 });
  assert.deepEqual(searchCorpus(entries, "bento"), { entries: [grid], total: 1, limit: 3 });
  assert.deepEqual(searchCorpus(entries, "security"), { entries: [auth], total: 1, limit: 3 });
  assert.deepEqual(searchCorpus(entries, "zzz"), { entries: [], total: 0, limit: 3 });
});

test("caps search results at three by default while reporting the pre-truncation total", async () => {
  const { searchCorpus } = await api();
  const entries = ["foxtrot", "echo", "delta", "charlie", "bravo", "alpha"].map((slug) => searchEntry(slug, "unrelated", ["MATCH"]));
  const result = searchCorpus(entries, "match");
  assert.deepEqual(result.entries.map((item: { slug: string }) => item.slug), ["alpha", "bravo", "charlie"]);
  assert.equal(result.total, 6);
  assert.equal(result.limit, 3);
});

test("ranks exact tags, slug substrings, summaries, and partial tags with code-unit slug ties", async () => {
  const { searchCorpus } = await api();
  const entries = [
    searchEntry("partial-z", "unrelated", ["needlework"]),
    searchEntry("summary-z", "mentions NEEDLE here", ["other"]),
    searchEntry("needle-z", "unrelated", ["other"]),
    searchEntry("exact-z", "unrelated", ["Needle"]),
    searchEntry("partial-a", "unrelated", ["needlework"]),
    searchEntry("aa", "mentions needle here", ["other"]),
    searchEntry("a-z", "mentions needle here", ["other"]),
    searchEntry("needle-a", "unrelated", ["other"]),
    searchEntry("exact-a", "unrelated", ["NEEDLE"]),
  ];
  const result = searchCorpus(entries, "nEeDlE", 20);
  assert.deepEqual(result.entries.map((item: { slug: string }) => item.slug), [
    "exact-a", "exact-z",
    "needle-a", "needle-z",
    "a-z", "aa", "summary-z",
    "partial-a", "partial-z",
  ]);
  assert.equal(result.total, 9);
  assert.equal(result.limit, 20);
});

test("keeps all-same-tier ranking invariant across explicit input permutations", async () => {
  const { searchCorpus } = await api();
  const entries = ["zeta", "a-z", "aa", "delta", "beta"].map((slug) => searchEntry(slug, "shared match", ["other"]));
  const permutations = [
    entries,
    [...entries].reverse(),
    [entries[2], entries[4], entries[0], entries[3], entries[1]],
    [entries[3], entries[1], entries[4], entries[0], entries[2]],
  ];
  const expected = JSON.stringify(searchCorpus(permutations[0], "match", 5));
  for (const permutation of permutations) {
    const result = searchCorpus(permutation, "match", 5);
    assert.deepEqual(result.entries.map((item: { slug: string }) => item.slug), ["a-z", "aa", "beta", "delta", "zeta"]);
    assert.equal(result.total, 5);
    assert.equal(result.limit, 5);
    assert.equal(JSON.stringify(result), expected, "ranked SearchResult must serialize byte-identically across input permutations");
  }
});

test("uses an explicit positive integer search limit instead of the default", async () => {
  const { searchCorpus } = await api();
  const entries = ["echo", "delta", "charlie", "bravo", "alpha"].map((slug) => searchEntry(slug, "unrelated", ["match"]));
  const result = searchCorpus(entries, "match", 4);
  assert.deepEqual(result.entries.map((item: { slug: string }) => item.slug), ["alpha", "bravo", "charlie", "delta"]);
  assert.equal(result.total, 5);
  assert.equal(result.limit, 4);
});

test("cli reports validate, list, and search results with meaningful exit codes", () => {
  const dir = writeCorpus({ "a-thing": { entry: entry("a-thing") } });
  const validate = cli(["validate", dir]);
  assert.equal(validate.status, 0);
  assert.deepEqual(JSON.parse(validate.stdout), { ok: true, count: 1, issues: [] });
  assert.deepEqual(JSON.parse(cli(["list", dir]).stdout).entries.map((item: { slug: string }) => item.slug), ["a-thing"]);
  const found = JSON.parse(cli(["search", dir, "a-thing"]).stdout);
  assert.deepEqual({ limit: found.limit, total: found.total, slugs: found.entries.map((item: { slug: string }) => item.slug) }, { limit: 3, total: 1, slugs: ["a-thing"] });
  const missing = JSON.parse(cli(["search", dir, "zzz"]).stdout);
  assert.deepEqual({ limit: missing.limit, total: missing.total, entries: missing.entries }, { limit: 3, total: 0, entries: [] });
});

test("cli search reports the applied explicit limit and total before truncation", () => {
  const dir = writeCorpus(Object.fromEntries(["echo", "delta", "charlie", "bravo", "alpha"].map((slug) => [slug, { entry: entry(slug, { summary: "unrelated", tags: ["match"] }) }])));
  const result = cli(["search", dir, "match", "2"]);
  assert.equal(result.status, 0, result.stdout);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual({ ok: payload.ok, term: payload.term, limit: payload.limit, total: payload.total, slugs: payload.entries.map((item: { slug: string }) => item.slug), issues: payload.issues }, {
    ok: true,
    term: "match",
    limit: 2,
    total: 5,
    slugs: ["alpha", "bravo"],
    issues: [],
  });
});

test("cli search rejects non-canonical or non-positive limits as usage errors", () => {
  const dir = writeCorpus({ "a-thing": { entry: entry("a-thing") } });
  for (const limit of ["0", "-1", "many", "2.5", "2x", "", "01", "+2"]) {
    const result = cli(["search", dir, "thing", limit]);
    assert.equal(result.status, 2, `expected usage error for limit ${JSON.stringify(limit)}; stdout: ${result.stdout}`);
    assert.equal(JSON.parse(result.stdout).error.code, "usage_error");
  }
});

test("reportStaleness computes exact whole-UTC-day ages for fixed entries against a fixed now", async () => {
  const { reportStaleness } = await api();
  const now = new Date("2026-07-31T12:00:00.000Z");
  const entries = [
    { slug: "old-thing", summary: "s", tags: [], origin: "o", deposited: "2026-07-01", files: ["main.ts"] },
    { slug: "young-thing", summary: "s", tags: [], origin: "o", deposited: "2026-07-30", files: ["main.ts"] },
  ];
  assert.deepEqual(reportStaleness(entries, 30, now), [
    { slug: "old-thing", deposited: "2026-07-01", ageDays: 30, stale: true },
    { slug: "young-thing", deposited: "2026-07-30", ageDays: 1, stale: false },
  ]);
});

test("reportStaleness treats the max-age threshold as boundary-inclusive", async () => {
  const { reportStaleness } = await api();
  const now = new Date("2026-07-31T00:00:00.000Z");
  const boundary = { slug: "boundary", summary: "s", tags: [], origin: "o", deposited: "2026-07-01", files: ["main.ts"] };
  const under = { slug: "under", summary: "s", tags: [], origin: "o", deposited: "2026-07-02", files: ["main.ts"] };
  assert.deepEqual(reportStaleness([boundary], 30, now), [{ slug: "boundary", deposited: "2026-07-01", ageDays: 30, stale: true }]);
  assert.deepEqual(reportStaleness([boundary], 31, now), [{ slug: "boundary", deposited: "2026-07-01", ageDays: 30, stale: false }]);
  assert.deepEqual(reportStaleness([under], 30, now), [{ slug: "under", deposited: "2026-07-02", ageDays: 29, stale: false }]);
});

test("reportStaleness throws RangeError for a direct CorpusEntry with an impossible date", async () => {
  const { reportStaleness } = await api();
  const now = new Date("2026-07-31T00:00:00.000Z");
  for (const deposited of ["2026-02-31", "2025-02-29", "2026-13-01", "2026-00-01"]) {
    const entries = [{ slug: "bad-date", summary: "s", tags: [], origin: "o", deposited, files: ["main.ts"] }];
    assert.throws(
      () => reportStaleness(entries, 30, now),
      (err: unknown) => err instanceof RangeError && String((err as Error).message).includes(deposited),
      `expected RangeError mentioning the impossible deposited ${deposited}`,
    );
  }
});

test("reportStaleness computes year 0001 without the Date.UTC 1901 remap", async () => {
  const { reportStaleness } = await api();
  const deposited = "0001-01-01";
  const nowStr = "0001-04-01T00:00:00.000Z";
  // Independently-derived exact age from ground-truth UTC ms. The ISO date-time form
  // (Date.parse of "YYYY-MM-DDT00:00:00Z") does NOT remap years 0-99, unlike Date.UTC,
  // which maps year 1 to 1901.
  const depositedMs = Date.parse(deposited + "T00:00:00Z");
  const nowMs = Date.parse(nowStr);
  assert.equal(Number.isFinite(depositedMs) && Number.isFinite(nowMs), true, "ground-truth timestamps must be finite");
  const expectedAgeDays = Math.floor((nowMs - depositedMs) / 86_400_000);
  assert.equal(expectedAgeDays, 90, "0001-01-01 to 0001-04-01 is Jan(31)+Feb(28, year 1 not leap)+Mar(31) = 90 days");
  const now = new Date(nowMs);
  const entries = [{ slug: "year-one", summary: "s", tags: [], origin: "o", deposited, files: ["main.ts"] }];
  assert.deepEqual(reportStaleness(entries, 30, now), [
    { slug: "year-one", deposited, ageDays: expectedAgeDays, stale: expectedAgeDays >= 30 },
  ]);
});

test("cli stale marks an old entry stale and exits 1 with ok false", () => {
  const dir = writeCorpus({ "old-thing": { entry: entry("old-thing", { deposited: "2020-01-01" }) } });
  const result = cli(["stale", dir, "30"]);
  assert.equal(result.status, 1, result.stdout);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual({ ok: payload.ok, maxAgeDays: payload.maxAgeDays, count: payload.entries.length, issues: payload.issues }, { ok: false, maxAgeDays: 30, count: 1, issues: [] });
  const [report] = payload.entries;
  assert.equal(report.slug, "old-thing");
  assert.equal(report.deposited, "2020-01-01");
  assert.equal(report.stale, true);
  assert.ok(report.ageDays >= 30, `ageDays should be at least 30, got ${report.ageDays}`);
});

test("cli stale marks a clearly fresh entry ok and exits 0", () => {
  const dir = writeCorpus({ "fresh-thing": { entry: entry("fresh-thing", { deposited: "2099-01-01" }) } });
  const result = cli(["stale", dir, "30"]);
  assert.equal(result.status, 0, result.stdout);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual({ ok: payload.ok, maxAgeDays: payload.maxAgeDays, count: payload.entries.length, issues: payload.issues }, { ok: true, maxAgeDays: 30, count: 1, issues: [] });
  const [report] = payload.entries;
  assert.equal(report.slug, "fresh-thing");
  assert.equal(report.deposited, "2099-01-01");
  assert.equal(report.stale, false);
  assert.ok(report.ageDays < 0, `future-deposited ageDays should be negative, got ${report.ageDays}`);
});

test("cli stale rejects non-canonical max-age as usage errors and accepts 0 as stale", () => {
  const dir = writeCorpus({ "old-thing": { entry: entry("old-thing", { deposited: "2020-01-01" }) } });
  for (const maxAge of ["abc", "-1", "2.5", "2x", "01", "+2", "9007199254740993"]) {
    const result = cli(["stale", dir, maxAge]);
    assert.equal(result.status, 2, `expected usage error for max-age ${JSON.stringify(maxAge)}; stdout: ${result.stdout}`);
    assert.equal(JSON.parse(result.stdout).error.code, "usage_error");
  }
  const zero = cli(["stale", dir, "0"]);
  assert.equal(zero.status, 1, `max-age 0 should be accepted and stale; stdout: ${zero.stdout}`);
  const zeroPayload = JSON.parse(zero.stdout);
  assert.equal(zeroPayload.maxAgeDays, 0);
  assert.equal(zeroPayload.ok, false);
  assert.equal(zeroPayload.entries[0].stale, true);
});

test("cli fails closed on invalid corpora, unknown commands, and unreadable directories", () => {
  const broken = writeCorpus({ "a-thing": { entry: entry("a-thing", { files: ["main.ts", "gone.ts"] }) } });
  assert.equal(cli(["validate", broken]).status, 1);
  assert.equal(cli(["list", broken]).status, 1, "list on an invalid corpus must exit 1");
  assert.equal(cli(["stale", broken, "30"]).status, 1, "stale on an invalid scanned corpus must exit 1");
  for (const args of [[], ["validate"], ["nope", broken], ["search", broken]]) assert.equal(cli(args).status, 2, "expected usage error for " + JSON.stringify(args));
  assert.equal(cli(["validate", path.join(tmpdir(), "corpus-does-not-exist-xyz")]).status, 2);
});

test("the repository corpus is valid", () => {
  const result = cli(["validate", path.join(ROOT, ".pi/corpus")]);
  assert.equal(result.status, 0, result.stdout);
  assert.ok(JSON.parse(result.stdout).count >= 1);
});

test("the repository corpus validates and lists with the backward-compatible validated field", () => {
  const corpus = path.join(ROOT, ".pi/corpus");
  const validate = cli(["validate", corpus]);
  assert.equal(validate.status, 0, validate.stdout);
  assert.ok(JSON.parse(validate.stdout).count >= 1);
  const list = cli(["list", corpus]);
  assert.equal(list.status, 0, list.stdout);
  const entries = JSON.parse(list.stdout).entries as Array<Record<string, unknown>>;
  assert.ok(entries.length >= 1);
  for (const item of entries) {
    if (Object.prototype.hasOwnProperty.call(item, "validated")) {
      assert.equal(typeof item.validated, "string", `repository entry ${item.slug} validated must be a string`);
      assert.ok((item.validated as string).length > 0, `repository entry ${item.slug} validated must be non-empty`);
    }
  }
});
