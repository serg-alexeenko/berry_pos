/**
 * @file: lib/supabase/client.ts
 * @description: Supabase клієнт для браузера
 * @dependencies: @supabase/supabase-js
 * @created: 2024-12-19
 */

import { createClient } from '@supabase/supabase-js';
import type { Database as SupabaseDatabase } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Типи для бази даних (без тенантів)
export interface Database extends SupabaseDatabase {}
