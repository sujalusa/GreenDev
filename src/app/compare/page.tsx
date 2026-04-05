'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, X, Minus, Leaf, Zap, DollarSign, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BackButton } from '@/components/layout/BackButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppState } from '@/lib/store';

interface FrameworkOption {
  id: string;
  name: string;
  type: string;
  bundleSize: string;
  coldStart: string;
  co2PerRequest: string;
  renderStrategy: string;
  caching: boolean;
  treeShaking: boolean;
  serverComponents: boolean;
  edgeDeploy: boolean;
  buildTime: string;
  monthlyEstCO2: string;
  greenScore: number;
  recommended: boolean;
  notes: string;
}

const FRAMEWORKS: FrameworkOption[] = [
  {
    id: 'nextjs',
    name: 'Next.js',
    type: 'Full-stack',
    bundleSize: '~80kB',
    coldStart: '< 50ms',
    co2PerRequest: '~0.002g',
    renderStrategy: 'SSR / SSG / ISR / Edge',
    caching: true,
    treeShaking: true,
    serverComponents: true,
    edgeDeploy: true,
    buildTime: '~30s',
    monthlyEstCO2: '0.18kg',
    greenScore: 92,
    recommended: true,
    notes: 'Automatic image/font optimisation, edge runtime, ISR reduces re-renders.',
  },
  {
    id: 'react',
    name: 'React (CRA / Vite)',
    type: 'SPA',
    bundleSize: '~140kB',
    coldStart: '~200ms',
    co2PerRequest: '~0.008g',
    renderStrategy: 'CSR only',
    caching: false,
    treeShaking: true,
    serverComponents: false,
    edgeDeploy: false,
    buildTime: '~45s',
    monthlyEstCO2: '0.72kg',
    greenScore: 54,
    recommended: false,
    notes: 'Ships full JS bundle on every visit. No built-in SSR or caching layer.',
  },
  {
    id: 'remix',
    name: 'Remix',
    type: 'Full-stack',
    bundleSize: '~95kB',
    coldStart: '~60ms',
    co2PerRequest: '~0.003g',
    renderStrategy: 'SSR + progressive',
    caching: true,
    treeShaking: true,
    serverComponents: false,
    edgeDeploy: true,
    buildTime: '~25s',
    monthlyEstCO2: '0.27kg',
    greenScore: 82,
    recommended: false,
    notes: 'Excellent progressive enhancement story. No static generation.',
  },
  {
    id: 'astro',
    name: 'Astro',
    type: 'Static + Islands',
    bundleSize: '~0kB*',
    coldStart: 'n/a',
    co2PerRequest: '~0.0005g',
    renderStrategy: 'Static + partial hydration',
    caching: true,
    treeShaking: true,
    serverComponents: true,
    edgeDeploy: true,
    buildTime: '~20s',
    monthlyEstCO2: '0.04kg',
    greenScore: 98,
    recommended: false,
    notes: 'Ships zero JS by default. Ideal for content sites. Needs adapters for dynamic routes.',
  },
  {
    id: 'svelte',
    name: 'SvelteKit',
    type: 'Full-stack',
    bundleSize: '~50kB',
    coldStart: '< 40ms',
    co2PerRequest: '~0.002g',
    renderStrategy: 'SSR / SSG / Edge',
    caching: true,
    treeShaking: true,
    serverComponents: false,
    edgeDeploy: true,
    buildTime: '~15s',
    monthlyEstCO2: '0.18kg',
    greenScore: 90,
    recommended: false,
    notes: 'Compiles to minimal vanilla JS. No virtual DOM overhead.',
  },
];

const METRICS: { key: keyof FrameworkOption; label: string; type: 'text' | 'bool' | 'score' }[] = [
  { key: 'type', label: 'Type', type: 'text' },
  { key: 'bundleSize', label: 'Initial Bundle', type: 'text' },
  { key: 'coldStart', label: 'Cold Start', type: 'text' },
  { key: 'renderStrategy', label: 'Render Strategy', type: 'text' },
  { key: 'buildTime', label: 'Avg Build Time', type: 'text' },
  { key: 'monthlyEstCO2', label: 'Est. CO₂/month', type: 'text' },
  { key: 'treeShaking', label: 'Tree Shaking', type: 'bool' },
  { key: 'serverComponents', label: 'Server Components', type: 'bool' },
  { key: 'caching', label: 'Built-in Caching', type: 'bool' },
  { key: 'edgeDeploy', label: 'Edge Deploy', type: 'bool' },
];

function GreenScore({ score }: { score: number }) {
  const color = score >= 85 ? 'var(--color-success)' : score >= 65 ? 'var(--color-gold)' : 'var(--color-high)';
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color }}>
        {score}
      </span>
      <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>Green Score</span>
    </div>
  );
}

function CellValue({ value, type }: { value: unknown; type: 'text' | 'bool' | 'score' }) {
  if (type === 'bool') {
    if (value === true) return <Check className="w-4 h-4 mx-auto" style={{ color: 'var(--color-success)' }} />;
    if (value === false) return <X className="w-4 h-4 mx-auto" style={{ color: 'var(--color-high)' }} />;
    return <Minus className="w-4 h-4 mx-auto" style={{ color: 'var(--color-text-faint)' }} />;
  }
  return <span className="text-xs tabular-nums" style={{ color: 'var(--color-text)' }}>{String(value)}</span>;
}

