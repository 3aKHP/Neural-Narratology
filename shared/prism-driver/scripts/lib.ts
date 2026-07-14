import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const repoRoot = resolve(import.meta.dir, "../../..");

export type DriverResource = {
  kind: "engine-prompt" | "agent-prompt" | "schema" | "template";
  source: string;
};

export type DriverInteraction = {
  id: string;
  operation: "interaction.confirm" | "interaction.select";
  purpose: string;
  onAccept: string;
  onReject: string;
  nextInput: "gate-resolution" | "authored-user-message" | "selected-option";
  options?: Array<{ id: string; label: string; description: string }>;
};

export type DriverDelegation = {
  id: string;
  agent: string;
  mode: "foreground" | "background";
  purpose: string;
  retryLimit: number;
};

export type DriverQuality = {
  module: string | null;
  mode: "off" | "observe" | "rewrite" | "strict" | "analyze";
  candidate: string | null;
  rewriteOwner: string | null;
  promptProjection: "none" | "guidance" | "judge";
};

export type DriverEngine = {
  displayName: string;
  prompt: string;
  operations: string[];
  resources: string[];
  interactions: DriverInteraction[];
  delegations: DriverDelegation[];
  validators: string[];
  stateRoots: string[];
  quality: DriverQuality;
};

export type DriverAgent = {
  displayName: string;
  description: string;
  prompt: string;
  operations: string[];
  resources: string[];
  contextMode: "fresh" | "summary" | "fork";
  modelPolicy: "inherit";
  defaultMode: "foreground" | "background";
  maxTurns: number;
  quality: DriverQuality;
};

export type DriverContract = {
  schema: string;
  id: string;
  version: string;
  protocolVersion: string;
  resources: Record<string, DriverResource>;
  agents: Record<string, DriverAgent>;
  engines: Record<string, DriverEngine>;
};

export type OperationBinding = {
  kind: "tool-group" | "interaction-tool" | "runtime-capability" | "optional-tool";
  tools?: string[];
  tool?: string;
  capability?: string;
  profileVisible?: boolean;
};

export type HostAdapter = {
  schema: string;
  id: string;
  version: string;
  targetHost: string;
  capabilities: string[];
  operationBindings: Record<string, OperationBinding>;
  resourceBindings: Record<string, string>;
  interactionBindings: Record<string, { checkpoint?: string; header?: string }>;
  engineBindings: Record<string, { profileId: string; basePrompts: string[]; hostContracts?: string[] }>;
  agentBindings: Record<string, { profileId: string; basePrompts: string[]; hostContracts?: string[] }>;
};

type CapabilityRegistry = {
  schema: string;
  operations: Record<string, { kind: string; description: string }>;
};

export async function loadJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(resolve(repoRoot, path), "utf8")) as T;
}

export async function loadDriverContract(path: string): Promise<DriverContract> {
  return loadJson<DriverContract>(path);
}

export async function loadHostAdapter(path: string): Promise<HostAdapter> {
  return loadJson<HostAdapter>(path);
}

export async function loadCapabilityRegistry(): Promise<CapabilityRegistry> {
  return loadJson<CapabilityRegistry>("shared/prism-driver/capability-registry.json");
}

