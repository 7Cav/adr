'use client'

import { useState } from 'react'
import QueryProvider from './QueryProvider'
import { TodayView } from './components/TodayView'
import { HistoryView } from './components/HistoryView'

const cn = (...c) => c.filter(Boolean).join(' ')

export default function RosterHistoryClient() {
  const [tab, setTab] = useState('today')

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
        tab === id
          ? 'border-[#ebc729] text-[#ebc729]'
          : 'border-transparent text-[#a1a1a1] hover:text-[#f1f1f1]'
      )}
    >
      {label}
    </button>
  )

  return (
    <QueryProvider>
      <div className="mb-6 flex gap-1 border-b border-[#333]">
        {tabBtn('today', 'Today')}
        {tabBtn('history', 'History')}
      </div>
      {tab === 'today' ? <TodayView /> : <HistoryView />}
    </QueryProvider>
  )
}
