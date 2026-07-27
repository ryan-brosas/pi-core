import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { IconProps, bouncy } from "./shared";

export function AnimatedLayers({ trigger, hovered, color }: IconProps) {
  const topCtrl = useAnimation();
  const midCtrl = useAnimation();
  const botCtrl = useAnimation();
  const prevTrigger = useRef(trigger);
  const crushedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const liftTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(liftTimerRef.current), []);

  // Forward: crush down on trigger
  useEffect(() => {
    if (trigger > 0 && trigger !== prevTrigger.current) {
      prevTrigger.current = trigger;
      clearTimeout(timerRef.current);
      clearTimeout(liftTimerRef.current);

      const crush = () => {
        topCtrl.set({ y: 0 });
        midCtrl.set({ opacity: 1, y: 0 });
        botCtrl.set({ opacity: 1, y: 0 });

        topCtrl.start({ y: 10, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } });
        midCtrl.start({ opacity: 0, y: 3, transition: { duration: 0.25, ease: "easeOut" } });
        botCtrl.start({ opacity: 0, y: 2, transition: { duration: 0.2, ease: "easeOut" } });

        if (hovered) {
          // On hover: stay crushed, reverse will play on unhover
          crushedRef.current = true;
        } else {
          // On activation: play full cycle — lift back after hold
          liftTimerRef.current = setTimeout(() => {
            topCtrl.start({ y: 0, transition: { duration: 0.4, ease: bouncy } });
            midCtrl.start({ opacity: 1, y: 0, transition: { duration: 0.35, ease: bouncy, delay: 0.1 } });
            botCtrl.start({ opacity: 1, y: 0, transition: { duration: 0.35, ease: bouncy, delay: 0.18 } });
          }, 470);
        }
      };

      if (hovered) {
        crush();
      } else {
        timerRef.current = setTimeout(crush, 800);
      }
    }
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reverse: lift on unhover
  useEffect(() => {
    if (!hovered && crushedRef.current) {
      crushedRef.current = false;
      topCtrl.start({ y: 0, transition: { duration: 0.4, ease: bouncy } });
      midCtrl.start({ opacity: 1, y: 0, transition: { duration: 0.35, ease: bouncy, delay: 0.1 } });
      botCtrl.start({ opacity: 1, y: 0, transition: { duration: 0.35, ease: bouncy, delay: 0.18 } });
    }
  }, [hovered]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        animate={botCtrl}
        d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"
        initial={{ opacity: 1, y: 0 }}
      />
      <motion.path
        animate={midCtrl}
        d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"
        initial={{ opacity: 1, y: 0 }}
      />
      <motion.path
        animate={topCtrl}
        d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"
        initial={{ y: 0 }}
      />
    </svg>
  );
}
