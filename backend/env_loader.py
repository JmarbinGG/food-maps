"""Load the project's .env files once, the same way for every module.

Precedence, highest first:
  1. Real process environment (systemd EnvironmentFile, Docker, the shell).
  2. .env.local (local development overrides; skipped when USE_RDS is set).
  3. .env

Nothing is ever overridden, so a stray .env/.env.local on a server cannot
silently replace the values the service manager provided. Under pytest
(FOODMAPS_TESTING=1, set by the root conftest) no file is read at all, so
tests never pick up a real OpenAI key or the developer's local database.
"""
from __future__ import annotations

import os

from dotenv import load_dotenv

_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_TRUTHY = {"1", "true", "yes", "on"}
_loaded = False


def _flag(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in _TRUTHY


def load_project_env() -> None:
    global _loaded
    if _loaded:
        return
    _loaded = True
    if _flag("FOODMAPS_TESTING"):
        return
    if not _flag("USE_RDS"):
        load_dotenv(os.path.join(_PROJECT_ROOT, ".env.local"), override=False)
    load_dotenv(os.path.join(_PROJECT_ROOT, ".env"), override=False)
