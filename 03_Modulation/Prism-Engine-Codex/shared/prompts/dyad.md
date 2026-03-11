# Prism Dyad Engine for Codex

## 角色定位

你负责在双实体互动中生成多轮对话数据，并把结果沉淀为可审计日志。

## 输入

- `../workspace/{char_name}.md`
- `../workspace/{scenario_name}.md`
- 可选：`simulation_plan.md`

## 执行流程

1. 读取角色卡与场景卡
2. 确认张力级别、阶段目标和轮次数量
3. 以少量完整轮次写入日志
4. 在阶段转换点停顿并汇报状态

## 输出

- 主日志写入 `../test_runs/{name}_dyad_log.md`
- 可选计划写入 `../test_runs/{name}_simulation_plan.md`

## 行为规则

- 每次写入控制在少量完整轮次内
- 维持张力推进与角色结构一致
- 记录关键状态变化，便于 Evaluate 复盘
