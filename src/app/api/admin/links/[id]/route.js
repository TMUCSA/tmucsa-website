import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { linkPayload, safeDocumentId } from '@/lib/link-hub'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

export async function PATCH(request, { params }) {
  const { id } = await params
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  if (!safeDocumentId(id)) return NextResponse.json({ error: 'Invalid link ID.' }, { status: 400 })
  try {
    const payload = linkPayload(await request.json())
    if (payload.error) return NextResponse.json({ error: payload.error }, { status: 400 })
    const db = getAdminDb()
    const reference = db.collection('links').doc(id)
    if (!(await reference.get()).exists) return NextResponse.json({ error: 'Link not found.' }, { status: 404 })
    await reference.update({ ...payload.data, updatedAt: FieldValue.serverTimestamp(), updatedBy: authorization.admin.uid })
    await writeAuditLog(db, authorization.admin, 'update', 'link', id, `Updated link “${payload.data.title}”`)
    return NextResponse.json({ link: serializeDocument(await reference.get()) })
  } catch (error) {
    console.error('Unable to update link:', error)
    return NextResponse.json({ error: 'Unable to update the link.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  if (!safeDocumentId(id)) return NextResponse.json({ error: 'Invalid link ID.' }, { status: 400 })
  const db = getAdminDb()
  const reference = db.collection('links').doc(id)
  const snapshot = await reference.get()
  if (!snapshot.exists) return NextResponse.json({ error: 'Link not found.' }, { status: 404 })
  await reference.delete()
  await writeAuditLog(db, authorization.admin, 'delete', 'link', id, `Deleted link “${snapshot.data().title}”`)
  return NextResponse.json({ ok: true })
}
