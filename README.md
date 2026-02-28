# Lambda Physics

Lambda Physics is an interactive educational portal dedicated to exploring the fundamental laws of physics. It combines theoretical learning with an interactive speedrunning game built as a custom Half-Life modification, where players experiment with physics principles and compete for the best times on a global leaderboard.

_This project was originally developed to serve as an interactive web module accessible within a public university network, providing direct access to the educational content and live game rooms._

## Gallery

|                                       Map Development                                        |                        In game screenshots (WebXash)                        |
| :------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------: |
|     <img src="screenshots/betaSpeedrun.png" width="400" alt="Speedrun Map Development">      | <img src="screenshots/beta1.png" width="400" alt="Speedrun Beta 1 in game"> |
|    <img src="screenshots/betaSpeedrun2.png" width="400" alt="Speedrun Map Development 2">    | <img src="screenshots/beta2.png" width="400" alt="Speedrun Beta 2 in game"> |
|    <img src="screenshots/betaSpeedrun3.png" width="400" alt="Speedrun Map Development 3">    | <img src="screenshots/beta3.png" width="400" alt="Speedrun Beta 3 in game"> |
|  <img src="screenshots/physicsDemoMap.png" width="400" alt="Physics Demo Lab Development">   | <img src="screenshots/arquimedes.png" width="400" alt="Arquimedes in game"> |
| <img src="screenshots/physicsDemoMap2.png" width="400" alt="Physics Demo Lab Development 2"> |     <img src="screenshots/pascal.png" width="400" alt="Pascal in game">     |

---

## Features

- **Educational Modules**: Interactive lessons covering key physics principles (Archimedes' Principle, Pascal's Principle, Newton's Law of Gravity).
- **Interactive Game**: A custom game modding experience where players apply physics concepts to solve puzzles and race against the clock.
- **Global Speedrun Ranking**: Real-time leaderboards tracking player completion times, deaths, and statistics.
- **Student Showcase**: A dedicated section exploring physics projects and experiments created by students.

## Project Architecture

This repository is structured as a monorepo containing two main applications:

- `/apps/frontend`: A lightweight, responsive vanilla HTML/CSS/JS web interface displaying educational content, student projects, and real-time game leaderboards.
- `/apps/backend`: A robust REST API built with Node.js, Fastify, TypeScript, and Prisma (PostgreSQL). It acts as the data engine, receiving match statistics directly from the C++ game mod and serving them to the frontend.

### Powered By

The interactive game component of this project is made possible thanks to the open-source efforts of the following projects:

- **[Xash3D FWGS](https://github.com/FWGS/xash3d-fwgs)**: A custom open-source game engine compatible with GoldSrc.
- **[WebXash3D](https://github.com/FWGS/hlsdk-xash3d)**: The WebAssembly port allowing the engine to run directly in modern web browsers.

---

## Local Development (Quick Start)

To run the web and API components locally for development:

### Backend Setup

1. `cd apps/backend`
2. `npm install`
3. Set up `.env` with your `DATABASE_URL` (PostgreSQL).
4. `npm run build` (generates Prisma client and compiles TS)
5. `npm run dev` (starts server on `http://localhost:3000`)

### Frontend Setup

1. `cd apps/frontend`
2. `npx serve .` or `python3 -m http.server`
3. Open the provided local port in your browser.

---

## Production Environment & Infrastructure Reference

This project is designed to be deployed on a Linux server using Docker containers, managed by Caddy as a reverse proxy. The following serves as a general operational reference for the production stack.

### 1) Static Frontend (Main Web)

- **Served by:** Caddy (`webxash-cache` container)
- **Routing:** `/` redirects to the main index.

### 2) Backend API (Fastify + Prisma)

- **Container:** `lambda-api`
- **Port Mapping:** `4000/tcp` (host) -> `3000/tcp` (container)
- **Database:** `lambda-db` (PostgreSQL 16, persistent volume)

**Main Endpoints:**

- `GET /api/stats`
- `GET /api/ranking`
- `GET /api/jugadores/:nombre/historial`
- `POST /api/jugadores`
- `POST /api/partidas`

**Backend Hardening:**

- Input validation (`nombre`, `tiempo`, `muertes`, `limit`).
- Configurable CORS via `CORS_ORIGINS`.
- Basic IP/route rate limiting for non-GET methods.

### 3) WebXash Game (Rooms)

- **Rooms Setup:** Usually deployed across multiple instances (e.g., Room 1, Room 2) to handle university traffic.
  - _Example Room 1 ports:_ TCP 27016, UDP 27015/27018
  - _Example Room 2 ports:_ TCP 27116, UDP 27115/27118
- **Proxy/Cache/TLS:** Caddy container.
- **Assets:** Requires base game assets (`valve.zip`) and custom mod files served locally to the WebAssembly client.

---

## Operations & Maintenance

### Daily Commands (Docker)

**View Active Containers:**

```bash
docker ps
```

**Restart Proxy:**

```bash
docker restart webxash-cache
```

**Restart Lambda Backend:**

```bash
docker compose restart backend
```

### Quick Checks

**API Connectivity:**

```bash
curl -i http://127.0.0.1:4000/api/stats
```

**Frontend Rendering:**

```bash
curl -I http://127.0.0.1/
```

## Restrictions & Technical Notes

- **Licenses:** Proprietary game engine assets are **NOT** included in this public repository. They must be legally sourced and served directly from the deployment server for the WebAssembly game runtime.
- **Docker Compose:** Depending on the host environment, legacy `docker-compose` v1 might show issues during container recreation. Ensure stable container names and standard Docker networking are utilized.
