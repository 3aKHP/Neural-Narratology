# Start Here

`Prism-Engine-Codex` 的建议启动顺序如下：

## 1. ETL

1. 将素材放入 `source_materials/`
2. 在根目录输入 `Start ETL`，或进入 `etl/` 子目录启动会话
3. 若需要高强度推导，先生成 DLC 文档
4. 先完成角色卡，再完成场景卡
5. 若目标宿主只接受单一 System Prompt，可直接走 Lite persona workflow，产物位于 `workspace/lite/`

## 2. Runtime

1. 准备好 `workspace/` 中的角色卡与场景卡
2. 运行 `scripts/init_runtime_session.ps1` 或 `scripts/init_runtime_session.sh`
3. 输入 `Start Runtime`，或进入 `runtime/` 子目录
4. 逐回合推进模拟

## 3. Weaver-Orch / Weaver

1. 运行 `scripts/init_novel_project.ps1` 或 `scripts/init_novel_project.sh`
2. 输入 `Start Weaver-Orch`，初始化 `outline.md` 与 `story_bible.md`
3. 运行 `scripts/init_chapter_scene.ps1` 或 `scripts/init_chapter_scene.sh`
4. 输入 `Start Weaver`，写入场景碎片
5. 运行 `scripts/compile_chapter.*` 编译章节
6. 输入 `Start Evaluate`，输出审计报告

## 4. Evaluate

1. 输入 `Start Evaluate`，或进入 `evaluate/` 子目录
2. 按目标文件类型读取输入
3. 报告输出到 `reports/`
