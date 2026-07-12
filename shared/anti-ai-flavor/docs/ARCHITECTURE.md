# 反 AI 味模块（Anti-AI-Flavor / Prose Craft）· 架构

## 0. 模块使命

消除 LLM 在**认真扮演 / 叙事时**露出的"文学层 AI 味"（slop）。

区别于 Resonance Protocol v9 及更早版本公理防的"出戏 / 助手腔"（"作为 AI"、"我不能"）——那是旧问题，已通过既有的沉浸类公理充分覆盖，不属于本模块范围。本模块针对的是**强模型仍会犯的精致文体病症**：套话短语、僵硬对比句式、写画面而非身体感受、叙述者代角色总结、档案袋式塞设定等——这些不是"出戏"，而是"入戏但写得像 AI"。

**受众（跨引擎 + 跨仓库）：**
- Neural-Narratology 侧：所有产出散文的引擎——Resonance Protocol 的 Runtime（Step 3）、Prism Engine 的 Weaver / Weaver-Orch、Transform Agent（DLC 也是叙事散文）。
- Prism Vesicle 侧：宿主代码层的"AI 味查杀"（后处理检测 / 改写）。

## 1. 两大作用面（顶层分层）

模块沿"作用在流水线的哪个位置"切成两层。外部参考天然落入其一。

```
┌─────────────────────────────────────────────────────────────┐
│  A. 前置指导层 (Guidance / pre-generation)                     │
│     形态: 喂给 LLM 的自然语言文体规则                            │
│     去向: 注入 system prompt / 协议文本 (古法网页端可直接读)      │
│     消费者: Runtime / Weaver / Transform 等引擎提示词            │
│     现成参照: 内部写作纪要、the-antislop 模式表、Horoscope       │
│              Test 启发式                                        │
├─────────────────────────────────────────────────────────────┤
│  B. 后处理查杀层 (Detection / post-generation)                 │
│     形态: 确定性规则/数据 (正则、短语表、指纹检测)                 │
│     去向: 宿主代码 (Vesicle "AI 味查杀层")、离线审计             │
│     消费者: Vesicle validator、Evaluate 引擎、CI                │
│     现成参照: antislop slop_regexes/slop_phrases、               │
│              cn-antislop 四层指纹检测器                          │
└─────────────────────────────────────────────────────────────┘
```

**关键约束**：
- A 层是"给模型看的话"，必须人类可读、可手动粘进网页端。
- B 层是"机器执行的规则"，确定性、可版本化、可被 Vesicle 代码 import。
- 同一条 slop 知识可能**同时**存在于两层，但表达形态不同（A 层是"避免写 <x>"的指导；B 层是匹配 <x> 的正则/词条）。两层共享同一份**知识源**（见第 3 节），各自派生出自己的形态。

## 2. 四层指纹模型（知识的分层组织）

（借自 cn-antislop 方法论；作为 B 层检测的骨架，也为 A 层指导提供分类）

```
F0  字面 n-gram      原句套话           例:「空气中弥漫着」
F1  混合骨架         实词锚点+占位符      例:「不是……而是……」
F2  纯 POS 模板       词性序列            (对照层,中文效果较弱,本模块暂不产出条目)
F3  结构指标         宏观信号            句法完整性、破折号密度、句长节奏
```

命名采用 **F0–F3（fingerprint tiers）**，刻意区别于 L-System 的 L1–L5，避免两套毫不相关的分级体系在术语上撞车。规格细节见 [`../SCHEMA-SPEC.md`](../SCHEMA-SPEC.md) §2。

每层在两个作用面的落法：

| 指纹层 | A 前置指导 | B 后处理查杀 |
|:---|:---|:---|
| F0 字面 | "避免这些套话短语" + 例表 | 短语精确/模糊匹配 |
| F1 骨架 | "避免这类句式套路" + 正反例 | 骨架正则（如"不是…而是…"） |
| F2 POS | （一般不进指导） | POS 模板匹配（暂不实现） |
| F3 结构 | "检查句法完整性/控制节奏" + 正反例 | 统计阈值检测 |

## 3. 知识源与外参接入位

模块维护一份**中文优先的 slop 知识源**（[`../knowledge-source.yaml`](../knowledge-source.yaml)），前置/后处理两层都从它派生。

```
知识源 (本仓库自建,RP 场景导向)
  ├── 自建条目 (借方法论手工整理,带正反例;首批提炼自内部写作纪要)
  └── 外参接入位 (evaluated imports — 逐项评估后纳入)
        ├── [reference] antislop slop_phrases / slop_regexes (英文,后处理)
        ├── [evaluating] cn-antislop L0/L1 词表与骨架表 (中文,方法论+数据)
        ├── [reference] the-antislop 模式表 / Horoscope Test (前置,组织形式参照)
        └── [evaluating] SillyTavern 正则替换预设 (后处理,待用户指定权威源)
```

