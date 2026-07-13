import { loadDriverContract, loadHostAdapter, validateDriverPair, validateSourceReferences } from "./lib";

const contractPath = "03_Modulation/Prism-Engine-V10.x/driver/contract.json";
const adapterPath = "03_Modulation/Prism-Engine-V10.x/adapters/vesicle/adapter.json";
const contract = await loadDriverContract(contractPath);
const adapter = await loadHostAdapter(adapterPath);
const errors = [
  ...(await validateDriverPair(contract, adapter)),
  ...(await validateSourceReferences(contract)),
];

if (errors.length > 0) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`ok ${contract.id}: ${Object.keys(contract.engines).length} engines, ${Object.keys(contract.agents).length} agents, adapter ${adapter.id}`);
