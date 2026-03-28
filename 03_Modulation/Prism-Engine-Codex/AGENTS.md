# Prism-Engine-Codex 全局规范

- 在本目录内工作前，先阅读 `README.md`。
- 将文件系统视为唯一状态源；结论、计划和中间状态优先写入文件，而不是依赖会话历史。
- 文本文件统一使用 `UTF-8` 编码与 `LF` 换行。
- 优先使用小步写入、补丁式更新和可回滚文件；避免长篇整文件覆盖。
- 长篇正文写入 `novels/{project}/chapters/Chapter_XX/Scene_YYY.md`，完成后使用 `scripts/compile_chapter.sh` 生成章节产物。
- 修改 `story_bible.md` 前先运行 `scripts/snapshot_story_bible.sh` 生成快照。
- 角色卡、场景卡输出到 `workspace/`；Lite persona prompt 输出到 `workspace/lite/`；审计结果输出到 `reports/`；日志输出到 `test_runs/`。
- 进入具体引擎目录后，继续遵守该目录内的局部 `AGENTS.md`。
- 未经用户要求，不编辑本目录树之外的文件。
