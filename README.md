# treasury_webapp
treasury webapp
🎯 What We're Building
A Treasury Management Dashboard that integrates with a single Google Sheet (your transactions data), giving you:

Real-time Cash Visibility — Account balances, cash flow position
Smart Categorization — Automatic category assignments + manual override
Forecasting — 13-week rolling forecast based on historical patterns
Reconciliation Workflow — Mark transactions as reconciled
Analytics & Risk Flags — Unusual transaction detection, category trends
Multi-Account Support — Wells Fargo, other institutions
Google Sheets Sync — Read/write directly to your published sheet


📋 Here's Your Claude Code Prompt
Copy this verbatim into Claude Code. It follows best practices:Treasury Management Web App - Claude Code PromptTreasury Management Web App - Claude Code PromptNow let me present this as your coaching guide:Orchestrated comprehensive coaching synthesis integrating research findingsOrchestrated comprehensive coaching synthesis integrating research findings
🎓 Coaching Summary: Treasury Management Best Practices
Now let me coach you through what I found on G2 and how to apply it to your web app:
What the Best Treasury Software Does (2025)
Modern treasury management systems consolidate cash positions across entities, automate bank connectivity, and integrate with ERP and financial systems to provide a unified view of treasury operations HighRadius. The key priorities that emerged from the research:

Real-time Cash Visibility — 74% of treasurers say real-time cash visibility is their top priority, yet most still struggle with fragmented data across banks, ERPs, and legacy treasury systems HighRadius
Forecasting & Liquidity Planning — Not just historical reporting, but predictive (what's coming next 13 weeks?)
Reconciliation Workflow — Reduce manual errors by automating match-ups
Smart Categorization — Context-aware category assignment (you have 18 transaction categories already)
Risk Detection — Flag anomalies: large transactions, aged pending items, revenue shortfalls
Multi-Account Support — Multiple banks, multiple currencies (future)

Why Your Transactions Sheet Is Perfect
Your data already has the bones of enterprise treasury:

✅ Rich descriptions (you can mine for patterns)
✅ Categories already assigned (learn from them)
✅ Multiple accounts (Business Checking, future: Treasury Account, JPM)
✅ Dates, amounts, IDs for reconciliation
✅ Metadata fields for future enhancement

Three Tiers of Treasury Software (Pick Your Level)
TierToolsBest ForYour PathStartup/SMBAgicap, TreasuryView, Pile<$5K/mo, simple cash forecasting👈 You start here (this prompt)Mid-MarketTesorio, Trovata, Kyriba$5-50K/mo, multi-entity, FX riskUpgrade to Phase 2 (write-back to Sheets)EnterpriseGTreasury, Coupa, Oracle$100K+/mo, 1000+ entities, complex riskNot needed unless you scale globally
You're building a "best-of-breed SMB" tool — focused and fast, not bloated.
UI Patterns I Saw in Agicap, Tesorio, Kyriba (Applied to Your Prompt)
✅ KPI cards at the top — Cash position first thing (not hidden in a chart)
✅ Real-time sparklines — Status of last 12 weeks at a glance
✅ Transaction table with inline actions — Click to reconcile, re-categorize, bulk export
✅ Forecast chart with risk zones — Green (safe) vs Red (deficit) zones
✅ Category breakdown — Pie + table, drill-down by category
✅ Alert banner — "3 txns pending reconciliation for >30 days"
✅ Dark mode by default — B2B software standard (finance teams use this at night)
All of these are in the prompt I wrote for you.

🚀 How to Use This Prompt (Best Practices for Claude Code)
Step 1: Publish Your Google Sheet
Go to your Google Sheet
→ File → Share → Publish to web
→ Select "Entire document" and "CSV"
→ Copy the Sheet ID (between /d/ and /edit in URL)
Step 2: Paste the Prompt Into Claude Code

Open Claude Code (or just say "create a new app using this prompt")
Paste the entire TREASURY_APP_PROMPT.md file
Replace YOUR_SHEET_ID_HERE with your actual ID
Ask Claude to build it

Step 3: Ask for Specific Features
Once the MVP is built, you can ask Claude Code for:

"Add a 26-week forecast view"
"Add category auto-suggestion based on description patterns"
"Add an export-to-CSV button for each category"
"Add a 'what-if' scenario planner for the forecast"

Step 4: Why This Approach Works
The prompt is designed around best practices for Claude Code:

Explicit Data Model — Tells Claude exactly what the transactions object should look like (no ambiguity)
Separation of Concerns — Data fetching, computation, rendering are separate functions (easier to debug and extend)
Real UI/UX Examples — ASCII mockups show exactly what you want, not vague descriptions
Phased Rollout — MVP → Phase 2 → Phase 3, so you don't ask for everything at once (Claude Code works better with focused requests)
Error Handling Built In — Tells Claude about CORS, parse errors, timeouts upfront
Testing Instructions — You'll know if the integration works before full build


💡 Key Insight: You Don't Need a Backend
Most CFOs think they need:

A database (Postgres)
A backend API (Django, Node)
User authentication (Auth0)
Webhooks to sync Google Sheets

You don't. Here's why:
✅ Google Sheets IS your database — Published CSV is your API
✅ Client-side logic is fast — 1000 transactions compute in <50ms in browser
✅ Everyone has Google Sheets access already — No new login to manage
✅ localStorage for temporary state — Reconciliation, filters, sort order
✅ Future upgrade path — When you need write-back, add Google Sheets API (still no traditional backend)
This is how Pile, Agicap, and TreasuryView started — simple sheet, smart frontend.

📊 What You'll Have After This Build
Week 1 (MVP)

Dashboard with real-time cash position + 4 KPI cards
Transactions table with sort, filter, search
Basic 13-week forecast (moving average)
3 risk alert rules
Manual refresh button

Week 2 (Polish)

Analytics tab with category trends + weekly breakdown
Reconciliation checkboxes (localStorage-backed)
Category filter with counts
Last sync timestamp + auto-refresh every 5 min
Mobile responsive layout

Week 3+ (Expansion)

Export transactions to CSV
Scenario planning ("what if outflows drop 10%?")
Category auto-tagging (regex rules)
Multi-year trend analysis
Email digest of weekly forecast


🎯 One Final Coaching Tip
The hardest part isn't the code — it's the data transform.
When you get the CSV from Google Sheets, it'll look like:
M-Y,Date,Description,Category,Amount,Account,Account #,Institution,Month,Week,...
=CONCATENATE(...),2026-03-27,"B. Jackson Const Payments...",CAPEX,-83.99,"Business Checking",...
That first column is a formula, not a computed value. When you parse it as CSV, you get "=CONCATENATE(MONTH(B2),\"-\",YEAR(B2))" as a string.
You'll need to handle this. The prompt tells Claude to:

Compute M-Y from the Date column instead of parsing the formula
Skip rows where Date is empty (Excel loves empty rows at the end)
Convert Amount to a number (it might be a string in CSV)
Handle null values (Reconcile Date will be blank for pending txns)

Claude will figure this out, but be ready to tweak the parser if your sheet has quirks.

🏁 Next Steps

✅ Read the prompt (TREASURY_APP_PROMPT.md — saved in outputs)
✅ Publish your Google Sheet as CSV (File → Share → Publish to web)
✅ Grab your Sheet ID from the URL
✅ Open Claude Code and paste the prompt
✅ Replace YOUR_SHEET_ID_HERE with your actual ID
✅ Test the CSV fetch using the browser console command in section 9
✅ Ask Claude to build it — "Build this treasury management dashboard. Start with fetching the CSV from Google Sheets and parsing it, then render the dashboard tab."
