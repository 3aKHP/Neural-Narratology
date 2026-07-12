# Protocol v10.0: Tempered-Voice（淬炼之声）

> **FurryBar Engine 的 v10 主题更新：在"强基底"假设下重做协议语言层，将人格拓扑从"搭建灵魂的脚手架"收束为"给强模型划界与管理注意力"的约束框架**
> *The v10 theme update for FurryBar Engine: reworking the protocol's language layer under a "strong-substrate" assumption, tempering persona topology from soul-building scaffolding into a constraint framework that bounds a capable model and manages its attention*

## ⚡ 核心突破 (Core Breakthrough)

**v10.0 Tempered-Voice 不引入新理论。** 它延续 v9.0 的**人格拓扑**（不变轴 / 可变轴 / 边界条件），但重新理解这套理论的身份。

v5.0 至 v9.0 的所有版本都默认同一个**孱弱基底**：模型不会自维护心理连贯、不会自发推理，因此协议要用大量脚手架去"搭"出一个灵魂——显式状态机、手搓 HUD、手搓隐藏思维链。新一代 LLM 把这个假设翻转了：模型自带强世界建模、心智推理与指令遵循能力。于是设计问题从"**如何把灵魂搭进一个笨模型**"变为"**如何约束一个已经什么都能演的强模型、给它划界、管理它的注意力**"。

State-Space 本就朝这个方向生长——拓扑三件套（不变 / 可变 / 边界）本质就是"约束"与"划界"。v10.0 让这个真实身份浮出水面：State-Space 一直更像一套**约束理论**，只是在 v9.0 里裹着"搭灵魂"的重型脚手架。Tempered-Voice 卸下不再需要的脚手架，把嗓音（文风真实性）淬炼出来。

## 🧠 核心特性 (Core Features)

### 1. 脚手架的重量应匹配基底的能力（统一律）
v10.0 的统一原则，解释了协议内部的分层策略：

| 层 | 基底 | 脚手架策略 |
|:---|:---|:---|
| **创作层**（Step 0/1/2） | 可控的强模型 | **卸载脚手架**——措辞现代化、去哄骗，让模型隐式承担连贯性 |
| **消费层**（Step 3 Runtime） | FurryBar 用户自选、最坏为无推理弱模型 | **保留脚手架**——HUD / 隐藏思维链是弱模型自我维持状态的刚需 |

### 2. 语言层现代化（创作层）
去除孱弱基底时代的"哄骗"痕迹：删身份神化宣言与对比句式，高压全大写命令降级为冷静祈使，跨文件重复的约束提取到内核声明一次。**保结构、只改措辞**——所有 Phase 机制、schema 与约束条目数保持不变。

### 3. HUD 抗机器化（消费层）
针对长会话中每轮维护的状态栏"机器化"退化，新增字段语域规范：`[Physical]` 写身体感受而非解剖术语，`[Psychology]` 写状态而非链式推理，并在 HUD 与散文正文之间立起语域"防火墙"，防止仪表盘语言渗入正文。

### 4. L-System 最小解耦
保留 L1–L5 强度阶梯与 R-15 / R-18 分级门控，仅拆除"缺省内容领域"的硬编码——具体内容领域改为**从角色拓扑推导；无法推导则标记 gap**，而非回落到任何预设默认。这修复了 v9.0 的一处内部矛盾（内核一边要求"从角色推导"、一边硬塞全局默认值），使协议与状态空间的推导原则自洽。

### 5. 反 AI 味（Anti-AI-Flavor）升格
"AI 味"是 v5→v9 一路反馈的最大痛点。旧版公理防的是"出戏 / 助手腔"（已非主要问题），而真正的痛点是强模型认真扮演时露出的**文学层 AI 味**。v10.0 将其从散落的公理提升为一等议题（独立模块，单独规划）；本协议中相关公理暂**占位保留**，待独立模块落地后迁入并引用。

## 🔧 模块详解 (Module Breakdown)

v10.0 延续 **Kernel → Driver → Stdlib** 范式与 v9.0 的七步结构，逐篇重做语言层。

### 0. 内核层
- **[`Step0 - Kernel`](./en-US/Step0%20-%20Kernel.md)**：系统身份、全局协议、认知公理（含状态空间一致性）、人格状态空间原则、模式切换、初始化序列。

