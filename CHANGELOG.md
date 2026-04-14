# Changelog

本项目包含两个版本号独立演进的子系统：

| 子系统 | 说明 | 当前版本 |
|:---|:---|:---|
| **Resonance Protocol** | Phase II 角色协议（理论框架） | v9.0 State-Space |
| **Prism Engine** | Phase III 自动化工具链（工程实现） | v8.1 |

> 两套版本号各自独立递增。下文每条记录均以 `[Resonance]` / `[Modulation]` / `[Echo]` / `[Repo]` 标签标注归属。

所有日期均为 UTC+8（Asia/Shanghai）。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

---

## 2026-04-14 — Resonance Protocol v9.0 State-Space

> Git: `(Pending)` · 对应 Resonance Protocol v9.0

### Added — `[Resonance]`
- 发布 **Resonance Protocol v9.0 State-Space**：
  - 新增 `v9_State-Space/` 目录，包含 `en-US/` 与 `zh-CN/` 双语版本。
  - 七个协议文件：`Step0 - Kernel`、`Step1A - MainDriver`、`Step1B - MainStdlib`、`Step1C - TransformDriver`、`Step2A - StoryDriver`、`Step2B - StoryStdlib`、`Step3 - Runtime`。
  - 核心新增：**Persona Topology**（人格拓扑）——不变轴、可变轴、边界条件的显式建模；**State Navigator**（状态导航器）——拓扑感知的运行时状态追踪；**Affine Transform Agent**（仿射变换代理，Step 1C）——ETL Extract 阶段的 All-Ages → L3+ DLC 推导流水线。
  - Bug 修复：Step 1A Handover Note 措辞明确 Step 1C 为前置流程；Step 1C 默认变换范围从 L3-A 扩展至 L3-B；Step 3 Runtime 从 10173 字符压缩至 6000 字符以内。

---

## 2026-03-29 — GitHub Actions CI & Split Release Automation

> Git: `4549da7` · 对应 Prism Engine v8.1

### Added — `[Repo]`
- 新增 **GitHub Actions CI**：
  - 新增 `.github/workflows/ci.yml`：对已跟踪的 Shell / PowerShell 脚本执行语法检查与双宿主烟雾测试，并验证 V7.x / V8.x 安装器的 Mode A / Mode B 安装路径。
- 新增 **分线 Release 自动化**：
  - 新增 `.github/workflows/release-resonance.yml`：独立发布 `02_Resonance/` 的协议目录压缩包。
  - 新增 `.github/workflows/release-modulation.yml`：独立发布 `03_Modulation/` 的工具链目录压缩包。
  - 新增 `.github/workflows/release-installers.yml`：独立构建并发布 V7.x / V8.x 单文件安装器。
- 新增 **受版本控制的发布脚本与清单**：
  - 新增 `.github/scripts/package-tracked-assets.ps1`：基于 `git archive` 打包已跟踪目录内容，并生成 `SHA256SUMS.txt`。
  - 新增 `.github/scripts/build-single-installer.ps1`：将安装器目录构建为单文件 `.ps1`，替代依赖 `dev/` 的构建入口。
  - 新增 `.github/scripts/build-installer-assets.ps1`：按 manifest 构建安装器资产并生成校验和。
  - 新增 `.github/scripts/generate-release-notes.ps1`：按 `manual / changelog / commits / auto` 生成分类 Release Notes。
  - 新增 `.github/release/resonance-packages.json`、`.github/release/modulation-packages.json`、`.github/release/installers.json` 三份发布清单。

### Changed — `[Repo]`
- 将 Release Notes 生成逻辑接入三条发布线，使 `Resonance` / `Modulation` 默认优先采用 `CHANGELOG.md`，`Installers` 默认优先采用路径过滤后的 Commit Message，并在无匹配时自动回退。

### Changed — `[Modulation]`
- 更新 `Prism-Engine-Codex/scripts/init_novel_project.sh` 与 `Prism-Engine-Claude-Code/scripts/init_novel_project.sh`，转义 README heredoc 中的字面反引号，避免 Bash 命令替换干扰项目初始化脚本与 Linux runner 验证。

---

## 2026-03-28 — Compact-State Lite Persona Prompt Profile

> Git: `97abed8` · 对应 Resonance Protocol v8.0 / Prism Engine v8.1

### Added — `[Resonance]`
- 新增 **`02_Resonance/v8_Compact-State_Lite/`** 目录：面向单一 System Prompt 聊天宿主的 Compact-State Lite 生产层协议。
  - 新增 `README.md`：定义协议定位、双产线结构、执行方式与产物形态。
  - 新增 `Immersive Driver.md` / `Immersive Template.md`：第一人称角色主提示词的驱动层与模板层。
  - 新增 `Compatible Driver.md` / `Compatible Template.md`：第三人称角色主提示词的驱动层与模板层。

