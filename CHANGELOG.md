# Changelog

本项目包含两个版本号独立演进的子系统：

| 子系统 | 说明 | 当前版本 |
|:---|:---|:---|
| **Resonance Protocol** | Phase II 角色协议（理论框架） | v8.0 Compact-State |
| **Prism Engine** | Phase III 自动化工具链（工程实现） | v7.3 |

> 两套版本号各自独立递增。下文每条记录均以 `[Resonance]` / `[Modulation]` / `[Echo]` / `[Repo]` 标签标注归属。

所有日期均为 UTC+8（Asia/Shanghai）。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

---

## [Unreleased]

> 计划中的工作项，参见 [`dev/plans/`](./dev/plans/) 目录。

---

## 2026-03-10 — 03_Modulation 目录重构

> Git: (pending) · Prism Engine 版本不变（v7.3）

### Changed — `[Modulation]`
- **重构 `03_Modulation/` 目录结构**（纯目录重组，文件内容未变更）：
  - `Prism-ETL-Claude/`、`Prism-ETL-Deepseek/`、`Prism-ETL-Gemini/` 三个 v6.x ETL 专项目录统一归入 **`Prism-Engine-V6.x/`** 子目录。
  - `Prism-Engine-Universe-V7.0/` 重命名为 **`Prism-Engine-V7.x/`**。
  - `Prism-Engine-Universe-V7.x-Installer/` 重命名为 **`Prism-Engine-V7.x-Installer/`**。
  - 根目录下的五个 `prism-*_preset.yaml` 配置文件迁移至 **`Prism-Engine-V7.x/presets/`** 子目录。

### Changed — `[Repo]`
- 更新根目录 `README.md` 和 `03_Modulation/README.md`，对齐新的目录结构与路径引用。
- 更新 `CHANGELOG.md`，记录本次重构。

---

## 2026-03-10 — Resonance Protocol v8.0 "Compact-State"

> Git: `253f183` · 对应 Prism Engine 仍为 v7.3（尚未配套更新）

### Added — `[Resonance]`
- 发布 **Protocol v8.0 Compact-State** 主题更新，从重 XML 包装转向 **YAML+Markdown 轻骨架**架构，压缩格式性文本开销，保护正文空间与注意力密度。
- 新增 `v8_Compact-State/` 目录，提供 **en-US** 与 **zh-CN** 双语版本，每个语言版本含完整六步协议文档（Step0–Step3）。
- 将 **Anti-AI-Flavor** 提升为第十叙事公理（10th Narrative Axiom），禁止系统术语、机器隐喻和不必要的度量描写。

### Changed — `[Resonance]`
- **L3 层级细分**：将 L3 拆分为 **L3-A（柔和亲密 / R-15）** 和 **L3-B（纯爱 / R-18）** 两个子级，与 `schema_scenario.md` 规范对齐。涉及 Step0 Kernel、Step2A StoryDriver 和 README 三处。
- **情感共鸣平衡**：修正 "创伤偏见"——将 `Trauma Point` 重命名为 `Defining Marks`，新增 `Comfort Zone` 字段，丰富 `Romanceable Flaw` 公理与 L1 场景的正面日常快乐内容。
- **工程兼容性**：zh-CN 版本的 YAML 键统一为英文，以支持统一工具链解析。
- 移除版本对比性措辞（如 "Unlike legacy systems"），确保协议文档适用于无状态运行时执行。

### Changed — `[Repo]`
- 更新根目录 `README.md` 和 `02_Resonance/README.md`，补充 v8.0 条目、版本对比矩阵和选择指南。

---

## 2026-03-06 — Prism Engine V7.x Installer (Public Beta)

> Git: `bc7d28f`–`be5c80a` · Tag: **`Prism-Engine-V7.x-SingleInstaller`**

