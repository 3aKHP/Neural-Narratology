# SillyTavern 适配

> **伪有状态路径：Prism Core Profile → CCv3 编译**

## 平台特征

SillyTavern 是当前最主流的开源 LLM RP 前端：
- **卡格式**：CCv3 JSON/PNG/CHARX（完整 spec 支持）
- **Lorebook**：CCv3 Lorebook Decorators 提供了声明式状态机能力
- **Prompt 组装**：高度可配置（Story String、System Prompt、Post-History Instructions、Author's Note、In-Chat @ Depth）
- **社区**：全球最大 RP 前端社区 + 中文"类脑社区"

## 核心挑战

ST 的消费 LLM 是**无状态**的——每轮只是一个独立的 API 请求。Prism 的动态叙事机制（HUD 更新、State Navigator、节拍追踪）必须被"编译"为静态的声明式触发规则。

**好消息是 CCv3 的 Lorebook Decorators 为此提供了基础设施。**

## 编译路径设计

### Step 1: Core Profile → CCv3 JSON（静态映射）

| Core Profile 字段 | CCv3 目标字段 | 映射策略 |
|:---|:---|:---|
| `name` | `data.name` | 直接映射 |
| `appearance` + `archetype` | `data.description` | 合并为 Markdown 散文 |
| `voice_profile` + `cognitive_stack` 摘要 | `data.personality` | 压缩为紧凑描述 |
| `world_context` + 初始场景 | `data.scenario` | 合并 |
| 开场白 | `data.first_mes` | 直接映射 |
| 对话风格示例 | `data.mes_example` | **关键字段**——从 Narrative Engine 的 voice_profile 生成 |
| 叙事公理 + 行为约束 | `data.system_prompt` | 从 Core Profile 的边界条件提取 |
| 输出格式约束 + Jailbreak | `data.post_history_instructions` | 继承 v9 Runtime 的三段式输出规范 |
| 创作者备注 + Persona Topology 摘要 | `data.creator_notes` | 为高级用户提供拓扑参考 |
| 备用开场白 | `data.alternate_greetings` | 从 Scenario 的多个钩子生成 |
| 角色版本 | `data.character_version` | 沿用 Core Profile 版本号 |

### Step 2: Beat Map → Lorebook（动态编译）⭐ 核心创新

这是 Phase IV 最有学术价值的编译规则。Prism v9 的 Beat Map 定义了一个场景的叙事节拍序列：

```yaml
beat_map:
  - label: "初见试探"
    tension_target: 2
    variant_config: "defense_high"
    pivot_condition: "角色首次展示脆弱信号"
  - label: "张力升级"
    tension_target: 5
    variant_config: "defense_crack"
    pivot_condition: "双方建立初步信任"
  - label: "情感爆发"
    tension_target: 8
    variant_config: "defense_dropped"
    pivot_condition: "场景自然结束或用户明确推进"
```

编译为 CCv3 Lorebook 条目：

```json
{
  "entries": [
    {
      "keys": ["场景启动标记"],
      "content": "@@activate_only_after 0\n@@keep_activate_after_match\n@@position after_desc\n\n[Phase: 初见试探] 角色处于防御高位。语言谨慎、保持距离。注意身体边界。",
      "enabled": true,
      "constant": true,
      "insertion_order": 100
    },
    {
      "keys": ["信任", "脆弱", "坦诚", "秘密"],
      "content": "@@activate_only_after 3\n@@keep_activate_after_match\n@@position after_desc\n\n[Phase: 张力升级] 防御开始出现裂痕。语言更直接。允许适度的情感暴露。物理距离自然缩小。",
      "enabled": true,
      "insertion_order": 200
    },
    {
      "keys": ["想要", "需要", "渴望", "触碰"],
      "content": "@@activate_only_after 8\n@@keep_activate_after_match\n@@depth 1\n@@role system\n\n[Phase: 情感爆发] 防御已放下。直接表达欲望和情感。边界重新协商中。注意：不要跳过情感过渡——情绪是逐步升温而非跳跃。",
      "enabled": true,
      "insertion_order": 300
    }
  ]
}
```

**编译规则（待形式化）：**
1. 每个 Beat → 一个或多个 lorebook 条目
2. Beat 的激活时机 = `@@activate_only_after N`（N = 预期激活所需的对话轮数）
3. Beat 的持续 = `@@keep_activate_after_match`（状态保持）
4. Beat 的触发 = `keys` 使用 pivot_condition 中的关键词
5. 张力级别 = `variant_config` 翻译为叙事行为指令
6. HUD 基线 = `constant: true` 条目，始终在线，包含当前 Beat 标签

### Step 3: State Navigator → In-Chat Author's Note（运行时近似）

Prism 的 State Navigator 每轮追踪：
- 当前 Beat 进度
- 张力级别
- Variant 配置
- 边界接近度

在 ST 中，这些可以通过 **Author's Note** 功能近似——在特定消息深度定期注入：
- 每 4 轮注入当前"推荐"的叙事状态摘要
- 但这是**静态建议**，不是真正的双向状态追踪——LLM 可以选择忽略

### Step 4: 动态 HUD → `constant: true` Lorebook + `@@depth 1`

```
@@depth 1
@@role system

[Status]
Time: [由对话推导] | Place: [由对话推导]
Tension: [由对话推导] / 10 | Beat: [当前叙事节拍]
Boundary: safe | Config: [当前 variant 配置]
```

这是 ST 环境下最接近 Prism HUD 的等价物——始终在 prompt 最近处可见，但不保证每个模型都会严格遵循。

## 已知局限

1. **Lorebook 不被 LLM 强制遵循**：与 Prism Runtime 中 Claude 主动管理 State Navigator 不同，ST 的 Lorebook 只是被动注入文本——LLM 可能忽略
2. **无"写回"**：Lorebook 不能被对话中的 LLM 修改——Beat 推进只能由关键词匹配触发，不能由 LLM 主动判定"条件已满足"
3. **Decorator 实现完整性**：不同 ST 版本和前端的 Decorator 实现程度不一。需要测试关键 decorators（`@@activate_only_after`、`@@keep_activate_after_match`、`@@depth`、`@@role`）在实际 ST 环境中的行为
4. **mes_example 质量**：CCv3 的 `mes_example` 字段对角色声纹一致性至关重要。Core Profile 中目前没有直接对应的"对话样本"层——这是需要补充的

## 待完成

- [ ] Core Profile → CCv3 JSON 字段映射表（完整版）
- [ ] Beat Map → Lorebook 编译算法（形式化定义）
- [ ] L-System 禁令在 ST 环境中的落地（确保 L 标签不出现在产出卡中）
- [ ] 实际 ST 环境中的 Decorator 兼容性测试
- [ ] 中文社区（类脑）的卡片创作实践对照

## 相关文档

- [Phase IV 总览](../README.md)
- [Core Profile 设计](../Core-Profile/README.md)
- [CCv3 完整 Spec](https://github.com/kwaroran/character-card-spec-v3/blob/main/SPEC_V3.md)
- 多平台调研报告(内部文档,不随仓库分发)
