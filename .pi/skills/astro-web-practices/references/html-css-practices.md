# HTML and CSS practices derived from pi.dev

Pinned source: `earendil-works/pi-website@2f5e410b97474d0a34ec2500aa1aa58d6c3f992c`.

These are reusable principles observed in `src/index.html`, `src/_partials/`, and `src/_css/`. They are not a mandate to reproduce pi.dev's brand, exact colors, fonts, copy, or page structure.

## HTML

1. Start with landmarks and source order: one descriptive document title, header/navigation where needed, one main content flow, sections with real headings, and a footer.
2. Prefer native links, buttons, inputs, lists, headings, and disclosure elements. Add ARIA only to close a real semantic gap.
3. Give meaningful images useful `alt`; mark decorative images/icons appropriately. Icon-only links need an accessible name, not only `title`.
4. Keep the server-rendered document useful before JavaScript. Enhance copy buttons, rotators, sticky navigation, filters, and dialogs after the baseline exists.
5. For overlays, provide dialog semantics, a labelled close control, Escape handling, initial focus, focus restoration, and background-scroll management.
6. Escape or sanitize untrusted rendered content. pi.dev's package README path uses DOMPurify after Markdown parsing; Astro content boundaries need equivalent source-aware handling.

## CSS system

1. Define a small token layer in `:root`: font roles, background/surface/text/accent colors, borders, radii, spacing, and motion durations. Dark mode or theme overrides should replace tokens rather than duplicate components.
2. Separate concerns: reset/elements, utilities only when genuinely reused, and feature/component styles. Astro component-scoped styles are preferred for isolated components; global files own tokens, document defaults, and shared primitives.
3. Constrain reading width and let spacing establish hierarchy. pi.dev uses a narrow centered measure, restrained heading sizes, muted body text, monospace labels/code, and consistent section rhythm.
4. Use layout primitives—flow, flex, grid, `gap`, `minmax()`, and intrinsic sizing—before breakpoint patches. Add a narrow-screen rule only where composition actually changes.
5. Define every interactive state: default, hover where hover exists, `:focus-visible`, active/selected, disabled, loading, empty, and error.
6. Preserve motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* remove nonessential transitions and animation */
}
```

7. Avoid `transition: all`; name the properties. Avoid animation that hides state changes from assistive technology.
8. Keep media responsive with intrinsic dimensions or `aspect-ratio`, `max-width: 100%`, appropriate `object-fit`, and lazy loading where it does not delay primary content.

## What not to canonize from the source

- A large single feature stylesheet is evidence to split ownership in a growing Astro site, not a pattern to copy wholesale.
- Inline `onclick` handlers should become component-local scripts with named controls and cleanup when behavior grows.
- Browser-only hover assumptions need keyboard and touch equivalents.
- The orange accent, terminal surfaces, 720px measure, and typography are pi.dev choices—not universal defaults.

## Review checklist

- Semantic outline and landmarks remain coherent without CSS.
- Keyboard users can reach, operate, and leave every control.
- Focus is always visible.
- Narrow and wide layouts avoid clipping and unintended horizontal scrolling.
- Reduced-motion mode removes nonessential movement.
- JavaScript failure leaves core content and navigation usable.
- CSS ownership and tokens are obvious from file placement.
