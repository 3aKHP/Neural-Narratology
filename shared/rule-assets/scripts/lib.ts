import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, parse, resolve, sep } from "node:path";

export const repoRoot = resolve(import.meta.dir, "../../..");

export type Projection = "guidance" | "detector" | "judge" | "replacement";

export type ModuleConfig = {
  schema: string;
  id: string;
  source: string;
  tracked_guidance?: string;
  projection_map?: Record<string, Projection[]>;
  required_capabilities?: string[];
  guidance?: {
    language: string;
    preamble: string;
    postamble?: string;
    severity_labels: Record<string, string>;
    sections: Array<{ tier: string; title: string; intro?: string }>;
  };
  judge?: { language: string; preamble: string };
  corpora?: Record<string, string>;
  notices?: string;
};

export type Matcher =
  | { kind: "literal" | "regex"; value: string; unit: "candidate" | "paragraph" | "sentence"; flags?: string }
  | {
      kind: "metric";
      unit: "candidate" | "paragraph" | "sentence";
      metric: { signal: string; operator: "gte" | "gt" | "lte" | "lt"; threshold: number };
    };

export type RuleEntry = {
  id: string;
  tier: string;
  lang: string;
  face?: string;
  projections?: Projection[];
  title: string;
  matcher?: Matcher;
  guidance?: string;
  examples?: { bad?: string; good?: string };
  replacement?: { kind: "literal" | "template"; value: string };
  severity: string;
  maturity?: "experimental" | "stable";
  source: string;
  notes?: string;
  targets?: string[];
};

export type RuleSource = {
  meta: {
    source_schema: string;
    schema_version: string;
    module: string;
    version: string;
    display_name?: string;
    primary_lang: string;
    default_targets?: string[];
    preprocessing?: Record<string, unknown>;
  };
  entries: RuleEntry[];
  sources: Array<Record<string, unknown> & { id: string; status: string }>;
};

export type NormalizedRule = RuleEntry & { projections: Projection[]; maturity: "experimental" | "stable" };

export type Finding = {
  ruleId: string;
  severity: string;
  maturity: "experimental" | "stable";
  start: number;
  end: number;
  evidence: string;
  metric?: { signal: string; value: number; threshold: number };
};

const allowedProjections = new Set<Projection>(["guidance", "detector", "judge", "replacement"]);
const allowedUnits = new Set(["candidate", "paragraph", "sentence"]);

export function absolute(path: string): string {
  return resolve(repoRoot, path);
}

export async function loadJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(absolute(path), "utf8")) as T;
}

export async function loadModuleConfig(path: string): Promise<ModuleConfig> {
  return loadJson<ModuleConfig>(path);
}

export async function loadRuleSource(config: ModuleConfig): Promise<{ source: RuleSource; sourceText: string }> {
  const sourceText = await readFile(absolute(config.source), "utf8");
  return { source: Bun.YAML.parse(sourceText) as RuleSource, sourceText };
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function sha256(value: string | Uint8Array): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(value);
  return hasher.digest("hex");
}

export async function gitIdentity(): Promise<{ commit: string; state: "clean" | "dirty" }> {
  const commitResult = Bun.spawnSync(["git", "-C", repoRoot, "rev-parse", "HEAD"]);
  const statusResult = Bun.spawnSync(["git", "-C", repoRoot, "status", "--porcelain", "--untracked-files=normal"]);
  if (commitResult.exitCode !== 0 || statusResult.exitCode !== 0) {
    return { commit: "unknown", state: "dirty" };
  }
  return {
    commit: commitResult.stdout.toString().trim(),
    state: statusResult.stdout.toString().trim() ? "dirty" : "clean",
  };
}

