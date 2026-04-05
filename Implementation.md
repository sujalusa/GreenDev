Here is your complete, paste-directly-into-Claude-Code build prompt for GreenDev Coach: [docs.google](https://docs.google.com/document/d/1k42VBldEIFiT-AvD1Hn4H_BoYICgleXYWPDx2uAZxlw/edit?tab=t.0)

***

# GreenDev Coach — Full Build Prompt

## Context

You are building **GreenDev Coach** — an AI-powered sustainability coach for student software projects. It analyzes a public GitHub repo + AWS deployment configuration, identifies inefficiencies, generates a sustainability score, ranked recommendations, a before/after comparison, and a shareable AI-generated report. This is a hackathon MVP that must be fully functional, demo-ready, and visually polished.

***

## Tech Stack (Use Exactly This)

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, fast routing, Vercel deploy |
| Styling | Tailwind CSS v4 | Speed, dark mode, design system |
| Backend | Next.js API Routes | Same repo, no CORS, instant deploy |
| AI | AWS Bedrock (`anthropic.claude-3-5-sonnet-20241022-v2:0`) | AWS-native, hackathon alignment |
| GitHub Data | GitHub REST API (public, no auth required for public repos) | No OAuth needed for MVP |
| Database | Supabase (PostgreSQL) | Instant setup, free tier, no config hell |
| Deploy | Vercel (frontend + API routes) | One-command deploy, zero DevOps |
| Icons | Lucide React | Clean, consistent |
| Fonts | Geist (body) + Cabinet Grotesk via Fontshare (headings) | |

***

## Project Bootstrap

Run these commands to initialize the project:

```bash
npx create-next-app@latest greendev-coach \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd greendev-coach

npm install \
  lucide-react \
  @supabase/supabase-js \
  @aws-sdk/client-bedrock-runtime \
  axios \
  clsx \
  tailwind-merge \
  framer-motion \
  react-circular-progressbar \
  @radix-ui/react-tabs \
  @radix-ui/react-accordion \
  @radix-ui/react-dialog \
  @radix-ui/react-toggle-group \
  @radix-ui/react-select \
  @radix-ui/react-switch \
  next-themes
```

***

## Folder Structure (Create Exactly This)

```
src/
├── app/
│   ├── layout.tsx                  # Root layout: fonts, ThemeProvider, global metadata
│   ├── page.tsx                    # Home screen (/)
│   ├── analyze/
│   │   └── page.tsx                # Deployment config form (/analyze)
│   ├── scanning/
│   │   └── page.tsx                # Scanning progress screen (/scanning)
│   ├── results/
│   │   └── page.tsx                # Results dashboard (/results)
│   ├── report/
│   │   └── page.tsx                # AI Report view (/report)
│   └── api/
│       ├── analyze/
│       │   └── route.ts            # POST /api/analyze — core analysis endpoint
│       ├── report/
│       │   └── [scanId]/
│       │       └── route.ts        # GET /api/report/[scanId]
│       └── github/
│           └── route.ts            # GET /api/github?url=... — fetch repo tree
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Sticky global header: logo, breadcrumb, dark mode toggle
│   │   ├── BackButton.tsx          # Reusable back button with left arrow icon
│   │   ├── Breadcrumb.tsx          # Breadcrumb trail component
│   │   └── ProgressBar.tsx         # 4-step progress bar for form/scan screens
│   ├── ui/
│   │   ├── Button.tsx              # Primary, secondary, ghost, danger, icon-only variants
│   │   ├── Card.tsx                # Base card component with surface elevation
│   │   ├── Badge.tsx               # Impact/effort/status badges
│   │   ├── Input.tsx               # Text input with label, error, and success states
│   │   ├── Select.tsx              # Dropdown select wrapper
│   │   ├── Toggle.tsx              # Binary toggle (Yes/No, Serverless/Always-on)
│   │   ├── SegmentedControl.tsx    # Button group for AWS service selection
│   │   ├── Skeleton.tsx            # Shimmer skeleton loader
│   │   ├── Toast.tsx               # Toast notification system
│   │   ├── Modal.tsx               # Dialog/modal with ✕ close and trap focus
│   │   └── Tooltip.tsx             # Hover tooltip for icon-only buttons
│   ├── home/
│   │   └── HeroInput.tsx           # Repo URL input + CTA section
│   ├── analyze/
│   │   ├── StepOneForm.tsx         # AWS service, region, compute type fields
│   │   └── StepTwoForm.tsx         # CI/CD, caching, framework fields
│   ├── scanning/
│   │   └── ScanProgress.tsx        # Animated step list + countdown + fun facts
│   ├── results/
│   │   ├── ScoreGauge.tsx          # SVG circular arc score gauge
│   │   ├── IssuesList.tsx          # Expandable issue rows with accordion
│   │   ├── RecommendationCard.tsx  # Recommendation with impact/effort badges
│   │   ├── BeforeAfterPanel.tsx    # Side-by-side stats comparison
│   │   └── StickyActionBar.tsx     # Mobile sticky bottom action bar
│   └── report/
│       ├── ReportTabs.tsx          # 4-tab report switcher
│       ├── ReportContent.tsx       # Markdown-rendered report body
│       └── SharePanel.tsx          # Copy, download, share actions
├── engines/
│   ├── github.ts                   # GitHub API: fetch file tree, raw file contents
│   ├── ci-analysis.ts              # Analyze .github/workflows — trigger frequency, size
│   ├── docker-analysis.ts          # Analyze Dockerfile — base image, layers, size
│   ├── asset-analysis.ts           # Analyze package.json, public/ — dependencies, assets
│   ├── region-analysis.ts          # Score region sustainability + instance type
│   ├── compute-analysis.ts         # Score always-on vs serverless vs static
│   └── scorer.ts                   # Aggregate all engine outputs into final score
├── prompts/
│   ├── plain-english.ts            # Bedrock prompt: plain English summary
│   ├── technical.ts                # Bedrock prompt: technical summary
│   ├── sustainability.ts           # Bedrock prompt: sustainability-focused summary
│   └── pitch.ts                    # Bedrock prompt: pitch-ready narrative
├── data/
│   └── recommendations.ts          # Static catalog: all known recommendations with metadata
├── lib/
│   ├── bedrock.ts                  # AWS Bedrock client wrapper (invoke model)
│   ├── supabase.ts                 # Supabase client singleton
│   ├── github-client.ts            # GitHub REST API client (rate-limit aware)
│   └── utils.ts                    # cn(), formatCO2(), formatCost(), sleep()
├── types/
│   └── index.ts                    # All TypeScript types and interfaces
└── styles/
    └── globals.css                 # Tailwind base + design tokens as CSS vars
```

***

## TypeScript Types (src/types/index.ts)

Define all types first before building anything:

```typescript
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type EffortLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ScanStatus = 'pending' | 'scanning' | 'complete' | 'error';
export type AWSService = 'EC2' | 'Lambda' | 'ECS' | 'Elastic Beanstalk' | 'Amplify' | 'Other';
export type CICDTool = 'GitHub Actions' | 'CircleCI' | 'Jenkins' | 'None' | 'Other';
export type CIFrequency = 'every-push' | 'pr-only' | 'scheduled' | 'manual';
export type FrontendFramework = 'React' | 'Next.js' | 'Vue' | 'Svelte' | 'None';

export interface DeploymentConfig {
  awsService: AWSService;
  region: string;
  instanceType: string;
  isServerless: boolean;
  cicdTool: CICDTool;
  ciFrequency: CIFrequency;
  hasCaching: boolean;
  frontendFramework: FrontendFramework;
}

export interface ScanRequest {
  repoUrl: string;
  deploymentConfig: DeploymentConfig;
}

export interface Issue {
  id: string;
  category: 'ci-cd' | 'compute' | 'storage' | 'networking' | 'dependencies' | 'assets';
  title: string;
  description: string;
  impact: ImpactLevel;
  affectedFiles?: string[];
  estimatedMonthlyCO2?: string;  // e.g. "0.8kg"
  estimatedMonthlyCost?: string; // e.g. "$4.20"
}

export interface Recommendation {
  id: string;
  issueId: string;
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  awsAlternative?: string;
  estimatedCO2Saved?: string;
  estimatedCostSaved?: string;
  implementationGuide?: string;  // markdown string
}

export interface BeforeAfterState {
  monthlyComputeHours: number;
  monthlyCIRuns: number;
  estimatedMonthlyCost: string;
  estimatedMonthlyCO2: string;
  label: 'before' | 'after';
}

export interface AIReport {
  plainEnglish: string;
  technical: string;
  sustainability: string;
  pitch: string;
}

export interface AnalysisResult {
  scanId: string;
  repoUrl: string;
  repoName: string;
  scannedAt: string;
  sustainabilityScore: number;       // 0–100
  scoreLabel: 'Low Impact' | 'Moderate Impact' | 'High Impact';
  issues: Issue[];
  recommendations: Recommendation[];
  before: BeforeAfterState;
  after: BeforeAfterState;
  report: AIReport;
  detectedStack: {
    hasDockerfile: boolean;
    hasGithubActions: boolean;
    ciTriggerCount: number;
    estimatedImageSize?: string;
    frontendFramework?: string;
    dependencyCount?: number;
  };
}

export interface AppState {
  repoUrl: string;
  deploymentConfig: Partial<DeploymentConfig>;
  scanResult: AnalysisResult | null;
  scanId: string | null;
}
```

***

## Design System (src/styles/globals.css)

```css
@import "tailwindcss";

:root {
  --font-body: 'Geist', 'Inter', sans-serif;
  --font-display: 'Cabinet Grotesk', 'Inter', sans-serif;
  --font-mono: 'Geist Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
  --space-4: 1rem; --space-6: 1.5rem; --space-8: 2rem;
  --space-10: 2.5rem; --space-12: 3rem; --space-16: 4rem;

  /* Radius */
  --radius-sm: 0.375rem; --radius-md: 0.5rem;
  --radius-lg: 0.75rem; --radius-xl: 1rem; --radius-full: 9999px;

  /* Transitions */
  --transition-ui: 180ms cubic-bezier(0.16, 1, 0.3, 1);

  /* Light mode surfaces */
  --color-bg: #f7f6f2;
  --color-surface: #f9f8f5;
  --color-surface-2: #fbfbf9;
  --color-surface-offset: #f3f0ec;
  --color-border: oklch(from #28251d l c h / 0.1);
  --color-divider: oklch(from #28251d l c h / 0.07);
  --color-text: #1a1a18;
  --color-text-muted: #6b6a66;
  --color-text-faint: #b0afa9;

  /* Teal accent — primary action color */
  --color-primary: #01696f;
  --color-primary-hover: #0c4e54;
  --color-primary-subtle: #cedcd8;
  --color-primary-tint: oklch(from #01696f l c h / 0.08);

  /* Status colors */
  --color-high: #a12c7b;     --color-high-bg: #f5eaf2;
  --color-medium: #d19900;   --color-medium-bg: #fdf6e3;
  --color-low: #437a22;      --color-low-bg: #edf5e8;
  --color-error: #a12c7b;    --color-error-bg: #f5eaf2;
  --color-gold: #d19900;     --color-gold-bg: #fdf6e3;
  --color-success: #437a22;  --color-success-bg: #edf5e8;

  /* Shadows */
  --shadow-sm: 0 1px 2px oklch(0.2 0.01 80 / 0.06);
  --shadow-md: 0 4px 12px oklch(0.2 0.01 80 / 0.08);
  --shadow-lg: 0 12px 32px oklch(0.2 0.01 80 / 0.12);
}

[data-theme="dark"] {
  --color-bg: #111110;
  --color-surface: #161614;
  --color-surface-2: #1c1b19;
  --color-surface-offset: #222120;
  --color-border: oklch(from #cdccca l c h / 0.1);
  --color-divider: oklch(from #cdccca l c h / 0.06);
  --color-text: #e8e7e4;
  --color-text-muted: #8a8986;
  --color-text-faint: #5a5957;

  --color-primary: #4f98a3;
  --color-primary-hover: #227f8b;
  --color-primary-subtle: #1e3536;
  --color-primary-tint: oklch(from #4f98a3 l c h / 0.1);

  --color-high: #d163a7;     --color-high-bg: #2d1f2a;
  --color-medium: #e8af34;   --color-medium-bg: #2a2316;
  --color-low: #6daa45;      --color-low-bg: #1e2a18;
  --color-error: #d163a7;    --color-error-bg: #2d1f2a;
  --color-gold: #e8af34;     --color-gold-bg: #2a2316;
  --color-success: #6daa45;  --color-success-bg: #1e2a18;

  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.2);
  --shadow-md: 0 4px 12px oklch(0 0 0 / 0.3);
  --shadow-lg: 0 12px 32px oklch(0 0 0 / 0.4);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
body {
  min-height: 100dvh;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-bg);
  transition: background-color var(--transition-ui), color var(--transition-ui);
}
h1,h2,h3,h4,h5,h6 { font-family: var(--font-display); line-height: 1.15; text-wrap: balance; }
p, li { text-wrap: pretty; max-width: 72ch; }
img, video, canvas, svg { display: block; max-width: 100%; }
input, button, textarea, select { font: inherit; color: inherit; }
button { cursor: pointer; background: none; border: none; }
:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; border-radius: var(--radius-sm); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
```

***

## State Management (src/lib/store.ts)

Use React Context + useReducer for global state. **No localStorage** (sandboxed iframes block it). Use in-memory state.

```typescript
// AppContext holds: repoUrl, deploymentConfig, scanResult, scanId
// Wrap the entire app in <AppProvider>
// Expose useAppState() and useAppDispatch() hooks
// Actions: SET_REPO_URL, SET_DEPLOYMENT_CONFIG, SET_SCAN_RESULT, RESET_ALL
```

***

## GitHub Analysis Engine (src/engines/github.ts)

```typescript
// 1. Parse GitHub URL → extract owner + repo name
//    Validate: must match https://github.com/{owner}/{repo} pattern
//    If invalid, throw a typed GitHubURLError

// 2. fetchRepoTree(owner, repo):
//    GET https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1
//    Returns: flat file path list + blob SHAs

// 3. fetchFileContent(owner, repo, path):
//    GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
//    Decode base64 content → return raw string

// 4. fetchRepoMeta(owner, repo):
//    GET https://api.github.com/repos/{owner}/{repo}
//    Returns: stars, language, size, default_branch, topics

// Key files to target:
// - .github/workflows/*.yml or *.yaml
// - Dockerfile or docker-compose.yml
// - package.json, requirements.txt, go.mod, pom.xml
// - next.config.js, vite.config.js
// - .env.example (for service hints — never read real .env)
// - README.md (for deployment hints)
// - vercel.json, amplify.yml, serverless.yml, terraform/

// Rate limiting: add Authorization header if GITHUB_TOKEN is in env vars
// Cache: store fetched tree in memory per scanId to avoid duplicate API calls
// Errors: wrap all calls in try/catch, return { success, data, error }
```

***

## CI/CD Analysis Engine (src/engines/ci-analysis.ts)

```typescript
// Input: array of workflow file contents (YAML strings)
// Parse YAML (use 'js-yaml' package) to detect:

// CHECKS:
// 1. trigger_on_every_push:
//    Look for: on: push: (without branches filter)
//    Issue if: pushes trigger to ALL branches (no branch filter)
//    Severity: HIGH if multiple workflows, MEDIUM if one

// 2. no_path_filtering:
//    Issue if: no 'paths' filter under push trigger
//    Means: CI runs even for README-only changes
//    Severity: MEDIUM

// 3. no_caching:
//    Look for: actions/cache or cache: in steps
//    Issue if: no caching steps found in any workflow
//    Severity: HIGH for Node.js/Python/Java projects

// 4. large_workflow_count:
//    Issue if: more than 3 workflow files found
//    Severity: LOW — suggest consolidation

// 5. no_matrix_strategy:
//    Look for jobs that could benefit from matrix (test files)
//    Mention as improvement opportunity

// Output: Issue[] with category: 'ci-cd'
// Include: affectedFiles listing the workflow file paths
```

***

## Docker Analysis Engine (src/engines/docker-analysis.ts)

```typescript
// Input: Dockerfile content string
// CHECKS:

// 1. heavy_base_image:
//    Look for: FROM ubuntu, FROM debian, FROM node:latest, FROM python:latest
//    Issue if: non-slim, non-alpine, non-distroless base image
//    Severity: HIGH — recommend: node:20-alpine, python:3.12-slim

// 2. no_multistage_build:
//    Look for: multiple FROM statements (multi-stage pattern)
//    Issue if: single FROM + large build dependencies copied into final image
//    Severity: HIGH for Node.js/Python apps

// 3. copy_all_files:
//    Look for: COPY . . without a .dockerignore
//    Issue if: no .dockerignore file exists in repo
//    Severity: MEDIUM — copies node_modules, .git, etc.

// 4. running_as_root:
//    Look for: USER instruction
//    Issue if: no USER instruction found (container runs as root)
//    Severity: MEDIUM (security + best practice)

// 5. unnecessary_packages:
//    Look for: apt-get install without --no-install-recommends
//    Issue if: install command found without that flag
//    Severity: LOW

// If no Dockerfile found: note that no containerization detected
// Output: Issue[] with category: 'storage' or 'dependencies'
```

***

## Compute & Region Analysis (src/engines/region-analysis.ts + compute-analysis.ts)

```typescript
// REGION ANALYSIS:
// Input: AWS region string from deployment config
// Sustainability scores by region (based on AWS Sustainability data):
// Tier 1 (greenest): us-west-2, eu-west-1, eu-north-1, ca-central-1
// Tier 2: us-east-1, us-east-2, ap-southeast-2
// Tier 3: ap-southeast-1, ap-northeast-1, sa-east-1
// Tier 4: regions with no published carbon data
// 
// Issue if: user selected Tier 3 or 4 region
// Recommendation: migrate to nearest Tier 1/2 region
// Estimate: ~15–30% lower carbon footprint

// COMPUTE ANALYSIS:
// Input: DeploymentConfig (awsService, isServerless, instanceType)
// 
// Issue: always_on_ec2
//   If: awsService === 'EC2' AND isServerless === false
//   Severity: HIGH
//   Recommendation: migrate to Lambda (event-driven) or ECS Fargate (scale-to-zero)
//   Estimated monthly hours wasted: 720 hrs vs ~50 active hrs for a student project
//   CO2 estimate: t3.micro always-on ≈ 0.8kg CO2/month
//
// Issue: oversized_instance
//   If: instanceType includes m5, m6, c5, c6, r5 (production-grade)
//   For a student project, these are almost certainly oversized
//   Severity: MEDIUM
//   Recommendation: downsize to t3.micro/t3.small or go serverless
//
// Issue: missing_scale_to_zero
//   If: EC2 or ECS without any auto-scaling or scheduled stop
//   Severity: HIGH for dev/staging environments
```

***

## Scoring Engine (src/engines/scorer.ts)

```typescript
// Input: all Issue[] arrays from all analysis engines
// Output: { score: number, label: string }

// SCORING ALGORITHM:
// Start at 100 (perfect)
// For each issue:
//   HIGH impact: subtract 20 points
//   MEDIUM impact: subtract 10 points  
//   LOW impact: subtract 5 points
// Clamp score to 0–100

// SCORE LABELS:
// 75–100: "Low Impact"   — mostly green, minor improvements
// 45–74:  "Moderate Impact" — several fixable issues
// 0–44:   "High Impact"  — significant inefficiencies found

// BEFORE/AFTER ESTIMATION:
// Calculate BeforeAfterState from DeploymentConfig + Issues
// "After" state: apply all recommendations
// Example estimates:
//   always-on EC2 t3.micro → Lambda: save $8.50/month, save 0.8kg CO2
//   CI on every push → PR-only: save 60% CI minutes
//   No caching → with caching: save 40% CI time
//   Non-slim Docker image → Alpine: save ~200MB image size
// These are directional estimates, clearly labeled as such
```

***

## Recommendations Catalog (src/data/recommendations.ts)

```typescript
// This is a static catalog of all known recommendations
// Each has: id, title, description, impact, effort, awsAlternative, 
//           estimatedCO2Saved, estimatedCostSaved, implementationGuide

// CATALOG (minimum 12 entries):
// 1.  id: "ci-branch-filter"     — Add branch filters to CI triggers
// 2.  id: "ci-path-filter"       — Add path filters to skip docs/README changes
// 3.  id: "ci-caching"           — Add dependency caching to CI pipelines
// 4.  id: "ec2-to-lambda"        — Migrate always-on EC2 to Lambda
// 5.  id: "ec2-to-static"        — Move frontend to S3 + CloudFront
// 6.  id: "docker-alpine"        — Use Alpine/slim Docker base images
// 7.  id: "docker-multistage"    — Add multi-stage Docker builds
// 8.  id: "docker-ignore"        — Add .dockerignore to reduce build context
// 9.  id: "region-optimize"      — Migrate to greener AWS region
// 10. id: "instance-downsize"    — Downsize to t3.micro or go serverless
// 11. id: "asset-compression"    — Enable gzip/brotli + image optimization
// 12. id: "lazy-loading"         — Add lazy loading for non-critical assets

// Each implementationGuide is a markdown string with:
//   - 2-3 sentence explanation
//   - A code example or config snippet
//   - Link to relevant AWS docs (text only, no live links needed)
```

***

## AWS Bedrock Integration (src/lib/bedrock.ts)

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function invokeClaude(prompt: string): Promise<string> {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  };

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const parsed = JSON.parse(new TextDecoder().decode(response.body));
  return parsed.content[0].text;
}

