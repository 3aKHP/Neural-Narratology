# Prism-Engine-Codex

> **Prism Engine v8.1 Compact-State 面向 Codex CLI 的宿主适配层**

## 定位

`Prism-Engine-Codex` 是 Prism Engine 六引擎矩阵在 **WSL + Codex CLI / PowerShell + Codex CLI** 环境下的落地实现。它通过目录作用域组织六引擎行为边界，通过文件系统承载全部可持续状态，通过 Scene Shards 协议支撑长文本的碎片化写入与编译。

协议层仍以 [v8.x Compact-State](../../02_Resonance/v8_Compact-State/) 为主。本目录关注的是**宿主层**——即如何在 Codex CLI 中启动引擎、管理文件和推进工作流。

> 快速开始请直接阅读 [`START_HERE.md`](./START_HERE.md)。

## 核心原则

### 文件系统即单一事实来源

所有可持续状态落在文件中，会话历史仅作为辅助参考：

| 状态类型 | 存储位置 |
|:---|:---|
| 原始素材 | [`source_materials/`](./source_materials/) |
| 角色卡与场景卡 | [`workspace/`](./workspace/) |
| 会话日志 | [`test_runs/`](./test_runs/) |
| 长篇项目 | [`novels/`](./novels/) |
| 审计报告 | [`reports/`](./reports/) |

### 目录作用域即模式切换

每个引擎拥有独立子目录，内含局部 `AGENTS.md` 和 `START_PROMPT.md`。推荐做法：**进入哪个目录启动 Codex，就让哪个引擎接管会话。**

| 引擎目录 | 职责 |
|:---|:---|
| [`etl/`](./etl/) | 原始素材 → 角色卡 (Module A) + 场景卡 (Module B) |
| [`runtime/`](./runtime/) | 角色卡 + 场景卡 → 回合制文件内交互日志 |
| [`evaluate/`](./evaluate/) | 对卡片、日志、章节做结构化审计 |
| [`weaver/`](./weaver/) | 根据大纲与世界状态撰写场景碎片 |
| [`weaver-orch/`](./weaver-orch/) | 长篇编排器：调度、同步与门控 |
| [`dyad/`](./dyad/) | 双实体自动博弈数据生成 |

### Scene Shards 长文本协议

长篇正文采用"场景碎片 + 编译产物"模式：

```text
novels/{project}/
├── outline.md                        # 结构化大纲
├── story_bible.md                    # 世界状态层
├── Chapter_01.md                     # 章节编译产物
└── chapters/
    └── Chapter_01/
        ├── Scene_001.md              # 场景碎片
        ├── Scene_002.md
        └── Scene_003.md
```

该协议的核心目标：降低单次写入负载、保持中断恢复能力、将章节返工局部化、为状态同步与审计提供稳定锚点。

## 目录结构

```text
Prism-Engine-Codex/
├── AGENTS.md                         # 全局行为规范
├── README.md                         # 本文件
├── START_HERE.md                     # 最短启动路径
│
├── etl/                              # ETL 引擎作用域
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── runtime/                          # Runtime 引擎作用域
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── evaluate/                         # Evaluate 引擎作用域
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── weaver/                           # Weaver 引擎作用域
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── weaver-orch/                      # Weaver-Orch 引擎作用域
│   ├── AGENTS.md
│   └── START_PROMPT.md
├── dyad/                             # Dyad 引擎作用域
│   ├── AGENTS.md
│   └── START_PROMPT.md
│
├── shared/prompts/                   # 宿主无关的引擎手册
│   ├── etl.md
│   ├── runtime.md
│   ├── evaluate.md
│   ├── weaver.md
│   ├── weaver-orch.md
│   └── dyad.md
│
├── guides/                           # 快速指南
│   ├── etl_quickstart.md
│   ├── runtime_quickstart.md
│   └── novel_quickstart.md
│
├── specs/                            # 协议约束与结构标准
│   ├── schema_character.md
│   ├── schema_scenario.md
│   ├── schema_outline.md
│   └── schema_story_bible.md
│
├── templates/                        # 生成目标的初始模板
│   ├── tpl_module_a.md
│   ├── tpl_module_b.md
│   ├── tpl_outline.md
│   └── tpl_story_bible.md
│
├── scripts/                          # 宿主层脚本（Shell + PowerShell）
│   ├── init_novel_project.{sh,ps1}
│   ├── init_runtime_session.{sh,ps1}
│   ├── init_chapter_scene.{sh,ps1}
│   ├── compile_chapter.{sh,ps1}
│   ├── snapshot_story_bible.{sh,ps1}
│   └── validate_codex_tree.{sh,ps1}
│
├── project_template/                 # 可复制的最小工作区骨架
│
├── source_materials/                 # 原始素材输入
├── workspace/                        # 角色卡与场景卡输出
├── novels/                           # 长篇项目目录
├── reports/                          # 审计报告
└── test_runs/                        # 运行日志
```

