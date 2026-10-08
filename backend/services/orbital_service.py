"""
Orbital Service — uses sgp4 to propagate TLE to current position.
Provides real-time satellite position (latitude, longitude, altitude)
and generates the orbit path for 3D visualization.
"""
from __future__ import annotations
import logging
import math
from datetime import datetime, timezone
from typing import Optional

from models.satellite import SatelliteModel, DerivedOrbitalData

logger = logging.getLogger(__name__)

try:
    from sgp4.api import Satrec, WGS72
    SGP4_AVAILABLE = True
    logger.info("[OrbitalService] sgp4 library available")
except ImportError:
    SGP4_AVAILABLE = False
    logger.warning("[OrbitalService] sgp4 not available — position propagation disabled")


def propagate_position(satellite: SatelliteModel, dt: Optional[datetime] = None) -> dict:
    """
    Propagate satellite position using SGP4 to the given datetime (default: now).
    Returns dict with lat/lon/alt and ECI coordinates.
    """
    if not SGP4_AVAILABLE:
        return {"error": "sgp4 not available", "lat": 0.0, "lon": 0.0, "alt_km": 0.0}

    if not satellite.tle_line1 or not satellite.tle_line2:
        return {"error": "No TLE data", "lat": 0.0, "lon": 0.0, "alt_km": 0.0}

    dt = dt or datetime.now(timezone.utc)

    try:
        sat = Satrec.twoline2rv(satellite.tle_line1, satellite.tle_line2)

        # SGP4 needs fractional Julian day
        from sgp4.api import jday
        jd, fr = jday(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second + dt.microsecond / 1e6)

        e, r, v = sat.sgp4(jd, fr)

        if e != 0:
            return {"error": f"SGP4 error code {e}", "lat": 0.0, "lon": 0.0, "alt_km": 0.0}

        # r is ECI position in km [x, y, z]
        x, y, z = r
        vx, vy, vz = v

        # Convert ECI to geodetic (lat/lon/alt)
        lat, lon, alt = _eci_to_geodetic(x, y, z, dt)

        # Actual velocity magnitude
        velocity = math.sqrt(vx**2 + vy**2 + vz**2)

        return {
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "alt_km": round(alt, 2),
            "velocity_km_s": round(velocity, 3),
            "position_eci": {"x": round(x, 3), "y": round(y, 3), "z": round(z, 3)},
            "timestamp": dt.isoformat(),
            "error": None,
        }
    except Exception as e:
        logger.error(f"[OrbitalService] SGP4 propagation failed for {satellite.norad_id}: {e}")
        return {"error": str(e), "lat": 0.0, "lon": 0.0, "alt_km": 0.0}


def generate_orbit_path(satellite: SatelliteModel, points: int = 180) -> list[dict]:
    """
    Generate a list of lat/lon/alt points representing one full orbit.
    Used for the 3D orbit trajectory visualization.
    Points are sampled at equal time intervals over one full orbital period.
    """
    if not SGP4_AVAILABLE or not satellite.tle_line1 or not satellite.tle_line2:
        return []

    try:
        from sgp4.api import Satrec, jday

        sat = Satrec.twoline2rv(satellite.tle_line1, satellite.tle_line2)

        period_min = None
        if satellite.derived and satellite.derived.period_minutes:
            period_min = satellite.derived.period_minutes
        elif satellite.orbital_elements and satellite.orbital_elements.mean_motion_rev_per_day:
            period_min = 1440.0 / satellite.orbital_elements.mean_motion_rev_per_day

        if not period_min:
            return []

        now = datetime.now(timezone.utc)
        step_seconds = (period_min * 60) / points

        path = []
        for i in range(points):
            import datetime as dt_mod
            t = now + dt_mod.timedelta(seconds=i * step_seconds)
            jd, fr = jday(t.year, t.month, t.day, t.hour, t.minute, t.second)
            e, r, v = sat.sgp4(jd, fr)
            if e == 0:
                lat, lon, alt = _eci_to_geodetic(r[0], r[1], r[2], t)
                path.append({"lat": round(lat, 3), "lon": round(lon, 3), "alt_km": round(alt, 1)})

        return path
    except Exception as e:
        logger.error(f"[OrbitalService] Orbit path generation failed: {e}")
        return []


def _eci_to_geodetic(x: float, y: float, z: float, dt: datetime) -> tuple[float, float, float]:
    """
    Convert ECI (Earth-Centered Inertial) coordinates to geodetic lat/lon/alt.
    Uses the standard algorithm accounting for Earth's rotation (GMST).
    """
    # Earth's gravitational constant and radii
    EARTH_RADIUS_KM = 6378.137
    FLATTENING = 1 / 298.257223563
    ECC_SQUARED = 2 * FLATTENING - FLATTENING ** 2

    # GMST (Greenwich Mean Sidereal Time) to rotate ECI → ECEF
    jd = _julian_day(dt)
    gmst = _gmst_rad(jd)

    # Rotate ECI to ECEF
    cos_gmst = math.cos(gmst)
    sin_gmst = math.sin(gmst)
    xe = x * cos_gmst + y * sin_gmst
    ye = -x * sin_gmst + y * cos_gmst
    ze = z

    # ECEF to geodetic (Bowring's iterative method)
    p = math.sqrt(xe**2 + ye**2)
    lon = math.atan2(ye, xe)

    lat = math.atan2(ze, p * (1 - ECC_SQUARED))
    for _ in range(5):
        sin_lat = math.sin(lat)
        N = EARTH_RADIUS_KM / math.sqrt(1 - ECC_SQUARED * sin_lat**2)
        lat = math.atan2(ze + ECC_SQUARED * N * sin_lat, p)

    sin_lat = math.sin(lat)
    N = EARTH_RADIUS_KM / math.sqrt(1 - ECC_SQUARED * sin_lat**2)
    alt = p / math.cos(lat) - N if abs(math.cos(lat)) > 1e-10 else abs(ze) / abs(sin_lat) - N * (1 - ECC_SQUARED)

    return math.degrees(lat), math.degrees(lon), alt


def _julian_day(dt: datetime) -> float:
    """Compute Julian Day Number from datetime."""
    a = (14 - dt.month) // 12
    y = dt.year + 4800 - a
    m = dt.month + 12 * a - 3
    jdn = dt.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
    return jdn + (dt.hour - 12) / 24 + dt.minute / 1440 + dt.second / 86400


def _gmst_rad(jd: float) -> float:
    """Compute Greenwich Mean Sidereal Time in radians."""
    T = (jd - 2451545.0) / 36525.0
    gmst_deg = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000)
    return math.radians(gmst_deg % 360)
