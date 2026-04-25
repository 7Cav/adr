'use client'

import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { RefreshCw, Download, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDiffList, useDiffByDate, useTriggerSnapshot, useRanks } from '../lib/api'
import { SummaryBar } from './SummaryBar'
import { DiffEventCard } from './DiffEventCard'
import { GroupedRecordCard } from './GroupedRecordCard'
import { MemberTimeline } from './MemberTimeline'
import { ALL_EVENT_TYPES } from '../lib/constants'
import { groupAndSortEvents } from '../lib/groupEvents'
import { exportEventsCsv } from '../lib/csvExport'

export function TodayView() {
  const [activeFilters, setActiveFilters] = useState(new Set(ALL_EVENT_TYPES))
  const [excludedRecordTypes, setExcludedRecordTypes] = useState(new Set())
  const [memberSearch, setMemberSearch] = useState('')
  const trigger = useTriggerSnapshot()

  const { data: summaries, isLoading: listLoading } = useDiffList()
  const { data: ranksData } = useRanks()

  const rankOrder = useMemo(() => {
    const m = new Map()
    for (const r of ranksData?.ranks ?? []) m.set(r.rankShort, r.rankDisplayOrder)
    return m
  }, [ranksData])

  // Always show the latest snapshot
  const effectiveDate = summaries?.length > 0
    ? format(parseISO(summaries[0].fetched_at), 'yyyy-MM-dd')
    : null

  const { data: diff, isLoading: diffLoading } = useDiffByDate(effectiveDate)

  const typeFilteredEvents = useMemo(
    () => (diff?.events ?? []).filter((e) => {
      if (!activeFilters.has(e.event_type)) return false
      if (e.event_type === 'NEW_RECORD' && excludedRecordTypes.has(e.new_value)) return false
      return true
    }),
    [diff, activeFilters, excludedRecordTypes]
  )

  const recordTypeCounts = useMemo(() => {
    const counts = {}
    for (const e of diff?.events ?? []) {
      if (e.event_type === 'NEW_RECORD' && e.new_value)
        counts[e.new_value] = (counts[e.new_value] ?? 0) + 1
    }
    return counts
  }, [diff])

  const searchTerm = memberSearch.trim().toLowerCase()
  const matchedProfile = useMemo(() => {
    if (!searchTerm) return null
    const hits = (diff?.events ?? []).filter((e) => e.profile_name.toLowerCase().includes(searchTerm))
    if (!hits.length) return null
    const freq = new Map()
    for (const e of hits) freq.set(e.profile_id, (freq.get(e.profile_id) ?? 0) + 1)
    const topId = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0]
    return hits.filter((e) => e.profile_id === topId)
  }, [diff, searchTerm])

  const matchedProfileName = matchedProfile?.[0]?.profile_name ?? ''

  const { notable, recordGroups } = useMemo(
    () => matchedProfile ? { notable: [], recordGroups: [] } : groupAndSortEvents(typeFilteredEvents, rankOrder),
    [typeFilteredEvents, rankOrder, matchedProfile]
  )

  const totalVisible = notable.length + recordGroups.reduce((n, g) => n + g.records.length, 0)

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

  function handleExport() {
    exportEventsCsv(matchedProfile ?? typeFilteredEvents, `milpacs-${effectiveDate ?? 'export'}.csv`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Roster Changes</h1>
          {effectiveDate && (
            <p className="text-muted-foreground text-sm mt-1">
              {format(parseISO(effectiveDate), 'MMMM d, yyyy')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => trigger.mutate()}
            disabled={trigger.isPending}
          >
            <RefreshCw size={14} className={cn(trigger.isPending && 'animate-spin')} />
            {trigger.isPending ? 'Fetching…' : 'Fetch Now'}
          </Button>

          {diff?.events?.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport} title="Export as CSV">
              <Download size={14} />
              CSV
            </Button>
          )}
        </div>
      </div>

      {/* Member search */}
      {diff?.events?.length > 0 && (
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

      {/* Member timeline */}
      {matchedProfile && (
        <MemberTimeline profileName={matchedProfileName} events={matchedProfile} onClear={() => setMemberSearch('')} />
      )}

      {/* Normal view */}
      {!matchedProfile && (
        <>
          {diff?.counts && (
            <SummaryBar counts={diff.counts} activeFilters={activeFilters} onToggle={toggleFilter} recordTypeCounts={recordTypeCounts} excludedRecordTypes={excludedRecordTypes} onToggleRecordType={toggleRecordType} />
          )}

          {(listLoading || diffLoading) && <p className="text-muted-foreground text-sm">Loading…</p>}

          {!listLoading && summaries?.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p className="font-medium">No snapshots yet</p>
              <p className="text-sm mt-1">Click "Fetch Now" to pull the first roster snapshot.</p>
            </div>
          )}

          {diff && totalVisible === 0 && diff.events.length > 0 && (
            <p className="text-muted-foreground text-sm">All event types filtered out.</p>
          )}

          {diff?.events?.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
              <p>No changes recorded for this date.</p>
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

      {searchTerm && !matchedProfile && diff && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
          No members found matching <span className="font-medium">"{memberSearch}"</span>.
        </div>
      )}
    </div>
  )
}
