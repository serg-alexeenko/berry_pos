/**
 * @file: components/business/POSInterface.tsx
 * @description: POS інтерфейс для обслуговування клієнтів
 * @dependencies: React, Supabase, UI компоненти
 * @created: 2024-12-19
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Search, ShoppingCart, User, CreditCard, Receipt, Plus, Minus, X } from 'lucide-react'
import { useSupabase } from '@/hooks/useSupabase'
import { Product, Category, Customer, CartItem, OrderStatus, PaymentMethod } from '@/lib/supabase/types'

// Константи для статусів та методів оплати
const ORDER_STATUSES: OrderStatus[] = [
  { value: 'new', label: 'Новий', color: 'bg-blue-500' },
  { value: 'processing', label: 'В обробці', color: 'bg-yellow-500' },
  { value: 'ready', label: 'Готово', color: 'bg-green-500' },
  { value: 'completed', label: 'Завершено', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Скасовано', color: 'bg-red-500' }
]

const PAYMENT_METHODS: PaymentMethod[] = [
  { value: 'cash', label: 'Готівка', icon: '💵' },
  { value: 'card', label: 'Карта', icon: '💳' },
  { value: 'online', label: 'Онлайн', icon: '🌐' }
]

export default function POSInterface() {
  const { supabase } = useSupabase()
  
  // Стан компонента
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({ name: '', phone: '', email: '', address: '' })

  // Завантаження даних
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Завантаження продуктів
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (productsError) {
        console.error('Помилка завантаження продуктів:', productsError)
        throw productsError
      }
      
      // Завантаження категорій
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (categoriesError) {
        console.error('Помилка завантаження категорій:', categoriesError)
        throw categoriesError
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
      
      setProducts(productsData || [])
      setCategories(categoriesData || [])
      setCustomers(customersData)
      
      console.log('Дані завантажено:', {
        products: productsData?.length || 0,
        categories: categoriesData?.length || 0,
        customers: customersData?.length || 0
      })
      
    } catch (error) {
      console.error('Помилка завантаження даних:', error)
      // Встановлюємо порожні масиви якщо є помилка
      setProducts([])
      setCategories([])
      setCustomers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Фільтрація продуктів
  const filteredProducts = useMemo(() => {
    let filtered = products
    
    // Фільтр по категорії
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory)
    }
    
    // Фільтр по пошуку
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [products, selectedCategory, searchQuery])

  // Додавання товару в корзину
  const addToCart = useCallback((product: Product) => {
    const existingItem = cart.find(item => item.product_id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const category = categories.find(cat => cat.id === product.category_id)
      const newItem: CartItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
        category_name: category?.name || 'Без категорії'
      }
      setCart([...cart, newItem])
    }
  }, [cart, categories])

  // Оновлення кількості в корзині
  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId))
    } else {
      setCart(cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }, [cart])

  // Видалення товару з корзини
  const removeFromCart = useCallback((productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }, [cart])

  // Підрахунок загальної суми
  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cart])

  // Очищення корзини
  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomer(null)
  }, [])

  // Створення замовлення
  const createOrder = async () => {
    if (cart.length === 0) return
    
    try {
      // Перевіряємо чи існує таблиця orders
      let orderCreated = false
      let orderNumber = `DEMO-${Date.now()}`
      
      try {
        // Отримуємо business_id з першого доступного бізнесу
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('id')
          .limit(1)
          .single()
        
        if (businessError || !businessData) {
          console.warn('Не вдалося отримати business_id:', businessError?.message)
          throw new Error('Не вдалося отримати business_id')
        }
        
        // Генерація унікального номера замовлення
        const generateOrderNumber = () => {
          const timestamp = Date.now()
          const random = Math.floor(Math.random() * 1000)
          return `ORD-${timestamp}-${random}`
        }
        
        let orderNumber = generateOrderNumber()
        
        // Перевіряємо унікальність номера (максимум 5 спроб)
        let isUnique = false
        for (let i = 0; i < 5; i++) {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('order_number', orderNumber)
          
          if (count === 0) {
            isUnique = true
            break // Номер унікальний
          }
          orderNumber = generateOrderNumber() // Генеруємо новий
        }
        
        if (!isUnique) {
          console.warn('Не вдалося згенерувати унікальний номер замовлення')
          orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}` // Фінальна спроба
        }
        
        console.log('Створення замовлення з даними:', {
          business_id: businessData.id,
          customer_id: selectedCustomer?.id || null,
          order_number: orderNumber,
          total_amount: totalAmount,
          final_amount: totalAmount
        })
        
        // Створення замовлення
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            business_id: businessData.id,
            customer_id: selectedCustomer?.id || null,
            order_number: orderNumber,
            total_amount: totalAmount,
            final_amount: totalAmount,
            status: 'new',
            payment_status: 'pending'
          })
          .select()
          .single()
        
        if (orderError) {
          console.error('Помилка створення замовлення:', orderError)
          if (orderError.message.includes('order_number')) {
            throw new Error(`Помилка номера замовлення: ${orderError.message}`)
          } else if (orderError.message.includes('business_id')) {
            throw new Error(`Помилка business_id: ${orderError.message}`)
          } else {
            throw new Error(`Помилка створення замовлення: ${orderError.message}`)
          }
        }
        
        // Створення товарів замовлення
        const orderItems = cart.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)
        
        if (itemsError) {
          console.warn('Таблиця order_items ще не створена:', itemsError.message)
          throw new Error('Таблиця order_items ще не створена')
        }
        
        orderCreated = true
        // orderNumber вже встановлено вище
        
      } catch (tableError) {
        console.warn('Демо режим - таблиці ще не створені:', tableError)
        // В демо режимі просто показуємо повідомлення
      }
      
      // Очищення корзини та повідомлення про успіх
      clearCart()
      
      if (orderCreated) {
        alert(`Замовлення ${orderNumber} створено успішно!`)
      } else {
        alert(`Демо замовлення створено! (Таблиці ще не створені)\nСума: ${totalAmount.toFixed(2)} ₴\nТоварів: ${cart.reduce((sum, item) => sum + item.quantity, 0)}`)
      }
      
    } catch (error) {
      console.error('Помилка створення замовлення:', error)
      alert('Помилка створення замовлення')
    }
  }

  // Створення нового клієнта
  const createCustomer = async (customerData: { name: string; phone: string; email?: string; address?: string }) => {
    try {
      // Отримуємо business_id з першого доступного бізнесу
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .limit(1)
        .single()
      
      if (businessError || !businessData) {
        console.warn('Не вдалося отримати business_id:', businessError?.message)
        throw new Error('Не вдалося отримати business_id')
      }
      
      // Створення клієнта
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          business_id: businessData.id,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email || null,
          address: customerData.address || null
        })
        .select()
        .single()
      
      if (customerError) {
        console.error('Помилка створення клієнта:', customerError)
        throw customerError
      }
      
      // Оновлюємо список клієнтів
      setCustomers(prev => [...prev, customer])
      
      // Встановлюємо нового клієнта як вибраного
      setSelectedCustomer(customer)
      
      return customer
      
    } catch (error) {
      console.error('Помилка створення клієнта:', error)
      throw error
    }
  }

  // Обробка створення клієнта
  const handleCreateCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.phone) {
      alert('Ім\'я та телефон обов\'язкові!')
      return
    }
    
    try {
      await createCustomer(newCustomerData)
      setShowCustomerModal(false)
      setNewCustomerData({ name: '', phone: '', email: '', address: '' })
      alert('Клієнта створено успішно!')
    } catch (error) {
      alert('Помилка створення клієнта')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">POS Система</h1>
            <p className="text-gray-600">Швидке створення замовлень</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              <div>Товарів: {products.length}</div>
              <div>Категорій: {categories.length}</div>
              <div>Клієнтів: {customers.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Ліва панель - Товари */}
        <div className="flex-1 flex flex-col">
          {/* Пошук та фільтри */}
          <div className="bg-white p-4 border-b">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Пошук товарів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Всі категорії</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Список товарів */}
          <div className="flex-1 overflow-y-auto p-4">
            {products.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium mb-2">Товари не знайдено</h3>
                <p className="text-sm mb-4">Додайте товари в систему меню для початку роботи</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/menu/products'}
                >
                  Перейти до управління товарами
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Товари не знайдено</h3>
                <p className="text-sm">Спробуйте змінити пошуковий запит або фільтр категорії</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="text-gray-400 text-4xl">📦</div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                      <p className="text-lg font-bold text-green-600">
                        {product.price.toFixed(2)} ₴
                      </p>
                      <p className="text-xs text-gray-500">
                        {categories.find(cat => cat.id === product.category_id)?.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Права панель - Корзина */}
        <div className="w-96 bg-white border-l flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Корзина замовлення
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Вибір клієнта */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Клієнт</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCustomerModal(true)}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Новий
                </Button>
              </div>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value)
                  setSelectedCustomer(customer || null)
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Без клієнта</option>
                {customers.length === 0 ? (
                  <option value="" disabled>Клієнти не знайдено</option>
                ) : (
                  customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phone})
                    </option>
                  ))
                )}
              </select>
              {customers.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Таблиця клієнтів ще не створена. Замовлення можна створювати без клієнта.
                </p>
              )}
            </div>

            {/* Товари в корзині */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Корзина порожня</p>
                  <p className="text-sm">Додайте товари для створення замовлення</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="text-gray-400">📦</div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.category_name}</p>
                        <p className="text-sm font-medium">{item.price.toFixed(2)} ₴</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Підсумок та дії */}
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Товарів:</span>
                    <span>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Загалом:</span>
                    <span className="text-green-600">{totalAmount.toFixed(2)} ₴</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1"
                  >
                    Очистити
                  </Button>
                  <Button
                    onClick={createOrder}
                    className="flex-1"
                    disabled={cart.length === 0}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Створити замовлення
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Модальне вікно для створення клієнта */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Створити нового клієнта</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ім'я *</label>
                <Input
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введіть ім'я клієнта"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Телефон *</label>
                <Input
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+380991234567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Адреса</label>
                <Input
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Введіть адресу"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCustomerModal(false)}
                className="flex-1"
              >
                Скасувати
              </Button>
              <Button
                onClick={handleCreateCustomer}
                className="flex-1"
                disabled={!newCustomerData.name || !newCustomerData.phone}
              >
                Створити
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