### Added — `[Modulation]`
- 为 **`Prism-Engine-V8.x/`** 新增 Lite Persona Prompt 资产：
  - 新增 `specs/schema_persona_prompt_immersive.md` 与 `specs/schema_persona_prompt_compatible.md`。
  - 新增 `templates/tpl_persona_prompt_immersive.md` 与 `templates/tpl_persona_prompt_compatible.md`。
  - 新增 `workspace/lite/` 输出目录。
- 将 Lite Persona Prompt 工作流同步到三个 V8.x 落地层：
  - `Prism-Engine-Codex/`
  - `Prism-Engine-Claude-Code/`
  - `Prism-Engine-V8.x-Installer/Prism-Engine-Universe-V8.0-Template/`

### Changed — `[Modulation]`
- 更新 `Prism-Engine-V8.x/.roo/system-prompt-prism-etl`：ETL 从双产物扩展为三产物，新增 Lite Persona Blueprint / Compression Pass / Prompt Forging 流程。
- 更新 `Prism-Engine-Codex/` 与 `Prism-Engine-Claude-Code/` 的 ETL 手册、作用域规则、快速启动说明、项目模板说明与目录校验脚本，使宿主层同步识别 `workspace/lite/` 与 Lite Persona Prompt 资产。
- 更新 `Prism-Engine-V8.x-Installer/` 的模板文档、Mode A ETL 提示词与 `rules-prism-etl/*`，使 Mode A / Mode B 对齐 Lite Persona Prompt 流程。
- 修正 `Prism-Engine-Claude-Code/scripts/validate_codex_tree.*` 的 Claude 宿主校验目标，使其按 `CLAUDE.md` 结构执行目录校验。

### Changed — `[Repo]`
- 更新根目录 `README.md`、`02_Resonance/README.md` 与 `03_Modulation/README.md`，补充 Compact-State Lite 目录索引、Lite Persona Prompt 能力说明与理论来源路径。

---

## 2026-03-18 — Prism-Engine-Claude-Code (Claude Code CLI Host Adaptation)

> Git: `8f9a53b` · 对应 Prism Engine v8.1

### Added — `[Modulation]`
- 新增 **`Prism-Engine-Claude-Code/`** 目录：Prism Engine v8.1 Compact-State 面向 **Claude Code CLI** 的宿主适配层。
  - 新增 `CLAUDE.md`：全局行为规范 + 引擎调度表 + 工具映射表 + Stop & Wait 协议 + 子代理委派模板。
  - 新增 `README.md`：完整的宿主层文档，含宿主能力映射、六引擎工作流、脚本入口、示例演练骨架。
  - 新增 `START_HERE.md`：最短启动路径。
  - 新增六引擎目录作用域，每个引擎含局部 `CLAUDE.md`：
    - `etl/`：四阶段停顿流，AskUserQuestion 实现 Blueprint 确认。
    - `runtime/`：File-Based Game Loop，Edit 追加日志，AskUserQuestion 实现 Turn 停顿。
    - `evaluate/`：三角验证审计。
    - `weaver/`：Scene Shards 协议，单场景写入 + Pause Gate。
    - `weaver-orch/`：Agent 工具子代理委派模板 + 单会话回退模式。
    - `dyad/`：Chunked 批次写入，Edit 追加日志。
  - 新增 `shared/prompts/`：6 个引擎手册（从 Codex 适配，工具名替换为 Claude Code 等效工具）。
  - 新增 `guides/`：3 个快速指南（etl、runtime、novel）。
  - 复制 `specs/`（4 个 Schema）、`templates/`（4 个模板）、`scripts/`（12 个脚本）从 Codex 原样继承。
  - 新增 `project_template/`：可复制的最小工作区骨架（含 `CLAUDE.md` + `README.md` + 5 个 `.gitkeep` 目录）。
  - **设计说明**：通过 `CLAUDE.md` 目录作用域 + 自然语言触发关键词双轨切换引擎；通过 Agent 工具实现 Weaver-Orch 到 Weaver/Evaluate 的子代理委派；通过 AskUserQuestion 实现 Stop & Wait 协议；通过 Edit 工具实现文件追加避免大文件覆盖。

### Changed — `[Modulation]`
- 更新 `03_Modulation/README.md`：核心工程目录新增 Claude Code 条目，版本能力矩阵新增 Claude Code 行，路线图当前状态补全 V8.x / Codex / Claude Code 三个宿主层。

### Changed — `[Repo]`
- 更新根目录 `README.md`：Phase III 关键成果新增多宿主适配描述，目录结构新增 `Prism-Engine-Claude-Code/` 条目，项目统计工具链目录数从 8 更新为 9。

