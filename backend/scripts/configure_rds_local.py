#!/usr/bin/env python3
"""Open RDS MySQL (port 3306) to this machine's public IP via security group rule.

Requires AWS credentials with ec2:AuthorizeSecurityGroupIngress on the RDS VPC SG.
Set in .env (do not commit):
  AWS_ACCESS_KEY_ID=...
  AWS_SECRET_ACCESS_KEY=...
  AWS_REGION=us-west-1

Or use: aws configure / IAM role / environment variables.

Usage:
  python backend/scripts/configure_rds_local.py
  python backend/scripts/configure_rds_local.py --instance foodapitest
"""
from __future__ import annotations

import argparse
import os
import socket
import sys
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from dotenv import load_dotenv

load_dotenv(os.path.join(ROOT, ".env"), override=True)

DEFAULT_INSTANCE = "foodapitest"
DEFAULT_REGION = "us-west-1"
MYSQL_PORT = 3306


def public_ip() -> str:
    with urllib.request.urlopen("https://api.ipify.org", timeout=10) as resp:
        return resp.read().decode().strip()


def rds_host_from_env() -> str | None:
    url = os.getenv("DATABASE_URL", "")
    if "@" not in url:
        return None
    host_part = url.split("@", 1)[1]
    return host_part.split(":", 1)[0]


def test_tcp(host: str, port: int = MYSQL_PORT, timeout: float = 6.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def open_security_group(instance_id: str, region: str, cidr: str) -> list[str]:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError

    try:
        rds = boto3.client("rds", region_name=region)
        ec2 = boto3.client("ec2", region_name=region)
    except NoCredentialsError as exc:
        raise SystemExit(
            "No AWS credentials found. Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to .env "
            "or run 'aws configure'."
        ) from exc

    resp = rds.describe_db_instances(DBInstanceIdentifier=instance_id)
    instances = resp.get("DBInstances", [])
    if not instances:
        raise SystemExit(f"RDS instance not found: {instance_id}")

    db = instances[0]
    endpoint = db.get("Endpoint", {}).get("Address", "")
    public = db.get("PubliclyAccessible", False)
    sg_ids = [g["VpcSecurityGroupId"] for g in db.get("VpcSecurityGroups", [])]

    print(f"Instance: {instance_id}")
    print(f"Endpoint: {endpoint}")
    print(f"Publicly accessible: {public}")
    if not public:
        print(
            "WARNING: RDS is not publicly accessible. A security group rule alone may not be enough.\n"
            "         In AWS Console: RDS -> Modify -> Publicly accessible -> Yes -> Apply immediately."
        )

    if not sg_ids:
        raise SystemExit("No VPC security groups attached to this RDS instance.")

    messages: list[str] = []
    for sg_id in sg_ids:
        try:
            ec2.authorize_security_group_ingress(
                GroupId=sg_id,
                IpPermissions=[
                    {
                        "IpProtocol": "tcp",
                        "FromPort": MYSQL_PORT,
                        "ToPort": MYSQL_PORT,
                        "IpRanges": [{"CidrIp": cidr, "Description": "Food Maps local dev"}],
                    }
                ],
            )
            messages.append(f"Added inbound MySQL {MYSQL_PORT} from {cidr} to {sg_id}")
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code", "")
            if code in {"InvalidPermission.Duplicate", "RulesDuplicate"}:
                messages.append(f"Rule already exists on {sg_id} for {cidr}")
            else:
                raise

    return messages


def main() -> int:
    parser = argparse.ArgumentParser(description="Allow local dev access to RDS MySQL")
    parser.add_argument("--instance", default=DEFAULT_INSTANCE)
    parser.add_argument("--region", default=os.getenv("AWS_REGION", DEFAULT_REGION))
    parser.add_argument("--skip-aws", action="store_true", help="Only test connectivity")
    args = parser.parse_args()

    host = rds_host_from_env()
    if not host:
        raise SystemExit("DATABASE_URL in .env does not contain a MySQL host.")

    ip = public_ip()
    cidr = f"{ip}/32"
    print(f"Your public IP: {ip}")

    if test_tcp(host):
        print(f"RDS already reachable at {host}:{MYSQL_PORT}")
        return 0

    print(f"RDS not reachable at {host}:{MYSQL_PORT}")

    if args.skip_aws:
        return 1

    for line in open_security_group(args.instance, args.region, cidr):
        print(line)

    print("Waiting for rule to take effect...")
    for attempt in range(1, 13):
        if test_tcp(host):
            print(f"RDS reachable at {host}:{MYSQL_PORT}")
            return 0
        print(f"  retry {attempt}/12...")
        import time

        time.sleep(5)

    print(
        "Security group updated but connection still fails.\n"
        "Check: RDS -> Publicly accessible = Yes, correct security group, no NACL block."
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
