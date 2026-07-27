---
name: animated-svg-icons
description: How to build, animate, debug, and optimize high-fidelity interactive SVG icons using Framer Motion or requestAnimationFrame. Make sure to use this skill whenever the user requests creating a new animated icon, fixing a sticky or glitchy hover transition on an SVG, implementing hover states for cards, or refining micro-animations, even if they don't explicitly mention 'Framer Motion' or 'requestAnimationFrame'.
---

# Animated SVG Icon System

This skill guides you through building premium, high-performance, micro-interactive SVG icons. These icons respond to cursor hovers and scroll-based triggers using two distinct stages:
1. **Stage 1 (Hover On / Active)**: The forward animation plays. The icon may end in a different visual pose than it started.
2. **Stage 2 (Hover Off / Settle)**: The icon returns smoothly to its exact initial state, ensuring visual consistency when the interaction ends.

## Design Philosophy & Creative Motion

High-fidelity icons should be expressive, engaging, and creative rather than just doing basic linear rotations or scales. Delightful motion design brings icons to life through:
- **Expressive Movement & Physics**: Leverage physics-based easing curves like squash-and-stretch, gravity swings, secondary actions, and overshoot bounces. For example, a briefcase swinging slightly under gravity, or a gear spinning with an elastic overshoot.
- **Storytelling & Interaction**: Introduce micro-details that emerge during interaction to surprise and engage the user. For example, a document sliding out of a briefcase, or a head sliding into a hard hat.
- **Positional Swaps**: It is highly effective and visually engaging to have parts of the icon switch positions during hover, as seen in quote mark animations (where quotes swap places on an arc path) or code tag `<>` animations (where brackets slide past each other to swap sides). This creates a playful, interactive loop.
- **Multi-layered Independence**: Animate different sub-elements asynchronously. For instance, separate a figure's head from its body to allow a subtle head-bob/tilt while a background gear rotates.
- **Reuse in References**: It is perfectly fine and encouraged to reuse, adapt, and reference these icons or code structures across different case studies, projects, and reference documentations.
- **A Guideline, Not a Constraint**: These techniques should inspire delightful, creative details that elevate the overall user experience without being a rigid constraint.

---

## 1. Sizing and Layout Constraints

| Sizing Context | Icon Dimensions | Container Style | Default Stroke Width | Default Opacity |
| :--- | :--- | :--- | :--- | :--- |
| **Trust Bar / KPI Cards** | `18px × 18px` | `38px × 38px`, rounded, absolute positioning | `1.75` | `0.62` (inactive) / `1.0` (hovered) |
| **Capabilities Cards** | `16px × 16px` | `36px × 36px` inline header row | `2.0` | `0.72` (inactive) / `1.0` (hovered) |
| **Process Steps** | `16px × 16px` | `36px × 36px` on timeline margin | `2.0` | Magenta highlight when active |

### Layout & SVG Structure Rules
- **No Layout Shifting**: Always wrap the icon in a fixed-size container (e.g., `h-[38px] w-[38px]`) to ensure the page layout is locked.
- **Overflow Handling**: If elements translate outside the standard viewBox, add `style={{ overflow: "visible" }}` to the SVG.
- **Isometric / Wireframe Shapes**:
  - To prevent overlapping "layer" or "flat panel stack" bugs, **do not** use filled polygons for both the top and bottom of a wireframe (e.g. a cube).
  - Keep the bottom face as an **open stroke-only path** (e.g., using `<path>` without closing it and without filling it) to allow internal vertical lines to connect to it cleanly.
  - Only fill the top face if needed to mask/hide internal overlapping segments.

---

## 2. Advanced Animation Patterns

### Pattern A: Emerging Clipped Element (Emerging Shoulders/Body)
*Use when a background element slides out from behind a foreground element, organic body extensions, or slide-out details.*
To make a background element emerge naturally without showing awkward overlapping paths:
1. **Clipped Group**: Place the background element in a `<g>` group clipped by a `<clipPath>` mask containing a `<rect>` aligned with the boundary.
2. **Double State Fade**: Nest the element's paths inside two groups:
   - A `partial` group (fades out from opacity 1 to 0 on hover).
   - A `full` group (fades in from opacity 0 to 1 on hover).
