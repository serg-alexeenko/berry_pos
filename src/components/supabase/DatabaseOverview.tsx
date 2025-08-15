/**
 * @file: components/supabase/DatabaseOverview.tsx
 * @description: Огляд бази даних
 * @dependencies: React, Supabase, UI компоненти
 * @created: 2024-12-19
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBusiness, useProducts, useCategories, useCustomers, useOrders } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase/client';
import { 
  Database, 
  Package, 
  Users, 
  ShoppingCart, 
  Building,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function DatabaseOverview() {
  const { business, loading: businessLoading } = useBusiness();
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { customers, loading: customersLoading } = useCustomers();
  const { orders, loading: ordersLoading } = useOrders();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    if (products.length > 0) {
      const lowStock = products.filter(p => p.stock_quantity <= p.min_stock_level).length;
      setStats(prev => ({
        ...prev,
        totalProducts: products.length,
        lowStockProducts: lowStock
      }));
    }
  }, [products]);

  useEffect(() => {
    if (categories.length > 0) {
      setStats(prev => ({
        ...prev,
        totalCategories: categories.length
      }));
    }
  }, [categories]);

  useEffect(() => {
    if (customers.length > 0) {
      setStats(prev => ({
        ...prev,
        totalCustomers: customers.length
      }));
    }
  }, [customers]);

  useEffect(() => {
    if (orders.length > 0) {
      setStats(prev => ({
        ...prev,
        totalOrders: orders.length
      }));
    }
  }, [orders]);

  const loading = businessLoading || productsLoading || categoriesLoading || customersLoading || ordersLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Завантаження даних...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Бізнес не знайдено</h3>
        <p className="text-gray-600">Спочатку створіть свій бізнес</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Огляд бази даних</h2>
          <p className="text-gray-600">Статистика та метрики вашого бізнесу</p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">База даних</span>
        </div>
      </div>

      {/* Інформація про бізнес */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Інформація про бізнес</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Назва</p>
              <p className="text-lg text-gray-900">{business.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Тип</p>
              <Badge variant="outline">{business.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-gray-900">{business.email || 'Не вказано'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Телефон</p>
              <p className="text-gray-900">{business.phone || 'Не вказано'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                <p className="text-xs text-gray-600">Товарів</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
                <p className="text-xs text-gray-600">Категорій</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="text-xs text-gray-600">Клієнтів</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-gray-600">Замовлень</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Попередження про низький запас */}
      {stats.lowStockProducts > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Увага: {stats.lowStockProducts} товарів мають низький запас
                </p>
                <p className="text-sm text-yellow-700">
                  Перевірте склад та поповніть запаси
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Останні замовлення */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Останні замовлення</span>
          </CardTitle>
          <CardDescription>
            Останні {Math.min(orders.length, 5)} замовлень
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Поки що немає замовлень</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">#{order.order_number}</p>
                    <p className="text-sm text-gray-600">
                      {order.customers ? 
                        `${order.customers.first_name} ${order.customers.last_name}` : 
                        'Без клієнта'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.total_amount.toFixed(2)} ₴</p>
                    <Badge variant={
                      order.status === 'completed' ? 'default' :
                      order.status === 'pending' ? 'secondary' :
                      'outline'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
