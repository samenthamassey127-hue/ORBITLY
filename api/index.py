import sys
import os

# Add backend directory to sys.path so all internal modules (config, models, providers, services, routers) resolve cleanly
backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
if backend_path not in sys.path:
    sys.path.insert(0, os.path.abspath(backend_path))

from main import app
