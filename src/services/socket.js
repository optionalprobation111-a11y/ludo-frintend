import { io } from 'socket.io-client'

// Single shared socket connection.
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

export function joinRoom({ roomId, token, name, isSolo = false, botName, botDifficulty, anonId }) {
  getSocket().emit('room:join', {
    roomId,
    token,
    name,
    isSolo,
    botName,
    botDifficulty,
    anonId
  })
}

export function setTotalPlayers({ roomId, totalPlayers }) {
  getSocket().emit('room:setTotalPlayers', { roomId, totalPlayers })
}

export function rollDice({ roomId }) {
  getSocket().emit('game:rollDice', { roomId })
}

export function moveToken({ roomId, tokenId }) {
  getSocket().emit('game:moveToken', { roomId, tokenId })
}

// --- server -> client listener helpers ---

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