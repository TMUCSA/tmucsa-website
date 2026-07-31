'use client'

/* eslint-disable @next/next/no-img-element */
// Native images are required for local blob previews and interactive crop positioning.
import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import AdminIcon from './AdminIcon'
import { cropAndOptimizeImage, formatFileSize, isSupportedImage, optimizeImage } from '@/lib/image-processing'

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

export default function EventImageManager({ images, onChange, disabled = false }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [cropTarget, setCropTarget] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(16 / 9)
  const [croppedPixels, setCroppedPixels] = useState(null)
  const imageUrlsRef = useRef(new Set())

  useEffect(() => () => {
    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const addFiles = useCallback(async (fileList) => {
    const selected = Array.from(fileList || [])
    if (!selected.length) return
    setError('')

    const unsupported = selected.find((file) => !isSupportedImage(file))
    if (unsupported) {
      setError(`${unsupported.name} is not a supported JPEG, PNG, WebP, HEIC, or HEIF image.`)
      return
    }
    if (images.length + selected.length > 30) {
      setError('An event can contain up to 30 images.')
      return
    }

    const placeholders = selected.map((file) => ({
      localId: makeId(),
      sourceName: file.name,
      originalBytes: file.size,
      processing: true,
      progress: 0,
      alt: '',
      focalX: 0.5,
      focalY: 0.5,
    }))
    onChange([...images, ...placeholders])

    const completed = []
    for (let index = 0; index < selected.length; index += 1) {
      const source = selected[index]
      const placeholder = placeholders[index]
      try {
        const optimized = await optimizeImage(source, (progress) => {
          onChange((current) => current.map((item) => item.localId === placeholder.localId ? { ...item, progress } : item))
        })
        const previewUrl = URL.createObjectURL(optimized.file)
        imageUrlsRef.current.add(previewUrl)
        completed.push({
          ...placeholder,
          ...optimized,
          previewUrl,
          processing: false,
          progress: 100,
        })
        onChange((current) => current.map((item) => item.localId === placeholder.localId ? completed[completed.length - 1] : item))
      } catch (processingError) {
        onChange((current) => current.filter((item) => item.localId !== placeholder.localId))
        setError(`Could not process ${source.name}. ${processingError.message || ''}`)
      }
    }
  }, [images, onChange])

  function updateImage(localId, values) {
    onChange((current) => current.map((image) => image.localId === localId ? { ...image, ...values } : image))
  }

  function removeImage(localId) {
    const target = images.find((image) => image.localId === localId)
    if (target?.previewUrl && imageUrlsRef.current.has(target.previewUrl)) {
      URL.revokeObjectURL(target.previewUrl)
      imageUrlsRef.current.delete(target.previewUrl)
    }
    onChange((current) => current.filter((image) => image.localId !== localId))
  }

  function moveImage(index, direction) {
    const destination = index + direction
    if (destination < 0 || destination >= images.length) return
    const next = [...images]
    const [item] = next.splice(index, 1)
    next.splice(destination, 0, item)
    onChange(next)
  }

  function setFocalPoint(event, image) {
    if (disabled || image.processing) return
    const bounds = event.currentTarget.getBoundingClientRect()
    updateImage(image.localId, {
      focalX: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      focalY: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    })
  }

  async function applyCrop() {
    if (!cropTarget?.file || !croppedPixels) return
    updateImage(cropTarget.localId, { processing: true, progress: 0 })
    try {
      const optimized = await cropAndOptimizeImage(cropTarget.file, croppedPixels)
      const previewUrl = URL.createObjectURL(optimized.file)
      imageUrlsRef.current.add(previewUrl)
      if (cropTarget.previewUrl && imageUrlsRef.current.has(cropTarget.previewUrl)) {
        URL.revokeObjectURL(cropTarget.previewUrl)
        imageUrlsRef.current.delete(cropTarget.previewUrl)
      }
      updateImage(cropTarget.localId, {
        ...optimized,
        previewUrl,
        processing: false,
        progress: 100,
        focalX: 0.5,
        focalY: 0.5,
      })
    } catch (cropError) {
      updateImage(cropTarget.localId, { processing: false })
      setError(cropError.message || 'Unable to crop this image.')
    } finally {
      setCropTarget(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFiles(event.dataTransfer.files)
        }}
        className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${dragging ? 'border-[#25487D] bg-[#25487D]/8' : 'border-[#161329]/15 bg-[#F8F7F3] hover:border-[#25487D]/50 hover:bg-[#25487D]/[0.03]'}`}
      >
        <span className="rounded-2xl bg-[#25487D]/10 p-3 text-[#25487D]"><AdminIcon name="upload" className="h-6 w-6" /></span>
        <span className="mt-4 font-medium">Drop photos here, or choose files</span>
        <span className="mt-1 text-xs text-[#161329]/45">JPEG, PNG, WebP, HEIC or HEIF · up to 30 photos</span>
        <span className="mt-3 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Optimized before upload</span>
      </button>

      {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {images.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {images.map((image, index) => (
            <article key={image.localId} className="overflow-hidden rounded-2xl border border-[#161329]/10 bg-white">
              <button
                type="button"
                className="relative block aspect-[16/10] w-full overflow-hidden bg-[#161329]/5"
                onClick={(event) => setFocalPoint(event, image)}
                title="Click to move the responsive crop focal point"
              >
                {image.previewUrl || image.url ? (
                  <img
                    src={image.previewUrl || image.url}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${(image.focalX ?? 0.5) * 100}% ${(image.focalY ?? 0.5) * 100}%` }}
                  />
                ) : null}
                {image.processing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#161329]/80 text-white">
                    <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-[#FFF4E2] transition-all" style={{ width: `${image.progress || 5}%` }} /></div>
                    <p className="mt-3 text-xs">Optimizing {Math.round(image.progress || 0)}%</p>
                  </div>
                ) : (
                  <span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#25487D] shadow" style={{ left: `${(image.focalX ?? 0.5) * 100}%`, top: `${(image.focalY ?? 0.5) * 100}%` }} />
                )}
                <span className="absolute left-2 top-2 rounded-lg bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">#{index + 1}</span>
              </button>

              <div className="p-3.5">
                <input
                  value={image.alt || ''}
                  onChange={(event) => updateImage(image.localId, { alt: event.target.value })}
                  placeholder="Describe this photo (alt text)"
                  className="w-full rounded-lg border border-[#161329]/10 bg-[#F8F7F3] px-3 py-2 text-xs outline-none transition focus:border-[#25487D] focus:ring-2 focus:ring-[#25487D]/10"
                />
                <div className="mt-3 flex items-center justify-between text-[10px] text-[#161329]/40">
                  <span>{image.width ? `${image.width}×${image.height}` : image.sourceName}</span>
                  <span className={image.file?.size > 500 * 1024 ? 'font-semibold text-amber-700' : ''}>{formatFileSize(image.file?.size || image.bytes)}</span>
                </div>
                {image.originalBytes && image.file?.size ? <p className="mt-1 text-[10px] text-emerald-700">Saved {Math.max(0, Math.round((1 - image.file.size / image.originalBytes) * 100))}%</p> : null}
                <div className="mt-3 flex items-center gap-1.5">
                  <button type="button" disabled={index === 0 || disabled} onClick={() => moveImage(index, -1)} className="rounded-lg border border-[#161329]/10 px-2.5 py-1.5 text-xs disabled:opacity-30">←</button>
                  <button type="button" disabled={index === images.length - 1 || disabled} onClick={() => moveImage(index, 1)} className="rounded-lg border border-[#161329]/10 px-2.5 py-1.5 text-xs disabled:opacity-30">→</button>
                  {image.file ? <button type="button" disabled={disabled || image.processing} onClick={() => setCropTarget(image)} className="rounded-lg border border-[#161329]/10 px-2.5 py-1.5 text-xs hover:border-[#25487D]">Crop</button> : null}
                  <button type="button" disabled={disabled} onClick={() => removeImage(image.localId)} className="ml-auto rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50">Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {cropTarget ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#161329]/10 px-5 py-4">
              <div><h3 className="font-josefin text-xl font-semibold">Crop photo</h3><p className="text-xs text-[#161329]/45">The crop is applied to the optimized WebP.</p></div>
              <button type="button" onClick={() => setCropTarget(null)} className="rounded-lg p-2 hover:bg-[#161329]/5"><AdminIcon name="close" /></button>
            </div>
            <div className="relative h-[52vh] min-h-[320px] bg-[#0A081B]">
              <Cropper
                image={cropTarget.previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
              />
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="text-xs font-medium">Shape
                <select value={aspect} onChange={(event) => setAspect(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-[#161329]/10 px-3 py-2.5">
                  <option value={16 / 9}>Landscape · 16:9</option>
                  <option value={4 / 3}>Classic · 4:3</option>
                  <option value={1}>Square · 1:1</option>
                  <option value={3 / 4}>Portrait · 3:4</option>
                </select>
              </label>
              <label className="text-xs font-medium">Zoom
                <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-3 w-full accent-[#25487D]" />
              </label>
              <button type="button" onClick={applyCrop} className="rounded-xl bg-[#161329] px-5 py-3 text-sm font-medium text-white hover:bg-[#25487D]">Apply crop</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
