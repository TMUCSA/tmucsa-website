'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { siteContentSchema, validateContent } from '@/lib/site-content'

const SiteContentContext = createContext({ content: null, error: false, retry: () => {} })

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setError(false)
    getDocs(collection(db, 'siteContent'))
      .then((snapshot) => {
        if (!active) return
        const next = {}
        snapshot.docs.forEach((document) => {
          if (Object.hasOwn(siteContentSchema, document.id)) next[document.id] = document.data()
        })
        validateContent(next, siteContentSchema)
        setContent(next)
      })
      .catch((error) => {
        console.error('Unable to load website content:', error)
        if (active) setError(true)
      })
    return () => { active = false }
  }, [attempt])

  return <SiteContentContext.Provider value={{ content, error, retry: () => setAttempt((value) => value + 1) }}>{children}</SiteContentContext.Provider>
}

export function useSiteContent(section) {
  const { content } = useContext(SiteContentContext)
  return content?.[section] || null
}

export function SiteContentStatus() {
  const { error, retry } = useContext(SiteContentContext)
  return <div role="status" className="px-6 py-24 text-center text-white/70">
    {error ? <>Content is temporarily unavailable. <button onClick={retry} className="underline">Try again</button></> : 'Loading content…'}
  </div>
}
