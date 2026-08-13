# Ludo — Frontend

A free, mobile-first Ludo web app. React + Vite, real-time via Socket.io,
styled with Tailwind CSS. No payments, no wallet, no login wall — login only
appears when "Play with Friend" needs a verified number.

This frontend expects a **separate backend** (Node/Express + Socket.io) to
already be deployed. It talks to that backend only through the REST/socket
contract documented in `src/services/api.js` and `src/services/socket.js`.

## 1. Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | Your deployed backend's URL (e.g. Render URL) |
| `VITE_SOCKET_URL` | Usually the same as `VITE_API_BASE_URL` |
| `VITE_FIREBASE_API_KEY` | From your Firebase project settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | From your Firebase project settings |
| `VITE_FIREBASE_PROJECT_ID` | From your Firebase project settings |

## 2. Run locally

```bash
npm run dev
```

Opens at `http://localhost:5173`. The backend must already be running
(locally or deployed) and `VITE_API_BASE_URL` / `VITE_SOCKET_URL` must point
to it, or auth, matchmaking, and invites will fail.

## 3. Build

```bash
npm run build
```

Outputs a production build to `dist/`.

## 4. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the repo.
3. Framework preset: **Vite** (auto-detected).
4. Add the same environment variables from `.env` in the Vercel dashboard
   (Project Settings → Environment Variables).
5. Deploy. Vercel will rebuild automatically on every push to the connected
   branch.

**Note:** deploy the backend first (or at the same time) and use its live
URL for `VITE_API_BASE_URL` / `VITE_SOCKET_URL` — the frontend has nothing
to talk to otherwise.

## 5. Project structure

```
src/
  pages/       Route-level screens (Home, Login, GameBoard, Profile, ...)
  components/  Reusable pieces (DiceRoller, Token, BoardCell, InviteRow, StatCard, PageHeader)
  hooks/       useSocket, useAnonymousId, useAuth
  services/    api.js (REST) and socket.js (Socket.io) — the contract boundary with the backend
  context/     UserContext — shared session/anon-id state
  utils/       boardLayout.js — static 15x15 board grid metadata
```

## 6. Design notes

- Palette, type (Fraunces + Inter + JetBrains Mono for stats), and the
  home-stretch cross motif on the landing page are deliberate choices — see
  inline comments in `HomePage.jsx` and `tailwind.config.js` for the token
  system if you want to restyle.
- All game state (dice value, token positions, turns, win condition) is
  rendered from `game:state` / `game:over` socket events pushed by the
  backend. The frontend never decides move legality itself.
