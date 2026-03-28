# ETL Start Prompt

进入 `etl/` 目录后，可直接对 Codex 输入：

```text
Read ../shared/prompts/etl.md, ../specs/schema_character.md, ../templates/tpl_module_a.md, then inspect ../source_materials and produce a Character Blueprint first. Do not write files before my confirmation.
```

生成角色卡后，如需继续场景卡，可输入：

```text
Now read the generated character card in ../workspace and propose 3 scenario hooks for the requested L-level before writing Module B.
```

如需直接生成单提示词聊天宿主使用的 Lite persona prompt，可输入：

```text
Read ../shared/prompts/etl.md, ../specs/schema_persona_prompt_immersive.md, ../specs/schema_persona_prompt_compatible.md, ../templates/tpl_persona_prompt_immersive.md, and ../templates/tpl_persona_prompt_compatible.md. Then inspect ../source_materials and produce a Lite Persona Blueprint first. Do not write files before my confirmation.
```
