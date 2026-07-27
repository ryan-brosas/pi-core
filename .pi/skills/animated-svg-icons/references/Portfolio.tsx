import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { bouncy, cls, ICON_OPACITY } from "./shared";

export function AnimatedPortfolio({ hovered }: { hovered: boolean }) {
  const backCtrl = useAnimation();
  const midCtrl = useAnimation();
  const frontCtrl = useAnimation();
  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const bouncy = [0.34, 1.56, 0.64, 1] as const;

  const playReturn = () => {
    backCtrl.start({ x: 0, y: 0, rotate: 0, transition: { duration: 0.5, ease: bouncy } });
    midCtrl.start({ x: 0, y: 0, rotate: 0, transition: { duration: 0.5, ease: bouncy, delay: 0.04 } });
    frontCtrl.start({ x: 0, y: 0, rotate: 0, transition: { duration: 0.5, ease: bouncy, delay: 0.08 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;
      // Snap to rest first so re-hover always animates
      backCtrl.set({ x: 0, y: 0, rotate: 0 });
      midCtrl.set({ x: 0, y: 0, rotate: 0 });
      frontCtrl.set({ x: 0, y: 0, rotate: 0 });
      // Fan out
      backCtrl.start({ x: 4.5, y: -3, rotate: 14, transition: { duration: 0.5, ease: bouncy } });
      midCtrl.start({ x: -1, y: -1.5, rotate: -5, transition: { duration: 0.5, ease: bouncy, delay: 0.04 } });
      frontCtrl.start({ x: -3.5, y: 2, rotate: -10, transition: { duration: 0.5, ease: bouncy, delay: 0.08 } });
      timerRef.current = setTimeout(() => {
        playingRef.current = false;
        if (pendingReturnRef.current) { pendingReturnRef.current = false; playReturn(); }
      }, 600);
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
      {/* Back page — filled so strokes don't bleed through */}
      <motion.rect
        animate={backCtrl}
        width="11" height="14" x="9" y="3" rx="1.5"
        fill="var(--color-bg-soft, var(--color-surface))"
        style={{ transformOrigin: "14.5px 10px" }}
      />
      {/* Mid page */}
      <motion.rect
        animate={midCtrl}
        width="11" height="14" x="6" y="5" rx="1.5"
        fill="var(--color-bg-soft, var(--color-surface))"
        style={{ transformOrigin: "11.5px 12px" }}
      />
      {/* Front page + content lines move together */}
      <motion.g animate={frontCtrl} style={{ transformOrigin: "8.5px 14px" }}>
        <rect
          width="11" height="14" x="3" y="7" rx="1.5"
          fill="var(--color-bg-soft, var(--color-surface))"
        />
        <path d="M6 11h5M6 14h3.5M6 17h2" />
      </motion.g>
    </svg>
  );
}
