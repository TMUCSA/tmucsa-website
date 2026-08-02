'use client'

import { useEffect, useMemo, useState } from 'react'
import { trackAnalytics } from '@/components/general/AnalyticsTracker'

const categoryOrder = ['Tickets', 'Membership', 'Hiring', 'Community', 'Memories', 'Other']

export default function LinkHub() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/links', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Unable to load links.')
        setLinks(payload.links)
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false))
  }, [])

  const groups = useMemo(() => categoryOrder
    .map((category) => ({ category, links: links.filter((link) => link.category === category) }))
    .filter((group) => group.links.length), [links])

  return (
    <main className="min-h-screen bg-[#0A081B] px-5 pb-24 pt-32 text-white sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-white/15 pb-10 text-center">
          <h1 className="mt-5 font-josefin text-5xl font-semibold tracking-tight sm:text-7xl">LINKS</h1>
          <p className="mx-auto mt-5 max-w-xl font-jost font-light leading-7 text-white/55">Tickets, applications, community resources, and event memories.</p>
        </header>

        {loading ? <p className="py-20 text-center text-sm text-white/40">Loading links…</p> : null}
        {error ? <p className="my-10 rounded-2xl border border-red-300/20 bg-red-300/10 px-5 py-4 text-center text-sm text-red-100">{error}</p> : null}
        {!loading && !error && !groups.length ? <p className="py-20 text-center text-sm text-white/40">There are no active links right now. Check back soon.</p> : null}

        <div className="mt-10 space-y-12">
          {groups.map((group, groupIndex) => (
            <section key={group.category}>
              <div className="mb-4 flex items-center gap-4">
                <span className="font-jost text-[10px] tracking-[0.24em] text-beige/40">{String(groupIndex + 1).padStart(2, '0')}</span>
                <h2 className="font-josefin text-sm font-semibold uppercase tracking-[0.2em] text-beige/75">{group.category}</h2>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-3">
                {group.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAnalytics({ type: 'link_click', linkId: link.id })}
                    className={`group flex items-center justify-between gap-5 border px-5 py-5 transition sm:px-6 ${link.featured ? 'border-beige/60 bg-beige text-[#161329] hover:bg-white' : 'border-white/15 bg-white/[0.035] hover:border-beige/50 hover:bg-white/[0.07]'}`}
                  >
                    <span>
                      <span className="block font-josefin text-lg font-semibold sm:text-xl">{link.title}</span>
                      {link.description ? <span className={`mt-1.5 block font-jost text-sm font-light ${link.featured ? 'text-[#161329]/55' : 'text-white/45'}`}>{link.description}</span> : null}
                    </span>
                    <svg className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14m-5-5 5 5-5 5" /></svg>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
