# Prism-ETL-Gemini

## 定位
- 协议代际侧重：v6.x Holographic 语义（ETL 专项）。
- 能力范围：当前仅提供 `system-prompt-prism-etl`。
- 用途：针对 Gemini 的 ETL 构建优化。

## 当前结构
- `.roo/system-prompt-prism-etl`
- `specs/` + `templates/`
- `source_materials/` + `workspace/`

## 升级路线（对齐 v7）
1. `specs/` 与 `templates/` 升级至 v7.0 结构。
2. 增补 `runtime` 与 `evaluate` 引擎提示词。
3. 评估并接入 `weaver` 与 `dyad`，形成全引擎分支。
