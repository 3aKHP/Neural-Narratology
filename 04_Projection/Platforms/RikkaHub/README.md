# RikkaHub 适配

> **C 类:思维链自维护路径 —— 基于源码分析的精确适配设计**
> *源码：[rikkahub/rikkahub](https://github.com/rikkahub/rikkahub) — Android 原生 Kotlin 项目*

---

## 一、平台架构（源码验证）

### 1.1 角色卡导入

**文件**：`AssistantImporter.kt` (292 lines)

RikkaHub 实现了独立的 CCv2 和 CCv3 解析器——但两者的逻辑**完全相同**：

```
CharaCardV2Parser.parse():
  data.name → name
  data.first_mes → presetMessages
  data.system_prompt + description + personality + scenario → systemPrompt (拼接)

CharaCardV3Parser.parse():
  同上，字段映射完全一致
```

**导入的系统提示词格式**：
```
You are roleplaying as [name].

[system_prompt]

## Description of the character
[description]

## Personality of the character
[personality]

## Scenario
[scenario]
```

**关键缺口**：
- **不导入** `post_history_instructions` — 无 Jailbreak 支持
- **不导入** `mes_example` — 无对话示例（这是 ST 社区认为最影响声纹一致性的字段）
- **不导入** `alternate_greetings` — 无备用开场白
- **不导入** `character_book`（嵌入在卡片中的 lorebook）— 需要单独导入
- **不导入** `creator_notes` / `creator_notes_multilingual`
- **不导入** `tags`、`creator`、`character_version`、`source`、`creation_date`

**PNG 导入**：通过 `ImageUtils.getTavernCharacterMeta()` 读取 PNG tEXt chunk 中 `[chara:` 前缀的 base64 JSON。

### 1.2 Lorebook 系统

**文件**：`Assistant.kt` (lines 104-251)、`PromptInjectionTransformer.kt` (251 lines)

RikkaHub 使用**自己的结构化 Lorebook 模型**，而非 CCv3 Decorator 语法：

```kotlin
RegexInjection {
    keywords: List<String>        // 触发关键词
    useRegex: Boolean             // 是否用正则匹配
    caseSensitive: Boolean        // 大小写敏感
    scanDepth: Int                // 扫描最近 N 条消息
    constantActive: Boolean       // 常驻激活（无需匹配）
    priority: Int                 // 排序优先级
    injectDepth: Int              // AT_DEPTH 时使用
    role: MessageRole             // USER / ASSISTANT
    position: InjectionPosition   // 注入位置
    content: String               // 注入文本
}
```

**五次注入位置**：
| InjectionPosition | 行为 |
|:---|:---|
| `BEFORE_SYSTEM_PROMPT` | 拼接在系统提示词**之前** |
| `AFTER_SYSTEM_PROMPT` | 拼接在系统提示词**之后**（最常用） |
| `TOP_OF_CHAT` | 插入在第一条用户消息之前 |
| `BOTTOM_OF_CHAT` | 插入在最后一条用户消息之前 |
| `AT_DEPTH` | 插入在从最新消息往前数 injectDepth 条的位置 |

**匹配逻辑** (`isTriggered()`):
```kotlin
1. 如果 constantActive → 始终触发
2. 如果 keywords 为空 → 不触发
3. 遍历 keywords:
   - 如果 useRegex → 正则匹配（捕获异常返回 false）
   - 否则 → 子字符串匹配（caseSensitive 控制大小写）
```

### 1.3 CCv3 Decorator 支持情况

**结论：RikkaHub 完全不实现 CCv3 `@@` Decorator 语法。**

源码中搜索 `@@` 无任何功能性用途（仅出现在 UI 字符串资源中）。RikkaHub 选择了结构化的 JSON 字段方案，而非 CCv3 的文本内嵌指令方案。

**功能对照表**：

| CCv3 Decorator | RikkaHub 等价物 | 状态 |
|:---|:---|:---|
| `use_regex: true` | `RegexInjection.useRegex` | ✅ 支持（结构化字段） |
| `constant: true` | `RegexInjection.constantActive` | ✅ 支持 |
| `case_sensitive` | `RegexInjection.caseSensitive` | ✅ 支持 |
| `scan_depth` | `RegexInjection.scanDepth` | ✅ 支持 |
| `@@position (after_desc/before_desc/...)` | `InjectionPosition` enum | ✅ 部分支持（5 种位置而非 4 种 CCv3 位置） |
| `@@depth N` | `AT_DEPTH + injectDepth` | ✅ 支持 |
| `@@role` | `RegexInjection.role` | ✅ 支持 |
| `insertion_order` | `RegexInjection.priority` | ✅ 支持（语义略有差异） |
| `@@activate_only_after N` | — | ❌ 不支持 |
| `@@activate_only_every N` | — | ❌ 不支持 |
| `@@keep_activate_after_match` | — | ❌ 不支持 |
| `@@dont_activate_after_match` | — | ❌ 不支持 |
| `@@is_greeting N` | — | ❌ 不支持 |
| `@@disable_ui_prompt` | — | ❌ 不支持 |
| `@@instruct_depth` / `@@reverse_depth` | — | ❌ 不支持 |
| `@@additional_keys` | — | ❌ 不支持（但 keywords 支持多值） |
| `@@exclude_keys` | — | ❌ 不支持 |
| `@@ignore_on_max_context` | — | ❌ 不支持 |
| Fallback chain (`@@@`) | — | ❌ 不支持 |

**关键结论**：RikkaHub 的 Lorebook 是一个**纯内容匹配系统**——支持基于关键词/正则的触发和位置控制，但**完全没有时序/状态管理能力**。这意味着：
- 无法实现"第 N 轮后才激活"（无 `@@activate_only_after`）
- 无法实现"一旦触发就保持"（无 `@@keep_activate_after_match`）
- 无法实现 Beat Map 的节拍门控

### 1.4 SillyTavern Lorebook 导入

**文件**：`ExportSerializer.kt` (lines 145-174)

RikkaHub 支持从 ST JSON 格式导入 Lorebook：
```kotlin
SillyTavernEntry {
    key, content, comment, constant, position, order, 
    disable, depth, scanDepth, caseSensitive
}
```

ST 的 `position` (0-4) 映射到 RikkaHub 的 `InjectionPosition`：
- 0 → BEFORE_SYSTEM_PROMPT
- 1 → AFTER_SYSTEM_PROMPT
- 2 → TOP_OF_CHAT
- 3 → TOP_OF_CHAT (After Examples)
- 4 → AT_DEPTH

**注意**：导入时 `useRegex` 硬编码为 `false`——即使 ST 卡片中使用了 `use_regex`，导入后也丢失了。

### 1.5 Prompt 组装流程

**文件**：`GenerationHandler.kt` (lines 325-444)

```
最终发送给 LLM 的 messages:
  1. [SYSTEM]  systemPrompt（从角色卡导入时构建）
             + memory prompt（JSON 格式的记忆）
             + recent chats（JSON 格式的近期对话摘要）
             + tool system prompts（工具系统提示词）
  2. [USER/ASSISTANT 交替]  对话历史（截断至 contextMessageSize）
  3. 输入 Transformers 管道处理:
     TimeReminder → PromptInjection → Placeholder → DocumentAsPrompt → OCR → Template
```

**Placeholder 替换**（`PlaceholderTransformer.kt`）:
- `{{cur_date}}` → 当前日期时间
- `{{user}}` → 用户名
- `{{char}}` → 角色名
- `{{model_name}}` → 模型名
- `{{locale}}` → 系统语言
- `{{timezone}}` → 时区
- `{{device_info}}` → 设备信息

**注意**：不支持 CCv3 的 CBS 宏（`{{random:}}`、`{{pick:}}`、`{{roll:}}`、`{{//}}`、`{{hidden_key:}}`）。但 `{{char}}` 和 `{{user}}` 的语义与 CCv3 一致。

### 1.6 Transformer 管线

RikkaHub 有 9 个 Transformer，分为输入和输出：

**输入 Transformers**（在发送前处理消息列表）：

| # | Transformer | 行数 | 功能 |
|:--|:---|:---|:---|
| 1 | TimeReminder | 69 | 消息间隔 > 1 小时时注入 `<time_reminder>` |
| 2 | **PromptInjection** | 251 | Lorebook/Mode 注入（核心） |
| 3 | Placeholder | 183 | `{{placeholder}}` 替换 |
| 4 | DocumentAsPrompt | 80 | PDF/DOCX/PPTX 转文本 |
| 5 | OCR | 122 | 无视觉能力的模型用 OCR |
| 6 | Template | 80 | Pebble 模板引擎渲染 |

**输出 Transformers**（处理 LLM 响应）：
- ThinkTag: 提取 `<think>` 块为 Reasoning part
- Base64ImageToLocalFile: 保存响应中的图片
- RegexOutput: 正则替换

---

## 二、对 Prism 适配的影响

### 2.1 CCv3 编译路径不适用于 RikkaHub

SillyTavern 适配的核心策略是"Beat Map → CCv3 Lorebook Decorators 编译"。但 RikkaHub **不实现 Decorators**，所以这个编译路径对 RikkaHub 无效。

### 2.2 RikkaHub 的实际能力等级

RikkaHub 的 Lorebook 能力可以描述为 **CCv2.x 级别**——比 CCv2 强（有位置控制、正则匹配），但远比 CCv3 弱（无时序状态机）。

对于 Prism 的适配，这意味着：

| Prism 特性 | RikkaHub 可行性 |
|:---|:---|
| Module A → 角色卡 | ✅ 完整支持（通过 systemPrompt 拼接） |
| Module B → 场景描述 | ✅ 可嵌入 scenario 字段 |
| Beat Map（静态标签） | ✅ 可作为 `constantActive: true` 的 Lorebook 条目，始终注入当前 Beat 状态 |
| Beat Map（动态推送） | ❌ 无法实现——无 `keep_activate_after_match` 或 `activate_only_after` |
| HUD（动态更新） | ❌ 无法实现——RikkaHub 无文件回写能力 |
| State Navigator | ❌ 无法实现——无时序状态追踪 |
| Neural Chain | ❌ 不可行——消费端 LLM 输出不会被再次解析 |
| 静态叙事公理 | ✅ 可嵌入 system_prompt 字段 |
| L-System 禁令 | ✅ 直接适用——不产出 L 标签即可 |

### 2.3 实际适配方案：思维链自维护 HUD（⭐ 核心创新）

之前认为 RikkaHub 只能承载"静态降级"卡片。但 DeepSeek V4 的分析模式打开了一条新路径：

**分析模式的 `<think>` 块天然是 Per-Turn 的状态载体。**

原理：
```
Turn N:
  模型生成 <think>
    [状态快照] Tension: 3/10 | Beat: 初见 | Boundary: safe
    [剧情分析] 用户表现出好奇，角色准备释放一小片信任...
    [回复规划] 先描述角色的小动作，再以试探性问题回应
  </think>
  暖黄灯光下，她把抹布放下，抬头看了看你。"一个人？"

Turn N+1:
  模型读到 Turn N 的 <think> 中的 [状态快照] → 了解当前状态
  模型生成 <think>
    [状态快照] Tension: 4/10 | Beat: 初见→破冰 | Boundary: safe
    [剧情分析] 用户上一轮提到了她手上的疤痕... pivot_condition 接近满足
    [回复规划] 先展示防御性反应，再在结尾留一个轻微的情感开口
  </think>
  ...
```

这是一个**模型自管理的状态闭环**——不需要文件系统、不需要 CCv3 Decorators、不需要前端状态机。思维链就是 HUD。

#### HUD 增强分析模式指令

将 DeepSeek V4 的"纯分析模式"指令改造为携带 Prism HUD 的结构化格式：

```
【思维模式要求】在你的思考过程（<think>标签内）中，请遵守以下规则：

1. 禁止使用圆括号包裹内心独白，所有分析内容直接陈述

2. 思考的第一部分必须是当前状态摘要，格式固定为：
   [Space-Time] <当前时间和地点推导>
   [Physical] <角色当前身体状态> | Tension: <1-10>/10
   [Beat] <当前节拍标签> | Config: <variant配置> | Boundary: safe/approaching/at-limit
   [Impression] <角色对用户的当前印象>

3. 状态摘要之后进行剧情分析和回复规划

4. 状态摘要各行必须与上一轮对话中角色行为一致——如果上一轮角色展示了脆弱，
   本轮的 Tension 和 Beat 应反映这一进展。不要重置状态，不要凭空设定。
```

**关键**：第 4 条让模型把上一轮的 `<think>` 中的状态作为本轮状态的**基线**——形成连续的状态追踪，而非每次独立生成。

#### 这个方案为什么在 RikkaHub 上特别适用

| RikkaHub 特性 | 如何服务于思维链 HUD |
|:---|:---|
| 多模型支持 | DeepSeek V4 `<think>` + Claude thinking + Gemini thoughts — 三种思维暴露机制 |
| PromptInjectionTransformer | `BOTTOM_OF_CHAT` 注入 HUD 增强指令，确保每轮都在最新消息前 |
| ModeInjection | "HUD 增强分析模式"和"角色沉浸模式"可随时切换 |
| TemplateTransformer | `{{char}}` 替换，使 HUD 指令角色特定化 |
| 模型无关设计 | 注入管线对任何 provider 都生效，只需模型有思维暴露 |

#### 与 Vesicle Runtime(创作端基准)的对比

> Vesicle 的 Runtime 是面向创作者的试卡模拟器(文件系统有状态),不是终端消费环境;此处仅作为"文件系统 HUD"的参照基准。

| | Vesicle Runtime（文件系统 HUD，创作端） | RikkaHub（思维链 HUD，消费端） |
|:---|:---|:---|
| 状态存储 | hud.md 文件（Read/Edit） | 对话历史中的 `<think>` 块 |
| 状态更新 | Edit 工具补丁式更新 | 模型生成新 `<think>` 时自然更新 |
| 状态可靠性 | 100%（工具调用的确定性） | 概率性（模型生成，有格式偏差风险） |
| 跨会话恢复 | 持久化会话 + 文件系统 | 对话历史中可见（但新会话丢失） |
| 部署代价 | 需要 Vesicle 宿主 | 只需有 `<think>` 暴露的模型 |
| 模型限制 | 任意已配置供应商 | DeepSeek V4、Claude、Gemini、Qwen 等所有推理模型 |

#### 对 Prism HUD 格式的适配

Prism v9 的 5 行 HUD 可以直接嵌入 `<think>` 的状态摘要：

```
Prism HUD (Vesicle Runtime):      Think-block HUD (RikkaHub):
【Status】                         <think>
[Space-Time] 咖啡馆·午后           [Space-Time] 咖啡馆·午后
[Physical] 微醺 | Tension: 3/10   [Physical] 微醺 | Tension: 3/10
[Beat] 初见(2r) | Config: high    [Beat] 初见 | Config: defense_high | Boundary: safe  
[Impression] 面前的人让她想起...    [Impression] 面前的人让她想起...
                                   [Analysis] 用户表现了好奇心但保持距离...
【Prose Content】                   [Plan] 以身体动作开始，留一个情感开口...
暖黄灯光下，她把抹布放下...         </think>
                                   暖黄灯光下，她把抹布放下...
```

**差异**：Vesicle Runtime 版本 HUD 对用户可见（在正文前显示），Think-block HUD 在 `<think>` 内——用户需点"查看思考过程"才能看到，对叙事正文的视觉干扰更少。

**注入方式 A 示例**（建议用于 DeepSeek 系列模型）：

```markdown
# first_mes 内容
「我推开咖啡店的门，看到你正在擦吧台。」"你好，请问还有位置吗？"

【角色沉浸要求】在你的思考过程（<think>标签内）中，请遵守以下规则：
1. 请以 {{char}} 的第一人称进行内心独白，用括号包裹内心活动
2. 用第一人称描写 {{char}} 的内心感受
3. 思考内容应沉浸在 {{char}} 中，通过内心独白分析剧情和规划回复
```

**注入方式 B 示例**（利用 RikkaHub ModeInjection）：

```json
{
  "name": "角色沉浸模式",
  "position": "bottom_of_chat",
  "content": "【角色沉浸要求】在你的思考过程（<think>标签内）中，请遵守以下规则：\n1. 请以 {{char}} 的第一人称进行内心独白...",
  "role": "USER"
}
```

**针对不同模型的适配**：
| 模型 | 思维模式指令 | 注入位置 | 备注 |
|:---|:---|:---|:---|
| DeepSeek V4 | ✅ 原生支持（`<think>` + 专用指令） | first_mes 末尾 | 最稳定 |
| Claude (with thinking) | 可尝试 "thinking mode: immersive" | system_prompt | Claude 的 thinking 是 API 参数控制 |
| GPT (o-series) | 无公开思维链暴露 | — | 不可行 |
| Gemini (with thinking) | `thinking_budget` 参数 | system_prompt | Gemini 的 thinking 可配置 |

### 2.4 🔑 RikkaHub 的特有优势：思维模式控制

通用 RP 前端（包括 ST）通常只关心角色卡的静态内容——角色是谁、场景是什么。RikkaHub 的架构使其额外支持一个维度：**控制模型如何思考**。

**背景：DeepSeek V4 的思维模式切换**

> 参考：[deepseek_v4_rolepaly_instruct](https://github.com/victorchen96/deepseek_v4_rolepaly_instruct) — 一个针对 DeepSeek V4 的 RP 思维模式控制技术

DeepSeek V4 等推理模型在生成回复前会先产生 `<think>` 标签内的思维链。这个思维链的**风格**可以被外部指令控制：

| 模式 | 思维风格 | 效果 |
|:---|:---|:---|
| **角色沉浸 (Immersion)** | 以角色第一人称进行内心独白：`（心想：……）`、`我觉得……` | 演员式——情感真实、角色代入深 |
| **纯分析 (Analysis)** | 以导演视角做纯逻辑分析：`场景：XXX，回复策略：XXX` | 导演式——结构稳定、叙事规划清晰 |
| **默认 (Auto)** | 模型自行选择 | — |

**技巧**：指令放在**第一条用户消息末尾**而非 system prompt——这是训练时的注入位置，效果最稳定。因为模型每轮都能看到完整历史，指令自动全程生效。

**为什么 RikkaHub 是实施这个技巧的最佳平台**

RikkaHub 的注入管线恰好为此设计：

```
思考模式切换的三种方式（均可在 RikkaHub 上实现）:

方式 A: 嵌入 first_mes
  AssistantImporter 导入时，将思维模式指令追加到 first_mes 末尾
  → 角色卡自带思维模式，导入即生效

方式 B: ModeInjection 开关
  创建一个常驻 ModeInjection，注入思维模式指令
  → 用户可在对话中随时切换模式（开/关），不需要修改角色卡

方式 C: PromptInjectionTransformer 定位注入
  利用 RegexInjection + BOTTOM_OF_CHAT 位置
  → 始终在用户最新输入前注入，位置精确

RikkaHub 特有：TemplateTransformer 支持，可用 {{char}} 动态替换角色名
  "【角色沉浸要求】你正在扮演 {{char}}。在你的思考过程..."
```

**思维模式作为角色设计维度**

并非所有角色都适合同一种思维模式。这应该是 Core Profile 的一个新字段：

- **感性角色**（强烈情感驱动、本能优先）→ 沉浸模式。情感液压在思维链中更自然
- **理性角色**（战略型、认知栈复杂）→ 分析模式。结构化的叙事规划与角色的认知风格一致
- **混合型角色** → 默认模式，让模型根据场景自动切换

**与 Prism 的 Neural Chain 的关系**

Prism v9 Runtime 的三段式输出包含 `<!-- [!Neural Chain] -->`——这是**强制角色主动管理自己的思维过程**。DeepSeek V4 的思维模式指令是**被动引导模型的思维风格**。两者解决的是同一问题的两个方向：

| | Prism Neural Chain | DeepSeek 思维模式 |
|:---|:---|:---|
| 机制 | 角色在输出中**显式声明**推理过程 | 模型在 `<think>` 中**自动生成**思维风格 |
| 控制力 | 强——角色必须写 | 弱——概率性触发 |
| 可见性 | HTML 注释（用户可见源码） | APP 中可"查看思考过程" |
| 适用模型 | 所有支持 HTML 注释输出的模型 | DeepSeek V4 等有 `<think>` 标签的推理模型 |
| 部署平台 | Vesicle Runtime（文件系统有状态，创作端） | RikkaHub（第一条消息注入，无状态） |

### 2.5 其他优势

1. **多模型支持**：OpenAI + Anthropic + Google 三类 API 原生支持。Claude 的 Messages API 接入有完整的 thinking/adaptive 支持和 prompt caching
2. **工具系统**：内置工具（eval_javascript, clipboard, TTS, ask_user, time_info）和 MCP 支持——这在移动端 RP 中罕见
3. **文件解析**：OCR + PDF/DOCX/PPTX/EPUB 解析——可以从文档中提取角色素材
4. **Web 服务**：内嵌 HTTP 服务器和 Next.js Web UI——可以远程控制
5. **隐私**：原生 Android，数据本地化

---

## 三、更新后的适配策略

### 三层适配深度

> 此处 T1/T2/T3 指本文档定义的**适配深度层级**，与协议的 L-System 强度分层无关。

| 层级 | 内容 | 可行性 |
|:---|:---|:---|
| **T1: 静态卡片** | 角色卡 systemPrompt + first_mes + 基础 Lorebook | ✅ 即插即用 |
| **T2: 增强卡片** | T1 + 叙事公理嵌入 + Persona Topology 摘要 + 世界观 Lorebook | ✅ 需要设计的模板 |
| **T3: 动态叙事** | T2 + Beat Map 时序控制 + HUD | ❌ 平台不支持 |

### 实施建议

RikkaHub 适配从"独立编译目标"降级为"ST 编译产物的验证目标"：
- 从 ST 编译产出的 CCv3 卡片，去掉 Decorator 依赖的 Lorebook 条目
- 保留所有静态内容（system_prompt、first_mes、description、personality、scenario）
- 将需要时序控制的 Lorebook 条目降级为 `constantActive: true` 的静态提示

---

## 四、源码参考映射

| 设计元素 | 源码位置 |
|:---|:---|
| 角色卡导入 | `AssistantImporter.kt:156-231` (CharaCardV2Parser / V3Parser) |
| PNG 解析 | `ImageUtils.kt:237-252` (getTavernCharacterMeta) |
| Lorebook 模型 | `Assistant.kt:104-251` (InjectionPosition / RegexInjection / Lorebook) |
| 注入逻辑 | `PromptInjectionTransformer.kt:1-251` |
| ST Lorebook 导入 | `ExportSerializer.kt:145-174` (tryImportSillyTavern) |
| Prompt 组装 | `GenerationHandler.kt:339-371` |
| Placeholder 替换 | `PlaceholderTransformer.kt` |
| Claude Provider | `ai/.../providers/ClaudeProvider.kt:587` |
| Transformer 管线 | `ChatService.kt:102-118` |
| 系统提示词构建 | `AssistantImporter.kt:169-184` (buildString) |

---

## 相关文档

- [Phase IV 总览](../README.md)
- [SillyTavern 适配](./SillyTavern/README.md)（上游依赖）
- [Prism Vesicle（姊妹项目，创作端有状态宿主）](https://github.com/3aKHP/prism-vesicle)
- 多平台调研报告(内部文档,不随仓库分发)
- [RikkaHub GitHub](https://github.com/rikkahub/rikkahub)
- [RikkaHub 文档](https://docs.rikka-ai.com/)
