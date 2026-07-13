# Prism-Engine-V10.x

> Prism Engine v10.0 Tempered-Voice — HAL 驱动的六引擎工程源

## 定位

`Prism-Engine-V10.x` 是 Phase III 当前工程源。Prism Vesicle 是 v10 的目标宿主，六引擎协议仍通过 Prism Driver / Host Abstraction Layer 与具体工具、Profile Schema 和资产目录隔离。

源 Prompt 只表达：

- Prism 工作流语义；
- `prism://resource/...` 逻辑资源；
- `hal://interaction/...` checkpoint；
- `hal://delegation/...` 子任务。

Vesicle 工具名、gate 名、逻辑路径和 Profile 形状集中在 [`adapters/vesicle/adapter.json`](./adapters/vesicle/adapter.json)。Harness 构建时解析这些抽象并生成宿主可执行资产。

## 目录

```text
Prism-Engine-V10.x/
├── prompts/                    # 六引擎 canonical Prompt
├── agents/                     # Scene Writer / Continuity Editor / Chapter Reviewer
├── specs/                      # 七个 Schema
├── templates/                  # 六个模板
├── driver/
│   └── contract.json           # 六引擎资源、操作、生命周期和质量策略
├── adapters/
│   └── vesicle/adapter.json    # 唯一宿主耦合点
├── docs/
│   ├── DELIVERY.md
│   └── VESICLE_ADAPTER_IMPLEMENTATION.md
└── harness.config.json
```

通用 ABI、Schema 和校验器位于 [`shared/prism-driver/`](../../shared/prism-driver/)。

## 六引擎与 Agent

| 组件 | 责任 |
|:---|:---|
| ETL | Module A、Module B、Intensity Expansion Dossier、Lite Persona Prompt |
| Runtime | authored user message 驱动的单向模拟与 turn checkpoint |
| Dyad | Auto-Pilot / Co-Pilot 双实体模拟 |
| Weaver | 单引擎 Scene Shards 写作与确定性章节编译 |
| Weaver-Orch | 顺序委派、状态同步、独立审计和用户决策 |
| Evaluate | 角色、场景、日志、扩展素材和长篇法证审计 |
| Scene Writer | 一次只写一个 Scene，不修改状态层 |
| Continuity Editor | 快照并更新 Story Bible |
| Chapter Reviewer | 独立写入章节审计报告 |

Weaver-Orch 的章节闭环：

```text
Scene Plan
→ sequential Scene Writer
→ deterministic chapter compile
→ Continuity Editor snapshot/update
→ Chapter Reviewer audit
→ user decision
```

## 协议不变量

- Module A YAML 只含 `name`、`archetype`、`age_gender`、`inventory`。
- Module B YAML 只含允许的静态场景字段与 `beat_map`。
- Outline 与 Story Bible 不使用 YAML 保存模式、章节进度、时间线或关系活状态。
- L-System 标签不能出现在 Module A、Module B、扩展素材、Session Log 或小说正文中。
- L3-A 可选。
- L4-B 默认协议为重量崇拜：靴/足作为连接媒介，动机为爱与占有；角色拓扑或用户明确指令可以覆盖。
- L5 默认锁定，需要用户明确请求并满足 Boundary Conditions。
- Runtime checkpoint 接受后结束当前调用，下一角色回合等待新的 authored user message。

## HAL 与 Harness

构建命令：

```bash
bun shared/prism-driver/scripts/check.ts
bun shared/rule-assets/scripts/check.ts
bun test shared/prism-driver/tests shared/rule-assets/tests
bun shared/rule-assets/scripts/build-harness.ts --out dev/build/prism-vesicle-harness
```

Harness 包含：

```text
manifest.json
assets/
├── engines/                    # 六个生成的 Engine Profile
├── agents/                     # 三个生成的 Agent Profile
├── prism-driver/               # Contract 与目标 Adapter
├── prompts/engines/            # 已解析路径并附宿主 Binding 的 Prompt
├── prompts/agents/
├── quality/anti-ai-flavor/
├── specs/
└── templates/
```

宿主提供两个外部基础资产：

- `assets/prompts/shared/vesicle-base.md`
- `assets/prompts/agents/base.md`

manifest 记录外部资产、required capabilities、Driver/Adapter hash、Profile bindings、Prompt bindings、Quality bindings 和全部资产 SHA-256。

## Anti-AI-Flavor

[`shared/rule-assets/`](../../shared/rule-assets/) 从 [`shared/anti-ai-flavor/`](../../shared/anti-ai-flavor/) 单一知识源生成 Guidance、Detector 与 Judge rubric。

- Runtime、Dyad、Weaver、Weaver-Orch 和 Scene Writer 组合 Guidance。
- Evaluate 与 Chapter Reviewer 组合 Judge rubric。
- 原引擎或 Scene Writer 拥有重写责任。
- Evaluate 和 Chapter Reviewer 的报告不递归进入 Guard。

## 宿主边界

本仓库交付 Driver Contract、Vesicle Adapter 描述和完整 Harness Pack。Vesicle 仍拥有工具实现、权限、Provider loop、会话、TUI、质量运行时和安装器。

当前所需 Vesicle 代码工作已记录在 [`docs/VESICLE_ADAPTER_IMPLEMENTATION.md`](./docs/VESICLE_ADAPTER_IMPLEMENTATION.md)。本轮没有修改 Prism Vesicle 仓库。
