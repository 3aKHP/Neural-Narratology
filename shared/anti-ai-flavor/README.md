# 反 AI 味模块（Anti-AI-Flavor）

> 治理 LLM 在认真扮演与叙事时出现的文学层 AI 味（slop）。

本模块是 [Neural-Narratology](../../README.md) 与
[Prism Vesicle](https://github.com/3aKHP/prism-vesicle) 的共享知识资产，也是
[`shared/rule-assets/`](../rule-assets/) 通用规则编译框架的首个注册模块。

## 职责

模块维护一份结构化知识源，并从中派生四类投影：

| 投影 | 当前制品 | 消费者 |
|:---|:---|:---|
| Guidance | `guidance.zh-CN.md` | Runtime / Dyad / Weaver / Weaver-Orch |
| Detector | `detector-rules.<lang>.json` | Vesicle Output Quality Guard、Evaluate |
| Judge | `judge-rubric.zh-CN.md` + `judge-rules.zh-CN.json` | 无工具 Semantic Judge、Evaluate |
| Replacement | 当前为空 | 未来显式替换表；宿主决定是否执行 |

Detector 只返回 finding、证据与稳定 rule ID。自动重写的策略、次数、超时与用户
交互由 Vesicle 宿主控制，原始生成引擎负责重写。

## 文件

| 文件/目录 | 作用 |
|:---|:---|
| [`knowledge-source.yaml`](./knowledge-source.yaml) | 单一规则知识源，当前版本 0.3.0-alpha.1。 |
| [`module.config.json`](./module.config.json) | 编译配置、A/B 到通用 projection 的映射、模板与语料入口。 |
| [`SCHEMA-SPEC.md`](./SCHEMA-SPEC.md) | 本模块字段语义；通用 matcher/pack 契约见 `../rule-assets/SCHEMA-SPEC.md`。 |
| [`zh-CN/prose-craft-guide.md`](./zh-CN/prose-craft-guide.md) | 编译器生成并由 CI 防漂移的 tracked Guidance。 |
| [`templates/`](./templates/) | Guidance 与 Judge rubric 的模块语域模板。 |
| [`corpus/`](./corpus/) | Detector 黄金语料与 Semantic Judge 人工标注语料。 |
| [`candidates/`](./candidates/) | 未达到晋级门槛的外部候选及其可发布证据状态。 |
| [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) | 已采用外部方法/数据的许可证与范围。 |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | 跨仓架构与边界。 |

## 当前状态（0.3.0-alpha.1）

- 29 条规则：28 条 zh-CN、1 条 en-US。
- 21 条 Guidance / Judge 规则。
- 13 条 Deterministic Detector 规则。
- F0 / F1 / F3 已落地；F2 暂无条目。
- 破折号密度与 6 条 oh-story 文档级 metric 均为 `experimental` advisory signal，
  阈值仍需 held-out 校准。
- 发布 Rule Pack、Detector、Judge rules/result、calibration 与 host conformance JSON
  Schema；94 个 JSONL case 固定 metadata、保护区与跨宿主行为。
- 21 条 Guidance 正反例生成 42 条 tracked training case，CI 逐字防漂移。
- cn-antislop 固定快照只提供 DeepSeek 证据；8 个 L0/L1 候选保持 `evaluating`，
  当前没有候选进入 active detector rules。
- Rule Pack 要求 `quality-detector/document-metrics@1`。Judge capability 已登记，
  本 prerelease 未激活 `quality-judge/anti-ai-flavor@1`。
- Runtime quality policy 首次启用 `rewrite`；Dyad、Weaver、Weaver-Orch 与 Scene Writer
  保持 `observe`，Evaluate/Chapter Reviewer 保持 `analyze`。
- V10 Harness Pack 通过 Prism Driver quality policy 组合六引擎与 Agent；Agent Profile
  所需的同内容副本由构建器确定性生成，不维护多份 Guidance 源副本。
- 英文 Guidance、更多外部文风库和替换表可以作为独立模块增量注册。

## 开发命令

```bash
# 修改 knowledge-source.yaml 后同步 tracked Guidance
bun shared/rule-assets/scripts/sync-guidance.ts

# 同步 21 组 tracked Guidance calibration pairs
bun shared/rule-assets/scripts/sync-calibration.ts

# 校验 schema、派生一致性与正则
bun shared/rule-assets/scripts/check.ts

# 运行黄金语料与扩展性测试
bun test shared/rule-assets/tests

# 构建独立 Rule Pack
bun shared/rule-assets/scripts/build.ts --out dev/build/rule-packs

# 构建 Vesicle Harness Pack
bun shared/rule-assets/scripts/build-harness.ts --out dev/build/prism-vesicle-harness
```

## 增加规则

1. 在 `knowledge-source.yaml` 添加稳定 ID、领域字段、示例与来源。
2. Guidance/Judge 规则使用 `face: A`；Detector 规则使用 `face: B`；两边共用使用
   `face: both`。
3. Detector 条目必须提供带 `kind`、`unit` 的 matcher；metric signal 必须来自固定
   signal registry，并提供 schema、黄金语料和 host conformance case。
4. 运行同步、检查与测试。
5. 为机器规则补充黄金语料，确认中文标点、保护区和反例。

大规模引入新的词表或替换库时，优先创建独立 `shared/<module>/`，通过通用
`projections` 注册。这样可以独立版本、许可和启停，避免把不同语义的规则混入
Anti-AI-Flavor。
