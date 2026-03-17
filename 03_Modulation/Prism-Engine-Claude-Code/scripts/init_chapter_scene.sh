#!/usr/bin/env bash

set -euo pipefail

ENGINE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  echo "Usage: $(basename "$0") <project_name> <chapter_number> <scene_number>" >&2
}

PROJECT_NAME="${1:-}"
CHAPTER_NUMBER="${2:-}"
SCENE_NUMBER="${3:-}"

if [[ -z "$PROJECT_NAME" || -z "$CHAPTER_NUMBER" || -z "$SCENE_NUMBER" ]]; then
  usage
  exit 1
fi

CHAPTER_PADDED="$(printf '%02d' "$CHAPTER_NUMBER")"
SCENE_PADDED="$(printf '%03d' "$SCENE_NUMBER")"
CHAPTER_DIR="$ENGINE_ROOT/novels/$PROJECT_NAME/chapters/Chapter_$CHAPTER_PADDED"
SCENE_FILE="$CHAPTER_DIR/Scene_$SCENE_PADDED.md"

mkdir -p "$CHAPTER_DIR"

if [[ ! -f "$SCENE_FILE" ]]; then
  cat > "$SCENE_FILE" <<EOF
# Chapter $CHAPTER_PADDED Scene $SCENE_PADDED

## Scene Goal

## Draft
EOF
fi

echo "Initialized scene shard: $SCENE_FILE"
