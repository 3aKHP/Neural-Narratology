# Schema: Tension Scenario (Module B v7.0)

## 1. File Standard
- **Format:** Markdown (`.md`)
- **Encoding:** UTF-8
- **Language:** Simplified Chinese (简体中文)
- **Naming Convention:** `[char_name]_scenario_[level]_[tag].md` (e.g., `doctor_scenario_L3B_trample.md`)

## 2. Content Structure (The 3-Section Protocol)
The file MUST consist of exactly three sections, separated by horizontal rules (`---`).

### Section 1: Metadata (Plain Text)
**Format:**
- Line 1: `L-[Level] [Title] #[Tag1] #[Tag2] ...`
- **Constraint:** NO indentation.
- **Cultural Resonance:** Title must reflect character's cultural origin (e.g., Bilingual, Poetic, Glitch).

*Example:*
```text
L4-B 践踏的艺术 (The Art of Trample) #足控 #女王 #R-18
```

---

### Section 2: The Intro (Plain Text)
**Format:**
- A brief narrative introduction to set the scene.
- **Constraint:** NO indentation. Use standard paragraphs.
- **Style:** Mimic the character's internal voice (e.g., Poetic, Clinical, Aggressive).

*Example:*
```text
这里是故事简介。
这是简介的第二段。
```

---

### Section 3: The Payload (XML Block)
**Format:**
- A single Markdown code block tagged as `xml`.
- Inside the code block:
    1.  **Opening Lines:** The character's first spoken lines or narration. **Zero Indentation**.
    2.  **Engine Logic:** Wrapped inside `<!-- <scenario_engine> ... </scenario_engine> -->` (XML comment wrapper). Use `/* ... */` only for inline notes within the block.

**XML Schema inside Payload:**
```xml
这里是主开场白的第一段。必须顶格写。

“这里是角色的第一句台词。”

<!--
<scenario_engine>
    /* 1. Context Definition */
    <context>
        <background>[Macro World]: e.g., "Sector 4 Slums".</background>
        <scene>[Micro Scene]: e.g., "A sterile, flickering clinic".</scene>
        <time>[Time]: e.g., "03:00 AM".</time>
        <atmosphere>[Sensory Vibe]: e.g., "Smell of ozone and blood".</atmosphere>
    </context>

    /* 2. Neuro-State (v7.0 Updated) */
    <neuro_state>
        <current_mood>[Surface Emotion]: e.g., "Exhausted but alert".</current_mood>
        <tension_meter>
            /* Replaces old X/Y Axis. Defines the pressure in the scene. */
            <level>[0-100]: Current tension level.</level>
            <source>[What is causing the tension?]: e.g., "User's injury vs. Character's suspicion".</source>
        </tension_meter>
        <active_filter>
            /* Which cognitive filter is active? */
            [e.g., "Professional Detachment" or "Primal Hunger"]
        </active_filter>
    </neuro_state>

    /* 3. User Role */
    <user_role>
        <identity>[User Identity]</identity>
        <goal>[User's immediate goal]</goal>
    </user_role>

    /* 4. Narrative Guide (The Plot) */
    <action_guide>
        <phase_1>[Setup]: 用户进入场景，角色进行初步观察 (<perception_matrix> active).</phase_1>
        <phase_2>[Conflict]: 触发 <stress_response> 或 <romance_mechanics>.</phase_2>
        <phase_3>[Climax]: 关系发生质变或冲突爆发。</phase_3>
        <phase_4>[Resolution]: 暂时性的平衡。</phase_4>
    </action_guide>
</scenario_engine>
-->
```

## 3. L-System Levels (Neuro-Adapted)
*Consult this list to determine tone and content boundaries.*

- **L1 (Daily Life):** Slice-of-life. The character's `<cognitive_stack>` is stable. Goal: Establish the "Vibe" and routine.
- **L2 (Romance & Bond):** Emotional resonance. Target the `<romance_mechanics>` -> `attraction_trigger`. The "Dance" of courtship (Push & Pull).
- **L3 (Intimacy & Passion):**
    - **L3-A (Soft Intimacy - R15):** *[Optional]* Sensual but not explicit. Focus on atmosphere, tension, and foreplay. Good for building tension. Skip if the user prefers direct action.
    - **L3-B (Vanilla Love - R18):** "Pure Love" (Jun-Ai / 純愛). Consensual, passionate, and emotionally fulfilling physical union. Lower the `<intimacy_barrier>` completely. Focus on sensory details defined in `<visual_cortex>` and the emotional breakthrough of `<romance_mechanics>`.
- **L4 (Fetish & Psychology - R18):** The raw expression of `<core_desire>`. "Desire is a coping mechanism."
    - **L4-A (Domination/Submission):** General power dynamics.
    - **L4-B (Default Protocol: The Trample Fetish):**
        - **Core Theme:** "Worship through Weight." Focus on the tactile sensation of boots/feet as a medium of connection.
        - **Motivation:** Driven by **Affection & Ownership**, NOT malice. The act is a ritual of belonging.
        - **Aesthetic:** Emphasize the visual hierarchy (High vs. Low) and the texture (Leather/Skin). Avoid gore.
- **L5 (Extreme):** Locked unless explicitly requested and compatible with `<neuro_structure>`.

## 4. Generation Logic
1.  **Read Module A:** You MUST read the character's XML first to ensure consistency.
2.  **Determine Level:** Based on user request or character `<instinct_protocol>`.
3.  **Cultural Resonance:** Ensure titles/intros match the character's cultural background (e.g., Cyrillic for Russian chars).
4.  **Write File:** Generate the `.md` file with the 3 sections above.
