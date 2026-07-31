'use client'

/* eslint-disable @next/next/no-img-element */
// Member headshots are optimized by the shared admin asset pipeline.
import { useEffect, useMemo, useState } from 'react'
import AdminPageHeader from './AdminPageHeader'
import AdminIcon from './AdminIcon'
import MemberFormModal from './MemberFormModal'
import TeamOrganizationEditor from './TeamOrganizationEditor'

export default function TeamManager() {
  const [data, setData] = useState({ members: [], pages: [], currentPage: null, sections: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('members')
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [editingMember, setEditingMember] = useState(undefined)

  async function loadTeam() {
    try {
      const response = await fetch('/api/admin/team', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load team.')
      setData(payload)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTeam() }, [])

  const members = useMemo(() => data.members.filter((member) => {
    if (!showArchived && member.isActive === false) return false
    const needle = search.toLowerCase()
    return !needle || `${member.displayName} ${member.roleTitle} ${member.program}`.toLowerCase().includes(needle)
  }), [data.members, search, showArchived])

  async function archiveMember(member) {
    if (!window.confirm(`Archive ${member.displayName}? They will be removed from the current page but preserved in historical snapshots.`)) return
    const response = await fetch(`/api/admin/team/members/${member.id}`, { method: 'DELETE' })
    const payload = await response.json()
    if (!response.ok) setError(payload.error || 'Unable to archive member.')
    else await loadTeam()
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <AdminPageHeader eyebrow="PEOPLE & STRUCTURE" title="Team" description="Maintain member profiles, organize photographed subgroups, and preserve each academic year." actions={tab === 'members' ? <button onClick={() => setEditingMember(null)} className="inline-flex items-center gap-2 rounded-xl bg-[#161329] px-5 py-3 text-sm font-medium text-white hover:bg-[#25487D]"><AdminIcon name="plus" className="h-4 w-4" />Add member</button> : null} />
      <div className="mt-8 inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-[#161329]/8">
        {[['members', 'Member directory'], ['page', 'Team page & years']].map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`rounded-lg px-4 py-2.5 text-sm font-medium ${tab === value ? 'bg-[#161329] text-white' : 'text-[#161329]/50'}`}>{label}</button>)}
      </div>
      {error ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="py-20 text-center text-sm text-[#161329]/40">Loading team…</p> : tab === 'members' ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-[#161329]/8 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#161329]/8 p-4 sm:flex-row sm:items-center sm:justify-between">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search names, roles, or programs…" className="w-full rounded-xl border border-[#161329]/10 bg-[#F8F7F3] px-4 py-2.5 text-sm outline-none focus:border-[#25487D] sm:max-w-sm" />
            <label className="flex items-center gap-2 text-xs text-[#161329]/50"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-[#25487D]" />Show archived</label>
          </div>
          <div className="divide-y divide-[#161329]/8">
            {members.map((member) => (
              <article key={member.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#25487D]/10 font-josefin font-semibold text-[#25487D]">{member.headshotUrl ? <img src={member.headshotUrl} alt="" className="h-full w-full object-cover" /> : `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`}</div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-medium">{member.displayName}</h2>{member.isExecutive ? <span className="rounded-full bg-[#FFF4E2] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#665535]">Executive</span> : null}{member.isActive === false ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-600">Archived</span> : null}</div><p className="mt-1 text-sm text-[#161329]/45">{member.roleTitle} · {member.year ? `Year ${member.year}, ` : ''}{member.program}</p></div>
                <div className="flex gap-2"><button onClick={() => setEditingMember(member)} className="inline-flex items-center gap-2 rounded-xl border border-[#161329]/10 px-3.5 py-2 text-xs font-medium"><AdminIcon name="edit" className="h-4 w-4" />Edit</button>{member.isActive !== false ? <button onClick={() => archiveMember(member)} className="rounded-xl border border-[#161329]/10 px-3.5 py-2 text-xs text-red-600">Archive</button> : null}</div>
              </article>
            ))}
            {!members.length ? <p className="px-6 py-16 text-center text-sm text-[#161329]/40">No matching members.</p> : null}
          </div>
        </section>
      ) : <div className="mt-6"><TeamOrganizationEditor currentPage={data.currentPage} initialSections={data.sections} members={data.members} pages={data.pages} onReload={loadTeam} /></div>}
      {editingMember !== undefined ? <MemberFormModal member={editingMember} onClose={() => setEditingMember(undefined)} onSaved={async () => { setEditingMember(undefined); await loadTeam() }} /> : null}
    </main>
  )
}
