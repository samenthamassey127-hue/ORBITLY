"""
Launch Library 2 Provider.
Fetches recent and upcoming launches for mission context.
https://thespacedevs.com/llapi
"""
from __future__ import annotations
import logging
from typing import Optional

import httpx

from config import settings
from models.satellite import LaunchInfo
from providers.base import BaseProvider

logger = logging.getLogger(__name__)


class LaunchLibraryProvider(BaseProvider):
    """
    Provides launch and mission data from Launch Library 2 API.
    This is used to enrich satellite details with mission context.
    """
    source_name = "Launch Library 2"

    def __init__(self):
        self._http_client: Optional[httpx.AsyncClient] = None

    def _get_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(timeout=20.0, verify=False)
        return self._http_client

    async def close(self):
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()

    async def fetch_catalog(self) -> list[dict]:
        """Fetch recent launches (last 90 days)."""
        url = f"{settings.launch_library_base}/launch/"
        params = {
            "format": "json",
            "limit": 100,
            "ordering": "-net",
            "mode": "list",
        }
        try:
            client = self._get_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            launches = data.get("results", [])
            logger.info(f"[LaunchLibrary] Fetched {len(launches)} recent launches")
            return launches
        except Exception as e:
            logger.error(f"[LaunchLibrary] Fetch failed: {e}")
            return []

    async def fetch_upcoming(self, limit: int = 10) -> list[dict]:
        """Fetch upcoming launches."""
        url = f"{settings.launch_library_base}/launch/upcoming/"
        params = {"format": "json", "limit": limit, "mode": "detailed"}
        try:
            client = self._get_client()
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            logger.error(f"[LaunchLibrary] Upcoming fetch failed: {e}")
            return []

    def normalize(self, raw: dict) -> Optional[LaunchInfo]:
        """Convert Launch Library 2 record to LaunchInfo."""
        try:
            launch_date = raw.get("net") or raw.get("window_start")
            if launch_date:
                launch_date = launch_date[:10]  # Keep date only

            pad = raw.get("pad", {}) or {}
            location = pad.get("location", {}) or {}
            launch_site = location.get("name") or pad.get("name")

            rocket_config = (raw.get("rocket", {}) or {}).get("configuration", {}) or {}
            rocket = rocket_config.get("full_name") or rocket_config.get("name")

            mission = raw.get("mission") or {}
            mission_desc = mission.get("description") if mission else None
            mission_type = mission.get("type") if mission else None
            if mission_type and isinstance(mission_type, dict):
                mission_type = mission_type.get("name")

            return LaunchInfo(
                launch_date=launch_date,
                launch_site=launch_site,
                rocket=rocket,
                mission_description=mission_desc,
                mission_type=mission_type,
            )
        except Exception as e:
            logger.debug(f"[LaunchLibrary] Normalize error: {e}")
            return None
