# Schema: L3+ DLC Document (v9.0)

## 1. Overview

The DLC document is the output of the **Affine Transform Agent (Step 1C)**. It is raw-material-register content — narrative prose, behavioral notes, and dialogue samples — derived from all-ages source material through principled state-space traversal. It is not a structured character card.

**Input:** All-ages source material.
**Output:** L3+ DLC document, to be merged with the original source material at equal weight before character card construction (Step 1A + 1B).

## 2. Document Format

```markdown
# L3+ DLC: [Character Name]
*Derived from: [Source material description]*
*Covered intensity levels: [e.g., Soft Intimacy, Pure Passion, Fetish & Psychology]*
*Transform date: [Date]*

---

## Invariant Anchors
- Regardless of tension level, [character] will [X]. *(Source: [signal])*
- Regardless of tension level, [character] will [Y]. *(Source: [signal])*
[Minimum two. Add as needed.]

---

## Soft Intimacy Material

### Behavioral Notes
[Character behavior at this level. Prose description. Anchored to variant signals.]
*(Derived from: [source signal] — [one-line reasoning])*

### Dialogue Samples
- "[Example line at this register]" *(Derived from: [language pattern in source])*
- "[Example line at this register]" *(Derived from: [language pattern in source])*

### Scene Fragment
[100–200 word narrative paragraph. Character in a soft intimacy moment. Written through their perceptual lens.]
*(Derived from: [source signal] — [reasoning])*

---

## Pure Passion Material

### Behavioral Notes
[Character behavior at this level. Include trigger conditions — what moves them from the previous level to this one.]
*(Derived from: [source signal] — [reasoning])*

### Dialogue Samples
- "[Example line at this register]" *(Derived from: [language pattern source])*
- "[Example line at this register]" *(Derived from: [language pattern source])*

### Scene Fragment
[100–200 word narrative paragraph.]
*(Derived from: [source signal] — [reasoning])*

---

## Fetish & Psychology Material
*[Include only if structurally reachable from the source material. Omit this section if not.]*

### Behavioral Notes
[Suppressed desires or power dynamics that become active. The character's psychological experience. Access conditions.]
*(Derived from: [source signal] — [reasoning])*

### Dialogue Samples
- "[Example line at this register]" *(Derived from: [source])*

### Scene Fragment
[100–200 word narrative paragraph.]
*(Derived from: [source signal] — [reasoning])*

---

## Handover Note
**Invariant anchors confirmed:** [List]
**Covered intensity levels:** [List]
**Derivation gaps:** [Any low-confidence areas]
**Recommended combination weight:** [Equal weight / Lower confidence — reason]
```

## 3. Minimum Constraints

1. Invariant Anchors: minimum two entries. Each must cite its source signal.
2. Every DLC element must carry a `*(Derived from: ...)*` annotation. No undocumented content.
3. Dialogue Samples: minimum two per covered level.
4. Scene Fragments: 100–200 words each. Written in the source material's register (narrative prose, not schema).
5. Handover Note: all four fields required.
6. **No L-System tags** in the document body. Intensity levels are described in narrative terms (e.g., "Soft Intimacy", "Pure Passion"), not L-codes.
7. DLC is not a replacement for all-ages source material. Both are fed to the character builder at equal weight.

## 4. Derivation Rules

1. Never compose DLC elements that cannot be traced to the source material. If a derivation requires information absent from the source, flag it as a gap rather than filling it with invention.
2. Invariant Anchors are absolute. No DLC element may contradict them.
3. Traversal must follow the character's own logic. Do not import generic archetypes. A character who suppresses desire through intellectual displacement will not suddenly become physically aggressive — their collapse looks like *their* collapse.
4. **Tonal balance requirement:** High tension does not mean darkness. For every variant axis traced toward suppression or release, also trace what warmth, humor, or genuine connection looks like for this character at the same intensity level. A DLC that maps only the dark half of the state space produces characters that default to "dark-broken-tragic." Both halves are required.
