# Prism Vesicle Adapter 实施清单

> 文档性质：跨仓适配设计
>
> Neural-Narratology 基线：当前工作树
>
> Prism Vesicle 宿主基线：PR 4 metrics 已合入 `develop`；PR 5 Semantic Judge observe
> 已完成本地合同与运行时验证。
>
> 约束：本文只记录 Prism Vesicle 所需工作，不修改姊妹项目代码。

该基线已经实现 managed/bundled Harness Pack、精确 capability 协商、
`quality-guard/anti-ai-flavor@1`、artifact post-image 检查、durable quality outcome 与
TUI resume、document metrics 与 Semantic Judge observe host service。本工作只修改
Neural-Narratology 的发布能力声明与精确制品。

## 1. 当前兼容性结论

V10 Harness Builder 已生成：

- `assets/engines/*.profile.yaml` 七份；
- `assets/agents/*.agent.yaml` 三份；
- 编译后 Engine/Agent Prompt；
- Driver Contract 与 Vesicle Adapter；
- Anti-AI-Flavor Rule Pack；
- 完整 manifest 与逐文件 hash。

这些 Profile 已使用当前 Vesicle 的 `loadEngineProfile()`、`loadPromptBundle()`、
`loadAgentProfile()` 和 `loadAgentSystemPrompt()` 进行只读加载验证。七引擎、三个 Agent
均可解析，基础 Prompt 可从 Vesicle bundled assets 回落加载。

当前 Vesicle 能安装、验证和固定 Rule Pack，执行 deterministic Guard 与有限 document
metric registry。PR 5 增加 verified Judge rubric/rules/result loader、tool-free provider
service、严格 JSON/evidence 校验、一次 repair、timeout/cancel、bounded usage/session
事件和 Runtime-only observe。`10.0.1-alpha.5` 继续要求 metrics 与 Judge capability，并
增加 inactive Semantic Rewrite Policy contract；运行时行为保持不变。

## 2. 已实现基线 — Harness 安装与验证

Vesicle 已有专用 Harness loader，职责限定为 Prism Harness Pack：

```text
src/core/harness/
├── manifest.ts
├── verify.ts
├── install.ts
├── capability.ts
└── types.ts
```

已实现行为：

1. 读取 `prism-harness-pack/v1` manifest。
   Schema 位于 `shared/prism-driver/schemas/harness-manifest.schema.json`。
2. 校验 `id`、`version`、Driver/Adapter hash 与全部 asset hash。
3. 检查 `externalHostAssets` 在 bundled 或全局资产层存在。
4. 对 `requiredCapabilities` 做精确匹配；未知能力拒绝激活。
5. 把通过校验的资产安装到 Vesicle 管理的资产层，保持 logical path 不变。
6. 安装采用临时目录与原子切换；失败时保留上一可用版本。
7. session 记录 Harness id、version、source commit、Adapter id/version。

Managed Harness 必须是完整 baseline，建议解析顺序为：

```text
project sparse override
→ user sparse override
→ project-selected managed Harness baseline
→ bundled recovery baseline
```

激活 managed Harness 后，包内缺失或删除的资源不能逐文件回落到 bundled V9。只有
manifest 明确列入 `externalHostAssets` 的宿主基础 Prompt 可以由宿主提供。managed
Harness 整体停用、损坏回滚或进入 recovery mode 时，才切换到 bundled recovery
baseline。项目应通过 `.vesicle/assets.lock.json` 一类 lock 记录选中的 pack id、version、
Adapter 和 hash。

不建议在运行时读取 Neural-Narratology 路径、symlink 或跨仓相对文件。

## 3. 已实现基线 — Profile 与 Binding 激活

生成的 Profile 已包含完整 `systemPrompt` 数组，Vesicle 无需解析 canonical Prompt 或重新生成工具说明。

Harness loader 验证：

- `profileBindings` 中七个引擎均为 Vesicle 已知 EngineId；
- `agentProfileBindings` 的 profile id 合法；
- Prompt 路径位于允许的资产根；
- stop gate 与编译后 Prompt 中的绑定一致；
- Agent Profile 没有交互工具和递归委派能力。

`promptBindings` 和 `agentPromptBindings` 用于审计及漂移检测；运行时仍以 Profile 的 `systemPrompt` 为直接加载入口。

## 4. PR 4 / PR 5 — Document metrics 与 Semantic Judge observe

manifest 的 `qualityBindings` 与 `agentQualityBindings` 已接入宿主质量策略。PR 4 在该
既有 lifecycle 内增加有限 document metric signal，不改变 target、durability、rewrite
预算或 TUI 决策状态机。

PR 4 验收能力：

- 保持 `quality-guard/anti-ai-flavor@1` 兼容
- `quality-detector/document-metrics@1`（Harness `10.0.1-alpha.2` 起 required）
- 只实现 Rule Pack schema 列举的 6 个 document metric signal
- 新 signals 保持 `experimental` advisory/observe，不进入 Runtime blocking policy
- 直接执行发布的 host conformance JSONL
- 保持 Markdown code、YAML、HUD、Hidden Neural Chain、引用、报告和对话保护区
- 未知 signal/capability 与篡改资产继续 fail closed

代码责任域继续使用既有 `src/core/quality/`，Harness quality binding 仍是配置来源。

Rule Pack 同时交付 `judge-rubric.zh-CN.md`、`judge-rules.zh-CN.json` 与
`judge-result.schema.json`。Adapter 与 root manifest 从 `10.0.1-alpha.3` 起要求
`quality-judge/anti-ai-flavor@1`。宿主只在 Runtime 调用当前 provider/model，使用空工具
与独立上下文；finding 只记录 observe，后续 rewrite 晋级需要独立 held-out 校准。