export async function compilerHash(): Promise<string> {
  const files = [
    { label: "shared/rule-assets/scripts/lib.ts", path: resolve(import.meta.dir, "lib.ts") },
    { label: "shared/rule-assets/scripts/build.ts", path: resolve(import.meta.dir, "build.ts") },
    { label: "shared/rule-assets/scripts/check.ts", path: resolve(import.meta.dir, "check.ts") },
    { label: "shared/rule-assets/scripts/build-harness.ts", path: resolve(import.meta.dir, "build-harness.ts") },
    { label: "shared/prism-driver/scripts/lib.ts", path: resolve(repoRoot, "shared/prism-driver/scripts/lib.ts") },
    { label: "shared/prism-driver/schemas/driver-contract.schema.json", path: resolve(repoRoot, "shared/prism-driver/schemas/driver-contract.schema.json") },
    { label: "shared/prism-driver/schemas/host-adapter.schema.json", path: resolve(repoRoot, "shared/prism-driver/schemas/host-adapter.schema.json") },
    { label: "shared/prism-driver/schemas/harness-source.schema.json", path: resolve(repoRoot, "shared/prism-driver/schemas/harness-source.schema.json") },
    { label: "shared/prism-driver/schemas/harness-manifest.schema.json", path: resolve(repoRoot, "shared/prism-driver/schemas/harness-manifest.schema.json") },
    { label: "shared/prism-driver/capability-registry.json", path: resolve(repoRoot, "shared/prism-driver/capability-registry.json") },
  ];
  const parts: string[] = [];
  for (const file of files) {
    try {
      parts.push(file.label, await readFile(file.path, "utf8"));
    } catch {
      // A bootstrap build may run before every entrypoint exists.
    }
  }
  return sha256(parts.join("\n"));
}

export function normalizeRules(source: RuleSource, config: ModuleConfig): NormalizedRule[] {
  return source.entries.map((entry) => {
    const projections = entry.projections ?? (entry.face ? config.projection_map?.[entry.face] : undefined);
    return {
      ...entry,
      projections: projections ? [...projections] : [],
      maturity: entry.maturity ?? "stable",
      targets: entry.targets ?? source.meta.default_targets ?? [],
    };
  });
}

export function validateModule(source: RuleSource, config: ModuleConfig): string[] {
  const errors: string[] = [];
  if (config.schema !== "rule-module-build/v1") errors.push(`config.schema must be rule-module-build/v1`);
  if (source.meta?.source_schema !== "rule-source/v1") errors.push(`meta.source_schema must be rule-source/v1`);
  if (source.meta?.module !== config.id) errors.push(`source module ${source.meta?.module} does not match config ${config.id}`);
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(source.meta?.version ?? "")) {
    errors.push(`meta.version must be SemVer`);
  }
  if (!Array.isArray(source.entries) || source.entries.length === 0) errors.push(`entries must be a non-empty array`);
  if (!Array.isArray(source.sources)) errors.push(`sources must be an array`);

  const sourceIds = new Map((source.sources ?? []).map((item) => [item.id, item]));
  if (sourceIds.size !== (source.sources ?? []).length) errors.push(`sources contain duplicate ids`);
  for (const registered of source.sources ?? []) {
    if (!registered.id) errors.push(`source id is required`);
    if (!registered.url) errors.push(`${registered.id}: source url is required`);
    if (!registered.license) errors.push(`${registered.id}: source license is required`);
    if (!["adopted", "evaluating", "reference", "rejected"].includes(registered.status)) {
      errors.push(`${registered.id}: invalid source status ${registered.status}`);
    }
  }
  const seen = new Set<string>();
  const rules = normalizeRules(source, config);
  for (const rule of rules) {
    const prefix = rule.id || "<missing-id>";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rule.id ?? "")) errors.push(`${prefix}: id must be kebab-case`);
    if (seen.has(rule.id)) errors.push(`${prefix}: duplicate id`);
    seen.add(rule.id);
    if (!rule.lang) errors.push(`${prefix}: lang is required`);
    if (!rule.title) errors.push(`${prefix}: title is required`);
    if (!rule.severity) errors.push(`${prefix}: severity is required`);
    if (rule.projections.length === 0) errors.push(`${prefix}: no projections resolved`);
    for (const projection of rule.projections) {
      if (!allowedProjections.has(projection)) errors.push(`${prefix}: unsupported projection ${projection}`);
    }
    if ((rule.projections.includes("guidance") || rule.projections.includes("judge")) && !rule.guidance) {
      errors.push(`${prefix}: guidance is required by guidance/judge projection`);
    }
    if ((rule.projections.includes("detector") || rule.projections.includes("replacement")) && !rule.matcher) {
      errors.push(`${prefix}: matcher is required by detector/replacement projection`);
    }
    if (rule.projections.includes("replacement") && !rule.replacement) {
      errors.push(`${prefix}: replacement payload is required`);
    }
    if (rule.source !== "self") {
      const registered = sourceIds.get(rule.source);
      if (!registered) errors.push(`${prefix}: source ${rule.source} is not registered`);
      if (registered?.status === "rejected") errors.push(`${prefix}: rejected source ${rule.source} cannot back a rule`);
    }
    validateMatcher(rule, errors);
  }
  return errors;
}

