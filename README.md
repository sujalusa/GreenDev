# GreenDev Coach

A sustainability analysis tool for developers. Analyze your GitHub repository and AWS deployment configuration to receive AI-powered recommendations for reducing cloud waste, costs, and carbon footprint.

## Overview

GreenDev Coach helps student developers and teams identify inefficiencies in their cloud infrastructure and code practices. By analyzing your repository structure, CI/CD pipelines, Docker configuration, and AWS deployment choices, the tool generates actionable recommendations tailored to your stack.

The system uses deterministic heuristic analysis combined with AWS Bedrock (Claude Sonnet) to provide contextualized, actionable insights without requiring access to billing data or deep AWS integrations.

## Features

- **Repository Analysis**: Scans GitHub repos for CI/CD patterns, Dockerfile optimization opportunities, and dependency bloat
- **AWS Architecture Assessment**: Evaluates deployment choices and recommends more efficient alternatives (Lambda vs EC2, App Runner, etc.)
- **Sustainability Scoring**: Generates a 0-100 sustainability score with estimated impact of recommended changes
- **Multi-Format Reports**: Creates four report variants - plain English, technical, sustainability-focused, and pitch-ready summaries
- **Effort-Impact Ranking**: Prioritizes recommendations by implementation effort vs environmental impact
- **Carbon-Aware Region Suggestions**: Identifies AWS regions with higher renewable energy percentages
- **Report Export**: Share or download analysis results as shareable links or documents

## Architecture

**Frontend**: Next.js 16 with Tailwind CSS and Radix UI components

**Analysis Engine**: TypeScript-based modular engines that parse Dockerfiles, YAML workflows, and manifest files (package.json, requirements.txt, etc.)

**AI Layer**: AWS Bedrock with Claude Sonnet 4.6 for report generation. Includes pgvector caching to avoid redundant inferences on similar analysis patterns.

**Backend**: Supabase PostgreSQL with Row Level Security for data isolation and persistence

**Deployment**: Frontend on Vercel, analysis workers on AWS Lambda/Fargate triggered by SQS events

## Getting Started

### Prerequisites

- Node.js 18+
- AWS account with Bedrock access
- Supabase project

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-org/greendev-coach
cd greendev-coach
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Copy `.env.example` to `.env.local` and populate:

```
# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# GitHub (optional for public repos, required for private)
GITHUB_TOKEN=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

4. Initialize database

Run the SQL from `supabase.sql` in your Supabase SQL editor to create required tables.

5. Start development server

```bash
npm run dev
```

Server runs on http://localhost:3000

## How It Works

1. User submits a GitHub repository URL and deployment configuration
2. Analysis worker fetches repository structure and key files (Dockerfile, CI/CD configs, manifests)
3. Deterministic heuristic engine evaluates the code for inefficiencies
4. Rule engine generates structured findings JSON with severity and impact scores
5. AWS Bedrock generates contextualized narrative summaries from the findings
6. Results are cached using pgvector embeddings to avoid redundant AI calls
7. Frontend streams the report back to the user in real-time

## Key Analysis Rules

- **CI Efficiency**: Detects redundant CI triggers lacking path filtering
- **Docker Optimization**: Identifies oversized base images and missing `.dockerignore` files
- **Compute Configuration**: Flags always-on instances that could be serverless
- **Caching**: Detects missing dependency caching in build pipelines
- **Regional Carbon Intensity**: Recommends regions based on grid carbon footprint

## Development

### Project Structure

```
greendev-coach/
  src/
    app/              - Next.js pages and API routes
    components/       - React components
    lib/              - Utilities and external integrations
    engines/          - Analysis heuristics (ci, docker, asset, etc)
    prompts/          - AWS Bedrock prompt templates
    types/            - TypeScript interfaces
    data/             - Recommendation catalog
  public/             - Static assets
```

### Running Tests

```bash
npm run lint
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

## Performance Targets

- GitHub parsing: under 10 seconds
- Analysis execution: under 5 seconds
- AI report generation: under 10 seconds
- Total end-to-end: under 30 seconds

## Deployment

**Frontend**: Deploy to Vercel with automatic GitHub integration

```bash
vercel deploy
```

**Backend**: Workers deploy via AWS CDK and GitHub Actions

## Rate Limiting

The service enforces 10 analyses per IP per hour to prevent abuse. Authenticated users can request higher limits.

## Security

- All inputs validated server-side
- No execution of user code or tests
- GitHub public API only (no OAuth required for public repos)
- Secrets managed via AWS Secrets Manager in production
- Row Level Security enforced on all database tables
- S3 reports delivered via auto-expiring presigned URLs

## Known Limitations

- Analysis is heuristic-based and provides estimates, not precise measurements
- Requires public GitHub repositories for scanning
- Assumes standard AWS service patterns - non-standard architectures may not be detected
- Requires explicit deployment configuration input - does not query live AWS accounts

## License

MIT License. Built for the Amazon Sustainability Track Hackathon.

## Contributing

Pull requests welcome. Please ensure code follows the existing style and includes tests for new analysis rules.
