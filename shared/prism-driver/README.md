# Prism Driver / Host Abstraction Layer

`shared/prism-driver/` 定义 Prism Engine 与宿主实现之间的驱动级抽象层。它把引擎需要的
交互、文件、委派和质量能力表示为稳定 ABI，再由目标宿主 Adapter 映射到具体工具、
Profile 与逻辑资产路径。

该层解决三个问题：

- 六引擎源 Prompt 不引用某个宿主的工具名或物理资产目录；
- checkpoint 的暂停、恢复、拒绝和下一输入语义有统一定义；
- Harness 构建可以生成宿主可执行资产，并用契约测试阻止协议与 Adapter 漂移。

## 组成

```text
shared/prism-driver/
├── ABI.md
├── capability-registry.json
├── schemas/
│   ├── driver-contract.schema.json
│   ├── host-adapter.schema.json
│   ├── harness-source.schema.json
│   └── harness-manifest.schema.json
├── scripts/
│   ├── check.ts
│   └── lib.ts
└── tests/
    └── prism-driver.test.ts
```

V10 的实例化契约位于：

```text
03_Modulation/Prism-Engine-V10.x/driver/contract.json
03_Modulation/Prism-Engine-V10.x/adapters/vesicle/adapter.json
```

其中 `contract.json` 只表达 Prism 语义；`adapter.json` 是唯一允许出现 Vesicle 工具名、
Profile 形状与 `assets/...` 路径的位置。

## 命令

```bash
bun shared/prism-driver/scripts/check.ts
bun test shared/prism-driver/tests
bun shared/rule-assets/scripts/build-harness.ts --out dev/build/prism-vesicle-harness
```

## 边界

- HAL 是 Prism 专用的窄 ABI，不是任意 Agent 宿主插件框架。
- 宿主仍拥有权限、会话、TUI、Provider、重试和实际工具执行。
- Adapter 可以把一个抽象操作映射为单个工具或一组工具；映射不能改变操作生命周期。
- 新增操作或 required capability 先进入 capability registry，再更新 Schema、fixture、
  Adapter 和契约测试。Rule Pack 可以登记未激活 capability；只有 manifest 中的
  `requiredCapabilities` 决定当前包的兼容门槛。
