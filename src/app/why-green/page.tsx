'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const FACTS = [
  {
    stat: '~1%',
    context: 'of global electricity',
    body: 'Data centres consume roughly 1% of global electricity — a share that grows every year as cloud adoption accelerates. The software choices developers make today determine the hardware utilisation of tomorrow.',
  },
  {
    stat: '40%',
    context: 'CI energy wasted',
    body: 'Studies show that 40% of CI compute time is spent re-downloading dependencies that haven\'t changed. A single actions/cache step eliminates that — for every project, on every run, forever.',
  },
  {
    stat: '14×',
    context: 'idle VM waste',
    body: 'An always-on EC2 instance runs 720 hours per month. A student project is actually used roughly 50 of those hours. The other 670 hours burn electricity for nothing. Serverless scales to zero.',
  },
  {
    stat: '95%',
    context: 'renewable in us-west-2',
    body: 'AWS Oregon (us-west-2) runs on more than 95% renewable energy. Moving a workload from ap-southeast-1 to us-west-2 can cut its effective carbon intensity by 40% with a single config change.',
  },
  {
    stat: '50 MB',
    context: 'vs 1.1 GB Docker image',
    body: 'node:20-alpine is 50 MB. node:latest is 1.1 GB. Every CI pull, every registry push, every container start moves that delta across the wire. Alpine is not a trade-off — it\'s strictly better.',
  },
];

const PRINCIPLES = [
  {
    title: 'Visibility first',
    body: 'You cannot improve what you cannot measure. Most developers have no idea how many compute hours their project wastes per month, what that costs, or what it emits. GreenDev Coach makes that number concrete and personal.',
  },
  {
    title: 'Green is good engineering',
    body: 'Every green practice we recommend is also a performance or cost win. Alpine images build faster. Caching reduces pipeline time. Serverless eliminates idle spend. Sustainability and quality are the same thing.',
  },
  {
    title: 'Student devs are the leverage point',
    body: 'The habits a developer forms in university follow them to every startup, every enterprise, every cloud bill they\'ll ever write. Teaching green patterns early creates a compounding effect at industry scale.',
  },
  {
    title: 'Specific, not preachy',
    body: 'We don\'t show a generic "be sustainable" message. We show your repo, your CI triggers, your Docker base image, your region — and exactly what to change, with the YAML to paste directly into your workflow.',
  },
];

export default function WhyGreenPage() {
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
          <span className="text-white">Why Green</span>
          <Link href="/how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-32 pb-20 space-y-24 max-w-3xl mx-auto w-full">
        {/* Hero manifesto */}
        <motion.section
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Green code is<br />
            <span className="text-white/40">good code.</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            The cloud is physical infrastructure that consumes real electricity. Every architectural choice a developer makes — which compute service, which region, how often CI runs — has a direct energy cost. Most developers never see that number. We think they should.
          </p>
        </motion.section>

        {/* Stats */}
        <motion.section
          className="w-full space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-2xl font-bold">The numbers that matter</h2>
          <div className="space-y-4">
            {FACTS.map((fact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 flex gap-6 items-start"
              >
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-extrabold leading-none">{fact.stat}</p>
                  <p className="text-xs text-white/40 mt-1 max-w-[80px]">{fact.context}</p>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{fact.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Principles */}
        <motion.section
          className="w-full space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <h2 className="text-2xl font-bold">Our principles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2">
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Closing statement */}
        <motion.section
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <p className="text-xl font-semibold leading-snug">
            "The best time to write green code was before you shipped. The second best time is now."
          </p>
          <p className="text-sm text-white/40">
            A weekend of fixes — a CI cache, an Alpine image, a branch filter — can permanently reduce your project's environmental footprint by 60–80%. That's not a compromise. That's just engineering.
          </p>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-white/50 text-sm">See your own repo's footprint.</p>
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
