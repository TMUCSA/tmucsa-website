import { NextResponse } from 'next/server'
import { getAdminUserFromRequest, isSameOriginRequest } from '@/lib/admin-auth'

export async function authorizeAdminRequest(request, { mutation = false } = {}) {
  if (mutation && !isSameOriginRequest(request)) {
    return {
      error: NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 }),
      admin: null,
    }
  }

  const admin = await getAdminUserFromRequest(request)
  if (!admin) {
    return {
      error: NextResponse.json({ error: 'Administrator authentication required.' }, { status: 401 }),
      admin: null,
    }
  }

  return { admin, error: null }
}

export function serializeFirestoreValue(value) {
  if (value === null || value === undefined) return value
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(serializeFirestoreValue)
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serializeFirestoreValue(nested)]))
  }
  return value
}

export function serializeDocument(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...serializeFirestoreValue(documentSnapshot.data()),
  }
}
