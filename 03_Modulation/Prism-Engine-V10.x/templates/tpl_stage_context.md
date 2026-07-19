# Stage Context Template

> 用途：Stage 会话 bootstrap 时，宿主读取 Module A（角色卡）与 Module B（场景卡），按本模板拼装为注入文本——Module A 注入 System Prompt，Module B 注入为首条 assistant message。{占位符} 由 bootstrap 从 Module A/B 提取填入。

## 一、System Prompt 注入段

在 engine prompt 之后追加（Module A 的 frontmatter 转为摘要行，七段正文原样保留）：

```
--- CHARACTER CONTEXT (HOST-INJECTED) ---

## Character

**{module_a.name}** · {module_a.archetype} · {module_a.age_gender}
Inventory: {module_a.inventory}

{module_a.body}
```

## 二、首条 assistant message

Module B 拆为表演层（游玩者可见）与逻辑层（HTML 注释，游玩者默认隐藏、长按可查，模型始终可见），注入为本会话首条 assistant message：

```
{module_b.opening_paragraph}

"{module_b.first_line}"

<!--
## Scene Premise
{module_b.scene_premise}

## Neural State
- Surface emotion: {module_b.surface_emotion}
- Tension source: {module_b.tension_source}
- Active lens: {module_b.active_lens}

## User Role
- Identity: {module_b.identity}
- Immediate goal: {module_b.immediate_goal}

## First Beat
label: {module_b.first_beat.label}
tension_target: {module_b.first_beat.tension_target}
variant_config: {module_b.first_beat.variant_config}
-->
```

## 三、字段提取约定

- `{module_a.body}`：Module A 去掉 YAML frontmatter 后的七段正文（Visual Cortex / Biography / Cognitive Stack / Instinct Protocol / Persona Topology / Narrative Engine / World Context）。
- `{module_b.opening_paragraph}`：Module B HTML 注释之前的开场散文（80–150 字，第三人称感知滤镜）。
- `{module_b.first_line}`：开场段后引号内的角色首句台词。
- `{module_b.scene_premise}` / `{module_b.surface_emotion}` / `{module_b.tension_source}` / `{module_b.active_lens}` / `{module_b.identity}` / `{module_b.immediate_goal}`：Module B `<!-- -->` 内对应字段。
- `{module_b.first_beat.*}`：Module B YAML frontmatter 中 `beat_map` 的首条目。
