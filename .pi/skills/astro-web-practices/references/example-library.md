# Official Astro example map

Source mirror: `.pi/templates/astro/examples/`  
Pinned upstream: `withastro/astro@0fc519de12d69088052b76e096a4adfdc789c30c`

Choose the smallest example that demonstrates the missing behavior. Read its `package.json`, `astro.config.*`, relevant `src/` entry points, and tests; do not copy unrelated dependencies or styling.

## Foundations

| Need | Start with | Boundary to extract |
|---|---|---|
| Smallest project | `minimal` | Minimum Astro page and scripts |
| Core project shape | `basics` | Pages, components, layouts, and assets |
| Reusable Astro component package | `component` | Package-facing component boundary |
| Blog/content site | `blog` | Content, RSS, sitemap, and image pipeline |
| Personal showcase | `portfolio` | Content hierarchy only; do not copy visual identity |
| Data-driven static UI | `starlog` | Structured data and generated presentation |

## Routing and server behavior

| Need | Start with | Boundary to extract |
|---|---|---|
| Advanced routes/middleware | `advanced-routing` | Route composition and Node adapter use |
| Request-time rendering | `ssr` | SSR output, adapter, and server script |
| Server-fetched application | `hackernews` | Data loading and server-rendered views |
| Integration package | `integration` | Astro integration entry point |
| Toolbar application | `toolbar-app` | Dev-toolbar package boundary |

### `advanced-routing` evidence

At the pinned commit, the `advanced-routing` README is stale: it describes experimental routing through `src/app.ts`, while the source uses `src/fetch.ts`; `astro.config.mjs` has no `advancedRouting` flag. Treat source, config, and qualified exact-SHA checks as authoritative over README prose. Qualified exact-SHA checks do not validate README prose or target compatibility, so keep the mirrored example unchanged. If compatibility cannot be reconciled, stop or select another example.

Adapters are deployment commitments. Do not add one until the target's hosting/runtime requirement is known.

## Content formats and state

- `with-mdx` — MDX plus a small Preact island.
- `with-markdoc` — Markdoc integration.
- `with-nanostores` — shared client state across islands.
- `with-tailwindcss` — Tailwind through Vite; use only when the target chooses Tailwind.

## UI framework islands

- `framework-alpine`
- `framework-preact`
- `framework-react`
- `framework-solid`
- `framework-svelte`
- `framework-vue`
- `framework-multiple`

Use these only to answer an explicit integration or island question. `framework-multiple` demonstrates interoperability; it is not a recommendation to install several frameworks.

## Testing

- `with-vitest` — focused Vitest setup for an Astro project.
- `container-with-vitest` — Container API plus React and Vitest.

Prefer the target's existing test stack. These examples establish possible setup shapes, not permission to add dependencies.

## Scaffold command

Astro's upstream README documents:

```sh
npm create astro@latest -- --template [EXAMPLE_NAME]
```

Use it only when the user requests scaffolding into an empty destination and npm is the selected package-manager path. For an existing project, inspect and adapt manually rather than regenerating it.
