import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

function cleanSection(section, index) {
  const id = String(section.id || '').trim()
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null
  const type = section.type === 'executive' ? 'executive' : 'department'
  const subteams = type === 'department' && Array.isArray(section.subteams)
    ? section.subteams.map((subteam, subteamIndex) => ({
        id: String(subteam.id || `${id}-subteam-${subteamIndex + 1}`).replace(/[^a-zA-Z0-9_-]/g, '-'),
        name: String(subteam.name || '').trim(),
        order: subteamIndex + 1,
        imageUrl: String(subteam.imageUrl || ''),
        imageAlt: String(subteam.imageAlt || ''),
        imageStoragePath: String(subteam.imageStoragePath || ''),
        memberIds: Array.from(new Set((subteam.memberIds || []).map(String))),
      })).filter((subteam) => subteam.name)
    : []
  const memberIds = type === 'department'
    ? Array.from(new Set(subteams.flatMap((subteam) => subteam.memberIds)))
    : Array.from(new Set((section.memberIds || []).map(String)))

  return {
    id,
    data: {
      name: String(section.name || '').trim(),
      type,
      order: index + 1,
      backgroundImageUrl: String(section.backgroundImageUrl || ''),
      backgroundImageAlt: String(section.backgroundImageAlt || ''),
      backgroundImageStoragePath: String(section.backgroundImageStoragePath || ''),
      memberIds,
      ...(type === 'department' ? { subteams } : {}),
    },
  }
}

export async function PATCH(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error

  try {
    const body = await request.json()
    const title = String(body.title || '').trim()
    const yearLabel = String(body.yearLabel || '').trim()
    if (!title || !/^\d{4}-\d{4}$/.test(yearLabel)) {
      return NextResponse.json({ error: 'A title and academic year in YYYY-YYYY format are required.' }, { status: 400 })
    }
    const sections = (body.sections || []).map(cleanSection).filter(Boolean)
    if (!sections.some((section) => section.data.type === 'executive')) {
      return NextResponse.json({ error: 'The team page needs an executives section.' }, { status: 400 })
    }

    const db = getAdminDb()
    const pageReference = db.doc('teamPages/current')
    const existingSections = await pageReference.collection('sections').get()
    const nextIds = new Set(sections.map((section) => section.id))
    const batch = db.batch()
    batch.set(pageReference, {
      title,
      yearLabel,
      heroImageUrl: String(body.heroImageUrl || ''),
      heroImageAlt: String(body.heroImageAlt || ''),
      heroImageStoragePath: String(body.heroImageStoragePath || ''),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: authorization.admin.uid,
    }, { merge: true })
    sections.forEach((section) => batch.set(pageReference.collection('sections').doc(section.id), section.data))
    existingSections.docs.filter((document) => !nextIds.has(document.id)).forEach((document) => batch.delete(document.ref))
    await batch.commit()
    await writeAuditLog(db, authorization.admin, 'update', 'teamPage', 'current', `Updated current team page (${yearLabel})`)
    return NextResponse.json({
      page: serializeDocument(await pageReference.get()),
      sections: (await pageReference.collection('sections').get()).docs.map(serializeDocument),
    })
  } catch (error) {
    console.error('Unable to update team page:', error)
    return NextResponse.json({ error: 'Unable to update the team page.' }, { status: 500 })
  }
}