// GRACEFUL DEGRADATION: wrap all Bedrock calls in try/catch
// If Bedrock fails, return a pre-written fallback template string
// The analysis result should still return with rule-based findings even if AI fails
// Log the error but do NOT surface it to the user as a crash
```

***

## AI Prompts (src/prompts/)

Each prompt file exports a function that takes `AnalysisResult` and returns a complete prompt string.

**plain-english.ts:**
```
You are GreenDev Coach, a sustainability assistant for student developers.
Given these findings from a GitHub repo analysis, write a plain-English summary 
(3–4 paragraphs) that a student developer with no cloud expertise can understand.
Do not use jargon without explaining it. Be encouraging but honest.
Focus on the 2–3 most impactful changes they can make right now.
End with a one-sentence motivational close.

Findings:
- Repo: {repoUrl}
- Sustainability Score: {score}/100 ({scoreLabel})
- Top Issues: {issues mapped to bullet points}
- Top Recommendations: {recommendations mapped to bullet points}
- Estimated savings if all changes applied: {after.estimatedCostSaved}/month, {after.estimatedCO2Saved} CO2
```

**technical.ts:**
```
You are a senior AWS solutions architect reviewing a student project.
Write a technical summary (3–4 paragraphs) for a developer audience.
Cover: what infrastructure patterns were detected, what the specific inefficiencies are,
and the concrete AWS-native alternatives that should be adopted.
Include specific service names (Lambda, S3, CloudFront, ECS Fargate, etc.)
Be direct and specific. No fluff.

