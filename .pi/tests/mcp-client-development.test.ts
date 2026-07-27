import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const SKILL = ".pi/skills/mcp-client-development/SKILL.md";
const PROVENANCE = ".pi/skills/mcp-client-development/references/provenance.md";

function required(path: string): string {
  assert.ok(existsSync(path), `required path is missing: ${path}`);
  return readFileSync(path, "utf8");
}

function manifestSkills(): string[] {
  const manifest = JSON.parse(required(".pi/skills/manifest.json")) as {
    tiers: Record<string, { skills: string[] }>;
  };
  return Object.values(manifest.tiers).flatMap((tier) => tier.skills);
}

test("MCP client development is registered and narrowly routed", () => {
  const skill = required(SKILL);
  assert.ok(manifestSkills().includes("mcp-client-development"));
  assert.match(skill, /^name:\s*mcp-client-development$/m);
  assert.match(skill, /^description:[^\n]*(?:designing|implementing|reviewing|hardening)[^\n]*MCP (?:client|gateway|adapter)/im);
  assert.match(skill, /do not use[^\n]*(?:merely|only)[^\n]*(?:call|use)[^\n]*MCP tool/i);
  assert.match(skill, /observable outcome/i);
  assert.match(skill, /controlled failure/i);
});

test("MCP client development preserves context, contract, output, and auth invariants", () => {
  const skill = required(SKILL);

  assert.match(skill, /proxy[- ]first[\s\S]*(?:direct|first-class) tools?[\s\S]*(?:bounded|small|selected) (?:set|subset)/i);
  assert.match(skill, /lazy[^\n]*(?:default|connect)[\s\S]*single[- ]flight[\s\S]*(?:metadata )?cache/i);
  assert.match(skill, /cache[^\n]*(?:capability|metadata)[^\n]*(?:identity|surface)[\s\S]*(?:temporary|temp)[^\n]*rename|atomic[^\n]*cache/i);
  assert.match(skill, /server[^\n]*argument[- ]validation authority|argument validation[^\n]*server[^\n]*authority/i);
  assert.match(skill, /outputSchema[\s\S]*structuredContent[\s\S]*draft-07[\s\S]*2020-12/i);
  assert.match(skill, /schema mismatch[^\n]*(?:controlled failure|fail(?:s|ure)? closed|call failure)/i);
  assert.match(skill, /(?:byte|bytes)[^\n]*(?:line|lines)[\s\S]*UTF-8[\s\S]*0600/i);
  assert.match(skill, /image (?:content )?blocks?[^\n]*(?:native|unchanged|untouched)/i);
  assert.match(skill, /errors?[^\n]*(?:expanded|visible)[\s\S]*(?:collapsed|compact)/i);
  assert.match(skill, /OS (?:secure )?credential store[\s\S]*fail closed[\s\S]*(?:no|never)[^\n]*plaintext fallback/i);
  assert.match(skill, /PKCE[\s\S]*(?:CSRF|state)[\s\S]*(?:server URL|issuer|resource)/i);
  assert.match(skill, /official[^\n]*conformance[\s\S]*expected[- ]failure baseline[\s\S]*(?:unexpected failure|starts passing)/i);
});

test("MCP client development retains optional source evidence and adaptation limits", () => {
  const skill = required(SKILL);
  const provenance = required(PROVENANCE);

  assert.match(skill, /references\/provenance\.md/);
  assert.match(provenance, new RegExp("https://github\\.com/nicobailon/pi-mcp-adapter"));
  assert.match(provenance, /v2\.15\.0/);
  assert.match(provenance, /e588296e28b36a22b081d40fcfba76f418d6f84e/);
  assert.doesNotMatch(skill, /\blicen[cs]e\b|copyright/i);
  assert.doesNotMatch(provenance, /\blicen[cs]e\b|copyright/i);
  assert.match(provenance, /48 tests[^\n]*pass/i);
  assert.match(provenance, /adapted[^\n]*(?:no source code|not copied)|no source code[^\n]*copied/i);
  assert.match(provenance, /Adopted[\s\S]*Adapted[\s\S]*Excluded/i);
  assert.match(provenance, /full conformance suite[^\n]*(?:not run|unverified)/i);
});
