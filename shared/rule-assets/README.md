# Rule Assets — 可扩展规则资产编译框架

`shared/rule-assets/` 为跨仓库规则型素材提供统一的校验、编译与 Harness Pack
交付框架。它处理的是规则资产的共同外壳，不规定每个知识模块的领域语义。

首个注册模块是 [`../anti-ai-flavor/`](../anti-ai-flavor/)；后续可以继续注册：

- 其它 AI 文风库；
- 字面词表、正则检测表；
- 正则替换或规范化表；
- 面向 Judge 的评审 rubric；
- 只提供 Guidance、不包含机器匹配器的写作规范。

## 核心模型

每条规则通过 `projections` 声明自己可以投射到哪些制品：

| projection | 制品 | 语义 |
|:---|:---|:---|
| `guidance` | Markdown | 注入模型上下文的前置指导 |
| `detector` | JSON | 确定性 literal / regex / metric 检测规则 |
| `judge` | Markdown | 供语义 Judge 或 Evaluate 使用的稳定 rule-ID rubric |
| `replacement` | JSON | 显式替换表；只描述变换，不授权宿主自动执行 |

模块可以只实现其中一部分。Anti-AI-Flavor 的历史 `face: A/B/both` 由其
`module.config.json` 映射成上述通用投影；新模块应直接使用 `projections`。

## 命令

```bash
# 校验全部注册模块、派生文档与黄金语料
bun shared/rule-assets/scripts/check.ts

# 重新生成 tracked Guidance 与 calibration pairs
bun shared/rule-assets/scripts/sync-guidance.ts
bun shared/rule-assets/scripts/sync-calibration.ts

# 校验公开 corpus provenance 与跨 split 重复/泄漏
bun shared/rule-assets/scripts/calibration.ts audit

# 构建全部规则包
bun shared/rule-assets/scripts/build.ts --out dev/build/rule-packs

# 构建 Prism Vesicle Harness Pack
bun shared/rule-assets/scripts/build-harness.ts --out dev/build/prism-vesicle-harness

# 执行测试
bun test shared/rule-assets/tests shared/prism-driver/tests
```

Harness Builder 先验证 [`../prism-driver/`](../prism-driver/) 的 Driver Contract 与
目标 Host Adapter，再解析逻辑资源、生成 Engine/Agent Profile 和宿主 Binding Prompt。
具体工具名只存在于 Adapter 与编译产物中。

所有构建均为无时间戳的确定性输出。源文件、Driver Contract、Adapter、编译器或模板
发生变化时，manifest 中的 hash 随之变化；相同输入重复构建必须字节一致。

模块可以通过 `module.config.json` 的 `schemas` 映射发布宿主可消费的 JSON Schema，
通过 `data_artifacts` 发布已验证但不执行的候选或校准数据。Schema、data artifact 与
calibration corpus 一并进入 Rule Pack manifest 的逐文件 hash 和 module input hash。
Anti-AI-Flavor 同时发布 host conformance JSONL，供不同语言的宿主实现对齐预处理、
保护区、有限 document metric signal 和 rule ID 结果。

进入 Rule Pack 的 corpus 必须声明可公开再分发且不含私人数据；本地 blinded held-out
通过 `calibration.ts freeze/verify` 留在 ignored `dev/` 下，不会被编译器打包。

CI 为每次检查上传 `prism-vesicle-harness-v10` artifact；需要稳定跨仓交付时，使用
`Release Vesicle Harness Pack` 手动工作流发布 ZIP 与 SHA-256。

## 扩展新模块

1. 在 `shared/<module-id>/` 放置源 YAML 与可选模板、语料。
2. 添加 `module.config.json`，声明 source、输出名、投影映射与模板。
3. 在 [`registry.json`](./registry.json) 注册配置路径。
4. 外部规则或方法被采用时，添加 notices 文件并在 config 中登记。
5. 为新 matcher / replacement 语义添加 fixture 和测试。
6. 若模块进入 Harness，在 V10 Driver Contract 中声明 quality policy，并在
   `harness.config.json` 登记投影资产路径。

通用契约见 [`SCHEMA-SPEC.md`](./SCHEMA-SPEC.md)。领域规则的含义仍由各模块
自己的 README 与 Schema 负责。
