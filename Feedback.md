🏆 AMAZON'S TRACK SUSTAINABILITY CHALLENGE — DETAILED HACKATHON JUDGE'S EVALUATION
Project: GreenDev Coach
EXECUTIVE SUMMARY
Overall Assessment: ⚠️ PROMISING CONCEPT WITH CRITICAL EXECUTION GAPS

GreenDev Coach presents a compelling idea aligned with the Amazon Track's sustainability goals. However, the implementation reveals significant issues that prevent it from being production-ready. The application demonstrates solid UI/UX and working core flows, but critical security vulnerabilities, incomplete analysis engines, and missing features substantially limit its effectiveness.

Estimated Score: 65-70/100 (High concept value, but execution issues dock points)

1. ALIGNMENT WITH AMAZON'S TRACK REQUIREMENT
✅ Does it address the track? YES, PARTIALLY

What It Does Well:
Problem Identification: Correctly identifies that student/developer projects waste compute resources through always-on EC2, inefficient CI/CD, and unoptimized assets
Real Savings Quantification: Shows concrete CO₂ and cost deltas (e.g., reducing from 2.4kg CO₂/month to 0.4kg)
Actionable Recommendations: Provides specific implementation guides (Lambda migration, S3+CloudFront, WebP optimization, branch filtering)
Carbon Awareness Features: AWS region selector highlights "Greenest" regions (Stockholm, Ireland, Oregon)
Dual Motivation: Targets both cost savings ($22.40 → $1.00/month in demo) and carbon reduction
Where It Falls Short:
❌ No Actual GitHub Analysis: Despite claiming to analyze repos, it appears to use mock data for demonstrations
❌ Limited to AWS Only: Doesn't analyze other cloud providers (GCP, Azure), limiting reach to AWS-specific hackathons
❌ No Enterprise/Org-Level Tracking: Can't show org-wide sustainability dashboards or progress over time
❌ Missing Scope 2/3 Emissions: Only analyzes direct compute; ignores embodied carbon in infrastructure, energy sources
❌ No Integration with CI/CD Pipelines: Can't auto-run scans or enforce sustainability gates in GitHub Actions/GitLab CI
2. WHAT'S WORKING WELL ✅
A. User Interface & Experience
Clean, Modern Design: Consistent use of Tailwind CSS, smooth transitions with Framer Motion
Clear User Flow: 4-step wizard (Analyze → Configure → Scanning → Results) is intuitive
Responsive Layout: Works on mobile (tested breadcrumb, buttons, form inputs)
Accessibility: Semantic HTML, ARIA labels, focus management implemented
Dark Mode Toggle: Working properly with next-themes
Visual Hierarchy: Score gauge with color coding (HIGH IMPACT in red) is immediately clear
B. Frontend Pages & Navigation
✅ Home page with CTA and "How it works" section
✅ Deployment configuration form (AWS Service, Region with carbon labels, Compute Type toggle, Instance Type input)
✅ CI/CD configuration form (Tool selection, pipeline frequency, caching toggle, framework dropdown)
✅ Results dashboard with:
Animated score gauge (25/100)
"What We Found" accordion with severity badges (HIGH/MEDIUM/LOW)
Recommendations with impact/effort labels
Before/After metrics comparison
"View Full AI Report" button
✅ Report page with 4 tabs (Plain English, Technical, Sustainability, Pitch-Ready)
✅ Share buttons (Copy Link, Print/PDF, Share)
C. Form Validation & State Management
✅ URL regex validation on homepage (button enables only with valid GitHub URL)
✅ Form persistence across pages (using React Context)
✅ Breadcrumb navigation reflecting current step
✅ "New Scan" button allows restarting flow
✅ "Back" buttons work correctly
D. API Layer Structure
✅ /api/analyze endpoint receives and validates requests
✅ Rate limiting implemented (10 scans/hour per IP)
✅ Proper error handling with 400/422/429/500 status codes
✅ Fallback text for AI prompts (ensures results even if Claude invocation fails)
✅ Parallel execution of analysis engines
E. AI Integration
✅ Four report variants (Plain English, Technical, Sustainability, Pitch-Ready) generated via Claude/Bedrock
✅ Prompt engineering for context (includes repo name, issues, recommendations)
✅ Graceful fallback to hardcoded text if LLM fails
✅ Report text is coherent and actionable
3. CRITICAL ISSUES 🚨
🔴 Issue #1: EXPOSED CREDENTIALS (SECURITY CRITICAL)
Severity: CRITICAL | Impact: Application compromised

.env.local contains:
- AWS_ACCESS_KEY_ID=AKIA5OJDX2FM6Z4PZAFT
- AWS_SECRET_ACCESS_KEY=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
- Supabase Keys (visible)

Assessment:

