"use client";

import { cn } from "@/lib/utils";
import {
  ALL_ROSTER_TYPES,
  ROSTER_TYPE_LABELS,
  ROSTER_TYPE_COLORS,
} from "../lib/constants";

export function RosterTypeFilterBar({
  activeRosterTypes,
  onToggle,
  presentRosterTypes,
}) {
  const visible = ALL_ROSTER_TYPES.filter((rt) => presentRosterTypes.has(rt));
  if (visible.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((rt) => {
        const active = activeRosterTypes.has(rt);
        return (
          <button
            key={rt}
            onClick={() => onToggle(rt)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity",
              ROSTER_TYPE_COLORS[rt],
              !active && "opacity-40",
            )}
          >
            {ROSTER_TYPE_LABELS[rt]}
          </button>
        );
      })}
    </div>
  );
}
