"""
Satellites router — list, detail, position, and featured endpoints.
"""
from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query

from models.satellite import SatelliteDetail, SatelliteListItem
from services.satellite_service import (
    get_satellite_by_id, get_featured_satellites, get_catalog_stats
)
from services.orbital_service import propagate_position, generate_orbit_path
from services.explanation_service import explain_satellite

router = APIRouter(prefix="/api/satellites", tags=["satellites"])


@router.get("/featured", response_model=list[SatelliteListItem])
async def featured_satellites(limit: int = Query(12, ge=1, le=50)):
    """
    Return a curated list of notable satellites.
    Pulled from live CelesTrak catalog — always real data.
    """
    return await get_featured_satellites(limit=limit)


@router.get("/stats")
async def catalog_stats():
    """Return overall catalog statistics."""
    return await get_catalog_stats()


@router.get("/{satellite_id}", response_model=SatelliteDetail)
async def get_satellite(satellite_id: str):
    """
    Retrieve full satellite detail including orbital elements,
    derived data, real-time SGP4 position, and human-readable explanations.
    """
    sat = await get_satellite_by_id(satellite_id)
    if not sat:
        raise HTTPException(status_code=404, detail=f"Satellite '{satellite_id}' not found")

    # Inject real-time SGP4 position into derived fields
    try:
        pos = propagate_position(sat)
        if not pos.get("error") and sat.derived:
            sat.derived.latitude = pos.get("lat")
            sat.derived.longitude = pos.get("lon")
            if pos.get("alt_km"):
                sat.derived.altitude_km = pos.get("alt_km")
            if pos.get("velocity_km_s"):
                sat.derived.velocity_km_s = pos.get("velocity_km_s")
    except Exception:
        pass

    # Generate explanations (AI + deterministic fallback)
    explanations, summary = await explain_satellite(sat)

    return SatelliteDetail(
        satellite=sat,
        explanations=explanations,
        summary=summary,
    )


@router.get("/{satellite_id}/position")
async def get_position(satellite_id: str):
    """
    Get real-time propagated position using SGP4.
    Returns lat/lon/alt and velocity computed from TLE.
    """
    sat = await get_satellite_by_id(satellite_id)
    if not sat:
        raise HTTPException(status_code=404, detail=f"Satellite '{satellite_id}' not found")

    position = propagate_position(sat)
    return {
        "satellite_id": satellite_id,
        "name": sat.name,
        "position": position,
        "computed_at": datetime.now(timezone.utc).isoformat(),
        "method": "SGP4",
        "tle_epoch": sat.orbital_elements.epoch.isoformat() if sat.orbital_elements and sat.orbital_elements.epoch else None,
    }


@router.get("/{satellite_id}/orbit")
async def get_orbit_path(satellite_id: str, points: int = Query(180, ge=30, le=360)):
    """
    Get the satellite's full orbital path as a series of lat/lon/alt points.
    Used to draw the orbit trace on the 3D globe.
    """
    sat = await get_satellite_by_id(satellite_id)
    if not sat:
        raise HTTPException(status_code=404, detail=f"Satellite '{satellite_id}' not found")

    path = generate_orbit_path(sat, points=points)
    return {
        "satellite_id": satellite_id,
        "name": sat.name,
        "period_minutes": sat.derived.period_minutes if sat.derived else None,
        "orbit_path": path,
        "point_count": len(path),
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }
