import { createContext, useContext, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAnonymousId } from '../hooks/useAnonymousId'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const auth = useAuth()
  const anon = useAnonymousId()
  const [name, setName] = useState(null)

  const value = useMemo(
    () => ({
      ...auth,
      ...anon,
      name,
      setName
    }),
    [auth, anon, name]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx
}
