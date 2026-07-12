# 反 AI 味知识源 · Schema 规格

> 单一 YAML 知识源的字段契约。A 前置指导层与 B 后处理查杀层都从它派生。
> 架构总览见 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)。

## 1. 设计目标

一份 YAML 作**单一事实源（single source of truth）**，承载"AI 味"（slop）知识。
两个下游作用面从同一份源**派生**，永不各自维护、永不漂移：

- **A 前置指导层**：派生出喂给 LLM 的自然语言文体规则（markdown），注入协议 / system prompt，古法网页端可直接读。
- **B 后处理查杀层**：派生出确定性规则表（正则 / 短语），供 Vesicle 代码层 import、供 Evaluate / CI 检测。

## 2. 指纹层枚举（fingerprint tier — 字段 `tier`）

用 **F0–F3**，刻意避开 L-System 的 L1–L5 编号以免混淆：

| tier | 名称 | 含义 | 典型形态 |
|:---|:---|:---|:---|
| `F0` | 字面（literal） | 原句套话，一字不差 | 短语字符串 |
| `F1` | 骨架（skeleton） | 实词锚点 + 占位符的句式套路 | 带占位符的正则 |
| `F2` | 模板（pos-template） | 纯词性序列（对照层，中文效果较弱） | POS 序列 |
| `F3` | 结构（structural） | 不依赖词表的宏观信号 | 统计阈值 / 句法完整性判定 |

## 3. 顶层结构

```yaml
meta:
  schema_version: "0.1"
  module: anti-ai-flavor
  primary_lang: zh-CN          # 中文优先
entries:
  - <entry>                    # slop 知识条目数组,见 §4
sources:
  - <source>                   # 外参来源登记表,见 §5
```

## 4. 条目 Schema（`entries[]`）

每条 slop 知识一条记录。字段：

| 字段 | 必填 | 类型 | 说明 |
|:---|:---:|:---|:---|
| `id` | ✓ | string | 稳定唯一标识，kebab-case，如 `zh-f1-not-x-but-y` |
| `tier` | ✓ | enum | `F0`/`F1`/`F2`/`F3`（见 §2） |
| `lang` | ✓ | enum | `zh-CN`/`en-US`（条目按语言分，不混写） |
| `face` | ✓ | enum | `A`（仅前置指导）/`B`（仅后处理）/`both` |
| `title` | ✓ | string | 一句话病症名（人类可读，A 层小标题用） |
| `pattern` | 条件 | string | B 层匹配式：F0 = 短语字面；F1/F2 = 正则（占位符用 `<N>`/`<P>`/`<R>`）。`face` 含 B 时必填 |
| `guidance` | 条件 | string | A 层指导文本（中文，"该怎么写 / 不该怎么写"）。`face` 含 A 时必填 |
| `examples` | 推荐 | map | 正反例：`bad`（slop 写法）/`good`（改写）。教学核心，尽量填 |
| `metric` | 条件 | map | 仅 F3：`{signal, threshold, window}` 描述统计信号 |
| `severity` | ✓ | enum | `tier1`（几乎必是 AI）/`tier2`（高度可疑）/`tier3`（语境相关）。借 the-antislop 分级 |
| `source` | ✓ | string | 溯源：`self`（自建）或 `sources[].id` 引用 |
| `notes` | — | string | 备注（适用语境、例外、题材限定等） |

**约束：**
- `face: B` 或 `both` → `pattern` 必填，**除非** `tier: F3` 且已提供 `metric`（结构信号天然以统计阈值而非字符串/正则表达，`metric` 在此等价于 B 层的机器可执行判据）。
- `face: A` 或 `both` → `guidance` 必填。
- `tier: F3` → `metric` 或 `guidance` 至少一项。
- `id` 建议编码 `<lang>-<tier>-<slug>`，便于排序与去重。

## 5. 来源登记 Schema（`sources[]`）

外参接入位。每个外部来源一条，落实"逐项评估纳入"。

| 字段 | 必填 | 类型 | 说明 |
|:---|:---:|:---|:---|
| `id` | ✓ | string | 短标识，被 `entries[].source` 引用，如 `cn-antislop` |
| `name` | ✓ | string | 全名 |
| `url` | ✓ | string | 仓库 / 资源地址 |
| `license` | ✓ | string | SPDX，如 `MIT`/`Apache-2.0` |
| `lang` | ✓ | enum | 该源主要语言 |
| `face` | ✓ | enum | 天然作用面 `A`/`B`/`both` |
| `status` | ✓ | enum | `adopted`（已纳入）/`evaluating`（评估中）/`reference`（仅参照）/`rejected` |
| `note` | — | string | 纳入范围 / 许可注意事项（如 Apache 保留 NOTICE） |

## 6. 派生契约（derivation）

单一源 → 两态。

**→ A 层（markdown 指导）**
- 取 `face ∈ {A, both}` 的条目。
- 按 `tier` 分组、`severity` 排序，渲染为带正反例（`examples.bad`/`good`）的文体规则文档。
- 供协议 / system prompt 引用（如 Step 3、Weaver、Transform Agent）。
- 当前实现：本轮为**手工派生**（[`zh-CN/prose-craft-guide.md`](./zh-CN/prose-craft-guide.md) 由知识源手动编写、人工保持同步）。本仓库无既有构建工具链（纯 Markdown/YAML 内容仓库），引入自动化派生脚本属于新增工程基础设施，暂不做——条目规模较小时手工同步的一致性成本可控；条目量显著增长后再评估是否上脚本。

**→ B 层（确定性规则表）**
- 取 `face ∈ {B, both}` 的条目。
- 导出扁平规则表：`{id, tier, lang, pattern, severity}`（F3 导出 `metric`）。
- **Vesicle 约束**：Vesicle 的 `parseProfileYaml` 只吃 `key: value` + `- item`、无嵌套（见姊妹项目记忆 `vesicle-harness-contract`）。故给 Vesicle 的产物须是**扁平形态**（如每行一条的 `.txt`/CSV，或扁平 JSON），**不是本知识源的嵌套 YAML 原文**。知识源本身用完整 YAML（由派生逻辑读取），扁平化是派生步骤的职责。
- 当前实现：本轮**不产出 B 层制品**。`knowledge-source.yaml` 中已标注 `face: B`/`both` 的条目是 B 层的数据来源，实际派生脚本与扁平产物留给 Vesicle 侧对接时按其运行时需要实现（见 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) §5 边界）。

## 7. 变更记录

- v0.1（2026-07-12）：初版规格，随模块首次落地发布。
