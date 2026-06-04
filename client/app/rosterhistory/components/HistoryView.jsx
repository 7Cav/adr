'use client'

import { useState, useMemo } from 'react'
import { format, subDays, parseISO, getISOWeek, getISOWeekYear } from 'date-fns'
import { Download, Search, X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDiffList, useDiffRange, useDiffByDate, useRanks } from '../lib/api'
import { DiffEventCard } from './DiffEventCard'
import { GroupedRecordCard } from './GroupedRecordCard'
import { SummaryBar } from './SummaryBar'
import { MemberTimeline } from './MemberTimeline'
import { ALL_EVENT_TYPES, ALL_ROSTER_TYPES } from '../lib/constants'
import { RosterTypeFilterBar } from './RosterTypeFilterBar'
import { UnitFilterBar } from './UnitFilterBar'
import { groupAndSortEvents } from '../lib/groupEvents'
import { exportEventsCsv } from '../lib/csvExport'
import { parseUnit } from '../lib/parseUnit'

const RANGE_PRESETS = [
  { label: '30d',  days: 30 },
  { label: '90d',  days: 90 },
  { label: '6mo',  days: 182 },
  { label: '1yr',  days: 365 },
  { label: 'All',  days: null },
]

function totalCount(s) {
  return Object.values(s.counts).reduce((a, b) => a + b, 0)
}

function heatIntensity(count, max) {
  if (count === 0) return 'bg-muted'
  const ratio = count / max
  if (ratio < 0.2) return 'bg-blue-900/50'
  if (ratio < 0.4) return 'bg-blue-700/60'
  if (ratio < 0.6) return 'bg-blue-600/70'
  if (ratio < 0.8) return 'bg-blue-500/80'
  return 'bg-blue-400'
}

const EMPTY_UNIT_FILTER = { battalion: null, company: null, platoon: null }

