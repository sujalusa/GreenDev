import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';

const client = new BedrockClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AKIA5OJDX2FM6Z4PZAFT',
    secretAccessKey: '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'
  }
});

async function run() {
  try {
    const cmd = new ListFoundationModelsCommand({});
    const res = await client.send(cmd);
    const models = res.modelSummaries.filter(m => m.providerName === 'Anthropic');
    console.log("ANTHROPIC MODELS:");
    models.forEach(m => console.log(`${m.modelId} : ${m.modelLifecycle.status}`));
  } catch (e) {
    console.error(e);
  }
}
run();
