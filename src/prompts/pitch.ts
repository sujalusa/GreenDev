import { AnalysisResult } from '@/types';

export const FALLBACK_TEXT = `GreenDev Coach analyzed our repository and found $${0} in monthly cloud waste and measurable CO2 inefficiencies across compute, CI/CD, and containerization. By migrating to serverless architectures, implementing CI caching, and optimizing our Docker images, we can reduce costs by over 80% and cut our carbon footprint by the same margin — this weekend, with zero architectural risk. These are not green compromises; they are best practices.`;

export function buildPitchPrompt(result: AnalysisResult): string {
  const provider = result.detectedStack.cloudProvider !== 'Auto-Detect / Unknown' ? result.detectedStack.cloudProvider : 'Cloud';

  return `You are helping a hackathon team create a compelling pitch narrative.
Write a pitch-ready summary (2–3 paragraphs) that a team could read to judges in 60 seconds.
It should: describe what was found, what was recommended, and what the impact would be.
Make it sound impressive but honest. Highlight the ${provider}-native recommendations.
Keep it energetic and concise.

FORMATTING RULES (strictly follow):
- Do NOT use any markdown formatting: no ##, ###, **, __, *, _, --, ---, or backticks
- Do NOT use horizontal rules or dividers
- Write in plain prose paragraphs only
- Do NOT use bullet lists or numbered lists — write in flowing sentences instead

Findings:
- Repo: ${result.repoUrl}
- Score: ${result.sustainabilityScore}/100 (${result.scoreLabel})
- Monthly cost before: ${result.before.estimatedMonthlyCost} → after: ${result.after.estimatedMonthlyCost}
- CO2 before: ${result.before.estimatedMonthlyCO2} → after: ${result.after.estimatedMonthlyCO2}
- Top 3 recommendations: ${result.recommendations
    .slice(0, 3)
    .map((r) => r.title)
    .join(', ')}`;
}
