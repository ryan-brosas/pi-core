# Astro Web Practices and Template Import

**Artifact:** `astro-web-practices`  
**Status:** Active

## Goal

Install the seven skills from Astro's `.agents/skills/` in Pi Core, duplicate Astro's official example library into Pi Core's template area, and add one Pi-native Astro web-practices skill grounded in the official examples and pi.dev's HTML/CSS source.

## Sources

- Astro: `https://github.com/withastro/astro` at `0fc519de12d69088052b76e096a4adfdc789c30c` (MIT).
- pi.dev: `https://github.com/earendil-works/pi-website` at `2f5e410b97474d0a34ec2500aa1aa58d6c3f992c` (MIT).

## Required behavior

1. Pi Core directly discovers all seven copied Astro skills.
2. `.pi/templates/astro/examples/` is a byte-for-byte duplicate of upstream `examples/` at the pinned commit.
3. `astro-web-practices` directs ordinary Astro application work toward the smallest relevant official example, semantic HTML, restrained hydration, layered CSS, responsive behavior, and repository-defined verification.
4. Every copied skill and template carries the applicable MIT license and pinned provenance.
5. Existing concurrent changes are preserved; no branch, dependency, commit, push, deployment, or deletion is performed.

## Controlled failure

- If a copied source path already exists, copying stops rather than overwriting it.
- If manifest registration exists without the skill directories, the parity test must fail before the copy and pass afterward.
- Upstream maintainer instructions that mention reset, checkout, removal, or cleanup never override Pi Core's user-approval and destructive-action gates.

## Target paths

- `.pi/skills/analyze-github-action-logs/`
- `.pi/skills/astro-developer/`
- `.pi/skills/astro-pr-writer/`
- `.pi/skills/changeset/`
- `.pi/skills/merge/`
- `.pi/skills/triage/`
- `.pi/skills/writing-comments/`
- `.pi/skills/astro-web-practices/`
- `.pi/templates/astro/examples/`
- `.pi/templates/astro/LICENSE`
- `.pi/templates/astro/UPSTREAM.md`
- `.pi/skills/manifest.json`
- `.pi/tests/skill-system.test.ts`

## Acceptance

- Source and target skill bytes match for every upstream file.
- Source and target example trees match recursively.
- The focused Astro contract and manifest parity test pass.
- Pi Core's full retained test suite and Doctor are run and reported truthfully.
