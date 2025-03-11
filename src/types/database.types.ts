
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          created_at: string
          last_login: string | null
          is_banned: boolean | null
        }
        Insert: {
          id: string
          name?: string | null
          created_at?: string
          last_login?: string | null
          is_banned?: boolean | null
        }
        Update: {
          id?: string
          name?: string | null
          created_at?: string
          last_login?: string | null
          is_banned?: boolean | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string | null
          priority: string | null
          created_at: string
          updated_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
