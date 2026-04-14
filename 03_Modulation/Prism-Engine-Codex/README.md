# Prism-Engine-Codex

> **Prism Engine v9.0 State-Space 面向 Codex CLI 的宿主适配层**

## 定位

`Prism-Engine-Codex` 是 Prism Engine 六引擎矩阵在 **Codex CLI** 环境下的落地实现。它通过目录作用域 `AGENTS.md` 组织六引擎行为边界，通过文件系统承载全部可持续状态，通过 Scene Shards 协议支撑长文本的碎片化写入与编译。

协议层以 **v9.0 State-Space** 为主。本目录关注的是宿主层：如何在 Codex CLI 中启动引擎、管理文件和推进工作流。

> 快速开始请直接阅读 [`START_HERE.md`](./START_HERE.md)。

## 核心原则

### 文件系统即单一事实来源

| 状态类型 | 存储位置 |
|:---|:---|
| 原始素材 | [`source_materials/`](./source_materials/) |
| 角色卡、场景卡、DLC 文档 | [`workspace/`](./workspace/) |
| Lite Persona Prompt | [`workspace/lite/`](./workspace/lite/) |
| 会话日志 | [`test_runs/`](./test_runs/) |
| 长篇项目 | [`novels/`](./novels/) |
| 审计报告 | [`reports/`](./reports/) |

### 目录作用域即模式切换

每个引擎拥有独立子目录，内含局部 `AGENTS.md` 和 `START_PROMPT.md`。推荐做法：进入对应目录启动 Codex，会话即由该引擎接管。

| 引擎目录 | 职责 |
|:---|:---|
| [`etl/`](./etl/) | 原始素材 → 角色卡 + 场景卡 + DLC 文档 + Lite persona prompt |
| [`runtime/`](./runtime/) | 角色卡 + 场景卡 → 回合制文件内交互日志 |
| [`evaluate/`](./evaluate/) | 对卡片、日志、章节做结构化审计 |
| [`weaver/`](./weaver/) | 根据大纲与世界状态撰写场景碎片 |
| [`weaver-orch/`](./weaver-orch/) | 长篇编排器：调度、同步与门控 |
| [`dyad/`](./dyad/) | 双实体自动博弈数据生成 |

### Scene Shards 长文本协议

```text
novels/{project}/
├── outline.md
├── story_bible.md
├── Chapter_01.md
└── chapters/
    └── Chapter_01/
        ├── Scene_001.md
        ├── Scene_002.md
        └── Scene_003.md
```

## 核心概念定义

以下术语在 `Prism-Engine-Codex` 内部自洽定义，不依赖 `02_Resonance/`。

### State-Space

`State-Space` 指角色不是一组静态标签，而是一张可导航的人格状态空间图。系统不问“角色是什么”，而问“在当前压力、关系、边界接近度下，角色会沿哪条路径变化”。

### Persona Topology

`Persona Topology` 是 Module A 中的人格拓扑层，由三部分组成：

- `Invariant Axes`：无论张力如何变化都不破坏的身份常量。
- `Variant Axes`：会随张力变化而移动的行为梯度。
- `Boundary Conditions`：角色绝不越过的硬边界，以及深层访问条件。

### Beat Map

`beat_map` 是 Module B 中的节拍图。它不是剧情摘要，而是 Runtime 可执行的状态推进表。每个节拍包含：

- `label`：节拍名
- `tension_target`：该节拍结束时应达到的目标张力值
- `variant_config`：角色在该节拍中的行为配置
- `pivot_condition`：从该节拍推进到下一节拍的叙事条件

### State Navigator

`State Navigator` 是 Runtime 的内部导航器。它每轮读取当前节拍、张力、行为配置和边界接近度，决定角色如何回应，以及是否该推进到下一个节拍。

### Story Bible

`Story Bible` 是长篇项目的持久化世界状态层，用于保存跨章节必须稳定延续的事实，包括时间线、角色状态、关系变化、世界事实、伏笔状态和连续性风险。

### Affine Transform Agent

`Affine Transform Agent` 是 ETL 的工作流 C。它的作用不是“直接生成角色卡”，而是把全年龄原始素材中已经存在的欲望、依附、控制、羞耻、占有、亲密等信号，沿角色自身逻辑推导为高强度素材补充文档（DLC），再与原始素材等权输入角色构建流程。

### L-System

`L-System` 是生产层使用的强度工作语言，用于设计节拍图与访问条件。它只服务于创作者与引擎内部推理，**严禁出现在任何产出层文件中**。

当前定义如下：

