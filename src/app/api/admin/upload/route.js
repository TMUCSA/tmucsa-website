import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-api'
import { getAdminStorage } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

const allowedPrefixes = ['events/', 'team-images/', 'carousel-images/', 'home-page/', 'contact-page/']

function validStoragePath(path) {
  return typeof path === 'string'
    && path.length <= 500
    && !path.includes('..')
    && allowedPrefixes.some((prefix) => path.startsWith(prefix))
    && path.endsWith('.webp')
}

export async function GET(request) {
  const authorization = await authorizeAdminRequest(request)
  if (authorization.error) return authorization.error

  try {
    const storagePath = String(request.nextUrl.searchParams.get('storagePath') || '')
    if (!validStoragePath(storagePath)) return NextResponse.json({ error: 'Invalid storage path.' }, { status: 400 })
    const [file] = await getAdminStorage().bucket().file(storagePath).download()
    return new Response(file, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('Unable to download admin image:', error)
    return NextResponse.json({ error: 'Unable to load the image for editing.' }, { status: 500 })
  }
}

export async function POST(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const storagePath = String(formData.get('storagePath') || '')
    if (!(file instanceof File) || !validStoragePath(storagePath)) {
      return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 })
    }
    if (file.type !== 'image/webp' || file.size <= 0 || file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Uploads must be WebP images smaller than 2 MB.' }, { status: 400 })
    }

    const bucket = getAdminStorage().bucket()
    const downloadToken = randomUUID()
    await bucket.file(storagePath).save(Buffer.from(await file.arrayBuffer()), {
      resumable: false,
      validation: 'crc32c',
      metadata: {
        contentType: 'image/webp',
        cacheControl: 'public,max-age=31536000,immutable',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
          uploadedBy: authorization.admin.uid,
        },
      },
    })

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`
    return NextResponse.json({ url, storagePath })
  } catch (error) {
    console.error('Unable to upload admin image:', error)
    return NextResponse.json({ error: 'Unable to upload the image.' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true })
  if (authorization.error) return authorization.error
  try {
    const { storagePath } = await request.json()
    if (!validStoragePath(storagePath)) return NextResponse.json({ error: 'Invalid storage path.' }, { status: 400 })
    await getAdminStorage().bucket().file(storagePath).delete({ ignoreNotFound: true })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Unable to delete uploaded image:', error)
    return NextResponse.json({ error: 'Unable to delete the image.' }, { status: 500 })
  }
}
