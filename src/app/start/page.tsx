'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, Zap, GitBranch, Shield, Lock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAppDispatch } from '@/lib/store';
import { isValidGitHubUrl } from '@/lib/utils';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  function handleBlur() {
    if (!url) { setError(''); setValid(false); return; }
    if (isValidGitHubUrl(url)) { setError(''); setValid(true); }
    else { setError('Must be a valid GitHub URL like https://github.com/owner/repo'); setValid(false); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidGitHubUrl(url)) {
      setError('Must be a valid GitHub URL like https://github.com/owner/repo');
      return;
    }
    setLoading(true);
    dispatch({ type: 'SET_REPO_URL', payload: url.trim() });
    router.push('/analyze');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <Header showStartNewScan={false} />
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Hero */}
        <motion.div 
          className="max-w-xl w-full text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}
          >
            <Leaf className="w-3.5 h-3.5" /> Sustainability for Student Devs
          </span>

          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
          >
            Is your project as green as your code is good?
          </h1>

          <p className="text-base mx-auto" style={{ color: 'var(--color-text-muted)', maxWidth: '55ch' }}>
            Paste a public GitHub repo URL and we&apos;ll analyze your code, CI/CD setup, and AWS deployment for sustainability — in under 30 seconds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
              onBlur={handleBlur}
              error={error}
              success={valid}
              aria-label="GitHub repository URL"
            />
            <Button type="submit" size="lg" loading={loading} disabled={!url} className="w-full">
              Analyze Repo →
            </Button>
            <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: 'var(--color-text-faint)' }}>
              <Lock className="w-3 h-3" /> Public repos only. No code is executed.
            </p>
          </form>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              { icon: Zap, text: 'Avg scan: 18 sec' },
              { icon: GitBranch, text: 'Public repos only' },
              { icon: Shield, text: 'Read-only access' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <Icon className="w-3.5 h-3.5" /> {text}
              </span>
            ))}
          </div>
        </motion.div>

        {/* How it works */}
        <motion.section 
          className="max-w-3xl w-full mt-20 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-center" style={{ fontFamily: 'var(--font-display)' }}>
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { num: '1', title: 'Paste your repo', desc: 'Enter any public GitHub repository URL.' },
              { num: '2', title: 'Configure deployment', desc: 'Tell us your AWS setup — region, compute, CI/CD.' },
              { num: '3', title: 'Get your report', desc: 'Receive a sustainability score, recommendations, and a shareable AI report.' },
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
              >
                <Card className="p-5 space-y-2 h-full">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{step.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: 'var(--color-text-faint)' }}>
        Built for AWS hackathons. GreenDev Coach © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
