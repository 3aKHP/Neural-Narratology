# Protocol v5.0: Legacy (Scenario-First Edition)

> **标准化 AI 角色铸造协议**
> *The Community-Standard Protocol for AI Character Creation*

## ℹ️ 简介 (Introduction)

**v5.0 Legacy** 是 "Resonance" 计划中首个成熟的产出。它确立了 **"Scenario-First"（剧本优先）** 的设计理念，即角色设定（Module A）应当服务于特定的叙事展开（Module B）。

尽管后续推出了更先进的 v6.0，但 v5.0 凭借其**低门槛、高兼容性**和**优秀的文学性**，依然是目前 FurbryBar 平台上表现优秀的协议版本。

## 🛠️ 组件说明 (Components)

该协议由三个核心步骤组成，请按顺序执行：

### 1. [`Step1 - ETL.md`](./Step1%20-%20ETL.md) (提取与转换)
*   **功能**：数据清洗流水线。
*   **核心机制**：**5-Phase Workflow**。强制模型将生成任务拆解为 Visual, Soul, World 等独立阶段，防止长文本生成中的“概括偏见”。
*   **亮点**：引入了 `Phase 4: Consultation`，允许用户交互式定制剧本走向。

### 2. [`Step2 - Create.md`](./Step2%20-%20Create.md) (架构与生成)
*   **功能**：XML 结构化编译器。
*   **核心机制**：定义了 Module A (核心设定) 与 Module B (剧本) 的解耦结构。
*   **亮点**：使用了 `<secret>` 标签隐藏深层设定，并规范了 `<speech_style>` 等高权重标签。

### 3. [`Step3 - Formatting.md`](./Step3%20-%20Formatting.md) (运行时环境)
*   **功能**：Runtime Driver (系统指令)。
*   **核心机制**：**叙事公理 (Narrative Axioms)**。
*   **亮点**：
    *   **导演思维链 (Director's CoT)**：在输出前进行元认知分析。
    *   **心理流动性**：防止角色陷入“绝望螺旋”。
    *   **潜藏动机**：防止角色“自闭”或拒绝交互。

## 🚀 使用指南 (Usage)

1.  将 `Step1 - ETL.md` 的内容发送给 LLM，并附带你的原始素材。
2.  跟随引导完成 5 个阶段的生成。
3.  将生成结果填入 `Step2` 定义的 XML 模板中（通常 Step 1 会自动按此格式输出）。
4.  在实际扮演时，将 `Step3` 作为 System Prompt 加载，并将生成的 XML 作为上下文输入。

---
*Return to [Parent Directory](../README.md)*
