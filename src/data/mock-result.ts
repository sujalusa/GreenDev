import { AnalysisResult } from '@/types';

export const MOCK_RESULT: AnalysisResult = {
  scanId: 'demo-scan-001',
  repoUrl: 'https://github.com/demo/student-project',
  repoName: 'student-project',
  scannedAt: new Date().toISOString(),
  sustainabilityScore: 42,
  scoreLabel: 'High Impact',
  subscores: [
    {
      id: 'cicd',
      label: 'CI/CD Efficiency',
      score: 40,
      grade: 'F',
      summary: 'High-energy triggers detected — every push runs the full pipeline.',
      issueCount: 2,
    },
    {
      id: 'compute',
      label: 'Compute Strategy',
      score: 20,
      grade: 'F',
      summary: 'Always-on VM running 720 hrs/month even when idle.',
      issueCount: 2,
    },
    {
      id: 'stack',
      label: 'Stack Weight',
      score: 60,
      grade: 'C',
      summary: 'Heavy base image detected — switch to Alpine to cut image size by ~90%.',
      issueCount: 1,
    },
    {
      id: 'deps',
      label: 'Dependency Health',
      score: 80,
      grade: 'B',
      summary: 'Dependency footprint is reasonable for this project size.',
      issueCount: 0,
    },
    {
      id: 'region',
      label: 'Region Efficiency',
      score: 50,
      grade: 'C',
      summary: 'Deployed in a higher-carbon region — migration can cut CO₂ by 40%.',
      issueCount: 1,
    },
  ],
  issues: [
    {
      id: 'compute-always-on-ec2',
      category: 'compute',
      title: 'Always-on EC2 instance runs 24/7',
      description:
        'A student project typically has ~50 active usage hours per month, but an always-on EC2 instance runs 720 hours. That is 14× more compute than needed.',
      impact: 'HIGH',
      estimatedMonthlyCO2: '0.8kg',
      estimatedMonthlyCost: '$8.50',
    },
    {
      id: 'ci-no-caching',
      category: 'ci-cd',
      title: 'Dependencies are not cached between CI runs',
      description:
        'No caching steps found in your workflow. Re-downloading dependencies on every run adds ~2–5 minutes of compute time and significant energy usage.',
      impact: 'HIGH',
      affectedFiles: ['.github/workflows/ci.yml'],
      estimatedMonthlyCO2: '0.5kg',
      estimatedMonthlyCost: '$3.60',
    },
    {
      id: 'docker-heavy-base',
      category: 'storage',
      title: 'Heavy Docker base image detected',
      description:
        'Your Dockerfile uses a full OS base image (node:latest) which can be 1.1GB. Switching to alpine reduces it by 95%.',
      impact: 'HIGH',
      affectedFiles: ['Dockerfile'],
      estimatedMonthlyCO2: '0.4kg',
      estimatedMonthlyCost: '$1.80',
    },
    {
      id: 'ci-trigger-all-branches',
      category: 'ci-cd',
      title: 'CI pipeline runs on every push to all branches',
      description:
        'Your GitHub Actions workflow triggers on every push without a branch filter, wasting compute minutes on experimental branches.',
      impact: 'MEDIUM',
      affectedFiles: ['.github/workflows/ci.yml', '.github/workflows/deploy.yml'],
      estimatedMonthlyCO2: '0.3kg',
      estimatedMonthlyCost: '$2.40',
    },
    {
      id: 'region-high-carbon',
      category: 'compute',
      title: 'ap-southeast-1 has higher carbon intensity',
      description:
        'This region draws from an energy mix with less renewable content. Migrating to us-west-2 or eu-north-1 can reduce carbon footprint by 15–30%.',
      impact: 'MEDIUM',
      estimatedMonthlyCO2: '0.6kg',
    },
  ],
  recommendations: [
    {
      id: 'ec2-to-lambda',
      issueId: 'compute-always-on-ec2',
      title: 'Migrate always-on EC2 to AWS Lambda',
      description:
        'Lambda charges only for actual invocations. A student project saves ~$8.50/month and 0.8kg CO2 by going serverless.',
      impact: 'HIGH',
      effort: 'MEDIUM',
      cloudAlternative: 'AWS Lambda + API Gateway',
      estimatedCO2Saved: '0.8kg/month',
      estimatedCostSaved: '$8.50/month',
      implementationGuide:
        '```bash\nnpm install -g serverless\nserverless create --template aws-nodejs-typescript\nserverless deploy\n```',
    },
    {
      id: 'ci-caching',
      issueId: 'ci-no-caching',
      title: 'Cache dependencies in CI pipelines',
      description:
        'Adding actions/cache saves 2–5 minutes per run. At 120 runs/month, that is 4–10 hours of compute saved.',
      impact: 'HIGH',
      effort: 'LOW',
      estimatedCO2Saved: '0.5kg/month',
      estimatedCostSaved: '$3.60/month',
      implementationGuide:
        '```yaml\n- uses: actions/cache@v3\n  with:\n    path: ~/.npm\n    key: ${{ runner.os }}-node-${{ hashFiles(\'**/package-lock.json\') }}\n```',
    },
    {
      id: 'docker-alpine',
      issueId: 'docker-heavy-base',
      title: 'Switch to Alpine Docker base image',
      description:
        'node:20-alpine is ~50MB vs node:latest at 1.1GB. Faster builds, lower registry storage costs.',
      impact: 'HIGH',
      effort: 'LOW',
      estimatedCO2Saved: '0.4kg/month',
      estimatedCostSaved: '$1.80/month',
      implementationGuide: '```dockerfile\n# Before\nFROM node:latest\n\n# After\nFROM node:20-alpine\n```',
    },
    {
      id: 'ci-branch-filter',
      issueId: 'ci-trigger-all-branches',
      title: 'Add branch filters to CI triggers',
      description:
        'Filter to only run on main and pull requests. Eliminates CI runs on feature branches that are not ready.',
      impact: 'MEDIUM',
      effort: 'LOW',
      estimatedCO2Saved: '0.3kg/month',
      estimatedCostSaved: '$2.40/month',
      implementationGuide:
        '```yaml\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n```',
    },
    {
      id: 'region-optimize',
      issueId: 'region-high-carbon',
      title: 'Migrate to us-west-2 (Oregon)',
      description:
        'Oregon runs on >90% renewable energy. Same latency for US users, 15–30% lower carbon per compute hour.',
      impact: 'MEDIUM',
      effort: 'MEDIUM',
      cloudAlternative: 'us-west-2',
      estimatedCO2Saved: '0.6kg/month',
      implementationGuide: '```env\nAWS_REGION=us-west-2\n```',
    },
  ],
  before: {
    monthlyComputeHours: 720,
    monthlyCIRuns: 120,
    estimatedMonthlyCost: '$18.40',
    estimatedMonthlyCO2: '2.4kg',
    energySavings: '$0.00',
    timeSaved: '0 min',
    bandwidthSaved: '0 MB',
    monthlyRequests: 5000,
    label: 'before',
  },
  after: {
    monthlyComputeHours: 48,
    monthlyCIRuns: 30,
    estimatedMonthlyCost: '$3.20',
    estimatedMonthlyCO2: '0.4kg',
    energySavings: '$2.40',
    timeSaved: '240 min',
    bandwidthSaved: '12.5 MB',
    monthlyRequests: 5000,
    label: 'after',
  },
  report: {
    plainEnglish: `Your project scored 42 out of 100 — placing it in the "High Impact" tier. This means there are several straightforward changes that could significantly reduce your environmental footprint and monthly cloud costs.

The biggest opportunity is your EC2 setup. Right now, your server runs 24/7, even when no one is using it. For a student project, this wastes roughly 670 hours of compute per month. Switching to AWS Lambda lets your code run only when someone actually uses it — and the cost drops from ~$18/month to under $4.

Your CI/CD pipeline also has room to improve. Without dependency caching, every automated test re-downloads all of your packages from scratch. That adds 3–5 minutes to every run. A simple cache step in your GitHub Actions file fixes this in about 10 minutes of work.

Keep it up — these changes are not just green, they are also good engineering. A leaner deployment is faster to build, cheaper to run, and more maintainable in the long run.`,
    technical: `Static analysis of this repository identified three primary infrastructure inefficiencies: (1) always-on EC2 compute running at 100% utilization during off-peak hours, (2) unoptimized CI/CD pipeline lacking dependency caching and branch filtering, and (3) a monolithic Docker base image that inflates build times and registry costs.

Recommended migration path: Replace the EC2 instance with AWS Lambda functions behind API Gateway for backend services, and serve the frontend from S3 + CloudFront for static assets. This architecture eliminates idle compute entirely and reduces per-request costs by ~85%.

For the CI/CD layer, implement actions/cache with npm package-lock.json hashing, add branch and path filters to reduce trigger frequency, and consolidate workflows to reduce runner startup overhead. Expected savings: 60–70% reduction in CI compute minutes.

Docker optimization: adopt a multi-stage build pattern using node:20-alpine as the runtime base, with .dockerignore excluding node_modules and .git. Expected image size reduction: 90%+.`,
    sustainability: `This project's current architecture contributes approximately 2.4kg of CO2 per month — equivalent to driving a car about 9 kilometers. While small in absolute terms, it represents a 6x higher footprint than the optimized equivalent, primarily driven by idle EC2 compute during the ~670 hours per month when no users are active.

The highest-impact environmental action is migrating from always-on EC2 to event-driven serverless compute (AWS Lambda). This aligns with AWS's Shared Responsibility Model for Sustainability. AWS's global infrastructure now runs on 90%+ renewable energy in Tier 1 regions like us-west-2, further amplifying per-request carbon reductions.

Implementing all five recommendations would reduce this project's monthly CO2 from 2.4kg to 0.4kg — an 83% reduction. Combined with migrating to the us-west-2 region, the effective carbon footprint per active user drops to near-negligible levels.

The team can take action this weekend: cache your CI dependencies, add a .dockerignore, and switch your EC2 to Lambda. These three changes alone reduce CO2 by 1.7kg/month and save $14.30 per month.`,
    pitch: `GreenDev Coach analyzed our GitHub repo and AWS deployment and uncovered $15.20 in monthly waste and 2.4kg of avoidable CO2 emissions — every single month. Our EC2 server was running 24/7 even though it is only actively used 7% of the time. Our Docker images were a gigabyte when they could be 50 megabytes. And our CI pipeline was re-downloading 47 npm packages on every single push.

With five targeted changes — all AWS-native, all implementable in a weekend — GreenDev Coach projects we can cut our cloud costs by 83% and our carbon footprint by the same margin. Lambda instead of EC2. Alpine instead of Ubuntu. Cache steps in GitHub Actions. These are not compromises; they are best practices that happen to be green.

GreenDev Coach makes these insights accessible to every student developer, without needing to be an AWS architect to understand them. That is the pitch.`,
  },
  detectedStack: {
    hasDockerfile: true,
    hasGithubActions: true,
    ciTriggerCount: 4,
    estimatedImageSize: '1.2GB',
    frontendFramework: 'React',
    dependencyCount: 47,
  },
};
