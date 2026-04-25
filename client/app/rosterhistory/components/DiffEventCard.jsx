'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EVENT_COLORS, EVENT_DOT_COLORS, EVENT_LABELS, ROSTER_TYPE_COLORS, ROSTER_TYPE_LABELS, formatRecordType } from '../lib/constants'

export function DiffEventCard({ event }) {
  const [open, setOpen] = useState(false)
  const colorClass = EVENT_COLORS[event.event_type]
  const dotColor = EVENT_DOT_COLORS[event.event_type]
  const hasDetail = !!event.detail

  return (
    <div className={cn('rounded-lg border px-3 py-2.5 text-sm', colorClass)}>
      <div
        className={cn('flex items-center gap-3', hasDetail && 'cursor-pointer')}
        onClick={() => hasDetail && setOpen((o) => !o)}
      >
        <span className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', dotColor)} />

        <div className="w-7 shrink-0 flex items-center justify-center">
          {event.rank_image_url && (
            <img
              src={event.rank_image_url}
              alt={event.rank_short}
              title={event.rank_short}
              className="h-5 w-7 object-contain"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-semibold">{event.profile_name}</span>

          <Badge variant="outline" className="text-xs opacity-70 border-current bg-transparent">
            {EVENT_LABELS[event.event_type]}
          </Badge>

          {event.roster_type && event.roster_type !== 'ROSTER_TYPE_COMBAT' && (
            <Badge variant="outline" className={cn('text-xs border-current bg-transparent', ROSTER_TYPE_COLORS[event.roster_type])}>
              {ROSTER_TYPE_LABELS[event.roster_type]}
            </Badge>
          )}

          {event.event_type === 'PROMOTION' && (
            <span className="opacity-90 text-xs">{event.old_value} → {event.new_value}</span>
          )}
          {event.event_type === 'ROSTER_TRANSFER' && (
            <span className="opacity-90 text-xs">{event.old_value} → {event.new_value}</span>
          )}
          {event.event_type === 'NEW_RECORD' && event.new_value && (
            <span className="opacity-70 text-xs font-medium">{formatRecordType(event.new_value)}</span>
          )}
          {event.event_type === 'NEW_AWARD' && event.new_value && (
            <span className="opacity-90 text-xs">{event.new_value}</span>
          )}
          {event.event_type === 'POSITION_CHANGE' && (
            <span className="opacity-80 text-xs">{event.old_value} → {event.new_value}</span>
          )}
          {event.event_type === 'NAME_CHANGE' && (
            <span className="opacity-80 text-xs">{event.old_value} → {event.new_value}</span>
          )}
          {event.record_date && (
            <span className="opacity-50 text-xs ml-auto">{event.record_date}</span>
          )}
        </div>

        {hasDetail && (
          <span className="shrink-0 opacity-40">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
      </div>

      {open && hasDetail && (
        <p className="mt-1.5 ml-5 text-xs opacity-70 leading-relaxed">{event.detail}</p>
      )}
    </div>
  )
}
