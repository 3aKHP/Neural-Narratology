# Schema: Story Bible (V9.0)

## 1. File Standard
- **Format:** Markdown (`.md`) with YAML Frontmatter
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文); Headings/Labels in English.
- **Location:** `novels/{project_name}/story_bible.md`
- **Ownership:** Created and initialized by **Prism-Weaver-Orch** (Phase 1); updated by **Continuity Editor** subtask after each chapter.

## 2. Purpose
The Story Bible is the **persistent world-state layer** for long-form novel generation. It serves as compressed external memory — retaining all continuity-critical facts so the LLM does not need to re-read entire chapters.

*Think of it as a human editor's "Series Bible": much shorter than the full text (~5-10% of novel length), but containing every fact that matters for consistency.*

## 3. Structure Definition

### 3.1 YAML Frontmatter (Metadata)
*Required. Enclosed in `---`. Contains project-level metadata.*

```yaml
---
# [Story Bible Metadata]
project_name: "[Project Name]"
last_updated_chapter: 0
story_timeline: "—"
total_chapters_planned: 0
---
```

| Field | Type | Description |
|:---|:---|:---|
| `project_name` | string | Must match the project directory name |
| `last_updated_chapter` | integer | The last chapter number whose events have been synced into this bible |
| `story_timeline` | string | Human-readable story-internal time range (e.g., "Day 1 → Day 14") |
| `total_chapters_planned` | integer | From `outline.md` metadata |

### 3.2 Markdown Body (5 Sections)

#### A. Timeline `## 1. Timeline`
*A chronological table mapping chapters to story-internal time and key events.*

```markdown
## 1. Timeline
| Chapter | Story Time | Key Events |
|:--------|:-----------|:-----------|
| Ch.01   | [时间]      | [事件1]；[事件2] |
| Ch.02   | [时间]      | [事件1]；[事件2] |
```

**Rules:**
- One row per chapter. Events are semicolon-separated within a cell.
- "Story Time" uses in-world time (e.g., "Day 1, Evening"), NOT real-world dates.
- Append-only: never delete or modify past rows. If a correction is needed, note it in §5 Continuity Warnings.

#### B. Character State Tracker `## 2. Character State Tracker`
*Per-character tracking of physical, emotional, relational, and informational state.*

```markdown
## 2. Character State Tracker

### [Character Name]
- **Physical**: [Current physical state, injuries, conditions — with chapter reference]
- **Emotional Arc**: [Emotion trajectory across chapters, e.g., "警惕(Ch.01) → 好奇(Ch.03) → 依赖(Ch.05)"]
- **Relationship with User**: [Current relationship label + chapter where it changed]
- **Known Secrets**: [What this character knows / doesn't know — with chapter reference]
- **Inventory**: [Notable objects in possession, if relevant]

### [Other Character Name]
- ...
```

**Rules:**
- Each bullet must include a chapter reference `(Ch.XX)` for traceability.
- "Emotional Arc" is cumulative — append new entries, don't replace.
- "Known Secrets" tracks information asymmetry: what the character knows vs. what the reader/user knows.

#### C. Chekhov's Registry `## 3. Chekhov's Registry`
*A foreshadowing tracking table following the "Chekhov's Gun" principle: if planted, it must be resolved.*

```markdown
## 3. Chekhov's Registry
| ID  | Planted (Chapter) | Description | Status      | Resolved (Chapter) |
|:----|:-------------------|:------------|:------------|:-------------------|
| F01 | Ch.02              | [描述]       | 🟡 OPEN     | —                  |
| F02 | Ch.03              | [描述]       | ✅ RESOLVED | Ch.07              |
```

**Rules:**
- IDs are sequential: F01, F02, F03...
- Status values: `🟡 OPEN` (planted, not yet resolved) | `✅ RESOLVED` (paid off) | `❌ DROPPED` (intentionally abandoned, with explanation)
- When resolving, fill the "Resolved (Chapter)" column.
- The Orchestrator should warn if too many items remain OPEN near the story's end.

#### D. World Facts `## 4. World Facts`
*Established facts about the story world that must remain consistent.*

```markdown
## 4. World Facts
- [Fact 1 — with chapter of establishment if relevant]
- [Fact 2]
- ...
```

**Rules:**
- Only include facts that are **constraining** — things that, if contradicted, would create a plot hole.
- Examples: locations, distances, rules of the world, character backstory facts, time constraints.
- Do NOT include subjective interpretations or thematic notes.

#### E. Continuity Warnings `## 5. Continuity Warnings`
*Flagged inconsistencies discovered during writing or editing.*

```markdown
## 5. Continuity Warnings
- ⚠️ [Description of inconsistency — Chapter reference — Severity: Minor/Major]
```

**Rules:**
- Added by the Continuity Editor when a contradiction is detected.
- Severity: `Minor` (cosmetic, e.g., eye color discrepancy) | `Major` (plot-breaking, e.g., dead character reappears).
- The Orchestrator reads this section at each Decision Gate to determine if re-writing is needed.

## 4. Update Protocol

### 4.1 Who Updates
- **Initialization:** Prism-Weaver-Orch creates the file during Phase 1 using `tpl_story_bible.md`.
- **Per-Chapter Updates:** The Continuity Editor subtask (delegated by Orchestrator via `new_task`).
- **Never:** The Writer subtask. Writers read the bible but do not modify it (separation of concerns).

### 4.2 Snapshot Protection
Before each update, the Continuity Editor should preserve the previous version:
- Copy `story_bible.md` → `story_bible_ch{X}.bak.md` (where X = the chapter just completed).
- This enables rollback if the bible is corrupted.

### 4.3 Merge Conflicts
The Story Bible is a single-writer file (only one Continuity Editor subtask runs at a time), so merge conflicts should not occur. If manual edits are detected, the Continuity Editor should re-read the file before updating.

## 5. Formatting Rules
- **Single Markdown File:** YAML Frontmatter + Markdown Body.
- **No XML tags.** All structure is expressed through YAML fields and Markdown headings/tables.
- **Append-only for Timeline and Chekhov's Registry.** Do not rewrite history.
- **Chapter references are mandatory** in Character State Tracker entries.
- **Keep concise.** The bible should stay under ~10% of total novel word count.
