import { useCallback, useState } from 'react'
import { createAnonymousProfile } from '../services/api'

const STORAGE_KEY = 'ludo_anon_id'

// Manages the anonymous browser-ID used for Play Randomly before a user
// registers. Stored in localStorage only — never a cookie, never combined
// with IP/device fingerprinting.
export function useAnonymousId() {
  const [anonId, setAnonId] = useState(() => localStorage.getItem(STORAGE_KEY))

  const ensureAnonymousId = useCallback(async () => {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) {
      setAnonId(existing)
      return existing
    }
    const { anonId: newId } = await createAnonymousProfile()
    localStorage.setItem(STORAGE_KEY, newId)
    setAnonId(newId)
    return newId
  }, [])

  const clearAnonymousId = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAnonId(null)
  }, [])

  return { anonId, ensureAnonymousId, clearAnonymousId }
}
