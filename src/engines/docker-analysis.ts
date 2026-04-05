import { Issue } from '@/types';

const HEAVY_BASE_IMAGES = [
  /^FROM\s+ubuntu/im,
  /^FROM\s+debian(?!:.*slim)/im,
  /^FROM\s+node:latest/im,
  /^FROM\s+python:latest/im,
  /^FROM\s+node:(?!.*alpine|.*slim)/im,
  /^FROM\s+python:(?!.*slim|.*alpine)/im,
];

export function analyzeDocker(
  dockerfileContent: string | null,
  hasDockerignore: boolean
): Issue[] {
  const issues: Issue[] = [];
  if (!dockerfileContent) return issues;

  // 1. Heavy base image
  const isHeavyBase = HEAVY_BASE_IMAGES.some((re) => re.test(dockerfileContent));
  if (isHeavyBase) {
    issues.push({
      id: 'docker-heavy-base',
      category: 'storage',
      title: 'Heavy Docker base image detected',
      description:
        'Your Dockerfile uses a full OS base image (e.g., ubuntu, debian, or node:latest) which can be 500–1200MB. Switching to alpine or slim variants cuts image size by 60–80%, reducing build time and transfer costs.',
      impact: 'HIGH',
      affectedFiles: ['Dockerfile'],
      estimatedMonthlyCO2: '0.4kg',
      estimatedMonthlyCost: '$1.80',
    });
  }

  // 2. No multi-stage build
  const fromCount = (dockerfileContent.match(/^FROM\s+/gim) || []).length;
  if (fromCount === 1) {
    issues.push({
      id: 'docker-no-multistage',
      category: 'storage',
      title: 'No multi-stage Docker build',
      description:
        'Using a single-stage build copies build tools into the final image, bloating its size. Multi-stage builds discard build dependencies and ship only the runtime, shrinking images by 40–70%.',
      impact: 'HIGH',
      affectedFiles: ['Dockerfile'],
    });
  }

  // 3. COPY . . without .dockerignore
  if (!hasDockerignore && /^COPY\s+\.\s+\./im.test(dockerfileContent)) {
    issues.push({
      id: 'docker-no-dockerignore',
      category: 'storage',
      title: 'No .dockerignore — build context includes node_modules',
      description:
        'Your Dockerfile uses COPY . . without a .dockerignore file. This copies unnecessary files (node_modules, .git, .env) into the build context, slowing builds and increasing attack surface.',
      impact: 'MEDIUM',
      affectedFiles: ['Dockerfile'],
    });
  }

  // 4. Running as root
  if (!/^USER\s+/im.test(dockerfileContent)) {
    issues.push({
      id: 'docker-runs-as-root',
      category: 'storage',
      title: 'Container runs as root user',
      description:
        'No USER instruction found. Containers running as root are a security risk. Adding a non-root user is a best practice and required by some container registries.',
      impact: 'MEDIUM',
      affectedFiles: ['Dockerfile'],
    });
  }

  // 5. apt-get without --no-install-recommends
  if (/apt-get install(?!.*--no-install-recommends)/im.test(dockerfileContent)) {
    issues.push({
      id: 'docker-unnecessary-packages',
      category: 'dependencies',
      title: 'Missing --no-install-recommends flag in apt-get',
      description:
        'apt-get install without --no-install-recommends installs many optional packages. Adding this flag can reduce image size by 20–40%.',
      impact: 'LOW',
      affectedFiles: ['Dockerfile'],
    });
  }

  return issues;
}
