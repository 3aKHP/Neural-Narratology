#!/usr/bin/env bash

set -euo pipefail

ENGINE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  echo "Usage: $(basename "$0") <project_name> <chapter_number>" >&2
}

PROJECT_NAME="${1:-}"
CHAPTER_NUMBER="${2:-}"

if [[ -z "$PROJECT_NAME" || -z "$CHAPTER_NUMBER" ]]; then
  usage
  exit 1
fi

CHAPTER_PADDED="$(printf '%02d' "$CHAPTER_NUMBER")"
SOURCE_FILE="$ENGINE_ROOT/novels/$PROJECT_NAME/story_bible.md"
TARGET_FILE="$ENGINE_ROOT/novels/$PROJECT_NAME/story_bible_ch$CHAPTER_PADDED.bak.md"

if [[ ! -f "$SOURCE_FILE" ]]; then
  echo "Story Bible not found: $SOURCE_FILE" >&2
  exit 1
fi

cp "$SOURCE_FILE" "$TARGET_FILE"

echo "Snapshot created: $TARGET_FILE"
