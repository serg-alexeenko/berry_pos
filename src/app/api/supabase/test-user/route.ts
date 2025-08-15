import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('Test User API: Тестуємо створення користувача...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY не знайдено в змінних середовища');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Створюємо тестовий tenant
    console.log('Test User API: Створюємо тестовий tenant...');
    
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: 'Тестовий Ресторан',
        slug: 'test-restaurant-' + Date.now(),
        description: 'Тестовий ресторан для діагностики',
        contact_email: 'test@restaurant.com'
      })
      .select('id')
      .single();
    
    if (tenantError) {
      throw new Error('Помилка створення tenant: ' + tenantError.message);
    }
    
    const tenantId = tenantData.id;
    console.log('Test User API: Tenant створено з ID:', tenantId);
    
    // 2. Створюємо користувача через Supabase Auth
    console.log('Test User API: Створюємо користувача через Auth...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@user.com',
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Тестовий',
        last_name: 'Користувач'
      }
    });
    
    if (authError) {
      throw new Error('Помилка створення користувача в Auth: ' + authError.message);
    }
    
    const userId = authData.user.id;
    console.log('Test User API: Користувача створено в Auth з ID:', userId);
    
    // 3. Створюємо запис в таблиці users
    console.log('Test User API: Створюємо запис в таблиці users...');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        tenant_id: tenantId,
        email: 'test@user.com',
        first_name: 'Тестовий',
        last_name: 'Користувач',
        role: 'owner'
      })
      .select('id, email, tenant_id')
      .single();
    
    if (userError) {
      throw new Error('Помилка створення запису в users: ' + userError.message);
    }
    
    console.log('Test User API: Запис в users створено:', userData);
    
    return NextResponse.json({
      success: true,
      message: 'Тестовий користувач створено успішно',
      data: {
        tenant: tenantData,
        authUser: authData.user,
        user: userData
      }
    });

  } catch (error) {
    console.error('Test User API: Помилка:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Помилка створення тестового користувача',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
