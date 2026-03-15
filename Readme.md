<div align="center">

# 🖥️ CollabBoard

**Real-time Collaborative Workspace — Electron + React + Vite**

[![Electron](https://img.shields.io/badge/Electron-39-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

A feature-rich desktop app combining a real-time whiteboard, code editor with execution, WebRTC video calling, and project management — all in one.

[Features](#-features) · [Getting Started](#-getting-started) · [Tech Stack](#%EF%B8%8F-tech-stack) · [Architecture](#-architecture) · [Roadmap](#%EF%B8%8F-roadmap)

</div>

---

## ✨ Features

### 🎨 Real-time Whiteboard
- Collaborative tldraw canvas synced via `@tldraw/sync`
- Live user presence indicators
- Export to PNG and JSON (guest mode)

### 🔐 Authentication
- Email/password sign-up and login
- Google OAuth (one-click)
- Persistent sessions via Supabase `getSession` + `onAuthStateChange`
- Guest / offline mode — no account required

### 📁 Project Management
- Create, rename, and delete projects
- Share projects via unique room codes
- Join rooms by entering a share code

### 💻 Code Editor & Execution
- Monaco Editor (VS Code engine) with syntax highlighting
- Execute code in 40+ languages via Judge0 CE (RapidAPI)
- Interactive stdin support via modal dialog
- Professional terminal-style output panel
- Persistent code storage per project (localStorage)

### 📹 Video Meetings
- PeerJS WebRTC peer-to-peer video + audio
- Metered.ca TURN server (works across all networks)
- Auto-layout video grid (1–6+ participants)
- Mic and camera toggle (re-acquires track on turn-on)
- Screen sharing via Electron `desktopCapturer` IPC
- In-meeting chat with unread message badge
- Participants sidebar with mic/cam status indicators
- Floating **draggable** window — never blocks the app
- **Minimize to pill** — controls still accessible when minimized
- Persists across navigation (mounted at App root, never unmounts)
- Room codes in `CB-XXXXXXXX` format

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 39 |
| UI framework | React 19 + Vite |
| Backend / Auth | Supabase (Auth + Realtime + Edge Functions) |
| Whiteboard | tldraw 4.1.2 + `@tldraw/sync` |
| Code editor | Monaco Editor 4.7.0 |
| Video calling | PeerJS (WebRTC) + Supabase Realtime signaling |
| State management | Zustand |
| Routing | React Router v6 (HashRouter) |
| Styling | Tailwind CSS |
| Animations | Framer Motion + GSAP |
| Code execution | Judge0 CE via RapidAPI |
| TURN server | Metered.ca (free 500 MB/mo) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- bun 9+
- [Supabase](https://supabase.com) project (free tier works)
- [RapidAPI](https://rapidapi.com) account with Judge0 CE subscription
- [Metered.ca](https://metered.ca) account (free — for TURN credentials)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourname/collab-board.git
cd collab-board

# 2. Install dependencies
bun install
bun install peerjs

# 3. Set up environment variables
cp .env.example .env
# Fill in your keys (see below)
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_JUDGE0_API=your_rapidapi_judge0_key

VITE_METERED_USERNAME=your_metered_username
VITE_METERED_CREDENTIAL=your_metered_credential

# UNUSED — safe to delete:
# VITE_LIVEKIT_WS_URL=
```

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `VITE_JUDGE0_API` | RapidAPI → Judge0 CE → Subscribe → copy API Key |
| `VITE_METERED_USERNAME` | metered.ca → Dashboard → TURN credentials |
| `VITE_METERED_CREDENTIAL` | metered.ca → Dashboard → TURN credentials |

> **Important:** Always restart the dev server after editing `.env` — Vite does not hot-reload env changes.

### Running

```bash
# Development (Electron + Vite hot-reload)
bun run dev

# Production build
bun run build

# Package as distributable
bun run make
```

---

## 📂 Project Structure

```
collab-board/
├── src/
│   ├── main.js                         # Electron main process
│   ├── preload.js                      # contextBridge API
│   ├── main.jsx                        # React entry + routing + MeetingModal root
│   │
│   ├── pages/
│   │   ├── Homepage.jsx                # Landing page (GSAP + Framer Motion demo)
│   │   ├── LoginPage.jsx               # Email + Google login
│   │   ├── Signup.jsx                  # Registration
│   │   ├── ProjectPage.jsx             # Projects list
│   │   ├── Whiteboard_TldrawSync.jsx   # Main whiteboard
│   │   ├── GuestWhiteboard.jsx         # Guest mode (no auth, export only)
│   │   ├── Splash.jsx                  # Splash screen
│   │   └── JoinRoom.jsx                # Join via share code
│   │
│   ├── components/
│   │   ├── meeting/
│   │   │   ├── MeetingModal.jsx        # Floating draggable video window
│   │   │   └── VideoTile.jsx           # Single participant tile
│   │   ├── code/
│   │   │   ├── CodeWorkspace_Improved.jsx
│   │   │   ├── MonacoEditor.jsx
│   │   │   └── Terminal.jsx
│   │   └── GuestBanner.jsx
│   │
│   ├── hooks/
│   │   └── useMeeting.js               # WebRTC hook (PeerJS + Supabase + TURN)
│   ├── store/
│   │   └── useAuthStore.js             # Zustand auth state
│   └── services/
│       └── supabaseClient.js
│
├── supabase/
│   └── functions/                      # Edge Functions
│
├── .env                                # Secret keys (git-ignored)
├── .env.example
└── package.json
```

---

## 🗺️ Architecture

### Routing (HashRouter)

| Route | Page | Guard |
|---|---|---|
| `/` | Splash screen | — |
| `/homepage` | Animated landing page | — |
| `/login` | Login | Redirects to `/projects` if logged in |
| `/signup` | Signup | Redirects to `/projects` if logged in |
| `/guest` | Guest whiteboard | Only if `isGuest = true` |
| `/projects` | Projects list | Requires auth |
| `/Whiteboard_TldrawSync/:id` | Main whiteboard | Requires auth |
| `/join/:shareCode` | Join via share code | Requires auth |

`MeetingModal` is rendered **outside** `<Routes>` in `main.jsx` — it persists across all navigation and never unmounts.

### Electron IPC

| Handler | Description |
|---|---|
| `execute-code` | Calls Judge0 CE via RapidAPI |
| `clipboard-write` | Native clipboard (bypasses browser permission denial) |
| `get-screen-sources` | `desktopCapturer.getSources` for screen sharing |

`window.electronAPI` (via `preload.js` contextBridge):

```js
window.electronAPI.executeCode(code, language, stdin)
window.electronAPI.clipboardWrite(text)
window.electronAPI.getScreenSources()
window.electronAPI.isElectron()
```

### Meeting Global API

Open or close a meeting from any page:

```js
// Start as host
window.openMeeting?.(projectId, projectTitle, 'host')

// Join an existing room
window.openMeeting?.(projectId, projectTitle, 'join')

// Close meeting
window.closeMeeting?.()
```

---

## 🐛 Known Issues & Fixes

### ❌ `X-RapidAPI-Key` is `undefined`

Vite env vars are **build-time injected** in the renderer — `process.env` does not work there.

```js
// ✅ Renderer / React components
const apiKey = import.meta.env.VITE_JUDGE0_API

// ❌ Won't work in renderer
const apiKey = process.env.VITE_JUDGE0_API
```

In `main.js` (Electron main process), use `dotenv` explicitly:

```js
// Top of main.js
require('dotenv').config()
const apiKey = process.env.VITE_JUDGE0_API
```

### ❌ Clipboard `NotAllowedError` — Write permission denied

Replace `navigator.clipboard.writeText()` with the IPC bridge already wired in `preload.js`:

```js
// ❌ Blocked in Electron
await navigator.clipboard.writeText(shareCode)

// ✅ Use the Electron bridge
if (window.electronAPI?.clipboardWrite) {
  await window.electronAPI.clipboardWrite(shareCode)
} else {
  await navigator.clipboard.writeText(shareCode) // browser fallback
}
```

---

## 🗑️ Removed Packages

The following were installed and removed due to DNS / payment / compatibility issues. **Do not reinstall.**

```
@livekit/components-react
@livekit/components-styles
livekit-client
@daily-co/daily-js
@daily-co/daily-react
```

> PeerJS is the current and final WebRTC solution.

---

## 🗓️ Roadmap

- [✅] Add "Meet" button to `Whiteboard_TldrawSync.jsx` header
- [✅] In-app project-level chat (outside of meetings)
- [✅] Cross-network WebRTC testing with Metered TURN
- [✅] Guest mode: join a whiteboard without an account
- [✅] Mobile / responsive layout improvements
- [✅] App packaging and distribution (`electron-forge make`)

---

## 📄 License

MIT — free to fork, modify, and distribute.

---

<div align="center">
Built with Electron, React, tldraw, and Supabase
</div>