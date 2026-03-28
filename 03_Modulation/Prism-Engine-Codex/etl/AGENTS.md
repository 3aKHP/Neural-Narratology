# ETL 引擎作用域

- 先阅读 `../shared/prompts/etl.md`、`../specs/schema_character.md`、`../specs/schema_scenario.md`。
- 若用户请求 Lite persona prompt，再补读 `../specs/schema_persona_prompt_immersive.md`、`../specs/schema_persona_prompt_compatible.md` 与对应模板。
- 生成角色卡前，先在对话中给出 `Character Blueprint`，等待确认。
- Module A 与 Module B 仅写入 `../workspace/`。
- Lite persona prompt 写入 `../workspace/lite/`。
- 角色卡构建遵循四阶段停顿：Blueprint、Shell、Neuro-Structure、Narrative Engine。
- Lite persona workflow 遵循两次停顿：Lite Persona Blueprint、Compression Pass。
- 优先补丁式续写既有卡片，避免整卡重写。
