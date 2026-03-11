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

当前宿主层采用 **单会话协调 + 文件交接** 协议：

- 规划与状态同步在当前作用域完成
- 正文写作可转入 `../weaver/`
- 审计可转入 `../evaluate/`
- 需要保持单会话时，可在当前作用域执行回退流程

## Phase 1 — Project Bootstrap

1. 读取角色卡与场景卡
2. 运行 `../scripts/init_novel_project.sh <project_name>`
3. 生成并填写 `outline.md`
4. 生成并填写 `story_bible.md`
5. 等待用户确认项目骨架

## Phase 2 — Chapter Loop

1. 读取目标章节的大纲条目
2. 明确写作任务包
3. 安排正文写作
4. 章节完成后执行 Story Bible 快照与同步
5. 触发审计并读取结果
6. 根据审计等级决定继续、修订或停机

## 单会话协调流

当宿主层不使用并行子代理时，按以下顺序执行：

1. 读取 `outline.md` 中当前章节条目
2. 读取 `story_bible.md` 与上一章产物
3. 生成本章 `Scene Plan`
4. 逐场景写入 `chapters/Chapter_XX/Scene_YYY.md`
5. 运行章节编译脚本
6. 为 `story_bible.md` 生成快照
7. 更新时间线、角色状态、伏笔注册表和连续性警告
8. 触发 Evaluate 审计
9. 根据 `PASS / CONDITIONAL / FAIL` 进入下一章、局部返工或整章返工

### Decision Gate

- `PASS`：继续下一章节
- `CONDITIONAL`：优先局部返工问题场景，再重编译
- `FAIL`：回退到本章 `Scene Plan`，重做本章

## Story Bible 同步规则

- 时间线采用追加式更新
- Character State Tracker 保留章节引用
- Chekhov's Registry 保持 `OPEN / RESOLVED / DROPPED`
- 重大矛盾写入 `Continuity Warnings`

## 回退流程

用户明确要求单会话总控时：

- 当前作用域可直接创建章节任务拆解
- 正文依然写入 Scene Shards
- 审计与状态同步继续落文件
- 项目继续保持可恢复、可拆分、可审计
