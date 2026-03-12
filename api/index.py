import sys
import os

# Add backend/ to path so its modules are importable
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(_root, "backend"))

from main import app  # noqa: F401 — Vercel discovers the 'app' ASGI object
