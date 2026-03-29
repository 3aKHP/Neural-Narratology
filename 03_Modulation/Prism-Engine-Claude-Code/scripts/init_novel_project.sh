#!/usr/bin/env bash

set -euo pipefail

ENGINE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  echo "Usage: $(basename "$0") <project_name> [--force]" >&2
}

PROJECT_NAME="${1:-}"
FORCE_FLAG="${2:-}"

if [[ -z "$PROJECT_NAME" ]]; then
  usage
  exit 1
fi

PROJECT_DIR="$ENGINE_ROOT/novels/$PROJECT_NAME"
REPORT_DIR="$ENGINE_ROOT/reports/$PROJECT_NAME"
CHAPTERS_DIR="$PROJECT_DIR/chapters"
OUTLINE_FILE="$PROJECT_DIR/outline.md"
STORY_BIBLE_FILE="$PROJECT_DIR/story_bible.md"

if [[ -d "$PROJECT_DIR" && "$FORCE_FLAG" != "--force" ]]; then
  echo "Project already exists: $PROJECT_DIR" >&2
  echo "Re-run with --force to refresh the scaffold." >&2
  exit 1
fi

mkdir -p "$CHAPTERS_DIR" "$REPORT_DIR"

cp "$ENGINE_ROOT/templates/tpl_outline.md" "$OUTLINE_FILE"
cp "$ENGINE_ROOT/templates/tpl_story_bible.md" "$STORY_BIBLE_FILE"

cat > "$PROJECT_DIR/README.md" <<EOF
# $PROJECT_NAME

- \`outline.md\`: 结构化章节大纲
- \`story_bible.md\`: 世界状态层与连续性记录
- \`chapters/Chapter_XX/Scene_YYY.md\`: 场景碎片
- \`Chapter_XX.md\`: 编译后的章节产物
EOF

echo "Initialized novel project: $PROJECT_DIR"
