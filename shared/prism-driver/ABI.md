# Prism Driver ABI v1

## 1. 分层

```text
Prism protocol prompt + workflow contract
                  ↓
        Prism Driver ABI v1
                  ↓
           Host Adapter
                  ↓
 tools / profiles / runtime policy / UI
```

协议层使用两类稳定引用：

- `prism://resource/<resource-id>`：Schema、模板、Prompt 等逻辑资源；
- `hal://interaction/<interaction-id>` 与 `hal://delegation/<delegation-id>`：工作流动作。

Harness 编译器解析这些引用，验证契约覆盖，并生成目标宿主真正加载的 Prompt 和 Profile。

## 2. 操作

v1 只定义当前六引擎需要的操作族：

| 操作 | 语义 |
|:---|:---|
| `artifact.inspect` | 定位、枚举、搜索和读取允许的资源或项目制品 |
| `artifact.compose` | 创建目录和文件，并进行受控写入、替换或追加 |
| `artifact.snapshot` | 在修改单写者状态文件前建立快照 |
| `research.external` | 对素材缺口进行可归因的外部核查 |
| `interaction.confirm` | 在声明的阻塞 checkpoint 暂停并等待接受或拒绝 |
| `interaction.select` | 在互斥选项会改变后续动作时请求单选决策 |
| `agent.delegate` | 将有边界、可独立验收的任务交给已声明 Agent Profile |
| `quality.guard` | 对候选正文执行宿主管理的交付前质量策略 |
| `quality.analyze` | 返回可供 Evaluate 使用的确定性或语义质量发现 |
| `workflow.handoff` | 请求把后续回合移交给另一 Prism Engine |

操作注册表是名称和类别的单一事实源。Driver Contract 不能使用未注册操作。

## 3. Interaction 生命周期

`interaction.confirm` 不是普通问答。每个 checkpoint 必须声明：

- 触发时机；
- 接受后的推进边界；
- 拒绝后的返工对象；
- 后续输入来自 gate resolution，还是新的 authored user message；
- checkpoint 是否可以在同一产物修订后再次触发。

Runtime turn 的基准语义：

```text
write current character packet
→ block at runtime.turn
→ accept: close current invocation
→ wait for a new authored user message
→ reject: revise or discuss the current packet without advancing state
```

确认本身不构成下一轮角色扮演输入。

`interaction.select` 的答案是普通工作流信息。宿主可提供自由输入兜底，但契约中的固定选项
必须互斥、可执行，并保持声明顺序。

## 4. Delegation 生命周期

Delegation 必须声明 Agent、默认执行模式和任务目的。宿主工具的自包含 task prompt 作为 v1
输入包，不要求 Driver Contract 再定义一套嵌套 Task Packet Schema。父引擎负责：

1. 提供完整路径与任务边界；
2. 校验子任务结果；
3. 最多按契约规定重试；
4. 在最终失败时进入用户决策点，不能静默继续。

子任务不能递归委派，也不能扩大自己的有效工具面。Agent Profile 负责声明 child 的工具集合，
Host Adapter 只负责把 `agent.delegate` 映射到宿主 SubAgent runtime；HAL 不建立第二套授权策略。

实际 tool call 的 ask / allow / deny 由宿主统一权限系统处理。项目路径、symlink、并发冲突、
timeout、环境隔离和进程清理属于 Tool Runtime 的硬不变量，不因 permission mode 或 HAL binding
而关闭。v1 不要求 per-delegation path scope；更窄的任务级路径限制可在真实需求出现后作为宿主
可选增强实现。

## 5. 资源解析

Driver Contract 记录资源的仓库源路径；Host Adapter 记录目标宿主逻辑路径。源 Prompt 只引用
资源 ID。构建产物中的 Prompt 已被解析为宿主路径，因此运行时不读取本仓库，也不依赖跨仓
相对链接。

资源解析失败属于构建错误，不允许把未解析 URI 交付给宿主。

## 6. 能力协商

Harness manifest 记录：

- `prism-driver/v1`；
- Adapter 自身能力；
- Rule Pack 所需能力；
- 每个引擎与 Agent 实际使用的操作；
- Driver Contract 与 Adapter 的 hash。

宿主遇到未知 required capability 必须拒绝激活，不得猜测或降级为相似工具。

## 7. 错误模型

宿主 Adapter 应把底层错误归一为以下稳定类别：

| 类别 | 含义 |
|:---|:---|
| `unsupported` | 宿主没有声明的操作或 capability |
| `invalid_request` | 参数、资源 ID 或生命周期使用不合法 |
| `denied` | 权限或策略拒绝 |
| `not_found` | 资源或项目制品不存在 |
| `conflict` | 状态版本、快照或单写者约束冲突 |
| `transient` | 可重试的 Provider、I/O 或调度失败 |
| `failed` | 其它已终止失败 |

协议 Prompt 不根据宿主私有错误字符串分支，只根据这些类别决定重试、返工或交接。

## 8. 兼容性

- v1 内可以增加可选字段、资源和操作绑定。
- 修改已有操作生命周期、错误含义或资源 URI 语义必须升级 ABI major。
- Adapter 工具名变化只升级 Adapter version；Driver Contract 无需随之修改。
- 引擎新增 required operation 时，Harness capability 集合必须同步变化。