function validateMatcher(rule: NormalizedRule, errors: string[]): void {
  if (!rule.matcher) return;
  const prefix = rule.id;
  if (!allowedUnits.has(rule.matcher.unit)) errors.push(`${prefix}: invalid matcher unit ${rule.matcher.unit}`);
  if (rule.matcher.kind === "literal") {
    if (!rule.matcher.value) errors.push(`${prefix}: literal matcher value is required`);
  } else if (rule.matcher.kind === "regex") {
    if (!rule.matcher.value) errors.push(`${prefix}: regex matcher value is required`);
    const flags = rule.matcher.flags ?? "u";
    if (/[gy]/.test(flags)) errors.push(`${prefix}: regex flags g/y are reserved by the detector`);
    try {
      new RegExp(rule.matcher.value, flags);
    } catch (error) {
      errors.push(`${prefix}: regex does not compile: ${(error as Error).message}`);
    }
  } else if (rule.matcher.kind === "metric") {
    const metric = rule.matcher.metric;
    if (!metric?.signal) errors.push(`${prefix}: metric signal is required`);
    if (!["gte", "gt", "lte", "lt"].includes(metric?.operator)) errors.push(`${prefix}: invalid metric operator`);
    if (!Number.isFinite(metric?.threshold)) errors.push(`${prefix}: metric threshold must be finite`);
    if (metric?.signal !== "em_dash_per_100_chars") errors.push(`${prefix}: unsupported metric signal ${metric?.signal}`);
  } else {
    errors.push(`${prefix}: unsupported matcher kind ${(rule.matcher as { kind: string }).kind}`);
  }
}

function normalizeHumanText(value: string, lang: string): string {
  let normalized = value.trim().replace(/\s+/gu, " ");
  if (lang === "zh-CN") {
    normalized = normalized
      .replaceAll(",", "，")
      .replaceAll(";", "；")
      .replaceAll(":", "：")
      .replaceAll("?", "？")
      .replaceAll("(", "（")
      .replaceAll(")", "）")
      .replace(/\s*\/\s*/gu, "/")
      .replace(/([\p{Script=Han}，。！？；：、）】」』])\s+(?=[\p{Script=Han}（【「『])/gu, "$1")
      .replace(/([（【「『])\s+(?=[\p{Script=Han}])/gu, "$1");
  }
  return normalized;
}

function formatExample(value: string | undefined, lang: string): string[] {
  if (!value) return [];
  return [normalizeHumanText(value, lang)];
}

