import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { linkPayload } from '@/lib/link-hub'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error
  const snapshot = await getAdminDb().collection('links').get()
  const links = snapshot.docs.map(serializeDocument).sort((a, b) => (a.order || 0) - (b.order || 0))
  return NextResponse.json({ links })
}

export async function POST(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  try {
    const payload = linkPayload(await request.json())
    if (payload.error) return NextResponse.json({ error: payload.error }, { status: 400 })
    const db = getAdminDb()
    const reference = db.collection('links').doc()
    await reference.set({
      ...payload.data,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: authorization.admin.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: authorization.admin.uid,
    })
    await writeAuditLog(db, authorization.admin, 'create', 'link', reference.id, `Created link “${payload.data.title}”`)
    return NextResponse.json({ link: serializeDocument(await reference.get()) }, { status: 201 })
  } catch (error) {
    console.error('Unable to create link:', error)
    return NextResponse.json({ error: 'Unable to create the link.' }, { status: 500 })
  }
}