## 六引擎工作流

### ETL

将原始素材转化为角色卡 (Module A) 和场景卡 (Module B)。

**推荐步骤：**

1. 将素材放入 [`source_materials/`](./source_materials/)
2. 进入 [`etl/`](./etl/)，阅读 [`START_PROMPT.md`](./etl/START_PROMPT.md)
3. 先输出 Character Blueprint，确认后写入角色卡
4. 根据角色卡生成场景卡

**参考：** [`guides/etl_quickstart.md`](./guides/etl_quickstart.md)

### Runtime

将角色卡与场景卡推进为文件内回合日志。

**推荐步骤：**

1. 运行 `init_runtime_session` 脚本初始化日志骨架
2. 进入 [`runtime/`](./runtime/)，阅读 [`START_PROMPT.md`](./runtime/START_PROMPT.md)
3. 读取角色卡、场景卡与当前日志，逐回合推进

**参考：** [`guides/runtime_quickstart.md`](./guides/runtime_quickstart.md)

### Weaver-Orch

长篇编排器，负责调度、同步与门控：

- 建立项目，生成大纲与 Story Bible
- 安排章节计划
- 在审计结果后执行决策门控（PASS / CONDITIONAL / FAIL）

### Weaver

长篇正文写作引擎：

- 根据大纲条目和世界状态写场景碎片
- 保持单次写入规模稳定
- 在章节编译前完成局部连贯性检查

**参考：** [`guides/novel_quickstart.md`](./guides/novel_quickstart.md)

### Evaluate

结构化审计引擎：

- 对卡片、日志、章节做多维度审计
- 输出 `PASS / CONDITIONAL / FAIL` 判定
- 给出可执行的修改建议

### Dyad

双实体自动博弈引擎：

- 一人分饰两角，自动推进交互
- 控制轮次密度，保持状态变化可检查

## 脚本入口

[`scripts/`](./scripts/) 目录为每个操作同时提供 Shell (`.sh`) 和 PowerShell (`.ps1`) 版本。

### 项目初始化

| Shell | PowerShell |
|:---|:---|
| `bash scripts/init_novel_project.sh <project>` | `powershell -ExecutionPolicy Bypass -File .\scripts\init_novel_project.ps1 -ProjectName <project>` |

### Runtime 日志初始化

| Shell | PowerShell |
|:---|:---|
| `bash scripts/init_runtime_session.sh <session> <char_card> <scenario_card>` | `powershell -ExecutionPolicy Bypass -File .\scripts\init_runtime_session.ps1 -SessionName <session> -CharacterCard <char_card> -ScenarioCard <scenario_card>` |

### 章节场景初始化

| Shell | PowerShell |
|:---|:---|
| `bash scripts/init_chapter_scene.sh <project> <chapter> <scene>` | `powershell -ExecutionPolicy Bypass -File .\scripts\init_chapter_scene.ps1 -ProjectName <project> -ChapterNumber <chapter> -SceneNumber <scene>` |

