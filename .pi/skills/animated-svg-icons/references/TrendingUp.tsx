import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { IconProps, bouncy } from "./shared";

export function AnimatedTrendingUp({ trigger, hovered, color }: IconProps) {
  const lineCtrl = useAnimation();
  const arrowCtrl = useAnimation();
  const prevTrigger = useRef(trigger);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Forward animation
  useEffect(() => {
    if (trigger > 0 && trigger !== prevTrigger.current) {
      prevTrigger.current = trigger;
      clearTimeout(timerRef.current);

      const play = async () => {
        lineCtrl.set({ pathLength: 0, opacity: 1 });
        arrowCtrl.set({ scale: 0, opacity: 0, x: 0, y: 0 });

        await lineCtrl.start({
          pathLength: 1,
          transition: { duration: 0.35, ease: "linear" },
        });
        await arrowCtrl.start({
          scale: 1,
          opacity: 1,
          transition: { duration: 0.25, ease: bouncy },
        });
      };

      if (hovered) {
        play();
      } else {
        timerRef.current = setTimeout(play, 800);
      }
    }
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unhover: arrow extends slightly up-right then returns
  useEffect(() => {
    if (!hovered && prevTrigger.current > 0) {
      arrowCtrl.start({
        x: [0, 2, 0],
        y: [0, -2, 0],
        transition: { duration: 0.4, ease: bouncy },
      });
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
      style={{ overflow: "visible" }}
    >
      <motion.path
        animate={lineCtrl}
        d="M2 17l6.5-6.5 5 5L22 7"
        initial={{ pathLength: 0, opacity: 0 }}
      />
      <motion.path
        animate={arrowCtrl}
        d="M16 7h6v6"
        initial={{ scale: 0, opacity: 0 }}
        style={{ transformOrigin: "19px 7px" }}
      />
    </svg>
  );
}
