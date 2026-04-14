# Prism-Engine-Claude-Code

> **Prism Engine v9.0 State-Space 面向 Claude Code CLI 的宿主适配层**

## 定位

`Prism-Engine-Claude-Code` 是 Prism Engine 六引擎矩阵在 **Claude Code CLI** 环境下的落地实现。它通过目录作用域 `CLAUDE.md` 组织六引擎行为边界，通过文件系统承载全部可持续状态，通过 Scene Shards 协议支撑长文本的碎片化写入与编译。

协议层以 v9.0 State-Space 为主。本目录关注的是**宿主层**——即如何在 Claude Code 中启动引擎、管理文件和推进工作流。

> 快速开始请直接阅读 [`START_HERE.md`](./START_HERE.md)。

## 核心原则

### 文件系统即单一事实来源

所有可持续状态落在文件中，会话历史仅作为辅助参考：

| 状态类型 | 存储位置 |
|:---|:---|
| 原始素材 | [`source_materials/`](./source_materials/) |
| 角色卡与场景卡 | [`workspace/`](./workspace/) |
| Lite Persona Prompt | [`workspace/lite/`](./workspace/lite/) |
| 会话日志 | [`test_runs/`](./test_runs/) |
| 长篇项目 | [`novels/`](./novels/) |
| 审计报告 | [`reports/`](./reports/) |

### 自然语言 + 目录作用域双轨切换

Claude Code 没有 RooCode 的模式切换 UI，引擎切换通过两种方式实现：

- **自然语言触发**：在根目录会话中说 "Start ETL" / "Start Runtime" 等触发关键词
- **目录作用域**：进入引擎子目录启动新会话，该目录的 `CLAUDE.md` 自动接管

| 引擎目录 | 职责 |
|:---|:---|
| [`etl/`](./etl/) | 原始素材 → 角色卡 (Module A) + 场景卡 (Module B) + L3+ DLC 文档 |
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

## 宿主能力映射

| 概念 | RooCode (V8.x) | Codex | Claude Code |
|:---|:---|:---|:---|
| 引擎切换 | Custom Modes 菜单 | cd 进引擎目录 | 自然语言触发 + cd 子目录 |
| 系统提示 | `.roo/system-prompt-*` | `AGENTS.md` | `CLAUDE.md` |
| 子任务委派 | `new_task` | 手动切换会话 | Agent 工具 (subagent) |
| 文件操作 | `write_to_file`/`read_file` | 同左 | Write/Read/Edit |
| 用户交互 | `ask_followup_question` | 聊天 | AskUserQuestion |
| Shell 命令 | `execute_command` | 直接 shell | Bash 工具 |
| 任务追踪 | 无 | 无 | TaskCreate/TaskUpdate |

## 目录结构