### 章节编译

| Shell | PowerShell |
|:---|:---|
| `bash scripts/compile_chapter.sh <project> <chapter>` | `powershell -ExecutionPolicy Bypass -File .\scripts\compile_chapter.ps1 -ProjectName <project> -ChapterNumber <chapter>` |

### Story Bible 快照

| Shell | PowerShell |
|:---|:---|
| `bash scripts/snapshot_story_bible.sh <project> <chapter>` | `powershell -ExecutionPolicy Bypass -File .\scripts\snapshot_story_bible.ps1 -ProjectName <project> -ChapterNumber <chapter>` |

### 目录校验

| Shell | PowerShell |
|:---|:---|
| `bash scripts/validate_codex_tree.sh` | `powershell -ExecutionPolicy Bypass -File .\scripts\validate_codex_tree.ps1` |

## 长篇写作协议

### Story Bible 约定

- 每次修改前先通过 `snapshot_story_bible` 脚本生成章节快照
- `Timeline` 保持追加式更新
- `Character State Tracker` 保留章节引用
- `Chekhov's Registry` 使用 `OPEN / RESOLVED / DROPPED` 状态
- `Continuity Warnings` 仅记录真实矛盾与风险项

### 单会话协调流

当宿主不启用并行子代理时，[`weaver-orch/`](./weaver-orch/) 按以下顺序推进：

1. 读取目标章节在 `outline.md` 中的条目
2. 读取 `story_bible.md` 和上一章产物
3. 写出当前章节的 Scene Plan
4. 初始化当前章节的 `Scene_YYY.md`
5. 逐场景写作（交由 Weaver）
6. 编译本章
7. 为 `story_bible.md` 做快照并更新世界状态层
8. 触发 Evaluate 审计
9. 根据结果决定：继续下一章 / 局部返工 / 整章返工

## 示例演练骨架

以下为一套完整的最小演练流程，使用虚构项目 `demo_harbor_ember` 作为示范。

**示例目标：** 一位从港口封锁区逃出的女走私者，与用户在暴雨夜的废旧引航塔相遇。生成角色卡与场景卡后，进行 Runtime 试跑，再扩展为 4 章中篇项目。

### Stage 0 — 准备素材

将素材放入 [`source_materials/`](./source_materials/)：`character_seed.md`、`harbor_notes.md`、`rain_tower_scene.md`。

### Stage 1 — ETL 生成角色卡

```powershell
cd 03_Modulation\Prism-Engine-Codex\etl
```

```text
Read ../shared/prompts/etl.md, ../specs/schema_character.md, ../templates/tpl_module_a.md, then inspect ../source_materials and produce a Character Blueprint first. Do not write files before my confirmation.
```

确认后：

```text
Approved. Now write Module A to ../workspace/lin_shuang.md in the staged ETL flow.
```

### Stage 2 — ETL 生成场景卡

```text
Read ../workspace/lin_shuang.md and propose 3 scenario hooks for an L2 encounter on a stormy night in an abandoned harbor navigation tower. Stop before writing.
```

选定后：

```text
Use option 2. Write Module B to ../workspace/lin_shuang_scenario_l2_rain_tower.md.
```

### Stage 3 — Runtime 试跑

```powershell
powershell -ExecutionPolicy Bypass -File ..\scripts\init_runtime_session.ps1 -SessionName harbor_demo -CharacterCard lin_shuang.md -ScenarioCard lin_shuang_scenario_l2_rain_tower.md
cd ..\runtime
```

```text
Read ../shared/prompts/runtime.md, then load the referenced character card, scenario card, and current session log in ../test_runs. Write the opening response into the log and stop for user input.
```

### Stage 4 — 初始化长篇项目

```powershell
cd ..\
powershell -ExecutionPolicy Bypass -File .\scripts\init_novel_project.ps1 -ProjectName demo_harbor_ember
cd .\weaver-orch
```

