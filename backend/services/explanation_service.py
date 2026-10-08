"""
Explanation Service — transforms raw orbital data into human-readable text.
Primary: Google Gemini API
Fallback: Deterministic rule-based explanations (always works without API key)
"""
from __future__ import annotations
import logging
from typing import Optional

from models.satellite import SatelliteModel, FieldExplanation

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Deterministic rule-based explanations (fallback)
# These are always accurate and never hallucinate.
# ──────────────────────────────────────────────

ORBIT_TYPE_DESCRIPTIONS = {
    "LEO": "Low Earth Orbit — the satellite flies close to Earth, completing many orbits per day. Most crewed missions and Earth observation satellites live here.",
    "MEO": "Medium Earth Orbit — the satellite sits between LEO and geostationary orbit. GPS satellites orbit here.",
    "GEO": "Geostationary Orbit — the satellite hovers over a fixed point above the equator because it orbits at exactly the same speed Earth rotates. TV broadcast and weather satellites use this.",
    "HEO": "Highly Elliptical Orbit — an oval-shaped orbit that carries the satellite very close to Earth at one end and far away at the other.",
}


def _inclination_explanation(deg: float) -> str:
    if deg < 5:
        return f"At {deg:.1f}°, this orbit is nearly equatorial — the satellite always flies close to the equator. Geostationary satellites have near-zero inclination."
    elif deg < 30:
        return f"At {deg:.1f}°, this orbit is moderately tilted from the equator. The satellite can observe subtropical and tropical regions."
    elif deg < 60:
        return f"At {deg:.1f}°, the orbit is significantly inclined. The satellite covers a wide band of latitudes including most populated areas."
    elif deg < 80:
        return f"At {deg:.1f}°, this is a high-inclination orbit. The satellite passes over a large portion of Earth's surface each day."
    elif deg < 98:
        return f"At {deg:.1f}°, this is likely a sun-synchronous orbit — a special path where the satellite always crosses the equator at the same local solar time. Ideal for Earth observation."
    else:
        return f"At {deg:.1f}°, this is a retrograde orbit — the satellite orbits opposite to Earth's rotation direction."


def _period_explanation(minutes: float) -> str:
    hours = minutes / 60
    if minutes < 90:
        return f"The satellite completes one full trip around Earth in {minutes:.0f} minutes — faster than a feature film."
    elif minutes < 110:
        return f"The satellite orbits Earth in about {minutes:.0f} minutes ({hours:.1f} hours). At this altitude, it experiences roughly 15-16 sunrises per day."
    elif minutes < 200:
        return f"One orbit takes {minutes:.0f} minutes ({hours:.1f} hours). The satellite covers the globe several times each day."
    elif minutes < 720:
        return f"The satellite takes {hours:.1f} hours to complete one orbit — it moves much slower than low-orbit satellites."
    else:
        return f"With a period of {hours:.1f} hours, this satellite is in a high or geostationary orbit, barely visible to move against the stars."


def _altitude_explanation(km: float) -> str:
    if km < 400:
        return f"At {km:.0f} km up, the satellite skims the upper atmosphere. Drag gradually slows it, so it needs occasional reboosting."
    elif km < 600:
        return f"At {km:.0f} km, the satellite is in a very common low Earth orbit. The ISS operates at roughly this altitude."
    elif km < 2000:
        return f"At {km:.0f} km altitude, the satellite is solidly in low Earth orbit — far above weather but well below the Van Allen radiation belts."
    elif km < 20000:
        return f"At {km:.0f} km, this satellite is in medium Earth orbit — the realm of GPS and navigation satellites."
    elif 35000 < km < 36600:
        return f"At approximately 35,786 km — geostationary altitude — the satellite appears stationary over one point on Earth."
    else:
        return f"At {km:.0f} km, this satellite is in a very high orbit. Objects here have extremely long orbital lifetimes."


