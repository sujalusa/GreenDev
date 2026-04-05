'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GitBranch, Settings, Scan, BarChart3, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: GitBranch,
    title: 'Paste your GitHub repo URL',
    description: 'Enter any public GitHub repository URL. GreenDev Coach uses the GitHub API to read your repo structure — no cloning, no credentials, no code execution.',
    detail: [
      'Fetches your full file tree in under a second',
      'Reads .github/workflows/, Dockerfile, and package.json',
      'Detects languages, topics, and dependency counts',
    ],
  },
  {
    num: '02',
    icon: Settings,
    title: 'Configure your deployment',
    description: 'Tell us how your project is deployed. We use this to calculate real energy and cost baselines — an EC2 instance vs Lambda has a 14× difference in idle compute.',
    detail: [
      'Cloud provider: AWS, GCP, Azure, or Auto-Detect',
      'Compute type: VM, serverless, container, or static',
      'Region: we know which regions run on renewable energy',
      'CI/CD: frequency and tooling (GitHub Actions, CircleCI, etc.)',
    ],
  },
  {
    num: '03',
    icon: Scan,
    title: 'Five analysis engines run in parallel',
    description: 'GreenDev runs five specialised static analysis engines simultaneously. Each focuses on a different dimension of your project\'s environmental impact.',
    detail: [
      'CI/CD Engine — detects trigger patterns, caching, path filters',
      'Docker Engine — checks base images, multi-stage builds, .dockerignore',
      'Compute Engine — evaluates always-on vs serverless, instance sizing',
      'Assets Engine — measures dependency footprint and image optimisation',
      'Region Engine — maps your region to carbon intensity data',
    ],
  },
  {
    num: '04',
    icon: BarChart3,
    title: 'Sustainability score + 5 subscores',
    description: 'Your overall score (0–100) is calculated by deducting points for each detected issue. Five category subscores show exactly where to focus.',
    detail: [
      'HIGH impact issues: −20 pts each',
      'MEDIUM impact issues: −10 pts each',
      'LOW impact issues: −5 pts each',
      'Category grades: A, B, C, D, F per dimension',
      'Before/after projection: CO₂ and cost savings if you fix everything',
    ],
  },
  {
    num: '05',
    icon: FileText,
    title: 'AI report in four formats',
    description: 'AWS Bedrock (Claude Sonnet) generates four tailored versions of your report — each optimised for a different audience.',
    detail: [
      'Plain English — for anyone, no jargon',
      'Technical — for engineers and DevOps, implementation detail',
      'Sustainability — carbon metrics and environmental context',
      'Pitch-Ready — executive summary for professors or stakeholders',
    ],
  },
];

const ENGINES = [
  { id: 'CI/CD', description: 'Branch filters, path filters, caching, workflow count' },
  { id: 'Docker', description: 'Base image weight, multi-stage builds, .dockerignore, root user' },
  { id: 'Compute', description: 'Always-on VMs, instance sizing, serverless alternatives' },
  { id: 'Assets', description: 'Dependency count, unoptimised images, bundle weight' },
  { id: 'Region', description: 'Carbon intensity tiers, renewable energy data, migration cost' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 px-6 py-3 rounded-full border border-white/10 bg-black/60 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 28 28" fill="none">
            <path d="M14 3C8 3 4 8 4 14c0 4 2.5 7.5 6 9.5L14 25l4-2.5c3.5-2 6-5.5 6-9.5 0-6-4-11-10-11z" fill="white" opacity="0.2"/>
            <path d="M8 14c0-3.5 2.5-6.5 6-7.5M14 22c3.5-1 6-4 6-8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-semibold text-white/80">GreenDev Coach</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm text-white/60">
          <Link href="/why-green" className="hover:text-white transition-colors">Why Green</Link>
          <span className="text-white">How it Works</span>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-32 pb-20 space-y-20 max-w-3xl mx-auto w-full">
        {/* Hero */}
        <motion.section
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            How it Works
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            From repo URL to actionable sustainability report in under 30 seconds. Here's exactly what happens under the hood.
          </p>
        </motion.section>

        {/* Steps */}
        <div className="w-full space-y-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <span className="text-3xl font-extrabold text-white/20 leading-none">{step.num}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <step.icon className="w-4 h-4 text-white/50" />
                    <h2 className="text-lg font-bold">{step.title}</h2>
                  </div>
                  <p className="text-sm text-white/60">{step.description}</p>
                </div>
              </div>
              <ul className="space-y-1.5 pl-4 border-l border-white/10">
                {step.detail.map((d, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-white/50">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white/30" />
                    {d}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Engine breakdown */}
        <motion.section
          className="w-full space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold">The Five Analysis Engines</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10 overflow-hidden">
            {ENGINES.map(({ id, description }) => (
              <div key={id} className="flex items-center gap-4 px-5 py-4">
                <span className="text-xs font-mono px-2 py-1 rounded bg-white/10 text-white/80 shrink-0">{id}</span>
                <span className="text-sm text-white/50">{description}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Privacy note */}
        <motion.section
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <p className="text-sm font-semibold mb-2">What we access vs what we don't</p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <p className="text-white/40 uppercase tracking-wide text-xs">We DO access</p>
              {['Public file tree', 'GitHub Actions YAML', 'Dockerfile', 'package.json'].map(t => (
                <p key={t} className="flex items-center gap-1.5 text-white/60"><CheckCircle2 className="w-3.5 h-3.5 text-green-500/60" />{t}</p>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-white/40 uppercase tracking-wide text-xs">We NEVER access</p>
              {['Source code execution', 'Private repos', 'Secrets or env vars', 'Your AWS account'].map(t => (
                <p key={t} className="flex items-center gap-1.5 text-white/60"><span className="w-3.5 h-3.5 flex items-center justify-center text-red-400/60 shrink-0">✕</span>{t}</p>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-white/50 text-sm">Takes under 30 seconds.</p>
          <Link
            href="/start"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-black bg-gradient-to-br from-gray-100 to-gray-300 hover:from-gray-200 hover:to-gray-400 transition-all"
          >
            Analyze My Repo <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>

      <footer className="text-center py-8 text-xs text-white/20 border-t border-white/10">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link href="/why-green" className="hover:text-white/50 transition-colors">Why Green</Link>
          <Link href="/how-it-works" className="hover:text-white/50 transition-colors">How it Works</Link>
          <Link href="/about" className="hover:text-white/50 transition-colors">About</Link>
        </div>
        GreenDev Coach © {new Date().getFullYear()} — Built for the AWS Sustainability Challenge
      </footer>
    </div>
  );
}
