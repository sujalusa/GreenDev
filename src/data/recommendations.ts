import { Recommendation } from '@/types';

export const RECOMMENDATIONS_CATALOG: Recommendation[] = [
  {
    id: 'ci-branch-filter',
    issueId: 'ci-trigger-all-branches',
    title: 'Add branch filters to CI triggers',
    description:
      'Filter CI triggers to only run on main/develop branches or pull requests. This prevents wasting compute on experimental or feature branches.',
    impact: 'HIGH',
    effort: 'LOW',
    estimatedCO2Saved: '0.3kg/month',
    estimatedCostSaved: '$2.40/month',
    implementationGuide: `Add a branch filter to your push trigger:\n\`\`\`yaml\non:\n  push:\n    branches: [main, develop]\n  pull_request:\n    branches: [main]\n\`\`\`\nSee: GitHub Actions docs — Workflow syntax for filtering.`,
  },
  {
    id: 'ci-path-filter',
    issueId: 'ci-no-path-filter',
    title: 'Add path filters to skip docs-only changes',
    description:
      'Path filters prevent CI from running when only markdown, docs, or config files change — saving minutes of compute per commit.',
    impact: 'MEDIUM',
    effort: 'LOW',
    implementationGuide: `\`\`\`yaml\non:\n  push:\n    paths-ignore:\n      - '**.md'\n      - 'docs/**'\n      - '.github/**'\n\`\`\``,
  },
  {
    id: 'ci-caching',
    issueId: 'ci-no-caching',
    title: 'Cache dependencies in CI pipelines',
    description:
      'Caching node_modules or pip packages between runs saves 2–5 minutes of install time per run. High-frequency CI benefits most.',
    impact: 'HIGH',
    effort: 'LOW',
    cloudAlternative: 'Use S3 as a cache backend for self-hosted runners.',
    estimatedCO2Saved: '0.5kg/month',
    estimatedCostSaved: '$3.60/month',
    implementationGuide: `\`\`\`yaml\n- uses: actions/cache@v3\n  with:\n    path: ~/.npm\n    key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}\n    restore-keys: |\n      \${{ runner.os }}-node-\n\`\`\``,
  },
  {
    id: 'ec2-to-lambda',
    issueId: 'compute-always-on-vm',
    title: 'Migrate always-on EC2 to AWS Lambda',
    description:
      'Lambda charges only for actual invocations with millisecond billing. A student project with ~50 hours of active usage per month costs ~$0.20 vs $8.50+ for an always-on t3.micro.',
    impact: 'HIGH',
    effort: 'MEDIUM',
    cloudAlternative: 'AWS Lambda + API Gateway',
    estimatedCO2Saved: '0.8kg/month',
    estimatedCostSaved: '$8.50/month',
    implementationGuide: `Deploy your backend as Lambda functions:\n\`\`\`bash\nnpm install -g serverless\nserverless create --template aws-nodejs-typescript\n# Configure handler.ts, serverless.yml\nserverless deploy\n\`\`\`\nSee: AWS Lambda developer guide.`,
  },
  {
    id: 'ec2-to-static',
    issueId: 'compute-always-on-vm',
    title: 'Move frontend to S3 + CloudFront',
    description:
      'If your frontend is a React/Next.js static export, serve it from S3 + CloudFront instead of EC2. This eliminates the compute layer entirely for static assets.',
    impact: 'HIGH',
    effort: 'LOW',
    cloudAlternative: 'S3 Static Website + CloudFront CDN',
    estimatedCostSaved: '$8.00/month',
    implementationGuide: `\`\`\`bash\n# Build your Next.js app\nnpx next build && npx next export\n# Upload to S3\naws s3 sync out/ s3://your-bucket-name --delete\n# Invalidate CloudFront\naws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"\n\`\`\``,
  },
  {
    id: 'docker-alpine',
    issueId: 'docker-heavy-base',
    title: 'Switch to Alpine or slim Docker base images',
    description:
      'Replace ubuntu/debian base images with alpine variants. node:20-alpine is ~50MB vs node:latest at ~1.1GB — a 95% size reduction.',
    impact: 'HIGH',
    effort: 'LOW',
    estimatedCO2Saved: '0.4kg/month',
    estimatedCostSaved: '$1.80/month',
    implementationGuide: `\`\`\`dockerfile\n# Before\nFROM node:latest\n\n# After\nFROM node:20-alpine\n\`\`\`\nFor Python:\n\`\`\`dockerfile\nFROM python:3.12-slim\n\`\`\``,
  },
  {
    id: 'docker-multistage',
    issueId: 'docker-no-multistage',
    title: 'Add multi-stage Docker builds',
    description:
      'Multi-stage builds separate the build environment from the runtime image. Build tools, dev dependencies, and source files stay out of the final image.',
    impact: 'HIGH',
    effort: 'MEDIUM',
    implementationGuide: `\`\`\`dockerfile\n# Stage 1: Build\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Stage 2: Runtime\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCMD ["node", "dist/index.js"]\n\`\`\``,
  },
  {
    id: 'docker-ignore',
    issueId: 'docker-no-dockerignore',
    title: 'Add a .dockerignore file',
    description:
      'Without .dockerignore, COPY . . copies node_modules, .git history, and .env files into the build context. This slows builds and risks leaking secrets.',
    impact: 'MEDIUM',
    effort: 'LOW',
    implementationGuide: `Create \`.dockerignore\` at the project root:\n\`\`\`\nnode_modules\n.git\n.env*\ndist\nbuild\n*.log\n.DS_Store\n\`\`\``,
  },
  {
    id: 'region-optimize',
    issueId: 'region-high-carbon',
    title: 'Migrate to a greener AWS region',
    description:
      'AWS us-west-2 (Oregon), eu-north-1 (Stockholm), eu-west-1 (Ireland), and ca-central-1 use >90% renewable energy. Moving to these can cut cloud carbon by 15–30%.',
    impact: 'MEDIUM',
    effort: 'MEDIUM',
    cloudAlternative: 'us-west-2 (primary), eu-north-1 (EU users)',
    estimatedCO2Saved: '0.6kg/month',
    implementationGuide: `Update your region in AWS config:\n\`\`\`env\nAWS_REGION=us-west-2\n\`\`\`\nAlso update Terraform, CDK, or CloudFormation region parameters.`,
  },
  {
    id: 'instance-downsize',
    issueId: 'compute-oversized-instance',
    title: 'Downsize to t3.micro or go serverless',
    description:
      'Student projects rarely sustain the CPU/memory needed for m5, c5, or r5 instances. t3.micro ($0.0104/hr) or Lambda eliminates idle costs entirely.',
    impact: 'MEDIUM',
    effort: 'LOW',
    cloudAlternative: 'EC2 t3.micro or AWS Lambda',
    estimatedCostSaved: '$12.00/month',
    implementationGuide: `\`\`\`bash\n# Resize via AWS CLI\naws ec2 modify-instance-attribute \\\n  --instance-id i-xxx \\\n  --instance-type t3.micro\n# Or: Stop instance → Change instance type in console → Start\n\`\`\``,
  },
  {
    id: 'asset-compression',
    issueId: 'assets-unoptimized-images',
    title: 'Convert images to WebP and enable lazy loading',
    description:
      'WebP is 25–35% smaller than JPEG and 26% smaller than PNG. Combined with lazy loading, this reduces initial page weight and CDN transfer costs significantly.',
    impact: 'MEDIUM',
    effort: 'LOW',
    implementationGuide: `In Next.js, use the built-in Image component:\n\`\`\`tsx\nimport Image from 'next/image'\n<Image src="/hero.webp" width={800} height={600} loading="lazy" alt="Hero" />\n\`\`\`\nFor non-Next.js: use sharp or ImageMagick to batch convert:\n\`\`\`bash\nsharp -i input.png -o output.webp\n\`\`\``,
  },
  {
    id: 'lazy-loading',
    issueId: 'assets-many-deps',
    title: 'Add code splitting and lazy loading for heavy routes',
    description:
      'Large JavaScript bundles increase time-to-interactive and waste bandwidth. Dynamic imports defer non-critical code until needed.',
    impact: 'LOW',
    effort: 'LOW',
    implementationGuide: `\`\`\`tsx\n// Instead of:\nimport HeavyChart from './HeavyChart'\n\n// Use:\nconst HeavyChart = dynamic(() => import('./HeavyChart'), { loading: () => <Skeleton /> })\n\`\`\``,
  },
];

export function matchRecommendations(issues: { id: string }[]): Recommendation[] {
  const issueIds = new Set(issues.map((i) => i.id));
  return RECOMMENDATIONS_CATALOG.filter((r) => issueIds.has(r.issueId)).slice(0, 5);
}
