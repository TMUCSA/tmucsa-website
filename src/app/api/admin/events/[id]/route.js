import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin'
import { eventPayload } from '../route'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

function safeId(value) {
  return /^[A-Za-z0-9_-]{1,160}$/.test(value)
}

function storagePathFromUrl(url) {
  try {
    const match = new URL(url).pathname.match(/\/o\/([^/]+)$/)
    return match ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

function managedEventPaths(data) {
  if (data.images?.length) return data.images.map((image) => image.storagePath).filter(Boolean)
  return (data.imageUrls || []).map(storagePathFromUrl).filter((path) => path.startsWith('events/'))
}

async function deleteStoragePaths(paths) {
  const bucket = getAdminStorage().bucket()
  await Promise.allSettled(
    paths.filter(Boolean).map((path) => bucket.file(path).delete({ ignoreNotFound: true }))
  )
}

export async function GET(request, { params }) {
  const { id } = await params
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error
  if (!safeId(id)) return NextResponse.json({ error: 'Invalid event ID.' }, { status: 400 })

  const snapshot = await getAdminDb().collection('events').doc(id).get()
  if (!snapshot.exists) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  return NextResponse.json({ event: serializeDocument(snapshot) })
}

export async function PATCH(request, { params }) {
  const { id } = await params
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  if (!safeId(id)) return NextResponse.json({ error: 'Invalid event ID.' }, { status: 400 })

  try {
    const body = await request.json()
    const payload = eventPayload(body)
    if (payload.error) return NextResponse.json({ error: payload.error }, { status: 400 })

    const db = getAdminDb()
    const reference = db.collection('events').doc(id)
    const existing = await reference.get()
    if (!existing.exists) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })

    const previous = existing.data()
    const previousPaths = managedEventPaths(previous)
    const nextPaths = new Set(payload.data.images.map((image) => image.storagePath))
    const removedPaths = previousPaths.filter((path) => path && !nextPaths.has(path))
    const becomingArchived = payload.data.status === 'archived' && previous.status !== 'archived'
    const restoring = previous.status === 'archived' && payload.data.status !== 'archived'

    await reference.update({
      ...payload.data,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: authorization.admin.uid,
      ...(becomingArchived ? { archivedAt: FieldValue.serverTimestamp(), archivedBy: authorization.admin.uid } : {}),
      ...(restoring ? { archivedAt: null, archivedBy: null } : {}),
    })
    if (removedPaths.length) await deleteStoragePaths(removedPaths)
    await writeAuditLog(db, authorization.admin, 'update', 'event', id, `Updated event “${payload.data.name}”`, { removedImages: removedPaths.length })
    return NextResponse.json({ event: serializeDocument(await reference.get()) })
  } catch (error) {
    console.error('Unable to update event:', error)
    return NextResponse.json({ error: 'Unable to update the event.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  if (!safeId(id)) return NextResponse.json({ error: 'Invalid event ID.' }, { status: 400 })

  try {
    const db = getAdminDb()
    const reference = db.collection('events').doc(id)
    const existing = await reference.get()
    if (!existing.exists) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
    const data = existing.data()
    const permanent = new URL(request.url).searchParams.get('permanent') === 'true'

    if (!permanent) {
      await reference.update({
        status: 'archived',
        archivedAt: FieldValue.serverTimestamp(),
        archivedBy: authorization.admin.uid,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: authorization.admin.uid,
      })
      await writeAuditLog(db, authorization.admin, 'archive', 'event', id, `Archived event “${data.name}”`)
      return NextResponse.json({ ok: true, archived: true })
    }

    const storagePaths = managedEventPaths(data)
    await reference.delete()
    await deleteStoragePaths(storagePaths)
    await writeAuditLog(db, authorization.admin, 'delete', 'event', id, `Permanently deleted event “${data.name}”`, { deletedImages: storagePaths.length })
    return NextResponse.json({ ok: true, deleted: true })
  } catch (error) {
    console.error('Unable to delete event:', error)
    return NextResponse.json({ error: 'Unable to remove the event.' }, { status: 500 })
  }
}