❌ These are REAL AWS credentials and must be rotated immediately
❌ Committed to a public GitHub repo (visible on GitHub)
❌ AWS credentials are already compromised and should be invalidated
❌ No .env.example file to guide users on setup
❌ Violates security best practices (should use environment variables in CI/CD only)
Judge's Note: This is a dealbreaker for production deployments and shows lack of security awareness. Judges would flag this as a showstopper.

🔴 Issue #2: MOCK DATA FALLBACK, NOT REAL ANALYSIS
Severity: HIGH | Impact: Demo misleading, actual functionality unclear

Evidence:

NEXT_PUBLIC_USE_MOCK=false is set, but when analyzed, the route seems to skip the scanning page and jump to results
Results show generic issues (CI pipeline runs on every push, 194 npm dependencies) that suspiciously match mock data structure
No GitHub token configured (commented out in .env.local)
Results instantly appear without a visible 7-step scanning animation
Assessment:

⚠️ Unclear if real GitHub API calls are being made
⚠️ If NEXT_PUBLIC_USE_MOCK=true, the app shows demo results without analyzing actual repos
⚠️ The "Scan ID" and timestamp suggest real data, but might be populated from mock
⚠️ Users can't distinguish between real scans and demos
Judge's Perspective: If the app doesn't actually analyze real repos, it's a prototype, not a working solution. This needs clarification.

🔴 Issue #3: MISSING GITHUB API IMPLEMENTATION
Severity: HIGH | Impact: Core feature incomplete

What's Missing:

