'use client'
import { useEffect } from 'react'

const REF_KEY = 'katresna_ref'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export default function RefCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (ref) {
        localStorage.setItem(REF_KEY, JSON.stringify({ code: ref, ts: Date.now() }))
      }
    } catch (_) {}
  }, [])
  return null
}

export function getStoredRef(): string | null {
  try {
    const raw = localStorage.getItem(REF_KEY)
    if (!raw) return null
    const { code, ts } = JSON.parse(raw)
    if (!code || typeof ts !== 'number') return null
    if (Date.now() - ts > MAX_AGE_MS) {
      localStorage.removeItem(REF_KEY)
      return null
    }
    return code
  } catch (_) {
    return null
  }
}