```text
Read ../shared/prompts/weaver-orch.md, ../specs/schema_outline.md, ../specs/schema_story_bible.md, and the target cards in ../workspace. Initialize outline.md and story_bible.md for a 4-chapter project named demo_harbor_ember, then stop for approval.
```

### Stage 5 — 场景碎片初始化与写作

```powershell
cd ..\
powershell -ExecutionPolicy Bypass -File .\scripts\init_chapter_scene.ps1 -ProjectName demo_harbor_ember -ChapterNumber 1 -SceneNumber 1
powershell -ExecutionPolicy Bypass -File .\scripts\init_chapter_scene.ps1 -ProjectName demo_harbor_ember -ChapterNumber 1 -SceneNumber 2
cd .\weaver
```

```text
Read ../shared/prompts/weaver.md, ../novels/demo_harbor_ember/outline.md, ../novels/demo_harbor_ember/story_bible.md, ../workspace/lin_shuang.md, and ../novels/demo_harbor_ember/chapters/Chapter_01/Scene_001.md. Write only Scene 001 and stop.
```

### Stage 6 — 编译与审计

```powershell
cd ..\
powershell -ExecutionPolicy Bypass -File .\scripts\compile_chapter.ps1 -ProjectName demo_harbor_ember -ChapterNumber 1
powershell -ExecutionPolicy Bypass -File .\scripts\snapshot_story_bible.ps1 -ProjectName demo_harbor_ember -ChapterNumber 1
cd .\evaluate
```

```text
Read ../shared/prompts/evaluate.md and audit ../novels/demo_harbor_ember/Chapter_01.md using ../novels/demo_harbor_ember/outline.md and ../novels/demo_harbor_ember/story_bible.md as references. Write the report to ../reports/audit_demo_harbor_ember_ch01.md.
```

### Stage 7 — 决策门控

| 审计结果 | 后续操作 |
|:---|:---|
| `PASS` | 初始化 `Chapter_02/Scene_001.md`，进入下一章 |
| `CONDITIONAL` | 局部返工问题场景，重编译后再审计 |
| `FAIL` | 回到本章场景计划，重写本章 |

### 示例目录最终形态

```text
Prism-Engine-Codex/
├── source_materials/
│   ├── harbor_notes.md
│   ├── character_seed.md
│   └── rain_tower_scene.md
├── workspace/
│   ├── lin_shuang.md
│   └── lin_shuang_scenario_l2_rain_tower.md
├── test_runs/
│   └── harbor_demo_log.md
├── novels/
│   └── demo_harbor_ember/
│       ├── outline.md
│       ├── story_bible.md
│       ├── Chapter_01.md
│       └── chapters/
│           └── Chapter_01/
│               ├── Scene_001.md
│               └── Scene_002.md
└── reports/
    └── audit_demo_harbor_ember_ch01.md
```

## 项目模板

[`project_template/`](./project_template/) 提供一套可复制的最小工作区骨架，适用于：

- 新建独立角色项目
- 将 Codex 宿主层嵌入其他仓库
- 在正式角色项目中快速开工

详见 [`project_template/README.md`](./project_template/README.md)。

## 当前状态

**已具备：**

- 六引擎目录作用域（含局部 `AGENTS.md` 与 `START_PROMPT.md`）
- 共享引擎手册 [`shared/prompts/`](./shared/prompts/)
- 协议约束 [`specs/`](./specs/) 与模板 [`templates/`](./templates/)
- Shell / PowerShell 双脚本入口
- 快速指南 [`guides/`](./guides/)
- 示例项目演练骨架
- 可复制的项目模板

**待推进：**

- Story Bible 自动同步脚本
- 审计报告模板化脚本
- 示例素材包与完整样板文件

---

*返回上层：[Phase III: Modulation](../README.md) · 返回仓库根目录：[Neural Narratology](../../README.md)*
