# Animated SVG Icons

A production-grade system for building **premium, interactive SVG icons** — high-fidelity micro-interactions that respond to hover and scroll, built with **Framer Motion** and **requestAnimationFrame**.

Every icon plays a two-stage animation: a forward animation on hover (Stage 1) and a smooth, guaranteed return to its resting pose on hover-off (Stage 2). No stuck transitions, no layout shift.

> Built and used in production by [Convenient.Solutions](https://convenient.solutions). See it live at [convenient.solutions/skilly/animovane-svg-ikony](https://convenient.solutions/skilly/animovane-svg-ikony).

## Use it with your AI agent

This is a **Claude Agent Skill** — a `SKILL.md` your AI coding agent can read. Point your agent (Claude Code, Cursor, …) at this repo and let it generate icons that match your UI:

1. Clone or reference this repo in your project.
2. Hand your agent the skill plus a prompt, for example:

```text
Use the "animated-svg-icons" skill and create an interactive animated SVG icon.
Follow the two-stage model: Stage 1 plays on hover, Stage 2 smoothly returns to
the initial state. Use Framer Motion (useAnimation) or requestAnimationFrame,
a unique useId for masks, and clean up timers on unmount.
```

The agent reads [`SKILL.md`](SKILL.md) (the full design system) and the [`references/`](references) (real-world example icons) and produces icons in the same style.

## What's inside

- **[`SKILL.md`](SKILL.md)** — the complete design system: sizing rules, the two animation engines (Framer Motion vs requestAnimationFrame), advanced patterns (clipped reveals, symmetric swaps, masked silhouettes), an easing reference, and an implementation checklist.
- **[`references/`](references)** — 20+ real example icons (`.tsx`) you can read, adapt, and reuse.

## Manual usage

Each icon is a plain React component driven by a single `hovered` prop:

```tsx
import { useState } from "react";
import { AnimatedWorkflow } from "./icons";

export function IconButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatedWorkflow hovered={hovered} />
    </button>
  );
}
```

## Principles

- **Two stages** — play on hover, always settle back smoothly.
- **Two engines** — Framer Motion for sequences and keyframes; requestAnimationFrame for high-performance, fully interruptible physics with zero React re-renders.
- **Robust details** — a unique `useId` per instance to avoid mask collisions, and disciplined cleanup of timers and animation loops on unmount.

## Tech

React · TypeScript · Framer Motion · SVG

## License

[MIT](LICENSE) © 2026 Convenient Solutions s.r.o.
