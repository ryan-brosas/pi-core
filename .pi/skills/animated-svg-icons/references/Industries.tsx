import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { bouncy, cls, ICON_OPACITY } from "./shared";

export function AnimatedIndustries({ hovered }: { hovered: boolean }) {
  const leftCtrl = useAnimation();
  const centerCtrl = useAnimation();
  const rightCtrl = useAnimation();
  const groundCtrl = useAnimation();
  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const bouncy = [0.34, 1.56, 0.64, 1] as const;

  const playReturn = () => {
    leftCtrl.start({ x: 0, y: 0, rotate: 0, transition: { duration: 0.5, ease: bouncy } });
    centerCtrl.start({ x: 0, y: 0, rotate: 0, transition: { duration: 0.5, ease: bouncy, delay: 0.04 } });
    rightCtrl.start({ x: 0, y: 0, rotate: 0, transition: { duration: 0.5, ease: bouncy, delay: 0.08 } });
    groundCtrl.start({ scaleX: 1, transition: { duration: 0.45, ease: bouncy, delay: 0.06 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;
      leftCtrl.set({ x: 0, y: 0, rotate: 0 });
      centerCtrl.set({ x: 0, y: 0, rotate: 0 });
      rightCtrl.set({ x: 0, y: 0, rotate: 0 });
      groundCtrl.set({ scaleX: 1 });
      // Spread apart — exploded view
      leftCtrl.start({ x: -4, y: -1, rotate: -8, transition: { duration: 0.5, ease: bouncy } });
      centerCtrl.start({ y: -4, transition: { duration: 0.5, ease: bouncy, delay: 0.05 } });
      rightCtrl.start({ x: 4, y: -1, rotate: 8, transition: { duration: 0.5, ease: bouncy, delay: 0.1 } });
      groundCtrl.start({ scaleX: 1.15, transition: { duration: 0.45, ease: bouncy, delay: 0.05 } });
      timerRef.current = setTimeout(() => {
        playingRef.current = false;
        if (pendingReturnRef.current) { pendingReturnRef.current = false; playReturn(); }
      }, 650);
    } else {
      if (playingRef.current) {
        pendingReturnRef.current = true;
      } else {
        playReturn();
      }
    }
  }, [hovered]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      className={cls}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: ICON_OPACITY, overflow: "visible" }}
    >
      {/* Ground line */}
      <motion.line animate={groundCtrl} x1="2" x2="22" y1="21" y2="21"
        style={{ transformOrigin: "12px 21px" }} />

      {/* Left building */}
      <motion.g animate={leftCtrl} style={{ transformOrigin: "4px 21px" }}>
        <path d="M6 12H4a2 2 0 0 0-2 2v7h4v-9Z"
          fill="var(--color-bg-soft, var(--color-surface))" />
      </motion.g>

      {/* Center building (tallest) + window strokes */}
      <motion.g animate={centerCtrl} style={{ transformOrigin: "12px 21px" }}>
        <path d="M7 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16H7Z"
          fill="var(--color-bg-soft, var(--color-surface))" />
        <path d="M10 7h4M10 11h4M10 15h4" />
      </motion.g>

      {/* Right building */}
      <motion.g animate={rightCtrl} style={{ transformOrigin: "20px 21px" }}>
        <path d="M18 12h2a2 2 0 0 1 2 2v7h-4v-9Z"
          fill="var(--color-bg-soft, var(--color-surface))" />
      </motion.g>
    </svg>
  );
}
