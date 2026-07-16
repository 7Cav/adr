"use client";

import { useMemo } from "react";
import { ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { parseUnit } from "../lib/parseUnit";

const LINE_BATTALION_ORDER = ["1-7", "2-7", "3-7", "ACD", "DEVCOM"];

function UnitChip({ label, active, onClick, onClear }) {
  return (
    <Button
      variant={active ? "outline" : "ghost"}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 text-xs gap-1",
        active
          ? "bg-[#ebc729] text-black border-[#ebc729] hover:bg-[#ebc729]/90 hover:text-black font-semibold"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {active && onClear && (
        <span
          className="pointer-events-auto opacity-60 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          <X size={10} />
        </span>
      )}
    </Button>
  );
}

export function UnitFilterBar({
  events,
  unitFilter,
  onSelect,
  onClear,
  preUnitFilteredCount,
}) {
  const unitMap = useMemo(() => {
    const battalions = new Map();

    for (const e of events) {
      const u = parseUnit(e.position_title || "");
      if (!u) continue;

      if (!battalions.has(u.battalion)) {
        battalions.set(u.battalion, {
          companies: new Set(),
          platoons: new Map(),
        });
      }
      const bn = battalions.get(u.battalion);

      const co = u.company ?? "HQ";
      bn.companies.add(co);

      if (u.company && u.platoon) {
        if (!bn.platoons.has(u.company)) bn.platoons.set(u.company, new Set());
        bn.platoons.get(u.company).add(u.platoon);
      }
    }

    return battalions;
  }, [events]);

  const hasActiveFilter = Boolean(unitFilter.battalion);

  if (unitMap.size === 0) {
    // No units in view. If a unit filter is active, no events in the current
    // data match it — explain that instead of silently disappearing.
    if (!hasActiveFilter) return null;

    // Only blame the unit filter when it is genuinely the cause: if the
    // events were already empty before the unit predicate was applied
    // (e.g. all event types toggled off), the parent's generic message is
    // the accurate one — render nothing here so it can show.
    if (preUnitFilteredCount === 0) return null;

    const filterLabel = [
      unitFilter.battalion,
      unitFilter.company &&
        (unitFilter.company === "HQ" ? "HQ" : `Co. ${unitFilter.company}`),
      unitFilter.platoon && `Plt. ${unitFilter.platoon}`,
    ]
      .filter(Boolean)
      .join(" · ");

    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
        <p className="text-sm">
          No recorded changes for{" "}
          <span className="font-medium text-foreground">{filterLabel}</span> in
          the current view.
        </p>
        <p className="text-xs mt-1 text-muted-foreground/70">
          Only units with recorded changes in the current view are listed.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => onClear("battalion")}
        >
          <X size={12} />
          Clear unit filter
        </Button>
      </div>
    );
  }

  const sortedBattalions = [...unitMap.keys()].sort((a, b) => {
    const ai = LINE_BATTALION_ORDER.indexOf(a);
    const bi = LINE_BATTALION_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  const selectedBn = unitFilter.battalion;
  const selectedCo = unitFilter.company;
  const selectedPl = unitFilter.platoon;
  const bnData = selectedBn ? unitMap.get(selectedBn) : null;

  const companies = bnData
    ? [...bnData.companies].sort((a, b) => {
        if (a === "HQ") return 1;
        if (b === "HQ") return -1;
        return a.localeCompare(b);
      })
    : [];

  const platoons =
    bnData && selectedCo && selectedCo !== "HQ"
      ? [...(bnData.platoons.get(selectedCo) ?? [])].sort(
          (a, b) => Number(a) - Number(b),
        )
      : [];

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 space-y-2">
      {/* Level 1 — Battalions */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-1">
          Unit
        </span>
        <Separator orientation="vertical" className="h-4 mx-1" />
        {sortedBattalions.map((bn) => (
          <UnitChip
            key={bn}
            label={bn}
            active={selectedBn === bn}
            onClick={() => onSelect("battalion", bn)}
            onClear={selectedBn === bn ? () => onClear("battalion") : undefined}
          />
        ))}
      </div>

      {/* Level 2 — Companies */}
      {selectedBn && companies.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-muted-foreground/60 mr-1 flex items-center gap-0.5">
              <ChevronRight size={12} />
              Company
            </span>
            <Separator orientation="vertical" className="h-4 mx-1" />
            {companies.map((co) => (
              <UnitChip
                key={co}
                label={co === "HQ" ? "HQ" : `Co. ${co}`}
                active={selectedCo === co}
                onClick={() => onSelect("company", co)}
                onClear={
                  selectedCo === co ? () => onClear("company") : undefined
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Level 3 — Platoons */}
      {selectedCo && selectedCo !== "HQ" && platoons.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-muted-foreground/60 mr-1 flex items-center gap-0.5">
              <ChevronRight size={12} />
              Platoon
            </span>
            <Separator orientation="vertical" className="h-4 mx-1" />
            {platoons.map((pl) => (
              <UnitChip
                key={pl}
                label={`Plt. ${pl}`}
                active={selectedPl === pl}
                onClick={() => onSelect("platoon", pl)}
                onClear={
                  selectedPl === pl ? () => onClear("platoon") : undefined
                }
              />
            ))}
          </div>
        </>
      )}

      <p className="text-[11px] text-muted-foreground/60">
        Only units with recorded changes in the current view are listed.
      </p>
    </div>
  );
}
