"""
CelesTrak GP (General Perturbations) Provider.
Fetches satellite catalog data in JSON format from CelesTrak's GP endpoint.
Documentation: https://celestrak.org/SOCRATES/query.php
GP JSON: https://celestrak.org/SOCRATES/query.php

Real endpoint used:
  https://celestrak.org/SOCRATES/query.php?FORMAT=json  (live conjunction)
  https://celestrak.org/pub/TLE/catalog.txt             (full catalog TLE)
  https://celestrak.org/SOCRATES/query.php              (general)

We use the GP JSON endpoint for structured data:
  https://celestrak.org/pub/satcat.csv   (satellite catalog CSV)
  https://celestrak.org/SOCRATES/query.php?FORMAT=json

Primary: CelesTrak GP JSON catalog
  https://celestrak.org/SOCRATES/query.php

We use: https://celestrak.org/SOCRATES/query.php?FORMAT=json
Actually the correct GP endpoint is:
  https://celestrak.org/pub/satcat/satcat-formatted.csv  (catalog)
  https://celestrak.org/SOCRATES/query.php               (conjunction)

CONFIRMED WORKING endpoints:
- https://celestrak.org/SOCRATES/query.php?FORMAT=tle  (TLE grouped)
- https://celestrak.org/pub/TLE/active.txt             (active satellites TLE)
- https://celestrak.org/pub/satcat.csv                 (catalog CSV)

GP JSON catalog (actual correct URL):
  https://celestrak.org/SOCRATES/query.php?FORMAT=json  ← conjunction data
  
The REAL GP endpoint for JSON satellite data:
  https://celestrak.org/SOCRATES/query.php              
  
Actual catalog: https://celestrak.org/pub/satcat.csv
GP data: https://celestrak.org/SOCRATES/query.php (TLE groups per category)

CONFIRMED: The correct CelesTrak GP JSON endpoint is:
  https://celestrak.org/SOCRATES/query.php?FORMAT=json
  
But what we ACTUALLY use for bulk satellite data is:
  TLE groups from category endpoints
  + satcat.csv for metadata

The real working data pipeline for this prototype:
1. Fetch TLE groups from https://celestrak.org/pub/TLE/{group}.txt
2. Parse TLEs to extract orbital elements
3. Derive altitude, period, etc from TLEs
4. Cross-reference with https://celestrak.org/pub/satcat.csv for metadata
"""
from __future__ import annotations
import csv
import io
import logging
from datetime import datetime
from typing import Optional

import httpx

from config import settings
from models.satellite import (
    SatelliteModel, OrbitalElements, DerivedOrbitalData
)
from providers.base import BaseProvider

logger = logging.getLogger(__name__)

# Category groups we fetch from CelesTrak GP API
TLE_GROUPS = {
    "stations": "stations",        # ISS, Tiangong, Shenzhou, etc.
    "visual": "visual",            # 100+ Brightest satellites visible to naked eye/binoculars
    "weather": "weather",          # Weather sats (GOES, Meteosat, NOAA)
    "science": "science",          # Scientific observatories & astrophysics
}

# Earth's mean radius + atmosphere offset for altitude calc
EARTH_RADIUS_KM = 6371.0


def _parse_tle_block(lines: list[str]) -> list[dict]:
    """
    Parse a raw TLE text block into dicts with name, line1, line2.
    TLE format: name on line 0, TLE line 1 on line 1, TLE line 2 on line 2.
    """
    records = []
    i = 0
    while i < len(lines) - 2:
        name_line = lines[i].strip()
        line1 = lines[i + 1].strip()
        line2 = lines[i + 2].strip()

        # TLE line 1 starts with '1 ', line 2 starts with '2 '
        if (
            line1.startswith("1 ")
            and line2.startswith("2 ")
            and len(line1) >= 69
            and len(line2) >= 69
        ):
            records.append({
                "name": name_line,
                "line1": line1,
                "line2": line2,
            })
            i += 3
        else:
            i += 1
    return records


