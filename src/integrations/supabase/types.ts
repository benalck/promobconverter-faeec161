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
      conversions: {
        Row: {
          conversion_type: string | null
          converted_filename: string | null
          created_at: string
          file_content: string | null
          id: string
          name: string
          original_filename: string | null
          user_id: string
          success: boolean
          file_size: number
          conversion_time: number
          error_message: string | null
          input_format: string
          output_format: string
          timestamp: string
        }
        Insert: {
          conversion_type?: string | null
          converted_filename?: string | null
          created_at?: string
          file_content?: string | null
          id?: string
          name: string
          original_filename?: string | null
          user_id: string
          success?: boolean
          file_size?: number
          conversion_time?: number
          error_message?: string | null
          input_format?: string
          output_format?: string
          timestamp?: string
        }
        Update: {
          conversion_type?: string | null
          converted_filename?: string | null
          created_at?: string
          file_content?: string | null
          id?: string
          name?: string
          original_filename?: string | null
          user_id?: string
          success?: boolean
          file_size?: number
          conversion_time?: number
          error_message?: string | null
          input_format?: string
          output_format?: string
          timestamp?: string
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
      [_ in never]: never
    }
    Functions: {
      add_monthly_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      add_monthly_credits_for_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      track_conversion: {
        Args: {
          p_user_id: string
          p_success: boolean
          p_file_size: number
          p_conversion_time: number
          p_error_message: string | null
          p_input_format: string
          p_output_format: string
        }
        Returns: string // UUID of the created conversion
      }
      get_system_metrics: {
        Args: {
          p_start_date: string | null
          p_end_date: string | null
        }
        Returns: {
          total_users: number
          active_users: number
          total_conversions: number
          success_rate: number
          average_response_time: number
        }
      }
      get_user_metrics: {
        Args: {
          p_user_id: string
          p_start_date: string | null
          p_end_date: string | null
        }
        Returns: {
          total_conversions: number
          successful_conversions: number
          failed_conversions: number
          average_conversion_time: number
          last_conversion: string
        }
      }
      get_conversions_by_date_range: {
        Args: {
          p_start_date: string
          p_end_date: string
        }
        Returns: Array<{
          date: string
          total: number
          successful: number
          failed: number
        }>
      }
      get_conversions_by_type: {
        Args: Record<PropertyKey, never>
        Returns: Array<{
          input_format: string
          output_format: string
          count: number
          success_rate: number
        }>
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
