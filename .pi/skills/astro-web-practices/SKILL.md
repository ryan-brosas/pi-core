---
name: astro-web-practices
description: Use astro-web-practices first for ordinary Astro application work, including pages, layouts, components, content, islands, styling, migrations, and project verification. Load copied Astro monorepo maintainer skills only after confirming withastro/astro repository identity; the narrow exception outside upstream is analyze-github-action-logs, and only when an explicit OWNER/REPO is supplied.
license: See references/provenance.md
compatibility: Astro projects; use the target project's installed version, package manager, adapter, and scripts.
---

# Astro Web Practices

## Route by repository identity

Evidence boundary: When an example is cited, consult the [native example map](references/example-library.md) and mirrored source/config before accepting README prose. For pinned `advanced-routing`, source uses `src/fetch.ts`, not the README's `src/app.ts`, and `astro.config.mjs` has no `advancedRouting` flag. Copied skills and the `.pi/templates/astro/` template mirror are read-only evidence; Pi-local evidence paths are not target-project paths.

1. **Confirmed `withastro/astro` contribution work:** Load the copied upstream maintainer skill that matches the request.
2. **Ordinary Astro application work:** Use `astro-web-practices` for application architecture, implementation, review, and verification.
3. **Unknown repository identity:** Stay with `astro-web-practices` while gathering repository evidence; if identity remains unknown, stop and do not load copied maintainer skills.
4. **Generic bug debugging:** Use `debugging-and-error-recovery` rather than copied `triage`; add Astro-specific practices from this skill.
5. **Explicit-repository GitHub Actions analysis:** When the user names the workflow and `OWNER/REPO`, load `analyze-github-action-logs` with that repository.

Confirm identity from repository remotes and root package/workspace metadata. An Astro dependency, issue wording, directory name, or a copied skill's default repository is not identity evidence.

## Core rule

Start from the **smallest relevant official example**, extract only the behavior needed by the target, and keep Astro's server-rendered HTML as the default. Do not import a showcase's whole architecture or add a framework merely because an example uses one.

## Workflow

1. **Inspect the target.** Before proposing commands or making compatibility claims, confirm the target Astro version, adapter, output mode, package manager and lockfile, repository-defined scripts, and nearby tests. Establish them from `package.json`, the lockfile, `astro.config.*`, `tsconfig.json`, source conventions, content and adapter configuration, and the tests themselves. Never invent install or build commands.
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