### Added — `[Modulation]`
- 新增 **`Prism-Engine-Universe-V7.x-Installer/`** 安装器分发目录，包含：
  - `Install.ps1` 一键安装脚本，支持 **Mode A**（模板内置 `.roo` 提示词）与 **Mode B**（用户目录 Rules Pack）两种工作流。
  - `PresetYAML-ModeA/` 与 `PresetYAML-ModeB/`：分别提供五引擎预设 YAML 配置。
  - `Prism-Engine-Universe-V7.0-Template/`：可直接注册为 VSCode Project Template 的工程模板。
  - `rules-prism-*/`：五引擎的 XML Rules Pack，用于 Mode B 全局规则注入。
  - `custom_modes_patch.yaml`：可整体并入 `custom_modes.yaml` 的补丁集合。

### Changed — `[Modulation]`
- 更新根目录 `prism-etl_preset.yaml`、`prism-runtime_preset.yaml`、`prism-weaver_preset.yaml` 以对齐安装器版本。

### Changed — `[Repo]`
- 更新根目录 `README.md` 和 `03_Modulation/README.md`，新增安装器条目、推荐安装流程和项目统计修订。

---

## 2026-03-02 — Resonance Protocol v7.2 Patch & Prism Engine v7.2

> Git: `b5a1ac0`–`236f85a`

### Added — `[Resonance]`
- **L-System 分级拆分**：将 L3 拆分为 **L3-A (R15)** 和 **L3-B (R18)** 两个子级，实现更精细的内容分级控制。

### Added — `[Modulation]`
- **Anti-AI-Flavor 约束**：为全部五个 Prism 引擎（ETL / Runtime / Evaluate / Weaver / Dyad）添加反 AI 风味约束规则，共计 256 行新增提示词。

---

## 2026-02-26 — Prism Engine v7.1 Refinement

> Git: `e6ee6b0`–`a1d9205`

### Added — `[Modulation]`
- 新增 **docx 预处理脚本** `ConvertDocxToMdAndArchive.ps1`，支持将 `.docx` 原始素材自动转换为 Markdown 并归档。
- 更新 `Prism-Engine-Universe-V7.0/` 文档，补充脚本使用说明。

### Changed — `[Modulation]`
- 对齐 Prism 文档命名规范，将 `Universe` 分支重命名以统一命名风格。
- 为全部引擎系统提示词添加一致性检查（Consistency Checks）。

### Changed — `[Resonance]`
- 修订 `schema_character.md` 与 `schema_scenario.md`，对齐 v7.0 Neuro-Weave 术语。

---

## 2026-02-24 — Prism Engine v7.0 "Five-Engine Matrix"

> Git: `9438bd0`

### Added — `[Modulation]`
- 新增 **Prism-Weaver Engine**（小说编织引擎）：突破上下文限制，将设定自动扩写为连载长篇小说。
- 新增 **Prism-Dyad Engine**（双轨衍生引擎）：分饰两角，全自动演绎并生成高质量大规模交互数据集。
- 新增 `prism-weaver_preset.yaml` 和 `prism-dyad_preset.yaml` 模式配置文件。
- Prism 引擎从初期的三位一体（ETL / Runtime / Evaluate）扩展为**五大引擎生态**。

---

## 2026-02-20 — Resonance Protocol v7.0 "Neuro-Weave" & Prism Engine v6.1

> Git: `8ef8be3`–`e788a7e`

### Added — `[Resonance]`
- 发布 **Protocol v7.0 Neuro-Weave**（神经编织引擎），实现从"结构化数据容器"到"活体认知系统"的范式转变。核心特性：
  - **Bio-XML 理念**：XML 标签作为"功能器官"而非文本容器，强制"过程导向"描述。
  - **三大认知公理**：感知滤镜（Perception Filter）、情感液压（Emotional Hydraulics）、攻略性（Romanceable Flaw）。
  - **L-System 本能协议**：L1–L5 五级叙事分级系统。
- 新增 `v7_Neuro_Weave/` 目录，包含完整六步协议文档（Step0–Step3）。

