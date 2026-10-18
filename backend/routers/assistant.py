"""
Assistant router — "Ask ORBITLY" conversational AI space assistant.
"""
from __future__ import annotations
from fastapi import APIRouter

from models.features import AssistantQuery, AssistantResponse
from services.assistant_service import ask_orbitly

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.post("/ask", response_model=AssistantResponse)
async def ask_space_assistant(query: AssistantQuery):
    """
    Ask ORBITLY anything about space, satellites, rocket launches, and orbital physics.
    Distinguishes verified live telemetry data from theoretical estimates.
    Provides simple ELI10 summaries alongside detailed engineering explanations.
    """
    return await ask_orbitly(query)