---

## 2026-03-13 — Compact-State Runtime 6000-Char Cap Adaptation

> Git: `ff59829` · 对应 Resonance Protocol v8.0 Compact-State

### Changed — `[Resonance]`
- 适配消费环境中 Runtime 部分的 **6000 字符限制**，压缩 `02_Resonance/v8_Compact-State/zh-CN/Step3 - Runtime.md` 的提示词体积，并同步整理 `02_Resonance/v8_Compact-State/en-US/Step3 - Runtime.md` 的双语版本。
- 重组运行时指令结构，统一为 Core Brief / Narrative Axioms / Output Schema / Runtime Rules / Main Content Requirements / Anti-AI-Flavor / Self-Check 八段布局，在保留核心约束的同时降低格式性文本占比。
- 收紧运行时输出契约：明确隐藏思维链、动态 HUD 与正文三段顺序，强调最小骨架、状态追踪、感知优先、本能驱动、环境持续在场与结构泄漏禁令。
- 细化正文要求与反 AI 味约束：明确 200-800 字、高密度简体中文、双感官描写、剧情推进、`Dialogue Variance` 约束，以及系统术语、机器比喻、精确测量与元数据泄漏的禁用清单。

---

## 2026-03-12 — Prism-Engine-Codex (Codex CLI Host Adaptation)

> Git: `b68aad2` · 对应 Prism Engine v8.1

### Added — `[Modulation]`
- 新增 **`Prism-Engine-Codex/`** 目录：Prism Engine v8.1 Compact-State 面向 **Codex CLI（WSL / PowerShell）** 的宿主适配层。
  - 新增 `AGENTS.md`：全局行为规范（文件系统即单一事实来源、UTF-8+LF、小步写入优先）。
  - 新增 `README.md`：完整的宿主层文档，含六引擎工作流说明、Scene Shards 长文本协议、脚本入口参考、示例演练骨架和项目模板介绍。
  - 新增六引擎目录作用域，每个引擎含局部 `AGENTS.md` 与 `START_PROMPT.md`：
    - `dyad/`：双实体自动博弈数据生成。
    - `weaver-orch/`：长篇编排器（调度、同步与门控）。
  - 新增 `specs/`：4 个协议约束文件（`schema_character.md`、`schema_scenario.md`、`schema_outline.md`、`schema_story_bible.md`），与 V8.x 共享 Schema 定义。
  - 新增 `workspace/` 和 `reports/` 目录骨架（`.gitkeep`）。
  - **设计说明**：通过目录作用域组织引擎边界（进入哪个目录启动 Codex 就让哪个引擎接管会话），通过 `shared/prompts/` 共享宿主无关的引擎手册，通过 `scripts/` 提供 Shell + PowerShell 双平台脚本入口。

### Changed — `[Repo]`
- 更新 `03_Modulation/README.md`：版本能力矩阵新增 `Prism-Engine-V8.x` 和 `Prism-Engine-Codex` 行。
- 更新根目录 `README.md`：目录结构新增 `Prism-Engine-Codex/` 条目，项目统计中工具链目录数从 7 更新为 8。

---

## 2026-03-10 — Prism Engine V8.x Installer

> Git: `2067d54` · 对应 Prism Engine v8.1

### Added — `[Modulation]`
- 新增 **`Prism-Engine-V8.x-Installer/`** 目录：效仿 V7.x-Installer 架构，为 Compact-State 协议提供完整安装器。
  - 新增 `Install.ps1`：主安装脚本，支持 Mode A（项目级 `.roo` 提示词）和 Mode B（全局 `%USERPROFILE%\.roo\rules-prism-*` 规则包）双模式安装。
  - 新增 `Prism-Engine-Universe-V8.0-Template/`：VSCode Project Template 骨架，包含 V8.x 的 6 个引擎 system-prompt、4 个 specs（含 `schema_story_bible.md` 和 `schema_outline.md`）、4 个 templates 及工程目录结构。
  - 新增 `PresetYAML-ModeA/` 和 `PresetYAML-ModeB/`：分别包含 6 个引擎的 RooCode Custom Mode 预设配置（etl、runtime、evaluate、weaver、weaver-orch、dyad）。
  - 新增 `rules-prism-*/`：6 组 XML 规则包（每组 3 个文件），将 V8.x 的 Markdown system-prompt 转化为结构化 XML 格式，供 Mode B 全局加载。
    - `rules-prism-etl/`：1_workflow.xml、2_literary_standards.xml、3_anti_patterns.xml
    - `rules-prism-runtime/`：1_workflow.xml、2_response_format.xml、3_anti_ai_flavor.xml
    - `rules-prism-evaluate/`：1_workflow.xml、2_evaluation_rubric.xml、3_report_template.xml
    - `rules-prism-weaver/`：1_workflow.xml、2_regeneration_and_quality.xml、3_anti_ai_flavor.xml
    - `rules-prism-weaver-orch/`：1_workflow.xml、2_orchestration_protocol.xml、3_fallback_and_anti_crash.xml（V8.1 新增）
    - `rules-prism-dyad/`：1_workflow.xml、2_regeneration_and_progression.xml、3_anti_ai_flavor.xml
  - 新增 `custom_modes_patch.yaml`：Mode B 的单文件合并补丁，可直接整体并入 `custom_modes.yaml`。
  - 新增 `README.md`：安装器使用说明，包含 Mode A/B 差异、安装示例和验证步骤。

