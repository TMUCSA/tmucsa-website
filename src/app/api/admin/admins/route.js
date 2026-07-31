import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeFirestoreValue } from '@/lib/admin-api'
import {
  adminEmailDocumentId,
  getBootstrapAdminEmails,
  isBootstrapAdminEmail,
  isValidAdminEmail,
  normalizeAdminEmail,
} from '@/lib/admin-auth'
import { getAdminDb } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

function ownerError() {
  return NextResponse.json({ error: 'Only a bootstrap owner can manage administrator access.' }, { status: 403 })
}

async function listAdmins(db) {
  const snapshot = await db.collection('adminUsers').get()
  const owners = Array.from(getBootstrapAdminEmails()).map((email) => ({
    email,
    source: 'owner',
    active: true,
  }))
  const managed = snapshot.docs
    .map((document) => serializeFirestoreValue(document.data()))
    .filter((admin) => admin.active !== false && !isBootstrapAdminEmail(admin.email))
    .map((admin) => ({ ...admin, email: normalizeAdminEmail(admin.email), source: 'managed' }))

  return [...owners, ...managed].sort((a, b) => a.email.localeCompare(b.email))
}

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error
  if (!authorization.admin.isOwner) return ownerError()

  try {
    return NextResponse.json({ admins: await listAdmins(getAdminDb()) })
  } catch (error) {
    console.error('Unable to list administrators:', error)
    return NextResponse.json({ error: 'Unable to load administrators.' }, { status: 500 })
  }
}

export async function POST(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  if (!authorization.admin.isOwner) return ownerError()

  try {
    const body = await request.json()
    const email = normalizeAdminEmail(body.email)
    if (!isValidAdminEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    if (isBootstrapAdminEmail(email)) {
      return NextResponse.json({ error: 'That email is already a bootstrap owner.' }, { status: 409 })
    }

    const db = getAdminDb()
    const reference = db.collection('adminUsers').doc(adminEmailDocumentId(email))
    const existing = await reference.get()
    if (existing.exists && existing.data()?.active !== false) {
      return NextResponse.json({ error: 'That email already has administrator access.' }, { status: 409 })
    }

    await reference.set({
      email,
      active: true,
      addedAt: FieldValue.serverTimestamp(),
      addedBy: authorization.admin.uid,
      addedByEmail: authorization.admin.email,
    })
    await writeAuditLog(db, authorization.admin, 'create', 'adminUser', email, `Granted administrator access to ${email}`)
    return NextResponse.json({ admins: await listAdmins(db) }, { status: 201 })
  } catch (error) {
    console.error('Unable to add administrator:', error)
    return NextResponse.json({ error: 'Unable to add the administrator.' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  if (!authorization.admin.isOwner) return ownerError()

  try {
    const body = await request.json()
    const email = normalizeAdminEmail(body.email)
    if (!email) return NextResponse.json({ error: 'An administrator email is required.' }, { status: 400 })
    if (isBootstrapAdminEmail(email)) {
      return NextResponse.json({ error: 'Bootstrap owners can only be changed through ADMIN_EMAILS in Vercel.' }, { status: 400 })
    }

    const db = getAdminDb()
    const reference = db.collection('adminUsers').doc(adminEmailDocumentId(email))
    const existing = await reference.get()
    if (!existing.exists) return NextResponse.json({ error: 'That administrator no longer exists.' }, { status: 404 })

    await reference.delete()
    await writeAuditLog(db, authorization.admin, 'delete', 'adminUser', email, `Revoked administrator access from ${email}`)
    return NextResponse.json({ admins: await listAdmins(db) })
  } catch (error) {
    console.error('Unable to remove administrator:', error)
    return NextResponse.json({ error: 'Unable to remove the administrator.' }, { status: 500 })
  }
}
