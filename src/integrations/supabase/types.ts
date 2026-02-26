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
      daily_menus: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          id: string
          menu_item_id: string
          portion_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          menu_item_id: string
          portion_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          menu_item_id?: string
          portion_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_menus_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_records: {
        Row: {
          created_at: string
          daily_menu_id: string | null
          date: string
          delivered_by: string | null
          id: string
          notes: string | null
          portion_count: number
          school_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_menu_id?: string | null
          date?: string
          delivered_by?: string | null
          id?: string
          notes?: string | null
          portion_count?: number
          school_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_menu_id?: string | null
          date?: string
          delivered_by?: string | null
          id?: string
          notes?: string | null
          portion_count?: number
          school_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_records_daily_menu_id_fkey"
            columns: ["daily_menu_id"]
            isOneToOne: false
            referencedRelation: "daily_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string
          current_stock: number
          id: string
          last_restocked_at: string | null
          min_stock: number
          name: string
          price_per_unit: number | null
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_stock?: number
          id?: string
          last_restocked_at?: string | null
          min_stock?: number
          name: string
          price_per_unit?: number | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_stock?: number
          id?: string
          last_restocked_at?: string | null
          min_stock?: number
          name?: string
          price_per_unit?: number | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          calories: number | null
          carbs: number | null
          category: string
          created_at: string
          description: string | null
          fat: number | null
          id: string
          name: string
          protein: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string
          created_at?: string
          description?: string | null
          fat?: number | null
          id?: string
          name: string
          protein?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string
          created_at?: string
          description?: string | null
          fat?: number | null
          id?: string
          name?: string
          protein?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          kitchen_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id?: string
          kitchen_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          kitchen_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          student_count: number
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          student_count?: number
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          student_count?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "admin" | "operator"
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
      app_role: ["admin", "operator"],
    },
  },
} as const
