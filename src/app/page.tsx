"use client";

import { SignInPage } from "@/components/ui/sign-in-flow-1";
import { 
  Leaf, Zap, Activity, Globe, Server, Shield, Cloud, ArrowRight,
  GitBranch, Settings, Scan, BarChart3, FileText, CheckCircle2, X
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const FACTS = [
  { stat: '~1%', context: 'of global electricity', body: 'Data centres consume roughly 1% of global electricity — a share that grows every year as cloud adoption accelerates. The software choices developers make today determine the hardware utilisation of tomorrow.' },
  { stat: '40%', context: 'CI energy wasted', body: 'Studies show that 40% of CI compute time is spent re-downloading dependencies that haven\'t changed. A single actions/cache step eliminates that — for every project, on every run, forever.' },
  { stat: '14×', context: 'idle VM waste', body: 'An always-on EC2 instance runs 720 hours per month. A student project is actually used roughly 50 of those hours. The other 670 hours burn electricity for nothing. Serverless scales to zero.' },
  { stat: '95%', context: 'renewable in us-west-2', body: 'AWS Oregon (us-west-2) runs on more than 95% renewable energy. Moving a workload from ap-southeast-1 to us-west-2 can cut its effective carbon intensity by 40% with a single config change.' },
  { stat: '50 MB', context: 'vs 1.1 GB Docker image', body: 'node:20-alpine is 50 MB. node:latest is 1.1 GB. Every CI pull, every container start moves that delta across the wire. Alpine is not a trade-off — it\'s strictly better.' },
];

const PRINCIPLES = [
  { title: 'Visibility first', body: 'You cannot improve what you cannot measure. Most developers have no idea how many compute hours their project wastes per month, what that costs, or what it emits. GreenDev Coach makes that number concrete and personal.' },
  { title: 'Green is good engineering', body: 'Every green practice we recommend is also a performance or cost win. Alpine images build faster. Caching reduces pipeline time. Serverless eliminates idle spend. Sustainability and quality are the same thing.' },
  { title: 'Student devs are the leverage point', body: 'The habits a developer forms in university follow them to every startup, every enterprise, every cloud bill they\'ll ever write. Teaching green patterns early creates a compounding effect at industry scale.' },
  { title: 'Specific, not preachy', body: 'We don\'t show a generic "be sustainable" message. We show your repo, your CI triggers, your Docker base image, your region — and exactly what to change, with the YAML to paste directly into your workflow.' },
];

const STEPS = [
  { num: '01', icon: <GitBranch className="w-6 h-6 text-emerald-400" />, title: 'Paste your GitHub repo URL', desc: 'Enter any public GitHub repository URL. GreenDev Coach uses the GitHub API to read your repo structure — no cloning, no credentials, no code execution.', details: ['Fetches your full file tree in under a second', 'Reads .github/workflows/, Dockerfile, and package.json', 'Detects languages, topics, and dependency counts'] },
  { num: '02', icon: <Settings className="w-6 h-6 text-cyan-400" />, title: 'Configure your deployment', desc: 'Tell us how your project is deployed. We use this to calculate real energy and cost baselines — an EC2 instance vs Lambda has a 14× difference in idle compute.', details: ['Cloud provider: AWS, GCP, Azure, or Auto-Detect', 'Compute type: VM, serverless, container, or static', 'Region: we know which regions run on renewable energy', 'CI/CD: frequency and tooling (GitHub Actions, CircleCI, etc.)'] },
  { num: '03', icon: <Scan className="w-6 h-6 text-emerald-400" />, title: 'Five analysis engines run in parallel', desc: 'GreenDev runs five specialised static analysis engines simultaneously. Each focuses on a different dimension of your project\'s environmental impact.', details: ['CI/CD Engine — detects trigger patterns, caching, path filters', 'Docker Engine — checks base images, multi-stage builds', 'Compute Engine — evaluates always-on vs serverless, instance sizing', 'Assets Engine — measures dependency footprint and image optimisation', 'Region Engine — maps your region to carbon intensity data'] },
  { num: '04', icon: <BarChart3 className="w-6 h-6 text-cyan-400" />, title: 'Sustainability score + 5 subscores', desc: 'Your overall score (0–100) is calculated by deducting points for each detected issue. Five category subscores show exactly where to focus.', details: ['HIGH impact issues: −20 pts each', 'MEDIUM impact issues: −10 pts each', 'LOW impact issues: −5 pts each', 'Category grades: A, B, C, D, F per dimension', 'Before/after projection: CO₂ and cost savings'] },
  { num: '05', icon: <FileText className="w-6 h-6 text-emerald-400" />, title: 'AI report in four formats', desc: 'AWS Bedrock (Claude) generates four tailored versions of your report — each optimised for a different audience.', details: ['Plain English — for anyone, no jargon', 'Technical — for engineers and DevOps, implementation detail', 'Sustainability — carbon metrics and environmental context', 'Pitch-Ready — executive summary for stakeholders'] },
];

const ENGINES = [
  { id: 'CI/CD', description: 'Branch filters, path filters, caching, workflow count' },
  { id: 'Docker', description: 'Base image weight, multi-stage builds, .dockerignore, root user' },
  { id: 'Compute', description: 'Always-on VMs, instance sizing, serverless alternatives' },
  { id: 'Assets', description: 'Dependency count, unoptimised images, bundle weight' },
  { id: 'Region', description: 'Carbon intensity tiers, renewable energy data, migration cost' },
];

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

export default function Home() {
  return (
    <div className="bg-black text-white selection:bg-emerald-500/30 font-sans">
      
      {/* Hero Section (3D Experience) */}
      <SignInPage />
      
      {/* Why Green Section */}
      <section id="why-green" className="py-32 px-6 sm:px-12 max-w-7xl mx-auto relative border-t border-white/5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="text-center mb-20 relative z-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm font-medium tracking-wide"
          >
            <Leaf className="w-4 h-4" /> The Problem
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Green code is <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">good code.</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            The cloud is physical infrastructure that consumes real electricity. Every architectural choice a developer makes — which compute service, which region, how often CI runs — has a direct energy cost. Most developers never see that number. We think they should.
          </p>
        </div>
        
        {/* Facts */}
        <div className="mb-24 space-y-12 relative z-10">
          <h3 className="text-3xl font-bold text-center">The numbers that matter</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {FACTS.map((fact, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col sm:flex-row gap-6 p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] hover:border-emerald-500/20 hover:bg-white/[0.05] transition-all duration-500 group ${i === FACTS.length - 1 ? 'lg:col-span-2 lg:mx-auto lg:w-1/2' : ''}`}
              >
                <div className="shrink-0 sm:w-1/3 text-left">
                  <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 leading-none mb-2">{fact.stat}</p>
                  <p className="text-sm font-semibold uppercase tracking-wider text-emerald-500/70">{fact.context}</p>
                </div>
                <div className="flex-1">
                  <p className="text-white/60 leading-relaxed text-lg">{fact.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Principles */}
        <div className="space-y-12 relative z-10">
          <h3 className="text-3xl font-bold text-center">Our Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRINCIPLES.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                <h4 className="text-2xl font-semibold mb-4 text-white/90">{p.title}</h4>
                <p className="text-white/50 leading-relaxed text-lg">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 px-6 sm:px-12 max-w-7xl mx-auto relative border-t border-white/5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        
        <div className="text-center mb-24 relative z-10 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 text-sm font-medium tracking-wide"
          >
            <Zap className="w-4 h-4" /> The Solution
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            How It <span className="text-white">Works</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            From repo URL to actionable sustainability report in under 30 seconds. Here's exactly what happens under the hood.
          </p>
        </div>
        
        <div className="space-y-12 md:space-y-0 relative z-10">
          {/* Vertical timeline line */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 -z-10" />
          
          {STEPS.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15 }}
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 group md:pb-24 last:pb-0 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className={`w-full md:w-1/2 flex justify-start ${i % 2 !== 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                <div className="relative">
                  <div className="text-[6rem] md:text-[10rem] font-black text-white/[0.02] leading-none select-none transition-all duration-700 group-hover:text-emerald-500/5 group-hover:scale-105">
                    {step.num}
                  </div>
                </div>
              </div>
              
              <div className={`w-full md:w-1/2 relative bg-white/[0.02] border border-white/5 p-8 sm:p-10 rounded-[2rem] hover:bg-white/[0.04] transition-colors ${i % 2 !== 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                 {/* Timeline dot */}
                 <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border-4 border-white/20 group-hover:border-emerald-400 transition-colors ${i % 2 !== 0 ? 'md:-right-2' : 'md:-left-2'}`} />
                 
                 <div className={`flex items-center gap-4 mb-6 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                   <div className="w-14 h-14 rounded-full bg-black border border-white/10 shadow-lg flex items-center justify-center group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all shrink-0">
                     {step.icon}
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-bold text-white/90">{step.title}</h3>
                 </div>
                 <p className="text-white/60 text-lg leading-relaxed mb-6">{step.desc}</p>
                 
                 <ul className={`space-y-2.5 ${i % 2 !== 0 ? 'items-end' : ''} flex flex-col`}>
                  {step.details.map((d, j) => (
                    <li key={j} className={`flex items-start gap-3 text-white/50 text-base ${i % 2 !== 0 ? 'flex-row-reverse text-right' : ''}`}>
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500/60" />
                      {d}
                    </li>
                  ))}
                 </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Engine breakdown & Privacy */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold">The Five Analysis Engines</h3>
            <div className="rounded-3xl border border-white/10 bg-white/5 divide-y divide-white/10 overflow-hidden">
              {ENGINES.map(({ id, description }) => (
                <div key={id} className="flex items-center gap-4 px-6 py-5">
                  <span className="text-sm font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">{id}</span>
                  <span className="text-white/60 leading-relaxed">{description}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold">Privacy & Security</h3>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 h-full flex flex-col gap-8">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20 mb-2">We DO access</p>
                {['Public file tree', 'GitHub Actions YAML', 'Dockerfile', 'package.json'].map(t => (
                  <p key={t} className="flex items-center gap-3 text-white/70"><CheckCircle2 className="w-5 h-5 text-green-500/60 shrink-0" />{t}</p>
                ))}
              </div>
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest border border-red-500/20 mb-2">We NEVER access</p>
                {['Source code execution', 'Private repos', 'Secrets or env vars', 'Your AWS account'].map(t => (
                  <p key={t} className="flex items-center gap-3 text-white/70">
                    <span className="w-5 h-5 flex items-center justify-center shrink-0 border border-red-500/50 rounded-full bg-red-500/10"><X className="w-3 h-3 text-red-400" /></span>
                    {t}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 sm:px-12 max-w-7xl mx-auto relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-emerald-900/30 via-black to-slate-900/30 border border-white/10 rounded-[3rem] p-12 md:p-24 relative overflow-hidden backdrop-blur-sm shadow-2xl"
        >
          {/* Decorative glowing orb */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border border-white/10 bg-white/5 text-emerald-300 mb-8 backdrop-blur-md">
              <Leaf className="w-4 h-4" /> Built for the AWS Sustainability Challenge
            </span>
            
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              About <span className="font-serif italic font-light text-emerald-400">GreenDev</span>
            </h2>
            <div className="space-y-6 text-xl text-white/70 leading-relaxed font-light mb-16 max-w-4xl">
              <p>
                We built GreenDev Coach to empower developers to write software that actively respects our planet.
                A sustainability analysis tool that scans public GitHub repositories and gives student developers an actionable roadmap to greener, cheaper cloud deployments.
              </p>
              <p className="text-white/90 font-medium">
                The best time to write green code was before you shipped. The second best time is now.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 mb-16">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">What We Built</h3>
                <div className="space-y-4">
                  {TEAM.map((item, i) => (
                    <div key={i} className="flex items-start gap-5 p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-white/90">{item.name}</p>
                        <p className="text-white/50 mt-1">{item.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Tech Stack</h3>
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  {STACK.map(({ label, value }, i) => (
                    <div key={label} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:px-6 gap-2 ${i !== STACK.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <span className="text-white/50">{label}</span>
                      <span className="font-medium text-white/90 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Link 
              href="/start" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black text-lg font-bold rounded-full hover:bg-emerald-400 hover:text-black hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(52,211,153,0.3)] transition-all duration-300"
            >
              Analyze Your Repository <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-white/5 bg-black z-20 relative">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center justify-center gap-3">
             <Leaf className="w-5 h-5 text-emerald-400" />
             <span className="font-bold tracking-widest uppercase text-sm text-white/80">GreenDev Coach</span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="#why-green" className="hover:text-emerald-400 transition-colors">Why Green</Link>
            <Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</Link>
            <Link href="#about" className="hover:text-emerald-400 transition-colors">About</Link>
          </div>
          <p className="text-white/30 text-sm mt-4">© {new Date().getFullYear()} GreenDev Coach. Built for the AWS Sustainability Challenge.</p>
        </div>
      </footer>
    </div>
  );
}
