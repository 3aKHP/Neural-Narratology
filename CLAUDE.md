---
project: "Neural Narratology"
branch: "main"
---

# CLAUDE.md — AI 协作者说明

本文件是本仓库对 AI 协作者的**公开**通用规范，任何 clone 仓库的协作者都应遵守。
若本机另有未跟踪的私有补充规范（`AGENTS.md`），其涉密约束优先，与本文件叠加生效。

## 通用准则

- 所有文本文件的编码统一为 **UTF-8 + LF**。
- 在进行任何工作前，先阅读对应目录的 `README.md`。有必要的话，还应阅读其上层目录的 `README.md`。
- 务必阅读 `.gitignore` 了解忽略规则。`dev/` 目录默认隐藏、不纳入主仓库。
- `dev/` 目录用于存放所有不应提交到主仓库的开发辅助文件（分析报告、计划文档、测试沙箱、项目工具等）。需要发布到 Release 而非主仓库的文件（如 `.ps1` 脚本）放在 `dev/release_dev/` 下。
- 同系列文件应保持命名格式一致（由人类协作者统一管理）。
- 编写文件时如需更新修改，除非是本身具有"代际对比"目的的技术文档（如 `CHANGELOG.md` 或某些特定 `README.md`），否则禁止使用形如"不是…而是…""不同于…""相较…"等表示**对比**或**修正**意味的、看起来像修正痕迹的表述。

## 目标平台的双命名规范

本仓库对其逆向研究的目标商业 RP 平台有两套命名，**按文档性质分场景使用**：

| 文档性质 | 用名 | 理由 |
|:---|:---|:---|
| **学术报告**（各阶段 `"XX"项目研究报告-Repo-Git.md`） | `Platform-X` | 论文对商业平台脱敏是学术规范；首次出现用"下称 Platform-X"这类正式指代引入 |
| **工程实现**（引擎提示词、协议文件、各级 README、设计文档） | `FurryBar` | 工程语境直呼实名，不脱敏 |

判断准则：**文档是什么性质，就用哪套名。** 例：`04_Projection/` 下的平台适配 README 是工程文档 → 用 FurryBar；其中的 `"投射"项目研究报告` 属学术报告 → 用 Platform-X。

## 分支模型

本仓库采用轻量的**主干 + 短命特性分支**模型：

- `main` 是唯一长期分支，保持随时可用。
- 有实质改动时从 `main` 拉一条短命分支，用完即删。分支命名沿用 Conventional Commits 类型：`<type>/<topic>`（如 `feat/modulation-prism-v9-state-space`、`fix/ci-release-notes`）。
- 通过 Pull Request 合入 `main`，合并后删除该分支。
- **不在 `main` 上直接进行实质开发**；细碎的文档/元数据修正可酌情直接在 `main` 提交。
- 不主动 push，push 前先核对远程与本地版本（见下文）。

## Commit 与 Push 相关

*本项目暂未配置自动 Commit 和 CHANGELOG 相关工具，需要在人类协作者明确发出"提交 Commit"的相关指令后由你来按照下面的步骤完成。*

1. 从你自身的 Context Window 和 `git status` 中获取本次 Commit 涵盖的文件范围，查看具体的 `diff` 内容并理解其意图。
2. 判断涉及到的文件修改是否需要按照意图或规范分成多次 Commit，然后按照 Conventional Commits 规范给每次 Commit 定性（fix/feat/docs/...）。
3. 如果涉及到**模块级别的升级/重构**（大型的 feat/fix/refactor 等），你需要按照后面的 [`CHANGELOG.md` 的修改规则](#changelogmd-的修改规则) 更新 `CHANGELOG.md`。仅小规模的 bug 修复或文档更新（小型的 chore/docs/fix 等）无需改动 `CHANGELOG.md`。
4. 撰写符合 Conventional Commits 规范的 Commit Message。要求使用 `-m` 来分隔不同行，特别要注意把标题和正文分开。格式示例见 [Commit Message 格式示例](#commit-message-格式示例)。
5. 提交 Commit，确认工作区是否干净。
6. 除非要求 Push，否则不要主动推送 Push。在被要求 Push 时，务必先检查远程仓库与本地仓库版本。如遇到冲突或版本分歧，暂停并请求人类协助。
7. 由于 GFW 的存在，GitHub 服务器连接可能不稳定。在超过三次尝试 Push 失败且原因明确指向网络连接问题时，暂停并请求人类协助。

### Commit Message 格式示例

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范，使用多个 `-m` 参数分隔标题与正文：

```bash
git commit -m "feat(modulation): add Weaver-Orch engine V8.1" -m "- Add system-prompt-prism-weaver-orch" -m "- Add story_bible schema and template" -m "- Update evaluate engine for continuity audit"
```

**格式要点：**
- 第一个 `-m`：类型(scope): 简短标题（不超过 50 字符）
- 后续 `-m`：正文详细说明（可选），每个 `-m` 为一个段落或列表项
- 类型：`feat`（新功能）、`fix`（修复）、`docs`（文档）、`refactor`（重构）、`chore`（杂项）等

## `CHANGELOG.md` 的修改规则

**仅在 [Commit 与 Push 相关](#commit-与-push-相关) 所提到的模块级升级/重构时更新 `CHANGELOG.md`。** 更新时：

- 遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式，按版本与日期组织，每条变更以 `[Resonance]` / `[Modulation]` / `[Echo]` / `[Repo]` 标签标注归属。
- 在文件顶部按既有格式追加此次变更的条目（日期用 UTC+8）。
- 查看文件尾部的**版本号对照表**，有必要时更新它。

> **不再记录 per-entry 的 Git Hash。** CHANGELOG 面向人类读者，按版本/日期组织即可；需要定位某条变更对应的 commit 时用 `git log` 查询。文件中既有的历史 `Git:` 行作为历史记录保留，不必回填或清理。
