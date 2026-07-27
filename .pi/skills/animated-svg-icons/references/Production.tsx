import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { bouncy, cls, ICON_OPACITY } from "./shared";

export function AnimatedProduction({ hovered }: { hovered: boolean }) {
  const topCtrl = useAnimation();
  const botCtrl = useAnimation();
  const led1Ctrl = useAnimation();
  const led2Ctrl = useAnimation();
  const led3Ctrl = useAnimation();
  const led4Ctrl = useAnimation();
  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const bouncy = [0.34, 1.56, 0.64, 1] as const;

  const playReturn = () => {
    led1Ctrl.start({ opacity: 0.4, transition: { duration: 0.15 } });
    led2Ctrl.start({ opacity: 0.4, transition: { duration: 0.15, delay: 0.03 } });
    led3Ctrl.start({ opacity: 0.4, transition: { duration: 0.15, delay: 0.06 } });
    led4Ctrl.start({ opacity: 0.4, transition: { duration: 0.15, delay: 0.09 } });
    topCtrl.start({ y: 0, rotate: 0, x: 0, transition: { duration: 0.5, ease: bouncy, delay: 0.08 } });
    botCtrl.start({ y: 0, rotate: 0, x: 0, transition: { duration: 0.5, ease: bouncy, delay: 0.12 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;
      topCtrl.set({ y: 0, rotate: 0, x: 0 });
      botCtrl.set({ y: 0, rotate: 0, x: 0 });
      led1Ctrl.set({ opacity: 0.4 }); led2Ctrl.set({ opacity: 0.4 });
      led3Ctrl.set({ opacity: 0.4 }); led4Ctrl.set({ opacity: 0.4 });

      // Top rack rises up + tilts + slides right
      topCtrl.start({
        y: -3.5, rotate: -6, x: 1.5,
        transition: { duration: 0.5, ease: bouncy },
      });
      // Bottom rack drops + tilts opposite + slides left
      botCtrl.start({
        y: 3.5, rotate: 6, x: -1.5,
        transition: { duration: 0.5, ease: bouncy, delay: 0.06 },
      });

      // LEDs brighten as cabinet opens
      timerRef.current = setTimeout(() => {
        led1Ctrl.start({ opacity: 1, transition: { duration: 0.15 } });
        led2Ctrl.start({ opacity: 1, transition: { duration: 0.15, delay: 0.06 } });
      }, 250);
      setTimeout(() => {
        led3Ctrl.start({ opacity: 1, transition: { duration: 0.15 } });
        led4Ctrl.start({ opacity: 1, transition: { duration: 0.15, delay: 0.06 } });
      }, 350);

      setTimeout(() => {
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
      {/* Top rack — rises and tilts */}
      <motion.g animate={topCtrl} style={{ transformOrigin: "12px 7px" }}>
        <rect width="20" height="8" x="2" y="3" rx="1.5"
          fill="var(--color-bg-soft, var(--color-surface))" />
        <motion.circle animate={led1Ctrl} cx="6" cy="7" r="0.75"
          fill="currentColor" stroke="none" style={{ opacity: 0.4 }} />
        <motion.circle animate={led2Ctrl} cx="9.5" cy="7" r="0.75"
          fill="currentColor" stroke="none" style={{ opacity: 0.4 }} />
        <line x1="15" y1="7" x2="18" y2="7" />
      </motion.g>

      {/* Bottom rack — drops and tilts opposite */}
      <motion.g animate={botCtrl} style={{ transformOrigin: "12px 17px" }}>
        <rect width="20" height="8" x="2" y="13" rx="1.5"
          fill="var(--color-bg-soft, var(--color-surface))" />
        <motion.circle animate={led3Ctrl} cx="6" cy="17" r="0.75"
          fill="currentColor" stroke="none" style={{ opacity: 0.4 }} />
        <motion.circle animate={led4Ctrl} cx="9.5" cy="17" r="0.75"
          fill="currentColor" stroke="none" style={{ opacity: 0.4 }} />
        <line x1="15" y1="17" x2="18" y2="17" />
      </motion.g>
    </svg>
  );
}
