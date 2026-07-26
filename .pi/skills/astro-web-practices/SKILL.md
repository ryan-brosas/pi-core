---
name: astro-web-practices
description: Build, revise, or review Astro websites using official-example-derived architecture and semantic HTML/CSS practices. Use for Astro pages, layouts, components, content, islands, styling, migrations, and project verification; not for contributing to Astro's own monorepo.
license: See references/provenance.md
compatibility: Astro projects; use the target project's installed version, package manager, adapter, and scripts.
---

# Astro Web Practices

## Core rule

Start from the **smallest relevant official example**, extract only the behavior needed by the target, and keep Astro's server-rendered HTML as the default. Do not import a showcase's whole architecture or add a framework merely because an example uses one.

## Workflow

1. **Inspect the target.** Read `package.json`, the lockfile, `astro.config.*`, `tsconfig.json`, `src/pages/`, `src/layouts/`, `src/components/`, content configuration, adapter configuration, and nearby tests. Record the installed Astro version, output mode, adapter, package manager, and repository-defined verification scripts. Never invent install or build commands.
2. **Choose evidence.** Use [the example map](references/example-library.md) to select one minimal source. Compare its invariant with the target's current conventions; copy the invariant, not its directory tree.
3. **Design the HTML boundary.** Use pages for routes, layouts for shared document structure, components for cohesive reusable markup, content collections for validated content, and endpoints/server actions only when the request boundary requires them.
4. **Render first, hydrate second.** Prefer `.astro` components and server-rendered semantic HTML. Hydrate a framework component **only when** browser-owned interactive state needs it; choose the least eager compatible `client:*` directive.
5. **Style deliberately.** Apply the [HTML/CSS practices](references/html-css-practices.md): explicit tokens, readable measure, stable spacing, native controls, visible focus, responsive composition, and `prefers-reduced-motion` fallbacks. Reuse principles, never pi.dev branding by default.
6. **Verify outside-in.** Run the target's own focused test/check first, then its broader test and build scripts. Inspect rendered pages at narrow and wide widths, keyboard navigation, focus states, no-JavaScript baseline where applicable, hydration errors, and controlled failure states.

## Architecture decisions

- Keep static content static. Add SSR, an adapter, middleware, or an endpoint only for named request-time behavior.
- Keep interactive islands small. Framework choice belongs to the island that needs it, not the whole page.
- Preserve content and routing conventions already established by the target.
- Use browser APIs in hydrated client code, server APIs only in server/build boundaries, and avoid environment-specific APIs in portable UI modules.
- Treat accessibility, metadata, performance, and error states as acceptance behavior, not post-build cleanup.

## Failure rules

Stop and report rather than guess when the installed Astro version, adapter/runtime, package scripts, rendering mode, or deployment boundary cannot be established. Do not claim an upstream example proves target compatibility; only target checks and observed rendering do.

## Related source skills

The copied `astro-developer`, `triage`, `merge`, `changeset`, and PR skills target work inside the Astro upstream monorepo. Load them only for that repository context. Their cleanup or Git examples never override the active project's approval gates.

See [provenance and qualification](references/provenance.md) for pinned sources, licenses, and limits.
