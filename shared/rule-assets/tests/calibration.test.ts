import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  auditCalibrationSplits,
  parseJsonLines,
  prepareHeldOut,
  privatePath,
  similarity,
  verifyHeldOutFreeze,
  writeNewFiles,
  type CalibrationAnnotation,
  type CalibrationCase,
} from "../scripts/calibration";
import { absolute, loadModuleConfig, publishedCorpusProvenanceError } from "../scripts/lib";

const configPath = "shared/anti-ai-flavor/module.config.json";
const fixtureRoot = "shared/rule-assets/tests/fixtures/calibration";

async function fixture<T>(name: string): Promise<T[]> {
  return parseJsonLines<T>(await readFile(absolute(`${fixtureRoot}/${name}`), "utf8"), name);
}

async function schemaValidator(): Promise<Ajv2020> {
  const config = await loadModuleConfig(configPath);
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const path of Object.values(config.schemas ?? {})) ajv.addSchema(JSON.parse(await readFile(absolute(path), "utf8")));
  return ajv;
}

function expectSchema(ajv: Ajv2020, id: string, value: unknown): void {
  expect(ajv.validate(id, value), ajv.errorsText(ajv.errors)).toBe(true);
}

function boundedMetric() {
  return { value: 0, numerator: 0, denominator: 0, wilson95Low: 0, wilson95High: 0 };
}

function metrics() {
  return {
    expectedRewriteRecall: boundedMetric(),
    passFalseRewriteRate: boundedMetric(),
    verdictAgreement: boundedMetric(),
    invalidRate: boundedMetric(),
    repairExhaustedRate: boundedMetric(),
    timeoutRate: boundedMetric(),
    unavailableRate: boundedMetric(),
    ruleContractRate: boundedMetric(),
    evidenceContractRate: boundedMetric(),
  };
}

