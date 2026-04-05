'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { BackButton } from '@/components/layout/BackButton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { useAppState } from '@/lib/store';
import { CloudProvider, CloudService, FrontendFramework, CICDTool, SimulatorConfig, SimulatorResult } from '@/types';
import { ArrowRight, RefreshCw, TrendingDown, TrendingUp, Minus, ChevronDown, Search, Check, Zap, FlaskConical } from 'lucide-react';

// ── Option data ──────────────────────────────────────────────────────────────

const PROVIDERS: { value: CloudProvider; label: string; icon: string }[] = [
  { value: 'AWS',                   label: 'AWS',              icon: '☁️' },
  { value: 'GCP',                   label: 'Google Cloud',     icon: '🌐' },
  { value: 'Azure',                 label: 'Azure',            icon: '🔷' },
  { value: 'Vercel',                label: 'Vercel',           icon: '▲' },
  { value: 'Netlify',               label: 'Netlify',          icon: '🟢' },
  { value: 'Railway',               label: 'Railway',          icon: '🚂' },
  { value: 'Render',                label: 'Render',           icon: '🔴' },
  { value: 'Fly.io',                label: 'Fly.io',           icon: '✈️' },
  { value: 'DigitalOcean',          label: 'DigitalOcean',     icon: '🌊' },
  { value: 'Heroku',                label: 'Heroku',           icon: '🟣' },
  { value: 'Cloudflare',            label: 'Cloudflare',       icon: '🟠' },
  { value: 'Self-hosted',           label: 'Self-hosted',      icon: '🖥️' },
  { value: 'Auto-Detect / Unknown', label: 'Unknown',          icon: '🔍' },
];

const SERVICES: Record<string, { value: string; label: string }[]> = {
  AWS:     [{ value: 'Lambda', label: 'Lambda' }, { value: 'App Runner', label: 'App Runner' }, { value: 'ECS', label: 'ECS' }, { value: 'Fargate', label: 'Fargate' }, { value: 'EC2', label: 'EC2' }, { value: 'Amplify', label: 'Amplify' }],
  GCP:     [{ value: 'Cloud Run', label: 'Cloud Run' }, { value: 'Cloud Functions', label: 'Functions' }, { value: 'App Engine', label: 'App Engine' }, { value: 'GKE', label: 'GKE' }, { value: 'Compute Engine', label: 'Compute Engine' }],
  Azure:   [{ value: 'Azure Functions', label: 'Functions' }, { value: 'Azure Container Apps', label: 'Container Apps' }, { value: 'Azure App Service', label: 'App Service' }, { value: 'AKS', label: 'AKS' }],
  Vercel:  [{ value: 'Vercel Functions', label: 'Functions' }, { value: 'Vercel Edge', label: 'Edge' }],
  Netlify: [{ value: 'Netlify Functions', label: 'Functions' }, { value: 'Netlify Edge', label: 'Edge' }],
  Railway: [{ value: 'Railway Service', label: 'Service' }],
  Render:  [{ value: 'Render Web Service', label: 'Web Service' }, { value: 'Render Static Site', label: 'Static Site' }],
  'Fly.io': [{ value: 'Fly Machine', label: 'Machine' }],
  DigitalOcean: [{ value: 'App Platform', label: 'App Platform' }, { value: 'DO Functions', label: 'Functions' }, { value: 'Droplet', label: 'Droplet' }],
  Heroku:  [{ value: 'Heroku Dyno', label: 'Dyno' }],
  Cloudflare: [{ value: 'Cloudflare Workers', label: 'Workers' }, { value: 'Cloudflare Pages', label: 'Pages' }],
  'Self-hosted': [{ value: 'VPS / Bare Metal', label: 'VPS / Bare Metal' }],
  'Auto-Detect / Unknown': [{ value: 'Auto-Detect / Unknown', label: 'Auto-detect' }],
};

const REGIONS: { value: string; label: string; tag?: string }[] = [
  { value: 'us-east-1',      label: 'AWS — US East (Virginia)' },
  { value: 'us-west-2',      label: 'AWS — US West (Oregon)',   tag: '🌿' },
  { value: 'eu-north-1',     label: 'AWS — EU (Stockholm)',     tag: '🌿' },
  { value: 'us-central1',    label: 'GCP — US (Iowa)',          tag: '🌿' },
  { value: 'europe-north1',  label: 'GCP — EU (Finland)',       tag: '🌿' },
  { value: 'eastus',         label: 'Azure — US East' },
  { value: 'swedencentral',  label: 'Azure — Sweden',           tag: '🌿' },
  { value: 'global-edge',    label: 'Global Edge (Vercel/CF)',  tag: '🌿' },
  { value: 'ap-southeast-1', label: 'Asia — Singapore' },
  { value: 'ap-northeast-1', label: 'Asia — Tokyo' },
  { value: 'Auto-Detect',    label: 'Unknown / Auto-detect' },
];