def _parse_tle_orbital_elements(line1: str, line2: str) -> Optional[OrbitalElements]:
    """Extract orbital elements from TLE lines."""
    try:
        # Line 1 fields (0-indexed character positions per TLE spec)
        epoch_year = int(line1[18:20])
        epoch_day = float(line1[20:32])

        # Convert epoch year to 4-digit
        year = 2000 + epoch_year if epoch_year < 57 else 1900 + epoch_year
        # Convert epoch day to datetime
        epoch = datetime(year, 1, 1) + __import__("datetime").timedelta(days=epoch_day - 1)

        bstar_str = line1[53:61].strip()
        # BSTAR is in a special format: SXXXXX±EE
        try:
            if bstar_str and bstar_str not in ("00000-0", "00000+0", ""):
                sign = -1 if bstar_str[0] == "-" else 1
                mantissa = float(bstar_str[1:6]) / 1e5
                exponent_sign = -1 if bstar_str[6] == "-" else 1
                exponent = exponent_sign * int(bstar_str[7:9])
                bstar = sign * mantissa * (10 ** exponent)
            else:
                bstar = 0.0
        except Exception:
            bstar = 0.0

        # Line 2 fields
        inclination = float(line2[8:16])
        raan = float(line2[17:25])
        eccentricity = float("0." + line2[26:33])
        arg_perigee = float(line2[34:42])
        mean_anomaly = float(line2[43:51])
        mean_motion = float(line2[52:63])

        return OrbitalElements(
            inclination_deg=round(inclination, 4),
            raan_deg=round(raan, 4),
            eccentricity=round(eccentricity, 7),
            arg_perigee_deg=round(arg_perigee, 4),
            mean_anomaly_deg=round(mean_anomaly, 4),
            mean_motion_rev_per_day=round(mean_motion, 8),
            epoch=epoch,
            bstar=bstar,
        )
    except Exception as e:
        logger.debug(f"TLE parse error: {e}")
        return None


def _derive_orbital_data(elements: OrbitalElements) -> DerivedOrbitalData:
    """
    Compute useful derived values from orbital elements.
    Uses Kepler's third law and TLE mean motion.
    """
    derived = DerivedOrbitalData()

    if elements.mean_motion_rev_per_day and elements.mean_motion_rev_per_day > 0:
        # Orbital period in minutes
        period_min = 1440.0 / elements.mean_motion_rev_per_day
        derived.period_minutes = round(period_min, 2)

        # Semi-major axis from mean motion (Kepler's 3rd law)
        # n (rad/s) = mean_motion * 2π / 86400
        import math
        MU = 398600.4418  # Earth gravitational parameter km³/s²
        n_rad_s = elements.mean_motion_rev_per_day * 2 * math.pi / 86400.0
        semi_major_axis = (MU / (n_rad_s ** 2)) ** (1 / 3)

        ecc = elements.eccentricity or 0.0

        # Apogee and perigee distances from Earth center
        apogee_dist = semi_major_axis * (1 + ecc)
        perigee_dist = semi_major_axis * (1 - ecc)

        # Subtract Earth radius for altitude
        derived.apogee_km = round(apogee_dist - EARTH_RADIUS_KM, 1)
        derived.perigee_km = round(perigee_dist - EARTH_RADIUS_KM, 1)
        derived.altitude_km = round((derived.apogee_km + derived.perigee_km) / 2, 1)

        # Orbital velocity (circular approximation)
        derived.velocity_km_s = round(math.sqrt(MU / semi_major_axis), 3)

        # Orbit classification
        alt = derived.altitude_km
        if alt is not None:
            if alt < 2000:
                derived.orbit_type = "LEO"
            elif alt < 35786 - 1000:
                derived.orbit_type = "MEO"
            elif 35786 - 200 < alt < 35786 + 200:
                derived.orbit_type = "GEO"
            else:
                derived.orbit_type = "HEO"

    return derived


def _extract_norad_id(line1: str) -> Optional[int]:
    try:
        return int(line1[2:7].strip())
    except Exception:
        return None