[same findings structure]
```

**sustainability.ts:**
```
You are a cloud sustainability expert writing for a university sustainability report.
Write a sustainability-focused summary (3–4 paragraphs) covering:
1. The estimated environmental impact of the current setup
2. What specific changes would reduce carbon footprint and why
3. How these changes align with AWS's sustainability commitments
4. A clear call to action for the team

Frame all estimates as directional heuristics, not precise measurements.
[same findings structure]
```

**pitch.ts:**
```
You are helping a hackathon team create a compelling pitch narrative.
Write a pitch-ready summary (2–3 paragraphs) that a team could read to judges.
It should: describe what was found, what was recommended, and what the impact would be.
Make it sound impressive but honest. Highlight the AWS-native recommendations.
Keep it energetic and concise — this will be read aloud in 60 seconds.
[same findings structure]
```

***

## Core API Route (src/app/api/analyze/route.ts)

```typescript
// POST /api/analyze
// Request body: ScanRequest { repoUrl, deploymentConfig }
// 
// IMPLEMENTATION:
// 1. Validate repoUrl format (must be github.com URL, reject others)
// 2. Validate deploymentConfig fields (all required fields present)
// 3. If validation fails: return 400 with { success: false, error: string }
//
// 4. Generate scanId: crypto.randomUUID()
//
// 5. Fetch repo data via github.ts:
//    - Get repo tree (file paths)
//    - Fetch GitHub Actions workflow files (all .github/workflows/*.yml)
//    - Fetch Dockerfile if present
//    - Fetch package.json or requirements.txt if present
//    - Catch GitHub API errors gracefully (private repo, not found, rate limited)
//
// 6. Run all analysis engines in parallel:
//    const [ciIssues, dockerIssues, assetIssues, computeIssues, regionIssues] = await Promise.all([
//      analyzeCICD(workflowContents),
//      analyzeDocker(dockerfileContent),
//      analyzeAssets(packageJsonContent, repoTree),
//      analyzeCompute(deploymentConfig),
//      analyzeRegion(deploymentConfig.region),
//    ])
//
// 7. Combine all issues, run scorer
//    const allIssues = [...ciIssues, ...dockerIssues, ...assetIssues, ...computeIssues, ...regionIssues]
//    const { score, label } = calculateScore(allIssues)
//    const recommendations = matchRecommendations(allIssues)  // look up from catalog
//    const { before, after } = calculateBeforeAfter(deploymentConfig, allIssues)
//
// 8. Generate AI reports via Bedrock (all 4 in parallel):
//    const [plainEnglish, technical, sustainability, pitch] = await Promise.all([
//      invokeClaude(buildPlainEnglishPrompt(result)),
//      invokeClaude(buildTechnicalPrompt(result)),
//      invokeClaude(buildSustainabilityPrompt(result)),
//      invokeClaude(buildPitchPrompt(result)),
//    ])
//    Wrap each in try/catch — use fallback strings if Bedrock fails
//
// 9. Assemble AnalysisResult, store in Supabase (table: scans)
//
// 10. Return: { success: true, data: AnalysisResult }
//
// ALL RESPONSES follow this schema:
// { success: boolean, data: T | null, error: string | null }
//
// SECURITY:
// - Validate and sanitize repoUrl before any API call
// - Never log request bodies
// - Rate limit: check X-Forwarded-For, max 10 requests/hour/IP (store in Supabase)
// - Set response headers: Content-Type: application/json
// - Timeout: 45 seconds max (set via Vercel function timeout config)
```

***

## Supabase Schema

Run these in the Supabase SQL editor:

```sql
-- Scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_url TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  deployment_config JSONB NOT NULL,
  result JSONB NOT NULL,
  score INTEGER NOT NULL,
  score_label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate limiting table
