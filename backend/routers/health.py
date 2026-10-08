"""
Health check router — exposes cache status and system info.
Useful for demonstrating that the backend is doing real work.
"""
from __future__ import annotations
from datetime import datetime, timezone

from fastapi import APIRouter

from services import cache_service
from services.satellite_service import get_catalog_stats

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check():
    """System health and cache status."""
    cache = cache_service.cache_status()
    stats = await get_catalog_stats()

    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cache": cache,
        "catalog": stats,
        "version": "1.0.0-prototype",
    }
