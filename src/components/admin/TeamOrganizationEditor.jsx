'use client'

import { useEffect, useRef, useState } from 'react'
import OptimizedAssetField from './OptimizedAssetField'
import MemberPicker from './MemberPicker'
import AdminIcon from './AdminIcon'
import { safeAssetName, uploadAdminImage } from '@/lib/client-storage'

function assetFrom(source, urlKey, pathKey) {
  return { url: source?.[urlKey] || '', storagePath: source?.[pathKey] || '' }
}

function prepareSections(sections) {
  return (sections || []).map((section) => ({
    ...section,
    _asset: assetFrom(section, 'backgroundImageUrl', 'backgroundImageStoragePath'),
    subteams: (section.subteams || []).map((subteam) => ({
      ...subteam,
      _asset: assetFrom(subteam, 'imageUrl', 'imageStoragePath'),
    })),
  }))
}

async function uploadAsset(asset, pathPrefix, label) {
  if (!asset?.file) return { url: asset?.url || '', storagePath: asset?.storagePath || '' }
  const unique = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()
  return uploadAdminImage(`${pathPrefix}/${safeAssetName(label)}-${unique}.webp`, asset.file)
}

export default function TeamOrganizationEditor({ currentPage, initialSections, members, pages, onReload }) {
  const [page, setPage] = useState(currentPage || { title: 'OUR TEAM', yearLabel: '', heroImageUrl: '', heroImageAlt: '' })
  const [heroAsset, setHeroAsset] = useState(assetFrom(currentPage, 'heroImageUrl', 'heroImageStoragePath'))
  const [sections, setSections] = useState(prepareSections(initialSections))
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const pendingDepartmentId = useRef('')
  const pendingDepartmentElement = useRef(null)

  useEffect(() => {
    setPage(currentPage || { title: 'OUR TEAM', yearLabel: '', heroImageUrl: '', heroImageAlt: '' })
    setHeroAsset(assetFrom(currentPage, 'heroImageUrl', 'heroImageStoragePath'))
    setSections(prepareSections(initialSections))
  }, [currentPage, initialSections])

  useEffect(() => {
    if (!pendingDepartmentId.current || !pendingDepartmentElement.current) return
    const element = pendingDepartmentElement.current
    const frame = window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      element.querySelector('[data-department-name]')?.focus({ preventScroll: true })
      pendingDepartmentId.current = ''
      pendingDepartmentElement.current = null
    })
    return () => window.cancelAnimationFrame(frame)
  }, [sections])

  function updateSection(index, changes) {
    setSections((current) => current.map((section, position) => position === index ? { ...section, ...changes } : section))
  }

  function moveSection(index, direction) {
    const destination = index + direction
    if (destination < 0 || destination >= sections.length) return
    setSections((current) => {
      const next = [...current]
      const [section] = next.splice(index, 1)
      next.splice(destination, 0, section)
      return next
    })
  }

  function addDepartment() {
    const id = `department-${Date.now()}`
    pendingDepartmentId.current = id
    setSections((current) => [...current, { id, name: 'NEW DEPARTMENT', type: 'department', memberIds: [], subteams: [], _asset: {} }])
  }

  function addSubteam(sectionIndex) {
    const section = sections[sectionIndex]
    updateSection(sectionIndex, {
      subteams: [...(section.subteams || []), { id: `${section.id}-subteam-${Date.now()}`, name: 'NEW SUBTEAM', memberIds: [], _asset: {} }],
    })
  }

  function updateSubteam(sectionIndex, subteamIndex, changes) {
    updateSection(sectionIndex, {
      subteams: sections[sectionIndex].subteams.map((subteam, position) => position === subteamIndex ? { ...subteam, ...changes } : subteam),
    })
  }

  function removeSection(index) {
    if (!window.confirm(`Remove “${sections[index].name}” from the current team page? Existing images remain in Storage until cleaned up.`)) return
    setSections((current) => current.filter((_, position) => position !== index))
  }

  async function savePage() {
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const uploadedHero = await uploadAsset(heroAsset, 'team-images', 'team-hero')
      const nextSections = []
      for (const section of sections) {
        const sectionAsset = await uploadAsset(section._asset, `team-images/${safeAssetName(section.id)}`, `${section.id}-team`)
        const subteams = []
        for (const subteam of section.subteams || []) {
          const subteamAsset = await uploadAsset(subteam._asset, `team-images/${safeAssetName(section.id)}`, subteam.id)
          subteams.push({
            ...subteam,
            imageUrl: subteamAsset.url,
            imageStoragePath: subteamAsset.storagePath,
            _asset: undefined,
          })
        }
        nextSections.push({
          ...section,
          backgroundImageUrl: sectionAsset.url,
          backgroundImageStoragePath: sectionAsset.storagePath,
          subteams,
          _asset: undefined,
        })
      }

      const response = await fetch('/api/admin/team/page', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...page,
          heroImageUrl: uploadedHero.url,
          heroImageStoragePath: uploadedHero.storagePath,
          sections: nextSections,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to save team page.')
      setMessage('Current team page saved.')
      await onReload()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function publishSnapshot() {
    if (!window.confirm(`Publish ${page.yearLabel} as a locked historical snapshot? This action copies the current sections and member profiles.`)) return
    setPublishing(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/admin/team/snapshot', { method: 'POST' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to publish snapshot.')
      setMessage(`${page.yearLabel} is now available as a historical team page.`)
      await onReload()
    } catch (publishError) {
      setError(publishError.message)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="grid gap-6 rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[1fr_300px]">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#25487D]">CURRENT PAGE</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Page title<input value={page.title || ''} onChange={(e) => setPage((current) => ({ ...current, title: e.target.value }))} className="admin-input" /></label>
            <label className="text-sm font-medium">Academic year<input value={page.yearLabel || ''} onChange={(e) => setPage((current) => ({ ...current, yearLabel: e.target.value }))} placeholder="2025-2026" className="admin-input" /></label>
            <label className="text-sm font-medium sm:col-span-2">Hero image description<input value={page.heroImageAlt || ''} onChange={(e) => setPage((current) => ({ ...current, heroImageAlt: e.target.value }))} className="admin-input" /></label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled={saving} onClick={savePage} className="rounded-xl bg-[#161329] px-5 py-3 text-sm font-medium text-white hover:bg-[#25487D] disabled:opacity-50">{saving ? 'Saving…' : 'Save current page'}</button>
            <button type="button" disabled={publishing || pages.some((item) => item.id === page.yearLabel)} onClick={publishSnapshot} className="rounded-xl border border-[#161329]/12 bg-white px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40">{publishing ? 'Publishing…' : pages.some((item) => item.id === page.yearLabel) ? 'Historical snapshot published' : 'Publish historical snapshot'}</button>
          </div>
        </div>
        <OptimizedAssetField value={heroAsset} onChange={setHeroAsset} label="Hero team photo" compact />
      </section>

      <div className="flex items-center justify-between">
        <div><h2 className="font-josefin text-2xl font-semibold">Page sections</h2><p className="mt-1 text-sm text-[#161329]/45">Order departments and assign members to their photographed subgroups.</p></div>
        <button type="button" onClick={addDepartment} className="inline-flex items-center gap-2 rounded-xl border border-[#161329]/10 bg-white px-4 py-2.5 text-sm font-medium"><AdminIcon name="plus" className="h-4 w-4" />Department</button>
      </div>

      {sections.map((section, sectionIndex) => (
        <section key={section.id} ref={(element) => { if (section.id === pendingDepartmentId.current) pendingDepartmentElement.current = element }} className="scroll-mt-20 overflow-hidden rounded-2xl border border-[#161329]/8 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#161329]/8 bg-[#FAF9F6] px-5 py-4">
            <span className="rounded-full bg-[#25487D]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#25487D]">{section.type}</span>
            <input data-department-name value={section.name || ''} onChange={(e) => updateSection(sectionIndex, { name: e.target.value })} className="min-w-0 flex-1 bg-transparent font-josefin text-xl font-semibold outline-none" />
            <button type="button" disabled={sectionIndex === 0} onClick={() => moveSection(sectionIndex, -1)} className="rounded-lg border border-[#161329]/10 bg-white px-2.5 py-1.5 text-xs disabled:opacity-30">↑</button>
            <button type="button" disabled={sectionIndex === sections.length - 1} onClick={() => moveSection(sectionIndex, 1)} className="rounded-lg border border-[#161329]/10 bg-white px-2.5 py-1.5 text-xs disabled:opacity-30">↓</button>
            {section.type !== 'executive' ? <button type="button" onClick={() => removeSection(sectionIndex)} className="rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50">Remove</button> : null}
          </div>
          <div className="grid gap-6 p-5 lg:grid-cols-[260px_1fr]">
            <div className="space-y-4">
              <OptimizedAssetField value={section._asset} onChange={(value) => updateSection(sectionIndex, { _asset: value })} label={section.type === 'executive' ? 'Executive team photo' : 'Department photo'} compact />
              <label className="block text-sm font-medium">Image description<input value={section.backgroundImageAlt || ''} onChange={(e) => updateSection(sectionIndex, { backgroundImageAlt: e.target.value })} className="admin-input" /></label>
            </div>
            {section.type === 'executive' ? (
              <div><p className="mb-2 text-sm font-medium">Executive members</p><MemberPicker members={members} selectedIds={section.memberIds || []} executiveOnly onChange={(memberIds) => updateSection(sectionIndex, { memberIds })} /><p className="mt-2 text-[10px] text-[#161329]/35">Card order follows each profile’s executive display order.</p></div>
            ) : (
              <div className="space-y-4">
                {(section.subteams || []).map((subteam, subteamIndex) => (
                  <div key={subteam.id} className="rounded-xl border border-[#161329]/10 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <input value={subteam.name || ''} onChange={(e) => updateSubteam(sectionIndex, subteamIndex, { name: e.target.value })} className="min-w-0 flex-1 border-b border-[#161329]/10 pb-1 font-medium outline-none focus:border-[#25487D]" />
                      <button type="button" onClick={() => updateSection(sectionIndex, { subteams: section.subteams.filter((_, index) => index !== subteamIndex) })} className="text-xs text-red-600">Remove</button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                      <div><OptimizedAssetField value={subteam._asset} onChange={(value) => updateSubteam(sectionIndex, subteamIndex, { _asset: value })} label="Subgroup photo" compact /><input value={subteam.imageAlt || ''} onChange={(e) => updateSubteam(sectionIndex, subteamIndex, { imageAlt: e.target.value })} placeholder="Image description" className="admin-input mt-2" /></div>
                      <div><p className="mb-2 text-xs font-medium">Members in this photo</p><MemberPicker members={members} selectedIds={subteam.memberIds || []} onChange={(memberIds) => updateSubteam(sectionIndex, subteamIndex, { memberIds })} /></div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addSubteam(sectionIndex)} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#25487D]/40 px-4 py-2.5 text-xs font-medium text-[#25487D]"><AdminIcon name="plus" className="h-4 w-4" />Add subgroup</button>
              </div>
            )}
          </div>
        </section>
      ))}

      {pages.length ? (
        <section className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-josefin text-xl font-semibold">Historical pages</h2>
          <p className="mt-1 text-sm text-[#161329]/45">Published snapshots preserve member information for their original academic year.</p>
          <div className="mt-4 flex flex-wrap gap-2">{pages.map((historicalPage) => <span key={historicalPage.id} className="rounded-xl border border-[#161329]/10 bg-[#F8F7F3] px-4 py-2 text-sm font-medium">{historicalPage.yearLabel || historicalPage.id}</span>)}</div>
        </section>
      ) : null}
    </div>
  )
}