def _eccentricity_explanation(ecc: float) -> str:
    if ecc < 0.01:
        return f"Eccentricity of {ecc:.4f} — this orbit is nearly a perfect circle. The satellite maintains an almost constant altitude."
    elif ecc < 0.1:
        return f"Eccentricity of {ecc:.4f} — a slightly oval orbit. The satellite is a bit closer to Earth at one point (perigee) and a bit farther at another (apogee)."
    elif ecc < 0.5:
        return f"Eccentricity of {ecc:.4f} — a noticeably elliptical orbit. The satellite varies significantly in altitude during each orbit."
    else:
        return f"Eccentricity of {ecc:.4f} — a highly elliptical orbit. The satellite swings from very close to Earth to very far away on each orbit."


def _velocity_explanation(km_s: float) -> str:
    mph = km_s * 2236.9
    return (
        f"Moving at {km_s:.2f} km/s ({mph:,.0f} mph) — "
        f"fast enough to circle Earth in about {40075 / (km_s * 3.6):.0f} minutes if it flew along the equator."
    )


def build_deterministic_explanations(satellite: SatelliteModel) -> list[FieldExplanation]:
    """Build a list of human-readable field explanations from satellite data."""
    explanations: list[FieldExplanation] = []
    el = satellite.orbital_elements
    der = satellite.derived

    if der and der.altitude_km is not None:
        explanations.append(FieldExplanation(
            field="Altitude",
            value=f"{der.altitude_km:.0f} km",
            unit="km",
            explanation=_altitude_explanation(der.altitude_km),
            analogy=f"That's about {der.altitude_km / 8.849:.0f}× the height of Mount Everest." if der.altitude_km < 5000 else None,
        ))

    if der and der.period_minutes is not None:
        explanations.append(FieldExplanation(
            field="Orbital Period",
            value=f"{der.period_minutes:.1f} min",
            unit="minutes",
            explanation=_period_explanation(der.period_minutes),
        ))

    if el and el.inclination_deg is not None:
        explanations.append(FieldExplanation(
            field="Inclination",
            value=f"{el.inclination_deg:.2f}°",
            unit="degrees",
            explanation=_inclination_explanation(el.inclination_deg),
            analogy="Think of it as the tilt of the satellite's orbital 'highway' relative to the equator.",
        ))

    if el and el.eccentricity is not None:
        explanations.append(FieldExplanation(
            field="Eccentricity",
            value=f"{el.eccentricity:.5f}",
            explanation=_eccentricity_explanation(el.eccentricity),
            analogy="0 = perfect circle, 1 = parabolic escape trajectory.",
        ))

    if der and der.apogee_km is not None and der.perigee_km is not None:
        explanations.append(FieldExplanation(
            field="Apogee / Perigee",
            value=f"{der.apogee_km:.0f} km / {der.perigee_km:.0f} km",
            unit="km",
            explanation=(
                f"Apogee is the satellite's highest point above Earth ({der.apogee_km:.0f} km) and "
                f"perigee is its lowest ({der.perigee_km:.0f} km). "
                "Like a swinging pendulum, the satellite speeds up near perigee and slows down near apogee."
            ),
        ))

    if der and der.velocity_km_s is not None:
        explanations.append(FieldExplanation(
            field="Orbital Velocity",
            value=f"{der.velocity_km_s:.2f} km/s",
            unit="km/s",
            explanation=_velocity_explanation(der.velocity_km_s),
        ))

    if der and der.orbit_type:
        explanations.append(FieldExplanation(
            field="Orbit Type",
            value=der.orbit_type,
            explanation=ORBIT_TYPE_DESCRIPTIONS.get(der.orbit_type, f"{der.orbit_type} orbit."),
        ))

    return explanations


