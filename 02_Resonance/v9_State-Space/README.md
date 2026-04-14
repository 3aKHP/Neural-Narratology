# Protocol v9.0: State-Space（人格状态空间引擎）

> **FurryBar Engine 的 v9 主题更新：以人格拓扑建模替代人格快照，引入仿射变换子代理实现 All-Ages 素材至 L3+ 域的高置信度推导**
> *The v9 theme update for FurryBar Engine: replacing persona snapshots with topology modeling, and introducing an Affine Transform Agent for high-confidence All-Ages-to-L3+ derivation*

## ⚡ 核心突破 (Core Breakthrough)

**v9.0 State-Space** 标志着从"**人格快照**"到"**人格拓扑**"的范式转变。

v5.0 至 v8.0 的所有版本都将角色卡视为一份固定描述——角色在会话开始时是什么样子，就是什么样子。v9.0 重新定义了角色卡的本质：它不是一张快照，而是一张**有界状态空间的地图**——描述角色在叙事张力的全范围内*可以是什么样子*，以及在这个空间中移动的规则。

这一重新定义解决了一个长期存在的工程问题：**当原始素材属于全年龄（All-Ages）内容时，如何在不凭空捏造的前提下推导出 L3+ 场景下的角色行为？**

v9.0 的回答是：在"原始素材足以建构起一个基本结构完善的人格"的前提下，该人格在高张力场景中的表现属于**可演算的有限状态空间**。从 All-Ages 到 L3+ 的过程可以被视为一种广义的**仿射变换**——结构关系保持不变，变化的是各特征在张力梯度下的量级与表达模式。

基于此，v9.0 在 ETL 的 **Extract 阶段**引入了专用的 **仿射变换子代理（Step 1C）**，将这一推导过程工程化：子代理读取 All-Ages 原始文本，产出 L3+ DLC 文档（叙事散文 + 对话样本 + 场景片段），DLC 与原始文本**等权重合并**后送入角色构建流程。每一个 DLC 元素都必须内联标注其在原始文本中的来源依据，推导与捏造之间的边界由**内联推导注释**强制审计。

## 🧠 核心特性 (Core Features)

### 1. 人格状态空间（Persona State Space）
角色不再由单一配置定义，而是由一套**拓扑结构**定义：
- **不变轴（Invariant Axes）**：在所有 L 级别下保持不变的特征——核心身份、原始创伤、基本感知风格、不可逾越的边界
- **可变轴（Variant Axes）**：在张力下可预测地发生变化的特征——防御机制、欲望表达模式、语言寄存器、身体阈值、情感披露率
- **边界条件（Boundary Conditions）**：各可变轴的外部极限——无论张力多高角色都不会做的事，以及只在特定 L 级别下才可进入的区域

### 2. 仿射变换子代理（Affine Transform Agent）
专用 ETL Extract 子流水线（Step 1C），工作在角色卡构建之前。输入 All-Ages 原始文本，输出 L3+ DLC 文档——以叙事散文、对话样本和场景片段的形式呈现，与原始文本等权重合并后共同送入角色构建器。每个 DLC 元素内联标注来源依据，确保推导可审计、不捏造。

### 3. 拓扑感知运行时（Topology-Aware Runtime）
运行时获得**状态导航器**：每轮追踪角色在状态空间中的当前位置（张力级别、活跃可变配置、与边界条件的距离），并以此调节叙事节奏。v8.0 的橡皮筋公理被显式的状态空间导航规则所替代。

### 4. 叙事节拍协议（Narrative Beat Protocol）
场景导演（Step 2A）获得**节拍图（Beat Map）**：一个轻量的叙事阶段序列，定义场景预期经历的结构弧。运行时追踪节拍进度，防止停滞与过早升级。v8.0 的可选行动导引注释块被替换为结构化的、运行时可读的产物。

