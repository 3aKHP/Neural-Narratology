import { registeredConfigs, syncTrackedGuidance } from "./lib";

for (const configPath of await registeredConfigs()) {
  await syncTrackedGuidance(configPath);
  console.log(`synced guidance for ${configPath}`);
}
