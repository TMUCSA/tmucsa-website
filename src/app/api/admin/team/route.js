import { NextResponse } from 'next/server'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error

  try {
    const db = getAdminDb()
    const currentReference = db.doc('teamPages/current')
    const [membersSnapshot, pagesSnapshot, currentSnapshot, sectionsSnapshot] = await Promise.all([
      db.collection('members').get(),
      db.collection('teamPages').get(),
      currentReference.get(),
      currentReference.collection('sections').get(),
    ])

    const members = membersSnapshot.docs
      .map(serializeDocument)
      .sort((a, b) => String(a.displayName || '').localeCompare(String(b.displayName || '')))
    const pages = pagesSnapshot.docs
      .filter((document) => document.id !== 'current')
      .map(serializeDocument)
      .sort((a, b) => String(b.yearLabel || b.id).localeCompare(String(a.yearLabel || a.id)))
    const sections = sectionsSnapshot.docs
      .map(serializeDocument)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    return NextResponse.json({
      members,
      pages,
      currentPage: currentSnapshot.exists ? serializeDocument(currentSnapshot) : null,
      sections,
    })
  } catch (error) {
    console.error('Unable to load team admin data:', error)
    return NextResponse.json({ error: 'Unable to load team information.' }, { status: 500 })
  }
}