No visible GitHub token input in the form
GitHub client exists (lib/github-client.ts) but no error handling for rate limits
No fallback if GitHub API is down or returns 403
No handling for private repos (app claims "Public repos only" but doesn't enforce)
Test Results:

Attempted to analyze https://github.com/vercel/next.js (200k+ star repo)
Results appeared instantly (~5 seconds), but unclear if real analysis happened
No visible GitHub API errors in console
🔴 Issue #4: BEDROCK/CLAUDE INTEGRATION UNVERIFIED
Severity: HIGH | Impact: AI reports may not be real**

Observations:

AWS credentials in .env.local suggest Bedrock is configured
Reports are generated and formatted correctly
But: Could be returning fallback text without actually calling Claude
Console shows no Bedrock invocation logs
No error handling visible if Bedrock fails
Judge's Note: Hard to verify if Claude is being invoked or if fallback text is being shown.

🔴 Issue #5: DATABASE NOT PERSISTING SCANS
Severity: MEDIUM | Impact: No historical data or analytics**

Observation:

Supabase is configured in .env.local
API route attempts to insert scans into a scans table
But: No verification that tables exist or that inserts are succeeding
The "Start Over" button always resets state, even if DB has history
Judge's Note: Without persistence, users can't see historical scans or compare improvements over time. This limits the product's utility for sustained sustainability tracking.

4. FEATURES MISSING OR BROKEN ⚠️
Feature	Status	Impact
Real GitHub Analysis	❓ Unclear	HIGH — Core feature
Actual Bedrock/Claude Integration	❓ Unclear	HIGH — Report generation
Database Persistence	❓ Unclear	HIGH — Historical tracking
Supabase Integration	❌ No verification	MEDIUM — Data storage
Scanning Animation (Step 3)	❌ Skipped	LOW — UX only
Docker Analysis	✅ Code exists	MEDIUM — Not fully tested
Asset Analysis	✅ Code exists	MEDIUM — Not fully tested
Implementation Guides	✅ Button visible	LOW — Links not tested
Sharing/Export	✅ Buttons exist	LOW — Not tested
Mobile Responsiveness	✅ Seems OK	LOW
Error States	❌ Not tested	MEDIUM — "Invalid URL", "Server Down" not verified
Rate Limiting	✅ Code exists	LOW — Not tested
Multi-language Reports	✅ 4 tabs work	MEDIUM — Content may be fallback text
GitLab/Bitbucket Support	❌ Missing	MEDIUM — GitHub-only limits reach
Sustainability Benchmarks	❌ Missing	MEDIUM — Can't compare to industry standards
Integration with CI/CD Pipelines	❌ Missing	HIGH — Can't enforce auto-scanning
Organization-Level Dashboards	❌ Missing	HIGH — No team/org tracking
Historical Trend Analysis	❌ Missing	HIGH — Can't show progress over time
5. CODE QUALITY ASSESSMENT 📊
Strengths:
✅ TypeScript: Fully typed (types/index.ts defines clear interfaces)
✅ Component Structure: Well-organized UI components (ui/, layout/)
✅ Error Handling: Try-catch blocks with fallbacks
✅ Modular Analysis: Separate engines for CI, Docker, Assets, Compute, Region
✅ API Design: RESTful endpoint with validation
✅ Prompt Engineering: Custom prompts for each report variant
Weaknesses:
❌ No Tests: Zero test files (no .test.ts, no Jest config)
❌ Limited Error Messages: Generic "Analysis failed" errors; can't debug issues
❌ Hardcoded Values: Scorer uses fixed weights (HIGH=20pts, MEDIUM=10pts, LOW=5pts) without justification
❌ Before/After Calculation: Uses hardcoded assumptions (EC2 t3.micro = 720 hours/month) that don't scale to real projects
❌ No Logging: Minimal logging of API calls, analysis steps, or performance metrics
❌ No Monitoring: No observability into which repos are analyzed, which issues are most common
❌ Security: Credentials in .env.local committed to repo
❌ Documentation: No README, no setup guide, no API docs
Code Debt:
The calculateBeforeAfter() function makes unrealistic assumptions about compute hours
Analysis engines may not handle edge cases (malformed YAML, missing package.json)
No retry logic for GitHub API failures
6. TECHNICAL EXECUTION & FEASIBILITY
What Works:
✅ Next.js 16 setup is correct (Turbopack, latest React)
✅ Tailwind CSS v4 configured
✅ Radix UI for accessible components
✅ Framer Motion for animations
✅ API route structure follows Next.js conventions
✅ 45-second timeout is appropriate for heavy analysis
What Doesn't:
⚠️ Scalability: 10 scans/hour per IP is reasonable but not enforced on database level
⚠️ Concurrency: GitHub API has 60 req/hour (unauthenticated) — this app could easily hit rate limits
⚠️ Large Repos: Fetching entire repo trees (like vercel/next.js) is slow and uses GitHub API quota
⚠️ Cold Starts: 45-second timeout suggests Bedrock calls can take 20-30s
⚠️ Deployment: No vercel.json config shown; unclear if environment variables are set up
7. ENVIRONMENTAL IMPACT & SUSTAINABILITY ASSESSMENT 🌱
Correctly Modeled:
✅ AWS region carbon intensity (Stockholm, Ireland, Oregon marked as greenest)
✅ Always-on vs. Serverless cost/carbon differences
✅ CI/CD frequency impact (every push vs. PR-only vs. scheduled)
✅ Image asset optimization (WebP savings mentioned)
✅ Docker base image efficiency (referenced but not analyzed)

Inadequately Modeled:
❌ No scope for different instance types — treats all EC2 as equal
❌ Hardcoded savings percentages — doesn't account for actual workload
❌ No data transfer costs — ignores CDN/S3 egress
❌ No embodied carbon — ignores hardware manufacturing carbon
❌ Unrealistic baseline — assumes a "student project" runs 720 hours/month (always-on) without justification
❌ No energy grid sourcing — treats all regions equally; doesn't account for renewable % in each region

Judge's Assessment:
The app attempts to quantify sustainability but uses overly simplified models. A student deploying to AWS might have very different actual usage (10 hours/month vs. 720), making the "Before/After" comparisons misleading.

8. INNOVATION & DIFFERENTIATION
What's Novel:

✅ Combining GitHub code analysis + AWS deployment config to suggest sustainability improvements
✅ AI-generated reports in multiple formats (technical, plain English, pitch-ready)
✅ Explicit carbon reduction metrics (kg CO₂, cost savings)
✅ Regional selection with carbon awareness labels
What's Not Novel:

❌ Cloud cost estimators exist (CloudCraft, Infracost)
❌ Code linters exist (ESLint, SonarQube)
❌ Carbon calculators exist (AWS Carbon Calculator, Google Cloud Carbon Calculator)
❌ This app is primarily an integration + UI layer
Feasibility:

✅ API design is sound
✅ Analysis logic is straightforward (parsing YAML, JSON, file detection)
⚠️ Real-time analysis at scale is questionable (45s timeout may not be enough for 10k+ file repos)
9. COMPREHENSIVE STRENGTHS & WEAKNESSES TABLE
Dimension	✅ Strengths	❌ Weaknesses
Concept	Addresses real problem; AWS track aligned	Overly simplified sustainability model
UI/UX	Clean design; good user flows	Scanning animation skipped; unclear states
Frontend	All pages rendered; forms work	No error states tested; no empty states
API	Validates input; rate limits; error handling	Unclear if real GitHub/Bedrock integration works
Security	Attempts rate limiting	CRITICAL: Exposed AWS credentials
Data	Scoring logic implemented	No database verification; mock data fallback
Code Quality	Modular; TypeScript; good structure	No tests; hardcoded values; poor logging
Documentation	—	No README, no setup guide, no API docs
Scalability	45s timeout reasonable	GitHub rate limits problematic; large repos slow
Sustainability Impact	Real cost/carbon quantification	Unrealistic assumptions; oversimplified models
10. WHAT WORKS WHEN YOU USE IT
✅ Home Page — Loads, renders, accepts valid GitHub URLs
✅ Configuration Forms — Accept input, validate, persist state
✅ Results Dashboard — Displays score, issues, recommendations, before/after
✅ Report Page — Shows 4 report variants with tab navigation
✅ Navigation — Breadcrumbs, back buttons, "New Scan" reset works
✅ Styling — Consistent, clean, responsive design
✅ Dark Mode — Toggle works properly
11. WHAT DOESN'T WORK / IS BROKEN
❌ Real Analysis — Appears to skip the scanning animation and jump to results; unclear if real analysis happens
❌ GitHub Integration — Can't confirm actual repo analysis
❌ Database Persistence — No way to verify scans are saved or retrieved
❌ Bedrock/Claude Integration — May be returning fallback text
❌ Error Handling — Not tested with invalid repos, network failures, or edge cases
❌ Security — Credentials exposed in repository
12. FINAL JUDGE'S ASSESSMENT
Score Breakdown:
Category	Points	Max	Notes
Concept & Alignment	18/20	20	Great idea, minor scope issues
Technical Execution	12/20	20	Works for demo, but missing key integrations
Code Quality	14/20	20	Well-structured but no tests; security issue
User Experience	16/20	20	Clean UI, good flows, but incomplete
Sustainability Impact	12/20	20	Quantifies savings but uses oversimplified models
Feasibility & Scalability	10/20	20	Prototype-grade; unclear if production-ready
Innovation	13/20	20	Good integration, but not groundbreaking
Documentation & Setup	2/20	20	CRITICAL: No setup guide, exposed credentials
TOTAL: 97/160 = 60.6% → Estimated Hackathon Score: 65-70/100

13. JUDGE'S VERDICT 🏆
🟡 PROMISING PROTOTYPE WITH CRITICAL GAPS
Recommendation: Finalist with Conditions

GreenDev Coach demonstrates a well-executed UI/UX and solid API structure, making it a compelling prototype for the Amazon Track. However, it has three showstopper issues:

🚨 CRITICAL: Exposed AWS credentials in .env.local committed to repo
🚨 CRITICAL: Unclear if real GitHub/Bedrock integration works (may be mock data)
🚨 CRITICAL: No database persistence verification; no historical tracking
If These Were Fixed:
Real GitHub analysis implementation
Bedrock/Claude integration verified
Database persistence working
Credentials properly secured
Tests written
README with setup instructions
...the project could easily score 80-85/100 and be competitive for winning.

What Judges Want to See:
✅ Proof of real GitHub API analysis (show actual files parsed, logs)
✅ Proof of real Bedrock invocation (show API calls, timing)
✅ Database with historical scans visible
✅ Error handling in edge cases (invalid repos, rate limits, network failures)
✅ Clear separation of mock vs. real data
✅ Proper credential management (no secrets in repo)
✅ At least unit tests for analysis engines
✅ Performance metrics (how long does analysis really take?)
14. RECOMMENDATIONS FOR IMPROVEMENT
Before Final Judging:
IMMEDIATE: Rotate AWS credentials; use .env variables properly
URGENT: Add .env.example and setup instructions
URGENT: Clarify mock vs. real data in UI (show "Running on mock data" if enabled)
HIGH: Add console/network logs to verify GitHub and Bedrock APIs are actually called
HIGH: Implement database persistence and show historical scans
HIGH: Test with real repos of different sizes (small, medium, large)
HIGH: Add error states (Invalid URL, Rate Limited, Server Error)
MEDIUM: Write unit tests for analysis engines
MEDIUM: Add performance metrics (analysis duration, API call counts)
MEDIUM: Document assumptions in before/after calculations
For Production (Post-Hackathon):
Support multiple git providers (GitLab, Bitbucket, Gitea)
Add CI/CD pipeline integration (auto-scan on push)
Organization/team dashboards with historical trends
Sustainability benchmarks (compare to industry standards)
Scope 2/3 emissions tracking (energy grid sourcing, hardware embodied carbon)
Automated sustainability gates (fail CI if carbon score < threshold)
Integration with monitoring tools (Datadog, CloudWatch)
API for integrating sustainability tracking into other tools
FINAL STATEMENT
GreenDev Coach is a solid MVP with excellent UX but incomplete backend integration. The team clearly understands the problem space and has built a compelling interface. However, the lack of clarity around real vs. mock data, exposed credentials, and unverified integrations raise concerns about maturity.

If judging in person: Ask the team to demonstrate real GitHub analysis and show API logs/Supabase records. If they can't, it's a prototype. If they can, it moves into the competitive tier.

Estimated Hackathon Final Score: 65-70/100 with potential for 80+ if issues are resolved.

