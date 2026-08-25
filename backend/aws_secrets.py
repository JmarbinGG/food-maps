from __future__ import annotations

import json
import logging
import os
from functools import lru_cache
from io import StringIO
from urllib.parse import quote_plus

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import dotenv_values


logger = logging.getLogger(__name__)

# RDS-managed secrets (and the Secrets Manager rotation Lambda) store discrete
# fields rather than a SQLAlchemy URL. The app still wants DATABASE_URL.
_RDS_DRIVERS = {
    "mysql": "mysql+pymysql",
    "mariadb": "mysql+pymysql",
    "aurora-mysql": "mysql+pymysql",
    "postgres": "postgresql+psycopg2",
    "postgresql": "postgresql+psycopg2",
    "aurora-postgresql": "postgresql+psycopg2",
}


def _parse_secret_string(secret_string: str) -> dict[str, str]:
    try:
        data = json.loads(secret_string)
    except json.JSONDecodeError:
        data = dotenv_values(stream=StringIO(secret_string))

    if not isinstance(data, dict):
        return {}

    return {
        key: str(value)
        for key, value in data.items()
        if value is not None and str(value) != ""
    }


def _synthesize_database_url(values: dict[str, str]) -> None:
    """If the secret is RDS-shaped, add DATABASE_URL so the rest of the app can use it.

    Leaves an existing DATABASE_URL alone. Does nothing if the required fields
    are missing, so a secret that only holds JWT_SECRET stays valid.
    """
    if values.get("DATABASE_URL"):
        return

    user = values.get("username") or values.get("user")
    password = values.get("password")
    host = values.get("host") or values.get("hostname")
    dbname = values.get("dbname") or values.get("database") or values.get("db")
    if not (user and password and host and dbname):
        return

    port = values.get("port") or "3306"
    driver = _RDS_DRIVERS.get((values.get("engine") or "mysql").lower(), "mysql+pymysql")
    values["DATABASE_URL"] = (
        f"{driver}://{quote_plus(user)}:{quote_plus(password)}@{host}:{port}/{dbname}"
    )


def _apply_secret_to_environ(values: dict[str, str]) -> None:
    """Copy secret keys into os.environ without clobbering what is already set.

    systemd EnvironmentFile and Docker `environment:` land in os.environ before
    this runs. setdefault is what lets a staging overlay blank Twilio or point
    SMTP at mailpit without the secret putting production values back.

    The cost is that a DATABASE_URL in the server's .env permanently wins over
    the secret. Rotating the secret then does nothing until that env var is
    removed and the process restarts. Warn when that is happening.
    """
    shadowed = []
    for key, value in values.items():
        # Key present, even as an empty string, wins. Staging blanks Twilio
        # that way; treating "" as missing would put production SMS creds back.
        if key not in os.environ:
            os.environ[key] = value
        elif os.environ[key] != value:
            shadowed.append(key)

    if "DATABASE_URL" in shadowed:
        logger.warning(
            "DATABASE_URL is already set in the process environment, so the "
            "value in the AWS secret was ignored. Rotating the secret will not "
            "change the database password this process uses until DATABASE_URL "
            "is removed from the environment (systemd EnvironmentFile / .env / "
            "compose) and the process is restarted."
        )
    elif shadowed:
        logger.info("AWS secret keys already set in the environment, left unchanged: %s", ", ".join(sorted(shadowed)))


@lru_cache(maxsize=1)
def load_aws_secrets(secret_name: str | None = None, region_name: str | None = None) -> dict[str, str]:
    """Load a JSON or dotenv-formatted secret from AWS Secrets Manager into the process env.

    This is Secrets Manager, not SSM Parameter Store. Database passwords belong
    in Secrets Manager: RDS can rotate them there natively. SSM is for
    non-secret configuration. Do not add a second store for DATABASE_URL.

    When AWS_SECRET_NAME is set, a fetch failure is fatal. Swallowing
    ResourceNotFound / AccessDenied used to look like a successful boot that
    then used a stale password from .env.
    """
    resolved_secret_name = secret_name or os.getenv("AWS_SECRET_NAME")
    if not resolved_secret_name:
        return {}

    resolved_region_name = region_name or os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "us-west-1"

    session = boto3.session.Session()
    client = session.client(service_name="secretsmanager", region_name=resolved_region_name)

    try:
        response = client.get_secret_value(SecretId=resolved_secret_name)
    except (ClientError, BotoCoreError) as exc:
        error_code = getattr(exc, "response", {}).get("Error", {}).get("Code", exc.__class__.__name__)
        raise RuntimeError(
            f"Failed to load AWS secret {resolved_secret_name!r}: {error_code}. "
            "Unset AWS_SECRET_NAME for local .env-only development."
        ) from exc

    secret_string = response.get("SecretString", "")
    if not secret_string:
        raise RuntimeError(f"AWS secret {resolved_secret_name!r} has an empty SecretString")

    values = _parse_secret_string(secret_string)
    if not values:
        raise RuntimeError(f"AWS secret {resolved_secret_name!r} did not contain any key/value pairs")

    _synthesize_database_url(values)
    _apply_secret_to_environ(values)
    logger.info(
        "Loaded AWS secret %s (%s keys)",
        resolved_secret_name,
        ", ".join(sorted(values)),
    )
    return values
