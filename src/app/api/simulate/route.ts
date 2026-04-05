import { NextRequest, NextResponse } from 'next/server';
import { invokeClaude } from '@/lib/bedrock';
import { SimulatorConfig, SimulatorResult } from '@/types';

export const maxDuration = 45;

// CO₂ intensity estimates (g CO₂e / compute-hour) by provider + region
const CO2_INTENSITY: Record<string, number> = {
  // AWS
  'us-east-1': 380, 'us-east-2': 380, 'us-west-1': 210, 'us-west-2': 130,
  'eu-west-1': 280, 'eu-central-1': 290, 'eu-north-1': 20,
  'ap-southeast-1': 430, 'ap-northeast-1': 480, 'ap-south-1': 720,
  // GCP
  'us-central1': 200, 'us-east1': 380, 'us-west1': 130,
  'europe-west1': 180, 'europe-west4': 200, 'europe-north1': 15,
  'asia-east1': 560, 'asia-northeast1': 480, 'asia-southeast1': 430,
  // Azure
  'eastus': 380, 'westus': 210, 'westus2': 130,
  'northeurope': 280, 'westeurope': 200, 'swedencentral': 20, 'norwayeast': 15,
  'eastasia': 560, 'southeastasia': 430,
  // Fully managed
  'global-edge': 30,
  'Auto-Detect': 380,
};

// Cost index (relative monthly $ estimate per service)
const COST_INDEX: Record<string, number> = {
  // Serverless / edge
  'Vercel Functions': 0, 'Vercel Edge': 0,
  'Netlify Functions': 0, 'Netlify Edge': 0,
  'Cloudflare Workers': 0, 'Cloudflare Pages': 0,
  'GitHub Pages Static': 0,
  'Lambda': 2, 'Cloud Run': 3, 'Cloud Functions': 2,
  'Azure Functions': 2, 'Railway Service': 8,
  'DO Functions': 2, 'Fly Machine': 5,
  // Container / PaaS
  'ECS': 18, 'Fargate': 15, 'App Runner': 12,
  'Azure Container Apps': 12, 'GKE': 22, 'AKS': 22,
  'App Engine': 10, 'App Platform': 12,
  'Render Web Service': 7, 'Render Static Site': 0,
  'Heroku Dyno': 25,
  // VMs
  'EC2': 22, 'Compute Engine': 20, 'Azure App Service': 18,
  'Droplet': 10, 'VPS / Bare Metal': 15,
  // Catch-all
  'Auto-Detect / Unknown': 15, 'Other': 15,
};

// Bundle size / startup impact by framework
const FRAMEWORK_WEIGHT: Record<string, { bundle: string; startup: string; greenScore: number }> = {
  'Astro': { bundle: '~5 kB', startup: '<100ms', greenScore: 95 },
  'SvelteKit': { bundle: '~10 kB', startup: '<120ms', greenScore: 90 },
  'Solid': { bundle: '~12 kB', startup: '<130ms', greenScore: 88 },
  'Qwik': { bundle: '~13 kB', startup: '<150ms', greenScore: 87 },
  'HTML / Vanilla': { bundle: '~3 kB', startup: '<80ms', greenScore: 98 },
  'Remix': { bundle: '~45 kB', startup: '<200ms', greenScore: 78 },
  'Next.js': { bundle: '~80 kB', startup: '<250ms', greenScore: 72 },
  'Nuxt': { bundle: '~90 kB', startup: '<260ms', greenScore: 70 },
  'Svelte': { bundle: '~15 kB', startup: '<140ms', greenScore: 87 },
  'Gatsby': { bundle: '~120 kB', startup: '<300ms', greenScore: 63 },
  'Vue': { bundle: '~85 kB', startup: '<250ms', greenScore: 70 },
  'React': { bundle: '~130 kB', startup: '<350ms', greenScore: 58 },
  'Angular': { bundle: '~200 kB', startup: '<450ms', greenScore: 50 },
  'Vite': { bundle: '~60 kB', startup: '<200ms', greenScore: 74 },
  'None': { bundle: 'N/A', startup: 'N/A', greenScore: 80 },
  'Auto-Detect': { bundle: 'Unknown', startup: 'Unknown', greenScore: 65 },
};

