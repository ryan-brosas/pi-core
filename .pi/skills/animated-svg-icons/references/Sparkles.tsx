import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Props, SVG_BASE } from "./shared";

export function AnimatedSparkles({ hovered }: Props) {
  const a = useAnimation();
  const b = useAnimation();
  const c = useAnimation();

  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const playReturn = () => {
    a.start({ scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } });
    b.start({ scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } });
    c.start({ scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;

      // Sparkles rotate, scale, and twinkle in a circular path
      a.start({
        scale: [1, 1.3, 0.9, 1],
        rotate: [0, 90, 180],
        opacity: [1, 0.7, 1],
        transition: { duration: 0.8, ease: "easeInOut" }
      });
      b.start({
        scale: [1, 1.25, 0.85, 1],
        rotate: [0, -45, -90],
        opacity: [1, 0.6, 1],
        transition: { duration: 0.75, ease: "easeInOut", delay: 0.08 }
      });
      c.start({
        scale: [1, 1.25, 0.85, 1],
        rotate: [0, 45, 90],
        opacity: [1, 0.6, 1],
        transition: { duration: 0.75, ease: "easeInOut", delay: 0.16 }
      });

      timerRef.current = setTimeout(() => {
        playingRef.current = false;
        if (pendingReturnRef.current) {
          pendingReturnRef.current = false;
          playReturn();
        }
      }, 800);
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
      {/* Top Main Sparkle */}
      <motion.path
        animate={a}
        style={{ transformOrigin: "12px 10px" }}
        d="M12 3 13.5 8.5 19 10 13.5 11.5 12 17 10.5 11.5 5 10 10.5 8.5z"
      />

      {/* Bottom Left Sparkle */}
      <motion.path
        animate={b}
        style={{ transformOrigin: "5px 18px" }}
        d="M5 16 5.6 17.4 7 18 5.6 18.6 5 20 4.4 18.6 3 18 4.4 17.4z"
      />

      {/* Bottom Right Sparkle */}
      <motion.path
        animate={c}
        style={{ transformOrigin: "19px 18px" }}
        d="M19 16 19.6 17.4 21 18 19.6 18.6 19 20 18.4 18.6 17 18 18.4 17.4z"
      />
    </svg>
  );
}
