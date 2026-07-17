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
    expect(config.required_capabilities).toContain("quality-judge/anti-ai-flavor@1");
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
        expectedMetrics?: Array<{ ruleId: string; signal: string; value: number; threshold: number; tolerance: number }>;
      };
      const findings = detectText(item.text, rules, { protectedRanges: item.protectedRanges });
      const actual = [...new Set(findings.map((finding) => finding.ruleId))].sort();
      expect(actual, item.name).toEqual([...item.expectedRuleIds].sort());
      for (const expected of item.expectedMetrics ?? []) {
        const metric = findings.find((finding) => finding.ruleId === expected.ruleId)?.metric;
        expect(metric?.signal, item.name).toBe(expected.signal);
        expect(metric?.threshold, item.name).toBe(expected.threshold);
        expect(Math.abs((metric?.value ?? Number.POSITIVE_INFINITY) - expected.value), item.name).toBeLessThanOrEqual(expected.tolerance);
      }
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

  test("excludes every declared dialogue and system-broadcast quote pair from metrics", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const quoted = [
      "「仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛」",
      "『仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛』",
      "【仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛】",
      "“仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛”",
      "‘仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛’",
      "\"仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛\"",
      "'仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛'",
    ].join("\n");
    const ids = detectText(quoted, normalizeRules(source, config)).map((finding) => finding.ruleId);
    expect(ids).not.toContain("zh-f3-cliche-density");
  });

  test("uses the fixed upstream visible-character denominator for document metrics", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const text = `${"仿佛".repeat(8)}${"，".repeat(100)}`;
    const finding = detectText(text, normalizeRules(source, config)).find(
      (item) => item.ruleId === "zh-f3-cliche-density",
    );
    expect(finding).toBeDefined();
    expect(finding!.metric?.value).toBe(500);
  });

  test("does not let an unclosed quote suppress the remaining document metrics", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const text = `「未闭合的台词\n${"仿佛".repeat(8)}`;
    const ids = detectText(text, normalizeRules(source, config)).map((finding) => finding.ruleId);
    expect(ids).toContain("zh-f3-cliche-density");
  });

  test("excludes YAML frontmatter and Markdown structural lines from document metrics", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const text = [
      "---",
      "title: 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛",
      "---",
      "# 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛",
      "- 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛",
      "1. 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛 仿佛",
      "正文只有一扇被雨淋湿的门。",
    ].join("\n");
    const ids = detectText(text, normalizeRules(source, config)).map((finding) => finding.ruleId);
    expect(ids).not.toContain("zh-f3-cliche-density");
  });

  test("keeps structural lines visible to literal and regex rules", async () => {
    const config = await loadModuleConfig(antiConfigPath);
    const { source } = await loadRuleSource(config);
    const ids = detectText("# 空气中弥漫着雨味。", normalizeRules(source, config)).map((finding) => finding.ruleId);
    expect(ids).toContain("zh-f0-air-thick-with");
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
    const detectorArtifacts = [...result.artifacts].filter(([path]) => /^detector-rules\..+\.json$/u.test(path));
    const judgeArtifacts = [...result.artifacts].filter(([path]) => /^judge-rules\..+\.json$/u.test(path));
    expect(detectorArtifacts.map(([path]) => path).sort()).toEqual(["detector-rules.en-US.json", "detector-rules.zh-CN.json"]);
    expect(judgeArtifacts.map(([path]) => path).sort()).toEqual(["judge-rules.zh-CN.json"]);
    for (const [path, content] of detectorArtifacts) validate("detector-rules", JSON.parse(content), path);
    for (const [path, content] of judgeArtifacts) validate("judge-rules", JSON.parse(content), path);
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
    const invalidRewrite = JSON.parse((await readFile(absolute(config.corpora!["guidance-pairs"]), "utf8")).split("\n")[0]);
    invalidRewrite.expectedVerdict = "rewrite";
    invalidRewrite.expectedRuleIds = [];
    const calibrationSchema = JSON.parse(result.artifacts.get("schemas/calibration-case.schema.json")!);
    expect(ajv.validate(calibrationSchema.$id, invalidRewrite)).toBe(false);
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
    validate("judge-result", {
      schema: "quality-judge-result/v1",
      verdict: "rewrite",
      confidence: 0.8,
      findings: [{
        ruleId: "zh-f1-pov-leak",
        evidence: "🙂".repeat(240),
        confidence: 0.8,
        explanation: "Code-point boundary fixture.",
        rewriteInstruction: "Keep the bounded exact substring contract.",
      }],
    }, "240-code-point evidence");
    const judgeResultSchema = JSON.parse(result.artifacts.get("schemas/judge-result.schema.json")!);
    expect(ajv.validate(judgeResultSchema.$id, {
      schema: "quality-judge-result/v1",
      verdict: "rewrite",
      confidence: 0.8,
      findings: [{
        ruleId: "zh-f1-pov-leak",
        evidence: "🙂".repeat(241),
        confidence: 0.8,
        explanation: "Code-point overflow fixture.",
        rewriteInstruction: "Reject the oversized evidence.",
      }],
    })).toBe(false);
  });

  test("build output is deterministic", async () => {
    const first = await compileModule(antiConfigPath);
    const second = await compileModule(antiConfigPath);
    expect(stableJson(Object.fromEntries(first.artifacts))).toBe(stableJson(Object.fromEntries(second.artifacts)));
    expect(first.manifest.ruleCount).toBe(29);
    expect(first.artifacts.has("THIRD_PARTY_NOTICES.md")).toBe(true);
    const notices = first.artifacts.get("THIRD_PARTY_NOTICES.md")!;
    expect(notices).toContain("Copyright (c) 2025-2026 oh-story-claudecode");
    expect(notices).toContain("Copyright (c) 2026");
    expect(notices.match(/Permission is hereby granted, free of charge/g)).toHaveLength(2);
    expect(notices.match(/THE SOFTWARE IS PROVIDED "AS IS"/g)).toHaveLength(2);
    expect(first.artifacts.has("calibration/detector.jsonl")).toBe(true);
    expect(first.artifacts.has("calibration/host-conformance.jsonl")).toBe(true);
    expect(first.artifacts.has("calibration/judge.jsonl")).toBe(true);
    expect(first.artifacts.has("calibration/guidance-pairs.jsonl")).toBe(true);
    expect(first.artifacts.has("judge-rules.zh-CN.json")).toBe(true);
    expect(first.artifacts.has("data/cn-antislop-candidates.json")).toBe(true);
    for (const name of [
      "benchmark-report",
      "calibration-annotation",
      "calibration-blind-case",
      "calibration-case",
      "calibration-label",
      "candidate-evaluation",
      "detector-rules",
      "held-out-freeze",
      "host-conformance-case",
      "judge-result",
      "judge-rules",
      "rewrite-case",
      "rule-pack",
    ]) {
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
