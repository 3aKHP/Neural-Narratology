import { resolve } from "node:path";
import { assertSafeOutputPath, compileModule, parseArgs, registeredConfigs, repoRoot, writeArtifacts } from "./lib";

const args = parseArgs(Bun.argv.slice(2));
const outRoot = resolve(repoRoot, typeof args.out === "string" ? args.out : "dev/build/rule-packs");
assertSafeOutputPath(outRoot);
const configs = typeof args.config === "string" ? [args.config] : await registeredConfigs();

for (const configPath of configs) {
  const result = await compileModule(configPath);
  const outDir = resolve(outRoot, result.config.id);
  await writeArtifacts(outDir, result.artifacts);
  console.log(`built ${result.config.id} -> ${outDir}`);
}
