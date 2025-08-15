/**
 * @file: api/supabase/update-categories-schema/route.ts
 * @description: API endpoint для оновлення схеми категорій з підтримкою підкатегорій
 * @dependencies: Supabase
 * @created: 2024-12-19
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('Оновлення схеми категорій...')

    // 1. Додаємо нові колонки
    console.log('Додавання нових колонок...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE categories 
        ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;
      `
    })

    if (alterError) {
      console.error('Помилка додавання колонок:', alterError)
      // Спробуємо альтернативний спосіб
      const { error: alterError2 } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
            BEGIN
              ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;
            EXCEPTION
              WHEN duplicate_column THEN null;
            END;
            BEGIN
              ALTER TABLE categories ADD COLUMN level INTEGER DEFAULT 0;
            EXCEPTION
              WHEN duplicate_column THEN null;
            END;
          END $$;
        `
      })
      
      if (alterError2) {
        throw new Error(`Помилка додавання колонок: ${alterError2.message}`)
      }
    }

    // 2. Оновлюємо існуючі категорії
    console.log('Оновлення існуючих категорій...')
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE categories 
        SET level = 0 
        WHERE parent_id IS NULL OR parent_id = '';
      `
    })

    if (updateError) {
      console.warn('Попередження при оновленні категорій:', updateError)
    }

    // 3. Створюємо індекси
    console.log('Створення індексів...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
        CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);
      `
    })

    if (indexError) {
      console.warn('Попередження при створенні індексів:', indexError)
    }

    // 4. Додаємо перевірку для level
    console.log('Додавання перевірки level...')
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          BEGIN
            ALTER TABLE categories ADD CONSTRAINT check_category_level CHECK (level >= 0 AND level <= 2);
          EXCEPTION
            WHEN duplicate_object THEN null;
          END;
        END $$;
      `
    })

    if (constraintError) {
      console.warn('Попередження при додаванні перевірки:', constraintError)
    }

    // 5. Перевіряємо результат
    console.log('Перевірка результату...')
    const { data: categories, error: checkError } = await supabase
      .from('categories')
      .select('id, name, parent_id, level')
      .limit(5)

    if (checkError) {
      throw new Error(`Помилка перевірки: ${checkError.message}`)
    }

    console.log('Схема категорій успішно оновлена!')
    console.log('Приклад категорій:', categories)

    return NextResponse.json({
      success: true,
      message: 'Схема категорій успішно оновлена',
      categories: categories
    })

  } catch (error) {
    console.error('Помилка оновлення схеми категорій:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Невідома помилка'
    }, { status: 500 })
  }
}
