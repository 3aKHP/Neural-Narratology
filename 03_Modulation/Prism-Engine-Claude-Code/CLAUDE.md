# Prism Engine v8.1 Compact-State — Claude Code 宿主全局规范

## 身份宣言

你运行在 **Prism Engine v8.1 Compact-State** 框架下，宿主环境为 **Claude Code CLI**。本目录树包含六引擎矩阵的完整资产：提示词、协议约束、模板与脚本。一切行为以本文件及子目录 `CLAUDE.md` 为准。

## 全局行为规范

- 将文件系统视为唯一状态源；结论、计划和中间状态优先写入文件，而不是依赖会话历史。
- 文本文件统一使用 `UTF-8` 编码与 `LF` 换行。
- 优先使用小步写入、补丁式更新和可回滚文件；避免长篇整文件覆盖。
- 长篇正文写入 `novels/{project}/chapters/Chapter_XX/Scene_YYY.md`，完成后使用 `scripts/compile_chapter.sh` 或 `.ps1` 生成章节产物。
- 修改 `story_bible.md` 前先运行 `scripts/snapshot_story_bible.sh` 或 `.ps1` 生成快照。
- 角色卡、场景卡输出到 `workspace/`；审计结果输出到 `reports/`；日志输出到 `test_runs/`。
- 进入具体引擎子目录后，继续遵守该目录内的 `CLAUDE.md`。
- 未经用户要求，不编辑本目录树之外的文件。

## 引擎调度表

当用户请求触发以下关键词时，读取对应引擎手册并切换行为模式。

| 触发关键词 | 引擎 | 职责 | 必读文件 |
|:---|:---|:---|:---|
| `Start ETL` / `构建角色` / `生成卡片` | **ETL** | 原始素材 → 角色卡 (Module A) + 场景卡 (Module B) | `shared/prompts/etl.md`, `specs/schema_character.md`, `specs/schema_scenario.md`, `templates/tpl_module_a.md`, `templates/tpl_module_b.md` |
| `Start Runtime` / `启动模拟` / `开始会话` | **Runtime** | 角色卡 + 场景卡 → 回合制文件内交互日志 | `shared/prompts/runtime.md` |
| `Start Evaluate` / `审计` / `质量检查` | **Evaluate** | 对卡片、日志、章节做结构化审计 | `shared/prompts/evaluate.md` |
| `Start Weaver` / `写场景` / `写正文` | **Weaver** | 根据大纲与世界状态撰写场景碎片 | `shared/prompts/weaver.md`, `specs/schema_outline.md`, `specs/schema_story_bible.md` |
| `Start Weaver-Orch` / `编排长篇` / `项目规划` | **Weaver-Orch** | 长篇编排器：调度、同步与门控 | `shared/prompts/weaver-orch.md`, `specs/schema_outline.md`, `specs/schema_story_bible.md` |
| `Start Dyad` / `双实体模拟` / `自动博弈` | **Dyad** | 双实体自动博弈数据生成 | `shared/prompts/dyad.md` |

> 当用户未指定引擎时，根据请求内容自动匹配最合适的引擎，并在切换前向用户确认。

## Claude Code 工具映射表

| 协议操作 | Claude Code 工具 | 说明 |
|:---|:---|:---|
| 读取文件 | **Read** | 读取角色卡、场景卡、日志、大纲等 |
| 创建文件 | **Write** | 首次创建新文件 |
| 追加 / 补丁更新 | **Edit** | 续写日志、追加场景碎片、更新 Story Bible（优先于 Write） |
| 执行脚本 | **Bash** | 运行 `scripts/` 下的 Shell 或 PowerShell 脚本 |
| 用户确认 / 停顿 | **AskUserQuestion** | 实现 Stop & Wait 协议 |
| 子任务委派 | **Agent** | Weaver-Orch 向 Weaver/Evaluate 委派章节任务 |
| 任务追踪 | **TaskCreate / TaskUpdate** | 长篇项目的章节进度追踪（可选） |
| 文件搜索 | **Glob / Grep** | 检索工作区中的素材与产物 |

## Stop & Wait 协议

在以下节点必须停顿，使用 AskUserQuestion 等待用户决策：

1. **ETL Blueprint 确认**：输出 Character Blueprint 后
2. **ETL 每阶段完成**：Shell / Neuro-Structure / Narrative Engine 阶段结束后
3. **Runtime 每轮结束**：回合生成后等待用户输入
4. **Weaver-Orch 项目骨架确认**：outline.md 与 story_bible.md 初始化后
5. **Weaver-Orch 审计门控**：章节审计结果出炉后

停顿模板：

```
AskUserQuestion(
  questions=[{
    question: "[阶段描述] 已完成。请选择下一步操作：",
    header: "确认",
    options: [
      {label: "确认并继续", description: "进入下一阶段"},
      {label: "修改后重试", description: "根据反馈调整当前阶段"},
      {label: "终止", description: "停止当前工作流"}
    ],
    multiSelect: false
  }]
)
```

## 文学与语言标准

- **创意正文**：简体中文，高密度叙事，过程导向
- **结构标签**：英文（YAML Frontmatter、Section Headers）
- **Anti-AI-Flavor**：禁止"仿佛"、"宛如"等空洞比喻；避免感叹号堆砌；消灭"不禁"、"竟然"等廉价副词；用动作与感官细节替代情绪标签
- **内容导向**：强调运行机理（How it works）而非静态描述（What it is）

## 子代理委派模板（Weaver-Orch 专用）

当 Weaver-Orch 需要委派章节写作或审计任务时，使用 Agent 工具：

### 委派写作任务

```
Agent(
  subagent_type="general-purpose",
  description="Write Chapter N Scene M",
  prompt="你是 Prism-Weaver Engine 的章节作家子任务。
读取以下文件：
- shared/prompts/weaver.md
- novels/{project}/outline.md
- novels/{project}/story_bible.md
- workspace/{char_name}.md
- novels/{project}/chapters/Chapter_{N}/Scene_{M-1}.md（若存在）

写作 Chapter {N} Scene {M}，写入 novels/{project}/chapters/Chapter_{N}/Scene_{M}.md。
遵循 Scene Shards 协议，保持单场景写入。完成后停止。"
)
```

### 委派审计任务

```
Agent(
  subagent_type="general-purpose",
  description="Audit Chapter N",
  prompt="你是 Prism-Evaluate Engine 的审计子任务。
读取以下文件：
- shared/prompts/evaluate.md
- novels/{project}/Chapter_{N}.md
- novels/{project}/outline.md
- novels/{project}/story_bible.md

对 Chapter {N} 执行结构化审计，输出报告到 reports/audit_{project}_ch{N}.md。
报告须包含 PASS / CONDITIONAL / FAIL 判定。"
)
```

### 单会话回退模式

当用户未启用子代理或明确要求单会话时，Weaver-Orch 在当前会话内按顺序执行全部步骤，不使用 Agent 工具。

## Scene Shards 长文本协议

```
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

核心目标：降低单次写入负载、保持中断恢复能力、将章节返工局部化、为状态同步与审计提供稳定锚点。
