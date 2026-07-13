import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import {
  loadDriverContract,
  loadHostAdapter,
  renderAgentBinding,
  renderAgentProfile,
  renderEngineBinding,
  renderEngineProfile,
  resolveResourceReferences,
  validateDriverPair,
  validateSourceReferences,
  type DriverContract,
  type HostAdapter,
} from "../../prism-driver/scripts/lib";
import {
  absolute,
  assertSafeOutputPath,
  compileModule,
  compilerHash,
  gitIdentity,
  parseArgs,
  registeredConfigs,
  repoRoot,
  sha256,
  stableJson,
  writeArtifacts,
} from "./lib";

type HarnessConfig = {
  schema: string;
  id: string;
  version: string;
  driver_contract: string;
  host_adapter: string;
  quality_prompt_assets: Record<string, { guidance?: string; judge?: string }>;
};

async function listFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(path);
    }
  }
  await visit(root);
  return files.sort();
}

async function writeText(outDir: string, target: string, text: string): Promise<void> {
  const path = resolve(outDir, target);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text, "utf8");
}

function qualityPromptPath(
  quality: { module: string | null; promptProjection: "none" | "guidance" | "judge" },
  config: HarnessConfig,
): string | undefined {
  if (!quality.module || quality.promptProjection === "none") return undefined;
  const path = config.quality_prompt_assets[quality.module]?.[quality.promptProjection];
  if (!path) throw new Error(`${quality.module}: missing ${quality.promptProjection} prompt asset binding`);
  return path;
}

function profileSections(
  promptPath: string,
  quality: { module: string | null; promptProjection: "none" | "guidance" | "judge" },
  config: HarnessConfig,
): string[] {
  const qualityPath = qualityPromptPath(quality, config);
  return qualityPath ? [qualityPath, promptPath] : [promptPath];
}

async function agentProfileSections(
  outDir: string,
  promptPath: string,
  quality: { module: string | null; promptProjection: "none" | "guidance" | "judge" },
  config: HarnessConfig,
): Promise<string[]> {
  const qualityPath = qualityPromptPath(quality, config);
  if (!qualityPath || !quality.module) return [promptPath];
  const extension = quality.promptProjection === "guidance" ? "guidance.md" : "judge-rubric.md";
  const agentQualityPath = `assets/prompts/agents/quality/${quality.module}.${extension}`;
  if (!(await Bun.file(resolve(outDir, agentQualityPath)).exists())) {
    const source = await readFile(resolve(outDir, qualityPath), "utf8");
    await writeText(outDir, agentQualityPath, source);
  }
  return [agentQualityPath, promptPath];
}

async function compileResources(outDir: string, contract: DriverContract, adapter: HostAdapter): Promise<void> {
  for (const [id, resource] of Object.entries(contract.resources)) {
    const target = adapter.resourceBindings[id];
    const source = await readFile(absolute(resource.source), "utf8");
    let compiled = resolveResourceReferences(source, adapter);
    if (resource.kind === "engine-prompt") {
      const pair = Object.entries(contract.engines).find(([, engine]) => engine.prompt === id);
      if (!pair) throw new Error(`No engine owns prompt resource ${id}`);
      compiled = `${compiled.trim()}\n\n${renderEngineBinding(pair[0], pair[1], contract, adapter)}`;
    } else if (resource.kind === "agent-prompt") {
      const pair = Object.entries(contract.agents).find(([, agent]) => agent.prompt === id);
      if (!pair) throw new Error(`No agent owns prompt resource ${id}`);
      compiled = `${compiled.trim()}\n\n${renderAgentBinding(pair[0], pair[1], adapter)}`;
    }
    if (/prism:\/\/resource\//.test(compiled)) throw new Error(`${id}: unresolved resource URI after adapter compilation`);
    await writeText(outDir, target, compiled.endsWith("\n") ? compiled : `${compiled}\n`);
  }
}

const args = parseArgs(Bun.argv.slice(2));
const outDir = resolve(repoRoot, typeof args.out === "string" ? args.out : "dev/build/prism-vesicle-harness");
assertSafeOutputPath(outDir);
const configPath = typeof args.config === "string" ? args.config : "03_Modulation/Prism-Engine-V10.x/harness.config.json";
const configText = await readFile(absolute(configPath), "utf8");
const config = JSON.parse(configText) as HarnessConfig;
if (config.schema !== "prism-harness-source/v1") throw new Error(`Unsupported harness schema ${config.schema}`);
if (!/^[a-z][a-z0-9-]*$/.test(config.id)) throw new Error(`Invalid harness id ${config.id}`);
if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(config.version)) throw new Error(`Invalid harness version ${config.version}`);
for (const sourcePath of [config.driver_contract, config.host_adapter]) {
  if (!sourcePath || sourcePath.startsWith("/") || sourcePath.includes("..")) throw new Error(`Unsafe harness source path ${sourcePath}`);
}
for (const [moduleId, projections] of Object.entries(config.quality_prompt_assets)) {
  for (const [projection, path] of Object.entries(projections)) {
    if (!path.startsWith("assets/") || path.includes("..") || path.includes("\\")) {
      throw new Error(`${moduleId}.${projection}: unsafe quality prompt path ${path}`);
    }
  }
}

