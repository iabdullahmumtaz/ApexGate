# ApexGate

Production-style API gateway with rate limiting, JWT auth, Redis response caching, request logging, and an admin dashboard.

## Features

- Per-route and global rate limiting via Redis
- Optional JWT authentication per upstream route
- GET response caching with configurable TTL
- Request log viewer (last 500 requests)
- Admin dashboard: routes, metrics, client tokens, logs

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Gateway  | TypeScript, Express        |
| Cache    | Redis (ioredis)         |
| Frontend | TypeScript, React, Vite (admin)     |
| Auth     | JWT                     |

## Ports

| Service | Port |
|---------|------|
| UI      | 5016 |
| API     | 6016 |

## Quick Start

```bash
cp .env.example .env
cd backend && npm install
cd ../admin && npm install
```

Terminal 1 — Redis: `docker compose up redis -d`  
Terminal 2 — API: `cd backend && npm run dev`  
Terminal 3 — Admin: `cd admin && npm run dev`

- **UI:** http://localhost:5016
- **API:** http://localhost:6016
- Default login: `admin` / `admin123`

## Project Structure

```
ApexGate/
├── backend/          # Gateway API
├── admin/            # React admin dashboard
├── docker-compose.yml
└── .env.example
```

## License

MIT
