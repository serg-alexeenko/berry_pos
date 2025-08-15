/**
 * @file: lib/supabase/types.ts
 * @description: Типи для Supabase бази даних
 * @dependencies: Supabase
 * @created: 2024-12-19
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'restaurant' | 'cafe' | 'shop' | 'bar' | 'other';
          description?: string;
          address?: string;
          phone?: string;
          email?: string;
          primary_color: string;
          secondary_color: string;
          logo_url?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'restaurant' | 'cafe' | 'shop' | 'bar' | 'other';
          description?: string;
          address?: string;
          phone?: string;
          email?: string;
          primary_color?: string;
          secondary_color?: string;
          logo_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'restaurant' | 'cafe' | 'shop' | 'bar' | 'other';
          description?: string;
          address?: string;
          phone?: string;
          email?: string;
          primary_color?: string;
          secondary_color?: string;
          logo_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          business_id: string;
          user_id?: string;
          first_name: string;
          last_name: string;
          email?: string;
          phone?: string;
          role: string;
          hourly_rate?: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id?: string;
          first_name: string;
          last_name: string;
          email?: string;
          phone?: string;
          role?: string;
          hourly_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          role?: string;
          hourly_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          business_id: string;
          parent_id?: string; // ID батьківської категорії
          name: string;
          description?: string;
          sort_order: number;
          level: number; // Рівень вкладеності (0 - головна, 1 - підкатегорія)
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          parent_id?: string;
          name: string;
          description?: string;
          sort_order?: number;
          level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          parent_id?: string;
          name?: string;
          description?: string;
          sort_order?: number;
          level?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          category_id?: string;
          name: string;
          description?: string;
          price: number;
          cost: number;
          sku?: string;
          barcode?: string;
          stock_quantity: number;
          min_stock_level: number;
          unit: string;
          image_url?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          category_id?: string;
          name: string;
          description?: string;
          price: number;
          cost?: number;
          sku?: string;
          barcode?: string;
          stock_quantity?: number;
          min_stock_level?: number;
          unit?: string;
          image_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          category_id?: string;
          name?: string;
          description?: string;
          price?: number;
          cost?: number;
          sku?: string;
          barcode?: string;
          stock_quantity?: number;
          min_stock_level?: number;
          unit?: string;
          image_url?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          category_id?: string;
          name: string;
          description?: string;
          price: number;
          cost: number;
          sku?: string;
          barcode?: string;
          stock_quantity: number;
          min_stock_level: number;
          unit: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          category_id?: string;
          name: string;
          description?: string;
          price: number;
          cost: number;
          sku?: string;
          barcode?: string;
          stock_quantity?: number;
          min_stock_level?: number;
          unit?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          category_id?: string;
          name?: string;
          description?: string;
          price?: number;
          cost?: number;
          sku?: string;
          barcode?: string;
          stock_quantity?: number;
          min_stock_level?: number;
          unit?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          first_name: string;
          last_name: string;
          email?: string;
          phone?: string;
          address?: string;
          loyalty_points: number;
          notes?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          first_name: string;
          last_name: string;
          email?: string;
          phone?: string;
          address?: string;
          loyalty_points?: number;
          notes?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          address?: string;
          loyalty_points?: number;
          notes?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          business_id: string;
          customer_id?: string;
          employee_id?: string;
          order_number: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          total_amount: number;
          tax_amount: number;
          discount_amount: number;
          payment_method: 'cash' | 'card' | 'online' | 'other';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id?: string;
          employee_id?: string;
          order_number: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          total_amount: number;
          tax_amount?: number;
          discount_amount?: number;
          payment_method?: 'cash' | 'card' | 'online' | 'other';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          employee_id?: string;
          order_number?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          total_amount?: number;
          tax_amount?: number;
          discount_amount?: number;
          payment_method?: 'cash' | 'card' | 'online' | 'other';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          notes?: string;
          created_at?: string;
        };
      };
    };
  };
}
