'use client'

import { useState, useMemo } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import { Download, Search, X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDiffList, useDiffRange, useDiffByDate, useRanks } from '../lib/api'
import { DiffEventCard } from './DiffEventCard'
import { GroupedRecordCard } from './GroupedRecordCard'
import { SummaryBar } from './SummaryBar'
import { MemberTimeline } from './MemberTimeline'
import { ALL_EVENT_TYPES } from '../lib/constants'
import { groupAndSortEvents } from '../lib/groupEvents'
import { exportEventsCsv } from '../lib/csvExport'

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

export function HistoryView() {
  const { data: summaries } = useDiffList()
  const [activeFilters, setActiveFilters] = useState(new Set(ALL_EVENT_TYPES))
  const [excludedRecordTypes, setExcludedRecordTypes] = useState(new Set())
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)
  const { data: ranksData } = useRanks()

  const to = format(new Date(), 'yyyy-MM-dd')
  const from = format(subDays(new Date(), 89), 'yyyy-MM-dd')
  const { data: rangeData, isLoading: rangeLoading } = useDiffRange(from, to, true)
  const { data: dayData, isLoading: dayLoading } = useDiffByDate(selectedDay)

  const rankOrder = useMemo(() => {
    const m = new Map()
    for (const r of ranksData?.ranks ?? []) m.set(r.rankShort, r.rankDisplayOrder)
    return m
  }, [ranksData])

  // Switch data source based on whether a day is drilled into
  const activeData = selectedDay ? dayData : rangeData
  const isLoading = selectedDay ? dayLoading : rangeLoading

  const typeFilteredEvents = useMemo(
    () => (activeData?.events ?? []).filter((e) => {
      if (!activeFilters.has(e.event_type)) return false
      if (e.event_type === 'NEW_RECORD' && excludedRecordTypes.has(e.new_value)) return false
      return true
    }),
    [activeData, activeFilters, excludedRecordTypes]
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
  const maxCount = useMemo(() => Math.max(1, ...(summaries ?? []).map(totalCount)), [summaries])

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

  function handleDotClick(s) {
    const date = format(parseISO(s.fetched_at), 'yyyy-MM-dd')
    // Toggle off if already selected, otherwise drill in
    setSelectedDay((prev) => (prev === date ? null : date))
    setMemberSearch('')
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
                90-day history
              </Button>
            </div>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {selectedDay ? format(parseISO(selectedDay), 'MMMM d, yyyy') : 'Change History'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {selectedDay ? 'Daily snapshot — click the highlighted square to deselect' : 'Last 90 days'}
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
      {summaries?.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Activity — click a day to drill down
          </p>
          <div className="flex flex-wrap gap-1">
            {summaries.slice(0, 90).map((s) => {
              const count = totalCount(s)
              const date = format(parseISO(s.fetched_at), 'yyyy-MM-dd')
              const dateLabel = format(parseISO(s.fetched_at), 'MMM d, yyyy')
              const isSelected = date === selectedDay
              return (
                <button
                  key={s.snapshot_id}
                  title={`${dateLabel}: ${count} change${count !== 1 ? 's' : ''}`}
                  onClick={() => handleDotClick(s)}
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
          {activeData?.counts && (
            <SummaryBar counts={activeData.counts} activeFilters={activeFilters} onToggle={toggleFilter} recordTypeCounts={recordTypeCounts} excludedRecordTypes={excludedRecordTypes} onToggleRecordType={toggleRecordType} />
          )}

          {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}

          {!isLoading && totalVisible === 0 && (
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
          {selectedDay ? '.' : ' in the last 90 days.'}
        </div>
      )}
    </div>
  )
}
