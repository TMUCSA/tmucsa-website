'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { defaultSiteContent } from '@/lib/site-content'

const SiteContentContext = createContext(defaultSiteContent)

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaultSiteContent)

  useEffect(() => {
    let active = true
    getDocs(collection(db, 'siteContent'))
      .then((snapshot) => {
        if (!active) return
        const next = { ...defaultSiteContent }
        snapshot.docs.forEach((document) => {
          if (next[document.id]) next[document.id] = { ...next[document.id], ...document.data() }
        })
        setContent(next)
      })
      .catch((error) => console.error('Unable to load website content:', error))
    return () => { active = false }
  }, [])

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>
}

export function useSiteContent(section) {
  const content = useContext(SiteContentContext)
  return content[section] || defaultSiteContent[section]
}
