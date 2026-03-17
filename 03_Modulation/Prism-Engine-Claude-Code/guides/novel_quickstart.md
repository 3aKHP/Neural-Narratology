# Novel Quickstart

## 1. 初始化项目

```bash
bash scripts/init_novel_project.sh demo_novel
```

或 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\init_novel_project.ps1 -ProjectName demo_novel
```

## 2. 初始化首个场景

```bash
bash scripts/init_chapter_scene.sh demo_novel 1 1
```

或 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\init_chapter_scene.ps1 -ProjectName demo_novel -ChapterNumber 1 -SceneNumber 1
```

## 3. 编排与写作

在 `Prism-Engine-Claude-Code/` 根目录启动 Claude Code 会话，输入：

```
Start Weaver-Orch
```

或进入 `weaver-orch/` 子目录，输入：

```
读取 shared/prompts/weaver-orch.md、specs/schema_outline.md、specs/schema_story_bible.md 和 workspace/ 中的角色卡。初始化 novels/demo_novel/ 的 outline.md 与 story_bible.md，然后停顿等待确认。
```

## 4. 写作与审计

- 在 `weaver/` 子目录中写入场景碎片
- 用 `scripts/compile_chapter.*` 编译章节
- 在 `evaluate/` 子目录中运行审计
