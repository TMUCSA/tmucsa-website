import { NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

function dateFromInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null
  const date = new Date(`${value}T12:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function cleanImages(images) {
  if (!Array.isArray(images)) return []
  return images
    .filter((image) => image?.url && image?.storagePath)
    .slice(0, 30)
    .map((image, index) => ({
      storagePath: String(image.storagePath),
      url: String(image.url),
      alt: String(image.alt || ''),
      width: Number(image.width) || 0,
      height: Number(image.height) || 0,
      bytes: Number(image.bytes) || 0,
      focalX: Math.min(1, Math.max(0, Number(image.focalX) || 0.5)),
      focalY: Math.min(1, Math.max(0, Number(image.focalY) || 0.5)),
      order: index + 1,
    }))
}

export function eventPayload(body) {
  const name = String(body.name || '').trim()
  const description = String(body.description || '').trim()
  const url = String(body.url || '').trim()
  const date = dateFromInput(body.date)
  const status = ['published', 'draft', 'archived'].includes(body.status) ? body.status : 'draft'
  const images = cleanImages(body.images)

  if (!name || !description || !date) {
    return { error: 'Name, description, and event date are required.' }
  }
  if (status === 'published' && images.length === 0) {
    return { error: 'A published event needs at least one image.' }
  }
  if (url) {
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol')
    } catch {
      return { error: 'Details URL must be a valid http or https address.' }
    }
  }

  return {
    data: {
      name,
      description,
      date: Timestamp.fromDate(date),
      dateKey: body.date,
      url,
      status,
      images,
      imageUrls: images.map((image) => image.url),
    },
  }
}

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error

  try {
    const snapshot = await getAdminDb().collection('events').get()
    const events = snapshot.docs
      .map(serializeDocument)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Unable to list events:', error)
    return NextResponse.json({ error: 'Unable to load events.' }, { status: 500 })
  }
}

export async function POST(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error

  try {
    const body = await request.json()
    const payload = eventPayload(body)
    if (payload.error) return NextResponse.json({ error: payload.error }, { status: 400 })

    const db = getAdminDb()
    const reference = db.collection('events').doc()
    await reference.set({
      ...payload.data,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: authorization.admin.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: authorization.admin.uid,
      archivedAt: payload.data.status === 'archived' ? FieldValue.serverTimestamp() : null,
      archivedBy: payload.data.status === 'archived' ? authorization.admin.uid : null,
    })
    await writeAuditLog(db, authorization.admin, 'create', 'event', reference.id, `Created event “${payload.data.name}”`)
    const saved = await reference.get()
    return NextResponse.json({ event: serializeDocument(saved) }, { status: 201 })
  } catch (error) {
    console.error('Unable to create event:', error)
    return NextResponse.json({ error: 'Unable to create the event.' }, { status: 500 })
  }
}
