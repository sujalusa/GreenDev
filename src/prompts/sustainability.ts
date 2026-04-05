import { AnalysisResult } from '@/types';

export const FALLBACK_TEXT = `This project's current architecture generates an estimated ${0} CO2 per month through inefficient compute resource usage. The primary contributors are always-on VM instances during idle periods and unoptimized CI/CD pipelines. Migrating to serverless services and adopting green region deployments aligns with major cloud providers' climate pledges and can reduce this project's carbon footprint by up to 83%. The team should prioritize serverless migration and dependency caching as immediate, high-impact actions.`;

export function buildSustainabilityPrompt(result: AnalysisResult): string {
  const provider = result.detectedStack.cloudProvider !== 'Auto-Detect / Unknown' ? result.detectedStack.cloudProvider : 'Cloud Providers';

  return `You are a cloud sustainability expert writing for a university sustainability report.
Write a sustainability-focused summary (3–4 paragraphs) covering:
1. The estimated environmental impact of the current setup
2. What specific changes would reduce carbon footprint and why
3. How these changes align with ${provider}'s sustainability commitments
4. A clear call to action for the team

Frame all estimates as directional heuristics, not precise measurements. Use kg CO2 as the unit.

FORMATTING RULES (strictly follow):
- Do NOT use any markdown formatting: no ##, ###, **, __, *, _, --, ---, or backticks
- Do NOT use horizontal rules or dividers
- Write in plain prose paragraphs only
- Do NOT use bullet lists or numbered lists — write in flowing sentences instead

Findings:
- Repo: ${result.repoUrl}
- Score: ${result.sustainabilityScore}/100 (${result.scoreLabel})
- Current estimated CO2: ${result.before.estimatedMonthlyCO2}/month
- Optimized estimated CO2: ${result.after.estimatedMonthlyCO2}/month
- Issues:
${result.issues.map((i) => `  • ${i.title}${i.estimatedMonthlyCO2 ? ` (~${i.estimatedMonthlyCO2})` : ''}`).join('\n')}`;
}
