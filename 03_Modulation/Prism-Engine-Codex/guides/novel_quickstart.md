# Novel Quickstart

## 1. 初始化项目

```powershell
powershell -ExecutionPolicy Bypass -File ..\scripts\init_novel_project.ps1 -ProjectName demo_novel
```

## 2. 初始化首个场景

```powershell
powershell -ExecutionPolicy Bypass -File ..\scripts\init_chapter_scene.ps1 -ProjectName demo_novel -ChapterNumber 1 -SceneNumber 1
```

## 3. 编排与写作

- 在 `weaver-orch/` 中建立 `outline.md` 与 `story_bible.md`
- 在 `weaver/` 中写入 `Scene_001.md`
- 运行 `compile_chapter.ps1`
- 在 `evaluate/` 中审计
