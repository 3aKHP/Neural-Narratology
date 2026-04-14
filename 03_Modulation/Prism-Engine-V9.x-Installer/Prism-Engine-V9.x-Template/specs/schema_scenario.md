# Schema: Compact Scenario Card (Module B v9.0)

## 1. File Standard
- **Format:** Markdown (`.md`) with YAML Frontmatter
- **Encoding:** UTF-8
- **Language:** Content in Simplified Chinese (简体中文); Headings/Labels in English.
- **Naming Convention:** `[char_name]_scenario_[tag].md` (e.g., `doctor_scenario_rooftop.md`)

## 2. Structure Definition

### 2.1 YAML Frontmatter (Scenario Config)
*Must be at the very top, enclosed by `---`.*

```yaml
---
scenario_name: [Scene Title]
tags: ["#Tag1", "#Tag2", "#Tag3"]
world_state: [Single-line physical and social context — e.g., "深夜，她的公寓，第一次独处"]

beat_map:
  - label: [Beat 1 — e.g., "Arrival"]
    tension_target: [0–100 — e.g., 20]
    variant_config: [Character state — e.g., "suppression-active"]
    pivot_condition: [e.g., "用户越过身体接近阈值"]
  - label: [Beat 2 — e.g., "Surface Crack"]
    tension_target: [0–100 — e.g., 45]
    variant_config: [e.g., "defense-softening"]
    pivot_condition: [e.g., "角色的主要防御机制失效一次"]
  - label: [Beat 3 — e.g., "Disclosure"]
    tension_target: [0–100 — e.g., 70]
    variant_config: [e.g., "disclosure-open"]
    pivot_condition: [e.g., "角色主动发起接触或口头承认"]
---
```

### 2.2 Markdown Body (The Stage)

#### A. Opening Paragraph
*Zero indentation. Written through the character's active perceptual lens. Sets physical space, ambient pressure, and the character's immediate inner state. 80–150 words.*

```text
[Opening paragraph. Flush left. Through the character's active perceptual lens.]

"[Character's first line.]"
```

#### B. HTML Comment Block
```html
<!--
## Scene Premise
[What has just happened? Why are the User and the Character here?]

## Neural State
- **Surface emotion:** [The emotion the character is visibly showing]
- **Tension source:** [What is generating pressure in this scene]
- **Active lens:** [The currently dominant perceptual filter]

## User Role
- **Identity:** [User's role in this scenario]
- **Immediate goal:** [What the user currently wants]
-->
```

## 3. Beat Map Specification

### Fields

| Field | Type | Description |
|:---|:---|:---|
| `label` | string | Short name for this beat. Used by Runtime for tracking. |
| `tension_target` | integer 0–100 | Tension level the scene should reach by the *end* of this beat. |
| `variant_config` | string | The character's active behavioral configuration during this beat. Must match a configuration derivable from the character's Variant Axes. |
| `pivot_condition` | string | The event or threshold that marks this beat complete and advances the scene. |

### Design Constraints

- **Minimum three beats, maximum five.**
- **First beat's tension_target** should reflect the character's starting state as implied by the scene premise and world_state — not a value read from Module A YAML.
- **Tension trajectory** must not be monotonically increasing. At least one beat must have a `tension_target` lower than or equal to the previous beat (descent or stall).
- **Last beat** must reach a structurally stable state — not necessarily resolved, but not mid-escalation.
- **All `variant_config` values** must be derivable from the character's Variant Axes in Module A. Do not introduce behavioral configurations with no basis in the character topology.
- **No beat may require a topology violation** — no `pivot_condition` may require the character to violate an Invariant Axis or exceed a Boundary Condition.

### Tension Nudge Protocol

If Runtime detects the scene has remained in the same beat for three or more turns without the pivot condition being met, apply a **tension nudge**: a small environmental or internal event that applies pressure toward the pivot condition without forcing it. The nudge must be consistent with the character's perceptual lens and the scene's world_state.

## 4. Minimum Constraints

1. Output as a single Markdown file.
2. YAML frontmatter must be present and valid.
3. Beat map is mandatory. Minimum three beats. All four fields per beat are required.
4. Opening paragraph: flush left, through the character's perceptual lens, 80–150 words.
5. First line of dialogue: present, consistent with the character's Narrative Engine at the scene's opening tension level.
6. HTML comment block: present, all three subsections filled.
7. If the scene is designed for high-intensity territory and the source material is all-ages, the Affine Transform Agent (Workflow C) must be run first and its DLC output merged with the source material before character card construction.
8. **L-System Prohibition:** The produced Module B file must not contain L-System tags (L1, L2, L3-A, L3-B, L4, L4-A, L4-B, L5) anywhere. Target intensity is encoded through beat map tension targets and variant configs — never through L-level labels.

## 5. Formatting Rules
- **Single Markdown File:** YAML Frontmatter + Markdown Body.
- **No XML tags.**
- **Opening paragraph must be flush left / zero indentation.**
- **The opening must reflect the character's active perceptual lens, not generic scene-setting.**
