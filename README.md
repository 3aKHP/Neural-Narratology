# Neural Narratology (神经叙事学)

> **从逆向工程到自动化铸造：大型语言模型(LLM)交互式叙事与角色工程学研究**
> *From Reverse Engineering to Automated Foundry: A Study on LLM Interactive Narrative and Character Engineering*

[![Author](https://img.shields.io/badge/Author-3aKHP-blue.svg)](https://github.com/3aKHP)
[![Institution](https://img.shields.io/badge/Institution-HIT-red.svg)](http://www.hit.edu.cn/)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

---

## 📖 项目简介 (Introduction)

**Neural Narratology** 是一个针对大型语言模型（LLM）在交互式角色扮演（Role-Playing）领域应用的全栈研究计划。

本项目始于对商业 LLM-RP 平台的黑箱逆向分析，终于一套基于 IDE 原生环境的自动化角色铸造流水线。我们致力于回答并解决以下核心问题：
1.  **机制解构**：商业平台如何在有限上下文窗口下实现“人设不朽”？
2.  **理论构建**：如何定义一套标准化的协议，使 AI 角色具备深度逻辑与叙事动力学？
3.  **工程实践**：如何将角色创作从手工作坊式的 Prompt 编写，转化为工业化的 **Agentic Workflow**？

## 🗺️ 研究路线图 (Roadmap)

本研究共分为三个递进阶段，分别对应了从“破解”到“构建”再到“自动化”的技术演进：

### [🌒 Phase I: Echo (回响)](./01_Echo/)
> **"Listen to the Ghost in the Machine."**

*   **核心任务**：商业平台黑箱逆向工程。
*   **关键成果**：
    *   揭示了 **"Single World-Simulator"** (单一世界模拟器) 架构。
    *   解构了 **Dynamic Persona Injection** (动态人设注入) 与轻量级 RAG 机制。
    *   提取了高级用户的“三层指令系统” (Jailbreak/Constitution/Knowledge)。
*   **📄 [阅读研究报告](./01_Echo/“回响”项目研究报告-Repo-Git.pdf)**

### [🌓 Phase II: Resonance (共鸣)](./02_Resonance/)
> **"Construct the Soul with Logic."**

*   **核心任务**：标准化 AI 角色创作路径。
*   **关键成果**：
    *   提出了 **ETL-XML-Axiom** 三位一体架构。
    *   发布了 **Protocol v5.0 (Legacy)**：综合性价比最高的剧本优先协议。
    *   发布了 **Protocol v6.0 (Omni-Foundry)**：引入动态状态机、逻辑门与 L-System 叙事分级的下一代协议。
*   **📄 [阅读研究报告](./02_Resonance/“共鸣”项目研究报告-Repo-Git.pdf)**

### [🌔 Phase III: Modulation (调制)](./03_Modulation/)
> **"Control the Signal via Agents."**

*   **核心任务**：基于 IDE 原生环境的智能体辅助生产 (VibeCoding)。
*   **关键成果**：
    *   **Prism-ETL Engine**：基于 VSCode + RooCode 的自动化角色铸造流水线。
    *   实现了 **Zero-Copy** 工作流：利用智能体操作文件系统，实现从自然语言意图到结构化 XML/Markdown 的无缝转换。
*   **🛠️ [获取工具链](./03_Modulation/)**

---

## 📂 目录结构 (Directory Structure)

```text
Neural-Narratology/
├── 01_Echo/               # Phase I: 逆向分析报告与脱敏数据样本
├── 02_Resonance/          # Phase II: 核心协议 (v5/v6) 与 Prompt 源码
│   ├── v5_Legacy/         # 社区标准版协议
│   └── v6_Omni_Foundry/   # 下一代全息协议 (技术原型)
├── 03_Modulation/         # Phase III: Prism-ETL 自动化工具链
│   └── Prism-ETL/         # VSCode 工作区模板
└── README.md              # 项目总览
```

## 🚀 快速开始 (Quick Start)

如果您是 **角色创作者** 或 **Prompt 工程师**，推荐从 **Phase III** 开始体验：

1.  克隆本仓库：
    ```bash
    git clone https://github.com/3aKHP/Neural-Narratology.git
    ```
2.  进入 `03_Modulation/Prism-ETL` 目录。
3.  按照该目录下的 [README](./03_Modulation/README.md) 配置 VSCode 与 RooCode。
4.  开始您的自动化创作之旅。

## ⚠️ 免责声明 (Disclaimer)

*   本项目涉及的逆向工程内容仅供学术研究与安全防御教学使用。
*   项目中提到的特定商业平台（代号 Platform-X / FurryBar）仅作为案例分析对象，不代表对其商业模式的评价。
*   所有敏感数据与个人信息均已进行脱敏处理。

## 🤝 致谢 (Acknowledgements)

感谢哈尔滨工业大学计算学部的学术环境支持。
感谢开源社区对 v5.0 协议的反馈与迭代。

---
*Copyright © 2025 3aKHP. All rights reserved.*