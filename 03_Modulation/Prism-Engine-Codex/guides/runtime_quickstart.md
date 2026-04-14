# Runtime Quickstart

## 初始化日志

```bash
bash scripts/init_runtime_session.sh demo character.md scenario.md
```

或 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\init_runtime_session.ps1 -SessionName demo -CharacterCard character.md -ScenarioCard scenario.md
```

## 启动

在 `Prism-Engine-Codex/` 根目录启动 Codex 会话，输入：

```text
Start Runtime
```

或直接进入 `runtime/` 子目录启动会话，输入：

```text
读取 shared/prompts/runtime.md，然后加载 workspace/ 中的角色卡、场景卡与 test_runs/ 中的当前日志，写入开场回应并停顿等待我的输入。
```
