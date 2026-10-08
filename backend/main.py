"""
ORBITLY FastAPI Application — Main Entry Point
"""
from __future__ import annotations
import asyncio
import logging
import sys
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from routers import health, search, satellites
from services.satellite_service import initialize_catalog

# ──────────────────────────────────────────────
# Logging — force UTF-8 on Windows
# ──────────────────────────────────────────────
import os
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("orbitly")


# ──────────────────────────────────────────────
# Background refresh task
# ──────────────────────────────────────────────
_refresh_task: asyncio.Task | None = None


async def _periodic_refresh():
    """Refresh satellite catalog every CACHE_TTL_SECONDS."""
    await asyncio.sleep(settings.cache_ttl_seconds)
    while True:
        logger.info("[Refresh] Starting scheduled catalog refresh...")
        try:
            await initialize_catalog()
        except Exception as e:
            logger.error(f"[Refresh] Catalog refresh failed: {e}")
        await asyncio.sleep(settings.cache_ttl_seconds)


# ──────────────────────────────────────────────
# Lifespan (startup / shutdown)
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _refresh_task
    logger.info("ORBITLY backend starting up...")

    # Load catalog at startup
    try:
        await initialize_catalog()
    except Exception as e:
        logger.error(f"[Startup] Catalog initialization failed: {e}")

    # Start background refresh
    _refresh_task = asyncio.create_task(_periodic_refresh())
    logger.info("ORBITLY backend ready - serving on port %s", settings.port)

    yield

    # Shutdown
    logger.info("ORBITLY backend shutting down...")
    if _refresh_task:
        _refresh_task.cancel()
        try:
            await _refresh_task
        except asyncio.CancelledError:
            pass


# ──────────────────────────────────────────────
# FastAPI app
# ──────────────────────────────────────────────
app = FastAPI(
    title="ORBITLY API",
    description="Real-time satellite and orbital data API. Powers the ORBITLY space data platform.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — allow frontend dev server and production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Include routers
# ──────────────────────────────────────────────
app.include_router(health.router)
app.include_router(search.router)
app.include_router(satellites.router)


# ──────────────────────────────────────────────
# Root redirect
# ──────────────────────────────────────────────
@app.get("/")
async def root():
    return JSONResponse({
        "name": "ORBITLY API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/health",
        "status": "operational",
    })


# ──────────────────────────────────────────────
# Dev server entrypoint
# ──────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )
