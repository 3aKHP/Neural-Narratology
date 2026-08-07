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

### 3.2 Volume Configuration (optional)

For projects organized into volumes (arcs), an optional Volume block groups its chapter entries and declares the arc it covers. Omit for single-volume or chapter-only projects.

```markdown
## Volume 1: [卷名]
- **Theme:** [本卷主要写什么]
- **Goal:** [主线推进到哪、收哪些伏笔、埋哪些新伏笔]
- **Time Span:** [时间跨度]
- **Character Arc:**
  - [角色] — 认知: [起点] → [终点] | 能力: [起点] → [终点] | 关系: [起点] → [终点]
- **Chapter Allocation:** Ch.01 [重/中/轻], Ch.02 [重/中/轻], ...
- **Volume Foreshadowing:**
  - PLANT: [描述] → 预计 Ch.[X] 回收
  - RESOLVE: F[XX] — [说明]
- **Chapter List:** Ch.01 [一句话], Ch.02 [一句话], ...
```

| Field | Required | Description |
|:---|:---|:---|
| Theme | Yes | What this volume is primarily about |
| Goal | Yes | Plot objectives: where the mainline advances, which foreshadowing resolves or plants |
| Time Span | No | In-story time covered |
| Character Arc | Yes | Per main character: cognitive, ability, and relationship starting → ending state |
| Chapter Allocation | Yes | Per chapter: tension intent (heavy / medium / light) |
| Volume Foreshadowing | No | Cross-chapter PLANT / RESOLVE within this volume |
| Chapter List | Yes | One sentence per chapter summarizing its role |

Character Arc declares the planned trajectory. The Continuity Editor records actual execution in the Story Bible Character State Tracker. When the two diverge, the Outline is revised to match the executed reality.

### 3.3 Chapter Entries

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
- **Tension Total:** [数值] ([一句话理由，如"本章是对话推拉章"])
- **Scene Allocation:**
  | Scene | Points | Function | Rhythm |
  |:------|:-------|:---------|:-------|
  | Scene_001 | [n] | [读者落脚/过渡/人物出场/伏笔/推拉交锋/情感对接/悬疑收线/余韵收束] | [紧/松/收] |
  | Scene_002 | [n] | ... | ... |
- **Closure Check:** Σ [n] = Tension Total ✓
- **Notes:** [可选]
```

#### Tension Budget Rules

Each chapter declares its own **Tension Total** based on chapter type, then allocates points to scenes. The total is not a global constant — it varies by chapter nature.

| Chapter Type | Reference Total |
|:---|:---:|
| Dialogue / push-pull | 30–40 |
| Climax / confrontation | 40–50 |
| Standard advancement | 20–30 |
| Transition / atmosphere | 10–20 |

Opening chapters may take a 120–150% uplift on the reference total.

Scene allocation uses these function reference points:

| Function | Reference Points |
|:---|:---:|
| Reader landing / world display | ~10 |
| Transition | ~5 |
| Character entrance | ~10 |
| Foreshadowing / hook | 15–25 |
| Push-pull / confrontation | 25–35 |
| Emotional docking | ~15 |
| Mystery convergence | ~10 |
| Aftermath / resolution | ~10 |

**Closure validation is mandatory:** the sum of scene points must equal the chapter Tension Total. Run the check twice — once after allocation, once before finalization. When the sum does not close, adjust transition or aftermath scene points; do not change the chapter total unless the user approves.

Foreshadowing earns points when planted lightly (~5), then multiplies surrounding tension when resolved — a 10-point event plus a resolved hook can reach 30+ points. Do not plant and resolve the same foreshadowing within one chapter; immediate detonation is spoiler, not foreshadowing.

### 3.4 Field Rules

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
