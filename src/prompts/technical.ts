import { AnalysisResult } from '@/types';

export const FALLBACK_TEXT = `Technical analysis identified the following key inefficiencies: always-on compute with high idle ratio, unoptimized CI/CD pipeline without dependency caching, and oversized container images. Recommended actions: migrate to serverless compute (e.g. AWS Lambda, Google Cloud Run, Azure Functions), implement GitHub Actions caching, and adopt Alpine-based Docker base images. These changes are estimated to reduce monthly costs by 70–80% and cut carbon footprint proportionally.`;

export function buildTechnicalPrompt(result: AnalysisResult): string {
  const provider = result.detectedStack.cloudProvider !== 'Auto-Detect / Unknown' ? result.detectedStack.cloudProvider : 'Cloud';

  return `You are a senior ${provider} solutions architect reviewing a student project.
Write a technical summary (3–4 paragraphs) for a developer audience.
Cover: what infrastructure patterns were detected, what the specific inefficiencies are, and the concrete ${provider}-native alternatives that should be adopted.
Include specific service names (e.g., serverless functions, managed CDNs, etc.)
Be direct and specific. No fluff.

FORMATTING RULES (strictly follow):
- Do NOT use any markdown formatting: no ##, ###, **, __, *, _, --, ---, or backticks
- Do NOT use horizontal rules or dividers
- Write in plain prose paragraphs only
- Do NOT use bullet lists or numbered lists — write in flowing sentences instead

CRITICAL INSTRUCTION: Analyze the user's infrastructure configuration against the repository's primary language and topics. If the configuration makes absolutely no sense for the repository's actual purpose (for instance, if the repo is a Machine Learning training repository, notebook, or simple CLI tool not meant for web hosting), explicitly call out this discrepancy at the beginning of your summary and gently inform the user that their inputs might be mismatched.

Findings:
- Repo: ${result.repoUrl}
- Language: ${result.detectedStack.repoLanguage || 'Unknown'} (Topics: ${result.detectedStack.repoTopics?.join(', ') || 'None'})
- Score: ${result.sustainabilityScore}/100 (${result.scoreLabel})
- Detected Stack: Dockerfile=${result.detectedStack.hasDockerfile}, GitHub Actions=${result.detectedStack.hasGithubActions}, Framework=${result.detectedStack.frontendFramework}, Dependencies=${result.detectedStack.dependencyCount}
- Issues:
${result.issues.map((i) => `  • [${i.impact}] ${i.title}: ${i.description}`).join('\n')}
- Recommended actions:
${result.recommendations.map((r) => `  • ${r.title} → ${provider}: ${r.cloudAlternative || 'N/A'}`).join('\n')}`;
}
