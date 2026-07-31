'use client'

export async function uploadAdminImage(storagePath, file, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('storagePath', storagePath)
    formData.append('file', file)
    request.open('POST', '/api/admin/upload')
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => {
      let payload = {}
      try { payload = JSON.parse(request.responseText) } catch {}
      if (request.status >= 200 && request.status < 300) resolve(payload)
      else reject(new Error(payload.error || 'Unable to upload the image.'))
    }
    request.onerror = () => reject(new Error('The image upload was interrupted.'))
    request.send(formData)
  })
}

export async function deleteAdminImage(storagePath) {
  const response = await fetch('/api/admin/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storagePath }),
  })
  if (!response.ok) throw new Error('Unable to clean up an uploaded image.')
}

export async function downloadAdminImage(storagePath) {
  const response = await fetch(`/api/admin/upload?storagePath=${encodeURIComponent(storagePath)}`, { cache: 'no-store' })
  if (!response.ok) {
    let payload = {}
    try { payload = await response.json() } catch {}
    throw new Error(payload.error || 'Unable to load the image for editing.')
  }
  const blob = await response.blob()
  const sourceName = String(storagePath).split('/').pop() || 'website-image.webp'
  return new File([blob], sourceName, { type: blob.type || 'image/webp' })
}

export function safeAssetName(value) {
  return String(value || 'image').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'image'
}
