'use client'

/* eslint-disable @next/next/no-img-element */
// This field previews local blob URLs before an optimized asset is uploaded.
import { useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { cropAndOptimizeImage, formatFileSize, isSupportedImage, optimizeImage } from '@/lib/image-processing'
import { downloadAdminImage } from '@/lib/client-storage'
import AdminIcon from './AdminIcon'

export default function OptimizedAssetField({ value, onChange, label = 'Image', help = 'JPEG, PNG, WebP, HEIC or HEIF', compact = false }) {
  const inputRef = useRef(null)
  const objectUrlRef = useRef('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [cropSource, setCropSource] = useState(null)
  const [cropLoading, setCropLoading] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(16 / 9)
  const [croppedPixels, setCroppedPixels] = useState(null)

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
  }, [])

  async function handleFile(file) {
    if (!file) return
    if (!isSupportedImage(file)) {
      setError('Choose a JPEG, PNG, WebP, HEIC, or HEIF image.')
      return
    }
    setProcessing(true)
    setProgress(0)
    setError('')
    try {
      const optimized = await optimizeImage(file, setProgress)
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = URL.createObjectURL(optimized.file)
      onChange({
        ...(value || {}),
        file: optimized.file,
        previewUrl: objectUrlRef.current,
        width: optimized.width,
        height: optimized.height,
        bytes: optimized.file.size,
        originalBytes: file.size,
      })
    } catch (processingError) {
      setError(processingError.message || 'Unable to process this image.')
    } finally {
      setProcessing(false)
    }
  }

  async function openCrop() {
    if (!preview) return
    setCropLoading(true)
    setError('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedPixels(null)
    try {
      if (value?.file) {
        setCropSource(value.file)
      } else if (value?.storagePath) {
        setCropSource(await downloadAdminImage(value.storagePath))
      } else if (value?.url) {
        const response = await fetch(value.url)
        if (!response.ok) throw new Error('Unable to download this legacy image.')
        const blob = await response.blob()
        setCropSource(new File([blob], 'website-image.webp', { type: blob.type || 'image/webp' }))
      }
    } catch (cropLoadError) {
      setError(`${cropLoadError.message || 'Unable to load this image.'} Replace it first, then try cropping again.`)
    } finally {
      setCropLoading(false)
    }
  }

  function closeCrop() {
    if (processing) return
    setCropSource(null)
    setCroppedPixels(null)
  }

  async function applyCrop() {
    if (!cropSource || !croppedPixels) return
    setProcessing(true)
    setProgress(0)
    setError('')
    try {
      const optimized = await cropAndOptimizeImage(cropSource, croppedPixels)
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = URL.createObjectURL(optimized.file)
      onChange({
        ...(value || {}),
        file: optimized.file,
        previewUrl: objectUrlRef.current,
        width: optimized.width,
        height: optimized.height,
        bytes: optimized.file.size,
        originalBytes: value?.originalBytes || cropSource.size,
      })
      setProgress(100)
      setCropSource(null)
      setCroppedPixels(null)
    } catch (cropError) {
      setError(cropError.message || 'Unable to crop this image.')
    } finally {
      setProcessing(false)
    }
  }

  const preview = value?.previewUrl || value?.url

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" className="hidden" onChange={(event) => { handleFile(event.target.files?.[0]); event.target.value = '' }} />
      <p className="mb-2 text-sm font-medium">{label}</p>
      {preview ? (
        <div className={`group relative overflow-hidden rounded-xl border border-[#161329]/10 bg-[#161329]/5 ${compact ? 'h-32' : 'h-44'}`}>
          <img src={preview} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 transition sm:bg-black/0 sm:opacity-0 sm:group-hover:bg-black/45 sm:group-hover:opacity-100">
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#161329]">Replace</button>
            <button type="button" onClick={openCrop} disabled={cropLoading || processing} className="rounded-lg bg-[#25487D] px-3 py-2 text-xs font-medium text-white disabled:opacity-60">{cropLoading ? 'Loading…' : 'Crop'}</button>
            <button type="button" onClick={() => onChange({ url: '', storagePath: '' })} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white">Remove</button>
          </div>
          {processing ? <div className="absolute inset-0 flex items-center justify-center bg-[#161329]/75 text-xs text-white">Optimizing {Math.round(progress)}%</div> : null}
          {value?.bytes ? <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[9px] text-white">{formatFileSize(value.bytes)}</span> : null}
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className={`flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#161329]/20 bg-[#F8F7F3] text-[#161329]/50 transition hover:border-[#25487D] hover:text-[#25487D] ${compact ? 'h-28' : 'h-36'}`}>
          <AdminIcon name="upload" />
          <span className="mt-2 text-xs font-medium">Choose image</span>
          {processing ? <span className="mt-1 text-[10px]">Optimizing {Math.round(progress)}%</span> : null}
        </button>
      )}
      <p className="mt-1.5 text-[10px] text-[#161329]/35">{help}</p>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}

      {cropSource ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="asset-crop-title" className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-[#161329]/10 px-5 py-4">
              <div><h3 id="asset-crop-title" className="font-josefin text-xl font-semibold">Crop {label.toLowerCase()}</h3><p className="text-xs text-[#161329]/45">The result will be converted to an optimized WebP when applied.</p></div>
              <button type="button" onClick={closeCrop} disabled={processing} className="rounded-lg p-2 hover:bg-[#161329]/5 disabled:opacity-40" aria-label="Close crop editor"><AdminIcon name="close" /></button>
            </header>
            <div className="relative h-[52vh] min-h-[320px] bg-[#0A081B]">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
              />
              {processing ? <div className="absolute inset-0 flex items-center justify-center bg-[#0A081B]/75 text-sm text-white">Applying crop…</div> : null}
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="text-xs font-medium">Shape
                <select value={aspect} onChange={(event) => setAspect(Number(event.target.value))} disabled={processing} className="mt-1.5 w-full rounded-xl border border-[#161329]/10 px-3 py-2.5 disabled:opacity-50">
                  <option value={16 / 9}>Landscape · 16:9</option>
                  <option value={4 / 3}>Classic · 4:3</option>
                  <option value={1}>Square · 1:1</option>
                  <option value={3 / 4}>Portrait · 3:4</option>
                </select>
              </label>
              <label className="text-xs font-medium">Zoom
                <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} disabled={processing} className="mt-3 w-full accent-[#25487D] disabled:opacity-50" />
              </label>
              <button type="button" onClick={applyCrop} disabled={processing || !croppedPixels} className="rounded-xl bg-[#161329] px-5 py-3 text-sm font-medium text-white hover:bg-[#25487D] disabled:opacity-50">{processing ? 'Applying…' : 'Apply crop'}</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
