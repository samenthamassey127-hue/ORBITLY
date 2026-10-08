"""
Cache Service — TTL in-memory cache with disk JSON fallback.
Prevents hammering external APIs on every request.
Falls back to cached disk data if external API is unreachable.
"""
from __future__ import annotations
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from cachetools import TTLCache

from config import settings

logger = logging.getLogger(__name__)

# In-memory caches with different TTLs
_satellite_cache: TTLCache = TTLCache(maxsize=1, ttl=settings.cache_ttl_seconds)
_launch_cache: TTLCache = TTLCache(maxsize=1, ttl=settings.launch_cache_ttl_seconds)
_satcat_cache: TTLCache = TTLCache(maxsize=1, ttl=3600)  # 1 hour

CACHE_KEY_SATELLITES = "satellites"
CACHE_KEY_LAUNCHES = "launches"
CACHE_KEY_SATCAT = "satcat"

DISK_CACHE_DIR = Path(settings.disk_cache_dir)


def _disk_path(key: str) -> Path:
    DISK_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return DISK_CACHE_DIR / f"{key}.json"


def _write_disk(key: str, data: Any) -> None:
    """Serialize data to disk as JSON fallback."""
    try:
        payload = {
            "written_at": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }
        path = _disk_path(key)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, default=str)
        logger.debug(f"[Cache] Wrote disk cache: {path}")
    except Exception as e:
        logger.warning(f"[Cache] Disk write failed for '{key}': {e}")


def _read_disk(key: str) -> tuple[Optional[Any], Optional[datetime]]:
    """Read disk fallback. Returns (data, written_at) or (None, None)."""
    try:
        path = _disk_path(key)
        if not path.exists():
            return None, None
        with open(path, "r", encoding="utf-8") as f:
            payload = json.load(f)
        written_at = datetime.fromisoformat(payload["written_at"])
        return payload["data"], written_at
    except Exception as e:
        logger.warning(f"[Cache] Disk read failed for '{key}': {e}")
        return None, None


def get_satellites() -> Optional[list]:
    return _satellite_cache.get(CACHE_KEY_SATELLITES)


def set_satellites(data: list) -> None:
    _satellite_cache[CACHE_KEY_SATELLITES] = data
    _write_disk(CACHE_KEY_SATELLITES, [s if isinstance(s, dict) else s.model_dump(mode="json") for s in data])


def get_satellites_fallback() -> tuple[Optional[list], Optional[datetime], bool]:
    """Returns (data, timestamp, is_stale). is_stale=True if from disk."""
    live = get_satellites()
    if live is not None:
        return live, datetime.now(timezone.utc), False
    data, written_at = _read_disk(CACHE_KEY_SATELLITES)
    return data, written_at, True


def get_launches() -> Optional[list]:
    return _launch_cache.get(CACHE_KEY_LAUNCHES)


def set_launches(data: list) -> None:
    _launch_cache[CACHE_KEY_LAUNCHES] = data
    _write_disk(CACHE_KEY_LAUNCHES, data)


def get_satcat() -> Optional[dict]:
    return _satcat_cache.get(CACHE_KEY_SATCAT)


def set_satcat(data: dict) -> None:
    _satcat_cache[CACHE_KEY_SATCAT] = data


def cache_status() -> dict:
    """Return current cache status for the health endpoint."""
    disk_sat, disk_sat_time = _read_disk(CACHE_KEY_SATELLITES)
    return {
        "satellite_cache_live": CACHE_KEY_SATELLITES in _satellite_cache,
        "satellite_cache_entries": len(_satellite_cache.get(CACHE_KEY_SATELLITES, []) or []),
        "satellite_ttl_seconds": settings.cache_ttl_seconds,
        "launch_cache_live": CACHE_KEY_LAUNCHES in _launch_cache,
        "disk_cache_available": disk_sat is not None,
        "disk_cache_written_at": disk_sat_time.isoformat() if disk_sat_time else None,
    }