export async function renderGuidance(source: RuleSource, config: ModuleConfig): Promise<string | undefined> {
  if (!config.guidance) return undefined;
  const rules = normalizeRules(source, config).filter(
    (rule) => rule.lang === config.guidance!.language && rule.projections.includes("guidance"),
  );
  const preamble = (await readFile(absolute(config.guidance.preamble), "utf8")).trim();
  const postamble = config.guidance.postamble
    ? (await readFile(absolute(config.guidance.postamble), "utf8")).trim()
    : "";
  const blocks: string[] = [
    "<!-- Generated from knowledge-source.yaml by shared/rule-assets. Do not edit directly. -->",
    "",
    preamble,
  ];
  for (const [sectionIndex, section] of config.guidance.sections.entries()) {
    const severityOrder = Object.keys(config.guidance.severity_labels);
    const sectionRules = rules
      .filter((rule) => rule.tier === section.tier)
      .sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));
    if (sectionRules.length === 0) continue;
    blocks.push("", "---", "", `## ${section.title}`);
    if (section.intro) blocks.push("", section.intro);
    for (const [ruleIndex, rule] of sectionRules.entries()) {
      const severity = config.guidance.severity_labels[rule.severity] ?? rule.severity;
      blocks.push("", `### ${sectionIndex + 1}.${ruleIndex + 1} ${normalizeHumanText(rule.title, rule.lang)} \`${severity}\``, "", `Rule ID: \`${rule.id}\``, "", normalizeHumanText(rule.guidance!, rule.lang));
      const bad = formatExample(rule.examples?.bad, rule.lang);
      const good = formatExample(rule.examples?.good, rule.lang);
      if (bad.length) blocks.push(`- ❌ ${bad.join("\n")}`);
      if (good.length) blocks.push(`- ✅ ${good.join("\n")}`);
    }
  }
  if (postamble) blocks.push("", "---", "", postamble);
  return `${blocks.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

export async function renderJudgeRubric(source: RuleSource, config: ModuleConfig): Promise<string | undefined> {
  if (!config.judge) return undefined;
  const rules = normalizeRules(source, config).filter(
    (rule) => rule.lang === config.judge!.language && rule.projections.includes("judge"),
  );
  const preamble = (await readFile(absolute(config.judge.preamble), "utf8")).trim();
  const blocks: string[] = [preamble, "", "---", "", "## Rules"];
  for (const rule of rules) {
    blocks.push(
      "",
      `### ${rule.id} — ${rule.title}`,
      "",
      `- Tier: \`${rule.tier}\``,
      `- Severity: \`${rule.severity}\``,
      `- Maturity: \`${rule.maturity}\``,
      `- Guidance: ${normalizeHumanText(rule.guidance!, rule.lang)}`,
    );
    if (rule.examples?.bad) blocks.push(`- Bad example: ${normalizeHumanText(rule.examples.bad, rule.lang)}`);
    if (rule.examples?.good) blocks.push(`- Better direction: ${normalizeHumanText(rule.examples.good, rule.lang)}`);
    if (rule.notes) blocks.push(`- Notes: ${normalizeHumanText(rule.notes, rule.lang)}`);
  }
  return `${blocks.join("\n")}\n`;
}

function detectorPayload(rule: NormalizedRule): Record<string, unknown> {
  return {
    id: rule.id,
    tier: rule.tier,
    lang: rule.lang,
    title: rule.title,
    severity: rule.severity,
    maturity: rule.maturity,
    targets: rule.targets,
    matcher: rule.matcher,
    source: rule.source,
  };
}

function replacementPayload(rule: NormalizedRule): Record<string, unknown> {
  return { ...detectorPayload(rule), replacement: rule.replacement };
}

