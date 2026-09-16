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
      showTicketPrompt: body.showTicketPrompt === true,
      hideFromLinkList: body.showTicketPrompt === true && body.hideFromLinkList === true,
      popupButtonText: String(body.popupButtonText || '').trim().slice(0, 60) || (category === 'Tickets' ? 'Get tickets' : 'Learn more'),
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

// Keep the existing flag so previously configured ticket popups continue to work.
// A shared document serializes selections even when two admins enable different links.
export async function saveLink(db, reference, data, { create = false } = {}) {
  return db.runTransaction(async (transaction) => {
    const selection = db.collection('linkSettings').doc('popup')
    await transaction.get(selection)
    const snapshot = await transaction.get(reference)
    if (!create && !snapshot.exists) return false
    const previous = data.showTicketPrompt
      ? await transaction.get(db.collection('links').where('showTicketPrompt', '==', true))
      : null

    for (const doc of previous?.docs || []) {
      if (doc.id !== reference.id) {
        transaction.update(doc.ref, {
          showTicketPrompt: false,
          hideFromLinkList: false,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        })
      }
    }
    if (create) transaction.set(reference, data)
    else transaction.update(reference, data)
    transaction.set(selection, { updatedAt: data.updatedAt })
    return true
  })
}
