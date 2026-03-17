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

## 产物

- `workspace/{char_name}.md`
- `workspace/{char_name}_scenario_{level}_{tag}.md`