CREATE TABLE rate_limits (
  ip TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ip)
);

-- Enable RLS (Row Level Security)
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow API routes to insert/read (use service role key in API routes)
CREATE POLICY "service_role_all" ON scans FOR ALL USING (true);
CREATE POLICY "service_role_all" ON rate_limits FOR ALL USING (true);
```

***

## Environment Variables (.env.local)

```env
# GitHub (optional — increases rate limit from 60 to 5000 req/hour)
GITHUB_TOKEN=ghp_your_token_here

# AWS Bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Add to .gitignore:** `.env.local`, `.env`, `.env*.local`
**Create:** `.env.example` with all keys listed but no real values

***

## Screen Implementations

### Screen 1: Home (src/app/page.tsx)

```
- Import and use: Header (no breadcrumb, no "Start New Scan"), HeroInput
- HeroInput component:
    - Tag pill: leaf icon + "Sustainability for Student Devs"
    - H1: "Is your project as green as your code is good?"
    - Sub text (55ch max)
    - Repo URL input (full controlled input with validation)
    - Inline URL validation on blur: 
        * must start with https://github.com/
        * must have owner/repo path segments
        * show green checkmark icon in input on valid
        * show red error message below on invalid
    - "Analyze Repo →" primary button (disabled + spinner while navigating)
    - Helper text below input: lock icon + "Public repos only. No code is executed."
    - 3-item trust strip: zap icon "Avg scan: 18 sec", github icon "Public repos only", shield icon "Read-only access"
    - On submit: save repoUrl to AppContext → router.push('/analyze')
- Below fold: "How it works" — 3 numbered steps
- Footer: minimal
```

