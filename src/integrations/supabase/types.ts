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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      conversions: {
        Row: {
          conversion_time: number | null
          conversion_type: string | null
          converted_filename: string | null
          created_at: string
          error_message: string | null
          file_content: string | null
          file_size: number | null
          id: string
          input_format: string | null
          name: string
          original_filename: string | null
          output_format: string | null
          success: boolean | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          conversion_time?: number | null
          conversion_type?: string | null
          converted_filename?: string | null
          created_at?: string
          error_message?: string | null
          file_content?: string | null
          file_size?: number | null
          id?: string
          input_format?: string | null
          name: string
          original_filename?: string | null
          output_format?: string | null
          success?: boolean | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          conversion_time?: number | null
          conversion_type?: string | null
          converted_filename?: string | null
          created_at?: string
          error_message?: string | null
          file_content?: string | null
          file_size?: number | null
          id?: string
          input_format?: string | null
          name?: string
          original_filename?: string | null
          output_format?: string | null
          success?: boolean | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          amount: number
          credits: number
          expiry_date: string
          id: string
          plan_id: string
          purchase_date: string
          user_id: string
        }
        Insert: {
          amount: number
          credits: number
          expiry_date: string
          id?: string
          plan_id: string
          purchase_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          credits?: number
          expiry_date?: string
          id?: string
          plan_id?: string
          purchase_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: number
          message: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: number
          message?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: number
          message?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          credits: number
          description: string | null
          duration_days: number
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          credits: number
          description?: string | null
          duration_days: number
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          created_at?: string
          credits?: number
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_plan: string | null
          created_at: string
          credits: number | null
          email: string | null
          email_verified: boolean | null
          id: string
          is_banned: boolean | null
          last_login: string | null
          name: string | null
          plan_expiry_date: string | null
          role: string | null
        }
        Insert: {
          active_plan?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          email_verified?: boolean | null
          id: string
          is_banned?: boolean | null
          last_login?: string | null
          name?: string | null
          plan_expiry_date?: string | null
          role?: string | null
        }
        Update: {
          active_plan?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          is_banned?: boolean | null
          last_login?: string | null
          name?: string | null
          plan_expiry_date?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_plan_fkey"
            columns: ["active_plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      system_metrics: {
        Row: {
          active_users: number | null
          average_response_time: number | null
          success_rate: number | null
          total_conversions: number | null
          total_users: number | null
        }
        Relationships: []
      }
      user_metrics: {
        Row: {
          average_response_time: number | null
          success_rate: number | null
          total_conversions: number | null
          total_file_size: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_monthly_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      add_monthly_credits_for_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      create_user_profile: {
        Args: {
          user_email: string
          user_id: string
          user_name: string
          user_role?: string
        }
        Returns: boolean
      }
      diagnose_registration_issues: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          issue_type: string
        }[]
      }
      fix_missing_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          status: string
          user_id: string
        }[]
      }
      get_conversions_by_date_range: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          date: string
          failed: number
          successful: number
          total: number
        }[]
      }
      get_conversions_by_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
          input_format: string
          output_format: string
        }[]
      }
      get_metrics_system: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_metrics_user: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_system_metrics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      get_user_metrics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_users_without_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          message: string
          user_count: number
        }[]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      register_user: {
        Args: {
          user_email: string
          user_id: string
          user_name: string
          user_role?: string
        }
        Returns: Json
      }
      register_user_verified: {
        Args: {
          user_email: string
          user_id: string
          user_name: string
          user_role?: string
        }
        Returns: Json
      }
      system_metrics_calc: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      track_conversion: {
        Args: {
          p_conversion_time: number
          p_error_message?: string
          p_file_size: number
          p_input_format?: string
          p_output_format?: string
          p_success: boolean
          p_user_id: string
        }
        Returns: string
      }
      user_metrics_calc: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
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
