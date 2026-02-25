# Phase III: Modulation (调制)

> **基于 VSCode + RooCode 的自动化角色铸造流水线**
> *IDE-Native Automated Character Foundry based on VSCode & RooCode*

## 🌔 项目概述 (Overview)

**Phase III: Modulation** 是 "Neural Narratology" 计划的工程化终章。

面对 Phase II 协议的复杂度，手工编写 XML 已不再现实。本项目引入了 **Prism Engine 三位一体架构** —— 一套运行在 VSCode 环境中的虚拟智能体系统。它利用 RooCode 插件的能力，将 LLM 从"聊天机器人"重塑为"文件系统操作员"，实现了从原始素材到最终资产的 **Zero-Copy** 自动化生产。

### 核心突破

- **三引擎架构**：ETL（构建）、Runtime（模拟）、Evaluate（审计）形成完整闭环
- **v7.0 Neuro-Weave 实现**：将 Phase II 的理论框架转化为可执行的工程工具
- **跨模型兼容**：针对 Claude/Deepseek/Gemini 的特性优化
- **RooCode 原生集成**：通过自定义模式实现无缝工作流

## 🏗️ 架构设计 (Architecture)

```mermaid
graph TB
    A[原始素材<br/>Source Materials] --> B[Prism-ETL Engine<br/>构建引擎]
    B --> C[Module A<br/>Neuro-Card XML]
    B --> D[Module B<br/>Tension Scenario MD]
    C --> E[Prism-Runtime Engine<br/>模拟引擎]
    C --> W[Prism-Weaver Engine<br/>小说编织引擎]
    D --> E
    D --> W
    C --> Y[Prism-Dyad Engine<br/>双轨衍生引擎]
    D --> Y
    E --> F[Session Log<br/>交互日志]
    Y --> F
    F --> G[Prism-Evaluate Engine<br/>审计引擎]
    G --> H[Neuro-Integrity Report<br/>质量报告]
    H -.反馈优化.-> B
    W --> N[Long-form Novel<br/>长篇小说]
    
    style B fill:#e1f5ff
    style E fill:#ffe1f5
    style W fill:#e1ffe1
    style Y fill:#f5e1ff
    style G fill:#fff4e1
```

### 五大引擎职责

| 引擎 | 模式 | 职责 | 输入 | 输出 |
|:---|:---|:---|:---|:---|
| **ETL Engine** | `prism-etl` | 构建角色与场景 | 原始素材 | Module A (XML) + Module B (MD) |
| **Runtime Engine** | `prism-runtime` | 执行角色单向模拟 | Module A + Module B | Session Log (MD) |
| **Evaluate Engine** | `prism-evaluate` | 质量审计 | Source + XML + Log | Neuro-Integrity Report (MD) |
| **Weaver Engine** | `prism-weaver` | 扩写生成长篇小说 | Module A + Module B | Long-form Novel (MD) |
| **Dyad Engine** | `prism-dyad` | 双角色自动博弈生成数据 | Module A + Module B | Session Log (MD) |

## 📦 目录结构 (Directory Structure)

### 核心工程目录

本项目包含多个针对不同模型优化的实现：

- **[`Prism-Engine-Universe-V7.0/`](./Prism-Engine-Universe-V7.0/)**: **通用版本**（推荐）
  - 基于 v7.0 Neuro-Weave 理论
  - 包含完整的五引擎系统提示词（ETL/Runtime/Evaluate/Weaver/Dyad）
  - 跨模型兼容设计
  
- **[`Prism-ETL-Claude/`](./Prism-ETL-Claude/)**: Claude 优化版本（当前为 ETL 专项）
- **[`Prism-ETL-Deepseek/`](./Prism-ETL-Deepseek/)**: Deepseek 优化版本（当前为 ETL 专项）
- **[`Prism-ETL-Gemini/`](./Prism-ETL-Gemini/)**: Gemini 优化版本（当前为 ETL 专项）

### 版本能力矩阵

| 版本目录 | 协议代际侧重 | 已提供 .roo 引擎 |
|:---|:---|:---|
| `Prism-Engine-Universe-V7.0` | v7.0 Neuro-Weave | `etl` + `runtime` + `evaluate` + `weaver` + `dyad` |
| `Prism-ETL-Claude` | v6.x Holographic / ETL 专项 | `etl` |
| `Prism-ETL-Deepseek` | v6.x Holographic / ETL 专项 | `etl` |
| `Prism-ETL-Gemini` | v6.x Holographic / ETL 专项 | `etl` |

### 协议代际路线图 (Roadmap)

