import { Issue } from '@/types';
import yaml from 'js-yaml';

interface WorkflowFile {
  path: string;
  content: string;
}

export function analyzeCICD(workflowFiles: WorkflowFile[]): Issue[] {
  const issues: Issue[] = [];
  if (workflowFiles.length === 0) return issues;

  const affectedFiles = workflowFiles.map((f) => f.path);
  let hasCaching = false;
  let triggerOnAllBranches = false;
  let missingPathFilter = false;

  for (const wf of workflowFiles) {
    try {
      const parsed = yaml.load(wf.content) as Record<string, unknown>;
      const on = parsed?.on as Record<string, unknown> | undefined;

      if (on?.push !== undefined) {
        const push = on.push as Record<string, unknown> | null;
        if (!push || !push.branches) triggerOnAllBranches = true;
        if (!push || !push.paths) missingPathFilter = true;
      }

      const content = wf.content.toLowerCase();
      if (content.includes('actions/cache') || content.includes('cache: ') || content.includes("cache: 'npm'")) {
        hasCaching = true;
      }
    } catch {
      // Malformed YAML — skip
    }
  }

  if (triggerOnAllBranches) {
    issues.push({
      id: 'ci-trigger-all-branches',
      category: 'ci-cd',
      title: 'CI pipeline runs on every push to all branches',
      description:
        'Your GitHub Actions workflow triggers on every push without a branch filter. This means CI runs even for pushes to experimental branches, wasting compute minutes and energy.',
      impact: workflowFiles.length > 1 ? 'HIGH' : 'MEDIUM',
      affectedFiles,
      estimatedMonthlyCO2: '0.3kg',
      estimatedMonthlyCost: '$2.40',
    });
  }

  if (missingPathFilter) {
    issues.push({
      id: 'ci-no-path-filter',
      category: 'ci-cd',
      title: 'No path filters — CI runs on documentation-only changes',
      description:
        'Without path filters, your CI pipeline triggers even when you update a README or add a comment. Adding paths filters prevents unnecessary runs.',
      impact: 'MEDIUM',
      affectedFiles,
    });
  }

  if (!hasCaching) {
    issues.push({
      id: 'ci-no-caching',
      category: 'ci-cd',
      title: 'Dependencies are not cached between CI runs',
      description:
        'No caching steps found in your workflow. Re-downloading dependencies on every run adds ~2–5 minutes of compute time and significant energy usage.',
      impact: 'HIGH',
      affectedFiles,
      estimatedMonthlyCO2: '0.5kg',
      estimatedMonthlyCost: '$3.60',
    });
  }

  if (workflowFiles.length > 3) {
    issues.push({
      id: 'ci-many-workflows',
      category: 'ci-cd',
      title: `${workflowFiles.length} separate workflow files detected`,
      description:
        'Having many workflow files increases maintenance overhead and can lead to redundant jobs running in parallel. Consider consolidating.',
      impact: 'LOW',
      affectedFiles,
    });
  }

  return issues;
}
