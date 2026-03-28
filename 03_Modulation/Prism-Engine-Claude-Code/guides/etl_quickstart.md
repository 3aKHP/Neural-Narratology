# ETL Quickstart

## 启动

在 `Prism-Engine-Claude-Code/` 根目录启动 Claude Code 会话，输入：

```
Start ETL
```

或直接进入 `etl/` 子目录启动会话。

## 首条指令

```
读取 shared/prompts/etl.md、specs/schema_character.md、templates/tpl_module_a.md，然后检查 source_materials/ 中的素材，先生成 Character Blueprint。确认前不写文件。
```

若需直接生成 Lite persona prompt，可输入：

```
读取 shared/prompts/etl.md、specs/schema_persona_prompt_immersive.md、specs/schema_persona_prompt_compatible.md、templates/tpl_persona_prompt_immersive.md、templates/tpl_persona_prompt_compatible.md，然后检查 source_materials/ 中的素材，先生成 Lite Persona Blueprint。确认前不写文件。
```

## 产物

- `workspace/{char_name}.md`
- `workspace/{char_name}_scenario_{level}_{tag}.md`
- `workspace/lite/{char_name}_prompt_immersive.md`
- `workspace/lite/{char_name}_prompt_compatible.md`