### 5. 紧凑态继承（Compact-State Inheritance）
v9.0 完整继承 v8.0 的紧凑态原则：YAML 负责硬状态，Markdown 负责软认知，结构极简主义，过程重于标签。新增的拓扑字段是**加法性的**——扩展 Schema 而不膨胀它。

## 🔧 模块详解 (Module Breakdown)

v9.0 延续 **Kernel → Driver → Stdlib** 范式，在构造层新增 Step 1C，并对导演层与运行层进行拓扑感知升级。

### 0. 内核层
- **[`Step0 - Kernel.md`](./en-US/Step0%20-%20Kernel.md)**: **FurryBar Engine v9.0 State-Space 内核**
  - 系统身份、全局协议、认知公理（新增第四公理：状态空间一致性）
  - 人格状态空间原则、模式切换、初始化序列

### 1. 构造层 (Module A: Character)
- **[`Step1A - MainDriver.md`](./en-US/Step1A%20-%20MainDriver.md)**: **角色构建驱动**
  - 4-Phase 工作流：Blueprint → Shell → Neuro-Structure → Handover
  - 新增 Phase 2 必填节：**Persona Topology**（不变轴 / 可变轴 / 边界条件）
  - 输出 Module A：含嵌入式人格拓扑的紧凑角色卡

- **[`Step1B - MainStdlib.md`](./en-US/Step1B%20-%20MainStdlib.md)**: **角色标准库模板**
  - 在 v8.0 Schema 基础上新增 `persona_topology` 块与 `topology_state` YAML 字段
  - 定义不变轴、可变轴、边界条件的最小约束

- **[`Step1C - TransformDriver.md`](./en-US/Step1C%20-%20TransformDriver.md)**: **仿射变换子代理驱动** *(v9.0 新增)*
  - 工作位置：ETL **Extract 阶段**，在角色卡构建之前
  - 输入：All-Ages 原始文本（故事、语料、对话样本等）
  - 输出：L3+ DLC 文档（叙事散文 + 对话样本 + 场景片段，与原始素材等权重）
  - 4-Phase 工作流：Source Analysis → Invariant Anchoring → Variant Traversal → DLC Composition
  - 强制推导注释：每个 DLC 元素必须内联标注其在原始素材中的来源依据

### 2. 导演层 (Module B: Scenario)
- **[`Step2A - StoryDriver.md`](./en-US/Step2A%20-%20StoryDriver.md)**: **场景导演驱动**
  - 新增 Phase 2：节拍图构建（Beat Map Construction）
  - 节拍图设计规则：最少三拍，张力非单调，终拍结构稳定

- **[`Step2B - StoryStdlib.md`](./en-US/Step2B%20-%20StoryStdlib.md)**: **场景标准库模板**
  - YAML 新增 `beat_map` 字段，替代 v8.0 的可选行动导引注释块
  - 定义节拍图字段规范与设计约束

### 3. 运行层 (Runtime)
- **[`Step3 - Runtime.md`](./en-US/Step3%20-%20Runtime.md)**: **FurryBar 拓扑感知运行时**
  - 新增第 11 叙事公理：拓扑一致性
  - 新增状态导航器：每轮追踪节拍进度、张力级别、可变配置、边界接近度
  - 新增特殊协议：张力微推（Tension Nudge）、边界接近协议、边界极限协议、节拍推进
  - HUD 新增 `Beat` 字段

## 🆚 版本对比 (Version Comparison)