```text
Prism-Engine-Claude-Code/
├── CLAUDE.md                         # 全局行为规范 + 引擎调度表
├── README.md                         # 本文件
├── START_HERE.md                     # 最短启动路径
│
├── etl/                              # ETL 引擎作用域
│   └── CLAUDE.md
├── runtime/                          # Runtime 引擎作用域
│   └── CLAUDE.md
├── evaluate/                         # Evaluate 引擎作用域
│   └── CLAUDE.md
├── weaver/                           # Weaver 引擎作用域
│   └── CLAUDE.md
├── weaver-orch/                      # Weaver-Orch 引擎作用域
│   └── CLAUDE.md
├── dyad/                             # Dyad 引擎作用域
│   └── CLAUDE.md
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
│   ├── schema_persona_prompt_immersive.md
│   ├── schema_persona_prompt_compatible.md
│   ├── schema_scenario.md
│   ├── schema_dlc.md
│   ├── schema_outline.md
│   └── schema_story_bible.md
│
├── templates/                        # 生成目标的初始模板
│   ├── tpl_module_a.md
│   ├── tpl_persona_prompt_immersive.md
│   ├── tpl_persona_prompt_compatible.md
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

将原始素材转化为角色卡 (Module A)、场景卡 (Module B)、L3+ DLC 文档与 Lite persona prompt。

**推荐步骤：**

1. 将素材放入 [`source_materials/`](./source_materials/)
2. 在根目录说 `Start ETL`，或进入 [`etl/`](./etl/) 子目录
3. 若需要 L3+ DLC，先走工作流 C（Affine Transform Agent），产出 DLC 文档
4. 先输出 Character Blueprint，确认后写入角色卡（工作流 A，可合并 DLC 文档作为等权输入）
5. 根据角色卡生成场景卡（工作流 B，YAML 含 beat_map）
6. 若目标是单一 System Prompt 聊天宿主，改走 Lite workflow 并写入 [`workspace/lite/`](./workspace/lite/)

**参考：** [`guides/etl_quickstart.md`](./guides/etl_quickstart.md)

### Runtime

将角色卡与场景卡推进为文件内回合日志。

**推荐步骤：**

1. 用 Bash 运行 `init_runtime_session` 脚本初始化日志骨架
2. 说 `Start Runtime`，或进入 [`runtime/`](./runtime/) 子目录
3. 读取角色卡、场景卡与当前日志，逐回合推进

**参考：** [`guides/runtime_quickstart.md`](./guides/runtime_quickstart.md)

### Weaver-Orch

长篇编排器，负责调度、同步与门控：

- 建立项目，生成大纲与 Story Bible
- 安排章节计划
- 在审计结果后执行决策门控（PASS / CONDITIONAL / FAIL）
- 支持 Agent 子代理委派或单会话回退模式

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

[`scripts/`](./scripts/) 目录为每个操作同时提供 Shell (`.sh`) 和 PowerShell (`.ps1`) 版本。通过 Bash 工具调用。

### 项目初始化

```bash
bash scripts/init_novel_project.sh <project>
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\init_novel_project.ps1 -ProjectName <project>
```

### Runtime 日志初始化

```bash
bash scripts/init_runtime_session.sh <session> <char_card> <scenario_card>
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\init_runtime_session.ps1 -SessionName <session> -CharacterCard <char_card> -ScenarioCard <scenario_card>
```

### 章节场景初始化

```bash
bash scripts/init_chapter_scene.sh <project> <chapter> <scene>
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\init_chapter_scene.ps1 -ProjectName <project> -ChapterNumber <chapter> -SceneNumber <scene>
```

### 章节编译

```bash
bash scripts/compile_chapter.sh <project> <chapter>
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\compile_chapter.ps1 -ProjectName <project> -ChapterNumber <chapter>
```

### Story Bible 快照

```bash
bash scripts/snapshot_story_bible.sh <project> <chapter>
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\snapshot_story_bible.ps1 -ProjectName <project> -ChapterNumber <chapter>
```

### 目录校验

```bash
bash scripts/validate_codex_tree.sh
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate_codex_tree.ps1
```

## 示例演练骨架

以下为一套完整的最小演练流程，使用虚构项目 `demo_harbor_ember` 作为示范。

**示例目标：** 一位从港口封锁区逃出的女走私者，与用户在暴雨夜的废旧引航塔相遇。生成角色卡与场景卡后，进行 Runtime 试跑，再扩展为 4 章中篇项目。

### Stage 0 — 准备素材

将素材放入 [`source_materials/`](./source_materials/)：`character_seed.md`、`harbor_notes.md`、`rain_tower_scene.md`。

### Stage 1 — ETL 生成角色卡

```
Start ETL
```

```
读取 shared/prompts/etl.md、specs/schema_character.md、templates/tpl_module_a.md，然后检查 source_materials/ 并生成 Character Blueprint。确认前不写文件。
```

确认后：

```
已确认。按 ETL 四阶段流程将 Module A 写入 workspace/lin_shuang.md。
```

### Stage 2 — ETL 生成场景卡

```
读取 workspace/lin_shuang.md，为暴雨夜废弃引航塔的 L2 相遇提出 3 个剧情钩子。不写文件。
```

选定后：

```
选方案 2。将 Module B 写入 workspace/lin_shuang_scenario_l2_rain_tower.md。
```

### Stage 3 — Runtime 试跑

```bash
bash scripts/init_runtime_session.sh harbor_demo lin_shuang.md lin_shuang_scenario_l2_rain_tower.md
```

```
Start Runtime
```

```
读取 shared/prompts/runtime.md，加载角色卡、场景卡与 test_runs/ 中的日志，写入开场回应后停顿等待我的输入。
```

### Stage 4 — 初始化长篇项目

```bash
bash scripts/init_novel_project.sh demo_harbor_ember
```

```
Start Weaver-Orch
```

```
读取 shared/prompts/weaver-orch.md、specs/schema_outline.md、specs/schema_story_bible.md 和 workspace/ 中的角色卡。为 demo_harbor_ember 初始化 outline.md 与 story_bible.md（4 章中篇），停顿等待确认。
```

### Stage 5 — 场景碎片初始化与写作

```bash
bash scripts/init_chapter_scene.sh demo_harbor_ember 1 1
bash scripts/init_chapter_scene.sh demo_harbor_ember 1 2
```

```
Start Weaver
```

```
读取 shared/prompts/weaver.md、novels/demo_harbor_ember/outline.md、story_bible.md 和 workspace/lin_shuang.md。写入 Scene_001.md 后停顿。
```

### Stage 6 — 编译与审计

```bash
bash scripts/compile_chapter.sh demo_harbor_ember 1
bash scripts/snapshot_story_bible.sh demo_harbor_ember 1
```

```
Start Evaluate
```

```
读取 shared/prompts/evaluate.md，审计 novels/demo_harbor_ember/Chapter_01.md，参照 outline.md 与 story_bible.md。报告写入 reports/audit_demo_harbor_ember_ch01.md。
```

### Stage 7 — 决策门控

| 审计结果 | 后续操作 |
|:---|:---|
| `PASS` | 初始化 `Chapter_02/Scene_001.md`，进入下一章 |
| `CONDITIONAL` | 局部返工问题场景，重编译后再审计 |
| `FAIL` | 回到本章场景计划，重写本章 |

## 长篇写作协议

### Story Bible 约定

- 每次修改前先通过 `snapshot_story_bible` 脚本生成章节快照
- `Timeline` 保持追加式更新
- `Character State Tracker` 保留章节引用
- `Chekhov's Registry` 使用 `OPEN / RESOLVED / DROPPED` 状态
- `Continuity Warnings` 仅记录真实矛盾与风险项

