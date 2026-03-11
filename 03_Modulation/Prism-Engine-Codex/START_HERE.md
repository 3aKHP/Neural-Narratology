# Start Here

`Prism-Engine-Codex` 的建议启动顺序如下：

## 1. ETL

1. 将素材放入 `source_materials/`
2. 阅读 `etl/START_PROMPT.md`
3. 进入 `etl/` 目录启动 Codex
4. 先完成角色卡，再完成场景卡

## 2. Runtime

1. 准备好 `workspace/` 中的角色卡与场景卡
2. 运行 `scripts/init_runtime_session.ps1` 或 `scripts/init_runtime_session.sh`
3. 阅读 `runtime/START_PROMPT.md`
4. 在 `runtime/` 中继续回合制模拟

## 3. Weaver-Orch / Weaver

1. 运行 `scripts/init_novel_project.ps1` 或 `scripts/init_novel_project.sh`
2. 在 `weaver-orch/` 中创建 `outline.md` 与 `story_bible.md`
3. 运行 `scripts/init_chapter_scene.ps1` 或 `scripts/init_chapter_scene.sh`
4. 在 `weaver/` 中撰写场景碎片
5. 运行 `scripts/compile_chapter.*` 编译章节
6. 在 `evaluate/` 中输出审计

## 4. Evaluate

1. 阅读 `evaluate/START_PROMPT.md`
2. 按目标文件类型读取输入
3. 输出报告到 `reports/`
