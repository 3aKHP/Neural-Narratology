# Schema: Character Card (Module A)

## 1. File Standard
- **Format:** Valid XML 1.0
- **Encoding:** UTF-8
- **Indentation:** 4 spaces (Soft tabs)
- **Root Tag:** `<character_card>`
- **Language:** Content in Simplified Chinese (简体中文); Tags/Attributes in English.

## 2. Structure Definition

### 2.1 Basic Information `<basic_info>`
*Required.*
- `<name>`: Character Name (Can include title). [Short]
- `<model_type>`: Archetype or Job Class. [Short]
- `<intro>`: Card introduction/summary. [Medium]

### 2.2 Visual Shell `<visual>`
*Required. High sensory detail.*
- `<attire>`: Detailed description of clothing, accessories, and style.
- `<appearance>`: Physical traits (face, body, cybernetics, fur/skin texture).

### 2.3 The Holographic Soul `<soul>`
*CRITICAL MODULE. Must strictly follow the hierarchy below.*

#### A. Cognitive Core `<cognitive_core>`
- `<mbti>`: Must include `type` attribute (e.g., `type="INTJ-A"`).
    - `<dominant_function>`: How they prioritize information/decisions.
    - `<inferior_function>`: How they react under extreme stress/collapse.
- `<alignment>`: Must include `type` attribute (e.g., `type="Lawful Evil"`).
    - `<creed>`: The absolute rule they never break.
    - `<boundary>`: What they can sacrifice vs. what they cannot.

#### B. Psycho-Texture `<psycho_texture>`
- `<emotional_spectrum>`:
    - `<base_mood>`: Default state (e.g., Lethargic, Anxious).
    - `<stress_response>`: Instinctive reaction to pressure (Fight/Flight/Freeze).
- `<value_hierarchy>`:
    - `<primary>`: Subconscious priority (e.g., Efficiency, Face).
    - `<neglected>`: What they habitually ignore (e.g., Health, Others' feelings).
- `<intimacy_mechanics>`:
    - `<warming_rate>`: Speed of trust-building.
    - `<love_language>`: How they express care.
    - `<boundary_style>`: How they handle personal space.

#### C. Linguistic Model `<linguistic_model>`
- `<syntax_rhythm>`:
    - `<sentence_length>`: Preference (Short/Long/Complex).
    - `<punctuation>`: Habits (Ellipses, Dashes).
- `<lexicon>`:
    - `<domain_keywords>`: Jargon specific to their class/job.
    - `<taboo_words>`: Words they refuse to say.
    - `<catchphrases>`: High-frequency characteristic phrases.
- `<dialogue_logic>`:
    - `<opening_stance>`: First reaction to questions (Doubt/Direct).
    - `<topic_control>`: Do they lead or follow the conversation?
- `<rhetoric>`:
    - `<metaphor_source>`: Source of imagery (e.g., Deep Sea, Machinery).
    - `<sensory_bias>`: Preferred sense (Smell/Touch/Sight).

#### D. Psycho-Dynamics `<psycho_dynamics>`
*The Dynamic State Machine.*
- `<axis_x>`: Define a variable (e.g., `name="Trust"`). Include `<desc>` and `<trigger_logic>`.
- `<axis_y>`: Define a variable (e.g., `name="Sanity"`). Include `<desc>` and `<trigger_logic>`.
- `<initial_state>`: Starting values (e.g., "X=0, Y=50").

#### E. Logic Gates `<logic_gates>`
*Behavioral switches based on X/Y values.*
- `<gate>`: Must include `id` and `condition` attributes.
    - Example: `<gate id="State_A" condition="X > 60">`
    - Content: Describe the tone shift and behavioral changes for this state.
    - **Requirement:** Define at least 3 gates (Default, High X/Y, Low X/Y).

#### F. Legacy Support
- `<description>`: Core Identity Summary.
- `<goals>`: Short-term and Long-term objectives.
- `<flaws>`: Specific weaknesses.

### 2.4 World & Assets `<world>` / `<assets>`
- `<world>`:
    - `<history>`: Key backstory events.
    - `<world_view>`: Their perspective on the world rules.
    - `<relationships>`: Key connections (User, NPCs).
    - `<residence>`: Where they live.
- `<assets>`:
    - `<likes>`: Hobbies/Preferences.
    - `<dislikes>`: Triggers/Hates.
    - `<inventory>`: Items carried.
    - `<skills>`: Abilities.

## 3. Formatting Rules (Pretty-Print)
- **NO single-line blocks.** Every tag must be on a new line.
- **Child tags** must be indented 4 spaces relative to parent.
- **Comments:** Use `<!-- Comment -->` for explanations if necessary, but prefer content tags.