export async function validateDriverPair(contract: DriverContract, adapter: HostAdapter): Promise<string[]> {
  const errors: string[] = [];
  const registry = await loadCapabilityRegistry();
  if (registry.schema !== "prism-driver-capability-registry/v1") errors.push("unsupported capability registry schema");
  if (contract.schema !== "prism-driver-contract/v1") errors.push("contract.schema must be prism-driver-contract/v1");
  if (adapter.schema !== "prism-host-adapter/v1") errors.push("adapter.schema must be prism-host-adapter/v1");
  if (!isSemver(contract.version)) errors.push("contract.version must be SemVer");
  if (!isSemver(adapter.version)) errors.push("adapter.version must be SemVer");

  const allInteractionIds = new Set<string>();
  const allDelegationIds = new Set<string>();
  const usedOperations = new Set<string>();
  const boundTargets = new Map<string, string>();
  const checkOperations = (owner: string, operations: string[]): void => {
    if (new Set(operations).size !== operations.length) errors.push(`${owner}: operations contain duplicates`);
    for (const operation of operations) {
      usedOperations.add(operation);
      if (!registry.operations[operation]) errors.push(`${owner}: unregistered operation ${operation}`);
      if (!adapter.operationBindings[operation]) errors.push(`${owner}: adapter does not bind operation ${operation}`);
    }
  };
  const checkResources = (owner: string, resources: string[]): void => {
    if (new Set(resources).size !== resources.length) errors.push(`${owner}: resources contain duplicates`);
    for (const resource of resources) {
      if (!contract.resources[resource]) errors.push(`${owner}: unknown resource ${resource}`);
      if (!adapter.resourceBindings[resource]) errors.push(`${owner}: adapter does not bind resource ${resource}`);
    }
  };

  for (const [id, resource] of Object.entries(contract.resources)) {
    if (!resource.source || resource.source.startsWith("/") || resource.source.includes("..")) {
      errors.push(`resource ${id}: source must be a safe repository-relative path`);
    }
    if (!(await Bun.file(resolve(repoRoot, resource.source)).exists())) errors.push(`resource ${id}: source file does not exist: ${resource.source}`);
    const target = adapter.resourceBindings[id];
    if (!target) errors.push(`resource ${id}: missing adapter binding`);
    else if (!isSafeAssetPath(target)) errors.push(`resource ${id}: adapter target must stay under assets/: ${target}`);
    else if (boundTargets.has(target)) errors.push(`resources ${boundTargets.get(target)} and ${id} share adapter target ${target}`);
    else boundTargets.set(target, id);
  }

  for (const [id, engine] of Object.entries(contract.engines)) {
    if (!/^[a-z][a-z0-9-]*$/.test(id)) errors.push(`engine id ${id} must be kebab-case`);
    if (contract.resources[engine.prompt]?.kind !== "engine-prompt") errors.push(`engine ${id}: invalid prompt resource ${engine.prompt}`);
    if (!adapter.engineBindings[id]) errors.push(`engine ${id}: missing profile binding`);
    checkOperations(`engine ${id}`, engine.operations);
    checkResources(`engine ${id}`, [engine.prompt, ...engine.resources]);
    for (const interaction of engine.interactions) {
      if (allInteractionIds.has(interaction.id)) errors.push(`duplicate interaction id ${interaction.id}`);
      allInteractionIds.add(interaction.id);
      if (!engine.operations.includes(interaction.operation)) errors.push(`engine ${id}: interaction ${interaction.id} uses undeclared operation ${interaction.operation}`);
      const binding = adapter.interactionBindings[interaction.id];
      if (!binding) errors.push(`interaction ${interaction.id}: missing adapter binding`);
      if (interaction.operation === "interaction.confirm" && !binding?.checkpoint) errors.push(`interaction ${interaction.id}: confirmation requires checkpoint binding`);
      if (interaction.operation === "interaction.select" && !binding?.header) errors.push(`interaction ${interaction.id}: selection requires header binding`);
      if (interaction.operation === "interaction.select" && (!interaction.options || interaction.options.length < 2 || interaction.options.length > 4)) {
        errors.push(`interaction ${interaction.id}: selection requires 2-4 options`);
      }
    }
    const delegatedAgents = new Set<string>();
    for (const delegation of engine.delegations) {
      if (allDelegationIds.has(delegation.id)) errors.push(`duplicate delegation id ${delegation.id}`);
      allDelegationIds.add(delegation.id);
      if (!engine.operations.includes("agent.delegate")) errors.push(`engine ${id}: delegation ${delegation.id} requires agent.delegate`);
      if (!contract.agents[delegation.agent]) errors.push(`delegation ${delegation.id}: unknown agent ${delegation.agent}`);
      if (delegatedAgents.has(delegation.agent)) errors.push(`engine ${id}: agent ${delegation.agent} has multiple delegation bindings`);
      delegatedAgents.add(delegation.agent);
    }
    validateQuality(`engine ${id}`, engine.quality, engine.operations, errors);
  }

  for (const [id, agent] of Object.entries(contract.agents)) {
    if (!/^[a-z][a-z0-9-]*$/.test(id)) errors.push(`agent id ${id} must be kebab-case`);
    if (contract.resources[agent.prompt]?.kind !== "agent-prompt") errors.push(`agent ${id}: invalid prompt resource ${agent.prompt}`);
    if (!adapter.agentBindings[id]) errors.push(`agent ${id}: missing profile binding`);
    checkOperations(`agent ${id}`, agent.operations);
    checkResources(`agent ${id}`, [agent.prompt, ...agent.resources]);
    if (agent.operations.includes("agent.delegate") || agent.operations.some((operation) => operation.startsWith("interaction."))) {
      errors.push(`agent ${id}: child profiles cannot use recursive or interactive operations`);
    }
    validateQuality(`agent ${id}`, agent.quality, agent.operations, errors);
  }

  for (const operation of Object.keys(adapter.operationBindings)) {
    if (!registry.operations[operation]) errors.push(`adapter binds unregistered operation ${operation}`);
  }
  for (const id of Object.keys(adapter.resourceBindings)) {
    if (!contract.resources[id]) errors.push(`adapter binds unknown resource ${id}`);
  }
  for (const id of Object.keys(adapter.interactionBindings)) {
    if (!allInteractionIds.has(id)) errors.push(`adapter binds unknown interaction ${id}`);
  }
  for (const id of Object.keys(adapter.engineBindings)) {
    if (!contract.engines[id]) errors.push(`adapter binds unknown engine ${id}`);
  }
  for (const id of Object.keys(adapter.agentBindings)) {
    if (!contract.agents[id]) errors.push(`adapter binds unknown agent ${id}`);
  }
  const profileIds = new Set<string>();
  for (const [id, binding] of [...Object.entries(adapter.engineBindings), ...Object.entries(adapter.agentBindings)]) {
    if (!/^[a-z][a-z0-9-]*$/.test(binding.profileId)) errors.push(`profile binding ${id}: invalid profileId ${binding.profileId}`);
    if (profileIds.has(binding.profileId)) errors.push(`duplicate profileId ${binding.profileId}`);
    profileIds.add(binding.profileId);
    for (const path of binding.basePrompts) {
      if (!isSafeAssetPath(path)) errors.push(`profile binding ${id}: unsafe base prompt ${path}`);
    }
  }
  for (const operation of usedOperations) {
    const binding = adapter.operationBindings[operation];
    if (!binding) continue;
    if (binding.kind === "tool-group" && (!binding.tools || binding.tools.length === 0)) errors.push(`${operation}: tool-group requires tools`);
    if ((binding.kind === "interaction-tool" || binding.kind === "optional-tool") && !binding.tool) errors.push(`${operation}: ${binding.kind} requires tool`);
    if (binding.kind === "runtime-capability" && !binding.capability) errors.push(`${operation}: runtime-capability requires capability`);
  }
  return errors;
}