- **当前状态**：
  - `Prism-Engine-Universe-V7.0` 为 v7.0 完整实现（五引擎）。
  - `Prism-ETL-Claude` / `Prism-ETL-Deepseek` / `Prism-ETL-Gemini` 为 v6.x 语义的 ETL 专项分支。
- **升级目标**：
  1. 先将三模型分支的 `specs/` 与 `templates/` 对齐至 v7.0 Neuro-Card / Tension Scenario 结构。
  2. 再补齐 `runtime` 与 `evaluate` 引擎提示词，形成可测试闭环。
  3. 最后扩展 `weaver` 与 `dyad`，完成与 Universe 分支的能力并轨。
- **发布原则**：
  - 以“文档、模板、提示词三者一致”为准，未达一致前不标注为 v7 完整分支。

### 标准工程结构

以下为 **Universe 完整版** 的标准工程结构（其余模型目录当前为 ETL 精简形态）：

```
Prism-Engine-[Version]/
├── .roo/                           # 系统级提示词
│   ├── system-prompt-prism-etl     # ETL 引擎核心
│   ├── system-prompt-prism-runtime # Runtime 引擎核心
│   ├── system-prompt-prism-evaluate# Evaluate 引擎核心
│   ├── system-prompt-prism-weaver  # Weaver 小说引擎核心
│   └── system-prompt-prism-dyad    # Dyad 自动对弈引擎核心
├── specs/                          # Schema 定义
│   ├── schema_character.md         # Module A 规范
│   └── schema_scenario.md          # Module B 规范
├── templates/                      # 样板代码
│   ├── tpl_module_a.xml            # 角色模板
│   └── tpl_module_b.md             # 场景模板
├── source_materials/               # 原始素材目录
├── workspace/                      # 工作区（生成的 XML/MD）
├── test_runs/                      # 模拟日志目录
└── reports/                        # 评估报告目录
```

Claude/Deepseek/Gemini 目录当前最小结构为：

```
Prism-ETL-[Model]/
├── .roo/
│   └── system-prompt-prism-etl
├── specs/
├── templates/
├── source_materials/
└── workspace/
```

### 配置文件

- **[`prism-etl_preset.yaml`](./prism-etl_preset.yaml)**: ETL 引擎模式配置
- **[`prism-runtime_preset.yaml`](./prism-runtime_preset.yaml)**: Runtime 引擎模式配置
- **[`prism-evaluate_preset.yaml`](./prism-evaluate_preset.yaml)**: Evaluate 引擎模式配置
- **[`prism-weaver_preset.yaml`](./prism-weaver_preset.yaml)**: Weaver 引擎模式配置
- **[`prism-dyad_preset.yaml`](./prism-dyad_preset.yaml)**: Dyad 引擎模式配置

## 🛠️ 安装与配置 (Setup)

### 前置要求

