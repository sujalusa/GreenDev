import { Issue } from '@/types';

interface RepoFile {
  path: string;
  type: string;
}

export function analyzeAssets(
  packageJsonContent: string | null,
  repoTree: RepoFile[]
): Issue[] {
  const issues: Issue[] = [];

  // Check dependency count
  if (packageJsonContent) {
    try {
      const pkg = JSON.parse(packageJsonContent);
      const deps = Object.keys(pkg.dependencies || {}).length;
      const devDeps = Object.keys(pkg.devDependencies || {}).length;
      const total = deps + devDeps;

      if (total > 50) {
        issues.push({
          id: 'assets-many-deps',
          category: 'dependencies',
          title: `${total} npm dependencies detected`,
          description:
            'Large dependency trees increase bundle size, npm install time in CI, and the attack surface of your project. Audit with `npm prune` and remove unused packages.',
          impact: total > 100 ? 'MEDIUM' : 'LOW',
        });
      }
    } catch {
      // Malformed package.json
    }
  }

  // Check for image-heavy public folder
  const imageFiles = repoTree.filter((f) =>
    /\.(png|jpg|jpeg|gif|bmp|tiff)$/i.test(f.path)
  );
  if (imageFiles.length > 10) {
    issues.push({
      id: 'assets-unoptimized-images',
      category: 'assets',
      title: `${imageFiles.length} unoptimized image assets detected`,
      description:
        'Large unoptimized images increase page load time and transfer data costs. Use modern formats (WebP, AVIF) and enable lazy loading for images below the fold.',
      impact: 'MEDIUM',
      affectedFiles: imageFiles.slice(0, 5).map((f) => f.path),
    });
  }

  return issues;
}
