# Prism-Engine-V7.x-Installer

## 定位
- 用途：为 Prism Engine Universe v7.x 提供可分发的安装器、模板与 RooCode 模式补丁。
- 入口脚本：`Install.ps1`
- 支持两种安装模式：`Mode A`（模板内置 `.roo` 提示词）与 `Mode B`（全局 Rules Pack）

## 目录说明
- `Install.ps1`：主安装脚本，负责复制模板、合并模式 YAML、按需安装 Rules Pack。
- `Prism-Engine-Universe-V7.0-Template/`：安装到 VSCode Project Templates 的工程模板骨架。
- `PresetYAML-ModeA/`：Mode A 使用的分拆式 RooCode 自定义模式 YAML。
- `PresetYAML-ModeB/`：Mode B 使用的分拆式 RooCode 自定义模式 YAML。
- `custom_modes_patch.yaml`：Mode B 可直接整体并入 `custom_modes.yaml` 的单文件补丁。
- `rules-prism-*/`：Mode B 安装到 `%USERPROFILE%\.roo\` 的 XML 规则包。

## 安装模式
- `Mode A`：复制完整模板到 VSCode Project Templates，并把 `PresetYAML-ModeA` 合并进 RooCode 的 `custom_modes.yaml`。
- `Mode B`：先安装 `rules-prism-*` 到 `%USERPROFILE%\.roo\`，再复制去除了模板内 `.roo/system-prompt-*` 的模板，同时把 `PresetYAML-ModeB` 合并进 `custom_modes.yaml`。

## 默认安装位置
- `ProjectTemplatesRoot`：`$env:APPDATA\Code\User\ProjectTemplates`
- `ModesFile`：`$env:APPDATA\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\custom_modes.yaml`
- `TargetRoo`：`$env:USERPROFILE\.roo`

## 使用示例

### 安装传统模板模式（Mode A）

```powershell
powershell -ExecutionPolicy Bypass -File .\Install.ps1 -Mode A -Backup
```

### 安装 Rules 模式（Mode B）

```powershell
powershell -ExecutionPolicy Bypass -File .\Install.ps1 -Mode B -Backup
```

### 覆盖已存在安装

```powershell
powershell -ExecutionPolicy Bypass -File .\Install.ps1 -Mode B -Backup -Force
```

## 脚本行为
- 若未检测到 VSCode `ProjectTemplates` 目录，脚本会提示是否自动创建。
- `-Backup` 会在改写 `custom_modes.yaml` 前生成时间戳备份。
- `-Force` 会覆盖已存在的模板目录或 Rules 目录。
- 未指定 `-Mode` 时，脚本会交互询问选择 `A` 或 `B`。

## 安装后验证
- VSCode 的 Project Templates 中应出现 `Prism-Engine-Universe-V7.0-Template`
- RooCode 模式切换器中应出现：`Prism ETL Engine`、`Prism Runtime Engine`、`Prism Evaluation Unit`、`Prism Weaver Engine`、`Prism Dyad Engine`
- 若使用 `Mode B`，`%USERPROFILE%\.roo\` 下应出现 `rules-prism-etl`、`rules-prism-runtime`、`rules-prism-evaluate`、`rules-prism-weaver`、`rules-prism-dyad`

## 相关文件
- 总说明：`03_Modulation/README.md:1`
- 模板说明：`03_Modulation/Prism-Engine-V7.x-Installer/Prism-Engine-Universe-V7.0-Template/README.md:1`
