import { Issue, BeforeAfterState, DeploymentConfig, Subscore } from '@/types';

// ── Real AWS EC2 on-demand pricing (us-east-1, Linux, 2025) ──────────────────
// Source: https://aws.amazon.com/ec2/pricing/on-demand/
// Prices in $/hour. Other regions are within ~20% of these.
const EC2_HOURLY_RATES: Record<string, number> = {
  't2.nano': 0.0058, 't2.micro': 0.0116, 't2.small': 0.0230, 't2.medium': 0.0464,
  't3.nano': 0.0052, 't3.micro': 0.0104, 't3.small': 0.0208, 't3.medium': 0.0416,
  't3.large': 0.0832, 't3.xlarge': 0.1664, 't3.2xlarge': 0.3328,
  't4g.micro': 0.0084, 't4g.small': 0.0168, 't4g.medium': 0.0336,
  'm5.large': 0.0960, 'm5.xlarge': 0.1920, 'm5.2xlarge': 0.3840,
  'm6i.large': 0.0960, 'm6i.xlarge': 0.1920,
  'c5.large': 0.0850, 'c5.xlarge': 0.1700, 'c5.2xlarge': 0.3400,
  'c6i.large': 0.0850, 'c6i.xlarge': 0.1700,
  'r5.large': 0.1260, 'r5.xlarge': 0.2520,
};
const EC2_DEFAULT_HOURLY = 0.0104; // t3.micro fallback

// ── Real EC2 average power draw (watts) by instance family ───────────────────
// Source: Cloud Carbon Footprint methodology + AWS EC2 power data
const EC2_WATTS: Record<string, number> = {
  't2': 3.0, 't3': 3.5, 't3a': 3.5, 't4g': 2.8,
  'm5': 8.0, 'm5a': 7.5, 'm6i': 8.0, 'm6a': 7.5, 'm7i': 8.5,
  'c5': 7.0, 'c5a': 6.5, 'c6i': 7.0, 'c6a': 6.5, 'c7i': 7.5,
  'r5': 10.0, 'r5a': 9.5, 'r6i': 10.0, 'r7i': 10.5,
};
const EC2_DEFAULT_WATTS = 3.5; // t3.micro equivalent

// ── Vercel Pricing (2025) ────────────────────────────────────────────────────
// Source: https://vercel.com/pricing
// Vercel Functions: $0.50/month base + $0.15 per 1M function executions + compute time
// Edge Functions: included in Vercel plan
// Pro plan ($20/mo) includes 1M edge executions, API acceleration, etc.
const VERCEL_BASE_COST = 20; // Pro plan
const VERCEL_FUNCTION_COST_PER_1M = 0.15; // per million invocations
const VERCEL_EDGE_POWER_WATTS = 2.0; // edge functions are extremely efficient

// ── Vercel carbon data ────────────────────────────────────────────────────────
// Vercel is hosted on Google Cloud Platform. See regions below.
// GCP regions use the same carbon intensity as Google Cloud.
const VERCEL_REGIONS_TO_GCP: Record<string, string> = {
  'global-edge': 'us-central1',     // Default global edge → US Central (most efficient)
  'sfo': 'us-west1',        // San Francisco → GCP us-west1
  'sjc': 'us-west1',        // San Jose → GCP us-west1
  'iad': 'us-central1',     // Virginia → GCP us-central1
  'ord': 'us-central1',     // Chicago → GCP us-central1
  'lhr': 'europe-west1',    // London → GCP europe-west1
  'arn': 'europe-north1',   // Stockholm → GCP europe-north1
  'cdg': 'europe-west1',    // Paris → GCP europe-west1
  'sin': 'asia-southeast1', // Singapore
  'syd': 'asia-southeast2', // Sydney
  'nrt': 'asia-northeast1', // Tokyo
  'icn': 'asia-northeast1', // Seoul
  'bom': 'asia-south1',     // Mumbai
  'gru': 'southamerica-east1', // São Paulo
};

