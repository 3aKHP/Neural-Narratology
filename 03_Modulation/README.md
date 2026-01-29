# Phase III: Modulation (调制)

> **基于 VSCode + RooCode 的自动化角色铸造流水线**
> *IDE-Native Automated Character Foundry based on VSCode & RooCode*

## 🌔 项目概述 (Overview)

**Phase III: Modulation** 是 "Neural Narratology" 计划的工程化终章。

面对 v6.0 协议 (Omni-Foundry) 极高的复杂度，手工编写 XML 已不再现实。本项目引入了 **Prism-ETL Engine** —— 一个运行在 VSCode 环境中的虚拟智能体。它利用 RooCode 插件的能力，将 LLM 从“聊天机器人”重塑为“文件系统操作员”，实现了从原始素材到最终资产的 **Zero-Copy** 自动化生产。

## 📦 目录结构 (Directory Structure)

*   **`Prism-ETL/`**: 核心工程文件夹。请将此文件夹作为 VSCode 的工作区根目录打开。
    *   `.roo/`: 包含系统级提示词 (System Prompt)。
    *   `specs/`: v6.0 协议的 Schema 定义 (XML/Markdown)。
    *   `templates/`: 标准化样板代码。
    *   `workspace/`: 你的工作区（生成结果会出现在这里）。
    *   `source_materials/`: 放入你的原始素材（小说片段、Wiki 等）。
*   **`prism-etl_preset.yaml`**: RooCode 的自定义模式配置文件 (MBR引导)。

## 🛠️ 安装与配置 (Setup)

### 前置要求
*   [VSCode](https://code.visualstudio.com/)
*   [RooCode Extension](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline) (原 Cline)

### 引导流程 (The MBR Boot Sequence)

为了让 RooCode 正确识别 Prism 引擎，我们需要注入自定义模式：

1.  **加载 MBR**:
    *   打开 RooCode 设置 -> `Custom Modes`。
    *   将本目录下的 [`prism-etl_preset.yaml`](./prism-etl_preset.yaml) 内容复制并追加到你的配置文件中。
    *   *或者*：直接在 RooCode 聊天框中上传该文件并指示："Load this custom mode configuration."

2.  **启动引擎**:
    *   在 RooCode 模式切换器中选择 **"Prism ETL Engine"**。
    *   此时，Agent 会自动读取 `.roo/system-prompt-prism-etl`，完成内核加载。

## 🚀 工作流 (Workflow)

### 1. 准备素材
将角色的原始设定（文本文件、PDF 或图片）放入 `Prism-ETL/source_materials/` 目录。

### 2. 启动铸造 (Workflow A: Character)
在 RooCode 中输入指令：
> "Initialize Workflow A for [Character Name]. Source material is in source_materials."

Agent 将自动执行：
1.  **Blueprint**: 分析素材并给出设计蓝图。
2.  **Phase 1**: 生成基础外壳 (`<visual>`)。
3.  **Phase 2**: 注入全息灵魂 (`<soul>`)。
4.  **Phase 3**: 补全世界观 (`<world>`)。

*注意：每一步 Agent 都会暂停 (STOP & WAIT)，等待你的确认或修改意见。*

### 3. 生成剧本 (Workflow B: Scenario)
角色生成完毕后，输入指令：
> "Initialize Workflow B. I want a [L3-B] scenario where I play as [Rival]."

Agent 将自动读取刚才生成的 XML，并为你构思三个剧情钩子 (Hooks) 供选择。

## ⚠️ 稳定性说明 (Stability)

*   **Beta 阶段**: 本工具链目前处于测试阶段。
*   **MBR 机制**: `prism-etl_preset.yaml` 旨在作为 MBR (Master Boot Record) 引导 Agent 加载核心 Prompt。如果 Agent 出现“幻觉”或变回通用程序员模式，请尝试重启 VSCode 或重新选择模式。

---
*Return to [Root Repository](../README.md)*
