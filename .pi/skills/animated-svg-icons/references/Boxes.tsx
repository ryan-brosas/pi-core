import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { cls, ICON_OPACITY } from "./shared";

export function AnimatedBoxes({ hovered }: { hovered: boolean }) {
  const topCtrl = useAnimation();
  const brCtrl = useAnimation();
  const blCtrl = useAnimation();
  const playingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const ease = [0.34, 1.56, 0.64, 1] as const;

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      topCtrl.set({ x: 0, y: 0 });
      brCtrl.set({ x: 0, y: 0 });
      blCtrl.set({ x: 0, y: 0 });
      topCtrl.start({ x: 5, y: 9, transition: { duration: 0.5, ease } });
      brCtrl.start({ x: -10, y: 0, transition: { duration: 0.5, ease, delay: 0.04 } });
      blCtrl.start({ x: 5, y: -9, transition: { duration: 0.5, ease, delay: 0.08 } });
      timerRef.current = setTimeout(() => {
        playingRef.current = false;
      }, 550);
    } else {
      if (!playingRef.current) {
        topCtrl.start({ x: 0, y: 0, transition: { duration: 0.5, ease } });
        brCtrl.start({ x: 0, y: 0, transition: { duration: 0.5, ease, delay: 0.04 } });
        blCtrl.start({ x: 0, y: 0, transition: { duration: 0.5, ease, delay: 0.08 } });
      }
    }
  }, [hovered]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      className={cls}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: ICON_OPACITY }}
    >
      <motion.g animate={topCtrl}>
        <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
        <path d="M12 8 7.26 5.15" />
        <path d="m12 8 4.74-2.85" />
        <path d="M12 13.5V8" />
      </motion.g>

      <motion.g animate={brCtrl}>
        <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
        <path d="m17 16.5-5-3" />
        <path d="m17 16.5 4.74-2.85" />
        <path d="M17 16.5v5.17" />
      </motion.g>

      <motion.g animate={blCtrl}>
        <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
        <path d="m7 16.5-4.74-2.85" />
        <path d="m7 16.5 5-3" />
        <path d="M7 16.5v5.17" />
      </motion.g>
    </svg>
  );
}
