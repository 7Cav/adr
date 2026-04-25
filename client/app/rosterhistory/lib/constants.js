export const RECORD_TYPE_LABELS = {
  RECORD_TYPE_OPERATION:    'Operation',
  RECORD_TYPE_GRADUATION:   'Graduation',
  RECORD_TYPE_TRANSFER:     'Transfer',
  RECORD_TYPE_ASSIGNMENT:   'Assignment',
  RECORD_TYPE_PROMOTION:    'Promotion',
  RECORD_TYPE_ELOA:         'ELOA',
  RECORD_TYPE_DISCHARGE:    'Discharge',
  RECORD_TYPE_DISCIPLINARY: 'Disciplinary',
  RECORD_TYPE_NAME_CHANGE:  'Name Change',
  RECORD_TYPE_UNSPECIFIED:  'Unspecified',
}

export function formatRecordType(raw) {
  return (
    RECORD_TYPE_LABELS[raw] ??
    raw.replace('RECORD_TYPE_', '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

export const EVENT_SORT_ORDER = {
  PROMOTION:       0,
  NEW_MEMBER:      1,
  DISCHARGE:       2,
  NEW_AWARD:       3,
  POSITION_CHANGE: 4,
  NAME_CHANGE:     5,
  NEW_RECORD:      6,
}

export const EVENT_LABELS = {
  PROMOTION:       'Promotion',
  NEW_MEMBER:      'New Member',
  DISCHARGE:       'Discharge',
  NEW_RECORD:      'New Record',
  NEW_AWARD:       'New Award',
  POSITION_CHANGE: 'Position Change',
  NAME_CHANGE:     'Name Change',
}

export const EVENT_COLORS = {
  PROMOTION:       'bg-amber-500/15 text-amber-400 border-amber-500/30',
  NEW_MEMBER:      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  DISCHARGE:       'bg-red-500/15 text-red-400 border-red-500/30',
  NEW_RECORD:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  NEW_AWARD:       'bg-purple-500/15 text-purple-400 border-purple-500/30',
  POSITION_CHANGE: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  NAME_CHANGE:     'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

export const EVENT_DOT_COLORS = {
  PROMOTION:       'bg-amber-400',
  NEW_MEMBER:      'bg-emerald-400',
  DISCHARGE:       'bg-red-400',
  NEW_RECORD:      'bg-blue-400',
  NEW_AWARD:       'bg-purple-400',
  POSITION_CHANGE: 'bg-cyan-400',
  NAME_CHANGE:     'bg-slate-400',
}

export const ALL_EVENT_TYPES = [
  'PROMOTION',
  'NEW_MEMBER',
  'DISCHARGE',
  'NEW_AWARD',
  'POSITION_CHANGE',
  'NEW_RECORD',
  'NAME_CHANGE',
]
