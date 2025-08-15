/**
 * @file: check-status/route.ts
 * @description: API endpoint для перевірки стану бази даних
 * @dependencies: @/lib/supabase
 * @created: 2024-12-19
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY не знайдено');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Перевіряємо кількість записів у кожній таблиці
    const tables = ['tenants', 'users', 'categories', 'products', 'customers', 'orders', 'order_items'];
    const results: any = {};
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          results[table] = { error: error.message };
        } else {
          results[table] = { count: count || 0 };
        }
      } catch (err) {
        results[table] = { error: 'Помилка запиту' };
      }
    }
    
    return NextResponse.json({
      success: true,
      database_status: results,
      message: 'Статус бази даних отримано'
    });

  } catch (error) {
    console.error('Check Status API: Помилка:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Помилка перевірки статусу',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