---

## 2026-03-10 — Prism Engine V8.1 "Weaver-Orchestrator"

> Git: `7a655c3` · 对应 Resonance Protocol v8.0 Compact-State

### Added — `[Modulation]`
- 新增 **Prism-Weaver-Orch** 引擎（第六引擎）：基于 Orchestrator 模式的长篇小说编排器。
  - 新增 `.roo/system-prompt-prism-weaver-orch`：Orchestrator 系统提示词，定义 Write → Sync → Audit → Decision Gate 四阶段章节生命周期。
  - 新增 `presets/prism-weaver-orch_preset.yaml`：Orchestrator 预设配置。
  - 通过 `new_task` 机制委派子任务给 `prism-weaver`（Writer / Continuity Editor）和 `prism-evaluate`（Quality Auditor）。
  - 内置 Fallback：当 `new_task` 不可用时退化为增强版单体模式。
- 新增 **Story Bible** 世界状态层：
  - 新增 `specs/schema_story_bible.md`：Story Bible Schema 定义（Timeline、Character State Tracker、Chekhov's Registry、World Facts、Continuity Warnings 五大模块）。
  - 新增 `templates/tpl_story_bible.md`：Story Bible 空模板。
- 新增 **结构化 Outline**：
  - 新增 `specs/schema_outline.md`：结构化大纲 Schema（含 Story Time、POV Characters、Key Events、Foreshadowing、Emotional Target）。
  - 新增 `templates/tpl_outline.md`：结构化大纲空模板。

### Changed — `[Modulation]`
- 更新 `system-prompt-prism-evaluate` (V8.0 → V8.1)：
  - 新增 §F **Novel Continuity Audit** 评估维度（长篇连续性审计），验证章节与 `story_bible.md` 的一致性。
  - Report Template 新增 §6 Novel Continuity Analysis 章节。
- 更新 `README.md`：五引擎 → 六引擎描述，补充新增 Schema/Template 说明。

### Unchanged — `[Modulation]`
- `system-prompt-prism-weaver`（保持原样，作为 Worker / 独立单体模式）。
- `system-prompt-prism-etl`、`system-prompt-prism-runtime`、`system-prompt-prism-dyad`（不受影响）。

---

## 2026-03-10 — Prism Engine V8.0 "Compact-State Engine"

> Git: `ce01fbf` · 对应 Resonance Protocol v8.0 Compact-State

### Added — `[Modulation]`
- 新增 **`Prism-Engine-V8.x/`** 目录：基于 v8.0 Compact-State 协议的完整五引擎实现。
  - 从 Bio-XML (`.xml`) 转向 **YAML Frontmatter + Markdown Body** (`.md`) 轻骨架架构。
  - Module A 从 XML Neuro-Card 变为 **Compact Character Card** (`.md`)。
  - Module B 保持 Markdown 但移除 XML Payload。
  - Runtime CoT 从 XML 注释改为 `> [!Neuro-CoT]` Quote Block。
  - HUD 压缩为 4 行中文紧凑格式。
  - 叙事公理扩展为 10 条（Anti-AI-Flavor 提升为独立公理）。
- 包含完整的五引擎系统提示词（`.roo/`）、V8.0 specs/templates、presets 及工程目录骨架。

---

## 2026-03-10 — 03_Modulation 目录重构

> Git: `a40aa43` · Prism Engine 版本不变（v7.3）

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
| 2026-03-10 | **v8.0 Compact-State** | **v8.0 (Compact Engine)** | 协议 + 引擎同步升级 |
| 2026-03-12 | — | **v8.1 (Codex Host Adaptation)** | Codex CLI 宿主适配 |
| 2026-03-18 | — | **v8.1 (Claude Code Host Adaptation)** | Claude Code CLI 宿主适配 |
| 2026-04-14 | **v9.0 State-Space** | — | 人格拓扑引擎，ETL 变换流水线 |
