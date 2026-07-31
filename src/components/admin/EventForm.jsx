'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminIcon from './AdminIcon'
import EventImageManager from './EventImageManager'
import { deleteAdminImage, uploadAdminImage } from '@/lib/client-storage'

function dateInputValue(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function storagePathFromUrl(url) {
  try {
    const match = new URL(url).pathname.match(/\/o\/([^/]+)$/)
    return match ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

function slugify(value) {
  return String(value || 'event')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70) || 'event'
}

function normalizedImages(event) {
  const images = event?.images?.length
    ? event.images
    : (event?.imageUrls || []).map((url) => ({ url, storagePath: storagePathFromUrl(url) }))
  return images.map((image, index) => ({
    ...image,
    localId: image.storagePath || image.url || `legacy-${index}`,
    focalX: image.focalX ?? 0.5,
    focalY: image.focalY ?? 0.5,
    alt: image.alt || '',
  }))
}

export default function EventForm({ eventId = null }) {
  const router = useRouter()
  const editing = Boolean(eventId)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const [form, setForm] = useState({ name: '', description: '', date: '', url: '', status: 'published' })
  const [images, setImages] = useState([])

  useEffect(() => {
    if (!eventId) return
    let active = true
    fetch(`/api/admin/events/${eventId}`)
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Unable to load event.')
        if (!active) return
        setForm({
          name: payload.event.name || '',
          description: payload.event.description || '',
          date: payload.event.dateKey || dateInputValue(payload.event.date),
          url: payload.event.url || '',
          status: payload.event.status || 'published',
        })
        setImages(normalizedImages(payload.event))
      })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [eventId])

  const readyImages = useMemo(() => images.filter((image) => !image.processing), [images])
  const processing = images.some((image) => image.processing)

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (processing) {
      setError('Please wait for every image to finish processing.')
      return
    }
    if (form.status === 'published' && readyImages.length === 0) {
      setError('Add at least one photo before publishing.')
      return
    }

    setSaving(true)
    setError('')
    const newlyUploaded = []

    try {
      const completedImages = []
      for (let index = 0; index < readyImages.length; index += 1) {
        const image = readyImages[index]
        if (!image.file) {
          completedImages.push(image)
          continue
        }

        setUploadMessage(`Uploading photo ${index + 1} of ${readyImages.length}…`)
        const unique = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${index}`
        const storagePath = `events/${slugify(form.name)}/${unique}-${image.file.name}`
        const uploaded = await uploadAdminImage(storagePath, image.file, (progress) => {
          setUploadMessage(`Uploading photo ${index + 1} of ${readyImages.length} · ${progress}%`)
        })
        newlyUploaded.push(storagePath)
        completedImages.push({
          ...image,
          ...uploaded,
          bytes: image.file.size,
        })
      }

      setUploadMessage('Saving event…')
      const payload = {
        ...form,
        images: completedImages.map((image, index) => ({
          storagePath: image.storagePath,
          url: image.url,
          alt: image.alt || `${form.name} photo ${index + 1}`,
          width: image.width || 0,
          height: image.height || 0,
          bytes: image.bytes || image.file?.size || 0,
          focalX: image.focalX ?? 0.5,
          focalY: image.focalY ?? 0.5,
        })),
      }
      const response = await fetch(editing ? `/api/admin/events/${eventId}` : '/api/admin/events', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save the event.')

      router.push('/admin/events')
      router.refresh()
    } catch (saveError) {
      if (newlyUploaded.length) {
        await Promise.allSettled(newlyUploaded.map(deleteAdminImage))
      }
      setError(saveError.message || 'Unable to save the event.')
      setUploadMessage('')
      setSaving(false)
    }
  }

  async function permanentlyDelete() {
    if (!editing || form.status !== 'archived') return
    const confirmation = window.prompt(`Type DELETE to permanently remove “${form.name}” and its managed images.`)
    if (confirmation !== 'DELETE') return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/events/${eventId}?permanent=true`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to delete event.')
      router.push('/admin/events')
      router.refresh()
    } catch (deleteError) {
      setError(deleteError.message)
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#161329]/45">Loading event…</div>
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin/events" className="mb-4 inline-flex items-center gap-2 text-sm text-[#161329]/45 transition hover:text-[#25487D]">← Events</Link>
            <h1 className="font-josefin text-3xl font-semibold sm:text-4xl">{editing ? 'Edit event' : 'Add a past event'}</h1>
            <p className="mt-2 text-sm text-[#161329]/50">Photos are processed in your browser before they are uploaded.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/events" className="rounded-xl border border-[#161329]/10 bg-white px-5 py-3 text-sm font-medium">Cancel</Link>
            <button type="submit" disabled={saving || processing} className="rounded-xl bg-[#161329] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[#161329]/15 transition hover:bg-[#25487D] disabled:cursor-wait disabled:opacity-50">
              {saving ? uploadMessage || 'Saving…' : form.status === 'draft' ? 'Save draft' : 'Publish event'}
            </button>
          </div>
        </div>

        {error ? <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
          <section className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25487D] text-sm font-semibold text-white">1</span><div><h2 className="font-josefin text-xl font-semibold">Event photos</h2><p className="text-xs text-[#161329]/40">Optimize, crop, reorder, and set responsive focal points.</p></div></div>
            <EventImageManager images={images} onChange={setImages} disabled={saving} />
          </section>

          <div className="space-y-6 xl:sticky xl:top-8">
            <section className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25487D] text-sm font-semibold text-white">2</span><h2 className="font-josefin text-xl font-semibold">Event details</h2></div>
              <div className="space-y-5">
                <label className="block text-sm font-medium">Event name<span className="text-red-600"> *</span>
                  <input required maxLength={120} value={form.name} onChange={(event) => setField('name', event.target.value)} className="mt-2 w-full rounded-xl border border-[#161329]/12 bg-[#F8F7F3] px-4 py-3 font-normal outline-none transition focus:border-[#25487D] focus:ring-2 focus:ring-[#25487D]/10" placeholder="e.g. Nightmare at Bardem" />
                </label>
                <label className="block text-sm font-medium">Event date<span className="text-red-600"> *</span>
                  <input required type="date" value={form.date} onChange={(event) => setField('date', event.target.value)} className="mt-2 w-full rounded-xl border border-[#161329]/12 bg-[#F8F7F3] px-4 py-3 font-normal outline-none focus:border-[#25487D]" />
                </label>
                <label className="block text-sm font-medium">Description<span className="text-red-600"> *</span>
                  <textarea required maxLength={1000} rows={5} value={form.description} onChange={(event) => setField('description', event.target.value)} className="mt-2 w-full resize-y rounded-xl border border-[#161329]/12 bg-[#F8F7F3] px-4 py-3 font-normal leading-6 outline-none focus:border-[#25487D]" placeholder="A short description shown on the events page." />
                  <span className="mt-1 block text-right text-[10px] font-normal text-[#161329]/35">{form.description.length}/1000</span>
                </label>
                <label className="block text-sm font-medium">Details or Instagram URL
                  <input type="url" value={form.url} onChange={(event) => setField('url', event.target.value)} className="mt-2 w-full rounded-xl border border-[#161329]/12 bg-[#F8F7F3] px-4 py-3 font-normal outline-none focus:border-[#25487D]" placeholder="https://instagram.com/…" />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-[#161329]/8 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-josefin text-lg font-semibold">Publishing</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[['published', 'Published', 'Visible publicly'], ['draft', 'Draft', 'Admin only'], ...(editing ? [['archived', 'Archived', 'Hidden, recoverable']] : [])].map(([value, label, detail]) => (
                  <button key={value} type="button" onClick={() => setField('status', value)} className={`rounded-xl border p-3 text-left transition ${form.status === value ? 'border-[#25487D] bg-[#25487D]/8' : 'border-[#161329]/10 hover:border-[#25487D]/40'}`}>
                    <span className="block text-sm font-medium">{label}</span><span className="mt-1 block text-[10px] text-[#161329]/40">{detail}</span>
                  </button>
                ))}
              </div>
              {editing && form.status === 'archived' ? <button type="button" onClick={permanentlyDelete} disabled={saving} className="mt-5 text-xs font-medium text-red-600 hover:underline">Permanently delete event and managed images</button> : null}
            </section>
          </div>
        </div>
      </div>
    </form>
  )
}
