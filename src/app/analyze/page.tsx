'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { BackButton } from '@/components/layout/BackButton';
import { ProgressBar } from '@/components/layout/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Input } from '@/components/ui/Input';
import { useAppState, useAppDispatch } from '@/lib/store';
import { CloudProvider, CloudService, CICDTool, CIFrequency, FrontendFramework } from '@/types';
import { Check, ChevronDown, Search } from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const PROVIDERS: { value: CloudProvider; label: string; tag?: string; icon: string }[] = [
  { value: 'AWS',                  label: 'Amazon Web Services', icon: '☁️',  tag: 'Most common' },
  { value: 'GCP',                  label: 'Google Cloud',        icon: '🌐' },
  { value: 'Azure',                label: 'Microsoft Azure',     icon: '🔷' },
  { value: 'Vercel',               label: 'Vercel',              icon: '▲',   tag: 'Greenest' },
  { value: 'Netlify',              label: 'Netlify',             icon: '🟢' },
  { value: 'Railway',              label: 'Railway',             icon: '🚂' },
  { value: 'Render',               label: 'Render',              icon: '🔴' },
  { value: 'Fly.io',               label: 'Fly.io',              icon: '✈️' },
  { value: 'DigitalOcean',         label: 'DigitalOcean',        icon: '🌊' },
  { value: 'Heroku',               label: 'Heroku',              icon: '🟣' },
  { value: 'Cloudflare',           label: 'Cloudflare',          icon: '🟠' },
  { value: 'GitHub Pages',         label: 'GitHub Pages',        icon: '🐙' },
  { value: 'Self-hosted',          label: 'Self-hosted / VPS',   icon: '🖥️' },
  { value: 'Auto-Detect / Unknown',label: "Don't know / Auto",   icon: '🔍',  tag: "We'll figure it out" },
];

const SERVICES: Record<string, { value: string; label: string; tag?: string }[]> = {
  AWS: [
    { value: 'Lambda',             label: 'Lambda (Serverless)',   tag: 'Greenest' },
    { value: 'App Runner',         label: 'App Runner',           tag: 'Easy' },
    { value: 'ECS',                label: 'ECS (Containers)' },
    { value: 'Fargate',            label: 'Fargate (Serverless containers)' },
    { value: 'EC2',                label: 'EC2 (Virtual Machine)' },
    { value: 'Amplify',            label: 'Amplify (Frontend)' },
    { value: 'Elastic Beanstalk',  label: 'Elastic Beanstalk' },
    { value: 'Auto-Detect / Unknown', label: 'Auto-detect' },
  ],
  GCP: [
    { value: 'Cloud Run',          label: 'Cloud Run (Serverless)', tag: 'Greenest' },
    { value: 'Cloud Functions',    label: 'Cloud Functions' },
    { value: 'App Engine',         label: 'App Engine' },
    { value: 'GKE',                label: 'GKE (Kubernetes)' },
    { value: 'Compute Engine',     label: 'Compute Engine (VM)' },
    { value: 'Auto-Detect / Unknown', label: 'Auto-detect' },
  ],
  Azure: [
    { value: 'Azure Functions',      label: 'Azure Functions (Serverless)', tag: 'Greenest' },
    { value: 'Azure Container Apps', label: 'Container Apps' },
    { value: 'Azure App Service',    label: 'App Service' },
    { value: 'AKS',                  label: 'AKS (Kubernetes)' },
    { value: 'Auto-Detect / Unknown',label: 'Auto-detect' },
  ],
  Vercel: [
    { value: 'Vercel Functions', label: 'Vercel Functions', tag: 'Default' },
    { value: 'Vercel Edge',      label: 'Vercel Edge Runtime' },
  ],
  Netlify: [
    { value: 'Netlify Functions', label: 'Netlify Functions', tag: 'Default' },
    { value: 'Netlify Edge',      label: 'Netlify Edge Functions' },
  ],
  Railway: [{ value: 'Railway Service', label: 'Railway Service', tag: 'Default' }],
  Render: [
    { value: 'Render Web Service', label: 'Web Service', tag: 'Default' },
    { value: 'Render Static Site', label: 'Static Site' },
  ],
  'Fly.io': [{ value: 'Fly Machine', label: 'Fly Machine', tag: 'Default' }],
  DigitalOcean: [
    { value: 'App Platform',  label: 'App Platform', tag: 'Easiest' },
    { value: 'DO Functions',  label: 'Functions (Serverless)' },
    { value: 'Droplet',       label: 'Droplet (VM)' },
  ],
  Heroku: [{ value: 'Heroku Dyno', label: 'Heroku Dyno', tag: 'Default' }],
  Cloudflare: [
    { value: 'Cloudflare Workers', label: 'Workers (Serverless)', tag: 'Greenest' },
    { value: 'Cloudflare Pages',   label: 'Pages (Static)' },
  ],
  'GitHub Pages': [{ value: 'GitHub Pages Static', label: 'Static Site', tag: 'Default' }],
  'Self-hosted': [{ value: 'VPS / Bare Metal', label: 'VPS / Bare Metal', tag: 'Default' }],
  'Auto-Detect / Unknown': [{ value: 'Auto-Detect / Unknown', label: 'Auto-detect everything' }],
};

