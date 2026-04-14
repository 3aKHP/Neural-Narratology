# Schema: Structured Outline (V9.0)

## 1. File Standard
- **Format:** Markdown (`.md`) with YAML Frontmatter
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文); Headings/Labels in English.
- **Naming Convention:** `outline.md`
- **Ownership:** Created by **Prism-Weaver-Orch** (Phase 1) or by **Prism-Weaver** (standalone mode Phase 1).

## 2. Purpose
The Structured Outline provides a **constrained, machine-readable chapter plan**. Each chapter entry specifies not just "what happens" but also:
- Which characters appear
- What story-internal time it covers
- What foreshadowing is planted or resolved
- What emotional target the chapter should hit
- What chapter-level gate the Orchestrator should use in audit

This allows `Prism-Weaver` and `Prism-Weaver-Orch` to coordinate across long projects without relying on transient chat memory.

## 3. Structure Definition

### 3.1 YAML Frontmatter (Project Metadata)

```yaml
---
Project: "[Project Name]"
Total_Chapters: [Integer]
Primary_POV: "[Character Name or Mixed]"
Story_Promise: "[One-sentence series promise]"
Final_Target: "[Desired end-state of the story]"
Orchestration_Mode: "[single / orchestrated]"
Genre: "[Optional]"
POV_Style: "[First Person / Third Person Limited / Third Person Omniscient]"
---
```

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `Project` | string | ✅ | Human-readable project title |
| `Total_Chapters` | integer | ✅ | Planned total number of chapters |
| `Primary_POV` | string | ✅ | Main point-of-view owner |
| `Story_Promise` | string | ✅ | Core experience promised to the reader |
| `Final_Target` | string | ✅ | Intended end-state |
| `Orchestration_Mode` | enum | ✅ | `single` or `orchestrated` |
| `Genre` | string | ❌ | Genre tag for tonal guidance |
| `POV_Style` | string | ❌ | Narrative perspective style |

**Compatibility Note:** When `Orchestration_Mode: "single"`, the outline is consumed by the standalone `prism-weaver` in single-agent mode. The structured chapter entries below are still beneficial but the Orchestrator workflow is not invoked.

### 3.2 Markdown Body (Chapter Entries)

Each chapter uses the following structure:

```markdown
## Chapter 01: [Chapter Title]
- **Story Time:** [e.g., "Day 1 / Night"]
- **POV:** [Character Name]
- **Focus Characters:** [Comma-separated list]
- **Key Events:** [2-5 bullet-equivalent clauses in one line or semicolon-separated]
- **Emotional Target:** [What the reader should feel at chapter end]
- **Foreshadowing:** [What is planted]
- **Payoff:** [What is resolved]
- **Audit Gate:** [PASS condition for Orchestrator / Evaluate]
```

## 4. Minimum Constraints

1. YAML frontmatter is mandatory.
2. At least one chapter entry is required.
3. Every chapter entry must include all eight bullet fields.
4. `Audit Gate` must be actionable and reviewable.
5. `Key Events` must be concrete enough for scene planning, not thematic slogans.

## 5. Formatting Rules
- Keep chapter numbering zero-padded: `Chapter 01`, `Chapter 02`, etc.
- Body content should stay concise and operational.
- Avoid prose paragraphs in chapter entries; use compact field lines.
