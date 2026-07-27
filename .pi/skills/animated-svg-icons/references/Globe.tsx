import { useEffect, useRef, useState, useId } from "react";
import { cls, ICON_OPACITY, SPACING, NUM_LINES, CENTER } from "./shared";

export function AnimatedGlobe({ hovered }: { hovered: boolean }) {
  const id = useId();
  const [offset, setOffset] = useState(0);
  const [squish, setSquish] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef({ time: 0, offset: 0 });
  const playingRef = useRef(false);
  const pendingReturnRef = useRef(false);

  const animateReturn = (from: number) => {
    startRef.current = { time: performance.now(), offset: from };
    function tickBack(now: number) {
      const elapsed = now - startRef.current.time;
      const progress = Math.min(elapsed / 400, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setOffset(startRef.current.offset * (1 - eased));
      setSquish(0);
      if (progress < 1) rafRef.current = requestAnimationFrame(tickBack);
    }
    rafRef.current = requestAnimationFrame(tickBack);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    if (hovered) {
      cancelAnimationFrame(rafRef.current);
      playingRef.current = true;
      pendingReturnRef.current = false;
      startRef.current = { time: performance.now(), offset };

      function tick(now: number) {
        const elapsed = now - startRef.current.time;
        const progress = Math.min(elapsed / 700, 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const newOffset = startRef.current.offset + eased * 18;
        setOffset(newOffset);
        const velocity = progress < 0.5 ? 4 * progress : 4 * (1 - progress);
        setSquish(velocity);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setSquish(0);
          playingRef.current = false;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (playingRef.current) {
        pendingReturnRef.current = true;
      } else {
        animateReturn(offset);
      }
    }
  }, [hovered]); // eslint-disable-line react-hooks/exhaustive-deps

  const equatorXs: number[] = [];
  for (let i = 0; i < NUM_LINES; i++) {
    let eqX = 6 + i * SPACING - offset;
    const WRAP_LO = -4;
    const WRAP_SPAN = NUM_LINES * SPACING;
    while (eqX < WRAP_LO) eqX += WRAP_SPAN;
    while (eqX > WRAP_LO + WRAP_SPAN) eqX -= WRAP_SPAN;
    equatorXs.push(eqX);
  }

  const squishAmount = 0.08;
  const sx = 1 + squish * squishAmount;
  const sy = 1 - squish * squishAmount;

  return (
    <div style={{ transform: `scaleX(${sx}) scaleY(${sy})`, transition: 'transform 50ms' }}>
    <svg
      className={cls}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: ICON_OPACITY }}
    >
      <defs>
        <clipPath id={id}>
          <circle cx="12" cy="12" r="9.8" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <g clipPath={`url(#${id})`}>
        {equatorXs
          .filter((eqX) => eqX >= 1 && eqX <= 23)
          .map((eqX, i) => {
          const controlX = CENTER + (eqX - CENTER) * 2;
          return Math.abs(eqX - CENTER) < 0.3 ? (
            <line key={i} x1={12} y1={2} x2={12} y2={22} />
          ) : (
            <path
              key={i}
              d={`M 12,2 Q ${controlX},12 12,22`}
            />
          );
        })}
      </g>
    </svg>
    </div>
  );
}
