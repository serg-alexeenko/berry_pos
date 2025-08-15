/**
 * @file: hooks/useSupabase.ts
 * @description: Hook для роботи з Supabase
 * @dependencies: @supabase/supabase-js
 * @created: 2024-12-19
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '@/components/providers/AuthProvider';

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Отримуємо поточну сесію
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Підписуємося на зміни аутентифікації
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    supabase
  };
}

// Хук для отримання бізнесу користувача
export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = useCallback(async () => {
    console.log('useBusiness: fetchBusiness викликано, user:', user?.id);
    
    if (!user) {
      console.log('useBusiness: користувач відсутній, виходимо');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('useBusiness: запит до бази даних для user_id:', user.id);

      // Отримуємо всі бізнеси користувача
      const { data: allBusinesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('useBusiness: всі бізнеси користувача:', allBusinesses);

      if (businessError) {
        console.error('useBusiness: помилка бази даних:', businessError);
        throw new Error(`Помилка отримання бізнесів: ${businessError.message}`);
      }

      if (allBusinesses && allBusinesses.length > 0) {
        // Спочатку шукаємо активний бізнес
        const activeBusiness = allBusinesses.find(b => b.is_active === true);
        
        if (activeBusiness) {
          console.log('useBusiness: знайдено активний бізнес:', activeBusiness);
          setBusiness(activeBusiness);
        } else {
          // Якщо активного немає, беремо перший
          console.log('useBusiness: активного бізнесу немає, беремо перший:', allBusinesses[0]);
          setBusiness(allBusinesses[0]);
        }
      } else {
        console.log('useBusiness: бізнесів не знайдено');
        setBusiness(null);
      }
    } catch (err) {
      console.error('useBusiness: помилка:', err);
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
      console.log('useBusiness: loading встановлено в false');
    }
  }, [user]);

  useEffect(() => {
    console.log('useBusiness: useEffect спрацював, user:', user?.id);
    if (user) {
      fetchBusiness().catch(err => {
        console.error('useBusiness: помилка в fetchBusiness:', err);
      });
    }
  }, [fetchBusiness, user]);

  console.log('useBusiness: рендер зі станом:', { business, loading, error, userId: user?.id });

  return { business, loading, error, refetch: fetchBusiness };
}

// Хук для отримання категорій
export function useCategories() {
  const { business } = useBusiness();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!business) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        throw new Error('Помилка отримання категорій');
      }

      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  }, [business]);

  const createCategory = useCallback(async (categoryData: any) => {
    if (!business) throw new Error('Бізнес не знайдено');

    // Валідація вхідних даних
    if (!categoryData.name || categoryData.name.trim() === '') {
      throw new Error('Назва категорії обов\'язкова');
    }

    try {
      console.log('Створення категорії з даними:', {
        ...categoryData,
        business_id: business.id,
        level: categoryData.parent_id ? 1 : 0
      });

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          business_id: business.id,
          level: categoryData.parent_id ? 1 : 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase помилка при створенні категорії:', error);
        console.error('Тип помилки:', typeof error);
        console.error('Ключі помилки:', Object.keys(error));
        console.error('JSON помилки:', JSON.stringify(error, null, 2));
        
        // Детальна обробка різних типів помилок Supabase
        if (error.code) {
          switch (error.code) {
            case '23505': // unique_violation
              throw new Error('Категорія з такою назвою вже існує');
            case '23503': // foreign_key_violation
              throw new Error('Батьківська категорія не знайдена');
            case '23514': // check_violation
              throw new Error('Неправильний рівень вкладеності категорії');
            case '42P01': // undefined_table
              throw new Error('Таблиця категорій не знайдена - перевірте структуру БД');
            case '42703': // undefined_column
              throw new Error('Колонка не знайдена - потрібно оновити структуру БД');
            default:
              throw new Error(`Помилка бази даних (${error.code}): ${error.message || error.details || 'Невідома помилка'}`);
          }
        } else if (error.message) {
          throw new Error(`Помилка Supabase: ${error.message}`);
        } else if (error.details) {
          throw new Error(`Деталі помилки: ${error.details}`);
        } else {
          throw new Error(`Невідома помилка Supabase: ${JSON.stringify(error)}`);
        }
      }

      console.log('Категорію створено успішно:', data);

      // Оновлюємо локальний стан
      setCategories(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Помилка створення категорії:', err);
      console.error('Тип помилки:', typeof err);
      console.error('Стек помилки:', err instanceof Error ? err.stack : 'Немає стеку');
      
      // Детальна обробка різних типів помилок
      if (err instanceof Error) {
        // Якщо це вже наша оброблена помилка, просто передаємо її далі
        if (err.message.includes('Категорія з такою назвою') ||
            err.message.includes('Батьківська категорія не знайдена') ||
            err.message.includes('Неправильний рівень вкладеності') ||
            err.message.includes('Таблиця категорій не знайдена') ||
            err.message.includes('Колонка не знайдена') ||
            err.message.includes('Помилка бази даних') ||
            err.message.includes('Помилка Supabase')) {
          throw err;
        }
        
        // Інші помилки Error
        throw new Error(`Помилка створення категорії: ${err.message}`);
      } else {
        // Не Error об'єкти
        throw new Error(`Невідома помилка при створенні категорії: ${JSON.stringify(err)}`);
      }
    }
  }, [business]);

  const updateCategory = useCallback(async (categoryId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          level: updates.parent_id ? 1 : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;

      // Оновлюємо локальний стан
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, ...data } : cat
      ));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Помилка оновлення категорії');
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      // Перевіряємо, чи є підкатегорії
      const hasChildren = categories.some(cat => cat.parent_id === categoryId);
      if (hasChildren) {
        throw new Error('Неможливо видалити категорію з підкатегоріями');
      }

      // Перевіряємо, чи є продукти в цій категорії
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1);

      if (products && products.length > 0) {
        throw new Error('Неможливо видалити категорію з продуктами');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      // Оновлюємо локальний стан
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Помилка видалення категорії');
    }
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { 
    categories, 
    loading, 
    error, 
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}



// Хук для отримання клієнтів
export function useCustomers() {
  const { business } = useBusiness();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!business) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (customersError) {
        throw new Error('Помилка отримання клієнтів');
      }

      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, error, refetch: fetchCustomers };
}

// Хук для отримання замовлень
export function useOrders() {
  const { business } = useBusiness();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!business) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw new Error('Помилка отримання замовлень');
      }

      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

// Хук для роботи з продуктами
export function useProducts(businessId?: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            level,
            parent_id
          )
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name');

      if (fetchError) {
        console.error('Помилка отримання продуктів:', fetchError);
        throw new Error(`Помилка отримання продуктів: ${fetchError.message}`);
      }

      setProducts(data || []);
    } catch (err) {
      console.error('Помилка в useProducts:', err);
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const createProduct = useCallback(async (productData: any) => {
    if (!businessId) {
      throw new Error('ID бізнесу не вказано');
    }

    try {
      const insertData = {
        ...productData,
        business_id: businessId
      };
      
      console.log('Спроба створення продукту з даними:', insertData);
      
      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase помилка при створенні продукту:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        
        // Створюємо більш інформативну помилку
        const errorMessage = error.message || 'Невідома помилка Supabase';
        const enhancedError = new Error(`Supabase помилка: ${errorMessage}`);
        (enhancedError as any).supabaseError = error;
        throw enhancedError;
      }

      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Помилка створення продукту:', {
        error: err,
        message: err instanceof Error ? err.message : 'Невідома помилка',
        supabaseError: (err as any).supabaseError
      });
      
      if (err instanceof Error) {
        // Перевіряємо Supabase помилки
        if ((err as any).supabaseError) {
          const supabaseError = (err as any).supabaseError;
          
          if (supabaseError.code === '23505') {
            throw new Error('Продукт з таким SKU або штрих-кодом вже існує');
          } else if (supabaseError.code === '23503') {
            throw new Error('Обрана категорія не існує');
          } else if (supabaseError.code === '23514') {
            throw new Error('Невірні дані продукту (ціна або кількість не може бути від\'ємною)');
          } else if (supabaseError.code === '42P01') {
            throw new Error('Таблиця продуктів не існує');
          } else if (supabaseError.code === '42501') {
            throw new Error('Немає прав для створення продуктів');
          } else {
            throw new Error(`Помилка Supabase (${supabaseError.code}): ${supabaseError.message || 'Невідома помилка'}`);
          }
        }
        
        // Перевіряємо звичайні помилки
        if (err.message.includes('23505')) {
          throw new Error('Продукт з таким SKU або штрих-кодом вже існує');
        } else if (err.message.includes('23503')) {
          throw new Error('Обрана категорія не існує');
        } else if (err.message.includes('23514')) {
          throw new Error('Невірні дані продукту (ціна або кількість не може бути від\'ємною)');
        } else {
          throw new Error(`Помилка створення продукту: ${err.message}`);
        }
      } else {
        throw new Error('Невідома помилка при створенні продукту');
      }
    }
  }, [businessId, fetchProducts]);

  const updateProduct = useCallback(async (productId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .select()
        .single();

      if (error) {
        console.error('Supabase помилка при оновленні продукту:', error);
        throw error;
      }

      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Помилка оновлення продукту:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('23505')) {
          throw new Error('Продукт з таким SKU або штрих-кодом вже існує');
        } else if (err.message.includes('23503')) {
          throw new Error('Обрана категорія не існує');
        } else if (err.message.includes('23514')) {
          throw new Error('Невірні дані продукту (ціна або кількість не може бути від\'ємною)');
        } else {
          throw new Error(`Помилка оновлення продукту: ${err.message}`);
        }
      } else {
        throw new Error('Невідома помилка при оновленні продукту');
      }
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Supabase помилка при видаленні продукту:', error);
        throw error;
      }

      await fetchProducts();
    } catch (err) {
      console.error('Помилка видалення продукту:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('check_product_deletion')) {
          throw new Error('Неможливо видалити продукт, який використовується в замовленнях');
        } else {
          throw new Error(`Помилка видалення продукту: ${err.message}`);
        }
      } else {
        throw new Error('Невідома помилка при видаленні продукту');
      }
    }
  }, [fetchProducts]);

  const refreshProducts = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts
  };
}
