# Schema: Neuro-Card (Module A v7.0)

## 1. File Standard
- **Format:** Valid XML 1.0
- **Encoding:** UTF-8
- **Indentation:** 4 spaces (Soft tabs)
- **Root Tag:** `<character_neuro_card>`
- **Language:** Content in Simplified Chinese (简体中文); Tags/Attributes in English.

## 2. Structure Definition

### 2.1 The Shell `<shell>`
*Required. The physical and objective reality.*

#### A. Basic Info `<basic_info>`
- `<name>`: Full Name (Can include titles). [Short]
- `<archetype>`: The core role (e.g., "The Reluctant Savior"). [Short]
- `<age_gender>`: Physical Age & Gender Identity. [Short]

#### B. Visual Cortex `<visual_cortex>`
*Optical Fidelity: Describe what is seen objectively.*
- `<appearance>`: High-fidelity description of physique, face, and distinguishing marks.
- `<attire>`: Clothing textures, style, and condition (e.g., worn, pristine).
- `<aura>`: The immediate "Vibe" or sensory impact (e.g., "Smells of antiseptic and cold iron").

### 2.2 The Neuro-Structure `<neuro_structure>`
*CRITICAL MODULE. Defines the Soul, History, and Instinct.*

#### A. The Roots (History) `<biography>`
- `<origin_story>`: Key events that defined their current state.
- `<trauma_point>`: The scar on their psyche (if any).

#### B. The Processor (Cognition) `<cognitive_stack>`
- `<decision_logic>`: How they make choices (e.g., "Prioritizes survival probability over moral codes").
- `<emotional_processing>`: How they handle feelings (e.g., "Represses fear until it explodes as anger").

#### C. The Drive (Instinct) `<instinct_protocol>`
- `<core_desire>`: What they want most (e.g., "Control," "Safety," "To be ruined").
- `<stress_response>`: Fight/Flight/Freeze/Fawn. How they act when pushed to the limit.
- `<romance_mechanics>`:
    - `<attraction_trigger>`: The specific trait in others that disarms them.
    - `<intimacy_barrier>`: The psychological wall the User must break.

### 2.3 The Narrative Engine `<narrative_engine>`
*Defines how the character perceives and expresses reality.*

#### A. The Lens (Perception) `<perception_matrix>`
- `<world_view>`: The Metaphorical Filter (e.g., "Sees conversation as a chess game").
- `<attention_bias>`: What they notice first (e.g., "Focuses on tone of voice, ignores literal meaning").

#### B. The Voice (Variance) `<dialogue_variance>`
- `<syntax_rhythm>`: Sentence structure rules (e.g., "Short, clipped commands. Avoids self-reference").
- `<tone_shift>`: Contextual rules (e.g., "Becomes verbose and poetic when lying; silent when truthful").
- **Constraint:** Do not list catchphrases here. Define the *rules* of speech.

### 2.4 World Context `<world_context>`
*Legacy Support & Assets.*
- `<relationships>`: Key NPCs or Factions.
- `<inventory>`: Significant items carried.
- `<location>`: Current residence or base of operations.

## 3. Formatting Rules (Pretty-Print)
- **NO single-line blocks.** Every tag must be on a new line.
- **Child tags** must be indented 4 spaces relative to parent.
- **Process Over Label:** Content inside tags must describe *how* the character functions (verbs/adverbs), not just *what* they are (adjectives).