### Added — `[Modulation]`
- 新增 **Prism-Engine-Universe-V7.0/**：基于 v7.0 Neuro-Weave 理论的通用版本，包含完整的三引擎系统提示词（ETL / Runtime / Evaluate）。
- 新增 `prism-runtime_preset.yaml` 和 `prism-evaluate_preset.yaml` 模式配置。
- 新增 `schema_character.md`（Module A 规范）和 `schema_scenario.md`（Module B 规范）的 v7.0 版本。
- 新增 `tpl_module_a.xml` 和 `tpl_module_b.md` 的 v7.0 模板文件。

### Changed — `[Repo]`
- 完善三阶段研究报告：新增 Phase I 和 Phase II 的 Markdown 版报告，定稿 Phase III 报告。
- 更新 `02_Resonance/README.md`，新增 v7.0 条目与版本对比信息。

---

## 2026-01-30 — Prism Engine v6.0 Multi-Model Adaptation

> Git: `839c4a4`–`e4e35b0`

### Added — `[Modulation]`
- 新增三个模型专项 ETL 目录，实现**跨模型兼容**：
  - `Prism-ETL-Claude/`：Claude 优化版本（含专项系统提示词）。
  - `Prism-ETL-Deepseek/`：Deepseek 优化版本（含专项系统提示词）。
  - `Prism-ETL-Gemini/`：Gemini 优化版本（含专项系统提示词）。
- 每个模型目录包含独立的 `.roo/system-prompt-prism-etl`、`specs/`、`templates/` 和 `workspace/`。

### Changed — `[Modulation]`
- **重构目录结构**：移除旧的通用 `Prism-ETL/` 目录，将其拆分为按模型分离的独立工作目录。

---

## 2026-01-29 — Initial Release

> Git: `77c9c95`–`58bdd14` · Tags: **`report`**, **`Prism-ETL`**

### Added — `[Echo]`
- 发布 **Phase I: Echo（回响）** 全部资产：
  - `backend_request_structure.yaml`：商业平台后端请求结构逆向分析。
  - `RAG_inject.xml`：动态人设注入与 RAG 机制样本。
  - `preset_meta_commands.txt`：高级用户元指令系统。
  - "回响"项目研究报告（PDF）。

### Added — `[Resonance]`
- 发布 **Protocol v5.0 Legacy**（标准版）：剧本优先协议，包含三步 ETL 流程（Step1–Step3）。
- 发布 **Protocol v6.0 Omni-Foundry**（全息灵魂）：引入动态状态机、逻辑门与 L-System 叙事分级，包含完整六步协议文档（Step0–Step3）。
- "共鸣"项目研究报告（PDF）。

### Added — `[Modulation]`
- 发布 **Prism-ETL Engine** 初始版本（v6.0 语义）：
  - 系统提示词 `system-prompt-prism-etl`。
  - Schema 定义（`schema_character.md` / `schema_scenario.md`）。
  - 模板文件（`tpl_module_a.xml` / `tpl_module_b.md`）。
  - `prism-etl_preset.yaml` 模式配置。
- "调制"项目研究报告（Draft）。

### Added — `[Repo]`
- 项目初始化：`README.md`、`LICENSE`（MIT）、`.gitignore`。

---

## 版本号对照表 (Version Cross-Reference)

> 由于 Resonance（协议理论）与 Modulation（工程实现）的发布节奏不同步，下表提供两套版本号的对应关系。

| 日期 | Resonance Protocol | Prism Engine | 里程碑 |
|:---|:---|:---|:---|
| 2026-01-29 | v5.0 Legacy + v6.0 Omni-Foundry | v6.0 (ETL Only) | 初始发布 |
| 2026-01-30 | — | v6.0 Multi-Model | 多模型适配 |
| 2026-02-20 | **v7.0 Neuro-Weave** | v6.1 → v7.0 (3-Engine) | 协议 + 引擎同步升级 |
| 2026-02-24 | — | **v7.0 (5-Engine Matrix)** | 五引擎生态 |
| 2026-02-26 | v7.0 patch | v7.1 | 文档对齐 + 工具增强 |
| 2026-03-02 | v7.2 (L3 Split) | v7.2 (Anti-AI) | L3 分级 + Anti-AI 约束 |
| 2026-03-06 | — | **v7.3 (Installer)** | 安装器发布 |
| 2026-03-10 | **v8.0 Compact-State** | v7.3 (unchanged) | 协议轻量化更新 |