function validateQuality(owner: string, quality: DriverQuality, operations: string[], errors: string[]): void {
  if (quality.mode === "off") {
    if (quality.promptProjection !== "none") errors.push(`${owner}: off quality policy must not bind a prompt projection`);
    if (quality.candidate !== null || quality.rewriteOwner !== null) errors.push(`${owner}: off quality policy must not declare candidate or rewriteOwner`);
    return;
  }
  if (!quality.module || !quality.candidate) errors.push(`${owner}: active quality policy requires module and candidate`);
  if (quality.mode === "analyze") {
    if (!operations.includes("quality.analyze")) errors.push(`${owner}: analyze mode requires quality.analyze`);
    if (quality.promptProjection !== "judge") errors.push(`${owner}: analyze mode requires judge prompt projection`);
  } else {
    if (!operations.includes("quality.guard")) errors.push(`${owner}: guarded mode requires quality.guard`);
    if (!quality.rewriteOwner) errors.push(`${owner}: guarded mode requires rewriteOwner`);
    if (quality.promptProjection !== "guidance") errors.push(`${owner}: guarded mode requires guidance prompt projection`);
  }
}

function isSemver(value: string): boolean {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(value);
}

function isSafeAssetPath(path: string): boolean {
  return path.startsWith("assets/") && !path.includes("..") && !path.includes("\\") && !path.startsWith("/");
}

