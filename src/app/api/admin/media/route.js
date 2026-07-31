import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { authorizeAdminRequest, serializeDocument } from '@/lib/admin-api'
import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin'
import { writeAuditLog } from '@/lib/audit-log'

export const runtime = 'nodejs'

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error
  const db = getAdminDb()
  const [carouselSnapshot, homeSnapshot, contactSnapshot] = await Promise.all([
    db.collection('carousel-images').get(),
    db.collection('home-images').get(),
    db.collection('contact-images').get(),
  ])
  return NextResponse.json({
    carousel: carouselSnapshot.docs.map(serializeDocument).sort((a, b) => (a.order || 0) - (b.order || 0)),
    home: Object.fromEntries(homeSnapshot.docs.map((document) => [document.id, serializeDocument(document)])),
    contact: Object.fromEntries(contactSnapshot.docs.map((document) => [document.id, serializeDocument(document)])),
  })
}

export async function PATCH(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  try {
    const body = await request.json()
    const carousel = Array.isArray(body.carousel) ? body.carousel.slice(0, 10) : []
    const home = body.home || {}
    const contact = body.contact || {}
    const db = getAdminDb()
    const [existingCarousel, existingHome, existingContact] = await Promise.all([
      db.collection('carousel-images').get(),
      db.collection('home-images').get(),
      db.collection('contact-images').get(),
    ])
    const previousPaths = new Set([
      ...existingCarousel.docs.map((document) => document.data().storagePath).filter(Boolean),
      ...existingHome.docs.map((document) => document.data().storagePath).filter(Boolean),
      ...existingContact.docs.map((document) => document.data().storagePath).filter(Boolean),
    ])
    const nextIds = new Set(carousel.map((image) => String(image.id)))
    const batch = db.batch()
    carousel.forEach((image, index) => {
      const id = String(image.id || db.collection('carousel-images').doc().id).replace(/[^a-zA-Z0-9_-]/g, '')
      nextIds.add(id)
      batch.set(db.collection('carousel-images').doc(id), {
        imageUrl: String(image.imageUrl || ''),
        imageAlt: String(image.imageAlt || ''),
        storagePath: String(image.storagePath || ''),
        order: index + 1,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    })
    existingCarousel.docs.filter((document) => !nextIds.has(document.id)).forEach((document) => batch.delete(document.ref))
    ;['top', 'bottom'].forEach((position) => {
      const image = home[position] || {}
      batch.set(db.collection('home-images').doc(position), {
        imageUrl: String(image.imageUrl || ''),
        imageAlt: String(image.imageAlt || ''),
        storagePath: String(image.storagePath || ''),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    })
    ;['primary', 'secondary'].forEach((position) => {
      const image = contact[position] || {}
      batch.set(db.collection('contact-images').doc(position), {
        imageUrl: String(image.imageUrl || ''),
        imageAlt: String(image.imageAlt || ''),
        storagePath: String(image.storagePath || ''),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    })
    await batch.commit()
    const nextPaths = new Set([
      ...carousel.map((image) => image.storagePath).filter(Boolean),
      ...['top', 'bottom'].map((position) => home[position]?.storagePath).filter(Boolean),
      ...['primary', 'secondary'].map((position) => contact[position]?.storagePath).filter(Boolean),
    ])
    await Promise.allSettled(Array.from(previousPaths).filter((path) => !nextPaths.has(path)).map((path) => getAdminStorage().bucket().file(path).delete({ ignoreNotFound: true })))
    await writeAuditLog(db, authorization.admin, 'update', 'media', 'website', 'Updated website media', { carouselImages: carousel.length, contactImages: 2 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Unable to update media:', error)
    return NextResponse.json({ error: 'Unable to save website media.' }, { status: 500 })
  }
}
