import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

export async function POST(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error

  try {
    const db = getAdminDb()
    const currentReference = db.doc('teamPages/current')
    const [current, sections] = await Promise.all([currentReference.get(), currentReference.collection('sections').get()])
    if (!current.exists) return NextResponse.json({ error: 'The current team page does not exist.' }, { status: 404 })
    const page = current.data()
    const yearLabel = String(page.yearLabel || '')
    if (!/^\d{4}-\d{4}$/.test(yearLabel)) return NextResponse.json({ error: 'Set a valid current team year before publishing a snapshot.' }, { status: 400 })

    const pageId = yearLabel
    const snapshotReference = db.doc(`teamPages/${pageId}`)
    const existing = await snapshotReference.get()
    if (existing.exists) return NextResponse.json({ error: `A ${yearLabel} historical page already exists.` }, { status: 409 })

    const memberIds = new Set()
    sections.docs.forEach((section) => {
      const data = section.data()
      ;(data.memberIds || []).forEach((id) => memberIds.add(id))
      ;(data.subteams || []).forEach((subteam) => (subteam.memberIds || []).forEach((id) => memberIds.add(id)))
    })
    const memberSnapshots = await Promise.all(Array.from(memberIds).map((id) => db.collection('members').doc(id).get()))
    const batch = db.batch()
    batch.set(snapshotReference, {
      ...page,
      status: 'published',
      source: 'current',
      publishedAt: FieldValue.serverTimestamp(),
      publishedBy: authorization.admin.uid,
    })
    sections.docs.forEach((section) => batch.set(snapshotReference.collection('sections').doc(section.id), section.data()))
    memberSnapshots.filter((member) => member.exists).forEach((member) => batch.set(snapshotReference.collection('memberSnapshots').doc(member.id), member.data()))
    await batch.commit()
    await writeAuditLog(db, authorization.admin, 'publish', 'teamPage', pageId, `Published historical team page ${yearLabel}`, { members: memberSnapshots.length, sections: sections.size })
    return NextResponse.json({ ok: true, pageId })
  } catch (error) {
    console.error('Unable to snapshot team page:', error)
    return NextResponse.json({ error: 'Unable to publish the historical team page.' }, { status: 500 })
  }
}
