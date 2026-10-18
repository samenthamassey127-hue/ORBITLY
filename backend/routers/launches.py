"""
Launches router — Upcoming rocket launches, countdowns, and mission profiles.
"""
from __future__ import annotations
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query

from models.features import RocketLaunch
from services.launch_service import get_upcoming_launches, get_launch_by_id

router = APIRouter(prefix="/api/launches", tags=["launches"])


@router.get("", response_model=List[RocketLaunch])
async def list_launches(
    provider: Optional[str] = Query(None, description="Filter by launch provider (e.g., SpaceX, NASA, ISRO)"),
    mission_type: Optional[str] = Query(None, description="Filter by mission type (e.g., Communications, Crew)")
):
    """
    Get live upcoming rocket launches with real-time countdown calculations.
    """
    return await get_upcoming_launches(provider=provider, mission_type=mission_type)


@router.get("/{launch_id}", response_model=RocketLaunch)
async def get_launch(launch_id: str):
    """
    Get details for a specific rocket launch.
    """
    launch = await get_launch_by_id(launch_id)
    if not launch:
        raise HTTPException(status_code=404, detail=f"Launch '{launch_id}' not found")
    return launch
