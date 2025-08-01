export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
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
      patient_logs: {
        Row: {
          assistant_id: string | null
          clinic_id: string | null
          date: string | null
          id: string
          patient_count: number | null
        }
        Insert: {
          assistant_id?: string | null
          clinic_id?: string | null
          date?: string | null
          id?: string
          patient_count?: number | null
        }
        Update: {
          assistant_id?: string | null
          clinic_id?: string | null
          date?: string | null
          id?: string
          patient_count?: number | null
        }
        Relationships: []
      }
      task_templates: {
        Row: {
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
          clinic_id: string | null
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
          status: string | null
          title: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          checklist?: Json | null
          clinic_id?: string | null
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
          status?: string | null
          title?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          checklist?: Json | null
          clinic_id?: string | null
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
          status?: string | null
          title?: string | null
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
          clinic_id: string
          created_at: string
          created_by: string | null
          display_order: number | null
          email: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          must_change_pin: boolean | null
          name: string | null
          password_hash: string | null
          pin: string | null
          pin_attempts: number | null
          pin_changed_at: string | null
          pin_locked_until: string | null
          role: string | null
        }
        Insert: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          must_change_pin?: boolean | null
          name?: string | null
          password_hash?: string | null
          pin?: string | null
          pin_attempts?: number | null
          pin_changed_at?: string | null
          pin_locked_until?: string | null
          role?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          must_change_pin?: boolean | null
          name?: string | null
          password_hash?: string | null
          pin?: string | null
          pin_attempts?: number | null
          pin_changed_at?: string | null
          pin_locked_until?: string | null
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
      can_create_user: {
        Args: { target_role: string }
        Returns: boolean
      }
      get_current_user_clinic_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_user_pin: {
        Args: { user_id: string; new_pin: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
