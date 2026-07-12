# Platforms — 伪有状态消费前端编译层

> Core Profile → 各无状态消费前端格式的映射与编译

## 定位

本目录只覆盖**无状态消费前端**——这些前端每轮只是独立的 API 请求,必须把 Prism 的动态叙事机制"编译"为前端可承载的形式。

## 为什么分类从 B 类起(没有 A 类)

早期设计曾有一条 **A 类:有状态原生路径**——把 Prism Runtime 直接寄生在 Claude Code / Codex CLI 等通用 Coding Agent 上运行。该路径已废弃:它想解决的「有状态宿主」问题,如今由独立姊妹项目 **[Prism Vesicle](https://github.com/3aKHP/prism-vesicle)** 用「干净的专用宿主」方式更彻底地解决——与通用 Coding Agent 解耦,降低门槛,同时根治宿主自带提示词的污染。

需要厘清两个层面:

- **Vesicle(姊妹项目)**:承担角色卡的**生产**与**创作端试运行**。它自带的「消费环境」只是面向创作者的 Runtime 模拟器,不是终端消费形态。
- **本目录(B / C 类)**:覆盖角色卡最终被**消费**的多形态无状态前端。

B、C 编号保留自原 A/B/C 三轨体系,作为设计血缘的记录;A 轨已整体让位于 Vesicle。

## 平台分类

### B 类:伪有状态 — Decorator 编译路径

前端实现了一套声明式状态机(CCv3 Lorebook Decorators)。Prism 的动态叙事机制编译为 Decorator 触发规则。

| 平台 | 宿主环境 | 卡格式 | Lorebook 能力 | 特有问题 |
|:---|:---|:---|:---|:---|
| **SillyTavern** | Web (Node.js) | CCv3 JSON/PNG/CHARX | Decorators 完整 spec(含时序控制) | 编译复杂度、中文社区实践 |

### C 类:伪有状态 — 思维链自维护路径 ⭐

前端没有状态管理能力(无 CCv3 Decorators、无文件系统),但接入的 **LLM 暴露思维链**(`<think>` 标签或等价机制)。HUD 和状态追踪由模型在思维链中**自行维护**——每轮生成状态快照,下一轮从对话历史中读取上一轮的状态作为基线。

| 平台 | 宿主环境 | 思维链机制 | 状态闭环 |
|:---|:---|:---|:---|
| **RikkaHub** | Android 原生 | DeepSeek V4 `<think>` / Claude thinking / Gemini thoughts | 模型自管理(思维链 → 对话历史 → 下一轮模型读取) |

**原理**:分析模式的 `<think>` 块本质上是一个每轮自刷新的 HUD 载体。指令要求模型在思维链开头固定输出状态摘要(Tension、Beat、Config、Boundary),下一轮模型读取对话历史时看到上一轮的 `<think>`,自然获得基线状态——形成不需要前端参与的自维护闭环。

**参照基准(创作端,Vesicle Runtime)**:

| | Vesicle Runtime(创作端文件 HUD) | RikkaHub(消费端思维链 HUD) |
|:---|:---|:---|
| 状态载体 | 文件系统(`hud.md` + 检查点) | `<think>` 块内状态摘要 |
| 更新方式 | 宿主工具确定性写入 | 模型生成(概率性,有格式偏差风险) |
| 可靠性 | 100% | ~80-90%(可通过 roll 修正) |
| 跨会话 | 持久化会话 + 文件 | 不支持(新会话 = 新对话历史) |
| 模型要求 | 任意已配置供应商 | 任何暴露思维链的推理模型 |
| 角色 | 创作端试卡模拟器(非终端消费) | 终端消费环境 |

### B vs C 类细分:两种前端的状态策略

| 能力 | SillyTavern (B 类: Decorator) | RikkaHub (C 类: 思维链) |
|:---|:---|:---|
| 状态管理 | 前端实现(Decorator 声明式规则) | 模型自行维护(思维链自刷新) |
| 时序控制 | `@@activate_only_after N` | 模型从上一轮思维链读取状态后自行判断 |
| 状态保持 | `@@keep_activate_after_match` | 自动——思维链始终在对话历史中 |
| HUD 格式 | 通过 Lorebook `constant` + `@@depth 1` 伪实现 | 通过分析模式指令中的固定格式要求 |
| 可靠性 | 取决于前端 Decorator 实现完整性 | 取决于模型遵循指令的稳定性 |
| 可移植性 | 低——依赖特定前端 | 高——只需模型有思维暴露 |

## 适配深度等级

每个前端的适配文档应覆盖以下层级(逐层递进):

1. **静态映射**:Core Profile 字段 → 前端卡格式字段的直接对应
2. **Prompt 组装**:前端如何将卡片的各部分组装成发送给 LLM 的最终 prompt
3. **动态叙事**:Prism 的 Beat Map / State Navigator / HUD 如何在前端上实现(或近似实现)
4. **多角色/长篇**:Prism 的 Dyad / Weaver-Orch 逻辑在前端上的等价物

## 各前端适配文档

- [SillyTavern](./SillyTavern/README.md) — B 类,CCv3 Decorator 编译路径
- [RikkaHub](./RikkaHub/README.md) — C 类,思维链自维护路径

## 相关文档

- [Phase IV 总览](../README.md)
- [Core Profile 设计](../Core-Profile/README.md)
- [Prism Vesicle(姊妹项目)](https://github.com/3aKHP/prism-vesicle)
- 多平台调研报告(内部文档,不随仓库分发)
