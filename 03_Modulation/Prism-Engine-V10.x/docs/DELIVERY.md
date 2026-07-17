# Prism Engine V10 + HAL 交付说明

## 交付目标

本交付把 V10 从“宿主中立 Prompt 集合”推进为可构建、可验证、具有明确宿主边界的驱动型产品：

1. canonical Prompt 不包含 Vesicle 工具名；
2. Driver Contract 声明六引擎、三个 Agent、资源、操作和生命周期；
3. Vesicle Adapter 集中承载工具、路径、gate 和 Profile 映射；
4. Harness Builder 生成完整 Engine/Agent Profile 与编译后 Prompt；
5. Anti-AI-Flavor 通过 quality binding 组合；
6. V10 协议不变量由自动化测试保护；
7. Vesicle 代码需求有独立实施文档，本仓库不直接修改姊妹项目。

## 核心制品

| 制品 | 用途 |
|:---|:---|
| `driver/contract.json` | 引擎和 Agent 的宿主无关事实源 |
| `adapters/vesicle/adapter.json` | Vesicle 映射与 capability 声明 |
| `shared/prism-driver/ABI.md` | 操作、生命周期、错误和兼容性规则 |
| `harness.config.json` | Contract、Adapter 与质量投影入口 |
| `manifest.json` | 构建后的身份、能力、binding 和 hash 清单 |

## 验收命令

```bash
bun shared/prism-driver/scripts/check.ts
bun shared/rule-assets/scripts/check.ts
bun test shared/prism-driver/tests shared/rule-assets/tests
bun shared/rule-assets/scripts/build-harness.ts --out dev/build/prism-vesicle-harness
bun shared/rule-assets/scripts/build-harness.ts --out dev/build/prism-vesicle-harness-repeat
diff -rq dev/build/prism-vesicle-harness dev/build/prism-vesicle-harness-repeat
git diff --check
```

## 验收条件

- 六个 Engine Profile 和三个 Agent Profile 全部存在。
- canonical Prompt 中不存在具体宿主工具名。
- 编译后 ETL、Runtime、Dyad、Weaver、Weaver-Orch Prompt 含正确交互绑定。
- 编译后 Weaver-Orch 含三个 foreground delegation profile ID。
- delegation profile、mode、purpose 与 retry limit 由 Contract 固定，同一 Engine 的
  delegation-to-Agent 映射无歧义。
- 所有 `prism://resource/...` 在产物中完成解析。
- Runtime `runtime.turn` 的下一输入为 `authored-user-message`。
- Outline 与 Story Bible 模板没有 YAML frontmatter。
- Intensity Expansion Dossier 输出示例没有 L-System 标签。
- L4-B 默认协议、L3-A 可选与 L5 锁定保持有效。
- 两次 Harness 构建字节一致。
- Harness/Driver 版本为 `10.0.1-alpha.4`，Runtime quality binding 为 `rewrite`；Dyad、
  Weaver、Weaver-Orch 和 Scene Writer 仍为 `observe`。
- Anti-AI-Flavor Rule Pack `0.3.0-alpha.3` 包含 Detector/Judge/calibration/annotation/
  rewrite/report/freeze JSON Schema、124 条 tracked calibration/conformance case、6 个
  experimental document metrics 和 cn-antislop evaluating candidate 资产，且全部进入
  manifest hash。
- 根 Harness 与 Rule Pack 同时要求 `quality-detector/document-metrics@1` 和
  `quality-judge/anti-ai-flavor@1`。Judge 只在 Runtime observe，finding 不进入 rewrite。

## 已知宿主前置条件

当前 Vesicle `develop` 已实现 Harness manifest/capability 安装路径、deterministic Guard、
PR 4 document metrics 与 PR 5 `quality-judge/anti-ai-flavor@1` observe support。
`10.0.1-alpha.4` 只增加校准合同和语料，不改变宿主 required capability 或 Runtime
behavior。具体清单见 `VESICLE_ADAPTER_IMPLEMENTATION.md`。
