'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { Copy, Download, Share2, Check, FileText, Wrench, Leaf, Megaphone } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BackButton } from '@/components/layout/BackButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppState, useAppDispatch } from '@/lib/store';
import { cn } from '@/lib/utils';

const TAB_CONFIG = [
  { id: 'plain', label: 'Plain English', icon: FileText, description: 'Easy-to-understand summary for any audience' },
  { id: 'technical', label: 'Technical', icon: Wrench, description: 'Deep-dive for engineers and DevOps' },
  { id: 'sustainability', label: 'Sustainability', icon: Leaf, description: 'Environmental impact and carbon metrics' },
  { id: 'pitch', label: 'Pitch-Ready', icon: Megaphone, description: 'Executive summary for stakeholders' },
];

function stripMarkdown(text: string): string {
  // Remove markdown bold: **text** or __text__ → text
  let cleaned = text.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');
  // Remove markdown italic: *text* or _text_ → text
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
  cleaned = cleaned.replace(/_(.+?)_/g, '$1');
  // Remove markdown code: `text` → text
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  // Remove inline heading markers: ### text → text
  cleaned = cleaned.replace(/#{1,6}\s*/g, '');
  // Remove horizontal rules
  cleaned = cleaned.replace(/^---+\s*$/gm, '');
  // Remove blockquote markers
  cleaned = cleaned.replace(/^>\s*/gm, '');
  return cleaned.trim();
}

function renderReport(text: string) {
  if (!text) return <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Report not available.</p>;

  const paragraphs = text
    .split(/\n\n+/)
    .filter(Boolean)
    .filter(p => !/^---+\s*$/.test(p.trim()))   // skip horizontal rules
    .filter(p => p.trim().length > 0);            // skip blank paragraphs

  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => {
        // Detect heading lines (short lines ending without punctuation or starting with #)
        const isHeading = para.startsWith('#') || (para.length < 80 && !para.endsWith('.') && !para.endsWith(',') && i > 0);
        if (para.startsWith('#')) {
          const clean = stripMarkdown(para.replace(/^#+\s*/, ''));
          return (
            <h3 key={i} className="text-sm font-bold pt-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
              {clean}
            </h3>
          );
        }
        // Bullet-like lines
        if (para.includes('\n- ') || para.startsWith('- ')) {
          const lines = para.split('\n');
          return (
            <ul key={i} className="space-y-1.5 list-none">
              {lines.map((line, j) => {
                const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
                return isBullet ? (
                  <li key={j} className="flex gap-2 text-sm" style={{ color: 'var(--color-text)' }}>
                    <span style={{ color: 'var(--color-primary)' }}>→</span>
                    <span>{stripMarkdown(line.replace(/^[-•]\s*/, ''))}</span>
                  </li>
                ) : (
                  <li key={j} className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{stripMarkdown(line)}</li>
                );
              })}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
            {stripMarkdown(para)}
          </p>
        );
      })}
    </div>
  );
}

export default function ReportPage() {
  const { scanResult } = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('plain');

  useEffect(() => {
    if (!scanResult) router.replace('/');
  }, [scanResult, router]);

  if (!scanResult) return null;

  const reportMap: Record<string, string> = {
    plain: scanResult.report?.plainEnglish || '',
    technical: scanResult.report?.technical || '',
    sustainability: scanResult.report?.sustainability || '',
    pitch: scanResult.report?.pitch || '',
  };

  const activeConfig = TAB_CONFIG.find(t => t.id === activeTab) || TAB_CONFIG[0];

  function handleCopy() {
    const text = reportMap[activeTab];
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    window.print();
  }

  async function handleShare() {
    if (!scanResult) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `GreenDev Coach Report — ${scanResult.repoName}`,
          text: `Sustainability score: ${scanResult.sustainabilityScore}/100`,
          url: window.location.href,
        });
      } catch { /* user dismissed */ }
    } else {
      handleCopy();
    }
  }

  const scoreColor =
    scanResult.sustainabilityScore >= 75 ? 'var(--color-success)' :
    scanResult.sustainabilityScore >= 45 ? 'var(--color-gold)' :
    'var(--color-high)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Configure', href: '/analyze' },
          { label: 'Results', href: '/results' },
          { label: 'Report', href: '/report' },
        ]}
      />
      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <BackButton href="/results" label="Back to Results" />
          <button
            onClick={() => { dispatch({ type: 'RESET_ALL' }); router.push('/'); }}
            className="text-xs underline" style={{ color: 'var(--color-text-faint)' }}
          >
            ← Start Over
          </button>
        </div>

        <div className="flex items-center gap-3">
          <motion.h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            AI Sustainability Report
          </motion.h1>
          {scanResult.detectedStack.isMock && (
            <Badge variant="neutral" className="bg-amber-100 text-amber-800 border-amber-200 uppercase tracking-wide">
              Demo Mode
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main report area */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List
                  className="flex border-b mb-6"
                  style={{ borderColor: 'var(--color-divider)' }}
                  aria-label="Report format"
                >
                  {TAB_CONFIG.map((tab) => (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap',
                        'data-[state=active]:border-[var(--color-primary)] data-[state=active]:text-[var(--color-primary)]',
                        'data-[state=inactive]:border-transparent data-[state=inactive]:text-[var(--color-text-muted)] data-[state=inactive]:hover:text-[var(--color-text)]'
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                <p className="text-xs mb-4" style={{ color: 'var(--color-text-faint)' }}>
                  {activeConfig.description}
                </p>

                {TAB_CONFIG.map((tab) => (
                  <Tabs.Content key={tab.id} value={tab.id}>
                    <Card className="p-6">
                      {renderReport(reportMap[tab.id])}
                    </Card>
                  </Tabs.Content>
                ))}
              </Tabs.Root>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="p-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Report'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleDownload}>
                    <Download className="w-3.5 h-3.5" /> Print / PDF
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleShare}>
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Score card */}
            <Card className="p-5 space-y-3" elevated>
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Scan Summary</h3>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold" style={{ fontFamily: 'var(--font-display)', color: scoreColor }}>
                  {scanResult.sustainabilityScore}
                </span>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>/100</p>
                  <Badge variant="impact" level={scanResult.sustainabilityScore >= 75 ? 'LOW' : scanResult.sustainabilityScore >= 45 ? 'MEDIUM' : 'HIGH'}>
                    {scanResult.scoreLabel}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <div className="flex justify-between">
                  <span>Repository</span>
                  <span className="font-mono truncate max-w-[120px]" style={{ color: 'var(--color-text)' }}>{scanResult.repoName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issues found</span>
                  <span style={{ color: 'var(--color-text)' }}>{scanResult.issues.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommendations</span>
                  <span style={{ color: 'var(--color-text)' }}>{scanResult.recommendations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scanned at</span>
                  <span style={{ color: 'var(--color-text)' }}>{new Date(scanResult.scannedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </Card>

            {/* Subscores mini */}
            {scanResult.subscores && scanResult.subscores.length > 0 && (
              <Card className="p-4 space-y-3">
                <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Category Grades</h3>
                <div className="space-y-2">
                  {scanResult.subscores.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub.label}</span>
                      <span
                        className="text-xs font-bold w-5 text-right"
                        style={{
                          color: sub.grade === 'A' ? 'var(--color-success)' :
                            sub.grade === 'B' ? '#22c55e' :
                            sub.grade === 'C' ? 'var(--color-gold)' :
                            sub.grade === 'D' ? '#f97316' : 'var(--color-high)'
                        }}
                      >
                        {sub.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Before/After mini */}
            <Card className="p-4 space-y-2">
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Potential Savings</h3>
              <div className="text-xs space-y-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <div className="flex justify-between">
                  <span>CO₂/month</span>
                  <span style={{ color: 'var(--color-success)' }}>
                    {scanResult.before.estimatedMonthlyCO2} → {scanResult.after.estimatedMonthlyCO2}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cost/month</span>
                  <span style={{ color: 'var(--color-success)' }}>
                    {scanResult.before.estimatedMonthlyCost} → {scanResult.after.estimatedMonthlyCost}
                  </span>
                </div>
              </div>
            </Card>

            <Button size="md" className="w-full" onClick={() => router.push('/recommendations')}>
              View Action Plan →
            </Button>

            <p className="text-xs text-center" style={{ color: 'var(--color-text-faint)' }}>
              Scan ID: {scanResult.scanId.slice(0, 8)}…
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
