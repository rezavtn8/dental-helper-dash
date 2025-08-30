export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          id: string
          new_values: Json | null
          old_values: Json | null
          operation: string
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clinics: {
        Row: {
          address: string | null
          clinic_code: string
          created_at: string
          domain_slug: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          clinic_code: string
          created_at?: string
          domain_slug?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          clinic_code?: string
          created_at?: string
          domain_slug?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          action_link: string | null
          click_count: number | null
          clinic_id: string
          created_at: string
          email: string
          email_sent_at: string | null
          email_status: string | null
          expires_at: string
          failure_reason: string | null
          id: string
          invitation_type: Database["public"]["Enums"]["invitation_type"] | null
          invited_by: string
          last_email_sent_at: string | null
          message_id: string | null
          resend_count: number | null
          role: string
          status: string
          token: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          action_link?: string | null
          click_count?: number | null
          clinic_id: string
          created_at?: string
          email: string
          email_sent_at?: string | null
          email_status?: string | null
          expires_at?: string
          failure_reason?: string | null
          id?: string
          invitation_type?:
            | Database["public"]["Enums"]["invitation_type"]
            | null
          invited_by: string
          last_email_sent_at?: string | null
          message_id?: string | null
          resend_count?: number | null
          role?: string
          status?: string
          token?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          action_link?: string | null
          click_count?: number | null
          clinic_id?: string
          created_at?: string
          email?: string
          email_sent_at?: string | null
          email_status?: string | null
          expires_at?: string
          failure_reason?: string | null
          id?: string
          invitation_type?:
            | Database["public"]["Enums"]["invitation_type"]
            | null
          invited_by?: string
          last_email_sent_at?: string | null
          message_id?: string | null
          resend_count?: number | null
          role?: string
          status?: string
          token?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_logs: {
        Row: {
          assistant_id: string | null
          clinic_id: string
          date: string | null
          id: string
          patient_count: number | null
        }
        Insert: {
          assistant_id?: string | null
          clinic_id: string
          date?: string | null
          id?: string
          patient_count?: number | null
        }
        Update: {
          assistant_id?: string | null
          clinic_id?: string
          date?: string | null
          id?: string
          patient_count?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          operation: string
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          operation: string
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          operation?: string
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      task_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          assigned_at: string | null
          category: string | null
          checklist: Json | null
          clinic_id: string
          created_at: string
          created_by: string
          description: string | null
          "due-type": string | null
          id: string
          is_active: boolean | null
          owner_notes: string | null
          recurrence: string | null
          specialty: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          category?: string | null
          checklist?: Json | null
          clinic_id: string
          created_at?: string
          created_by: string
          description?: string | null
          "due-type"?: string | null
          id?: string
          is_active?: boolean | null
          owner_notes?: string | null
          recurrence?: string | null
          specialty?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          category?: string | null
          checklist?: Json | null
          clinic_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          "due-type"?: string | null
          id?: string
          is_active?: boolean | null
          owner_notes?: string | null
          recurrence?: string | null
          specialty?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          checklist: Json | null
          clinic_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          custom_due_date: string | null
          description: string | null
          "due-date": string | null
          "due-type": string | null
          id: string
          owner_notes: string | null
          priority: string | null
          recurrence: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          checklist?: Json | null
          clinic_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_due_date?: string | null
          description?: string | null
          "due-date"?: string | null
          "due-type"?: string | null
          id?: string
          owner_notes?: string | null
          priority?: string | null
          recurrence?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          checklist?: Json | null
          clinic_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_due_date?: string | null
          description?: string | null
          "due-date"?: string | null
          "due-type"?: string | null
          id?: string
          owner_notes?: string | null
          priority?: string | null
          recurrence?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          clinic_id: string
          created_at: string
          device_fingerprint: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_accessed: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_accessed?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_accessed?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          clinic_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string | null
          password_hash: string | null
          role: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string | null
          password_hash?: string | null
          role?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string | null
          password_hash?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_clinic_id"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: {
          clinic_id: string
          message: string
          success: boolean
        }[]
      }
      accept_invitation_with_rate_limit: {
        Args: { invitation_token: string }
        Returns: {
          clinic_id: string
          message: string
          success: boolean
        }[]
      }
      accept_simple_invitation: {
        Args: { p_token: string; p_user_id?: string }
        Returns: {
          clinic_id: string
          message: string
          success: boolean
        }[]
      }
      can_create_user: {
        Args: { target_role: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          max_attempts?: number
          operation_name: string
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_assistant_invitation: {
        Args: { p_clinic_id: string; p_email: string; p_name: string }
        Returns: {
          invitation_id: string
          invitation_token: string
        }[]
      }
      create_assistant_invitation_secure: {
        Args: { p_clinic_id: string; p_email: string; p_name: string }
        Returns: {
          invitation_id: string
          invitation_token: string
        }[]
      }
      create_simple_invitation: {
        Args: { p_clinic_id?: string; p_email: string; p_name: string }
        Returns: {
          invitation_id: string
          token: string
        }[]
      }
      create_unified_invitation: {
        Args: {
          p_clinic_id: string
          p_email: string
          p_invitation_type?: Database["public"]["Enums"]["invitation_type"]
          p_name: string
          p_role?: string
        }
        Returns: {
          invitation_id: string
          invitation_token: string
          invitation_url: string
        }[]
      }
      generate_clinic_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_timestamp: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_clinic_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_safe_invitation_info: {
        Args: { invitation_email: string }
        Returns: {
          clinic_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          role: string
          status: string
        }[]
      }
      get_safe_user_profile: {
        Args: { user_id_param?: string }
        Returns: {
          clinic_id: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login: string
          name: string
          role: string
        }[]
      }
      get_security_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric: string
          period: string
          value: number
        }[]
      }
      get_security_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      link_user_to_pending_invitation: {
        Args: { user_email: string }
        Returns: {
          clinic_id: string
          message: string
          success: boolean
        }[]
      }
      log_security_event: {
        Args: { event_details?: Json; event_type: string; severity?: string }
        Returns: undefined
      }
      lookup_clinic_by_code: {
        Args: { p_code: string }
        Returns: {
          clinic_code: string
          id: string
          name: string
        }[]
      }
      sanitize_and_validate_input: {
        Args: { input_type: string; input_value: string }
        Returns: string
      }
      sanitize_text_input: {
        Args: { input_text: string }
        Returns: string
      }
      validate_clinic_code: {
        Args: { code_input: string }
        Returns: boolean
      }
      validate_email: {
        Args: { email_input: string }
        Returns: boolean
      }
    }
    Enums: {
      invitation_type: "email_signup" | "magic_link"
      task_status: "pending" | "in-progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      invitation_type: ["email_signup", "magic_link"],
      task_status: ["pending", "in-progress", "completed"],
    },
  },
} as const
