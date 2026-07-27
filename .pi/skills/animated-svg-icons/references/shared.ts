import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState, useId } from "react";

// Shared helper to avoid dependency on global imports when sharing
export function cn(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(" ");
}

// Interfaces used by components
export interface Props {
  hovered: boolean;
}

export interface IconProps {
  trigger: number;
  hovered: boolean;
  color: string;
}

// Module-level constants referenced by components
export const EXPO = [0.16, 1, 0.3, 1] as const;
export const BOUNCY = [0.34, 1.56, 0.64, 1] as const;
export const bouncy = BOUNCY;
export const cls = "h-[18px] w-[18px] text-[var(--color-fg)]";
export const ICON_OPACITY = 0.62;
export const CAP_ICON_OPACITY = 0.72;
export const SVG_BASE =
  "h-5 w-5 [stroke:currentColor] [stroke-width:1.8] [stroke-linecap:round] [stroke-linejoin:round] [fill:none]";

export const SPACING = 6;
export const NUM_LINES = 6;
export const CENTER = 12;

export const BRAIN_RIGHT_PATHS = [
  "M17.598 6.5A3 3 0 1 0 12 5",
  "M15 13a4.17 4.17 0 0 1-3-4",
  "M19.967 17.483A4 4 0 1 1 12 18",
  "M17.997 5.125a4 4 0 0 1 2.526 5.77",
  "M18 18a4 4 0 0 0 2-7.464",
  "M12 18V5",
];

export const BRAIN_LEFT_PATHS = [
  "M12 5a3 3 0 1 0-5.598 1.5",
  "M12 9a4.17 4.17 0 0 1-3 4",
  "M12 18a4 4 0 1 1-7.967-.517",
  "M6.003 5.125a4 4 0 0 0-2.526 5.77",
  "M6 18a4 4 0 0 1-2-7.464",
  "M12 18V5",
];
