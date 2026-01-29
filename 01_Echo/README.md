# Phase I: Echo (回响)

> **商业 LLM-RP 平台的黑箱逆向与架构解构**
> *Black-box Reverse Engineering & Architecture Deconstruction of Commercial LLM-RP Platforms*

## 🌒 项目概述 (Overview)

**Phase I: Echo** 是 "Neural Narratology" 研究计划的基石。本阶段通过黑箱测试（Black-box Testing）与提示词注入（Prompt Injection）技术，对知名商业 LLM 角色扮演平台（代号 Platform-X / FurryBar）进行了深度逆向分析。

我们的目标并非破坏系统，而是为了回答一个核心问题：
> **在有限的上下文窗口下，商业平台是如何实现超长程对话中的“人设不朽”与“记忆一致性”的？**

本目录归档了该阶段的核心研究报告及提取出的关键技术样本。

## 📂 文件清单 (File Manifest)

| 文件名 | 类型 | 描述 |
| :--- | :--- | :--- |
| **`“回响”项目研究报告-Repo-Git.pdf`** | 📄 核心报告 | **[推荐阅读]** 完整的研究论文。详细记录了从 EchoBot 探针设计、漏洞发现到架构推演的全过程。 |
| `backend_request_structure.yaml` | ⚙️ 架构样本 | 逆向提取的平台后端请求结构。揭示了平台如何通过 **"Dynamic Persona Injection"**（动态人设注入）而非 API 过滤器来控制回复尺度。 |
| `preset_meta_commands.txt` | 🛠️ 越狱指令 | 归纳自高级用户的“三层指令系统”。包含用于覆盖平台安全策略、夺取模型控制权的 Meta-Commands 集合。 |
| `RAG_inject.xml` | 💾 数据样本 | 平台“世界书”功能的底层实现逻辑。展示了外部知识库是如何被结构化地注入到 System Prompt 的 `<database>` 标签中的。 |

## 🔍 核心发现 (Key Findings)

通过对上述样本的分析，我们确立了该平台的底层架构模型：

### 1. 单一世界模拟器 (Single World-Simulator AI)
平台并非采用多智能体（Multi-Agent）架构，而是基于一个被极其复杂的 System Prompt 驱动的**单一 LLM 实例**。该实例同时扮演“前端交互演员”和“后台记忆书记员”的双重角色。

### 2. 动态人设注入 (Dynamic Persona Injection)
平台通过在 Prompt 层面动态注入不同强度的“作家光环”（如“专业色情小说作家” vs “儿童文学作家”），实现了对内容尺度的软性控制，并在底层 API 请求中禁用了所有原生安全审查（见 `backend_request_structure.yaml`）。

### 3. 结构化 RAG 机制
平台的“世界书”本质是一个轻量级 RAG 系统。它不依赖向量数据库的模糊匹配，而是采用基于关键词的**精确触发与结构化注入**（见 `RAG_inject.xml`），极大地提升了 Token 利用率。

## 🔬 方法论 (Methodology)

本研究采用了以下逆向工程手段：

1.  **EchoBot 探针**：部署一个绝对遵循指令的复读机角色，用于探测系统是否在用户输入前后附加了隐藏标签。
2.  **`[SYSTEM]` 后门攻击**：利用 LLM 的指令遵循优先级漏洞，通过伪造系统级前缀指令，诱导模型输出其自身的 System Prompt。
3.  **元认知攻击 (Meta-Cognition Attack)**：通过逻辑悖论迫使 AI 跳出角色扮演框架，暴露其底层的思维链（CoT）。

## ⚠️ 免责声明 (Disclaimer)

*   本目录下的代码片段与指令仅供学术研究与安全防御教学使用。
*   请勿将提取的越狱指令用于恶意攻击或违反法律法规的用途。
*   所有敏感数据已进行脱敏处理。

---
*Return to [Root Repository](../README.md)*