export default function ComparePage() {
  const { scanResult } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!scanResult) router.replace('/');
  }, [scanResult, router]);

  if (!scanResult) return null;

  // Detect current framework from scan
  const detectedFramework = scanResult.detectedStack?.frontendFramework?.toLowerCase() || '';
  const currentId = detectedFramework.includes('next') ? 'nextjs' :
    detectedFramework.includes('svelte') ? 'svelte' :
    detectedFramework.includes('vue') ? 'vue' :
    detectedFramework.includes('react') ? 'react' : null;

  const currentFW = currentId ? FRAMEWORKS.find(f => f.id === currentId) : null;
  const greenFW = FRAMEWORKS.find(f => f.id === 'astro') || FRAMEWORKS[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Results', href: '/results' },
          { label: 'Framework Compare', href: '/compare' },
        ]}
      />
      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <BackButton href="/results" label="Back to Results" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Framework Green Comparator
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Compare the environmental impact of popular frontend frameworks for <span className="font-mono">{scanResult.repoName}</span>.
          </p>
        </motion.div>

        {/* Current vs best */}
        {currentFW && currentFW.id !== 'astro' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-5" tinted>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
                    Migration opportunity detected
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Your current stack uses <strong style={{ color: 'var(--color-text)' }}>{currentFW.name}</strong> (Green Score: {currentFW.greenScore}).
                    Switching to <strong style={{ color: 'var(--color-text)' }}>Astro</strong> for content-heavy pages could reduce CO₂ by&nbsp;
                    <strong style={{ color: 'var(--color-success)' }}>
                      ~{(parseFloat(currentFW.monthlyEstCO2) - parseFloat(greenFW.monthlyEstCO2)).toFixed(2)}kg/month
                    </strong>.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-faint)' }}>Current</p>
                    <span className="text-lg font-bold" style={{ color: 'var(--color-high)', fontFamily: 'var(--font-display)' }}>{currentFW.greenScore}</span>
                  </div>
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
                  <div className="text-center">
                    <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-faint)' }}>Best option</p>
                    <span className="text-lg font-bold" style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)' }}>{greenFW.greenScore}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Score cards row */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {FRAMEWORKS.map(fw => (
            <Card
              key={fw.id}
              className="p-4 flex flex-col items-center gap-2 relative"
              elevated={fw.recommended}
            >
              {fw.id === currentId && (
                <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
                  Current
                </span>
              )}
              {fw.greenScore >= 90 && (
                <Leaf className="w-3.5 h-3.5 absolute top-2 left-2" style={{ color: 'var(--color-success)' }} />
              )}
              <p className="text-sm font-semibold text-center" style={{ color: 'var(--color-text)' }}>{fw.name}</p>
              <GreenScore score={fw.greenScore} />
              <p className="text-xs text-center" style={{ color: 'var(--color-text-faint)' }}>{fw.monthlyEstCO2} CO₂/mo</p>
            </Card>
          ))}
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="overflow-x-auto"
        >
          <Card className="overflow-hidden">
            <table className="w-full text-sm" style={{ minWidth: '640px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                  <th className="text-left p-3 text-xs font-semibold" style={{ color: 'var(--color-text-faint)', width: '160px' }}>
                    Metric
                  </th>
                  {FRAMEWORKS.map(fw => (
                    <th key={fw.id} className="p-3 text-center text-xs font-semibold" style={{ color: fw.id === currentId ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {fw.name}
                      {fw.id === currentId && <span className="block text-xs font-normal" style={{ color: 'var(--color-primary)' }}>← yours</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric, rowIdx) => (
                  <tr
                    key={metric.key}
                    style={{ borderBottom: '1px solid var(--color-divider)', background: rowIdx % 2 === 0 ? 'transparent' : 'var(--color-surface-offset)' }}
                  >
                    <td className="p-3 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      {metric.label}
                    </td>
                    {FRAMEWORKS.map(fw => (
                      <td key={fw.id} className="p-3 text-center">
                        <CellValue value={fw[metric.key]} type={metric.type} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>

        {/* Framework notes */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          {FRAMEWORKS.map(fw => (
            <Card key={fw.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{fw.name}</p>
                {fw.greenScore >= 88 && <Leaf className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />}
                {fw.id === currentId && <Badge variant="neutral">Your stack</Badge>}
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{fw.notes}</p>
            </Card>
          ))}
        </motion.div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => router.push('/results')}>
            ← Back to Results
          </Button>
          <Button className="flex-1" onClick={() => router.push('/recommendations')}>
            View Action Plan →
          </Button>
        </div>

        <p className="text-xs text-center pb-4" style={{ color: 'var(--color-text-faint)' }}>
          * Bundle sizes and CO₂ estimates are representative averages for a typical student project. Actual values vary by app size and usage pattern.
        </p>
      </main>
    </div>
  );
}
