function escapeCsv(val) {
  const s = val ?? ''
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportEventsCsv(events, filename) {
  const headers = ['date', 'event_type', 'profile_name', 'rank', 'old_value', 'new_value', 'record_date', 'detail']
  const rows = events.map((e) => [
    escapeCsv(e.snapshot_date),
    escapeCsv(e.event_type),
    escapeCsv(e.profile_name),
    escapeCsv(e.rank_short),
    escapeCsv(e.old_value),
    escapeCsv(e.new_value),
    escapeCsv(e.record_date),
    escapeCsv(e.detail),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
