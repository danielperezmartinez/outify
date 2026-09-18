export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  outify: {
    Tables: {
      image_cleanup: {
        Row: {
          created_at: string;
          path: string;
          process_after: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          path: string;
          process_after?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          path?: string;
          process_after?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'image_cleanup_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      item_locations: {
        Row: {
          item_id: number;
          updated_at: string;
          user_id: string;
          zone_id: number;
        };
        Insert: {
          item_id: number;
          updated_at?: string;
          user_id?: string;
          zone_id: number;
        };
        Update: {
          item_id?: number;
          updated_at?: string;
          user_id?: string;
          zone_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'item_locations_item_id_user_id_fkey';
            columns: ['item_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id', 'user_id'];
          },
          {
            foreignKeyName: 'item_locations_zone_id_user_id_fkey';
            columns: ['zone_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'zones';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
      item_tags: {
        Row: {
          item_id: number;
          tag_id: number;
          user_id: string;
        };
        Insert: {
          item_id: number;
          tag_id: number;
          user_id?: string;
        };
        Update: {
          item_id?: number;
          tag_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'item_tags_item_id_user_id_fkey';
            columns: ['item_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id', 'user_id'];
          },
          {
            foreignKeyName: 'item_tags_tag_id_user_id_fkey';
            columns: ['tag_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
      items: {
        Row: {
          archived_at: string | null;
          brand: string;
          category: string;
          created_at: string;
          description: string;
          id: number;
          image_path: string;
          material: string;
          name: string;
          primary_color: string;
          seasons: string[];
          size_label: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          brand?: string;
          category: string;
          created_at?: string;
          description?: string;
          id?: never;
          image_path: string;
          material?: string;
          name: string;
          primary_color?: string;
          seasons?: string[];
          size_label?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          archived_at?: string | null;
          brand?: string;
          category?: string;
          created_at?: string;
          description?: string;
          id?: never;
          image_path?: string;
          material?: string;
          name?: string;
          primary_color?: string;
          seasons?: string[];
          size_label?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          initialized_at: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id: string;
          initialized_at?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          initialized_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          name: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tags_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      wardrobes: {
        Row: {
          created_at: string;
          description: string;
          height: number;
          id: number;
          name: string;
          position_x: number;
          position_y: number;
          room: string;
          updated_at: string;
          user_id: string;
          width: number;
          z_index: number;
        };
        Insert: {
          created_at?: string;
          description?: string;
          height?: number;
          id?: never;
          name: string;
          position_x?: number;
          position_y?: number;
          room?: string;
          updated_at?: string;
          user_id?: string;
          width?: number;
          z_index?: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          height?: number;
          id?: never;
          name?: string;
          position_x?: number;
          position_y?: number;
          room?: string;
          updated_at?: string;
          user_id?: string;
          width?: number;
          z_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'wardrobes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      zones: {
        Row: {
          color: string;
          created_at: string;
          height: number;
          id: number;
          name: string;
          position_x: number;
          position_y: number;
          type: string;
          updated_at: string;
          user_id: string;
          wardrobe_id: number;
          width: number;
          z_index: number;
        };
        Insert: {
          color?: string;
          created_at?: string;
          height?: number;
          id?: never;
          name: string;
          position_x?: number;
          position_y?: number;
          type?: string;
          updated_at?: string;
          user_id?: string;
          wardrobe_id: number;
          width?: number;
          z_index?: number;
        };
        Update: {
          color?: string;
          created_at?: string;
          height?: number;
          id?: never;
          name?: string;
          position_x?: number;
          position_y?: number;
          type?: string;
          updated_at?: string;
          user_id?: string;
          wardrobe_id?: number;
          width?: number;
          z_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'zones_wardrobe_id_user_id_fkey';
            columns: ['wardrobe_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'wardrobes';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_archived_item: { Args: { item: number }; Returns: undefined };
      initialize_user_workspace: { Args: never; Returns: undefined };
      save_item: {
        Args: { item_data: Json; tag_names?: string[]; target_zone?: number };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  outify_dev: {
    Tables: {
      image_cleanup: {
        Row: {
          created_at: string;
          path: string;
          process_after: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          path: string;
          process_after?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          path?: string;
          process_after?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'image_cleanup_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      item_locations: {
        Row: {
          item_id: number;
          updated_at: string;
          user_id: string;
          zone_id: number;
        };
        Insert: {
          item_id: number;
          updated_at?: string;
          user_id?: string;
          zone_id: number;
        };
        Update: {
          item_id?: number;
          updated_at?: string;
          user_id?: string;
          zone_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'item_locations_item_id_user_id_fkey';
            columns: ['item_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id', 'user_id'];
          },
          {
            foreignKeyName: 'item_locations_zone_id_user_id_fkey';
            columns: ['zone_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'zones';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
      item_tags: {
        Row: {
          item_id: number;
          tag_id: number;
          user_id: string;
        };
        Insert: {
          item_id: number;
          tag_id: number;
          user_id?: string;
        };
        Update: {
          item_id?: number;
          tag_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'item_tags_item_id_user_id_fkey';
            columns: ['item_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'items';
            referencedColumns: ['id', 'user_id'];
          },
          {
            foreignKeyName: 'item_tags_tag_id_user_id_fkey';
            columns: ['tag_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
      items: {
        Row: {
          archived_at: string | null;
          brand: string;
          category: string;
          created_at: string;
          description: string;
          id: number;
          image_path: string;
          material: string;
          name: string;
          primary_color: string;
          seasons: string[];
          size_label: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          brand?: string;
          category: string;
          created_at?: string;
          description?: string;
          id?: never;
          image_path: string;
          material?: string;
          name: string;
          primary_color?: string;
          seasons?: string[];
          size_label?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          archived_at?: string | null;
          brand?: string;
          category?: string;
          created_at?: string;
          description?: string;
          id?: never;
          image_path?: string;
          material?: string;
          name?: string;
          primary_color?: string;
          seasons?: string[];
          size_label?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          initialized_at: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id: string;
          initialized_at?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          initialized_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          name: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tags_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      wardrobes: {
        Row: {
          created_at: string;
          description: string;
          height: number;
          id: number;
          name: string;
          position_x: number;
          position_y: number;
          room: string;
          updated_at: string;
          user_id: string;
          width: number;
          z_index: number;
        };
        Insert: {
          created_at?: string;
          description?: string;
          height?: number;
          id?: never;
          name: string;
          position_x?: number;
          position_y?: number;
          room?: string;
          updated_at?: string;
          user_id?: string;
          width?: number;
          z_index?: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          height?: number;
          id?: never;
          name?: string;
          position_x?: number;
          position_y?: number;
          room?: string;
          updated_at?: string;
          user_id?: string;
          width?: number;
          z_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'wardrobes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      zones: {
        Row: {
          color: string;
          created_at: string;
          height: number;
          id: number;
          name: string;
          position_x: number;
          position_y: number;
          type: string;
          updated_at: string;
          user_id: string;
          wardrobe_id: number;
          width: number;
          z_index: number;
        };
        Insert: {
          color?: string;
          created_at?: string;
          height?: number;
          id?: never;
          name: string;
          position_x?: number;
          position_y?: number;
          type?: string;
          updated_at?: string;
          user_id?: string;
          wardrobe_id: number;
          width?: number;
          z_index?: number;
        };
        Update: {
          color?: string;
          created_at?: string;
          height?: number;
          id?: never;
          name?: string;
          position_x?: number;
          position_y?: number;
          type?: string;
          updated_at?: string;
          user_id?: string;
          wardrobe_id?: number;
          width?: number;
          z_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'zones_wardrobe_id_user_id_fkey';
            columns: ['wardrobe_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'wardrobes';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_archived_item: { Args: { item: number }; Returns: undefined };
      initialize_user_workspace: { Args: never; Returns: undefined };
      save_item: {
        Args: { item_data: Json; tag_names?: string[]; target_zone?: number };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  outify: {
    Enums: {},
  },
  outify_dev: {
    Enums: {},
  },
} as const;
