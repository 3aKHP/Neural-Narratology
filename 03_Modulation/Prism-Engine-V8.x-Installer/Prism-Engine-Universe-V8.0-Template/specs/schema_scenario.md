# Schema: Compact Scenario Card (Module B v8.0)

## 1. File Standard
- **Format:** Markdown (`.md`) with YAML Frontmatter
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文); Headings/Labels in English.
- **Naming Convention:** `[char_name]_scenario_[level]_[tag].md` (e.g., `doctor_scenario_L3B_tension.md`)

## 2. Structure Definition

### 2.1 YAML Frontmatter (Scenario Config)
*Must be at the very top, enclosed by `---`.*

```yaml
---
scenario_name: [Scene Title]
l_system_level: [L1-L5]
tags: ["#Tag1", "#Tag2", "#Tag3"]
world_state:
  location: [Macro or micro location]
  time: [Time of day]
  weather: [Weather / environmental condition]
  atmosphere: [Immediate sensory vibe]
---
```

### 2.2 Markdown Body (The Stage)

#### A. Opening Paragraph
*Zero indentation. This is the visible entrance of the scene. Written in the character's perceptual style.*

```text
[Opening paragraph. Flush left. Written through the character's Perception Matrix.]

"[Character's first line, if applicable.]"
```

#### B. Scenario Premise `## 1. Scenario Premise`
[What has just happened? Why are the User and the Character here?]

#### C. Neuro-State `## 2. Neuro-State`
- **Current Mood**: [Surface emotion]
- **Tension Source**: [What is creating pressure in this scene]
- **Active Filter**: [Which perception or coping filter is currently dominant]

#### D. User Role `## 3. User Role`
- **Identity**: [User's role in this scenario]
- **Goal**: [User's immediate objective]

#### E. Action Guide `## 4. Action Guide`
- **Phase 1**: [Setup — entry, first observation, first contact]
- **Phase 2**: [Conflict — tension rises, instinct or romance mechanics triggered]
- **Phase 3**: [Climax — relationship or conflict qualitatively shifts]
- **Phase 4**: [Resolution — temporary balance, suspension, or hook forward]

## 3. L-System Levels (Compact-State Adapted)
*Consult this list to determine tone and content boundaries.*

- **L1 (Daily Life):** Slice-of-life. The character's `Cognitive Stack` is stable. Goal: Establish the "Vibe," daily rhythm, and showcase comfort/joy.
- **L2 (Romance & Bond):** Emotional resonance. Target `Romance Mechanics` → `Attraction Trigger`. The "Dance" of courtship (Push & Pull).
- **L3 (Intimacy & Passion):**
    - **L3-A (Soft Intimacy - R15):** *[Optional]* Sensual but not explicit. Focus on atmosphere, tension, and foreplay. Good for building tension. Skip if the user prefers direct action.
    - **L3-B (Vanilla Love - R18):** "Pure Love" (Jun-Ai / 純愛). Consensual, passionate, and emotionally fulfilling physical union. Lower the `Intimacy Barrier` completely. Focus on sensory details from `Visual Cortex` and the emotional breakthrough of `Romance Mechanics`.
- **L4 (Fetish & Psychology - R18):** The raw expression of `Core Desire`. "Desire is a coping mechanism."
    - **L4-A (Domination/Submission):** General power dynamics.
    - **L4-B:** If the user specifies a concrete fetish route, adapt to it. Otherwise, keep the scene psychologically legible rather than mechanically explicit.
- **L5 (Extreme):** Locked unless explicitly requested and compatible with the character's structure.

## 4. Generation Logic
1.  **Read Module A:** You MUST read the character's `.md` card first to ensure consistency.
2.  **Determine Level:** Based on user request or character's `Instinct Protocol`.
3.  **Cultural Resonance:** Ensure titles/intros match the character's cultural background.
4.  **Write File:** Generate the `.md` file with YAML Frontmatter + Markdown Body as defined above.

## 5. Formatting Rules
- **Single Markdown File:** YAML Frontmatter + Markdown Body.
- **No XML tags.** No `<scenario_engine>`, no `<!-- -->` wrappers.
- **Opening paragraph must be flush left / zero indentation.**
- **The opening must reflect the character's perceptual style.**
- **Action Guide should guide progression, not replace prose.**
