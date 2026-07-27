import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { bouncy, CAP_ICON_OPACITY } from "./shared";

export function AnimatedLayout({ hovered }: { hovered: boolean }) {
  const hLineCtrl = useAnimation(); // horizontal divider
  const vLineCtrl = useAnimation(); // vertical divider
  const scaleCtrl = useAnimation();
  const playingRef = useRef(false);

  const bouncy = [0.34, 1.56, 0.64, 1] as const;

  useEffect(() => {
    if (hovered) {
      playingRef.current = true;

      // Horizontal divider slides down
      hLineCtrl.start({
        y: 4,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      });
      // Vertical divider slides right + down (moves with horizontal line)
      // Path extends past rect bottom so clipPath keeps it flush
      vLineCtrl.start({
        x: 4,
        y: 4,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      }).then(() => {
        playingRef.current = false;
      });
    } else {
      // Always bounce back to original
      hLineCtrl.start({
        y: 0,
        transition: { duration: 0.4, ease: bouncy },
      });
      vLineCtrl.start({
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: bouncy },
      });
    }
  }, [hovered]); // eslint-disable-line react-hooks/exhaustive-deps

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
        style={{ color: "var(--color-fg)", opacity: CAP_ICON_OPACITY }}
      >
        <defs>
          <clipPath id="layout-clip">
            <rect width="18" height="18" x="3" y="3" rx="2" />
          </clipPath>
        </defs>
        {/* Outer frame — stays fixed */}
        <rect width="18" height="18" x="3" y="3" rx="2" />
        {/* Divider lines — extend past rect, clipped to shape */}
        <g clipPath="url(#layout-clip)">
          <motion.path animate={hLineCtrl} d="M0 9h27" />
          <motion.path animate={vLineCtrl} d="M9 30V9" />
        </g>
      </svg>
    </motion.div>
  );
}
