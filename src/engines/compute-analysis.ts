import { Issue } from '@/types';
import { DeploymentConfig } from '@/types';

const TIER1_REGIONS = new Set(['us-west-2', 'eu-west-1', 'eu-north-1', 'ca-central-1']);
const TIER2_REGIONS = new Set(['us-east-1', 'us-east-2', 'ap-southeast-2']);
const TIER3_REGIONS = new Set(['ap-southeast-1', 'ap-northeast-1', 'ap-northeast-2', 'sa-east-1', 'eu-central-1']);

export function analyzeRegion(region: string, cloudProvider?: string): Issue[] {
  const issues: Issue[] = [];

  if (region === 'Auto-Detect' || region === 'Auto-Detect / Unknown') return issues;

  // ── Vercel regions are globally efficient — no warnings ──
  if (cloudProvider === 'Vercel' || !cloudProvider) {
    // Vercel uses edge locations worldwide with efficient GCP infrastructure
    // global-edge is fine, regional edges are optimized
    return issues;
  }

  // ── AWS-specific region analysis ──
  if (TIER3_REGIONS.has(region)) {
    issues.push({
      id: 'region-high-carbon',
      category: 'compute',
      title: `${region} has higher carbon intensity than greener alternatives`,
      description: `The ${region} AWS region draws from an energy mix with less renewable content compared to Tier 1 regions like us-west-2 or eu-north-1. Migrating to a greener region can cut cloud carbon footprint by 15–30% for the same workload.`,
      impact: 'MEDIUM',
      estimatedMonthlyCO2: '0.6kg',
    });
  } else if (!TIER1_REGIONS.has(region) && !TIER2_REGIONS.has(region)) {
    issues.push({
      id: 'region-no-data',
      category: 'compute',
      title: `No published sustainability data for ${region}`,
      description: `AWS has not published renewable energy commitments for ${region}. Consider moving to a region with known green energy commitments.`,
      impact: 'LOW',
    });
  }

  return issues;
}

const OVERSIZED_INSTANCE_PREFIXES = ['m5', 'm6', 'm7', 'c5', 'c6', 'c7', 'r5', 'r6', 'r7', 'x1', 'x2'];

export function analyzeCompute(config: DeploymentConfig): Issue[] {
  const issues: Issue[] = [];
  const { cloudService, cloudProvider, isServerless, instanceType } = config;

  // ── Vercel: no compute issues (already serverless with per-request pricing) ──
  if (cloudProvider === 'Vercel' || cloudService?.includes('Vercel')) {
    // Vercel is inherently serverless and efficient — no compute warnings
    return issues;
  }

  // Always-on VM (EC2 or Compute Engine)
  if ((cloudService === 'EC2' || cloudService === 'Compute Engine') && !isServerless) {
    issues.push({
      id: 'compute-always-on-vm',
      category: 'compute',
      title: 'Always-on EC2 instance runs 24/7',
      description:
        'A student project typically has ~50 active usage hours per month, but an always-on EC2 instance runs 720 hours. That is 14× more compute than needed. Migrating to AWS Lambda or ECS Fargate (scale-to-zero) eliminates idle waste.',
      impact: 'HIGH',
      estimatedMonthlyCO2: '0.8kg',
      estimatedMonthlyCost: '$8.50',
    });
  }

  // Oversized instance
  if (instanceType) {
    const prefix = instanceType.split('.')[0];
    if (OVERSIZED_INSTANCE_PREFIXES.some((p) => prefix.startsWith(p))) {
      issues.push({
        id: 'compute-oversized-instance',
        category: 'compute',
        title: `${instanceType} is a production-grade instance for a student project`,
        description:
          'Production instance families (m5, c5, r5, etc.) are designed for sustained high-throughput workloads. A student project rarely needs this. Downsizing to t3.micro or going serverless can save 60–80% on compute costs.',
        impact: 'MEDIUM',
        estimatedMonthlyCost: '$12.00',
        estimatedMonthlyCO2: '0.5kg',
      });
    }
  }

  // Containers without serverless
  if ((cloudService === 'ECS' || cloudService === 'Azure App Service') && !isServerless) {
    issues.push({
      id: 'compute-container-no-serverless',
      category: 'compute',
      title: 'ECS running on EC2 instances instead of Fargate',
      description:
        'Using EC2-backed ECS instead of ECS Fargate means you pay for idle EC2 capacity. Fargate provides serverless container execution with per-second billing and no idle cost.',
      impact: 'MEDIUM',
      estimatedMonthlyCost: '$5.00',
    });
  }

  return issues;
}