### 单会话协调流

当不启用子代理时，[`weaver-orch/`](./weaver-orch/) 按以下顺序推进：

1. 读取目标章节在 `outline.md` 中的条目
2. 读取 `story_bible.md` 和上一章产物
3. 写出当前章节的 Scene Plan
4. 初始化当前章节的 `Scene_YYY.md`
5. 逐场景写作（交由 Weaver）
6. 编译本章
7. 为 `story_bible.md` 做快照并更新世界状态层
8. 触发 Evaluate 审计
9. 根据结果决定：继续下一章 / 局部返工 / 整章返工

## 项目模板

[`project_template/`](./project_template/) 提供一套可复制的最小工作区骨架，适用于：

- 新建独立角色项目
- 将 Claude Code 宿主层嵌入其他仓库
- 在正式角色项目中快速开工

详见 [`project_template/README.md`](./project_template/README.md)。

## 当前状态

**已具备：**

- 六引擎目录作用域（含局部 `CLAUDE.md`）
- 共享引擎手册 [`shared/prompts/`](./shared/prompts/)
- 协议约束 [`specs/`](./specs/)（含 v9.0 schema_character、schema_scenario、schema_dlc）与模板 [`templates/`](./templates/)（含 v9.0 tpl_module_a、tpl_module_b）
- Shell / PowerShell 双脚本入口
- 快速指南 [`guides/`](./guides/)
- 示例项目演练骨架
- 可复制的项目模板
- Agent 子代理委派模板（Weaver-Orch）

**待推进：**

- Story Bible 自动同步脚本
- 审计报告模板化脚本
- 示例素材包与完整样板文件

---

*返回上层：[Phase III: Modulation](../README.md) · 返回仓库根目录：[Neural Narratology](../../README.md)*
