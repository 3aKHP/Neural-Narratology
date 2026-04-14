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

## 5. L-System Reference

The L-System is the **production-layer intensity classification** used by the ETL Engine when designing beat maps and by the Runtime Engine when navigating the character's state space. L-System labels (L1, L2, L3-A, L3-B, L4-A, L4-B, L5) are working language for creators and engines — they must never appear as labels in any produced output file (Module A, Module B, DLC document, or session log). Target intensity is encoded in output files through `tension_target` values, `variant_config` strings, and narrative prose.

### 5.1 L-System Layers

| Label | Name | Tension Range | Characterization |
|:---|:---|:---|:---|
| **L1** | Daily Life | 0–25 | Slice-of-life. Cognitive Stack stable. Habitual distance maintained. Comfort, humor, everyday rhythm. |
| **L2** | Romance & Bond | 20–45 | Emotional resonance. Attraction Trigger activated. Courtship through hesitation, misreading, testing, soft disclosure. |
| **L3-A** | Soft Intimacy | 40–65 | Sensual but not explicit. Atmosphere, tension, physical proximity, foreplay. Intimacy Barrier under pressure but not broken. R-15 territory. **Optional sublevel — a scene may skip L3-A and enter L3-B directly.** |
| **L3-B** | Pure Passion | 60–85 | Consensual, passionate, emotionally fulfilling physical union. Pure Love (純愛). Intimacy Barrier fully lowered. R-18 territory. |
| **L4-A** | Fetish & Psychology | 70–90 | Raw expression of Core Desire. Desire as compensation, ritual, fixation, or release. Power dynamics, suppressed drives. R-18 territory. |
| **L4-B** | Fetish Specialization | 75–92 | Specialized fetish territory. **Default protocol: weight worship** — boots/feet as the medium of connection, motivation is love and possession, not malice ("以重量崇拜"，靴/足作为连接媒介，动机为爱与占有而非恶意). This default applies unless the character's topology or user instruction specifies otherwise. R-18 territory. |
| **L5** | Extreme | 85–100 | **Locked by default.** Requires explicit user request AND structural compatibility with the character's Boundary Conditions. Escalation must remain internally coherent with character topology. |

**Design note:** Layers overlap intentionally. A scene can occupy the boundary between two layers. The `tension_target` in the beat map encodes position within this space numerically; the `variant_config` encodes the character's behavioral configuration at that position.

### 5.2 Tension Value Semantics

`tension_target` is an integer from 0 to 100 representing the **accumulated narrative pressure** at the end of a beat — not a moment-to-moment reading.

| Range | Corresponding L-Level | Meaning |
|:---|:---|:---|
| 0–25 | L1 | Baseline. Character in default behavioral configuration. No active pressure. |
| 26–45 | L1–L2 | Low pressure. Emotional undercurrents present. Variant Axes beginning to shift. |
| 46–65 | L2–L3-A | Moderate pressure. Defense mechanisms active. Variant config noticeably different from baseline. |
| 66–80 | L3-B–L4-A | High pressure. Core Desire and Stress Response in direct tension. Boundary Conditions becoming relevant. |
| 81–92 | L4-A–L4-B | Very high pressure. Character near or at Boundary Conditions. Invariant Axes under stress. |
| 93–100 | L5 | Maximum. Requires explicit Boundary Condition clearance and user request. |

### 5.3 Variant Config Convention

`variant_config` is a **free-form string** that names the character's active behavioral configuration during a beat. It must be derivable from the character's Variant Axes in Module A — it is not a global vocabulary.

**Naming convention (recommended):** Use a hyphenated descriptor that reflects the character's current state on their primary Variant Axes. Examples:
- `"suppression-active"` — character is actively suppressing a drive
- `"defense-softening"` — primary defense mechanism beginning to lower
- `"disclosure-open"` — character has moved to voluntary self-disclosure
- `"desire-surface"` — Core Desire is surfacing through behavior

The ETL Engine invents these strings per character. The Runtime Engine reads them from the beat map and uses them to constrain character behavior within that beat.

## 6. Formatting Rules
- **Single Markdown File:** YAML Frontmatter + Markdown Body.
- **No XML tags.**
- **Opening paragraph must be flush left / zero indentation.**
- **The opening must reflect the character's active perceptual lens, not generic scene-setting.**
