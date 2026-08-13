// All REST calls live here, matching the API contract shared with the backend
// (frontend prompt Section 8 / backend prompt Section 9). Endpoint names and
// payload shapes must not be changed independently of the backend.

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
      // response wasn't JSON — keep default message
    }
    throw new Error(message)
  }

  return res.json()
}

// 8.1 Anonymous ID
export const createAnonymousProfile = () => request('/api/anon/create', { method: 'POST' })

// 8.2 Auth
export const sendOtp = (phone) => request('/api/auth/otp/send', { method: 'POST', body: { phone } })

export const verifyOtp = (phone, otp) =>
  request('/api/auth/otp/verify', { method: 'POST', body: { phone, otp } })

export const saveProfile = ({ token, name, anonId }) =>
  request('/api/auth/profile', { method: 'POST', body: { token, name, anonId } })

// 8.3 Rooms / Friend Play
export const createRoom = ({ token, totalPlayers }) =>
  request('/api/rooms/create', { method: 'POST', body: { token, totalPlayers } })

export const sendInvite = ({ token, roomId, friendPhone }) =>
  request('/api/invites/send', { method: 'POST', body: { token, roomId, friendPhone } })

// 8.4 Matchmaking
export const matchRandom = ({ anonId, token }) =>
  request('/api/match/random', { method: 'POST', body: { anonId, token } })

// 8.6 Game Results
export const submitGameResult = ({ token, anonId, roomId, won, moveStats }) =>
  request('/api/games/result', { method: 'POST', body: { token, anonId, roomId, won, moveStats } })

// 8.8 Profile Stats
export const getProfileStats = (token) => request('/api/profile/stats', { method: 'GET', token })
