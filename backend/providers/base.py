"""
Abstract base class for all data providers.
Every provider must implement normalize() → SatelliteModel.
This ensures the backend can swap/add providers without touching routers.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class BaseProvider(ABC):
    """All data providers must implement this interface."""

    source_name: str = "Unknown"

    @abstractmethod
    async def fetch_catalog(self) -> list[dict]:
        """Fetch raw satellite records from the external source."""
        ...

    @abstractmethod
    def normalize(self, raw: dict) -> Optional[object]:
        """
        Convert raw provider-specific record to SatelliteModel.
        Return None to skip/discard a record.
        """
        ...

    async def fetch_all_normalized(self) -> list:
        """Convenience: fetch + normalize in one call."""
        raw_records = await self.fetch_catalog()
        satellites = []
        for raw in raw_records:
            try:
                sat = self.normalize(raw)
                if sat is not None:
                    satellites.append(sat)
            except Exception as e:
                logger.warning(f"[{self.source_name}] Failed to normalize record: {e}")
        logger.info(f"[{self.source_name}] Normalized {len(satellites)}/{len(raw_records)} records")
        return satellites
