# Schema: Structured Outline (v10.0)

## 1. File Standard

- **Format:** Markdown without YAML frontmatter
- **Encoding:** UTF-8
- **Language:** Simplified Chinese content; English headings and labels
- **Location:** `novels/{project_name}/outline.md`
- **Ownership:** Weaver-Orch, or Weaver in standalone mode

## 2. Purpose

The Outline is the forward-looking chapter contract. It records who can appear, which objects and foreshadowing matter, the intended rhythm, and the outcomes each chapter must reach. Runtime progress and mutable world state remain in the Story Bible body.

Key Events are written after actors, props, foreshadowing, and rhythm have been established. They define outcomes; they do not prescribe actions that violate character logic.

## 3. Structure

### 3.1 Project Configuration

```markdown
# Structured Outline: [Project Name]

## Project Configuration
- **Writing Mode:** Mode A
- **Orchestration Mode:** orchestrated
- **Total Chapters:** 12
- **Target Words Per Chapter:** 5000
- **Genre:** [Genre]
- **POV Style:** [First Person / Third Person Limited / Third Person Omniscient]
```

| Field | Required | Description |
|:---|:---|:---|
| Writing Mode | Yes | `Mode A` uses chapter checkpoints; `Mode B` uses scene checkpoints |
| Orchestration Mode | Yes | `orchestrated` uses sequential Scene Writer, Continuity Editor, and Chapter Reviewer agents; `single` uses Weaver only |
| Total Chapters | Yes | Planned chapter count |
| Target Words Per Chapter | Yes | Pacing target |
| Genre | No | Tonal guidance |
| POV Style | No | Narrative perspective |

These values are production configuration in the Markdown body. They are not YAML identity fields and are never treated as live session HUD state.

### 3.2 Chapter Entries

```markdown
## Chapter 1: [章节标题]
- **Story Time:** [故事内时间]
- **POV Characters:**
  - [角色] — [当前位置、状态和在场理由]
- **Props:**
  - [道具] — [持有人/位置/叙事信号]
- **Foreshadowing:**
  - PLANT: [描述] → 预计 Ch.[X] 回收
  - RESOLVE: F[XX] — [说明]
- **Scene Rhythm:** [情感温度变化，用 → 连接]
- **Key Events:**
  1. [结果一]
  2. [结果二]
- **Emotional Target:** [方向性变化]
- **Notes:** [可选]
```

### 3.3 Field Rules

- Story Time forms a logical progression across chapters.
- POV Characters lists only characters who appear or are referenced, with a plausible spatiotemporal reason.
- Props name current holder or location and their informational purpose.
- Foreshadowing uses `PLANT:` and `RESOLVE:` prefixes.
- Scene Rhythm is one `→`-chained line.
- Key Events are numbered contractual outcomes. The Writer derives the path from character logic.
- Emotional Target is directional prose, not a precise runtime score.

## 4. Relationship to Story Bible

| Dimension | Outline | Story Bible |
|:---|:---|:---|
| Time orientation | Forward plan | Completed-state record |
| Owner | User / Weaver-Orch | Continuity Editor after initialization |
| Granularity | Chapter outcomes | Event and state continuity |
| Mutation | Revised through planning decisions | Updated after accepted chapters |

Every chapter loop reads both files before Scene planning.

## 5. Formatting Rules

- No YAML frontmatter.
- Chapter headings use `## Chapter N:`.
- Key Events use numbered lists.
- POV Characters and Props use one item per bullet.
- Production configuration stays under `## Project Configuration`.
