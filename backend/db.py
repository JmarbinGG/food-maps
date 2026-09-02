from backend.aws_secrets import load_aws_secrets
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging
import os


logger = logging.getLogger(__name__)

_PROJECT_ROOT = os.path.join(os.path.dirname(__file__), '..')
load_dotenv(os.path.join(_PROJECT_ROOT, '.env'), override=True)
if os.getenv("USE_RDS", "").strip().lower() not in {"1", "true", "yes", "on"}:
    load_dotenv(os.path.join(_PROJECT_ROOT, '.env.local'), override=True)
load_aws_secrets()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

_allow_sqlite = os.getenv("ALLOW_SQLITE", "").strip().lower() in {"1", "true", "yes", "on"}
if DATABASE_URL.lower().startswith("sqlite") and not _allow_sqlite:
    raise RuntimeError(
        "SQLite DATABASE_URL is not allowed. Use the production MySQL/RDS URL. "
        "Set ALLOW_SQLITE=true only for local pytest."
    )

_connect_args: dict = {}
if DATABASE_URL.lower().startswith("sqlite"):
    _connect_args = {"check_same_thread": False}
else:
    logger.info("Database: connected to cloud MySQL/RDS")

# pool_pre_ping issues a tiny SELECT 1 before handing out a pooled
# connection — without it, idle connections that RDS / MySQL silently
# dropped (wait_timeout, network blip, DNS hiccup) cause the next query
# to fail with "MySQL server has gone away (2006)" or DNS errors. This
# was the root cause of the recurring `Reminder fetch failed` /
# `Broadcast loop error` ERROR logs from the long-running background
# loops. pool_recycle proactively closes any connection older than
# 30 min so we beat MySQL's default 8h wait_timeout by a wide margin.
engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,
    pool_recycle=1800,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
