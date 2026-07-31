'use client'

import { useEffect, useState } from 'react'
import OptimizedAssetField from './OptimizedAssetField'
import AdminIcon from './AdminIcon'
import { safeAssetName, uploadAdminImage } from '@/lib/client-storage'

const emptyMember = {
  firstName: '', lastName: '', displayName: '', program: '', roleTitle: '', year: 1,
  isExecutive: false, executiveOrder: 0, isActive: true,
  headshotUrl: '', headshotAlt: '', headshotStoragePath: '',
}

export default function MemberFormModal({ member, onClose, onSaved }) {
  const [form, setForm] = useState(emptyMember)
  const [headshot, setHeadshot] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const next = member ? { ...emptyMember, ...member } : emptyMember
    setForm(next)
    setHeadshot({ url: next.headshotUrl, storagePath: next.headshotStoragePath })
  }, [member])

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      let uploaded = { url: headshot.url || '', storagePath: headshot.storagePath || '' }
      if (headshot.file) {
        const unique = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()
        const path = `team-images/execs/${safeAssetName(form.displayName || `${form.firstName}-${form.lastName}`)}-${unique}.webp`
        uploaded = await uploadAdminImage(path, headshot.file)
      }
      const payload = {
        ...form,
        displayName: form.displayName || `${form.firstName} ${form.lastName}`.trim(),
        year: Number(form.year),
        executiveOrder: form.isExecutive ? Number(form.executiveOrder) : 0,
        headshotUrl: uploaded.url,
        headshotStoragePath: uploaded.storagePath,
      }
      const response = await fetch(member ? `/api/admin/team/members/${member.id}` : '/api/admin/team/members', {
        method: member ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save member.')
      onSaved(result.member)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#161329]/10 bg-white px-5 py-4 sm:px-6">
          <div><h2 className="font-josefin text-2xl font-semibold">{member ? 'Edit member' : 'Add member'}</h2><p className="text-xs text-[#161329]/40">Profiles can exist without individual headshots.</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-[#161329]/5"><AdminIcon name="close" /></button>
        </div>
        <div className="grid gap-7 p-5 sm:grid-cols-[1fr_220px] sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">First name<input required value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} className="admin-input" /></label>
            <label className="text-sm font-medium">Last name<input required value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} className="admin-input" /></label>
            <label className="text-sm font-medium sm:col-span-2">Display name<input value={form.displayName} onChange={(e) => setField('displayName', e.target.value)} placeholder={`${form.firstName} ${form.lastName}`.trim()} className="admin-input" /></label>
            <label className="text-sm font-medium sm:col-span-2">Program<input required value={form.program} onChange={(e) => setField('program', e.target.value)} className="admin-input" /></label>
            <label className="text-sm font-medium sm:col-span-2">Role title<input required value={form.roleTitle} onChange={(e) => setField('roleTitle', e.target.value)} className="admin-input" /></label>
            <label className="text-sm font-medium">Academic year<select value={form.year} onChange={(e) => setField('year', Number(e.target.value))} className="admin-input">{[0,1,2,3,4,5,6].map((year) => <option key={year} value={year}>{year === 0 ? 'Not displayed' : `Year ${year}`}</option>)}</select></label>
            <label className="flex items-center gap-3 self-end rounded-xl border border-[#161329]/10 px-3 py-3 text-sm font-medium"><input type="checkbox" checked={form.isExecutive} onChange={(e) => setField('isExecutive', e.target.checked)} className="h-4 w-4 accent-[#25487D]" />Executive member</label>
            {form.isExecutive ? <label className="text-sm font-medium">Executive display order<input type="number" min="1" value={form.executiveOrder || 1} onChange={(e) => setField('executiveOrder', Number(e.target.value))} className="admin-input" /></label> : null}
            <label className="flex items-center gap-3 self-end rounded-xl border border-[#161329]/10 px-3 py-3 text-sm font-medium"><input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} className="h-4 w-4 accent-[#25487D]" />Active member</label>
          </div>
          <div>
            <OptimizedAssetField value={headshot} onChange={setHeadshot} label="Executive headshot" compact />
            <label className="mt-4 block text-sm font-medium">Headshot description<input value={form.headshotAlt} onChange={(e) => setField('headshotAlt', e.target.value)} className="admin-input" placeholder="e.g. VP Marketing headshot" /></label>
          </div>
        </div>
        {error ? <p className="mx-6 mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#161329]/10 bg-white px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="rounded-xl border border-[#161329]/10 px-5 py-2.5 text-sm">Cancel</button>
          <button disabled={saving} className="rounded-xl bg-[#161329] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save member'}</button>
        </div>
      </form>
    </div>
  )
}
