# Prism-Engine-V10.x

> **Prism Engine v10.0 Tempered-Voice —— 面向 Prism Vesicle 的工程源文件**

## 定位

`Prism-Engine-V10.x` 是 Prism Engine 六引擎矩阵在 **v10.0 Tempered-Voice** 协议下的工程源文件目录。

**自 V10 起，[Prism Vesicle](https://github.com/3aKHP/prism-vesicle)（Bun + TypeScript 直连 API 宿主）是 Phase III 唯一的开发目标平台。** Codex CLI、Claude Code CLI 等此前的宿主适配层已从 V10 支持栈中排除；本目录不含任何宿主品牌信息或宿主特定假设（如目录作用域、`AGENTS.md` 模式切换）。历史宿主适配保留在 [`../Prism-Engine-Codex/`](../Prism-Engine-Codex/) 与 [`../Prism-Engine-Claude-Code/`](../Prism-Engine-Claude-Code/)，两者冻结于 v9.0，不再随 V10 演进。

本目录只承载**协议内容层**——六引擎行为手册、schema 定义、模板。不承载 Vesicle 侧的宿主粘合层（profile 配置、工具调用绑定等，见"本轮边界"）。

## 目录结构

```
Prism-Engine-V10.x/
├── prompts/       # 六引擎行为手册
│   ├── etl.md
│   ├── runtime.md
│   ├── evaluate.md
│   ├── weaver.md
│   ├── weaver-orch.md
│   └── dyad.md
├── specs/          # 7 个 schema 定义
└── templates/       # 6 个模板文件
```

对应 Vesicle 侧未来预期的落点：`prompts/*.md` → `assets/prompts/engines/*.md`；`specs/*.md` → `assets/specs/*.md`；`templates/*.md` → `assets/templates/*.md`（映射方式与命名参照姊妹项目 2026-07-07 的 v9.0 资产拷贝先例，具体以实际移植会话为准）。

## 内容来源

- **`prompts/*.md`**：以历史 `Prism-Engine-Codex/shared/prompts/*.md` 为底稿改写——这是仓库里最接近"面向程序化宿主、无 IDE 装饰"语域的版本。改写时剥离了 Codex 专属框架（宿主名称、目录作用域路径前缀 `../`），应用 v10 语言层现代化，并接入 [`shared/anti-ai-flavor/`](../../shared/anti-ai-flavor/) 模块（Runtime / Weaver / Weaver-Orch / Dyad 四个产出散文的引擎各自内嵌一份精简摘要，不使用跨仓库相对路径——理由见下）。
- **`specs/*.md`、`templates/*.md`**：以历史 `Prism-Engine-V9.x/specs|templates/` 为底稿——这是未独立漂移的干净版本（`Prism-Engine-Codex` 的对应文件已独立漂移）。`schema_scenario.md` 额外修复了 `L4-B` 强度层级硬编码默认值（"默认协议：重量崇拜"）的 bug，与 Phase II `02_Resonance/v10_Tempered-Voice/` 的 Kernel 修复同源：具体内容领域须从角色拓扑推导，无法推导则标记 gap，不回落任何预设默认。

## 为什么不用跨仓库相对路径引用反 AI 味模块

Vesicle 侧资产加载是**拷贝制**（2026-07-07 那次拷贝记录明确写"非引用/编译"），本目录未来落地进 Vesicle `assets/` 时也会以同样方式拷贝，届时目录树相对位置与本仓库不同。任何指向 `shared/anti-ai-flavor/` 的相对路径链接在拷贝后都会失效。因此四个产出散文的引擎手册各自内嵌了一份精简摘要（4–6 条最高严重度规则），而非链接引用。

## 本轮边界

以下内容**不在本目录**，留给实际移植进 Prism Vesicle 的会话按当时的真实工具表与代码现状编写，此刻预先编写有与实现脱节的风险：

- `*.profile.yaml`（引擎 profile 配置）
- `vesicle-base.md`（宿主身份与工具契约样板）
- 具体工具调用语法（如确认门、引擎切换的实际函数签名）
- Vesicle 仓库本身的任何改动

State Navigator 从日志文件迁移到宿主结构化 state packet 的重新设计同样不在本轮范围（见姊妹项目记忆 `vesicle-harness-contract` 与 `v10-development-scope`）。
