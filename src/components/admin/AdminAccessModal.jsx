'use client'

import { useCallback, useEffect, useState } from 'react'
import AdminIcon from './AdminIcon'

export default function AdminAccessModal({ currentEmail, onClose }) {
  const [admins, setAdmins] = useState([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState('')
  const [confirming, setConfirming] = useState('')
  const [error, setError] = useState('')

  const loadAdmins = useCallback(async () => {
    setError('')
    try {
      const response = await fetch('/api/admin/admins', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load administrators.')
      setAdmins(payload.admins || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAdmins() }, [loadAdmins])
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function addAdmin(event) {
    event.preventDefault()
    setSaving(true); setError('')
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to add administrator.')
      setAdmins(payload.admins || [])
      setEmail('')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeAdmin(adminEmail) {
    setRemoving(adminEmail); setError('')
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to remove administrator.')
      setAdmins(payload.admins || [])
      setConfirming('')
    } catch (removeError) {
      setError(removeError.message)
    } finally {
      setRemoving('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button type="button" className="absolute inset-0 bg-[#080719]/70 backdrop-blur-sm" onClick={onClose} aria-label="Close administrator settings" />
      <section role="dialog" aria-modal="true" aria-labelledby="admin-access-title" className="relative flex max-h-[min(720px,calc(100vh-2rem))] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#F4F2ED] text-[#161329] shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#161329]/10 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#25487D]">ACCESS CONTROL</p>
            <h2 id="admin-access-title" className="mt-2 font-josefin text-2xl font-semibold">Manage administrators</h2>
            <p className="mt-1 text-sm text-[#161329]/45">Grant trusted accounts access to the content studio.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[#161329]/40 transition hover:bg-[#161329]/5 hover:text-[#161329]" aria-label="Close"><AdminIcon name="close" /></button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <form onSubmit={addAdmin} className="rounded-2xl border border-[#161329]/10 bg-white p-4">
            <label htmlFor="new-admin-email" className="text-xs font-medium">Add an administrator</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input id="new-admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="admin-input mt-0 flex-1" />
              <button type="submit" disabled={saving} className="rounded-xl bg-[#161329] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#25487D] disabled:opacity-50">{saving ? 'Adding…' : 'Add admin'}</button>
            </div>
          </form>

          {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="mt-6">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">People with access</h3><span className="text-xs text-[#161329]/35">{admins.length}</span></div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-[#161329]/10 bg-white">
              {loading ? <p className="px-4 py-10 text-center text-sm text-[#161329]/40">Loading administrators…</p> : admins.length ? admins.map((administrator) => {
                const isCurrent = administrator.email.toLowerCase() === String(currentEmail || '').toLowerCase()
                return (
                  <div key={`${administrator.source}-${administrator.email}`} className="flex items-center gap-3 border-b border-[#161329]/8 px-4 py-3.5 last:border-b-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25487D]/10 text-xs font-semibold uppercase text-[#25487D]">{administrator.email.slice(0, 2)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{administrator.email}</p>
                      <div className="mt-1 flex gap-1.5">
                        {administrator.source === 'owner' ? <span className="rounded-full bg-[#FFF4E2] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#665535]">Owner</span> : <span className="rounded-full bg-[#25487D]/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#25487D]">Admin</span>}
                        {isCurrent ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-700">You</span> : null}
                      </div>
                    </div>
                    {administrator.source === 'managed' ? confirming === administrator.email ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => setConfirming('')} disabled={Boolean(removing)} className="rounded-lg px-2.5 py-2 text-xs text-[#161329]/45 hover:bg-[#161329]/5">Cancel</button>
                        <button type="button" onClick={() => removeAdmin(administrator.email)} disabled={Boolean(removing)} className="rounded-lg bg-red-600 px-2.5 py-2 text-xs font-medium text-white disabled:opacity-50">{removing === administrator.email ? 'Removing…' : 'Confirm'}</button>
                      </div>
                    ) : <button type="button" onClick={() => setConfirming(administrator.email)} className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">Remove</button> : null}
                  </div>
                )
              }) : <p className="px-4 py-10 text-center text-sm text-[#161329]/40">No administrators found.</p>}
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-[#161329]/40">Owners come from the protected <code>ADMIN_EMAILS</code> environment variable and cannot be removed here. Access changes are recorded in the audit log.</p>
        </div>
      </section>
    </div>
  )
}
