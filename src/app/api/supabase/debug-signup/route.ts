import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('Debug Signup API: Діагностика проблеми з реєстрацією...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY не знайдено в змінних середовища');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Перевіряємо структуру таблиці tenants
    console.log('Debug Signup API: Перевіряємо структуру таблиці tenants...');
    
    const { data: tenantsStructure, error: tenantsStructureError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);
    
    console.log('Tenants structure:', tenantsStructure);
    console.log('Tenants structure error:', tenantsStructureError);
    
    // 2. Перевіряємо структуру таблиці users
    console.log('Debug Signup API: Перевіряємо структуру таблиці users...');
    
    const { data: usersStructure, error: usersStructureError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    console.log('Users structure:', usersStructure);
    console.log('Users structure error:', usersStructureError);
    
    // 3. Перевіряємо RLS політики
    console.log('Debug Signup API: Перевіряємо RLS політики...');
    
    const { data: rlsPolicies, error: rlsError } = await supabase
      .rpc('get_rls_policies');
    
    console.log('RLS policies:', rlsPolicies);
    console.log('RLS error:', rlsError);
    
    // 4. Перевіряємо функції
    console.log('Debug Signup API: Перевіряємо функції...');
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_functions');
    
    console.log('Functions:', functions);
    console.log('Functions error:', functionsError);
    
    // 5. Перевіряємо тригери
    console.log('Debug Signup API: Перевіряємо тригери...');
    
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers');
    
    console.log('Triggers:', triggers);
    console.log('Triggers error:', triggersError);
    
    return NextResponse.json({
      success: true,
      message: 'Діагностика завершена',
      data: {
        tenants: {
          structure: tenantsStructure,
          error: tenantsStructureError
        },
        users: {
          structure: usersStructure,
          error: usersStructureError
        },
        rls: {
          policies: rlsPolicies,
          error: rlsError
        },
        functions: {
          list: functions,
          error: functionsError
        },
        triggers: {
          list: triggers,
          error: triggersError
        }
      }
    });

  } catch (error) {
    console.error('Debug Signup API: Помилка:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Помилка діагностики',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
