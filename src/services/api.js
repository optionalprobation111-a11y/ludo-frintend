// All REST calls live here, matching the API contract shared with the backend.
// Authenticated calls MUST send token via Authorization header, not body.

const BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      message = data?.error || data?.message || message
    } catch {
      // response wasn't JSON – keep default message
    }
    throw new Error(message)
  }

  return res.json()
}

// 8.1 Anonymous ID
export const createAnonymousProfile = () =>
  request('/api/anon/create', { method: 'POST' })

// 8.2 Auth (Firebase OTP flow)
// sendOtp backend is no-op; real OTP sending happens client-side via Firebase SDK.
export const sendOtp = (phone) =>
  request('/api/auth/otp/send', { method: 'POST', body: { phone } })

export const verifyFirebaseIdToken = (idToken) =>
  request('/api/auth/otp/verify', { method: 'POST', body: { idToken } })

export const saveProfile = ({ token, name, anonId }) =>
  request('/api/auth/profile', {
    method: 'POST',
    token,
    body: { name, anonId }
  })

// 8.3 Rooms / Friend Play
export const createRoom = ({ token, totalPlayers }) =>
  request('/api/rooms/create', {
    method: 'POST',
    token,
    body: { totalPlayers }
  })

export const sendInvite = ({ token, roomId, friendPhone }) =>
  request('/api/invites/send', {
    method: 'POST',
    token,
    body: { roomId, friendPhone }
  })

// 8.4 Matchmaking
export const matchRandom = ({ anonId, token }) =>
  request('/api/match/random', {
    method: 'POST',
    token,
    body: { anonId }
  })

// 8.6 Game Results
export const submitGameResult = ({ token, anonId, roomId, won, moveStats }) =>
  request('/api/games/result', {
    method: 'POST',
    token,
    body: { anonId, roomId, won, moveStats }
  })

// 8.8 Profile Stats
export const getProfileStats = (token) =>
  request('/api/profile/stats', { method: 'GET', token })