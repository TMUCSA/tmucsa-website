import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase-admin'
import { analyticsDateKey, analyticsPageKey } from '@/lib/analytics'
import { isLinkActive, safeDocumentId } from '@/lib/link-hub'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()
    const type = String(body.type || '')
    const page = analyticsPageKey(body.path)
    const linkId = String(body.linkId || '')
    const db = getAdminDb()
    let increments = null

    if (type === 'page_view' && page) {
      increments = { pageViews: FieldValue.increment(1), pages: { [page]: FieldValue.increment(1) } }
    } else if (['link_click', 'prompt_view', 'prompt_click'].includes(type) && safeDocumentId(linkId)) {
      const linkSnapshot = await db.collection('links').doc(linkId).get()
      if (!linkSnapshot.exists || !isLinkActive(linkSnapshot.data())) return new NextResponse(null, { status: 204 })
      if (type.startsWith('prompt_') && !linkSnapshot.data().showTicketPrompt) return new NextResponse(null, { status: 204 })
      if (type === 'link_click') increments = { linkClicks: { [linkId]: FieldValue.increment(1) } }
      if (type === 'prompt_view') increments = { promptViews: FieldValue.increment(1) }
      if (type === 'prompt_click') increments = { promptClicks: FieldValue.increment(1), linkClicks: { [linkId]: FieldValue.increment(1) } }
    }

    if (!increments) return NextResponse.json({ error: 'Unknown analytics event.' }, { status: 400 })
    const date = analyticsDateKey()
    await db.collection('analyticsDaily').doc(date).set({
      date,
      ...increments,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Unable to record analytics:', error)
    return new NextResponse(null, { status: 204 })
  }
}