def build_summary_deterministic(satellite: SatelliteModel) -> str:
    """Build a one-paragraph plain-English summary of the satellite."""
    name = satellite.name
    der = satellite.derived
    el = satellite.orbital_elements
    obj_type = satellite.object_type or "Satellite"

    parts = [f"**{name}** (NORAD #{satellite.norad_id}) is a {obj_type.lower()}"]

    if satellite.country:
        parts.append(f"operated by {satellite.country}")

    if der and der.orbit_type:
        orbit_short = {"LEO": "low Earth orbit", "MEO": "medium Earth orbit",
                       "GEO": "geostationary orbit", "HEO": "highly elliptical orbit"}.get(der.orbit_type, der.orbit_type)
        parts.append(f"currently in {orbit_short}")

    if der and der.altitude_km:
        parts.append(f"at an average altitude of {der.altitude_km:.0f} km")

    if der and der.period_minutes:
        parts.append(f"completing one orbit every {der.period_minutes:.0f} minutes")

    if satellite.operational_status and satellite.operational_status != "Unknown":
        parts.append(f"Status: {satellite.operational_status.lower()}")

    return ". ".join(parts) + "."


# ──────────────────────────────────────────────
# Gemini AI layer (optional enhancement)
# ──────────────────────────────────────────────

_gemini_client = None

def _get_gemini_client():
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client
    try:
        from google import genai
        from config import settings
        if not settings.gemini_api_key:
            return None
        _gemini_client = genai.Client(api_key=settings.gemini_api_key)
        logger.info("[ExplanationService] Gemini client (google-genai SDK) initialized")
        return _gemini_client
    except ImportError:
        try:
            import google.generativeai as genai
            from config import settings
            if not settings.gemini_api_key:
                return None
            genai.configure(api_key=settings.gemini_api_key)
            _gemini_client = genai.GenerativeModel("gemini-2.0-flash-lite")
            logger.info("[ExplanationService] Gemini model (legacy SDK) initialized")
            return _gemini_client
        except Exception as e:
            logger.warning(f"[ExplanationService] Gemini init failed: {e}")
            return None
    except Exception as e:
        logger.warning(f"[ExplanationService] Gemini init failed: {e}")
        return None


async def get_ai_summary(satellite: SatelliteModel, deterministic_summary: str) -> str:
    """
    Use Gemini to generate a richer, more engaging summary.
    Falls back to deterministic summary if Gemini is unavailable.
    """
    client = _get_gemini_client()
    if not client:
        return deterministic_summary

    el = satellite.orbital_elements
    der = satellite.derived

    prompt = f"""You are an expert space data interpreter for ORBITLY, a platform that makes space data understandable.

Given this real satellite data, write a 2-3 sentence summary that a curious student or enthusiast would find fascinating.
Be specific, use the actual numbers, and explain what they mean in everyday terms.
Do NOT invent facts. Only use the data provided.

Satellite: {satellite.name}
NORAD ID: {satellite.norad_id}
Object Type: {satellite.object_type or 'Unknown'}
Orbit Type: {der.orbit_type if der else 'Unknown'}
Altitude: {f"{der.altitude_km:.0f} km" if der and der.altitude_km else 'Unknown'}
Period: {f"{der.period_minutes:.1f} minutes" if der and der.period_minutes else 'Unknown'}
Inclination: {f"{el.inclination_deg:.2f}°" if el and el.inclination_deg else 'Unknown'}
Eccentricity: {f"{el.eccentricity:.5f}" if el and el.eccentricity else 'Unknown'}
Velocity: {f"{der.velocity_km_s:.2f} km/s" if der and der.velocity_km_s else 'Unknown'}
Country: {satellite.country or 'Unknown'}
Status: {satellite.operational_status or 'Unknown'}

Write only the summary. No headers, no bullet points. 2-3 sentences max."""

    try:
        # Try new google-genai SDK first
        from google import genai
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt,
        )
        return response.text.strip()
    except Exception:
        try:
            # Fallback to legacy SDK
            response = await client.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.warning(f"[ExplanationService] Gemini generation failed: {e}")
            return deterministic_summary


async def explain_satellite(satellite: SatelliteModel) -> tuple[list[FieldExplanation], str]:
    """
    Main entry point: returns (field_explanations, summary_paragraph).
    Always returns something useful even if AI is unavailable.
    """
    field_explanations = build_deterministic_explanations(satellite)
    deterministic_summary = build_summary_deterministic(satellite)
    ai_summary = await get_ai_summary(satellite, deterministic_summary)
    return field_explanations, ai_summary
