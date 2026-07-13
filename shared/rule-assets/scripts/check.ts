import { readFile } from "node:fs/promises";
import { compileModule, absolute, registeredConfigs } from "./lib";

let failed = false;
for (const configPath of await registeredConfigs()) {
  try {
    const { config, artifacts, manifest } = await compileModule(configPath);
    if (config.tracked_guidance && config.guidance) {
      const generated = artifacts.get(`guidance.${config.guidance.language}.md`);
      const tracked = await readFile(absolute(config.tracked_guidance), "utf8");
      if (generated !== tracked) throw new Error(`tracked guidance is stale; run bun shared/rule-assets/scripts/sync-guidance.ts`);
    }
    console.log(`ok ${config.id}: ${manifest.ruleCount} rules`);
  } catch (error) {
    failed = true;
    console.error((error as Error).message);
  }
}
if (failed) process.exit(1);
