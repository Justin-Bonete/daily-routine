# My Life OS

## Setup
1. Install Node.js 18+ from nodejs.org.
2. In this folder run: `npm install`
3. Create a free project at supabase.com.
4. Supabase > SQL Editor > paste `supabase/migrations/0001_foundation.sql` > Run.
5. Supabase > Project Settings > API: copy the Project URL and anon key.
   Copy `.env.example` to `.env.local` and paste them in.
6. Supabase > Authentication > URL Configuration: set Site URL to `http://localhost:3000`
   and add `http://localhost:3000/auth/callback` to Redirect URLs.
   (Optional while testing: Authentication > Providers > Email > turn off "Confirm email".)
7. Run `npm run dev` and open http://localhost:3000

## Phase 0 checklist
- Sign up, sign in, sign out, and reset password work.
- Data and session survive refresh and logout/login.
- All 18 sidebar items open; dark/light toggle works; mobile menu works.
