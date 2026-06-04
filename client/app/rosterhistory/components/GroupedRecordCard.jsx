"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  EVENT_COLORS,
  EVENT_DOT_COLORS,
  formatRecordType,
} from "../lib/constants";

export function GroupedRecordCard({
  profileName,
  rankImageUrl,
  rankShort,
  records,
}) {
  const [open, setOpen] = useState(false);
  const colorClass = EVENT_COLORS["NEW_RECORD"];
  const accentColor = EVENT_DOT_COLORS["NEW_RECORD"];

  const typeCounts = records.reduce((acc, r) => {
    const label = formatRecordType(r.new_value ?? "");
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  const typeSummary = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, n]) => (n > 1 ? `${n}× ${label}` : label))
    .join(", ");

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
        className="flex cursor-pointer items-center gap-3 pl-4 pr-3 py-2.5"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Rank insignia with dark backing */}
        <div className="w-8 h-7 shrink-0 flex items-center justify-center rounded bg-black/25">
          {rankImageUrl ? (
            <img
              src={rankImageUrl}
              alt={rankShort}
              title={rankShort}
              className="h-5 w-7 object-contain"
            />
          ) : (
            <span className="text-[10px] font-mono opacity-40 leading-none">
              {rankShort}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-semibold">{profileName}</span>
          <Badge
            variant="outline"
            className="text-xs opacity-70 border-current bg-transparent"
          >
            {records.length} New Record{records.length !== 1 ? "s" : ""}
          </Badge>
          <span className="opacity-50 text-xs">{typeSummary}</span>
        </div>

        <span className="shrink-0 opacity-40">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </div>

      {open && (
        <>
          <Separator className="bg-current opacity-10" />
          <div className="divide-y divide-current/10">
            {records.map((r, i) => (
              <div key={i} className="pl-[3.25rem] pr-3 py-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-medium text-xs opacity-90">
                    {formatRecordType(r.new_value ?? "")}
                  </span>
                  {r.record_date && (
                    <span className="text-xs opacity-40 tabular-nums">
                      {r.record_date}
                    </span>
                  )}
                </div>
                {r.detail && (
                  <p className="text-xs opacity-60 mt-0.5 leading-relaxed">
                    {r.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
