'use client'

import { useMemo, useState } from 'react'

export default function MemberPicker({ members, selectedIds, onChange, executiveOnly = false }) {
  const [search, setSearch] = useState('')
  const selected = new Set(selectedIds || [])
  const filtered = useMemo(() => members.filter((member) => {
    if (member.isActive === false) return false
    if (executiveOnly && !member.isExecutive) return false
    const needle = search.toLowerCase()
    return !needle || `${member.displayName} ${member.roleTitle}`.toLowerCase().includes(needle)
  }), [members, search, executiveOnly])

  function toggle(id) {
    if (selected.has(id)) onChange((selectedIds || []).filter((value) => value !== id))
    else onChange([...(selectedIds || []), id])
  }

  return (
    <div className="rounded-xl border border-[#161329]/10">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a member…" className="w-full border-b border-[#161329]/10 bg-[#F8F7F3] px-3 py-2.5 text-xs outline-none" />
      <div className="max-h-48 overflow-y-auto p-1.5">
        {filtered.map((member) => (
          <button type="button" key={member.id} onClick={() => toggle(member.id)} className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs ${selected.has(member.id) ? 'bg-[#25487D]/10 text-[#25487D]' : 'hover:bg-[#161329]/5'}`}>
            <span className={`flex h-4 w-4 items-center justify-center rounded border ${selected.has(member.id) ? 'border-[#25487D] bg-[#25487D] text-white' : 'border-[#161329]/20'}`}>{selected.has(member.id) ? '✓' : ''}</span>
            <span className="min-w-0 flex-1"><span className="block truncate font-medium">{member.displayName}</span><span className="block truncate text-[10px] opacity-55">{member.roleTitle}</span></span>
          </button>
        ))}
        {!filtered.length ? <p className="px-3 py-6 text-center text-xs text-[#161329]/35">No matching members.</p> : null}
      </div>
      <div className="border-t border-[#161329]/10 px-3 py-2 text-[10px] text-[#161329]/35">{selected.size} selected</div>
    </div>
  )
}
