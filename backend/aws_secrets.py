from __future__ import annotations

import json
import logging
import os
from functools import lru_cache
from io import StringIO

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import dotenv_values


logger = logging.getLogger(__name__)


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


@lru_cache(maxsize=1)
def load_aws_secrets(secret_name: str | None = None, region_name: str | None = None) -> dict[str, str]:
    """Load a JSON or dotenv-formatted secret from AWS Secrets Manager into the process env."""
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
        logger.info("AWS secret %s not loaded: %s", resolved_secret_name, error_code)
        return {}

    secret_string = response.get("SecretString", "")
    if not secret_string:
        return {}

    values = _parse_secret_string(secret_string)
    for key, value in values.items():
        os.environ.setdefault(key, value)

    return values