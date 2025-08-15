'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Download,
  Calendar,
  User,
  Receipt
} from 'lucide-react'
import { useSupabase } from '@/hooks/useSupabase'
import { Order, OrderWithItems, Customer, OrderStatus } from '@/lib/supabase/types'

const ORDER_STATUSES: OrderStatus[] = [
  { value: 'new', label: 'Новий', color: 'bg-blue-500' },
  { value: 'processing', label: 'В обробці', color: 'bg-yellow-500' },
  { value: 'ready', label: 'Готово', color: 'bg-green-500' },
  { value: 'completed', label: 'Завершено', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Скасовано', color: 'bg-red-500' }
]

export default function OrderManagement() {
  const { supabase } = useSupabase()
  
  // Стан компонента
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [customerFilter, setCustomerFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  // Завантаження даних
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Завантаження замовлень з деталями (може не існувати ще)
      let ordersData = []
      try {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products (
                id,
                name,
                price,
                image_url
              )
            ),
            customer:customers (
              id,
              name,
              phone,
              email
            )
          `)
          .order('created_at', { ascending: false })
        
        if (ordersError) {
          console.warn('Таблиця orders ще не створена:', ordersError.message)
        } else {
          ordersData = orders || []
        }
      } catch (ordersError) {
        console.warn('Помилка завантаження замовлень (таблиця може не існувати):', ordersError)
        ordersData = []
      }
      
      // Завантаження клієнтів (може не існувати ще)
      let customersData = []
      try {
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('name')
        
        if (customersError) {
          console.warn('Таблиця customers ще не створена:', customersError.message)
        } else {
          customersData = customers || []
        }
      } catch (customersError) {
        console.warn('Помилка завантаження клієнтів (таблиця може не існувати):', customersError)
        customersData = []
      }
      
      setOrders(ordersData)
      setCustomers(customersData)
    } catch (error) {
      console.error('Помилка завантаження даних:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Фільтрація замовлень
  const filteredOrders = useMemo(() => {
    let filtered = orders
    
    // Фільтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }
    
    // Фільтр по клієнту
    if (customerFilter !== 'all') {
      filtered = filtered.filter(order => order.customer_id === customerFilter)
    }
    
    // Фільтр по даті
    if (dateFilter !== 'all') {
      const today = new Date()
      const orderDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            orderDate.setTime(Date.parse(order.created_at))
            return orderDate.toDateString() === today.toDateString()
          })
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(order => {
            orderDate.setTime(Date.parse(order.created_at))
            return orderDate >= weekAgo
          })
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(order => {
            orderDate.setTime(Date.parse(order.created_at))
            return orderDate >= monthAgo
          })
          break
      }
    }
    
    // Фільтр по пошуку
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.customer?.name.toLowerCase().includes(query) ||
        order.customer?.phone?.includes(query)
      )
    }
    
    return filtered
  }, [orders, statusFilter, customerFilter, dateFilter, searchQuery])

  // Оновлення статусу замовлення
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (error) throw error
      
      // Оновлення локального стану
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))
      
      // Оновлення вибраного замовлення
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
      
    } catch (error) {
      console.error('Помилка оновлення статусу:', error)
      alert('Помилка оновлення статусу замовлення')
    }
  }

  // Видалення замовлення
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це замовлення?')) return
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
      
      if (error) throw error
      
      // Оновлення локального стану
      setOrders(orders.filter(order => order.id !== orderId))
      
      // Закриття деталей якщо це було вибране замовлення
      if (selectedOrder?.id === orderId) {
        setShowOrderDetails(false)
        setSelectedOrder(null)
      }
      
    } catch (error) {
      console.error('Помилка видалення замовлення:', error)
      alert('Помилка видалення замовлення')
    }
  }

  // Експорт замовлень
  const exportOrders = () => {
    const csvContent = [
      ['Номер замовлення', 'Дата', 'Клієнт', 'Статус', 'Сума', 'Товари'].join(','),
      ...filteredOrders.map(order => [
        order.order_number,
        new Date(order.created_at).toLocaleDateString('uk-UA'),
        order.customer?.name || 'Без клієнта',
        ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status,
        order.final_amount.toFixed(2),
        order.order_items.map(item => `${item.product.name} (${item.quantity})`).join('; ')
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `замовлення_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Статистика
  const statistics = useMemo(() => {
    const total = orders.length
    const totalAmount = orders.reduce((sum, order) => sum + order.final_amount, 0)
    const byStatus = ORDER_STATUSES.map(status => ({
      ...status,
      count: orders.filter(order => order.status === status.value).length
    }))
    
    return { total, totalAmount, byStatus }
  }, [orders])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок та статистика */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управління замовленнями</h1>
          <p className="text-gray-600">Перегляд та управління всіма замовленнями</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Оновити
          </Button>
          <Button variant="outline" onClick={exportOrders}>
            <Download className="h-4 w-4 mr-2" />
            Експорт
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Всього замовлень</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">₴</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Загальна сума</p>
                <p className="text-2xl font-bold">{statistics.totalAmount.toFixed(2)} ₴</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Активних клієнтів</p>
                <p className="text-2xl font-bold">
                  {new Set(orders.map(o => o.customer_id).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Сьогодні</p>
                <p className="text-2xl font-bold">
                  {orders.filter(order => {
                    const orderDate = new Date(order.created_at)
                    const today = new Date()
                    return orderDate.toDateString() === today.toDateString()
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фільтри */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Пошук по номеру замовлення, клієнту..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі статуси</SelectItem>
                {ORDER_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Клієнт" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі клієнти</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Період" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Весь час</SelectItem>
                <SelectItem value="today">Сьогодні</SelectItem>
                <SelectItem value="week">Останній тиждень</SelectItem>
                <SelectItem value="month">Останній місяць</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список замовлень */}
      <Card>
        <CardHeader>
          <CardTitle>Замовлення ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Receipt className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Замовлення не знайдено</h3>
                <p className="text-sm mb-4">Таблиці замовлень ще не створені в базі даних</p>
                <p className="text-xs text-gray-400 mb-4">
                  Для створення таблиць замовлень виконайте SQL скрипт pos-schema.sql
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/pos'}
                >
                  Перейти до POS системи
                </Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Замовлення не знайдено</p>
                <p className="text-sm">Спробуйте змінити фільтри або пошуковий запит</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{order.order_number}</h3>
                        <Badge 
                          className={ORDER_STATUSES.find(s => s.value === order.status)?.color || 'bg-gray-500'}
                        >
                          {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString('uk-UA')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>
                          <User className="h-4 w-4 inline mr-1" />
                          {order.customer?.name || 'Без клієнта'}
                        </span>
                        <span>
                          Товарів: {order.order_items.length}
                        </span>
                        <span className="font-semibold text-green-600">
                          {order.final_amount.toFixed(2)} ₴
                        </span>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {order.order_items.slice(0, 3).map(item => 
                          `${item.product.name} (${item.quantity})`
                        ).join(', ')}
                        {order.order_items.length > 3 && '...'}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowOrderDetails(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteOrder(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Модальне вікно з деталями замовлення */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Деталі замовлення {selectedOrder.order_number}</h2>
              <Button variant="ghost" onClick={() => setShowOrderDetails(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Статус</p>
                  <Badge className={ORDER_STATUSES.find(s => s.value === selectedOrder.status)?.color || 'bg-gray-500'}>
                    {ORDER_STATUSES.find(s => s.value === selectedOrder.status)?.label || selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Дата створення</p>
                  <p>{new Date(selectedOrder.created_at).toLocaleString('uk-UA')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Клієнт</p>
                  <p>{selectedOrder.customer?.name || 'Без клієнта'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Загальна сума</p>
                  <p className="font-bold text-green-600">{selectedOrder.final_amount.toFixed(2)} ₴</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Товари</p>
                <div className="space-y-2">
                  {selectedOrder.order_items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {item.product.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.unit_price.toFixed(2)} ₴ × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">{item.total_price.toFixed(2)} ₴</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Примітки</p>
                  <p className="p-2 bg-gray-50 rounded">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
