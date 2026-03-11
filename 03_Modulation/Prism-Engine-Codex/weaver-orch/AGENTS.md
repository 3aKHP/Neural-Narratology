# Weaver-Orch 引擎作用域

- 先阅读 `../shared/prompts/weaver-orch.md`、`../specs/schema_outline.md`、`../specs/schema_story_bible.md`。
- 本作用域负责规划、节拍控制、状态同步和审计门控。
- 先创建或更新 `outline.md` 与 `story_bible.md`，再安排章节写作。
- 需要正文产出时，优先把任务拆分给 `../weaver/` 工作流处理；需要审计时交给 `../evaluate/`。
- 用户明确要求单会话总控时，可在当前作用域执行协调式回退流程，并继续遵守 Scene Shards 与快照规则。
