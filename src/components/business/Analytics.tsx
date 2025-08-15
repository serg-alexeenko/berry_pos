/**
 * @file: Analytics.tsx
 * @description: Компонент для аналітики та звітів ресторану
 * @dependencies: @/hooks/useSupabase, @/components/ui, react
 * @created: 2024-12-19
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBusiness } from '@/hooks/useSupabase'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar, 
  Filter,
  RefreshCw,
  Package,
  Star,
  Eye,
  CreditCard
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase/client'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  averageOrderValue: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    order_number: string
    total_amount: number
    created_at: string
  }>
}

export default function Analytics() {
  const { business } = useBusiness()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    if (business) {
      fetchAnalyticsData()
    }
  }, [business, period])

  const fetchAnalyticsData = async () => {
    if (!business) return

    try {
      setLoading(true)
      setError(null)

      // Отримуємо загальну статистику
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', business.id)

      if (ordersError) throw ordersError

      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', business.id)

      if (customersError) throw customersError

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', business.id)

      if (productsError) throw productsError

      // Розрахунок статистики
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const totalOrders = orders.length
      const totalCustomers = customers.length
      const totalProducts = products.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Топ продуктів (мокові дані)
      const topProducts = [
        { id: '1', name: 'Кава Американо', sales: 45, revenue: 1350 },
        { id: '2', name: 'Піца Маргарита', sales: 32, revenue: 2560 },
        { id: '3', name: 'Салат Цезар', sales: 28, revenue: 1120 },
        { id: '4', name: 'Тірамісу', sales: 25, revenue: 1000 }
      ]

      // Останні замовлення
      const recentOrders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setAnalyticsData({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        averageOrderValue,
        topProducts,
        recentOrders
      })

    } catch (err) {
      console.error('Помилка завантаження аналітики:', err)
      setError('Помилка завантаження даних')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Завантаження аналітики...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Помилка завантаження</h3>
            <p className="text-red-700">{error}</p>
            <Button onClick={fetchAnalyticsData} className="mt-4">
              Спробувати знову
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Дані не знайдено</h3>
            <p className="text-gray-600">Створіть замовлення для початку аналітики</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Аналітика бізнесу</h1>
              <p className="text-gray-600 mt-2">Аналізуйте показники та тенденції вашого бізнесу</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button variant="outline" onClick={fetchAnalyticsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Оновити
              </Button>
            </div>
          </div>

          {/* Period Filter */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium text-gray-700">Період аналізу:</Label>
              <div className="flex space-x-2">
                <Button
                  variant={period === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('day')}
                >
                  День
                </Button>
                <Button
                  variant={period === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('week')}
                >
                  Тиждень
                </Button>
                <Button
                  variant={period === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod('month')}
                >
                  Місяць
                </Button>
              </div>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Загальний дохід</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₴{analyticsData.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всього замовлень</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.totalOrders}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Клієнтів</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.totalCustomers}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Товарів</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.totalProducts}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Середній чек</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₴{analyticsData.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Eye className="h-6 w-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Конверсія</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.totalCustomers > 0 
                      ? Math.round((analyticsData.totalOrders / analyticsData.totalCustomers) * 100)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Топ продуктів</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">Продажів: {product.sales}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₴{product.revenue}</p>
                      <p className="text-sm text-gray-500">
                        ₴{(product.revenue / product.sales).toFixed(2)} за одиницю
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Останні замовлення</h2>
            </div>
            <div className="p-6">
              {analyticsData.recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Замовлень не знайдено</h3>
                  <p className="text-gray-600">Створіть перше замовлення для початку аналітики</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{order.order_number}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('uk-UA')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₴{order.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">ID: {order.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
