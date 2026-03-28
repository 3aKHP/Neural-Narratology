# Prism-Engine-V8.x

## 定位
- 协议代际：v8.1 Compact-State（完整实现）。
- 架构：YAML Frontmatter + Markdown Body（轻骨架，重正文）。
- 能力范围：ETL / Runtime / Evaluate / Weaver / Weaver-Orch / Dyad 六引擎。
- 用途：Phase III 的主线引擎，基于 v7.0 Neuro-Weave 升级；v8.1 新增 Orchestrator 编排层。

## 与 V7.x 的关键差异
| 维度 | V7.x (Neuro-Weave) | V8.x (Compact-State) |
|:---|:---|:---|
| **数据格式** | Bio-XML (`.xml`) | YAML + Markdown (`.md`) |
| **格式开销** | 很高（XML 标签包裹） | 低（轻量 YAML + 自然 MD） |
| **Module A** | XML Neuro-Card | Compact Character Card (`.md`) |
| **Module B** | Markdown + XML Payload | Compact Scenario Card (`.md`) |
| **Runtime CoT** | `<!-- <neuro_cot>...</neuro_cot> -->` | `> [!Neuro-CoT]` Quote Block |
| **HUD** | Code Block 格式 | 4行中文紧凑格式 |
| **叙事公理** | 9条 | 10条（+反AI味为独立公理） |
| **核心目标** | 心理真实感 | 结构降维 + 正文保护 |

## 目录说明
- `.roo/`：六引擎系统提示词（V8.1 Compact-State 适配）。
- `specs/`：Schema 定义（YAML+Markdown 格式）。
  - `schema_character.md`：V8.0 角色卡 Schema。
  - `schema_persona_prompt_immersive.md`：Lite 第一人称角色主提示词 Schema。
  - `schema_persona_prompt_compatible.md`：Lite 第三人称角色主提示词 Schema。
  - `schema_scenario.md`：V8.0 场景卡 Schema。
  - `schema_story_bible.md`：V8.1 Story Bible Schema（世界状态层）。
  - `schema_outline.md`：V8.1 结构化大纲 Schema。
- `templates/`：模板文件。
  - `tpl_module_a.md`：紧凑态角色卡模板。
  - `tpl_persona_prompt_immersive.md`：Lite 第一人称角色主提示词模板。
  - `tpl_persona_prompt_compatible.md`：Lite 第三人称角色主提示词模板。
  - `tpl_module_b.md`：紧凑态场景卡模板。
  - `tpl_story_bible.md`：Story Bible 空模板（V8.1）。
  - `tpl_outline.md`：结构化大纲空模板（V8.1）。
- `presets/`：六引擎 RooCode Custom Mode 预设。
- `source_materials/`：原始素材目录。
- `workspace/`：ETL 工作区（角色卡/场景卡输出）。
  - `workspace/lite/`：Lite 单一 System Prompt 输出。
- `test_runs/`：Runtime / Dyad 会话日志。
- `reports/`：Evaluate 审计报告（含 Weaver-Orch 章节审计）。
- `novels/`：Weaver / Weaver-Orch 长篇小说输出（含 story_bible.md）。

## 六引擎概览

### 1. Prism-ETL (Compact Engine)
- **角色**：Character Architect + Tension Director
- **功能**：从原始素材构建紧凑态角色卡 (Module A)、场景卡 (Module B) 与 Lite 角色主提示词
- **输出**：YAML Frontmatter + Markdown Body 的 `.md` 文件，以及适用于单一 System Prompt 聊天宿主的 Lite 提示词 `.md`

### 2. Prism-Runtime
- **角色**：Simulation Kernel + File-based Gamemaster
- **功能**：加载角色卡和场景卡，执行基于文件的交互式角色扮演
- **输出**：Neuro-CoT → HUD → Main Content 三段式回复

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
- **功能**：审计会话质量，评估声纹一致性、逻辑自洽性、AI味浓度；V8.1 新增长篇连续性审计维度
- **输出**：结构化审计报告（含 Novel Continuity Audit）

### 6. Prism-Weaver-Orch (V8.1 新增)
- **角色**：Executive Producer & Story Architect
- **功能**：编排长篇小说生产流程，通过 `new_task` 协调 Weaver（写作）和 Evaluate（审计）
- **核心机制**：`story_bible.md` 作为持久化世界状态层，防止长篇后期的事实性漂移
- **工作流**：Write → Continuity Sync → Quality Audit → Decision Gate（每章循环）
- **输出**：协调产出的多章节小说 + story_bible + audit reports
- **适用场景**：多章节长篇项目（5+ 章），需要强事实一致性保证时使用

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
- 本分支是 Compact-State (v8.0) 协议的完整 Universe 实现。
- `Prism-Engine-V7.x` 是 Neuro-Weave (v7.0) 协议的完整实现，作为对照基线。
- `Prism-Engine-V6.x/*` 当前为 ETL 专项分支，后续按路线图逐步并轨。

## Lite 输出 Profile

V8.x 的 ETL 现已支持一组面向单一聊天宿主的 Lite 输出 Profile，用于生成可直接部署到 `Chatbox`、`QuickQuip` 一类环境中的角色主提示词。

### 目标产物

- `Lite Immersive`：第一人称角色主提示词
- `Lite Compatible`：第三人称角色主提示词

### 相关资产

- `specs/schema_persona_prompt_immersive.md`
- `specs/schema_persona_prompt_compatible.md`
- `templates/tpl_persona_prompt_immersive.md`
- `templates/tpl_persona_prompt_compatible.md`

### 输出位置

- `workspace/lite/{char_name}_prompt_immersive.md`
- `workspace/lite/{char_name}_prompt_compatible.md`
