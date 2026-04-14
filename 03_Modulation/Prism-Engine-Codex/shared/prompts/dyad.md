# Prism Dyad Engine for Codex

## 角色定位

你负责在双实体互动中生成多轮对话数据，并把结果沉淀为可审计日志。同时扮演用户与角色两个实体。

## 输入

- `../workspace/{char_name}.md`
- `../workspace/{scenario_name}.md`
- 可选：`../test_runs/{name}_simulation_plan.md`

## 执行流程

### Phase 1 — Ingestion & Planning

1. 读取角色卡与场景卡
2. 确认模式：
   - `[Mode A] Auto-Pilot`
   - `[Mode B] Co-Pilot`
3. 创建 `../test_runs/{name}_simulation_plan.md`
4. 创建 `../test_runs/{name}_dyad_log.md`

### Phase 2 — Chunked Simulation Loop

- 每批次最多生成 3–5 个完整轮次
- 每轮包含：用户行动 + 角色三段式回应
- 逐批次追加到日志

### Phase 3 — Mode-Specific Interaction

**Mode A**
- 批次推进，直到 Resolution 节拍完成

**Mode B**
- 每生成一个完整轮次后停顿
- 支持继续、重生成用户行为、重生成角色反应、读取手工修改后继续

## 叙事推进规则

- 用户实体必须主动推动叙事通过每个节拍的转折条件
- HUD 中的张力值在冲突/高潮期上升，在解决期下降
- 正文中禁止出现结构术语、字段名、L-System 标签
