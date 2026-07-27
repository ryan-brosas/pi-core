import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";
import { cls, ICON_OPACITY } from "./shared";

export function AnimatedTimer({ hovered }: { hovered: boolean }) {
  const handRef = useRef<SVGGElement>(null);
  const bodyCtrl = useAnimation();
  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);
  const returnRafRef = useRef(0);

  const spinBack = () => {
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / 400, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const angle = 360 * (1 - eased);
      handRef.current?.setAttribute('transform', `rotate(${angle}, 12, 14)`);
      if (progress < 1) returnRafRef.current = requestAnimationFrame(tick);
    }
    returnRafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(returnRafRef.current), []);

  useEffect(() => {
    if (hovered) {
      cancelAnimationFrame(returnRafRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;

      const start = performance.now();
      let raf: number;
      function tick(now: number) {
        const progress = Math.min((now - start) / 600, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const angle = eased * 360;
        handRef.current?.setAttribute('transform', `rotate(${angle}, 12, 14)`);
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          bodyCtrl.start({
            rotate: [0, -14, 14, -14, 14, -10, 10, -6, 6, 0],
            transition: { duration: 0.4, ease: "easeInOut" },
          }).then(() => {
            playingRef.current = false;
          });
        }
      }
      raf = requestAnimationFrame(tick);
    } else {
      if (playingRef.current) {
        pendingReturnRef.current = true;
      } else {
        spinBack();
      }
    }
  }, [hovered, bodyCtrl]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div animate={bodyCtrl} style={{ originX: "50%", originY: "50%" }}>
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
        <line x1="10" x2="14" y1="2" y2="2" />
        <line x1="12" x2="12" y1="2" y2="6" />
        <circle cx="12" cy="14" r="8" />
        <g ref={handRef}>
          <line x1="12" y1="14" x2="12" y2="10" />
        </g>
      </svg>
    </motion.div>
  );
}
