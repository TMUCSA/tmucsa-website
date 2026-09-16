'use client'

import { useCallback, useEffect, useState } from 'react'

// Keep loaders stable (module scope or useCallback). A new key hides old data
// immediately, and cleanup prevents late responses from replacing a newer request.
export default function useRemoteData(loader, key = '') {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState(null)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timer = setTimeout(() => {
      if (!active) return
      active = false
      controller.abort()
      setState({ loader, key, attempt, data: null, loading: false, error: true })
    }, 15000)

    Promise.resolve().then(() => loader({ signal: controller.signal, key }))
      .then((data) => {
        if (active) setState({ loader, key, attempt, data, loading: false, error: false })
      })
      .catch((error) => {
        if (!active) return
        console.error('Unable to load content:', error)
        setState({ loader, key, attempt, data: null, loading: false, error: true })
      })
      .finally(() => clearTimeout(timer))

    return () => {
      active = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [loader, key, attempt])

  const current = state?.loader === loader && state?.key === key && state?.attempt === attempt
  return { ...(current ? state : { data: null, loading: true, error: false }), retry }
}