function estimateGreenScore(config: SimulatorConfig): number {
  let score = 100;
  // Region penalty
  const intensity = CO2_INTENSITY[config.region] ?? 380;
  if (intensity > 400) score -= 30;
  else if (intensity > 200) score -= 15;
  else if (intensity > 50) score -= 5;

  // Serverless bonus
  if (config.isServerless) score += 8;
  else score -= 10;

  // Framework
  const fw = FRAMEWORK_WEIGHT[config.frontendFramework];
  if (fw) score = score * 0.6 + fw.greenScore * 0.4;

  // Caching
  if (config.hasCaching) score += 5;

  // CI frequency penalty
  if (config.cicdTool !== 'None') score -= 3;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function estimateMonthlyCost(config: SimulatorConfig): number {
  return COST_INDEX[config.cloudService] ?? 15;
}

function estimateCO2(config: SimulatorConfig): number {
  const intensity = CO2_INTENSITY[config.region] ?? 380;
  const hours = config.isServerless ? 20 : 720;
  return Math.round((intensity * hours) / 1000 * 10) / 10; // kg
}

export async function POST(req: NextRequest) {
  try {
    const { current, alternative, repoName } = await req.json() as {
      current: SimulatorConfig;
      alternative: SimulatorConfig;
      repoName?: string;
    };

    if (!current || !alternative) {
      return NextResponse.json({ success: false, error: 'Missing current or alternative config' }, { status: 400 });
    }

    // Compute metrics
    const currentScore = estimateGreenScore(current);
    const altScore = estimateGreenScore(alternative);
    const currentCost = estimateMonthlyCost(current);
    const altCost = estimateMonthlyCost(alternative);
    const currentCO2 = estimateCO2(current);
    const altCO2 = estimateCO2(alternative);

    const currentFW = FRAMEWORK_WEIGHT[current.frontendFramework] || FRAMEWORK_WEIGHT['Auto-Detect'];
    const altFW = FRAMEWORK_WEIGHT[alternative.frontendFramework] || FRAMEWORK_WEIGHT['Auto-Detect'];
    const currentIntensity = CO2_INTENSITY[current.region] ?? 380;
    const altIntensity = CO2_INTENSITY[alternative.region] ?? 380;

    const metrics = [
      { label: 'Green Score', current: `${currentScore}/100`, alternative: `${altScore}/100`, unit: '/100', betterWhen: 'higher' as const },
      { label: 'Est. Monthly CO₂', current: `${currentCO2} kg`, alternative: `${altCO2} kg`, unit: 'kg', betterWhen: 'lower' as const },
      { label: 'Est. Monthly Cost', current: `$${currentCost}/mo`, alternative: `$${altCost}/mo`, unit: '$', betterWhen: 'lower' as const },
      { label: 'Grid Intensity', current: `${currentIntensity} g CO₂/kWh`, alternative: `${altIntensity} g CO₂/kWh`, unit: 'g', betterWhen: 'lower' as const },
      { label: 'Compute Model', current: current.isServerless ? 'Serverless' : 'Always-on', alternative: alternative.isServerless ? 'Serverless' : 'Always-on', betterWhen: 'higher' as const },
      { label: 'JS Bundle Size', current: currentFW.bundle, alternative: altFW.bundle, betterWhen: 'lower' as const },
      { label: 'Cold Start', current: currentFW.startup, alternative: altFW.startup, betterWhen: 'lower' as const },
      { label: 'Build Caching', current: current.hasCaching ? 'Yes ✓' : 'No ✗', alternative: alternative.hasCaching ? 'Yes ✓' : 'No ✗', betterWhen: 'higher' as const },
      { label: 'CI/CD Pipeline', current: current.cicdTool, alternative: alternative.cicdTool, betterWhen: 'higher' as const },
    ];

    // AI verdict
    const prompt = `You are a software sustainability expert. Compare two deployment setups for ${repoName || 'a web project'}.

CURRENT SETUP:
- Platform: ${current.cloudProvider} (${current.cloudService})
- Region: ${current.region}
- Framework: ${current.frontendFramework}
- Compute: ${current.isServerless ? 'Serverless' : 'Always-on'}
- Caching: ${current.hasCaching ? 'Yes' : 'No'}
- CI/CD: ${current.cicdTool}
- Green Score: ${currentScore}/100
- Monthly CO₂: ${currentCO2} kg, Cost: $${currentCost}

ALTERNATIVE SETUP:
- Platform: ${alternative.cloudProvider} (${alternative.cloudService})
- Region: ${alternative.region}
- Framework: ${alternative.frontendFramework}
- Compute: ${alternative.isServerless ? 'Serverless' : 'Always-on'}
- Caching: ${alternative.hasCaching ? 'Yes' : 'No'}
- CI/CD: ${alternative.cicdTool}
- Green Score: ${altScore}/100
- Monthly CO₂: ${altCO2} kg, Cost: $${altCost}

Write a 3-sentence technical verdict comparing these two setups. Be specific about:
1. The sustainability impact (CO₂ difference)
2. The performance trade-offs (bundle size, startup)
3. The cost/effort of migration

Then on a NEW LINE write: "RECOMMENDATION: " followed by a single actionable sentence.
Keep the total response under 120 words. Be direct and developer-friendly.`;

    let verdict = '';
    let recommendation = '';

    try {
      const aiText = await invokeClaude(prompt);
      const parts = aiText.split(/RECOMMENDATION:/i);
      verdict = parts[0].trim();
      recommendation = parts[1]?.trim() || '';
    } catch {
      verdict = `The alternative setup scores ${altScore}/100 vs the current ${currentScore}/100. ${altCO2 < currentCO2 ? `Switching would save ${(currentCO2 - altCO2).toFixed(1)} kg CO₂/month.` : 'The current setup is already fairly efficient.'}`;
      recommendation = altScore > currentScore
        ? `Consider migrating to ${alternative.cloudProvider} with ${alternative.frontendFramework} for a greener footprint.`
        : `Your current stack is competitive — focus on adding caching and path filters to CI first.`;
    }

    const result: SimulatorResult = {
      currentLabel: `${current.cloudProvider} · ${current.frontendFramework}`,
      alternativeLabel: `${alternative.cloudProvider} · ${alternative.frontendFramework}`,
      metrics,
      verdict,
      recommendation,
      greenScoreDelta: altScore - currentScore,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[/api/simulate]', err);
    return NextResponse.json({ success: false, error: 'Simulation failed' }, { status: 500 });
  }
}
