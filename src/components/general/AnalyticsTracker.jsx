'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function trackAnalytics(event) {
  const body = JSON.stringify(event)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }))
    return
  }
  fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
}

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    const key = `tmucsa:viewed:${pathname}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {}
    trackAnalytics({ type: 'page_view', path: pathname })
  }, [pathname])

  return null
}
