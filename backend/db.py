from backend.aws_secrets import load_aws_secrets
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os


load_aws_secrets()
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

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
