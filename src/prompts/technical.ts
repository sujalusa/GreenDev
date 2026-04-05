import { AnalysisResult } from '@/types';

export const FALLBACK_TEXT = `The static analysis engine completed its scan and detected infrastructure patterns that are common sources of cloud waste in student projects. The key findings span three areas: compute provisioning strategy, CI/CD pipeline efficiency, and container image optimization. Each of these areas has concrete, low-effort fixes that can meaningfully reduce both monthly cost and carbon output.

On the compute side, always-on virtual machines are the most expensive pattern for low-traffic projects. A project that sees real traffic for 50 hours per month but runs a VM for 720 hours is paying 14x more than necessary. The fix is migration to a serverless compute model where billing is per-invocation rather than per-hour. For API backends, Lambda with API Gateway is the standard path. For containerized workloads that need more control, ECS Fargate provides the same scale-to-zero behavior with container isolation.

The CI/CD pipeline analysis found missing dependency caching, which forces the runner to re-download packages on every build. For a Node.js project using npm, adding an actions/cache step targeting the ~/.npm directory reduces install time by 2-5 minutes per run. At typical GitHub Actions pricing, this translates to meaningful savings across a month of active development. Adding branch and path filters ensures the pipeline only triggers when relevant code changes, cutting down unnecessary runs entirely.

Container image sizing is the third area. A node:latest base image ships with ~1.1GB of OS libraries, compilers, and tooling that a production container does not need. Switching to node:20-alpine brings this down to ~50MB. Combining that with a multi-stage build keeps build tooling out of the final image entirely. Both changes reduce registry storage costs, speed up pulls, and lower the energy cost of each deployment.`;

export function buildTechnicalPrompt(result: AnalysisResult): string {
  const provider = result.detectedStack.cloudProvider !== 'Auto-Detect / Unknown' ? result.detectedStack.cloudProvider : 'Cloud';
  const hasIssues = result.issues.length > 0;

  return `You are a senior ${provider} solutions architect and DevOps engineer reviewing a student project's cloud infrastructure.

Write a detailed technical breakdown (5–6 paragraphs) for a developer audience. This should read like a thorough code review comment, not a marketing summary.

Structure your response as follows:
1. Stack overview: what was detected in the repository and how it is currently deployed
2. Compute analysis: evaluate the deployment model, instance sizing, and idle cost profile
3. CI/CD analysis: assess pipeline trigger strategy, caching, and job structure
4. Container/build analysis: evaluate Dockerfile patterns, image sizes, and build efficiency
5. Specific remediation steps: name the exact ${provider} services and configuration changes needed
6. Estimated impact: rough numbers on cost and CO2 reduction if the top recommendations are implemented

FORMATTING RULES (strictly follow):
- Do NOT use any markdown formatting: no ##, ###, **, __, *, _, --, ---, or backticks
- Do NOT use horizontal rules or dividers
- Write in plain prose paragraphs only
- Do NOT use bullet lists or numbered lists — write in flowing sentences instead
- If a section has nothing to report (e.g. no Dockerfile found), acknowledge it briefly and move on

CRITICAL: If the infrastructure configuration appears mismatched for the repo's actual purpose (e.g. EC2 configured for a static site, or always-on VM for a CLI tool), call this out explicitly in the first paragraph.

Repository data:
- Repo: ${result.repoUrl}
- Language: ${result.detectedStack.repoLanguage || 'Unknown'}
- Topics: ${result.detectedStack.repoTopics?.join(', ') || 'None'}
- Sustainability score: ${result.sustainabilityScore}/100 (${result.scoreLabel})
- Has Dockerfile: ${result.detectedStack.hasDockerfile}
- Has GitHub Actions: ${result.detectedStack.hasGithubActions} (${result.detectedStack.ciTriggerCount} workflow files)
- Frontend framework: ${result.detectedStack.frontendFramework || 'Unknown'}
- Dependency count: ${result.detectedStack.dependencyCount ?? 'Unknown'}
- Cloud provider: ${provider}
- Issues detected (${result.issues.length} total):
${hasIssues ? result.issues.map((i) => `  [${i.impact}] ${i.title} — ${i.description}`).join('\n') : '  No issues detected — architecture appears well-optimized.'}
- Recommended fixes:
${result.recommendations.length > 0 ? result.recommendations.map((r) => `  ${r.title} (${r.effort} effort, ${r.impact} impact) → ${provider} alternative: ${r.cloudAlternative || 'see implementation guide'}`).join('\n') : '  No specific fixes required.'}`;
}
