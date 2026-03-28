#!/usr/bin/env bash

set -euo pipefail

ENGINE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

REQUIRED_DIRS=(
  "etl"
  "runtime"
  "evaluate"
  "weaver"
  "weaver-orch"
  "dyad"
  "guides"
  "shared/prompts"
  "scripts"
  "specs"
  "templates"
  "project_template"
  "source_materials"
  "workspace"
  "workspace/lite"
  "project_template/workspace/lite"
  "novels"
  "reports"
  "test_runs"
)

REQUIRED_FILES=(
  "README.md"
  "AGENTS.md"
  "START_HERE.md"
  "etl/AGENTS.md"
  "runtime/AGENTS.md"
  "evaluate/AGENTS.md"
  "weaver/AGENTS.md"
  "weaver-orch/AGENTS.md"
  "dyad/AGENTS.md"
  "etl/START_PROMPT.md"
  "runtime/START_PROMPT.md"
  "evaluate/START_PROMPT.md"
  "weaver/START_PROMPT.md"
  "weaver-orch/START_PROMPT.md"
  "dyad/START_PROMPT.md"
  "shared/prompts/etl.md"
  "shared/prompts/runtime.md"
  "shared/prompts/evaluate.md"
  "shared/prompts/weaver.md"
  "shared/prompts/weaver-orch.md"
  "shared/prompts/dyad.md"
  "specs/schema_persona_prompt_immersive.md"
  "specs/schema_persona_prompt_compatible.md"
  "templates/tpl_persona_prompt_immersive.md"
  "templates/tpl_persona_prompt_compatible.md"
  "guides/etl_quickstart.md"
  "guides/runtime_quickstart.md"
  "guides/novel_quickstart.md"
  "scripts/init_novel_project.sh"
  "scripts/init_novel_project.ps1"
  "scripts/init_runtime_session.sh"
  "scripts/init_runtime_session.ps1"
  "scripts/init_chapter_scene.sh"
  "scripts/init_chapter_scene.ps1"
  "scripts/compile_chapter.sh"
  "scripts/compile_chapter.ps1"
  "scripts/snapshot_story_bible.sh"
  "scripts/snapshot_story_bible.ps1"
  "scripts/validate_codex_tree.sh"
  "scripts/validate_codex_tree.ps1"
  "project_template/README.md"
  "project_template/workspace/lite/.gitkeep"
)

for dir_path in "${REQUIRED_DIRS[@]}"; do
  if [[ ! -d "$ENGINE_ROOT/$dir_path" ]]; then
    echo "Missing directory: $dir_path" >&2
    exit 1
  fi
done

for file_path in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$ENGINE_ROOT/$file_path" ]]; then
    echo "Missing file: $file_path" >&2
    exit 1
  fi
done

echo "Prism-Engine-Codex tree validated."