export async function validateSourceReferences(contract: DriverContract): Promise<string[]> {
  const errors: string[] = [];
  const owners: Array<{ owner: string; prompt: string; resources: string[]; interactions: Set<string>; delegations: Set<string> }> = [];
  for (const [id, engine] of Object.entries(contract.engines)) {
    owners.push({
      owner: `engine ${id}`,
      prompt: engine.prompt,
      resources: engine.resources,
      interactions: new Set(engine.interactions.map((item) => item.id)),
      delegations: new Set(engine.delegations.map((item) => item.id)),
    });
  }
  for (const [id, agent] of Object.entries(contract.agents)) {
    owners.push({ owner: `agent ${id}`, prompt: agent.prompt, resources: agent.resources, interactions: new Set(), delegations: new Set() });
  }

  for (const item of owners) {
    const sourcePath = contract.resources[item.prompt]?.source;
    if (!sourcePath) continue;
    const text = await readFile(resolve(repoRoot, sourcePath), "utf8").catch(() => "");
    if (!text) {
      errors.push(`${item.owner}: prompt source missing or empty: ${sourcePath}`);
      continue;
    }
    const resourceRefs = new Set(refs(text, /prism:\/\/resource\/([a-z][a-z0-9.-]*)/g));
    for (const resource of resourceRefs) {
      if (!contract.resources[resource]) errors.push(`${item.owner}: prompt references unknown resource ${resource}`);
      if (!item.resources.includes(resource)) errors.push(`${item.owner}: prompt references undeclared resource ${resource}`);
    }
    for (const resource of item.resources) {
      if (!resourceRefs.has(resource)) errors.push(`${item.owner}: declared resource ${resource} is not referenced by its prompt`);
    }
    const interactionRefs = new Set(refs(text, /hal:\/\/interaction\/([a-z][a-z0-9.-]*)/g));
    for (const interaction of interactionRefs) {
      if (!item.interactions.has(interaction)) errors.push(`${item.owner}: prompt references undeclared interaction ${interaction}`);
    }
    for (const interaction of item.interactions) {
      if (!interactionRefs.has(interaction)) errors.push(`${item.owner}: declared interaction ${interaction} is not referenced by its prompt`);
    }
    const delegationRefs = new Set(refs(text, /hal:\/\/delegation\/([a-z][a-z0-9.-]*)/g));
    for (const delegation of delegationRefs) {
      if (!item.delegations.has(delegation)) errors.push(`${item.owner}: prompt references undeclared delegation ${delegation}`);
    }
    for (const delegation of item.delegations) {
      if (!delegationRefs.has(delegation)) errors.push(`${item.owner}: declared delegation ${delegation} is not referenced by its prompt`);
    }
    const forbidden = ["request_confirmation", "ask_user_question", "request_engine_switch", "spawn_agent", "shell_exec", "assets/specs/", "assets/templates/"];
    for (const token of forbidden) {
      if (text.includes(token)) errors.push(`${item.owner}: canonical prompt leaks host binding ${token}`);
    }
  }
  return errors;
}

