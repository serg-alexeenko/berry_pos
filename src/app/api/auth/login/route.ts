/**
 * @file: login/route.ts
 * @description: API endpoint для входу користувача з отриманням даних підприємств
 * @dependencies: @supabase/supabase-js, @supabase/ssr
 * @created: 2024-12-19
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Валідація вхідних даних
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email та пароль обов\'язкові' },
        { status: 400 }
      );
    }

    // Створюємо Supabase клієнт з service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Автентифікуємо користувача
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Помилка входу:', error);
      return NextResponse.json(
        { error: 'Неправильний email або пароль' },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Користувач не знайдений' },
        { status: 401 }
      );
    }

    // Отримуємо дані користувача з таблиці users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at
      `)
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('Помилка отримання даних користувача:', userError);
      return NextResponse.json(
        { error: 'Помилка отримання даних користувача' },
        { status: 500 }
      );
    }

    // Отримуємо підприємства користувача
    const { data: businessesData, error: businessesError } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        type,
        description,
        address,
        phone,
        email,
        primary_color,
        secondary_color,
        logo_url,
        is_active,
        created_at,
        updated_at
      `)
      .eq('user_id', data.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (businessesError) {
      console.error('Помилка отримання підприємств:', businessesError);
      // Підприємства не критичні, продовжуємо
    }

    // Отримуємо статистику по підприємствах
    let businessStats = [];
    if (businessesData && businessesData.length > 0) {
      for (const business of businessesData) {
        // Кількість продуктів
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .eq('is_active', true);

        // Кількість замовлень за сьогодні
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: ordersToday } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)
          .gte('created_at', today.toISOString());

        businessStats.push({
          ...business,
          stats: {
            products_count: productsCount || 0,
            orders_today: ordersToday || 0
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Вхід успішний',
      data: {
        user: userData,
        businesses: businessStats,
        session: data.session
      }
    });

  } catch (error) {
    console.error('Помилка входу:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера', details: error instanceof Error ? error.message : 'Невідома помилка' },
      { status: 500 }
    );
  }
}
