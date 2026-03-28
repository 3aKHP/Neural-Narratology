# Protocol v8.0 Lite: Compact-State Lite

> **面向 Chatbox 类单一 System Prompt 宿主的轻量人格铸造协议**
> *A lightweight foundry profile for single-system-prompt chat hosts*

## 核心定位

**Compact-State Lite** 服务于单一聊天宿主中的角色主提示词生产。

本目录承载的是一套生产层协议，用于把角色原始素材整理、提炼并锻造成一份**可直接部署的单一 System Prompt**。

## 目录结构

本目录采用**驱动层 + 模板层**结构。

### 第一人称线

- **[`Immersive Driver.md`](./Immersive%20Driver.md)**  
  定义第一人称角色主提示词的构建流程。
- **[`Immersive Template.md`](./Immersive%20Template.md)**  
  提供第一人称角色主提示词的参考结构。

### 第三人称线

- **[`Compatible Driver.md`](./Compatible%20Driver.md)**  
  定义第三人称角色主提示词的构建流程。
- **[`Compatible Template.md`](./Compatible%20Template.md)**  
  提供第三人称角色主提示词的参考结构。

## 生产目标

- 产出一份可直接放入聊天宿主的角色主提示词
- 让角色能够承接用户在现场定义的关系、地点、时间、事件与开场
- 让人格、感知、欲望、语言与边界在单提示词内稳定运行
- 让文本体量集中服务于聊天可用性

## 执行方式

### 第一人称产线

1. 加载 [`Immersive Driver.md`](./Immersive%20Driver.md)
2. 加载 [`Immersive Template.md`](./Immersive%20Template.md)
3. 注入角色原始素材
4. 先输出蓝图，再锻造最终提示词

### 第三人称产线

1. 加载 [`Compatible Driver.md`](./Compatible%20Driver.md)
2. 加载 [`Compatible Template.md`](./Compatible%20Template.md)
3. 注入角色原始素材
4. 先输出蓝图，再锻造最终提示词

## 产物形态

最终产物为：

- 一份角色主提示词
- 一份可直接粘贴进聊天宿主的单文本资产

该产物重点承载：

- 核心身份
- 气质与感知
- 决策与情感
- 连接机制
- 语言风格
- 世界上下文
- 演绎契约

## 编写原则

- 让构建流程与输出结构分开管理
- 让人格信息在聊天中持续生效
- 让语言风格贴合聊天宿主
- 让角色边界、感知方式与连接机制清晰可运行

## 后续方向

后续可继续补充：

- 角色实例铸造样板
- 压缩规则说明
- 宿主适配说明
- 质量评估与压测案例

---
*Return to [Parent Directory](../README.md)*