### Screen 2: Deployment Config (src/app/analyze/page.tsx)

```
- Redirect to '/' if no repoUrl in context
- Show: Header (breadcrumb: Home / Analyze, "Start New Scan" button), BackButton (→ /), ProgressBar (step 2 active)
- Two-step inline wizard (managed with local useState: step 1 | step 2)
- STEP 1:
    - Section heading: "Deployment Setup"
    - SegmentedControl: AWS Service (EC2, Lambda, ECS, Elastic Beanstalk, Amplify, Other)
    - Select: AWS Region (show all major regions with codes)
    - Toggle: "Always-on" | "Event-driven (Serverless)"
    - Input: Instance type (placeholder: e.g. t3.micro) — only visible if NOT serverless
    - Button: "Next: CI/CD Details →" (primary, full width on mobile)
- STEP 2:
    - Section heading: "CI/CD & Pipeline"
    - SegmentedControl: CI/CD Tool
    - Select: How often does your pipeline run?
    - Toggle: "Caching configured?" — Yes | No
    - Select: Frontend framework
    - Buttons row: "← Back to Deployment" (ghost) + "Analyze My Repo →" (primary)
- On final submit: save deploymentConfig to AppContext → router.push('/scanning')
- RIGHT PANEL (desktop only, sticky):
    - "Why we ask this" card
    - "Quick tip" card (updates based on awsService selection)
```

