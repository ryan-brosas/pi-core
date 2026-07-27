import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { IconProps, bouncy } from "./shared";

export function AnimatedCode({ trigger, hovered, color }: IconProps) {
  const leftCtrl = useAnimation();
  const rightCtrl = useAnimation();
  const prevTrigger = useRef(trigger);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Forward animation
  useEffect(() => {
    if (trigger > 0 && trigger !== prevTrigger.current) {
      prevTrigger.current = trigger;
      clearTimeout(timerRef.current);

      const play = async () => {
        leftCtrl.set({ x: 0, rotate: 0 });
        rightCtrl.set({ x: 0, rotate: 0 });

        await Promise.all([
          leftCtrl.start({ x: -2, transition: { duration: 0.15, ease: "easeOut" } }),
          rightCtrl.start({ x: 2, transition: { duration: 0.15, ease: "easeOut" } }),
        ]);
        await Promise.all([
          leftCtrl.start({ x: 14, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
          rightCtrl.start({ x: -14, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
        ]);
        await Promise.all([
          leftCtrl.start({ x: 14, rotate: 180, transition: { duration: 0.3, ease: bouncy } }),
          rightCtrl.start({ x: -14, rotate: 180, transition: { duration: 0.3, ease: bouncy } }),
        ]);
        leftCtrl.set({ x: 0, rotate: 0 });
        rightCtrl.set({ x: 0, rotate: 0 });
      };

      if (hovered) {
        play();
      } else {
        timerRef.current = setTimeout(play, 800);
      }
    }
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unhover: subtle squeeze together then apart
  useEffect(() => {
    if (!hovered && prevTrigger.current > 0) {
      leftCtrl.start({
        x: [0, 1.5, 0],
        transition: { duration: 0.4, ease: bouncy },
      });
      rightCtrl.start({
        x: [0, -1.5, 0],
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
      <motion.path animate={leftCtrl} d="m8 6-6 6 6 6" style={{ transformOrigin: "5px 12px" }} />
      <motion.path animate={rightCtrl} d="m16 18 6-6-6-6" style={{ transformOrigin: "19px 12px" }} />
    </svg>
  );
}
