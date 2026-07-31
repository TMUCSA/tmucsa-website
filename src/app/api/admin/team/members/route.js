import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

function slugify(value) {
  return String(value || 'member').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'member'
}

export function memberPayload(body) {
  const firstName = String(body.firstName || '').trim()
  const lastName = String(body.lastName || '').trim()
  const displayName = String(body.displayName || `${firstName} ${lastName}`).trim()
  const program = String(body.program || '').trim()
  const roleTitle = String(body.roleTitle || '').trim()
  const year = Number(body.year)
  const isExecutive = Boolean(body.isExecutive)
  const executiveOrder = isExecutive ? Math.max(1, Number(body.executiveOrder) || 1) : 0

  if (!firstName || !lastName || !displayName || !program || !roleTitle || !Number.isInteger(year) || year < 0 || year > 10) {
    return { error: 'First name, last name, display name, program, role, and a valid year are required.' }
  }

  return {
    data: {
      firstName,
      lastName,
      displayName,
      program,
      roleTitle,
      year,
      isExecutive,
      executiveOrder,
      isActive: body.isActive !== false,
      headshotUrl: String(body.headshotUrl || ''),
      headshotAlt: String(body.headshotAlt || (body.headshotUrl ? `${displayName} headshot` : '')),
      headshotStoragePath: String(body.headshotStoragePath || ''),
    },
  }
}

export async function POST(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error

  try {
    const body = await request.json()
    const payload = memberPayload(body)
    if (payload.error) return NextResponse.json({ error: payload.error }, { status: 400 })

    const db = getAdminDb()
    const baseId = slugify(payload.data.displayName)
    let id = baseId
    let suffix = 2
    while ((await db.collection('members').doc(id).get()).exists) id = `${baseId}-${suffix++}`

    const reference = db.collection('members').doc(id)
    await reference.set({
      ...payload.data,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: authorization.admin.uid,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: authorization.admin.uid,
    })
    await writeAuditLog(db, authorization.admin, 'create', 'member', id, `Created member “${payload.data.displayName}”`)
    return NextResponse.json({ member: serializeDocument(await reference.get()) }, { status: 201 })
  } catch (error) {
    console.error('Unable to create member:', error)
    return NextResponse.json({ error: 'Unable to create the member.' }, { status: 500 })
  }
}
