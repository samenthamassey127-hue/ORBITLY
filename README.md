# 🛰️ ORBITLY

> Real satellite data. Real orbital math. Human-readable explanations. Interactive 3D Earth.

**Not a mockup.** ORBITLY is a full-stack prototype that pulls live TLE data from CelesTrak, propagates satellite positions using SGP4 orbital mechanics, translates technical orbital parameters into plain English using Gemini AI, and visualizes everything on an interactive 3D Earth built with Three.js.

---

## The Data Pipeline

```
CelesTrak (live TLE feeds)
         ↓
Python FastAPI backend (normalizes & validates)
         ↓
SGP4 orbital propagation (real-time positions)
         ↓
Gemini AI / deterministic explanations
         ↓
React frontend → Three.js 3D Earth
         ↓
You, understanding what "51.6° inclination" actually means
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone
```bash
git clone https://github.com/samenthamassey127-hue/ORBITLY
cd ORBITLY
```

### 2. Backend Setup
```bash
cd backend
pip install fastapi uvicorn httpx cachetools sgp4 python-dotenv pydantic-settings google-generativeai
cp ../.env.example .env
# Edit .env — at minimum add GEMINI_API_KEY (optional but recommended)
python main.py
```
Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/api/docs

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini key for AI explanations |
| `CELESTRAK_BASE` | No | `https://celestrak.org` | CelesTrak base URL |
| `CACHE_TTL_SECONDS` | No | `900` | Cache refresh interval (15 min) |
| `PORT` | No | `8000` | Backend server port |

Get a Gemini key free at https://aistudio.google.com

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | System health + cache status |
| `GET /api/satellites/featured` | Notable satellites from live catalog |
| `GET /api/satellites/{id}` | Full satellite detail + AI explanation |
| `GET /api/satellites/{id}/position` | Real-time SGP4 position |
| `GET /api/satellites/{id}/orbit` | Full orbit path for 3D visualization |
| `GET /api/search?q={query}` | Full-text satellite search |

---

## Architecture

```
ORBITLY/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Environment configuration
│   ├── models/satellite.py  # Normalized data models (Pydantic)
│   ├── providers/
│   │   ├── base.py          # Abstract provider interface
│   │   ├── celestrak.py     # CelesTrak TLE provider
│   │   └── launch_library.py
│   ├── services/
│   │   ├── satellite_service.py   # Business logic
│   │   ├── orbital_service.py     # SGP4 propagation
│   │   ├── cache_service.py       # TTL cache + disk fallback
│   │   └── explanation_service.py # AI + deterministic explanations
│   └── routers/
│       ├── health.py
│       ├── search.py
│       └── satellites.py
└── frontend/
    └── src/
        ├── components/
        │   ├── Globe3D.tsx        # Three.js interactive Earth
        │   ├── SearchBar.tsx      # Real search with debounce
        │   ├── SatellitePanel.tsx # Data + explanation panel
        │   ├── FeaturedSatellites.tsx
        │   └── StatsBar.tsx
        ├── api/client.ts          # Typed Axios API client
        ├── store/orbitly.ts       # Zustand global state
        └── hooks/useSatellites.ts # Data fetching hooks
```

---

## Data Sources

| Source | Data | Refresh |
|--------|------|---------|
| CelesTrak | Live TLE data for all tracked objects | Every 15 min |
| SGP4 (local) | Real-time orbital propagation | Per-request |
| Google Gemini | Plain-English explanations | Per-request |

Data is **always real**. No hardcoded satellites. No fake numbers.
The app gracefully falls back to cached data if an API is unavailable.

---

## Tech Stack

**Backend**: Python · FastAPI · Pydantic v2 · sgp4 · httpx · cachetools · Google Gemini

**Frontend**: React 18 · TypeScript · Vite · Three.js · React Three Fiber · Tailwind CSS · Zustand · Axios

---

## Hackathon Notes

What's real:
- ✅ Live TLE data from CelesTrak
- ✅ SGP4 orbital math (not fake animation)
- ✅ Real search across live catalog
- ✅ AI explanations from Gemini (deterministic fallback if no key)
- ✅ Orbit path computed from actual TLE
- ✅ Cache with disk fallback for resilience
- ✅ Background catalog refresh

What's prototype-level:
- Position dots on globe show derived lat/lon (from TLE epoch, refreshed periodically)
- Launch data from Launch Library 2 not yet integrated (provider written, not wired)
- No user accounts or saved satellites

Built for the hackathon by Team ORBITLY 🛰️
