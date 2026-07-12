# Phase IV: Projection (投射)

> **从单一平台绑定到多形态消费:面向无状态消费前端的协议去耦与格式编译**
> *From Single-Platform Binding to Multi-Form Consumption: Protocol Decoupling and Format Compilation for Stateless Frontends*

## 🌕 项目概述 (Overview)

**Phase IV: Projection** 是 Neural Narratology 研究的第四阶段,专注**消费环境解耦**——让同一份 Prism 角色资产能投射到多形态的消费前端。

Neural Narratology 的角色生产与有状态试运行由独立姊妹项目 **[Prism Vesicle](https://github.com/3aKHP/prism-vesicle)** 承担:一个自包含的终端宿主,直连 LLM 供应商 API,系统提示词完全由 Prism 资产掌控,自带面向创作者的 Runtime 试运行模拟器。Phase IV 在本仓库内专注 Vesicle 不覆盖的一环。

> ⚠️ 区分两个层面:
> - **Vesicle(姊妹项目)**:谁来**生产和试运行**角色卡(有状态原生宿主)。
> - **Phase IV / 本目录**:角色卡最终被**消费**的多种无状态前端如何承载 Prism 的动态叙事。

消费前端天然无状态(每轮只是独立的 API 请求),无法直接运行 Prism Runtime 的 HUD / State Navigator / 节拍追踪。Phase IV 的核心工作是把 Core Profile **编译**为各前端能理解的声明式规则或自维护指令。

### 核心方向

1. **Core Profile(协议去耦)**:从 v9 State-Space 中提取一套不依赖任何特定消费平台的通用角色描述规范,作为所有编译路径的统一源头。
2. **伪有状态编译**:针对无状态消费前端,把 Core Profile 的动态叙事机制编译为前端可承载的形式。

## 🗺️ 目录结构 (Directory Structure)

```text
04_Projection/
├── README.md                           # 本文件
├── "投射"项目研究报告-Repo-Git.md        # 研究报告(阶段完成后撰写)
├── Core-Profile/                       # 平台无关角色描述规范
│   └── README.md                       # Core Profile 设计文档
└── Platforms/                          # 伪有状态消费前端编译层
    ├── README.md                       # 前端分类与编译策略总览
    ├── SillyTavern/                    # B 类:CCv3 Lorebook Decorators 编译
    │   └── README.md
    └── RikkaHub/                       # C 类:思维链自维护 HUD
        └── README.md
```

## 🎯 两条腿推进策略

### 腿 1:Harness 层提示词(产出供 Vesicle 消费)
本仓库产出的 Prism 引擎 prompt / schema / template / profile 由 Vesicle 加载,驱动其 ETL / Runtime / Evaluate 等引擎。这条腿的产出物分布在 `02_Resonance/` 与 `03_Modulation/` 中,Vesicle 通过其 `assets/` 适配引用。详见姊妹项目 [Prism Vesicle](https://github.com/3aKHP/prism-vesicle)。

### 腿 2:Core Profile + 消费前端编译(本目录)
- 输入:v9 State-Space 协议 + Phase III 工程经验
- 中间产物:Core Profile(平台无关角色内核)
- 输出:Core Profile → 各无状态消费前端的编译规范
  - **B 类 / SillyTavern**:Beat Map → CCv3 Lorebook Decorators(声明式触发规则)
  - **C 类 / RikkaHub**:HUD → 模型思维链自维护指令(无需前端状态机)

## 📊 消费前端分类

| 前端 | 状态模型 | 卡格式 | 适配路径 | Prism 动态特性可行性 |
|:---|:---|:---|:---|:---|
| **SillyTavern** | 伪有状态(CCv3 Decorators) | CCv3 JSON/PNG/CHARX | 编译器路径 | ★★★ 通过 Decorators 近似 |
| **RikkaHub** | 伪有状态(思维链自维护) | CCv3 兼容(导入子集) | 思维链 HUD 指令 | ★★★ 通过 `<think>` 自刷新 |

> 角色卡的生产与创作端试运行由 Vesicle 的 Runtime 模拟器承担(创作端),不属于本目录覆盖的终端消费形态。早期的「有状态原生」A 类路径(Prism Runtime 寄生 CC/CX)已废弃,让位于 Vesicle 的干净专用宿主。

## 🔗 相关资源

- **Phase II: Resonance** - 协议理论来源(v9 State-Space)→ [查看](../02_Resonance/)
- **Phase III: Modulation** - 生产工具链(Prism-Engine)→ [查看](../03_Modulation/)
- **Prism Vesicle** - 独立干净宿主(姊妹项目)→ [查看](https://github.com/3aKHP/prism-vesicle)
- **调研报告** - 多平台技术调研(内部文档,不随仓库分发)
- **CCv3 Spec** - 角色卡 V3 标准 → [查看](https://github.com/kwaroran/character-card-spec-v3/blob/main/SPEC_V3.md)

---
*Return to [Root Repository](../README.md)*
