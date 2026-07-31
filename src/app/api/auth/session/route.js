import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  isAllowedAdminEmail,
  isSameOriginRequest,
} from '@/lib/admin-auth'
import { getAdminAuth } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  try {
    const { idToken } = await request.json()
    if (!idToken) return NextResponse.json({ error: 'Missing sign-in token.' }, { status: 400 })

    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken, true)
    const signedInRecently = Date.now() / 1000 - decoded.auth_time < 5 * 60

    if (!signedInRecently || !decoded.email_verified || !(await isAllowedAdminEmail(decoded.email))) {
      return NextResponse.json({ error: 'This Google account is not an approved administrator.' }, { status: 403 })
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: ADMIN_SESSION_MAX_AGE * 1000,
    })
    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE,
    })
    return response
  } catch (error) {
    console.error('Admin session creation failed:', error)
    return NextResponse.json({ error: 'Unable to create an administrator session.' }, { status: 401 })
  }
}

export async function DELETE(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
