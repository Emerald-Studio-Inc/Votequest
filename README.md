# VoteQuest - Decentralized Voting Platform

A modern, gamified voting platform built with Next.js, Supabase, and TypeScript.

## 🚀 Features

- **Email Authentication** - Secure login with Supabase Auth
- **Proposal Creation & Voting** - Create and vote on proposals
- **Gamification** - XP, levels, achievements, and coins
- **Leaderboards** - Compete with other voters
- **Real-time Updates** - Live proposal updates
- **Proof-of-Work Receipts** - Cryptographic voting receipts
- **Share & Referrals** - Share proposals and earn rewards
- **Analytics** - Track your voting history and trends

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Styling:** Tailwind CSS
- **Security:** Cloudflare Turnstile CAPTCHA
- **Deployment:** Netlify

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Turnstile keys

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔧 Environment Variables

Required variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

## 🗄️ Database Setup

1. Create a Supabase project
2. Run the migrations in `migrations/` folder in order
3. Run `supabase_setup.sql` for initial schema
4. Run `supabase_seed.sql` for sample data (optional)

## 📁 Project Structure

```
votequest/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utilities and helpers
├── migrations/       # Database migrations
├── public/           # Static assets
└── styles/           # Global styles
```

## 🎮 Key Features

### Voting System
- Create proposals with custom options
- Vote with CAPTCHA verification
- View real-time vote counts
- Earn coins and XP for voting

### Gamification
- Level up by earning XP
- Unlock achievements
- Earn coins for activities
- Spend coins on power-ups

### Social Features
- Share proposals via QR codes
- Referral rewards
- Leaderboards
- Activity feed

## 🚢 Deployment

### Netlify Deployment

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy!

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ for transparent, gamified voting
