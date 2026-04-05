'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, TrendingDown, ChevronDown, ChevronUp, Download, Leaf } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BackButton } from '@/components/layout/BackButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppState } from '@/lib/store';
import { Recommendation } from '@/types';

const EFFORT_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2 };
const IMPACT_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

type SortMode = 'impact' | 'effort' | 'savings';

function effortLabel(e: string) {
  if (e === 'LOW') return '< 1 hour';
  if (e === 'MEDIUM') return '1–4 hours';
  return '1–2 days';
}

function RecommendationCard({ rec, index, cloudProvider }: { rec: Recommendation; index: number; cloudProvider: string }) {
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card className={`overflow-hidden transition-opacity ${done ? 'opacity-50' : ''}`}>
        <div className="p-4 space-y-3">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => setDone(d => !d)}
              className="mt-0.5 shrink-0"
              aria-label={done ? 'Mark as undone' : 'Mark as done'}
            >
              <CheckCircle2
                className="w-5 h-5 transition-colors"
                style={{ color: done ? 'var(--color-success)' : 'var(--color-text-faint)' }}
              />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${done ? 'line-through' : ''}`} style={{ color: 'var(--color-text)' }}>
                  {rec.title}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="impact" level={rec.impact}>Impact: {rec.impact}</Badge>
                <Badge variant="effort" level={rec.effort}>Effort: {rec.effort}</Badge>
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)' }}>
                  <Clock className="w-3 h-3" />
                  {effortLabel(rec.effort)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm pl-8" style={{ color: 'var(--color-text-muted)' }}>{rec.description}</p>

          {/* Savings row */}
          {(rec.estimatedCO2Saved || rec.estimatedCostSaved) && (
            <div className="flex items-center gap-3 pl-8">
              {rec.estimatedCO2Saved && (
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-success)' }}>
                  <TrendingDown className="w-3.5 h-3.5" />
                  Saves {rec.estimatedCO2Saved} CO₂/mo
                </span>
              )}
              {rec.estimatedCostSaved && (
                <span className="text-xs font-medium" style={{ color: 'var(--color-gold)' }}>
                  · saves {rec.estimatedCostSaved}/mo
                </span>
              )}
            </div>
          )}

          {/* Cloud alternative */}
          {rec.cloudAlternative && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] ml-8" style={{ background: 'var(--color-primary-tint)' }}>
              <Leaf className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                {cloudProvider} alternative: {rec.cloudAlternative}
              </span>
            </div>
          )}

          {/* Implementation guide toggle */}
          {rec.implementationGuide && (
            <div className="pl-8">
              <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? 'Hide implementation guide' : 'Show implementation guide'}
              </button>
              {expanded && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 text-xs overflow-x-auto p-3 rounded-[var(--radius-md)] whitespace-pre-wrap"
                  style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text)' }}
                >
                  {rec.implementationGuide}
                </motion.pre>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default function RecommendationsPage() {
  const { scanResult } = useAppState();
  const router = useRouter();
  const [sort, setSort] = useState<SortMode>('impact');

  useEffect(() => {
    if (!scanResult) router.replace('/');
  }, [scanResult, router]);

  if (!scanResult) return null;

  const recs = [...scanResult.recommendations];

  if (sort === 'impact') {
    recs.sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);
  } else if (sort === 'effort') {
    recs.sort((a, b) => EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort]);
  } else {
    // savings: prefer those with CO₂ savings
    recs.sort((a, b) => {
      const aHasSavings = a.estimatedCO2Saved ? 1 : 0;
      const bHasSavings = b.estimatedCO2Saved ? 1 : 0;
      return bHasSavings - aHasSavings;
    });
  }

  const cloudProvider =
    scanResult.detectedStack?.cloudProvider &&
    scanResult.detectedStack.cloudProvider !== 'Auto-Detect / Unknown'
      ? scanResult.detectedStack.cloudProvider
      : 'Cloud';

  // Quick wins: LOW effort, HIGH or MEDIUM impact
  const quickWins = recs.filter(r => r.effort === 'LOW' && r.impact !== 'LOW');

  function handleExport() {
    const lines = recs.map((r, i) =>
      `${i + 1}. ${r.title} [Impact: ${r.impact}, Effort: ${r.effort}]\n   ${r.description}${r.implementationGuide ? '\n\n   Guide:\n   ' + r.implementationGuide : ''}`
    ).join('\n\n');
    const content = `GreenDev Coach — Action Plan\nRepository: ${scanResult!.repoName}\nScore: ${scanResult!.sustainabilityScore}/100\n\n${lines}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `greendev-action-plan-${scanResult!.repoName.replace('/', '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Results', href: '/results' },
          { label: 'Action Plan', href: '/recommendations' },
        ]}
      />
      <main id="main-content" className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <BackButton href="/results" label="Back to Results" />
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" /> Export Plan
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Action Plan
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {recs.length === 0
              ? `No issues found in ${scanResult.repoName} — great job keeping it green!`
              : `${recs.length} recommendation${recs.length > 1 ? 's' : ''} for ${scanResult.repoName} — check items off as you complete them.`
            }
          </p>
        </motion.div>

        {/* Quick wins callout */}
        {quickWins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-4" tinted>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
                ⚡ {quickWins.length} Quick Win{quickWins.length > 1 ? 's' : ''} Available
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                These are low-effort, high-impact fixes you can ship today:&nbsp;
                {quickWins.map(r => r.title).join(' · ')}
              </p>
            </Card>
          </motion.div>
        )}

        {/* Sort controls */}
        {recs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Sort by:</span>
            {(['impact', 'effort', 'savings'] as SortMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSort(mode)}
                className="px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors"
                style={{
                  background: sort === mode ? 'var(--color-primary)' : 'var(--color-surface-offset)',
                  color: sort === mode ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {/* Recommendation cards */}
        <div className="space-y-3">
          {recs.map((rec, i) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              index={i}
              cloudProvider={cloudProvider}
            />
          ))}
          {recs.length === 0 && (
            <Card className="p-8 text-center space-y-2">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
                ✓ Perfect Score!
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No issues detected. Your deployment is already well-optimized for sustainability.
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                Keep maintaining these best practices as your project grows!
              </p>
            </Card>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={() => router.push('/results')}>
            ← Back to Results
          </Button>
          <Button className="flex-1" onClick={() => router.push('/report')}>
            View AI Report →
          </Button>
        </div>
      </main>
    </div>
  );
}