export async function compileModule(configPath: string): Promise<{ config: ModuleConfig; artifacts: Map<string, string>; manifest: Record<string, unknown> }> {
  const config = await loadModuleConfig(configPath);
  const { source, sourceText } = await loadRuleSource(config);
  const errors = validateModule(source, config);
  if (errors.length) throw new Error(`Invalid rule module ${config.id}:\n- ${errors.join("\n- ")}`);
  const corpusManifest: Record<string, { cases: number; hash: string }> = {};
  const corpusArtifacts = new Map<string, string>();
  for (const [name, path] of Object.entries(config.corpora ?? {})) {
    const text = await readFile(absolute(path), "utf8");
    if (!text.trim()) throw new Error(`${config.id}: corpus ${name} is empty`);
    const lines = text.trim().split("\n");
    for (const [index, line] of lines.entries()) {
      try {
        JSON.parse(line);
      } catch (error) {
        throw new Error(`${config.id}: invalid JSONL in ${path}:${index + 1}: ${(error as Error).message}`);
      }
    }
    const normalized = `${lines.join("\n")}\n`;
    corpusArtifacts.set(`calibration/${name}.jsonl`, normalized);
    corpusManifest[name] = { cases: lines.length, hash: sha256(normalized) };
  }
  const rules = normalizeRules(source, config);
  const artifacts = new Map<string, string>();
  for (const [name, content] of corpusArtifacts) artifacts.set(name, content);
  if (config.notices) artifacts.set("THIRD_PARTY_NOTICES.md", await readFile(absolute(config.notices), "utf8"));
  const guidance = await renderGuidance(source, config);
  if (guidance && config.guidance) artifacts.set(`guidance.${config.guidance.language}.md`, guidance);
  const rubric = await renderJudgeRubric(source, config);
  if (rubric && config.judge) artifacts.set(`judge-rubric.${config.judge.language}.md`, rubric);

  for (const lang of [...new Set(rules.map((rule) => rule.lang))].sort()) {
    const detectors = rules.filter((rule) => rule.lang === lang && rule.projections.includes("detector"));
    if (detectors.length) {
      artifacts.set(
        `detector-rules.${lang}.json`,
        stableJson({ schema: "detector-rules/v1", module: config.id, language: lang, rules: detectors.map(detectorPayload) }),
      );
    }
    const replacements = rules.filter((rule) => rule.lang === lang && rule.projections.includes("replacement"));
    if (replacements.length) {
      artifacts.set(
        `replacement-rules.${lang}.json`,
        stableJson({ schema: "replacement-rules/v1", module: config.id, language: lang, rules: replacements.map(replacementPayload) }),
      );
    }
  }

  const identity = await gitIdentity();
  const inputPaths = [
    configPath,
    config.source,
    config.guidance?.preamble,
    config.guidance?.postamble,
    config.judge?.preamble,
    ...Object.values(config.corpora ?? {}),
    config.notices,
  ].filter((path): path is string => Boolean(path));
  const inputParts: string[] = [];
  for (const path of [...new Set(inputPaths)].sort()) {
    inputParts.push(path, await readFile(absolute(path), "utf8"));
  }
  const artifactHashes = Object.fromEntries([...artifacts].sort(([a], [b]) => a.localeCompare(b)).map(([name, content]) => [name, sha256(content)]));
  const counts = Object.fromEntries(
    (["guidance", "detector", "judge", "replacement"] as Projection[]).map((projection) => [
      projection,
      rules.filter((rule) => rule.projections.includes(projection)).length,
    ]),
  );
  const manifest: Record<string, unknown> = {
    schema: "rule-pack/v1",
    module: config.id,
    version: source.meta.version,
    primaryLanguage: source.meta.primary_lang,
    sourceRepository: "3aKHP/Neural-Narratology",
    sourceCommit: identity.commit,
    sourceState: identity.state,
    sourceHash: sha256(sourceText),
    moduleInputHash: sha256(inputParts.join("\n")),
    compilerHash: await compilerHash(),
    ruleCount: rules.length,
    projectionCounts: counts,
    requiredCapabilities: config.required_capabilities ?? [],
    preprocessing: source.meta.preprocessing ?? {},
    sources: source.sources,
    corpora: corpusManifest,
    artifacts: artifactHashes,
  };
  artifacts.set("manifest.json", stableJson(manifest));
  return { config, artifacts, manifest };
}

export async function writeArtifacts(outDir: string, artifacts: Map<string, string>): Promise<void> {
  assertSafeOutputPath(outDir);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const [name, content] of artifacts) {
    const path = resolve(outDir, name);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
  }
}

export function assertSafeOutputPath(path: string): void {
  const output = resolve(path);
  const filesystemRoot = parse(output).root;
  if (output === filesystemRoot || output === repoRoot || repoRoot.startsWith(`${output}${sep}`)) {
    throw new Error(`Refusing destructive build output path: ${output}`);
  }
  if (output.includes(`${sep}.git${sep}`) || output.endsWith(`${sep}.git`)) {
    throw new Error(`Refusing build output inside .git: ${output}`);
  }
}

