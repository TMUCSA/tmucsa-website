import { Timestamp } from 'firebase-admin/firestore'

export const linkCategories = ['Tickets', 'Membership', 'Hiring', 'Memories', 'Community', 'Other']

export function safeDocumentId(value) {
  return /^[A-Za-z0-9_-]{1,160}$/.test(String(value || ''))
}

function timestampFromInput(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date)
}

export function linkPayload(body) {
  const title = String(body.title || '').trim().slice(0, 120)
  const description = String(body.description || '').trim().slice(0, 240)
  const url = String(body.url || '').trim()
  const category = linkCategories.includes(body.category) ? body.category : 'Other'
  const order = Math.max(0, Math.min(9999, Number(body.order) || 0))
  const startsAt = timestampFromInput(body.startsAt)
  const expiresAt = timestampFromInput(body.expiresAt)

  if (!title || !url) return { error: 'A title and destination URL are required.' }
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol')
  } catch {
    return { error: 'The destination must be a valid http or https URL.' }
  }
  if (body.startsAt && !startsAt) return { error: 'The start date is invalid.' }
  if (body.expiresAt && !expiresAt) return { error: 'The expiry date is invalid.' }
  if (startsAt && expiresAt && startsAt.toMillis() >= expiresAt.toMillis()) {
    return { error: 'The expiry date must be after the start date.' }
  }

  return {
    data: {
      title,
      description,
      url,
      category,
      order,
      enabled: body.enabled !== false,
      featured: body.featured === true,
      showTicketPrompt: category === 'Tickets' && body.showTicketPrompt === true,
      startsAt,
      expiresAt,
    },
  }
}

function dateValue(value) {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isLinkActive(link, now = new Date()) {
  if (link.enabled === false) return false
  const startsAt = dateValue(link.startsAt)
  const expiresAt = dateValue(link.expiresAt)
  return (!startsAt || startsAt <= now) && (!expiresAt || expiresAt > now)
}