- [VSCode](https://code.visualstudio.com/)
- [RooCode Extension](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline) (原 Cline)
- LLM API-Key（推荐使用与选定版本匹配的模型）

### 引导流程 (The MBR Boot Sequence)

为了让 RooCode 正确识别 Prism 引擎，需要注入自定义模式：

1. **加载配置文件**:
   - 打开 RooCode 设置 → `Custom Modes`
   - 将以下所有的配置文件内容追加到配置中：
     - [`prism-etl_preset.yaml`](./prism-etl_preset.yaml:1)
     - [`prism-runtime_preset.yaml`](./prism-runtime_preset.yaml:1)
     - [`prism-evaluate_preset.yaml`](./prism-evaluate_preset.yaml:1)
     - [`prism-weaver_preset.yaml`](./prism-weaver_preset.yaml:1)
     - [`prism-dyad_preset.yaml`](./prism-dyad_preset.yaml:1)
   - *或者*：在 RooCode 聊天框中批量上传文件并指示："Load these custom mode configurations."

2. **选择工作目录**:
   - 在 VSCode 中打开 [`Prism-Engine-Universe-V7.0/`](./Prism-Engine-Universe-V7.0/) 作为工作区根目录
   - 确保 RooCode 能够访问 [`.roo/`](./Prism-Engine-Universe-V7.0/.roo/) 目录

3. **验证安装**:
   - 在 RooCode 模式切换器中应该能看到以下新模式：
     - **Prism ETL Engine**
     - **Prism Runtime Engine**
     - **Prism Evaluation Unit**
     - **Prism Weaver Engine**
     - **Prism Dyad Engine**

## 🚀 完整工作流 (Complete Workflow)

### Phase 1: 构建角色与场景（ETL Engine）

**切换模式**: `Prism ETL Engine`

#### 1.1 准备素材
将角色的原始设定（文本、PDF 或图片）放入 [`source_materials/`](./Prism-Engine-Universe-V7.0/source_materials/) 目录。

#### 1.2 构建角色（Workflow A）
在 RooCode 中输入指令：
```
Initialize Workflow A for [Character Name]. Source material is in source_materials.
```

引擎将自动执行 4-Phase 工作流：
1. **Phase 0: Blueprint** - 分析素材并给出设计蓝图
2. **Phase 1: Visual Shell** - 生成 [`<shell>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:12)（基础信息 + 视觉皮层）
3. **Phase 2: Neuro-Structure** - 注入 [`<neuro_structure>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:26)（历史 + 认知栈 + 本能协议）
4. **Phase 3: Narrative Engine** - 补全 [`<narrative_engine>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:44)（感知矩阵 + 对话变化）

*注意：每一步引擎都会暂停（STOP & WAIT），等待你的确认或修改意见。*

#### 1.3 生成场景（Workflow B）
角色生成完毕后，输入指令：
```
Initialize Workflow B. I want a [L3-B] scenario where I play as [Rival].
```

引擎将：
1. 读取刚才生成的 XML
2. 分析 [`<instinct_protocol>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:37) 和 L-System 需求
3. 提供 3 个剧情钩子供选择
4. 生成完整的 Tension Scenario（参考 [`schema_scenario.md`](./Prism-Engine-Universe-V7.0/specs/schema_scenario.md:1)）

**输出位置**: [`workspace/`](./Prism-Engine-Universe-V7.0/workspace/)

---

### Phase 2: 执行角色模拟（Runtime Engine）

**切换模式**: `Prism Runtime Engine`

#### 2.1 启动会话
输入指令：
```
Start Session: [char_name].xml + [scenario_name].md
```

引擎将：
1. 读取 Module A（Neuro-Card）和 Module B（Scenario）
2. 创建 [`test_runs/[char]_log.md`](./Prism-Engine-Universe-V7.0/test_runs/)
3. 写入场景引入和开场白
4. 追加用户输入占位符（Turn 1）

#### 2.2 交互循环
引擎执行 **File-Based Game Loop**：
1. **READ & SYNC**: 读取 session log，分析最后一条记录
2. **GENERATE & WRITE**: 执行 Neuro-CoT 分析，生成角色回复
3. **PREPARE & WAIT**: 追加用户输入占位符，使用 `ask_followup_question` 暂停

每轮输出包含三部分：
- **Neuro-CoT**（隐藏思维链）：感知解码 → 本能检查 → 表达合成
- **Dynamic HUD**（状态面板）：时间/位置、感官/身体、神经状态、印象
- **Main Content**（故事正文）：200-800 字高密度中文叙事

**输出位置**: [`test_runs/`](./Prism-Engine-Universe-V7.0/test_runs/)

---

### Phase 3: 质量审计（Evaluate Engine）

**切换模式**: `Prism Evaluation Unit`

#### 3.1 启动评估
输入指令：
```
Evaluate session: [char_name]_log.md
```

引擎将：
1. 读取三个数据源：
   - Ground Truth: [`source_materials/`](./Prism-Engine-Universe-V7.0/source_materials/)（原始素材）
   - Blueprint: [`workspace/*.xml`](./Prism-Engine-Universe-V7.0/workspace/)（角色定义）
   - Reality: [`test_runs/*.md`](./Prism-Engine-Universe-V7.0/test_runs/)（实际行为）
2. 基于 4 个维度分析：
   - **Voice Fidelity**（声纹一致性）：对话是否匹配 [`<dialogue_variance>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:51)
   - **Neuro-Logic**（逻辑自洽性）：行为是否遵循 [`<cognitive_stack>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:33)
   - **L-System Adherence**（张力曲线）：场景是否符合 L-Level 定义
   - **Hallucination Check**（幻觉检测）：是否捏造事实或 OOC
3. 生成结构化报告

**输出位置**: [`reports/`](./Prism-Engine-Universe-V7.0/reports/)

---

### Phase 4: 衍生输出（Weaver Engine & Dyad Engine）

除了常规的游玩（Runtime），您还可以将角色和场景用于更高级的衍生内容生成。

#### 衍生 A：生成长篇小说 (Weaver Engine)
**切换模式**: `Prism Weaver Engine`

输入指令：`Generate a novel based on [char_name].xml and [scenario_name].md`

引擎将：
1. 询问使用 **[Mode A] Auto-Pilot**（自动连载）还是 **[Mode B] Co-Pilot**（分幕确认）模式。
2. 生成包含大纲的 `outline.md`。
3. 执行 **分块写入循环 (Chunked Writing Loop)**，在防止大模型崩溃（Token 超载）的前提下，通过 `Scene` 为单位的累加，在 `/novels/` 目录下为您完成整篇小说的创作。

#### 衍生 B：全自动生成训练/评估日志 (Dyad Engine)
**切换模式**: `Prism Dyad Engine`

当您不想亲自作为 User 打字，又需要生成大量日志用于测试或基准数据收集时：
输入指令：`Simulate a dyad session for [char_name].xml and [scenario_name].md`

引擎将：
1. **一人分饰两角 (Dual-Acting)**，同时扮演主动推进剧情的 User 和遵循 XML 逻辑的 Character。
2. 支持 Auto-Pilot 批量生成或 Co-Pilot 逐轮审计。
3. 严格遵循 `<action_guide>` 的叙事阶段推进剧本张力。

---

## 📊 v7.0 Neuro-Weave 特性

本工具链完整实现了 [Phase II v7.0](../02_Resonance/v7_Neuro_Weave/) 的核心理念：

### Bio-XML 协议
- XML 标签作为"功能器官"而非文本容器
- 强制"过程导向"描述（如何运作 vs. 是什么）
- 参考：[`system-prompt-prism-etl`](./Prism-Engine-Universe-V7.0/.roo/system-prompt-prism-etl:9)

### 三大认知公理
1. **感知滤镜**：通过 [`<perception_matrix>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:47) 定义角色如何过滤现实
2. **情感液压**：通过 [`<stress_response>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:39) 定义压力点和释放阀
3. **攻略性**：通过 [`<romance_mechanics>`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:40) 定义连接路径

### L-System 本能协议
- L1-L2（社交/浪漫）：情感共鸣、张力构建
- L3-L4（亲密/癖好）：感官沉浸、欲望释放
- 参考：[`schema_scenario.md`](./Prism-Engine-Universe-V7.0/specs/schema_scenario.md:93)

## ⚠️ 稳定性说明 (Stability)

### 当前状态
- **版本**: v7.0 Beta
- **状态**: 功能完整，持续优化中

### 已知限制
1. **MBR 机制依赖**：如果 Agent 出现"幻觉"或变回通用模式，请：
   - 重启 VSCode
   - 重新选择自定义模式
   - 确认 [`.roo/`](./Prism-Engine-Universe-V7.0/.roo/) 目录可访问

2. **模型兼容性**：
   - **推荐**: Claude Sonnet 3.5+, Deepseek V3, Gemini 2.0+
   - **不推荐**: GPT-4（缺乏对 RooCode 工具链的原生支持）

3. **文件系统操作**：
   - Runtime Engine 依赖文件读写，确保工作区有写入权限
   - Session Log 可能较大（>100KB），注意上下文窗口限制

### 故障排除
- **问题**: Agent 不读取 `.roo/` 提示词
  - **解决**: 在聊天中明确指示："ALWAYS check for `.roo/system-prompt-prism-[mode]`"
  
- **问题**: 生成的 XML 格式错误
  - **解决**: 检查 [`templates/tpl_module_a.xml`](./Prism-Engine-Universe-V7.0/templates/tpl_module_a.xml:1) 是否完整

- **问题**: Runtime Engine 无限循环
  - **解决**: 检查 session log 最后一行是否为占位符，手动编辑后点击"确认/继续"

## 🔗 相关资源 (Related Resources)

- **Phase II: Resonance** - 理论基础与协议定义 → [查看](../02_Resonance/)
  - [v7.0 Neuro-Weave](../02_Resonance/v7_Neuro_Weave/) - 本工具链的理论来源
- **研究报告** - 设计哲学与实验数据 → [Markdown](./“调制”项目研究报告-Repo-Git.md)

## 📚 进阶阅读 (Advanced Topics)

### 自定义 Schema
如需修改角色或场景结构，编辑：
- [`specs/schema_character.md`](./Prism-Engine-Universe-V7.0/specs/schema_character.md:1)
- [`specs/schema_scenario.md`](./Prism-Engine-Universe-V7.0/specs/schema_scenario.md:1)

### 扩展 L-System
当前支持 L1-L5，如需添加新层级：
1. 更新 [`schema_scenario.md`](./Prism-Engine-Universe-V7.0/specs/schema_scenario.md:93) 的 L-System 定义
2. 修改 [`system-prompt-prism-etl`](./Prism-Engine-Universe-V7.0/.roo/system-prompt-prism-etl:1) 的 Workflow B 逻辑

### 多语言支持
当前所有创意内容强制使用简体中文，如需其他语言：
1. 修改 [`.roo/system-prompt-prism-etl`](./Prism-Engine-Universe-V7.0/.roo/system-prompt-prism-etl:32) 的 Language Lock
2. 更新 [`templates/`](./Prism-Engine-Universe-V7.0/templates/) 中的示例内容

---
*Return to [Root Repository](../README.md)*