### Screen 3: Scanning (src/app/scanning/page.tsx)

```
- Redirect to '/' if no repoUrl or deploymentConfig in context
- Show: Header (breadcrumb: Home / Analyze / Scanning), NO back button
- "Cancel scan" text link → confirm modal → router.push('/') on confirm
- Repo URL display card (github icon + monospace URL)
- useEffect on mount: call POST /api/analyze with repoUrl + deploymentConfig
- Animated step list (7 steps):
    Each step starts as "upcoming" (faint), transitions to "active" (spinner + teal), then "done" (checkmark + normal text)
    Steps:
    1. "Fetching repository structure" → complete after GitHub tree fetch (~2–4s)
    2. "Analyzing CI/CD pipelines" (~1s after step 1)
    3. "Checking Docker & container config" (~1s)
    4. "Evaluating region & compute choices" (~1s)
    5. "Scoring sustainability factors" (~1s)
    6. "Generating AI recommendations" (longest — Bedrock calls)
    7. "Building your report" (final assembly)
    
    NOTE: Steps 1–5 are instant locally but stagger them visually using setTimeout
    to give a realistic feel. Map API response progress to steps via a local state machine.
    
- Fake countdown: start at 25 seconds, count down. Pause at 5 seconds until API responds.
- Rotating sustainability fact every 4 seconds (5 facts hardcoded)
- On API response success: save result to AppContext → router.push('/results')
- On API error: show inline error state with "Try Again" button (re-triggers the API call)
```

### Screen 4: Results Dashboard (src/app/results/page.tsx)

```
- Redirect to '/' if no scanResult in context
- Show: Header (breadcrumb: Home / Analyze / Results, "Start New Scan" button)
- BackButton → /analyze (preserve form values)
- "← Start Over" faint link → reset AppContext → router.push('/')
- Desktop: 2-column grid (score + issues left | recommendations right)
- Mobile: stacked single column

LEFT COLUMN:
- ScoreGauge:
    * SVG arc gauge (use react-circular-progressbar or custom SVG)
    * Score number: Cabinet Grotesk 800, colored by tier (teal/gold/red)
    * Score label badge pill
    * Subtext: "Based on X factors analyzed"
    * Animate the arc from 0 to final score on mount (800ms ease-out)
- IssuesList:
    * "What We Found" heading
    * Up to 5 issues as accordion rows
    * Each row: impact badge + title + chevron
    * Expanded: full description + affected files list + CO2/cost estimate
    * "← Close" link inside expanded content

RIGHT COLUMN:
- RecommendationCard × up to 5:
    * Title + impact badge + effort badge
    * 2–3 sentence description
    * AWS alternative callout box (teal tint, leaf icon)
    * Estimated savings line
    * "See implementation guide" expander → code snippet
    * "← Collapse" link inside expanded guide
- BeforeAfterPanel:
    * "Before → After" heading
    * 4 metrics: monthly cost, CO2, compute hours, CI runs
    * Each metric: before value | → arrow | after value (green delta)
    * Desktop: side by side. Mobile: Tab switcher ("Before" / "After")

MOBILE STICKY ACTION BAR:
- Fixed bottom bar: "View Full AI Report →" primary + "Share Results" ghost
- 64px height, backdrop blur, 1px top border

"View Full Report →" button → router.push('/report')
```

