import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { CAP_ICON_OPACITY } from "./shared";

export function AnimatedSmartphone({ hovered }: { hovered: boolean }) {
  const ctrl = useAnimation();
  const playingRef = useRef(false);

  useEffect(() => {
    if (hovered) {
      playingRef.current = true;
      ctrl.start({
        rotate: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      }).then(() => {
        playingRef.current = false;
      });
    } else {
      if (!playingRef.current) {
        // Settling pulse on unhover
        ctrl.start({
          scale: [1, 0.88, 1.06, 1],
          transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
        });
      }
    }
  }, [hovered, ctrl]);

  return (
    <motion.div animate={ctrl} style={{ originX: "50%", originY: "50%" }}>
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--color-fg)", opacity: CAP_ICON_OPACITY }}
      >
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    </motion.div>
  );
}
