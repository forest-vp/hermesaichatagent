-- Goalify v2 Database Schema
-- AI-Powered Personal Development & Training Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  username text UNIQUE NOT NULL,
  date_of_birth date,
  country text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'student', 'admin')),
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'premium')),
  paddle_customer_id text,
  paddle_subscription_id text,
  subscription_status text DEFAULT 'active',
  is_student_verified boolean DEFAULT false,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  last_active timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Student Verifications
CREATE TABLE IF NOT EXISTS student_verifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  university_name text NOT NULL,
  student_id text NOT NULL,
  graduation_year integer NOT NULL,
  badge_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

-- 3. Training Programs
CREATE TABLE IF NOT EXISTS training_programs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  category text NOT NULL,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_hours integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  is_ai_generated boolean DEFAULT true,
  creator_id uuid REFERENCES profiles(id),
  xp_reward integer DEFAULT 100,
  status text DEFAULT 'published',
  enrollments_count integer DEFAULT 0,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id uuid REFERENCES training_programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  video_url text,
  duration_minutes integer DEFAULT 0,
  order_index integer DEFAULT 0,
  xp_reward integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- 5. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  program_id uuid REFERENCES training_programs(id) ON DELETE CASCADE,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_accessed timestamptz,
  UNIQUE(user_id, program_id)
);

-- 6. Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES enrollments(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, lesson_id)
);

-- 7. Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  program_id uuid REFERENCES training_programs(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES enrollments(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  issued_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_premium boolean DEFAULT false
);

-- 8. Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT '🏆',
  xp_bonus integer DEFAULT 0,
  unlocked_at timestamptz DEFAULT now()
);

-- 9. Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  difficulty text DEFAULT 'beginner',
  estimated_hours integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 10. Learning Path Programs
CREATE TABLE IF NOT EXISTS learning_path_programs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  program_id uuid REFERENCES training_programs(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0
);

-- 11. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

-- 13. Subscriptions History
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type text NOT NULL,
  paddle_subscription_id text,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  cancelled_at timestamptz
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_student_verifications_status ON student_verifications(status);
CREATE INDEX IF NOT EXISTS idx_training_programs_category ON training_programs(category);
CREATE INDEX IF NOT EXISTS idx_training_programs_difficulty ON training_programs(difficulty);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_lessons_program ON lessons(program_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- RLS: Enable on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies: Student Verifications
CREATE POLICY "Users can view own verification" ON student_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create verification" ON student_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all verifications" ON student_verifications FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update verifications" ON student_verifications FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- RLS Policies: Training Programs (public read)
CREATE POLICY "Anyone can view published programs" ON training_programs FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage programs" ON training_programs FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- RLS Policies: Lessons (public read)
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT USING (true);

-- RLS Policies: Enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON enrollments FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: Lesson Progress
CREATE POLICY "Users can view own progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON lesson_progress FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: Certificates
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create certificates" ON certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Achievements
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Learning Paths (public read)
CREATE POLICY "Anyone can view learning paths" ON learning_paths FOR SELECT USING (true);
CREATE POLICY "Anyone can view path programs" ON learning_path_programs FOR SELECT USING (true);

-- RLS Policies: Announcements (public read)
CREATE POLICY "Anyone can view active announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- RLS Policies: Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: Subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TRIGGER: Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, username, date_of_birth, country)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    (new.raw_user_meta_data->>'date_of_birth')::date,
    new.raw_user_meta_data->>'country'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- TRIGGER: Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS training_programs_updated_at ON training_programs;
CREATE TRIGGER training_programs_updated_at BEFORE UPDATE ON training_programs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