3. **Dynamic Return Guard**: Since Stage 1 ends in a different visual pose, use a `pendingReturnRef` and a `timerRef` to queue Stage 2 animations in case the user hovers off quickly during Stage 1.
4. **Unique Mask IDs**: Always use React's `useId()` hook to generate unique IDs for `<clipPath>` elements to avoid ID collision bugs when multiple instances of the icon are on the same page.

```tsx
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useId } from "react";

export function AnimatedUsersIcon({ hovered }: { hovered: boolean }) {
  const rightCtrl = useAnimation();
  const partialCtrl = useAnimation();
  const fullCtrl = useAnimation();
  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const clipId = useId();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const playReturn = () => {
    rightCtrl.start({ x: 0, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } });
    fullCtrl.start({ opacity: 0, transition: { duration: 0.12 } });
    partialCtrl.start({ opacity: 1, transition: { duration: 0.12 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;

      rightCtrl.set({ x: 0 });
      partialCtrl.set({ opacity: 1 });
      fullCtrl.set({ opacity: 0 });

      rightCtrl.start({ x: 5, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } });
      partialCtrl.start({ opacity: 0, transition: { duration: 0.12 } });
      fullCtrl.start({ opacity: 1, transition: { duration: 0.12 } });

      timerRef.current = setTimeout(() => {
        playingRef.current = false;
        if (pendingReturnRef.current) {
          pendingReturnRef.current = false;
          playReturn();
        }
      }, 400);
    } else {
      if (playingRef.current) {
        pendingReturnRef.current = true;
      } else {
        playReturn();
      }
    }
  }, [hovered]);

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={clipId}>
          <rect x="13" y="0" width="24" height="24" />
        </clipPath>
      </defs>
      {/* Clipped background figure */}
      <g clipPath={`url(#${clipId})`}>
        <motion.g animate={rightCtrl}>
          <motion.g animate={partialCtrl}>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          </motion.g>
          <motion.g animate={fullCtrl} initial={{ opacity: 0 }}>
            <circle cx="17" cy="7" r="4" />
            <path d="M15 15h3a4 4 0 0 1 4 4v2" />
          </motion.g>
        </motion.g>
      </g>
      {/* Front figure */}
      <g>
        <circle cx="9" cy="7" r="4" fill="var(--color-bg-soft)" />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" fill="var(--color-bg-soft)" />
      </g>
    </svg>
  );
}
```

### Pattern B: Visually Identical Swap Loop (Symmetric Swap with Conditional Settle)
*Use when an icon has symmetric or identical sub-elements that swap places on hover (like double quote marks). Because the target swapped state looks identical to the initial resting state, a quick hover-off should not play the return animation, whereas a standard slow hover-off should.*

#### Logic Rules:
1. **Normal Hover-off**: If the cursor enters and stays past the end of Stage 1 (playing finishes), hovering off plays a smooth Stage 2 return animation back to `0`.
2. **Quick Hover-off (Aborted Settle)**: If the cursor leaves *while* Stage 1 is still actively playing, we do **not** trigger or queue Stage 2. Instead, Stage 1 completes, and we instantly/silently reset all coordinates back to `0`.
3. **Tracking State**:
   - `playingRef = useRef(false)`: tracks whether Stage 1 is currently animating.
   - `hoveredRef = useRef(hovered)`: tracks latest hovered state inside asynchronous timeout handlers.

```tsx
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

