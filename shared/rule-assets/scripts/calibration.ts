import { lstatSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { absolute, loadModuleConfig, loadRuleSource, normalizeRules, repoRoot, sha256, stableJson, type ModuleConfig } from "./lib";

type Provenance = {
  source: string;
  license: string;
  redistribution: "public" | "metadata-only" | "restricted";
  privacy: "not-applicable" | "deidentified" | "contains-private-data";
  commit?: string;
  version?: string;
  ruleId?: string;
  deidentificationNotes?: string;
  notes?: string;
};

export type CalibrationCase = {
  schema: "quality-calibration-case/v1";
  name: string;
  language: string;
  targetType: string;
  split: "train" | "dev" | "held-out";
  genre: string;
  sourceKind: string;
  modelFamily: string;
  lengthBucket: "short" | "medium" | "long";
  pov: "first" | "third" | "mixed" | "not-applicable";
  dialogueRatio: number;
  text: string;
  expectedVerdict: "pass" | "rewrite";
  expectedRuleIds: string[];
  provenance: Provenance;
};

type Evidence = { ruleId: string; text: string };

export type CalibrationAnnotation = {
  schema: "quality-calibration-annotation/v1";
  caseId: string;
  annotations: Array<{
    annotatorId: string;
    verdict: "pass" | "rewrite";
    ruleIds: string[];
    evidence: Evidence[];
    rationale: string;
  }>;
  adjudication: {
    status: "agreed" | "resolved";
    verdict: "pass" | "rewrite";
    ruleIds: string[];
    evidence: Evidence[];
    rationale: string;
    adjudicatorId: string;
  };
};

export type HeldOutFreeze = {
  schema: "quality-held-out-freeze/v1";
  toolVersion: "1";
  freezeId: string;
  frozenAt: string;
  caseCount: number;
  rewriteCount: number;
  passCount: number;
  casesSha256: string;
  labelsSha256: string;
  caseIdsSha256: string;
  corpusSha256: string;
  governance: {
    visibility: "local-blind";
    labelsAccess: "adjudicators-only";
    releaseAfterDecision: boolean;
  };
};

export type HeldOutLabel = {
  schema: "quality-calibration-label/v1";
  caseId: string;
  expectedVerdict: "pass" | "rewrite";
  expectedRuleIds: string[];
  provenance: Provenance;
  annotation: CalibrationAnnotation;
};

type FreezeOptions = {
  referenceCorpora?: Record<string, CalibrationCase[]>;
  allowedRuleIds?: Set<string>;
  releaseAfterDecision?: boolean;
};

type AuditOptions = {
  localCorpusNames?: Set<string>;
};

export function parseJsonLines<T>(text: string, label: string): T[] {
  const values: T[] = [];
  for (const [index, line] of text.replaceAll("\r\n", "\n").trim().split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      values.push(JSON.parse(line) as T);
    } catch (error) {
      throw new Error(`${label}:${index + 1}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return values;
}

function jsonLines(values: unknown[]): string {
  return `${values.map((value) => JSON.stringify(canonicalize(value))).join("\n")}\n`;
}

function compareString(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareString(left, right))
      .map(([key, item]) => [key, canonicalize(item)]),
  );
}

export function normalizedCandidate(text: string): string {
  return text.normalize("NFC").replaceAll("\r\n", "\n").replace(/[\p{P}\p{S}\s]+/gu, "").toLocaleLowerCase("zh-CN");
}

function ngrams(value: string, size = 4): Set<string> {
  const points = [...value];
  if (points.length < size) return new Set(points.length > 0 ? [points.join("")] : []);
  return new Set(Array.from({ length: points.length - size + 1 }, (_, index) => points.slice(index, index + size).join("")));
}

export function similarity(left: string, right: string): number {
  const leftGrams = ngrams(normalizedCandidate(left));
  const rightGrams = ngrams(normalizedCandidate(right));
  return gramSimilarity(leftGrams, rightGrams);
}

function gramSimilarity(leftGrams: Set<string>, rightGrams: Set<string>): number {
  if (leftGrams.size === 0 || rightGrams.size === 0) return 0;
  let intersection = 0;
  for (const gram of leftGrams) if (rightGrams.has(gram)) intersection += 1;
  return intersection / (leftGrams.size + rightGrams.size - intersection);
}

function editSimilarity(left: string, right: string): number {
  const leftPoints = [...left];
  const rightPoints = [...right];
  let previous = Array.from({ length: rightPoints.length + 1 }, (_, index) => index);
  for (const [leftIndex, leftPoint] of leftPoints.entries()) {
    const current = [leftIndex + 1];
    for (const [rightIndex, rightPoint] of rightPoints.entries()) {
      current.push(Math.min(
        current[rightIndex] + 1,
        previous[rightIndex + 1] + 1,
        previous[rightIndex] + (leftPoint === rightPoint ? 0 : 1),
      ));
    }
    previous = current;
  }
  return 1 - previous[rightPoints.length] / Math.max(leftPoints.length, rightPoints.length);
}

export function auditCalibrationSplits(corpora: Record<string, CalibrationCase[]>, options: AuditOptions = {}): string[] {
  const errors: string[] = [];
  const all: Array<{ corpus: string; item: CalibrationCase; normalized: string; fingerprint: string; grams: Set<string> }> = [];
  const globalNames = new Map<string, string>();
  for (const [corpus, items] of Object.entries(corpora)) {
    const names = new Set<string>();
    for (const item of items) {
      if (names.has(item.name)) errors.push(`${corpus}: duplicate case id ${item.name}`);
      names.add(item.name);
      const previousCorpus = globalNames.get(item.name);
      if (previousCorpus && previousCorpus !== corpus) errors.push(`duplicate case id across corpora: ${previousCorpus}/${corpus}:${item.name}`);
      globalNames.set(item.name, corpus);
      const normalized = normalizedCandidate(item.text);
      if (!normalized) errors.push(`${corpus}:${item.name}: candidate is empty after normalization`);
      if (item.provenance.privacy === "deidentified" && !item.provenance.deidentificationNotes) {
        errors.push(`${corpus}:${item.name}: deidentified provenance requires deidentificationNotes`);
      }
      if (item.provenance.privacy === "contains-private-data" && item.provenance.redistribution === "public") {
        errors.push(`${corpus}:${item.name}: private data cannot be publicly redistributed`);
      }
      if (!options.localCorpusNames?.has(corpus) && item.provenance.redistribution !== "public") {
        errors.push(`${corpus}:${item.name}: published corpus requires public redistribution`);
      }
      if (!options.localCorpusNames?.has(corpus) && item.provenance.privacy === "contains-private-data") {
        errors.push(`${corpus}:${item.name}: published corpus cannot contain private data`);
      }
      all.push({ corpus, item, normalized, fingerprint: sha256(normalized), grams: ngrams(normalized) });
    }
  }
  for (let leftIndex = 0; leftIndex < all.length; leftIndex += 1) {
    const left = all[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < all.length; rightIndex += 1) {
      const right = all[rightIndex];
      const label = `${left.corpus}:${left.item.name} (${left.item.split}) / ${right.corpus}:${right.item.name} (${right.item.split})`;
      if (left.fingerprint === right.fingerprint) {
        errors.push(`${left.item.split === right.item.split ? "duplicate candidate" : "cross-split duplicate"}: ${label}`);
        continue;
      }
      if (left.item.split === right.item.split) continue;
      const shortest = Math.min([...left.normalized].length, [...right.normalized].length);
      const nearDuplicate = shortest < 24
        ? editSimilarity(left.normalized, right.normalized) >= 0.8
        : gramSimilarity(left.grams, right.grams) >= 0.88;
      if (nearDuplicate) {
        errors.push(`cross-split near duplicate: ${label}`);
      }
    }
  }
  return errors;
}

function validateAnnotation(caseItem: CalibrationCase, annotation: CalibrationAnnotation, allowedRuleIds?: Set<string>): string[] {
  const errors: string[] = [];
  if (annotation.annotations.length !== 2) errors.push(`${caseItem.name}: exactly two independent annotations are required`);
  const annotators = new Set(annotation.annotations.map((item) => item.annotatorId));
  if (annotators.size !== annotation.annotations.length) errors.push(`${caseItem.name}: annotator ids must be distinct`);
  if (annotators.has(annotation.adjudication.adjudicatorId)) errors.push(`${caseItem.name}: adjudicator must be independent from annotators`);
  for (const judgment of [...annotation.annotations, annotation.adjudication]) {
    if (judgment.verdict === "pass" && (judgment.ruleIds.length > 0 || judgment.evidence.length > 0)) {
      errors.push(`${caseItem.name}: pass judgment cannot contain rules or evidence`);
    }
    if (judgment.verdict === "rewrite" && (judgment.ruleIds.length === 0 || judgment.evidence.length === 0)) {
      errors.push(`${caseItem.name}: rewrite judgment requires rules and evidence`);
    }
    for (const evidence of judgment.evidence) {
      if (!judgment.ruleIds.includes(evidence.ruleId)) errors.push(`${caseItem.name}: evidence references unselected rule ${evidence.ruleId}`);
      if (!caseItem.text.includes(evidence.text)) errors.push(`${caseItem.name}: evidence is not an exact candidate substring`);
      if (evidence.text === caseItem.text) errors.push(`${caseItem.name}: evidence cannot equal the entire candidate`);
    }
    for (const ruleId of judgment.ruleIds) {
      if (!judgment.evidence.some((evidence) => evidence.ruleId === ruleId)) {
        errors.push(`${caseItem.name}: selected rule ${ruleId} requires evidence`);
      }
    }
    for (const ruleId of judgment.ruleIds) if (allowedRuleIds && !allowedRuleIds.has(ruleId)) errors.push(`${caseItem.name}: unknown annotated rule ${ruleId}`);
  }
  const sorted = (values: string[]): string => JSON.stringify([...values].sort());
  const evidenceKey = (values: Evidence[]): string => JSON.stringify(
    values.map(({ ruleId, text }) => [ruleId, text]).sort(([leftRule, leftText], [rightRule, rightText]) => (
      compareString(`${leftRule}\n${leftText}`, `${rightRule}\n${rightText}`)
    )),
  );
  if (annotation.adjudication.verdict !== caseItem.expectedVerdict) errors.push(`${caseItem.name}: adjudicated verdict does not match case label`);
  if (sorted(annotation.adjudication.ruleIds) !== sorted(caseItem.expectedRuleIds)) errors.push(`${caseItem.name}: adjudicated rules do not match case label`);
  const unanimous = annotation.annotations.every((judgment) => (
    judgment.verdict === annotation.adjudication.verdict
    && sorted(judgment.ruleIds) === sorted(annotation.adjudication.ruleIds)
    && evidenceKey(judgment.evidence) === evidenceKey(annotation.adjudication.evidence)
  ));
  if (annotation.adjudication.status === "agreed" && !unanimous) {
    errors.push(`${caseItem.name}: agreed adjudication does not match both annotations`);
  }
  if (annotation.adjudication.status === "resolved" && unanimous) {
    errors.push(`${caseItem.name}: resolved adjudication requires an annotation disagreement`);
  }
  return errors;
}

export function prepareHeldOut(
  cases: CalibrationCase[],
  annotations: CalibrationAnnotation[],
  freezeId: string,
  frozenAt: string,
  options: FreezeOptions = {},
): { casesText: string; labelsText: string; manifest: HeldOutFreeze } {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(freezeId)) throw new Error("freeze id must be kebab-case");
  const normalizedFrozenAt = normalizeFrozenAt(frozenAt);
  const sortedCases = [...cases].sort((left, right) => compareString(left.name, right.name));
  const sortedAnnotations = [...annotations].sort((left, right) => compareString(left.caseId, right.caseId));
  if (sortedCases.length === 0) throw new Error("held-out corpus must contain at least one case");
  const duplicateErrors = auditCalibrationSplits(
    { ...(options.referenceCorpora ?? {}), "held-out-source": sortedCases },
    { localCorpusNames: new Set(["held-out-source"]) },
  );
  const annotationsByCase = new Map(sortedAnnotations.map((item) => [item.caseId, item]));
  const errors = [...duplicateErrors];
  if (annotationsByCase.size !== sortedAnnotations.length) errors.push("annotations contain duplicate case ids");
  for (const item of sortedCases) {
    if (item.split !== "held-out") errors.push(`${item.name}: freeze input must use split held-out`);
    const annotation = annotationsByCase.get(item.name);
    if (!annotation) errors.push(`${item.name}: missing annotation`);
    else {
      errors.push(...validateAnnotation(item, annotation, options.allowedRuleIds));
    }
  }
  for (const annotation of sortedAnnotations) {
    if (!sortedCases.some((item) => item.name === annotation.caseId)) errors.push(`${annotation.caseId}: annotation has no case`);
  }
  if (errors.length > 0) throw new Error(`Held-out freeze validation failed:\n- ${errors.join("\n- ")}`);

  const opaqueCaseIds = new Map(sortedCases.map((item, index) => [item.name, `case-${String(index + 1).padStart(6, "0")}`]));
  const blindCases = sortedCases.map((item) => ({
    schema: "quality-calibration-blind-case/v1",
    caseId: opaqueCaseIds.get(item.name)!,
    language: item.language,
    targetType: item.targetType,
    genre: item.genre,
    sourceKind: item.sourceKind,
    modelFamily: item.modelFamily,
    lengthBucket: item.lengthBucket,
    pov: item.pov,
    dialogueRatio: item.dialogueRatio,
    text: item.text,
    candidateSha256: sha256(item.text.normalize("NFC").replaceAll("\r\n", "\n")),
  }));
  const casesText = jsonLines(blindCases);
  const labels: HeldOutLabel[] = sortedCases.map((item) => ({
    schema: "quality-calibration-label/v1",
    caseId: opaqueCaseIds.get(item.name)!,
    expectedVerdict: item.expectedVerdict,
    expectedRuleIds: item.expectedRuleIds,
    provenance: item.provenance,
    annotation: { ...annotationsByCase.get(item.name)!, caseId: opaqueCaseIds.get(item.name)! },
  }));
  const labelsText = jsonLines(labels);
  const caseIdsText = `${blindCases.map((item) => item.caseId).join("\n")}\n`;
  const casesSha256 = sha256(casesText);
  const labelsSha256 = sha256(labelsText);
  const caseIdsSha256 = sha256(caseIdsText);
  const manifest: HeldOutFreeze = {
    schema: "quality-held-out-freeze/v1",
    toolVersion: "1",
    freezeId,
    frozenAt: normalizedFrozenAt,
    caseCount: sortedCases.length,
    rewriteCount: labels.filter((item) => item.expectedVerdict === "rewrite").length,
    passCount: labels.filter((item) => item.expectedVerdict === "pass").length,
    casesSha256,
    labelsSha256,
    caseIdsSha256,
    corpusSha256: sha256(`${casesSha256}\n${labelsSha256}\n${caseIdsSha256}\n`),
    governance: {
      visibility: "local-blind",
      labelsAccess: "adjudicators-only",
      releaseAfterDecision: options.releaseAfterDecision ?? false,
    },
  };
  return { casesText, labelsText, manifest };
}

function normalizeFrozenAt(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) throw new Error("frozen-at must be an RFC 3339 date-time with an explicit offset");
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = "", zone, sign, offsetHourText, offsetMinuteText] = match;
  const [year, month, day, hour, minute, second] = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  const millisecond = Number(fraction.padEnd(3, "0"));
  const offsetHour = zone === "Z" ? 0 : Number(offsetHourText);
  const offsetMinute = zone === "Z" ? 0 : Number(offsetMinuteText);
  if (hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59) {
    throw new Error("frozen-at contains an out-of-range time or offset");
  }
  const wallTime = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  const wallDate = new Date(wallTime);
  if (
    wallDate.getUTCFullYear() !== year
    || wallDate.getUTCMonth() !== month - 1
    || wallDate.getUTCDate() !== day
    || wallDate.getUTCHours() !== hour
    || wallDate.getUTCMinutes() !== minute
    || wallDate.getUTCSeconds() !== second
  ) {
    throw new Error("frozen-at is not a valid calendar date-time");
  }
  const offset = (offsetHour * 60 + offsetMinute) * (sign === "-" ? -1 : 1);
  return new Date(wallTime - offset * 60_000).toISOString();
}

export async function writeNewFiles(files: Array<{ path: string; content: string }>): Promise<void> {
  const existing: string[] = [];
  for (const file of files) if (await Bun.file(file.path).exists()) existing.push(file.path);
  if (existing.length > 0) throw new Error(`refusing to overwrite existing freeze output: ${existing.join(", ")}`);
  await Promise.all(files.map((file) => mkdir(dirname(file.path), { recursive: true })));
  const created: string[] = [];
  try {
    for (const file of files) {
      await writeFile(file.path, file.content, { encoding: "utf8", flag: "wx" });
      created.push(file.path);
    }
  } catch (error) {
    await Promise.allSettled(created.map((path) => rm(path, { force: true })));
    throw error;
  }
}

export function verifyHeldOutFreeze(casesText: string, labelsText: string, manifest: HeldOutFreeze): string[] {
  const caseIds = parseJsonLines<{ caseId: string }>(casesText, "blinded cases").map((item) => item.caseId);
  const labels = parseJsonLines<HeldOutLabel>(labelsText, "labels");
  const labelIds = labels.map((item) => item.caseId);
  const casesSha256 = sha256(casesText);
  const labelsSha256 = sha256(labelsText);
  const caseIdsSha256 = sha256(`${caseIds.join("\n")}\n`);
  const errors: string[] = [];
  if (caseIds.length !== manifest.caseCount) errors.push(`case count ${caseIds.length} does not match ${manifest.caseCount}`);
  if (new Set(caseIds).size !== caseIds.length) errors.push("blinded cases contain duplicate case ids");
  if (new Set(labelIds).size !== labelIds.length) errors.push("labels contain duplicate case ids");
  if (JSON.stringify(labelIds) !== JSON.stringify(caseIds)) errors.push("label case ids do not match blinded case ids");
  const rewriteCount = labels.filter((item) => item.expectedVerdict === "rewrite").length;
  const passCount = labels.filter((item) => item.expectedVerdict === "pass").length;
  if (rewriteCount !== manifest.rewriteCount) errors.push(`rewrite count ${rewriteCount} does not match ${manifest.rewriteCount}`);
  if (passCount !== manifest.passCount) errors.push(`pass count ${passCount} does not match ${manifest.passCount}`);
  if (casesSha256 !== manifest.casesSha256) errors.push("blinded cases digest mismatch");
  if (labelsSha256 !== manifest.labelsSha256) errors.push("labels digest mismatch");
  if (caseIdsSha256 !== manifest.caseIdsSha256) errors.push("case id digest mismatch");
  if (sha256(`${casesSha256}\n${labelsSha256}\n${caseIdsSha256}\n`) !== manifest.corpusSha256) errors.push("combined corpus digest mismatch");
  return errors;
}

function parseArgs(argv: string[]): { command?: string; values: Record<string, string> } {
  const [command, ...rest] = argv;
  const values: Record<string, string> = {};
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index];
    const value = rest[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error(`Expected --key value, received ${key ?? "<end>"}`);
    values[key.slice(2)] = value;
  }
  return { command, values };
}

export function privatePath(path: string): string {
  const resolved = absolute(path);
  const relativePath = relative(repoRoot, resolved).replaceAll("\\", "/");
  if (!relativePath.startsWith("dev/") || relativePath.includes("../")) throw new Error(`Held-out paths must stay under ignored dev/: ${path}`);
  for (let current = resolved; current !== repoRoot; current = dirname(current)) {
    try {
      if (lstatSync(current).isSymbolicLink()) throw new Error(`Held-out paths cannot contain symbolic links: ${path}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return resolved;
}

async function schemaValidator(config: ModuleConfig): Promise<Ajv2020> {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const path of Object.values(config.schemas ?? {})) ajv.addSchema(JSON.parse(await readFile(absolute(path), "utf8")));
  return ajv;
}

function validateValues(ajv: Ajv2020, schemaName: string, values: unknown[], label: string): void {
  const schemaId = `https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/${schemaName}.schema.json`;
  for (const [index, value] of values.entries()) {
    if (!ajv.validate(schemaId, value)) throw new Error(`${label}:${index + 1}: ${ajv.errorsText(ajv.errors)}`);
  }
}

async function trackedCalibrationCorpora(config: ModuleConfig): Promise<Record<string, CalibrationCase[]>> {
  const corpora: Record<string, CalibrationCase[]> = {};
  for (const [name, path] of Object.entries(config.corpora ?? {})) {
    if (name === "host-conformance") continue;
    corpora[name] = parseJsonLines<CalibrationCase>(await readFile(absolute(path), "utf8"), path);
  }
  return corpora;
}

async function main(): Promise<void> {
  const { command, values } = parseArgs(Bun.argv.slice(2));
  if (command === "audit") {
    const config = await loadModuleConfig(values.config ?? "shared/anti-ai-flavor/module.config.json");
    const corpora = await trackedCalibrationCorpora(config);
    const ajv = await schemaValidator(config);
    for (const [name, items] of Object.entries(corpora)) validateValues(ajv, "calibration-case", items, name);
    const errors = auditCalibrationSplits(corpora);
    if (errors.length > 0) throw new Error(`Calibration audit failed:\n- ${errors.join("\n- ")}`);
    console.log(`Calibration audit passed (${Object.values(corpora).flat().length} cases, no cross-split leakage).`);
    return;
  }
  if (command === "freeze") {
    for (const key of ["cases", "annotations", "cases-out", "labels-out", "manifest-out", "freeze-id", "frozen-at"]) {
      if (!values[key]) throw new Error(`freeze requires --${key}`);
    }
    if (values["release-after-decision"] && !["true", "false"].includes(values["release-after-decision"])) {
      throw new Error("--release-after-decision must be true or false");
    }
    const paths = ["cases", "annotations", "cases-out", "labels-out", "manifest-out"].map((key) => privatePath(values[key]));
    if (new Set(paths).size !== paths.length) throw new Error("held-out source and output paths must be distinct");
    const config = await loadModuleConfig(values.config ?? "shared/anti-ai-flavor/module.config.json");
    const cases = parseJsonLines<CalibrationCase>(await readFile(privatePath(values.cases), "utf8"), values.cases);
    const annotations = parseJsonLines<CalibrationAnnotation>(await readFile(privatePath(values.annotations), "utf8"), values.annotations);
    const ajv = await schemaValidator(config);
    validateValues(ajv, "calibration-case", cases, "held-out cases");
    validateValues(ajv, "calibration-annotation", annotations, "held-out annotations");
    const { source } = await loadRuleSource(config);
    const allowedRuleIds = new Set(normalizeRules(source, config).filter((rule) => rule.projections.includes("judge")).map((rule) => rule.id));
    const result = prepareHeldOut(cases, annotations, values["freeze-id"], values["frozen-at"], {
      referenceCorpora: await trackedCalibrationCorpora(config),
      allowedRuleIds,
      releaseAfterDecision: values["release-after-decision"] === "true",
    });
    await writeNewFiles([
      { path: privatePath(values["cases-out"]), content: result.casesText },
      { path: privatePath(values["labels-out"]), content: result.labelsText },
      { path: privatePath(values["manifest-out"]), content: stableJson(result.manifest) },
    ]);
    console.log(`Frozen ${result.manifest.caseCount} held-out cases as ${result.manifest.freezeId} (${result.manifest.corpusSha256}).`);
    return;
  }
  if (command === "verify") {
    for (const key of ["cases", "labels", "manifest"]) if (!values[key]) throw new Error(`verify requires --${key}`);
    const casesText = await readFile(privatePath(values.cases), "utf8");
    const labelsText = await readFile(privatePath(values.labels), "utf8");
    const manifest = JSON.parse(await readFile(privatePath(values.manifest), "utf8")) as HeldOutFreeze;
    const config = await loadModuleConfig(values.config ?? "shared/anti-ai-flavor/module.config.json");
    const ajv = await schemaValidator(config);
    validateValues(ajv, "calibration-blind-case", parseJsonLines(casesText, "blinded cases"), "blinded cases");
    validateValues(ajv, "calibration-label", parseJsonLines(labelsText, "labels"), "labels");
    validateValues(ajv, "held-out-freeze", [manifest], "freeze manifest");
    const errors = verifyHeldOutFreeze(casesText, labelsText, manifest);
    if (errors.length > 0) throw new Error(`Held-out verification failed:\n- ${errors.join("\n- ")}`);
    console.log(`Held-out freeze ${manifest.freezeId} verified (${manifest.corpusSha256}).`);
    return;
  }
  throw new Error("Usage: calibration.ts audit|freeze|verify [--key value ...]");
}

if (import.meta.main) await main();
