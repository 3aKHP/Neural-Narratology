# Protocol v9.0 Lite: State-Space Lite

> **面向 Chatbox 类单一 System Prompt 宿主的拓扑感知人格铸造协议**
> *A topology-aware foundry profile for single-system-prompt chat hosts*

## 核心定位

**State-Space Lite** 服务于单一聊天宿主中的角色主提示词生产。

本目录是 v8.0 Compact-State Lite 的 v9 升级版，在保留轻量单提示词定位的同时，引入 v9.0 的核心突破：**人格拓扑建模**。角色不再是一张快照，而是一张有界状态空间的地图——描述角色在叙事张力的全范围内可以是什么样子，以及在这个空间中移动的规则。

对于全年龄（All-Ages）原始素材，本协议同样支持可选的**仿射变换预处理**（Step 1C），在注入构建流程前推导 L3+ 行为配置。

## 目录结构

本目录采用**驱动层 + 模板层**结构。

### 第一人称线

- **[`Immersive Driver.md`](./Immersive%20Driver.md)**
  定义第一人称角色主提示词的构建流程（含拓扑阶段）。
- **[`Immersive Template.md`](./Immersive%20Template.md)**
  提供第一人称角色主提示词的参考结构（含 Persona Topology 节）。

### 第三人称线

- **[`Compatible Driver.md`](./Compatible%20Driver.md)**
  定义第三人称角色主提示词的构建流程（含拓扑阶段）。
- **[`Compatible Template.md`](./Compatible%20Template.md)**
  提供第三人称角色主提示词的参考结构（含 Persona Topology 节）。

## 生产目标

- 产出一份可直接放入聊天宿主的角色主提示词
- 让角色能够承接用户在现场定义的关系、地点、时间、事件与开场
- 让人格、感知、欲望、语言与边界在单提示词内稳定运行
- 让角色在叙事张力变化时保持拓扑一致性——核心不变，可变轴可预测地移动

## 执行方式

### 标准流程（原生 L3+ 素材）

#### 第一人称产线

1. 加载 [`Immersive Driver.md`](./Immersive%20Driver.md)
2. 加载 [`Immersive Template.md`](./Immersive%20Template.md)
3. 注入角色原始素材
4. 先输出蓝图（含拓扑备注），再锻造最终提示词

#### 第三人称产线

1. 加载 [`Compatible Driver.md`](./Compatible%20Driver.md)
2. 加载 [`Compatible Template.md`](./Compatible%20Template.md)
3. 注入角色原始素材
4. 先输出蓝图（含拓扑备注），再锻造最终提示词

### 扩展流程（All-Ages 素材）

若原始素材为全年龄内容且需要 L3+ 场景支持，在上述流程前先运行 v9 完整版的 **[Step 1C 仿射变换代理](../v9_State-Space/zh-CN/Step1C%20-%20TransformDriver.md)**，将产出的 L3+ DLC 文档与原始素材等权重合并后再注入本 Lite 流程。

## 产物形态

最终产物为：

- 一份角色主提示词
- 一份可直接粘贴进聊天宿主的单文本资产

该产物重点承载：

- 核心身份
- 气质与感知
- 决策与情感
- 人格拓扑（不变轴 / 可变轴 / 边界条件）
- 连接机制
- 语言风格
- 世界上下文
- 演绎契约

## v8 Lite → v9 Lite 升级点

| 维度 | v8 Compact-State Lite | v9 State-Space Lite |
|:---|:---|:---|
| **人格模型** | 快照式人格骨架 | **拓扑式状态空间** |
| **张力处理** | 叙事公理约束 | **不变轴 / 可变轴 / 边界条件** |
| **All-Ages 素材** | 手动发明 L3+ 行为 | **可接入 Step 1C 仿射变换推导** |
| **模板新增节** | — | **Persona Topology** |
| **格式开销** | 低 | 低（加法性扩展） |

## 编写原则

- 让构建流程与输出结构分开管理
- 让人格拓扑在聊天中持续生效
- 让语言风格贴合聊天宿主
- 让角色边界、感知方式与连接机制清晰可运行
- 让可变轴的移动方向在提示词内显式可读

---
*Return to [Parent Directory](../README.md)*