### Screen 5: AI Report (src/app/report/page.tsx)

```
- Redirect to '/' if no scanResult in context
- Show: Header (breadcrumb: Home / Analyze / Results / Report, "Start New Scan" button)
- BackButton → /results
- "← Start Over" faint link

- ReportTabs: 4 tabs (Plain English | Technical | Sustainability | Pitch-Ready)
  * Use @radix-ui/react-tabs
  * Active tab: teal bottom border, full-weight text
  * All 4 report texts already in context (pre-generated) — tab switch is instant

- ReportContent:
  * Render AI text as formatted HTML (use a simple markdown-to-HTML converter or pre-format from API)
  * max-width: 640px, centered
  * Headings use --font-display, body uses --font-body

- SharePanel (below report):
  * "Copy Link" → copy window.location.href to clipboard → show "Copied!" toast 3s
  * "Download PDF" → use window.print() with a print-optimized @media print stylesheet
    (or generate a text blob — keep it simple for hackathon)
  * "Share" → on mobile: navigator.share(); on desktop: show popover with Twitter/LinkedIn pre-filled text

- Scan metadata line at bottom (faint, small)
```

***

## Global Header Component (src/components/layout/Header.tsx)

```
Props:
  - showBreadcrumb?: boolean (default true on desktop)
  - breadcrumbItems?: { label: string, href: string }[]
  - showStartNewScan?: boolean (default true except on Home)
  - currentStep?: 1 | 2 | 3 | 4 (for progress bar)

Structure:
  - position: sticky; top: 0; z-index: 50
  - backdrop-filter: blur(12px); background: oklch(from var(--color-bg) l c h / 0.85)
  - border-bottom: 1px solid var(--color-divider)
  - height: 56px
  - Content: flex, space-between
  
  LEFT: GreenDev Coach SVG logo + wordmark (link to '/' only when not on Home)
    Logo SVG concept: a leaf shape combined with a terminal cursor >_ 
    Generate this as a clean inline SVG, 28px height
    
  CENTER (desktop ≥768px only): Breadcrumb component
  
  RIGHT: 
    - Dark mode toggle (sun/moon icon, icon-only button with aria-label)
    - "Start New Scan" ghost button (only if showStartNewScan=true)
      → on click: reset AppContext → router.push('/')

Dark Mode Toggle:
  - Use next-themes: useTheme() hook
  - Toggle between 'dark' and 'light'
  - Sun icon in dark mode, moon icon in light mode
  - 40×40px touch target
```

***

## BackButton Component (src/components/layout/BackButton.tsx)

```
Props:
  - href: string (where to navigate)
  - label?: string (default "Back")
  - preserveState?: boolean (if true, don't reset that context slice)

Style:
  - Ghost button: arrow-left Lucide icon + label text
  - color: var(--color-text-muted)
  - hover: color: var(--color-text), bg: var(--color-surface-offset)
  - min-height: 44px; padding: 0 var(--space-3)
  - border-radius: var(--radius-md)
  - font-size: var(--text-sm)
  - Positioned below the header, left-aligned, NOT inside the header

IMPORTANT:
  - This component MUST appear on screens 2, 3, 4, and 5
  - On Screen 3 (Scanning), render a cancel link instead (see Screen 3 spec)
  - On mobile: make it full-width tap area (not just the visible content)
```

***

## Mock Data for Demo (src/data/mock-result.ts)

Create a realistic hardcoded `AnalysisResult` for the repo `github.com/facebook/react` with the following hardcoded values. This is used when:
- `NEXT_PUBLIC_USE_MOCK=true` is set in env
- GitHub API fails (graceful fallback)
- During rapid demo

```typescript
export const MOCK_RESULT: AnalysisResult = {
  scanId: "demo-scan-001",
  repoUrl: "https://github.com/demo/student-project",
  repoName: "student-project",
  scannedAt: new Date().toISOString(),
  sustainabilityScore: 42,
  scoreLabel: "High Impact",
  issues: [
    // 5 realistic issues across categories
    // Make them feel authentic to a student project
  ],
  recommendations: [
    // 5 recommendations matching those issues
    // Include full implementationGuide markdown for each
  ],
  before: {
    monthlyComputeHours: 720,
    monthlyCIRuns: 120,
    estimatedMonthlyCost: "$18.40",
    estimatedMonthlyCO2: "2.4kg",
    label: "before"
  },
  after: {
    monthlyComputeHours: 48,
    monthlyCIRuns: 30,
    estimatedMonthlyCost: "$3.20",
    estimatedMonthlyCO2: "0.4kg",
    label: "after"
  },
  report: {
    plainEnglish: "...", // 3 paragraphs
    technical: "...",
    sustainability: "...",
    pitch: "..."
  },
  detectedStack: {
    hasDockerfile: true,
    hasGithubActions: true,
    ciTriggerCount: 4,
    estimatedImageSize: "1.2GB",
    frontendFramework: "React",
    dependencyCount: 47
  }
}
```

***

## Error Handling Rules (Apply Everywhere)

