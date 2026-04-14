# Prism-Engine-V9.x

## 定位
- 协议代际：v9.0 State-Space（完整实现）。
- 架构：YAML Frontmatter + Markdown Body + Persona Topology（静态身份 + 软认知 + 显式状态空间图）。
- 能力范围：ETL / Runtime / Evaluate / Weaver / Weaver-Orch / Dyad 六引擎。
- 用途：Phase III 的主线引擎，基于 v8.1 Compact-State 升级；v9.0 新增人格拓扑层、节拍图与仿射变换代理。

## 与 V8.x 的关键差异
| 维度 | V8.x (Compact-State) | V9.x (State-Space) |
|:---|:---|:---|
| **Module A YAML** | `current_status` 含运行时变量 | 仅静态身份字段（运行时变量移至 HUD） |
| **Module A 结构** | 6 个章节 | 7 个章节，新增 `Persona Topology`（含三子节） |
| **Module B YAML** | `l_system_level` + `world_state` 对象 | `beat_map` 数组 + `world_state` 单行字符串 |
| **Module B 叙事弧** | `Action Guide`（可选，4 阶段） | `beat_map`（强制，3–5 节拍，Runtime 可读） |
| **ETL 工作流** | 工作流 A（角色）+ B（场景）+ D（Lite） | 新增工作流 C：Affine Transform Agent（Step 1C） |
| **Runtime CoT** | `> [!Neuro-CoT]` Quote Block | `<!-- [!Neural Chain] -->` HTML 注释，新增 `State:` 行 |
| **Runtime HUD** | 4 行（无节拍追踪） | 5 行，新增 `[Beat]` 行（节拍 / 配置 / 边界接近度） |
| **Runtime 公理** | 10 条 | 11 条（第 8 条改为节拍颗粒度，第 11 条新增拓扑连贯性） |
| **Runtime 状态机** | 无显式状态导航器 | State Navigator（节拍追踪 + 张力微推 + 边界接近协议） |
| **Evaluate 维度** | 5 维度（A–E）+ F（长篇） | 6 维度（A–F）+ G（长篇），新增 F: Topology Coherence |
| **L-System 禁令** | 未明确 | 明确：L 标签不得出现在任何产出文件中 |

## 目录说明
- `.roo/`：六引擎系统提示词（V9.0 State-Space 适配）。
- `specs/`：Schema 定义（YAML+Markdown 格式）。
  - `schema_character.md`：V9.0 角色卡 Schema（含 Persona Topology）。
  - `schema_scenario.md`：V9.0 场景卡 Schema（含 Beat Map）。
  - `schema_dlc.md`：V9.0 L3+ DLC 文档 Schema（仿射变换代理输出）。
  - `schema_persona_prompt_immersive.md`：Lite 第一人称角色主提示词 Schema。
  - `schema_persona_prompt_compatible.md`：Lite 第三人称角色主提示词 Schema。
  - `schema_story_bible.md`：V8.1 Story Bible Schema（世界状态层，未变更）。
  - `schema_outline.md`：V8.1 结构化大纲 Schema（未变更）。
- `templates/`：模板文件。
  - `tpl_module_a.md`：V9.0 角色卡模板（含 Persona Topology 占位符）。
  - `tpl_module_b.md`：V9.0 场景卡模板（含 Beat Map 占位符）。
  - `tpl_persona_prompt_immersive.md`：Lite 第一人称角色主提示词模板。
  - `tpl_persona_prompt_compatible.md`：Lite 第三人称角色主提示词模板。
  - `tpl_story_bible.md`：Story Bible 空模板（V8.1，未变更）。
  - `tpl_outline.md`：结构化大纲空模板（V8.1，未变更）。
- `presets/`：六引擎 RooCode Custom Mode 预设。
- `source_materials/`：原始素材目录。
- `workspace/`：ETL 工作区（角色卡/场景卡/DLC 文档输出）。
  - `workspace/lite/`：Lite 单一 System Prompt 输出。
