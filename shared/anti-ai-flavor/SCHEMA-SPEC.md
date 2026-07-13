# Anti-AI-Flavor 知识源 Schema 规格

通用 Rule Source、Matcher、Replacement 与 Rule Pack 结构见
[`../rule-assets/SCHEMA-SPEC.md`](../rule-assets/SCHEMA-SPEC.md)。本文件只定义
Anti-AI-Flavor 的领域字段和 A/B 兼容语义。

## 1. 顶层

```yaml
meta:
  source_schema: rule-source/v1
  schema_version: "0.2"
  module: anti-ai-flavor
  version: "0.2.0"
  primary_lang: zh-CN
  default_targets: [narrative-prose]
  preprocessing: {}
entries: []
sources: []
```

`version` 表示规则内容版本；`schema_version` 表示本模块字段版本；
`source_schema` 表示通用外壳版本，三者独立演进。

## 2. 指纹层 `tier`

| tier | 含义 | 典型机器形态 |
|:---|:---|:---|
| `F0` | 字面套话 | literal 或短正则 |
| `F1` | 实词锚点与句式骨架 | regex 或语义 Guidance |
| `F2` | POS / 句法模板 | 暂未实现 |
| `F3` | 结构、密度或人物判断 | metric 或 Semantic Judge |

F0–F3 与 L-System 无关。

## 3. 条目字段

| 字段 | 必填 | 说明 |
|:---|:---:|:---|
| `id` | ✓ | 稳定 kebab-case ID，建议 `<lang>-<tier>-<slug>`。 |
| `tier` | ✓ | F0/F1/F2/F3。 |
| `lang` | ✓ | 当前允许 zh-CN/en-US。 |
| `face` | ✓ | `A` / `B` / `both`，由 module config 映射为通用 projections。 |
| `title` | ✓ | 人类可读病症名。 |
| `guidance` | 条件 | face 含 A 时必填。 |
| `matcher` | 条件 | face 含 B 时必填。 |
| `examples` | 推荐 | `bad` / `good` 正反例。 |
| `severity` | ✓ | tier1/tier2/tier3，仅表达可疑程度。 |
| `maturity` | — | stable/experimental，默认 stable。 |
| `source` | ✓ | self 或 `sources[].id`。 |
| `notes` | — | 例外、许可、校准说明。 |
| `targets` | — | 缺省继承 `meta.default_targets`。 |

投影映射：

```text
A    -> guidance + judge
B    -> detector
both -> guidance + detector + judge
```

Anti-AI-Flavor 当前不声明 replacement。未来的正则替换表应建立独立模块，直接
使用通用 `projections: [detector, replacement]` 与 `replacement` 字段。

## 4. Severity 与 Maturity

- `tier1`：高度确定的字面或骨架信号。
- `tier2`：需要密度、组合或语境确认。
- `tier3`：主要作为语义判断线索。
- `experimental`：只进入 observe 数据，不应直接触发 rewrite。

宿主 Policy 可以结合多个 finding、Judge 置信度和引擎类型决定行为。知识源不
编码 rewrite 阈值。

## 5. 来源登记

`sources[]` 记录 id、name、url、license、lang、face、status 与 note。status：

- `adopted`：已采用方法或数据，manifest 必须保留登记。
- `evaluating`：仍在评估，不能批量导入。
- `reference`：只作组织或方法参考。
- `rejected`：禁止被条目引用。

## 6. 派生与防漂移

编译器从本文件生成：

- Guidance Markdown；
- Detector JSON；
- Judge rubric；
- Rule Pack manifest。

仓库中的 `zh-CN/prose-craft-guide.md` 是 tracked 派生产物。CI 逐字比较重新生成
结果；任何手工改动都会失败。V10 Driver Contract 声明 quality policy，Harness
Builder 通过目标 Adapter 把这一份 Guidance 组合进 Engine/Agent Profile。

## 7. 版本记录

- 0.2（2026-07-13）：接入通用 Rule Assets 编译框架，增加显式 matcher、maturity、
  Rule Pack、Judge rubric、黄金语料和 Harness Pack。
- 0.1（2026-07-12）：A/B 双作用面与初始知识源。
