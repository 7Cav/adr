'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { EVENT_COLORS, EVENT_DOT_COLORS, EVENT_LABELS, formatRecordType } from '../lib/constants'

function eventSummary(e) {
  switch (e.event_type) {
    case 'PROMOTION':       return `Promoted ${e.old_value} → ${e.new_value}`
    case 'NEW_MEMBER':      return 'Joined roster'
    case 'DISCHARGE':       return 'Discharged'
    case 'NEW_RECORD':      return formatRecordType(e.new_value ?? '')
    case 'NEW_AWARD':       return e.new_value ?? 'New award'
    case 'POSITION_CHANGE': return `${e.old_value} → ${e.new_value}`
    case 'NAME_CHANGE':     return `${e.old_value} → ${e.new_value}`
    default:                return e.event_type
  }
}

export function MemberTimeline({ profileName, events, onClear }) {
  const byDate = useMemo(() => {
    const map = new Map()
    for (const e of events) {
      const key = e.snapshot_date ?? e.record_date ?? 'Unknown date'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(e)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [events])

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
        No events found for <span className="font-medium">{profileName}</span>.
      </div>
    )
  }

  const rankImageUrl = events[0]?.rank_image_url
  const rankShort = events[0]?.rank_short

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 py-3 px-4 space-y-0">
        {rankImageUrl && (
          <img src={rankImageUrl} alt={rankShort} title={rankShort} className="h-6 w-8 object-contain" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-card-foreground">{profileName}</p>
          <p className="text-xs text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClear} className="shrink-0 h-7 w-7 text-muted-foreground hover:text-foreground">
          <X size={14} />
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="p-0 divide-y divide-border">
        {byDate.map(([date, dateEvents]) => (
          <div key={date} className="px-4 py-2.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{date}</p>
            <div className="space-y-1.5">
              {dateEvents.map((e, i) => (
                <div key={i} className={cn('flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs', EVENT_COLORS[e.event_type])}>
                  <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', EVENT_DOT_COLORS[e.event_type])} />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium opacity-80 mr-1.5">{EVENT_LABELS[e.event_type]}</span>
                    <span className="opacity-70">{eventSummary(e)}</span>
                    {e.detail && <p className="opacity-50 mt-0.5 leading-relaxed">{e.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
