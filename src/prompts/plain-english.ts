import { AnalysisResult } from '@/types';

export const FALLBACK_TEXT = `Your project scored {score}/100. We identified {count} sustainability issues. The most impactful changes you can make right now are to review your compute architecture, optimize your CI/CD pipeline, and update your Docker base images. Each of these changes, taken individually, can meaningfully reduce both your cloud costs and your carbon footprint.`;

export function buildPlainEnglishPrompt(result: AnalysisResult): string {
  return `You are GreenDev Coach, a sustainability assistant for student developers.
Given these findings from a GitHub repo analysis, write a plain-English summary (3–4 paragraphs) that a student developer with no cloud expertise can understand.
Do not use jargon without explaining it. Be encouraging but honest.
Focus on the 2–3 most impactful changes they can make right now.
End with a one-sentence motivational close.

FORMATTING RULES (strictly follow):
- Do NOT use any markdown formatting: no ##, ###, **, __, *, _, --, ---, or backticks
- Do NOT use horizontal rules or dividers
- Write in plain prose paragraphs only
- Do NOT use bullet lists or numbered lists — write in flowing sentences instead

CRITICAL INSTRUCTION: Analyze the user's hosting choices against the repository's primary language and topics. If their choices (e.g. Always-on EC2, application hosting) make NO SENSE for the repository (for example, if this is a Machine Learning model training repository, a Jupyter Notebook, or a simple script that is NOT a web app), PLEASE TELL THEM IMMEDIATELY that their hosting options might be wrong or irrelevant for this specific repository, while still providing the rest of the analysis.

Findings:
- Repo: ${result.repoUrl}
- Language: ${result.detectedStack.repoLanguage || 'Unknown'} (Topics: ${result.detectedStack.repoTopics?.join(', ') || 'None'})
- Sustainability Score: ${result.sustainabilityScore}/100 (${result.scoreLabel})
- Top Issues:
${result.issues.slice(0, 3).map((i) => `  • [${i.impact}] ${i.title}`).join('\n')}
- Top Recommendations:
${result.recommendations.slice(0, 3).map((r) => `  • ${r.title} (saves ${r.estimatedCostSaved || 'N/A'})`).join('\n')}
- Estimated savings if all changes applied: ${result.after.estimatedMonthlyCost}/month, ${result.after.estimatedMonthlyCO2} CO2`;
}
