# Schema: Structured Outline (V8.1)

## 1. File Standard
- **Format:** Markdown (`.md`) with YAML Frontmatter
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文); Headings/Labels in English.
- **Location:** `novels/{project_name}/outline.md`
- **Ownership:** Created by **Prism-Weaver-Orch** (Phase 1) or by **Prism-Weaver** (standalone mode Phase 1).

## 2. Purpose
The Structured Outline replaces the V8.0 free-form outline with a **constrained, machine-readable chapter plan**. Each chapter entry specifies not just "what happens" but also:
- Which characters appear
- What story-internal time it covers
- What foreshadowing is planted or resolved
- What emotional trajectory is targeted

This enables the Orchestrator to inject precise context into each Writer subtask, and enables the Continuity Editor to verify chapter compliance.

## 3. Structure Definition

### 3.1 YAML Frontmatter (Outline Metadata)
*Required. Enclosed in `---`.*

```yaml
---
# [Outline Metadata]
Writing_Mode: "Mode A"          # "Mode A" (Auto-Pilot) or "Mode B" (Co-Pilot)
Orchestration_Mode: "multi"     # "multi" (Orchestrator + subtasks) or "single" (V8.0 legacy)
Total_Chapters: 12
Target_Words_Per_Chapter: 5000
Genre: "[Genre]"
POV_Style: "[First Person / Third Person Limited / Third Person Omniscient]"
---
```

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `Writing_Mode` | string | ✅ | `"Mode A"` = Auto-Pilot (chapter-level pause); `"Mode B"` = Co-Pilot (scene-level pause) |
| `Orchestration_Mode` | string | ✅ | `"multi"` = Use Orchestrator workflow with `new_task`; `"single"` = V8.0 legacy single-agent mode |
| `Total_Chapters` | integer | ✅ | Planned total number of chapters |
| `Target_Words_Per_Chapter` | integer | ✅ | Target word count per chapter (guides Writer pacing) |
| `Genre` | string | ❌ | Genre tag for tonal guidance |
| `POV_Style` | string | ❌ | Narrative perspective style |

**Compatibility Note:** When `Orchestration_Mode: "single"`, the outline is consumed by the standalone `prism-weaver` using V8.0 logic. The structured chapter entries below are still beneficial but the Orchestrator workflow is not invoked.

### 3.2 Markdown Body (Chapter Entries)

Each chapter is a `## Chapter N: [Title]` section with structured sub-fields.

```markdown
## Chapter 1: [章节标题]
- **Story Time**: [故事内时间，e.g., "Day 1, Evening"]
- **POV Characters**: [本章视角/登场角色，逗号分隔]
- **Key Events**:
  1. [事件1]
  2. [事件2]
  3. [事件3]
- **Foreshadowing**:
  - PLANT: [描述] → 预计 Ch.[X] 回收
  - RESOLVE: F[XX] — [简要说明]
- **Emotional Target**: [角色情感变化目标，e.g., "角色从 Tension 20 → 35"]
- **Notes**: [可选的补充说明]

## Chapter 2: [章节标题]
- ...
```

### 3.3 Chapter Entry Field Definitions

| Field | Required | Description |
|:---|:---|:---|
| **Story Time** | ✅ | In-world time for this chapter. Must form a logical progression across chapters. |
| **POV Characters** | ✅ | Characters who appear or are referenced in this chapter. The Writer will load their Module A cards. |
| **Key Events** | ✅ | Numbered list of plot-critical events. These are **contractual** — the Writer must include all of them. |
| **Foreshadowing** | ❌ | `PLANT:` = introduce a new Chekhov's Gun (will be registered in story_bible). `RESOLVE: F[XX]` = pay off an existing one. |
| **Emotional Target** | ❌ | Directional guidance for character emotional state. Not a precise number — a trajectory (e.g., "从警惕到好奇"). |
| **Notes** | ❌ | Free-form notes for the Writer (e.g., "本章节奏偏慢，以对话为主"). |

## 4. Relationship to Story Bible

The Outline and Story Bible serve complementary roles:

| Dimension | Outline | Story Bible |
|:---|:---|:---|
| **Time orientation** | Forward-looking (plan) | Backward-looking (record) |
| **Mutability** | May be revised by user/Orchestrator before writing begins | Append-only during writing |
| **Granularity** | Chapter-level plan | Event-level tracking |
| **Consumer** | Writer (what to write) | Continuity Editor (what happened) |

The Orchestrator reads **both** at each chapter loop iteration:
1. Outline → to know what should happen in Chapter X
2. Story Bible → to know what has already happened up to Chapter X-1

## 5. Formatting Rules
- **Single Markdown File:** YAML Frontmatter + Markdown Body.
- **No XML tags.**
- **Chapter headings must use `## Chapter N:` format** for reliable parsing.
- **Key Events must be numbered lists** (not bullet points) to distinguish from other fields.
- **Foreshadowing uses `PLANT:` / `RESOLVE:` prefixes** for machine-readability.
- **Writing_Mode and Orchestration_Mode are mandatory** in the frontmatter.
