# 反 AI 味模块（Anti-AI-Flavor）

> 消除 LLM 在认真扮演/叙事时露出的"文学层 AI 味"（slop）——不是"出戏"，而是
> "入戏但写得像 AI"。

本模块是 [Neural-Narratology](../../README.md) 与姊妹项目
[Prism Vesicle](https://github.com/3aKHP/prism-vesicle) 的**共享资产**，收录于
仓库顶层 [`shared/`](../README.md) 目录。参见该目录的顶层说明了解 `shared/`
的定位。

## 为什么需要这个模块

Resonance Protocol v5.0 至 v9.0 一路反馈的最大用户痛点是"AI 味"。旧版公理防的
是"出戏/助手腔"（"作为 AI"、"我不能"）——这个问题已经被既有的沉浸类公理充分
覆盖，不是真正的靶子。真正的痛点是**强模型认真扮演时仍会露出的精致文体
病症**：僵硬的对比句式、现成的环境套话、写画面而非身体感受、叙述者代角色
总结、档案袋式塞设定……这些不是模型"不想演"，而是模型"演得很像 AI 生成的
通用散文"。

本模块提供的是**正面的文体交火规则**，而非"不要像 AI"的空洞禁令。

## 架构：两个作用面

```
A. 前置指导层 (Guidance)   —— 喂给 LLM 的自然语言文体规则，注入协议/system prompt
B. 后处理查杀层 (Detection) —— 确定性规则/数据（正则、短语表），供代码层 import 做检测/改写
```

详见 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)。

## 文件说明

| 文件 | 作用 |
|:---|:---|
| [`knowledge-source.yaml`](./knowledge-source.yaml) | **单一知识源**。所有 slop 条目的结构化记录，A/B 两层都从它派生。Schema 见 [`SCHEMA-SPEC.md`](./SCHEMA-SPEC.md)。 |
| [`zh-CN/prose-craft-guide.md`](./zh-CN/prose-craft-guide.md) | **A 层 · 中文**。可直接粘贴进协议/system prompt 的人类可读文体规则，按 F0（字面套话）/F1（句式骨架）/F3（结构与判断信号）三层组织，每条带正反例。 |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | 架构设计文档：两大作用面、四层指纹模型、知识源与外参接入位、与其它组件的引用关系。 |
| [`SCHEMA-SPEC.md`](./SCHEMA-SPEC.md) | `knowledge-source.yaml` 的字段契约与派生规则。 |

## 当前状态（首次落地：2026-07-12）

- ✅ 中文（zh-CN）知识源与 A 层指导文档已落地，21 条条目，提炼自内部写作纪要。
- ✅ Resonance Protocol v10 Tempered-Voice（zh-CN）的 Step 3 Runtime 已接入本模块 A 层。
- ⬜ 英文（en-US）知识源与 A 层内容——待需要时补充。
- ⬜ B 层扁平化制品与 Vesicle 代码层对接——留给 Vesicle 侧按其运行时需要实现。
- ⬜ Prism Engine（Weaver / Weaver-Orch / Transform Agent / Evaluate）侧接入——留待该侧升级时对接。
- ⬜ 外参数据（cn-antislop 词表等）逐条评估纳入——`knowledge-source.yaml` 的 `sources[]` 中标注状态。

## 引用本模块的方式

**协议/system prompt（A 层）：** 直接引用或摘录 `zh-CN/prose-craft-guide.md` 的
内容。若目标场景对 token 预算敏感（如 FurryBar 消费端「回复格式」栏），优先
摘录标注"几乎必是 AI"的条目，其余作为创作阶段（Step 0–2）的参考素材。

**代码层（B 层）：** 从 `knowledge-source.yaml` 中筛选 `face: B`/`both` 的条目，
自行实现扁平化与检测逻辑（本模块本轮不提供派生脚本，见
[`SCHEMA-SPEC.md`](./SCHEMA-SPEC.md) §6）。
