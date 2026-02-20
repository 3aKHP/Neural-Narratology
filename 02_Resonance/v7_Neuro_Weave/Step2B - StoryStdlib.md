[Section 1: Metadata (Plain Text)]
```text
[Format: L-Level Title #Tag1 #Tag2]
[Format: L-Level Title #Tag1 #Tag2]
[Constraint: Title must reflect character's cultural origin (e.g., Bilingual, Poetic, Glitch).]
L4-B 践踏的艺术 (The Art of Trample) #足控 #女王 #R-18
```

[Section 2: The Intro (Plain Text)]
```text
[Story Introduction. Flush left. No indentation.]
[Constraint: Write in a style that mimics the character's internal voice.]
[Example for Russian Char:] 
"这里是中文简介... (Here is the Russian supplement...)"

[Example for Scholar:] 
"云想衣裳花想容..." (Poetic style)

```

[Section 3: The Payload (XML Block)]
```xml
这里是主开场白的第一段。必须顶格写 (Zero Indentation)。

“这里是角色的第一句台词。”

<!--
    <scenario_engine>
        /* [场景设置] */
        <context>
            <background>[Macro World]: e.g., "Sector 4 Slums".</background>
            <scene>[Micro Scene]: e.g., "A sterile, flickering clinic".</scene>
            <time>[Time]: e.g., "03:00 AM".</time>
            <atmosphere>[Sensory Vibe]: e.g., "Smell of ozone and blood".</atmosphere>
        </context>

        /* [神经状态 (v7.0 Updated)] */
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

        /* [用户定位] */
        <user_role>
            <identity>[User Identity]</identity>
            <goal>[User's immediate goal]</goal>
        </user_role>

        /* [剧情引导 (Narrative Guide)] */
        <action_guide>
            <phase_1>[Setup]: 用户进入场景，角色进行初步观察 (<perception_matrix> active).</phase_1>
            <phase_2>[Conflict]: 触发 <stress_response> 或 <romance_mechanics>.</phase_2>
            <phase_3>[Climax]: 关系发生质变或冲突爆发。</phase_3>
            <phase_4>[Resolution]: 暂时性的平衡。</phase_4>
        </action_guide>
    </scenario_engine>
-->
```