export function AnimatedQuote({ hovered }: { hovered: boolean }) {
  const a = useAnimation();
  const b = useAnimation();
  const playingRef = useRef(false);
  const hoveredRef = useRef(hovered);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const playReturn = () => {
    a.start({ x: 0, y: 0, transition: { duration: 0.5, ease: "easeOut" } });
    b.start({ x: 0, y: 0, transition: { duration: 0.5, ease: "easeOut" } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;

      // Stage 1: swap places
      a.start({ x: [0, 12], y: [0, -3.5, 0], transition: { duration: 0.5 } });
      b.start({ x: [0, -12], y: [0, 3.5, 0], transition: { duration: 0.5 } });

      timerRef.current = setTimeout(() => {
        playingRef.current = false;

        // If user hovered off during Stage 1, silently reset without animating Stage 2
        if (!hoveredRef.current) {
          a.set({ x: 0, y: 0 });
          b.set({ x: 0, y: 0 });
        }
      }, 500);
    } else {
      // Hover off: only play Stage 2 return if Stage 1 has finished playing
      if (!playingRef.current) {
        playReturn();
      }
    }
  }, [hovered]);

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <motion.path animate={a} d="M3 21c3 0 5-2 5-5V8H3v8h3c0 1.5-1 3-3 3z" />
      <motion.path animate={b} d="M15 21c3 0 5-2 5-5V8h-5v8h3c0 1.5-1 3-3 3z" />
    </svg>
  );
}
```

### Pattern C: Background Head Silhouette with Opaque Foreground Masking
*Use when an element slides underneath a hollow/transparent outlined shape (e.g. a head sliding into a helmet, or document sliding into a folder) and the foreground shape needs to block the overlapping background paths.*

#### Logic Rules:
1. **Opaque Mask Paths**: Put filled mask shapes (`fill="var(--color-surface)" stroke="none"`) inside the foreground container group to block overlapping visual paths, without styling the outer strokes.
2. **Order of Rendering**: Render the moving background element first, and the masking foreground container on top of it.
3. **Proportions**: Ensure the moving element sits in a natural physical position relative to the foreground shape.

```tsx
import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

