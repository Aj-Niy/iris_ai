# IRIS — Merchant Growth AI

> **The AI Growth Operator for Neighbourhood Retailers**  
> *From payment signals to smarter stock, stronger margins, and measurable growth.*

---

## 1. Project Overview

**IRIS — Merchant Growth AI** is a decision-and-action layer designed for owner-operated neighbourhood retailers (kiranas, stationery shops, general stores). Traditional tools show merchants what happened yesterday; IRIS predicts what is likely to happen next, recommends a prioritized action plan, and executes permitted merchant drafts with explicit human approval.

### The Core Loop
$$\text{Predict} \longrightarrow \text{Prioritize} \longrightarrow \text{Act + Learn}$$

1. **Predict:** Forecasts item-level demand over **7, 14, and 30-day horizons** using historical baselines and local calendar/festival events (e.g., Diwali festive week, school exam cycles).
2. **Prioritize:** Identifies products that contribute most to cash gross profit, detects imminent stockouts before supplier lead times expire, and flags stagnant dead stock.
3. **Act + Learn:** Prepares editable action drafts (supplier reorders, margin-protected bundles, payment downtime troubleshooting). No action executes without explicit merchant approval.

---

## 2. Visual System & Design Truth

Built to strictly adhere to the provided Figma design system:
- **Light, High-Contrast Canvas:** Clean `#F4F5F7` background with crisp white content cards and subtle borders (`#E5E7EB`).
- **Figma Dark Overview Hero:** High-contrast dark slate card (`#111318` to `#1C1F26`) displaying the merchant greeting, daily turnover metrics, and a circular progress ring.
- **Consistent Navigation:** Persistent left sidebar on desktop with active dark pill indicators (`#111827`) and a responsive drawer for mobile/tablet screens.
- **Restrained Typography & Language:** Clean Plus Jakarta Sans and Inter type scales with plain business terms (*"Expected sales in the next 14 days"*, *"Profit after product cost"*).
- **Anti-Hype Guardrails:** No floating AI orbs, no glassmorphism, no fake chat bubbles, and no neon gradients.

---

## 3. Implemented Routes & Capabilities

| Route | Page | Purpose & Interactive Features |
|---|---|---|
| `/dashboard` | **Operating Dashboard** | Real-time control panel with 14-day sales trend chart, 4 compact KPIs, festival progress widget, top 3 prioritized action cards, demand watchlist, and profit leaders. |
| `/demand` | **DemandLens** | Interactive **7, 14, and 30-day forecast horizon switcher**. Displays forecast unit trajectory with shaded confidence bands, baseline comparison (`+140%`), and sparse-data confidence warnings. |
| `/profit` | **Profit Radar** | True unit economics ranking. Shows Revenue vs Gross Profit contrast (**Notebooks** generate highest profit; **Recharge Tokens** have high revenue but razor-thin margin). Handles missing cost data honestly. |
| `/inventory` | **Inventory Signals** | Days of stock cover, supplier lead times, and deterministic reorder quantities. Clicking **"Review Reorder"** opens an editable modal to adjust quantity and supplier notes before creating a draft. |
| `/actions` | **Daily Action Plan** | Prioritized actions (`Suggested` $\rightarrow$ `Draft` $\rightarrow$ `Approved` $\rightarrow$ `Simulated Complete`, plus `Cancelled` and `Failed`). Features a demonstrable safe retry/escalation state for failed tools. |
| `/payments` | **Payment Health** | 30-day collection volume, success rate trends, and failure code diagnostics (U19 bank downtime). Includes a **"Create Payment Support Task"** button that routes to Action Plan. |
| `/products-data` | **Products & Data** | Complete product catalogue with inline editing, data requirement explanations, sample CSV template download, and a **client-side CSV parser with validation**. |
| `/settings` | **Settings & Preferences** | Store metadata, Indian Rupee (`₹`) configuration, Hindi/Hinglish language preview, and a working **"Reset Demo Data"** action. |

---

## 4. Coherent Synthetic Dataset & Scenario Reconciliation

