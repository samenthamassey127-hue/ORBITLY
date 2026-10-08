"""
Satellite Service — aggregates all providers, manages catalog,
handles search, and returns normalized SatelliteModel objects.
This is the main business logic layer.
"""
from __future__ import annotations
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from models.satellite import SatelliteModel, SatelliteListItem, SearchResult
from providers.celestrak import CelesTrakProvider
from services import cache_service

logger = logging.getLogger(__name__)

# Singleton provider instances
_celestrak = CelesTrakProvider(groups=[
    "stations",   # ISS, Tiangong CSS, modules
    "visual",     # 156 brightest visible satellites (Hubble, etc.)
    "weather",    # Weather observation satellites
    "science",    # Scientific missions
])

# In-memory index: {norad_id_str: SatelliteModel}
_satellite_index: dict[str, SatelliteModel] = {}
_is_loading: bool = False
_last_load_time: Optional[datetime] = None


async def _load_from_celestrak() -> list[SatelliteModel]:
    """Fetch TLEs from CelesTrak and return normalized models."""
    try:
        raw_records = await _celestrak.fetch_catalog()

        satellites = []
        for raw in raw_records:
            try:
                sat = _celestrak.normalize(raw)
                if sat:
                    satellites.append(sat)
            except Exception as e:
                logger.debug(f"[SatelliteService] Normalize error: {e}")

        logger.info(f"[SatelliteService] Loaded {len(satellites)} satellites")
        return satellites
    except Exception as e:
        logger.error(f"[SatelliteService] CelesTrak load failed: {e}")
        return []


async def initialize_catalog() -> None:
    """
    Load satellite catalog into memory.
    Called at startup and can be triggered for refresh.
    """
    global _is_loading, _last_load_time
    if _is_loading:
        logger.info("[SatelliteService] Load already in progress, skipping")
        return

    _is_loading = True
    try:
        logger.info("[SatelliteService] Loading satellite catalog...")
        cached = cache_service.get_satellites()
        if cached:
            logger.info(f"[SatelliteService] Using live cache ({len(cached)} entries)")
            _rebuild_index(cached)
            return

        satellites = await _load_from_celestrak()

        if satellites:
            cache_service.set_satellites(satellites)
            _rebuild_index(satellites)
            _last_load_time = datetime.now(timezone.utc)
            logger.info(f"[SatelliteService] Catalog initialized: {len(satellites)} satellites")
        else:
            # Try disk fallback
            disk_data, disk_time, is_stale = cache_service.get_satellites_fallback()
            if disk_data:
                logger.warning("[SatelliteService] Using stale disk cache")
                restored = _deserialize_satellites(disk_data)
                _rebuild_index(restored, mark_stale=True)
            else:
                logger.error("[SatelliteService] No satellite data available")

    finally:
        _is_loading = False


def _rebuild_index(satellites: list, mark_stale: bool = False) -> None:
    """Rebuild the in-memory lookup index."""
    global _satellite_index
    _satellite_index = {}
    for sat in satellites:
        if isinstance(sat, dict):
            # Deserializing from cache
            try:
                sat_obj = SatelliteModel(**sat)
                if mark_stale:
                    sat_obj.is_stale = True
                _satellite_index[sat_obj.id] = sat_obj
            except Exception:
                pass
        elif isinstance(sat, SatelliteModel):
            if mark_stale:
                sat.is_stale = True
            _satellite_index[sat.id] = sat
    logger.debug(f"[SatelliteService] Index rebuilt with {len(_satellite_index)} entries")


def _deserialize_satellites(data: list) -> list[SatelliteModel]:
    """Convert JSON-loaded dicts back to SatelliteModel."""
    result = []
    for d in data:
        try:
            result.append(SatelliteModel(**d))
        except Exception:
            pass
    return result


async def get_satellite_by_id(satellite_id: str) -> Optional[SatelliteModel]:
    """Retrieve a single satellite by NORAD ID string."""
    if not _satellite_index:
        await initialize_catalog()
    sat = _satellite_index.get(satellite_id)
    if not sat and satellite_id.strip():
        # Live query directly from CelesTrak by NORAD ID or name
        try:
            records = await _celestrak.fetch_tle_by_query(satellite_id)
            if records:
                sat = _celestrak.normalize(records[0])
                if sat:
                    _satellite_index[sat.id] = sat
        except Exception as e:
            logger.warning(f"Live CelesTrak lookup for {satellite_id} failed: {e}")
    return sat