// ── Real carbon intensity by AWS region (kgCO2eq per kWh) ────────────────────
// Source: AWS Sustainability Report 2023 + electricitymaps.com regional data
// Note: AWS purchases RECs/PPAs so their *market-based* intensity is lower,
// but we use *location-based* intensity to reflect actual grid energy.
const REGION_CARBON_INTENSITY: Record<string, number> = {
  // USA
  'us-east-1': 0.379,   // N. Virginia  — PJM grid
  'us-east-2': 0.405,   // Ohio         — PJM grid (higher coal mix)
  'us-west-1': 0.203,   // N. California — WECC, hydro+solar mix
  'us-west-2': 0.043,   // Oregon       — ~95% renewables (hydro dominant)
  // Europe
  'eu-west-1': 0.316,   // Ireland      — wind + gas mix
  'eu-west-2': 0.225,   // London       — North Sea wind + gas
  'eu-west-3': 0.052,   // Paris        — ~90% nuclear
  'eu-central-1': 0.338,// Frankfurt    — coal + gas + renewables
  'eu-central-2': 0.272,// Zurich       — hydro mix
  'eu-north-1': 0.008,  // Stockholm    — ~99% renewables (hydro + wind)
  'eu-south-1': 0.233,  // Milan        — gas + renewables
  'eu-south-2': 0.142,  // Spain        — wind + solar + nuclear
  // Canada
  'ca-central-1': 0.120,// Montreal     — ~98% hydro
  'ca-west-1': 0.080,   // Calgary      — hydro + wind
  // Asia Pacific
  'ap-south-1': 0.708,  // Mumbai       — coal heavy
  'ap-south-2': 0.708,  // Hyderabad    — coal heavy
  'ap-southeast-1': 0.408, // Singapore — gas + some solar
  'ap-southeast-2': 0.656, // Sydney    — coal + gas mix
  'ap-southeast-3': 0.741, // Jakarta   — coal dominant
  'ap-northeast-1': 0.506, // Tokyo     — gas + nuclear mix (post-Fukushima)
  'ap-northeast-2': 0.425, // Seoul     — coal + nuclear
  'ap-northeast-3': 0.506, // Osaka     — similar to Tokyo
  'ap-east-1': 0.360,   // Hong Kong   — gas + coal
  // Middle East & Africa
  'me-south-1': 0.732,  // Bahrain     — natural gas dominant
  'me-central-1': 0.650,// UAE
  'af-south-1': 0.928,  // Cape Town   — coal dominant
  // South America
  'sa-east-1': 0.074,   // São Paulo   — ~85% hydro + renewables
  // GCP (for cross-cloud context)
  'us-central1': 0.220, // Iowa        — wind heavy
  'europe-north1': 0.006, // Finland   — near-zero
  'europe-west1': 0.290, // Belgium
};
const DEFAULT_CARBON_INTENSITY = 0.379; // US average

// ── GitHub Actions runner power (watts) ──────────────────────────────────────
// GitHub's hosted runners are in Azure US-East datacenters
// Source: Green Software Foundation runner energy estimates
const GH_ACTIONS_RUNNER_WATTS = 50; // Standard ubuntu-latest runner
const GH_ACTIONS_RUNNER_REGION_INTENSITY = 0.379; // Azure US-East ≈ US-East-1

export interface RepoMetrics {
  monthlyCommits: number; // actual from GitHub Stats API
  isPrivate: boolean;     // determines GitHub Actions pricing
  stars: number;          // used to estimate traffic for Lambda/CDN
  repoSize?: number;      // KB — for bandwidth calculations
}

const ISSUE_WEIGHTS = {
  HIGH: 20,
  MEDIUM: 10,
  LOW: 5,
};

function gradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

