import { cookies } from 'next/headers'
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin'

export const ADMIN_SESSION_COOKIE = 'tmucsa_admin_session'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 5

export function normalizeAdminEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function isValidAdminEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeAdminEmail(email))
}

export function getBootstrapAdminEmails() {
  return new Set(
    String(process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(normalizeAdminEmail)
      .filter(isValidAdminEmail)
  )
}

export function isBootstrapAdminEmail(email) {
  const normalized = normalizeAdminEmail(email)
  return Boolean(normalized) && getBootstrapAdminEmails().has(normalized)
}

export function adminEmailDocumentId(email) {
  return encodeURIComponent(normalizeAdminEmail(email))
}

export async function isAllowedAdminEmail(email) {
  const normalized = normalizeAdminEmail(email)
  if (!normalized) return false
  if (isBootstrapAdminEmail(normalized)) return true

  try {
    const snapshot = await getAdminDb().collection('adminUsers').doc(adminEmailDocumentId(normalized)).get()
    return snapshot.exists && snapshot.data()?.active !== false && normalizeAdminEmail(snapshot.data()?.email) === normalized
  } catch (error) {
    console.error('Unable to check managed administrator access:', error)
    return false
  }
}

async function verifySession(sessionCookie) {
  if (!sessionCookie) return null

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
    if (!decoded.email_verified || !(await isAllowedAdminEmail(decoded.email))) return null
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
      picture: decoded.picture || '',
      isOwner: isBootstrapAdminEmail(decoded.email),
    }
  } catch {
    return null
  }
}

export async function getAdminUser() {
  const cookieStore = await cookies()
  return verifySession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

export async function getAdminUserFromRequest(request) {
  return verifySession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get('origin')
  if (!origin) return true

  try {
    return new URL(origin).host === request.headers.get('host')
  } catch {
    return false
  }
}
