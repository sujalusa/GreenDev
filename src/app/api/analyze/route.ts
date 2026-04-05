import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl } from '@/lib/utils';
import { fetchRepoTree, fetchFileContent, fetchRepoMeta, fetchCommitActivity } from '@/lib/github-client';
import { analyzeCICD } from '@/engines/ci-analysis';
import { analyzeDocker } from '@/engines/docker-analysis';
import { analyzeAssets } from '@/engines/asset-analysis';
import { analyzeCompute, analyzeRegion } from '@/engines/compute-analysis';
import { calculateScore, calculateBeforeAfter, calculateSubscores } from '@/engines/scorer';
import { matchRecommendations } from '@/data/recommendations';
import { invokeClaude } from '@/lib/bedrock';
import { buildPlainEnglishPrompt, FALLBACK_TEXT as PE_FALLBACK } from '@/prompts/plain-english';
import { buildTechnicalPrompt, FALLBACK_TEXT as TECH_FALLBACK } from '@/prompts/technical';
import { buildSustainabilityPrompt, FALLBACK_TEXT as SUST_FALLBACK } from '@/prompts/sustainability';
import { buildPitchPrompt, FALLBACK_TEXT as PITCH_FALLBACK } from '@/prompts/pitch';
import { buildCodeAnalysisPrompt } from '@/prompts/code-analysis';
import { MOCK_RESULT } from '@/data/mock-result';
import { supabaseAdmin } from '@/lib/supabase';
import { ScanRequest, AnalysisResult, Issue } from '@/types';

export const maxDuration = 45;

