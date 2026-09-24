# Group Finance Ledger

A modern, responsive, and reliable web application for small organizations, clubs, and groups to manage members, recurring monthly payments, expenditures, and financial statements.

---

## 🌟 Key Features

1. **Dashboard**
   - Live month-by-month financial summary (Expected, Collected, Uncollected, Expenses, Net Savings, Collection Rate).
   - Instant month-over-month comparison (August vs. September with visual delta indicators).
   - 6-Month financial overview bar chart (Collected, Expenses, Net Savings).
   - Recent payments and recent expenses feeds.

2. **People Management**
   - Register members once with Full Name, Phone Number, and Expected Monthly Fee.
   - Soft-deactivation workflow (`active: false`) ensuring historical payment records are permanently preserved.
   - Deletion protection preventing deletion of members who have historical payments.
   - Real-time search by name or phone, plus status filtering (All, Active, Inactive).

3. **Person Details & Payment History**
   - Individual member profile displaying contact info, registered date, and expected monthly fee.
   - Full historical payment ledger: Month, Expected Fee, Actual Paid Amount, Date, and Status (`Paid`, `Partial`, `Not Paid`).
   - Quick "Record Payment" button directly from member profile.

4. **Monthly Payments Management**
   - Month & Year selector with quick next/prev navigation.
   - Tabular view of all members with expected contribution, actual amount paid, and status badges (`Paid`, `Partial`, `Not Paid`).
   - Search by member name and filter by status (`All`, `Paid`, `Partial`, `Not Paid`).
   - "Mark as Paid" dialog pre-populating with their expected fee, allowing exact custom amounts for partial or extra contributions.
   - Edit payment amount or remove/correct an erroneous payment with recalculation.

5. **Expenses Management**
   - Add, edit, and delete monthly expenses with description, amount, and date incurred.
   - Monthly expenses summary banner and item count.
   - Search expenses by description.

6. **Financial Reports & Statement**
   - End-of-month financial reconciliation.
   - Collection summary: Expected, Collected, Uncollected, Paid count, Unpaid count, Collection Rate (%).
   - Month-over-month comparative analysis table with positive/negative delta highlights.
   - 6-month historical trend chart.
   - Print-ready and PDF-export friendly layout with clean print styling.

7. **Configurable Currency**
   - Defaults to **ETB** (e.g. `ETB 5,200`), cleanly centralized in `src/lib/currency.ts` or via environment variables.

---

## 🏗 Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router) with TypeScript & React Server Actions
- **Database & ORM**: PostgreSQL via Supabase with Prisma ORM
- **Styling**: Tailwind CSS & custom shadcn/ui components (accessible modals, tables, badges, cards)
- **Charts**: Recharts (responsive bar charts)
- **Validation**: Zod (strict non-negative financial validations)
- **Icons**: Lucide React

```
group-finance/
├── prisma/
│   ├── schema.prisma           # Person, Payment, Expense models & unique constraints
│   └── seed.ts                 # Realistic seed data for testing
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with responsive AppShell
│   │   ├── page.tsx            # Redirects to /dashboard
│   │   ├── dashboard/          # Dashboard page
│   │   ├── people/             # Member directory
│   │   │   └── [id]/           # Member details & historical payments
│   │   ├── payments/           # Monthly payment management
│   │   ├── expenses/           # Monthly expenditure tracking
│   │   └── reports/            # Monthly financial reports
│   ├── components/
│   │   ├── ui/                 # Button, Input, Card, Badge, Dialog, Table
│   │   ├── layout/             # Sidebar, MonthYearPicker, AppShell
│   │   ├── dashboard/          # SummaryCards, CollectionChart, RecentActivity
│   │   ├── people/             # PeopleTable, RegisterPersonModal, EditPersonModal
│   │   ├── payments/           # MonthlyPaymentsTable, MarkPaidModal
│   │   ├── expenses/           # ExpensesTable, AddExpenseModal, EditExpenseModal
│   │   └── reports/            # MonthlyReportView
│   └── lib/
│       ├── prisma.ts           # Global Prisma client singleton
│       ├── currency.ts         # Currency formatting & localization
│       ├── calculations.ts     # Pure financial calculation logic
│       ├── actions/            # Next.js Server Actions (people, payments, expenses, reports)
│       └── validation/         # Zod schemas with non-negative constraints
└── tests/
    ├── calculations.test.ts    # Unit tests for financial formulas and metrics
    └── validation.test.ts      # Unit tests for form validation schemas
```

---

## 🚀 Setup & Local Development

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or pnpm
- A free Supabase PostgreSQL database project (or any PostgreSQL instance)

### 2. Install Dependencies
```bash
git clone <repo-url>
cd group-finance
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Open `.env` and set your Supabase PostgreSQL connection string:
```env
# Supabase PostgreSQL Connection String (Transaction Pooler or Direct Connection)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

# Optional Currency override (defaults to ETB)
# NEXT_PUBLIC_CURRENCY_CODE="ETB"
# NEXT_PUBLIC_CURRENCY_SYMBOL="ETB"
```

### 4. Push Database Schema to Supabase
Run the Prisma push command to create all tables and constraints in your Supabase database:
```bash
npm run prisma:push
```
*(Or use `npm run prisma:migrate` if you prefer formal migration files).*

### 5. Seed Example Data
Populate the database with example members (active and inactive), sample payments (full and partial), and monthly expenses:
```bash
npm run prisma:seed
```

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Run Unit Tests
To verify all calculations, month comparisons, and validations:
```bash
npm test
```

---

## 🗄 Configuring Supabase Database

1. Sign in to [Supabase](https://supabase.com) and click **"New Project"**.
2. Give your project a name (e.g. `group-finance`) and set a strong database password.
3. Once the database is ready, go to **Project Settings** > **Database**.
4. Under **Connection string**:
   - Select **URI**.
   - Copy the URI string: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres` (or Direct port `5432`).
   - Paste this into your `.env` file as `DATABASE_URL`.
5. Run:
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"** > Import your repository.
3. In the Vercel project configuration:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `prisma generate && next build` (Already configured in `package.json`).
4. Add the **Environment Variables**:
   - `DATABASE_URL`: Your Supabase connection string.
   - If using Supabase Connection Pooler (recommended on serverless), use the transaction pooler URL (port 6543) with `?pgbouncer=true`.
5. Click **"Deploy"**.
6. After deployment completes, your Group Finance Ledger is live!

---

## 🧪 Financial Logic Rules Followed

1. **Expected Total**: Calculated dynamically as $\sum \text{monthlyFee}$ for all currently `active` members in that period.
2. **Collected Total**: Sum of actual amounts recorded in `Payment` records for that month and year.
3. **Uncollected Total**: $\max(0, \text{Expected} - \text{Collected})$.
4. **Member Status Classification**:
   - `Paid`: Actual payment $\ge$ member's expected fee.
   - `Partial`: Actual payment $> 0$ and $<$ member's expected fee (counted as paid in count, but uncollected gap remains tracked).
   - `Not Paid`: No payment record or amount $= 0$.
5. **Net Savings**: $\text{Collected Total} - \text{Monthly Expenses}$.
6. **Constraint Safety**: Unique constraint `@@unique([personId, month, year])` guarantees no duplicate payments can exist.
