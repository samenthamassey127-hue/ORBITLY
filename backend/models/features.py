"""
Pydantic Models for Expanded ORBITLY Features:
- Launches (Live rocket launch schedules & mission profiles)
- Space Concepts (Dual-mode explanations ELI10 & College with visual cues)
- Personalized Dashboard (Students, Astronomers, Small Businesses, Educators)
- Ask ORBITLY Assistant (Conversational Q&A with verified data & citations)
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ── Rocket Launches ──────────────────────────────────────
class RocketLaunch(BaseModel):
    id: str
    name: str
    provider: str                    # SpaceX, NASA, ISRO, Rocket Lab, ESA
    vehicle: str                     # Falcon 9, Starship, PSLV, Ariane 6
    pad: str                         # Cape Canaveral SLC-40, Satish Dhawan, etc.
    window_start: datetime
    status: str                      # Go, TBD, Success, In Flight
    orbit_type: str                  # LEO, GTO, Lunar, Deep Space
    payload_description: str
    mission_type: str                # Communications, Crew, Earth Observation, Planetary
    countdown_seconds: Optional[int] = None
    webcast_url: Optional[str] = None


# ── Space Concepts ──────────────────────────────────────
class SpaceConcept(BaseModel):
    slug: str
    title: str
    tagline: str
    icon: str
    eli10: str                       # Explain like I'm 10 years old
    college: str                     # College / Aerospace Engineering explanation
    formula: Optional[str] = None    # Mathematical formula
    real_example_name: str           # e.g., ISS (ZARYA)
    real_example_id: str             # e.g., 25544
    real_example_stat: str           # e.g., "7.66 km/s at 420 km altitude"
    visual_type: str                 # ellipse, tilt, velocity_curve, altitude_scale


# ── Personalized Dashboard ──────────────────────────────
class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    hint: str


class VisiblePass(BaseModel):
    satellite_name: str
    norad_id: int
    rise_time: str
    max_elevation: str
    magnitude: str                   # e.g. -3.2 (very bright)
    naked_eye: bool
    direction: str                   # e.g. "SW to NE"


class CommercialService(BaseModel):
    category: str                    # Broadband, Optical Imaging, SAR, IoT
    constellation: str               # Starlink, Planet SkySat, Capella Space
    resolution: Optional[str] = None # e.g. "0.5m GSD"
    revisit_rate: str                # e.g. "Daily / 90 mins"
    business_use_case: str


class ClassroomTopic(BaseModel):
    grade_level: str                 # Middle School, High School, College
    title: str
    physics_principle: str           # Newton's Gravity, Kepler's 3rd Law, Centripetal Force
    activity: str
    satellite_lab: str


class RoleDashboardData(BaseModel):
    role: str                        # student, astronomer, business, educator
    headline: str
    subtext: str
    quick_stats: Dict[str, str]
    quiz: Optional[List[QuizQuestion]] = None
    visible_passes: Optional[List[VisiblePass]] = None
    commercial_services: Optional[List[CommercialService]] = None
    classroom_topics: Optional[List[ClassroomTopic]] = None


# ── Ask ORBITLY Assistant ────────────────────────────────
class AssistantQuery(BaseModel):
    question: str
    satellite_id: Optional[str] = None
    mode: Optional[str] = "balanced"  # eli10, college, balanced


class AssistantDataPoint(BaseModel):
    label: str
    value: str
    unit: Optional[str] = None


class AssistantResponse(BaseModel):
    question: str
    answer: str
    eli10_summary: str
    verified: bool
    data_points: List[AssistantDataPoint]
    source: str
    visual_cue: Optional[str] = None
    suggested_followups: List[str]