export function calculateSubscores(issues: Issue[], config?: Partial<DeploymentConfig>): Subscore[] {
  // Group issues by category
  const ciIssues = issues.filter(i => i.category === 'ci-cd');
  const computeIssues = issues.filter(i => i.category === 'compute');
  const storageIssues = issues.filter(i => i.category === 'storage');
  const depIssues = issues.filter(i => i.category === 'dependencies');
  const assetIssues = issues.filter(i => i.category === 'assets');

  function scoreCategory(categoryIssues: Issue[], maxPenalty = 80): number {
    let penalty = 0;
    for (const issue of categoryIssues) {
      penalty += ISSUE_WEIGHTS[issue.impact];
    }
    return Math.max(0, 100 - Math.min(penalty, maxPenalty));
  }

  // CI/CD Efficiency — based on ci-cd issues
  const ciScore = scoreCategory(ciIssues);
  const ciSummary = ciIssues.length === 0
    ? 'Pipeline is well-optimised with caching and filters.'
    : ciIssues.some(i => i.impact === 'HIGH')
      ? 'High-energy triggers detected — every push runs the full pipeline.'
      : 'Minor CI inefficiencies detected.';

  // Compute Efficiency — based on compute + storage
  const computeScore = scoreCategory([...computeIssues, ...storageIssues]);
  const computeSummary = computeIssues.length === 0
    ? 'Compute is well-sized and in a green region.'
    : computeIssues.some(i => i.id?.includes('always-on') || i.id?.includes('vm'))
      ? 'Always-on VM running 720 hrs/month even when idle.'
      : 'Compute could be better matched to workload.';

  // Container / Stack Weight — based on docker-related issues (assets that mention docker)
  const dockerIssues = issues.filter(i =>
    i.id?.startsWith('docker') || i.category === 'assets'
  );
  const stackScore = scoreCategory(dockerIssues);
  const stackSummary = dockerIssues.length === 0
    ? 'Container image is lean and build-optimised.'
    : dockerIssues.some(i => i.id?.includes('heavy'))
      ? 'Heavy base image detected — switch to Alpine to cut image size by ~90%.'
      : 'Stack weight has minor improvements available.';

  // Dependency Health — based on dependency count
  const depScore = scoreCategory(depIssues);
  const depSummary = depIssues.length === 0
    ? 'Dependency footprint is reasonable.'
    : depIssues.some(i => i.impact === 'MEDIUM' || i.impact === 'HIGH')
      ? 'Large number of npm packages increases cold-start and build time.'
      : 'Slight excess in dependencies detected.';

  // Region Efficiency — special: check if region is green
  const regionIssues = issues.filter(i => i.id?.startsWith('region'));
  const regionScore = scoreCategory(regionIssues, 60);
  const greenRegions = ['us-west-2', 'eu-west-1', 'eu-north-1', 'ca-central-1', 'europe-north1', 'us-central1', 'swedencentral'];
  const isGreen = config?.region && greenRegions.some(r => config.region!.includes(r));
  const regionSummary = regionIssues.length === 0
    ? isGreen
      ? `${config?.region || 'Your region'} runs on high-renewable energy.`
      : 'No region data — consider moving to a carbon-neutral region.'
    : 'Deployed in a high-carbon region — migration can cut CO₂ by 40%.';

  return [
    {
      id: 'cicd',
      label: 'CI/CD Efficiency',
      score: ciScore,
      grade: gradeFromScore(ciScore),
      summary: ciSummary,
      issueCount: ciIssues.length,
    },
    {
      id: 'compute',
      label: 'Compute Strategy',
      score: computeScore,
      grade: gradeFromScore(computeScore),
      summary: computeSummary,
      issueCount: computeIssues.length + storageIssues.length,
    },
    {
      id: 'stack',
      label: 'Stack Weight',
      score: stackScore,
      grade: gradeFromScore(stackScore),
      summary: stackSummary,
      issueCount: dockerIssues.length,
    },
    {
      id: 'deps',
      label: 'Dependency Health',
      score: depScore,
      grade: gradeFromScore(depScore),
      summary: depSummary,
      issueCount: depIssues.length,
    },
    {
      id: 'region',
      label: 'Region Efficiency',
      score: regionScore,
      grade: gradeFromScore(regionScore),
      summary: regionSummary,
      issueCount: regionIssues.length,
    },
  ];
}

