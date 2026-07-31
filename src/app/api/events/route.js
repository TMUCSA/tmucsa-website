import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { serializeDocument } from '@/lib/admin-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection('events').get()
    const events = snapshot.docs
      .map(serializeDocument)
      .filter((event) => !event.status || event.status === 'published')
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    return NextResponse.json({ events }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (error) {
    console.error('Unable to load public events:', error)
    return NextResponse.json({ error: 'Unable to load events.' }, { status: 500 })
  }
}
