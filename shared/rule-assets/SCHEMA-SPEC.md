# Rule Source / Rule Pack 通用契约

## 1. Source envelope

规则源顶层最低结构：

```yaml
meta:
  source_schema: rule-source/v1
  schema_version: "1.0"
  module: example-module
  version: "0.1.0"
  primary_lang: zh-CN
entries: []
sources: []
```

条目可以直接声明：

```yaml
projections: [detector, replacement]
```

现有模块也可以通过 `module.config.json` 的 `projection_map` 将领域字段映射成
通用投影。映射只解决兼容问题，不改变条目的领域含义。

## 2. Matcher

`detector` 和 `replacement` 投影必须提供 matcher：

```yaml
matcher:
  kind: literal        # literal | regex | metric
  value: 某个短语
  unit: sentence       # candidate | paragraph | sentence
  flags: u             # regex 可选；禁止 g/y 状态型 flag
```

Metric 形态：

```yaml
matcher:
  kind: metric
  metric:
    signal: em_dash_per_100_chars
    operator: gte
    threshold: 2.0
  unit: paragraph
```

当前有限 registry 包含 `em_dash_per_100_chars`，以及 6 个 experimental 文档信号：
`micro_action_per_1000_chars`、`action_list_verbs_per_paragraph`、
`cliche_per_1000_chars`、`metaphor_markers_per_1000_chars`、
`reasoning_chain_per_1000_chars` 和 `abstract_summary_per_1000_chars`。文档信号可声明
`minimumMatches`、pattern buckets、核心命中数、分隔符门槛和引号内对话排除。宿主只
实现这些具名 signal 及其 schema，不执行任意表达式。新增 signal 必须同步编译器、
JSON Schema、黄金语料与 host conformance case。

匹配前统一执行：

1. CRLF/CR 转 LF；
2. Unicode NFC；
3. 以等长空格保护 Markdown fenced code、HTML comments、Markdown blockquote 与
   Prism HUD 行，使 evidence offset 保持对应原候选文本。

宿主可以追加 normalized-candidate 坐标系下的 `protectedRanges`，用于排除内联
规则示例、引用素材或其它已由 candidate extractor 识别的非正文片段。

## 3. Replacement

替换投影采用显式声明：

```yaml
replacement:
  kind: literal        # literal | template
  value: 推荐替换文本
```

规则包只交付变换描述。宿主必须自行决定 observe、预览、人工确认或执行，不得因
规则带有 `replacement` 就默认修改用户内容。

## 4. Manifest

每个模块编译为：

```text
<module-id>/
├── manifest.json
├── THIRD_PARTY_NOTICES.md           # 可选
├── calibration/*.jsonl              # 可选黄金语料
├── data/*.json                       # 可选的非执行数据资产
├── schemas/*.schema.json            # 可选宿主合同
├── guidance.<lang>.md              # 可选
├── detector-rules.<lang>.json      # 可选
├── judge-rubric.<lang>.md           # 可选
├── judge-rules.<lang>.json          # 可选
└── replacement-rules.<lang>.json   # 可选
```

Manifest 使用 `rule-pack/v1`，记录模块版本、知识源 hash、包含 config/template/corpus/schema
的 module input hash、编译器 hash、各投影计数、required capabilities、来源登记与
每个制品的 SHA-256。输出不含构建时间。

`schemas` 与 `data_artifacts` 配置键必须是 kebab-case，源路径必须是安全的仓库相对
路径。编译器会解析并稳定化 JSON，分别输出到 `schemas/` 与 `data/`；无效 JSON 必须
使构建失败。

## 5. 兼容性

- 同一 `rule-pack/v1` 内允许增加可选字段。
- 删除字段、修改 matcher 语义或改变预处理行为必须升级 schema major。
- 内容规则增删只升级模块 `version`，不升级 pack schema。
- Vesicle 根据 `required_capabilities` 决定激活或拒绝，不猜测未知语义。