const REGIONS: Record<string, { value: string; label: string; tag?: string }[]> = {
  AWS: [
    { value: 'us-east-1',    label: 'US East — N. Virginia' },
    { value: 'us-east-2',    label: 'US East — Ohio' },
    { value: 'us-west-1',    label: 'US West — N. California' },
    { value: 'us-west-2',    label: 'US West — Oregon', tag: '🌿 Greenest' },
    { value: 'eu-west-1',    label: 'EU — Ireland' },
    { value: 'eu-central-1', label: 'EU — Frankfurt' },
    { value: 'eu-north-1',   label: 'EU — Stockholm', tag: '🌿 Green' },
    { value: 'ap-southeast-1', label: 'Asia — Singapore' },
    { value: 'ap-northeast-1', label: 'Asia — Tokyo' },
    { value: 'ap-south-1',   label: 'Asia — Mumbai' },
    { value: 'ca-central-1', label: 'Canada — Central' },
    { value: 'sa-east-1',    label: 'South America — São Paulo' },
    { value: 'Auto-Detect',  label: 'Auto-detect' },
  ],
  GCP: [
    { value: 'us-central1',       label: 'US — Iowa', tag: '🌿 Green' },
    { value: 'us-east1',          label: 'US — South Carolina' },
    { value: 'us-west1',          label: 'US — Oregon', tag: '🌿 Green' },
    { value: 'europe-west1',      label: 'EU — Belgium' },
    { value: 'europe-west4',      label: 'EU — Netherlands' },
    { value: 'europe-north1',     label: 'EU — Finland', tag: '🌿 Greenest' },
    { value: 'asia-east1',        label: 'Asia — Taiwan' },
    { value: 'asia-northeast1',   label: 'Asia — Tokyo' },
    { value: 'asia-southeast1',   label: 'Asia — Singapore' },
    { value: 'Auto-Detect',       label: 'Auto-detect' },
  ],
  Azure: [
    { value: 'eastus',           label: 'US — East' },
    { value: 'westus',           label: 'US — West' },
    { value: 'westus2',          label: 'US — West 2' },
    { value: 'northeurope',      label: 'EU — North (Ireland)' },
    { value: 'westeurope',       label: 'EU — West (Netherlands)' },
    { value: 'swedencentral',    label: 'EU — Sweden', tag: '🌿 Greenest' },
    { value: 'norwayeast',       label: 'EU — Norway' },
    { value: 'eastasia',         label: 'Asia — Hong Kong' },
    { value: 'southeastasia',    label: 'Asia — Singapore' },
    { value: 'Auto-Detect',      label: 'Auto-detect' },
  ],
  Global: [
    { value: 'global-edge', label: 'Global Edge Network', tag: '🌿 Greenest' },
    { value: 'Auto-Detect', label: 'Auto-detect' },
  ],
};

const CICD_TOOLS: { value: CICDTool; label: string }[] = [
  { value: 'GitHub Actions',      label: 'GitHub Actions' },
  { value: 'GitLab CI',           label: 'GitLab CI/CD' },
  { value: 'Bitbucket Pipelines', label: 'Bitbucket Pipelines' },
  { value: 'CircleCI',            label: 'CircleCI' },
  { value: 'Jenkins',             label: 'Jenkins' },
  { value: 'Travis CI',           label: 'Travis CI' },
  { value: 'Azure DevOps',        label: 'Azure DevOps' },
  { value: 'Drone CI',            label: 'Drone CI' },
  { value: 'None',                label: 'No CI/CD' },
  { value: 'Other',               label: 'Other' },
];