const FRAMEWORKS: { value: FrontendFramework; label: string; tag?: string }[] = [
  { value: 'Astro',          label: 'Astro',        tag: 'Greenest' },
  { value: 'SvelteKit',      label: 'SvelteKit',    tag: 'Tiny' },
  { value: 'Next.js',        label: 'Next.js' },
  { value: 'Remix',          label: 'Remix' },
  { value: 'Nuxt',           label: 'Nuxt' },
  { value: 'React',          label: 'React (CRA/Vite)' },
  { value: 'Vue',            label: 'Vue' },
  { value: 'Svelte',         label: 'Svelte' },
  { value: 'Angular',        label: 'Angular' },
  { value: 'Solid',          label: 'SolidJS' },
  { value: 'HTML / Vanilla', label: 'Vanilla JS', tag: 'Lightest' },
  { value: 'None',           label: 'No frontend' },
];

const CICD_TOOLS: { value: CICDTool; label: string }[] = [
  { value: 'GitHub Actions', label: 'GitHub Actions' },
  { value: 'GitLab CI',      label: 'GitLab CI' },
  { value: 'CircleCI',       label: 'CircleCI' },
  { value: 'Jenkins',        label: 'Jenkins' },
  { value: 'None',           label: 'None' },
  { value: 'Other',          label: 'Other' },
];

// ── Mini SearchableSelect ─────────────────────────────────────────────────────

function MiniSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; tag?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find((o) => o.value === value);
  const filtered = options.filter(
    (o) => o.label.toLowerCase().includes(search.toLowerCase()) || (o.tag || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-1 relative">
      <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] border text-sm text-left"
        style={{
          background: 'var(--color-surface)',
          borderColor: open ? 'var(--color-primary)' : 'var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        <span className="truncate">{selected?.label || 'Select…'}</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-1" style={{ color: 'var(--color-text-faint)' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full rounded-[var(--radius-md)] border shadow-xl overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', top: '100%', left: 0, marginTop: 2 }}
          >
            <div className="flex items-center gap-1.5 px-2.5 py-2 border-b" style={{ borderColor: 'var(--color-divider)' }}>
              <Search className="w-3 h-3 shrink-0" style={{ color: 'var(--color-text-faint)' }} />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…" className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: 'var(--color-text)' }} />
            </div>
            <div className="max-h-44 overflow-y-auto">
              {filtered.map((o) => (
                <button key={o.value} type="button"
                  onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left"
                  style={{
                    background: o.value === value ? 'var(--color-primary-tint)' : 'transparent',
                    color: 'var(--color-text)',
                  }}
                >
                  <span>{o.label}</span>
                  <div className="flex items-center gap-1.5">
                    {o.tag && <span className="text-[10px] px-1 rounded" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>{o.tag}</span>}
                    {o.value === value && <Check className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ConfigPanel ───────────────────────────────────────────────────────────────

function ConfigPanel({
  title,
  accent,
  config,
  onChange,
}: {
  title: string;
  accent: string;
  config: SimulatorConfig;
  onChange: (c: SimulatorConfig) => void;
}) {
  const services = SERVICES[config.cloudProvider] || SERVICES['Auto-Detect / Unknown'];

  function set<K extends keyof SimulatorConfig>(key: K, value: SimulatorConfig[K]) {
    const next = { ...config, [key]: value };
    if (key === 'cloudProvider') {
      const svc = (SERVICES[value as string] || SERVICES['Auto-Detect / Unknown'])[0];
      next.cloudService = svc.value as CloudService;
    }
    onChange(next);
  }

  return (
    <Card className="p-5 space-y-4 h-full" elevated>
      <div
        className="text-sm font-bold px-3 py-1.5 rounded-[var(--radius-sm)] inline-block"
        style={{ background: accent + '22', color: accent }}
      >
        {title}
      </div>

      {/* Provider chips */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Platform</p>
        <div className="flex flex-wrap gap-1.5">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => set('cloudProvider', p.value)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all"
              style={{
                background: config.cloudProvider === p.value ? accent + '22' : 'var(--color-surface)',
                borderColor: config.cloudProvider === p.value ? accent : 'var(--color-border)',
                color: config.cloudProvider === p.value ? accent : 'var(--color-text-muted)',
              }}
            >
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      <MiniSelect
        label="Service / Runtime"
        options={services}
        value={config.cloudService}
        onChange={(v) => set('cloudService', v as CloudService)}
      />

      <MiniSelect
        label="Region"
        options={REGIONS}
        value={config.region}
        onChange={(v) => set('region', v)}
      />

      <MiniSelect
        label="Frontend Framework"
        options={FRAMEWORKS}
        value={config.frontendFramework}
        onChange={(v) => set('frontendFramework', v as FrontendFramework)}
      />

      <MiniSelect
        label="CI/CD Tool"
        options={CICD_TOOLS}
        value={config.cicdTool}
        onChange={(v) => set('cicdTool', v as CICDTool)}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Compute model</p>
          <Toggle
            checked={config.isServerless}
            onChange={(v) => set('isServerless', v)}
            labelOff="Always-on"
            labelOn="Serverless"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Build caching</p>
          <Toggle
            checked={config.hasCaching}
            onChange={(v) => set('hasCaching', v)}
            labelOff="Off"
            labelOn="On"
          />
        </div>
      </div>
    </Card>
  );
}

// ── MetricRow ─────────────────────────────────────────────────────────────────

function MetricRow({
  label,
  current,
  alternative,
  betterWhen,
  isHeader,
}: {
  label: string;
  current: string;
  alternative: string;
  betterWhen?: 'lower' | 'higher';
  isHeader?: boolean;
}) {
  if (isHeader) {
    return (
      <div className="grid grid-cols-3 text-xs font-semibold py-2 border-b" style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text-faint)' }}>
        <span>Metric</span>
        <span className="text-center" style={{ color: 'var(--color-high)' }}>Current</span>
        <span className="text-center" style={{ color: 'var(--color-primary)' }}>Alternative</span>
      </div>
    );
  }

  const parseVal = (s: string) => parseFloat(s.replace(/[^0-9.-]/g, '')) || null;
  const cv = parseVal(current);
  const av = parseVal(alternative);

  let altStyle = 'var(--color-text)';
  let icon = <Minus className="w-3 h-3" style={{ color: 'var(--color-text-faint)' }} />;

  if (cv !== null && av !== null && cv !== av) {
    const altBetter = betterWhen === 'lower' ? av < cv : av > cv;
    if (altBetter) {
      altStyle = 'var(--color-success)';
      icon = <TrendingDown className="w-3 h-3" style={{ color: 'var(--color-success)' }} />;
    } else {
      altStyle = 'var(--color-high)';
      icon = <TrendingUp className="w-3 h-3" style={{ color: 'var(--color-high)' }} />;
    }
  }

  return (
    <div className="grid grid-cols-3 items-center py-2.5 border-b text-sm" style={{ borderColor: 'var(--color-divider)' }}>
      <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-center text-xs font-mono tabular-nums" style={{ color: 'var(--color-text)' }}>{current}</span>
      <div className="flex items-center justify-center gap-1">
        {icon}
        <span className="text-xs font-mono tabular-nums font-semibold" style={{ color: altStyle }}>{alternative}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const DEFAULT_CURRENT: SimulatorConfig = {
  cloudProvider: 'AWS', cloudService: 'EC2', region: 'us-east-1',
  isServerless: false, frontendFramework: 'React', cicdTool: 'GitHub Actions', hasCaching: false,
};

const DEFAULT_ALT: SimulatorConfig = {
  cloudProvider: 'Vercel', cloudService: 'Vercel Functions', region: 'global-edge',
  isServerless: true, frontendFramework: 'Next.js', cicdTool: 'GitHub Actions', hasCaching: true,
};

export default function SimulatorPage() {
  const { scanResult } = useAppState();
  const router = useRouter();

  // Pre-fill current from scan result if available
  const initialCurrent: SimulatorConfig = scanResult ? {
    cloudProvider: (scanResult.detectedStack.cloudProvider || 'AWS') as CloudProvider,
    cloudService: 'EC2',
    region: 'us-east-1',
    isServerless: false,
    frontendFramework: (scanResult.detectedStack.frontendFramework || 'React') as FrontendFramework,
    cicdTool: 'GitHub Actions',
    hasCaching: false,
  } : DEFAULT_CURRENT;

  const [current, setCurrent] = useState<SimulatorConfig>(initialCurrent);
  const [alternative, setAlternative] = useState<SimulatorConfig>(DEFAULT_ALT);
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runComparison() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current,
          alternative,
          repoName: scanResult?.repoName || 'your project',
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResult(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Comparison failed');
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    const tmp = current;
    setCurrent(alternative);
    setAlternative(tmp);
    setResult(null);
  }

  const delta = result?.greenScoreDelta ?? 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Results', href: '/results' },
          { label: 'Simulator', href: '/simulator' },
        ]}
      />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <BackButton href="/results" label="Back to Results" />
          {scanResult && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
              Comparing against: {scanResult.repoName}
            </span>
          )}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
              What-If Simulator
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Configure two setups side-by-side. AI compares them in real time — like choosing between car trims, but for your stack.
          </p>
        </motion.div>

        {/* Two config panels */}
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <ConfigPanel
              title="🔴  Current Setup"
              accent="var(--color-high)"
              config={current}
              onChange={setCurrent}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <ConfigPanel
              title="🟢  Alternative Setup"
              accent="var(--color-primary)"
              config={alternative}
              onChange={setAlternative}
            />
          </motion.div>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={runComparison} disabled={loading} className="flex-1 sm:flex-none">
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Running AI comparison…</>
            ) : (
              <><Zap className="w-4 h-4" /> Run AI Comparison</>
            )}
          </Button>
          <Button size="md" variant="ghost" onClick={swap}>
            ⇄ Swap setups
          </Button>
          <Button size="md" variant="ghost" onClick={() => { setCurrent(DEFAULT_CURRENT); setAlternative(DEFAULT_ALT); setResult(null); }}>
            Reset
          </Button>
        </div>

        {error && (
          <p className="text-sm px-4 py-3 rounded-[var(--radius-md)]"
            style={{ background: 'var(--color-error-tint, #fee2e2)', color: 'var(--color-high)' }}>
            {error}
          </p>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-5"
            >
              {/* Score delta banner */}
              <div
                className="flex items-center justify-between px-5 py-4 rounded-[var(--radius-md)] border"
                style={{
                  background: delta > 0 ? 'var(--color-primary-tint)' : delta < 0 ? '#fee2e2' : 'var(--color-surface-offset)',
                  borderColor: delta > 0 ? 'var(--color-primary)' : delta < 0 ? 'var(--color-high)' : 'var(--color-border)',
                }}
              >
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Green Score Impact</p>
                  <p className="text-2xl font-extrabold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: delta > 0 ? 'var(--color-primary)' : delta < 0 ? 'var(--color-high)' : 'var(--color-text)' }}>
                    {delta > 0 ? '+' : ''}{delta} pts
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {delta > 0 ? 'Alternative is greener ✅' : delta < 0 ? 'Current setup is greener' : 'Both setups are equivalent'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    {result.currentLabel}
                  </p>
                  <div className="flex items-center gap-2 my-1">
                    <ArrowRight className="w-4 h-4" style={{ color: 'var(--color-text-faint)' }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                    {result.alternativeLabel}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Comparison table */}
                <div className="md:col-span-2">
                  <Card className="p-5">
                    <h2 className="text-base font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      Side-by-Side Comparison
                    </h2>
                    <MetricRow label="" current="" alternative="" isHeader />
                    {result.metrics.map((m) => (
                      <MetricRow
                        key={m.label}
                        label={m.label}
                        current={m.current}
                        alternative={m.alternative}
                        betterWhen={m.betterWhen}
                      />
                    ))}
                  </Card>
                </div>

                {/* AI verdict */}
                <div className="space-y-4">
                  <Card className="p-5 space-y-3" elevated>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                        AI Verdict
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      {result.verdict}
                    </p>
                    {result.recommendation && (
                      <div
                        className="px-3 py-2.5 rounded-[var(--radius-sm)] text-xs font-medium leading-relaxed"
                        style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}
                      >
                        💡 {result.recommendation}
                      </div>
                    )}
                  </Card>

                  {/* Quick actions */}
                  <Card className="p-4 space-y-2">
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Next steps</p>
                    <Button size="sm" className="w-full" onClick={() => router.push('/report')}>
                      View Full AI Report →
                    </Button>
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => router.push('/recommendations')}>
                      Action Plan
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full" onClick={() => router.push('/compare')}>
                      Framework Comparison →
                    </Button>
                  </Card>
                </div>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-2">
                {result.metrics
                  .filter((m) => {
                    const cv = parseFloat(m.current.replace(/[^0-9.-]/g, ''));
                    const av = parseFloat(m.alternative.replace(/[^0-9.-]/g, ''));
                    if (isNaN(cv) || isNaN(av)) return false;
                    return m.betterWhen === 'lower' ? av < cv : av > cv;
                  })
                  .map((m) => (
                    <Badge key={m.label} variant="neutral" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✓ Better {m.label.toLowerCase()}
                    </Badge>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <FlaskConical className="w-12 h-12" style={{ color: 'var(--color-text-faint)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Configure both setups above, then hit <strong>Run AI Comparison</strong>
            </p>
            <p className="text-xs max-w-sm" style={{ color: 'var(--color-text-faint)' }}>
              Claude analyses the trade-offs — CO₂, cost, bundle size, cold start — and tells you exactly what switching would mean.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
