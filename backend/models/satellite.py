"""
Normalized Satellite Model — the single internal representation
that all providers must produce. Decouples frontend from external API formats.
"""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class OrbitalElements(BaseModel):
    """Raw Two-Line Element Set derived values."""
    inclination_deg: Optional[float] = None        # degrees
    raan_deg: Optional[float] = None               # Right Ascension of Ascending Node
    eccentricity: Optional[float] = None
    arg_perigee_deg: Optional[float] = None        # Argument of perigee
    mean_anomaly_deg: Optional[float] = None
    mean_motion_rev_per_day: Optional[float] = None
    epoch: Optional[datetime] = None
    bstar: Optional[float] = None                  # drag term


class DerivedOrbitalData(BaseModel):
    """Values computed from TLE by backend services."""
    altitude_km: Optional[float] = None
    apogee_km: Optional[float] = None
    perigee_km: Optional[float] = None
    period_minutes: Optional[float] = None
    velocity_km_s: Optional[float] = None
    orbit_type: Optional[str] = None              # LEO / MEO / GEO / HEO
    latitude: Optional[float] = None              # current sub-satellite point
    longitude: Optional[float] = None
    position_x: Optional[float] = None            # ECI km
    position_y: Optional[float] = None
    position_z: Optional[float] = None


class LaunchInfo(BaseModel):
    """Launch details from Launch Library 2 or similar."""
    launch_date: Optional[str] = None
    launch_site: Optional[str] = None
    rocket: Optional[str] = None
    mission_description: Optional[str] = None
    mission_type: Optional[str] = None


class FieldExplanation(BaseModel):
    """Human-readable explanation for a single technical field."""
    field: str
    value: str
    unit: Optional[str] = None
    explanation: str
    analogy: Optional[str] = None


class SatelliteModel(BaseModel):
    """
    The single normalized satellite object served to the frontend.
    All providers must populate this structure.
    """
    # Identity
    id: str                                        # NORAD catalog number as string
    norad_id: int
    name: str
    international_designator: Optional[str] = None
    object_type: Optional[str] = None             # PAYLOAD / ROCKET BODY / DEBRIS

    # Status
    operational_status: Optional[str] = None      # "Operational", "Decayed", "Unknown"
    country: Optional[str] = None
    owner: Optional[str] = None

    # Raw TLE
    tle_line1: Optional[str] = None
    tle_line2: Optional[str] = None

    # Orbital elements (from TLE parse)
    orbital_elements: Optional[OrbitalElements] = None

    # Derived data (computed by orbital_service)
    derived: Optional[DerivedOrbitalData] = None

    # Launch info (from Launch Library 2)
    launch: Optional[LaunchInfo] = None

    # Explanations (from explanation_service)
    explanations: Optional[list[FieldExplanation]] = None

    # Data provenance
    source: str = "CelesTrak"
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    is_stale: bool = False


class SatelliteListItem(BaseModel):
    """Lightweight version for list/search results."""
    id: str
    norad_id: int
    name: str
    orbit_type: Optional[str] = None
    altitude_km: Optional[float] = None
    country: Optional[str] = None
    object_type: Optional[str] = None
    operational_status: Optional[str] = None
    last_updated: datetime
    is_stale: bool = False


class SearchResult(BaseModel):
    query: str
    total: int
    results: list[SatelliteListItem]
    data_source: str
    retrieved_at: datetime


class SatelliteDetail(BaseModel):
    satellite: SatelliteModel
    explanations: list[FieldExplanation]
    summary: Optional[str] = None   # One-paragraph AI summary
