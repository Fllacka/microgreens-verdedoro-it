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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category: string | null
          change_frequency: string | null
          content: string | null
          content_blocks: Json | null
          created_at: string | null
          excerpt: string | null
          featured_image_id: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_description: string | null
          og_image_id: string | null
          og_title: string | null
          priority: number | null
          published: boolean | null
          published_at: string | null
          robots: string | null
          slug: string
          structured_data: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          change_frequency?: string | null
          content?: string | null
          content_blocks?: Json | null
          created_at?: string | null
          excerpt?: string | null
          featured_image_id?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_id?: string | null
          og_title?: string | null
          priority?: number | null
          published?: boolean | null
          published_at?: string | null
          robots?: string | null
          slug: string
          structured_data?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string | null
          change_frequency?: string | null
          content?: string | null
          content_blocks?: Json | null
          created_at?: string | null
          excerpt?: string | null
          featured_image_id?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_id?: string | null
          og_title?: string | null
          priority?: number | null
          published?: boolean | null
          published_at?: string | null
          robots?: string | null
          slug?: string
          structured_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_featured_image_id_fkey"
            columns: ["featured_image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_visible: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id: string
          is_visible?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          storage_path: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          storage_path: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          storage_path?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          canonical_url: string | null
          change_frequency: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_description: string | null
          og_image_id: string | null
          og_title: string | null
          priority: number | null
          published: boolean | null
          robots: string | null
          slug: string
          structured_data: Json | null
          template: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          change_frequency?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_id?: string | null
          og_title?: string | null
          priority?: number | null
          published?: boolean | null
          robots?: string | null
          slug: string
          structured_data?: Json | null
          template?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          change_frequency?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_id?: string | null
          og_title?: string | null
          priority?: number | null
          published?: boolean | null
          robots?: string | null
          slug?: string
          structured_data?: Json | null
          template?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits: string[] | null
          benefits_content: string | null
          canonical_url: string | null
          category: string | null
          change_frequency: string | null
          content: string | null
          content_blocks: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_alt: string | null
          image_id: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          og_description: string | null
          og_image_id: string | null
          og_title: string | null
          popular: boolean | null
          price: number | null
          priority: number | null
          published: boolean | null
          rating: number | null
          robots: string | null
          slug: string
          structured_data: Json | null
          updated_at: string | null
          uses: string[] | null
          uses_content: string | null
        }
        Insert: {
          benefits?: string[] | null
          benefits_content?: string | null
          canonical_url?: string | null
          category?: string | null
          change_frequency?: string | null
          content?: string | null
          content_blocks?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_alt?: string | null
          image_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          og_description?: string | null
          og_image_id?: string | null
          og_title?: string | null
          popular?: boolean | null
          price?: number | null
          priority?: number | null
          published?: boolean | null
          rating?: number | null
          robots?: string | null
          slug: string
          structured_data?: Json | null
          updated_at?: string | null
          uses?: string[] | null
          uses_content?: string | null
        }
        Update: {
          benefits?: string[] | null
          benefits_content?: string | null
          canonical_url?: string | null
          category?: string | null
          change_frequency?: string | null
          content?: string | null
          content_blocks?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_alt?: string | null
          image_id?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          og_description?: string | null
          og_image_id?: string | null
          og_title?: string | null
          popular?: boolean | null
          price?: number | null
          priority?: number | null
          published?: boolean | null
          rating?: number | null
          robots?: string | null
          slug?: string
          structured_data?: Json | null
          updated_at?: string | null
          uses?: string[] | null
          uses_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          from_path: string
          id: string
          redirect_type: number | null
          to_path: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          from_path: string
          id?: string
          redirect_type?: number | null
          to_path: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          from_path?: string
          id?: string
          redirect_type?: number | null
          to_path?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          logo_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_logo_id_fkey"
            columns: ["logo_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
