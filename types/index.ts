export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  date_of_birth: string | null;
  country: string | null;
  avatar_url: string | null;
  role: 'user' | 'student' | 'admin';
  plan_type: 'free' | 'pro' | 'premium';
  paddle_customer_id: string | null;
  paddle_subscription_id: string | null;
  subscription_status: string | null;
  is_student_verified: boolean;
  xp: number;
  level: number;
  streak: number;
  last_active: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  total_lessons: number;
  is_premium: boolean;
  is_ai_generated: boolean;
  creator_id: string | null;
  xp_reward: number;
  status: string;
  enrollments_count: number;
  rating: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  program_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  xp_reward: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  program_id: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  started_at: string;
  completed_at: string | null;
  last_accessed: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  program_id: string;
  enrollment_id: string;
  certificate_number: string;
  issued_at: string;
  expires_at: string | null;
  is_premium: boolean;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  xp_bonus: number;
  unlocked_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  difficulty: string;
  estimated_hours: number;
  is_premium: boolean;
  created_at: string;
}

export interface StudentVerification {
  id: string;
  user_id: string;
  university_name: string;
  student_id: string;
  graduation_year: number;
  badge_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  admin_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  is_active: boolean;
  created_at: string;
}

export interface NotificationType {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}
