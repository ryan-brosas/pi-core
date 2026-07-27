import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Props, BOUNCY, SVG_BASE } from "./shared";

export function AnimatedHardHat({ hovered }: Props) {
  const helmet = useAnimation();
  const top = useAnimation();
  const head = useAnimation();

  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const playReturn = () => {
    helmet.start({
      y: 0,
      scaleY: 1,
      scaleX: 1,
      transition: { duration: 0.45, ease: "easeOut" }
    });
    top.start({
      scaleY: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    });
    head.start({
      y: 8,
      opacity: 0,
      transition: { duration: 0.45, ease: "easeOut" }
    });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;

      // Snappy lift, squash, and settle for the helmet
      helmet.start({
        y: [-1, -3.5, 0.5, 0],
        scaleY: [1, 1.06, 0.95, 1],
        scaleX: [1, 0.94, 1.05, 1],
        transition: { duration: 0.72, ease: "easeInOut" },
      });
      top.start({
        scaleY: [1, 1.25, 0.88, 1],
        transition: { duration: 0.62, ease: "easeInOut", delay: 0.08 },
      });
      // Minimalist head & shoulders slide up from bottom & fade in
      head.start({
        y: 0,
        opacity: 1,
        transition: { duration: 0.62, ease: BOUNCY, delay: 0.08 }
      });

      timerRef.current = setTimeout(() => {
        playingRef.current = false;
        if (pendingReturnRef.current) {
          pendingReturnRef.current = false;
          playReturn();
        }
      }, 720);
    } else {
      if (playingRef.current) {
        pendingReturnRef.current = true;
      } else {
        playReturn();
      }
    }
  }, [hovered]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg className={SVG_BASE} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
      <defs>
        {/* Only show the head/eyes below the helmet visor line (y = 17.5) */}
        <clipPath id="hardhat-head-clip">
          <rect x="0" y="17.5" width="24" height="10" />
        </clipPath>
      </defs>

      {/* Minimalist head outline sliding from the bottom */}
      <motion.g
        animate={head}
        initial={{ y: 8, opacity: 0 }}
        style={{ transformOrigin: "12px 19.5px" }}
        clipPath="url(#hardhat-head-clip)"
      >
        <circle cx="12" cy="19.5" r="7.0" />
        {/* Simple dot eyes peeking from under the visor */}
        <circle cx="9.8" cy="19.8" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="14.2" cy="19.8" r="0.75" fill="currentColor" stroke="none" />
      </motion.g>

      {/* Hard hat elements */}
      <motion.g
        animate={helmet}
        style={{ transformOrigin: "12px 18px" }}
      >
        {/* Outer helmet strokes */}
        <path d="M2 18v-2a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2" />
        <path d="M4 15v-3a6 6 0 0 1 6-6" />
        <path d="M14 6a6 6 0 0 1 6 6v3" />
        <path d="M2 18h20" />
        <motion.path
          animate={top}
          style={{ transformOrigin: "12px 10px" }}
          d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"
        />
      </motion.g>
    </svg>
  );
}