describe("quality calibration governance", () => {
  test("keeps tracked train and dev corpora unique across splits", async () => {
    const config = await loadModuleConfig(configPath);
    const corpora: Record<string, CalibrationCase[]> = {};
    for (const [name, path] of Object.entries(config.corpora ?? {})) {
      if (name === "host-conformance") continue;
      corpora[name] = parseJsonLines<CalibrationCase>(await readFile(absolute(path), "utf8"), path);
    }
    expect(auditCalibrationSplits(corpora)).toEqual([]);
    expect(corpora.judge).toHaveLength(30);
    expect(corpora.judge.every((item) => item.split === "dev")).toBe(true);
    expect(corpora.judge.filter((item) => item.expectedVerdict === "rewrite")).toHaveLength(16);
    expect(corpora.judge.filter((item) => item.expectedVerdict === "pass")).toHaveLength(14);
  });

  test("detects exact, punctuation-only, and near-duplicate cross-split leakage", () => {
    const provenance = {
      source: "fixture",
      license: "MIT",
      redistribution: "public" as const,
      privacy: "not-applicable" as const,
    };
    const base: CalibrationCase = {
      schema: "quality-calibration-case/v1",
      name: "train-a",
      language: "zh-CN",
      targetType: "narrative-prose",
      split: "train",
      genre: "realist",
      sourceKind: "synthetic-human",
      modelFamily: "not-applicable",
      lengthBucket: "short",
      pov: "third",
      dialogueRatio: 0,
      text: "她把门边那双沾泥的鞋收进纸箱，又将寄件单压在最下面。窗台还留着半杯冷茶，杯沿的口红已经干了。她关灯前拍下箱子的编号，把照片发给等在楼下的搬运工。",
      expectedVerdict: "pass",
      expectedRuleIds: [],
      provenance,
    };
    const punctuationVariant = { ...base, name: "dev-a", split: "dev" as const, text: "她把门边那双沾泥的鞋，收进纸箱；又将寄件单压在最下面。窗台还留着半杯冷茶，杯沿的口红已经干了。她关灯前拍下箱子的编号，把照片发给等在楼下的搬运工。" };
    expect(auditCalibrationSplits({ train: [base], dev: [punctuationVariant] }).join("\n")).toContain("cross-split duplicate");
    const nearVariant = { ...base, name: "dev-b", split: "dev" as const, text: "她把门边那双沾泥的鞋收进旧纸箱，又将寄件单压在最下面。窗台还留着半杯冷茶，杯沿的口红已经干了。她关灯前拍下箱子的编号，把照片发给等在楼下的搬运工。" };
    expect(similarity(base.text, nearVariant.text)).toBeGreaterThanOrEqual(0.88);
    expect(auditCalibrationSplits({ train: [base], dev: [nearVariant] }).join("\n")).toContain("cross-split near duplicate");
    const shortBase = { ...base, text: "小明把湿报纸铺在暖气旁边" };
    const shortNameVariant = { ...shortBase, name: "dev-short", split: "dev" as const, text: "小红把湿报纸铺在暖气旁边" };
    expect(auditCalibrationSplits({ train: [shortBase], dev: [shortNameVariant] }).join("\n")).toContain("cross-split near duplicate");
    expect(auditCalibrationSplits({ train: [base, { ...base, name: "train-b" }] }).join("\n")).toContain("duplicate candidate");
    expect(auditCalibrationSplits({ train: [{
      ...base,
      provenance: { source: "private", license: "restricted", redistribution: "restricted", privacy: "contains-private-data" },
    }] }).join("\n")).toContain("published corpus requires public redistribution");
    expect(publishedCorpusProvenanceError({ provenance: { redistribution: "restricted", privacy: "contains-private-data" } })).toBe("published corpus requires public redistribution");
    expect(publishedCorpusProvenanceError({ provenance: { redistribution: "public" } })).toBe("published corpus requires a non-private privacy declaration");
    expect(publishedCorpusProvenanceError({ provenance: { redistribution: "public", privacy: "unknown" } })).toBe("published corpus requires a non-private privacy declaration");
    expect(publishedCorpusProvenanceError({ provenance: { redistribution: "public", privacy: "deidentified" } })).toBe("deidentified published corpus requires deidentification notes");
    expect(publishedCorpusProvenanceError({ provenance: { redistribution: "public", privacy: "deidentified", deidentificationNotes: "Names replaced before annotation." } })).toBeUndefined();
  });

  test("builds and verifies a deterministic blinded held-out freeze", async () => {
    const cases = await fixture<CalibrationCase>("held-out-cases.jsonl");
    const annotations = await fixture<CalibrationAnnotation>("held-out-annotations.jsonl");
    const first = prepareHeldOut(cases, annotations, "fixture-held-out-v1", "2026-07-17T00:00:00+08:00");
    const second = prepareHeldOut([...cases].reverse(), [...annotations].reverse(), "fixture-held-out-v1", "2026-07-17T00:00:00+08:00");
    expect(second).toEqual(first);
    expect(first.manifest.corpusSha256).toBe("f05cf5e701324e6059719c20174547ae85add5fd5bf23ffdc3789d4b1b35615a");
    expect(first.manifest.frozenAt).toBe("2026-07-16T16:00:00.000Z");
    expect(first.manifest).toMatchObject({ caseCount: 4, rewriteCount: 2, passCount: 2 });
    expect(first.manifest.governance.releaseAfterDecision).toBe(false);
    expect(first.casesText).not.toContain("expectedVerdict");
    expect(first.casesText).not.toContain("expectedRuleIds");
    expect(first.casesText).not.toContain("provenance");
    expect(first.casesText).not.toContain("rationale");
    expect(first.casesText).not.toContain("fixture-held-out-pass");
    expect(first.casesText).not.toContain("fixture-held-out-rewrite");
    expect(parseJsonLines<{ caseId: string }>(first.casesText, "blinded cases").map((item) => item.caseId)).toEqual([
      "case-000001",
      "case-000002",
      "case-000003",
      "case-000004",
    ]);
    expect(first.labelsText).toContain("provenance");
    for (const label of parseJsonLines<{ caseId: string; annotation: { caseId: string } }>(first.labelsText, "labels")) {
      expect(label.annotation.caseId).toBe(label.caseId);
    }
    expect(verifyHeldOutFreeze(first.casesText, first.labelsText, first.manifest)).toEqual([]);
    expect(verifyHeldOutFreeze(first.casesText.replace("塔顶", "塔尖"), first.labelsText, first.manifest)).toContain("blinded cases digest mismatch");
    expect(verifyHeldOutFreeze(first.casesText, first.labelsText, { ...first.manifest, passCount: 3 })).toContain("pass count 2 does not match 3");
    expect(() => prepareHeldOut(cases, annotations, "fixture-held-out-v1", "2026-07-17T00:00:00+08:00", {
      referenceCorpora: { train: [{ ...cases[0], split: "train" }] },
    })).toThrow(/cross-split duplicate/);
    expect(() => prepareHeldOut(cases, annotations, "fixture-held-out-v1", "2026-07-17T00:00:00+08:00", {
      allowedRuleIds: new Set(),
    })).toThrow(/unknown annotated rule/);
    const nonIndependent = structuredClone(annotations);
    nonIndependent[0].adjudication.adjudicatorId = nonIndependent[0].annotations[0].annotatorId;
    expect(() => prepareHeldOut(cases, nonIndependent, "fixture-held-out-v1", "2026-07-17T00:00:00+08:00")).toThrow(/adjudicator must be independent/);
    const changedProvenance = structuredClone(cases);
    changedProvenance[0].provenance.notes = "changed provenance";
    expect(prepareHeldOut(changedProvenance, annotations, "fixture-held-out-v1", "2026-07-17T00:00:00+08:00").manifest.corpusSha256).not.toBe(first.manifest.corpusSha256);
    const privateCases = structuredClone(cases);
    privateCases[0].provenance = { source: "private-user", license: "restricted", redistribution: "restricted", privacy: "contains-private-data" };
    expect(prepareHeldOut(privateCases, annotations, "fixture-held-out-v1", "2026-07-17T00:00:00Z").labelsText).toContain("contains-private-data");
    const missingEvidenceCases = structuredClone(cases);
    const missingEvidenceAnnotations = structuredClone(annotations);
    missingEvidenceCases[2].expectedRuleIds.push("zh-f1-obscure-simile");
    for (const judgment of [...missingEvidenceAnnotations[2].annotations, missingEvidenceAnnotations[2].adjudication]) {
      judgment.ruleIds.push("zh-f1-obscure-simile");
    }
    expect(() => prepareHeldOut(missingEvidenceCases, missingEvidenceAnnotations, "fixture-held-out-v1", "2026-07-17T00:00:00Z")).toThrow(/selected rule zh-f1-obscure-simile requires evidence/);
    const wholeCandidateEvidence = structuredClone(annotations);
    wholeCandidateEvidence[2].annotations[0].evidence[0].text = cases[2].text;
    expect(() => prepareHeldOut(cases, wholeCandidateEvidence, "fixture-held-out-v1", "2026-07-17T00:00:00Z")).toThrow(/evidence cannot equal the entire candidate/);
    for (const invalid of ["July 17, 2026", "2026-07-17", "0", "2026-07-17 10:00:00", "2026-02-30T00:00:00Z"]) {
      expect(() => prepareHeldOut(cases, annotations, "fixture-held-out-v1", invalid)).toThrow(/frozen-at/);
    }
    const unanimous = structuredClone(annotations);
    unanimous[2].annotations[1] = { ...structuredClone(unanimous[2].annotations[0]), annotatorId: "ann-b" };
    unanimous[2].adjudication = {
      status: "agreed",
      adjudicatorId: "adj-c",
      verdict: unanimous[2].annotations[0].verdict,
      ruleIds: structuredClone(unanimous[2].annotations[0].ruleIds),
      evidence: structuredClone(unanimous[2].annotations[0].evidence),
      rationale: unanimous[2].annotations[0].rationale,
    };
    unanimous[2].annotations[1].evidence = unanimous[2].annotations[1].evidence.map(
      (evidence) => ({ text: evidence.text, ruleId: evidence.ruleId }),
    );
    expect(() => prepareHeldOut(cases, unanimous, "fixture-held-out-v1", "2026-07-17T00:00:00Z")).not.toThrow();
    const falselyResolved = structuredClone(unanimous);
    falselyResolved[2].adjudication.status = "resolved";
    expect(() => prepareHeldOut(cases, falselyResolved, "fixture-held-out-v1", "2026-07-17T00:00:00Z")).toThrow(/resolved adjudication requires an annotation disagreement/);
  });

  test("refuses to overwrite any existing freeze output", async () => {
    const directory = await mkdtemp(join(tmpdir(), "quality-freeze-"));
    try {
      const existing = join(directory, "existing.jsonl");
      const fresh = join(directory, "fresh.jsonl");
      await writeFile(existing, "sentinel\n", "utf8");
      await expect(writeNewFiles([
        { path: existing, content: "replacement\n" },
        { path: fresh, content: "new\n" },
      ])).rejects.toThrow(/refusing to overwrite existing freeze output/);
      expect(await readFile(existing, "utf8")).toBe("sentinel\n");
      expect(await Bun.file(fresh).exists()).toBe(false);
      const partial = join(directory, "partial.jsonl");
      await expect(writeNewFiles([
        { path: partial, content: "first\n" },
        { path: partial, content: "second\n" },
      ])).rejects.toThrow();
      expect(await Bun.file(partial).exists()).toBe(false);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("rejects symlinks in held-out paths", async () => {
    const outside = await mkdtemp(join(tmpdir(), "quality-path-guard-"));
    const linkRoot = absolute("dev/quality-calibration");
    await mkdir(linkRoot, { recursive: true });
    const link = await mkdtemp(join(linkRoot, "path-guard-"));
    await rm(link, { recursive: true });
    try {
      await symlink(outside, link);
      expect(() => privatePath(`${link}/labels.jsonl`)).toThrow(/cannot contain symbolic links/);
    } finally {
      await rm(link, { force: true });
      await rm(outside, { recursive: true, force: true });
    }
  });

  test("validates annotation, blinded, freeze, rewrite, and report contracts", async () => {
    const ajv = await schemaValidator();
    const cases = await fixture<CalibrationCase>("held-out-cases.jsonl");
    const annotations = await fixture<CalibrationAnnotation>("held-out-annotations.jsonl");
    const frozen = prepareHeldOut(cases, annotations, "fixture-held-out-v1", "2026-07-17T00:00:00+08:00");
    const unlabeled = structuredClone(cases[0]) as Partial<CalibrationCase>;
    delete unlabeled.expectedVerdict;
    expect(ajv.validate("https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/calibration-case.schema.json", unlabeled)).toBe(false);
    for (const annotation of annotations) expectSchema(ajv, "https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/calibration-annotation.schema.json", annotation);
    for (const item of parseJsonLines(frozen.casesText, "blinded cases")) expectSchema(ajv, "https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/calibration-blind-case.schema.json", item);
    for (const item of parseJsonLines(frozen.labelsText, "labels")) expectSchema(ajv, "https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/calibration-label.schema.json", item);
    expectSchema(ajv, "https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/held-out-freeze.schema.json", frozen.manifest);

    const rewriteCase = {
      schema: "quality-rewrite-case/v1",
      caseId: "rewrite-fixture-a",
      language: "zh-CN",
      producer: "runtime",
      initialCandidate: "她不知道，门后的人已经举起了刀。",
      minimumContext: "限知第三人称；角色只能听见门轴声。",
      target: { candidateType: "runtime.prose", targetType: "narrative-prose", path: "novels/chapter-01.md", requiredFormat: "markdown" },
      preservation: {
        facts: ["门后有人"],
        pov: "限知第三人称",
        characterLogic: ["角色保持警觉"],
        requiredBeats: ["角色停在门外"],
        forbiddenChanges: ["不得让角色提前看见门后的人"],
      },
      expectedRuleIds: ["zh-f1-pov-leak"],
      provenance: { source: "3aKHP/Neural-Narratology", license: "MIT", redistribution: "public", privacy: "not-applicable" },
    };
    expectSchema(ajv, "https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/rewrite-case.schema.json", rewriteCase);
    const missingContext = structuredClone(rewriteCase) as Partial<typeof rewriteCase>;
    delete missingContext.minimumContext;
    expect(ajv.validate("https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/rewrite-case.schema.json", missingContext)).toBe(false);
    expect(ajv.validate("https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/rewrite-case.schema.json", {
      ...rewriteCase,
      target: { ...rewriteCase.target, path: "novels/../outside.md" },
    })).toBe(false);
    expect(ajv.validate("https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/rewrite-case.schema.json", {
      ...rewriteCase,
      target: { ...rewriteCase.target, path: "novels/..\\..\\outside.md" },
    })).toBe(false);
    const outcome = {
      rounds: [
        { attempt: 1, postImageSha256: "2".repeat(64), detectorOutcome: "advisory", judgeOutcome: "findings" },
        { attempt: 2, postImageSha256: "3".repeat(64), detectorOutcome: "clean", judgeOutcome: "pass" },
      ],
      terminalState: "clean",
      preservationReview: { reviewerId: "reviewer-a", verdict: "preserved", severeDamageCategories: [], notes: "All constraints preserved." },
    };
    expectSchema(ajv, "https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/rewrite-case.schema.json", { ...rewriteCase, outcome });
    expect(ajv.validate("https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/rewrite-case.schema.json", {
      ...rewriteCase,
      outcome: { ...outcome, rounds: [outcome.rounds[1]] },
    })).toBe(false);
    expect(ajv.validate("https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/rewrite-case.schema.json", {
      ...rewriteCase,
      outcome: { ...outcome, rounds: [outcome.rounds[0], { ...outcome.rounds[1], attempt: 1 }] },
    })).toBe(false);

    const report = {
      schema: "quality-judge-benchmark-report/v1",
      benchmarkVersion: "1",
      runId: "fixture-run",
      createdAt: "2026-07-17T00:00:00Z",
      identity: {
        vesicleCommit: "a".repeat(40),
        harness: { id: "prism-engine-v10", version: "10.0.1-alpha.4", sourceCommit: "b".repeat(40), manifestSha256: "c".repeat(64) },
        rulePack: { version: "0.3.0-alpha.3", sourceHash: "d".repeat(64) },
        artifacts: { rubricSha256: "e".repeat(64), judgeRulesSha256: "f".repeat(64), resultSchemaSha256: "1".repeat(64) },
        corpusSha256: frozen.manifest.corpusSha256,
      },
      policy: {
        repeatsPerCase: 3,
        confidenceInterval: "wilson-95",
        majorSlices: ["rule", "genre", "lengthBucket"],
        minimumSliceN: 20,
        requestCap: 300,
        tokenCap: 1000000,
        goNoGo: { minimumRecall: 0.8, maximumFalseRewriteRate: 0.03, minimumAgreement: 0.9, maximumInvalidRate: 0.02, maximumP95LatencyMs: 15000 },
        earlyStop: { invalidRate: 0.02, timeoutRate: 0.05, falseRewriteRate: 0.05 },
      },
      models: [{
        providerAlias: "fixture",
        protocol: "openai-chat-completions",
        modelId: "fixture-model",
        requestPolicy: { temperature: 0, maxTokens: 2048 },
        sampleCounts: { cases: 4, evaluations: 12, requests: 12, repairs: 0, pass: 2, rewrite: 2 },
        metrics: metrics(),
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        latencyMs: { average: 0, p50: 0, p95: 0 },
        slices: [],
        failureCaseIds: [],
        decision: "inconclusive",
        decisionReasons: ["fixture report"],
      }],
      privacy: { containsRawResponses: false, containsCandidateText: false, modelIdentityIsUserDeclared: true },
    };
    expectSchema(ajv, "https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/benchmark-report.schema.json", report);
    expect(ajv.validate("https://github.com/3aKHP/Neural-Narratology/shared/rule-assets/schemas/benchmark-report.schema.json", {
      ...report,
      privacy: { ...report.privacy, containsRawResponses: true },
    })).toBe(false);
  });
});
