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
      admin_actions_log: {
        Row: {
          action_type: string
          admin_id: string | null
          details: Json | null
          id: string
          target_user_id: string | null
          timestamp: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
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
      credit_transactions: {
        Row: {
          admin_id: string | null
          amount: number
          created_at: string | null
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      cutting_exports: {
        Row: {
          created_at: string
          export_type: string
          file_size: number | null
          file_url: string | null
          id: string
          plan_id: string
        }
        Insert: {
          created_at?: string
          export_type: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          plan_id: string
        }
        Update: {
          created_at?: string
          export_type?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cutting_exports_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cutting_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      cutting_items: {
        Row: {
          created_at: string
          grain_direction: string | null
          height: number
          id: string
          name: string
          plan_id: string
          quantity: number
          thickness: number
          width: number
        }
        Insert: {
          created_at?: string
          grain_direction?: string | null
          height: number
          id?: string
          name: string
          plan_id: string
          quantity?: number
          thickness: number
          width: number
        }
        Update: {
          created_at?: string
          grain_direction?: string | null
          height?: number
          id?: string
          name?: string
          plan_id?: string
          quantity?: number
          thickness?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "cutting_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cutting_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      cutting_plans: {
        Row: {
          created_at: string
          cut_margin: number
          grain_direction: string | null
          id: string
          name: string
          sheet_height: number
          sheet_thickness: number
          sheet_width: number
          status: string | null
          total_area: number
          total_sheets: number
          updated_at: string
          used_area: number
          user_id: string
          utilization_percent: number
          waste_area: number
        }
        Insert: {
          created_at?: string
          cut_margin?: number
          grain_direction?: string | null
          id?: string
          name: string
          sheet_height?: number
          sheet_thickness?: number
          sheet_width?: number
          status?: string | null
          total_area?: number
          total_sheets?: number
          updated_at?: string
          used_area?: number
          user_id: string
          utilization_percent?: number
          waste_area?: number
        }
        Update: {
          created_at?: string
          cut_margin?: number
          grain_direction?: string | null
          id?: string
          name?: string
          sheet_height?: number
          sheet_thickness?: number
          sheet_width?: number
          status?: string | null
          total_area?: number
          total_sheets?: number
          updated_at?: string
          used_area?: number
          user_id?: string
          utilization_percent?: number
          waste_area?: number
        }
        Relationships: []
      }
      cutting_sheets: {
        Row: {
          created_at: string
          id: string
          layout_data: Json
          plan_id: string
          sheet_number: number
          utilization_percent: number
        }
        Insert: {
          created_at?: string
          id?: string
          layout_data: Json
          plan_id: string
          sheet_number: number
          utilization_percent?: number
        }
        Update: {
          created_at?: string
          id?: string
          layout_data?: Json
          plan_id?: string
          sheet_number?: number
          utilization_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "cutting_sheets_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cutting_plans"
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
      edgebands: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          material: string | null
          name: string
          price_per_meter: number
          supplier_id: string | null
          thickness_mm: number
          updated_at: string | null
          width_mm: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material?: string | null
          name: string
          price_per_meter: number
          supplier_id?: string | null
          thickness_mm: number
          updated_at?: string | null
          width_mm: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material?: string | null
          name?: string
          price_per_meter?: number
          supplier_id?: string | null
          thickness_mm?: number
          updated_at?: string | null
          width_mm?: number
        }
        Relationships: [
          {
            foreignKeyName: "edgebands_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_edgebands: {
        Row: {
          created_at: string | null
          edgeband_id: string | null
          edgeband_name: string
          estimate_id: string
          id: string
          length_meters: number
          price_per_meter: number
          thickness_mm: number | null
          total_price: number
        }
        Insert: {
          created_at?: string | null
          edgeband_id?: string | null
          edgeband_name: string
          estimate_id: string
          id?: string
          length_meters: number
          price_per_meter: number
          thickness_mm?: number | null
          total_price: number
        }
        Update: {
          created_at?: string | null
          edgeband_id?: string | null
          edgeband_name?: string
          estimate_id?: string
          id?: string
          length_meters?: number
          price_per_meter?: number
          thickness_mm?: number | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_edgebands_edgeband_id_fkey"
            columns: ["edgeband_id"]
            isOneToOne: false
            referencedRelation: "edgebands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_edgebands_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_materials: {
        Row: {
          area_sqm: number
          created_at: string | null
          estimate_id: string
          id: string
          material_id: string | null
          material_name: string
          material_type: string | null
          quantity: number
          thickness_mm: number | null
          total_price: number
          unit_price: number
          waste_percent: number | null
        }
        Insert: {
          area_sqm: number
          created_at?: string | null
          estimate_id: string
          id?: string
          material_id?: string | null
          material_name: string
          material_type?: string | null
          quantity: number
          thickness_mm?: number | null
          total_price: number
          unit_price: number
          waste_percent?: number | null
        }
        Update: {
          area_sqm?: number
          created_at?: string | null
          estimate_id?: string
          id?: string
          material_id?: string | null
          material_name?: string
          material_type?: string | null
          quantity?: number
          thickness_mm?: number | null
          total_price?: number
          unit_price?: number
          waste_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_materials_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_services: {
        Row: {
          created_at: string | null
          estimate_id: string
          id: string
          price_per_unit: number
          quantity: number
          service_id: string | null
          service_name: string
          service_type: string | null
          total_price: number
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          estimate_id: string
          id?: string
          price_per_unit: number
          quantity: number
          service_id?: string | null
          service_name: string
          service_type?: string | null
          total_price: number
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          estimate_id?: string
          id?: string
          price_per_unit?: number
          quantity?: number
          service_id?: string | null
          service_name?: string
          service_type?: string | null
          total_price?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_services_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          approved_at: string | null
          calculation_data: Json | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          discount_percent: number | null
          edgeband_cost: number | null
          id: string
          material_cost: number | null
          name: string
          notes: string | null
          pieces_data: Json | null
          profit_margin_percent: number | null
          sent_at: string | null
          service_cost: number | null
          status: string | null
          subtotal: number | null
          tax_percent: number | null
          total: number | null
          updated_at: string | null
          user_id: string
          valid_until: string | null
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          calculation_data?: Json | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          discount_percent?: number | null
          edgeband_cost?: number | null
          id?: string
          material_cost?: number | null
          name: string
          notes?: string | null
          pieces_data?: Json | null
          profit_margin_percent?: number | null
          sent_at?: string | null
          service_cost?: number | null
          status?: string | null
          subtotal?: number | null
          tax_percent?: number | null
          total?: number | null
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          calculation_data?: Json | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string | null
          discount_percent?: number | null
          edgeband_cost?: number | null
          id?: string
          material_cost?: number | null
          name?: string
          notes?: string | null
          pieces_data?: Json | null
          profit_margin_percent?: number | null
          sent_at?: string | null
          service_cost?: number | null
          status?: string | null
          subtotal?: number | null
          tax_percent?: number | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
          version?: number | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          color: string | null
          created_at: string | null
          finish: string | null
          height_mm: number
          id: string
          is_active: boolean | null
          name: string
          price_per_sqm: number
          supplier_id: string | null
          thickness_mm: number
          type: string
          updated_at: string | null
          width_mm: number
          yield_factor: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          finish?: string | null
          height_mm?: number
          id?: string
          is_active?: boolean | null
          name: string
          price_per_sqm: number
          supplier_id?: string | null
          thickness_mm: number
          type: string
          updated_at?: string | null
          width_mm?: number
          yield_factor?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          finish?: string | null
          height_mm?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price_per_sqm?: number
          supplier_id?: string | null
          thickness_mm?: number
          type?: string
          updated_at?: string | null
          width_mm?: number
          yield_factor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
      price_histories: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_price: number
          old_price: number | null
          reason: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_price: number
          old_price?: number | null
          reason?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_price?: number
          old_price?: number | null
          reason?: string | null
          record_id?: string
          table_name?: string
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
          last_activity: string | null
          last_login: string | null
          name: string | null
          phone: string | null
          plan_expiry_date: string | null
        }
        Insert: {
          active_plan?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          email_verified?: boolean | null
          id: string
          is_banned?: boolean | null
          last_activity?: string | null
          last_login?: string | null
          name?: string | null
          phone?: string | null
          plan_expiry_date?: string | null
        }
        Update: {
          active_plan?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          is_banned?: boolean | null
          last_activity?: string | null
          last_login?: string | null
          name?: string | null
          phone?: string | null
          plan_expiry_date?: string | null
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
      render_history: {
        Row: {
          created_at: string
          id: string
          output_image_url: string
          prompt: string
          style: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          output_image_url: string
          prompt: string
          style: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          output_image_url?: string
          prompt?: string
          style?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price_per_unit: number
          type: string
          unit: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_per_unit: number
          type: string
          unit: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_per_unit?: number
          type?: string
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      add_credits_to_user: {
        Args: {
          p_admin_id: string
          p_amount: number
          p_description?: string
          p_target_user_id: string
        }
        Returns: undefined
      }
      add_monthly_credits: { Args: never; Returns: undefined }
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
        Args: never
        Returns: {
          count: number
          issue_type: string
        }[]
      }
      fix_missing_profiles: {
        Args: never
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
        Args: never
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
      get_system_metrics_secure:
        | {
            Args: never
            Returns: {
              active_users: number
              average_response_time: number
              success_rate: number
              total_conversions: number
              total_users: number
            }[]
          }
        | {
            Args: { p_end_date?: string; p_start_date?: string }
            Returns: {
              active_users: number
              average_response_time: number
              success_rate: number
              total_conversions: number
              total_users: number
            }[]
          }
      get_user_credit_history: {
        Args: { target_user_id: string }
        Returns: {
          admin_id: string
          amount: number
          created_at: string
          description: string
          id: string
          transaction_type: string
        }[]
      }
      get_user_metrics: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_user_metrics_secure:
        | {
            Args: {
              p_end_date?: string
              p_start_date?: string
              target_user_id?: string
            }
            Returns: {
              average_response_time: number
              success_rate: number
              total_conversions: number
              total_file_size: number
              user_id: string
            }[]
          }
        | {
            Args: { target_user_id?: string }
            Returns: {
              average_response_time: number
              success_rate: number
              total_conversions: number
              total_file_size: number
              user_id: string
            }[]
          }
      get_users_without_profiles: {
        Args: never
        Returns: {
          message: string
          user_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_ceo: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_ceo: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_admin_id?: string
          p_details?: Json
          p_target_user_id?: string
        }
        Returns: undefined
      }
      manage_user_role: {
        Args: {
          p_action: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_target_user_id: string
        }
        Returns: Json
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
      set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_target_user_id: string
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
      update_user_activity: { Args: never; Returns: undefined }
      user_metrics_calc: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "ceo" | "admin" | "user"
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
      app_role: ["ceo", "admin", "user"],
    },
  },
} as const
