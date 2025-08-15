/**
 * @file: app/dashboard/page.tsx
 * @description: Dashboard з аналітикою бізнесу та графічними показниками
 * @dependencies: React, Supabase, Recharts, shadcn/ui компоненти
 * @created: 2024-12-19
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBusiness } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Settings, Plus, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';
import { uk } from 'date-fns/locale';
import { supabase } from '@/lib/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const { business, loading, error } = useBusiness();
  const router = useRouter();
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Додаємо діагностику
  console.log('Dashboard render:', { user, business, loading, error });

  // Функція для отримання всіх бізнесів користувача
  const fetchAllBusinesses = async () => {
    if (!user) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Помилка отримання всіх бізнесів:', fetchError);
        return;
      }

      if (data && data.length > 0) {
        setAllBusinesses(data);
        // Якщо немає вибраного бізнесу, вибираємо перший
        if (!selectedBusinessId) {
          setSelectedBusinessId(data[0].id);
        }
        console.log('Всі бізнеси користувача:', data);
      }
    } catch (err) {
      console.error('Помилка при отриманні бізнесів:', err);
    }
  };

  useEffect(() => {
    console.log('Dashboard useEffect:', { business, loading });
    if (!loading) {
      if (!business) {
        console.log('Показуємо форму створення бізнесу');
        setShowCreateBusiness(true);
      } else {
        console.log('Бізнес знайдено, показуємо dashboard');
        setShowCreateBusiness(false);
        // Отримуємо всі бізнеси
        fetchAllBusinesses();
      }
    }
  }, [business, loading]);

  // Отримуємо поточний вибраний бізнес
  const currentBusiness = allBusinesses.find(b => b.id === selectedBusinessId) || business;

  // Мокові дані для графіків (замінити на реальні дані з Supabase)
  const getChartData = () => {
    const now = new Date();
    let data = [];
    
    switch (period) {
      case 'day':
        data = Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          sales: Math.floor(Math.random() * 1000) + 100,
          orders: Math.floor(Math.random() * 20) + 5
        }));
        break;
      case 'week':
        data = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(now, 6 - i);
          return {
            date: format(date, 'EEE', { locale: uk }),
            sales: Math.floor(Math.random() * 5000) + 500,
            orders: Math.floor(Math.random() * 100) + 20
          };
        });
        break;
      case 'month':
        data = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(now, 29 - i);
          return {
            date: format(date, 'dd', { locale: uk }),
            sales: Math.floor(Math.random() * 2000) + 200,
            orders: Math.floor(Math.random() * 50) + 10
          };
        });
        break;
    }
    return data;
  };

  // Мокові дані для кругових діаграм
  const categoryData = [
    { name: 'Напої', value: 35, color: '#3B82F6' },
    { name: 'Їжа', value: 45, color: '#10B981' },
    { name: 'Десерти', value: 20, color: '#F59E0B' }
  ];

  if (!user) {
    console.log('Dashboard: користувач не авторизований');
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Будь ласка, увійдіть в систему</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    console.log('Dashboard: завантаження...');
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Завантаження...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Додаємо діагностику помилок
  if (error) {
    console.error('Dashboard: помилка отримання бізнесу:', error);
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-600">Помилка завантаження: {error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Спробувати знову
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Якщо користувач не має бізнесу, показуємо форму створення
  if (showCreateBusiness) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Building className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Ласкаво просимо до Berry POS!
              </h1>
              <p className="text-lg text-gray-600">
                Для початку роботи створіть свій перший бізнес
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Створити бізнес</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Створіть свій бізнес, щоб почати керувати меню, замовленнями та клієнтами.
                </p>
                
                <Button 
                  onClick={() => router.push('/create-business')}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Створити бізнес
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Якщо бізнес є, показуємо dashboard з аналітикою
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Заголовок та селектор періоду */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Панель управління</h1>
                <p className="text-gray-600">
                  Ласкаво просимо до {currentBusiness?.name}! Ось аналітика вашого бізнесу
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Селектор періоду */}
                <Select value={period} onValueChange={(value: 'day' | 'week' | 'month') => setPeriod(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">День</SelectItem>
                    <SelectItem value="week">Тиждень</SelectItem>
                    <SelectItem value="month">Місяць</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Кнопка налаштувань */}
                <Button
                  variant="outline"
                  onClick={() => router.push('/settings')}
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Налаштування</span>
                </Button>
              </div>
            </div>
            
            {/* Селектор бізнесів */}
            {allBusinesses.length > 1 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Оберіть бізнес для аналітики:
                </label>
                <Select value={selectedBusinessId || ''} onValueChange={setSelectedBusinessId}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allBusinesses.map((biz) => (
                      <SelectItem key={biz.id} value={biz.id}>
                        {biz.name} ({biz.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* KPI картки */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Загальний дохід</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₴24,500</div>
                <p className="text-xs text-green-600">+12% з минулого періоду</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Замовлення</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-blue-600">+8% з минулого періоду</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Клієнти</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-purple-600">+15% з минулого періоду</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Середній чек</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₴157</div>
                <p className="text-xs text-orange-600">+5% з минулого періоду</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Графіки */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Графік продажів */}
            <Card>
              <CardHeader>
                <CardTitle>Динаміка продажів</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={period === 'day' ? 'time' : 'date'} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Графік замовлень */}
            <Card>
              <CardHeader>
                <CardTitle>Кількість замовлень</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={period === 'day' ? 'time' : 'date'} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Додаткові графіки */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Кругова діаграма категорій */}
            <Card>
              <CardHeader>
                <CardTitle>Продажі по категоріях</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Швидкі дії */}
            <Card>
              <CardHeader>
                <CardTitle>Швидкі дії</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push('/pos')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Відкрити POS
                  </Button>
                  <Button 
                    onClick={() => router.push('/menu')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Управління меню
                  </Button>
                  <Button 
                    onClick={() => router.push('/orders')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Замовлення
                  </Button>
                  <Button 
                    onClick={() => router.push('/customers')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Клієнти
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
