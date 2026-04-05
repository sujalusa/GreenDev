'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, CheckCircle2, Loader2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppState, useAppDispatch } from '@/lib/store';
import { cn } from '@/lib/utils';

const STEPS = [
  'Fetching repository structure',
  'Analyzing CI/CD pipelines',
  'Checking Docker & container config',
  'Evaluating region & compute choices',
  'Scoring sustainability factors',
  'Generating AI recommendations',
  'Building your report',
];

const FUN_FACTS = [
  '☁️ Data centers account for ~1% of global electricity use.',
  '🌿 us-west-2 (Oregon) runs on 95%+ renewable energy.',
  '⚡ A single serverless function uses 60× less energy than an idle VM.',
  '🔄 Dependency caching cuts CI energy use by ~40%.',
  '📦 Alpine Docker images are ~50MB vs 1.1GB for full OS images.',
];

export default function ScanningPage() {
  const { repoUrl, deploymentConfig } = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [countdown, setCountdown] = useState(25);
  const [factIndex, setFactIndex] = useState(0);
  const [error, setError] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!repoUrl || !deploymentConfig.cloudProvider) {
      router.replace('/');
    }
  }, [repoUrl, deploymentConfig, router]);

  // Step animation
  useEffect(() => {
    if (doneRef.current) return;
    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i < 5; i++) {
      timers.push(setTimeout(() => { if (!doneRef.current) setActiveStep(i + 1); }, (i + 1) * 1800));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 5) return 5; // Pause at 5
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotating facts
  useEffect(() => {
    const interval = setInterval(() => setFactIndex((i) => (i + 1) % FUN_FACTS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  // API call
  useEffect(() => {
    if (!repoUrl) return;
    const controller = new AbortController();
    abortRef.current = controller;

    async function runAnalysis() {
      const startTime = Date.now();
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repoUrl, deploymentConfig }),
          signal: controller.signal,
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          if (res.status === 403) {
            setError('GitHub Rate Limit Exceeded. Please provide a token or try again later.');
          } else if (res.status === 404 || res.status === 422) {
            setError('Repository not found or invalid. Please ensure it is public and url is correct.');
          } else if (res.status === 503 || res.status === 504 || json?.error?.includes('Bedrock')) {
            setError('AI Service (Bedrock) is currently unavailable or timed out. Please try again.');
          } else if (res.status === 429) {
            setError('Rate limit reached. Please try again later.');
          } else {
            setError(json?.error || `Analysis failed (${res.status}). Please try again.`);
          }
          return;
        }

        if (json && json.success && json.data) {
          // Ensure we show at least a few steps for UX feel
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 5000 - elapsed);
          
          await new Promise(r => setTimeout(r, remaining));
          
          doneRef.current = true;
          setActiveStep(STEPS.length);
          dispatch({ type: 'SET_SCAN_RESULT', payload: json.data });
          await new Promise((r) => setTimeout(r, 800));
          router.push('/results');
        } else {
          setError(json?.error || 'Analysis failed. Unknown error occurred.');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Network or server error. Please try again.');
        }
      }
    }

    runAnalysis();
    return () => controller.abort();
  }, [repoUrl, deploymentConfig, dispatch, router]);

  function handleRetry() {
    setError('');
    setActiveStep(0);
    setCountdown(25);
    doneRef.current = false;
    // Re-trigger by remounting (router trick)
    router.replace('/scanning');
  }

  function handleCancel() {
    abortRef.current?.abort();
    dispatch({ type: 'RESET_ALL' });
    router.push('/');
  }

  if (!repoUrl) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Configure', href: '/analyze' },
          { label: 'Scanning', href: '/scanning' },
        ]}
        showStartNewScan={false}
      />
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Repo card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-4 flex items-center gap-3">
              <GitBranch className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-mono truncate" style={{ color: 'var(--color-text)' }}>
                {repoUrl}
              </span>
            </Card>
          </motion.div>

          {/* Steps */}
          <div className="space-y-3 text-left">
            {STEPS.map((label, i) => {
              const isDone = i < activeStep;
              const isActive = i === activeStep;
              return (
                <motion.div 
                  key={label} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--color-success)' }} />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 shrink-0 animate-spin" style={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <Circle className="w-5 h-5 shrink-0" style={{ color: 'var(--color-text-faint)' }} />
                  )}
                  <span
                    className={cn(
                      'text-sm transition-colors',
                      isDone ? 'text-[var(--color-text)]' : isActive ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-faint)]'
                    )}
                  >
                    {label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Countdown */}
          <p className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            ~{countdown}s
          </p>

          {/* Fun fact */}
          <AnimatePresence mode="wait">
            <motion.p 
              key={factIndex}
              className="text-sm min-h-[2.5rem]" 
              style={{ color: 'var(--color-text-muted)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {FUN_FACTS[factIndex]}
            </motion.p>
          </AnimatePresence>

          {/* Error state */}
          {error && (
            <Card className="p-4 space-y-3" style={{ borderColor: 'var(--color-error)' }}>
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
              <Button onClick={handleRetry}>Try Again</Button>
            </Card>
          )}

          {/* Cancel link */}
          {!error && (
            <button
              onClick={() => setShowCancel(true)}
              className="text-xs underline"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Cancel scan
            </button>
          )}
        </div>
      </main>

      <Modal open={showCancel} onClose={() => setShowCancel(false)} title="Cancel Scan?">
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          This will stop the current analysis and return you to the home page.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setShowCancel(false)}>Keep Scanning</Button>
          <Button variant="danger" onClick={handleCancel}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
