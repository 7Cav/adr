'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const BASE = process.env.NEXT_PUBLIC_DIFF_API_URL || 'http://localhost:4000'

async function get(path) {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function useDiffList() {
  return useQuery({
    queryKey: ['diffs'],
    queryFn: () => get('/diffs'),
  })
}

export function useDiffByDate(date) {
  return useQuery({
    queryKey: ['diff', date],
    queryFn: () => get(`/diffs/${date}`),
    enabled: !!date,
  })
}

export function useDiffRange(from, to, enabled = true) {
  return useQuery({
    queryKey: ['diff-range', from, to],
    queryFn: () => get(`/diffs/range?from=${from}&to=${to}`),
    enabled,
  })
}

export function useRanks() {
  return useQuery({
    queryKey: ['ranks'],
    queryFn: () => get('/ranks'),
    staleTime: 60 * 60 * 1000,
  })
}

export function useTriggerSnapshot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => fetch(`${BASE}/admin/snapshot`, { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ['diffs'] }), 3000)
    },
  })
}
