import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { CAP_ICON_OPACITY, BRAIN_RIGHT_PATHS, BRAIN_LEFT_PATHS } from "./shared";

export function AnimatedCapBrain({ hovered }: { hovered: boolean }) {
  const leftCtrl = useAnimation();
  const rightCtrl = useAnimation();
  const scaleCtrl = useAnimation();
  const playingRef = useRef(false);

  useEffect(() => {
    if (hovered) {
      playingRef.current = true;
      (async () => {
        await Promise.all([
          leftCtrl.start({ x: -2.5, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }),
          rightCtrl.start({ x: 2.5, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }),
        ]);
        await Promise.all([
          leftCtrl.start({ x: 0, transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] } }),
          rightCtrl.start({ x: 0, transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] } }),
        ]);
        playingRef.current = false;
      })();
    } else {
      if (!playingRef.current) {
        scaleCtrl.start({
          scale: [1, 0.82, 1.05, 1],
          transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
        });
      }
    }
  }, [hovered, leftCtrl, rightCtrl, scaleCtrl]);

  return (
    <motion.div animate={scaleCtrl}>
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
        <motion.g animate={leftCtrl}>
          {BRAIN_LEFT_PATHS.map((d, i) => <path key={`l${i}`} d={d} />)}
        </motion.g>
        <motion.g animate={rightCtrl}>
          {BRAIN_RIGHT_PATHS.map((d, i) => <path key={`r${i}`} d={d} />)}
        </motion.g>
      </svg>
    </motion.div>
  );
}
