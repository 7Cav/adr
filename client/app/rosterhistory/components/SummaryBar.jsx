"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  EVENT_COLORS,
  EVENT_DOT_COLORS,
  EVENT_LABELS,
  ALL_EVENT_TYPES,
  formatRecordType,
} from "../lib/constants";

export function SummaryBar({
  counts,
  activeFilters,
  onToggle,
  recordTypeCounts,
  excludedRecordTypes = new Set(),
  onToggleRecordType,
}) {
  const [recordsExpanded, setRecordsExpanded] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_EVENT_TYPES.map((type) => {
        const count = counts[type] ?? 0;
        if (count === 0) return null;
        const active = activeFilters.has(type);

        if (
          type === "NEW_RECORD" &&
          recordTypeCounts &&
          Object.keys(recordTypeCounts).length > 0
        ) {
          const breakdown = Object.entries(recordTypeCounts).sort(
            (a, b) => b[1] - a[1],
          );
          return (
            <div key={type} className="flex flex-wrap gap-1.5 items-center">
              <button
                onClick={() => onToggle(type)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setRecordsExpanded((v) => !v);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-opacity",
                  EVENT_COLORS[type],
                  !active && "opacity-40",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    EVENT_DOT_COLORS[type],
                  )}
                />
                <span className="font-bold tabular-nums">{count}</span>
                <span>
                  {EVENT_LABELS[type]}
                  {count !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecordsExpanded((v) => !v);
                  }}
                  className="ml-0.5 opacity-60 hover:opacity-100 text-xs leading-none"
                  title={
                    recordsExpanded ? "Collapse breakdown" : "Expand breakdown"
                  }
                >
                  {recordsExpanded ? "▲" : "▼"}
                </button>
              </button>
              {recordsExpanded &&
                breakdown.map(([rawType, n]) => {
                  const subActive = active && !excludedRecordTypes.has(rawType);
                  return (
                    <button
                      key={rawType}
                      onClick={() => onToggleRecordType?.(rawType)}
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity",
                        EVENT_COLORS[type],
                        !subActive && "opacity-40",
                      )}
                    >
                      <span>{n}</span>
                      <span className="opacity-80">
                        {formatRecordType(rawType)}
                        {n !== 1 ? "s" : ""}
                      </span>
                    </button>
                  );
                })}
            </div>
          );
        }

        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-opacity",
              EVENT_COLORS[type],
              !active && "opacity-40",
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", EVENT_DOT_COLORS[type])}
            />
            <span className="font-bold tabular-nums">{count}</span>
            <span>
              {EVENT_LABELS[type]}
              {count !== 1 ? "s" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
