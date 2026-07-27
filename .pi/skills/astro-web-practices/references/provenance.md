# Provenance and qualification

## Astro

- Repository: https://github.com/withastro/astro
- Pinned commit: `0fc519de12d69088052b76e096a4adfdc789c30c`
- Imported source: `.agents/skills/` and `examples/`
- Local source checkout: `/home/ryanj/work/inspo/creative/web/astro`
- License: MIT; bundled at `references/licenses/astro-MIT.txt` and beside each verbatim copied upstream skill.
- Target mirror: `.pi/templates/astro/examples/`
- Compatibility reference: pinned upstream root `reference/unit-testing.md` is placed at `.pi/reference/unit-testing.md`; SHA-256 `746443798f96775fdf50ac627657f04e48d82f016b661af8bee271563b842678`; license mapped to `references/licenses/astro-MIT.txt`.

Seven upstream skills are copied byte-for-byte except for the added adjacent `LICENSE` file. Their relative references are retained. They are qualified as Astro-repository maintainer guidance, not as a general app workflow. Some references include cleanup or destructive Git commands; the active project's safety and approval policy remains higher authority.

Astro's examples are maintained templates and upstream exposes root scripts such as `build:examples` and smoke checks. This import does not install their dependencies or claim they build in the Pi Core repository. Recursive byte parity proves the mirror; only a selected target project's own checks prove an adaptation.

Bundled Pi-local links resolve within `.pi`, while paths written relative to the Astro monorepo remain target-monorepo-relative; the latter are not Pi Core compatibility paths or wrappers.

### Executable qualification

- [Run 30171682338](https://github.com/withastro/astro/actions/runs/30171682338): head SHA `0fc519de12d69088052b76e096a4adfdc789c30c`; conclusion: success; build plus Astro check / `test:check-examples`.
- [Run 30171682348](https://github.com/withastro/astro/actions/runs/30171682348): head SHA `0fc519de12d69088052b76e096a4adfdc789c30c`; conclusion: success; smoke example builds.

Qualification is limited to build, Astro check, `test:check-examples`, and smoke example builds; these successful exact-SHA checks do not validate README prose, external links, or target-project compatibility.

At this pin, the advanced-routing README names `src/app.ts`, while the source implementation uses `src/fetch.ts`; `astro.config.mjs` has no `advancedRouting` flag.

## pi.dev

- Repository: https://github.com/earendil-works/pi-website
- Pinned commit: `2f5e410b97474d0a34ec2500aa1aa58d6c3f992c`
- Inspected source: `src/index.html`, `src/packages.html`, `src/_partials/header.html`, `src/_partials/footer.html`, `src/style.css`, and `src/_css/{colors,elements,utilities,custom}.css`
- Local source checkout: `/home/ryanj/work/inspo/creative/web/pi-website`
- License: MIT; bundled at `references/licenses/pi-website-MIT.txt`.

The inspected `src/packages.html` evidence supports dialog semantics, focus handling and restoration, scroll management, and DOMPurify claims.

The HTML/CSS reference extracts design and accessibility practices in original wording. It does not copy pi.dev's brand assets, copy, or substantial stylesheet code.

## Refreshing

Before updating either source, record the new exact commit, review its license, inspect changed skills/examples or HTML/CSS bytes, rerun the focused Pi Core contract, and update this provenance. Never treat `main` as a stable version identifier.
