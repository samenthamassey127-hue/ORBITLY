"""
Search router — full-text satellite search backed by real TLE catalog.
"""
from __future__ import annotations
from fastapi import APIRouter, Query, HTTPException

from models.satellite import SearchResult
from services.satellite_service import search_satellites

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResult)
async def search(
    q: str = Query(..., min_length=1, max_length=100, description="Search query — satellite name or NORAD ID"),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Search satellites by name or NORAD ID.
    Returns ranked results from the live CelesTrak catalog.
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    result = await search_satellites(q.strip(), limit=limit)
    return result
