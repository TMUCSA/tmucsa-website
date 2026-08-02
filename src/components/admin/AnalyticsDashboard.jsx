'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminPageHeader from './AdminPageHeader'

const pageLabels = { home: 'Home', events: 'Events', team: 'Team', contact: 'Contact', links: 'Links', 'team-member-form': 'Team member form' }

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setData(null); setError('')
    fetch(`/api/admin/analytics?days=${days}`, { cache: 'no-store' })
      .then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setData(payload) })
      .catch((loadError) => setError(loadError.message))
  }, [days])

  const maxViews = useMemo(() => Math.max(1, ...(data?.series || []).map((item) => item.pageViews)), [data])
  const conversion = data?.totals.promptViews ? Math.round((data.totals.promptClicks / data.totals.promptViews) * 100) : 0

  return <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
    <AdminPageHeader eyebrow="INSIGHTS" title="Website analytics" description="Privacy-conscious aggregate activity. Visitors are not profiled and no personal information is collected." actions={<div className="flex rounded-xl border border-[#161329]/10 bg-white p-1">{[7, 30, 90].map((value) => <button key={value} onClick={() => setDays(value)} className={`rounded-lg px-3 py-2 text-xs font-medium ${days === value ? 'bg-[#161329] text-white' : 'text-[#161329]/45'}`}>{value} days</button>)}</div>} />
    {error ? <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
    {!data && !error ? <p className="py-24 text-center text-sm text-[#161329]/40">Loading analytics…</p> : null}
    {data ? <>
      <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Page views', data.totals.pageViews, 'Once per page per browser session'],
          ['Ticket prompt views', data.totals.promptViews, 'Times an active prompt appeared'],
          ['Ticket clicks', data.totals.promptClicks, 'Clicks directly from the prompt'],
          ['Prompt conversion', `${conversion}%`, 'Clicks divided by prompt views'],
        ].map(([label, value, detail]) => <article key={label} className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm"><p className="text-sm text-[#161329]/45">{label}</p><p className="mt-3 font-josefin text-4xl font-semibold">{value}</p><p className="mt-4 text-[10px] text-[#161329]/35">{detail}</p></article>)}
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        <article className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-6"><h2 className="font-josefin text-xl font-semibold">Daily traffic</h2><p className="mt-1 text-xs text-[#161329]/40">Aggregate page views in the selected period</p><div className="mt-8 flex h-52 items-end gap-1">{data.series.map((item) => <div key={item.date} className="group relative flex h-full min-w-0 flex-1 items-end"><div className="w-full min-h-px bg-[#25487D] transition hover:bg-[#161329]" style={{ height: `${Math.max(item.pageViews ? 4 : 0, (item.pageViews / maxViews) * 100)}%` }} /><span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#161329] px-2 py-1 text-[9px] text-white group-hover:block">{item.date}: {item.pageViews}</span></div>)}</div></article>
        <article className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-6"><h2 className="font-josefin text-xl font-semibold">Top pages</h2><div className="mt-4 divide-y divide-[#161329]/8">{data.topPages.slice(0, 8).map((item, index) => <div key={item.page} className="flex items-center gap-3 py-3"><span className="text-[10px] text-[#161329]/30">{String(index + 1).padStart(2, '0')}</span><span className="flex-1 text-sm">{pageLabels[item.page] || item.page}</span><span className="text-sm font-semibold">{item.views}</span></div>)}{!data.topPages.length ? <p className="py-8 text-center text-xs text-[#161329]/35">No page views yet.</p> : null}</div></article>
      </section>
      <section className="mt-6 rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-6"><h2 className="font-josefin text-xl font-semibold">Top link clicks</h2><p className="mt-1 text-xs text-[#161329]/40">Includes clicks from the links page and ticket prompt</p><div className="mt-4 divide-y divide-[#161329]/8">{data.topLinks.slice(0, 10).map((item, index) => <div key={item.id} className="flex items-center gap-4 py-3"><span className="text-[10px] text-[#161329]/30">{String(index + 1).padStart(2, '0')}</span><span className="flex-1 text-sm font-medium">{item.title}</span><span className="rounded-full bg-[#25487D]/10 px-3 py-1 text-xs font-semibold text-[#25487D]">{item.clicks} clicks</span></div>)}{!data.topLinks.length ? <p className="py-8 text-center text-xs text-[#161329]/35">Link clicks will appear here.</p> : null}</div></section>
    </> : null}
  </main>
}
