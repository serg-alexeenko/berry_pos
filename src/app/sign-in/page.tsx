/**
 * @file: sign-in/page.tsx
 * @description: Сторінка входу користувача з Supabase Auth
 * @dependencies: React, Supabase, UI компоненти
 * @created: 2024-12-19
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    try {
      console.log('Спроба входу для:', formData.email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      console.log('Відповідь Supabase:', { data, error: signInError });

      if (signInError) {
        console.error('Помилка Supabase:', signInError);
        throw signInError;
      }

      if (data.user) {
        console.log('Користувач успішно авторизований:', data.user);
        console.log('Сесія:', data.session);
        
        // Примусове перенаправлення на dashboard
        console.log('Спроба перенаправлення на /dashboard...');
        
        // Використовуємо window.location для примусового перенаправлення
        window.location.href = '/dashboard';
        
        // Альтернативний спосіб через router
        // router.push('/dashboard');
        // router.refresh();
      } else {
        console.log('Немає даних користувача');
        setError('Не вдалося отримати дані користувача');
      }
    } catch (error: any) {
      console.error('Помилка входу:', error);
      
      // Детальна обробка помилок
      if (error.message) {
        setError(error.message);
      } else if (error.error_description) {
        setError(error.error_description);
      } else {
        setError('Невідома помилка входу');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Тестова функція для перевірки поточного стану
  const checkCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Поточна сесія:', session);
      console.log('Помилка сесії:', error);
      
      if (session) {
        alert(`Користувач вже авторизований: ${session.user.email}`);
      } else {
        alert('Користувач не авторизований');
      }
    } catch (err) {
      console.error('Помилка перевірки сесії:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Увійти в систему
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Керуйте своїм бізнесом з будь-якого пристрою
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вхід</CardTitle>
            <CardDescription>
              Введіть ваші облікові дані для доступу до системи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Ваш пароль"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Вхід...' : 'Увійти'}
              </Button>
            </form>

            {/* Тестова кнопка для діагностики */}
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={checkCurrentSession}
              >
                Перевірити поточну сесію
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/test-auth'}
              >
                Тест аутентифікації
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Не маєте облікового запису?{' '}
                <a href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
                  Зареєструватися
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
