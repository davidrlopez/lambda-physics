# Lambda Physics

> An interactive educational portal exploring the fundamental laws of physics — combining theory with a browser-playable speedrunning game built as a custom Half-Life modification.

_Originally developed as a web module for a public university network, providing students with direct access to educational content and live multiplayer game rooms._

Conceived and shipped in one week with zero prior experience in game modding, map creation, WebAssembly, or Linux server deployment, built to fulfill a university-imposed one-week deadline.

---

## Gallery

|                                                                        Map Development                                                                         |                                                           In-Game Screenshots (WebXash)                                                           |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|     <img src="screenshots/betaSpeedrun.png" width="400" alt="Speedrun Map Development"> <br> <sub>Initial speedrun map — early design and structure.</sub>     |           <img src="screenshots/beta1.png" width="400" alt="Speedrun Beta 1"> <br> <sub>Platform section affected by low gravity.</sub>           |
|       <img src="screenshots/betaSpeedrun2.png" width="400" alt="Speedrun Map Development 2"> <br> <sub>Design improvements and layout adjustments.</sub>       |    <img src="screenshots/beta2.png" width="400" alt="Speedrun Beta 2"> <br> <sub>Upper platform section, looking down to the water area.</sub>    |
| <img src="screenshots/betaSpeedrun3.png" width="400" alt="Speedrun Map Development 3"> <br> <sub>Final development version, ready for intensive testing.</sub> | <img src="screenshots/beta3.png" width="400" alt="Speedrun Beta 3"> <br> <sub>Final platform with normal gravity and a 2-second door timer.</sub> |
|  <img src="screenshots/physicsDemoMap.png" width="400" alt="Physics Demo Lab"> <br> <sub>Demo map designed to illustrate physics principles on the web.</sub>  |               <img src="screenshots/arquimedes.png" width="400" alt="Archimedes Demo"> <br> <sub>Archimedes' Principle demo.</sub>                |
|          <img src="screenshots/physicsDemoMap2.png" width="400" alt="Physics Demo Lab 2"> <br> <sub>Physics lab — interactive element details.</sub>           |                     <img src="screenshots/pascal.png" width="400" alt="Pascal Demo"> <br> <sub>Pascal and Newton demo.</sub>                      |

### Speedrun v2 — Early Development

<p align="center">
  <img src="screenshots/SpeedrunV2Early.png" width="600" alt="Speedrun v2 Early Overview">
  <br>
  <em>Early stage of the Archimedes water section — intended final map of the initial release.</em>
</p>

---

## Features

- **Educational Modules** — Interactive lessons on Archimedes' Principle, Pascal's Principle, and Newton's Law of Gravity.
- **Browser-Playable Game** — A Half-Life mod running via WebAssembly, where players solve physics-based puzzles and race the clock.
- **Global Speedrun Leaderboard** — Real-time rankings tracking completion times, deaths, and match statistics.
- **Student Showcase** — A dedicated section for student physics projects and experiments.

---

## Project Architecture

This repository is a monorepo with two main applications:

| Path             | Description                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/apps/frontend` | Vanilla HTML/CSS/JS web interface — educational content, student projects, and live leaderboards.                                                   |
| `/apps/backend`  | REST API built with Node.js, Fastify, TypeScript, and Prisma (PostgreSQL). Receives match data from the C++ game mod and serves it to the frontend. |

### Powered By

| Project                                            | Role                                                            |
| -------------------------------------------------- | --------------------------------------------------------------- |
| [Xash3D FWGS](https://github.com/FWGS/xash3d-fwgs) | Open-source game engine compatible with GoldSrc.                |
| [WebXash3D](https://github.com/FWGS/hlsdk-xash3d)  | WebAssembly port — runs the engine directly in modern browsers. |

---

## Local Development

### Backend

```bash
cd apps/backend
npm install
# Configure .env with your DATABASE_URL (PostgreSQL)
npm run build   # Generates Prisma client and compiles TypeScript
npm run dev     # Starts server at http://localhost:3000
```

### Frontend

```bash
cd apps/frontend
npx serve .
# or
python3 -m http.server
```

---

## Production Infrastructure

Designed to run on a Linux server using Docker, with Caddy as a reverse proxy.

### Services

**1. Static Frontend**

- Served by Caddy (`webxash-cache` container)
- `/` routes to the main index

**2. Backend API**

- Container: `lambda-api`
- Port mapping: `4000/tcp` (host) → `3000/tcp` (container)
- Database: `lambda-db` (PostgreSQL 16, persistent volume)

**Endpoints:**

| Method | Route                              | Description          |
| ------ | ---------------------------------- | -------------------- |
| GET    | `/api/stats`                       | General stats        |
| GET    | `/api/ranking`                     | Global leaderboard   |
| GET    | `/api/jugadores/:nombre/historial` | Player match history |
| POST   | `/api/jugadores`                   | Register player      |
| POST   | `/api/partidas`                    | Submit match result  |

**Security:**

- Input validation on `nombre`, `tiempo`, `muertes`, and `limit`
- Configurable CORS via `CORS_ORIGINS`
- Rate limiting on non-GET routes

**3. WebXash Game Rooms**

Multiple instances to handle university traffic:

| Room   | TCP   | UDP           |
| ------ | ----- | ------------- |
| Room 1 | 27016 | 27015 / 27018 |
| Room 2 | 27116 | 27115 / 27118 |

Requires base game assets (`valve.zip`) and custom mod files served locally to the WebAssembly client.

---

## Operations & Maintenance

```bash
# View active containers
docker ps

# Restart proxy
docker restart webxash-cache

# Restart backend
docker compose restart backend

# Check API
curl -i http://127.0.0.1:4000/api/stats

# Check frontend
curl -I http://127.0.0.1/
```

---

## License & Restrictions

> **Proprietary game engine assets are NOT included in this repository.**
> They must be legally sourced and served directly from the deployment server for the WebAssembly runtime to function.

The web application code (frontend + backend) is open for reference. If using Docker Compose, ensure stable container names and standard Docker networking — legacy `docker-compose` v1 may cause issues during container recreation.
