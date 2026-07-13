import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  loadDriverContract,
  loadHostAdapter,
  renderEngineBinding,
  renderEngineProfile,
  resolveResourceReferences,
  validateDriverPair,
  validateSourceReferences,
} from "../scripts/lib";

const contractPath = "03_Modulation/Prism-Engine-V10.x/driver/contract.json";
const adapterPath = "03_Modulation/Prism-Engine-V10.x/adapters/vesicle/adapter.json";
let harnessDir = "";

beforeAll(async () => {
  harnessDir = await mkdtemp(join(tmpdir(), "prism-harness-"));
  const result = Bun.spawnSync([
    "bun",
    "shared/rule-assets/scripts/build-harness.ts",
    "--out",
    harnessDir,
  ], { cwd: join(import.meta.dir, "../../..") });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString() || result.stdout.toString());
});

afterAll(async () => {
  if (harnessDir) await rm(harnessDir, { recursive: true, force: true });
});

describe("Prism Driver contract", () => {
  test("publishes schemas for both contract envelopes", async () => {
    const contractSchema = JSON.parse(await readFile(join(import.meta.dir, "../schemas/driver-contract.schema.json"), "utf8"));
    const adapterSchema = JSON.parse(await readFile(join(import.meta.dir, "../schemas/host-adapter.schema.json"), "utf8"));
    const sourceSchema = JSON.parse(await readFile(join(import.meta.dir, "../schemas/harness-source.schema.json"), "utf8"));
    const manifestSchema = JSON.parse(await readFile(join(import.meta.dir, "../schemas/harness-manifest.schema.json"), "utf8"));
    expect(contractSchema.properties.schema.const).toBe("prism-driver-contract/v1");
    expect(adapterSchema.properties.schema.const).toBe("prism-host-adapter/v1");
    expect(sourceSchema.properties.schema.const).toBe("prism-harness-source/v1");
    expect(manifestSchema.properties.schema.const).toBe("prism-harness-pack/v1");
    expect(contractSchema.required).toContain("engines");
    expect(adapterSchema.required).toContain("operationBindings");
    expect(manifestSchema.required).toContain("driver");
  });

  test("validates the V10 contract and Vesicle adapter as one pair", async () => {
    const contract = await loadDriverContract(contractPath);
    const adapter = await loadHostAdapter(adapterPath);
    expect(await validateDriverPair(contract, adapter)).toEqual([]);
    expect(await validateSourceReferences(contract)).toEqual([]);
    expect(Object.keys(contract.engines)).toEqual(["etl", "runtime", "evaluate", "weaver", "weaver-orch", "dyad"]);
    expect(Object.keys(contract.agents)).toEqual(["scene-writer", "continuity-editor", "chapter-reviewer"]);
  });

  test("keeps host tool names out of canonical prompts", async () => {
    const contract = await loadDriverContract(contractPath);
    for (const resource of Object.values(contract.resources).filter((item) => item.kind.endsWith("prompt"))) {
      const text = await readFile(join(import.meta.dir, "../../..", resource.source), "utf8");
      for (const token of ["request_confirmation", "ask_user_question", "request_engine_switch", "spawn_agent", "shell_exec"]) {
        expect(text, `${resource.source}: ${token}`).not.toContain(token);
      }
    }
  });

  test("defines runtime confirmation as a turn close followed by authored input", async () => {
    const contract = await loadDriverContract(contractPath);
    const interaction = contract.engines.runtime.interactions.find((item) => item.id === "runtime.turn")!;
    expect(interaction.operation).toBe("interaction.confirm");
    expect(interaction.nextInput).toBe("authored-user-message");
    expect(interaction.onAccept).toContain("close the current invocation");
  });

  test("compiles exact Vesicle interaction bindings outside the canonical prompt", async () => {
    const contract = await loadDriverContract(contractPath);
    const adapter = await loadHostAdapter(adapterPath);
    const runtimeSource = await readFile(join(import.meta.dir, "../../..", contract.resources[contract.engines.runtime.prompt].source), "utf8");
    const runtime = `${resolveResourceReferences(runtimeSource, adapter)}\n${renderEngineBinding("runtime", contract.engines.runtime, contract, adapter)}`;
    expect(runtime).toContain("request_confirmation");
    expect(runtime).toContain('"runtime-turn"');

    const etlSource = await readFile(join(import.meta.dir, "../../..", contract.resources[contract.engines.etl.prompt].source), "utf8");
    const etl = `${resolveResourceReferences(etlSource, adapter)}\n${renderEngineBinding("etl", contract.engines.etl, contract, adapter)}`;
    expect(etl).toContain("request_confirmation");
    expect(etl).toContain('"blueprint-confirmation"');
    expect(etl).toContain('"phase-confirmation"');
    expect(etl).toContain("ask_user_question");
  });

  test("derives a current Vesicle-compatible engine profile", async () => {
    const contract = await loadDriverContract(contractPath);
    const adapter = await loadHostAdapter(adapterPath);
    const profile = renderEngineProfile(
      "runtime",
      contract.engines.runtime,
      contract,
      adapter,
      ["assets/quality/anti-ai-flavor/guidance.zh-CN.md", "assets/prompts/engines/runtime.md"],
    );
    expect(profile).toContain("id: runtime");
    expect(profile).toContain("  - runtime-turn");
    expect(profile).toContain("  - append_file");
    expect(profile).not.toContain("shell_exec");
  });
});

