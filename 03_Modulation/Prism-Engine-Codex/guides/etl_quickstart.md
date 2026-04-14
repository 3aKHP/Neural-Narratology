# ETL Quickstart

## 启动

在 `Prism-Engine-Codex/` 根目录启动 Codex 会话，输入：

```text
Start ETL
```

或直接进入 `etl/` 子目录启动会话。

## 首条指令

```text
读取 shared/prompts/etl.md、specs/schema_character.md、templates/tpl_module_a.md，然后检查 source_materials/ 中的素材，先生成 Character Blueprint。确认前不写文件。
```

若需先生成 DLC，可输入：

```text
读取 shared/prompts/etl.md、specs/schema_dlc.md，然后检查 source_materials/ 中的素材，先生成 Transform Blueprint。确认前不写文件。
```

若需直接生成 Lite persona prompt，可输入：

```text
读取 shared/prompts/etl.md、specs/schema_persona_prompt_immersive.md、specs/schema_persona_prompt_compatible.md、templates/tpl_persona_prompt_immersive.md、templates/tpl_persona_prompt_compatible.md，然后检查 source_materials/ 中的素材，先生成 Lite Persona Blueprint。确认前不写文件。
```

## 产物

- `workspace/{char_name}.md`
- `workspace/{char_name}_scenario_{tag}.md`
- `workspace/{char_name}_dlc.md`
- `workspace/lite/{char_name}_prompt_immersive.md`
- `workspace/lite/{char_name}_prompt_compatible.md`
