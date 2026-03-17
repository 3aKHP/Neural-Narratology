#!/usr/bin/env bash

set -euo pipefail
shopt -s nullglob

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
SCENE_DIR="$ENGINE_ROOT/novels/$PROJECT_NAME/chapters/Chapter_$CHAPTER_PADDED"
OUTPUT_FILE="$ENGINE_ROOT/novels/$PROJECT_NAME/Chapter_$CHAPTER_PADDED.md"

if [[ ! -d "$SCENE_DIR" ]]; then
  echo "Scene directory not found: $SCENE_DIR" >&2
  exit 1
fi

SCENE_FILES=("$SCENE_DIR"/Scene_*.md)

if [[ ${#SCENE_FILES[@]} -eq 0 ]]; then
  echo "No scene shards found in: $SCENE_DIR" >&2
  exit 1
fi

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

for scene_file in "${SCENE_FILES[@]}"; do
  cat "$scene_file" >> "$TMP_FILE"
  printf '\n\n' >> "$TMP_FILE"
done

mv "$TMP_FILE" "$OUTPUT_FILE"
trap - EXIT

echo "Compiled chapter: $OUTPUT_FILE"