- `L1`：日常层。无主动强压，角色维持基线行为，重点是节律、距离感、舒适区和日常互动。
- `L2`：情感牵引层。吸引、试探、误读、靠近、退让开始出现，但边界仍稳定。
- `L3-A`：柔性亲密层。重点是氛围、身体接近、感官压力与前奏，可跳过。
- `L3-B`：纯激情层。亲密行为成为叙事主轴，前提是角色结构允许且访问条件满足。
- `L4-A`：欲望与心理层。角色的核心欲望、防御机制、补偿逻辑开始直接塑形行为。
- `L4-B`：特化癖好层。默认协议为“以重量崇拜”，靴/足作为连接媒介，动机为爱与占有而非恶意，除非角色结构明确导向其他形态。
- `L5`：极限层。默认锁定，只有在用户明确请求且角色边界条件允许时才可设计或进入。

## 目录结构

```text
Prism-Engine-Codex/
├── AGENTS.md
├── README.md
├── START_HERE.md
├── etl/
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── runtime/
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── evaluate/
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── weaver/
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── weaver-orch/
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── dyad/
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── shared/prompts/
├── guides/
├── specs/
│   ├── schema_character.md
│   ├── schema_scenario.md
│   ├── schema_dlc.md
│   ├── schema_outline.md
│   ├── schema_story_bible.md
│   ├── schema_persona_prompt_immersive.md
│   └── schema_persona_prompt_compatible.md
├── templates/
├── scripts/
├── project_template/
├── source_materials/
├── workspace/
├── novels/
├── reports/
└── test_runs/
```

## 六引擎工作流

### ETL

将原始素材转化为角色卡 (Module A)、场景卡 (Module B)、L3+ DLC 文档与 Lite persona prompt。

推荐顺序：

1. 将素材放入 [`source_materials/`](./source_materials/)
2. 若需要高强度推导，先走工作流 C，产出 `workspace/{char_name}_dlc.md`
3. 输出 Character Blueprint，确认后写入角色卡
4. 根据角色拓扑生成场景卡，YAML 使用 `beat_map`
5. 若目标是单一 System Prompt 聊天宿主，改走 Lite workflow，写入 [`workspace/lite/`](./workspace/lite/)

### Runtime

将角色卡与场景卡推进为文件内回合日志。输出格式为：

1. Hidden Neural Chain（HTML 注释）
2. Dynamic HUD（5 行，含 Beat 行）
3. Prose Content（正文）

### Weaver-Orch / Weaver

- `weaver-orch/` 负责项目骨架、章节任务包、Story Bible 同步和决策门控
- `weaver/` 负责逐场景写作，不直接承担总控职责
- 默认采用单会话协调流；需要并行时由用户显式要求

### Evaluate

审计维度为 A–F 通用维度加 G 长篇连续性审计。其中 F 为 v9.0 新增的 **Topology Coherence**。

### Dyad

自动生成双实体交互日志。遵循 `beat_map` 推进，维持 Invariant Axes 不可违背。

## 脚本入口

[`scripts/`](./scripts/) 为每个操作提供 Shell (`.sh`) 和 PowerShell (`.ps1`) 版本。

| 功能 | Shell | PowerShell |
|:---|:---|:---|
| 初始化长篇项目 | `bash scripts/init_novel_project.sh <project>` | `powershell -ExecutionPolicy Bypass -File .\scripts\init_novel_project.ps1 -ProjectName <project>` |
| 初始化 Runtime 日志 | `bash scripts/init_runtime_session.sh <session> <char_card> <scenario_card>` | `powershell -ExecutionPolicy Bypass -File .\scripts\init_runtime_session.ps1 -SessionName <session> -CharacterCard <char_card> -ScenarioCard <scenario_card>` |
| 初始化章节场景 | `bash scripts/init_chapter_scene.sh <project> <chapter> <scene>` | `powershell -ExecutionPolicy Bypass -File .\scripts\init_chapter_scene.ps1 -ProjectName <project> -ChapterNumber <chapter> -SceneNumber <scene>` |
| 编译章节 | `bash scripts/compile_chapter.sh <project> <chapter>` | `powershell -ExecutionPolicy Bypass -File .\scripts\compile_chapter.ps1 -ProjectName <project> -ChapterNumber <chapter>` |
| Story Bible 快照 | `bash scripts/snapshot_story_bible.sh <project> <chapter>` | `powershell -ExecutionPolicy Bypass -File .\scripts\snapshot_story_bible.ps1 -ProjectName <project> -ChapterNumber <chapter>` |
| 目录校验 | `bash scripts/validate_codex_tree.sh` | `powershell -ExecutionPolicy Bypass -File .\scripts\validate_codex_tree.ps1` |

## 当前状态

已具备：

- 六引擎目录作用域（含局部 `AGENTS.md` 与 `START_PROMPT.md`）
- v9.0 协议约束与模板（含 Persona Topology、beat_map、schema_dlc）
- Shell / PowerShell 双脚本入口
- 快速指南、项目模板与目录校验脚本

待推进：

- Story Bible 自动同步脚本
- 审计报告模板化脚本
- 示例素材包与完整样板文件

---

*返回上层：[Phase III: Modulation](../README.md) · 返回仓库根目录：[Neural Narratology](../../README.md)*
