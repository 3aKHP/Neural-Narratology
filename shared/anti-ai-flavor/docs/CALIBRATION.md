# Anti-AI-Flavor 校准与标注合同

本文定义 Semantic Judge 与 rewrite preservation 语料的治理、标注、裁决、切分和冻结流程。规则语义仍由 `knowledge-source.yaml` 负责；本文只约束用于评测和晋级的数据证据。

## 1. 数据分层

| split | 用途 | 允许的操作 |
|:---|:---|:---|
| `train` | 规则说明、标注训练和例子建设 | 可持续扩充和修订 |
| `dev` | prompt、parser、阈值和 runner pilot | 可按版本修订，报告必须记录 corpus digest |
| `held-out` | 阈值冻结后的单次 go/no-go | 运行前冻结；一次评测后即视为已见数据 |

任何 passage 及其仅改标点、空白、姓名或少量同义词的近重复版本只能属于一个 split。`bun run check:calibration` 会检查 NFC/LF 归一化后的精确重复；跨 split 的近重复检查对短文本使用 Unicode edit similarity，对较长文本使用四字 gram Jaccard 相似度。

生产 held-out 默认采用 `local-blind` 治理：正文 bundle、标签 bundle 和冻结 manifest 留在被 `.gitignore` 排除的 `dev/` 下；runner 只读取无 verdict、rule ID、evidence 和理由的 blinded cases。是否公开正文与标签在 go/no-go 决策完成后单独决定。

## 2. Case 元数据与 provenance

每条 `quality-calibration-case/v1` 必须提供稳定 `name`、split、genre、source kind、model family、length bucket、POV、dialogue ratio、正文、expected verdict、expected rule IDs 和 provenance。

provenance 至少包含：

- `source` 与 `license`。
- `redistribution`：`public`、`metadata-only` 或 `restricted`。
- `privacy`：`not-applicable`、`deidentified` 或 `contains-private-data`。
- 第三方固定来源的 commit 或 version。
- `privacy=deidentified` 时的 `deidentificationNotes`。

真实用户失败样本进入标注前必须移除私人角色名、未发布世界观、原文特征和本机路径。去私有化后仍可反推出个人或作品的数据保持 `restricted`，不得进入公开 corpus、CI artifact 或 PR diff。人类对照只采用 public-domain、明确许可或可公开的人工创作。

## 3. 双人独立标注

每条 held-out case 由两位标注者独立完成，期间不得查看对方结果。标注记录遵循 `quality-calibration-annotation/v1`：

1. 先判断候选是否属于当前 target type；抽取错误应在 corpus 建设阶段修复。
2. 给出 `pass` 或 `rewrite`，不使用模糊的综合分数代替 verdict。
3. `rewrite` 必须选择至少一条已发布 Judge rule，并为每条规则提供候选中的有限真实子串。
4. evidence 必须足以定位问题，也应尽量短；不得用整篇正文替代证据。
5. 理由描述文本行为和改写方向，不判断作者身份。
6. `pass` 的 rule IDs 与 evidence 必须为空。

角色口癖、年代语体、题材惯例和有意的节奏重复都需要先按作品内功能判断。单个表面模式不自动构成 rewrite。

## 4. Adjudication 合同

两份独立标注完成后，由第三位 adjudicator 或预先指定的负责人生成唯一 adjudication：

- verdict、rule IDs 和 evidence 全部一致时，`status=agreed`；adjudicator 仍需确认 evidence 是真实子串。
- 任一字段不一致时，`status=resolved`；adjudicator 阅读双方理由后给出最终 verdict、rule IDs、evidence 和解决理由。
- adjudication 不采用多数投票自动生成，也不让 Judge 自己裁决自身标签。
- annotation 和 adjudication 使用稳定、去身份化的人员 ID；映射表留在受控本地环境。

冻结工具会拒绝缺少第二位标注者、重复 annotator ID、非独立 adjudicator、任一 selected rule 缺少 evidence、带 finding 的 pass、未知 case、不在正文中的 evidence 或等于整篇正文的 evidence。

## 5. Rewrite preservation

分类 case 只证明 finding 标签。真实自动重写结果使用独立 `quality-rewrite-case/v1`，并记录：

- rewrite owner 收到的初始 candidate 与最小上下文。
- candidate type、target type、项目相对 path 和必需格式。
- 必须保留的事实、POV、角色动机/关系、事件 beat 和禁止变化。
- 每轮真实 post-image hash、Detector/Judge outcome 和 terminal state。
- 人工 preservation verdict 与严重损坏类别。

事实、POV、角色逻辑、必需 beat、格式、target path 或 post-image 任何一项发生严重损坏，都计入 severe preservation damage。finding 消失不能代替 preservation 复核。

## 6. Blinded held-out 冻结

准备工作必须在冻结前完成：rule 子集、Judge prompt、result parser、provider/model matrix、阈值、统计方法、minimum n、预算和 early-stop 均已有版本化决定。PR6A 只提供冻结机制，不预先批准任何 blocking rule。

私有输入放在 `dev/quality-calibration/<freeze-id>/source/`，然后运行：

```bash
bun shared/rule-assets/scripts/calibration.ts freeze \
  --cases dev/quality-calibration/<freeze-id>/source/cases.jsonl \
  --annotations dev/quality-calibration/<freeze-id>/source/annotations.jsonl \
  --cases-out dev/quality-calibration/<freeze-id>/blinded/cases.jsonl \
  --labels-out dev/quality-calibration/<freeze-id>/restricted/labels.jsonl \
  --manifest-out dev/quality-calibration/<freeze-id>/freeze.json \
  --freeze-id <freeze-id> \
  --frozen-at <ISO-8601>
```

`cases.jsonl` 只包含 runner 可见的正文、slice metadata 与按 canonical 顺序生成的 opaque case ID；source name 不进入 blinded bundle。`labels.jsonl` 使用相同 opaque ID，只交给报告阶段，包含最终标签、完整 provenance 与双人 annotation/adjudication；`freeze.json` 固定两者、case ID 列表和组合 corpus 的 SHA-256。所有输入输出强制位于 `dev/`，source/output path 不能互相覆盖，任一输出已经存在时工具会拒绝本次 freeze。

运行前复核：

```bash
bun shared/rule-assets/scripts/calibration.ts verify \
  --cases dev/quality-calibration/<freeze-id>/blinded/cases.jsonl \
  --labels dev/quality-calibration/<freeze-id>/restricted/labels.jsonl \
  --manifest dev/quality-calibration/<freeze-id>/freeze.json
```

held-out 首次运行后，manifest 与数据进入只读归档。任何正文、标签、prompt、rule、threshold 或 runner 变化都必须创建新的 freeze ID；旧 held-out 不再被称为未见集。

## 7. 报告交接

PR6B 的报告遵循 `quality-judge-benchmark-report/v1`。每个 provider/model 独立给出样本数、Wilson 95% interval、recall、false rewrite、agreement、invalid/repair-exhausted/timeout/unavailable、rule/evidence contract、latency、usage、major slices 和失败 case ID。

公开报告禁止保存 raw provider response 和 candidate text。provider alias 与 model ID 只是用户配置声明，不能表述为远端模型身份认证。
