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
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          company_info: Json
          regulatory_profile_completed: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          company_info?: Json
          regulatory_profile_completed?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          company_info?: Json
          regulatory_profile_completed?: boolean
        }
        Relationships: []
      }
      threads: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          is_saved: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
          is_saved?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
          is_saved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "threads_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          content: string
          role: 'user' | 'assistant' | 'system'
          created_at: string
          citations: Json
        }
        Insert: {
          id?: string
          thread_id: string
          content: string
          role: 'user' | 'assistant' | 'system'
          created_at?: string
          citations?: Json
        }
        Update: {
          id?: string
          thread_id?: string
          content?: string
          role?: 'user' | 'assistant' | 'system'
          created_at?: string
          citations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            referencedRelation: "threads"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          status: 'processing' | 'completed' | 'error'
          content: string | null
          metadata: Json
          created_at: string
          template_id: string | null
          generation_metadata: Json
          validation_results: Json | null
          compliance_report: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          status?: 'processing' | 'completed' | 'error'
          content?: string | null
          metadata?: Json
          created_at?: string
          template_id?: string | null
          generation_metadata?: Json
          validation_results?: Json | null
          compliance_report?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          status?: 'processing' | 'completed' | 'error'
          content?: string | null
          metadata?: Json
          created_at?: string
          template_id?: string | null
          generation_metadata?: Json
          validation_results?: Json | null
          compliance_report?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Thread = Database['public']['Tables']['threads']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Document = Database['public']['Tables']['documents']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertThread = Database['public']['Tables']['threads']['Insert']
export type InsertMessage = Database['public']['Tables']['messages']['Insert']
export type InsertDocument = Database['public']['Tables']['documents']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateThread = Database['public']['Tables']['threads']['Update']
export type UpdateMessage = Database['public']['Tables']['messages']['Update']
export type UpdateDocument = Database['public']['Tables']['documents']['Update']