### 1. 构造层 (Module A: Character)
- **[`Step1A - MainDriver`](./en-US/Step1A%20-%20MainDriver.md)**：角色构建驱动（4-Phase：Blueprint → Shell → Neuro-Structure → Handover）。
- **[`Step1B - MainStdlib`](./en-US/Step1B%20-%20MainStdlib.md)**：角色卡 Schema（含 Persona Topology 三子节）。
- **[`Step1C - TransformDriver`](./en-US/Step1C%20-%20TransformDriver.md)**：仿射变换子代理（All-Ages → L3+ DLC 推导，4-Phase 工作流）。

### 2. 导演层 (Module B: Scenario)
- **[`Step2A - StoryDriver`](./en-US/Step2A%20-%20StoryDriver.md)**：场景导演驱动（含节拍图构建）。
- **[`Step2B - StoryStdlib`](./en-US/Step2B%20-%20StoryStdlib.md)**：场景卡 Schema（`beat_map` 结构）。

### 3. 运行层 (Runtime)
- **[`Step3 - Runtime`](./en-US/Step3%20-%20Runtime.md)**：拓扑感知运行时（11 条叙事公理、State Navigator、三段式输出、HUD 抗机器化规范、边界与节拍特殊协议）。

## 🆚 版本对比 (Version Comparison)

| 维度 | v8.0 Compact-State | v9.0 State-Space | v10.0 Tempered-Voice |
|:---|:---|:---|:---|
| **设计哲学** | 紧凑态认知 | 人格拓扑导航 | **强基底下的约束与嗓音淬炼** |
| **基底假设** | 孱弱模型 | 孱弱模型 | **强模型（创作层）/ 弱模型（消费层）分治** |
| **理论关系** | — | 提出人格拓扑 | **延续拓扑，无新理论** |
| **脚手架策略** | 一律搭建 | 一律搭建 | **重量匹配基底能力** |
| **反 AI 味** | 独立公理 | 独立公理 | **升格为一等模块（规划中）** |
| **L3+ 内容领域** | 手动发明 | Extract 阶段推导 | **推导；无法推导则标记 gap（拆除硬编码缺省）** |

## ⚙️ 执行流水线 (Execution Pipeline)

v10.0 保持 v9.0 的流水线结构：

**标准流程（原生 L3+ 素材）：** Step 0 → Step 1A/1B → Step 2A/2B → Step 3
**扩展流程（All-Ages 素材）：** Step 1C（Extract）→ 合并素材包 → Step 0 → Step 1A/1B → Step 2A/2B → Step 3

### 双重职责与评估基准

Phase II 协议首先是**协议层**，有两重职责，须同时兼顾：

1. **古法（首要）**：可手动复制进最基础的网页端 LLM 做原始角色卡开发——无 harness、无校验器、无程序化状态。
2. **引擎标准（后加）**：作为 Phase III ETL 引擎的协议上游。

**Step 分野**：Step 0/1/2 属**创作过程**；**Step 3 属消费过程**——其产物填入 FurryBar「回复格式」栏，由平台拼进系统提示词，运行在用户自选的消费模型上。因此输出格式首先按"无状态 LLM 能否自我维持状态连贯 + 人类可读"评估，工程层校验依赖是下游。

## 📚 理论基础 (Theoretical Foundation)

### 淬炼，而非重建

v6–v7 的语义是"构造 / 编织 / 模拟"——那属于弱基底时代，需要用结构硬凑一个心智。v10.0 的语义是"**约束 / 划界 / 淬炼**"：模型已然有心智，协议的职责转为给它立边界、管注意力、去除它自发产生的 AI 味，让角色的真实嗓音浮现。

"Tempered"（淬炼 / 回火）一词同时承载两义：**约束**（对过度泛化的强模型施加边界）与**文风**（把嗓音打磨到去除机器痕迹）。这正是 v10.0 的双重工作面。

### 强基底不否定拓扑

表征选择与模型强弱正交。人格拓扑回答的是"角色该被表示成什么"，不是"模型多强"。表征越好，越强的模型越能用好它——强模型沿可变轴导航只会更准，而非更不需要它。因此新一代 LLM 环境不是淘汰 State-Space，而是让它作为**约束理论**的真实价值浮现。

---

*Return to [Parent Directory](../README.md)*
