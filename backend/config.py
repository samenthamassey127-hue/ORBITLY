"""
ORBITLY Backend Configuration
All settings loaded from environment variables with sane defaults.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API Keys
    gemini_api_key: str = ""

    # External APIs
    celestrak_base: str = "https://celestrak.org"
    launch_library_base: str = "https://ll.thespacedevs.com/2.3.0"

    # Cache
    cache_ttl_seconds: int = 900  # 15 minutes for TLE data
    launch_cache_ttl_seconds: int = 21600  # 6 hours for launch data
    disk_cache_dir: str = "./cache"

    # CORS
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://orbitly.vercel.app",
        "https://orbitly.netlify.app",
    ]

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # Rate limiting
    rate_limit_per_minute: int = 60

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
