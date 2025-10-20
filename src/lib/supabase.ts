import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string | null
          role: 'admin' | 'collector'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name?: string | null
          role?: 'admin' | 'collector'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string | null
          role?: 'admin' | 'collector'
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          location: string
          start_date: string
          end_date: string
          status: 'active' | 'finished'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          start_date: string
          end_date: string
          status?: 'active' | 'finished'
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          start_date?: string
          end_date?: string
          status?: 'active' | 'finished'
          created_by?: string
          created_at?: string
        }
      }
      campaign_participants: {
        Row: {
          id: string
          campaign_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          campaign_id: string
          collector_id: string
          neighborhood: string
          first_name: string
          phone: string
          demand: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          collector_id: string
          neighborhood: string
          first_name: string
          phone: string
          demand?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          collector_id?: string
          neighborhood?: string
          first_name?: string
          phone?: string
          demand?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          registration_open: boolean
          default_campaign_end_time: string
        }
        Insert: {
          id?: string
          registration_open?: boolean
          default_campaign_end_time?: string
        }
        Update: {
          id?: string
          registration_open?: boolean
          default_campaign_end_time?: string
        }
      }
    }
  }
}
