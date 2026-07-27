import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { Props, BOUNCY, SVG_BASE } from "./shared";

export function AnimatedServer({ hovered }: Props) {
  const top = useAnimation();
  const mid = useAnimation();
  const bot = useAnimation();

  const led1 = useAnimation();
  const led2 = useAnimation();
  const led3 = useAnimation();
  const dataStream = useAnimation();

  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const playReturn = () => {
    top.start({ y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } });
    mid.start({ x: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } });
    bot.start({ y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } });
    led1.start({ opacity: 1, fill: "currentColor", transition: { duration: 0.3 } });
    led2.start({ opacity: 1, fill: "currentColor", transition: { duration: 0.3 } });
    led3.start({ opacity: 1, fill: "currentColor", transition: { duration: 0.3 } });
    dataStream.start({ opacity: 0, strokeDashoffset: 0, transition: { duration: 0.3 } });
  };

  useEffect(() => {
    if (hovered) {
      clearTimeout(timerRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;

      // Snappy exploded view stack projection
      top.start({
        y: -3,
        scale: 0.96,
        transition: { duration: 0.6, ease: BOUNCY }
      });
      mid.start({
        x: 2.2,
        scale: 1.04,
        transition: { duration: 0.65, ease: BOUNCY }
      });
      bot.start({
        y: 3,
        scale: 0.96,
        transition: { duration: 0.6, ease: BOUNCY }
      });

      // Continuous running database query / vector sync streams
      dataStream.start({
        opacity: 0.6,
        strokeDashoffset: [0, -8],
        transition: {
          opacity: { duration: 0.3 },
          strokeDashoffset: { ease: "linear", duration: 0.6, repeat: Infinity }
        }
      });

      // Sequencing blinking lights
      led1.start({
        opacity: [1, 0.2, 1],
        fill: ["currentColor", "#ff7a3d", "currentColor"],
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.4 }
      });
      led2.start({
        opacity: [1, 0.2, 1],
        fill: ["currentColor", "#ff7a3d", "currentColor"],
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.4, delay: 0.15 }
      });
      led3.start({
        opacity: [1, 0.2, 1],
        fill: ["currentColor", "#ff7a3d", "currentColor"],
        transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.4, delay: 0.3 }
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
      {/* Background vertical data streams connecting the stack */}
      <motion.path
        animate={dataStream}
        initial={{ opacity: 0 }}
        d="M9 3v18 M15 3v18"
        stroke="#ff7a3d"
        strokeWidth="1.2"
        strokeDasharray="2,2"
        strokeOpacity="0.8"
        fill="none"
      />

      {/* Top Server unit */}
      <motion.g animate={top} style={{ transformOrigin: "12px 5.5px" }}>
        <rect x="3" y="3" width="18" height="5" rx="1" />
        <motion.circle animate={led1} cx="6" cy="5.5" r="0.8" fill="currentColor" stroke="none" />
        {/* Blade slots details */}
        <path d="M9 5.5h6" strokeWidth="1" strokeDasharray="1.5,1.5" strokeOpacity="0.75" />
        {/* Port */}
        <rect x="17" y="4.5" width="1.5" height="2" rx="0.5" strokeWidth="1" />
      </motion.g>

      {/* Middle Server unit */}
      <motion.g animate={mid} style={{ transformOrigin: "12px 12px" }}>
        <rect x="3" y="9.5" width="18" height="5" rx="1" />
        <motion.circle animate={led2} cx="6" cy="12" r="0.8" fill="currentColor" stroke="none" />
        {/* Blade slots details */}
        <path d="M9 12h6" strokeWidth="1" strokeDasharray="1.5,1.5" strokeOpacity="0.75" />
        {/* Port */}
        <rect x="17" y="11" width="1.5" height="2" rx="0.5" strokeWidth="1" />
      </motion.g>

      {/* Bottom Server unit */}
      <motion.g animate={bot} style={{ transformOrigin: "12px 18.5px" }}>
        <rect x="3" y="16" width="18" height="5" rx="1" />
        <motion.circle animate={led3} cx="6" cy="18.5" r="0.8" fill="currentColor" stroke="none" />
        {/* Blade slots details */}
        <path d="M9 18.5h6" strokeWidth="1" strokeDasharray="1.5,1.5" strokeOpacity="0.75" />
        {/* Port */}
        <rect x="17" y="17.5" width="1.5" height="2" rx="0.5" strokeWidth="1" />
      </motion.g>
    </svg>
  );
}
