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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliate_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          tier: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          tier?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_earnings: {
        Row: {
          affiliate_code_id: string | null
          amount: number | null
          created_at: string
          id: string
          ticket_id: string | null
        }
        Insert: {
          affiliate_code_id?: string | null
          amount?: number | null
          created_at?: string
          id?: string
          ticket_id?: string | null
        }
        Update: {
          affiliate_code_id?: string | null
          amount?: number | null
          created_at?: string
          id?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_earnings_affiliate_code_id_fkey"
            columns: ["affiliate_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_earnings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          paid_by: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          paid_by: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          paid_by?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          start_at: string | null
          subtitle: string | null
          time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          start_at?: string | null
          subtitle?: string | null
          time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          start_at?: string | null
          subtitle?: string | null
          time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      media_passes: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          payment_method: string | null
          status: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          payment_method?: string | null
          status?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          payment_method?: string | null
          status?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          media_types: string[] | null
          media_urls: string[] | null
          pinned: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          media_types?: string[] | null
          media_urls?: string[] | null
          pinned?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          media_types?: string[] | null
          media_urls?: string[] | null
          pinned?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_approved: boolean | null
          role: string | null
          updated_at: string
          user_id: string
          username: string | null
          waiver_completed: boolean | null
          waiver_completed_at: string | null
        }
        Insert: {
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          role?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          waiver_completed?: boolean | null
          waiver_completed_at?: string | null
        }
        Update: {
          approval_status?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          role?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          waiver_completed?: boolean | null
          waiver_completed_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          affiliate_code_id: string | null
          created_at: string
          id: string
          referred_id: string | null
          referrer_id: string | null
        }
        Insert: {
          affiliate_code_id?: string | null
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
        }
        Update: {
          affiliate_code_id?: string | null
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_code_id_fkey"
            columns: ["affiliate_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string | null
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          amount: number
          created_at: string
          event_id: string | null
          id: string
          payment_method: string | null
          qr_code: string | null
          qr_code_data: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          used_at: string | null
          used_by: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          event_id?: string | null
          id?: string
          payment_method?: string | null
          qr_code?: string | null
          qr_code_data?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          event_id?: string | null
          id?: string
          payment_method?: string | null
          qr_code?: string | null
          qr_code_data?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      waivers: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
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
      create_post: {
        Args: {
          media_types?: string[]
          media_urls?: string[]
          post_content: string
        }
        Returns: undefined
      }
      generate_affiliate_code: { Args: never; Returns: string }
      generate_qr_token: { Args: never; Returns: string }
      get_my_media_passes: {
        Args: never
        Returns: {
          created_at: string
          id: string
          instagram_handle: string
          pass_type: string
          photographer_name: string
          qr_code_token: string
          status: string
          valid_until: string
        }[]
      }
      get_posts_with_counts: {
        Args: never
        Returns: {
          author_avatar: string
          author_name: string
          author_role: string
          comment_count: number
          content: string
          created_at: string
          id: string
          like_count: number
          media_types: string[]
          media_urls: string[]
          pinned: boolean
          updated_at: string
          user_id: string
          user_liked: boolean
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: string
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      process_affiliate_referral: {
        Args: {
          p_affiliate_code: string
          p_referred_user_id: string
          p_ticket_id: string
        }
        Returns: boolean
      }
      toggle_like: { Args: { post_id: string }; Returns: undefined }
      toggle_pin: { Args: { post_id: string }; Returns: undefined }
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
