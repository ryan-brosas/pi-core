import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Props, BOUNCY, SVG_BASE } from "./shared";

export function AnimatedLock({ hovered }: Props) {
  const shackle = useAnimation();
  const body = useAnimation();
  const indicator = useAnimation();

  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const playReturn = () => {
    shackle.start({ y: 0, rotate: 0, transition: { duration: 0.45, ease: "easeOut" } });
    body.start({ scale: 1, rotate: 0, transition: { duration: 0.45, ease: "easeOut" } });
    indicator.start({ fill: "currentColor", opacity: 1, transition: { duration: 0.3 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;

      // Shackle moves up and rotates open (unlocking motion)
      shackle.start({
        y: [-1, -3, -2.5],
        rotate: [0, -25, -20],
        transition: { duration: 0.6, ease: BOUNCY }
      });

      // Lock body wiggles on unlock trigger
      body.start({
        scale: [1, 1.05, 0.98, 1],
        rotate: [0, -3, 2, 0],
        transition: { duration: 0.55, ease: BOUNCY, delay: 0.05 }
      });

      // Secure status indicator LED turns orange and pulses
      indicator.start({
        fill: ["currentColor", "#ff7a3d", "currentColor"],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.2 }
      });

      timerRef.current = setTimeout(() => {
        playingRef.current = false;
        if (pendingReturnRef.current) {
          pendingReturnRef.current = false;
          playReturn();
        }
      }, 700);
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
      {/* Shackle */}
      <motion.path
        animate={shackle}
        style={{ transformOrigin: "7px 11px" }}
        d="M7 11V8a5 5 0 0 1 10 0v3"
      />

      {/* Lock Body */}
      <motion.g animate={body} style={{ transformOrigin: "12px 16px" }}>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        {/* Keyhole */}
        <circle cx="12" cy="14.2" r="0.8" fill="currentColor" stroke="none" />
        <path d="M12 15v1.8" strokeWidth="1.2" />
        {/* Status Indicator LED */}
        <motion.circle animate={indicator} cx="12" cy="18.5" r="0.75" fill="currentColor" stroke="none" />
      </motion.g>
    </svg>
  );
}