async def search_satellites(query: str, limit: int = 20) -> SearchResult:
    """
    Full-text search across satellite names and NORAD IDs.
    Returns ranked results with the best matches first.
    If no matches in local cache, searches CelesTrak live API.
    """
    if not _satellite_index:
        await initialize_catalog()

    query_lower = query.lower().strip()
    query_digits = "".join(c for c in query if c.isdigit())

    results: list[tuple[int, SatelliteListItem]] = []

    for sat_id, sat in _satellite_index.items():
        score = 0
        name_lower = sat.name.lower()

        # Exact NORAD ID match
        if query_digits and str(sat.norad_id) == query_digits:
            score = 100
        # Name starts with query
        elif name_lower.startswith(query_lower):
            score = 80
        # Name contains query
        elif query_lower in name_lower:
            score = 60
        # Partial word match
        elif any(query_lower in word for word in name_lower.split()):
            score = 40
        # NORAD ID contains digits
        elif query_digits and query_digits in str(sat.norad_id):
            score = 30

        if score > 0:
            results.append((score, SatelliteListItem(
                id=sat.id,
                norad_id=sat.norad_id,
                name=sat.name,
                orbit_type=sat.derived.orbit_type if sat.derived else None,
                altitude_km=sat.derived.altitude_km if sat.derived else None,
                country=sat.country,
                object_type=sat.object_type,
                operational_status=sat.operational_status,
                last_updated=sat.last_updated,
                is_stale=sat.is_stale,
            )))

    # Sort by score descending
    results.sort(key=lambda x: x[0], reverse=True)
    top_results = [item for _, item in results[:limit]]

    # If no local results, query CelesTrak live API!
    if not top_results and query.strip():
        try:
            live_records = await _celestrak.fetch_tle_by_query(query)
            for rec in live_records:
                sat = _celestrak.normalize(rec)
                if sat:
                    _satellite_index[sat.id] = sat
                    top_results.append(SatelliteListItem(
                        id=sat.id,
                        norad_id=sat.norad_id,
                        name=sat.name,
                        orbit_type=sat.derived.orbit_type if sat.derived else None,
                        altitude_km=sat.derived.altitude_km if sat.derived else None,
                        country=sat.country,
                        object_type=sat.object_type,
                        operational_status=sat.operational_status,
                        last_updated=sat.last_updated,
                        is_stale=sat.is_stale,
                    ))
                    if len(top_results) >= limit:
                        break
        except Exception as e:
            logger.warning(f"Live CelesTrak search query failed: {e}")

    return SearchResult(
        query=query,
        total=len(top_results) if not results else len(results),
        results=top_results,
        data_source="CelesTrak (Live)",
        retrieved_at=datetime.now(timezone.utc),
    )


async def get_featured_satellites(limit: int = 12) -> list[SatelliteListItem]:
    """
    Return a curated list of interesting/famous satellites.
    Pulled from real catalog data, not hardcoded.
    """
    if not _satellite_index:
        await initialize_catalog()

    # Famous NORAD IDs we want to feature
    FEATURED_NORAD_IDS = [
        25544,  # ISS
        48274,  # Tiangong CSS
        33591,  # Hubble Space Telescope
        27424,  # Terra (Earth observation)
        25994,  # Landsat 7
        39084,  # Landsat 8
        49260,  # Landsat 9
        20580,  # Hubble (original ID)
        41866,  # GOES-16
        43226,  # GOES-17
        45026,  # GOES-18
        27386,  # Aqua
        29107,  # NOAA-19
        37849,  # Suomi NPP
        43013,  # NOAA-20
        38858,  # Globalstar
    ]

    featured = []
    for norad_id in FEATURED_NORAD_IDS:
        sat = _satellite_index.get(str(norad_id))
        if sat:
            featured.append(SatelliteListItem(
                id=sat.id,
                norad_id=sat.norad_id,
                name=sat.name,
                orbit_type=sat.derived.orbit_type if sat.derived else None,
                altitude_km=sat.derived.altitude_km if sat.derived else None,
                country=sat.country,
                object_type=sat.object_type,
                operational_status=sat.operational_status,
                last_updated=sat.last_updated,
                is_stale=sat.is_stale,
            ))

    # Fill remainder from active satellites (Starlink, etc)
    if len(featured) < limit:
        count = 0
        for sat_id, sat in _satellite_index.items():
            if count >= limit - len(featured):
                break
            if any(str(sat.norad_id) == str(f) for f in FEATURED_NORAD_IDS):
                continue
            if sat.object_type == "PAYLOAD":
                featured.append(SatelliteListItem(
                    id=sat.id,
                    norad_id=sat.norad_id,
                    name=sat.name,
                    orbit_type=sat.derived.orbit_type if sat.derived else None,
                    altitude_km=sat.derived.altitude_km if sat.derived else None,
                    country=sat.country,
                    object_type=sat.object_type,
                    operational_status=sat.operational_status,
                    last_updated=sat.last_updated,
                    is_stale=sat.is_stale,
                ))
                count += 1

    return featured[:limit]


async def get_catalog_stats() -> dict:
    """Return stats about the current satellite catalog."""
    if not _satellite_index:
        await initialize_catalog()

    payloads = sum(1 for s in _satellite_index.values() if s.object_type == "PAYLOAD")
    debris = sum(1 for s in _satellite_index.values() if s.object_type == "DEBRIS")
    leo = sum(1 for s in _satellite_index.values() if s.derived and s.derived.orbit_type == "LEO")
    geo = sum(1 for s in _satellite_index.values() if s.derived and s.derived.orbit_type == "GEO")

    return {
        "total": len(_satellite_index),
        "payloads": payloads,
        "debris": debris,
        "leo_count": leo,
        "geo_count": geo,
        "last_updated": _last_load_time.isoformat() if _last_load_time else None,
    }
