import { Issue, BeforeAfterState, DeploymentConfig, Subscore } from '@/types';

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

export function calculateBeforeAfter(
  config: DeploymentConfig,
  issues: Issue[]
): { before: BeforeAfterState; after: BeforeAfterState } {
  // If no issues detected, before = after (nothing to optimize)
  if (issues.length === 0) {
    const baseComputeHours = (config.cloudService === 'EC2' || config.cloudService === 'Compute Engine') && !config.isServerless ? 720 : 50;
    const hasCI = config.cicdTool !== 'None';
    const ciEveryPush = config.ciFrequency === 'every-push';
    const baseCost = ((config.cloudService === 'EC2' || config.cloudService === 'Compute Engine') && !config.isServerless) ? 18.4 : 4.2;
    const ciCost = hasCI && ciEveryPush ? 4.0 : 0;
    const totalCost = baseCost + ciCost;
    const baseCO2 = ((config.cloudService === 'EC2' || config.cloudService === 'Compute Engine') && !config.isServerless) ? 2.4 : 0.6;

    return {
      before: {
        monthlyComputeHours: baseComputeHours,
        monthlyCIRuns: hasCI ? (ciEveryPush ? 120 : 30) : 0,
        estimatedMonthlyCost: `$${totalCost.toFixed(2)}`,
        estimatedMonthlyCO2: `${baseCO2.toFixed(1)}kg`,
        label: 'before',
      },
      after: {
        monthlyComputeHours: baseComputeHours,
        monthlyCIRuns: hasCI ? (ciEveryPush ? 120 : 30) : 0,
        estimatedMonthlyCost: `$${totalCost.toFixed(2)}`,
        estimatedMonthlyCO2: `${baseCO2.toFixed(1)}kg`,
        label: 'after',
      },
    };
  }

  // If issues exist, calculate potential savings
  const hasAlwaysOnIssue = issues.some(i => i.id?.includes('always-on') || i.id?.includes('vm'));
  const hasCICost = issues.some(i => i.category === 'ci-cd');
  const hasCI = config.cicdTool !== 'None';
  const ciEveryPush = config.ciFrequency === 'every-push';

  // BEFORE state (current)
  const beforeComputeHours = hasAlwaysOnIssue ? 720 : 50;
  const beforeCIRuns = hasCI ? (ciEveryPush ? 120 : 30) : 0;

  let beforeCostNum = hasAlwaysOnIssue ? 18.4 : 4.2;
  if (hasCI && ciEveryPush) beforeCostNum += 4.0;
  const beforeCO2Num = hasAlwaysOnIssue ? 2.4 : 0.6;

  // AFTER state (with optimizations for detected issues)
  const afterComputeHours = hasAlwaysOnIssue ? 48 : beforeComputeHours;
  const afterCIRuns = hasCICost && ciEveryPush ? 30 : beforeCIRuns;

  let afterCostNum = hasAlwaysOnIssue ? 3.2 : beforeCostNum;
  if (hasCICost && ciEveryPush) afterCostNum = Math.max(afterCostNum - 2.5, 1.0);
  const afterCO2Num = hasAlwaysOnIssue ? 0.4 : beforeCO2Num * 0.6;

  return {
    before: {
      monthlyComputeHours: beforeComputeHours,
      monthlyCIRuns: beforeCIRuns,
      estimatedMonthlyCost: `$${beforeCostNum.toFixed(2)}`,
      estimatedMonthlyCO2: `${beforeCO2Num.toFixed(1)}kg`,
      label: 'before',
    },
    after: {
      monthlyComputeHours: afterComputeHours,
      monthlyCIRuns: afterCIRuns,
      estimatedMonthlyCost: `$${afterCostNum.toFixed(2)}`,
      estimatedMonthlyCO2: `${afterCO2Num.toFixed(1)}kg`,
      label: 'after',
    },
  };
}
