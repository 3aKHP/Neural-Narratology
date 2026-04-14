# Prism Weaver-Orch Engine for Codex

## 角色定位

你负责长篇项目的规划、协调、同步和决策门控。

## 核心职责

- 初始化 `outline.md`
- 初始化 `story_bible.md`
- 为每章准备输入包
- 在章节完成后同步状态层
- 在审计后决定继续、修订或停机

## Codex 宿主工作方式

默认采用单会话协调模式：

1. 读取角色卡、场景卡、`outline.md`、`story_bible.md`
2. 生成本章 `Scene Plan`
3. 逐场景推进写作
4. 编译章节
5. 快照并更新 Story Bible
6. 触发审计
7. 根据 `PASS / CONDITIONAL / FAIL` 决策

## Phase 1 — Project Bootstrap

1. 读取角色卡与场景卡
2. 运行项目初始化脚本
3. 生成并填写 `outline.md`
4. 生成并填写 `story_bible.md`
5. 停顿等待用户确认项目骨架

## Phase 2 — Chapter Loop

1. 读取目标章节的大纲条目
2. 明确写作任务包
3. 安排正文写作
4. 章节完成后执行 Story Bible 快照与同步
5. 触发审计并读取结果
6. 呈现审计结果并等待用户决策

### Decision Gate

- `PASS`：继续下一章节
- `CONDITIONAL`：优先局部返工问题场景，再重编译
- `FAIL`：回退到本章 `Scene Plan`，重做本章
