# Prism-Engine-Universe-V8.0-Template

## 定位
- 用途：作为 VSCode Project Template 初始化新的 Prism v8.x 工作区。
- 协议代际：v8.1 Compact-State 资产结构。
- 目标：开箱即用地提供角色构建、场景生成、模拟、评估与长篇扩写所需目录骨架。

## 目录说明
- `.roo/`：Mode A 下随模板复制的系统提示词；Mode B 安装后该目录会保留，但不包含 `system-prompt-prism-*` 文件。
- `specs/`：角色卡、场景卡、Lite persona prompt、Story Bible 与结构大纲的规范文档。
- `templates/`：紧凑态角色卡、场景卡、Lite persona prompt、Story Bible 与结构大纲的模板文件。
- `source_materials/`：原始角色素材入口，内含 DOCX 到 Markdown 的批量转换脚本。
- `workspace/`：ETL 生成的 Markdown (.md) 工作产物（角色卡与场景卡）。
- `workspace/lite/`：Lite persona prompt 输出目录。
- `test_runs/`：Runtime 或 Dyad 生成的会话日志。
- `reports/`：Evaluate 输出的审计报告（含长篇一致性审计）。
- `novels/`：Weaver 或 Weaver-Orch 输出的长篇小说目录（包含 `story_bible.md` 和 `outline.md`）。

## Mode A / Mode B 差异
- `Mode A`：模板自带 `.roo/system-prompt-prism-etl`、`.roo/system-prompt-prism-runtime`、`.roo/system-prompt-prism-evaluate`、`.roo/system-prompt-prism-weaver`、`.roo/system-prompt-prism-weaver-orch`、`.roo/system-prompt-prism-dyad`。
- `Mode B`：这些提示词文件由安装器在复制模板前移除，运行规则改由 `%USERPROFILE%\.roo\rules-prism-*\*.xml` 提供。

## 建议工作流
- 第一步：把人物设定、世界观、对话样本等原始素材放入 `source_materials/`，可用内置脚本转换格式。
- 第二步：使用 `prism-etl` 构建 `workspace/` 内的 Module A、Module B，或输出 `workspace/lite/` 下的 Lite persona prompt。
- 第三步：使用 `prism-runtime` 或 `prism-dyad` 生成 `test_runs/` 日志。
- 第四步：使用 `prism-evaluate` 输出 `reports/` 质量审计。
- 第五步：需要扩写时使用 `prism-weaver-orch` (长篇编排) 或 `prism-weaver` 输出到 `novels/`。

## 素材预处理脚本
- 位置：`source_materials/ConvertDocxToMdAndArchive.ps1`
- 依赖：本机已安装 `pandoc`，且可在 `PATH` 中找到。
- 功能：批量把 `.docx` 转为 `.md`，并把原始 `.docx` 与脚本自身移动到上一级 `drafts/`。

## 相关文件
- 安装器入口：`03_Modulation/Prism-Engine-V8.x-Installer/Install.ps1:1`
- 总说明：`03_Modulation/README.md:1`
