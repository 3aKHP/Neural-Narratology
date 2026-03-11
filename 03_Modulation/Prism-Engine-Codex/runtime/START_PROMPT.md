# Runtime Start Prompt

先初始化日志文件，再进入 `runtime/` 目录对 Codex 输入：

```text
Read ../shared/prompts/runtime.md, then load the referenced character card, scenario card, and current session log in ../test_runs. Write the opening response into the log and stop for user input.
```

重生成上一轮时可输入：

```text
Re-read the current session log, replace only the last character turn, preserve history, and append the next user placeholder.
```
