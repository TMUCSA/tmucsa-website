'use client'

/* eslint-disable @next/next/no-img-element */
// Event thumbnails have already been optimized before they reach Firebase Storage.
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import AdminIcon from './AdminIcon'
import AdminPageHeader from './AdminPageHeader'

function eventImage(event) {
  return event.images?.[0]?.url || event.imageUrls?.[0] || ''
}

function eventStatus(event) {
  return event.status || 'published'
}

export default function EventsManager() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  async function loadEvents() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/events', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load events.')
      setEvents(payload.events)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEvents() }, [])

  const filtered = useMemo(() => events.filter((event) => {
    const matchesStatus = status === 'all' || eventStatus(event) === status
    const needle = search.trim().toLowerCase()
    const matchesSearch = !needle || `${event.name} ${event.description}`.toLowerCase().includes(needle)
    return matchesStatus && matchesSearch
  }), [events, search, status])

  async function archiveEvent(event) {
    if (!window.confirm(`Archive “${event.name}”? It will disappear from the public events page but can be restored.`)) return
    const response = await fetch(`/api/admin/events/${event.id}`, { method: 'DELETE' })
    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error || 'Unable to archive event.')
      return
    }
    await loadEvents()
  }

  const tabs = [
    ['all', 'All'],
    ['published', 'Published'],
    ['draft', 'Drafts'],
    ['archived', 'Archived'],
  ]

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <AdminPageHeader
        eyebrow="EVENT ARCHIVE"
        title="Events"
        description="Turn recent event photos into a fast, polished archive without manually preparing Firebase files."
        actions={<Link href="/admin/events/new" className="inline-flex items-center gap-2 rounded-xl bg-[#161329] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#161329]/15 transition hover:bg-[#25487D]"><AdminIcon name="plus" className="h-4 w-4" />Add past event</Link>}
      />

      {error ? <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#161329]/8 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#161329]/8 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-[#F4F2ED] p-1">
            {tabs.map(([value, label]) => (
              <button key={value} onClick={() => setStatus(value)} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition ${status === value ? 'bg-white text-[#161329] shadow-sm' : 'text-[#161329]/45 hover:text-[#161329]'}`}>{label}</button>
            ))}
          </div>
          <div className="relative sm:w-72">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#161329]/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events…" className="w-full rounded-xl border border-[#161329]/10 bg-[#F8F7F3] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#25487D]" />
          </div>
        </div>

        {loading ? <p className="px-6 py-16 text-center text-sm text-[#161329]/40">Loading events…</p> : filtered.length ? (
          <div className="divide-y divide-[#161329]/8">
            {filtered.map((event) => {
              const date = new Date(event.date)
              const currentStatus = eventStatus(event)
              return (
                <article key={event.id} className="group flex flex-col gap-4 p-4 transition hover:bg-[#FAF9F6] sm:flex-row sm:items-center sm:p-5">
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-[#161329]/5 sm:h-20 sm:w-28">
                    {eventImage(event) ? <img src={eventImage(event)} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-medium">{event.name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${currentStatus === 'draft' ? 'bg-amber-100 text-amber-800' : currentStatus === 'archived' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>{currentStatus}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-[#161329]/45">{event.description}</p>
                    <div className="mt-2 flex gap-4 text-[10px] text-[#161329]/35"><span>{Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span><span>{event.images?.length || event.imageUrls?.length || 0} photos</span></div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href={`/admin/events/${event.id}`} className="inline-flex items-center gap-2 rounded-xl border border-[#161329]/10 bg-white px-3.5 py-2 text-xs font-medium hover:border-[#25487D] hover:text-[#25487D]"><AdminIcon name="edit" className="h-4 w-4" />Edit</Link>
                    {currentStatus !== 'archived' ? <button onClick={() => archiveEvent(event)} className="inline-flex items-center gap-2 rounded-xl border border-[#161329]/10 bg-white px-3.5 py-2 text-xs text-[#161329]/50 hover:border-red-200 hover:text-red-600"><AdminIcon name="archive" className="h-4 w-4" />Archive</button> : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : <p className="px-6 py-16 text-center text-sm text-[#161329]/40">No events match this view.</p>}
      </section>
    </main>
  )
}
