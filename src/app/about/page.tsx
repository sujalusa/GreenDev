'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, GitBranch, Zap, Globe, ArrowRight, BarChart3, Shield } from 'lucide-react';

const TEAM = [
  { name: 'Sustainability Engine', role: 'Static analysis across CI/CD, Docker, compute, assets' },
  { name: 'AI Report Generator', role: 'AWS Bedrock Claude — plain English to pitch-ready reports' },
  { name: 'Score & Subscores', role: 'Per-category grading across 5 dimensions' },
  { name: 'Framework Comparator', role: 'Green score benchmarks for Next.js, Astro, Svelte, Remix & more' },
];

const STACK = [
  { label: 'Frontend', value: 'Next.js 16 + TypeScript' },
  { label: 'AI', value: 'AWS Bedrock (Claude Sonnet)' },
  { label: 'Database', value: 'Supabase (scan history)' },
  { label: 'Analysis', value: 'GitHub API + 5 custom engines' },
  { label: 'Hosting', value: 'Vercel Edge Network' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Minimal nav */}
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
          <Link href="/how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <span className="text-white">About</span>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-32 pb-20 space-y-24 max-w-3xl mx-auto w-full">
        {/* Hero */}
        <motion.section
          className="text-center space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-white/70">
            <Leaf className="w-3.5 h-3.5" /> Built for the AWS Sustainability Challenge
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            About GreenDev Coach
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            A sustainability analysis tool that scans public GitHub repositories and gives student developers an actionable roadmap to greener, cheaper cloud deployments.
          </p>
        </motion.section>

        {/* Mission */}
        <motion.section
          className="space-y-5 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-2xl font-bold">The Problem</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Globe, stat: '1%', label: 'of global electricity consumed by data centers' },
              { icon: Zap, stat: '14×', label: 'more compute used by always-on VMs vs actual usage' },
              { icon: BarChart3, stat: '0', label: 'visibility student devs have into their cloud footprint' },
            ].map(({ icon: Icon, stat, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2">
                <Icon className="w-5 h-5 text-white/40" />
                <p className="text-3xl font-extrabold">{stat}</p>
                <p className="text-sm text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* What we built */}
        <motion.section
          className="space-y-5 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h2 className="text-2xl font-bold">What We Built</h2>
          <div className="space-y-3">
            {TEAM.map((item, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-white/50 mt-0.5">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tech stack */}
        <motion.section
          className="space-y-5 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <h2 className="text-2xl font-bold">Tech Stack</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10 overflow-hidden">
            {STACK.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm text-white/50">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Privacy */}
        <motion.section
          className="space-y-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <h2 className="text-2xl font-bold">Privacy & Security</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex gap-4">
            <Shield className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold">We only read, never execute</p>
              <p className="text-sm text-white/50">
                GreenDev Coach reads your repository structure, workflow files, and Dockerfile using the public GitHub API. We never clone your repository, install dependencies, or run any code. Your results are stored anonymously in Supabase for aggregate analytics only.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-white/50 text-sm">Ready to see your score?</p>
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
