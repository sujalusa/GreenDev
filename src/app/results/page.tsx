'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Leaf, ArrowRight, TrendingDown,
  Zap, BarChart3, Flame, DollarSign, FlaskConical,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BackButton } from '@/components/layout/BackButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppState, useAppDispatch } from '@/lib/store';
import { Subscore } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function gradeColor(grade: string) {
  if (grade === 'A') return 'var(--color-success)';
  if (grade === 'B') return '#22c55e';
  if (grade === 'C') return 'var(--color-gold)';
  if (grade === 'D') return '#f97316';
  return 'var(--color-high)';
}

function parseNum(str?: string) {
  if (!str) return 0;
  const m = str.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

// ── ScoreBar ──────────────────────────────────────────────────────────────────

function ScoreBar({ subscore, delay }: { subscore: Subscore; delay: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(subscore.score), 300 + delay);
    return () => clearTimeout(t);
  }, [subscore.score, delay]);

  const color = gradeColor(subscore.grade);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {subscore.label}
        </span>
        <div className="flex items-center gap-2">
          {subscore.issueCount > 0 && (
            <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
              {subscore.issueCount} issue{subscore.issueCount > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-sm font-bold w-5 text-right tabular-nums" style={{ color, fontFamily: 'var(--font-display)' }}>
            {subscore.grade}
          </span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-offset)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{subscore.summary}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { scanResult } = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!scanResult) { router.replace('/'); return; }
    const target = scanResult.sustainabilityScore;
    let current = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedScore(current);
      if (current >= target) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [scanResult, router]);

  if (!scanResult) return null;

  const score = scanResult.sustainabilityScore;
  const scoreColor =
    score >= 75 ? 'var(--color-success)' :
    score >= 45 ? 'var(--color-gold)' :
    'var(--color-high)';

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const highIssues = scanResult.issues.filter(i => i.impact === 'HIGH').length;
  const medIssues  = scanResult.issues.filter(i => i.impact === 'MEDIUM').length;
  const lowIssues  = scanResult.issues.filter(i => i.impact === 'LOW').length;

  const beforeCO2  = parseNum(scanResult.before.estimatedMonthlyCO2);
  const afterCO2   = parseNum(scanResult.after.estimatedMonthlyCO2);
  const co2Savings = (beforeCO2 - afterCO2).toFixed(1);

  const beforeCost  = parseNum(scanResult.before.estimatedMonthlyCost);
  const afterCost   = parseNum(scanResult.after.estimatedMonthlyCost);
  const costSavings = (beforeCost - afterCost).toFixed(2);

  const subscores = scanResult.subscores || [];

  // ── Issue-driven energy breakdown ─────────────────────────────────────────
  // Sum CO2 attributed to each issue category from actual detected issues
  const issueCO2 = (cats: string[]) =>
    scanResult.issues
      .filter(i => cats.includes(i.category))
      .reduce((s, i) => s + (i.estimatedMonthlyCO2 ? parseNum(i.estimatedMonthlyCO2) : 0), 0);

  const issueCost = (cats: string[]) =>
    scanResult.issues
      .filter(i => cats.includes(i.category))
      .reduce((s, i) => s + (i.estimatedMonthlyCost ? parseNum(i.estimatedMonthlyCost) : 0), 0);

  const ciCO2Raw      = issueCO2(['ci-cd']);
  const computeCO2Raw = issueCO2(['compute']);
  const assetCO2Raw   = issueCO2(['assets']);
  const depCO2Raw     = issueCO2(['storage', 'dependencies']);

  const totalIssueCO2 = ciCO2Raw + computeCO2Raw + assetCO2Raw + depCO2Raw;
  // Baseline = CO2 not attributed to any specific issue (infra overhead, networking etc.)
  const baselineCO2   = Math.max(0, beforeCO2 - totalIssueCO2) / 4;

  const adjCiCO2      = ciCO2Raw      + baselineCO2;
  const adjComputeCO2 = computeCO2Raw + baselineCO2;
  const adjAssetCO2   = assetCO2Raw   + baselineCO2;
  const adjDepCO2     = depCO2Raw     + baselineCO2;
  const adjCO2Total   = adjCiCO2 + adjComputeCO2 + adjAssetCO2 + adjDepCO2 || 1;

  const energyRows = [
    { label: 'CI/CD Pipeline',      co2: adjCiCO2.toFixed(2),      portion: Math.round(adjCiCO2      / adjCO2Total * 100), color: '#f97316' },
    { label: 'Compute (servers)',    co2: adjComputeCO2.toFixed(2),  portion: Math.round(adjComputeCO2 / adjCO2Total * 100), color: 'var(--color-high)' },
    { label: 'Asset delivery (CDN)', co2: adjAssetCO2.toFixed(2),    portion: Math.round(adjAssetCO2   / adjCO2Total * 100), color: 'var(--color-gold)' },
    { label: 'Dependencies/builds',  co2: adjDepCO2.toFixed(2),      portion: Math.round(adjDepCO2     / adjCO2Total * 100), color: '#a3a3a3' },
  ];

  // ── Issue-driven cost breakdown ────────────────────────────────────────────
  const computeCostRaw = issueCost(['compute']);
  const ciCostRaw      = issueCost(['ci-cd']);
  const storageCostRaw = issueCost(['storage', 'dependencies']);

  const totalIssueCost   = computeCostRaw + ciCostRaw + storageCostRaw;
  const baselineCost     = Math.max(0, beforeCost - totalIssueCost) / 4;

  const adjComputeCost   = computeCostRaw + baselineCost;
  const adjCICost        = ciCostRaw      + baselineCost;
  const adjStorageCost   = storageCostRaw + baselineCost;
  const adjNetworkCost   = baselineCost; // networking has no specific issues
  const adjCostTotal     = adjComputeCost + adjCICost + adjStorageCost + adjNetworkCost || 1;

  const costRows = [
    { label: 'Compute',    cost: adjComputeCost.toFixed(2), portion: Math.round(adjComputeCost / adjCostTotal * 100) },
    { label: 'CI/CD runs', cost: adjCICost.toFixed(2),      portion: Math.round(adjCICost      / adjCostTotal * 100) },
    { label: 'Storage',    cost: adjStorageCost.toFixed(2), portion: Math.round(adjStorageCost / adjCostTotal * 100) },
    { label: 'Networking', cost: adjNetworkCost.toFixed(2), portion: Math.round(adjNetworkCost / adjCostTotal * 100) },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0" style={{ background: 'var(--color-bg)' }}>
      <Header
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Configure', href: '/analyze' },
          { label: 'Results', href: '/results' },
        ]}
      />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <BackButton href="/analyze" label="Back to Config" />
          <button
            onClick={() => { dispatch({ type: 'RESET_ALL' }); router.push('/'); }}
            className="text-xs underline"
            style={{ color: 'var(--color-text-faint)' }}
          >
            ← Start Over
          </button>
        </div>

        {/* ── 4 Stat Cards ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {[
            { icon: <BarChart3 className="w-4 h-4" />, label: 'Issues Found',    value: scanResult.issues.length, sub: `${highIssues} high · ${medIssues} med · ${lowIssues} low`, color: 'var(--color-high)' },
            { icon: <Flame      className="w-4 h-4" />, label: 'CO₂ Saveable',   value: `${co2Savings}kg`,        sub: 'per month',          color: 'var(--color-success)' },
            { icon: <DollarSign className="w-4 h-4" />, label: 'Cost Saveable',  value: `$${costSavings}`,        sub: 'per month',          color: 'var(--color-gold)' },
            { icon: <Leaf       className="w-4 h-4" />, label: 'Recommendations',value: scanResult.recommendations.length, sub: 'actionable fixes', color: 'var(--color-primary)' },
          ].map((stat) => (
            <Card key={stat.label} className="p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5" style={{ color: stat.color }}>
                {stat.icon}
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-extrabold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{stat.sub}</p>
            </Card>
          ))}
        </motion.div>

        {/* ── Main 2-col grid ── */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* ══ LEFT (2/3) ══ */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Issues */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                What We Found
              </h2>
              {scanResult.issues.slice(0, 6).map((issue, idx) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + idx * 0.07 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                      aria-expanded={expandedIssue === issue.id}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <Badge variant="impact" level={issue.impact}>{issue.impact}</Badge>
                      <span className="flex-1 text-sm font-medium">{issue.title}</span>
                      {expandedIssue === issue.id
                        ? <ChevronUp className="w-4 h-4 shrink-0" />
                        : <ChevronDown className="w-4 h-4 shrink-0" />}
                    </button>
                    {expandedIssue === issue.id && (
                      <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: 'var(--color-divider)' }}>
                        <p className="text-sm pt-3" style={{ color: 'var(--color-text-muted)' }}>{issue.description}</p>
                        {issue.affectedFiles && (
                          <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                            <span className="font-medium">Files: </span>
                            {issue.affectedFiles.map((f) => <span key={f} className="font-mono mr-1">{f}</span>)}
                          </p>
                        )}
                        {(issue.estimatedMonthlyCO2 || issue.estimatedMonthlyCost) && (
                          <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                            Est: {issue.estimatedMonthlyCO2 && `${issue.estimatedMonthlyCO2} CO₂`}
                            {issue.estimatedMonthlyCost && ` · ${issue.estimatedMonthlyCost}`}/month
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </section>

            {/* ── Energy Breakdown ── */}
            <section>
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4" style={{ color: 'var(--color-high)' }} />
                  <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    Energy Consumption Breakdown
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-3xl font-extrabold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-high)' }}>
                      {scanResult.before.estimatedMonthlyCO2}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>estimated CO₂ per month</p>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-faint)' }} />
                  <div>
                    <p className="text-3xl font-extrabold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-success)' }}>
                      {scanResult.after.estimatedMonthlyCO2}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>after optimisations</p>
                  </div>
                </div>

                {/* Stacked bar */}
                <div className="h-4 rounded-full overflow-hidden flex gap-0.5">
                  {energyRows.map((r) => (
                    <div
                      key={r.label}
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${r.portion}%`, background: r.color }}
                      title={`${r.label}: ${r.co2} kg`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {energyRows.map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: r.color }} />
                      <span className="text-xs flex-1" style={{ color: 'var(--color-text-muted)' }}>{r.label}</span>
                      <span className="text-xs font-mono tabular-nums font-semibold" style={{ color: 'var(--color-text)' }}>
                        {r.co2} kg
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs px-3 py-2 rounded-[var(--radius-sm)]"
                  style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
                  💡 Implementing all recommendations would save <strong>{co2Savings} kg CO₂/month</strong> — equivalent to {Math.round(parseFloat(co2Savings) * 4)} km of driving.
                </p>
              </Card>
            </section>

            {/* ── Cost Breakdown ── */}
            <section>
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                  <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    Cost Breakdown
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-3xl font-extrabold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                      {scanResult.before.estimatedMonthlyCost}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>current monthly spend</p>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-faint)' }} />
                  <div>
                    <p className="text-3xl font-extrabold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-success)' }}>
                      {scanResult.after.estimatedMonthlyCost}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>after optimisations</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {costRows.map((r) => (
                    <div key={r.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: 'var(--color-text-muted)' }}>{r.label}</span>
                        <span className="font-mono font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
                          ${r.cost}/mo
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-offset)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${r.portion}%`, background: 'var(--color-gold)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs px-3 py-2 rounded-[var(--radius-sm)]"
                  style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)' }}>
                  Potential monthly saving: <strong style={{ color: 'var(--color-success)' }}>${costSavings}</strong>
                  {' '}· annualised: <strong style={{ color: 'var(--color-success)' }}>${(parseFloat(costSavings) * 12).toFixed(0)}</strong>
                </p>
              </Card>
            </section>

            {/* ── Before / After table ── */}
            <Card className="p-5 space-y-3" elevated>
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)' }}>Before → After</h3>
              <div className="grid grid-cols-3 gap-2 text-sm text-center">
                <div className="font-medium" style={{ color: 'var(--color-text-faint)' }}>Metric</div>
                <div className="font-medium" style={{ color: 'var(--color-high)' }}>Current</div>
                <div className="font-medium" style={{ color: 'var(--color-success)' }}>Optimised</div>
                {[
                  { label: 'Monthly cost',      before: scanResult.before.estimatedMonthlyCost, after: scanResult.after.estimatedMonthlyCost },
                  { label: 'CO₂ / month',       before: scanResult.before.estimatedMonthlyCO2,  after: scanResult.after.estimatedMonthlyCO2  },
                  { label: 'Energy savings',    before: '$0.00', after: scanResult.after.energySavings },
                  { label: 'Time saved/month',  before: '0 min', after: scanResult.after.timeSaved },
                  { label: 'Bandwidth saved',   before: '0 MB', after: scanResult.after.bandwidthSaved },
                  { label: 'Compute hrs',        before: String(scanResult.before.monthlyComputeHours), after: String(scanResult.after.monthlyComputeHours) },
                  { label: 'CI runs',            before: String(scanResult.before.monthlyCIRuns),       after: String(scanResult.after.monthlyCIRuns)       },
                  { label: 'Estimated requests', before: String(scanResult.before.monthlyRequests),     after: String(scanResult.after.monthlyRequests)     },
                ].map((row) => (
                  <div key={row.label} className="contents">
                    <div className="text-left px-1 py-1.5 border-t" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-divider)' }}>
                      {row.label}
                    </div>
                    <div className="font-mono py-1.5 border-t" style={{ borderColor: 'var(--color-divider)' }}>{row.before}</div>
                    <div className="font-mono py-1.5 border-t" style={{ color: 'var(--color-success)', borderColor: 'var(--color-divider)' }}>{row.after}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Mobile CTAs ── */}
            <div className="flex flex-col sm:flex-row gap-3 lg:hidden">
              <Button size="lg" className="flex-1" onClick={() => router.push('/report')}>
                View AI Report <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="secondary" className="flex-1" onClick={() => router.push('/recommendations')}>
                Action Plan
              </Button>
              <Button size="md" variant="ghost" className="w-full" onClick={() => router.push('/simulator')}>
                <FlaskConical className="w-4 h-4" /> What-If Simulator →
              </Button>
            </div>
          </motion.div>

          {/* ══ RIGHT (1/3) — sticky ══ */}
          <motion.div
            className="space-y-4 lg:sticky lg:top-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Score gauge */}
            <Card className="p-5 flex flex-col items-center gap-3" elevated>
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" role="meter"
                  aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-surface-offset)" strokeWidth="9" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={scoreColor} strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tabular-nums"
                    style={{ fontFamily: 'var(--font-display)', color: scoreColor }}>
                    {animatedScore}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/100</span>
                </div>
              </div>

              <Badge variant="impact" level={score >= 75 ? 'LOW' : score >= 45 ? 'MEDIUM' : 'HIGH'}>
                {scanResult.scoreLabel}
              </Badge>

              {scanResult.detectedStack.isMock && (
                <Badge variant="neutral" className="bg-amber-100 text-amber-800 border-amber-200">
                  Demo Mode
                </Badge>
              )}

              <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                {scanResult.repoName} · {scanResult.issues.length} factors analysed
              </p>
            </Card>

            {/* Breakdown by category */}
            {subscores.length > 0 && (
              <Card className="p-4 space-y-4">
                <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  Breakdown by Category
                </h2>
                <div className="space-y-3.5">
                  {subscores.map((sub, i) => (
                    <ScoreBar key={sub.id} subscore={sub} delay={i * 80} />
                  ))}
                </div>
              </Card>
            )}

            {/* Desktop CTAs */}
            <div className="hidden lg:flex flex-col gap-2">
              <Button size="lg" className="w-full" onClick={() => router.push('/report')}>
                View Full AI Report <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="md" variant="secondary" className="w-full" onClick={() => router.push('/recommendations')}>
                Action Plan
              </Button>

              {/* What-If Simulator CTA */}
              <button
                onClick={() => router.push('/simulator')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-md)] border-2 border-dashed text-sm font-medium transition-all hover:border-solid"
                style={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-tint)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <FlaskConical className="w-4 h-4" />
                Open What-If Simulator
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => router.push('/compare')}
                className="w-full text-xs text-center py-2 transition-colors"
                style={{ color: 'var(--color-text-faint)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-faint)')}
              >
                Compare Frameworks →
              </button>
            </div>

            {/* Quick top recommendations */}
            <Card className="p-4 space-y-3">
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Top Fixes
              </h3>
              {scanResult.recommendations.length === 0 ? (
                <div className="py-4 text-center space-y-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>✓ No issues found!</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Your deployment is already well-optimized. Great job keeping your carbon footprint low!
                  </p>
                </div>
              ) : (
                <>
                  {scanResult.recommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="space-y-1">
                      <div className="flex items-start gap-2">
                        <TrendingDown className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                        <p className="text-xs font-medium leading-snug" style={{ color: 'var(--color-text)' }}>
                          {rec.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 pl-5">
                        <Badge variant="effort" level={rec.effort} className="text-[10px]">
                          {rec.effort}
                        </Badge>
                        {rec.estimatedCO2Saved && (
                          <span className="text-[10px]" style={{ color: 'var(--color-success)' }}>
                            saves {rec.estimatedCO2Saved}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => router.push('/recommendations')}>
                    See all {scanResult.recommendations.length} recommendations →
                  </Button>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Mobile sticky bar */}
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden flex items-center gap-3 px-4 h-16 border-t backdrop-blur-lg z-40"
        style={{ background: 'rgba(var(--color-bg), 0.9)', borderColor: 'var(--color-divider)' }}
      >
        <Button size="md" className="flex-1" onClick={() => router.push('/report')}>AI Report →</Button>
        <Button size="md" variant="secondary" onClick={() => router.push('/recommendations')}>Plan</Button>
        <Button size="md" variant="ghost" onClick={() => router.push('/simulator')}>
          <FlaskConical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
