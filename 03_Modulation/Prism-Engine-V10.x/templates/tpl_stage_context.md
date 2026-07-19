# Stage Context Template v2

> 用途：Stage bootstrap 冻结用户提供的 Module A 原文、Module B 可见部分和可选逻辑部分。宿主不从内容提取字段，也不因可选结构缺失拒绝启动。

## System Prompt 注入段

```
--- CHARACTER CONTEXT (HOST-INJECTED, RAW) ---

{module_a.raw}
```

## 首条 assistant message

```
{module_b.visible}

{module_b.logic}
```

## 输入约定

- `{module_a.raw}`：用户提供的 Module A 原文，逐字冻结。
- `{module_b.visible}`：Module B 中 HTML 注释前的可见内容，逐字冻结。
- `{module_b.logic}`：Module B 的可选 HTML 注释逻辑内容；缺失时为空。
