/* eslint-disable @next/next/no-img-element */
// Event artwork is already resized and compressed by the admin upload pipeline.
import Link from 'next/link'
import AdminIcon from '@/components/admin/AdminIcon'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

function eventDate(data) {
  const value = data?.date
  return typeof value?.toDate === 'function' ? value.toDate() : new Date(value || 0)
}

export default async function AdminDashboardPage() {
  const db = getAdminDb()
  const [eventsSnapshot, membersSnapshot, teamPageSnapshot, activitySnapshot] = await Promise.all([
    db.collection('events').get(),
    db.collection('members').get(),
    db.doc('teamPages/current').get(),
    db.collection('auditLogs').orderBy('createdAt', 'desc').limit(5).get(),
  ])

  const events = eventsSnapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .sort((a, b) => eventDate(b) - eventDate(a))
  const activeEvents = events.filter((event) => !['archived', 'draft'].includes(event.status))
  const drafts = events.filter((event) => event.status === 'draft')
  const activeMembers = membersSnapshot.docs.filter((document) => document.data().isActive !== false)
  const recentEvents = events.slice(0, 4)
  const yearLabel = teamPageSnapshot.data()?.yearLabel || 'Not set'
  const activity = activitySnapshot.docs.map((document) => ({ id: document.id, ...document.data() }))

  const cards = [
    { label: 'Published events', value: activeEvents.length, detail: 'In the public archive', icon: 'events' },
    { label: 'Event drafts', value: drafts.length, detail: drafts.length ? 'Ready to finish' : 'Nothing waiting', icon: 'content' },
    { label: 'Active members', value: activeMembers.length, detail: `Team year ${yearLabel}`, icon: 'team' },
  ]

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <AdminPageHeader
        eyebrow="OVERVIEW"
        title="Good to see you."
        description="Everything you need to keep the TMUCSA website current, organized, and fast."
        actions={
          <Link href="/admin/events/new" className="inline-flex items-center gap-2 rounded-xl bg-[#161329] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#161329]/15 transition hover:-translate-y-0.5 hover:bg-[#25487D]">
            <AdminIcon name="plus" className="h-4 w-4" />
            Add past event
          </Link>
        }
      />

      <section className="mt-9 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm shadow-[#161329]/5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#161329]/50">{card.label}</p>
                <p className="mt-3 font-josefin text-4xl font-semibold">{card.value}</p>
              </div>
              <div className="rounded-xl bg-[#25487D]/10 p-3 text-[#25487D]"><AdminIcon name={card.icon} /></div>
            </div>
            <p className="mt-5 text-xs text-[#161329]/40">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.55fr]">
        <article className="overflow-hidden rounded-2xl border border-[#161329]/8 bg-white shadow-sm shadow-[#161329]/5">
          <div className="flex items-center justify-between border-b border-[#161329]/8 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-josefin text-xl font-semibold">Recent events</h2>
              <p className="mt-1 text-sm text-[#161329]/45">The latest additions to the archive</p>
            </div>
            <Link href="/admin/events" className="text-sm font-medium text-[#25487D] hover:underline">View all</Link>
          </div>
          {recentEvents.length ? (
            <div className="divide-y divide-[#161329]/8">
              {recentEvents.map((event) => {
                const image = event.images?.[0]?.url || event.imageUrls?.[0]
                const date = eventDate(event)
                return (
                  <Link href={`/admin/events/${event.id}`} key={event.id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#F7F5F0] sm:px-6">
                    <div className="h-14 w-20 overflow-hidden rounded-xl bg-[#161329]/5">
                      {image ? <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{event.name}</p>
                      <p className="mt-1 text-xs text-[#161329]/45">{Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${event.status === 'draft' ? 'bg-amber-100 text-amber-800' : event.status === 'archived' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {event.status || 'published'}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : <p className="px-6 py-12 text-center text-sm text-[#161329]/40">No events yet.</p>}
        </article>

        <div className="space-y-6">
          <article className="rounded-2xl bg-[#161329] p-6 text-white shadow-xl shadow-[#161329]/15">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#FFF4E2]/55">QUICK START</p>
            <h2 className="mt-4 font-josefin text-2xl font-semibold">Turn a folder of photos into an event.</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">Drop in JPEG, PNG, WebP, or iPhone HEIC files. They are resized, converted, and compressed before Firebase sees them.</p>
            <Link href="/admin/events/new" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFF4E2] px-4 py-3 text-sm font-medium text-[#161329] transition hover:bg-white">
              Start an event
              <AdminIcon name="arrow" className="h-4 w-4" />
            </Link>
          </article>
          <article className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm">
            <h2 className="font-josefin text-lg font-semibold">Recent activity</h2>
            {activity.length ? <div className="mt-3 divide-y divide-[#161329]/8">{activity.map((entry) => {
              const timestamp = entry.createdAt?.toDate?.()
              return <div key={entry.id} className="py-3"><p className="text-xs leading-5">{entry.summary}</p><p className="mt-1 truncate text-[10px] text-[#161329]/35">{entry.actorEmail}{timestamp ? ` · ${timestamp.toLocaleDateString('en-CA')}` : ''}</p></div>
            })}</div> : <p className="mt-3 text-xs text-[#161329]/35">Activity will appear after the first admin change.</p>}
          </article>
        </div>
      </section>
    </main>
  )
}