export function AnimatedHardHat({ hovered }: { hovered: boolean }) {
  const helmet = useAnimation();
  const top = useAnimation();
  const head = useAnimation();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const playReturn = () => {
    helmet.start({ y: 0, scaleY: 1, scaleX: 1, transition: { duration: 0.45 } });
    head.start({ y: 8, opacity: 0, transition: { duration: 0.45 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      helmet.start({
        y: [-1, -3.5, 0.5, 0],
        scaleY: [1, 1.06, 0.95, 1],
        scaleX: [1, 0.94, 1.05, 1],
        transition: { duration: 0.72, ease: "easeInOut" },
      });
      head.start({
        y: 0,
        opacity: 1,
        transition: { duration: 0.62, ease: [0.34, 1.56, 0.64, 1], delay: 0.08 }
      });
    } else {
      playReturn();
    }
  }, [hovered]);

  return (
    <svg viewBox="0 0 24 24" style={{ overflow: "visible" }}>
      {/* Sliding head is rendered underneath */}
      <motion.g animate={head} initial={{ y: 8, opacity: 0 }} style={{ transformOrigin: "12px 19.5px" }}>
        <circle cx="12" cy="19.5" r="7.0" />
        <circle cx="9.8" cy="19.8" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="14.2" cy="19.8" r="0.75" fill="currentColor" stroke="none" />
      </motion.g>

      {/* Helmet with opaque masks is rendered on top */}
      <motion.g animate={helmet} style={{ transformOrigin: "12px 18px" }}>
        <circle cx="12" cy="12" r="6" fill="var(--color-surface)" stroke="none" />
        <rect x="2" y="12" width="20" height="6" fill="var(--color-surface)" stroke="none" />

        {/* Outlined helmet strokes */}
        <path d="M2 18v-2a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4 15v-3a6 6 0 0 1 6-6" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M14 6a6 6 0 0 1 6 6v3" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M2 18h20" fill="none" stroke="currentColor" strokeWidth="1.75" />
      </motion.g>
    </svg>
  );
}
```

---

## 3. The Two Animation Engines & Dependency Rules

### A. Framer Motion (`framer-motion`)
Best for complex multi-element sequences, keyframe arrays, and staggered reveals.
- **Rule**: Always reset the position using `.set()` if restarting the same target transition.

### B. requestAnimationFrame (rAF)
Best for ultra-high-performance mathematical easing, zero React re-render overhead, and fully interruptible, state-tracking physics (e.g., squashing, spinning).

> [!CAUTION]
> **Avoid Recursive Render Loops**:
> Do NOT include ticking state variables (like `offset` or `dy`) inside your `useEffect` dependency array. The dependency array must only be `[hovered]`.
> Ticking variables should be stored in `useRef` objects (e.g. `dyRef`, `offsetRef`) and animated by mutating the DOM elements directly using React refs. This prevents triggering the effect recursively.

#### Example: Controlled rAF Slide on Hover & Return on Hover-off
```tsx
import { useEffect, useRef } from "react";

export function AnimatedGlobeIcon({ hovered }: { hovered: boolean }) {
  const meridianRef = useRef<SVGGElement>(null);
  const equatorRef = useRef<SVGPathElement>(null);
  const rafRef = useRef(0);
  const offsetRef = useRef(0); // tracks position without triggering re-renders

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const from = offsetRef.current;

    if (hovered) {
      function tickOn(now: number) {
        const progress = Math.min((now - start) / 400, 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2; // ease-in-out

        const current = from + (3 - from) * eased;
        offsetRef.current = current;
        meridianRef.current?.setAttribute("transform", `translate(${current}, 0)`);

        // Equator squish effect
        const eqScale = 1 + Math.sin(progress * Math.PI) * 0.06;
        equatorRef.current?.setAttribute("transform", `scale(${eqScale}, 1)`);
        equatorRef.current?.setAttribute("style", "transform-origin: 12px 12px");

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tickOn);
        }
      }
      rafRef.current = requestAnimationFrame(tickOn);
    } else {
      if (from === 0) return;
      function tickOff(now: number) {
        const progress = Math.min((now - start) / 300, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out

        const current = from * (1 - eased);
        offsetRef.current = current;
        meridianRef.current?.setAttribute("transform", `translate(${current}, 0)`);

        equatorRef.current?.setAttribute("transform", "scale(1, 1)");

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tickOff);
        }
      }
      rafRef.current = requestAnimationFrame(tickOff);
    }
  }, [hovered]);

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10" />
      <path ref={equatorRef} d="M2 12h20" />
      <g ref={meridianRef}>
        <ellipse cx="12" cy="12" rx="4" ry="10" />
      </g>
    </svg>
  );
}
```

---

## 4. Easing and Timing Reference

| Ease Name | Keyframe Array / Config | Character |
| :--- | :--- | :--- |
| **Bouncy** | `[0.34, 1.56, 0.64, 1]` | 56% overshoot, snappy settle. Perfect for slides and pops. |
| **Expo-out** | `[0.16, 1, 0.3, 1]` | Fast start, gradual deceleration. Great for structural reveals. |
| **Linear** | `"linear"` string | Uniform speed. Reserved for path drawing animations. |
| **Wobble Decay** | Keyframe rotation list | Vibrate effect (e.g. `[0, -12, 12, -12, 12, -8, 8, -4, 4, 0]`). |

---

## 5. Implementation Checklist

- [ ] **Wrapper Constraints**: Is the icon sized correctly and wrapped in a fixed-size container?
- [ ] **Unmount Cleanup**: Are all `clearTimeout`, `clearInterval`, and `cancelAnimationFrame` IDs properly cleared in a `useEffect` return function?
- [ ] **Quick Hover-off Guard**: If Stage 1 ends in a custom state, did you implement `pendingReturnRef` and `timerRef` to prevent sticking?
- [ ] **rAF Hook Dependencies**: Did you ensure `useEffect` hooks running rAF loops only depend on `[hovered]`, using refs to hold animated coordinates?
- [ ] **Aesthetics and Layers**: For wireframes, are the base segments open stroke-only paths to avoid awkward filled layer overlaps?