- `test_runs/`：Runtime / Dyad 会话日志。
- `reports/`：Evaluate 审计报告（含 Weaver-Orch 章节审计）。
- `novels/`：Weaver / Weaver-Orch 长篇小说输出（含 story_bible.md）。

## 六引擎概览

### 1. Prism-ETL (State-Space Engine)
- **角色**：Character Architect + Tension Director + Affine Transform Agent
- **功能**：从原始素材构建带人格拓扑的角色卡 (Module A)、带节拍图的场景卡 (Module B)、L3+ DLC 文档与 Lite 角色主提示词
- **新增**：工作流 C（Step 1C）——仿射变换代理，在角色卡构建前将全年龄段素材推导为 L3+ DLC

### 2. Prism-Runtime
- **角色**：Topology-Aware Simulation Kernel + File-based Gamemaster
- **功能**：加载角色卡和场景卡，执行拓扑感知的基于文件的交互式角色扮演
- **输出**：Neural Chain（HTML 注释）→ HUD（5 行含节拍追踪）→ Prose Content 三段式回复

### 3. Prism-Weaver
- **角色**：Autonomous Novelist
- **功能**：将角色卡和场景卡扩展为多章节长篇小说
- **输出**：分幕/分章的 Markdown 文件

### 4. Prism-Dyad
- **角色**：Dual-Role Simulator
- **功能**：同时扮演用户和角色，自动生成完整会话日志
- **输出**：多回合双角色交互日志

### 5. Prism-Evaluate
- **角色**：QA Lead + Forensic Narratologist
- **功能**：审计会话质量，评估声纹一致性、逻辑自洽性、张力曲线、AI味浓度、**拓扑连贯性**（v9.0 新增）；长篇连续性审计
- **输出**：结构化审计报告

### 6. Prism-Weaver-Orch (V8.1+)
- **角色**：Executive Producer & Story Architect
- **功能**：编排长篇小说生产流程，通过 `new_task` 协调 Weaver（写作）和 Evaluate（审计）
- **核心机制**：`story_bible.md` 作为持久化世界状态层，防止长篇后期的事实性漂移
- **工作流**：Write → Continuity Sync → Quality Audit → Decision Gate（每章循环）
- **适用场景**：多章节长篇项目（5+ 章），需要强事实一致性保证时使用

## ETL 流程图（v9.0）

```
[全年龄段原始素材]
    ↓
[工作流 C: 仿射变换代理] ← ETL 提取阶段（可选，全年龄段素材 + 高张力意图时使用）
    ↓
[L3+ DLC 文档]
    ↓（等权重合并）
[合并素材包]
    ↓
[工作流 A: 角色构建] → Module A（含 Persona Topology）
    ↓
[工作流 B: 场景构建] → Module B（含 Beat Map）
    ↓
[Prism-Runtime] → 拓扑感知会话日志
```

## 素材预处理工具（DOCX -> Markdown）
- 位置：`source_materials/ConvertDocxToMdAndArchive.ps1`
- 依赖：本机已安装 `pandoc`，且可在 `PATH` 中找到
- 功能：将指定目录的 `.docx` 批量转换为 `.md`，转换后将原文件移动到上一级 `drafts/`

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\source_materials\ConvertDocxToMdAndArchive.ps1
```

## 与其他分支关系
- 本目录是 State-Space (v9.0) 协议的完整 Universe 实现。
- `Prism-Engine-V8.x` 是 Compact-State (v8.0/v8.1) 协议的完整实现，作为对照基线。
- `Prism-Engine-V7.x` 是 Neuro-Weave (v7.0) 协议的完整实现。

## Lite 输出 Profile
V9.x 的 ETL 支持面向单一聊天宿主的 Lite 输出 Profile（工作流 D）。

- `Lite Immersive`：第一人称角色主提示词 → `workspace/lite/{char_name}_prompt_immersive.md`
- `Lite Compatible`：第三人称角色主提示词 → `workspace/lite/{char_name}_prompt_compatible.md`
