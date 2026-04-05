# GreenDev Coach — Tactical Implementation Phases

This document breaks down the "GreenDev Coach — Full Build Prompt" into 7 logical, sequential phases for development. 

### 🚨 Execution Protocol
**The agent must follow these phases in absolute order. Mark each item as completed `[x]` as you progress. Do not begin work on a new phase until the previous phase's quality gates are met and all its tasks are checked off.**

---

## 🟢 Phase 0: The Foundation (Core Setup)
**Goal:** Initialize the project, design system, and global state.

- [ ] **0.1 Initialize Next.js:** Run the `npx create-next-app` command with the flags specified in `Implementation.md`.
- [ ] **0.2 Install Dependencies:** Install all packages (lucide-react, supabase, bedrock, framer-motion, etc.).
- [ ] **0.3 Configure Design System:** 
    - Set up `src/styles/globals.css` with the provided CSS variables and Tailwind v4 imports.
    - Configure fonts (Geist & Cabinet Grotesk).
- [ ] **0.4 Define Types:** Create `src/types/index.ts` and paste the full type system.
- [ ] **0.5 Setup Global State:** Build `src/lib/store.ts` using React Context/Reducer to manage `repoUrl`, `deploymentConfig`, and `scanResult`.
- [ ] **0.6 Basic Layout:** Create `src/app/layout.tsx` with the `ThemeProvider` and global font classes.

---

## 🟡 Phase 1: UI Kit & Core Layout
**Goal:** Build the atomic components and the global navigation wrapper.

- [ ] **1.1 UI Primitives:** Build standalone components in `src/components/ui/`:
    - Button (variants: primary, ghost, danger, icon)
    - Card, Badge, Input, Select, Toggle, SegmentedControl.
- [ ] **1.2 Global Header:** Create `src/components/layout/Header.tsx` with:
    - Inline SVG Logo (Leaf + Cursor).
    - Breadcrumb logic.
    - Dark mode toggle using `next-themes`.
- [ ] **1.3 Navigation Helpers:** 
    - Build `BackButton.tsx` with arrow icon.
    - Build `ProgressBar.tsx` for tracking the 4-step user flow.
- [ ] **1.4 Toast & Modal:** Build `Toast.tsx` and `Modal.tsx` for user feedback and scan cancellation.

---

## 🟠 Phase 2: Analysis Engines & Logic
**Goal:** Implement the "brain" of the application before the UI.

- [ ] **2.1 Utility Clients:** Setup `src/lib/github-client.ts`, `src/lib/bedrock.ts`, and `src/lib/supabase.ts`.
- [ ] **2.2 Analysis Engines:** Build the rule-based logic in `src/engines/`:
    - `ci-analysis.ts`: YAML parsing for triggers/caching.
    - `docker-analysis.ts`: Dockerfile pattern matching.
    - `region-analysis.ts`: Carbon tiering by region.
    - `compute-analysis.ts`: Always-on vs. Serverless logic.
- [ ] **2.3 Scorer & Catalog:**
    - Implement `scorer.ts` with the 100-to-0 point deduction logic.
    - Populate `src/data/recommendations.ts` with the 12 specified catalog entries.
- [ ] **2.4 Mock Generator:** Build `src/data/mock-result.ts` to allow frontend testing even without API keys.

---

## 🔴 Phase 3: The API Layer
**Goal:** Create the core backend endpoints and AI prompt engineering.

- [ ] **3.1 AI Prompts:** Build the prompt generator functions in `src/prompts/` (plain-english, technical, sustainability, pitch).
- [ ] **3.2 GitHub Proxies:** Create `api/github/route.ts` to fetch repo trees and file contents safely.
- [ ] **3.3 Main Analyze Endpoint:** Build `api/analyze/route.ts`:
    - Validation of input.
    - Parallel execution of analysis engines.
    - Bedrock AI invocation (with fallback handling).
    - Supabase persistence.
- [ ] **3.4 Database Setup:** Run the provided SQL in Supabase to create `scans` and `rate_limits` tables.

---

## 🔵 Phase 4: Frontend - Entry & Configuration
**Goal:** Implement the user's first two steps (Home & Form).

- [ ] **4.1 Home Screen:**
    - Build `src/app/page.tsx`.
    - Implement `HeroInput.tsx` with regex URL validation and repo lookup.
- [ ] **4.2 Deployment Wizard:**
    - Build `src/app/analyze/page.tsx`.
    - Implement the 2-step form (StepOneForm: AWS Setup, StepTwoForm: CI/CD Setup).
    - Ensure form persistence in AppContext.

---

## 🟣 Phase 5: Frontend - Scanning & Results
**Goal:** Implement the "Magic Moment" and the outcome dashboard.

- [ ] **5.1 Scanning Screen:**
    - Build `src/app/scanning/page.tsx`.
    - Implement the animated 7-step sequence with `framer-motion`.
    - Wire up the real `POST /api/analyze` call.
- [ ] **5.2 Results Dashboard:**
    - Build `src/app/results/page.tsx`.
    - Implement `ScoreGauge` (animated arc).
    - Build `IssuesList` (accordion) and `RecommendationCard`.
    - Build `BeforeAfterPanel` with metric deltas.
- [ ] **5.3 AI Report View:**
    - Build `src/app/report/page.tsx`.
    - Implement Radix-ui Tabs for the 4 report variants.
    - Implement the `SharePanel` (Copy link / Print / Share).

---

## ⚪ Phase 6: Polish & Deployment
**Goal:** Refine the experience and go live.

- [ ] **6.1 Animations:** Add staggered fade-ins to all cards/lists using `framer-motion`.
- [ ] **6.2 Error States:** Proof every screen for "No data", "Invalid URL", and "Server Down" states.
- [ ] **6.3 Accessibility Audit:** Verify all form labels, aria-labels, and focus traps.
- [ ] **6.4 Mobile Optimization:** Ensure the Sticky Action Bar is usable and transitions are snappy.
- [ ] **6.5 Deployment:** 
    - Configure `vercel.json` with the 45s timeout.
    - Set environment variables in Vercel.
    - Run `vercel --prod`.

---

## 🛠 Execution Rules for the Agent
1. **Never skip types:** Every file must be strictly typed.
2. **Build the Scorer early:** Having a working scoring engine makes building the results UI significantly easier.
3. **Use the Mock Mode:** Keep `NEXT_PUBLIC_USE_MOCK=true` active during UI development to save Bedrock tokens and GitHub rate limits.
4. **Sticky to Design Atoms:** Do not deviate from the CSS variables defined in Phase 0.
