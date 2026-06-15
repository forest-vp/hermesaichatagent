-- ============================================================
-- Goalify SaaS - Paddle Payment Integration Schema
-- Supabase migration: 002_paddle.sql
-- ============================================================

-- 1. Ensure profiles table has Paddle columns
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'paddle_customer_id'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN paddle_customer_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'paddle_subscription_id'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN paddle_subscription_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;
END $$;

-- Update existing NULL values
UPDATE public.profiles SET plan_type = 'free' WHERE plan_type IS NULL;
UPDATE public.profiles SET subscription_status = 'active' WHERE subscription_status IS NULL;

-- Add/ensure indexes on paddle columns
CREATE INDEX IF NOT EXISTS idx_profiles_paddle_customer_id
  ON public.profiles (paddle_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_paddle_subscription_id
  ON public.profiles (paddle_subscription_id);


-- 2. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('billing', 'subscription', 'goal', 'achievement', 'system')),
  title       TEXT NOT NULL,
  message     TEXT,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own notifications (for server-side triggers)
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass (for API route webhook handler)
CREATE POLICY "Service role can manage all notifications"
  ON public.notifications FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read
  ON public.notifications (user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications (user_id, created_at DESC);


-- 3. SUBSCRIPTION HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  paddle_customer_id     TEXT,
  paddle_subscription_id TEXT,
  plan_type         TEXT NOT NULL,
  status            TEXT NOT NULL,
  event_type        TEXT NOT NULL,
  amount            NUMERIC(10, 2),
  currency          TEXT DEFAULT 'EUR',
  raw_payload       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription history
CREATE POLICY "Users can view own subscription history"
  ON public.subscription_history FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all subscription history
CREATE POLICY "Service role can manage all subscription history"
  ON public.subscription_history FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id
  ON public.subscription_history (user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at
  ON public.subscription_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_history_event
  ON public.subscription_history (event_type);


-- 4. ADD updated_at trigger on notifications
-- ============================================================
create or replace function public.set_notifications_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 5. HELPER: Get user profile with plan info
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_with_plan(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT,
  paddle_customer_id TEXT,
  paddle_subscription_id TEXT,
  subscription_status TEXT,
  current_period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.plan_type,
    p.paddle_customer_id,
    p.paddle_subscription_id,
    p.subscription_status,
    p.current_period_end
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
