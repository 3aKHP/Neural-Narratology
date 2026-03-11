# Weaver Start Prompt

初始化章节场景文件后，进入 `weaver/` 目录对 Codex 输入：

```text
Read ../shared/prompts/weaver.md, ../novels/<project>/outline.md, ../novels/<project>/story_bible.md, the target character card, and the current chapter scene shard. Write only the current scene and stop.
```

完成若干场景后可输入：

```text
Compile readiness check: verify the current chapter scene shards are coherent, then tell me whether to run ../scripts/compile_chapter.ps1 or ../scripts/compile_chapter.sh.
```