| 维度 | v6.0 Omni-Foundry | v7.0 Neuro-Weave | v8.0 Compact-State | v9.0 State-Space |
|:---|:---|:---|:---|:---|
| **设计哲学** | 全息灵魂 | 认知模拟 | 紧凑态认知 | **人格拓扑导航** |
| **人格模型** | 静态 XML Schema | 认知公理 | 紧凑快照 | **状态空间拓扑** |
| **L3+ 素材来源** | 手动发明 | 手动发明 | 手动发明 | **Extract 阶段仿射变换推导** |
| **叙事节奏控制** | 状态机 | 公理约束 | 公理约束（橡皮筋） | **状态空间导航** |
| **场景结构** | Metadata + Intro | Metadata + Intro | Intro + 可选行动导引 | **Intro + 节拍图** |
| **数据格式** | XML | Bio-XML | YAML + Markdown | YAML + Markdown |
| **格式开销** | 很高 | 高 | 低 | 低（加法性扩展） |
| **新增模块** | — | — | — | **Step 1C（变换子代理）** |

## ⚙️ 执行流水线 (Execution Pipeline)

```
[All-Ages 原始文本]
    │
    ├─── (All-Ages 来源) ──►
    │   [Step 1C: 变换子代理]        ← ETL Extract 阶段
    │         │
    │         ▼
    │   [L3+ DLC 文档]
    │         │ (等权重合并)
    └─────────┘
    │
    ▼
[合并后原始素材包]
    │
    ▼
[Step 0: Kernel]
    │
    ├─────────────────────────────────────┐
    ▼                                     ▼
[Step 1A: 角色构建驱动]          [Step 2A: 场景导演驱动]
[Step 1B: 角色标准库]            [Step 2B: 场景标准库]
    │                                     │
    ▼                                     │
[Module A: 角色卡]                        │
    └─────────────────────────────────────┘
              │
              ▼
      [Step 3: Runtime]
```

**标准流程（原生 L3+ 素材）：** Step 0 → Step 1A/1B → Step 2A/2B → Step 3

**扩展流程（All-Ages 素材）：** **Step 1C**（Extract）→ 合并素材包 → Step 0 → Step 1A/1B → Step 2A/2B → Step 3

### 标准操作步骤

1. **（可选）变换扩展**：若素材为 All-Ages，先注入 Step 1C + 原始文本 → 生成 **L3+ DLC**，与原始文本等权重合并为素材包
2. **初始化**：加载 [`Step0 - Kernel.md`](./en-US/Step0%20-%20Kernel.md)
3. **构造角色**：注入 Step 1A + Step 1B + 素材包 → 生成 **Module A**
4. **生成场景**：注入 Step 2A + Step 2B + Module A → 生成 **Module B**
5. **运行交互**：加载 Step 3 + Module A + Module B → 开始角色扮演

## 📚 理论基础 (Theoretical Foundation)

### 人格即拓扑，而非快照

快照式人格回答的是：*这个角色是什么样的人？*
拓扑式人格回答的是：*这个角色可以是什么样的人的全部范围是什么，以及在这个范围内移动的规则是什么？*

拓扑模型建立在三个观察之上：

1. **张力下的不变性**：角色的核心身份——其根本创伤、主要感知风格、最深层价值观——不会随张力升高而改变。改变的是这个核心在压力下*如何表达自身*。

2. **可预测的可变性**：角色在张力下的变化方式不是任意的，而是从其已建立的心理结构中推导出来的。一个通过幽默压制欲望的角色，在足够的张力下，要么将幽默升级至崩溃点，要么彻底放弃它——而不会随机采用一种新的应对机制。

3. **可推导性**：由于可变性是可预测的，L3+ 行为配置可以从 All-Ages 素材中*推导*出来。这种推导不是捏造——它是从角色已建立的不变量和已知可变模式中进行的结构性推断。

### 仿射变换的类比

仿射变换在允许平移、缩放和旋转的同时，保留了点之间的结构关系。应用于人格：角色特征之间的*关系*（创伤如何连接到防御机制，欲望如何连接到语言寄存器）在各 L 级别之间保持不变。改变的是每个特征的*量级*和*表达模式*。

这就是变换子代理能够产出高置信度输出的原因：它不是在发明新的关系，而是在将现有关系延伸到状态空间的新区域。

---

*Return to [Parent Directory](../README.md)*
