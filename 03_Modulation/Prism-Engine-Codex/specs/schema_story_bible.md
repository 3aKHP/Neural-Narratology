# Schema: Story Bible (V9.0)

## 1. File Standard
- **Format:** Markdown (`.md`) with YAML Frontmatter
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文); Headings/Labels in English.
- **Naming Convention:** `story_bible.md`
- **Ownership:** Updated by **Prism-Weaver-Orch** after each chapter cycle.

## 2. Purpose
The Story Bible is the persistent world-state layer for long-form projects. It stores facts that must survive across chapters and across interrupted sessions.

## 3. Structure Definition

### 3.1 YAML Frontmatter

```yaml
---
Project: "[Project Name]"
Current_Chapter: [Integer]
Last_Updated: "[YYYY-MM-DD]"
Status: "[active / paused / completed]"
---
```

### 3.2 Markdown Body

```markdown
## Premise Snapshot
[One-paragraph summary of the current story state]

## Timeline
- Chapter 01: [Event summary]

## Character State Tracker
- [Character Name]: [Current physical / emotional / relational state] (Ref: Chapter XX)

## Relationship Ledger
- [Pair / Group]: [Current dynamic]

## World Facts
- [Fact that must remain stable]

## Chekhov's Registry
- [Open item] — Status: OPEN

## Continuity Warnings
- [Only real contradiction risks or known pressure points]
```

## 4. Minimum Constraints

1. YAML frontmatter is mandatory.
2. All seven sections are required.
3. `Timeline` uses append-only updates.
4. `Character State Tracker` entries should include chapter references when possible.
5. `Chekhov's Registry` uses `OPEN / RESOLVED / DROPPED`.
6. `Continuity Warnings` records only genuine risks, not generic reminders.

## 5. Formatting Rules
- Keep entries compact and operational.
- Prefer bullet updates over long prose.
- Do not duplicate whole chapter summaries outside `Timeline` and `Premise Snapshot`.
