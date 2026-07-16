# Anti-AI-Flavor 架构

## 1. 模块使命

本模块治理强模型认真扮演与叙事时仍会出现的文学层 AI 味：套话、僵硬句式、
视角滑出、信息袋、角色机械服从、空洞过渡、过量修辞等。

旧沉浸公理继续处理助手腔、系统术语与出戏问题；Anti-AI-Flavor 聚焦散文质量。

## 2. 单一知识源与四类投影

```text
knowledge-source.yaml
  ├─ Guidance Markdown       给生成引擎看的前置规则
  ├─ Detector JSON           确定性 literal/regex/metric
  ├─ Judge rubric + rules    带稳定 rule ID 与 evidence contract 的语义判据
  └─ Replacement JSON        通用框架预留；本模块当前为空
```

[`shared/rule-assets/`](../../rule-assets/) 负责通用校验和编译。本模块负责规则语义、
正反例、来源、严重度与校准语料。

## 3. Vesicle Output Quality Guard

Vesicle 将本模块作为 Output Quality Guard 的策略资产：

```text
Pre-generation Guidance
  -> Engine generates candidate
  -> Deterministic Detector
  -> optional Semantic Judge
  -> host Policy
  -> pass / observe / rewrite / strict decision
```

职责边界：

- Detector/Judge 提供 finding、证据和 rule ID。
- Vesicle 决定 policy、预算、超时、重试、会话状态与 TUI 呈现。
- Runtime、Dyad、Weaver 等原始引擎负责重写。
- Evaluate 复用 Detector/rubric，避免对自身报告运行 Guard。

## 4. Harness Pack

V10 Harness Pack 将引擎资产和规则包组合在一个可追溯目录树中：

```text
prism-vesicle-harness/
├── manifest.json
└── assets/
    ├── engines/
    ├── agents/
    ├── prism-driver/
    ├── prompts/engines/
    ├── prompts/agents/
    ├── quality/anti-ai-flavor/
    ├── specs/
    └── templates/
```

根 manifest 记录：

- source commit/state；
- 全部文件 hash；
- required host capabilities；
- prompt bindings；
- Engine/Agent profile bindings；
- Prism Driver Contract 与 Host Adapter identity/hash；
- 各引擎 quality binding 初始模式；
- Rule Pack manifest 路径。

Vesicle 安装后不读取 Neural-Narratology 路径，也不依赖 symlink 或跨仓相对链接。
Canonical V10 Prompt 通过 Prism Driver ABI 声明质量策略；Harness Builder 根据目标
Adapter 生成 Profile 和宿主 Binding Prompt。具体工具名不进入规则知识源或 canonical
Prompt。

## 5. 引擎组合

| 引擎 | Prompt 资产 | 初始质量模式 |
|:---|:---|:---|
| ETL | engine prompt | off |
| Runtime | engine prompt + Guidance | rewrite |
| Dyad | engine prompt + Guidance | observe |
| Weaver | engine prompt + Guidance | observe |
| Weaver-Orch | engine prompt + Guidance | observe |
| Evaluate | engine prompt + Judge rubric | analyze |

长篇 Agent：

| Agent | Prompt 资产 | 初始质量模式 |
|:---|:---|:---|
| Scene Writer | agent prompt + Guidance | observe |
| Continuity Editor | agent prompt | off |
| Chapter Reviewer | agent prompt + Judge rubric | analyze |

Runtime 作为首个 rewrite dogfood 面；其它正文生成面继续 observe，按真实误报与重写
稳定性逐步启用，无需重新复制 Guidance。

## 6. 指纹与匹配

- F0：字面短语。
- F1：句式骨架与语义写作问题。
- F2：POS/句法模板预留。
- F3：结构指标和角色判断。

确定性候选统一执行 LF、NFC，并保护 Markdown code fence、blockquote、HTML comment
与 Prism HUD。文档级 metric 还会排除引号内对话，使用有限 signal registry 和
Rule Pack 中明确的数据参数。宿主仍应优先提取纯正文，保护规则只承担第二道隔离。

## 7. 扩展边界

后续引入其它 AI 文风库、词表或正则替换表时：

1. 建立独立模块与版本；
2. 记录独立来源和许可证；
3. 直接声明通用 projections；
4. 通过 registry 加入构建；
5. 在 Harness 中显式绑定需要它的引擎；
6. 由 Vesicle capability 决定是否支持。

这使每个规则库可以单独启停、升级和回滚，也让检测与替换保持不同的授权语义。

## 8. 当前交付

- Source Schema 0.2 / Rule Pack v1。
- 29 条规则，21 条 Guidance/Judge，13 条 Detector。
- 42 条 tracked Guidance pairs、28 条 Detector case、24 条跨宿主 conformance case
  与 8 条 Semantic Judge 人工标注语料。
- Rule Pack、Detector、Judge、calibration 与 host conformance JSON Schema。
- cn-antislop L0/L1 候选的 schema-valid evaluating 资产；单模型快照不产生晋级规则。
- metrics 与 Judge capability 已分别登记；首个 0.3 prerelease 只要求 metrics。
- 可复现 Bun 编译器。
- V10 Harness Pack builder。
- Prism Driver quality policy 与 Engine/Agent binding。
- CI 防漂移、测试与双构建一致性检查。

保留议题包括英文 Guidance、held-out 人类对照、跨模型候选复核、Judge 运行时与
阈值，以及 Scene/章节两级审计的费用平衡。
