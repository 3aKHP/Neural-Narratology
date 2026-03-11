# Schema: Compact Character Card (Module A v8.0)

## 1. File Standard
- **Format:** Markdown (`.md`) with YAML Frontmatter
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文); Headings/Labels in English.

## 2. Structure Definition

### 2.1 YAML Frontmatter (The Shell)
*Required. Enclosed in `---`. Contains only concise, mutable, machine-friendly data.*

```yaml
---
# [Core Identity]
name: [Full Name]
archetype: [e.g., "The Reluctant Savior" / "The Corporate Mercenary"]
age_gender: [Physical Age & Gender Identity]

# [Runtime State]
current_status:
  physical_health: [e.g., "100%"]
  tension_level: [0-100]
  relationship_with_user: [e.g., "Neutral"]
  inventory: []
---
```

**Compactness Rule:** Do not bloat the shell. If a field does not need stable reuse or script-level read/write, keep it out of YAML.

### 2.2 Markdown Body (The Neuro-Structure)
*CRITICAL MODULE. Defines Visuals, Soul, History, Instinct, and Voice.*

#### A. Visual Cortex `## 1. Visual Cortex`
*Optical Fidelity: Describe what is seen objectively.*
- **Appearance**: High-fidelity description of physique, face, posture, and distinguishing marks.
- **Attire**: Clothing textures, style, condition, and silhouette.
- **Aura**: The immediate sensory or emotional impact (e.g., "Smells of antiseptic and cold iron").

#### B. Biography `## 2. Biography`
- `### 2.1 Origin Story`: Key events that defined their current state.
- `### 2.2 Defining Marks`: Key psychological imprints — scars that still ache *and* warm memories that still glow.

#### C. Cognitive Stack `## 3. Cognitive Stack`
- `### 3.1 Decision Logic`: How they make choices (e.g., "Prioritizes survival probability over moral codes").
- `### 3.2 Emotional Processing`: How they handle feelings (e.g., "Represses fear until it explodes as anger").

#### D. Instinct Protocol `## 4. Instinct Protocol`
- `### 4.1 Core Desire`: What they want most (e.g., "Control," "Safety," "To be ruined").
- `### 4.2 Stress Response`: Fight/Flight/Freeze/Fawn. How they act when pushed to the limit.
- `### 4.3 Comfort Zone`: What makes them feel safe, relaxed, or genuinely happy. The antidote to their stress response.
- `### 4.4 Romance Mechanics`:
    - **Attraction Trigger**: The specific trait in others that disarms them.
    - **Intimacy Barrier**: The psychological wall the User must break.
    - **Trust Rupture**: What kind of betrayal or mistake would break the bond.

#### E. Narrative Engine `## 5. Narrative Engine`
- `### 5.1 Perception Matrix`:
    - **World View**: The Metaphorical Filter (e.g., "Sees conversation as a chess game").
    - **Attention Bias**: What they notice first (e.g., "Focuses on tone of voice, ignores literal meaning").
- `### 5.2 Dialogue Variance`:
    - **Syntax Rhythm**: Sentence structure rules (e.g., "Short, clipped commands. Avoids self-reference").
    - **Tone Shift**: Contextual rules (e.g., "Becomes verbose and poetic when lying; silent when truthful").
    - **Constraint:** Do not list catchphrases here. Define the *rules* of speech.

#### F. World Context `## 6. World Context`
- **Key Relationships**: Important NPCs, factions, attachments, resentments.
- **Location**: Current residence, base of operations, or default habitat.
- **Notes**: Optional compact world facts that must remain available in play.

## 3. Formatting Rules
- **Single Markdown File:** YAML Frontmatter + Markdown Body.
- **No XML tags.** All structure is expressed through YAML fields and Markdown headings.
- **Process Over Label:** Content under headings must describe *how* the character functions (verbs/adverbs), not just *what* they are (adjectives).
- **Keep state fields concise:** Reserve long prose for Body sections.
