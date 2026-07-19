# Step 4 — Stage Engine：Vesicle 消费端沉浸式 RP

> Phase II v10.0 Tempered-Voice 协议文档。本文记录 Stage Engine 的设计决策，与 [Step 3 — Runtime](./Step3%20-%20Runtime.md) 对称。工程源权威文本为 [`stage.md`](../../../03_Modulation/Prism-Engine-V10.x/prompts/stage.md)。

## 1. 定位

Stage Engine 是 Vesicle 内的第一方消费端 RP 入口。它面向**游玩者**而非创作者——游玩者用已建好的角色卡直接玩，不需要导出到第三方平台。

Stage 与 Runtime 共享同一套输出协议（Neural Chain + HUD + Prose 三段式）和同一套叙事公理，交互范式根本不同：Runtime 是创作者验证角色卡正确性的试运行模拟器，每轮有 checkpoint 门控、模型自行读取文件；Stage 是连续的沉浸式对话流，宿主在会话初始化时注入全部设定，模型不读取文件、不被门控打断。

## 2. 与 Runtime 的区别

| 维度 | Runtime（生产验证） | Stage（消费游玩） |
|:---|:---|:---|
| 用户身份 | 创作者，验证角色卡 | 游玩者，沉浸式 RP |
| 角色信息来源 | 模型 read_file 读 Module A/B | 宿主 bootstrap 解析 Module A/B，注入 System Prompt 与首条消息 |
| 交互模式 | 读文件 → 生成 → 写日志 → checkpoint → 等待 | 用户打字 → 模型续写 → 用户再打字 |
| 输出协议 | 三段式（Neural Chain + HUD + Prose） | 三段式（相同） |
| Neural Chain 可见性 | 对创作者直接可见（审计） | HTML 注释默认折叠，游玩者长按可查（细品） |
| HUD 显示 | 完整状态块 | 低调 indicator |
| 门控 | 每轮 runtime-turn 确认 | 无 |
| Quality guard | rewrite（显式 accept/retry/stop） | observe（静默检测） |
| 状态管理 | State Navigator（模型自维护） | State Navigator（模型自维护，初始化来源为注入的首 beat） |

二者共享：叙事公理 11 条、State Navigator 字段与更新规则、特殊协议（张力微推 / 边界接近 / 边界极限 / 节拍完成）、散文要求、反 AI 味约束、格式自检。

## 3. 注入编排

Stage 的根本架构差异在 `bootstrapTurn()`：宿主而非模型负责把角色卡和场景卡送进上下文。

### 3.1 Module A → System Prompt

Module A（角色卡）全文注入 System Prompt，作为永久上下文。frontmatter（name / archetype / age_gender / inventory）转为摘要行，七段正文（Visual Cortex / Biography / Cognitive Stack / Instinct Protocol / Persona Topology / Narrative Engine / World Context）原样保留。

### 3.2 Module B → 首条 assistant message

Module B（场景卡）由宿主处理后注入为本会话的**首条 assistant message**，分两层：

- **表演层（游玩者可见）：** 开场散文（80–150 字，第三人称感知滤镜）+ 角色首句台词。这是游玩者看到的"开场"。
- **逻辑层（HTML 注释，游玩者默认隐藏、长按可查，模型始终可见）：** Scene Premise / Neural State / User Role / 首 beat（label / tension_target / variant_config）。

这一双读者设计源自 FurryBar 平台逆向所得的实战经验（见 Phase I 报告附录 B）：HTML 注释在前端渲染时对游玩者隐形，模型读取的是全文，因此逻辑层指引能被模型吸收却不破坏游玩者的阅读沉浸感。

注入模板见 [`tpl_stage_context.md`](../../../03_Modulation/Prism-Engine-V10.x/templates/tpl_stage_context.md)。

## 4. 输出协议与可见性

Stage 完整输出三段，与 Runtime 一致：

1. **Part 1 — Hidden Neural Chain：** HTML 注释包裹。消费端对游玩者默认折叠，可长按查看。这是游玩者"细品"模型推理过程的入口。
2. **Part 2 — Dynamic HUD：** 低调 indicator 形式显示（如 TUI 状态栏）。HUD 字段语域与防火墙规则与 Runtime 完全一致——长会话中 HUD 容易向机器语域漂移，必须逐字段抵抗。
3. **Part 3 — Prose Content：** 默认可见的主叙事内容。

可见性由 Vesicle 前端渲染层控制，不影响模型的输出格式——模型始终完整输出三段。

## 5. 会话启动

宿主已将 Module B 开场注入为首条消息。模型静默吸收 System Prompt 中的 Module A 与首条消息逻辑层中的 Module B，初始化 State Navigator，随后从用户的**第一条输入之后**续写——不重复开场、不输出前言。

## 6. 不做的事

- **不在会话中切换角色。** 换角色 = 新会话。
- **不做宿主侧状态机执行。** Beat 与 tension 的推进由模型基于注入的 beat map 文本自主判断；State Navigator 是模型自维护的软状态机，宿主不强制推进。
- **不做 CCv3 / RikkaHub 编译。** 那是 Phase IV 第三方平台编译的职责，Stage 使用原生 Module A/B，二者互补。
- **不开自动 rewrite。** Quality guard 设为 observe，finding 记录但不打断对话。将来若有 Stage usage 数据支持，可升级为静默 rewrite。

## 7. 实现指针

| 资产 | 路径 |
|:---|:---|
| 工程源 prompt | `03_Modulation/Prism-Engine-V10.x/prompts/stage.md` |
| 注入模板 | `03_Modulation/Prism-Engine-V10.x/templates/tpl_stage_context.md` |
| Driver Contract 条目 | `03_Modulation/Prism-Engine-V10.x/driver/contract.json` → `engines.stage` |
| Vesicle Adapter 绑定 | `03_Modulation/Prism-Engine-V10.x/adapters/vesicle/adapter.json` → `engineBindings.stage` |