export function HistoryView() {
  const { data: summaries } = useDiffList()
  // (error/refetch for the active data source is destructured below)
  const [activeFilters, setActiveFilters] = useState(new Set(ALL_EVENT_TYPES))
  const [excludedRecordTypes, setExcludedRecordTypes] = useState(new Set())
  const [activeRosterTypes, setActiveRosterTypes] = useState(new Set(ALL_ROSTER_TYPES))
  const [unitFilter, setUnitFilter] = useState(EMPTY_UNIT_FILTER)
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedRange, setSelectedRange] = useState(90)
  const { data: ranksData } = useRanks()

  const to = format(new Date(), 'yyyy-MM-dd')
  const from = selectedRange ? format(subDays(new Date(), selectedRange - 1), 'yyyy-MM-dd') : null
  const {
    data: rangeData,
    isLoading: rangeLoading,
    isError: rangeError,
    error: rangeErrorObj,
    refetch: refetchRange,
  } = useDiffRange(from, to, true)
  const {
    data: dayData,
    isLoading: dayLoading,
    isError: dayError,
    error: dayErrorObj,
    refetch: refetchDay,
  } = useDiffByDate(selectedDay)

  const rankOrder = useMemo(() => {
    const m = new Map()
    for (const r of ranksData?.ranks ?? []) m.set(r.rankShort, r.rankDisplayOrder)
    return m
  }, [ranksData])

  // Switch data source based on whether a day is drilled into
  const activeData = selectedDay ? dayData : rangeData
  const isLoading = selectedDay ? dayLoading : rangeLoading
  const isError = selectedDay ? dayError : rangeError
  const activeError = selectedDay ? dayErrorObj : rangeErrorObj
  const refetchActive = selectedDay ? refetchDay : refetchRange

  const presentRosterTypes = useMemo(() => {
    const s = new Set()
    for (const e of activeData?.events ?? []) if (e.roster_type) s.add(e.roster_type)
    return s
  }, [activeData])

  const typeFilteredEvents = useMemo(
    () => (activeData?.events ?? []).filter((e) => {
      if (!activeFilters.has(e.event_type)) return false
      if (e.event_type === 'NEW_RECORD' && excludedRecordTypes.has(e.new_value)) return false
      if (e.roster_type && !activeRosterTypes.has(e.roster_type)) return false
      if (unitFilter.battalion) {
        const u = parseUnit(e.position_title || '')
        if (!u || u.battalion !== unitFilter.battalion) return false
        if (unitFilter.company) {
          const co = u.company ?? 'HQ'
          if (co !== unitFilter.company) return false
        }
        if (unitFilter.platoon && u.platoon !== unitFilter.platoon) return false
      }
      return true
    }),
    [activeData, activeFilters, excludedRecordTypes, activeRosterTypes, unitFilter]
  )

  const recordTypeCounts = useMemo(() => {
    const counts = {}
    for (const e of activeData?.events ?? []) {
      if (e.event_type === 'NEW_RECORD' && e.new_value)
        counts[e.new_value] = (counts[e.new_value] ?? 0) + 1
    }
    return counts
  }, [activeData])

  const searchTerm = memberSearch.trim().toLowerCase()
  const matchedProfile = useMemo(() => {
    if (!searchTerm) return null
    const hits = (activeData?.events ?? []).filter((e) => e.profile_name.toLowerCase().includes(searchTerm))
    if (!hits.length) return null
    const freq = new Map()
    for (const e of hits) freq.set(e.profile_id, (freq.get(e.profile_id) ?? 0) + 1)
    const topId = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0]
    return hits.filter((e) => e.profile_id === topId)
  }, [activeData, searchTerm])

  const matchedProfileName = matchedProfile?.[0]?.profile_name ?? ''

  const { notable, recordGroups } = useMemo(
    () => matchedProfile ? { notable: [], recordGroups: [] } : groupAndSortEvents(typeFilteredEvents, rankOrder),
    [typeFilteredEvents, rankOrder, matchedProfile]
  )

  const totalVisible = notable.length + recordGroups.reduce((n, g) => n + g.records.length, 0)

  // Aggregate snapshots into heatmap buckets. Bucket size scales with range:
  // ≤90d → daily, ≤365d → weekly, >365d or All → monthly
  const heatmapData = useMemo(() => {
    if (!summaries) return []

    const cutoff = selectedRange ? subDays(new Date(), selectedRange - 1) : null

    const byBucket = {}
    for (const s of summaries) {
      const d = parseISO(s.fetched_at)
      if (cutoff && d < cutoff) continue

      let bucketKey, bucketLabel, bucketDate
      if (!selectedRange || selectedRange > 365) {
        bucketKey   = format(d, 'yyyy-MM')
        bucketLabel = format(d, 'MMM yyyy')
        bucketDate  = format(d, 'yyyy-MM-dd')
      } else if (selectedRange > 90) {
        bucketKey   = `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, '0')}`
        bucketLabel = `Week of ${format(d, 'MMM d, yyyy')}`
        bucketDate  = format(d, 'yyyy-MM-dd')
      } else {
        bucketKey   = format(d, 'yyyy-MM-dd')
        bucketLabel = format(d, 'MMM d, yyyy')
        bucketDate  = bucketKey
      }

      if (!byBucket[bucketKey]) {
        byBucket[bucketKey] = { date: bucketDate, bucketKey, label: bucketLabel, fetched_at: s.fetched_at, counts: {} }
      }
      for (const [type, cnt] of Object.entries(s.counts))
        byBucket[bucketKey].counts[type] = (byBucket[bucketKey].counts[type] ?? 0) + cnt
    }

    return Object.values(byBucket).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [summaries, selectedRange])

  const maxCount = useMemo(() => Math.max(1, ...heatmapData.map(totalCount)), [heatmapData])

  function toggleFilter(type) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  function toggleRecordType(rawType) {
    setExcludedRecordTypes((prev) => {
      const next = new Set(prev)
      next.has(rawType) ? next.delete(rawType) : next.add(rawType)
      return next
    })
  }

  function toggleRosterType(rt) {
    setActiveRosterTypes((prev) => {
      const next = new Set(prev)
      next.has(rt) ? next.delete(rt) : next.add(rt)
      return next
    })
  }

  function handleUnitSelect(level, value) {
    setUnitFilter((prev) => ({
      battalion: level === 'battalion' ? value : prev.battalion,
      company:   level === 'company'  ? value : level === 'battalion' ? null : prev.company,
      platoon:   level === 'platoon'  ? value : null,
    }))
  }

  function handleUnitClear(level) {
    setUnitFilter((prev) => ({
      battalion: level === 'battalion' ? null : prev.battalion,
      company:   (level === 'battalion' || level === 'company') ? null : prev.company,
      platoon:   null,
    }))
  }

  function handleDotClick(entry) {
    setSelectedDay((prev) => (prev === entry.date ? null : entry.date))
    setMemberSearch('')
  }

  function handleRangeSelect(days) {
    setSelectedRange(days)
    setSelectedDay(null)
    setMemberSearch('')
    setUnitFilter(EMPTY_UNIT_FILTER)
  }

  function handleBackToRange() {
    setSelectedDay(null)
    setMemberSearch('')
  }

  function handleExport() {
    const suffix = matchedProfile
      ? matchedProfileName.replace(/\s+/g, '-')
      : selectedDay ?? `${from}-to-${to}`
    exportEventsCsv(matchedProfile ?? typeFilteredEvents, `milpacs-${suffix}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {selectedDay ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToRange}
                className="text-muted-foreground hover:text-foreground -ml-2 gap-1"
              >
                <ChevronLeft size={14} />
                History
              </Button>
            </div>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {selectedDay ? format(parseISO(selectedDay), 'MMMM d, yyyy') : 'Change History'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {selectedDay
              ? 'Daily snapshot — click the highlighted square to deselect'
              : selectedRange
                ? `Last ${RANGE_PRESETS.find(p => p.days === selectedRange)?.label ?? selectedRange + 'd'}`
                : 'All time'}
          </p>
        </div>
        {activeData?.events?.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExport} title="Export as CSV">
            <Download size={14} />
            CSV
          </Button>
        )}
      </div>

      {/* Heatmap — always visible */}
      {heatmapData.length > 0 && (
        <div>
          {/* Range preset selector */}
          <div className="flex gap-1 mb-3">
            {RANGE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handleRangeSelect(p.days)}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                  selectedRange === p.days
                    ? 'bg-[#ebc729] text-black'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Activity — click a {!selectedRange || selectedRange > 365 ? 'month' : selectedRange > 90 ? 'week' : 'day'} to drill down
          </p>
          <div className="flex flex-wrap gap-1">
            {heatmapData.map((entry) => {
              const count = totalCount(entry)
              const isSelected = entry.date === selectedDay
              return (
                <button
                  key={entry.date}
                  title={`${entry.label}: ${count} change${count !== 1 ? 's' : ''}`}
                  onClick={() => handleDotClick(entry)}
                  className={cn(
                    'h-4 w-4 rounded-sm transition-transform hover:scale-125 hover:ring-2 hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    heatIntensity(count, maxCount),
                    isSelected && 'ring-2 ring-primary scale-125'
                  )}
                />
              )
            })}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <span>Less</span>
            {['bg-muted', 'bg-blue-900/50', 'bg-blue-700/60', 'bg-blue-500/80', 'bg-blue-400'].map((c) => (
              <span key={c} className={cn('h-3 w-3 rounded-sm inline-block', c)} />
            ))}
            <span>More</span>
          </div>
        </div>
      )}

      {/* Member search */}
      {activeData?.events?.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search member…"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="pl-8 pr-8"
          />
          {memberSearch && (
            <button
              onClick={() => setMemberSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {matchedProfile && (
        <MemberTimeline profileName={matchedProfileName} events={matchedProfile} onClear={() => setMemberSearch('')} />
      )}

      {!matchedProfile && (
        <>
          <RosterTypeFilterBar activeRosterTypes={activeRosterTypes} onToggle={toggleRosterType} presentRosterTypes={presentRosterTypes} />

          <UnitFilterBar
            events={typeFilteredEvents}
            unitFilter={unitFilter}
            onSelect={handleUnitSelect}
            onClear={handleUnitClear}
          />

          {activeData?.counts && (
            <SummaryBar counts={activeData.counts} activeFilters={activeFilters} onToggle={toggleFilter} recordTypeCounts={recordTypeCounts} excludedRecordTypes={excludedRecordTypes} onToggleRecordType={toggleRecordType} />
          )}

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center" role="alert">
              <p className="font-medium text-destructive">Couldn't load change history</p>
              <p className="text-sm mt-1 text-muted-foreground">
                {activeError?.message ?? 'The history service may be unavailable.'}
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchActive()}>
                Retry
              </Button>
            </div>
          )}

          {!isError && isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}

          {!isError && !isLoading && totalVisible === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>No changes {selectedDay ? 'recorded for this date.' : 'in the selected range.'}</p>
            </div>
          )}

          {notable.length > 0 && (
            <div className="space-y-2">
              {notable.map((event, i) => (
                <DiffEventCard key={`${event.profile_id}-${event.event_type}-${i}`} event={event} />
              ))}
            </div>
          )}

          {recordGroups.length > 0 && (
            <div className="space-y-2">
              {notable.length > 0 && (
                <p className="text-xs text-muted-foreground uppercase tracking-wide pt-2">
                  Service Records — {recordGroups.reduce((n, g) => n + g.records.length, 0)} entries across {recordGroups.length} members
                </p>
              )}
              {recordGroups.map((group) => (
                <GroupedRecordCard
                  key={group.profileId}
                  profileName={group.profileName}
                  rankImageUrl={group.records[0]?.rank_image_url}
                  rankShort={group.records[0]?.rank_short}
                  records={group.records}
                />
              ))}
            </div>
          )}
        </>
      )}

      {searchTerm && !matchedProfile && activeData && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
          No members found matching <span className="font-medium">"{memberSearch}"</span>
          {selectedDay ? '.' : ' in the selected range.'}
        </div>
      )}
    </div>
  )
}
