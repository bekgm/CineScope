import sys
import os

# At runtime Vercel puts api/ contents at /var/task/
# backend/ is copied into api/backend/ during build
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from main import app  # noqa: F401
