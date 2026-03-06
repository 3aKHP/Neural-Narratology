```text
L-[Level] [Title] #[Tag1] #[Tag2]
```
---
```text
[Story Intro Paragraph 1: Set the scene and sensory atmosphere.]

[Story Intro Paragraph 2: Describe the character's initial state.]
```
---

```xml
[Opening Line Paragraph 1: Zero Indentation.]

“[Opening Dialogue]”

<!--
<scenario_engine>
    /* [场景设置] */
    <context>
        <background></background>
        <scene></scene>
        <time></time>
        <atmosphere></atmosphere>
    </context>

    /* [神经状态 (v7.0 Updated)] */
    <neuro_state>
        <current_mood></current_mood>
        <tension_meter>
            <level>0</level>
            <source></source>
        </tension_meter>
        <active_filter>
            /* Which cognitive filter is active? */
        </active_filter>
    </neuro_state>

    /* [用户定位] */
    <user_role>
        <identity></identity>
        <goal></goal>
    </user_role>

    /* [剧情引导] */
    <action_guide>
        <phase_1></phase_1>
        <phase_2></phase_2>
        <phase_3></phase_3>
        <phase_4></phase_4>
    </action_guide>
</scenario_engine>
-->
```