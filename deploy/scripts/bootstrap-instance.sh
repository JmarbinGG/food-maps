#!/usr/bin/env bash
# EC2 user-data bootstrap for a host that will run the Food Maps container
# stack (deploy/docker-compose.prod.yml). Installs Docker plus the Compose
# and Buildx CLI plugins.
#
# Amazon Linux 2023's `docker` package is bare Engine only — it does not
# bundle either plugin, the way Docker CE's own apt/yum repo does. Without
# them: `docker compose ...` fails with "unknown shorthand flag: 'f' in -f"
# (compose isn't recognized as a subcommand at all, so the base `docker` CLI
# tries to parse -f itself), and `docker compose build` fails with "requires
# buildx 0.17.0 or later" once compose is present but buildx isn't.
#
# Installed system-wide (/usr/local/lib/docker/cli-plugins), not into a
# user's home directory, so this works when run as root via EC2 user-data at
# boot and still works later for ec2-user's interactive `docker compose`
# calls — Docker's CLI searches that path for every user.
#
# Use as EC2 user-data directly, or run by hand over SSM/SSH on an existing
# instance.

set -euo pipefail

dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

mkdir -p /usr/local/lib/docker/cli-plugins

# Compose v2 plugin. Unlike Buildx below, GitHub always serves this exact
# filename at /latest/, so no version lookup is needed.
curl -fSL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Buildx plugin, required by `docker compose build`. Its release asset names
# embed the version, so resolve the latest tag first.
buildx_version=$(curl -fsSL https://api.github.com/repos/docker/buildx/releases/latest \
  | grep -oP '"tag_name": "\K[^"]+')
curl -fSL "https://github.com/docker/buildx/releases/download/${buildx_version}/buildx-${buildx_version}.linux-amd64" \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx
chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

docker compose version
docker buildx version