export async function registeredConfigs(): Promise<string[]> {
  const registry = await loadJson<{ schema: string; modules: Array<{ id: string; config: string }> }>("shared/rule-assets/registry.json");
  if (registry.schema !== "rule-module-registry/v1") throw new Error(`Unsupported registry schema ${registry.schema}`);
  const ids = registry.modules.map((item) => item.id);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate module id in registry`);
  return registry.modules.map((item) => item.config);
}

function protectRange(buffer: string[], start: number, end: number): void {
  for (let index = start; index < end; index += 1) {
    if (buffer[index] !== "\n") buffer[index] = " ";
  }
}

export function preprocessCandidate(input: string, protectedRanges: Array<{ start: number; end: number }> = []): string {
  const normalized = input.replace(/\r\n?/g, "\n").normalize("NFC");
  const buffer = normalized.split("");
  const patterns = [
    /```[\s\S]*?```/gu,
    /<!--[\s\S]*?-->/gu,
    /^[ \t]*>.*$/gmu,
    /^[ \t]*\[(?:Beat|Tension|Char|Scene|Turn|!Neural Chain)\][^\n]*$/gmu,
  ];
  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) protectRange(buffer, match.index, match.index + match[0].length);
  }
  for (const range of protectedRanges) {
    protectRange(buffer, Math.max(0, range.start), Math.min(buffer.length, range.end));
  }
  return buffer.join("");
}

function textUnits(text: string, unit: Matcher["unit"]): Array<{ text: string; start: number }> {
  if (unit === "candidate") return [{ text, start: 0 }];
  if (unit === "sentence") {
    return [...text.matchAll(/[^。！？!?\n]+[。！？!?]?/gu)]
      .map((match) => {
        const leading = match[0].match(/^\s*/u)?.[0].length ?? 0;
        return { text: match[0].trim(), start: match.index + leading };
      })
      .filter((item) => item.text.length > 0);
  }
  const units: Array<{ text: string; start: number }> = [];
  let cursor = 0;
  for (const part of text.split(/\n\s*\n/gu)) {
    const start = text.indexOf(part, cursor);
    cursor = start + part.length;
    const leading = part.match(/^\s*/u)?.[0].length ?? 0;
    const trimmed = part.trim();
    if (trimmed) units.push({ text: trimmed, start: start + leading });
  }
  return units;
}

function compareMetric(value: number, operator: string, threshold: number): boolean {
  if (operator === "gte") return value >= threshold;
  if (operator === "gt") return value > threshold;
  if (operator === "lte") return value <= threshold;
  return value < threshold;
}

export function detectText(
  input: string,
  rules: NormalizedRule[],
  options: { protectedRanges?: Array<{ start: number; end: number }> } = {},
): Finding[] {
  const text = preprocessCandidate(input, options.protectedRanges);
  const findings: Finding[] = [];
  for (const rule of rules.filter((item) => item.projections.includes("detector") && item.matcher)) {
    const matcher = rule.matcher!;
    for (const unit of textUnits(text, matcher.unit)) {
      if (matcher.kind === "literal") {
        let cursor = 0;
        while (cursor <= unit.text.length) {
          const local = unit.text.indexOf(matcher.value, cursor);
          if (local < 0) break;
          findings.push({ ruleId: rule.id, severity: rule.severity, maturity: rule.maturity, start: unit.start + local, end: unit.start + local + matcher.value.length, evidence: matcher.value });
          cursor = local + Math.max(1, matcher.value.length);
        }
      } else if (matcher.kind === "regex") {
        const flags = `${matcher.flags ?? "u"}g`;
        for (const match of unit.text.matchAll(new RegExp(matcher.value, flags))) {
          findings.push({ ruleId: rule.id, severity: rule.severity, maturity: rule.maturity, start: unit.start + match.index, end: unit.start + match.index + match[0].length, evidence: match[0] });
        }
      } else {
        const length = Math.max(1, [...unit.text].length);
        const count = [...unit.text].filter((char) => char === "—").length;
        const value = (count / length) * 100;
        if (compareMetric(value, matcher.metric.operator, matcher.metric.threshold)) {
          findings.push({
            ruleId: rule.id,
            severity: rule.severity,
            maturity: rule.maturity,
            start: unit.start,
            end: unit.start + unit.text.length,
            evidence: unit.text.slice(0, 160),
            metric: { signal: matcher.metric.signal, value, threshold: matcher.metric.threshold },
          });
        }
      }
    }
  }
  return findings.sort((a, b) => a.start - b.start || a.ruleId.localeCompare(b.ruleId));
}

export async function syncTrackedGuidance(configPath: string): Promise<void> {
  const config = await loadModuleConfig(configPath);
  if (!config.tracked_guidance) return;
  const { source } = await loadRuleSource(config);
  const guidance = await renderGuidance(source, config);
  if (!guidance) return;
  await mkdir(dirname(absolute(config.tracked_guidance)), { recursive: true });
  await writeFile(absolute(config.tracked_guidance), guidance, "utf8");
}

export function parseArgs(args: string[]): Record<string, string | boolean> {
  const parsed: Record<string, string | boolean> = {};
  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      parsed[key] = next;
      index += 1;
    } else parsed[key] = true;
  }
  return parsed;
}
