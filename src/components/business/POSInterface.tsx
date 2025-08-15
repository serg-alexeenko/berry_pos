/**
 * @file: components/business/POSInterface.tsx
 * @description: POS інтерфейс для обслуговування клієнтів
 * @dependencies: React, Supabase, UI компоненти
 * @created: 2024-12-19
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useSupabase } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ShoppingCart, 
  User, 
  CreditCard, 
  Receipt, 
  Plus, 
  Minus,
  Trash2,
  Search,
  X
} from 'lucide-react'

// Типи для даних
interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock_quantity: number
  category_id?: string
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  loyalty_points: number
}

interface OrderItem {
  product: Product
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  customer_id?: string
  items: OrderItem[]
  created_at: string
  customers?: {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
}

export default function POSInterface() {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  
  // Стан для POS
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<OrderItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Завантаження даних
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Отримуємо бізнес користувача
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (businessError || !businesses) {
        throw new Error('Користувач не має активного бізнесу')
      }

      const businessId = businesses.id

      // Отримуємо продукти
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name')

      if (productsError) {
        throw new Error('Помилка завантаження продуктів')
      }

      // Отримуємо клієнтів
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('first_name')

      if (customersError) {
        throw new Error('Помилка завантаження клієнтів')
      }

      // Отримуємо замовлення
      const { data: ordersData, error: ordersError } = await supabase
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
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (ordersError) {
        throw new Error('Помилка завантаження замовлень')
      }

      setProducts(productsData || [])
      setCustomers(customersData || [])
      setOrders(ordersData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка')
    } finally {
      setLoading(false)
    }
  }

  // Функції для роботи з кошиком
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
          : item
      ))
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price
      }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total_price, 0)
  }

  // Створення замовлення
  const createOrder = async () => {
    if (!user || cart.length === 0) return

    try {
      setLoading(true)

      // Отримуємо бізнес користувача
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (businessError || !businesses) {
        throw new Error('Користувач не має активного бізнесу')
      }

      const businessId = businesses.id

      // Генеруємо номер замовлення
      const orderNumber = `ORD-${Date.now()}`

      // Створюємо замовлення
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: businessId,
          customer_id: selectedCustomer?.id,
          order_number: orderNumber,
          status: 'pending',
          total_amount: getCartTotal(),
          payment_method: 'cash',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (orderError) {
        throw new Error('Помилка створення замовлення')
      }

      // Створюємо елементи замовлення
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        throw new Error('Помилка створення елементів замовлення')
      }

      // Очищаємо кошик
      clearCart()
      
      // Оновлюємо список замовлень
      await loadData()

      alert('Замовлення створено успішно!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка')
    } finally {
      setLoading(false)
    }
  }

  // Фільтрація продуктів
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Завантаження...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Button onClick={loadData}>Спробувати знову</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">POS Система</h1>
            <p className="text-gray-600">Обслуговування клієнтів та створення замовлень</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Користувач</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ліва панель - Продукти */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Пошук продуктів</span>
                </CardTitle>
                <Input
                  placeholder="Введіть назву продукту..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-center">
                        <h3 className="font-medium text-sm mb-2">{product.name}</h3>
                        <p className="text-2xl font-bold text-green-600">
                          {product.price.toFixed(2)} ₴
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          В наявності: {product.stock_quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Права панель - Кошик */}
          <div className="space-y-6">
            {/* Кошик */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Кошик</span>
                  {cart.length > 0 && (
                    <Badge variant="secondary">{cart.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Кошик порожній
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.unit_price.toFixed(2)} ₴ × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Загальна сума:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {getCartTotal().toFixed(2)} ₴
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Клієнт */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Клієнт</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCustomer ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedCustomer.email || selectedCustomer.phone}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge variant="secondary">
                      Бонусні бали: {selectedCustomer.loyalty_points}
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Виберіть клієнта або створіть нового</p>
                    <div className="space-y-2">
                      {customers.slice(0, 5).map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {customer.email || customer.phone}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Дії */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={createOrder}
                    disabled={cart.length === 0 || loading}
                  >
                    <Receipt className="h-5 w-5 mr-2" />
                    Створити замовлення
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Очистити кошик
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Останні замовлення */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Останні замовлення</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">
                        {order.customers ? 
                          `${order.customers.first_name} ${order.customers.last_name}` : 
                          'Без клієнта'
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString('uk-UA')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{order.total_amount.toFixed(2)} ₴</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
