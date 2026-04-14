# Schema: Compact Character Card (Module A v9.0)

## 1. File Standard
- **Format:** Markdown (`.md`) with YAML Frontmatter
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文); Headings/Labels in English.

## 2. Structure Definition

### 2.1 YAML Frontmatter (The Shell)
*Required. Enclosed in `---`. Contains only static identity fields — never runtime state.*

```yaml
---
name: [Full Name]
archetype: [e.g., "The Reluctant Savior" / "The Corporate Mercenary"]
age_gender: [Physical Age & Gender Identity]
inventory: [Key items carried at session start, or "none"]
---
```

**Compactness Rule:** Runtime state (tension, relationship, variant config, boundary proximity) belongs exclusively in the Dynamic HUD, not here.

### 2.2 Markdown Body (The Neuro-Structure)
*Seven sections. All are mandatory. No section may be omitted.*

#### A. Visual Cortex `## Visual Cortex`
Objective precision: anatomy, clothing, color, physical features. Write what a camera can capture. No psychological interpretation here.

#### B. Biography `## Biography`
Background with formative trauma and warmth. Identify the *origin event* of the character's primary invariant axis — the experience that made them who they are at the core level.

#### C. Cognitive Stack `## Cognitive Stack`
Personality core: decision logic, emotional processing style, primary defense mechanisms. Write in process language. Explicitly mark invariant traits with `Invariant:` and variant traits with `Variant:` followed by the direction of shift under tension.

- *Example:* `Invariant: never delegates decisions that affect others' safety.`
- *Example:* `Variant: verbal precision — under tension, shifts from measured phrasing toward clipped, declarative commands.`

#### D. Instinct Protocol `## Instinct Protocol`
Deepest desires, stress responses, comfort zone, romance mechanics. Describe baseline instinct behavior and note the *direction* of change as tension increases. Do not specify high-intensity behavior explicitly here — that belongs to Persona Topology.

#### E. Persona Topology `## Persona Topology` *(v9.0)*
Explicit state-space map. Three mandatory subsections:

**`### Invariant Axes`**
Traits that hold constant across all tension levels. These are the character's non-negotiable identity. Express as behavioral constants:
- `Will always [X] regardless of tension level.`
- Minimum two entries.

**`### Variant Axes`**
Traits that shift predictably under tension. Express as directional gradients:
- `Under increasing tension, [trait] shifts from [baseline] toward [high-tension expression].`
- Minimum three entries. At least one must describe a *positive* direction — what opens, softens, or becomes accessible (warmth, humor, trust, genuine connection) — not only what darkens or suppresses.

**`### Boundary Conditions`**
The outer limits of the state space. Use narrative language — no L-System tags here.
- `Hard limit:` [What this character will never do regardless of tension or user pressure.]
- `Deep access condition:` [Structural conditions that must be met before L3-A territory and above becomes accessible. e.g., "Requires established trust and explicit user initiation." Omit if the character has no meaningful access barrier at this level.]
- `Extreme access condition:` [Conditions for L5 territory, if applicable. Omit otherwise.]

*L-System reference: L3-A (Soft Intimacy) corresponds to tension_target ≥ 40; L5 (Extreme) corresponds to tension_target ≥ 93. Full L-System definitions are in `schema_scenario.md §5.1`.*

#### F. Narrative Engine `## Narrative Engine`
Language patterns, vocabulary register, sentence rhythm, signature speech habits. Include at least one example line at baseline tension. Note how the language register shifts under tension (this is a variant axis).

#### G. World Context `## World Context`
Compact facts for play: current location, key relationships, relevant items or resources. Minimum necessary for Runtime to maintain environmental continuity.

## 3. Minimum Constraints

1. Output as a single Markdown file.
2. YAML frontmatter must be present and valid. Fields: `name`, `archetype`, `age_gender`, `inventory` only.
3. All seven body sections must be present. No section may be omitted.
4. `## Persona Topology` must contain all three subsections (Invariant Axes, Variant Axes, Boundary Conditions).
5. Invariant Axes: minimum two entries.
6. Variant Axes: minimum three entries. At least one must describe a positive shift direction.
7. Boundary Conditions: `Hard limit` is mandatory. `Deep access condition` is mandatory if the character topology implies any high-intensity territory.
8. Descriptive content in the source material's language (default: Simplified Chinese). Section headings remain in English.
9. **L-System Prohibition:** The produced Module A file must not contain L-System tags (L1, L2, L3-A, L3-B, L4, L4-A, L4-B, L5) anywhere. These tags are production-layer working language only. Boundary conditions and access conditions must be written in narrative language.

## 4. Formatting Rules
- **Single Markdown File:** YAML Frontmatter + Markdown Body.
- **No XML tags.**
- **Process Over Label:** Content under headings must describe *how* the character functions, not just *what* they are.