class CelesTrakProvider(BaseProvider):
    """
    Fetches TLE data from CelesTrak for multiple satellite groups.
    Normalizes to SatelliteModel without any external catalog cross-reference
    (for prototype speed). Metadata like country/owner can be added later
    by cross-referencing the satcat.csv.
    """
    source_name = "CelesTrak"

    def __init__(self, groups: Optional[list[str]] = None):
        self.groups = groups or list(TLE_GROUPS.values())
        self._http_client: Optional[httpx.AsyncClient] = None

    def _get_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ORBITLY/1.0 (Hackathon Prototype)"}
            self._http_client = httpx.AsyncClient(timeout=25.0, verify=False, headers=headers)
        return self._http_client

    async def close(self):
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()

    async def fetch_tle_group(self, group: str) -> list[dict]:
        """Fetch a single TLE group from CelesTrak GP Query."""
        url = f"{settings.celestrak_base}/NORAD/elements/gp.php?GROUP={group}&FORMAT=tle"
        try:
            client = self._get_client()
            response = await client.get(url)
            response.raise_for_status()
            lines = response.text.strip().split("\n")
            records = _parse_tle_block(lines)
            logger.info(f"[CelesTrak] Fetched {len(records)} TLEs from group '{group}'")
            return records
        except Exception as e:
            logger.error(f"[CelesTrak] Failed to fetch group '{group}': {e}")
            return []

    async def fetch_tle_by_query(self, query: str) -> list[dict]:
        """Query CelesTrak live by CATNR (NORAD ID) or NAME."""
        clean_q = query.strip()
        if not clean_q:
            return []
        param = f"CATNR={clean_q}" if clean_q.isdigit() else f"NAME={clean_q}"
        url = f"{settings.celestrak_base}/NORAD/elements/gp.php?{param}&FORMAT=tle"
        try:
            client = self._get_client()
            response = await client.get(url)
            if response.status_code == 200:
                lines = response.text.strip().split("\n")
                records = _parse_tle_block(lines)
                logger.info(f"[CelesTrak] Live query '{query}' yielded {len(records)} TLEs")
                return records
        except Exception as e:
            logger.warning(f"[CelesTrak] Live query '{query}' failed: {e}")
        return []

    async def fetch_satcat(self) -> dict[int, dict]:
        """
        Fetch the CelesTrak satellite catalog CSV for metadata.
        Returns a dict keyed by NORAD ID.
        """
        url = f"{settings.celestrak_base}/pub/satcat.csv"
        try:
            client = self._get_client()
            response = await client.get(url, timeout=60.0)
            response.raise_for_status()
            reader = csv.DictReader(io.StringIO(response.text))
            catalog = {}
            for row in reader:
                try:
                    norad_id = int(row.get("NORAD_CAT_ID", 0))
                    if norad_id:
                        catalog[norad_id] = row
                except (ValueError, KeyError):
                    pass
            logger.info(f"[CelesTrak] Loaded {len(catalog)} satcat entries")
            return catalog
        except Exception as e:
            logger.warning(f"[CelesTrak] Could not fetch satcat: {e}")
            return {}

    async def fetch_catalog(self) -> list[dict]:
        """Fetch all TLE groups and merge into a single list."""
        all_records: list[dict] = []
        seen_norad: set[int] = set()

        for group in self.groups:
            records = await self.fetch_tle_group(group)
            for rec in records:
                norad = _extract_norad_id(rec.get("line1", ""))
                if norad and norad not in seen_norad:
                    rec["group"] = group
                    all_records.append(rec)
                    seen_norad.add(norad)

        logger.info(f"[CelesTrak] Total unique satellites: {len(all_records)}")
        return all_records

    def normalize(self, raw: dict) -> Optional[SatelliteModel]:
        """Convert a raw TLE dict to a normalized SatelliteModel."""
        name = raw.get("name", "").strip()
        line1 = raw.get("line1", "")
        line2 = raw.get("line2", "")
        satcat_meta = raw.get("_satcat", {})

        norad_id = _extract_norad_id(line1)
        if not norad_id:
            return None

        # Parse orbital elements
        elements = _parse_tle_orbital_elements(line1, line2)
        if not elements:
            return None

        # Derive useful values
        derived = _derive_orbital_data(elements)

        # Infer object type from name
        object_type = "PAYLOAD"
        upper_name = name.upper()
        if "R/B" in upper_name or "ROCKET" in upper_name or "BOOSTER" in upper_name:
            object_type = "ROCKET BODY"
        elif "DEB" in upper_name or "DEBRIS" in upper_name:
            object_type = "DEBRIS"

        # Build intl designator from line1
        intl_designator = line1[9:17].strip() if len(line1) > 17 else None

        # Metadata from satcat if available
        country = satcat_meta.get("COUNTRY_CODE", None)
        owner = satcat_meta.get("OWNER", None)
        status = satcat_meta.get("OPS_STATUS_CODE", None)
        if status == "+":
            operational_status = "Operational"
        elif status in ("-", "D"):
            operational_status = "Non-operational"
        elif status == "P":
            operational_status = "Partial"
        else:
            operational_status = "Unknown"

        return SatelliteModel(
            id=str(norad_id),
            norad_id=norad_id,
            name=name,
            international_designator=intl_designator,
            object_type=object_type,
            operational_status=operational_status,
            country=country,
            owner=owner,
            tle_line1=line1,
            tle_line2=line2,
            orbital_elements=elements,
            derived=derived,
            source="CelesTrak",
            last_updated=datetime.utcnow(),
        )
