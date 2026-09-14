'use client'

import { createContext, useContext } from 'react'
import { collection, getDocsFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { siteContentSchema, validateContent } from '@/lib/site-content'
import useRemoteData from '@/hooks/useRemoteData'
import ContentStatus from './ContentStatus'

const SiteContentContext = createContext({ content: null, loading: true, error: false, retry: () => {} })

async function loadContent() {
  const snapshot = await getDocsFromServer(collection(db, 'siteContent'))
  const next = {}
  snapshot.docs.forEach((document) => {
    if (Object.hasOwn(siteContentSchema, document.id)) next[document.id] = document.data()
  })
  return validateContent(next, siteContentSchema)
}

export function SiteContentProvider({ children }) {
  const { data: content, loading, error, retry } = useRemoteData(loadContent)
  return <SiteContentContext.Provider value={{ content, loading, error, retry }}>{children}</SiteContentContext.Provider>
}

export function useSiteContent(section) {
  const { content } = useContext(SiteContentContext)
  return content?.[section] || null
}

export function SiteContentStatus() {
  const { loading, error, retry } = useContext(SiteContentContext)
  return <ContentStatus loading={loading} error={error} retry={retry} className="min-h-64" />
}