async function invokeClaudeSafe(prompt: string, fallback: string): Promise<string> {
  try {
    return await invokeClaude(prompt);
  } catch (err) {
    console.error('[Bedrock] Invocation failed:', err);
    return fallback;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScanRequest;
    const { repoUrl, deploymentConfig } = body;

    // 1. Validate
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid GitHub URL. Must be https://github.com/{owner}/{repo}' },
        { status: 400 }
      );
    }

    if (!deploymentConfig?.cloudProvider || !deploymentConfig?.region) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing required deployment configuration fields.' },
        { status: 400 }
      );
    }

    // 2. Rate limit check
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    try {
      const { data: rateData } = await (supabaseAdmin as any)
        .from('rate_limits')
        .select('count, window_start')
        .eq('ip', ip)
        .single();

      const RATE_LIMIT_MAX = 50;          // scans per window
      const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

      if (rateData) {
        const typedRateData = rateData as unknown as { count: number; window_start: string | Date };
        const windowStart = new Date(typedRateData.window_start);
        const windowExpiry = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
        if (windowStart > windowExpiry && typedRateData.count >= RATE_LIMIT_MAX) {
          return NextResponse.json(
            { success: false, data: null, error: 'Rate limit reached. Try again in an hour.' },
            { status: 429 }
          );
        }
        if (windowStart <= windowExpiry) {
          // Window expired — reset
          await (supabaseAdmin as any).from('rate_limits').upsert({ ip, count: 1, window_start: new Date() });
        } else {
          await (supabaseAdmin as any).from('rate_limits').update({ count: typedRateData.count + 1 }).eq('ip', ip);
        }
      } else {
        await (supabaseAdmin as any).from('rate_limits').insert({ ip, count: 1, window_start: new Date() });
      }
    } catch {
      // Rate limit failure is non-critical — continue
    }

    const { owner, repo } = parsed;
    const scanId = crypto.randomUUID();

    // Use mock if flag set
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      return NextResponse.json({ success: true, data: { ...MOCK_RESULT, scanId, isMock: true }, error: null });
    }

    // 3. Fetch repo data
    console.log(`[API /analyze] Target: ${owner}/${repo}`);
    const [treeResult, metaResult, commitActivityResult] = await Promise.all([
      fetchRepoTree(owner, repo),
      fetchRepoMeta(owner, repo),
      fetchCommitActivity(owner, repo),
    ]);
    console.log(`[API /analyze] Tree fetch: ${treeResult.success ? 'SUCCESS' : 'FAILED'}`);

    if (!treeResult.success) {
      return NextResponse.json({ success: false, data: null, error: treeResult.error }, { status: 422 });
    }

    const tree = treeResult.data || [];
    const filePaths = tree.map((f) => f.path);

    // 4. Fetch key files
    const workflowPaths = filePaths.filter(
      (p) => p.startsWith('.github/workflows/') && (p.endsWith('.yml') || p.endsWith('.yaml'))
    );
    const hasDockerfile = filePaths.includes('Dockerfile');
    const hasDockerignore = filePaths.includes('.dockerignore');
    const packageJsonPath = filePaths.includes('package.json') ? 'package.json' : null;

    const [workflowContents, dockerfileResult, packageJsonResult] = await Promise.all([
      Promise.all(
        workflowPaths.slice(0, 5).map(async (p) => {
          const r = await fetchFileContent(owner, repo, p);
          return r.success ? { path: p, content: r.data! } : null;
        })
      ).then((results) => results.filter(Boolean) as { path: string; content: string }[]),
      hasDockerfile ? fetchFileContent(owner, repo, 'Dockerfile') : Promise.resolve({ success: false, data: null, error: null }),
      packageJsonPath ? fetchFileContent(owner, repo, packageJsonPath) : Promise.resolve({ success: false, data: null, error: null }),
    ]);

    // 4b. Identify and fetch source files for AI code analysis
    const sourceFileMatchers = [
      (p: string) => p.startsWith('src/app/api/') && (p.endsWith('.ts') || p.endsWith('.js')),
      (p: string) => p.startsWith('src/lib/') && (p.endsWith('.ts') || p.endsWith('.js')),
      (p: string) => p.startsWith('pages/api/') && (p.endsWith('.ts') || p.endsWith('.js')),
      (p: string) => p.startsWith('lib/') && (p.endsWith('.ts') || p.endsWith('.js')),
      (p: string) => p.startsWith('api/') && (p.endsWith('.ts') || p.endsWith('.js') || p.endsWith('.py')),
      (p: string) => p.startsWith('src/routes/') && (p.endsWith('.ts') || p.endsWith('.js')),
    ];
    const sourceFilePaths = filePaths
      .filter((p) => sourceFileMatchers.some((fn) => fn(p)))
      .slice(0, 6);

    const sourceFiles = (
      await Promise.all(
        sourceFilePaths.map(async (p) => {
          const r = await fetchFileContent(owner, repo, p);
          return r.success && r.data ? { path: p, content: r.data } : null;
        })
      )
    ).filter(Boolean) as { path: string; content: string }[];

    // 5. Run all analysis engines + AI code analysis in parallel
    const [ciIssues, dockerIssues, assetIssues, computeIssues, regionIssues, codeAnalysisRaw] = await Promise.all([
      Promise.resolve(analyzeCICD(workflowContents)),
      Promise.resolve(analyzeDocker(dockerfileResult.data, hasDockerignore)),
      Promise.resolve(analyzeAssets(packageJsonResult.data, tree)),
      Promise.resolve(analyzeCompute(deploymentConfig as any)),
      Promise.resolve(analyzeRegion(deploymentConfig.region, deploymentConfig.cloudProvider)),
      sourceFiles.length > 0
        ? invokeClaudeSafe(
            buildCodeAnalysisPrompt(sourceFiles, repoUrl, deploymentConfig.frontendFramework, metaResult.data?.language),
            '[]'
          )
        : Promise.resolve('[]'),
    ]);

    // Parse AI-detected issues
    let aiIssues: Issue[] = [];
    try {
      const parsed = JSON.parse(codeAnalysisRaw);
      if (Array.isArray(parsed)) {
        aiIssues = parsed
          .filter((item: any) => item && typeof item.title === 'string')
          .map((item: any) => ({
            id: `ai-${(item.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`,
            category: (['compute', 'assets', 'dependencies', 'ci-cd', 'storage', 'networking'].includes(item.category) ? item.category : 'compute') as Issue['category'],
            title: item.title as string,
            description: (item.description as string) || '',
            impact: (['HIGH', 'MEDIUM', 'LOW'].includes(item.impact) ? item.impact : 'LOW') as Issue['impact'],
            affectedFiles: Array.isArray(item.affectedFiles) ? item.affectedFiles : undefined,
          }));
      }
    } catch {
      // JSON parse failed — skip AI issues
    }

    const allIssues: Issue[] = [
      ...ciIssues,
      ...dockerIssues,
      ...assetIssues,
      ...computeIssues,
      ...regionIssues,
      ...aiIssues,
    ];

    console.log(`[API /analyze] Found ${allIssues.length} issues across all engines.`);

    // 6. Score, subscores, and match recommendations
    const { score, label } = calculateScore(allIssues);
    const subscores = calculateSubscores(allIssues, deploymentConfig);
    const recommendations = matchRecommendations(allIssues);

    const repoMetrics = {
      monthlyCommits: commitActivityResult.data?.monthlyCommits ?? 0,
      isPrivate: metaResult.data?.isPrivate ?? false,
      stars: metaResult.data?.stars ?? 0,
    };
    const { before, after } = calculateBeforeAfter(deploymentConfig as any, allIssues, repoMetrics);

    // 7. Build partial result for prompts
    const partialResult: Omit<AnalysisResult, 'report'> = {
      scanId,
      repoUrl,
      repoName: `${owner}/${repo}`,
      scannedAt: new Date().toISOString(),
      sustainabilityScore: score,
      scoreLabel: label,
      subscores,
      issues: allIssues,
      recommendations,
      before,
      after,
      detectedStack: {
        cloudProvider: deploymentConfig?.cloudProvider || 'Auto-Detect / Unknown',
        hasDockerfile,
        hasGithubActions: workflowPaths.length > 0,
        ciTriggerCount: workflowPaths.length,
        frontendFramework: deploymentConfig.frontendFramework,
        dependencyCount: packageJsonResult.data
          ? (() => {
              try {
                const p = JSON.parse(packageJsonResult.data!);
                return (
                  Object.keys(p.dependencies || {}).length +
                  Object.keys(p.devDependencies || {}).length
                );
              } catch {
                return undefined;
              }
            })()
          : undefined,
        repoLanguage: metaResult.data?.language,
        repoTopics: metaResult.data?.topics,
      },
    };

    console.log('[API /analyze] Invoking Bedrock for reports...');
    const startTimeBedrock = Date.now();
    const [plainEnglish, technical, sustainability, pitch] = await Promise.all([
      invokeClaudeSafe(buildPlainEnglishPrompt(partialResult as AnalysisResult), PE_FALLBACK.replace('{score}', String(score)).replace('{count}', String(allIssues.length))),
      invokeClaudeSafe(buildTechnicalPrompt(partialResult as AnalysisResult), TECH_FALLBACK),
      invokeClaudeSafe(buildSustainabilityPrompt(partialResult as AnalysisResult), SUST_FALLBACK.replace('${0}', before.estimatedMonthlyCO2)),
      invokeClaudeSafe(buildPitchPrompt(partialResult as AnalysisResult), PITCH_FALLBACK),
    ]);
    console.log(`[API /analyze] Bedrock finished in ${Date.now() - startTimeBedrock}ms`);

    const result: AnalysisResult = {
      ...partialResult,
      report: { plainEnglish, technical, sustainability, pitch },
    };

    // 9. Persist to Supabase (non-blocking)
    (supabaseAdmin as any)
      .from('scans')
      .insert({
        id: scanId,
        repo_url: repoUrl,
        repo_name: result.repoName,
        deployment_config: deploymentConfig,
        result,
        score,
        score_label: label,
      })
      .then(({ error }: { error: any }) => {
        if (error) console.error('[Supabase] Failed to save scan:', error.message);
      });

    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err) {
    console.error('[API /analyze] Unhandled error:', err);
    return NextResponse.json(
      { success: false, data: null, error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
