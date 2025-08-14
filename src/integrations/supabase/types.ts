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
      account_deletion_requests: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          total_earnings: number | null
          total_uses: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          total_earnings?: number | null
          total_uses?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          total_earnings?: number | null
          total_uses?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_earnings: {
        Row: {
          created_at: string
          id: string
          last_payout_at: string | null
          total_earned: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_payout_at?: string | null
          total_earned?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_payout_at?: string | null
          total_earned?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
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
          is_active: boolean
          location: string
          start_at: string | null
          subtitle: string | null
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location: string
          start_at?: string | null
          subtitle?: string | null
          time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string
          start_at?: string | null
          subtitle?: string | null
          time?: string
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
          amount: number
          created_at: string
          id: string
          instagram_handle: string
          pass_type: string
          photographer_name: string
          qr_code_data: string | null
          qr_code_token: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          instagram_handle: string
          pass_type: string
          photographer_name: string
          qr_code_data?: string | null
          qr_code_token?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          instagram_handle?: string
          pass_type?: string
          photographer_name?: string
          qr_code_data?: string | null
          qr_code_token?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_pinned: boolean
          media_types: string[] | null
          media_urls: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          media_types?: string[] | null
          media_urls?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          media_types?: string[] | null
          media_urls?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          instagram_handle: string | null
          last_active: string | null
          location: string | null
          role: string
          show_contact_info: boolean | null
          show_in_directory: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          instagram_handle?: string | null
          last_active?: string | null
          location?: string | null
          role?: string
          show_contact_info?: boolean | null
          show_in_directory?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          instagram_handle?: string | null
          last_active?: string | null
          location?: string | null
          role?: string
          show_contact_info?: boolean | null
          show_in_directory?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          affiliate_code_id: string
          affiliate_earning: number
          created_at: string
          discount_amount: number
          id: string
          referred_user_id: string | null
          ticket_id: string | null
        }
        Insert: {
          affiliate_code_id: string
          affiliate_earning: number
          created_at?: string
          discount_amount: number
          id?: string
          referred_user_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          affiliate_code_id?: string
          affiliate_earning?: number
          created_at?: string
          discount_amount?: number
          id?: string
          referred_user_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_code_id_fkey"
            columns: ["affiliate_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          qr_code_data: string | null
          qr_code_token: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          qr_code_data?: string | null
          qr_code_token?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          qr_code_data?: string | null
          qr_code_token?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          affiliate_code_used: string | null
          amount: number
          created_at: string
          currency: string | null
          discount_applied: number | null
          event_id: string | null
          id: string
          original_amount: number | null
          qr_code_data: string | null
          qr_code_token: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          used_at: string | null
          used_by: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          affiliate_code_used?: string | null
          amount: number
          created_at?: string
          currency?: string | null
          discount_applied?: number | null
          event_id?: string | null
          id?: string
          original_amount?: number | null
          qr_code_data?: string | null
          qr_code_token?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          affiliate_code_used?: string | null
          amount?: number
          created_at?: string
          currency?: string | null
          discount_applied?: number | null
          event_id?: string | null
          id?: string
          original_amount?: number | null
          qr_code_data?: string | null
          qr_code_token?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waiver_completions: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          signed_at: string
          updated_at: string
          user_agent: string | null
          user_id: string
          waiver_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          signed_at?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
          waiver_url: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          signed_at?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
          waiver_url?: string
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
        Returns: string
      }
      current_user_has_admin_or_moderator_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      debug_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_uid: string
          profile_data: Json
          profile_exists: boolean
        }[]
      }
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_qr_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_all_media_passes_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number
          created_at: string
          id: string
          instagram_handle: string
          pass_type: string
          photographer_name: string
          qr_code_token: string
          status: string
          stripe_session_id: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
          valid_until: string
        }[]
      }
      get_all_profiles_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          approval_status: string
          avatar_url: string
          bio: string
          created_at: string
          email: string
          full_name: string
          instagram_handle: string
          last_active: string
          location: string
          role: string
          show_contact_info: boolean
          show_in_directory: boolean
          updated_at: string
          user_id: string
        }[]
      }
      get_author_info: {
        Args: { author_user_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          role: string
          user_id: string
        }[]
      }
      get_current_user_role_from_profiles: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_directory_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          full_name: string
          last_active: string
          location: string
          role: string
          user_id: string
        }[]
      }
      get_my_media_passes: {
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
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
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_completed_waiver: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: {
        Args: { user_id: string }
        Returns: boolean
      }
      process_account_deletion: {
        Args: { request_id: string }
        Returns: boolean
      }
      process_affiliate_referral: {
        Args: {
          p_affiliate_code: string
          p_referred_user_id?: string
          p_ticket_id: string
        }
        Returns: Json
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      toggle_like: {
        Args: { post_id: string }
        Returns: boolean
      }
      toggle_pin: {
        Args: { post_id: string }
        Returns: boolean
      }
      update_media_pass_status: {
        Args: {
          new_status: string
          pass_id: string
          qr_data?: string
          qr_token?: string
        }
        Returns: boolean
      }
      update_user_approval: {
        Args: { new_status: string; target_user_id: string }
        Returns: boolean
      }
      verify_media_pass_qr: {
        Args: { token: string }
        Returns: {
          instagram_handle: string
          is_valid: boolean
          pass_status: string
          pass_type: string
          photographer_name: string
          valid_until: string
        }[]
      }
      verify_qr_token: {
        Args: { token: string }
        Returns: {
          event_id: string
          is_valid: boolean
          ticket_status: string
          used_at: string
          used_by: string
          valid_until: string
        }[]
      }
      verify_subscription_qr: {
        Args: { token: string }
        Returns: {
          current_period_end: string
          is_valid: boolean
          subscription_status: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "dj"
        | "photographer"
        | "performer"
        | "moderator"
        | "vip"
        | "user"
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
      app_role: [
        "admin",
        "dj",
        "photographer",
        "performer",
        "moderator",
        "vip",
        "user",
      ],
    },
  },
} as const
