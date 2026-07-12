# Core Profile — 平台无关角色描述规范

> **从 v9 State-Space 中提取的通用角色内核，不依赖任何特定消费平台**

## 定位

Core Profile 是 Prism 协议栈中的"最小稳定层"——它定义了一个角色的本质信息，与具体平台的 Prompt 注入格式、HUD 约定、状态管理机制解耦。

Phase II 和 Phase III 的所有协议版本（v5–v9）都隐式假设目标消费平台为 FurryBar。Core Profile 的目标是：
1. 识别并保留 v9 State-Space 中**平台无关**的部分（Persona Topology、Narrative Engine、Instinct Protocol 的核心语义）
2. 识别并剥离**平台特定**的部分（HUD 格式、L-System 工作层标签、FB 特有的 YAML 字段约束）
3. 定义从 Core Profile 到各平台格式的映射接口

## 设计原则

- **最小必要**：只包含角色人格的"不变量"——无论部署到哪个平台都不会改变的信息
- **格式无关**：不以 JSON/YAML/Markdown 任何一种格式为唯一标准，而是定义字段语义及其关系
- **可编译**：每个平台适配器都从同一份 Core Profile 出发，通过平台特定规则编译为目标格式
- **过程导向**：继承 v9 的"过程优于标签"原则——描述角色如何运作，而非贴标签

## 核心字段草案（待细化）

### 身份层 (Identity)
- `name`：角色名称
- `archetype`：原型分类（非标签式，而是描述性短语）
- `age_gender`：年龄与性别表达
- `appearance`：外观描述（纯文本散文，非结构化数据）

### 拓扑层 (Topology) — 继承自 v9 State-Space
- `invariant_axes`：不变轴。在所有张力级别下保持恒定的人格特征（核心身份、原始创伤、不可逾越边界）。最少 2 条
- `variant_axes`：可变轴。在张力下可预测地变化的特征（防御机制、欲望表达模式、语言寄存器、身体阈值）。最少 3 条，至少一条正向
- `boundary_conditions`：边界条件。每个可变轴的外部极限

### 认知层 (Cognition) — 继承自 v8 Compact-State
- `perception_filter`：角色如何过滤现实（感知透镜）
- `emotional_hydraulics`：压力积累与释放机制
- `cognitive_stack`：思维层级与决策优先级

### 叙事层 (Narrative)
- `voice_profile`：语言风格、语域范围、对话特征
- `desire_architecture`：核心欲望与应对机制
- `narrative_engine`：在不同叙事阶段的典型行为模式
- **`thinking_mode`**：角色偏好的推理风格。`immersion`（演员式——以角色第一人称思考）/ `analytical`（导演式——以分析视角规划）/ `auto`（由模型自行决定）。详见 [RikkaHub 适配文档](../Platforms/RikkaHub/README.md#24--rikkahub-的特有优势思维模式控制)

### 世界层 (World Context)
- `world_context`：角色所处的世界设定摘要
- `key_relationships`：与叙事相关的重要关系

## 与现有协议的关系

| 现有资产 | 关系 |
|:---|:---|
| v9 State-Space (Step 1A/1B) | Core Profile 的直接上游。拓扑层从 Step 1A 提取，认知层从 Step 1B 提取 |
| v8 Compact-State (Module A Schema) | 叙事层和世界层的参考来源 |
| Phase III schema_character.md | 字段命名和最小约束的对照参考 |
| Phase III schema_dlc.md | L3+ DLC 的拓扑一致性约束仍然适用 |

## 待完成

- [ ] 各层的精确字段定义（名称、类型、约束、示例）
- [ ] Core Profile → v9 Module A 的反向兼容验证
- [ ] Core Profile → CCv3 JSON 的字段映射表

## 相关文档

- [Phase IV 总览](../README.md)
- 多平台调研报告(内部文档,不随仓库分发)
- [v9 State-Space 协议](../../02_Resonance/v9_State-Space/)