describe("V10 protocol invariants", () => {
  test("preserves the effective L4-B default", async () => {
    const scenario = await readFile(join(import.meta.dir, "../../../03_Modulation/Prism-Engine-V10.x/specs/schema_scenario.md"), "utf8");
    expect(scenario).toContain("Default protocol: weight worship");
    expect(scenario).toContain("boots/feet are the medium of connection");
    expect(scenario).toContain("Optional sublevel");
    expect(scenario).toContain("Locked by default");
  });

  test("keeps long-form mutable state out of YAML", async () => {
    for (const file of ["tpl_outline.md", "tpl_story_bible.md"]) {
      const text = await readFile(join(import.meta.dir, `../../../03_Modulation/Prism-Engine-V10.x/templates/${file}`), "utf8");
      expect(text.startsWith("---")).toBe(false);
      expect(text).not.toMatch(/^---$/m);
    }
  });

  test("uses a neutral DLC output title", async () => {
    const schema = await readFile(join(import.meta.dir, "../../../03_Modulation/Prism-Engine-V10.x/specs/schema_dlc.md"), "utf8");
    const outputExample = schema.match(/```markdown\n([\s\S]*?)\n```/)?.[1] ?? "";
    expect(outputExample).toContain("# Intensity Expansion Dossier:");
    expect(outputExample).not.toMatch(/\bL(?:[1-5]|3-A|3-B|4-A|4-B)\b/);
  });

  test("keeps L-System labels out of every output template", async () => {
    for (const file of [
      "tpl_module_a.md",
      "tpl_module_b.md",
      "tpl_outline.md",
      "tpl_persona_prompt_compatible.md",
      "tpl_persona_prompt_immersive.md",
      "tpl_story_bible.md",
    ]) {
      const text = await readFile(join(import.meta.dir, `../../../03_Modulation/Prism-Engine-V10.x/templates/${file}`), "utf8");
      expect(text, file).not.toMatch(/\bL(?:[1-5]|3-A|3-B|4-A|4-B)\b/);
    }
  });
});

describe("compiled Harness Pack", () => {
  test("ships complete engine and agent profiles", async () => {
    for (const engine of ["etl", "runtime", "evaluate", "weaver", "weaver-orch", "dyad"]) {
      expect(await Bun.file(join(harnessDir, `assets/engines/${engine}.profile.yaml`)).exists()).toBe(true);
    }
    for (const agent of ["scene-writer", "continuity-editor", "chapter-reviewer"]) {
      expect(await Bun.file(join(harnessDir, `assets/agents/${agent}.agent.yaml`)).exists()).toBe(true);
    }
  });

  test("resolves every logical resource URI", async () => {
    for (const engine of ["etl", "runtime", "evaluate", "weaver", "weaver-orch", "dyad"]) {
      const text = await readFile(join(harnessDir, `assets/prompts/engines/${engine}.md`), "utf8");
      expect(text).not.toContain("prism://resource/");
    }
  });

  test("records driver identity and binding ownership", async () => {
    const manifest = JSON.parse(await readFile(join(harnessDir, "manifest.json"), "utf8"));
    expect(manifest.driver.adapterId).toBe("vesicle-v1");
    expect(manifest.driver.contractHash).toBe(manifest.assets[manifest.driver.contract]);
    expect(manifest.driver.adapterHash).toBe(manifest.assets[manifest.driver.adapter]);
    expect(manifest.requiredCapabilities).toContain("prism-driver/v1");
    expect(manifest.profileBindings.runtime).toBe("assets/engines/runtime.profile.yaml");
    expect(manifest.agentProfileBindings["chapter-reviewer"]).toBe("assets/agents/chapter-reviewer.agent.yaml");
    expect(manifest.qualityBindings.etl["anti-ai-flavor"]).toBe("off");
    expect(manifest.agentQualityBindings["scene-writer"]["anti-ai-flavor"]).toBe("observe");
  });
});
