# ⛳ Golf Charity Subscription Platform

> **Full-Stack Development Trainee Assessment — Digital Heroes**
> Built by **Kartik** in response to the PRD issued by Digital Heroes for the Full-Stack Development Trainee Selection Process.

---

## 🔗 Live Demo

| Panel | URL |
|-------|-----|
| 🌐 Frontend (Vercel) | *(your Vercel deployment URL)* |
| 🔧 Backend API (Vercel) | *(your backend Vercel deployment URL)* |

---

## 🔑 Test Credentials

### 👑 Admin Panel
> Login at `/login` and you'll be automatically redirected to `/admin`

```
Email:    info.kartik2003@gmail.com
Password: admin123
```

### 👤 User Panel
> Subscribers can self-register at `/register`
> Choose a plan → select a charity → set contribution % → done.

### 💳 Stripe Test Payment Card
> Use these details when prompted for payment on the Stripe checkout page

```
Card Number:  4242 4242 4242 4242
Expiry Date:  Any future date (e.g. 12/29)
CVV:          Any 3 digits (e.g. 123)
Name/ZIP:     Any value
```

---

## 📋 Project Overview

This is a **subscription-based golf platform** that combines:

- 🏌️ **Golf Performance Tracking** — Stableford score entry with a rolling 5-score window
- 🎰 **Monthly Prize Draw Engine** — Random or algorithmic (frequency-weighted) draw with 3/4/5-match prize tiers
- ❤️ **Charity Integration** — Every subscriber directs a minimum 10% of their fee to a verified charity
- 🛠 **Admin Control Panel** — Full user, draw, charity, and winner management with real-time analytics

---

## 🧱 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | SPA framework |
| React Router v6 | Client-side routing with protected routes |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & micro-interactions |
| Supabase JS Client | Auth (JWT) + direct DB access |
| Stripe React SDK | Payment elements |
| Recharts | Analytics charts |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| Supabase (PostgreSQL) | Database + Auth |
| Stripe | Subscription payments + webhooks |
| Resend | Transactional email |
| Helmet + Rate Limiting | Security hardening |
| Vercel | Serverless deployment |

---

## 🗂 Project Structure

```
root/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/            # Home, Charities, How It Works, Pricing
│   │   │   ├── auth/              # Login, Register, Forgot Password
│   │   │   ├── dashboard/         # User dashboard pages
│   │   │   └── admin/             # Admin panel pages
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, Footer, DashboardLayout
│   │   │   └── ui/                # Button, Card, Input, Spinner
│   │   ├── context/               # AuthContext (JWT + profile sync)
│   │   ├── routes/                # AppRouter + ProtectedRoute
│   │   ├── lib/                   # Supabase client
│   │   ├── constants/             # Plans, prize tiers, score limits
│   │   └── styles/                # Global CSS + Tailwind layers
│   └── vercel.json
│
└── server/                        # Express API
    ├── src/
    │   ├── routes/
    │   │   ├── auth.routes.js          # Profile sync & update
    │   │   ├── scores.routes.js        # CRUD golf scores
    │   │   ├── draw.routes.js          # Draw management & execution
    │   │   ├── charity.routes.js       # Charity directory & contributions
    │   │   ├── subscription.routes.js  # Stripe checkout, cancel, verify
    │   │   ├── winners.routes.js       # Winner records
    │   │   └── admin.routes.js         # Full admin API
    │   ├── services/
    │   │   └── drawEngine.service.js   # Core draw logic
    │   ├── middleware/
    │   │   ├── auth.js                 # JWT verify + admin guard
    │   │   └── errorHandler.js
    │   ├── config/
    │   │   ├── supabase.js
    │   │   └── stripe.js
    │   └── webhooks/
    │       └── stripe.webhook.js       # Stripe event handler
    └── vercel.json
```

---

## ⚙️ Setup & Local Development

