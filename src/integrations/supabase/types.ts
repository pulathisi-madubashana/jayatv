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
      admin_permissions: {
        Row: {
          admin_users_manage: boolean
          created_at: string
          events_manage: boolean
          events_view: boolean
          id: string
          media_add: boolean
          media_delete: boolean
          media_edit: boolean
          media_view: boolean
          preachers_add: boolean
          preachers_delete: boolean
          preachers_edit: boolean
          preachers_view: boolean
          programs_add: boolean
          programs_delete: boolean
          programs_edit: boolean
          programs_view: boolean
          requests_approve: boolean
          requests_delete: boolean
          requests_reject: boolean
          requests_view: boolean
          schedule_add: boolean
          schedule_delete: boolean
          schedule_edit: boolean
          schedule_view: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_users_manage?: boolean
          created_at?: string
          events_manage?: boolean
          events_view?: boolean
          id?: string
          media_add?: boolean
          media_delete?: boolean
          media_edit?: boolean
          media_view?: boolean
          preachers_add?: boolean
          preachers_delete?: boolean
          preachers_edit?: boolean
          preachers_view?: boolean
          programs_add?: boolean
          programs_delete?: boolean
          programs_edit?: boolean
          programs_view?: boolean
          requests_approve?: boolean
          requests_delete?: boolean
          requests_reject?: boolean
          requests_view?: boolean
          schedule_add?: boolean
          schedule_delete?: boolean
          schedule_edit?: boolean
          schedule_view?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_users_manage?: boolean
          created_at?: string
          events_manage?: boolean
          events_view?: boolean
          id?: string
          media_add?: boolean
          media_delete?: boolean
          media_edit?: boolean
          media_view?: boolean
          preachers_add?: boolean
          preachers_delete?: boolean
          preachers_edit?: boolean
          preachers_view?: boolean
          programs_add?: boolean
          programs_delete?: boolean
          programs_edit?: boolean
          programs_view?: boolean
          requests_approve?: boolean
          requests_delete?: boolean
          requests_reject?: boolean
          requests_view?: boolean
          schedule_add?: boolean
          schedule_delete?: boolean
          schedule_edit?: boolean
          schedule_view?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          sender_email: string
          sender_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          sender_email: string
          sender_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_email?: string
          sender_name?: string
        }
        Relationships: []
      }
      dharma_requests: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          admin_note: string | null
          branch_location: string | null
          branch_location_other: string | null
          city: string | null
          created_at: string
          district: string | null
          id: string
          language_used: string | null
          location_contact_phone: string | null
          location_name: string | null
          message: string | null
          phone_country_code: string
          phone_number: string
          preacher_ids: string[] | null
          preacher_names_english: string[] | null
          preacher_names_sinhala: string[] | null
          program_id: string | null
          program_name_english: string
          program_name_sinhala: string
          province: string | null
          recording_date: string | null
          recording_location_other: string | null
          recording_location_type: string | null
          recording_time: string | null
          request_type: string | null
          requested_date: string
          requester_name: string
          status: string | null
          updated_at: string
          whatsapp_country_code: string
          whatsapp_number: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          admin_note?: string | null
          branch_location?: string | null
          branch_location_other?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          language_used?: string | null
          location_contact_phone?: string | null
          location_name?: string | null
          message?: string | null
          phone_country_code: string
          phone_number: string
          preacher_ids?: string[] | null
          preacher_names_english?: string[] | null
          preacher_names_sinhala?: string[] | null
          program_id?: string | null
          program_name_english: string
          program_name_sinhala: string
          province?: string | null
          recording_date?: string | null
          recording_location_other?: string | null
          recording_location_type?: string | null
          recording_time?: string | null
          request_type?: string | null
          requested_date: string
          requester_name: string
          status?: string | null
          updated_at?: string
          whatsapp_country_code: string
          whatsapp_number: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          admin_note?: string | null
          branch_location?: string | null
          branch_location_other?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          language_used?: string | null
          location_contact_phone?: string | null
          location_name?: string | null
          message?: string | null
          phone_country_code?: string
          phone_number?: string
          preacher_ids?: string[] | null
          preacher_names_english?: string[] | null
          preacher_names_sinhala?: string[] | null
          program_id?: string | null
          program_name_english?: string
          program_name_sinhala?: string
          province?: string | null
          recording_date?: string | null
          recording_location_other?: string | null
          recording_location_type?: string | null
          recording_time?: string | null
          request_type?: string | null
          requested_date?: string
          requester_name?: string
          status?: string | null
          updated_at?: string
          whatsapp_country_code?: string
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "dharma_requests_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          created_at: string
          description: string | null
          download_enabled: boolean
          download_url: string | null
          duration: string | null
          file_url: string | null
          id: string
          is_youtube: boolean
          media_date: string
          media_type: string
          program_id: string | null
          telecast_date: string | null
          thumbnail_url: string | null
          title_english: string | null
          title_sinhala: string
          updated_at: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_enabled?: boolean
          download_url?: string | null
          duration?: string | null
          file_url?: string | null
          id?: string
          is_youtube?: boolean
          media_date?: string
          media_type: string
          program_id?: string | null
          telecast_date?: string | null
          thumbnail_url?: string | null
          title_english?: string | null
          title_sinhala: string
          updated_at?: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_enabled?: boolean
          download_url?: string | null
          duration?: string | null
          file_url?: string | null
          id?: string
          is_youtube?: boolean
          media_date?: string
          media_type?: string
          program_id?: string | null
          telecast_date?: string | null
          thumbnail_url?: string | null
          title_english?: string | null
          title_sinhala?: string
          updated_at?: string
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_items_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      media_preachers: {
        Row: {
          created_at: string
          id: string
          media_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_preachers_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_preachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          biography: string | null
          created_at: string
          display_order: number | null
          id: string
          keywords: string[] | null
          name_english: string
          name_sinhala: string
          photo_url: string | null
          profile_type: string
          updated_at: string
        }
        Insert: {
          biography?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          keywords?: string[] | null
          name_english: string
          name_sinhala: string
          photo_url?: string | null
          profile_type?: string
          updated_at?: string
        }
        Update: {
          biography?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          keywords?: string[] | null
          name_english?: string
          name_sinhala?: string
          photo_url?: string | null
          profile_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      program_preachers: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          program_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          program_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_preachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_preachers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_schedule: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          program_id: string | null
          program_name_english: string
          program_name_sinhala: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          program_id?: string | null
          program_name_english: string
          program_name_sinhala: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          program_id?: string | null
          program_name_english?: string
          program_name_sinhala?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_schedule_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          allow_deshana_request: boolean
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          keywords: string[] | null
          logo_url: string | null
          name_english: string
          name_sinhala: string
          updated_at: string
        }
        Insert: {
          allow_deshana_request?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          logo_url?: string | null
          name_english: string
          name_sinhala: string
          updated_at?: string
        }
        Update: {
          allow_deshana_request?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          logo_url?: string | null
          name_english?: string
          name_sinhala?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      special_events: {
        Row: {
          created_at: string
          description: string | null
          end_datetime: string
          id: string
          image_url: string | null
          is_active: boolean
          program_id: string | null
          start_datetime: string
          title_english: string
          title_sinhala: string
          updated_at: string
          whatsapp_link: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_datetime: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          program_id?: string | null
          start_datetime: string
          title_english: string
          title_sinhala: string
          updated_at?: string
          whatsapp_link?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_datetime?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          program_id?: string | null
          start_datetime?: string
          title_english?: string
          title_sinhala?: string
          updated_at?: string
          whatsapp_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "special_events_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          new_videos: number | null
          status: string | null
          sync_type: string
          videos_synced: number | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          new_videos?: number | null
          status?: string | null
          sync_type: string
          videos_synced?: number | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          new_videos?: number | null
          status?: string | null
          sync_type?: string
          videos_synced?: number | null
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
      youtube_videos: {
        Row: {
          auto_detected: boolean | null
          created_at: string
          duration: string | null
          id: string
          profile_id: string | null
          program_id: string | null
          published_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_id: string
        }
        Insert: {
          auto_detected?: boolean | null
          created_at?: string
          duration?: string | null
          id?: string
          profile_id?: string | null
          program_id?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_id: string
        }
        Update: {
          auto_detected?: boolean | null
          created_at?: string
          duration?: string | null
          id?: string
          profile_id?: string | null
          program_id?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_videos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_videos_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
