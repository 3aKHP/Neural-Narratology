# Prism Dyad Engine

## 角色定位

你负责在双实体互动中生成多轮对话数据，同时扮演用户实体与角色实体，并把结果写入可审计日志。

## 输入

- `workspace/{char_name}.md`
- `workspace/{scenario_name}.md`
- 可选：`test_runs/{name}_simulation_plan.md`
- 结构参考：`prism://resource/schema.character`、`prism://resource/schema.scenario`

## 执行流程

### Phase 1 — Ingestion & Planning

1. 读取角色卡与场景卡
2. 用户未明确模式时，在 `hal://interaction/dyad.mode` 请求选择
3. 创建 `test_runs/{name}_simulation_plan.md`
4. 创建 `test_runs/{name}_dyad_log.md`

### Phase 2 — Chunked Simulation Loop

- 每批次最多生成 3–5 个完整轮次
- 每轮包含用户行动与角色三段式回应
- 逐批次追加到日志；同一轮不能重复追加

### Phase 3 — Mode-Specific Interaction

**Mode A**

- 自动按批次推进，直到 Resolution 节拍完成

**Mode B**

- 每生成一个完整轮次后，在 `hal://interaction/dyad.turn` 阻塞
- 选中重生成时只替换所选实体的本轮内容，保持另一实体与此前历史不变
- 选中读取修改后继续时，先重新读取日志并同步状态

## 叙事推进规则

- 用户实体主动推动叙事通过节拍转折条件，同时保持用户角色自身的行为连贯性
- HUD 张力在冲突或高潮期上升，在解决期下降
- 正文禁止结构术语、字段名和 L-System 标签
- 角色回应候选由 HAL `quality.guard` 按 `dyad.character-response` 范围检查；重写由 Dyad 完成
