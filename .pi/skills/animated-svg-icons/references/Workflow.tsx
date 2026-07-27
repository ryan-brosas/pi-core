import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { bouncy, CAP_ICON_OPACITY } from "./shared";

export function AnimatedWorkflow({ hovered }: { hovered: boolean }) {
  const topCtrl = useAnimation();   // top-left box
  const botCtrl = useAnimation();   // bottom-right box
  const playingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const bouncy = [0.34, 1.56, 0.64, 1] as const;

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      // Snap to origin
      topCtrl.set({ x: 0, y: 0 });
      botCtrl.set({ x: 0, y: 0 });
      // Pull apart
      topCtrl.start({ x: -2, y: -2, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } });
      botCtrl.start({ x: 2, y: 2, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.04 } });
      // Snap back
      timerRef.current = setTimeout(() => {
        topCtrl.start({ x: 0, y: 0, transition: { duration: 0.3, ease: bouncy } });
        botCtrl.start({ x: 0, y: 0, transition: { duration: 0.3, ease: bouncy, delay: 0.04 } });
        setTimeout(() => {
          playingRef.current = false;
        }, 350);
      }, 320);
    } else {
      if (!playingRef.current) {
        // Settle: gentle scale pulse
        topCtrl.start({
          scale: [1, 1.2, 1],
          transition: { duration: 0.4, ease: bouncy },
        });
        botCtrl.start({
          scale: [1, 1.2, 1],
          transition: { duration: 0.4, ease: bouncy, delay: 0.08 },
        });
      }
    }
  }, [hovered]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--color-fg)", opacity: CAP_ICON_OPACITY, overflow: "visible" }}
    >
      {/* Top-left box */}
      <motion.rect animate={topCtrl} width="8" height="8" x="3" y="3" rx="2"
        style={{ transformOrigin: "7px 7px" }} />
      {/* L-shaped connector — stays fixed, visually stretches with boxes */}
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
      {/* Bottom-right box */}
      <motion.rect animate={botCtrl} width="8" height="8" x="13" y="13" rx="2"
        style={{ transformOrigin: "17px 17px" }} />
    </svg>
  );
}