function refs(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

export function resolveResourceReferences(text: string, adapter: HostAdapter): string {
  return text.replace(/prism:\/\/resource\/([a-z][a-z0-9.-]*)/g, (_match, id: string) => {
    const target = adapter.resourceBindings[id];
    if (!target) throw new Error(`Unbound resource reference ${id}`);
    return target;
  });
}

export function profileTools(operations: string[], adapter: HostAdapter): string[] {
  const tools: string[] = [];
  for (const operation of operations) {
    const binding = adapter.operationBindings[operation];
    if (binding?.kind === "tool-group" && binding.profileVisible !== false) tools.push(...(binding.tools ?? []));
    if (binding?.kind === "optional-tool" && binding.profileVisible === true && binding.tool) tools.push(binding.tool);
  }
  return [...new Set(tools)];
}

export function renderEngineBinding(engineId: string, engine: DriverEngine, contract: DriverContract, adapter: HostAdapter): string {
  const blocks = [
    `## Host Adapter Binding — ${adapter.targetHost}`,
    "",
    "本节由 Harness 编译器依据 Prism Driver ABI 生成。宿主工具名与路径只在编译产物中出现。",
  ];
  if (engine.resources.length > 0) {
    blocks.push("", "### Resolved Resources", "");
    for (const id of engine.resources) blocks.push(`- HAL resource \`${id}\` resolves to \`${adapter.resourceBindings[id]}\`.`);
  }
  if (engine.interactions.length > 0) {
    blocks.push("", "### Interaction Bindings", "");
    for (const interaction of engine.interactions) blocks.push(...renderInteraction(interaction, adapter));
  }
  if (engine.delegations.length > 0) {
    blocks.push("", "### Delegation Bindings", "");
    for (const delegation of engine.delegations) {
      const operation = adapter.operationBindings["agent.delegate"];
      const profile = adapter.agentBindings[delegation.agent]?.profileId;
      blocks.push(
        `- \`hal://delegation/${delegation.id}\`：调用 \`${operation.tool}\`，\`profile\` 使用 \`${profile}\`，\`mode\` 使用 \`${delegation.mode}\`。${delegation.purpose}失败时最多重试 ${delegation.retryLimit} 次。`,
      );
    }
  }
  const quality = engine.quality;
  if (quality.mode !== "off") {
    const operationId = quality.mode === "analyze" ? "quality.analyze" : "quality.guard";
    const binding = adapter.operationBindings[operationId];
    const surface = binding.kind === "runtime-capability" ? `宿主能力 \`${binding.capability}\`` : `可选工具 \`${binding.tool}\``;
    blocks.push("", "### Quality Binding", "", `- 候选范围：\`${quality.candidate}\`；模式：\`${quality.mode}\`；执行面：${surface}。`);
    if (quality.rewriteOwner) blocks.push(`- 需要重写时仍由 \`${quality.rewriteOwner}\` 负责，Adapter 不代写正文。`);
  }
  return `${blocks.join("\n")}\n`;
}

function renderInteraction(interaction: DriverInteraction, adapter: HostAdapter): string[] {
  const operation = adapter.operationBindings[interaction.operation];
  const host = adapter.interactionBindings[interaction.id];
  if (interaction.operation === "interaction.confirm") {
    return [
      `- \`hal://interaction/${interaction.id}\`：必须调用 \`${operation.tool}\`，\`gate\` 固定为 \`"${host.checkpoint}"\`，\`summary\` 写入当前可决策产物摘要。接受后：${interaction.onAccept}；拒绝后：${interaction.onReject}；下一输入：\`${interaction.nextInput}\`。`,
    ];
  }
  const options = (interaction.options ?? []).map((option) => `${option.label}（${option.description}）`).join("；");
  return [
    `- \`hal://interaction/${interaction.id}\`：必须调用 \`${operation.tool}\`，\`header\` 使用 \`"${host.header}"\`，选项按此顺序提供：${options}。不要自行添加 Skip 或开放选项。`,
  ];
}

export function renderAgentBinding(agentId: string, agent: DriverAgent, adapter: HostAdapter): string {
  const blocks = [
    `## Host Adapter Binding — ${adapter.targetHost}`,
    "",
    "本节由 Harness 编译器依据 Prism Driver ABI 生成。仅使用下列已解析资源与工具能力。",
    "",
    "### Resolved Resources",
    "",
  ];
  for (const id of agent.resources) blocks.push(`- HAL resource \`${id}\` resolves to \`${adapter.resourceBindings[id]}\`.`);
  blocks.push("", "### Tool Bindings", "");
  for (const operationId of agent.operations) {
    const binding = adapter.operationBindings[operationId];
    if (binding.kind === "tool-group") blocks.push(`- \`${operationId}\` → ${(binding.tools ?? []).map((tool) => `\`${tool}\``).join("、")}`);
  }
  if (agent.quality.mode !== "off") {
    const operationId = agent.quality.mode === "analyze" ? "quality.analyze" : "quality.guard";
    const binding = adapter.operationBindings[operationId];
    const surface = binding.kind === "runtime-capability" ? `宿主能力 \`${binding.capability}\`` : `可选工具 \`${binding.tool}\``;
    blocks.push("", "### Quality Binding", "", `- 候选范围：\`${agent.quality.candidate}\`；模式：\`${agent.quality.mode}\`；执行面：${surface}。`);
    if (agent.quality.rewriteOwner) blocks.push(`- 需要重写时由 \`${agent.quality.rewriteOwner}\` 负责。`);
  }
  return `${blocks.join("\n")}\n`;
}

export function renderEngineProfile(engineId: string, engine: DriverEngine, contract: DriverContract, adapter: HostAdapter, promptSections: string[]): string {
  const binding = adapter.engineBindings[engineId];
  const stopGates = engine.interactions
    .filter((item) => item.operation === "interaction.confirm")
    .map((item) => adapter.interactionBindings[item.id].checkpoint!)
    .filter((value, index, values) => values.indexOf(value) === index);
  return renderFlatProfile({
    id: binding.profileId,
    displayName: engine.displayName,
    protocolVersion: contract.protocolVersion,
    systemPrompt: [...binding.basePrompts, ...promptSections],
    defaultTools: [...(binding.hostContracts ?? []), ...profileTools(engine.operations, adapter)],
    validators: engine.validators,
    stopGates,
    stateRoots: engine.stateRoots,
  });
}

export function renderAgentProfile(agentId: string, agent: DriverAgent, adapter: HostAdapter, promptPaths: string[]): string {
  const binding = adapter.agentBindings[agentId];
  return renderFlatProfile({
    id: binding.profileId,
    displayName: agent.displayName,
    description: agent.description,
    systemPrompt: [...binding.basePrompts, ...promptPaths],
    tools: profileTools(agent.operations, adapter),
    contextMode: agent.contextMode,
    modelPolicy: agent.modelPolicy,
    defaultMode: agent.defaultMode,
    maxTurns: String(agent.maxTurns),
  });
}

function renderFlatProfile(fields: Record<string, string | string[]>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      if (value.length === 0) lines.push(`${key}: []`);
      else lines.push(`${key}:`, ...value.map((item) => `  - ${item}`));
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return `${lines.join("\n")}\n`;
}
