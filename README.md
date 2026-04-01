# 🏌️ GolfCharity — Play Golf. Win Rewards. Change Lives.

A full-stack production-ready charity golf subscription platform built with Next.js 14, Supabase, and Stripe.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm
- Supabase account
- Stripe account
- Resend account (email)

### 1. Clone & Install
```bash
git clone <your-repo>
cd golf-charity
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your keys:
```bash
cp .env.example .env.local
```

### 3. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the entire contents of `lib/supabase/schema.sql`
4. Copy your **Project URL** and **anon key** from Settings → API

### 4. Set up Stripe
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create two products in Stripe Dashboard:
   - **Monthly Plan**: £9.99/month recurring
   - **Yearly Plan**: £89.88/year recurring
3. Copy the **Price IDs** for both plans
4. Set up webhook endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`
5. Add these webhook events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
golf-charity/
├── app/
│   ├── page.tsx                    # Landing homepage
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles + CSS variables
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   └── callback/route.ts       # OAuth callback handler
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard sidebar layout
│   │   ├── page.tsx                # Overview dashboard
│   │   ├── scores/page.tsx         # Golf score entry
│   │   ├── draw/page.tsx           # Monthly draw entry
│   │   ├── charity/page.tsx        # Charity selection
│   │   ├── winnings/page.tsx       # Prize history
│   │   ├── history/page.tsx        # Draw history
│   │   └── settings/page.tsx       # Subscription management
│   ├── admin/
│   │   ├── layout.tsx              # Admin sidebar layout
│   │   ├── page.tsx                # Admin overview + charts
│   │   ├── users/page.tsx          # User management
│   │   ├── subscriptions/page.tsx  # Subscription management
│   │   ├── scores/page.tsx         # All scores view
│   │   ├── draw/page.tsx           # Draw system + simulation
│   │   ├── winners/page.tsx        # Winner verification
│   │   └── charities/page.tsx      # Charity management
│   └── api/
│       ├── admin/
│       │   ├── stats/route.ts      # Platform statistics
│       │   ├── users/route.ts      # User listing
│       │   ├── draws/route.ts      # Draw management
│       │   └── winners/[id]/route.ts # Winner verification
│       ├── draw/
│       │   ├── run/route.ts        # Execute live draw
│       │   ├── simulate/route.ts   # Simulate draw
│       │   └── results/route.ts    # Past draw results
│       ├── scores/route.ts         # Score CRUD
│       ├── charity/route.ts        # Charity listing
│       └── stripe/
│           ├── create-checkout/route.ts # Stripe checkout
│           ├── portal/route.ts          # Billing portal
│           └── webhooks/stripe/route.ts # Webhook handler
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client
│   │   └── schema.sql              # Full database schema
│   ├── draw-engine.ts              # Core draw algorithm
│   ├── stripe.ts                   # Stripe helpers
│   └── utils.ts                    # Shared utilities
├── types/
│   └── index.ts                    # TypeScript types
├── components/
│   └── ui/
│       └── toast-provider.tsx      # Toast notifications
├── middleware.ts                   # Auth protection middleware
└── tailwind.config.ts              # Tailwind configuration
```

---

## 🗄️ Database Schema

### Tables
| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends Supabase auth) |
| `subscriptions` | Stripe subscription records |
| `golf_scores` | Rolling 5 scores per user (1–45) |
| `draws` | Monthly draw configuration |
| `draw_entries` | User entries per draw (unique per user/draw) |
| `winners` | Prize winners with tier and status |
| `charities` | Active charity organizations |
| `charity_allocations` | User → charity preference |
| `charity_donations` | Historical donation records |

---

## 🎰 Draw Engine

The draw engine (`lib/draw-engine.ts`) supports 4 modes:

| Mode | Description |
|------|-------------|
| `random` | Pure random 5 numbers (1–45) |
| `balanced` | Mix of common and rare picks |
| `most_common` | Bias toward frequently picked numbers |
| `least_common` | Bias toward rarely picked numbers |

### Prize Distribution
- **5 Match (Jackpot)**: 40% of prize pool (rolls over if no winner)
- **4 Match**: 35% of prize pool (split equally)
- **3 Match**: 25% of prize pool (split equally)

---

## 💰 Subscription Plans

| Plan | Price | Features |
|------|-------|---------|
| Monthly | £9.99/mo | Monthly draw entry, score tracking, charity selection |
| Yearly | £89.88/yr | Everything + 25% saving, priority processing, yearly stats |

---

## 🔒 Security

- Row Level Security (RLS) on all Supabase tables
- Middleware-based route protection
- Stripe webhook signature verification
- Admin-only routes with database-level checks
- Server-side auth validation on all API routes

---

## 🚢 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

```bash
# Or deploy via CLI
npm install -g vercel
vercel --prod
```

### Environment Variables for Vercel
Copy all variables from `.env.example` and add them in:
`Vercel Dashboard → Your Project → Settings → Environment Variables`

### Stripe Webhook for Production
After deploying, update your Stripe webhook URL to:
`https://yourdomain.vercel.app/api/webhooks/stripe`

### Make Yourself Admin
After signing up, run this in Supabase SQL editor:
```sql
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'your@email.com';
```

---

## 📧 Email (Resend)

Get a free API key at [resend.com](https://resend.com) and add to `.env.local`.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS Variables |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Email | Resend |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Vercel |

---

## 🧪 Demo Credentials

After setting up, create demo users manually or via the signup page.

To make a user admin:
```sql
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'admin@example.com';
```

---

## 📋 Checklist Before Going Live

- [ ] Run `schema.sql` in Supabase SQL editor
- [ ] Create Stripe products + price IDs
- [ ] Set up Stripe webhook with correct events
- [ ] Add all env vars to Vercel
- [ ] Test checkout flow end-to-end
- [ ] Make at least one admin user
- [ ] Configure Resend email domain
- [ ] Set up Supabase email templates

---

## 🤝 Contributing

PRs welcome. Please open an issue first.

---

## 📄 License

MIT © GolfCharity Ltd
