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
  PROMOTION:               0,
  NEW_MEMBER:              1,
  RETURN_TO_ACTIVE:        2,
  WALL_OF_HONOR_INDUCTION: 3,
  ROSTER_TRANSFER:         4,
  TRANSFER_RESERVE:        5,
  TRANSFER_ELOA:           6,
  DISCHARGE:               7,
  FALLEN:                  8,
  REMOVED:                 9,
  NEW_AWARD:               9,
  POSITION_CHANGE:         10,
  NAME_CHANGE:             11,
  NEW_RECORD:              12,
}

export const EVENT_LABELS = {
  PROMOTION:               'Promotion',
  NEW_MEMBER:              'New Member',
  RETURN_TO_ACTIVE:        'Return to Active Duty',
  WALL_OF_HONOR_INDUCTION: 'Wall of Honor',
  ROSTER_TRANSFER:         'Roster Transfer',
  TRANSFER_RESERVE:        'Transfer to Reserve',
  TRANSFER_ELOA:           'Extended LOA',
  DISCHARGE:               'Discharge',
  FALLEN:                  'Fallen',
  REMOVED:                 'Removed',
  NEW_RECORD:              'New Record',
  NEW_AWARD:               'New Award',
  POSITION_CHANGE:         'Position Change',
  NAME_CHANGE:             'Name Change',
}

export const EVENT_COLORS = {
  PROMOTION:               'bg-amber-500/15 text-amber-400 border-amber-500/30',
  NEW_MEMBER:              'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  RETURN_TO_ACTIVE:        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  WALL_OF_HONOR_INDUCTION: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  ROSTER_TRANSFER:         'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  TRANSFER_RESERVE:        'bg-sky-500/15 text-sky-400 border-sky-500/30',
  TRANSFER_ELOA:           'bg-orange-500/15 text-orange-400 border-orange-500/30',
  DISCHARGE:               'bg-red-500/15 text-red-400 border-red-500/30',
  FALLEN:                  'bg-stone-500/20 text-stone-300 border-stone-500/40',
  REMOVED:                 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30',
  NEW_RECORD:              'bg-blue-500/15 text-blue-400 border-blue-500/30',
  NEW_AWARD:               'bg-purple-500/15 text-purple-400 border-purple-500/30',
  POSITION_CHANGE:         'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  NAME_CHANGE:             'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

export const EVENT_DOT_COLORS = {
  PROMOTION:               'bg-amber-400',
  NEW_MEMBER:              'bg-emerald-400',
  RETURN_TO_ACTIVE:        'bg-emerald-400',
  WALL_OF_HONOR_INDUCTION: 'bg-yellow-300',
  ROSTER_TRANSFER:         'bg-indigo-400',
  TRANSFER_RESERVE:        'bg-sky-400',
  TRANSFER_ELOA:           'bg-orange-400',
  DISCHARGE:               'bg-red-400',
  FALLEN:                  'bg-stone-400',
  REMOVED:                 'bg-zinc-500',
  NEW_RECORD:              'bg-blue-400',
  NEW_AWARD:               'bg-purple-400',
  POSITION_CHANGE:         'bg-cyan-400',
  NAME_CHANGE:             'bg-slate-400',
}

export const ALL_EVENT_TYPES = [
  'PROMOTION',
  'NEW_MEMBER',
  'RETURN_TO_ACTIVE',
  'WALL_OF_HONOR_INDUCTION',
  'ROSTER_TRANSFER',
  'TRANSFER_RESERVE',
  'TRANSFER_ELOA',
  'DISCHARGE',
  'FALLEN',
  'REMOVED',
  'NEW_AWARD',
  'POSITION_CHANGE',
  'NEW_RECORD',
  'NAME_CHANGE',
]

export const ALL_ROSTER_TYPES = [
  'ROSTER_TYPE_COMBAT',
  'ROSTER_TYPE_RESERVE',
  'ROSTER_TYPE_ELOA',
  'ROSTER_TYPE_WALL_OF_HONOR',
  'ROSTER_TYPE_ARLINGTON',
  'ROSTER_TYPE_PAST_MEMBERS',
]

export const ROSTER_TYPE_LABELS = {
  ROSTER_TYPE_COMBAT:        'Combat',
  ROSTER_TYPE_RESERVE:       'Reserve',
  ROSTER_TYPE_ELOA:          'ELOA',
  ROSTER_TYPE_WALL_OF_HONOR: 'Wall of Honor',
  ROSTER_TYPE_ARLINGTON:     'Arlington',
  ROSTER_TYPE_PAST_MEMBERS:  'Past Members',
}

export const ROSTER_TYPE_COLORS = {
  ROSTER_TYPE_COMBAT:        'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  ROSTER_TYPE_RESERVE:       'bg-sky-500/15 text-sky-300 border-sky-500/30',
  ROSTER_TYPE_ELOA:          'bg-orange-500/15 text-orange-300 border-orange-500/30',
  ROSTER_TYPE_WALL_OF_HONOR: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  ROSTER_TYPE_ARLINGTON:     'bg-rose-500/15 text-rose-300 border-rose-500/30',
  ROSTER_TYPE_PAST_MEMBERS:  'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
}
