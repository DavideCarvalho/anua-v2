#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_CONF="$ROOT_DIR/infra/logrotate/anua-dev.conf"
TARGET_CONF="/etc/logrotate.d/anua-dev"

if [ ! -f "$SOURCE_CONF" ]; then
  echo "Missing config file: $SOURCE_CONF"
  exit 1
fi

sudo cp "$SOURCE_CONF" "$TARGET_CONF"
sudo logrotate -f "$TARGET_CONF"

echo "Installed logrotate config at $TARGET_CONF"