```
1. Every async function returns { success: boolean, data: T | null, error: string | null }
   Never throw unhandled exceptions to the UI

2. GitHub API failures:
   - 404: "Repository not found or is private. GreenDev Coach only works with public repos."
   - 403: "GitHub rate limit reached. Try again in a few minutes."
   - Network error: "Could not reach GitHub. Check your connection."
   → Fall back to mock data if NEXT_PUBLIC_USE_MOCK=true

3. Bedrock failures:
   → Use pre-written fallback report strings (stored in each prompt file as export const FALLBACK_TEXT)
   → Log error server-side, don't surface to user as a crash
   → Return analysis result with fallback report text

4. Supabase failures:
   → Return analysis result without storing it
   → The user still sees their results — no crash
   → Log error server-side

5. Form validation:
   → Inline errors next to each field, using --color-error
   → "Submit" button stays disabled until all required fields are filled
   → Never use browser alert() — always use inline UI

6. All API responses: always { success, data, error } schema
   Consumers: always check response.success before accessing response.data
```

***

## Animations

Use `framer-motion` for:
- Page transitions: fade + translateY(-8px) → (0) on enter, 200ms ease-out
- Score gauge: animate arc from 0 to final score on mount, 800ms ease-out
- Scanning step transitions: each step fades in as it becomes active
- Recommendation cards: staggered fade-in on results page (stagger 80ms between cards)
- Before/after numbers: count-up animation from 0 to final value on mount
- Toast: slide in from right, slide out on dismiss

```typescript
// Page transition wrapper:
// <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
```

Respect `prefers-reduced-motion`:
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Pass duration: prefersReducedMotion ? 0 : 0.2 to all framer-motion components
```

***

## Accessibility Checklist (Enforce in Every Component)

- One `<h1>` per page — the page title
- All icon-only buttons have `aria-label`
- Score gauge: `role="meter"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"`
- All form inputs have `<label>` associated via `htmlFor` + `id`
- Error messages linked via `aria-describedby`
- All modals: `role="dialog"`, `aria-modal="true"`, focus trapped inside, `Escape` closes
- Tab accordion: `aria-expanded` on trigger, `aria-controls` pointing to content panel
- Skip link: first focusable element in layout: `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>`
- Color is never the only indicator — every badge has text + color
- All touch targets: minimum 44×44px

***

## Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard:
# GITHUB_TOKEN, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
# NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# vercel.json (create at root):
{
  "functions": {
    "src/app/api/analyze/route.ts": { "maxDuration": 45 }
  }
}
```

***

## Build Order (Hackathon Execution Sequence)

**Follow this sequence exactly — do not jump ahead:**

1. `npm run dev` — confirm blank Next.js app runs at localhost:3000
2. Build `src/types/index.ts` — all types first, everything depends on this
3. Build `src/styles/globals.css` — design tokens + base CSS
4. Build `src/lib/utils.ts` + `src/lib/bedrock.ts` + `src/lib/supabase.ts` + `src/lib/github-client.ts`
5. Build AppContext (`src/lib/store.ts`) — state management before any UI
6. Build all UI primitives in `src/components/ui/` — Button, Card, Badge, Input, etc.
7. Build Header + BackButton + Breadcrumb + ProgressBar
8. Build Screen 1 (Home) end-to-end — no API calls yet, just navigation
9. Build Screen 2 (Form) end-to-end — validate form flow
10. Build all analysis engines + scorer + recommendations catalog
11. Build `/api/analyze` route — test with real GitHub repos in isolation
12. Wire up Bedrock prompts + AI report generation
13. Build Screen 3 (Scanning) — wire to real API call
14. Build Screen 4 (Results) — ScoreGauge, IssuesList, RecommendationCards, BeforeAfter
15. Build Screen 5 (Report) — tabs, share panel
16. Add animations (framer-motion) — last, not first
17. Full end-to-end test with 3 real public GitHub repos
18. `vercel --prod`

***

## Quality Gates (Do Not Ship Without These)

- [ ] Every screen has a working back button / cancel affordance
- [ ] Home button (logo) works from every screen
- [ ] Breadcrumb shows correct path on every screen
- [ ] "Start New Scan" button resets state and goes home from results + report screens
- [ ] Score gauge animates correctly
- [ ] All 5 recommendations expand their implementation guide
- [ ] Before/after comparison shows realistic delta values
- [ ] All 4 report tabs switch instantly (no re-fetch)
- [ ] "Copy Link" copies and shows toast confirmation
- [ ] Dark mode toggle works from every screen
- [ ] Cancel modal on scanning screen has ✕ close button and works with Escape
- [ ] All form inputs have visible labels
- [ ] Mobile sticky bottom bar visible on results screen
- [ ] All icon-only buttons have aria-label
- [ ] No screen crashes if Bedrock API is down (fallback text shows)
- [ ] Repo not found shows friendly error, not a raw 404
- [ ] `npm run build` passes with zero TypeScript errors

***

That's everything you need to hand to Claude Code. A few notes on using this: [docs.google](https://docs.google.com/document/d/1k42VBldEIFiT-AvD1Hn4H_BoYICgleXYWPDx2uAZxlw/edit?tab=t.0)

- **Drop this entire prompt** into Claude Code as the initial instruction — it has enough specificity to build each file without follow-up prompts for every component
- **The build order section** is critical — follow it sequentially so you don't spend time debugging UI against a broken API
- **The mock data file** (`src/data/mock-result.ts`) is your safety net — build it early so your demo runs even if AWS Bedrock credentials aren't ready
- **The graceful degradation rules** mean your demo never fully crashes — Bedrock down? Fallback text. GitHub API rate limited? Mock data. Supabase down? Return results without storing