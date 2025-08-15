/**
 * @file: app/menu/page.tsx
 * @description: Головна сторінка управління меню з навігацією до категорій та товарів
 * @dependencies: React, Next.js, shadcn/ui компоненти
 * @created: 2024-12-19
 */

"use client";

import { useAuth } from '@/components/providers/AuthProvider';
import { useBusiness } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FolderOpen, 
  Package, 
  Plus, 
  ArrowRight, 
  Settings,
  BarChart3,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function MenuManagement() {
  const { user } = useAuth();
  const { business, loading } = useBusiness();
  const router = useRouter();

  if (!user) {
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

  if (!business) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <FolderOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Управління меню
              </h1>
              <p className="text-lg text-gray-600">
                Для початку роботи створіть свій перший бізнес
              </p>
            </div>

            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600 mb-6">
                  Створіть свій бізнес, щоб почати керувати меню та товарами.
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управління меню
            </h1>
            <p className="text-gray-600">
              Керуйте категоріями та товарами для {business.name}
            </p>
          </div>

          {/* Основні розділи */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Категорії */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/menu/categories')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                  <span>Категорії</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Створюйте та керуйте категоріями товарів для зручної навігації
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Організуйте товари</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            {/* Товари */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/menu/products')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-6 w-6 text-green-600" />
                  <span>Товари</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Додавайте та редагуйте товари, встановлюйте ціни та опис
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Керуйте асортиментом</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            {/* Аналітика меню */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/menu/analytics')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <span>Аналітика</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Аналізуйте популярність товарів та категорій
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Статистика продажів</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Швидкі дії */}
          <Card>
            <CardHeader>
              <CardTitle>Швидкі дії</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  onClick={() => router.push('/menu/categories/new')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Plus className="h-6 w-6" />
                  <span>Нова категорія</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/menu/products/new')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Plus className="h-6 w-6" />
                  <span>Новий товар</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>Dashboard</span>
                </Button>
                
                <Button 
                  onClick={() => router.push('/settings')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Settings className="h-6 w-6" />
                  <span>Налаштування</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
