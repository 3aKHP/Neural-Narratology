# Prism-Engine-V7.x

## 定位
- 协议代际：v7.0 Neuro-Weave（完整实现）。
- 能力范围：ETL / Runtime / Evaluate / Weaver / Dyad 五引擎。
- 用途：作为 Phase III 的主线与对照基线分支。

## 目录说明
- `.roo/`：五引擎系统提示词。
- `specs/`、`templates/`：v7.0 规范与模板。
- `source_materials/`、`workspace/`、`test_runs/`、`reports/`、`novels/`：运行与产物目录骨架。

## 素材预处理工具（DOCX -> Markdown）
- 位置：`source_materials/ConvertDocxToMdAndArchive.ps1`
- 依赖：本机已安装 `pandoc`，且可在 `PATH` 中找到
- 功能：
  - 将指定目录（默认当前目录）的 `.docx` 批量转换为 `.md`
  - 每个 `.docx` 成功转换后，将原文件移动到上一级 `drafts/`
  - 脚本运行结束后（无论成功或失败），会将脚本自身移动到上一级 `drafts/`
  - 脚本内部会先 `Push-Location` 到脚本目录，结束后 `Pop-Location` 还原调用者工作目录
- 示例：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\source_materials\ConvertDocxToMdAndArchive.ps1
```

如需再次使用该脚本，请从 `drafts/` 目录取回或重新放入 `source_materials/`。

## 与其他分支关系
- 本分支是功能最完整的 Universe 版本。
- `Prism-Engine-V6.x/Prism-ETL-Claude` / `Prism-Engine-V6.x/Prism-ETL-Deepseek` / `Prism-Engine-V6.x/Prism-ETL-Gemini` 当前为 ETL 专项分支，后续按路线图逐步并轨。
