# Astro Web Practices Import Plan

> Execute against the explicit artifact `astro-web-practices`; `tasks.json` is authoritative.

## Qualification

The local inspiration checkout is a clean shallow sparse clone of Astro `main` at `0fc519de12d69088052b76e096a4adfdc789c30c`. It contains 24 example directories and seven upstream skills. Astro's root license is MIT. The local pi.dev checkout is clean at `2f5e410b97474d0a34ec2500aa1aa58d6c3f992c` and is also MIT licensed.

The copied skills are repository-maintainer workflows, not a complete general Astro application guide. They are preserved verbatim as requested. A separate `astro-web-practices` skill provides the app-development boundary and clearly distinguishes ordinary site work from Astro-monorepo contribution work.

## Sequence

1. Register the eight target skill directories and add a focused static contract before creating them.
2. Run the focused test and retain its expected missing-path failure as RED evidence.
3. Copy all seven upstream skill directories without overwriting any destination; add the upstream MIT license to each copied package.
4. Duplicate `examples/` under `.pi/templates/astro/examples/`; place license and pinned provenance beside it.
5. Write the Pi-native `astro-web-practices` skill and its example-map, HTML/CSS, and provenance references.
6. Prove source/target byte parity, recursive template parity, manifest parity, focused behavior, full tests, Doctor, graph validity, and diff hygiene.

## Safety boundary

Several upstream maintainer references contain commands such as `rm -rf`, `git reset --hard`, `git checkout`, and `git rm`. They are copied source material, not standing authorization. `AGENTS.md` remains authoritative and requires path-specific approval for deletions or destructive Git operations.

## No imported architecture

The examples are retained as templates, not installed dependencies or runtime code. The Pi-native skill extracts only reusable decisions: select the smallest example, use server-rendered HTML by default, hydrate only interactive islands, keep CSS tokens/layers explicit, and verify through the target project's own scripts.
