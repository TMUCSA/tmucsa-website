'use client'

export default function ContentStatus({ loading = false, error = false, retry, label = 'content', emptyMessage, className = '' }) {
  if (!loading && !error && !emptyMessage) return null

  return (
    <div role={error ? 'alert' : 'status'} className={`flex flex-col items-center justify-center gap-4 px-6 py-16 text-center font-jost text-sm text-white/70 ${className}`}>
      {loading ? <span aria-hidden="true" className="h-8 w-8 rounded-full border-2 border-white/15 border-t-beige motion-safe:animate-spin" /> : null}
      <p>{loading ? `Loading ${label}…` : error ? `We couldn’t load ${label}. Please try again.` : emptyMessage}</p>
      {error && retry ? <button type="button" onClick={retry} className="border border-beige/50 px-5 py-2 text-beige transition hover:bg-beige hover:text-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-beige">Try again</button> : null}
    </div>
  )
}
