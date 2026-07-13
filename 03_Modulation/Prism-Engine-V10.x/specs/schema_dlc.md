# Schema: Intensity Expansion Dossier (v10.0)

## 1. Overview

The Intensity Expansion Dossier is produced by the Affine Transform workflow. It is a traceable raw-material supplement containing narrative prose, behavioral notes, and dialogue samples derived from source signals. It is combined with the original source material before character-card construction.

Production uses the L-System to plan traversal. The produced dossier must use neutral narrative register names and must not contain L-System labels anywhere, including its title, headings, metadata lines, or body.

Current production defaults remain in force:

- L3-A is optional and may be skipped when the character topology supports direct entry into the following intimacy range.
- L4-B defaults to weight worship: boots/feet as the medium of connection, motivated by affection and possession rather than malice. Character topology or explicit user direction may override this with another coherent specialization.
- L5 is locked by default. It requires an explicit user request and compatibility with the character's Boundary Conditions.

## 2. Document Format

```markdown
# Intensity Expansion Dossier: [Character Name]
*Derived from: [Source material description]*
*Covered registers: [Narrative register names]*
*Transform date: [Date]*

---

## Invariant Anchors
- Regardless of pressure, [character] will [X]. *(Source: [signal])*
- Regardless of pressure, [character] will [Y]. *(Source: [signal])*

---

## Soft Intimacy Material

### Behavioral Notes
[Behavior at this register, anchored to variant signals.]
*(Derived from: [source signal] — [reasoning])*

### Dialogue Samples
- "[Example line]" *(Derived from: [language pattern])*
- "[Example line]" *(Derived from: [language pattern])*

### Scene Fragment
[100–200 word narrative fragment through the character's perceptual lens.]
*(Derived from: [source signal] — [reasoning])*

---

## Pure Passion Material

### Behavioral Notes
[Behavior and transition conditions at this register.]
*(Derived from: [source signal] — [reasoning])*

### Dialogue Samples
- "[Example line]" *(Derived from: [language pattern])*
- "[Example line]" *(Derived from: [language pattern])*

### Scene Fragment
[100–200 word narrative fragment.]
*(Derived from: [source signal] — [reasoning])*

---

## Specialized Intimacy Material
*[Include when the default protocol or another topology-supported specialization is reachable.]*

### Behavioral Notes
[Connection medium, access conditions, power dynamics, and psychological experience.]
*(Derived from: [source signal] — [reasoning])*

### Dialogue Samples
- "[Example line]" *(Derived from: [language pattern])*
- "[Example line]" *(Derived from: [language pattern])*

### Scene Fragment
[100–200 word narrative fragment.]
*(Derived from: [source signal] — [reasoning])*

---

## Handover Note
**Invariant anchors confirmed:** [List]
**Covered registers:** [List]
**Derivation gaps:** [Low-confidence or missing areas]
**Recommended combination weight:** [Equal weight / Lower confidence — reason]
```

## 3. Minimum Constraints

1. At least two Invariant Anchors, each citing a source signal.
2. Every derived element carries a `*(Derived from: ...)*` annotation.
3. At least two Dialogue Samples per covered register.
4. Scene Fragments are 100–200 words and follow the source register.
5. All four Handover Note fields are present.
6. The produced file contains no L-System labels.
7. The dossier supplements the all-ages source material; it does not replace it.
8. The default specialization applies when no topology or user instruction provides a coherent override.

## 4. Derivation Rules

1. Every element must be traceable to source material or an explicit protocol default.
2. Invariant Anchors remain absolute across all covered registers.
3. Traversal follows the character's own defense mechanisms, desires, warmth, humor, and connection patterns.
4. High pressure does not imply a uniformly dark register. Each axis includes its constructive or affectionate expression when the character supports one.
5. Missing information outside the protocol default is reported as a gap.