const contractText = await readFile(absolute(config.driver_contract), "utf8");
const adapterText = await readFile(absolute(config.host_adapter), "utf8");
const contract = await loadDriverContract(config.driver_contract);
const adapter = await loadHostAdapter(config.host_adapter);
const contractErrors = [
  ...(await validateDriverPair(contract, adapter)),
  ...(await validateSourceReferences(contract)),
];
if (contractErrors.length > 0) throw new Error(`Prism Driver contract failed:\n- ${contractErrors.join("\n- ")}`);
if (contract.id !== config.id || contract.version !== config.version) {
  throw new Error(`Harness identity ${config.id}@${config.version} does not match driver ${contract.id}@${contract.version}`);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const ruleModules: Array<Record<string, unknown>> = [];
const requiredCapabilities = new Set<string>(["prism-harness/v1", "prism-driver/v1", ...adapter.capabilities]);
for (const operations of [
  ...Object.values(contract.engines).map((engine) => engine.operations),
  ...Object.values(contract.agents).map((agent) => agent.operations),
]) {
  for (const operation of operations) {
    const binding = adapter.operationBindings[operation];
    if (binding.kind === "runtime-capability" && binding.capability) requiredCapabilities.add(binding.capability);
  }
}
for (const moduleConfigPath of await registeredConfigs()) {
  const result = await compileModule(moduleConfigPath);
  const moduleOut = resolve(outDir, "assets/quality", result.config.id);
  await writeArtifacts(moduleOut, result.artifacts);
  const manifest = result.manifest as { requiredCapabilities?: string[] };
  for (const capability of manifest.requiredCapabilities ?? []) requiredCapabilities.add(capability);
  ruleModules.push({ id: result.config.id, manifest: `assets/quality/${result.config.id}/manifest.json` });
}

await compileResources(outDir, contract, adapter);
await writeText(outDir, "assets/prism-driver/contract.json", stableJson(contract));
await writeText(outDir, "assets/prism-driver/adapter.json", stableJson(adapter));

const promptBindings: Record<string, string[]> = {};
const profileBindings: Record<string, string> = {};
const qualityBindings: Record<string, Record<string, string>> = {};
for (const [engineId, engine] of Object.entries(contract.engines)) {
  const promptPath = adapter.resourceBindings[engine.prompt];
  const sections = profileSections(promptPath, engine.quality, config);
  const profilePath = `assets/engines/${adapter.engineBindings[engineId].profileId}.profile.yaml`;
  await writeText(outDir, profilePath, renderEngineProfile(engineId, engine, contract, adapter, sections));
  promptBindings[engineId] = [...adapter.engineBindings[engineId].basePrompts, ...sections];
  profileBindings[engineId] = profilePath;
  qualityBindings[engineId] = engine.quality.module ? { [engine.quality.module]: engine.quality.mode } : {};
}

const agentPromptBindings: Record<string, string[]> = {};
const agentProfileBindings: Record<string, string> = {};
const agentQualityBindings: Record<string, Record<string, string>> = {};
for (const [agentId, agent] of Object.entries(contract.agents)) {
  const promptPath = adapter.resourceBindings[agent.prompt];
  const sections = await agentProfileSections(outDir, promptPath, agent.quality, config);
  const profileId = adapter.agentBindings[agentId].profileId;
  const profilePath = `assets/agents/${profileId}.agent.yaml`;
  await writeText(outDir, profilePath, renderAgentProfile(agentId, agent, adapter, sections));
  agentPromptBindings[agentId] = [...adapter.agentBindings[agentId].basePrompts, ...sections];
  agentProfileBindings[agentId] = profilePath;
  agentQualityBindings[agentId] = agent.quality.module ? { [agent.quality.module]: agent.quality.mode } : {};
}

const externalHostAssets = new Set([
  ...Object.values(adapter.engineBindings).flatMap((binding) => binding.basePrompts),
  ...Object.values(adapter.agentBindings).flatMap((binding) => binding.basePrompts),
]);
for (const paths of [...Object.values(promptBindings), ...Object.values(agentPromptBindings)]) {
  for (const path of paths) {
    if (!externalHostAssets.has(path) && !(await Bun.file(resolve(outDir, path)).exists())) throw new Error(`Bound asset does not exist: ${path}`);
  }
}

const identity = await gitIdentity();
const hashes: Record<string, string> = {};
for (const file of await listFiles(outDir)) {
  const path = relative(outDir, file).replaceAll("\\", "/");
  if (path === "manifest.json") continue;
  hashes[path] = sha256(new Uint8Array(await Bun.file(file).arrayBuffer()));
}
const manifest = {
  schema: "prism-harness-pack/v1",
  id: config.id,
  version: config.version,
  sourceRepository: "3aKHP/Neural-Narratology",
  sourceCommit: identity.commit,
  sourceState: identity.state,
  harnessConfigHash: sha256(configText),
  compilerHash: await compilerHash(),
  requiredCapabilities: [...requiredCapabilities].sort(),
  externalHostAssets: [...externalHostAssets].sort(),
  driver: {
    contract: "assets/prism-driver/contract.json",
    contractHash: hashes["assets/prism-driver/contract.json"],
    contractSourceHash: sha256(contractText),
    adapter: "assets/prism-driver/adapter.json",
    adapterHash: hashes["assets/prism-driver/adapter.json"],
    adapterSourceHash: sha256(adapterText),
    adapterId: adapter.id,
    adapterVersion: adapter.version,
    targetHost: adapter.targetHost,
  },
  ruleModules,
  profileBindings,
  agentProfileBindings,
  promptBindings,
  agentPromptBindings,
  qualityBindings,
  agentQualityBindings,
  assets: hashes,
};
await writeFile(resolve(outDir, "manifest.json"), stableJson(manifest), "utf8");
console.log(`built ${config.id} -> ${outDir}`);