### Prerequisites
- Node.js >= 20
- A Supabase project (new, not personal)
- A Stripe account (test mode)
- A Vercel account (new, not personal)

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/golf-charity-platform.git
cd golf-charity-platform
```

### 2. Configure the Backend

```bash
cd server
cp .env.example .env
```

Fill in your `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
CLIENT_URL=http://localhost:5173
PORT=5000
```

```bash
npm install
npm run dev
```

### 3. Configure the Frontend

```bash
cd client
cp .env.example .env
```

Fill in your `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PRICE_MONTHLY=price_...
VITE_STRIPE_PRICE_YEARLY=price_...
```

```bash
npm install
npm run dev
```

### 4. Supabase Database Schema

The following tables are required in your Supabase project:

```
profiles              — user profiles (id, email, full_name, role, handicap, phone, country)
subscriptions         — stripe subscription data per user
golf_scores           — stableford scores (user_id, score 1-45, played_on, course_name, notes)
charities             — charity directory (name, slug, description, logo_url, is_active, is_featured)
charity_contributions — user → charity mapping (user_id, charity_id, percentage)
draw_periods          — monthly draws (title, draw_month, draw_type, drawn_numbers, status, prize pools)
draw_entries          — snapshot of user scores per draw (user_id, draw_period_id, scores_snapshot, match_count, prize_tier)
winner_verifications  — winner claims (user_id, draw_entry_id, prize_amount, status, proof_url)
prize_pool_config     — configurable pool percentages and plan prices
```

> ℹ️ Enable Row Level Security (RLS) and ensure the `profiles` table is populated on user signup via the auth sync endpoint.

---

## 🔐 Authentication Flow

1. User signs up via Supabase Auth (email + password)
2. On login, the frontend calls `POST /api/auth/sync` with the JWT
3. The backend upserts a profile in `profiles` table and returns it
4. Role (`admin` / `subscriber`) is stored in `profiles.role`
5. Protected routes check role via `ProtectedRoute` component
6. Admins are auto-redirected to `/admin`, subscribers to `/dashboard`

---

## 💳 Subscription & Payment Flow

1. User visits `/pricing` → selects Monthly (£100/mo) or Yearly (£1000/yr)
2. Clicks "Get Started" → fills registration form → chooses charity + contribution %
3. From the dashboard, clicks "Subscribe Now" → hits `POST /api/subscription/checkout`
4. Redirected to Stripe Checkout
5. On success → redirected to `/dashboard?subscribed=true`
6. Frontend calls `POST /api/subscription/verify` → backend fetches from Stripe API → inserts into `subscriptions` table
7. Stripe webhook (`checkout.session.completed`) also handles this for production reliability

---

## ⛳ Score Entry Flow

1. Subscriber visits `/dashboard/scores`
2. Enters Stableford score (1–45), date, optional course name & notes
3. Backend validates active subscription → inserts into `golf_scores`
4. **Rolling window:** Only the 5 most recent scores are retained per user
5. Scores are displayed in reverse chronological order

---

## 🎲 Draw Engine

The draw engine supports two modes:

### Random Mode
Generates 5 unique random numbers between 1–45 using a uniform distribution.

### Algorithmic Mode
Queries all historical scores from `golf_scores`, builds a frequency map, and generates a weighted random pool. Numbers with higher frequency among players have a proportionally higher chance of being drawn.

### Draw Lifecycle
```
pending → [simulate] → simulation → [publish official] → published → closed
```

| Status | Description |
|--------|-------------|
| `pending` | Draw created, not yet run |
| `simulation` | Preview run completed (no winner records created) |
| `published` | Official draw published, winner records created |
| `closed` | Draw cycle complete |

### Prize Pool Distribution
| Match | Pool Share | Rollover? |
|-------|-----------|-----------|
| 5-Number Match | 40% | ✅ Yes (Jackpot) |
| 4-Number Match | 35% | ❌ No |
| 3-Number Match | 25% | ❌ No |

Pool values are auto-calculated from active subscriber count × plan price × pool contribution % (configurable in `prize_pool_config`).

---

## 🏆 Winner Verification Flow

1. After a published draw, winners see their prize on `/dashboard/winnings`
2. Winner uploads a scorecard screenshot as proof
3. File is stored in Supabase Storage (`verifications` bucket)
4. Admin reviews at `/admin/winners`
5. Admin clicks **Approve** or **Reject** with optional notes
6. Approved winners are marked **Paid** once payment is processed

---

## ❤️ Charity System

- Users select a charity at registration
- Minimum contribution: **10%** of subscription fee
- Users can increase their % or switch charity anytime from `/dashboard/charity`
- One-off independent donations (UI present, backend integration ready)
- Admin can add, edit, enable/disable, and feature charities
- Featured charities appear on the homepage spotlight section

---

## 🛠 Admin Panel Walkthrough

Login with the admin credentials above and explore:

| Route | Feature |
|-------|---------|
| `/admin` | Platform overview — users, revenue, prize pools, recent draws & winners |
| `/admin/users` | Search users, view/edit profiles, manage scores (add/delete), view subscription & charity |
| `/admin/draws` | Create draw periods, run simulations, publish official draws, delete pending draws |
| `/admin/charities` | Add/edit charities, toggle active status, feature on homepage |
| `/admin/winners` | Filter by status, view proof uploads, approve/reject/mark paid |
| `/admin/reports` | Subscription breakdown, revenue estimates, charity support stats, draw pipeline |

---

## 🎨 UI/UX Highlights

- **Emotion-first design** — leads with charitable impact, avoids traditional golf aesthetics
- Dark-mode by default with a green/violet brand palette
- Framer Motion animations on every page transition, card hover, and navigation
- Animated floating draw balls on the hero section
- Animated number counters on the stats bar
- Gradient shimmer on primary buttons
- Sticky sidebar with animated active-nav pill indicator
- Mobile-first fully responsive layout

---

## 📦 Deployment

### Frontend → Vercel
```bash
cd client
vercel --prod
```
Set environment variables in Vercel dashboard.

### Backend → Vercel (Serverless)
```bash
cd server
vercel --prod
```
The `api/index.js` entry exports the Express app as a serverless function. The `vercel.json` routes `/api/*` and `/webhook/stripe` correctly.

> ⚠️ **Important:** Use a **new** Vercel account and a **new** Supabase project as per PRD requirements.

---

## ✅ PRD Checklist

| Requirement | Status |
|-------------|--------|
| Subscription Engine (monthly + yearly, Stripe) | ✅ |
| Score Entry — 5-score rolling window, 1–45 range, date required | ✅ |
| Draw Engine — random + algorithmic modes | ✅ |
| Draw Simulation mode before official publish | ✅ |
| Jackpot rollover logic | ✅ |
| 3/4/5-match prize tiers with correct % splits | ✅ |
| Charity selection at signup | ✅ |
| Min 10% charity contribution, user-adjustable | ✅ |
| Charity directory with search & featured spotlight | ✅ |
| Winner verification (upload proof → admin approve) | ✅ |
| User Dashboard — subscription, scores, charity, draws, winnings | ✅ |
| Admin Dashboard — users, draws, charities, winners, reports | ✅ |
| Admin score management (add/delete per user) | ✅ |
| Mobile-first responsive design | ✅ |
| Emotion-driven UI (no golf clichés) | ✅ |
| Secure JWT auth, HTTPS enforced | ✅ |
| Supabase backend with proper schema | ✅ |
| Deployed to Vercel | ✅ |
| Email notifications via Resend | ✅ (integrated) |

---

## 📬 Contact

Built by **Kartik** for the Digital Heroes Full-Stack Trainee Selection.

> For any queries about this submission, please reach out via the contact details provided in the application.
