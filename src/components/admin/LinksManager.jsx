'use client'

import { useEffect, useState } from 'react'
import AdminPageHeader from './AdminPageHeader'

const categories = ['Tickets', 'Membership', 'Hiring', 'Memories', 'Community', 'Other']
const blankLink = { title: '', description: '', url: '', category: 'Other', enabled: true, featured: false, showTicketPrompt: false, startsAt: '', expiresAt: '', order: 0 }

function inputDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function normalized(link) {
  return { ...blankLink, ...link, startsAt: inputDate(link.startsAt), expiresAt: inputDate(link.expiresAt) }
}

function apiPayload(link) {
  return {
    ...link,
    startsAt: link.startsAt ? new Date(link.startsAt).toISOString() : '',
    expiresAt: link.expiresAt ? new Date(link.expiresAt).toISOString() : '',
  }
}

function Toggle({ checked, onChange, label, help, disabled = false }) {
  return <label className={`flex items-start gap-3 ${disabled ? 'opacity-40' : ''}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#25487D]" /><span><span className="block text-sm font-medium">{label}</span>{help ? <span className="mt-0.5 block text-[10px] leading-4 text-[#161329]/40">{help}</span> : null}</span></label>
}

function LinkFields({ value, onChange }) {
  const set = (key, next) => onChange({ ...value, [key]: next })
  return <div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-medium">Title<input required maxLength={120} value={value.title} onChange={(event) => set('title', event.target.value)} className="admin-input" placeholder="Summer Vybes tickets" /></label>
    <label className="text-sm font-medium">Category<select value={value.category} onChange={(event) => set('category', event.target.value)} className="admin-input">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
    <label className="text-sm font-medium sm:col-span-2">Destination URL<input required type="url" value={value.url} onChange={(event) => set('url', event.target.value)} className="admin-input" placeholder="https://…" /></label>
    <label className="text-sm font-medium sm:col-span-2">Short description<input maxLength={240} value={value.description} onChange={(event) => set('description', event.target.value)} className="admin-input" placeholder="Optional context shown below the title" /></label>
    <label className="text-sm font-medium">Show from<input type="datetime-local" value={value.startsAt} onChange={(event) => set('startsAt', event.target.value)} className="admin-input" /><span className="mt-1 block text-[10px] font-normal text-[#161329]/35">Leave blank to show immediately.</span></label>
    <label className="text-sm font-medium">Hide after<input type="datetime-local" value={value.expiresAt} onChange={(event) => set('expiresAt', event.target.value)} className="admin-input" /><span className="mt-1 block text-[10px] font-normal text-[#161329]/35">Leave blank to keep it active.</span></label>
    <label className="text-sm font-medium sm:col-span-2">Sort order<input type="number" min="0" max="9999" value={value.order} onChange={(event) => set('order', Number(event.target.value))} className="admin-input" /><span className="mt-1 block text-[10px] font-normal text-[#161329]/35">Lower numbers appear first within each category.</span></label>
    <div className="space-y-3 border-t border-[#161329]/8 pt-4 sm:col-span-2 sm:grid sm:grid-cols-3 sm:gap-5 sm:space-y-0">
      <Toggle checked={value.enabled} onChange={(next) => set('enabled', next)} label="Active" help="Visible while within its date window." />
      <Toggle checked={value.featured} onChange={(next) => set('featured', next)} label="Featured" help="Uses the highlighted style on the links page." />
      <Toggle checked={value.showTicketPrompt && value.category === 'Tickets'} disabled={value.category !== 'Tickets'} onChange={(next) => set('showTicketPrompt', next)} label="Show ticket popup" help="Prompts once per visitor session while active." />
    </div>
  </div>
}

function ExistingLink({ initial, onSaved, onDeleted }) {
  const [link, setLink] = useState(normalized(initial))
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setLink(normalized(initial)), [initial])

  async function save(event) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const response = await fetch(`/api/admin/links/${link.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiPayload(link)) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save link.')
      onSaved(payload.link)
      setExpanded(false)
    } catch (saveError) { setError(saveError.message) } finally { setSaving(false) }
  }

  async function remove() {
    if (!window.confirm(`Delete “${link.title}”? Analytics totals will be kept.`)) return
    setSaving(true); setError('')
    try {
      const response = await fetch(`/api/admin/links/${link.id}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to delete link.')
      onDeleted(link.id)
    } catch (deleteError) { setError(deleteError.message); setSaving(false) }
  }

  return <form onSubmit={save} className="overflow-hidden rounded-2xl border border-[#161329]/8 bg-white shadow-sm">
    <button type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-[#F8F7F3] sm:p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#161329]/5 font-josefin text-sm font-semibold text-[#161329]/55">{Number(initial.order || 0) + 1}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-josefin text-lg font-semibold">{initial.title}</span>
        <span className="mt-1 block text-[10px] uppercase tracking-wider text-[#161329]/35">{initial.category || 'Other'}</span>
      </span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${initial.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{initial.enabled ? 'Active' : 'Hidden'}</span>
      <svg className={`h-5 w-5 shrink-0 text-[#161329]/35 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m6 9 6 6 6-6" /></svg>
    </button>
    {expanded ? <div className="border-t border-[#161329]/8 p-5 sm:p-6">
      <LinkFields value={link} onChange={setLink} />
      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="mt-5 flex items-center justify-between border-t border-[#161329]/8 pt-4"><button type="button" onClick={remove} disabled={saving} className="text-xs font-medium text-red-600 hover:underline">Delete</button><div className="flex items-center gap-2"><button type="button" onClick={() => { setLink(normalized(initial)); setError(''); setExpanded(false) }} disabled={saving} className="rounded-xl border border-[#161329]/10 px-4 py-2.5 text-sm font-medium text-[#161329]/55 hover:bg-[#F8F7F3]">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-[#161329] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#25487D] disabled:opacity-50">{saving ? 'Saving…' : 'Save link'}</button></div></div>
    </div> : null}
  </form>
}

export default function LinksManager() {
  const [links, setLinks] = useState([])
  const [draft, setDraft] = useState(blankLink)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/links', { cache: 'no-store' }).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setLinks(payload.links) }).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false))
  }, [])

  async function create(event) {
    event.preventDefault(); setCreating(true); setError('')
    try {
      const response = await fetch('/api/admin/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiPayload({ ...draft, order: links.length })) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to create link.')
      setLinks((current) => [...current, payload.link]); setDraft(blankLink)
    } catch (createError) { setError(createError.message) } finally { setCreating(false) }
  }

  return <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
    <AdminPageHeader eyebrow="LINK HUB" title="Links" description="Manage the destinations shown at /links and choose when a ticket prompt appears." actions={<a href="/links" target="_blank" className="rounded-xl border border-[#161329]/10 bg-white px-5 py-3 text-sm font-medium">Preview links</a>} />
    <div className="mt-8 grid items-start gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={create} className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-8">
        <h2 className="font-josefin text-xl font-semibold">Add a link</h2><p className="mb-6 mt-1 text-xs text-[#161329]/40">New links appear after the existing links.</p>
        <LinkFields value={draft} onChange={setDraft} />
        {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={creating} className="mt-5 w-full rounded-xl bg-[#25487D] px-5 py-3 text-sm font-medium text-white hover:bg-[#161329] disabled:opacity-50">{creating ? 'Adding…' : 'Add link'}</button>
      </form>
      <section><div className="mb-4 flex items-end justify-between"><div><h2 className="font-josefin text-xl font-semibold">Current links</h2><p className="mt-1 text-xs text-[#161329]/40">Edit categories, availability, and promotions.</p></div><span className="text-xs text-[#161329]/35">{links.length} total</span></div>
        {loading ? <p className="rounded-2xl bg-white py-16 text-center text-sm text-[#161329]/40">Loading links…</p> : null}
        {!loading && !links.length ? <p className="rounded-2xl border border-dashed border-[#161329]/15 py-16 text-center text-sm text-[#161329]/40">Add the first link to publish your hub.</p> : null}
        <div className="space-y-4">{links.map((link) => <ExistingLink key={link.id} initial={link} onSaved={(saved) => setLinks((current) => current.map((item) => item.id === saved.id ? saved : item).sort((a, b) => a.order - b.order))} onDeleted={(id) => setLinks((current) => current.filter((item) => item.id !== id))} />)}</div>
      </section>
    </div>
  </main>
}
