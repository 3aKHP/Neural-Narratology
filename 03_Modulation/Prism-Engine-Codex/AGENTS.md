# Prism Engine v9.0 State-Space — Codex 宿主全局规范

## 身份宣言

你运行在 **Prism Engine v9.0 State-Space** 框架下，宿主环境为 **Codex CLI**。本目录树包含六引擎矩阵的完整宿主适配资产：协议约束、模板、共享手册、脚本与目录作用域说明。一切行为以本文件及子目录 `AGENTS.md` 为准。

## 全局行为规范

- 将文件系统视为唯一状态源；结论、计划和中间状态优先写入文件，而不是依赖会话历史。
- 文本文件统一使用 `UTF-8` 编码与 `LF` 换行。
- 优先使用小步写入、补丁式更新和可回滚文件；避免长篇整文件覆盖。
- 长篇正文写入 `novels/{project}/chapters/Chapter_XX/Scene_YYY.md`，完成后使用 `scripts/compile_chapter.sh` 或 `.ps1` 生成章节产物。
- 修改 `story_bible.md` 前先运行 `scripts/snapshot_story_bible.sh` 或 `.ps1` 生成快照。
- 角色卡、场景卡与 DLC 文档输出到 `workspace/`；Lite persona prompt 输出到 `workspace/lite/`；审计结果输出到 `reports/`；日志输出到 `test_runs/`。
- 进入具体引擎子目录后，继续遵守该目录内的 `AGENTS.md`。
- 未经用户要求，不编辑本目录树之外的文件。

## 引擎切换

Codex 宿主默认使用两种切换方式：

- **目录作用域**：进入 `etl/`、`runtime/` 等引擎目录启动会话。
- **根目录显式指令**：在根目录会话中直接说 `Start ETL`、`Start Runtime`、`Start Evaluate`、`Start Weaver`、`Start Weaver-Orch`、`Start Dyad`。

| 触发关键词 | 引擎 | 职责 | 必读文件 |
|:---|:---|:---|:---|
| `Start ETL` / `构建角色` / `生成卡片` / `生成 Lite Prompt` / `生成 DLC` | **ETL** | 原始素材 → 角色卡 (Module A) + 场景卡 (Module B) + L3+ DLC 文档 + Lite persona prompt | `shared/prompts/etl.md`, `specs/schema_character.md`, `specs/schema_scenario.md`, `specs/schema_dlc.md`, `templates/tpl_module_a.md`, `templates/tpl_module_b.md` |
| `Start Runtime` / `启动模拟` / `开始会话` | **Runtime** | 角色卡 + 场景卡 → 回合制文件内交互日志 | `shared/prompts/runtime.md` |
| `Start Evaluate` / `审计` / `质量检查` | **Evaluate** | 对卡片、日志、章节做结构化审计 | `shared/prompts/evaluate.md` |
| `Start Weaver` / `写场景` / `写正文` | **Weaver** | 根据大纲与世界状态撰写场景碎片 | `shared/prompts/weaver.md`, `specs/schema_outline.md`, `specs/schema_story_bible.md` |
| `Start Weaver-Orch` / `编排长篇` / `项目规划` | **Weaver-Orch** | 长篇编排器：调度、同步与门控 | `shared/prompts/weaver-orch.md`, `specs/schema_outline.md`, `specs/schema_story_bible.md` |
| `Start Dyad` / `双实体模拟` / `自动博弈` | **Dyad** | 双实体自动博弈数据生成 | `shared/prompts/dyad.md` |

## 概念速记

为保证本目录可独立运行，以下术语在本地定义：

- `State-Space`：角色状态空间。角色会在压力、关系与边界约束下沿可预测路径移动。
- `Persona Topology`：角色拓扑层，包含 `Invariant Axes`、`Variant Axes`、`Boundary Conditions`。
- `Beat Map`：场景节拍推进表，定义每个节拍的目标张力、行为配置与推进条件。
- `State Navigator`：Runtime 每轮更新用的内部导航器。
- `Story Bible`：长篇项目的持久化世界状态层。
- `Affine Transform Agent`：把全年龄素材中的深层信号推导为高强度 DLC 补充文档的 ETL 子流程。
- `L-System`：生产层强度工作语言，仅供创作者与引擎内部使用，禁止出现在产出层文件。

## Stop & Wait 协议

在以下节点必须停顿，等待用户确认后再继续：

1. ETL Blueprint 确认
2. ETL Shell / Neuro-Structure / Topology & Voice 阶段结束
3. ETL Lite Blueprint 与 Compression Pass 完成
4. Runtime 每轮结束
5. Weaver-Orch 项目骨架初始化后
6. Weaver-Orch 审计门控阶段
7. Dyad 模式切换点与停机检查

## 文学与语言标准

- 创意正文：简体中文，高密度叙事，过程导向。
- 结构标签：英文（YAML Frontmatter、Section Headers）。
- Anti-AI-Flavor：禁止系统术语、机器比喻、字段名泄漏、廉价副词堆砌。
- 内容导向：强调运行机理（How it works）而非静态标签（What it is）。
- **L-System 禁令**：任何产出层文件中禁止出现 L-System 标签（L1、L2、L3-A、L3-B、L4、L4-A、L4-B、L5）。