export function calculateScore(issues: Issue[]): {
  score: number;
  label: 'Low Impact' | 'Moderate Impact' | 'High Impact';
} {
  let score = 100;
  for (const issue of issues) {
    score -= ISSUE_WEIGHTS[issue.impact];
  }
  score = Math.max(0, Math.min(100, score));

  let label: 'Low Impact' | 'Moderate Impact' | 'High Impact';
  if (score >= 75) label = 'Low Impact';
  else if (score >= 45) label = 'Moderate Impact';
  else label = 'High Impact';

  return { score, label };
}

// Helper: Calculate energy cost and time savings based on actual repo metrics
function calculateDynamicMetrics(
  config: DeploymentConfig,
  issues: Issue[],
  repoMetrics?: RepoMetrics
): {
  energyCost: string;
  timeSavedPerMonth: string;
  bandwidthSaved: string;
  estimatedRequestsPerMonth: number;
} {
  const actualMonthlyCommits = repoMetrics?.monthlyCommits && repoMetrics.monthlyCommits > 0
    ? repoMetrics.monthlyCommits
    : (config.ciFrequency === 'every-push' ? 90 : config.ciFrequency === 'pr-only' ? 25 : 12);

  const stars = repoMetrics?.stars ?? 0;
  const estimatedMonthlyRequests = Math.max(stars * 500, 5000);

  // Time savings from CI optimization: ~2 min per run if we add branch filters
  const ciTimePerRun = 4; // minutes
  const hasCIProblem = issues.some(i => i.category === 'ci-cd');
  const timeSavedPerRun = hasCIProblem ? 2 : 0;
  const totalTimeSaved = timeSavedPerRun * actualMonthlyCommits; // minutes per month

  // Bandwidth savings from image optimization: assume 15% reduction per month
  const repoSizeKB = repoMetrics?.repoSize ?? 500;
  const monthlyDataTransfer = estimatedMonthlyRequests * (repoSizeKB / 100); // estimate based on requests
  const bandwidthSavedKB = issues.some(i => i.id?.includes('assets-unoptimized'))
    ? monthlyDataTransfer * 0.25 // 25% reduction with WebP + lazy loading
    : 0;

  // Energy cost: kWh → $/kWh (US avg ~$0.12)
  const electricityRate = 0.12; // $/kWh
  const estimatedKWhBeforeCI = (50 * 4 * actualMonthlyCommits) / 1000 * 0.35; // 50W runner
  const estimatedKWhAfter = estimatedKWhBeforeCI * 0.3; // 70% reduction with optimization
  const energyCostSavings = (estimatedKWhBeforeCI - estimatedKWhAfter) * electricityRate;

  return {
    energyCost: `$${energyCostSavings.toFixed(2)}`,
    timeSavedPerMonth: `${totalTimeSaved.toFixed(0)} min`,
    bandwidthSaved: `${(bandwidthSavedKB / 1024).toFixed(1)} MB`,
    estimatedRequestsPerMonth: estimatedMonthlyRequests,
  };
}

