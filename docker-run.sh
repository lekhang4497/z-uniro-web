#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="uniro-frontend"
CONTAINER_NAME="uniro-frontend"
PORT="${PORT:-3000}"

echo "Building Docker image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" .

echo "Starting container on port $PORT"
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$PORT:3011" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "Frontend running at http://localhost:$PORT"
