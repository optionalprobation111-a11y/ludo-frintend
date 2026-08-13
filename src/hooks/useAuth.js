import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ludo_auth_token'

// Manages the JWT session token returned by POST /api/auth/otp/verify.
// Sent as `Authorization: Bearer <token>` on all authenticated calls.
export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))

  const login = useCallback((newToken) => {
    localStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }, [])

  return { token, isAuthenticated: Boolean(token), login, logout }
}
