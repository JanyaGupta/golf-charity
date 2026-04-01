-- ============================================================
-- GOLF CHARITY PLATFORM - COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT CHECK (plan IN ('monthly', 'yearly')) DEFAULT 'monthly',
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive')) DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  amount_paid INTEGER DEFAULT 0, -- in pence/cents
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages subscriptions" ON public.subscriptions
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================
-- GOLF SCORES TABLE (max 5 rolling)
-- ============================================================
CREATE TABLE public.golf_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  round_date DATE DEFAULT CURRENT_DATE,
  notes TEXT
);

ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON public.golf_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.golf_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON public.golf_scores
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores" ON public.golf_scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE INDEX idx_golf_scores_user_id ON public.golf_scores(user_id);
CREATE INDEX idx_golf_scores_entered_at ON public.golf_scores(entered_at DESC);

-- Function to enforce max 5 scores per user (rolling)
CREATE OR REPLACE FUNCTION public.enforce_score_limit()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_id UUID;
BEGIN
  SELECT COUNT(*) INTO score_count
  FROM public.golf_scores
  WHERE user_id = NEW.user_id;

  IF score_count >= 5 THEN
    SELECT id INTO oldest_id
    FROM public.golf_scores
    WHERE user_id = NEW.user_id
    ORDER BY entered_at ASC
    LIMIT 1;

    DELETE FROM public.golf_scores WHERE id = oldest_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_score_insert
  BEFORE INSERT ON public.golf_scores
  FOR EACH ROW EXECUTE FUNCTION public.enforce_score_limit();

-- ============================================================
-- DRAWS TABLE
-- ============================================================
CREATE TABLE public.draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'completed')) DEFAULT 'pending',
  winning_numbers INTEGER[],
  prize_pool INTEGER DEFAULT 0, -- total in pence
  jackpot_rollover INTEGER DEFAULT 0,
  five_match_pool INTEGER DEFAULT 0,
  four_match_pool INTEGER DEFAULT 0,
  three_match_pool INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view completed draws" ON public.draws
  FOR SELECT USING (status = 'completed' OR auth.uid() IS NOT NULL);

CREATE INDEX idx_draws_status ON public.draws(status);
CREATE INDEX idx_draws_month_year ON public.draws(year DESC, month DESC);

-- ============================================================
-- DRAW ENTRIES TABLE
-- ============================================================
CREATE TABLE public.draw_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  numbers INTEGER[] NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, draw_id)
);

ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries" ON public.draw_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON public.draw_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all entries" ON public.draw_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE INDEX idx_draw_entries_user_draw ON public.draw_entries(user_id, draw_id);
CREATE INDEX idx_draw_entries_draw_id ON public.draw_entries(draw_id);

-- ============================================================
-- WINNERS TABLE
-- ============================================================
CREATE TABLE public.winners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES public.draw_entries(id) ON DELETE CASCADE NOT NULL,
  matched_numbers INTEGER[] NOT NULL,
  tier TEXT CHECK (tier IN ('three_match', 'four_match', 'five_match')) NOT NULL,
  prize_amount INTEGER NOT NULL, -- in pence
  status TEXT CHECK (status IN ('pending', 'verified', 'paid', 'rejected')) DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own winnings" ON public.winners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage winners" ON public.winners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE INDEX idx_winners_user_id ON public.winners(user_id);
CREATE INDEX idx_winners_draw_id ON public.winners(draw_id);
CREATE INDEX idx_winners_status ON public.winners(status);

-- ============================================================
-- CHARITIES TABLE
-- ============================================================
CREATE TABLE public.charities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  total_received INTEGER DEFAULT 0, -- in pence
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active charities" ON public.charities
  FOR SELECT USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Admins manage charities" ON public.charities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================================
-- CHARITY ALLOCATIONS TABLE
-- ============================================================
CREATE TABLE public.charity_allocations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage >= 1 AND percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, charity_id)
);

ALTER TABLE public.charity_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own allocations" ON public.charity_allocations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- CHARITY DONATIONS TABLE
-- ============================================================
CREATE TABLE public.charity_donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- in pence
  donated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.charity_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations" ON public.charity_donations
  FOR SELECT USING (TRUE);

-- ============================================================
-- PLATFORM STATS VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS total_users,
  (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active') AS active_subscriptions,
  (SELECT COALESCE(SUM(total_received), 0) FROM public.charities) AS total_donations,
  (SELECT COALESCE(prize_pool + jackpot_rollover, 0) FROM public.draws WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1) AS current_prize_pool;

-- ============================================================
-- SEED CHARITIES
-- ============================================================
INSERT INTO public.charities (name, description, logo_url, category, website) VALUES
  ('Children''s Cancer Fund', 'Supporting children battling cancer through research, treatment, and family support programs.', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200', 'Health', 'https://example.com'),
  ('Golf for Good Foundation', 'Making golf accessible to underprivileged youth through scholarships and equipment programs.', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=200', 'Sports & Youth', 'https://example.com'),
  ('Clean Water Initiative', 'Bringing clean water solutions to communities across developing nations.', 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=200', 'Environment', 'https://example.com'),
  ('Mental Health Alliance', 'Breaking barriers in mental health care through advocacy, education and free counselling.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200', 'Health', 'https://example.com'),
  ('Food Bank Network', 'Ending hunger in local communities through food collection, distribution and education.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200', 'Community', 'https://example.com');

-- ============================================================
-- SEED INITIAL DRAW FOR CURRENT MONTH
-- ============================================================
INSERT INTO public.draws (month, year, status, prize_pool, jackpot_rollover)
VALUES (
  EXTRACT(MONTH FROM NOW()),
  EXTRACT(YEAR FROM NOW()),
  'pending',
  250000, -- £2,500 initial prize pool
  0
);
