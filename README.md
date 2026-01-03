# my-noob-react-app

A simple Vite + React frontend with an Express backend. This repository contains a development frontend (Vite) and a backend server (Express) that persists users and blogs to CSV files.

---

##  Quick start (Development)

### Prerequisites
- Node.js (LTS recommended, e.g. Node 18+ or 20 LTS)
- npm (bundled with Node) or yarn
- Git (optional)
- Build tools for native modules (required by `bcrypt`):
  - macOS: Xcode Command Line Tools (`xcode-select --install`)
  - Linux (Debian/Ubuntu): `build-essential`, `python3`, `make`, `g++`
  - Windows: Visual Studio Build Tools (C++ workload) or use WSL

### Install dependencies
From the project root:

```bash
npm install
```

> Note: `bcrypt` is included as a dependency. If you cannot build native modules, consider `bcryptjs` as a fallback and update the server code accordingly.

### Environment variables
Not really needed in here, but you can put them just for lols

### Run the app (development)
Open two terminals:

Terminal A — start backend:
```bash
npm run server
# starts Express backend on http://localhost:3001
```

Terminal B — start frontend dev server:
```bash
npm run dev
# Vite dev server on http://localhost:5173
```

Open http://localhost:5173 in your browser. The frontend expects the backend at http://localhost:3001.

---

## Platform-specific notes

### macOS 
- Install Node (use `nvm` recommended) and Xcode Command Line Tools:
```bash
xcode-select --install
```
- Use `nvm` to install Node LTS and then `npm install`.

### Ubuntu / Debian Linux 
```bash
sudo apt update
sudo apt install -y build-essential python3 make g++
# install nvm and Node LTS, then npm install
```

### Windows (PowerShell) 
- Use nvm-windows or Node installer from nodejs.org.
- Install Visual Studio Build Tools (C++ workload) or use WSL and follow Linux steps to avoid native build issues.
- Set the env var in PowerShell:
```powershell
$env:JWT_secreta = 'a_strong_random_secret_here'
```

---

##  Troubleshooting & Tips
- bcrypt build failures: ensure platform build tools are installed, or switch to `bcryptjs` as a fallback.
- CORS/cookies: the server allows CORS from `http://localhost:5173`. When sending requests that rely on cookies, use `fetch(..., { credentials: 'include' })` from the frontend.
- Ports:
  - Frontend: 5173 (Vite)
  - Backend: 3001 (Express)
- If ports conflict, change Vite's port or the `PORT` constant in `src/server.js`.

---

##  Quick checklist
- [ ] Install Node (LTS) and build tools
- [ ] Run `npm install`
- [ ] Start server: `npm run server`
- [ ] Start frontend: `npm run dev`

---

