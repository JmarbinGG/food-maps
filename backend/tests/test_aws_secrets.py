from __future__ import annotations

import json
import os
import unittest
from unittest.mock import MagicMock, patch

from botocore.exceptions import ClientError

from backend.aws_secrets import (
    _parse_secret_string,
    _synthesize_database_url,
    load_aws_secrets,
)


def _client_error(code: str) -> ClientError:
    return ClientError({"Error": {"Code": code, "Message": code}}, "GetSecretValue")


class ParseSecretTests(unittest.TestCase):
    def test_json(self):
        self.assertEqual(
            _parse_secret_string('{"JWT_SECRET": "abc", "empty": ""}'),
            {"JWT_SECRET": "abc"},
        )

    def test_dotenv(self):
        self.assertEqual(
            _parse_secret_string("JWT_SECRET=abc\nDATABASE_URL=mysql://x\n"),
            {"JWT_SECRET": "abc", "DATABASE_URL": "mysql://x"},
        )


class SynthesizeDatabaseUrlTests(unittest.TestCase):
    def test_rds_mysql_fields(self):
        values = {
            "username": "foodmaps",
            "password": "p@ss/word",
            "host": "db.example.com",
            "port": "3306",
            "dbname": "food_maps",
            "engine": "mysql",
        }
        _synthesize_database_url(values)
        self.assertEqual(
            values["DATABASE_URL"],
            "mysql+pymysql://foodmaps:p%40ss%2Fword@db.example.com:3306/food_maps",
        )

    def test_leaves_existing_url_alone(self):
        values = {
            "DATABASE_URL": "sqlite:///x",
            "username": "foodmaps",
            "password": "pw",
            "host": "db.example.com",
            "dbname": "food_maps",
        }
        _synthesize_database_url(values)
        self.assertEqual(values["DATABASE_URL"], "sqlite:///x")

    def test_noop_without_rds_fields(self):
        values = {"JWT_SECRET": "abc"}
        _synthesize_database_url(values)
        self.assertNotIn("DATABASE_URL", values)


class LoadAwsSecretsTests(unittest.TestCase):
    def setUp(self):
        load_aws_secrets.cache_clear()
        self._saved = os.environ.copy()
        os.environ.pop("AWS_SECRET_NAME", None)
        os.environ.pop("AWS_REGION", None)
        os.environ.pop("DATABASE_URL", None)
        os.environ.pop("JWT_SECRET", None)
        os.environ.pop("TWILIO_ACCOUNT_SID", None)

    def tearDown(self):
        load_aws_secrets.cache_clear()
        os.environ.clear()
        os.environ.update(self._saved)

    def test_noop_without_secret_name(self):
        self.assertEqual(load_aws_secrets(), {})

    def _patch_secret(self, payload: str):
        client = MagicMock()
        client.get_secret_value.return_value = {"SecretString": payload}
        session = MagicMock()
        session.client.return_value = client
        return patch("backend.aws_secrets.boto3.session.Session", return_value=session)

    def test_fail_closed_on_missing_secret(self):
        os.environ["AWS_SECRET_NAME"] = "prod/env"
        client = MagicMock()
        client.get_secret_value.side_effect = _client_error("ResourceNotFoundException")
        session = MagicMock()
        session.client.return_value = client
        with patch("backend.aws_secrets.boto3.session.Session", return_value=session):
            with self.assertRaises(RuntimeError) as caught:
                load_aws_secrets()
        self.assertIn("ResourceNotFoundException", str(caught.exception))

    def test_applies_secret_and_synthesizes_url(self):
        os.environ["AWS_SECRET_NAME"] = "prod/env"
        payload = json.dumps(
            {
                "username": "foodmaps",
                "password": "secret",
                "host": "db.example.com",
                "dbname": "food_maps",
                "engine": "mysql",
                "JWT_SECRET": "a-jwt-secret-value",
            }
        )
        with self._patch_secret(payload):
            values = load_aws_secrets()
        self.assertIn("DATABASE_URL", os.environ)
        self.assertTrue(os.environ["DATABASE_URL"].startswith("mysql+pymysql://foodmaps:"))
        self.assertEqual(os.environ["JWT_SECRET"], "a-jwt-secret-value")
        self.assertEqual(values["JWT_SECRET"], "a-jwt-secret-value")

    def test_env_database_url_wins_over_secret(self):
        os.environ["AWS_SECRET_NAME"] = "prod/env"
        os.environ["DATABASE_URL"] = "mysql+pymysql://old:old@stale/db"
        with self._patch_secret('{"DATABASE_URL": "mysql+pymysql://new:new@fresh/db", "JWT_SECRET": "x"}'):
            load_aws_secrets()
        self.assertEqual(os.environ["DATABASE_URL"], "mysql+pymysql://old:old@stale/db")
        self.assertEqual(os.environ["JWT_SECRET"], "x")

    def test_empty_env_var_is_not_filled_from_secret(self):
        # Staging blanks Twilio this way so a restored snapshot cannot SMS users.
        os.environ["AWS_SECRET_NAME"] = "staging/env"
        os.environ["TWILIO_ACCOUNT_SID"] = ""
        with self._patch_secret('{"TWILIO_ACCOUNT_SID": "ACxxxxxxxx", "JWT_SECRET": "x"}'):
            load_aws_secrets()
        self.assertEqual(os.environ["TWILIO_ACCOUNT_SID"], "")


if __name__ == "__main__":
    unittest.main()
