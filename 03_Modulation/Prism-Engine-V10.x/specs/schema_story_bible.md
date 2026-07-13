# Schema: Story Bible (v10.0)

## 1. File Standard

- **Format:** Markdown without YAML frontmatter
- **Encoding:** UTF-8
- **Language:** Simplified Chinese content; English headings and labels
- **Location:** `novels/{project_name}/story_bible.md`
- **Ownership:** Weaver-Orch initializes; Continuity Editor updates after accepted chapters

## 2. Purpose

The Story Bible is the persistent long-form world-state layer. It retains continuity-critical facts in a compact form so later chapters do not require rereading the entire novel.

All mutable progress lives in Markdown body fields. YAML is not used for chapter progress, timeline, relationship state, location, or other live values.

## 3. Structure

### 3.1 Project Status

```markdown
# Story Bible: [Project Name]

## Project Status
- **Project Name:** [Project Name]
- **Last Updated Chapter:** 0
- **Story Timeline:** —
- **Total Chapters Planned:** 0
```

The Continuity Editor updates Last Updated Chapter and Story Timeline after each accepted chapter. Project Name and Total Chapters Planned originate from project initialization.

### 3.2 Five State Sections

#### A. Timeline `## 1. Timeline`

```markdown
## 1. Timeline
| Chapter | Story Time | Key Events |
|:--------|:-----------|:-----------|
| Ch.01 | [时间] | [事件一]；[事件二] |
```

- One row per accepted chapter.
- Past rows are append-only. Corrections are recorded in Continuity Warnings.

#### B. Character State Tracker `## 2. Character State Tracker`

```markdown
## 2. Character State Tracker

### [Character Name]
- **Location:** [Latest known position and activity] (Ch.XX)
- **Physical:** [Current physical state] (Ch.XX)
- **Emotional Arc:** [State progression with chapter references]
- **Relationship with User:** [Current relationship and change chapter]
- **Known Secrets:** [Information asymmetry with references]
- **Inventory:** [Notable held objects with references]
```

- Location is replaced with the latest known position when movement is established.
- Characters absent from a chapter retain their last known value.
- Emotional Arc is cumulative.
- Every changed value includes a chapter reference.

#### C. Chekhov's Registry `## 3. Chekhov's Registry`

```markdown
## 3. Chekhov's Registry
| ID | Planted | Description | Status | Resolved |
|:---|:--------|:------------|:-------|:---------|
| F01 | Ch.02 | [描述] | OPEN | — |
```

- IDs are sequential.
- Status is `OPEN`, `RESOLVED`, or `DROPPED` with explanation.

#### D. World Facts `## 4. World Facts`

Only facts whose contradiction would create a continuity error belong here. Subjective interpretation and thematic commentary stay out.

#### E. Continuity Warnings `## 5. Continuity Warnings`

```markdown
## 5. Continuity Warnings
- [矛盾描述] — Ch.XX — Severity: Minor/Major
```

Major warnings block chapter progression until Weaver-Orch obtains a decision.

## 4. Update Protocol

1. Copy `story_bible.md` to `story_bible_ch{X}.bak.md`.
2. Read the compiled chapter and its Outline entry.
3. Update Project Status and the five state sections.
4. Re-read the file and verify one Timeline row for the chapter, preserved headings, and no duplicate registry entries.
5. Return an update summary and all new warnings.

Only one Continuity Editor writes the Story Bible at a time.

## 5. Formatting Rules

- No YAML frontmatter.
- Timeline and registry history are append-only.
- Project Status is a body section with explicit labels.
- Chapter references are mandatory for changed character state.
- Keep the Story Bible below roughly ten percent of total novel length.
