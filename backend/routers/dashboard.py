"""
Dashboard router — Personalized space dashboard tailored to Students, Astronomers, Businesses, and Educators.
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException

from models.features import RoleDashboardData
from services.dashboard_service import get_role_dashboard

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/{role}", response_model=RoleDashboardData)
async def get_dashboard_data(role: str):
    """
    Get personalized dashboard data tailored to a specific audience:
    - student: space concepts, interactive quizzes, student project ideas
    - astronomer: visible satellite passes, visual magnitude, naked-eye sightings
    - business: commercial constellations, Earth observation revisit rates, SAR & broadband
    - educator: classroom lesson plans, physics demonstration guides
    """
    data = await get_role_dashboard(role)
    if not data:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{role}'. Valid roles are: student, astronomer, business, educator."
        )
    return data
