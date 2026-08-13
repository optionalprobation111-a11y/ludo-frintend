import { useEffect } from 'react'
import { connectSocket, disconnectSocket } from '../services/socket'

// Connects the shared socket while a component that needs live game state
// is mounted, and tears it down on unmount.
export function useSocket({ enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return undefined
    const socket = connectSocket()
    return () => {
      disconnectSocket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])
}
