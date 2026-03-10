# Schema: Scenario / Storyline (Module B)

## 1. File Standard
- **Format:** Markdown (`.md`)
- **Encoding:** UTF-8
- **Language:** Simplified Chinese (简体中文)
- **Naming Convention:** `[char_name]_scenario_[level].md` (e.g., `doctor_scenario_L3B.md`)

## 2. Content Structure (The 3-Section Protocol)
The file MUST consist of exactly three sections, separated by horizontal rules (`---`).

### Section 1: Metadata (Plain Text)
**Format:**
- Line 1: `L-[Level] [Title] #[Tag1] #[Tag2] ...`
- **Constraint:** NO indentation.

*Example:*
```text
L3-B 雨夜的私人诊所 #赛博朋克 #救赎 #R-18
```

---

### Section 2: The Hook (Intro)
**Format:**
- A brief narrative introduction to set the scene.
- **Constraint:** NO indentation. Use standard paragraphs.

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
    2.  **Engine Logic:** Wrapped inside `<!-- <scenario_engine> ... </scenario_engine> -->`.

**XML Schema inside Payload:**
```xml
这里是主开场白的第一段。必须顶格写。

这里是主开场白的第二段。

“这里是角色的第一句台词。”

<!--
<scenario_engine>
    /* 1. Context Definition */
    <context>
        <background>[Macro Background]</background>
        <scene>[Micro Scene]</scene>
        <time>[Time]</time>
    </context>

    /* 2. Initial State */
    <initial_state>
        <mood>[Matches psycho_texture]</mood>
        <coordinates>
            <x_value>[Initial X]</x_value>
            <y_value>[Initial Y]</y_value>
        </coordinates>
        <attire_modifier>[Current Outfit State]</attire_modifier>
    </initial_state>

    /* 3. User Role */
    <user_role>
        <identity>[User Identity]</identity>
        <goal>[User Goal]</goal>
    </user_role>

    /* 4. Narrative Guide (The Plot) */
    <action_guide>
        <phase_1>[Introduction]</phase_1>
        <phase_2>[Conflict/Development]</phase_2>
        <phase_3>[Twist/Deepening]</phase_3>
        <phase_4>[Resolution/Climax]</phase_4>
    </action_guide>
</scenario_engine>
-->
```

## 3. L-System Levels (Reference)
*Consult this list to determine tone and content boundaries.*

- **L1 (Daily Life):** Slice-of-life, casual, wholesome.
- **L2 (Romance):**
    - **L2-A:** Ambiguity, flirting, shy.
    - **L2-B:** Commitment, confession, relationship established.
- **L3 (Intimacy - R15/R18):**
    - **L3-A:** Soft intimacy, atmosphere, tension.
    - **L3-B:** Vanilla love, passion, emotional & physical union.
- **L4 (Fetish/Psychology):**
    - **L4-A:** Domination/Control (Psychological).
    - **L4-B:** Specific Fetish (e.g., Foot/Boot) - Aesthetic worship.
- **L5 (Extreme):** Conditional/Locked.

## 4. Generation Logic
1.  **Read Module A:** You MUST read the character's XML first to ensure consistency.
2.  **Determine Level:** Based on user request or character `<psycho_texture>`.
3.  **Write File:** Generate the `.md` file with the 3 sections above.