declare namespace UserProfile {
  interface ProfileData {
    profile: Profile;
    orders: Order[] | null;
  }

  type Profile = Database['public']['Tables']['users']['Row'];

  type Order = Database['public']['Tables']['orders']['Row'];

  type UserInsetProps = Database['public']['Tables']['users']['Insert'];

  type UserUpdateProps = Database['public']['Tables']['users']['Update'];

  interface Database {
    public: {
      Tables: {
        orders: {
          Row: {
            anonymous_id: string | null;
            cart: FakeCartItem[] | null;
            created_at: string;
            id: number | null;
            user: number | null;
          };
          Insert: {
            anonymous_id?: string | null;
            cart?: Json | null;
            created_at?: string;
            id?: number | null;
            user?: number | null;
          };
          Update: {
            anonymous_id?: string | null;
            cart?: Json | null;
            created_at?: string;
            id?: number | null;
            user?: number | null;
          };
          Relationships: [
            {
              foreignKeyName: 'orders_user_fkey';
              columns: ['user'];
              isOneToOne: false;
              referencedRelation: 'users';
              referencedColumns: ['id'];
            },
          ];
        };
        users: {
          Row: {
            created_at: string;
            email: string | null;
            id: number;
            name: string | null;
            segment_id: string | null;
          };
          Insert: {
            created_at?: string;
            email?: string | null;
            id?: number;
            name?: string | null;
            segment_id?: string | null;
          };
          Update: {
            created_at?: string;
            email?: string | null;
            id?: number;
            name?: string | null;
            segment_id?: string | null;
          };
          Relationships: [];
        };
      };
      Views: {
        [_ in never]: never;
      };
      Functions: {
        [_ in never]: never;
      };
      Enums: {
        [_ in never]: never;
      };
      CompositeTypes: {
        [_ in never]: never;
      };
    };
  }

  interface FakeCartItem {
    product: {
      id: string;
      slug: string;
      name: string;
      description: string;
      price: number;
      categories: string[];
      rootCategories?: string[];
      subCategories?: string[];
      thumbnailId: string;
      images: {
        id: string;
        url: string;
      }[];
    };
    quantity: number;
  }
}
