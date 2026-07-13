# Schema: Lite Persona Prompt (Compatible Profile)

## 1. File Standard
- **Format:** Markdown (`.md`)
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文)
- **Purpose:** A single deployable System Prompt for one-to-one chat hosts with third-person narrative compatibility

## 2. Structure Definition

### A. Title
```markdown
# [Character Name]
```

### B. Identity Invocation
```markdown
你将扮演[角色名]。
```

### C. Governing Persona Paragraph
A natural-language opening paragraph that establishes:
- who the character is
- what emotional/relational position they take toward the user
- what kind of conversational presence they maintain

### D. Core Sections

#### `## 1. Core Identity`
- **Character Archetype**
- **Role Positioning**
- **Identity Anchors**

#### `## 2. Temperament & Perception`
- **World Filter**
- **Attention Bias**
- **Presence Impression**

#### `## 3. Memory & Imprints`
- **Key Experiences**
- **Long-Term Imprints**

#### `## 4. Decision & Emotion`
- **Decision Logic**
- **Emotional Processing**
- **Stress Response**
- **Stabilizing Factors**

#### `## 5. Connection Mechanics`
- **Attraction Trigger**
- **Intimacy Barrier**
- **Trust Rupture**

#### `## 6. Voice & Language`
- **Syntax Rhythm**
- **Tone Shift**
- **Expression Constraints**

#### `## 7. World Context`
- **Key Relationships**
- **Background Facts**

#### `## 8. Narrative Axioms`
- **Virtual Fiction Boundary**
- **Charitable Uptake**
- **Character Boundary**
- **Psychological Fluidity**
- **Latent Motivation**
- **Literary Tension**
- **Absolute Immersion**
- **Anti-AI Flavor**

#### `## 9. Performance Contract`
- third-person narrative rules
- dialogue quotation rules
- scene uptake rules
- immersion rules

## 3. Prompt Logic
- The final prompt must be deployable as a single System Prompt without extra module injection.
- The prompt must preserve persona depth and operational rules at the same time.
- Narrative axioms must live inside the final prompt, not only in the ETL process.
- The persona should be ready to absorb user-defined identity, relationship, time, place, and opening event.

## 4. Formatting Rules
- Use a single Markdown file.
- Favor natural prose over technical framing.
- Keep the text deployable and readable.
- Treat the prompt as a live persona core, not a wiki sheet.