**接入规范：**
- 每个外参在 `knowledge-source.yaml` 的 `sources[]` 中标注：来源、许可、语言、作用面（A/B）、纳入状态（`adopted`/`evaluating`/`reference`/`rejected`）。
- 中文条目优先；英文条目作为方法论参照或英文产出时启用。
- 许可核查结论：`antislop-sampler` = Apache-2.0（保留 NOTICE 即可）；`cn-antislop` = MIT；`the-antislop` = MIT。均与本仓库 MIT 兼容，无许可障碍。

## 4. 与其它组件的引用关系

- **Resonance Protocol v10 Step 3 Runtime（zh-CN）**：Narrative Axiom 10（Anti-AI Taste）与第 8 节 Anti-AI Taste Constraints 已改为引用本模块 A 层（[`../zh-CN/prose-craft-guide.md`](../zh-CN/prose-craft-guide.md)）。第 8 节自身列出的系统术语/机器隐喻/精确测量禁令与本模块内容**互补而非重复**——第 8 节管"不要写得像系统"，本模块管"不要写得像 AI 生成的通用散文"，两者是不同维度。
- **Resonance Protocol v10 Step 3 Runtime（en-US）**：结构同步保留，本轮暂未接入英文 A 层内容（详见 §6 待办）。
- **Weaver / Weaver-Orch（Prism Engine）**：散文生成引擎，未来接入本模块 A 层——本轮未动 Phase III 工程实现，留待该侧升级时对接。
- **Transform Agent（Step 1C）**：DLC 散文同样适用，留待该侧升级时对接。
- **Vesicle 代码层**：import 本模块 B 层的确定性规则做"AI 味查杀"。对接面遵循姊妹项目记忆 `vesicle-harness-contract`（后处理进宿主代码，不硬编码进提示词）。本轮仅标注知识源中哪些条目属于 B 层数据来源，未产出扁平化制品或对接代码。
- **Evaluate 引擎**：可调用 B 层做审计维度，留待该侧升级时对接。

## 5. 本轮交付边界

**本轮做：**
- 两大作用面 + 四层指纹的架构定稿（本文件）。
- 知识源 schema 规格定稿（`SCHEMA-SPEC.md`）。
- 中文知识源条目扩充（`knowledge-source.yaml`，提炼自内部写作纪要）。
- 中文 A 层指导文档（`zh-CN/prose-craft-guide.md`）。
- Resonance Protocol v10 zh-CN 的 Step 3 Runtime（及 Step 0 Kernel 的历史占位注释）接入本模块。

**本轮不做：**
- 不写 A/B 层自动派生脚本（见 `SCHEMA-SPEC.md` §6 的手工派生说明）。
- 不产出 B 层扁平制品，不写 Vesicle 对接代码。
- 不做英文（en-US）A 层内容。
- 不接入 Prism Engine（Phase III）侧的 Weaver / Transform / Evaluate 引擎。
- 不大规模引入外参数据文件（`sources[]` 中仅登记评估状态）。

## 6. 已决问题（历史记录）

以下问题在骨架阶段曾标记"待定"，现已随本轮落地一并裁定：

- **指纹层命名**：采用 F0–F3，避开 L-System 编号。
- **模块归属**：独立顶层模块 `shared/anti-ai-flavor/`，作为 Neural-Narratology 与姊妹项目 Prism Vesicle 的共享资产，不放 `02_Resonance/v10_*/` 之下。这是"共享资产 → 独立顶层"的范式先例，`shared/` 目录本身即为容纳未来同类共享资产（如 core profile、shared schema）预留。
- **知识源格式**：单一 YAML 知识源，人工派生出 A/B 两态（暂无自动化脚本，见 §5）。
- **现成数据引入**：分层裁定，中文优先——cn-antislop 四层指纹模型（方法论）已采纳；其中文词表列为后续评估纳入对象；antislop 英文数据归"英文产出启用"；the-antislop 的分级/启发式仅作组织形式参照；SillyTavern 正则预设待用户指定权威源。

## 7. 未来工作（不阻塞本轮，供后续规划参考）

- 条目规模显著增长后，评估是否实现 A/B 自动派生脚本。
- 英文（en-US）知识源与 A 层内容。
- Vesicle 侧 B 层对接：扁平化派生产物 + 检测/改写代码。
- Prism Engine（Weaver / Weaver-Orch / Transform Agent / Evaluate）侧的实际引用接入。
- cn-antislop 词表的逐条评估纳入。
