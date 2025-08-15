/**
 * @file: supabase.ts
 * @description: Конфігурація Supabase клієнта
 * @dependencies: @supabase/supabase-js
 * @created: 2024-12-19
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Перевіряємо, чи вже існує клієнт
let supabaseClient: ReturnType<typeof createClient> | null = null;

// Створюємо Supabase клієнт тільки один раз
export const supabase = (() => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          storageKey: 'berry-pos-auth',
        }
      }
    );
  }
  return supabaseClient;
})();

// Типи для бази даних
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description?: string;
          contact_email?: string;
          contact_phone?: string;
          address?: string;
          website?: string;
          timezone?: string;
          currency?: string;
          status: 'active' | 'inactive' | 'suspended';
          subscription_plan?: string;
          subscription_expires_at?: string;
          logo_url?: string;
          primary_color?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          contact_email?: string;
          contact_phone?: string;
          address?: string;
          website?: string;
          timezone?: string;
          currency?: string;
          status?: 'active' | 'inactive' | 'suspended';
          subscription_plan?: string;
          subscription_expires_at?: string;
          logo_url?: string;
          primary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          contact_email?: string;
          contact_phone?: string;
          address?: string;
          website?: string;
          timezone?: string;
          currency?: string;
          status?: 'active' | 'inactive' | 'suspended';
          subscription_plan?: string;
          subscription_expires_at?: string;
          logo_url?: string;
          primary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          clerk_id: string;
          tenant_id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          role: 'owner' | 'manager' | 'employee';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          tenant_id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          role?: 'owner' | 'manager' | 'employee';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          tenant_id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: 'owner' | 'manager' | 'employee';
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description?: string;
          price: number;
          category_id?: string;
          image_url?: string;
          is_available: boolean;
          stock_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string;
          price: number;
          category_id?: string;
          image_url?: string;
          is_available?: boolean;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string;
          price?: number;
          category_id?: string;
          image_url?: string;
          is_available?: boolean;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description?: string;
          parent_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string;
          parent_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string;
          parent_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id?: string;
          table_number?: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          total_amount: number;
          payment_method?: 'cash' | 'card' | 'online';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          customer_id?: string;
          table_number?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          total_amount: number;
          payment_method?: 'cash' | 'card' | 'online';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_id?: string;
          table_number?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          total_amount?: number;
          payment_method?: 'cash' | 'card' | 'online';
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
      customers: {
        Row: {
          id: string;
          tenant_id: string;
          email?: string;
          phone?: string;
          first_name?: string;
          last_name?: string;
          loyalty_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          email?: string;
          phone?: string;
          first_name?: string;
          last_name?: string;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          email?: string;
          phone?: string;
          first_name?: string;
          last_name?: string;
          loyalty_points?: number;
          created_at?: string;
          updated_at?: string;
        };
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
  };
}

// Типізований клієнт
export type SupabaseClient = typeof supabase;
