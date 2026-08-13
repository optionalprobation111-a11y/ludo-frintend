import { io } from 'socket.io-client'

// Single shared socket connection. Events match the contract in Section 8
// (frontend prompt) / Section 9 (backend prompt) exactly:
//
// client -> server: room:join, game:rollDice, game:moveToken
// server -> client: room:playerJoined, game:state, game:over

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket']
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}

// --- client -> server emitters ---

export function joinRoom({ roomId, token }) {
  getSocket().emit('room:join', { roomId, token })
}

export function rollDice({ roomId }) {
  getSocket().emit('game:rollDice', { roomId })
}

export function moveToken({ roomId, tokenId, targetCell }) {
  getSocket().emit('game:moveToken', { roomId, tokenId, targetCell })
}

// --- server -> client listener helpers ---
// Each returns an unsubscribe function for easy cleanup in useEffect.

export function onPlayerJoined(handler) {
  const s = getSocket()
  s.on('room:playerJoined', handler)
  return () => s.off('room:playerJoined', handler)
}

export function onGameState(handler) {
  const s = getSocket()
  s.on('game:state', handler)
  return () => s.off('game:state', handler)
}

export function onGameOver(handler) {
  const s = getSocket()
  s.on('game:over', handler)
  return () => s.off('game:over', handler)
}
