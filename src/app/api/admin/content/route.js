import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'
import { siteContentSchema, validateContent } from '@/lib/site-content'

export const runtime = 'nodejs'

const allowedSections = new Set(['home', 'contact', 'global'])

function cleanContent(section, data) {
  const schema = siteContentSchema[section]
  validateContent(data, schema, section)
  const clean = {}
  Object.keys(schema).forEach((key) => {
    if (schema[key] === 'string') clean[key] = data[key].slice(0, 5000)
    else if (schema[key] === 'navigation') {
      clean[key] = data[key].slice(0, 10).map((item) => ({ href: item.href, text: item.text }))
    } else if (typeof schema[key] === 'object') {
      clean[key] = Object.fromEntries(Object.keys(schema[key]).map((nestedKey) => [nestedKey, data[key][nestedKey]]))
    }
  })
  return clean
}

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error
  const snapshot = await getAdminDb().collection('siteContent').get()
  const content = {}
  snapshot.docs.forEach((document) => {
    if (allowedSections.has(document.id)) content[document.id] = serializeDocument(document)
  })
  return NextResponse.json({ content })
}

export async function PATCH(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  try {
    const body = await request.json()
    const section = String(body.section || '')
    if (!allowedSections.has(section)) return NextResponse.json({ error: 'Unknown content section.' }, { status: 400 })
    let content
    try { content = cleanContent(section, body.data) }
    catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) }
    const db = getAdminDb()
    await db.collection('siteContent').doc(section).set({
      ...content,
      ...(section === 'contact' ? {
        intro: FieldValue.delete(),
        email: FieldValue.delete(),
        address: FieldValue.delete(),
        room: FieldValue.delete(),
        officeDescription: FieldValue.delete(),
        meetingDescription: FieldValue.delete(),
        meetingUrl: FieldValue.delete(),
      } : {}),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: authorization.admin.uid,
    }, { merge: true })
    await writeAuditLog(db, authorization.admin, 'update', 'siteContent', section, `Updated ${section} website content`)
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Unable to update website content:', error)
    return NextResponse.json({ error: 'Unable to save website content.' }, { status: 500 })
  }
}
