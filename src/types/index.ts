export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type EffortLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ScanStatus = 'pending' | 'scanning' | 'complete' | 'error';

export type CloudProvider =
  | 'AWS'
  | 'GCP'
  | 'Azure'
  | 'Vercel'
  | 'Netlify'
  | 'Railway'
  | 'Render'
  | 'Fly.io'
  | 'DigitalOcean'
  | 'Heroku'
  | 'Cloudflare'
  | 'GitHub Pages'
  | 'Self-hosted'
  | 'Auto-Detect / Unknown';

export type CloudService =
  // AWS
  | 'EC2' | 'Lambda' | 'ECS' | 'Elastic Beanstalk' | 'Amplify' | 'App Runner' | 'Fargate'
  // GCP
  | 'Cloud Run' | 'Compute Engine' | 'App Engine' | 'Cloud Functions' | 'GKE'
  // Azure
  | 'Azure App Service' | 'Azure Functions' | 'Azure Container Apps' | 'AKS'
  // Vercel
  | 'Vercel Functions' | 'Vercel Edge'
  // Netlify
  | 'Netlify Functions' | 'Netlify Edge'
  // Railway
  | 'Railway Service'
  // Render
  | 'Render Web Service' | 'Render Static Site'
  // Fly.io
  | 'Fly Machine'
  // DigitalOcean
  | 'Droplet' | 'App Platform' | 'DO Functions'
  // Heroku
  | 'Heroku Dyno'
  // Cloudflare
  | 'Cloudflare Workers' | 'Cloudflare Pages'
  // GitHub Pages
  | 'GitHub Pages Static'
  // Self-hosted
  | 'VPS / Bare Metal'
  // Generic
  | 'Auto-Detect / Unknown' | 'Other';

export type CICDTool =
  | 'GitHub Actions'
  | 'GitLab CI'
  | 'Bitbucket Pipelines'
  | 'CircleCI'
  | 'Jenkins'
  | 'Travis CI'
  | 'Azure DevOps'
  | 'Drone CI'
  | 'None'
  | 'Other';

export type CIFrequency = 'every-push' | 'pr-only' | 'scheduled' | 'manual';

export type FrontendFramework =
  | 'Next.js'
  | 'React'
  | 'Vue'
  | 'Nuxt'
  | 'Svelte'
  | 'SvelteKit'
  | 'Angular'
  | 'Astro'
  | 'Remix'
  | 'Solid'
  | 'Qwik'
  | 'Gatsby'
  | 'Vite'
  | 'HTML / Vanilla'
  | 'None'
  | 'Auto-Detect';

export interface DeploymentConfig {
  cloudProvider: CloudProvider;
  cloudService: CloudService;
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
  estimatedMonthlyCO2?: string;
  estimatedMonthlyCost?: string;
}

export interface Recommendation {
  id: string;
  issueId: string;
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  cloudAlternative?: string;
  estimatedCO2Saved?: string;
  estimatedCostSaved?: string;
  implementationGuide?: string;
}

export interface BeforeAfterState {
  monthlyComputeHours: number;
  monthlyCIRuns: number;
  estimatedMonthlyCost: string;
  estimatedMonthlyCO2: string;
  energySavings: string;
  timeSaved: string;
  bandwidthSaved: string;
  monthlyRequests: number;
  label: 'before' | 'after';
}

export interface AIReport {
  plainEnglish: string;
  technical: string;
  sustainability: string;
  pitch: string;
}

export interface Subscore {
  id: string;
  label: string;
  score: number;          // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;        // one-line explanation
  issueCount: number;
}

export interface AnalysisResult {
  scanId: string;
  repoUrl: string;
  repoName: string;
  scannedAt: string;
  sustainabilityScore: number;
  scoreLabel: 'Low Impact' | 'Moderate Impact' | 'High Impact';
  subscores: Subscore[];
  issues: Issue[];
  recommendations: Recommendation[];
  before: BeforeAfterState;
  after: BeforeAfterState;
  report: AIReport;
  detectedStack: {
    cloudProvider?: string;
    hasDockerfile: boolean;
    hasGithubActions: boolean;
    ciTriggerCount: number;
    estimatedImageSize?: string;
    frontendFramework?: string;
    dependencyCount?: number;
    repoLanguage?: string;
    repoTopics?: string[];
    isMock?: boolean;
  };
}

export interface AppState {
  repoUrl: string;
  deploymentConfig: Partial<DeploymentConfig>;
  scanResult: AnalysisResult | null;
  scanId: string | null;
}

export type AppAction =
  | { type: 'SET_REPO_URL'; payload: string }
  | { type: 'SET_DEPLOYMENT_CONFIG'; payload: Partial<DeploymentConfig> }
  | { type: 'SET_SCAN_RESULT'; payload: AnalysisResult }
  | { type: 'SET_SCAN_ID'; payload: string }
  | { type: 'RESET_ALL' };

// ── Simulator types ───────────────────────────────────────────────────────────
export interface SimulatorConfig {
  cloudProvider: CloudProvider;
  cloudService: CloudService;
  region: string;
  isServerless: boolean;
  frontendFramework: FrontendFramework;
  cicdTool: CICDTool;
  hasCaching: boolean;
}

export interface SimulatorMetric {
  label: string;
  current: string;
  alternative: string;
  unit?: string;
  betterWhen: 'lower' | 'higher';
}

export interface SimulatorResult {
  currentLabel: string;
  alternativeLabel: string;
  metrics: SimulatorMetric[];
  verdict: string;         // AI-generated summary
  recommendation: string; // AI one-liner advice
  greenScoreDelta: number; // estimated score change (+/-)
}
