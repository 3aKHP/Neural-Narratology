import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import {
  absolute,
  assertSafeOutputPath,
  compileModule,
  detectText,
  loadModuleConfig,
  loadRuleSource,
  normalizeRules,
  renderGuidanceCalibration,
  renderGuidance,
  repoRoot,
  stableJson,
  validateModule,
} from "../scripts/lib";

const antiConfigPath = "shared/anti-ai-flavor/module.config.json";

describe("anti-ai-flavor rule pack", () => {
  test("validates and exposes the expected projections", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    expect(validateModule(source, config)).toEqual([]);
    const rules = normalizeRules(source, config);
    expect(rules).toHaveLength(29);
    expect(rules.filter((rule) => rule.projections.includes("guidance"))).toHaveLength(21);
    expect(rules.filter((rule) => rule.projections.includes("judge"))).toHaveLength(21);
    expect(rules.filter((rule) => rule.projections.includes("detector"))).toHaveLength(13);
    expect(config.required_capabilities).toContain("quality-detector/document-metrics@1");
    expect(config.required_capabilities).not.toContain("quality-judge/anti-ai-flavor@1");
  });

  test("matches the golden detector corpus", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const rules = normalizeRules(source, config);
    const corpus = await readFile(absolute(config.corpora!.detector), "utf8");
    for (const line of corpus.trim().split("\n")) {
      const item = JSON.parse(line) as { name: string; text: string; expectedRuleIds: string[] };
      const actual = [...new Set(detectText(item.text, rules).map((finding) => finding.ruleId))].sort();
      expect(actual, item.name).toEqual([...item.expectedRuleIds].sort());
    }
  });

  test("matches the cross-host conformance corpus", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const rules = normalizeRules(source, config);
    const corpus = await readFile(absolute(config.corpora!["host-conformance"]), "utf8");
    for (const line of corpus.trim().split("\n")) {
      const item = JSON.parse(line) as {
        name: string;
        text: string;
        protectedRanges?: Array<{ start: number; end: number }>;
        expectedRuleIds: string[];
      };
      const actual = [...new Set(detectText(item.text, rules, { protectedRanges: item.protectedRanges }).map((finding) => finding.ruleId))].sort();
      expect(actual, item.name).toEqual([...item.expectedRuleIds].sort());
    }
  });

  test("judge corpus references valid semantic rules", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const judgeIds = new Set(
      normalizeRules(source, config)
        .filter((rule) => rule.projections.includes("judge"))
        .map((rule) => rule.id),
    );
    const corpus = await readFile(absolute(config.corpora!.judge), "utf8");
    for (const line of corpus.trim().split("\n")) {
      const item = JSON.parse(line) as { name: string; expectedVerdict: string; expectedRuleIds: string[] };
      expect(["pass", "rewrite"], item.name).toContain(item.expectedVerdict);
      for (const id of item.expectedRuleIds) expect(judgeIds.has(id), `${item.name}: ${id}`).toBe(true);
      if (item.expectedVerdict === "pass") expect(item.expectedRuleIds, item.name).toHaveLength(0);
    }
  });

  test("keeps UTF-16 evidence offsets after protected regions", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const text = "🙂开场。\n```text\n空气中弥漫着\n```\n空气中弥漫着雨味。";
    const findings = detectText(text, normalizeRules(source, config)).filter(
      (finding) => finding.ruleId === "zh-f0-air-thick-with",
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].start).toBe(text.lastIndexOf("空气中弥漫着"));
    expect(findings[0].evidence).toBe("空气中弥漫着");
  });

  test("keeps UTF-16 offsets for document metrics after astral characters", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const text = "🙂开场。路灯像眼珠。玻璃好像蒙了油。人群仿佛湿纸。声音像是报站。红字如同钉子。哭声像漏风。胸牌像旧屏幕。";
    const finding = detectText(text, normalizeRules(source, config)).find(
      (item) => item.ruleId === "zh-f3-metaphor-density",
    );
    expect(finding).toBeDefined();
    expect(finding!.start).toBe(text.indexOf("像"));
    expect(text.slice(finding!.start, finding!.end)).toBe(finding!.evidence);
  });

  test("accepts host-provided protected ranges for inline examples", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const rules = normalizeRules(source, config);
    const text = "审计示例『空气中弥漫着』不属于候选正文。";
    const start = text.indexOf("空气中弥漫着");
    const findings = detectText(text, rules, { protectedRanges: [{ start, end: start + "空气中弥漫着".length }] });
    expect(findings).toEqual([]);
  });

  test("tracked guidance is a generated projection with stable rule ids", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const rendered = await renderGuidance(source, config);
    const tracked = await readFile(absolute(config.tracked_guidance!), "utf8");
    expect(rendered).toBe(tracked);
    expect(tracked).toContain("Rule ID: `zh-f1-not-x-but-y`");
  });

  test("tracks all 21 guidance pairs as labeled calibration cases", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const rendered = renderGuidanceCalibration(source, config);
    const tracked = await readFile(absolute(config.tracked_calibration!), "utf8");
    expect(rendered).toBe(tracked);
    const cases = tracked.trim().split("\n").map((line) => JSON.parse(line));
    expect(cases).toHaveLength(42);
    expect(cases.filter((item) => item.expectedVerdict === "rewrite")).toHaveLength(21);
    expect(cases.filter((item) => item.expectedVerdict === "pass")).toHaveLength(21);
  });

  test("validates compiled contracts and every published corpus against JSON Schema", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const result = await compileModule(antiConfigPath);
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    for (const name of Object.keys(config.schemas ?? {})) {
      ajv.addSchema(JSON.parse(result.artifacts.get(`schemas/${name}.schema.json`)!));
    }
    const validate = (schemaName: string, value: unknown, label: string): void => {
      const schema = JSON.parse(result.artifacts.get(`schemas/${schemaName}.schema.json`)!);
      const valid = ajv.validate(schema.$id, value);
      expect(valid, `${label}: ${ajv.errorsText(ajv.errors)}`).toBe(true);
    };

    validate("rule-pack", result.manifest, "rule pack manifest");
    validate("detector-rules", JSON.parse(result.artifacts.get("detector-rules.zh-CN.json")!), "detector rules");
    validate("judge-rules", JSON.parse(result.artifacts.get("judge-rules.zh-CN.json")!), "judge rules");
    const candidates = JSON.parse(result.artifacts.get("data/cn-antislop-candidates.json")!);
    validate("candidate-evaluation", candidates, "cn-antislop candidate evaluation");
    expect(candidates.promotedRuleIds).toEqual([]);
    expect(candidates.candidates.every((item: { status: string }) => item.status === "evaluating")).toBe(true);
    for (const [name, path] of Object.entries(config.corpora ?? {})) {
      const schemaName = name === "host-conformance" ? "host-conformance-case" : "calibration-case";
      for (const [index, line] of (await readFile(absolute(path), "utf8")).trim().split("\n").entries()) {
        validate(schemaName, JSON.parse(line), `${name}:${index + 1}`);
      }
    }
    validate("judge-result", { schema: "quality-judge-result/v1", verdict: "pass", confidence: 0.91, findings: [] }, "pass result");
    validate("judge-result", {
      schema: "quality-judge-result/v1",
      verdict: "rewrite",
      confidence: 0.88,
      findings: [{
        ruleId: "zh-f1-pov-leak",
        evidence: "她不知道",
        confidence: 0.88,
        explanation: "叙述超出当前角色认知。",
        rewriteInstruction: "只保留角色可感知的现场证据。",
      }],
    }, "rewrite result");
  });

  test("build output is deterministic", async () => {
    const first = await compileModule(antiConfigPath);
    const second = await compileModule(antiConfigPath);
    expect(stableJson(Object.fromEntries(first.artifacts))).toBe(stableJson(Object.fromEntries(second.artifacts)));
    expect(first.manifest.ruleCount).toBe(29);
    expect(first.artifacts.has("THIRD_PARTY_NOTICES.md")).toBe(true);
    expect(first.artifacts.has("calibration/detector.jsonl")).toBe(true);
    expect(first.artifacts.has("calibration/host-conformance.jsonl")).toBe(true);
    expect(first.artifacts.has("calibration/judge.jsonl")).toBe(true);
    expect(first.artifacts.has("calibration/guidance-pairs.jsonl")).toBe(true);
    expect(first.artifacts.has("judge-rules.zh-CN.json")).toBe(true);
    expect(first.artifacts.has("data/cn-antislop-candidates.json")).toBe(true);
    for (const name of ["calibration-case", "candidate-evaluation", "detector-rules", "host-conformance-case", "judge-result", "judge-rules", "rule-pack"]) {
      const path = `schemas/${name}.schema.json`;
      expect(first.artifacts.has(path), path).toBe(true);
      expect((first.manifest.artifacts as Record<string, string>)[path], path).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  test("rejects invalid schema artifact names and JSON", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    expect(validateModule(source, { ...config, schemas: { "Invalid Name": "schema.json" } })).toContain(
      "schema artifact Invalid Name must be kebab-case",
    );
    await expect(compileModule("shared/rule-assets/tests/fixtures/invalid-schema.config.json")).rejects.toThrow(
      /invalid JSON Schema .*invalid-schema\.json/,
    );
  });
});

describe("generic replacement projection", () => {
  test("compiles a regex replacement module without anti-ai-specific fields", async () => {
    const configPath = "shared/rule-assets/tests/fixtures/replacement.config.json";
    const result = await compileModule(configPath);
    expect(result.artifacts.has("replacement-rules.zh-CN.json")).toBe(true);
    const replacement = JSON.parse(result.artifacts.get("replacement-rules.zh-CN.json")!);
    expect(replacement.rules[0].replacement).toEqual({ kind: "literal", value: " " });
  });

  test("rejects destructive output roots", () => {
    expect(() => assertSafeOutputPath(repoRoot)).toThrow();
    expect(() => assertSafeOutputPath("/tmp/rule-assets-safe-output")).not.toThrow();
  });
});
