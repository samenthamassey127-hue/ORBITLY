# 🛰️ ORBITLY — Real-Time Space Intelligence Platform

> **Real satellite data. Real orbital mechanics. Human-understandable interpretations. Interactive 3D Earth.**

[![Live Demo on Vercel](https://img.shields.io/badge/Live%20Demo-orbitly--wwex.vercel.app-blueviolet?style=for-the-badge&logo=vercel)](https://orbitly-wwex.vercel.app)
[![Video Demo](https://img.shields.io/badge/Video%20Demo-Google%20Drive-orange?style=for-the-badge&logo=google-drive)](https://drive.google.com/drive/folders/1wmUhqc9AGiJoQIDYHSGmr_Cy2GMGuld4?usp=drive_link)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/samenthamassey127-hue/ORBITLY)

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)](https://threejs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

---

## 🌐 Live Deployments & Project Links

| Resource | Link | Description |
| :--- | :--- | :--- |
| 🚀 **Live Production Platform** | **[https://orbitly-wwex.vercel.app](https://orbitly-wwex.vercel.app)** | Production deployment on Vercel with active backend API |
| 🎬 **Video Demonstration** | **[Google Drive Video Folder](https://drive.google.com/drive/folders/1wmUhqc9AGiJoQIDYHSGmr_Cy2GMGuld4?usp=drive_link)** | Full video walkthrough with professional voiceover |
| 💻 **Source Code Repository** | **[https://github.com/samenthamassey127-hue/ORBITLY](https://github.com/samenthamassey127-hue/ORBITLY)** | Official GitHub repository |

---

### 📝 Project Abstract

**ORBITLY** is an end-to-end, real-time space intelligence platform engineered to bridge the divide between complex aerospace telemetry and everyday human understanding. While thousands of active satellites generate gigabytes of raw Two-Line Element (TLE) ephemeris data daily, existing tools trap this knowledge in military element sets and cluttered tabular databases. ORBITLY dismantles this barrier by ingesting live General Perturbations feeds from CelesTrak, executing mathematical orbital propagation via the industry-standard SGP4 model, and rendering spacecraft across an interactive, GPU-accelerated 3D dotted Earth at 60 FPS using Three.js and WebGL.

The platform introduces a **Dual-Mode Space Concepts Engine**, allowing students and researchers to toggle seamlessly between intuitive plain-English metaphors (*Explain Like I'm 10*) and rigorous astrodynamics derivations with governing mathematical equations. Complementing this is a **Live Rocket Launch Radar** with active countdowns, **Personalized Dashboards** catering to stargazers, educators, and commercial satellite operators, and **Ask ORBITLY**—a conversational AI assistant grounded in verified orbital telemetry. By transforming dense orbital mechanics into accessible visualizations and gamified classroom challenges, ORBITLY democratizes space literacy for classrooms, amateur astronomers, and EdTech developers worldwide.

---

## ⚡ The Data Pipeline

```
       CelesTrak GP Query API (Real TLE / OMM Data)
                           ↓
     FastAPI Backend (Python · Normalization & Validation)
                           ↓
        SGP4 Orbital Mechanics (True Lat/Lon/Alt/Velocity)
                           ↓
   Intelligent Interpretation Layer (Gemini AI + Aerospace Physics)
                           ↓
  Interactive 3D Earth Experience (Three.js · R3F · Orbit Trajectories)
                           ↓
     User / Student / Hobbyist (Plain-English Human Understanding)
```

---

## 🚀 Quick Start (Single Command)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm
- **Git**

### 1. Clone & Enter
```bash
git clone https://github.com/samenthamassey127-hue/ORBITLY.git
cd ORBITLY
```

### 2. Run Entire Prototype (Backend + Frontend)

#### Option A: Using the Launcher Script (Easiest)
- **On Git Bash / Linux / macOS:**
  ```bash
  ./start.sh
  ```
- **On Windows (Command Prompt / PowerShell):**
  Double-click `start.bat` or run:
  ```cmd
  start.bat
  ```

#### Option B: Manual Two-Terminal Run
- **Terminal 1 — Python Backend:**
  ```bash
  cd backend
  pip install -r requirements.txt
  PYTHONUTF8=1 python main.py
  ```
  *(Backend runs on http://localhost:8000 · Swagger Docs at http://localhost:8000/api/docs)*

- **Terminal 2 — React Frontend:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  *(Frontend runs on http://localhost:5173)*

Open your browser to:
👉 **`http://localhost:5173`**

> 🚀 **Instant Access:** You can also test the live production platform directly at **[https://orbitly-wwex.vercel.app](https://orbitly-wwex.vercel.app)** without local setup!

---

## 🌟 Key Features

### 1. 100% Genuine Space Data (No Hardcoded Numbers)
- **Live CelesTrak Feeds**: Directly queries CelesTrak's General Perturbations (GP) API across multiple satellite categories:
  - Space Stations (ISS, Tiangong CSS, Shenzhou modules)
  - 100+ Brightest Visual Satellites (Hubble Space Telescope, Envisat, Genesis)
  - Earth Observation & Weather (NOAA, GOES, Meteosat)
  - Astrophysics & Science Missions
- **Live Query Search**: Real-time fallback queries CelesTrak on the fly for any arbitrary name or NORAD catalog number (e.g. `Starlink`, `20580`).

### 2. High-Precision Orbital Physics (SGP4)
- Local calculation of satellite state vectors using **SGP4** (`sgp4.api.Satrec`).
- Calculates sub-satellite geodetic coordinates (latitude, longitude, altitude in km).
- Real velocity vectors ($\approx 7.66\text{ km/s}$ in Low Earth Orbit).
- Apogee, perigee, inclination, and orbital period (minutes per revolution).
- Keplerian orbit type classification: **LEO**, **MEO**, **GEO**, **HEO**.

### 3. "What This Means" — Intelligent Translation Layer
Translates dense aerospace parameters into tangible human concepts:
- **Inclination ($51.63^\circ$)**: *"The satellite's orbit is tilted 51.6° from the equator, allowing it to pass over areas where over 90% of the world's population lives."*
- **Orbital Speed ($7.66\text{ km/s}$)**: *"Travels at roughly 17,100 mph (27,600 km/h) — 22× faster than a speeding bullet!"*
- **Orbital Period ($92.98\text{ min}$)**: *"Completes an entire lap of Earth in ~93 minutes, giving astronauts 16 sunrises and sunsets every single day."*
- **AI Summary**: Powered by Google Gemini (`google-genai` SDK) with automatic deterministic fallback if no API key is provided.

### 4. Interactive 3D Earth Experience
- Built with **Three.js** and **React Three Fiber**.
- Specular ocean reflections, atmospheric haze glow, and subtle celestial coordinate grid lines.
- Deep space field with 9,000+ stars.
- Real-time 3D orbit trajectory ribbons wrapping the globe.
- Pulsing radar beacon markers for satellites with 3D HTML telemetry HUD tags.
- Smooth camera flight controller that tracks and frames selected spacecraft.

---

## 📡 API Endpoints

The FastAPI backend exposes the following endpoints (documented interactively at `/api/docs`):

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check, catalog size, cache freshness |
| `/api/satellites/featured` | `GET` | Curated prominent satellites from live feed |
| `/api/satellites/{id}` | `GET` | Full telemetry, orbital elements, and plain-English translation |
| `/api/satellites/{id}/position` | `GET` | Real-time SGP4 coordinates (lat/lon/alt/velocity) |
| `/api/satellites/{id}/orbit` | `GET` | 360-degree orbit path coordinates for 3D rendering |
| `/api/satellites/stats` | `GET` | Overall catalog breakdown (LEO, GEO, payloads) |
| `/api/search?q={query}` | `GET` | Full-text and NORAD ID satellite search |

---

## 🏗️ Project Architecture

```
ORBITLY/
├── start.sh                 # Single-command launcher for Linux / Mac / Git Bash
├── start.bat                # Single-command launcher for Windows CMD / PowerShell
├── .env.example             # Sample environment variables
├── README.md                # Documentation & architecture guide
│
├── backend/                 # Python FastAPI Application
│   ├── main.py              # Application entry point & lifespan refresh
│   ├── config.py            # Pydantic Settings & environment config
│   ├── requirements.txt     # Pinned Python dependencies
│   ├── models/
│   │   └── satellite.py     # Normalized Pydantic models & validation
│   ├── providers/
│   │   ├── base.py          # Abstract provider interface
│   │   ├── celestrak.py     # CelesTrak GP query TLE provider
│   │   └── launch_library.py# Launch Library 2 provider
│   ├── services/
│   │   ├── satellite_service.py   # Catalog indexing & search
│   │   ├── orbital_service.py     # SGP4 propagation & orbit trajectory
│   │   ├── cache_service.py       # In-memory TTL + disk JSON caching
│   │   └── explanation_service.py # Gemini AI & deterministic translation
│   └── routers/
│       ├── health.py        # System health & telemetry stats
│       ├── satellites.py    # Satellite details, orbits, positions
│       └── search.py        # Full-text search endpoint
│
└── frontend/                # React 18 + Vite + TypeScript Application
    ├── index.html           # HTML entry point with space typography
    ├── vite.config.ts       # Vite proxy to port 8000 & chunk splitting
    ├── tailwind.config.ts   # Aerospace palette & radar scan animations
    └── src/
        ├── App.tsx          # Single-scroll continuous product experience
        ├── components/
        │   ├── Globe3D.tsx            # Three.js 3D Earth & orbit lines
        │   ├── SearchBar.tsx          # Debounced search & quick explore pills
        │   ├── SatellitePanel.tsx     # Mission control telemetry HUD & AI summary
        │   ├── FeaturedSatellites.tsx # Live catalog card list
        │   └── StatsBar.tsx           # Real-time satellite counters
        ├── api/client.ts              # Typed Axios API client
        └── store/orbitly.ts           # Zustand global state management
```

---

## ⚙️ Environment Variables

Optional configuration can be placed in a `.env` file in the `backend/` directory:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `""` | Google Gemini key for dynamic AI explanations *(optional)* |
| `CELESTRAK_BASE` | `https://celestrak.org` | CelesTrak base API URL |
| `CACHE_TTL_SECONDS`| `900` | TLE cache duration (15 minutes) |
| `PORT` | `8000` | Backend port |
| `HOST` | `0.0.0.0` | Backend bind host |

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SGP4, HTTPX, Cachetools, Google GenAI SDK.
- **Frontend**: React 18, TypeScript, Vite, Three.js, React Three Fiber, React Three Drei, Tailwind CSS v4, Zustand, Axios.

---

Built with ❤️ for space enthusiasts, students, and engineers.
