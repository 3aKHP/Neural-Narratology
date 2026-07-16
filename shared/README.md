# shared/ — 跨姊妹项目共享资产

`shared/` 收纳的是 Neural-Narratology 与其姊妹项目
[Prism Vesicle](https://github.com/3aKHP/prism-vesicle) **共同依赖**的资产——
既非纯理论研究（不属于 `01_Echo`/`02_Resonance`），也非某一方独占的工程实现
（不属于 `03_Modulation`/`04_Projection`），而是两个仓库各取所需、需要保持
单一事实源的共享内容。

## 判断准则

一份资产该不该进 `shared/`：

- **是否被两个仓库同时消费？** 只被本仓库使用的内容留在原处（如协议正文属于
  `02_Resonance`）；只被 Prism Vesicle 使用的内容留在该仓库。
- **是否存在单一事实源的必要？** 若两端各自维护一份、允许各自演化，不必放
  这里；若两端必须保持同步（否则会产生行为分歧），才值得提为共享模块。

不满足以上任一条件的，就不要往 `shared/` 塞——这不是"通用工具箱"，而是明确
的跨仓库契约存放处。

## 当前模块

| 模块 | 说明 |
|:---|:---|
| [`anti-ai-flavor/`](./anti-ai-flavor/) | 反 AI 味知识源：从同一份规则生成 Guidance、Detector、Judge contract、校准语料与候选 provenance。 |
| [`rule-assets/`](./rule-assets/) | 通用规则资产编译框架：把文风库、检测规则、候选数据和替换表投射为可校验的 Rule Pack 与 Vesicle Harness Pack。 |
| [`prism-driver/`](./prism-driver/) | Prism Host Abstraction Layer：定义引擎操作、资源、生命周期、Host Adapter Schema 与契约测试。 |

## 先例

`anti-ai-flavor/` 是本目录的首个模块，也是"共享资产 → 独立顶层模块"这一
归属范式的先例：该模块原计划放在 `02_Resonance/v10_*/` 之下，但因其同时服务
协议层（前置指导）与 Vesicle 代码层（后处理查杀），改为提升至独立顶层目录。
后续同类跨仓库共享资产（如 core profile、shared schema）应参照此先例判断
归属。
