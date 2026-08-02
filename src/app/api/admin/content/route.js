import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'
import { defaultSiteContent, withLinksNavigation } from '@/lib/site-content'

export const runtime = 'nodejs'

const allowedSections = new Set(['home', 'contact', 'global'])

function cleanContent(section, data) {
  const defaults = defaultSiteContent[section]
  const clean = {}
  Object.keys(defaults).forEach((key) => {
    if (typeof defaults[key] === 'string') clean[key] = String(data[key] ?? defaults[key]).slice(0, 5000)
    else if (Array.isArray(defaults[key])) {
      const items = Array.isArray(data[key]) ? data[key].slice(0, 10).map((item) => ({ href: String(item.href || ''), text: String(item.text || '') })) : defaults[key]
      clean[key] = section === 'global' && key === 'navItems' ? withLinksNavigation(items).slice(0, 10) : items
    } else if (typeof defaults[key] === 'object') {
      clean[key] = Object.fromEntries(Object.keys(defaults[key]).map((nestedKey) => [nestedKey, String(data[key]?.[nestedKey] ?? defaults[key][nestedKey])]))
    }
  })
  return clean
}

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error
  const snapshot = await getAdminDb().collection('siteContent').get()
  const content = { ...defaultSiteContent }
  snapshot.docs.forEach((document) => {
    if (allowedSections.has(document.id)) content[document.id] = { ...content[document.id], ...serializeDocument(document) }
  })
  content.global.navItems = withLinksNavigation(content.global.navItems)
  return NextResponse.json({ content })
}

export async function PATCH(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  try {
    const body = await request.json()
    const section = String(body.section || '')
    if (!allowedSections.has(section)) return NextResponse.json({ error: 'Unknown content section.' }, { status: 400 })
    const content = cleanContent(section, body.data || {})
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