const CI_FREQUENCIES: { value: CIFrequency; label: string; tip: string }[] = [
  { value: 'every-push', label: 'Every push',      tip: 'Runs on every commit — highest energy use' },
  { value: 'pr-only',    label: 'Pull requests only', tip: 'Only on PR — much more efficient' },
  { value: 'scheduled',  label: 'Scheduled (cron)', tip: 'Runs on a timer — predictable cost' },
  { value: 'manual',     label: 'Manual only',      tip: 'Triggered manually — lowest energy use' },
];

const FRAMEWORKS: { value: FrontendFramework; label: string; tag?: string }[] = [
  { value: 'Next.js',       label: 'Next.js',             tag: 'SSR/SSG' },
  { value: 'Astro',         label: 'Astro',               tag: 'Greenest' },
  { value: 'SvelteKit',     label: 'SvelteKit',           tag: 'Lightest' },
  { value: 'Remix',         label: 'Remix' },
  { value: 'Nuxt',          label: 'Nuxt (Vue)' },
  { value: 'React',         label: 'React (CRA / Vite)' },
  { value: 'Vue',           label: 'Vue.js' },
  { value: 'Svelte',        label: 'Svelte (no kit)' },
  { value: 'Angular',       label: 'Angular' },
  { value: 'Solid',         label: 'SolidJS' },
  { value: 'Qwik',          label: 'Qwik' },
  { value: 'Gatsby',        label: 'Gatsby' },
  { value: 'Vite',          label: 'Vite (custom)' },
  { value: 'HTML / Vanilla',label: 'Plain HTML / Vanilla JS', tag: 'Lightest' },
  { value: 'None',          label: 'No frontend / API only' },
  { value: 'Auto-Detect',   label: 'Auto-detect from code' },
];

// ── SearchableSelect ──────────────────────────────────────────────────────────

function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Search or select…',
}: {
  label: string;
  options: { value: string; label: string; tag?: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      (o.tag && o.tag.toLowerCase().includes(search.toLowerCase()))
  );
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={ref}>
      <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-[var(--radius-md)] border text-left min-h-[44px] transition-all"
        style={{
          background: 'var(--color-surface)',
          color: selected ? 'var(--color-text)' : 'var(--color-text-faint)',
          borderColor: open ? 'var(--color-primary)' : 'var(--color-border)',
          boxShadow: open ? '0 0 0 2px var(--color-primary-tint)' : 'none',
        }}
      >
        <span className="text-sm truncate">{selected?.label || placeholder}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 ml-2 transition-transform"
          style={{
            color: 'var(--color-text-muted)',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1 w-full rounded-[var(--radius-md)] border shadow-xl overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              top: '100%',
              left: 0,
            }}
          >
            <div
              className="flex items-center gap-2 px-3 py-2 border-b"
              style={{ borderColor: 'var(--color-divider)' }}
            >
              <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-text-faint)' }} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--color-text)' }}
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-faint)' }}>
                  No matches
                </p>
              )}
              {filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors"
                  style={{
                    background: o.value === value ? 'var(--color-primary-tint)' : 'transparent',
                    color: 'var(--color-text)',
                  }}
                  onMouseEnter={(e) => {
                    if (o.value !== value) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-offset)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = o.value === value ? 'var(--color-primary-tint)' : 'transparent';
                  }}
                >
                  <span>{o.label}</span>
                  <div className="flex items-center gap-2">
                    {o.tag && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
                        {o.tag}
                      </span>
                    )}
                    {o.value === value && <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />}
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