## 5. P1 — Evaluate 分析工具

Adapter 把 `quality.analyze` 映射为可选工具 `analyze_prose_quality`。当前 Vesicle 未提供该工具，Evaluate 和 Chapter Reviewer 会使用已注入的 Judge rubric 完成降级审计。

后续工具应：

- 接受目标文件或已提取候选文本；
- 默认执行 deterministic 模式；
- 返回 rule ID、严重度、证据、位置、Rule Pack version/hash；
- 允许宿主提供 protected ranges；
- 不直接修改目标文件；
- 仅进入 Evaluate 和允许的 Reviewer Agent 工具面。

该能力完成后声明 `quality-analysis/anti-ai-flavor@1`。

## 6. P1 — Gate 生命周期增强

当前 `resolveGate()` 在确认后立即恢复 provider loop。编译后 Runtime Prompt 已要求模型在 `runtime-turn` 接受后只输出完成说明并停止，下一回合等待 authored user message，因此现有实现可以工作。

建议后续让宿主识别 Driver Contract 生命周期：

```text
runtime.turn
on accept -> close current invocation
next input -> authored-user-message
```

宿主可直接返回完成状态，减少一次无产物 provider 调用，并从机制上防止空输入角色回合。其它 ETL gate 仍保持确认后继续 provider loop。

## 7. P1 — Validator 与 Artifact 验证

当前限制：

- `evaluate-report` 只验证内联 assistant content；
- Weaver、Weaver-Orch 和三个 Agent 没有长篇 Artifact Validator；
- Validator failure 仍为 advisory。

建议新增：

- `outline-v10`：无 YAML、Project Configuration、章节字段结构；
- `story-bible-v10`：无 YAML、Project Status、五个状态区块；
- `scene-shard-v10`：目标文件、制作层术语和 L-System 泄漏；
- `chapter-audit-v10`：verdict 与五段报告结构；
- file-write validation：在成功写入报告后读取目标文件验证。

V10 Prompt 已要求 Evaluate 在最终回复内同时提供报告骨架，可暂时覆盖现有 inline Validator。

## 8. P0 — Agent 执行与职责边界

Harness 生成的三个 Agent：

| Agent | 模式 | 写入职责 |
|:---|:---|:---|
| scene-writer | foreground | 委派指定的单个 Scene |
| continuity-editor | foreground | Story Bible 与章节快照 |
| chapter-reviewer | foreground | 指定审计报告 |

当前 Agent Profile 的 tool allowlist 已按职责收紧。Harness 与 HAL 不建立第二套权限系统：
Agent Profile 只声明 child 的工具集合，Adapter 只映射 delegation 语义，实际工具调用继续由
Vesicle 的 `/permissions` 统一 ask / allow / deny，并由 parent permission broker 处理 child
请求。项目路径、symlink、并发写入冲突、timeout 和进程隔离仍由 Tool Runtime 作为不可绕过
的不变量执行。

`prism-agent/delegation@1` 的 v1 最低合同应绑定 delegation ID、Agent Profile、默认 mode、
purpose 与 retry limit；现有 `spawn_agent.prompt` 承载自包含任务和交付要求，不新增嵌套
Task Packet Schema。per-delegation allowed write paths 不作为 v1 前置条件；只有出现真实越权
或复杂并发需求时，再把更窄的任务级路径 scope 作为可选增强评估。

Scene Writer 必须顺序执行；Harness 不要求同一章节内并行写作。

## 9. 建议测试

### Harness

- manifest schema、hash、capability 和 external asset 检查；
- 原子安装、回滚、损坏包拒绝；
- Adapter major 不支持时拒绝；
- Profile/manifest binding 漂移拒绝。

### Prompt 与交互

- Runtime `runtime-turn` 接受后不生成新角色包；
- ETL 两类 gate 正常推进与拒绝返工；
- Dyad、Weaver、Weaver-Orch 选择面板保持选项顺序；
- Weaver-Orch 可按 profile id 委派三个 Agent。
- delegation 的 profile、mode 与 retry limit 不能被模型覆盖；
- child 权限请求进入 parent `/permissions`，不会在 HAL 层重复询问；
- 现有路径、symlink 与并发冲突硬约束在 child 调用中保持有效。

### Quality

- Engine 和 Scene Writer candidate extraction；
- observe、rewrite、retry exhaustion；
- SubAgent completion guard；
- Evaluate/Reviewer 报告排除；
- session quality event 可恢复。

### Artifact

- Outline/Story Bible 无 YAML 活状态；
- Scene 顺序编译无重复和缺失；
- Story Bible 快照及单写者约束；
- file-written audit report validation。

## 10. 建议实施顺序

1. Harness manifest verifier 与安装层。
2. capability registry 与 Adapter 版本检查。
3. contract-bound delegation 与 Runtime Output Quality Guard 两条 P0 轨并行实现。
4. Runtime rewrite 通过 conformance 与恢复测试后声明 Quality Guard capability。
5. SubAgent completion quality path，再扩展 Dyad/Weaver enforcement。
6. `analyze_prose_quality` 与 Evaluate 接入。
7. HAL lifecycle-aware gate completion。
8. 长篇 Artifact Validator。

每一步完成后都应使用本仓发布的 Harness artifact 做跨仓 fixture，禁止把本仓源码路径写入 Vesicle 测试或运行时配置。
