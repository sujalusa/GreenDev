require('dotenv').config({ path: '.env.local' });
const { BedrockClient, ListFoundationModelsCommand } = require('@aws-sdk/client-bedrock');

const client = new BedrockClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function listModels() {
  try {
    const command = new ListFoundationModelsCommand({});
    const response = await client.send(command);
    const anthropicModels = response.modelSummaries.filter(m => m.providerName === 'Anthropic');
    console.log("AVAILABLE ANTHROPIC MODELS:");
    anthropicModels.forEach(m => {
      console.log(`- ${m.modelId} (Active: ${m.modelLifecycle.status})`);
    });
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listModels();
