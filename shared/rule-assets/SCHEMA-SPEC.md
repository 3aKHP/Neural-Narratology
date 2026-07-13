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

当前通用编译器实现 `em_dash_per_100_chars`；新增 metric signal 必须同时增加
编译器实现、fixture 与契约测试。

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
├── guidance.<lang>.md              # 可选
├── detector-rules.<lang>.json      # 可选
├── judge-rubric.<lang>.md           # 可选
└── replacement-rules.<lang>.json   # 可选
```

Manifest 使用 `rule-pack/v1`，记录模块版本、知识源 hash、包含 config/template/corpus
的 module input hash、编译器 hash、各投影计数、required capabilities、来源登记与
每个制品的 SHA-256。输出不含构建时间。

## 5. 兼容性

- 同一 `rule-pack/v1` 内允许增加可选字段。
- 删除字段、修改 matcher 语义或改变预处理行为必须升级 schema major。
- 内容规则增删只升级模块 `version`，不升级 pack schema。
- Vesicle 根据 `required_capabilities` 决定激活或拒绝，不猜测未知语义。
