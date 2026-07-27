import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { bouncy, cls, ICON_OPACITY } from "./shared";

export function AnimatedTechStack({ hovered }: { hovered: boolean }) {
  const coreCtrl = useAnimation();
  const innerCtrl = useAnimation();
  const pinsTopCtrl = useAnimation();
  const pinsBotCtrl = useAnimation();
  const pinsLeftCtrl = useAnimation();
  const pinsRightCtrl = useAnimation();
  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const bouncy = [0.34, 1.56, 0.64, 1] as const;

  const playReturn = () => {
    innerCtrl.start({ rotate: 0, scale: 1, transition: { duration: 0.4, ease: bouncy } });
    coreCtrl.start({ scale: 1, transition: { duration: 0.3 } });
    pinsTopCtrl.start({ y: 0, transition: { duration: 0.35, ease: bouncy, delay: 0.1 } });
    pinsBotCtrl.start({ y: 0, transition: { duration: 0.35, ease: bouncy, delay: 0.13 } });
    pinsLeftCtrl.start({ x: 0, transition: { duration: 0.35, ease: bouncy, delay: 0.16 } });
    pinsRightCtrl.start({ x: 0, transition: { duration: 0.35, ease: bouncy, delay: 0.19 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;
      // Snap to rest
      pinsTopCtrl.set({ y: 0 }); pinsBotCtrl.set({ y: 0 });
      pinsLeftCtrl.set({ x: 0 }); pinsRightCtrl.set({ x: 0 });
      innerCtrl.set({ rotate: 0, scale: 1 }); coreCtrl.set({ scale: 1 });

      // Pins retract
      pinsTopCtrl.start({ y: 2, transition: { duration: 0.35, ease: bouncy } });
      pinsBotCtrl.start({ y: -2, transition: { duration: 0.35, ease: bouncy, delay: 0.03 } });
      pinsLeftCtrl.start({ x: 2, transition: { duration: 0.35, ease: bouncy, delay: 0.06 } });
      pinsRightCtrl.start({ x: -2, transition: { duration: 0.35, ease: bouncy, delay: 0.09 } });
      // Inner die rotates + core pulses (delayed to overlap with pin retract end)
      timerRef.current = setTimeout(() => {
        innerCtrl.start({ rotate: 90, scale: 1.15, transition: { duration: 0.4, ease: bouncy } });
        coreCtrl.start({ scale: [1, 1.08, 1], transition: { duration: 0.35, ease: bouncy } });
      }, 200);
      // Mark done
      setTimeout(() => {
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
      {/* Outer chip body */}
      <motion.rect
        animate={coreCtrl}
        x="5" y="5" width="14" height="14" rx="2"
        style={{ transformOrigin: "12px 12px" }}
      />

      {/* Inner die — rotates during "compute" */}
      <motion.rect
        animate={innerCtrl}
        x="9" y="9" width="6" height="6" rx="1"
        style={{ transformOrigin: "12px 12px" }}
      />

      {/* Pin stubs — all always visible */}
      <motion.g animate={pinsTopCtrl}>
        <line x1="9" y1="1" x2="9" y2="5" />
        <line x1="15" y1="1" x2="15" y2="5" />
      </motion.g>
      <motion.g animate={pinsBotCtrl}>
        <line x1="9" y1="19" x2="9" y2="23" />
        <line x1="15" y1="19" x2="15" y2="23" />
      </motion.g>
      <motion.g animate={pinsLeftCtrl}>
        <line x1="1" y1="9" x2="5" y2="9" />
        <line x1="1" y1="15" x2="5" y2="15" />
      </motion.g>
      <motion.g animate={pinsRightCtrl}>
        <line x1="19" y1="9" x2="23" y2="9" />
        <line x1="19" y1="15" x2="23" y2="15" />
      </motion.g>
    </svg>
  );
}
