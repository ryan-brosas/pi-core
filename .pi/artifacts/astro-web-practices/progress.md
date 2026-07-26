# Astro Web Practices Import Evidence

## Source qualification

- Astro inspiration checkout: `/home/ryanj/work/inspo/creative/web/astro`.
- Upstream: `https://github.com/withastro/astro.git`.
- Commit: `0fc519de12d69088052b76e096a4adfdc789c30c` on `main`.
- Inventory: seven `.agents/skills/` directories and 24 `examples/` directories.
- License: MIT, copyright Fred K. Schott; the license will accompany copied material.
- pi.dev checkout: `/home/ryanj/work/inspo/creative/web/pi-website`.
- Commit: `2f5e410b97474d0a34ec2500aa1aa58d6c3f992c` on clean `main`.
- License: MIT, copyright Earendil Inc. and contributors.
- Source limitation: Astro's `astro-developer` skill targets contribution to the Astro monorepo; the remaining upstream skills are maintainer workflows. They are copied verbatim as requested, while the separate Pi-native skill covers ordinary application development.
- Safety review: upstream references contain deletion and destructive Git examples. They are never authorization; Pi Core's `AGENTS.md` approval gates remain controlling.

## Concurrent work boundary

Before editing, `.pi/skills/manifest.json` and `.pi/tests/skill-system.test.ts` already contained unrelated active modifications. The Astro changes are limited to new list entries and one appended static contract. Existing bytes are preserved, hashes are checked around edits, and any overlapping concurrent change is a stop condition.

## Task 2 RED/GREEN

- **RED:** `node --experimental-strip-types --test --test-name-pattern="Astro upstream skills|manifest has exact bidirectional parity" .pi/tests/skill-system.test.ts` exited 1 with two intended failures: the eight registered skill directories were absent, and `.pi/skills/analyze-github-action-logs/SKILL.md` was missing.
- **GREEN:** The same command exited 0 after copying seven upstream skills, adding `astro-web-practices`, and duplicating the template library: 2 focused tests passed.

## Task 2 copy parity

- Seven direct Pi Core skill directories copied; 18 upstream files remain byte-identical and seven adjacent MIT license files were added.
- Astro examples: 427 source files and 427 target files; recursive `diff -qr` exited 0.
- Target example-tree digest: `69aad895ed0b0c82a0bfe9460fe1c29bec052dcbceaa369ce8b0e65e8085149a`.
- `.pi/templates/astro/` includes pinned `UPSTREAM.md` and the exact Astro MIT license.
- `git diff --check` passed for the modified manifest and test contract.

## Task 3 integration

- Full retained suite: `node --experimental-strip-types --test .pi/tests/*.test.ts` exited 0; 186 tests passed, 0 failed.
- Doctor: exited 0 with ten PASS results and three existing bootstrap/runtime warnings (`tracked-runtime-state`, package pins, and MCP configuration).
- Every `.pi/artifacts/*/tasks.json` graph validated.
- Owned diff check exited 0 and `.pi/artifacts/.active` remains absent.

## Task 3 owned-path review

- Owned result: eight new skill directories, one Astro template mirror, one lifecycle artifact, eight targeted manifest entries, and one appended static test.
- No owned file was deleted, overwritten, staged, committed, pushed, or deployed.
- The pre-existing manifest entries for `complex-pattern-adoption` and `mastra-development`, the pre-existing test changes, and all unrelated/runtime-managed work remain preserved and unclaimed.

## Verification — 2026-07-26T21:50:59Z

Verification: FAIL - Full repository gates and byte-parity checks pass, but the implementation is not ready to ship because three contract gaps remain.

- **Mode:** Full; 466 feature paths and 511 total changed paths bypassed the cache. No PASS stamp was recorded.
- **Structural/source evidence:** pinned source identity, 18 copied-skill files, seven MIT licenses, the 427-file/24-example mirror, two focused tests, 186 retained tests, Doctor, 17 artifact graphs, and diff hygiene passed.
- **Observable-behavior evidence:** two fresh agents without `astro-web-practices` already met the 5/5 rubric, and two agents with the skill also met it. The existing static missing-file RED therefore does not demonstrate the behavior change required by `writing-skills`.
- **Blocking defects:** `.pi/skills/triage/fix.md` requires missing `.pi/reference/unit-testing.md`; pinned Astro canonical example checks were not qualified and cannot run from the current sparse, dependency-free source checkout without separately approved workspace/dependency changes; the recommended `advanced-routing` mirror has stale README claims that conflict with its pinned code.
- **Should-fix:** copied generic routing descriptions can trigger Astro-maintainer workflows outside `withastro/astro`; pi.dev provenance omits `src/packages.html`, which supports the overlay and DOMPurify claims.
- **Completeness:** 6 of 9 finite PRD requirements are fully supported; skill usability, demonstrated behavior change, and source/provenance qualification are partial.
- **Advisory route:** reopen planning for the missing qualification/TDD contracts, then ship the known link, routing, and provenance defects. No route was invoked automatically.
