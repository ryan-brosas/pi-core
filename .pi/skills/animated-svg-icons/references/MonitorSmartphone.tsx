import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Props, EXPO, BOUNCY, SVG_BASE } from "./shared";

export function AnimatedMonitorSmartphone({ hovered }: Props) {
  const phone = useAnimation();
  const monitor = useAnimation();
  const webLine1 = useAnimation();
  const webLine2 = useAnimation();
  const phoneActive = useAnimation();

  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const playReturn = () => {
    monitor.start({ y: 0, rotate: 0, transition: { duration: 0.45, ease: "easeOut" } });
    phone.start({ y: 0, rotate: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } });
    webLine1.start({ pathLength: 1, opacity: 1, transition: { duration: 0.35 } });
    webLine2.start({ pathLength: 1, opacity: 1, transition: { duration: 0.35 } });
    phoneActive.start({ opacity: 0, y: 3, transition: { duration: 0.35 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;

      // Monitor tilts back/sides slightly
      monitor.start({
        y: [-0.5, -2, 0.5, 0],
        rotate: [0, -4, 2, 0],
        transition: { duration: 0.65, ease: BOUNCY }
      });
      // Phone pops up and leans in responsively
      phone.start({
        y: [-1, -3.5, 0.5, 0],
        rotate: [0, 6, -3, 0],
        scale: [1, 1.1, 0.98, 1],
        transition: { duration: 0.7, ease: BOUNCY, delay: 0.04 }
      });

      // Browser lines in monitor "stream" out (slide-draw animation)
      webLine1.start({
        pathLength: [1, 0, 1],
        opacity: [1, 0, 1],
        transition: { duration: 0.5, ease: EXPO }
      });
      webLine2.start({
        pathLength: [1, 0, 1],
        opacity: [1, 0, 1],
        transition: { duration: 0.5, ease: EXPO, delay: 0.08 }
      });

      // A tiny chat bubble or screen interface slides up inside the phone
      phoneActive.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: BOUNCY, delay: 0.16 }
      });

      timerRef.current = setTimeout(() => {
        playingRef.current = false;
        if (pendingReturnRef.current) {
          pendingReturnRef.current = false;
          playReturn();
        }
      }, 750);
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
      {/* Monitor base stand */}
      <path d="M7 17h7" />
      <path d="M10 13v4" />

      {/* Monitor Frame */}
      <motion.g animate={monitor} style={{ transformOrigin: "9px 13px" }}>
        <rect x="2" y="3" width="14" height="10" rx="1" />
        {/* Web browser mockup lines inside screen */}
        <motion.path animate={webLine1} d="M5 6h8" strokeWidth="1" strokeOpacity="0.7" />
        <motion.path animate={webLine2} d="M5 9h6" strokeWidth="1" strokeOpacity="0.7" />
      </motion.g>

      {/* Smartphone */}
      <motion.g animate={phone} style={{ transformOrigin: "19px 20px" }}>
        <rect x="16" y="8" width="6" height="12" rx="1" />
        <path d="M18 18h2" />

        {/* Small active content that emerges inside phone */}
        <motion.g animate={phoneActive} initial={{ opacity: 0, y: 3 }}>
          {/* Active status dot/camera */}
          <circle cx="19" cy="10" r="0.6" fill="#ff7a3d" stroke="none" />
          {/* Active data lines inside phone screen */}
          <line x1="18" y1="12" x2="20" y2="12" strokeWidth="1" stroke="#ff7a3d" />
          <line x1="18" y1="14" x2="20" y2="14" strokeWidth="1" stroke="#ff7a3d" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
