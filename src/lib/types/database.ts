export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          employer_notes: string | null
          id: string
          job_id: string
          resume_url: string | null
          seeker_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          employer_notes?: string | null
          id?: string
          job_id: string
          resume_url?: string | null
          seeker_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          employer_notes?: string | null
          id?: string
          job_id?: string
          resume_url?: string | null
          seeker_id?: string
          status?: string
          updated_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
      }
      jobs: {
        Row: {
          created_at: string | null
          description: string
          employer_id: string
          experience_level: string | null
          id: string
          industry: string | null
          is_premium: boolean | null
          is_remote: boolean | null
          job_type: string | null
          location: string | null
          requirements: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          status: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          employer_id: string
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean | null
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          employer_id?: string
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_premium?: boolean | null
          is_remote?: boolean | null
          job_type?: string | null
          location?: string | null
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          first_name: string | null
          id: string
          job_preferences: Json | null
          last_name: string | null
          location: string | null
          phone: string | null
          role: string
          skills: string[] | null
          updated_at: string | null
          verification_notes: string | null
          verification_status: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          job_preferences?: Json | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          role?: string
          skills?: string[] | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          job_preferences?: Json | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          role?: string
          skills?: string[] | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string
          website?: string | null
        }
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          seeker_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          seeker_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          seeker_id?: string
        }
      }
      verification_requests: {
        Row: {
          admin_id: string | null
          admin_notes: string | null
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          document_type?: string
          document_url: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      log_audit: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_target_id?: string
          p_target_table?: string
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Job = Tables<'jobs'>
export type Application = Tables<'applications'>
export type Message = Tables<'messages'>
export type Notification = Tables<'notifications'>
export type SavedJob = Tables<'saved_jobs'>
export type VerificationRequest = Tables<'verification_requests'>
export type AuditLog = Tables<'audit_logs'>

export type UserRole = 'seeker' | 'employer' | 'admin'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type ApplicationStatus = 'applied' | 'viewed' | 'shortlisted' | 'rejected'
export type JobStatus = 'active' | 'closed' | 'draft' | 'pending_moderation'
export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'
