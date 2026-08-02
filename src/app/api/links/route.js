import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { isLinkActive } from '@/lib/link-hub'
import { serializeDocument } from '@/lib/admin-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection('links').get()
    const links = snapshot.docs
      .map(serializeDocument)
      .filter((link) => isLinkActive(link))
      .sort((a, b) => (a.order || 0) - (b.order || 0) || a.title.localeCompare(b.title))
    return NextResponse.json({ links }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (error) {
    console.error('Unable to load public links:', error)
    return NextResponse.json({ error: 'Unable to load links.' }, { status: 500 })
  }
}
