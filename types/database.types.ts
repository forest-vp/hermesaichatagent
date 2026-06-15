/**
 * Database type definitions for the Goalify Supabase schema.
 *
 * Replace the `Tables` and `Enums` interfaces below with your actual
 * database schema. You can auto-generate these types with:
 *
 *   npx supabase gen types typescript --project-id "fbuxgapvzabujmcmyrkp" > types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string | null;
          target_date: string | null;
          status: 'active' | 'completed' | 'archived';
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          target_date?: string | null;
          status?: 'active' | 'completed' | 'archived';
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          target_date?: string | null;
          status?: 'active' | 'completed' | 'archived';
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          goal_id: string;
          title: string;
          completed: boolean;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          title: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          title?: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      plan_type: 'free' | 'pro' | 'enterprise';
      goal_status: 'active' | 'completed' | 'archived';
    };
  };
}

/**
 * Convenience type aliases for common table row types.
 */
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type Milestone = Database['public']['Tables']['milestones']['Row'];
export type PlanType = Database['public']['Enums']['plan_type'];
export type GoalStatus = Database['public']['Enums']['goal_status'];
