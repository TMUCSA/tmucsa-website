'use client'

import imageCompression from 'browser-image-compression'

const HEIC_TYPES = new Set(['image/heic', 'image/heif'])

export function isSupportedImage(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(extension) ||
    ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.type)
}

async function convertHeic(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!HEIC_TYPES.has(file.type) && !['heic', 'heif'].includes(extension)) return file

  const heic2any = (await import('heic2any')).default
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  const blob = Array.isArray(result) ? result[0] : result
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
}

export async function getImageDimensions(fileOrBlob) {
  const objectUrl = URL.createObjectURL(fileOrBlob)
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = reject
      element.src = objectUrl
    })
    return { width: image.naturalWidth, height: image.naturalHeight }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function optimizeImage(sourceFile, onProgress) {
  const decoded = await convertHeic(sourceFile)
  const optimized = await imageCompression(decoded, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.84,
    preserveExif: false,
    onProgress,
  })
  const filename = sourceFile.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'event-photo'
  const file = new File([optimized], `${filename}.webp`, { type: 'image/webp' })
  const dimensions = await getImageDimensions(file)
  return { file, ...dimensions }
}

async function loadImage(source) {
  const objectUrl = typeof source === 'string' ? source : URL.createObjectURL(source)
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve({ image, objectUrl })
      image.onerror = reject
      image.crossOrigin = 'anonymous'
      image.src = objectUrl
    })
  } catch (error) {
    if (typeof source !== 'string') URL.revokeObjectURL(objectUrl)
    throw error
  }
}

export async function cropAndOptimizeImage(sourceFile, pixelCrop) {
  const { image, objectUrl } = await loadImage(sourceFile)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(pixelCrop.width))
    canvas.height = Math.max(1, Math.round(pixelCrop.height))
    const context = canvas.getContext('2d')
    context.drawImage(
      image,
      Math.round(pixelCrop.x),
      Math.round(pixelCrop.y),
      Math.round(pixelCrop.width),
      Math.round(pixelCrop.height),
      0,
      0,
      canvas.width,
      canvas.height
    )
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86))
    if (!blob) throw new Error('The browser could not crop this image.')
    const cropped = new File([blob], sourceFile.name.replace(/\.[^.]+$/, '') + '-cropped.webp', { type: 'image/webp' })
    return optimizeImage(cropped)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
