import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'
import { memberPayload } from '../route'

export const runtime = 'nodejs'

function validId(value) {
  return /^[a-zA-Z0-9_-]{1,160}$/.test(value)
}

export async function PATCH(request, { params }) {
  const { id } = await params
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  if (!validId(id)) return NextResponse.json({ error: 'Invalid member ID.' }, { status: 400 })

  try {
    const body = await request.json()
    const payload = memberPayload(body)
    if (payload.error) return NextResponse.json({ error: payload.error }, { status: 400 })
    const db = getAdminDb()
    const reference = db.collection('members').doc(id)
    const existing = await reference.get()
    if (!existing.exists) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
    const previousStoragePath = existing.data().headshotStoragePath

    await reference.update({
      ...payload.data,
      ...(payload.data.isActive ? { archivedAt: null, archivedBy: null } : {}),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: authorization.admin.uid,
    })
    if (previousStoragePath && previousStoragePath !== payload.data.headshotStoragePath) {
      await getAdminStorage().bucket().file(previousStoragePath).delete({ ignoreNotFound: true }).catch(() => {})
    }
    await writeAuditLog(db, authorization.admin, 'update', 'member', id, `Updated member “${payload.data.displayName}”`)
    return NextResponse.json({ member: serializeDocument(await reference.get()) })
  } catch (error) {
    console.error('Unable to update member:', error)
    return NextResponse.json({ error: 'Unable to update the member.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  if (!validId(id)) return NextResponse.json({ error: 'Invalid member ID.' }, { status: 400 })

  try {
    const db = getAdminDb()
    const reference = db.collection('members').doc(id)
    const existing = await reference.get()
    if (!existing.exists) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
    const data = existing.data()

    await reference.update({
      isActive: false,
      archivedAt: FieldValue.serverTimestamp(),
      archivedBy: authorization.admin.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: authorization.admin.uid,
    })

    const sections = await db.doc('teamPages/current').collection('sections').get()
    const batch = db.batch()
    sections.docs.forEach((section) => {
      const sectionData = section.data()
      const next = {
        ...sectionData,
        memberIds: (sectionData.memberIds || []).filter((memberId) => memberId !== id),
        subteams: (sectionData.subteams || []).map((subteam) => ({
          ...subteam,
          memberIds: (subteam.memberIds || []).filter((memberId) => memberId !== id),
        })),
      }
      batch.set(section.ref, next)
    })
    await batch.commit()
    await writeAuditLog(db, authorization.admin, 'archive', 'member', id, `Archived member “${data.displayName}”`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Unable to archive member:', error)
    return NextResponse.json({ error: 'Unable to archive the member.' }, { status: 500 })
  }
}
