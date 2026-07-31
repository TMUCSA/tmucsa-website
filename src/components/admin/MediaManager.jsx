'use client'

import { useEffect, useState } from 'react'
import AdminPageHeader from './AdminPageHeader'
import AdminIcon from './AdminIcon'
import OptimizedAssetField from './OptimizedAssetField'
import { safeAssetName, uploadAdminImage } from '@/lib/client-storage'

function asset(document) {
  return { url: document?.imageUrl || '', storagePath: document?.storagePath || '', bytes: document?.bytes || 0 }
}

async function uploadIfNeeded(item, folder, name) {
  if (!item._asset?.file) return { url: item._asset?.url || item.imageUrl || '', storagePath: item._asset?.storagePath || item.storagePath || '' }
  const unique = crypto.randomUUID ? crypto.randomUUID() : Date.now()
  return uploadAdminImage(`${folder}/${safeAssetName(name)}-${unique}.webp`, item._asset.file)
}

export default function MediaManager() {
  const [carousel, setCarousel] = useState([])
  const [home, setHome] = useState({ top: {}, bottom: {} })
  const [contact, setContact] = useState({ primary: {}, secondary: {} })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/media', { cache: 'no-store' }).then(async (response) => {
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error)
      setCarousel(payload.carousel.map((image) => ({ ...image, _asset: asset(image) })))
      setHome({ top: { ...(payload.home.top || {}), _asset: asset(payload.home.top) }, bottom: { ...(payload.home.bottom || {}), _asset: asset(payload.home.bottom) } })
      setContact({ primary: { ...(payload.contact.primary || {}), _asset: asset(payload.contact.primary) }, secondary: { ...(payload.contact.secondary || {}), _asset: asset(payload.contact.secondary) } })
    }).catch((loadError) => setError(loadError.message || 'Unable to load media.')).finally(() => setLoading(false))
  }, [])

  function updateCarousel(index, changes) { setCarousel((current) => current.map((item, position) => position === index ? { ...item, ...changes } : item)) }
  function move(index, direction) { const destination = index + direction; if (destination < 0 || destination >= carousel.length) return; setCarousel((current) => { const next = [...current]; const [item] = next.splice(index, 1); next.splice(destination, 0, item); return next }) }

  async function save() {
    setSaving(true); setMessage(''); setError('')
    try {
      const uploadedCarousel = []
      for (let index = 0; index < carousel.length; index += 1) {
        const image = carousel[index]
        const uploaded = await uploadIfNeeded(image, 'carousel-images', `carousel-${index + 1}`)
        uploadedCarousel.push({ id: image.id, imageUrl: uploaded.url, storagePath: uploaded.storagePath, imageAlt: image.imageAlt || `TMUCSA carousel photo ${index + 1}` })
      }
      const uploadedHome = {}
      for (const position of ['top', 'bottom']) {
        const image = home[position]
        const uploaded = await uploadIfNeeded(image, 'home-page', position)
        uploadedHome[position] = { imageUrl: uploaded.url, storagePath: uploaded.storagePath, imageAlt: image.imageAlt || `TMUCSA homepage ${position} photo` }
      }
      const uploadedContact = {}
      for (const position of ['primary', 'secondary']) {
        const image = contact[position]
        const uploaded = await uploadIfNeeded(image, 'contact-page', position)
        uploadedContact[position] = { imageUrl: uploaded.url, storagePath: uploaded.storagePath, imageAlt: image.imageAlt || `TMUCSA contact page ${position} photo` }
      }
      const response = await fetch('/api/admin/media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carousel: uploadedCarousel, home: uploadedHome, contact: uploadedContact }) })
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Unable to save media.')
      setMessage('Website images saved.')
      setCarousel(uploadedCarousel.map((image) => ({ ...image, _asset: asset(image) })))
      setHome({ top: { ...uploadedHome.top, _asset: asset(uploadedHome.top) }, bottom: { ...uploadedHome.bottom, _asset: asset(uploadedHome.bottom) } })
      setContact({ primary: { ...uploadedContact.primary, _asset: asset(uploadedContact.primary) }, secondary: { ...uploadedContact.secondary, _asset: asset(uploadedContact.secondary) } })
    } catch (saveError) { setError(saveError.message) } finally { setSaving(false) }
  }

  if (loading) return <p className="py-24 text-center text-sm text-[#161329]/40">Loading media…</p>

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <AdminPageHeader eyebrow="WEBSITE ASSETS" title="Media" description="Manage the images used across the homepage and contact page. Every new file is converted and optimized before upload." actions={<button onClick={save} disabled={saving} className="rounded-xl bg-[#161329] px-6 py-3 text-sm font-medium text-white hover:bg-[#25487D] disabled:opacity-50">{saving ? 'Uploading & saving…' : 'Save media'}</button>} />
      {message ? <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}{error ? <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <section className="mt-8 rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between"><div><h2 className="font-josefin text-2xl font-semibold">Hero carousel</h2><p className="mt-1 text-sm text-[#161329]/45">The opening sequence on the homepage.</p></div><button onClick={() => setCarousel((current) => [...current, { id: `new-${Date.now()}`, imageAlt: '', _asset: {} }])} disabled={carousel.length >= 10} className="inline-flex items-center gap-2 rounded-xl border border-[#161329]/10 px-4 py-2.5 text-sm font-medium disabled:opacity-40"><AdminIcon name="plus" className="h-4 w-4" />Image</button></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{carousel.map((image, index) => <article key={image.id} className="rounded-xl border border-[#161329]/10 p-3"><OptimizedAssetField value={image._asset} onChange={(value) => updateCarousel(index, { _asset: value })} label={`Slide ${index + 1}`} compact /><input value={image.imageAlt || ''} onChange={(e) => updateCarousel(index, { imageAlt: e.target.value })} placeholder="Image description" className="admin-input" /><div className="mt-3 flex gap-2"><button onClick={() => move(index, -1)} disabled={!index} className="rounded-lg border px-2.5 py-1.5 text-xs disabled:opacity-30">←</button><button onClick={() => move(index, 1)} disabled={index === carousel.length - 1} className="rounded-lg border px-2.5 py-1.5 text-xs disabled:opacity-30">→</button><button onClick={() => setCarousel((current) => current.filter((_, position) => position !== index))} className="ml-auto text-xs text-red-600">Remove</button></div></article>)}</div>
      </section>
      <section className="mt-6 rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-7"><h2 className="font-josefin text-2xl font-semibold">Story images</h2><p className="mt-1 text-sm text-[#161329]/45">The two photographs alongside the goal, offering, values, and join-us copy.</p><div className="mt-6 grid gap-6 sm:grid-cols-2">{['top', 'bottom'].map((position) => <div key={position}><OptimizedAssetField value={home[position]._asset} onChange={(value) => setHome((current) => ({ ...current, [position]: { ...current[position], _asset: value } }))} label={`${position[0].toUpperCase()}${position.slice(1)} story image`} /><input value={home[position].imageAlt || ''} onChange={(e) => setHome((current) => ({ ...current, [position]: { ...current[position], imageAlt: e.target.value } }))} placeholder="Image description" className="admin-input" /></div>)}</div></section>
      <section className="mt-6 rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-7"><h2 className="font-josefin text-2xl font-semibold">Contact page images</h2><p className="mt-1 text-sm text-[#161329]/45">The layered team and event photographs in the contact page hero.</p><div className="mt-6 grid gap-6 sm:grid-cols-2">{['primary', 'secondary'].map((position) => <div key={position}><OptimizedAssetField value={contact[position]._asset} onChange={(value) => setContact((current) => ({ ...current, [position]: { ...current[position], _asset: value } }))} label={position === 'primary' ? 'Main team image' : 'Secondary event image'} help={position === 'primary' ? 'A portrait-oriented crop works best.' : 'A landscape-oriented crop works best.'} /><input value={contact[position].imageAlt || ''} onChange={(e) => setContact((current) => ({ ...current, [position]: { ...current[position], imageAlt: e.target.value } }))} placeholder="Image description" className="admin-input" /></div>)}</div></section>
    </main>
  )
}