All 8 routes read from a unified, typed data layer (`src/data/demoData.ts` & `src/lib/calculations.ts`):
- **Illustrative Scenario — Warm White LED Fairy Lights (SKU-DL-01):**
  - 14-day forecast: **180 units** (illustrative range: **145–215**)
  - Current stock on hand: **65 units**
  - Supplier lead time: **5 days** (Deepak Electrical Wholesale)
  - Stockout risk: **Critical** (65 units $\div$ 12.8 units/day $\approx$ 5.1 days cover, matching lead time)
  - Suggested reorder: **130 units** (~₹16,900 purchase cost)
- **Top Gross-Profit Item — Classmate A4 Notebook 6-Pack (SKU-NB-01):**
  - Selling price: ₹360, Unit cost: ₹210 $\rightarrow$ **₹150 GP / 41.7% margin**.
  - Generated ₹13,800 gross profit over past 14 days (ranks #1 in profit).
- **High-Revenue / Low-Margin Contrast — Recharge Vouchers (SKU-RC-01):**
  - Selling price: ₹500, Unit cost: ₹485 $\rightarrow$ **₹15 GP / 3.0% margin**.
  - Generated ₹32,000 top-line revenue, but only ₹960 cash profit. Proves that highest revenue $\neq$ highest profit.
- **Sparse History Item — Handcrafted Diya Set (SKU-DY-01):**
  - Only 4 days of sales history recorded. IRIS explicitly displays **"Low Confidence"** rather than false precision.
- **Missing Cost Item — Acrylic Rangoli Stencils (SKU-AC-01):**
  - Unit cost is undefined. IRIS displays an honest **"Cost data needed"** badge and refuses to fabricate gross profit.
- **Demonstrable Failure State — Consented WhatsApp Offer (ACT-2026-000-HIST):**
  - Explicitly shows tool failure (`DLT-403: SMS template ID pending approval`) with a safe **"Retry & Escalate"** button.

---

## 5. Getting Started & Running Locally

### Prerequisites
- Node.js v18+ (tested on Node v25.6.1)
- npm v9+

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production (TypeScript + Vite)
npm run build

# 4. Preview production build
npm run preview
```
The application will launch at `http://localhost:5173/`.

---

## 6. Architecture & File Structure

```
src/
├── types/                 # Shared TypeScript interfaces (Product, Forecast, Action, Txn)
├── data/                  # Coherent synthetic dataset & seasonal calendar
├── lib/                   # Deterministic formulas (Revenue, Gross Profit, Reorder Qty)
├── services/              # LocalStorage persistence & factory reset service
├── components/
│   ├── common/            # AppShell, Sidebar, Topbar, KpiCard, Modal, Drawer, Toast
│   ├── charts/            # SVG charts (Sales trend, Forecast curves, Payment trends)
│   └── modals/            # ReorderModal, ActionDetailDrawer
├── pages/                 # 8 route views
├── App.tsx                # App root with hash routing & modal controllers
└── main.tsx               # DOM entry point
```

---

## 7. Demo Walkthrough Script

1. **Dashboard (`/dashboard`):** Review 14-day sales (₹1,26,450), inspect the dark overview card and 75% target ring, and review the top 3 priority actions.
2. **DemandLens (`/demand`):** Switch horizon between **7, 14, and 30 days**. Note how the chart updates dynamically with shaded confidence bounds (145–215 units for Fairy Lights). Inspect the low-confidence warning on Handcrafted Diyas.
3. **Profit Radar (`/profit`):** Observe why Notebooks (₹13,800 GP) outrank Recharge Vouchers (₹960 GP) despite similar revenue. Filter by "Dead-stock Candidate" to see ageing Gel Pens.
4. **Inventory Signals (`/inventory`):** Review stock cover and lead times. Click **"Review Reorder"** on Fairy Lights, edit the quantity to 130 units, and click **"Save Reorder Draft"**.
5. **Daily Action Plan (`/actions`):** View the saved draft. Click **"Approve"**, then click **"Simulate Execution"** to verify the state transition and audit trail. Test the failed action retry button.
6. **Payment Health (`/payments`):** Examine the 30-day payment trend and the Oct 26 failure spike. Click **"Create Payment Support Task"** to escalate a cashier guidance action. Refresh the page to confirm local persistence!
7. **Settings (`/settings`):** Review merchant metadata and click **"Reset Demo Data"** to restore factory fixtures.
