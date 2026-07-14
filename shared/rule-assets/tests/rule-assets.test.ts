import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import {
  absolute,
  assertSafeOutputPath,
  compileModule,
  detectText,
  loadModuleConfig,
  loadRuleSource,
  normalizeRules,
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
    expect(rules).toHaveLength(23);
    expect(rules.filter((rule) => rule.projections.includes("guidance"))).toHaveLength(21);
    expect(rules.filter((rule) => rule.projections.includes("judge"))).toHaveLength(21);
    expect(rules.filter((rule) => rule.projections.includes("detector"))).toHaveLength(7);
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

  test("build output is deterministic", async () => {
    const first = await compileModule(antiConfigPath);
    const second = await compileModule(antiConfigPath);
    expect(stableJson(Object.fromEntries(first.artifacts))).toBe(stableJson(Object.fromEntries(second.artifacts)));
    expect(first.manifest.ruleCount).toBe(23);
    expect(first.artifacts.has("THIRD_PARTY_NOTICES.md")).toBe(true);
    expect(first.artifacts.has("calibration/detector.jsonl")).toBe(true);
    expect(first.artifacts.has("calibration/host-conformance.jsonl")).toBe(true);
    expect(first.artifacts.has("calibration/judge.jsonl")).toBe(true);
    for (const name of ["detector-rules", "host-conformance-case", "rule-pack"]) {
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
