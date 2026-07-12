import { clsx } from "clsx";
import { ReactNode } from "react";

const ACCENT_BORDER: Record<"cyan" | "magenta", string> = {
  cyan: "border-cyan",
  magenta: "border-magenta",
};

const ACCENT_GLOW: Record<"cyan" | "magenta", string> = {
  cyan: "group-hover:shadow-glow-cyan",
  magenta: "group-hover:shadow-glow-magenta",
};

/**
 * Wraps any content in four corner brackets, like a targeting/scanner HUD.
 * This is the recurring signature motif across document cards, timeline
 * nodes, and chat bubbles — it reads as "the system is reading this",
 * which ties back to what the product actually does. Brackets extend
 * slightly and the frame glows on hover for a tactile, alive feel.
 */
export function HudFrame({
  children,
  accent = "cyan",
  className,
}: {
  children: ReactNode;
  accent?: "cyan" | "magenta";
  className?: string;
}) {
  const borderColor = ACCENT_BORDER[accent];
  const glow = ACCENT_GLOW[accent];

  return (
    <div
      className={clsx(
        "group relative rounded-sm p-4 transition-all duration-300",
        glow,
        className
      )}
    >
      <span
        className={clsx(
          "absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 transition-all duration-300 group-hover:h-4 group-hover:w-4",
          borderColor
        )}
      />
      <span
        className={clsx(
          "absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 transition-all duration-300 group-hover:h-4 group-hover:w-4",
          borderColor
        )}
      />
      <span
        className={clsx(
          "absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 transition-all duration-300 group-hover:h-4 group-hover:w-4",
          borderColor
        )}
      />
      <span
        className={clsx(
          "absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 transition-all duration-300 group-hover:h-4 group-hover:w-4",
          borderColor
        )}
      />
      {children}
    </div>
  );
}