// ── ProviderCard ──────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  selected,
  onClick,
}: {
  provider: (typeof PROVIDERS)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] border text-center transition-all text-sm font-medium"
      style={{
        background: selected ? 'var(--color-primary-tint)' : 'var(--color-surface)',
        borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
        color: selected ? 'var(--color-primary)' : 'var(--color-text-muted)',
        boxShadow: selected ? '0 0 0 2px var(--color-primary-tint)' : 'none',
      }}
    >
      <span className="text-xl leading-none">{provider.icon}</span>
      <span className="leading-tight text-xs">{provider.label}</span>
      {provider.tag && (
        <span
          className="text-[10px] px-1 py-0.5 rounded-full font-semibold"
          style={{ background: 'var(--color-success)', color: '#fff' }}
        >
          {provider.tag}
        </span>
      )}
      {selected && (
        <span
          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-primary)' }}
        >
          <Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { repoUrl, deploymentConfig } = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>(
    (deploymentConfig.cloudProvider as CloudProvider) || 'AWS'
  );
  const [cloudService, setCloudService] = useState<CloudService>(
    (deploymentConfig.cloudService as CloudService) || 'Lambda'
  );
  const [region, setRegion] = useState(deploymentConfig.region || 'us-east-1');
  const [isServerless, setIsServerless] = useState(deploymentConfig.isServerless ?? false);
  const [instanceType, setInstanceType] = useState(deploymentConfig.instanceType || '');

  // Step 2 state
  const [cicdTool, setCicdTool] = useState<CICDTool>(
    (deploymentConfig.cicdTool as CICDTool) || 'GitHub Actions'
  );
  const [ciFrequency, setCiFrequency] = useState<CIFrequency>(
    (deploymentConfig.ciFrequency as CIFrequency) || 'every-push'
  );
  const [hasCaching, setHasCaching] = useState(deploymentConfig.hasCaching ?? false);
  const [framework, setFramework] = useState<FrontendFramework>(
    (deploymentConfig.frontendFramework as FrontendFramework) || 'Next.js'
  );

  useEffect(() => {
    if (!repoUrl) router.replace('/');
  }, [repoUrl, router]);

  if (!repoUrl) return null;

  function handleProviderChange(provider: CloudProvider) {
    setCloudProvider(provider);
    const services = SERVICES[provider] || SERVICES['Auto-Detect / Unknown'];
    setCloudService(services[0].value as CloudService);
    const regions = REGIONS[provider] || REGIONS.Global;
    setRegion(regions[0].value);
    // auto-set serverless for fully-managed providers
    const serverlessProviders: CloudProvider[] = ['Vercel', 'Netlify', 'Cloudflare', 'GitHub Pages'];
    setIsServerless(serverlessProviders.includes(provider));
  }

  function handleSubmit() {
    dispatch({
      type: 'SET_DEPLOYMENT_CONFIG',
      payload: {
        cloudProvider,
        cloudService,
        region,
        instanceType: isServerless ? '' : instanceType,
        isServerless,
        cicdTool,
        ciFrequency,
        hasCaching,
        frontendFramework: framework,
      },
    });
    router.push('/scanning');
  }

  const currentServices = SERVICES[cloudProvider] || SERVICES['Auto-Detect / Unknown'];
  const currentRegions  = REGIONS[cloudProvider]  || REGIONS.Global;
  const selectedProvider = PROVIDERS.find((p) => p.value === cloudProvider);
  const isFullyManaged = ['Vercel', 'Netlify', 'GitHub Pages', 'Cloudflare'].includes(cloudProvider);

  const tipText = (() => {
    if (cloudProvider === 'Vercel' || cloudProvider === 'Netlify') return '✅ Great choice — this platform runs on 100% renewable energy.';
    if (cloudProvider === 'Cloudflare') return '✅ Cloudflare runs on renewable energy with an ultra-efficient edge network.';
    if (cloudProvider === 'GitHub Pages') return '✅ Static hosting — zero server runtime, minimal footprint.';
    if (cloudService === 'Lambda' || cloudService === 'Cloud Run' || cloudService === 'Cloud Functions') return '⚡ Serverless scales to zero — you only pay (and emit CO₂) when it runs.';
    if (cloudService === 'EC2' || cloudService === 'Compute Engine' || cloudService === 'Droplet') return '⚠️ VMs run 24/7 even when idle. Consider serverless to cut compute hours by 80–95%.';
    return '💡 Tip: us-west-2 (Oregon) and eu-north-1 (Stockholm) are the greenest AWS regions.';
  })();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Configure', href: '/analyze' },
        ]}
      />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <BackButton href="/" label="Back to Home" />

        <div className="flex justify-center my-6">
          <ProgressBar currentStep={2} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Form ── */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Provider grid */}
                  <Card className="p-6 space-y-5" elevated>
                    <div>
                      <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                        Where does your app live?
                      </h1>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Select your hosting platform — or choose &ldquo;Auto-detect&rdquo; and we&apos;ll figure it out.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 relative">
                      {PROVIDERS.map((p) => (
                        <ProviderCard
                          key={p.value}
                          provider={p}
                          selected={cloudProvider === p.value}
                          onClick={() => handleProviderChange(p.value)}
                        />
                      ))}
                    </div>
                  </Card>

                  {/* Service + Region */}
                  {cloudProvider !== 'Auto-Detect / Unknown' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className="p-6 space-y-5">
                        <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                          {selectedProvider?.label} Settings
                        </h2>

                        {currentServices.length > 1 && (
                          <div className="relative">
                            <SearchableSelect
                              label="Service / Runtime"
                              options={currentServices}
                              value={cloudService}
                              onChange={(v) => setCloudService(v as CloudService)}
                            />
                          </div>
                        )}

                        {!isFullyManaged && (
                          <div className="relative">
                            <SearchableSelect
                              label="Region"
                              options={currentRegions}
                              value={region}
                              onChange={setRegion}
                            />
                          </div>
                        )}

                        {!isFullyManaged && (
                          <Toggle
                            label="Compute Model"
                            labelOff="Always-on (VM / Container)"
                            labelOn="Serverless (scale-to-zero)"
                            checked={isServerless}
                            onChange={setIsServerless}
                          />
                        )}

                        {!isServerless && !isFullyManaged && (
                          <Input
                            label="Instance / Machine Type (optional)"
                            placeholder="e.g. t3.micro, e2-medium, Standard_B1s"
                            value={instanceType}
                            onChange={(e) => setInstanceType(e.target.value)}
                          />
                        )}
                      </Card>
                    </motion.div>
                  )}

                  <Button size="lg" className="w-full sm:w-auto" onClick={() => setStep(2)}>
                    Next: Pipeline Details →
                  </Button>
                </motion.div>
              ) : (
                /* ── Step 2 ── */
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="p-6 space-y-6" elevated>
                    <div>
                      <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                        CI/CD &amp; Stack
                      </h1>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        How is your code built and deployed?
                      </p>
                    </div>

                    {/* CI/CD Tool */}
                    <div>
                      <p className="text-sm font-medium mb-2.5" style={{ color: 'var(--color-text)' }}>
                        CI/CD Tool
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {CICD_TOOLS.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setCicdTool(t.value)}
                            className="px-3 py-2.5 rounded-[var(--radius-md)] border text-sm font-medium text-left transition-all"
                            style={{
                              background: cicdTool === t.value ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                              borderColor: cicdTool === t.value ? 'var(--color-primary)' : 'var(--color-border)',
                              color: cicdTool === t.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CI Frequency */}
                    <div>
                      <p className="text-sm font-medium mb-2.5" style={{ color: 'var(--color-text)' }}>
                        How often does your pipeline run?
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {CI_FREQUENCIES.map((f) => (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() => setCiFrequency(f.value)}
                            className="flex flex-col gap-0.5 px-3 py-2.5 rounded-[var(--radius-md)] border text-sm text-left transition-all"
                            style={{
                              background: ciFrequency === f.value ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                              borderColor: ciFrequency === f.value ? 'var(--color-primary)' : 'var(--color-border)',
                            }}
                          >
                            <span
                              className="font-medium"
                              style={{ color: ciFrequency === f.value ? 'var(--color-primary)' : 'var(--color-text)' }}
                            >
                              {f.label}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                              {f.tip}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Caching + Framework */}
                    <Toggle
                      label="Dependency / build caching configured?"
                      labelOff="No caching"
                      labelOn="Caching enabled"
                      checked={hasCaching}
                      onChange={setHasCaching}
                    />

                    <div className="relative">
                      <SearchableSelect
                        label="Frontend Framework"
                        options={FRAMEWORKS}
                        value={framework}
                        onChange={(v) => setFramework(v as FrontendFramework)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button variant="ghost" onClick={() => setStep(1)}>
                        ← Back
                      </Button>
                      <Button size="lg" onClick={handleSubmit}>
                        Analyze My Repo →
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Tip panel ── */}
          <motion.div
            className="hidden lg:flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-5 space-y-3" tinted>
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                Why we ask this
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Your deployment setup is the biggest factor in your carbon footprint. We use this to benchmark
                against greener alternatives — we never access your cloud account.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                💡 Tip
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {tipText}
              </p>
            </Card>

            {step === 1 && (
              <Card className="p-5 space-y-3">
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  🌿 Greenest options
                </h3>
                <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <p>🥇 <strong>Vercel / Netlify / Cloudflare</strong> — 100% renewable</p>
                  <p>🥈 <strong>AWS us-west-2</strong> — 90%+ renewable</p>
                  <p>🥈 <strong>GCP europe-north1</strong> — Carbon-free energy</p>
                  <p>🥉 <strong>Azure swedencentral</strong> — Near-zero carbon</p>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-5 space-y-3">
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  🏆 Greenest frameworks
                </h3>
                <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <p>🥇 <strong>Astro</strong> — Ships zero JS by default</p>
                  <p>🥈 <strong>SvelteKit</strong> — Tiny runtime, fast builds</p>
                  <p>🥉 <strong>Next.js</strong> — SSG/ISR cuts server load</p>
                  <p>⚠️ <strong>React CRA</strong> — Large bundles, client-heavy</p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
