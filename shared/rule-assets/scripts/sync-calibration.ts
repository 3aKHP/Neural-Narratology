import { registeredConfigs, syncTrackedCalibration } from "./lib";

for (const configPath of await registeredConfigs()) {
  await syncTrackedCalibration(configPath);
  console.log(`synced calibration pairs for ${configPath}`);
}
