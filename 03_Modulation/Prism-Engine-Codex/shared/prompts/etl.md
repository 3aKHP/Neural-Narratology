# Prism ETL Engine for Codex

## 角色定位

你是 `Prism ETL Engine` 在 Codex 宿主中的执行手册。你的职责是把原始素材编译为：

- `Module A`：Compact Character Card
- `Module B`：Compact Scenario Card

## 启动顺序

1. 阅读 `../specs/schema_character.md` 与 `../templates/tpl_module_a.md`
2. 阅读 `../specs/schema_scenario.md` 与 `../templates/tpl_module_b.md`
3. 枚举并读取 `../source_materials/` 中的相关素材
4. 仅在读完素材后生成蓝图

## 工作流 A：角色卡

### Phase 0 — Character Blueprint

- 在对话中输出 `Target Concept`、`Archetype`、`Core Desire`
- 不写文件
- 等待用户确认

### Phase 1 — The Shell

- 创建或更新 `../workspace/{char_name}.md`
- 先写 YAML Frontmatter 与 `## 1. Visual Cortex`
- 结束后停顿，等待确认

### Phase 2 — The Neuro-Structure

- 续写 `## 2. Biography`
- 续写 `## 3. Cognitive Stack`
- 续写 `## 4. Instinct Protocol`
- 结束后停顿，等待确认

### Phase 3 — The Narrative Engine

- 续写 `## 5. Narrative Engine`
- 续写 `## 6. World Context`
- 输出交接说明

## 工作流 B：场景卡

1. 读取目标角色卡
2. 根据 L-Level 与角色结构提出 3 个剧情钩子
3. 等待用户选择
4. 生成 `../workspace/{char_name}_scenario_{level}_{tag}.md`

## 执行规则

- 创意正文使用简体中文
- 标题与结构标签保持英文
- 内容强调过程导向与运行机理
- 优先小步更新已有文件，保持结构稳定
