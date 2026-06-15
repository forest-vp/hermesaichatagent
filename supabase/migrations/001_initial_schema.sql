-- ============================================================
-- Goalify SaaS - Initial Database Schema
-- Supabase migration: 001_initial_schema.sql
-- Project ref: fbuxgapvzabujmcmyrkp
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  plan_type         text not null default 'free',
  paddle_customer_id     text,
  paddle_subscription_id text,
  subscription_status   text not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Indexes
create index if not exists idx_profiles_email       on public.profiles (email);
create index if not exists idx_profiles_plan_type   on public.profiles (plan_type);
create index if not exists idx_profiles_sub_status  on public.profiles (subscription_status);


-- 2. GOALS
-- ============================================================
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  description text,
  category    text,
  priority    text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  target_date date,
  progress    integer not null default 0 check (progress >= 0 and progress <= 100),
  status      text not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_goals_user_id       on public.goals (user_id);
create index if not exists idx_goals_status        on public.goals (status);
create index if not exists idx_goals_priority      on public.goals (priority);
create index if not exists idx_goals_category      on public.goals (category);
create index if not exists idx_goals_target_date   on public.goals (target_date);


-- 3. GOAL MILESTONES
-- ============================================================
create table if not exists public.goal_milestones (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid not null references public.goals (id) on delete cascade,
  title       text not null,
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.goal_milestones enable row level security;

create policy "Users can view own goal milestones"
  on public.goal_milestones for select
  using (
    goal_id in (select id from public.goals where user_id = auth.uid())
  );

create policy "Users can insert own goal milestones"
  on public.goal_milestones for insert
  with check (
    goal_id in (select id from public.goals where user_id = auth.uid())
  );

create policy "Users can update own goal milestones"
  on public.goal_milestones for update
  using (
    goal_id in (select id from public.goals where user_id = auth.uid())
  )
  with check (
    goal_id in (select id from public.goals where user_id = auth.uid())
  );

create policy "Users can delete own goal milestones"
  on public.goal_milestones for delete
  using (
    goal_id in (select id from public.goals where user_id = auth.uid())
  );

-- Indexes
create index if not exists idx_goal_milestones_goal_id     on public.goal_milestones (goal_id);
create index if not exists idx_goal_milestones_completed on public.goal_milestones (completed);


-- 4. HABITS
-- ============================================================
create table if not exists public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  name        text not null,
  icon        text,
  color       text,
  frequency   text not null default 'daily',
  target_count integer not null default 1 check (target_count > 0),
  created_at  timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_habits_user_id     on public.habits (user_id);
create index if not exists idx_habits_frequency   on public.habits (frequency);


-- 5. HABIT ENTRIES
-- ============================================================
create table if not exists public.habit_entries (
  id          uuid primary key default gen_random_uuid(),
  habit_id    uuid not null references public.habits (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  date        date not null default current_date,
  count       integer not null default 1 check (count >= 0),
  created_at  timestamptz not null default now()
);

alter table public.habit_entries enable row level security;

create policy "Users can view own habit entries"
  on public.habit_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own habit entries"
  on public.habit_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habit entries"
  on public.habit_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own habit entries"
  on public.habit_entries for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_habit_entries_habit_id    on public.habit_entries (habit_id);
create index if not exists idx_habit_entries_user_id    on public.habit_entries (user_id);
create index if not exists idx_habit_entries_date       on public.habit_entries (date);
create index if not exists idx_habit_entries_habit_date on public.habit_entries (habit_id, date);


-- 6. USER STATS
-- ============================================================
create table if not exists public.user_stats (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references public.profiles (id) on delete cascade,
  current_streak    integer not null default 0 check (current_streak >= 0),
  longest_streak    integer not null default 0 check (longest_streak >= 0),
  goals_completed   integer not null default 0 check (goals_completed >= 0),
  productivity_score numeric(5,2) not null default 0 check (productivity_score >= 0),
  last_active       timestamptz,
  updated_at        timestamptz not null default now()
);

alter table public.user_stats enable row level security;

create policy "Users can view own stats"
  on public.user_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.user_stats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own stats"
  on public.user_stats for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_user_stats_user_id          on public.user_stats (user_id);
create index if not exists idx_user_stats_last_active      on public.user_stats (last_active);
create index if not exists idx_user_stats_productivity     on public.user_stats (productivity_score desc);


-- 7. ACHIEVEMENTS
-- ============================================================
create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  badge_type  text not null,
  badge_name  text not null,
  description text,
  unlocked_at timestamptz not null default now()
);

alter table public.achievements enable row level security;

create policy "Users can view own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

create policy "Users can update own achievements"
  on public.achievements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own achievements"
  on public.achievements for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_achievements_user_id      on public.achievements (user_id);
create index if not exists idx_achievements_badge_type   on public.achievements (badge_type);
create index if not exists idx_achievements_unlocked_at  on public.achievements (unlocked_at desc);


-- ============================================================
-- TRIGGER: Auto-create profile on new user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-create user_stats on profile creation
-- ============================================================
create or replace function public.handle_new_profile_stats()
returns trigger as $$
begin
  insert into public.user_stats (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row
  execute procedure public.handle_new_profile_stats();

-- ============================================================
-- TRIGGER: Auto-update updated_at on profiles
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
  before update on public.goals
  for each row
  execute procedure public.set_updated_at();
