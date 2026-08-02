'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { trackAnalytics } from './AnalyticsTracker'

export default function TicketPrompt() {
  const pathname = usePathname()
  const [link, setLink] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname === '/links') return
    let active = true
    let timeout
    fetch('/api/links', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : { links: [] })
      .then(({ links }) => {
        const ticket = links.find((item) => item.showTicketPrompt)
        if (!active || !ticket) return
        try {
          if (sessionStorage.getItem(`tmucsa:ticket-prompt:${ticket.id}`)) return
        } catch {}
        setLink(ticket)
        timeout = window.setTimeout(() => {
          if (!active) return
          setVisible(true)
          trackAnalytics({ type: 'prompt_view', linkId: ticket.id })
        }, 1200)
      })
      .catch(() => {})
    return () => { active = false; window.clearTimeout(timeout) }
  }, [pathname])

  function close() {
    if (link) {
      try { sessionStorage.setItem(`tmucsa:ticket-prompt:${link.id}`, '1') } catch {}
    }
    setVisible(false)
  }

  if (!visible || !link) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ticket-prompt-title">
      <section className="relative w-full max-w-lg overflow-hidden border border-white/15 bg-[#161329] p-6 text-white shadow-2xl sm:p-8">
        <button type="button" onClick={close} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-white/15 text-white/55 transition hover:border-white/40 hover:text-white" aria-label="Close ticket prompt">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="1.5" d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        <p className="font-jost text-[10px] font-semibold uppercase tracking-[0.28em] text-beige/55">Upcoming event</p>
        <h2 id="ticket-prompt-title" className="mt-5 pr-10 font-josefin text-3xl font-semibold sm:text-4xl">{link.title}</h2>
        <p className="mt-3 font-jost font-light leading-6 text-white/55">{link.description || 'Tickets are available now. Secure yours before they sell out.'}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => { trackAnalytics({ type: 'prompt_click', linkId: link.id }); close() }} className="inline-flex flex-1 items-center justify-center gap-2 bg-beige px-5 py-3.5 font-jost text-sm font-medium text-[#161329] transition hover:bg-white">
            Get tickets
            <span aria-hidden="true">→</span>
          </a>
          <button type="button" onClick={close} className="border border-white/15 px-5 py-3.5 font-jost text-sm text-white/60 transition hover:border-white/35 hover:text-white">Maybe later</button>
        </div>
      </section>
    </div>
  )
}
