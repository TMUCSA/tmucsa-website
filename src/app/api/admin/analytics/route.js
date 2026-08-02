import { NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-api'
import { getAdminDb } from '@/lib/firebase-admin'
import { analyticsDateKey } from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function recentDateKeys(days) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date()
    date.setUTCHours(12, 0, 0, 0)
    date.setUTCDate(date.getUTCDate() - (days - index - 1))
    return analyticsDateKey(date)
  })
}

function addMap(target, source = {}) {
  Object.entries(source).forEach(([key, value]) => { target[key] = (target[key] || 0) + (Number(value) || 0) })
}

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error
  try {
    const days = Math.max(7, Math.min(90, Number(new URL(request.url).searchParams.get('days')) || 30))
    const db = getAdminDb()
    const keys = recentDateKeys(days)
    const references = keys.map((key) => db.collection('analyticsDaily').doc(key))
    const [snapshots, linksSnapshot] = await Promise.all([db.getAll(...references), db.collection('links').get()])
    const pages = {}
    const linkClicks = {}
    const totals = { pageViews: 0, promptViews: 0, promptClicks: 0 }
    const series = snapshots.map((snapshot, index) => {
      const data = snapshot.data() || {}
      totals.pageViews += Number(data.pageViews) || 0
      totals.promptViews += Number(data.promptViews) || 0
      totals.promptClicks += Number(data.promptClicks) || 0
      addMap(pages, data.pages)
      addMap(linkClicks, data.linkClicks)
      return { date: keys[index], pageViews: Number(data.pageViews) || 0 }
    })
    const titles = Object.fromEntries(linksSnapshot.docs.map((document) => [document.id, document.data().title]))
    const topLinks = Object.entries(linkClicks)
      .map(([id, clicks]) => ({ id, title: titles[id] || 'Deleted link', clicks }))
      .sort((a, b) => b.clicks - a.clicks)
    const topPages = Object.entries(pages)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
    return NextResponse.json({ days, totals, series, topLinks, topPages })
  } catch (error) {
    console.error('Unable to load analytics:', error)
    return NextResponse.json({ error: 'Unable to load analytics.' }, { status: 500 })
  }
}