export function calculateBeforeAfter(
  config: DeploymentConfig,
  issues: Issue[],
  repoMetrics?: RepoMetrics
): { before: BeforeAfterState; after: BeforeAfterState } {

  const hasCI        = config.cicdTool !== 'None';
  const ciEveryPush  = config.ciFrequency === 'every-push';
  const isVercel     = config.cloudProvider === 'Vercel' || config.cloudService?.includes('Vercel');
  const isAlwaysOnVM = (config.cloudService === 'EC2' || config.cloudService === 'Compute Engine' ||
                        config.cloudService === 'Droplet' || config.cloudService === 'VPS / Bare Metal' ||
                        config.cloudService === 'Heroku Dyno') && !config.isServerless && !isVercel;

  // ── Determine if using Vercel and map to GCP region for carbon data ────────
  let carbonIntensity = DEFAULT_CARBON_INTENSITY;
  let instanceWatts = EC2_DEFAULT_WATTS;
  let ec2HourlyRate = EC2_DEFAULT_HOURLY;

  if (isVercel) {
    // Vercel: map region to GCP equivalent for carbon data
    const vercelRegion = (config.region || '').toLowerCase().replace(/\s+/g, '');
    const gcpRegion = VERCEL_REGIONS_TO_GCP[vercelRegion] || 'us-central1';
    carbonIntensity = REGION_CARBON_INTENSITY[gcpRegion] ?? DEFAULT_CARBON_INTENSITY;
    instanceWatts = VERCEL_EDGE_POWER_WATTS; // Vercel edge is very efficient
  } else {
    // AWS EC2
    const instanceKey = (config.instanceType || '').toLowerCase().trim();
    ec2HourlyRate = EC2_HOURLY_RATES[instanceKey] ?? EC2_DEFAULT_HOURLY;
    const instanceFamily = instanceKey.split('.')[0];
    instanceWatts  = EC2_WATTS[instanceFamily] ?? EC2_DEFAULT_WATTS;
    const region = (config.region || '').toLowerCase().replace(/\s+/g, '-');
    carbonIntensity = REGION_CARBON_INTENSITY[region] ?? DEFAULT_CARBON_INTENSITY;
  }

  // ── Real monthly commit count (from GitHub Stats API) ─────────────────────
  // Falls back to frequency-based estimate if API call returned 0 (new repos / 202)
  const actualMonthlyCommits = repoMetrics?.monthlyCommits && repoMetrics.monthlyCommits > 0
    ? repoMetrics.monthlyCommits
    : (ciEveryPush ? 90 : config.ciFrequency === 'pr-only' ? 25 : 12);

  // ── GitHub Actions is FREE for public repos ───────────────────────────────
  // Source: https://docs.github.com/en/billing/managing-billing-for-github-actions
  const isPublicRepo   = !(repoMetrics?.isPrivate ?? false);
  const ghActionsIsFree = isPublicRepo && config.cicdTool === 'GitHub Actions';

  // ── Actual workflow count from issue title ────────────────────────────────
  const parseIssueNum = (id: string): number => {
    const issue = issues.find(i => i.id === id);
    if (!issue) return 0;
    const m = issue.title.match(/(\d+)/);
    return m ? parseInt(m[1]) : 0;
  };
  const hasCICost  = issues.some(i => i.category === 'ci-cd');
  const hasAlwaysOnIssue = issues.some(i => i.id?.includes('always-on') || i.id?.includes('vm'));

  const workflowCount = parseIssueNum('ci-many-workflows') || (hasCICost ? 2 : (hasCI ? 1 : 0));
  const depCount      = parseIssueNum('assets-many-deps');
  const imageCount    = parseIssueNum('assets-unoptimized-images');

  // ── Compute hours ──────────────────────────────────────────────────────────
  const beforeComputeHours = isAlwaysOnVM ? 720 : 50;
  const afterComputeHours  = hasAlwaysOnIssue ? 48 : beforeComputeHours;

  // ── CI runs ───────────────────────────────────────────────────────────────
  const beforeCIRuns = hasCI ? actualMonthlyCommits : 0;
  const afterCIRuns  = (hasCICost && ciEveryPush)
    ? Math.round(actualMonthlyCommits * 0.25) // branch filters ≈ 75% reduction
    : beforeCIRuns;

  // ── REAL CI cost ──────────────────────────────────────────────────────────
  // GitHub Actions: free for public repos. Private: $0.008/min, avg ~4min/workflow run.
  // Other CI tools (CircleCI, etc.) use similar hosted-runner pricing.
  const minutesPerRun   = 4; // conservative average across workflow types
  const ciRatePerMinute = ghActionsIsFree ? 0 : 0.008; // $/min for private repos
  const beforeCICost = hasCI
    ? workflowCount * beforeCIRuns * minutesPerRun * ciRatePerMinute
    : 0;
  const afterCICost = hasCI
    ? workflowCount * afterCIRuns * minutesPerRun * ciRatePerMinute
    : 0;

  // ── Real request estimate from GitHub stars ──────────────────────────────
  const stars = repoMetrics?.stars ?? 0;
  const estimatedMonthlyRequests = Math.max(stars * 500, 5000); // floor at 5k req/month

  // ── Cost calculation based on platform ──────────────────────────────────
  let beforeEC2Cost = 0;
  let afterEC2Cost = 0;
  let lambdaBaseCost = 0;

  if (isVercel) {
    // Vercel: Pro plan ($20/mo) + function costs ($0.15 per 1M over 1M free)
    const vercelFunctionCost = Math.max(0, (estimatedMonthlyRequests - 1_000_000) / 1_000_000 * VERCEL_FUNCTION_COST_PER_1M);
    beforeEC2Cost = VERCEL_BASE_COST + vercelFunctionCost;
    afterEC2Cost = VERCEL_BASE_COST + vercelFunctionCost * 0.8; // CI optimization reduces traffic slightly
  } else if (isAlwaysOnVM) {
    // AWS EC2: hourly rate × 720 hours
    beforeEC2Cost = ec2HourlyRate * 720;
    afterEC2Cost = hasAlwaysOnIssue ? ec2HourlyRate * 48 : beforeEC2Cost;
  } else {
    // AWS Lambda: $0.20/1M requests after 1M free + compute time
    const lambdaRequestCost = Math.max(0, (estimatedMonthlyRequests - 1_000_000) / 1_000_000 * 0.20);
    const lambdaComputeCost = estimatedMonthlyRequests * 0.0000002; // ~200ms at 128MB
    lambdaBaseCost = Math.max(lambdaRequestCost + lambdaComputeCost, 0.50);
  }

  // ── Real CO2: power × hours × carbon intensity ────────────────────────────
  let beforeEC2CO2 = 0;
  let afterEC2CO2 = 0;

  if (isVercel) {
    // Vercel: edge functions consume ~2W per request, ~100ms per request on average
    // 5000 req/month × 0.1s × 2W / 3600s per hour / 1000 = kWh
    const estimatedComputeHours = (estimatedMonthlyRequests * 0.1) / 3600; // seconds to hours
    beforeEC2CO2 = (instanceWatts * estimatedComputeHours) / 1000 * carbonIntensity;
    // CI optimizations don't significantly reduce Vercel's already-low footprint
    afterEC2CO2 = beforeEC2CO2 * 0.95;
  } else if (isAlwaysOnVM) {
    // EC2: watts × hours / 1000 = kWh, × carbon intensity = kgCO2
    beforeEC2CO2 = (instanceWatts * 720) / 1000 * carbonIntensity;
    afterEC2CO2  = hasAlwaysOnIssue
      ? (instanceWatts * 48) / 1000 * carbonIntensity
      : beforeEC2CO2;
  } else {
    // Lambda/serverless: ~50 active compute hours per month
    beforeEC2CO2 = (instanceWatts * 50) / 1000 * carbonIntensity;
    afterEC2CO2 = beforeEC2CO2;
  }

  // CI CO2: GitHub runners in US-East, 50W per runner
  // (GitHub Actions is still physical compute even if free-to-user)
  const beforeCICO2 = hasCI
    ? (GH_ACTIONS_RUNNER_WATTS * workflowCount * beforeCIRuns * minutesPerRun) / 60 / 1000
      * GH_ACTIONS_RUNNER_REGION_INTENSITY
    : 0;
  const afterCICO2 = hasCI
    ? (GH_ACTIONS_RUNNER_WATTS * workflowCount * afterCIRuns * minutesPerRun) / 60 / 1000
      * GH_ACTIONS_RUNNER_REGION_INTENSITY
    : 0;

  // CDN / asset CO2 (heuristic — no real traffic data available without analytics)
  const imageCDNCost = imageCount > 0 ? Math.min((imageCount / 50) * 0.40, 3.00) : 0;
  const imageCDNCO2  = imageCDNCost * 0.03; // CDN transfer ~30g CO2 per $ of bandwidth

  // ── TOTALS ────────────────────────────────────────────────────────────────
  const beforeCostNum = parseFloat(
    (beforeEC2Cost + lambdaBaseCost + beforeCICost + imageCDNCost).toFixed(2)
  );
  const afterCostNum = parseFloat(
    Math.max(afterEC2Cost + lambdaBaseCost * 0.7 + afterCICost + imageCDNCost * 0.4, 0.50).toFixed(2)
  );

  const beforeCO2Num = parseFloat((beforeEC2CO2 + beforeCICO2 + imageCDNCO2).toFixed(2));
  const afterCO2Num  = parseFloat(Math.max(afterEC2CO2 + afterCICO2 + imageCDNCO2 * 0.4, 0.01).toFixed(2));

  // ── Calculate dynamic metrics based on repo analysis ──────────────────────
  const dynamicMetrics = calculateDynamicMetrics(config, issues, repoMetrics);

  // ── No issues: before === after ───────────────────────────────────────────
  if (issues.length === 0) {
    return {
      before: {
        monthlyComputeHours: beforeComputeHours,
        monthlyCIRuns: beforeCIRuns,
        estimatedMonthlyCost: `$${beforeCostNum.toFixed(2)}`,
        estimatedMonthlyCO2: `${beforeCO2Num.toFixed(2)}kg`,
        energySavings: '$0.00',
        timeSaved: '0 min',
        bandwidthSaved: '0 MB',
        monthlyRequests: dynamicMetrics.estimatedRequestsPerMonth,
        label: 'before'
      },
      after: {
        monthlyComputeHours: beforeComputeHours,
        monthlyCIRuns: beforeCIRuns,
        estimatedMonthlyCost: `$${beforeCostNum.toFixed(2)}`,
        estimatedMonthlyCO2: `${beforeCO2Num.toFixed(2)}kg`,
        energySavings: '$0.00',
        timeSaved: '0 min',
        bandwidthSaved: '0 MB',
        monthlyRequests: dynamicMetrics.estimatedRequestsPerMonth,
        label: 'after'
      },
    };
  }

  return {
    before: {
      monthlyComputeHours: beforeComputeHours,
      monthlyCIRuns: beforeCIRuns,
      estimatedMonthlyCost: `$${beforeCostNum.toFixed(2)}`,
      estimatedMonthlyCO2: `${beforeCO2Num.toFixed(1)}kg`,
      energySavings: '$0.00',
      timeSaved: '0 min',
      bandwidthSaved: '0 MB',
      monthlyRequests: dynamicMetrics.estimatedRequestsPerMonth,
      label: 'before',
    },
    after: {
      monthlyComputeHours: afterComputeHours,
      monthlyCIRuns: afterCIRuns,
      estimatedMonthlyCost: `$${afterCostNum.toFixed(2)}`,
      estimatedMonthlyCO2: `${afterCO2Num.toFixed(1)}kg`,
      energySavings: dynamicMetrics.energyCost,
      timeSaved: dynamicMetrics.timeSavedPerMonth,
      bandwidthSaved: dynamicMetrics.bandwidthSaved,
      monthlyRequests: dynamicMetrics.estimatedRequestsPerMonth,
      label: 'after',
    },
  };
}
