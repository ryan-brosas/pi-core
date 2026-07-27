import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { IconProps } from "./shared";

export function AnimatedSearch({ trigger, hovered, color }: IconProps) {
  const ctrl = useAnimation();
  const prevTrigger = useRef(trigger);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (trigger > 0 && trigger !== prevTrigger.current) {
      prevTrigger.current = trigger;
      clearTimeout(timerRef.current);

      const play = () => {
        ctrl.start({
          x: [0, 2, 2, 0, -2, -2, 0],
          y: [0, -1.5, 1, 2, 1, -1.5, 0],
          rotate: [0, -2, 2, 0, -2, 2, 0],
          transition: { duration: 1.6, ease: "easeInOut" },
        });
      };

      if (hovered) {
        play();
      } else {
        timerRef.current = setTimeout(play, 800);
      }
    }
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div animate={ctrl} style={{ transformOrigin: "50% 50%" }}>
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
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.34-4.34" />
      </svg>
    </motion.div>
  );
}
