"""
Concepts router — Space concepts in plain English with dual-mode (ELI10 / College) explanations.
"""
from __future__ import annotations
from typing import List
from fastapi import APIRouter, HTTPException

from models.features import SpaceConcept
from services.concept_service import get_all_concepts, get_concept_by_slug

router = APIRouter(prefix="/api/concepts", tags=["concepts"])


@router.get("", response_model=List[SpaceConcept])
async def list_concepts():
    """
    Get all core space concepts with dual explanations (ELI10 and College level),
    mathematical formulas, visual cues, and real satellite anchors.
    """
    return await get_all_concepts()


@router.get("/{slug}", response_model=SpaceConcept)
async def get_concept(slug: str):
    """
    Get a specific space concept by slug.
    """
    concept = await get_concept_by_slug(slug)
    if not concept:
        raise HTTPException(status_code=404, detail=f"Space concept '{slug}' not found")
    return concept
