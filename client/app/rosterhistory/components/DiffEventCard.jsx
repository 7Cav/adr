"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  EVENT_COLORS,
  EVENT_DOT_COLORS,
  EVENT_LABELS,
  ROSTER_TYPE_COLORS,
  ROSTER_TYPE_LABELS,
  formatRecordType,
} from "../lib/constants";

export function DiffEventCard({ event }) {
  const [open, setOpen] = useState(false);
  const colorClass = EVENT_COLORS[event.event_type];
  const accentColor = EVENT_DOT_COLORS[event.event_type];
  const hasDetail = !!event.detail;

  return (
    <div
      className={cn(
        "relative rounded-lg border overflow-hidden text-sm transition-all duration-150 hover:translate-x-0.5 hover:shadow-md",
        colorClass,
      )}
    >
      {/* Left accent bar */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 w-[3px]", accentColor)}
      />

      <div
        className={cn(
          "flex items-center gap-3 pl-4 pr-3 py-2.5",
          hasDetail && "cursor-pointer",
        )}
        onClick={() => hasDetail && setOpen((o) => !o)}
      >
        {/* Rank insignia with dark backing */}
        <div className="w-8 h-7 shrink-0 flex items-center justify-center rounded bg-black/25">
          {event.rank_image_url ? (
            <img
              src={event.rank_image_url}
              alt={event.rank_short}
              title={event.rank_short}
              className="h-5 w-7 object-contain"
            />
          ) : (
            <span className="text-[10px] font-mono opacity-40 leading-none">
              {event.rank_short}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-semibold">{event.profile_name}</span>

          <Badge
            variant="outline"
            className="text-xs opacity-70 border-current bg-transparent"
          >
            {EVENT_LABELS[event.event_type]}
          </Badge>

          {event.roster_type && event.roster_type !== "ROSTER_TYPE_COMBAT" && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs border-current bg-transparent",
                ROSTER_TYPE_COLORS[event.roster_type],
              )}
            >
              {ROSTER_TYPE_LABELS[event.roster_type]}
            </Badge>
          )}

          {event.event_type === "PROMOTION" && (
            <span className="opacity-90 text-xs font-mono">
              {event.old_value} → {event.new_value}
            </span>
          )}
          {[
            "ROSTER_TRANSFER",
            "RETURN_TO_ACTIVE",
            "TRANSFER_RESERVE",
            "TRANSFER_ELOA",
            "WALL_OF_HONOR_INDUCTION",
          ].includes(event.event_type) && (
            <span className="opacity-90 text-xs">
              {event.old_value} → {event.new_value}
            </span>
          )}
          {event.event_type === "DISCHARGE" && event.old_value && (
            <span className="opacity-90 text-xs">from {event.old_value}</span>
          )}
          {event.event_type === "FALLEN" && event.old_value && (
            <span className="opacity-70 text-xs italic">
              formerly {event.old_value}
            </span>
          )}
          {event.event_type === "NEW_RECORD" && event.new_value && (
            <span className="opacity-70 text-xs font-medium">
              {formatRecordType(event.new_value)}
            </span>
          )}
          {event.event_type === "NEW_AWARD" && event.new_value && (
            <span className="opacity-90 text-xs">{event.new_value}</span>
          )}
          {event.event_type === "POSITION_CHANGE" && (
            <span className="opacity-80 text-xs">
              {event.old_value} → {event.new_value}
            </span>
          )}
          {event.event_type === "NAME_CHANGE" && (
            <span className="opacity-80 text-xs">
              {event.old_value} → {event.new_value}
            </span>
          )}
          {event.record_date && (
            <span className="opacity-40 text-xs tabular-nums ml-auto">
              {event.record_date}
            </span>
          )}
        </div>

        {hasDetail && (
          <span className="shrink-0 opacity-40">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
      </div>

      {open && hasDetail && (
        <p className="pb-2.5 pl-13 pr-3 text-xs opacity-70 leading-relaxed">
          {event.detail}
        </p>
      )}
    </div>
  );
}
